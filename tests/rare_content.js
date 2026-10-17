// Checks content/rare.json and how often rare moments show up in the game.
// Each life should meet a rare moment now and then (not every life), each moment at most once.
// Run: node tests/rare_content.js [index.html] [lives]
const fs = require('fs'), path = require('path');
const { chromium } = require(process.env.PW || 'playwright');
const ev = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'content', 'rare.json'), 'utf8')).events;
const file = process.argv[2] || 'index.html', N = +process.argv[3] || 400;
const errs = [], bad = (w, m) => errs.push(`${w}: ${m}`);
const ids = new Set();
for (const e of ev) {
  const w = 'rare/' + e.id;
  if (ids.has(e.id)) bad(w, 'duplicate id'); ids.add(e.id);
  if (!(e.p > 0 && e.p <= 0.2)) bad(w, 'p must be in (0, 0.2]');
  const out = (e.text || '').replace(/「[^」]*」/g, '');
  if (/你/.test(out)) bad(w, 'uses 你 outside quotes (write in 我)');
  if (/所以|因此/.test(out)) bad(w, 'uses 所以/因此');
  if (!/[。！？」]$/.test(e.text || '')) bad(w, 'does not end with punctuation');
  if (e.y && (e.y.length !== 2 || e.y[0] > e.y[1])) bad(w, 'bad y');
}
(async () => {
  const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome' }).catch(() => chromium.launch());
  const p = await b.newPage(); const pe = [];
  p.on('pageerror', e => pe.push(e.message));
  await p.goto('file://' + path.resolve(file));
  const r = await p.evaluate(N => {
    let any = 0, twice = 0, flagged = 0;
    for (let i = 0; i < N; i++) {
      const s = newLife(1961 + (i % 50)); let g = 0;
      while (!s.dead && g++ < 1500) for (const e of step(s) || []) if (e.rare) flagged++;
      if (s.rareSeen.length) any++;
      if (new Set(s.rareSeen).size !== s.rareSeen.length) twice++;
    }
    return { share: any / N, twice, flagged };
  }, N);
  await b.close();
  console.log(JSON.stringify(r));
  if (pe.length) bad('page', pe[0]);
  if (r.twice) bad('game', r.twice + ' lives met the same rare moment twice');
  if (r.share < 0.1 || r.share > 0.45) bad('game', 'share of lives with a rare moment ' + r.share + ' is outside 0.1–0.45');
  if (errs.length) { console.log(errs.join('\n')); process.exit(1) }
  console.log('ok');
})();
