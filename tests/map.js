// Footprint map + travel events: counties lit per life, trip frequency, and no trips while abroad.
//   node tests/map.js [index.html] [lives]
const { chromium } = require(process.env.PW||'playwright');
const file=process.argv[2]||'index.html', N=+process.argv[3]||600;
(async()=>{
 const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium-1194/chrome-linux/chrome'}).catch(async()=>chromium.launch());
 const p=await b.newPage();const errs=[];p.on('pageerror',e=>errs.push(e.message));
 await p.goto('file://'+require('path').resolve(file));
 const r=await p.evaluate(N=>{const {newLife,step}=window.__sim;const C={},bad=[],ids={},samples={};let stops=0,away=0;
  const coh=by=>by<=1970?'五年級':by<=1980?'六年級':by<=1990?'七年級':by<=2000?'八年級':'九年級';
  for(let i=0;i<N;i++){const s=newLife(1961+i%50);let g=0;
   while(!s.dead&&g<1500){const before=s.place;const o=step(s);g++;if(o.length)stops++;
    for(const e of o){if(e.choices&&e.choices.length)window.__sim.doChoice(s,e,window.__sim.autoChoose(s,e));if(!e._re||!/^trip_|^commute/.test(e._re))continue;ids[e._re]=(ids[e._re]||0)+1;
     if(!window.__sim.inTW(before))away++;if(/undefined|null|\$\{/.test(e.text))bad.push(e.text);
     (samples[e._re]=samples[e._re]||[]).length<3&&samples[e._re].push(s.y+' '+s.age+'歲 '+e.text)}}
   const V=s.vis||{},k=coh(s.by);C[k]=C[k]||{n:0,cty:0,home:0,work:0,trip:0,old:0,oldCty:0};const c=C[k];c.n++;
   for(const x in V){c.cty++;c[V[x]]++;if(!window.__sim.inTW(x))bad.push('bad county '+x)}
   if(s.age>=50){c.old++;c.oldCty+=Object.keys(V).length}}
  for(const k in C){const c=C[k];for(const f of ['cty','home','work','trip'])c[f]=+(c[f]/c.n).toFixed(1);c.oldCty=c.old?+(c.oldCty/c.old).toFixed(1):null;delete c.old}
  return {perCohort:C,tripEvents:ids,tripWhileAbroad:away,avgStops:+(stops/N).toFixed(1),bad:bad.slice(0,5),samples}},N);
 console.log(JSON.stringify(r,null,1));console.log('errors',errs);
 await b.close();if(errs.length||r.bad.length||r.tripWhileAbroad)process.exit(1);
})();
