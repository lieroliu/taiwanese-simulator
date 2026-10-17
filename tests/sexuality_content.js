// Checks content/sexuality.json against content/FORMAT.md, checks how it fits romance.json,
// partners.json and affair.json for same-sex couples, then runs a small reference model of the
// hook spec over many lives and asserts the logic rules (no same-sex marriage before 2019-05-24,
// no pregnancy inside a same-sex couple outside the 人工生殖 path, coming-out state never goes
// backwards, no blind dates from a family that knows, …). Run: node tests/sexuality_content.js [lives]
const fs = require('fs'), path = require('path');
const C = f => JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'content', f), 'utf8'));
const S = C('sexuality.json'), RM = C('romance.json'), PT = C('partners.json'), AF = C('affair.json');
const errs = [], bad = (w, m) => errs.push(`${w}: ${m}`);

// ---------- 1. format ----------
const KEYS = new Set(['id', 'text', 'y', 'by', 'months', 'minAge', 'maxAge', 'sex', 'urban', 'region', 'fam', 'need', 'job',
  'hasPt', 'know', 'trait', 'band', 'hidden', 'w', 'carry', 'regOK', 'after', 'before']);
const NEED = new Set(['working', 'student', 'kids', 'married', 'parentsAlive']);
const KNOW = ['none', 'accept', 'silent', 'deny', 'reject'];
const EXPLICIT = /(上床|做愛|性行為|親熱|裸|胸部|激情|開房間|下體)/;
const PH = /\{(?!(?:n|p|same|opp|spot|nm|food|temple|elders)\})/;
function text(w, t) {
  if (typeof t !== 'string' || !t.trim()) return bad(w, 'empty text');
  const out = t.replace(/「[^」]*」/g, '');
  if (/所以|因此/.test(out)) bad(w, 'uses 所以/因此');
  if (/你/.test(out)) bad(w, 'uses 你 outside quotes (write in 我)');
  if (!/[。！？」]$/.test(t)) bad(w, 'does not end with punctuation');
  if (/undefined/.test(t) || PH.test(t)) bad(w, 'unknown placeholder');
  if (EXPLICIT.test(t)) bad(w, 'explicit wording');
}
function filt(w, e, extra) {
  Object.keys(e).forEach(k => { if (!KEYS.has(k) && !(extra || []).includes(k)) bad(w, 'unknown key ' + k) });
  if (e.y && (e.y.length !== 2 || e.y[0] > e.y[1] || e.y[0] < 1961 || e.y[1] > 2110)) bad(w, 'bad y');
  if (e.minAge != null && e.maxAge != null && e.minAge > e.maxAge) bad(w, 'minAge > maxAge');
  if (e.sex && !['M', 'F'].includes(e.sex)) bad(w, 'bad sex');
  (e.need || []).forEach(n => { if (!NEED.has(n)) bad(w, 'unknown need ' + n) });
  (e.know || []).forEach(k => { if (!KNOW.includes(k)) bad(w, 'unknown know ' + k) });
  if (e.months && e.months.some(m => m < 1 || m > 12)) bad(w, 'bad month');
  if (e.trait && !/^(risk|rebel|self|open|eng)[+-]$/.test(e.trait)) bad(w, 'bad trait');
}
// a line that names the partner must say it needs one, except in pools where a partner exists by construction
const PTPOOL = /^(couple|kids|realize\/lateMarried|pass\/marry|pass\/spouseTold|pass\/formal)/;
function line(w, e, extra) {
  filt(w, e, extra); text(w, e.text);
  if (/\{[np]\}/.test(e.text) && !e.hasPt && !PTPOOL.test(w)) bad(w, 'names the partner without hasPt');
}
const pool = (w, a, extra) => { if (!Array.isArray(a) || !a.length) return bad(w, 'empty pool'); a.forEach((e, i) => line(`${w}/${e.id || i}`, e, extra)) };
const sumW = o => Object.values(o).reduce((a, b) => a + b, 0);
const rowAt = (rows, y) => rows.find(r => y >= r.y[0] && y <= r.y[1]);
function eraRows(w, rows, keys) {
  for (let y = 1961; y <= 2040; y++) { const r = rowAt(rows, y); if (!r) { bad(w, 'no row for ' + y); break } }
  rows.forEach((r, i) => { if (i && r.y[0] <= rows[i - 1].y[1]) bad(w, 'rows overlap');
    Object.keys(r.w).forEach(k => { if (!keys.includes(k)) bad(w, 'unknown outcome ' + k) });
    keys.forEach(k => { if (!(k in r.w)) bad(w, `row ${r.y} lacks ${k}`) }) });
}

const O = S.orient;
if (!(O.gay > 0 && O.gay < .08 && O.bi > 0 && O.bi < .08)) bad('orient', 'rates out of range');
if (!/依調查估算/.test(O.src)) bad('orient', 'source must be labeled 依調查估算');

