// Checks content/funny.json, near_death.json, death_causes.json and danger.json
// against the rules in content/FORMAT.md. Run: node tests/fun_content.js
const fs = require('fs'), path = require('path');
const C = f => JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'content', f), 'utf8'));
const funny = C('funny.json').events, near = C('near_death.json').events, dc = C('death_causes.json'), danger = C('danger.json').events;
const COUNTIES = new Set(['南投縣','台中市','台中縣','台北市','台北縣','台南市','台南縣','台東縣','嘉義市','嘉義縣','基隆市','宜蘭縣','屏東縣','彰化縣','新竹市','新竹縣','桃園縣','澎湖縣','花蓮縣','苗栗縣','金門縣','雲林縣','高雄市','高雄縣']);
const REGIONS = new Set(['北','中','南','東','離島']), ETH = new Set(['閩南','客家','外省','原住民','新住民子女']);
const NEED = new Set(['working','student','kids','married','parentsAlive','rural','urban']);
const JOBS = new Set(['農','工廠','營造','服務','公教','公司','科技','自營','台幹','醫護','家管','退休','失業']);
const AXES = new Set(['risk','rebel','self','open','eng']), TONES = new Set(['good','bad','neutral','tense']), CATS = new Set(['家庭','健康','生活','人生']);
const CAUSES = new Set(['肺炎','腸胃炎','早產與先天疾病','意外','溺水','交通事故','血癌','疾病','機車事故','自殺','癌症','職業災害','肝病與肝癌','心臟病','腦中風','糖尿病','口腔癌','失智與衰老','衰老','船難','礦坑災變','塵肺症']);
const DANGER_WORDS = new Set(['很危險','有點危險','傷身體','可能賠很多']);
let errs = [];
const bad = (where, msg) => errs.push(`${where}: ${msg}`);
function text(where, t) {
  if (typeof t !== 'string' || !t.trim()) return bad(where, 'empty text');
  const outside = t.replace(/「[^」]*」/g, '');
  if (/所以|因此/.test(outside)) bad(where, 'uses 所以/因此');
  if (/你/.test(outside)) bad(where, 'uses 你 outside quotes (write in 我)');
  if (!/[。！？」]$/.test(t)) bad(where, 'does not end with punctuation');
  if (/undefined|\{(?!n\}|p\}|spot\}|nm\}|food\}|temple\}|elders\})/.test(t)) bad(where, 'unknown placeholder');
}
function filters(where, e) {
  if (e.y) { if (e.y.length !== 2 || e.y[0] > e.y[1] || e.y[0] < 1961 || e.y[1] > 2110) bad(where, 'bad y ' + e.y) }
  if (e.minAge != null && e.maxAge != null && e.minAge > e.maxAge) bad(where, 'minAge > maxAge');
  (e.months || []).forEach(m => { if (m < 1 || m > 12) bad(where, 'bad month ' + m) });
  (e.county || []).forEach(c => { if (!COUNTIES.has(c)) bad(where, 'unknown county ' + c) });
  Object.keys(e.countyWeight || {}).forEach(c => { if (!COUNTIES.has(c)) bad(where, 'unknown county ' + c) });
  if (e.region && !REGIONS.has(e.region)) bad(where, 'unknown region ' + e.region);
  if (e.eth && !ETH.has(e.eth)) bad(where, 'unknown eth ' + e.eth);
  if (e.sex && !['M', 'F'].includes(e.sex)) bad(where, 'bad sex');
  (e.need || []).forEach(n => { if (!NEED.has(n)) bad(where, 'unknown need ' + n) });
  (e.job || []).forEach(j => { if (!JOBS.has(j)) bad(where, 'unknown job ' + j) });
}
function habit(where, h) {
  if (!h) return;
  ['k', 'say', 'does', 'why'].forEach(k => { if (!h[k]) bad(where, 'habit missing ' + k) });
  if (h.why && !h.why.startsWith('，')) bad(where, 'habit.why must start with ，');
  if (h.does && /^你/.test(h.does)) bad(where, 'habit.does must not start with 你 (engine adds it)');
}
const ids = new Set();
const uniq = (where, id) => { if (!id) bad(where, 'missing id'); else if (ids.has(where.split('/')[0] + id)) bad(where, 'duplicate id'); ids.add(where.split('/')[0] + id) };

funny.forEach(e => { const w = 'funny/' + e.id; uniq('funny/', e.id); filters(w, e); text(w, e.text);
  if (!CATS.has(e.cat)) bad(w, 'bad cat'); if (!TONES.has(e.tone)) bad(w, 'bad tone'); habit(w, e.habit) });
