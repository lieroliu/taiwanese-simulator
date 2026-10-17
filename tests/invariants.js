// 人生不能出現的事: rules every life must follow, checked after every month of many simulated lives.
// Each rule reads the character's state (s.married, s.people, s.house ...) and the diary entries of that month.
// The state rules (RULES) are zero-tolerance: one break fails the run, except the two listed in KNOWN.
// The diary-text rules (TEXT_RULES) are regex guesses with some false hits, so each one fails only when it
// clearly goes up: more than E + 4*sqrt(E) + 4 hits, where E is its KNOWN rate scaled to this run (0 if unlisted).
// That margin is wide enough that unrelated changes, which reshuffle the random lives, do not trip it.
// Found a new contradiction? Add a rule here; if the game still breaks it today, add its measured rate to KNOWN.
// When a fix brings a rate down, lower its KNOWN number so the gain is kept.
// Run: node tests/invariants.js [index.html] [lives]
const { chromium } = require(process.env.PW || 'playwright');
const path = require('path');
const file = process.argv[2] || 'index.html', N = +process.argv[3] || 300;

// rule name -> breaks per 100 lives the game still has, measured 2026-10-17 over 2400 lives on main
const KNOWN = {
  '同住的人變了日記卻沒交代': 0.6,
  '選擇題前面沒交代背景': 85,
  '未成年就在上班': 45,
  '父母過世後還出現': 9.8,
  '七十歲以後還有父母': 0.3,
  '已婚還在交往': 0.1,
  '沒孩子卻提到孩子': 11.4,
  '沒結婚卻提到配偶': 9,
  '沒工作卻在上班': 1.5,
  '人在國外卻遇到台灣在地的事': 0.4,
  '免役卻寫到當兵': 0.2,
  '自己做生意卻有主管或尾牙': 0.3,
  '老了還在幫人作保': 0.1,
  '父母過世後見家長還有爸媽': 8.5,
  '未成年自己騎車或開車': 0.8,
  '科技早於年代': 0.2,
};
const limitFor = (rate, lives) => { const E = rate * lives / 100; return E + 4 * Math.sqrt(E) + 4 };

