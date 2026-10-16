// Checks content/partners.json against the rules in content/FORMAT.md, and prints how the
// ways to meet split by decade. Run: node tests/partners_content.js
const fs = require('fs'), path = require('path');
const C = f => JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'content', f), 'utf8'));
const P = C('partners.json'), RM = C('romance.json');
const AX = new Set(['risk', 'rebel', 'self', 'open', 'eng']);
const JOBS = new Set(['農', '工廠', '營造', '服務', '公教', '公司', '科技', '自營', '台幹', '醫護']);
const PJOB = new Set(['農', '工', '小生意', '公教', '白領']);
const NEED = new Set(['working', 'student', 'kids', 'married', 'parentsAlive', 'rural', 'urban']);
const FAM = P.profile.famLevels;
const errs = [], bad = (w, m) => errs.push(`${w}: ${m}`);
const PH = /\{(?!(?:n|p|a|b|ap|bp|aj|bj|sibs|spot|nm|food|temple|elders)\})/;
function text(w, t) {
  if (typeof t !== 'string' || !t.trim()) return bad(w, 'empty text');
  const out = t.replace(/「[^」]*」/g, '');
  if (/所以|因此/.test(out)) bad(w, 'uses 所以/因此');
  if (/你/.test(out)) bad(w, 'uses 你 outside quotes (write in 我)');
  if (!/[。！？」]$/.test(t)) bad(w, 'does not end with punctuation');
  if (/undefined/.test(t) || PH.test(t)) bad(w, 'unknown placeholder');
}
const yr = (w, y) => { if (y && (y.length !== 2 || y[0] > y[1] || y[0] < 1961 || y[1] > 2110)) bad(w, 'bad y') };
function period(w, t, lo, hi) {
  if (!Array.isArray(t) || !t.length) return bad(w, 'empty period table');
  t.forEach(r => { if (r.length !== 3 || r[0] > r[1]) bad(w, 'bad row ' + JSON.stringify(r)); else if (typeof r[2] === 'number' && !(r[2] >= lo && r[2] <= hi)) bad(w, 'value out of range ' + r[2]) });
  for (let i = 1; i < t.length; i++) if (t[i][0] <= t[i - 1][1]) bad(w, 'rows overlap');
}
const at = (t, y) => { const r = t.find(r => y >= r[0] && y <= r[1]); return r ? r[2] : 0 };
function filt(w, e) {
  yr(w, e.y);
  if (e.minAge != null && e.maxAge != null && e.minAge > e.maxAge) bad(w, 'minAge > maxAge');
  if (e.sex && !['M', 'F'].includes(e.sex)) bad(w, 'bad sex');
  if (e.ptSex && !['M', 'F'].includes(e.ptSex)) bad(w, 'bad ptSex');
  (e.need || []).forEach(n => { if (!NEED.has(n)) bad(w, 'unknown need ' + n) });
  (e.myJob || []).forEach(j => { if (!JOBS.has(j)) bad(w, 'unknown job ' + j) });
  if (e.pjob && !PJOB.has(e.pjob)) bad(w, 'unknown pjob ' + e.pjob);
  (e.fam || []).forEach(f => { if (!FAM.includes(f)) bad(w, 'unknown fam ' + f) });
}

// profile
const pf = P.profile;
pf.axes.forEach(a => { if (!AX.has(a)) bad('profile/axes', 'unknown axis ' + a) });
if (!(pf.sim > 0 && pf.sim < 1)) bad('profile/sim', 'out of range');
['eldest', 'only'].forEach(k => period('profile/' + k, pf[k], 0, 1));
pf.pjob.forEach(([a, b, m], i) => Object.keys(m).forEach(k => { if (!PJOB.has(k)) bad('profile/pjob/' + i, 'unknown ' + k) }));

// channels
const CH = new Map();
P.channels.list.forEach(c => {
  const w = 'channel/' + c.id; if (CH.has(c.id)) bad(w, 'duplicate id'); CH.set(c.id, c);
  if (!c.label) bad(w, 'missing label');
  period(w + '/w', c.w, 0, 100); filt(w, c);
  if (c.ptJob && !(c.ptJob === 'same' || c.ptJob === 'student' || (Array.isArray(c.ptJob) && c.ptJob.every(j => JOBS.has(j))))) bad(w, 'bad ptJob');
  if (c.ptJob === 'same' && !(c.myJob && c.need && c.need.includes('working'))) bad(w, 'ptJob same needs myJob and need working');
  if (c.ptJob === 'student' && !(c.need || []).includes('student')) bad(w, 'ptJob student needs need student');
  ['famSame', 'ethSame', 'sameCounty'].forEach(k => { if (c[k] != null && !(c[k] >= 0 && c[k] <= 1)) bad(w, k + ' out of range') });
  if (c.simAdd != null && Math.abs(pf.sim + c.simAdd) >= 1) bad(w, 'sim + simAdd out of range');
  Object.keys(c.shift || {}).forEach(k => { if (!AX.has(k)) bad(w, 'shift axis ' + k) });
  (c.texts || []).forEach((t, i) => { filt(`${w}/text${i}`, t); text(`${w}/text${i}`, t.text);
    if (t.y && !c.w.some(r => r[0] <= t.y[1] && r[1] >= t.y[0])) bad(`${w}/text${i}`, 'y outside the channel years') });
  const tagged = (RM.meet || []).concat(RM.blind || []).filter(x => x.ch === c.id).length;
  if (!(c.texts || []).length && !tagged) bad(w, 'no meet text here or in romance.json');
});
(RM.meet || []).concat(RM.blind || []).forEach((x, i) => { if (x.ch && !CH.has(x.ch)) bad('romance/' + i, 'unknown ch ' + x.ch) });
(RM.blind || []).forEach((x, i) => { if (x.ch && !CH.get(x.ch).blind) bad('romance/blind/' + i, 'blind line tagged with a non-blind channel') });

