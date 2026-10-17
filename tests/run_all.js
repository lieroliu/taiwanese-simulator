// Runs every test script in tests/ against index.html and fails if any of them exits non-zero.
// Run: node tests/run_all.js [name ...]      (names without .js run only those tests)
// Env: JOBS=4 sets how many run at once (default: CPU count); SHARD=2/3 runs only every third test starting
// at the second (CI splits the list across machines); PW=... is passed through to the tests.
const fs = require('fs'), path = require('path'), os = require('os'), { spawn } = require('child_process');

// same_output.js compares two builds (before/after a refactor), so it needs a second file and is run by hand.
const SKIP = new Set(['run_all.js', 'same_output.js']);
// Statistical checks whose result swings across runs of the same build; they still run and print, but a
// failure here does not fail the run. Move a test out of this list once its thresholds are stable.
const REPORT_ONLY = new Set([
  'house.js', // chk.b1990TP (Taipei 1988-92 burden >= 0.7) lands between 0.64 and 0.89 on the same build
]);
const dir = __dirname, root = path.resolve(dir, '..');
const only = process.argv.slice(2).map(n => n.replace(/\.js$/, '') + '.js');
const files = fs.readdirSync(dir).filter(f => f.endsWith('.js') && !SKIP.has(f) && (!only.length || only.includes(f))).sort()
  .filter((f, i) => { const [k, n] = (process.env.SHARD || '1/1').split('/').map(Number); return i % n === k - 1; });
const jobs = Math.max(1, +process.env.JOBS || os.cpus().length);

function run(f) {
  return new Promise(resolve => {
    const t0 = Date.now(), out = [];
    const c = spawn(process.execPath, [path.join('tests', f), 'index.html'], { cwd: root, env: process.env });
    c.stdout.on('data', d => out.push(d)); c.stderr.on('data', d => out.push(d));
    c.on('close', code => resolve({ f, code, secs: ((Date.now() - t0) / 1000).toFixed(0), out: Buffer.concat(out).toString() }));
  });
}

(async () => {
  const queue = [...files], results = [];
  await Promise.all(Array.from({ length: jobs }, async () => {
    while (queue.length) {
      const r = await run(queue.shift());
      results.push(r);
      console.log(`${r.code === 0 ? 'ok  ' : REPORT_ONLY.has(r.f) ? 'warn' : 'FAIL'} ${r.f} (${r.secs}s)`);
    }
  }));
  const bad = results.filter(r => r.code !== 0), failed = bad.filter(r => !REPORT_ONLY.has(r.f));
  for (const r of bad) console.log(`\n===== ${r.f} (exit ${r.code}${REPORT_ONLY.has(r.f) ? ', report only' : ''}) =====\n${r.out.slice(-4000)}`);
  console.log(`\n${results.length - bad.length}/${results.length} passed` + (bad.length > failed.length ? `, ${bad.length - failed.length} report-only failed` : ''));
  process.exit(failed.length ? 1 : 0);
})();