const RZ = S.realize, BANDS = Object.keys(RZ.bands);
RZ.cohorts.forEach((c, i) => { BANDS.forEach(b => { if (!(c.w[b] >= 0)) bad('realize/cohorts/' + i, 'missing ' + b) }) });
for (let by = 1961; by <= 2010; by++) if (!RZ.cohorts.some(c => by >= c.by[0] && by <= c.by[1])) bad('realize/cohorts', 'no cohort for ' + by);
pool('realize/lines', RZ.lines);
RZ.lines.forEach((e, i) => { if (!BANDS.includes(e.band)) bad('realize/lines/' + i, 'bad band') });
const LM = RZ.lateMarried; LM.text.forEach((e, i) => line('realize/lateMarried/text' + i, e));
LM.choices.forEach(c => { if (!['stay', 'tell', 'leave'].includes(c.then)) bad('lateMarried/' + c.label, 'bad then');
  c.go.forEach((g, i) => line(`realize/lateMarried/${c.label}/${i}`, g)); if (c.hard) text('lateMarried/hard', c.hard.failText);
  if (Object.keys(c.go[c.go.length - 1]).some(k => k !== 'text')) bad('lateMarried/' + c.label, 'last go must be unfiltered') });

const CO = S.comeout; CO.text.forEach((e, i) => line('comeout/text' + i, e)); text('comeout/ask', CO.ask);
CO.normText.forEach((n, i) => { text('comeout/norm' + i, n.text + '。'); if (!CO.choices.some(c => c.label === n.norm)) bad('comeout/norm' + i, 'names no option') });
const TARGETS = ['friends', 'family', 'work', 'pass'];
CO.choices.forEach(c => { if (!TARGETS.includes(c.target)) bad('comeout/' + c.label, 'bad target') });
TARGETS.forEach(t => { if (!CO.choices.some(c => c.target === t)) bad('comeout', 'no option for ' + t) });
if (!CO.choices.find(c => c.target === 'family').if.need.includes('parentsAlive')) bad('comeout/family', 'must need parentsAlive');
if (!CO.choices.find(c => c.target === 'work').if.need.includes('working')) bad('comeout/work', 'must need working');
const passGo = CO.choices.find(c => c.target === 'pass').go; pool('comeout/pass', passGo);
if (Object.keys(passGo[passGo.length - 1]).some(k => k !== 'text')) bad('comeout/pass', 'last go must be unfiltered');

const RF = S.react.family, FS = ['accept', 'silent', 'deny', 'reject'];
eraRows('react/family/base', RF.base, FS);
FS.forEach(k => pool('react/family/' + k, RF.lines[k]));
Object.entries(RF.terms).forEach(([t, o]) => Object.keys(o).forEach(k => { if (!FS.includes(k)) bad('react/family/terms/' + t, 'unknown state ' + k) }));
// acceptance must rise over the decades, rejection must fall
for (let i = 1; i < RF.base.length; i++) { const a = RF.base[i - 1].w, b = RF.base[i].w;
  if (b.accept / sumW(b) < a.accept / sumW(a)) bad('react/family/base', 'acceptance falls at ' + RF.base[i].y[0]);
  if (b.reject / sumW(b) > a.reject / sumW(a)) bad('react/family/base', 'rejection rises at ' + RF.base[i].y[0]) }
if (!/02-2392-1970/.test(RF.help.text) || !/1925/.test(RF.help.text)) bad('react/family/help', 'help line must list the hotlines');
const SOFT = ['reject-silent', 'deny-silent', 'deny-accept', 'silent-accept'];
Object.keys(S.react.soften.lines).forEach(k => { if (!SOFT.includes(k)) bad('soften', 'transition not allowed ' + k); pool('react/soften/' + k, S.react.soften.lines[k]) });
eraRows('react/friends', S.react.friends.w, ['ok', 'drift', 'spread']);
['ok', 'drift', 'spread'].forEach(k => pool('react/friends/' + k, S.react.friends.lines[k]));
eraRows('react/work', S.react.work.w, ['ok', 'gossip', 'sidelined', 'fired']);
['ok', 'gossip', 'sidelined', 'fired'].forEach(k => pool('react/work/' + k, S.react.work.lines[k]));
pool('react/outed', S.react.outed.lines);

const PS = S.pass; pool('pass/lines', PS.lines); pool('pass/newyear', PS.newyear); pool('pass/blind/deny', PS.blind.deny);
PS.newyear.forEach((e, i) => { if (!e.know) bad('pass/newyear/' + i, 'needs know'); if (e.know.includes('accept') && /有沒有對象|結婚/.test(e.text.replace(/「[^」]*」/g, '')) && !e.hasPt) bad('pass/newyear/' + i, 'accepting family still pressing marriage') });
PS.marry.text.forEach((e, i) => line('pass/marry/text' + i, e));
PS.marry.choices.forEach(c => c.go.forEach((g, i) => line(`pass/marry/${c.label}/${i}`, g)));
pool('pass/marry/formal', PS.marry.formal); pool('pass/marry/end', PS.marry.end);
PS.marry.formal.forEach(e => { if (!e.y || e.y[0] < 2000) bad('pass/marry/formal', '形婚 lines belong to 2000+') });
eraRows('pass/spouseTold', PS.spouseTold.w, ['stay', 'split']);
['found', 'stay', 'split'].forEach(k => pool('pass/spouseTold/' + k, PS.spouseTold[k]));
pool('pass/formalLines', PS.formalLines);