// every year and setting has several ways to meet; print shares
const usable = (c, y, age, urban, student) => at(c.w, y) * (urban ? c.urban || 1 : c.rural || 1) *
  ((c.minAge == null || age >= c.minAge) && (c.maxAge == null || age <= c.maxAge) && (!(c.need || []).includes('student') || student) ? 1 : 0);
for (let y = 1961; y <= 2040; y++) for (const urban of [true, false]) {
  const n = [...CH.values()].filter(c => !c.blind && !c.myJob && usable(c, y, 26, urban, false) > 0).length;
  if (n < 2) bad('channels/' + y, `only ${n} non-blind, no-job ways to meet (${urban ? 'urban' : 'rural'})`);
}
const rows = [];
for (const y of [1965, 1975, 1985, 1995, 2005, 2015, 2025]) for (const urban of [true, false]) {
  const ws = [...CH.values()].map(c => [c.label, usable(c, y, 26, urban, false) * (c.myJob ? .5 : 1)]).filter(x => x[1] > 0);
  const tot = ws.reduce((a, b) => a + b[1], 0);
  rows.push(`${y} ${urban ? '都市' : '鄉下'}: ` + ws.sort((a, b) => b[1] - a[1]).slice(0, 5).map(([l, v]) => `${l} ${Math.round(v / tot * 100)}%`).join('、'));
}

// describe
P.describe.bg.forEach((e, i) => { filt('bg/' + i, e); text('bg/' + i, e.text) });
P.describe.eldest.forEach((e, i) => { filt('eldest/' + i, e); text('eldest/' + i, e.text); if (!e.ptSex) bad('eldest/' + i, 'missing ptSex') });
[...PJOB].forEach(j => { if (!P.describe.bg.some(e => e.pjob === j)) bad('bg', 'no line for pjob ' + j) });
P.describe.impress.list.forEach((e, i) => { const w = 'impress/' + i; filt(w, e); text(w, e.text); if (!AX.has(e.axis)) bad(w, 'bad axis'); if (![1, -1].includes(e.dir)) bad(w, 'bad dir') });
pf.axes.forEach(a => [1, -1].forEach(d => { if (!P.describe.impress.list.some(e => e.axis === a && e.dir === d)) bad('impress', `no line for ${a} ${d}`) }));

// pairs
period('pairs/offer', P.pairs.offer, 0, .5);
const ids = new Set();
P.pairs.templates.forEach(t => {
  const w = 'pair/' + t.id; if (ids.has(t.id)) bad(w, 'duplicate id'); ids.add(t.id); filt(w, t);
  ['a', 'b'].forEach(k => { const c = t[k], wk = `${w}/${k}`;
    if (!c) return bad(wk, 'missing');
    if (c.ch !== 'any' && !CH.has(c.ch)) bad(wk, 'unknown ch ' + c.ch);
    (c.job || []).forEach(j => { if (!JOBS.has(j)) bad(wk, 'unknown job ' + j) });
    ['famMin', 'famMax'].forEach(f => { if (c[f] && !FAM.includes(c[f])) bad(wk, 'bad ' + f) });
    if (c.eth && !['same', 'cross'].includes(c.eth)) bad(wk, 'bad eth');
    if (c.parents && !['like', 'against'].includes(c.parents)) bad(wk, 'bad parents');
    Object.keys(c.shift || {}).forEach(a => { if (!AX.has(a)) bad(wk, 'shift axis ' + a) }) });
  if (!t.ask.some(a => !a.y || (a.y[0] <= t.y[0]))) bad(w, 'no ask for the first year');
  t.ask.forEach((a, i) => { yr(`${w}/ask${i}`, a.y); text(`${w}/ask${i}`, a.text); if (!/\{a\}/.test(a.text) || !/\{b\}/.test(a.text)) bad(`${w}/ask${i}`, 'must name both {a} and {b}') });
  if (t.choices.length < 2) bad(w, 'needs at least two options');
  const picks = t.choices.map(c => c.pick); if (!picks.includes('a') || !picks.includes('b')) bad(w, 'options must cover a and b');
  t.choices.forEach(c => { const wc = `${w}/${c.label}`;
    Object.keys(c.lean || {}).forEach(a => { if (!AX.has(a)) bad(wc, 'lean axis ' + a) });
    if (!c.go || !c.go.length) bad(wc, 'no go text');
    c.go.forEach((g, i) => { filt(`${wc}/go${i}`, g); text(`${wc}/go${i}`, g.text) });
    const last = c.go[c.go.length - 1]; if (last.y) bad(wc, 'last go variant must have no y');
    if (/\{n\}|\{p\}/.test(c.go.map(g => g.text).join(''))) bad(wc, 'use {a}/{b} in go text, not {n}/{p}') });
  (t.normText || []).forEach((n, i) => { text(`${w}/norm${i}`, n.text + '。'); if (!t.choices.some(c => c.label === n.norm)) bad(`${w}/norm${i}`, 'names no option') });
  (t.otherLine || []).forEach((e, i) => { filt(`${w}/other${i}`, e); text(`${w}/other${i}`, e.text) });
});

