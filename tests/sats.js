// End screen 滿意的事: how many lives get at least one, and which kinds show up.
const { chromium } = require(process.env.PW||'playwright');
const file=process.argv[2]||'index.html',N=+process.argv[3]||400;
(async()=>{const b=await chromium.launch();const p=await b.newPage();const errs=[];p.on('pageerror',e=>errs.push(e.message));await p.goto('file://'+process.cwd()+'/'+file);
const r=await p.evaluate((N)=>{let adults=0,withOne=0,total=0;const kinds={},ex=[];
 for(let i=0;i<N;i++){const s=newLife(1961+(i%45));let g=0;while(!s.dead&&g<1500){g++;for(const e of step(s))if(e.choices)doChoice(s,e,autoChoose(s,e))}
  if(s.age<18)continue;adults++;const H=satTop(s);if(H.length)withOne++;total+=H.length;H.forEach(h=>{const k=h.k.replace(/^c_.*/,'choice');kinds[k]=(kinds[k]||0)+1});if(ex.length<8&&H.length)ex.push(s.age+'歲：'+H.map(h=>you(h.txt)+(h.why?'（'+you(h.why)+'）':'')).join(' / '))}
 return {adults,withOne,perLife:(total/adults).toFixed(2),kinds,ex}},N);
console.log(JSON.stringify(r,null,1));const ok=!errs.length&&r.withOne/r.adults>=.95;console.log(errs.length?'ERR '+errs[0]:ok?'OK':'FAIL');await b.close();process.exit(ok?0:1)})();
