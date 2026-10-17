// 族群「你想不想…？」: each ask shows up for its own group only, results stay consistent (no blocked name after 1995, cert only from 2012, 下山 really moves you).
const { chromium } = require(process.env.PW||'playwright');
const file=process.argv[2]||'index.html',N=+process.argv[3]||300;
(async()=>{const b=await chromium.launch();const p=await b.newPage();const errs=[];p.on('pageerror',e=>errs.push(e.message));await p.goto('file://'+process.cwd()+'/'+file);
const r=await p.evaluate((N)=>{const seen={},yes={},bad=[],ex={};const ids=EA.map(a=>a.id);
 const run=(eth,by)=>{const s=newLife(by,{eth});let g=0;
  while(!s.dead&&g<1500){g++;for(const e of step(s))if(e.choices){const c=autoChoose(s,e);const y0=s.y,pl=s.place,r=doChoice(s,e,c);
   if(ids.includes(e.id)){seen[e.id]=(seen[e.id]||0)+1;const a=EA.find(a=>a.id===e.id);if(c.label===a.T.yes)yes[e.id]=(yes[e.id]||0)+1;
    if(eth!=='原住民')bad.push('wrong group '+e.id+' '+eth);
    if(!r.text||/undefined|NaN|null|\{/.test(r.text))bad.push('bad text '+e.id+': '+r.text);
    if(e.id==='ea_in_cert'&&y0<2012)bad.push('cert before 2012');
    if(e.id==='ea_in_name'&&y0>=1995&&s.f.eaNameNo===1)bad.push('name blocked after 1995');
    if(e.id==='ea_in_stay'&&/下山/.test(r.text)&&s.place===pl)bad.push('went down but did not move');
    (ex[e.id]=ex[e.id]||[]).length<3&&ex[e.id].push(y0+' '+c.label+'：'+r.text)}}}
  return s};
 for(let i=0;i<N;i++){run('原住民',1961+(i%50));if(i%3===0)run(pick(['閩南','客家','外省','新住民子女']),1961+(i%50))}
 return {seen,yes,bad:bad.slice(0,10),nbad:bad.length,ex}},N);
console.log(JSON.stringify(r,null,1));const ok=!errs.length&&!r.nbad&&Object.keys(r.seen).length>=3;console.log(errs.length?'ERR '+errs[0]:ok?'OK':'FAIL');await b.close();process.exit(ok?0:1)})();
