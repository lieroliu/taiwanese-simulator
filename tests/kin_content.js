// Checks content/kin_advice.json against content/FORMAT.md › kin_advice.json.
// Run: node tests/kin_content.js
const fs = require('fs'), path = require('path');
const K = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'content', 'kin_advice.json'), 'utf8'));
const MAJORS = new Set(['理工', '商管', '文法', '醫護', '師範']);
const ETH = ['閩南', '客家', '外省', '原住民', '新住民子女'], PJOB = ['農', '工', '小生意', '公教', '白領'];
const AXES = new Set(['risk', 'rebel', 'self', 'open', 'eng']), TONES = new Set(['good', 'bad', 'neutral']);
const JOBS = new Set(['農', '工廠', '營造', '服務', '公教', '公司', '科技', '自營', '台幹', '醫護', '家管', '退休', '失業']);
const EDU = new Set(['國小', '國中', '高職', '高中', '五專', '大學']);
// Choice labels as they appear in index.html (m15 and job events), used for ctx norm.
const LABELS = { m15: ['考高中', '讀高職', '讀五專', '去工作'], job: ['去學校教書', '考公職', '進科學園區', '去醫院工作', '進公司上班', '進工廠', '做小生意', '回家幫忙種田', '去中國當台幹'] };
const PH = ['n', 'p', 'spot', 'nm', 'food', 'temple', 'elders', 'adv', 'like', 'got'];
let errs = [];
const bad = (w, m) => errs.push(`${w}: ${m}`);
function text(w, t) {
  if (typeof t !== 'string' || !t.trim()) return bad(w, 'empty text');
  const outside = t.replace(/「[^」]*」/g, '');
  if (/所以|因此/.test(outside)) bad(w, 'uses 所以/因此');
  if (/你/.test(outside)) bad(w, 'uses 你 outside quotes (write in 我)');
  if (!/[。！？」]$/.test(t)) bad(w, 'does not end with punctuation');
  for (const m of t.matchAll(/\{(\w+)\}/g)) if (!PH.includes(m[1])) bad(w, 'unknown placeholder ' + m[0]);
  if ((t.match(/「/g) || []).length !== (t.match(/」/g) || []).length) bad(w, 'unbalanced 「」');
}
function range(w, k, r, lo, hi) { if (r && (r.length !== 2 || r[0] > r[1] || r[0] < lo || r[1] > hi)) bad(w, `bad ${k} ${r}`) }
function filt(w, e) {
  range(w, 'by', e.by, 1961, 2010); range(w, 'y', e.y, 1961, 2110);
  if (e.minAge != null && e.maxAge != null && e.minAge > e.maxAge) bad(w, 'minAge > maxAge');
  if (e.sex && !['M', 'F'].includes(e.sex)) bad(w, 'bad sex');
  if (e.eth && !ETH.includes(e.eth)) bad(w, 'unknown eth ' + e.eth);
  (e.pjob || []).forEach(j => { if (!PJOB.includes(j)) bad(w, 'unknown pjob ' + j) });
  (e.job || []).forEach(j => { if (!JOBS.has(j)) bad(w, 'unknown job ' + j) });
  (e.edu || []).forEach(j => { if (!EDU.has(j)) bad(w, 'unknown edu ' + j) });
  if (Array.isArray(e.major)) e.major.forEach(m => { if (!MAJORS.has(m)) bad(w, 'unknown major ' + m) });
  if (e.inc && !['高', '中', '低'].includes(e.inc)) bad(w, 'bad inc');
}
const ids = new Set();
const uid = (w, id) => { if (!id) bad(w, 'missing id'); else if (ids.has(id)) bad(w, 'duplicate id ' + id); else ids.add(id) };

// cohorts
const cover = [];
K.cohorts.forEach((c, i) => {
  const w = 'cohort ' + c.id;
  range(w, 'by', c.by, 1961, 2010);
  if (i && K.cohorts[i - 1].by[1] + 1 !== c.by[0]) bad(w, 'cohort ranges must be contiguous');
  text(w + ' clashCtx', c.clashCtx.text + '。');
  c.clashCtx.norm.forEach(n => { if (!K.clash.choices.some(x => x.label === n)) bad(w, 'clashCtx norm not a clash label: ' + n) });
  c.advice.forEach(a => {
    const aw = w + ' ' + a.id; uid(aw, a.id); filt(aw, a); text(aw, a.text);
    if (!MAJORS.has(a.major)) bad(aw, 'unknown major ' + a.major);
    if (!a.sub) bad(aw, 'missing sub');
    if (a.by && (a.by[0] < c.by[0] || a.by[1] > c.by[1])) bad(aw, 'by outside cohort');
  });
  // every character in the cohort must get some advice
  for (const sex of ['M', 'F']) for (const eth of ETH) for (const pjob of PJOB) for (const urban of [true, false]) for (const study of [30, 60, 90]) for (const by of [c.by[0], c.by[1]]) {
    const ok = c.advice.some(a => (!a.sex || a.sex === sex) && (!a.eth || a.eth === eth) && (!a.pjob || a.pjob.includes(pjob)) && (a.urban == null || a.urban === urban) && (a.studyAtLeast == null || study >= a.studyAtLeast) && (!a.by || (by >= a.by[0] && by <= a.by[1])));
    if (!ok) cover.push(`${c.label} ${sex} ${eth} ${pjob} urban=${urban} study=${study} by=${by}`);
  }
});
if (cover.length) bad('cohorts', 'no advice for ' + cover.length + ' combos, e.g. ' + cover[0]);

