// Checks content/affair.json against the rules in content/FORMAT.md. Run: node tests/affair_content.js
const fs = require('fs'), path = require('path');
const A = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'content', 'affair.json'), 'utf8'));
const NEED = new Set(['working', 'student', 'kids', 'married', 'parentsAlive']);
const JOBS = new Set(['農', '工廠', '營造', '服務', '公教', '公司', '科技', '自營', '台幹', '醫護']);
const KEYS = new Set(['id', 'text', 'y', 'months', 'minAge', 'maxAge', 'sex', 'spSex', 'need', 'money', 'away', 'spAway', 'job', 'axisMin', 'axisMax', 'famNot', 'flag', 'kidAge', 'who', 'p']);
const errs = [], bad = (w, m) => errs.push(`${w}: ${m}`);
// explicit words the affair text must stay clear of: mood and consequences only
const EXPLICIT = /(上床|做愛|性行為|親熱|裸|胸部|激情|偷情|開房間)/;
function text(w, t, selfOnly) {
  if (typeof t !== 'string' || !t.trim()) return bad(w, 'empty text');
  const out = t.replace(/「[^」]*」/g, '');
  if (/所以|因此/.test(out)) bad(w, 'uses 所以/因此');
  if (/你/.test(out)) bad(w, 'uses 你 outside quotes (write in 我)');
  if (!/[。！？」]$/.test(t)) bad(w, 'does not end with punctuation');
  if (/undefined|\{(?!n\}|p\}|o\}|spot\}|elders\})/.test(t)) bad(w, 'unknown placeholder');
  if (EXPLICIT.test(t)) bad(w, 'explicit wording');
}
function filt(w, e, self) {
  Object.keys(e).forEach(k => { if (!KEYS.has(k)) bad(w, 'unknown key ' + k) });
  if (e.y && (e.y.length !== 2 || e.y[0] > e.y[1] || e.y[0] < 1961 || e.y[1] > 2110)) bad(w, 'bad y');
  if (self && (!e.y || e.y[0] < 2020) && !w.startsWith('self/')) bad(w, 'character affair must be 2020+');
  if (e.minAge != null && e.maxAge != null && e.minAge > e.maxAge) bad(w, 'minAge > maxAge');
  ['sex', 'spSex'].forEach(k => { if (e[k] && !['M', 'F'].includes(e[k])) bad(w, 'bad ' + k) });
  (e.need || []).forEach(n => { if (!NEED.has(n)) bad(w, 'unknown need ' + n) });
  (e.job || []).forEach(j => { if (!JOBS.has(j)) bad(w, 'unknown job ' + j) });
  if (e.money && e.money !== 'low') bad(w, 'money must be "low"');
  if (e.away && !(e.y && e.y[0] >= 1985 && e.y[1] <= 2020)) bad(w, 'away lines belong to the 台商 years');
  if ((e.away || e.spAway) && /\{o\}/.test(e.text || '') && e.spSex === undefined && /孩子/.test(e.text)) bad(w, 'set spSex for a 包二奶 scene');
}
const ids = new Set(), uniq = (w, id) => { if (!id) bad(w, 'missing id'); else if (ids.has(id)) bad(w, 'duplicate id'); ids.add(id) };
const rate = (w, v, lo, hi) => { if (!(v > lo && v < hi)) bad(w, `out of range ${v}`) };

const o = A.onset; rate('onset/spouse/annual', o.spouse.annual, 0, .02); rate('onset/self/annual', o.self.annual, 0, .02);
if (!(o.self.from[0] > 2020 || (o.self.from[0] === 2020 && o.self.from[1] >= 6))) bad('onset/self/from', 'must be June 2020 or later (adultery was a crime until 2020-05-29)');
rate('discover/monthly', A.discover.monthly, 0, .2); rate('discover/endMonthly', A.discover.endMonthly, 0, .2);

A.signs.forEach(e => { const w = 'signs/' + e.id; uniq(w, e.id); filt(w, e); text(w, e.text) });
A.found.forEach(e => { const w = 'found/' + e.id; uniq(w, e.id); filt(w, e, e.who === 'self'); text(w, e.text);
  if (!['spouse', 'self'].includes(e.who)) bad(w, 'who must be spouse or self') });
['spouse', 'self'].forEach(k => { if (!A.found.some(e => e.who === k)) bad('found', 'no entry for ' + k) });

const R = A.respond; text('respond/ask', R.ask);
R.normText.forEach((n, i) => { const w = 'respond/normText/' + i; text(w, n.text + '。'); if (!R.choices.some(c => c.label === n.norm)) bad(w, 'norm names no option ' + n.norm) });
const THEN = new Set(['talk', 'endure', 'separate', 'divorce', 'sue']);
R.choices.forEach(c => { const w = 'respond/' + c.label;
  if (!THEN.has(c.then)) bad(w, 'bad then');
  if (!c.go || !c.go.length) bad(w, 'no go text');
  c.go.forEach((g, i) => { filt(`${w}/go${i}`, g); text(`${w}/go${i}`, g.text) });
  const last = c.go[c.go.length - 1]; if (Object.keys(last).some(k => k !== 'text')) bad(w, 'last go variant must have no filters');
  if (c.then === 'sue' && !(c.until && (c.until[0] < 2020 || (c.until[0] === 2020 && c.until[1] <= 5)))) bad(w, '提告 must end by 2020-05');
  if (c.hard) text(w + '/hard', c.hard.failText) });
THEN.forEach(t => { if (!A.after[t] || !A.after[t].length) bad('after/' + t, 'missing'); else A.after[t].forEach((e, i) => { filt(`after/${t}/${i}`, e); text(`after/${t}/${i}`, e.text) }) });
A.kids.lines.forEach((e, i) => { filt('kids/' + i, e); text('kids/' + i, e.text); if (!e.kidAge) bad('kids/' + i, 'missing kidAge') });

['start', 'during', 'end'].forEach(k => A.self[k].forEach((e, i) => { const w = `self/${k}/${i}`; filt(w, e, true); text(w, e.text) }));
Object.entries(A.self.spouseReacts).forEach(([k, v]) => { if (k === '_how') return; v.text.forEach((t, i) => text(`self/react/${k}/${i}`, t)) });

A.ambient.forEach(e => { const w = 'ambient/' + e.id; uniq(w, e.id); filt(w, e); text(w, e.text) });
A.habits.forEach(h => { const w = 'habit/' + h.k; ['k', 'say', 'does', 'why', 'when'].forEach(k => { if (!h[k]) bad(w, 'missing ' + k) });
  if (h.why && !h.why.startsWith('，')) bad(w, 'why must start with ，'); if (/^你/.test(h.does || '')) bad(w, 'does must not start with 你') });
A.regrets.forEach(r => { const w = 'regret/' + r.k; text(w, r.txt); if (!r.why || /所以|因此/.test(r.why)) bad(w, 'bad why'); rate(w, r.w, 0, 5) });

// no exact duplicates anywhere
const all = []; JSON.stringify(A, (k, v) => { if (k === 'text' && typeof v === 'string') all.push(v); return v });
const seen = new Set(); all.forEach(t => { if (seen.has(t)) bad('dup', t.slice(0, 20)); seen.add(t) });

if (errs.length) { console.log(errs.join('\n')); console.log(`\n${errs.length} problem(s)`); process.exit(1) }
console.log(`affair.json OK: ${A.signs.length} signs, ${A.found.length} found, ${R.choices.length} choices, ${A.ambient.length} ambient`);
