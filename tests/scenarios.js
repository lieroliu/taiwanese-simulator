// Edge-case lives: forces unusual backgrounds (earliest/latest year, 原住民, 離島, single parent, raised by
// grandparents, poor farm vs. 公教, 新住民子女) and plays them with the personality auto-pick and with random
// picks, then looks for state and text contradictions the player would see. Report only; does not fail the build.
// Run: node tests/scenarios.js [index.html] [lives per scenario] [out.json]
const { chromium } = require(process.env.PW || 'playwright');
const file = process.argv[2] || 'index.html', N = +process.argv[3] || 60, OUT = process.argv[4];
(async () => {
  const b = await chromium.launch(); const p = await b.newPage(); const errs = [];
  p.on('pageerror', e => errs.push(e.message));
  await p.goto('file://' + process.cwd() + '/' + file);
  const r = await p.evaluate((N) => {
    const strip = t => (t || '').replace(/「[^」]*」/g, '');
    const SC = [
      ['五年級頭 1961', { by: 1961 }],
      ['九年級尾 2010', { by: 2010 }],
      ['原住民 花蓮 1965', { by: 1965, county: '花蓮縣', eth: '原住民' }],
      ['原住民 台東 1995', { by: 1995, county: '台東縣', eth: '原住民' }],
      ['金門 1962', { by: 1962, county: '金門縣' }],
      ['金門 1978', { by: 1978, county: '金門縣' }],
      ['馬祖 1965', { by: 1965, county: '連江縣' }],
      ['澎湖 1985', { by: 1985, county: '澎湖縣' }],
      ['單親 1990', { by: 1990, fam: '單親' }],
      ['隔代教養 1980', { by: 1980, fam: '隔代教養' }],
      ['務農低收入 雲林 1968', { by: 1968, county: '雲林縣', pjob: '農', inc: '低' }],
      ['公教高收入 台北 1968', { by: 1968, county: '台北市', pjob: '公教', inc: '高' }],
      ['外省公教 1963', { by: 1963, eth: '外省', pjob: '公教' }],
      ['新住民子女 2005', { by: 2005, eth: '新住民子女' }],
      ['受難者家屬 1964', { by: 1964, fam: '受難者家屬' }],
      ['女 1975 隨機選', { by: 1975, sex: 'F', rnd: 1 }],
      ['男 1999 隨機選', { by: 1999, sex: 'M', rnd: 1 }],
    ];
    const hasPar = s => typeof parAlive === 'function' ? parAlive(s) : !s.f.parentdie;
    // [name, (s, e, visibleText, ctx) => bool]
    const R = [
      ['死後還有日記', (s, e, t, c) => c.deadBefore],
      ['出生前的事件', (s, e, t) => e.t < s.t0],
      ['未滿 16 結婚', (s, e, t, c) => c.marriedNow && s.age < 16],
      ['男生未滿 18 結婚', (s, e, t, c) => c.marriedNow && s.sex === 'M' && s.age < 18],
      ['未滿 15 有工作', (s, e, t) => s.age < 15 && s.job && s.job !== '家管'],
      ['未滿 20 買房', (s, e, t, c) => c.boughtNow && s.age < 20],
      ['未滿 45 退休', (s, e, t) => s.job === '退休' && s.age < 45],
      ['女生懷孕生子超過 50 歲', (s, e, t, c) => c.kidNow && s.sex === 'F' && s.age > 50],
      ['未滿 16 生孩子', (s, e, t, c) => c.kidNow && s.age < 16],
      ['女生當兵', (s, e, t) => s.sex === 'F' && (s.f.served || /(我(入伍|在當兵|當兵的時候|退伍)|新訓中心的我)/.test(t))],
      ['男生懷孕', (s, e, t) => s.sex === 'M' && /(我(發現自己)?懷孕|我坐月子|我的月經|我當阿嬤|我當媽媽)/.test(t)],
      ['女生寫成男生', (s, e, t) => s.sex === 'F' && /(我當阿公|我當爸爸|我當兵|我的老婆|我老婆)/.test(t)],
      ['男生寫成女生', (s, e, t) => s.sex === 'M' && /(我當阿嬤|我當媽媽|我的老公|我老公|嫁給|我嫁)/.test(t)],
      ['離婚旗標卻沒結過婚', (s, e, t) => (s.f.divorced || s.f.widowed) && !s.f.everMar && !s._everMar],
      ['離婚後 spouse() 還在', (s, e, t) => !s.married && s.f.divorced && !s.f.widowed && spouse(s) && spouse(s).role === 'spouse'],
      ['同時兩個配偶', (s, e, t) => s.people.filter(p => p.role === 'spouse' && p.alive).length > 1],
      ['已婚又結婚', (s, e, t, c) => e.id === 'marry' && c.wasMarried],
      ['已婚還在交往或告白', (s, e, t, c) => c.wasMarried && !s.aff && /(告白|情書|暗戀|第一次約會|交往了|相親)/.test(t) && !/(以前|當年|孩子|兒子|女兒|同學|朋友|同事)/.test(t)],
      ['自己外遇早於 2020-06', (s, e, t, c) => c.selfAffNow && s.t < 2020 * 12 + 5],
      ['沒結婚卻說另一半', (s, e, t, c) => !s.married && !c.wasMarried && /(我老公|我老婆|我先生|我太太|我的另一半|岳父|岳母|公公|婆婆)/.test(t) && !/(前夫|前妻|離婚|過世|以前)/.test(t)],
      ['離婚後還說老公老婆', (s, e, t, c) => s.f.divorced && !s.married && !c.wasMarried && /(我老公|我老婆|我先生|我太太)/.test(t)],
      ['父母都過世後還寫爸媽在', (s, e, t) => !hasPar(s) && /(爸媽(打電話|說|叫我|來|問)|媽媽(打電話|說|叫我|問)|爸爸(打電話|說|叫我|問))/.test(t) && !/(以前|當年|小時候|生前|過世|走了|孩子|兒子|女兒)/.test(t)],
      ['父母過世後被騙的還是爸媽', (s, e, t) => !hasPar(s) && /(爸媽|媽媽|爸爸).{0,8}(被騙|詐騙|匯款|假檢察官|猜猜我是誰)/.test(t)],
      ['單親卻寫爸媽一起', (s, e, t) => s.fam === '單親' && s.age < 15 && /(爸媽一起|爸爸跟媽媽一起|爸媽吵架|爸媽帶我)/.test(t)],
      ['隔代教養童年卻爸媽在身邊', (s, e, t) => s.fam === '隔代教養' && s.age < 12 && /(媽媽(煮|幫我|牽著我|帶我|叫我起床)|爸爸(載我|帶我|下班回家))/.test(t)],
      ['非原住民寫部落族人', (s, e, t) => s.eth !== '原住民' && /(我們部落|部落的族人|我的族名|vuvu 說|我們族)/.test(t)],
      ['非客家寫客家話是母語', (s, e, t) => s.eth !== '客家' && /(我們客家|我講客家話|阿婆用客家話)/.test(t)],
      ['非外省寫眷村是家', (s, e, t) => s.eth !== '外省' && !s.juancun && /(我們眷村|眷村的家|爸爸的老家在大陸|回大陸探親的爸爸)/.test(t)],
      ['公教家庭寫爸爸下田', (s, e, t) => s.age < 18 && s.pjob === '公教' && /(爸爸|爸媽)(下田|在田裡|割稻|做工|在工廠)/.test(t)],
      ['務農家庭寫爸爸上班', (s, e, t) => s.age < 18 && s.pjob === '農' && /(爸爸|爸媽)(在公司|下班|上班|是公務員)/.test(t)],
      ['離島寫台灣本島地景', (s, e, t) => ['金門縣', '連江縣', '澎湖縣'].includes(s.place) && s.age < 18 && /(捷運|高鐵|騎樓下|鎮上的電影院|颱風淹水淹到二樓|土石流)/.test(t)],
      ['金門馬祖戰地時期寫一般本島生活', (s, e, t) => ['金門縣', '連江縣'].includes(s.place) && s.y < 1992 && /(夜市|颱風假|西門町|阿里山|國道)/.test(t) && !/(台灣|本島|去台北)/.test(t)],
      ['手機早於 1993', (s, e, t) => !e._pop && s.y < 1993 && /手機/.test(t)],
      ['智慧型手機早於 2009', (s, e, t) => !e._pop && s.y < 2009 && /(智慧型手機|LINE|臉書|IG|抖音|YouTube|家族群組|App(?![a-z]))/.test(t)],
      ['網路早於 1995', (s, e, t) => !e._pop && s.y < 1995 && /(上網|網路|e-?mail|Email)/.test(t)],
      ['過時科技', (s, e, t) => !e._pop && ((s.y > 2005 && /(BB.?Call|呼叫器|大哥大(?!姐))/.test(t)) || (s.y > 2016 && /(MSN|無名小站|即時通)/.test(t))) && !/(以前|當年|小時候|那時候|還記得|抽屜|老照片)/.test(t)],
      ['未來年份提到具體新科技', (s, e, t) => s.y > 2026 && /(元宇宙|5G|AI 寫報告|ChatGPT)/.test(t) && !/(以前|當年)/.test(t)],
      ['年份寫錯（文字年份大於當下）', (s, e, t) => { const m = t.match(/(19[6-9]\d|20[0-9]\d) 年/g); return m && m.some(x => +x.slice(0, 4) > s.y) }],
      ['未滿 16 騎車開車', (s, e, t) => s.age < 16 && /我(自己)?(騎機車|騎車去|騎著機車|騎摩托車|開車)/.test(t) && !/(腳踏車|單車|爸爸|媽媽|後座)/.test(t)],
      ['未滿 18 抽菸喝酒沒提偷偷', (s, e, t) => s.age < 18 && /我(也)?(抽菸|點了一根菸|喝酒|喝了酒|喝醉|嚼檳榔)/.test(t) && !/(偷|教官|不准|大人|被抓)/.test(t)],
      ['自營或務農卻有主管公司', (s, e, t) => ['自營', '農'].includes(s.job) && /(主管|公司聚餐|我們公司|公司開始|尾牙)/.test(t) && !/(以前|孩子|兒子|女兒|朋友|另一半|老公|老婆)/.test(t)],
      ['公教寫公司', (s, e, t) => s.job === '公教' && /(我們公司|公司請我退休|公司聚餐|老闆)/.test(t) && !/(以前|孩子|朋友|另一半)/.test(t)],
      ['退休後問工作', (s, e, t) => s.job === '退休' && /(問了工作|上班的路|公司開始|主管說)/.test(t)],
      ['作保的人沒出場過', (s, e, t, c) => (e._re === 'lend' || e._re === 'guarantee') && (() => { const m = t.match(/^(?:我幫)?(.{1,4}?)(跟我借|作保)/); const n = m && m[1]; return n && !/朋友/.test(n) && !c.log.some(x => x.includes(n)) })()],
      ['括號替代詞外露', (s, e, t) => /（或|\{|\}|undefined|NaN|null/.test(t)],
      ['第二個孩子編號錯', (s, e, t) => /第二個孩子.{0,6}出生/.test(t) && s.kids !== 2],
      ['孩子年紀不合（孩子結婚但孩子太小）', (s, e, t) => { const k = s.people.filter(p => p.role === 'kid'); return k.some(p => t.includes(nm(p) + '結婚') && s.y - p.by < 18) }],
      ['單親卻寫爸爸在身邊', (s, e, t) => s.fam === '單親' && /(爸爸|我爸|爸媽|父母)/.test(t) && !/(分開|離開|離婚|不在|沒有爸爸|爸爸那邊|外公|外婆)/.test(t) && !/(朋友|同學|鄰居|表|堂|他的|她的|的爸|的媽|他爸|她爸|他媽|她媽)/.test(t)],
      ['當兵期間寫在家或上學', (s, e, t) => s.inServiceUntil > s.t && e.id !== 'service' && /(放學|同學們|爸爸走過來|回家吃飯|宿舍熄燈)/.test(t)],
      ['退伍後又寫新訓', (s, e, t) => s.f.served && !(s.inServiceUntil > s.t) && /(新訓的時候|新訓中心的班長|我在當兵)/.test(t) && !/(以前|當年|那時候)/.test(t)],
      ['孩子成年後還被叫去學校', (s, e, t) => { const k = s.people.filter(p => p.role === 'kid'); return k.some(p => t.includes(nm(p)) && s.y - p.by > 18 && /(學校|獎狀|考試|老師|打架|功課)/.test(t)) }],
      ['跨年寫在不是年底', (s, e, t) => /跨年/.test(t) && ![12, 1].includes(s.m) && !/(以前|那年)/.test(t)],
      ['年夜飯或過年寫在不是一二月', (s, e, t) => /(年夜飯|大年初一|過年收到的紅包|初二跟媽媽回)/.test(t) && ![1, 2, 3].includes(s.m) && !/(以前|那年|小時候)/.test(t)],
      ['中秋烤肉寫在不是秋天', (s, e, t) => /中秋/.test(t) && ![8, 9, 10].includes(s.m)],
      ['開學寫在不是秋天', (s, e, t) => /(我上小學了|我上國中了|國中分了班)/.test(t) && ![8, 9, 10].includes(s.m)],
      ['公教超過 65 歲還在工作', (s, e, t) => s.job === '公教' && s.age > 65],
      ['年輕公教說退休金被砍', (s, e, t) => /我的退休金被砍/.test(t) && s.age < 45],
      ['結婚同時先登記又辦婚禮', (s, e, t) => e.id === 'marry' && /婚禮以後再說/.test(t) && /辦了.{0,6}婚禮/.test(t)],
      ['裁切後剩半句', (s, e, t, c) => c.cut],
      ['兩個以上配偶的父母同時出錢', (s, e, t) => /爸媽說可以幫忙出.*爸媽說，頭期款他們可以出一半/.test(t)||(!s.married&&/爸媽說，頭期款他們可以出一半|爸媽聽說了，也說要補/.test(t))],
      ['父母都過世還要先回他家過年', (s, e, t) => /過年一定要先回(他|她)家/.test(t) && s.age > 60],
      ['假孫子詐騙但沒孫子', (s, e, t) => /假裝是我的孫子/.test(t) && !s.people.some(p => p.role === 'kid' && p.married)],
      ['弟弟哥哥前後不一', (s, e, t, c) => { if (/我有了弟弟|我有了妹妹/.test(t)) c.younger = 1; if (/(我跟哥哥|我跟姊姊|我哥|我姊)/.test(t)) c.older = 1; return c.younger && c.older && /(我有了弟弟|我有了妹妹|我跟哥哥|我跟姊姊)/.test(t) && !c.sibFlag && (c.sibFlag = 1) }],
      ['同一句同一生出現兩次', (s, e, t, c) => t.length > 14 && !e.choices && c.seen.has(t)],
    ];
    const pickOut = (sc, i) => { const F = sc[1]; let s, g = 0;
      do { s = newLife(F.by, { county: F.county, eth: F.eth, sex: F.sex, pjob: F.pjob, inc: F.inc }); g++ } while (F.fam && s.fam !== F.fam && g < 5000);
      if (F.fam && s.fam !== F.fam) return null; return s };
    const res = {}, samples = {}, choiceSeen = {}, CUTS = {};
    const go0 = guardOut;
    // remember each entry's text before the sentence guard runs, to catch entries it cut down to a fragment
    guardOut = function (s, out) { for (const e of out) e._orig = e.text; go0(s, out); for (const e of out) if (e._orig && e.text !== e._orig) e._cut = e._orig };
    for (const sc of SC) {
      const cnt = {}, ex = {}; let lives = 0, ent = 0, ages = [], marr = 0, div = 0, kids = 0, house = 0;
      for (let i = 0; i < N; i++) {
        const s = pickOut(sc, i); if (!s) break; lives++; s.track = 1;
        const c = { log: [], seen: new Set(), deadBefore: false }; const full = []; let g = 0;
        while (!s.dead && g < 1500) { g++;
          const out = step(s);
          for (const e of out) {
            c.wasMarried = s.married; const k0 = s.kids, h0 = s.house, a0 = (s.f.selfAffN || 0), m0 = s.married;
            let t = e.text || ''; c.cut = false;
            if (e.choices && e.choices.length) {
              const ch = sc[1].rnd ? e.choices[Math.floor(Math.random() * e.choices.length)] : autoChoose(s, e);
              const key = (e.id || e._re || '?'); choiceSeen[key] = choiceSeen[key] || {}; const cs = choiceSeen[key]; cs._n = (cs._n || 0) + 1; cs._a0 = Math.min(cs._a0 ?? 999, s.age); cs._a1 = Math.max(cs._a1 ?? 0, s.age); cs._y0 = Math.min(cs._y0 ?? 9999, s.y); cs._y1 = Math.max(cs._y1 ?? 0, s.y); cs['_' + s.sex] = (cs['_' + s.sex] || 0) + 1; if (s.married) cs._mar = (cs._mar || 0) + 1; if (s.studying) cs._stu = (cs._stu || 0) + 1; for (const o of e.choices) cs[o.label] = (cs[o.label] || 0) + 1;
              const rr = doChoice(s, e, ch); t = t + ' →' + ch.label + '：' + (rr && rr.text || '');
            }
            c.cut = !!e._cut; if (e._cut) { const kk = (e.id || e._re || e._tl || e.cat || '?'); CUTS[kk] = CUTS[kk] || { n: 0, ex: [] }; CUTS[kk].n++; if (CUTS[kk].ex.length < 2) CUTS[kk].ex.push(s.age + '歲 ' + String(e._cut).slice(0, 90) + ' ⇒ ' + (e.text || '').slice(0, 60)) } c.marriedNow = !m0 && s.married; c.kidNow = s.kids > k0; c.boughtNow = h0 !== 'own' && s.house === 'own'; c.selfAffNow = (s.f.selfAffN || 0) > a0;
            if (s.married) s._everMar = 1;
            const st = strip(t); ent++;
            for (const [k, f] of R) { let hit = false; try { hit = f(s, e, st, c) } catch (err) { } if (hit) { cnt[k] = (cnt[k] || 0) + 1; ex[k] = ex[k] || []; if (ex[k].length < 3) ex[k].push((k==='裁切後剩半句'?'原文：'+String(e._cut).slice(0,60)+' ⇒ ':'')+`${s.by}${s.sex} ${s.eth} ${s.place} ${s.y}年${s.age}歲 job=${s.job} ${e.id || e._re || e._tl || ''}｜${st.slice(0, 110)}`) } }
            full.push(`${s.y}/${s.m} ${s.age}歲 [${e.id || e._re || e._tl || e.cat || ''}] ${t}`);
            c.log.push(st); c.seen.add(st); if (e.death) c.deadBefore = true;
          }
        }
        ages.push(s.age); if (s.f.everMar || s._everMar) marr++; if (s.f.divorced) div++; kids += s.kids; if (s.house === 'own') house++;
        if (i === 0) samples[sc[0]] = { who: `${s.by} ${s.sex} ${s.eth} ${s.birthCounty} ${s.pjob}/${s.inc} ${s.fam}`, full };
      }
      ages.sort((a, b) => a - b);
      res[sc[0]] = { lives, entriesPerLife: Math.round(ent / Math.max(1, lives)), medianAge: ages[ages.length >> 1], married: marr, divorced: div, kidsAvg: +(kids / Math.max(1, lives)).toFixed(2), ownHouse: house, hits: cnt, ex };
    }
    return { res, samples, choiceSeen, CUTS };
  }, N);
  r.errors = errs.slice(0, 10);
  if (OUT) require('fs').writeFileSync(OUT, JSON.stringify(r, null, 1));
  for (const k in r.res) { const x = r.res[k]; console.log(`\n## ${k}  lives=${x.lives} 中位壽命=${x.medianAge} 結婚=${x.married} 離婚=${x.divorced} 平均孩子=${x.kidsAvg} 有房=${x.ownHouse}`); for (const h in x.hits) console.log(`  ${h}: ${x.hits[h]}\n    ` + x.ex[h].join('\n    ')) }
  console.log('\nerrors:', r.errors.length, r.errors.join(' | '));
  await b.close();
})();