const CP = S.couple;
['meet', 'date', 'family', 'ready', 'breakup'].forEach(k => pool('couple/' + k, CP[k]));
CP.family.forEach((e, i) => { if (/室友|是.{0,3}的朋友/.test(e.text) && /說|介紹/.test(e.text) && (!e.know || e.know.includes('accept')) && !/\{n\}帶我/.test(e.text)) bad('couple/family/' + i, 'introduced as a friend to a family that accepts') });
CP.ready.forEach((e, i) => { if (/伴侶註記/.test(e.text) && !(e.regOK && e.y && e.y[0] >= 2015 && e.y[1] <= 2019)) bad('couple/ready/' + i, '伴侶註記 only 2015–2019 with regOK') });
CP.cohab.text.forEach((e, i) => line('couple/cohab/text' + i, e));
CP.cohab.choices.forEach(c => c.go.forEach((g, i) => line(`couple/cohab/${c.label}/${i}`, g)));
pool('couple/cohab/lifeLines', CP.cohab.lifeLines);
pool('couple/marry/lines', CP.marry.lines); pool('couple/marry/after', CP.marry.after);
// anything that says 登記 / 結婚 / 配偶 for the couple must be dated 2019+
const MARRY_WORD = /登記|結婚|喜宴|同意書遞給我/;
const allLines = [];
JSON.stringify(S, function (k, v) { if (v && typeof v === 'object' && typeof v.text === 'string') allLines.push({ e: v, at: k }); return v });
[...CP.date, ...CP.ready, ...CP.cohab.lifeLines, ...CP.marry.lines, ...CP.marry.after].forEach(e => {
  if (MARRY_WORD.test(e.text) && !/伴侶註記|簽了名|說是/.test(e.text) && !(e.y && e.y[0] >= 2019)) bad('couple', 'marriage wording before 2019: ' + e.text.slice(0, 20)) });
CP.marry.lines.concat(CP.marry.after).forEach((e, i) => { if (!(e.after && e.after[0] * 12 + e.after[1] >= 2019 * 12 + 5) && !(e.months && e.y[0] === 2019 && e.y[1] === 2019 && e.months.every(m => m === 5))) bad('couple/marry/' + i, 'needs after:[2019,5]') });
if (CP.marry.from.join('-') !== '2019-5-24' || S.law.marriage.join('-') !== '2019-5-24') bad('law/marriage', 'must be 2019-05-24');
if (S.law.transnational.join('-') !== '2023-1-19') bad('law/transnational', 'must be 2023-01-19');
if (S.law.jointAdopt[0] * 12 + S.law.jointAdopt[1] < 2023 * 12 + 5) bad('law/jointAdopt', 'joint adoption only from 2023-05');
if (S.law.selfAffairFrom[0] * 12 + S.law.selfAffairFrom[1] < 2020 * 12 + 6) bad('law/selfAffairFrom', 'must be 2020-06 or later');
if (AF.onset.self.from.join('-') !== S.law.selfAffairFrom.join('-')) bad('law/selfAffairFrom', 'must match affair.json onset.self.from');

const K = S.kids; K.text.forEach((e, i) => line('kids/text' + i, e));
K.choices.forEach(c => { const w = 'kids/' + c.id;
  ['ok', 'fail'].forEach(r => (c.go[r] || []).forEach((g, i) => line(`${w}/${r}${i}`, g)));
  const all = [...(c.go.ok || []), ...(c.go.fail || [])].map(g => g.text).join('');
  if (/驗孕|懷孕|兩條線/.test(all) && c.id !== 'art') bad(w, 'pregnancy outside the 人工生殖 path');
  if (c.id === 'art' && c.if.coupleSex !== 'F') bad(w, '人工生殖 path is for female couples');
  if (c.id === 'surrogacy' && c.if.coupleSex !== 'M') bad(w, '代理孕母 path is for male couples');
  if (c.id === 'adopt') c.go.ok.forEach(g => { if (/一起收養|兩個人的名字/.test(g.text) && !(g.y && g.y[0] >= 2023)) bad(w, 'joint adoption before 2023') });
});
K.birth.forEach((e, i) => { line('kids/birth' + i, e); if (!['me', 'pt', 'surrogate'].includes(e.carry)) bad('kids/birth' + i, 'bad carry') });
['me', 'pt', 'surrogate'].forEach(c => { if (!K.birth.some(e => e.carry === c)) bad('kids/birth', 'no line for ' + c) });

pool('ambient', S.ambient.lines);
const aid = new Set(); S.ambient.lines.forEach(e => { if (!e.id) bad('ambient', 'missing id'); if (aid.has(e.id)) bad('ambient', 'duplicate id ' + e.id); aid.add(e.id);
  if (/凱道|立法院外面|人群裡/.test(e.text) && /我(去了|站在)/.test(e.text) && !e.trait) bad('ambient/' + e.id, 'joining a rally must be gated by trait') });
