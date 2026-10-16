// Checks content/popculture.json against content/FORMAT.md › popculture.json,
// and that every birth cohort meets enough of it. Run: node tests/pop_content.js
const fs = require('fs'), path = require('path');
const P = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'content', 'popculture.json'), 'utf8')).items;
const CATS = new Set(['卡通', '電視', '音樂', '電影', '遊戲', '零食', '童玩', '科技', '流行']);
const ETH = new Set(['閩南', '客家', '外省', '原住民', '新住民子女']), TONES = new Set(['good', 'bad', 'neutral']);
const NEED = new Set(['working', 'student', 'kids', 'married', 'parentsAlive', 'rural', 'urban']);
let errs = [];
const bad = (w, m) => errs.push(`${w}: ${m}`);
const ids = new Set(), names = new Set(), texts = new Set();
function text(w, t) {
  if (typeof t !== 'string' || !t.trim()) return bad(w, 'empty text');
  const out = t.replace(/「[^」]*」/g, '');
  if (/所以|因此/.test(out)) bad(w, 'uses 所以/因此');
  if (/你/.test(out)) bad(w, 'uses 你 outside quotes (write in 我)');
  if (!/[。！？」]$/.test(t)) bad(w, 'does not end with punctuation');
  if (/undefined|\{(?!n\}|p\}|spot\}|nm\}|food\}|temple\}|elders\})/.test(t)) bad(w, 'unknown placeholder');
  if (texts.has(t)) bad(w, 'duplicate text'); texts.add(t);
}
P.forEach(e => {
  const w = 'pop/' + e.id;
  if (!e.id || ids.has(e.id)) bad(w, 'missing or duplicate id'); ids.add(e.id);
  if (!e.name || e.name.length > 10) bad(w, 'name missing or too long for the end screen');
  if (names.has(e.name)) bad(w, 'duplicate name'); names.add(e.name);
  if (!CATS.has(e.cat)) bad(w, 'bad cat ' + e.cat);
  if (!e.y || e.y.length !== 2 || e.y[0] > e.y[1] || e.y[0] < 1961 || e.y[1] > 2110) bad(w, 'bad y');
  if (!(e.minAge >= 0 && e.maxAge >= e.minAge)) bad(w, 'bad age range');
  if (!(e.weight > 0)) bad(w, 'bad weight');
  if (!e.src) bad(w, 'missing src (how the year was checked)');
  if (e.eth && !ETH.has(e.eth)) bad(w, 'bad eth');
  Object.keys(e.skew || {}).forEach(k => { if (k !== 'urban' && k !== 'rural' && !ETH.has(k)) bad(w, 'bad skew key ' + k) });
  if (!e.lines || !e.lines.length) bad(w, 'no lines');
  (e.lines || []).forEach((l, i) => {
    const lw = w + '/' + i; text(lw, l.text);
    if (!TONES.has(l.tone)) bad(lw, 'bad tone');
    const lo = Math.max(e.minAge, l.minAge ?? 0), hi = Math.min(e.maxAge, l.maxAge ?? 200);
    if (lo > hi) bad(lw, 'line age range outside the item range');
    if (l.y && (l.y[0] > e.y[1] || l.y[1] < e.y[0])) bad(lw, 'line y outside the item y');
    if (l.sex && !['M', 'F'].includes(l.sex)) bad(lw, 'bad sex');
    if (l.eth && !ETH.has(l.eth)) bad(lw, 'bad eth');
    (l.need || []).forEach(n => { if (!NEED.has(n)) bad(lw, 'unknown need ' + n) });
  });
});
// Coverage: every birth year 1961–2010 should meet at least 6 general items (no eth filter) between ages 5 and 25.
for (let by = 1961; by <= 2010; by++) {
  const hit = P.filter(e => !e.eth && e.lines.some(l => {
    for (let a = 5; a <= 25; a++) { const y = by + a;
      if (y < e.y[0] || y > e.y[1] || a < e.minAge || a > e.maxAge) continue;
      if ((l.minAge ?? 0) <= a && a <= (l.maxAge ?? 200) && (!l.y || (l.y[0] <= y && y <= l.y[1])) && !l.need) return true }
    return false }));
  if (hit.length < 6) bad('coverage/' + by, `only ${hit.length} items reachable at ages 5–25`);
}
if (errs.length) { console.log(errs.join('\n')); console.log(`FAIL ${errs.length}`); process.exit(1) }
console.log(`ok: ${P.length} items, ${P.reduce((n, e) => n + e.lines.length, 0)} lines`);
