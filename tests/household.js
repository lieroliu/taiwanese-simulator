// Every time someone moves in or out of the character's home, that month's diary has to say why.
// Compares who lives in the house month by month (the same list the scene picture draws) and fails
// when the household changed but no diary line that month explains it.
// Run: node tests/household.js [index.html] [lives]
const { chromium } = require(process.env.PW || 'playwright');
const file = process.argv[2] || 'index.html', N = +process.argv[3] || 300;
(async () => {
  const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome' }).catch(() => chromium.launch());
  const p = await b.newPage(); const errs = []; p.on('pageerror', e => errs.push(e.message));
  await p.goto('file://' + process.cwd() + '/' + file);
  const r = await p.evaluate((N) => {
    const { newLife, step, doChoice, autoChoose, hhSnap } = window.__sim;
    const RX = /(婚禮|登記|搬|北上|宿舍|雅房|租|外地|離開家|回家|回到|老家|住家裡|入伍|當兵|退伍|結婚|嫁|娶|離婚|過世|走了|分手|分開|住在一起|同居|出國|澳洲|中國|台幹|回台灣|出生|生下|生了|寶寶|兒子|女兒|孩子|住)/;
    let changes = 0, gen = 0, sibLines = 0; const bad = [];
    for (let i = 0; i < N; i++) {
      const s = newLife(1961 + (i % 50)); let prev = null, chText = [], g = 0;
      while (!s.dead && g++ < 1500) {
        const out = step(s); if (s.dead) break;
        const cur = hhSnap(s);
        if (prev) {
          const diff = [...new Set([...prev.keys, ...cur.keys])].filter(k => prev.keys.has(k) !== cur.keys.has(k));
          if (diff.length || prev.self !== cur.self) {
            changes++;
            const T = out.filter(e => e.text && !e.choices).map(e => e.text).concat(chText);
            const hh = out.filter(e => e._hh);
            gen += hh.length; sibLines += hh.filter(e => /^sib/.test(e._hh)).length;
            if (!hh.length && !T.some(t => RX.test(t))) bad.push(`${s.by}${s.sex} ${s.age}歲 ${prev.self} → ${cur.self} 變動=${diff.join(',')} 日記=${T.join(' / ').slice(0, 120)}`);
          }
        }
        prev = cur; chText = [];
        for (const e of out) if (e.choices) { const t = doChoice(s, e, autoChoose(s, e)).text; if (t) chText.push(t) }
      }
    }
    return { changes, gen, sibLines, bad: bad.length, ex: bad.slice(0, 12) };
  }, N);
  console.log(JSON.stringify(r, null, 1)); if (errs.length) console.log('errors', errs);
  await b.close(); process.exit(r.bad || errs.length ? 1 : 0);
})();