S.habits.forEach(h => { const w = 'habit/' + h.k; ['k', 'say', 'does', 'why', 'when'].forEach(k => { if (!h[k]) bad(w, 'missing ' + k) });
  if (h.why && !h.why.startsWith('，')) bad(w, 'why must start with ，'); if (/^你/.test(h.does || '')) bad(w, 'does must not start with 你') });
S.regrets.forEach(r => { const w = 'regret/' + r.k; text(w, r.txt); if (!r.why || /所以|因此/.test(r.why)) bad(w, 'bad why'); if (!(r.w > 0 && r.w < 5)) bad(w, 'bad weight') });
const hetero = new RegExp(S.crossCheck.heteroOnly), term = { F: new RegExp(S.crossCheck.spouseTerm.F), M: new RegExp(S.crossCheck.spouseTerm.M) };

// no exact duplicate lines
const seen = new Set(); allLines.forEach(({ e }) => { if (seen.has(e.text)) bad('dup', e.text.slice(0, 20)); seen.add(e.text) });

// coverage: every pool the engine must draw from has a line for every year
function cover(w, a, ctxs) { ctxs.forEach(c => { if (!a.some(e => match(e, c))) bad(w, 'no line for ' + JSON.stringify(c)) }) }
const yearsCtx = (extra) => { const out = []; for (let y = 1961; y <= 2040; y++) out.push(Object.assign({ y, m: 6, age: 30, sex: 'M', know: 'none', hasPt: false }, extra)); return out };
FS.forEach(k => { cover('react/family/' + k, RF.lines[k], yearsCtx({ need: [] })); cover('react/family/' + k, RF.lines[k], yearsCtx({ need: [], sex: 'F' })) });
['ok', 'drift', 'spread'].forEach(k => cover('react/friends/' + k, S.react.friends.lines[k], yearsCtx({ need: [] })));
['ok', 'gossip', 'sidelined'].forEach(k => cover('react/work/' + k, S.react.work.lines[k], yearsCtx({ need: ['working'], job: '公司' })));
cover('react/work/fired', S.react.work.lines.fired, yearsCtx({ need: ['working'], job: '公司' }));
cover('react/outed', S.react.outed.lines, yearsCtx({ need: [] }));
['M', 'F'].forEach(sex => BANDS.forEach(b => { const [lo, hi] = RZ.bands[b];
  for (let by = 1961; by <= 2010; by++) for (const age of [lo, hi]) { const y = by + age; if (y > 2040) continue;
    if (!RZ.lines.some(e => e.band === b && match(e, { y, m: 6, age, sex, by, need: b === 'late' || b === 'young' ? [] : ['student'], know: 'none', hasPt: false }))) bad('realize/' + b, `no line for ${sex} born ${by} at ${age}`) } }));

// ---------- 2. fit with romance / partners / affair for same-sex couples ----------
const usable = (t, ptSex) => !hetero.test(t) && !term[ptSex === 'M' ? 'F' : 'M'].test(t);
const report = [];
function crossPool(name, arr, need) {
  const texts = (arr || []).map(e => typeof e === 'string' ? e : e.text).filter(Boolean);
  const okM = texts.filter(t => usable(t, 'M')).length, okF = texts.filter(t => usable(t, 'F')).length;
  report.push(`${name}: ${texts.length} lines, same-sex usable ${okM} (M) / ${okF} (F)`);
  if (need && (okM < need || okF < need)) bad('crossCheck/' + name, `fewer than ${need} usable lines for a same-sex couple, and sexuality.json has no replacement`);
}
['date', 'habit', 'fight', 'makeup', 'breakup'].forEach(k => crossPool('romance.' + k, RM[k], CP[k] ? 0 : 2));
['family', 'ready', 'meet', 'blind', 'together', 'remarry'].forEach(k => crossPool('romance.' + k, RM[k], 0));
crossPool('partners.fights', PT.fights.pool, 2); crossPool('partners.family', PT.family.pool, 0);
crossPool('partners.describe.impress', Object.values(PT.describe.impress || {}).flat(), 0);
crossPool('affair.signs', AF.signs, 2); crossPool('affair.found(spouse)', AF.found.filter(e => e.who === 'spouse' && !(e.sex && e.spSex && e.sex !== e.spSex)), 1);
AF.respond.choices.forEach(c => { const last = c.go[c.go.length - 1].text; [['M', 'M'], ['F', 'F']].forEach(([a]) => { if (!usable(last, a)) bad('crossCheck/affair.respond/' + c.label, 'unfiltered go line unusable for a same-sex couple') }) });
// the romance/partners blind-date channels must be recognisable so the engine can gate them
const blindCh = PT.channels.list.filter(c => c.blind).map(c => c.id);
if (!blindCh.length) bad('crossCheck', 'partners.json has no blind:true channel to gate');
// romance 'ready' entries with commit:true are marriage openers; for same-sex couples before 2019 they must be skipped
const commit = (RM.ready || []).filter(e => e.commit);
report.push(`romance.ready commit:true (skip for same-sex before 2019-05-24, and 懷孕 ones always): ${commit.length}`);

