// Plays many lives and reports how often the funny moments, close calls and dangerous choices show up, and how lifespans compare.
// Run: node tests/fun.js [index.html] [N]
const { chromium } = require(process.env.PW||'playwright');
(async()=>{const b=await chromium.launch();const p=await b.newPage();let err=0;p.on('pageerror',e=>{err++;console.log('ERR',e.message)});
await p.goto('file://'+process.cwd()+'/'+(process.argv[2]||'index.html'));const N=+process.argv[3]||400;
const r=await p.evaluate(N=>{const has=typeof DGR!=='undefined';let ent=0,fun=0,near=0,offers={},took={},rdeath={},ages=[],causes={},scenes=0,deaths=0,lines=0,bad=[];
 for(let i=0;i<N;i++){const s=newLife(1961+Math.floor(Math.random()*50));let g=0;
  while(!s.dead&&g<1500){g++;for(const e of step(s)){
   if(e.choices){if(has&&e.id.startsWith('dg_')){offers[e.id]=(offers[e.id]||0)+1}const c=autoChoose(s,e);doChoice(s,e,c);if(e.id.startsWith('dg_')&&c.label===DGR.find(x=>'dg_'+x.id===e.id).choices[0].label)took[e.id]=(took[e.id]||0)+1;continue}
   if(e.death){deaths++;causes[s.cause]=(causes[s.cause]||0)+1;if(!/離開人世|離開了這個世界|離開了。/.test(e.text))scenes++;if(/undefined|\{/.test(e.text))bad.push(e.text);continue}
   if(e.birth)continue;ent++;if(e._re&&e._re.startsWith('fn_'))fun++;if(e._re==='near')near++;if(/undefined|\{[a-z]/.test(e.text||''))bad.push(e.text)}}
  ages.push(s.age)}
 ages.sort((a,b)=>a-b);
 return {lives:N,meanAge:+(ages.reduce((a,x)=>a+x,0)/N).toFixed(1),medianAge:ages[N>>1],diaryPerLife:+(ent/N).toFixed(1),funnyShare:+(fun/ent).toFixed(3),nearPerLife:+(near/N).toFixed(2),
  deathScenes:+(scenes/deaths).toFixed(2),offers,took,causes:Object.fromEntries(Object.entries(causes).sort((a,b)=>b[1]-a[1]).slice(0,14)),bad:bad.slice(0,5)}},N);
console.log(JSON.stringify(r,null,1));if(r.bad.length)err++;console.log(err?'FAIL':'OK');await b.close();process.exit(err?1:0)})();
