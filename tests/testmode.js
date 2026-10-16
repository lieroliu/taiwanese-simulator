// Checks the hidden test mode: the background pickers appear only with ?test=1 and force the rolled background.
const { chromium } = require(process.env.PW||'playwright');
(async()=>{const b=await chromium.launch();const p=await b.newPage({viewport:{width:400,height:900}});let err=0;p.on('pageerror',e=>{err++;console.log('ERR',e.message)});
const url='file://'+process.cwd()+'/'+(process.argv[2]||'index.html');
await p.goto(url);if(await p.isVisible('#testbox')){console.log('testbox visible without ?test=1');err++}
await p.goto(url+'?test=1');if(!await p.isVisible('#testbox')){console.log('testbox hidden with ?test=1');err++}
if(process.argv[3])await p.screenshot({path:process.argv[3],fullPage:true});
const cases=[['花蓮縣','原住民','F','農','低'],['台北市','外省','M','公教','高'],['雲林縣','新住民子女','F','工','中']];
for(const [c,e,x,j,i] of cases){await p.selectOption('#tCounty',c);await p.selectOption('#tEth',e);await p.selectOption('#tSex',x);await p.selectOption('#tJob',j);await p.selectOption('#tInc',i);
 await p.fill('#year','1992');await p.click('#yearform button[type=submit]');
 const s=await p.evaluate(()=>({c:S.birthCounty,e:S.eth,x:S.sex,j:S.pjob,i:S.inc,by:S.by}));
 const ok=s.c===c&&s.e===e&&s.x===x&&s.j===j&&s.i===i&&s.by===1992;console.log(ok?'ok':'MISMATCH',JSON.stringify(s));if(!ok)err++;
 await p.evaluate(()=>{let g=0;while(!S.dead&&g<1500){g++;for(const e of step(S)){if(e.choices)doChoice(S,e,autoChoose(S,e))}}show('start')})}
const free=await p.evaluate(()=>{const n={};for(let i=0;i<300;i++){const s=newLife(1980);n[s.birthCounty]=1}return Object.keys(n).length});
if(free<10){console.log('cohort sims affected by test picks',free);err++}
console.log(err?'FAIL':'OK');await b.close();process.exit(err?1:0)})();
