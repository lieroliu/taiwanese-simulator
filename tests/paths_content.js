// Checks content/paths.json (life-path diary lines) against content/FORMAT.md. Run: node tests/paths_content.js
const fs = require('fs'), path = require('path');
const d = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'content', 'paths.json'), 'utf8'));
const PATHS = new Set(Object.keys(d._paths || {}));
const NEED = new Set(['working','student','kids','married','parentsAlive','rural','urban']);
const FX = new Set(['risk','rebel','self','open','lonely','health','money']);
const errs = [], bad = (w, m) => errs.push(`${w}: ${m}`), seen = new Set();
(d.events || []).forEach((e, i) => {
  const w = `events[${i}]`, t = e.text;
  if (!PATHS.has(e.path)) bad(w, 'unknown path ' + e.path);
  if (typeof t !== 'string' || !t.trim()) return bad(w, 'empty text');
  if (seen.has(t)) bad(w, 'duplicate text'); seen.add(t);
  const outside = t.replace(/「[^」]*」/g, '');
  if (/所以|因此/.test(outside)) bad(w, 'uses 所以/因此');
  if (/你/.test(outside)) bad(w, 'uses 你 outside quotes (write in 我)');
  if (!/[。！？」]$/.test(t)) bad(w, 'does not end with punctuation');
  if (/\{(?!n\}|p\}|spot\}|nm\}|food\}|temple\}|elders\}|par\}|kid\})/.test(t)) bad(w, 'unknown placeholder');
  if (e.y && (e.y.length !== 2 || e.y[0] > e.y[1] || e.y[0] < 1961 || e.y[1] > 2110)) bad(w, 'bad y');
  if (e.minAge != null && e.maxAge != null && e.minAge > e.maxAge) bad(w, 'minAge > maxAge');
  [].concat(e.need || []).forEach(n => { if (!NEED.has(n)) bad(w, 'unknown need ' + n) });
  Object.keys(e.fx || {}).forEach(k => { if (!FX.has(k)) bad(w, 'unknown fx ' + k) });
  if (e.money != null && (typeof e.money !== 'number' || Math.abs(e.money) > 30)) bad(w, 'money must be a small fx number');
  if (e.sex && !['M', 'F'].includes(e.sex)) bad(w, 'bad sex');
});
for (const p of PATHS) if (!(d.events || []).some(e => e.path === p)) bad('_paths', 'no lines for ' + p);
if (errs.length) { console.log(errs.join('\n')); process.exit(1) }
console.log('paths.json ok:', d.events.length, 'lines,', PATHS.size, 'paths');
