// 族群「你想不想…？」: each ask shows up for its own group only, results stay consistent (no blocked name after 1995, cert only from 2012, 下山 really moves you).
const { chromium } = require(process.env.PW||'playwright');
const file=process.argv[2]||'index.html',N=+process.argv[3]||300;
(async()=>{const b=await chromium.launch();const p=await b.newPage();const errs=[];p.on('pageerror',e=>errs.push(e.message));await p.goto('file://'+process.cwd()+'/'+file);
const r=await p.evaluate((N)=>{const seen={},yes={},bad=[],ex={};const ids=EA.map(a=>a.id);
 const run=(eth,by,F)=>{const s=newLife(by,Object.assign({eth},F||{}));let g=0;
  while(!s.dead&&g<1500){g++;for(const e of step(s))if(e.choices){const c=autoChoose(s,e);const y0=s.y,pl=s.place,r=doChoice(s,e,c);
   if(ids.includes(e.id)){seen[e.id]=(seen[e.id]||0)+1;const a=EA.find(a=>a.id===e.id);if(c.label===a.T.yes)yes[e.id]=(yes[e.id]||0)+1;
    if(!a.eth.includes(eth))bad.push('wrong group '+e.id+' '+eth);
    if(e.id==='ea_ws_academy'&&s.f.officer&&s.job!=='公教'&&s.y-y0<1)bad.push('officer without job');
    if(e.id==='ea_xz_work'&&!s.f.momLang)bad.push('sent abroad without the language');
    if(e.id==='ea_mn_shop'&&/^我接下了店。第一天|^我接下了店。爸爸說/.test(r.text)&&s.job!=='自營')bad.push('took over the shop without the job');
    if(e.id==='ea_hk_lang'&&y0>=1987&&/狗牌|罰一塊/.test(r.text))bad.push('dialect fine after 1987');
    if(!r.text||/undefined|NaN|null|\{/.test(r.text))bad.push('bad text '+e.id+': '+r.text);
    if(e.id==='ea_in_cert'&&y0<2012)bad.push('cert before 2012');
    if(e.id==='ea_in_name'&&y0>=1995&&s.f.eaNameNo===1)bad.push('name blocked after 1995');
    if(e.id==='ea_in_stay'&&/下山/.test(r.text)&&s.place===pl)bad.push('went down but did not move');
    (ex[e.id]=ex[e.id]||[]).length<3&&ex[e.id].push(y0+' '+c.label+'：'+r.text)}}}
  return s};
 const G=['原住民','客家','外省','新住民子女','閩南'];for(let i=0;i<N;i++)run(G[i%G.length],1961+(i%50));
 for(let i=0;i<N/3;i++)run('新住民子女',1995+(i%15));
 for(let i=0;i<N/3;i++)run('閩南',1961+(i%40),{pjob:'小生意'});
 for(let i=0;i<N/3;i++)run('外省',1961+(i%28),{pjob:'公教'});
 const heir=[];for(let i=0;i<N;i++){const s=newLife(1961+(i%24),{eth:'客家'});s.urban=false;let g=0;while(!s.dead&&g<500){g++;for(const e of step(s))if(e.choices){const r=doChoice(s,e,autoChoose(s,e));if(/顧祖堂/.test(r.text))heir.push(s.by)}}}
 seen.heirFail=heir.length;
 return {seen,yes,bad:bad.slice(0,10),nbad:bad.length,ex}},N);
console.log(JSON.stringify(r,null,1));const ok=!errs.length&&!r.nbad&&Object.keys(r.seen).length>=5;console.log(errs.length?'ERR '+errs[0]:ok?'OK':'FAIL');await b.close();process.exit(ok?0:1)})();