// ---------- 3. reference model of the hook spec ----------
let seed = 12345; const R = () => { seed = (seed + 0x6D2B79F5) | 0; let t = Math.imul(seed ^ (seed >>> 15), 1 | seed); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296 }; // mulberry32
const chance = p => R() < p, clamp = (x, a = 0, b = 100) => Math.max(a, Math.min(b, x));
const pickW = (o) => { let t = 0; for (const k in o) t += o[k]; let r = R() * t; for (const k in o) { r -= o[k]; if (r <= 0) return k } return Object.keys(o)[0] };
function match(e, c) {
  if (e.y && !(c.y >= e.y[0] && c.y <= e.y[1])) return false;
  if (e.by && !(c.by >= e.by[0] && c.by <= e.by[1])) return false;
  if (e.months && !e.months.includes(c.m)) return false;
  if (e.minAge != null && c.age < e.minAge) return false;
  if (e.maxAge != null && c.age > e.maxAge) return false;
  if (e.sex && e.sex !== c.sex) return false;
  if (e.urban != null && e.urban !== !!c.urban) return false;
  if (e.region && e.region !== c.region) return false;
  if (e.fam && !e.fam.includes(c.fam)) return false;
  if (e.need && !e.need.every(n => (c.need || []).includes(n))) return false;
  if (e.job && !e.job.includes(c.job)) return false;
  if (e.hasPt && !c.hasPt) return false;
  if (e.know && !e.know.includes(c.know)) return false;
  if (e.trait) { const v = c.ax ? c.ax[e.trait.slice(0, -1)] : 50; if (e.trait.endsWith('+') ? v < 60 : v > 40) return false }
  if (e.after && c.y * 12 + c.m < e.after[0] * 12 + e.after[1]) return false;
  if (e.before && c.y * 12 + c.m >= e.before[0] * 12 + e.before[1]) return false;
  if (e.regOK && !c.regOK) return false;
  if (e.carry && e.carry !== c.carry) return false;
  return true;
}
const pickLine = (w, arr, c) => { const ok = arr.filter(e => match(e, c)); if (!ok.length) { bad('model/' + w, 'empty pick ' + JSON.stringify({ y: c.y, age: c.age, sex: c.sex, know: c.know, hasPt: c.hasPt })); return '' } return ok[Math.floor(R() * ok.length)].text };
const ym = (y, m) => y * 12 + m - 1;
const L = S.law, MARRY_T = ym(L.marriage[0], L.marriage[1]), JOINT_T = ym(L.jointAdopt[0], L.jointAdopt[1]);
const regFrom = c => { const r = L.partnerReg[c] || L.partnerReg.default; return ym(r[0], r[1]) }, REG_UNTIL = ym(L.partnerReg.until[0], L.partnerReg.until[1]);
const COUNTIES = ['台北市', '高雄市', '台中市', '新北市', '台南市', '彰化縣', '花蓮縣', '屏東縣'];
const EDGES = new Set(['none>accept', 'none>silent', 'none>deny', 'none>reject', ...SOFT.map(s => s.replace('-', '>'))]);
const stats = { lives: 0, q: 0, realAge: {}, toldFam: {}, react: {}, sameMar: 0, cohab: 0, kids: {}, formal: 0, passMar: 0 };