(async () => {
  const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome' }).catch(() => chromium.launch());
  const p = await b.newPage(); const errs = [];
  p.on('pageerror', e => errs.push(e.message));
  await p.goto('file://' + path.resolve(file));
  const r = await p.evaluate(N => {
    const { newLife, step, doChoice, autoChoose } = window.__sim;
    const spouseOf = s => s.people.filter(q => q.role === 'spouse' && q.alive);
    const STAGE = { met: 0, dating: 1, habit: 2, family: 3, ready: 4, cohab: 4 };
    let relN = 0;
    // each rule: [name, check(s, entries, prev) -> true when broken]; prev is a snapshot from the month before
    const RULES = [
      ['已婚卻沒有在世的配偶', s => s.married && spouseOf(s).length !== 1],
      ['同時有兩個配偶', s => spouseOf(s).length > 1],
      ['未滿 16 歲已婚', s => s.married && s.age < 16],
      ['沒結過婚卻離婚或喪偶', s => (s.f.divorced || s.f.widowed) && !s.f.everMar],
      ['已婚還在認識新對象', (s, es, prev) => prev.married && s.married && es.some(e => ['meet', 'confess', 'crush', 'relstep'].includes(e.id))],
      // dating goes in order: 認識(met) → 交往(dating) → 磨合(habit) → 見家長(family) → ready → 結婚; 相親 and the two-people choice start at dating
      ['剛認識就交往', (s, es, prev) => s.rel && s.rel.id0 !== prev.relId && !(s.rel.stage === 'met' || (s.rel.stage === 'dating' && (s.rel.blind || s.rel.pair)))],
      ['交往跳過階段', (s, es, prev) => s.rel && s.rel.id0 === prev.relId && STAGE[s.rel.stage] > STAGE[prev.relStage] + 1],
      ['還沒論及婚嫁就結婚', (s, es, prev) => !prev.married && s.married && !es.some(e => e.id === 'foreignwife') && !['ready', 'cohab'].includes(prev.relStage)],
      ['已婚還有交往對象', s => s.married && s.rel],
      ['交往中又認識別人', (s, es, prev) => prev.relId && es.some(e => ['meet', 'crush', 'foreignwife'].includes(e.id))],
      ['分手了還在交往', s => s.rel && (s.people.find(q => q.id === s.f.ptId) || {}).role !== 'partner'],
      ['孩子比父母老或差不到 14 歲', s => s.people.some(q => q.role === 'kid' && q.by < s.by + 14)],
      ['孩子人數對不上', s => s.people.filter(q => q.role === 'kid').length > s.kids],
      ['死掉的人又活過來', (s, es, prev) => s.people.some(q => q.alive && prev.dead.has(q.id))],
      // history and regional news (e._tl, e._rg) are fixed text: a place name like 清水隧道 can match a person's given name
      ['死掉的人又出現在日記', (s, es, prev) => es.some(e => !e._tl && !e._rg && s.people.some(q => prev.deadLong.has(q.id) && q.given.length > 1 && (e.text || '').includes(q.given)
        && !/(過世|走了|告別|墳|忌日|生前|以前|當年|想起|提起|想到|記得|照片|如果|還在的話|遺)/.test(e.text)))],
      ['沒買房卻有房貸', s => s.house !== 'own' && (s.mortLeft || 0) > 0.5],
      ['買了房卻沒有房價', s => s.house === 'own' && s.houseY != null && !(s.houseVal > 0)],
      ['同住的人變了日記卻沒交代', (s, es, prev) => (s.f.liveWith || null) !== prev.liveWith && !es.length],
      ['選擇題前面沒交代背景', (s, es) => es.some(e => e.choices && (e.text || '').replace(/\s/g, '').length < 8)],
      ['日記有 undefined 或 NaN', (s, es) => es.some(e => /undefined|NaN|\[object/.test((e.text || '') + (e.res || '')))],
      ['年紀跟年份對不上', s => Math.abs((s.y - s.by) - s.age) > 1],
      ['死了還在過日子', (s, es, prev) => prev.selfDead && es.length > 0],
      // 國小同班同學 (engine/classmates.js): same birth year, nothing grown-up too early, nothing after they die, a clean end-screen line
      ['同學跟你不同年出生', s => (s.mates || []).some(m => m.by !== s.by)],
      ['同學太小就結婚或買房', s => (s.mates || []).some(m => (m.marAge !== null && m.marAge < 19) || (m.houseAge !== null && m.houseAge < 20))],
      ['同學過世後還有事', s => (s.mates || []).some(m => { const d = m.log.findIndex(l => l.k === 'die'); return d >= 0 && d < m.log.length - 1 })],
      ['結局的同學段落有 undefined', s => s.dead && s.mates && /undefined|NaN|null/.test(matesSection(s))],
    ];
    // diary-text rules from tests/consistency.js: [name, check(s, entry, text without quotes) -> true when broken]
    const TEXT_RULES = [

      ['未成年就在上班',(s,e,t)=>s.age<15&&/((?<!喜歡)上班(?!上)|下班|同事|加班|年終|薪水|主管|老闆)/.test(t)&&!/(爸|媽|叔|阿姨|大人|鄰居|哥|姊|姐)/.test(t)],
      ['父母過世後還出現',(s,e,t)=>s.f.parentdie&&e.id!=='parentdie'&&/(媽媽|爸爸|爸媽)/.test(t)&&!/(過世|走了|告別|墳|遺|生前|以前)/.test(t)],
      ['七十歲以後還有父母',(s,e,t)=>s.age>=70&&/(媽媽|爸爸|爸媽)/.test(t)&&!/(過世|走了|告別|墳|遺|生前|以前|小時候|當年)/.test(t)],
      ['五十五歲以後祖父母還在',(s,e,t)=>s.age>=55&&/(阿公|阿嬤|爺爺|奶奶|阿婆|vuvu)/.test(t)&&!/(過世|小時候|以前|當年|孫)/.test(t)],
      ['已婚還在交往',(s,e,t)=>s.married&&e.id!=='marry'&&(['meet','relstep','crush'].includes(e.id)||['crush'].includes(e._re)||/(交往|約會|相親|告白|情書|在一起嗎)/.test(t))],
      ['沒孩子卻提到孩子',(s,e,t)=>s.kids===0&&/(孩子們|我的孩子|兒子|女兒|孫子|孫女|帶孩子|陪孩子|家裡的孩子)/.test(t)&&!/(生了|出生|懷孕)/.test(t)],
      // 另一半 is fine for an unmarried partner (same-sex couples before 2019) and for someone else's (跟另一半的合照)
      ['沒結婚卻提到配偶',(s,e,t)=>!s.married&&!/(離婚|過世|分居)/.test(t)&&(/(老婆|老公|丈夫|妻子|我們的婚姻|岳父|岳母|公公|婆婆)/.test(t)||(!s.rel&&!s.f.ptId&&/(?<!跟|的)另一半/.test(t)))],
      ['三十歲以後還在上學',(s,e,t)=>s.age>=30&&!s.studying&&/(放學|上課|考試|作業(?!員)|班上|同學們)/.test(t)&&!/(同學會|老同學|以前|小時候|孩子|兒子|女兒|補習班教書|老師說我)/.test(t)],
      ['沒工作卻在上班',(s,e,t)=>s.age>=15&&(!s.job||['退休','家管','失業'].includes(s.job)||s.studying)&&/((?<!喜歡)上班(?!上)|下班|同事|加班|主管說|公司開始)/.test(t)&&!/(爸|媽|叔|阿姨|孩子|兒子|女兒|老公|老婆|另一半|以前|退休|找工作)/.test(t)],
      ['人在國外卻遇到台灣在地的事',(s,e,t)=>s._ab0&&!e.death&&/(早餐店|夜市|騎樓|捷運|颱風假|颱風|菜市場|廟口|柑仔店|機車|統一發票|放鞭炮|淹水|健保卡|凱道|投票所|號子)/.test(t)&&!/(想念|傳到這裡|台灣的朋友|回台灣|過年回家|新聞說|電視|臉書|翻牆|網路)/.test(t)],
      ['有對象還在告白或認識新對象',(s,e,t)=>(s.married||(s.rel&&!['meet','confess'].includes(e.id)&&e._pre!==undefined&&e._pre))&&/(告白|情書|暗戀|曖昧|聯誼|喜歡上|搭訕|交友軟體|在一起嗎|第一次牽手)/.test(t)&&!/(以前|當年|孩子|兒子|女兒|同學在|朋友說|喜歡上別人|同事|婚戒)/.test(t)],
      ['人物工作前後不一',(s,e,t)=>s.people.some(p=>p.role!=='kid'&&t.includes(nm(p)+'')&&new RegExp('(新來的|前輩)'+nm(p)).test(t)&&p.job!==s.job)],
      ['免役卻寫到當兵',(s,e,t)=>s.f.exempt&&/(新訓|班長|我在當兵|入伍)/.test(t)&&e.id!=='service'],
      ['自己做生意卻有主管或尾牙',(s,e,t)=>['自營','農'].includes(s.job)&&/(主管|尾牙|公司聚餐|公司開始)/.test(t)&&!/(以前|當年|孩子|兒子|女兒|朋友|另一半|老公|老婆)/.test(t)],
      ['老了還在幫人作保',(s,e,t)=>s.age>65&&/作保/.test(t)],
      ['沒兒子卻說家裡的男孩',(s,e,t)=>s.age>=30&&/家裡的男孩/.test(t)&&!s.people.some(p=>p.role==='kid'&&p.sex==='M')],
      ['父母過世後見家長還有爸媽',(s,e,t)=>s.f.parentdie&&/(我爸|你爸|我媽|你媽)/.test(t)],
      ['未成年自己騎車或開車',(s,e,t)=>s.age<18&&/(我|你)(自己)?(騎機車|騎車|騎著機車|騎摩托車|開車|有了自己的機車)/.test(t)&&(s.age<16||!/(駕照)/.test(t))],
      ['未成年抽菸喝酒',(s,e,t)=>s.age<18&&/((約|拉)?我|你)(也)?(去)?(抽菸|點了一根菸|喝一杯|喝酒|喝了酒|喝到假酒|喝了幾瓶|灌酒|嚼檳榔|喝醉)/.test(t)&&!/(教官|偷抽|偷喝|不准|大人|爸|媽)/.test(t)],
      ['科技早於年代',(s,e,t)=>!e._pop&&((s.y<1993&&/手機/.test(t))||(s.y<2009&&/(智慧型手機|LINE|App(?![a-z])|臉書|IG|抖音|YouTube|家族群組)/.test(t))||(s.y<1995&&/(上網|網路|e-mail|Email)/.test(t))||(s.y<1998&&/MSN/.test(t))||(s.y<1988&&/(BB.?Call|呼叫器)/.test(t))||(s.y<1988&&/大哥大(?!姐)/.test(t)))],
      ['科技過時',(s,e,t)=>!e._pop&&((s.y>2005&&/(BB.?Call|呼叫器|大哥大(?!姐))/.test(t))||(s.y>2016&&/(MSN|無名小站|即時通)/.test(t)))&&!/(以前|當年|小時候|那時候|那年|還記得|收起來|抽屜|老照片)/.test(t)],
      ['年輕人不會用手機',(s,e,t)=>s.by>=1976&&s.y>=2005&&/(我|你)(還)?(沒有手機|不會用手機|不會用電腦|不會打字|沒有 ?LINE|不會用 ?LINE|不會上網|學會用 ?LINE|習慣按鍵的手機|才學會打字|手機拿得太近)/.test(t)],
      ['只剩半句',(s,e,t)=>/^(對方|他|她)回得/.test(t)],
      ['性別不合',(s,e,t)=>s.sex==='M'?/(我(發現自己)?懷孕|坐月子的那一個月|我當阿嬤|我的月經)/.test(t):/((?<!自己|我)懷孕了|我(入伍|在當兵|當兵的時候|退伍)|我當阿公)/.test(t)],
      ['結了兩次婚沒離',(s,e,t)=>e.id==='marry'&&s._mc>1&&!s.f.divorced&&!s.f.widowed]];
    const strip = t => t.replace(/「[^」]*」/g, '');
    const cnt = {}, ex = {};
    const hit = (k, s, es) => { cnt[k] = (cnt[k] || 0) + 1; (ex[k] = ex[k] || []); if (ex[k].length < 3) ex[k].push(`${s.by} 年生 ${s.age} 歲 ${s.y}：` + es.map(e => (e.id ? `[${e.id}] ` : '') + (e.text || '').slice(0, 60)).join(' / ')) };
    // how often each rule's situation came up at all, so a rule that never gets exercised is visible
    const seen = { 交往: 0, 已婚月數: 0, 過世的身邊人: 0, 自己買房: 0, 同住變動: 0, 離婚或喪偶: 0, 有孩子: 0, 選擇題: 0 };
    let lives = 0, months = 0;
    for (let i = 0; i < N; i++) {
      const s = newLife(1961 + (i % 50)); lives++; let g = 0; s._mc = 0;
      const deadSince = {};
      while (!s.dead && g < 1500) {
        g++;
        if (s.rel && !s.rel.id0) s.rel.id0 = ++relN;
        const prev = { married: s.married, liveWith: s.f.liveWith || null, selfDead: s.dead, relId: s.rel ? s.rel.id0 : 0, relStage: s.rel ? s.rel.stage : null,
          dead: new Set(s.people.filter(q => !q.alive).map(q => q.id)),
          deadLong: new Set(s.people.filter(q => !q.alive && deadSince[q.id] != null && s.t - deadSince[q.id] > 12).map(q => q.id)) };
        const pre = !!s.rel || s.married;
        const out = step(s); months++; s._ab0 = abroad(s); const tagRel = () => { if (s.rel && !s.rel.id0) s.rel.id0 = ++relN };
        tagRel();
        for (const e of out) {
          e._pre = pre;
          if (e.choices) { const wasMar = s.married; const res = doChoice(s, e, autoChoose(s, e)); e.res = res && res.text; if (e.id === 'marry' && !wasMar && s.married) s._mc++; tagRel() }
          const t = strip((e.text || '') + (e.res || ''));
          for (const [k, f] of TEXT_RULES) { let bad = false; try { bad = f(s, e, t) } catch (err) { } if (bad) hit(k, s, [e]) }
        }
        for (const q of s.people) if (!q.alive && deadSince[q.id] == null) { deadSince[q.id] = s.t; seen.過世的身邊人++ }
        if (s.married) seen.已婚月數++;
        if (s.rel && s.rel.id0 !== prev.relId) seen.交往++;
        if ((s.f.liveWith || null) !== prev.liveWith) seen.同住變動++;
        seen.選擇題 += out.filter(e => e.choices).length;
        for (const [k, f] of RULES) { let bad = false; try { bad = f(s, out, prev) } catch (err) { bad = false; cnt['規則本身出錯：' + k] = (cnt['規則本身出錯：' + k] || 0) + 1 } if (bad) hit(k, s, out) }
      }
      if (s.house === 'own') seen.自己買房++;
      if (s.f.divorced || s.f.widowed) seen.離婚或喪偶++;
      if (s.kids) seen.有孩子++;
    }
    return { lives, months, seen, rules: RULES.concat(TEXT_RULES).map(r => r[0]), textRules: TEXT_RULES.map(r => r[0]), cnt, ex };
  }, N);
  await b.close();
  let fail = errs.length > 0;
  console.log(`${r.lives} 生、${r.months} 個月；` + Object.entries(r.seen).map(([k, v]) => k + ' ' + v).join('、'));
  for (const k of [...r.rules, ...Object.keys(r.cnt).filter(k => !r.rules.includes(k))]) {
    const n = r.cnt[k] || 0, per100 = n / r.lives * 100;
    const tolerant = r.textRules.includes(k) || k in KNOWN, limit = tolerant ? limitFor(KNOWN[k] || 0, r.lives) : 0;
    const bad = n > limit;
    if (bad) fail = true;
    console.log(`${bad ? 'FAIL' : n ? 'known' : 'ok  '}  ${k}：${n} 次（每百生 ${per100.toFixed(1)}，上限 ${Math.floor(limit)} 次）`);
    if (n) for (const x of r.ex[k] || []) console.log('        ' + x);
  }
  for (const k in KNOWN) if (!r.rules.includes(k)) { console.log(`FAIL  KNOWN 裡的「${k}」不是任何規則的名字`); fail = true }
  if (errs.length) console.log('ERR', errs[0]);
  console.log(fail ? 'FAIL' : 'OK');
  process.exit(fail ? 1 : 0);
})();
