// Finds diary lines that contradict earlier facts about the character or the people around them
// (how they met vs. that person's job, school lines after leaving school, workplace lines that do
// not fit the character's job, placeholder text, repeats). Report only; does not fail the build.
// Run: node tests/people_consistency.js [index.html] [lives]
const { chromium } = require(process.env.PW || 'playwright');
const file = process.argv[2] || 'index.html', N = +process.argv[3] || 400;
(async () => {
  const b = await chromium.launch(); const p = await b.newPage(); p.on('pageerror', e => console.log('ERR', e.message));
  await p.goto('file://' + process.cwd() + '/' + file);
  const r = await p.evaluate((N) => {
    const strip = t => t.replace(/「[^」]*」/g, '');
    const OFFICE = ['公司', '科技', '服務', '醫護'];
    const R = [
      ['認識地點和對方工作不合', (s, e, t) => e.id === 'meet' && s._meetPt && ((/(在公司認識|公司新來的同事|隔壁部門|坐在我斜對面|公司的同事)/.test(t) && !OFFICE.concat(['台幹', '公教']).includes(s._meetPt.job)) || (/(在工廠認識|工廠隔壁線|那一條線的對面|工廠宿舍)/.test(t) && s._meetPt.job !== '工廠') || (/社團|系上|大學聯誼/.test(t) && s._meetPt.job))],
      ['認識地點和自己工作不合', (s, e, t) => e.id === 'meet' && ((/(在公司認識|公司新來的同事)/.test(t) && !OFFICE.concat(['台幹']).includes(s.job)) || (/(在工廠認識|工廠隔壁線)/.test(t) && s.job !== '工廠'))],
      ['括號替代詞外露', (s, e, t) => /（或/.test(t)],
      ['第三個孩子寫成第二個', (s, e, t) => s.kids >= 3 && /第二個孩子.{0,6}出生/.test(t)],
      ['沒在讀書卻在上課', (s, e, t) => s.age >= 16 && !s.studying && /(夾在課本|上課的時候|學校發起|同學們把|跟同學去|同學在看)/.test(t) && !/(孩子|兒子|女兒|以前|小時候)/.test(t)],
      ['還在讀書卻在上班', (s, e, t) => s.studying && !s.job && /(該上的班|房租一樣要繳|外省同事|下班後同事|上班的路)/.test(t)],
      ['工作不是公司卻有公司老闆主管', (s, e, t) => ['公教', '自營', '農', '退休', '家管'].includes(s.job) && /(老闆的姪子|公司聚餐|公司裡的前輩|公司開始用|公司請我退休|公司的員工旅遊|我們公司)/.test(t)],
      ['未滿十八跟同事喝酒', (s, e, t) => s.age < 18 && /(喝一杯|喝酒)/.test(t) && /同事/.test(t)],
      ['交往中就登記或提親', (s, e, t) => e.id === 'relstep' && /(登記|提親|求婚)/.test(t)],
      ['退休後還在問工作', (s, e, t) => s.job === '退休' && /(問了工作|上班的路|公司開始)/.test(t)],
      ['住在城市卻寫鄉下', (s, e, t) => /^(台北市|高雄市|台中市|台南市|新竹市|嘉義市|基隆市|台北縣)$/.test(s.place) && /(鎮上沒有|鎮上的診所|田裡的水圳|田裡的事照做)/.test(t)],
      ['同一句連續出現', (s, e, t) => s._prev === t],
      ['第一次出場就借錢或作保', (s, e, t) => (e._re === 'lend' || e._re === 'guarantee') && s.age >= 18 && (() => { const m = t.match(/^(?:我幫)?(.{1,4}?)(跟我借|作保)/); const n = m && m[1]; return n && n !== '好朋友' && n !== '朋友' && !s._log.some(x => x.includes(n)) })()],
      ['另一半結婚後就沒出現', null],
    ];
    const cnt = {}, ex = {}; let lives = 0, entries = 0, silentSp = 0, married = 0;
    const hit = (k, s, e, t) => { cnt[k] = (cnt[k] || 0) + 1; ex[k] = ex[k] || []; if (ex[k].length < 4) ex[k].push(`${s.by}${s.sex} ${s.age}歲 job=${s.job} ${e.id || e._re || ''} ${t.slice(0, 80)}`) };
    for (let i = 0; i < N; i++) {
      const s = newLife(1961 + (i % 45)); lives++; s._log = []; let g = 0, spMarT = null, spSeen = 0, spN = null;
      while (!s.dead && g < 1500) { g++; const out = step(s);
        for (const e of out) { let t = e.text || '';
          if (e.id === 'meet') s._meetPt = partnerOf(s);
          if (e.choices) { const c = autoChoose(s, e); const pre = s.married; const res = doChoice(s, e, c); t = t + res.text; if (!pre && s.married) { const sp = spouse(s); spN = sp && nm(sp); spMarT = s.t } }
          entries++; const st = strip(t);
          for (const [k, f] of R) { if (!f) continue; try { if (f(s, e, st)) hit(k, s, e, st) } catch (err) { } }
          if (spN && s.married && s.t - spMarT > 24 && st.includes(spN)) spSeen++;
          s._prev = st; s._log.push(st) } }
      if (spN) { married++; if (!spSeen) silentSp++ }
    }
    cnt['另一半結婚後就沒出現'] = silentSp; ex['另一半結婚後就沒出現'] = [`${silentSp}/${married} 段婚姻，結婚兩年後日記再也沒提到另一半的名字`];
    const per = {}; for (const k in cnt) per[k] = (cnt[k] / lives).toFixed(3);
    return { lives, entries, perLife: per, ex };
  }, N);
  console.log(JSON.stringify(r, null, 1)); await b.close();
})();