const nearIds = new Set(near.map(e => e.id));
near.forEach(e => { const w = 'near/' + e.id; uniq('near/', e.id); filters(w, e); text(w, e.text);
  if (!(e.health < 0)) bad(w, 'health must be negative'); habit(w, e.habit);
  if (e.scar && !(e.scar.phrase && e.scar.yrs > 0 && e.scar.w > 0 && e.scar.w <= 1)) bad(w, 'bad scar') });
const flavor = dc.flavor;
Object.entries(flavor).forEach(([cause, L]) => { if (!CAUSES.has(cause)) bad('death/' + cause, 'unknown cause');
  if (cause === '自殺') bad('death/自殺', 'suicide must keep the serious engine line');
  const seen = new Set(); L.forEach(e => { const w = `death/${cause}/${e.id}`; if (seen.has(e.id)) bad(w, 'duplicate id'); seen.add(e.id); filters(w, e); text(w, e.text) }) });
dc.addWeights.forEach((a, i) => { if (!CAUSES.has(a.cause) || !(a.weight > 0)) bad('death/addWeights/' + i, 'bad entry') });

const ref = (w, r) => { const [f, id] = r.split('/'); if (f !== 'near_death' || !nearIds.has(id)) bad(w, 'bad ref ' + r) };
danger.forEach(e => { const w = 'danger/' + e.id; uniq('danger/', e.id); filters(w, e); text(w, e.text);
  if (!(e.p > 0 && e.p < 0.05)) bad(w, 'p must be a small monthly chance');
  if (!e.choices || e.choices.length < 2) bad(w, 'needs 2+ choices');
  const labels = new Set(); let risky = 0;
  e.choices.forEach(c => { const cw = w + '/' + c.label; if (labels.has(c.label)) bad(cw, 'duplicate label'); labels.add(c.label);
    text(cw + '/go', c.go); Object.keys(c.lean || {}).forEach(a => { if (!AXES.has(a)) bad(cw, 'bad lean axis ' + a) });
    if (c.danger && !DANGER_WORDS.has(c.danger)) bad(cw, 'danger tag must be one of ' + [...DANGER_WORDS]);
    if (c.job && c.job.code && !JOBS.has(c.job.code) && !c.job.fallback) bad(cw, 'new job code needs a fallback');
    const r = c.risk; if (!r) return; risky++;
    if (r.cause && !CAUSES.has(r.cause)) bad(cw, 'unknown cause ' + r.cause);
    const d = r.death, dz = Array.isArray(d) ? d.map(x => x[2]) : [d];
    dz.forEach(x => { if (!(x >= 0 && x <= 0.1)) bad(cw, 'death out of range') });
    if (dz.some(x => x > 0) && !r.cause) bad(cw, 'death>0 needs a cause');
    if (!(r.injury >= 0 && r.injury <= 0.5)) bad(cw, 'injury out of range');
    if (!r.once && !r.years && !r.untilY) bad(cw, 'needs once, years or untilY');
    if (dz.some(x => x > 0) && !(r.deaths && r.deaths.length) && !r.deathFlavor) bad(cw, 'death>0 needs deaths[] or deathFlavor');
    if (r.injury > 0 && !(r.near && r.near.length)) bad(cw, 'injury>0 needs near[]');
    (r.deaths || []).forEach((t, i) => text(cw + '/deaths/' + i, t));
    (r.during || []).forEach((t, i) => text(cw + '/during/' + i, t));
    (r.near || []).forEach((n, i) => { if (n.ref) return ref(cw, n.ref); text(cw + '/near/' + i, n.text); if (!(n.health < 0)) bad(cw, 'near health must be negative'); habit(cw + '/near/' + i, n.habit) });
    if (r.deathFlavor) { const [cz, id] = r.deathFlavor.split('/'); if (!(flavor[cz] || []).some(x => x.id === id)) bad(cw, 'bad deathFlavor ' + r.deathFlavor) }
    if (r.end) text(cw + '/end', r.end.text); if (r.safe) text(cw + '/safe', r.safe); habit(cw, r.habit);
    if (r.late) { if (!CAUSES.has(r.late.cause) || !(r.late.mult > 1)) bad(cw, 'bad late'); if (r.late.text) text(cw + '/late', r.late.text); if (r.late.reveal) text(cw + '/reveal', r.late.reveal.text) } });
  if (!risky) bad(w, 'no risky option');
  if (!e.choices.some(c => !c.risk)) bad(w, 'needs a safe option') });

const n = { funny: funny.length, near: near.length, deathScenes: Object.values(flavor).reduce((a, L) => a + L.length, 0), danger: danger.length };
console.log(JSON.stringify(n));
if (errs.length) { console.log(errs.join('\n')); process.exit(1) }
console.log('ok');
