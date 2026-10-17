// Every diary entry on the page carries a real date and age: plays whole lives through the UI and scans the headers and text for NaN or undefined.
// Run: PW=... node tests/dates.js index.html [N]
const { chromium } = require(process.env.PW||'playwright');
const file=process.argv[2]||'index.html',N=+process.argv[3]||8;
(async()=>{const b=await chromium.launch();const errs=[];let bad=0,total=0;const ex=[];
 for(let k=0;k<N;k++){const p=await b.newPage();p.on('pageerror',e=>errs.push(e.message));await p.goto('file://'+process.cwd()+'/'+file);
  await p.evaluate(y=>begin(y),1961+Math.floor(k*49/Math.max(1,N-1)));
  const r=await p.evaluate(async()=>{noScroll=true;runAll();await new Promise(r=>setTimeout(r,3000));
   const E=[...document.querySelectorAll('.entry')];const b=E.filter(x=>/NaN|undefined/.test(x.textContent)).map(x=>x.textContent.slice(0,80));return [E.length,b]});
  total+=r[0];bad+=r[1].length;ex.push(...r[1].slice(0,2));await p.close()}
 console.log(JSON.stringify({lives:N,entries:total,withNaN:bad,ex:ex.slice(0,6)},null,1));
 const ok=!errs.length&&bad===0&&total>N*20;console.log(errs.length?'ERR '+errs[0]:ok?'OK':'FAIL');await b.close();process.exit(ok?0:1)})();
