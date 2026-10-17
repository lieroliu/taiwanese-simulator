// Help lines never show inside the diary; the end page lists only the topics this life touched.
// Run: PW=... node tests/helplines.js index.html [N]
const { chromium } = require(process.env.PW||'playwright');
const file=process.argv[2]||'index.html',N=+process.argv[3]||20;
(async()=>{const b=await chromium.launch();const errs=[];let inFeed=0,withHelp=0,wrong=0;const ex=[];
 for(let k=0;k<N;k++){const p=await b.newPage();p.on('pageerror',e=>errs.push(e.message));await p.goto('file://'+process.cwd()+'/'+file);
  await p.evaluate(y=>begin(y),1961+Math.floor(k*49/Math.max(1,N-1)));
  const r=await p.evaluate(async()=>{noScroll=true;runAll();await new Promise(r=>setTimeout(r,3000));
   const feed=[...document.querySelectorAll('.entry')].filter(x=>/專線|熱線|02-2392|報警/.test(x.textContent)).map(x=>x.textContent.slice(0,80));
   if(S.dead)summary();const end=document.getElementById('end').textContent;const h=[...(S._help||[])];if(S.cause==='自殺')h.push('心情');
   const miss=h.length&&!/如果你也正在經歷/.test(end);const extra=!h.length&&/如果你也正在經歷/.test(end);return [feed,h.length,miss||extra]});
  inFeed+=r[0].length;ex.push(...r[0].slice(0,2));if(r[1])withHelp++;if(r[2])wrong++;await p.close()}
 console.log(JSON.stringify({lives:N,inFeed,withHelp,wrong,ex:ex.slice(0,4)}));
 const ok=!errs.length&&!inFeed&&!wrong;console.log(errs.length?'ERR '+errs[0]:ok?'OK':'FAIL');await b.close();process.exit(ok?0:1)})();