function life() {
  const by = 1961 + Math.floor(R() * 50), sex = chance(.5) ? 'M' : 'F', county = COUNTIES[Math.floor(R() * COUNTIES.length)];
  const s = { by, sex, county, urban: /市$/.test(county), region: '北', fam: chance(.1) ? '單親' : '', famOpen: clamp(50 + 25 * (R() + R() - 1), 5, 95),
    parBy: by - 22 - Math.floor(R() * 10), parDie: by + 60 + Math.floor(R() * 35), money: 20 + R() * 70, ax: { risk: R() * 100, rebel: R() * 100, self: R() * 100, open: R() * 100, eng: 50 },
    orient: null, f: { told: {}, know: 'none' }, pt: null, married: false, spouse: null, kidsN: 0, log: [] };
  stats.lives++;
  const r = R(); s.orient = r < O.gay ? 'gay' : r < O.gay + O.bi ? 'bi' : null;
  if (!s.orient) return;
  stats.q++;
  const coh = RZ.cohorts.find(c => by >= c.by[0] && by <= c.by[1]), w = Object.assign({}, coh.w);
  if (s.orient === 'bi') { w.young *= 1.3; w.late *= 1.5 }
  const band = pickW(w), [lo, hi] = RZ.bands[band], rAge = lo + Math.floor(R() * (hi - lo + 1));
  s.realizeT = ym(by + rAge, 1 + Math.floor(R() * 12));
  const ck = Math.floor(by / 10) * 10; (stats.realAge[ck] = stats.realAge[ck] || []).push(rAge);
  const endT = Math.min(ym(2040, 12), ym(by + 80, 12));
  let nextOffer = 0, offers = 0, lastSoftY = 0;
  const setKnow = (to, t) => { const e = s.f.know + '>' + to; if (s.f.know === to) return; if (!EDGES.has(e)) bad('model/know', `illegal move ${e}`); s.f.know = to; s.log.push([t, 'know', to]) };
  for (let t = ym(by, 1); t <= endT; t++) {
    const y = Math.floor(t / 12), m = t % 12 + 1, age = y - by, parAlive = y < s.parDie;
    const working = age >= 22 && age < 65, student = age >= 6 && age < 22;
    const c = { y, m, age, sex, by, urban: s.urban, region: s.region, fam: s.fam, know: s.f.know, hasPt: !!(s.pt && s.pt.same), ax: s.ax,
      need: [working && 'working', student && 'student', s.kidsN && 'kids', s.married && 'married', parAlive && 'parentsAlive'].filter(Boolean), job: '公司' };
    if (t < s.realizeT) {
      // not yet realized: dates and may marry the opposite sex like anyone
      if (!s.married && age >= 24 && age <= 40 && chance(.006 * .6)) { s.married = true; s.spouse = { sex: sex === 'M' ? 'F' : 'M' }; s.log.push([t, 'marryOpp']) }
      continue;
    }
    if (t === s.realizeT) {
      if (band === 'late' && s.married && !s.spouse.same) {
        const ch = pickW({ stay: 40 + (100 - s.ax.risk) / 4, tell: 20 + s.ax.open / 4, leave: 15 + s.ax.self / 4 });
        if (ch === 'stay') { s.f.pass = 1; s.f.passMarry = 1 }
        else if (ch === 'tell') { if (pickW(rowAt(PS.spouseTold.w, y).w) === 'split') { s.married = false; s.spouse = null } else s.f.spouseKnows = 1 }
        else { s.married = false; s.spouse = null }
      } else pickLine('realize/' + band, RZ.lines.filter(e => e.band === band), Object.assign({}, c, { need: band === 'child' || band === 'teen' ? ['student'] : c.need }));
    }
    // coming-out offers
    const untold = ['friends', 'family', 'work'].filter(k => !s.f.told[k]);
    if (age >= 15 && t >= nextOffer && offers < 5 && untold.length) {
      offers++; nextOffer = t + 24 + Math.floor(R() * 25);
      const opts = CO.choices.filter(o => o.target === 'pass' || (!s.f.told[o.target] && age >= (o.if.minAge || 0) && (o.if.need || []).every(n => c.need.includes(n))));
      const era = rowAt(CO.auto.w, y).w, norm = rowAt(CO.normText, y).norm;
      const wts = {}; opts.forEach(o => { let v = 0; for (const k in o.lean) v += o.lean[k] * (s.ax[k] - 50) / 25; wts[o.target] = Math.exp(v) * era[o.target] * (o.label === norm ? 1.5 : 1) });
      const tg = pickW(wts);
      if (tg === 'pass') { s.f.pass = 1; pickLine('comeout/pass', passGo, c) }
      else {
        if (tg === 'family' && !parAlive) bad('model/comeout', 'family offered with parents gone');
        if (t < s.realizeT) bad('model/comeout', 'coming out before realizing');
        s.f.told[tg] = 1; s.log.push([t, 'told', tg]);
        if (tg === 'family') { familyReact(s, c, t, false); s.f.pass = 0 }
        if (tg === 'friends') pickLine('react/friends', S.react.friends.lines[pickW(rowAt(S.react.friends.w, y).w)], c);
        if (tg === 'work') { const ww = Object.assign({}, rowAt(S.react.work.w, y).w); if (t >= ym(...S.react.work.workProtect)) ww.fired *= .4;
          const o = pickW(ww); if (o === 'fired' && t >= ym(...S.react.work.workProtect) && !/申訴/.test(pickLine('react/work/fired', S.react.work.lines.fired, c))) bad('model/work', 'post-2007 firing without the 申訴 version');
          else if (o !== 'fired') pickLine('react/work/' + o, S.react.work.lines[o], c) }
      }
    }
    // outed
    if (!s.f.told.family && parAlive && age >= 13 && !s.f.outed && chance(c.hasPt ? .0012 : .0003)) { s.f.outed = 1; s.f.outedT = t; s.f.told.family = 1; pickLine('react/outed', S.react.outed.lines, c); familyReact(s, c, t, true) }
    // soften once a year
    if (m === 1 && parAlive && y !== lastSoftY && ['deny', 'silent', 'reject'].includes(s.f.know)) { lastSoftY = y;
      const p = S.react.soften.p.find(r => y >= r.y[0] && y <= r.y[1]).p * (s.pt && s.pt.same && t - s.pt.since >= 36 ? 1.5 : 1);
      if (chance(p)) { const to = s.f.know === 'reject' ? 'silent' : s.f.know === 'deny' ? (c.hasPt && chance(.3) ? 'accept' : 'silent') : 'accept';
        const key = s.f.know + '-' + to; if (S.react.soften.lines[key]) { const ok = S.react.soften.lines[key].filter(e => match(e, c)); if (ok.length) setKnow(to, t) } } }
    // blind dates
    if (!s.married && !s.pt && age >= 23 && age <= 40 && y < 2000 && chance(.004)) {
      if (['accept', 'silent', 'reject'].includes(s.f.know)) { /* gated: never offered */ }
      else { s.log.push([t, 'blind', s.f.know]); if (s.f.know === 'deny') pickLine('pass/blind/deny', PS.blind.deny, c);
        if (chance(.3)) { s.pt = { same: false, since: t, sex: sex === 'M' ? 'F' : 'M' }; s.f.relPass = 1 } } }
    // meeting someone
    if (!s.married && !s.pt && age >= 18 && age <= 50 && chance(.01)) {
      const same = s.orient === 'gay' ? true : chance(O.biSame.p * (s.f.pass ? .5 : 1));
      s.pt = { same, since: t, sex: same ? sex : (sex === 'M' ? 'F' : 'M'), foreign: chance(.03) };
      if (same) pickLine('couple/meet', CP.meet, Object.assign({}, c, { hasPt: true }));
    }
    // relationship progress
    if (s.pt && !s.married && t - s.pt.since >= 30 && chance(.03)) {
      if (s.pt.same) {
        if (t >= MARRY_T && (!s.pt.foreign || t >= ym(2023, 1))) { s.married = true; s.spouse = s.pt; s.log.push([t, 'marrySame', s.pt.foreign]); stats.sameMar++;
          if (y === 2019 && m === 5) { /* 登記 one-shot on the 24th: fine */ } }
        else if (!s.f.cohab) { s.f.cohab = 1; stats.cohab++; s.log.push([t, 'cohab']);
          if (t >= regFrom(county) && t < REG_UNTIL && chance(.3)) s.log.push([t, 'partnerReg', county]) }
      } else if (s.f.relPass || s.orient === 'gay') {
        const ch = pickW({ marry: 50 + (100 - s.ax.rebel) / 3, tell: 15 + s.ax.open / 4, end: 20 + s.ax.self / 4 });
        if (ch === 'marry') { s.married = true; s.spouse = s.pt; s.f.passMarry = 1; stats.passMar++; s.log.push([t, 'marryOpp']) }
        else if (ch === 'tell' && y >= 2000 && chance(.2)) { s.married = true; s.spouse = s.pt; s.f.formal = 1; stats.formal++; s.log.push([t, 'marryOpp']) }
        else s.pt = null;
      } else { s.married = true; s.spouse = s.pt; s.log.push([t, 'marryOpp']) }
    }
    // cohab couples get the 登記 one-shot
    if (s.f.cohab && !s.married && s.pt && t === MARRY_T + 1 && !s.pt.foreign) { s.married = true; s.spouse = s.pt; s.log.push([t, 'marrySame']); stats.sameMar++ }
    // children
    const couple = s.married ? s.spouse : s.f.cohab ? s.pt : null;
    if (couple && s.kidsN < 2 && age <= 45 && chance(.01)) {
      if (couple.same) {
        const opts = K.choices.filter(o => { const f = o.if || {}; return (!f.coupleSex || f.coupleSex === sex) && (!f.y || (y >= f.y[0] && y <= f.y[1])) && (!f.moneyAtLeast || s.money >= f.moneyAtLeast) });
        const o = opts[Math.floor(R() * opts.length)];
        if (o.id === 'art' && sex !== 'F') bad('model/kids', '人工生殖 offered to a male couple');
        if (o.id === 'surrogacy' && sex !== 'M') bad('model/kids', '代理孕母 offered to a female couple');
        const p = o.pAfter && t >= ym(...o.pAfter.y) ? o.pAfter.p : o.p;
        if (o.id !== 'none' && chance(p)) { s.kidsN++; s.log.push([t, 'kid', o.id]); (stats.kids[o.id] = (stats.kids[o.id] || 0) + 1);
          const txt = pickLine('kids/' + o.id, o.go.ok, c);
          if (o.id === 'adopt' && /一起收養/.test(txt) && t < JOINT_T) bad('model/kids', 'joint adoption before 2023-06');
          if (o.id === 'art') pickLine('kids/birth', K.birth, Object.assign({}, c, { carry: age <= 40 && chance(.5) ? 'me' : 'pt' }));
          if (o.id === 'surrogacy') pickLine('kids/birth', K.birth, Object.assign({}, c, { carry: 'surrogate' })) }
        if (o.id === 'none') s.kidsN = 9;
      } else { s.kidsN++; s.log.push([t, 'kid', 'bio', couple.same]) }
    }
    // a passing marriage may be found out
    if (s.married && s.f.passMarry && !s.f.formal && !s.f.spouseKnows && m === 6 && chance(.02)) {
      pickLine('pass/spouseTold/found', PS.spouseTold.found, c);
      const o = pickW(rowAt(PS.spouseTold.w, y).w); pickLine('pass/spouseTold/' + o, PS.spouseTold[o], c);
      if (o === 'split') { s.married = false; s.spouse = null; s.pt = null; s.f.passMarry = 0 } else s.f.spouseKnows = 1 }
  }
  // ---- invariants on the finished life ----
  const ck2 = Math.floor(by / 10) * 10; stats.toldFam[ck2] = stats.toldFam[ck2] || [0, 0]; stats.toldFam[ck2][1]++; if (s.log.some(x => x[1] === 'told' && x[2] === 'family' && x[0] < ym(by + 40, 1)) || (s.f.outed && s.f.outedT < ym(by + 40, 1))) stats.toldFam[ck2][0]++;
  s.log.forEach(([t, k, v, same]) => {
    if (k === 'marrySame' && t < MARRY_T) bad('model/marriage', `same-sex marriage in ${Math.floor(t / 12)}-${t % 12 + 1}`);
    if (k === 'marrySame' && v && t < ym(2023, 1)) bad('model/marriage', 'transnational same-sex marriage before 2023-01-19');
    if (k === 'partnerReg' && (t < regFrom(v) || t >= REG_UNTIL)) bad('model/partnerReg', `registration in ${v} at ${Math.floor(t / 12)}`);
    if (k === 'blind' && ['accept', 'silent', 'reject'].includes(v)) bad('model/blind', 'blind date from a family that knows: ' + v);
    if (k === 'kid' && v === 'bio' && same) bad('model/kids', 'biological child inside a same-sex couple');
  });
  const told = s.log.filter(x => x[1] === 'told').map(x => x[2]); if (new Set(told).size !== told.length) bad('model/told', 'told the same target twice (state went backwards)');
}
function familyReact(s, c, t, outed) {
  const base = Object.assign({}, rowAt(RF.base, c.y).w), T = RF.terms, x = {};
  FS.forEach(k => x[k] = 0);
  const add = (o, f) => { for (const k in o) x[k] += o[k] * f };
  add(T.famOpen, (s.famOpen - 50) / 10); if (s.urban) add(T.urban, 1); if (s.sex === 'M' && s.by <= 1985) add(T.sonDuty, 1);
  if (s.parBy < 1940) add(T.oldParents, 1); if (outed) add(T.outed, 1); if (c.hasPt) add(T.hasPt, 1);
  FS.forEach(k => base[k] *= Math.exp(x[k]));
  const st = pickW(base); const d = Math.floor(c.y / 10) * 10; stats.react[d] = stats.react[d] || { accept: 0, silent: 0, deny: 0, reject: 0 }; stats.react[d][st]++;
  if (s.f.know !== 'none') bad('model/know', 'family reacted twice');
  const e = 'none>' + st; if (!EDGES.has(e)) bad('model/know', 'illegal ' + e); s.f.know = st;
  const txt = pickLine('react/family/' + st, RF.lines[st], Object.assign({}, c, { know: st }));
  if (/\{[np]\}/.test(txt) && !c.hasPt) bad('model/react', 'partner placeholder without a partner');
}

