// Plays a few lives to the end, opens the share image and checks it renders at 1080x1920 without errors.
const { chromium } = require(process.env.PW||'playwright');
(async()=>{const b=await chromium.launch();const p=await b.newPage();let err=0;p.on('pageerror',e=>{err++;console.log('ERR',e.message)});
await p.goto('file://'+process.cwd()+'/'+(process.argv[2]||'index.html'));
for(const y of [1961,1975,1990,2010]){
 await p.evaluate(y=>{begin(y);const s=S;let g=0;while(!s.dead&&g<1500){g++;for(const e of step(s)){if(e.choices)doChoice(s,e,autoChoose(s,e))}}summary()},y);
 await p.click('#share');await p.waitForSelector('.shareov img');
 const r=await p.evaluate(()=>{const i=document.querySelector('.shareov img');return {w:i.naturalWidth,h:i.naturalHeight}});
 console.log(y,JSON.stringify(r));if(r.w!==1080||r.h!==1920)err++;
 await p.click('#shX');}
console.log(err?'FAIL':'OK');await b.close();process.exit(err?1:0)})();