// likes
K.likes.forEach(l => {
  const w = 'like ' + l.id; uid(w, l.id); filt(w, l);
  if (!MAJORS.has(l.major)) bad(w, 'unknown major ' + l.major);
  Object.keys(l.ax || {}).forEach(a => { if (!AXES.has(a)) bad(w, 'unknown axis ' + a) });
  if (!l.hobby || !l.hobby.length) bad(w, 'no hobby lines');
  (l.hobby || []).forEach((h, j) => { filt(w + ' hobby ' + j, h); text(w + ' hobby ' + j, h.text) });
});
// every birth year has some like for every major family the relatives push
for (let by = 1961; by <= 2010; by++) if (K.likes.filter(l => !l.by || (by >= l.by[0] && by <= l.by[1])).length < 8) bad('likes', 'fewer than 8 likes for by=' + by);

// clash
const cl = K.clash;
cl.text.forEach((t, j) => { filt('clash text ' + j, t); text('clash text ' + j, t.text); if (!['interest', 'grades'].includes(t.type)) bad('clash text ' + j, 'bad type') });
for (let by = 1961; by <= 2010; by++) if (!cl.text.some(t => t.type === 'interest' && (!t.by || (by >= t.by[0] && by <= t.by[1])))) bad('clash', 'no interest text for by=' + by);
const labels = new Set();
cl.choices.forEach(c => {
  const w = 'clash choice ' + c.label;
  if (labels.has(c.label)) bad(w, 'duplicate label'); labels.add(c.label);
  Object.keys(c.lean || {}).forEach(a => { if (!AXES.has(a)) bad(w, 'unknown lean axis ' + a) });
  if (!c.retake && !['adv', 'like'].includes(c.target)) bad(w, 'target must be adv or like');
  ['ok', 'fail'].forEach(k => (c[k] || []).forEach((t, j) => { filt(`${w} ${k} ${j}`, t); text(`${w} ${k} ${j}`, t.text) }));
  if (!c.ok || !c.ok.length) bad(w, 'no ok text');
  for (let by = 1961; by <= 2010; by++) if (!c.ok.some(t => (!t.by || (by >= t.by[0] && by <= t.by[1])) && !t.pjob)) bad(w, 'no fallback ok text for by=' + by);
  if (c.block) { filt(w + ' block', c.block); text(w + ' block', c.block.text) }
});
['ok', 'fail'].forEach(k => { cl.transfer[k].forEach((t, j) => text(`transfer ${k} ${j}`, t)); cl.retake[k].forEach((t, j) => text(`retake ${k} ${j}`, t)) });
Object.values(cl.regret).filter(Boolean).forEach((t, j) => text('regret ' + j, t));

// newyear
K.newyear.forEach(n => { const w = 'newyear ' + n.id; uid(w, n.id); filt(w, n); text(w, n.text) });

// ctx
Object.entries(K.ctx).forEach(([ev, arr]) => {
  if (!LABELS[ev]) bad('ctx', 'unknown event ' + ev);
  arr.forEach((c, j) => { const w = `ctx ${ev} ${j}`; filt(w, c); text(w, c.text + '。'); c.norm.forEach(n => { if (!LABELS[ev].includes(n)) bad(w, 'norm is not a choice label: ' + n) }) });
});

// echo
K.echo.forEach(e => {
  const w = 'echo ' + e.id; uid(w, e.id); filt(w, e); text(w, e.text);
  if (!['listen', 'own', 'mid', 'any'].includes(e.kin)) bad(w, 'bad kin');
  if (e.major && !MAJORS.has(e.major)) bad(w, 'unknown major ' + e.major);
  if (e.like && !K.likes.some(l => l.id === e.like)) bad(w, 'unknown like ' + e.like);
  if (!TONES.has(e.tone)) bad(w, 'bad tone');
});

// Labels in LABELS must still exist in index.html, so ctx norms keep working.
const html = fs.readFileSync(path.join(__dirname, '..', 'index.html'), 'utf8');
Object.values(LABELS).flat().forEach(l => { if (!html.includes(`label:'${l}'`) && !html.includes(`'${l}'`)) bad('index.html', 'label not found: ' + l) });

if (errs.length) { console.log(errs.join('\n')); console.log(`\n${errs.length} problem(s)`); process.exit(1) }
console.log(`kin_advice.json OK: ${K.cohorts.reduce((a, c) => a + c.advice.length, 0)} advice, ${K.likes.length} likes, ${K.newyear.length} new-year lines, ${K.echo.length} echoes`);
