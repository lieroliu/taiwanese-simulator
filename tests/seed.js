// Preloaded by run_all.js (node -r): every page a test opens gets the same seeded Math.random, so a build
// always plays the same lives and a statistical check cannot flip red or green between runs of one commit.
// SEED=123 picks another sequence; SEED=off turns seeding off.
const seed = process.env.SEED || '20261017';
if (seed !== 'off') {
  const { chromium } = require(process.env.PW || 'playwright');
  const init = s => { let a = s; Math.random = () => { a = (a + 0x6D2B79F5) >>> 0; let t = a; t = Math.imul(t ^ t >>> 15, t | 1); t ^= t + Math.imul(t ^ t >>> 7, t | 61); return ((t ^ t >>> 14) >>> 0) / 4294967296 } };
  const launch = chromium.launch.bind(chromium);
  chromium.launch = async (...a) => {
    const b = await launch(...a);
    const newContext = b.newContext.bind(b);
    b.newContext = async (...o) => { const c = await newContext(...o); await c.addInitScript(init, +seed); return c };
    b.newPage = async (...o) => (await b.newContext(...o)).newPage();
    return b;
  };
}