// compat
Object.keys(P.compat.w).forEach(a => { if (!AX.has(a)) bad('compat/w', 'unknown axis ' + a) });
['divorceMult', 'fightMonthly', 'label'].forEach(k => { const t = P.compat[k];
  for (let i = 1; i < t.length; i++) if (t[i][0] >= t[i - 1][0]) bad('compat/' + k, 'rows must go from high to low');
  if (t[t.length - 1][0] !== 0) bad('compat/' + k, 'last row must start at 0') });
P.compat.fightMonthly.forEach(r => { if (!(r[1] > 0 && r[1] < .1)) bad('compat/fightMonthly', 'out of range') });

// fights
const CAUSE = new Set(['risk', 'self', 'open', 'rebel', 'politics', 'fam', 'eldest', 'job', 'inlaw']);
const seen = new Set();
P.fights.pool.forEach((e, i) => { const w = `fight/${i}/${e.cause}`; filt(w, e); text(w, e.text);
  if (!CAUSE.has(e.cause)) bad(w, 'unknown cause'); if (e.hi && !['me', 'pt'].includes(e.hi)) bad(w, 'bad hi');
  if (e.cause === 'inlaw' && !e.married) bad(w, 'inlaw fights are married only');
  if (e.cause === 'politics' && !(e.y && e.y[0] >= P.compat.engFrom)) bad(w, 'politics fights start at engFrom');
  seen.add(e.cause + (e.married === true ? ':m' : e.married === false ? ':d' : ':*')) });
CAUSE.forEach(c => { if (c !== 'inlaw' && !seen.has(c + ':*') && !seen.has(c + ':d')) bad('fights', `no dating line for ${c}`) });
(P.fights.shiftJobs || []).forEach(j => { if (!JOBS.has(j)) bad('fights/shiftJobs', 'unknown job ' + j) });

// family, inlaws, wedding
const CONDS = new Set(['ptRich', 'ptPoor', 'ptEldestSon', 'meEldestSon', 'ptFarm', 'ptGJ', 'ptShop', 'ptOnly']);
P.family.pool.forEach((e, i) => { const w = 'family/' + i; filt(w, e); text(w, e.text);
  if (!CONDS.has(e.cond)) bad(w, 'unknown cond ' + e.cond); if (!(e.delta >= -20 && e.delta <= 10)) bad(w, 'delta out of range') });
const IL = P.inlaws; ['his', 'hers', 'moveOutRate'].forEach(k => period('inlaws/' + k, IL[k], 0, .9));
['start', 'during'].forEach(k => IL[k].forEach((e, i) => { const w = `inlaws/${k}/${i}`; filt(w, e); text(w, e.text); if (!['his', 'hers'].includes(e.who)) bad(w, 'bad who') }));
['his', 'hers'].forEach(who => ['M', 'F'].forEach(sx => { if (!IL.start.some(e => e.who === who && e.sex === sx)) bad('inlaws/start', `no line for ${who} ${sx}`) }));
['moveOut', 'house'].forEach(k => IL[k].forEach((e, i) => text(`inlaws/${k}/${i}`, e.text)));
['help', 'support', 'dowry'].forEach(k => P.wedding[k].forEach((e, i) => { const w = `wedding/${k}/${i}`; filt(w, e); text(w, e.text); if (!(e.p > 0 && e.p <= 1)) bad(w, 'bad p') }));

if (errs.length) { console.log(errs.join('\n')); console.log(`\n${errs.length} problem(s)`); process.exit(1) }
console.log(rows.join('\n'));
console.log(`\npartners.json OK: ${CH.size} channels, ${P.pairs.templates.length} pair templates, ${P.fights.pool.length} fight lines, ${P.family.pool.length} family lines`);