const N = +process.argv[2] || 60000;
for (let i = 0; i < N; i++) life();
// share check: the gay+bi share lands near the configured rate
const share = stats.q / stats.lives; if (Math.abs(share - (O.gay + O.bi)) > .01) bad('model/orient', 'share ' + share.toFixed(3));
// later cohorts realize earlier and tell their families more often
const med = a => { const b = [...a].sort((x, y) => x - y); return b[Math.floor(b.length / 2)] };
const decs = Object.keys(stats.realAge).sort();
if (med(stats.realAge[decs[0]]) < med(stats.realAge[decs[decs.length - 1]])) bad('model/realize', 'later cohorts should realize no later than earlier ones');
const rd = Object.keys(stats.react).sort(), acc = d => { const r = stats.react[d], n = sumW(r); return r.accept / n };
if (rd.length > 2 && acc(rd[rd.length - 1]) <= acc(rd[0])) bad('model/react', 'acceptance did not rise');
const tf = d => stats.toldFam[d][0] / stats.toldFam[d][1];
if (!(tf('1960') < tf('1990'))) bad('model/told', 'later cohorts should tell their families more often');

console.log('Same-sex couple fit with existing content:'); report.forEach(r => console.log('  ' + r));
console.log(`\nModel: ${N} lives, ${stats.q} gay or bi (${(share * 100).toFixed(1)}%)`);
console.log('  median age of realizing, by birth decade: ' + decs.map(d => `${d}s ${med(stats.realAge[d])}`).join(', '));
console.log('  told family (or found out) by age 40, by birth decade: ' + Object.keys(stats.toldFam).sort().map(d => `${d}s ${(100 * stats.toldFam[d][0] / stats.toldFam[d][1]).toFixed(0)}%`).join(', '));
console.log('  family reaction by decade told (accept/silent/deny/reject %): ' + rd.map(d => { const r = stats.react[d], n = sumW(r); return `${d}s ${FS.map(k => Math.round(100 * r[k] / n)).join('/')}` }).join(', '));
console.log(`  same-sex marriages ${stats.sameMar}, living together ${stats.cohab}, passing marriages ${stats.passMar}, 形婚 ${stats.formal}, children ${JSON.stringify(stats.kids)}`);
if (errs.length) { console.log('\n' + [...new Set(errs)].join('\n')); console.log(`\n${new Set(errs).size} problem(s)`); process.exit(1) }
console.log('\nsexuality.json OK');
