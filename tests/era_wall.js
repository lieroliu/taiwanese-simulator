// End screen 時代沒讓你做到的事: era-caused failures land here (with the year and a reason), not also in 你後悔的事.
const { chromium } = require(process.env.PW||'playwright');
const file=process.argv[2]||'index.html',N=+process.argv[3]||300;
(async()=>{const b=await chromium.launch();const p=await b.newPage();const errs=[];p.on('pageerror',e=>errs.push(e.message));await p.goto('file://'+process.cwd()+'/'+file);
const r=await p.evaluate((N)=>{let adults=0,withOne=0,total=0,dup=0,bad=0,html=0;const kinds={},ex=[];
 for(let i=0;i<N;i++){const s=newLife(1961+(i%45));let g=0;while(!s.dead&&g<1500){g++;for(const e of step(s))if(e.choices)doChoice(s,e,autoChoose(s,e))}
  if(s.age<18)continue;adults++;const L=s.eraLog||[];if(L.length)withOne++;total+=L.length;
  L.forEach(x=>{kinds[x.k]=(kinds[x.k]||0)+1;if(!/^\d{4} 年，你 \d+ 歲。/.test(x.why)||/undefined|NaN|null/.test(x.txt+x.why))bad++;if((s.regrets||[]).some(g=>g.k===x.k||g.txt===x.txt))dup++});
  const h=eraWallSection(s);if(L.length&&!h.includes('時代沒讓你做到的事'))html++;
  if(ex.length<8&&L.length)ex.push(s.by+'：'+L.map(x=>you(x.txt)+'（'+you(x.why)+'）').join(' / '))}
 return {adults,withOne,perLife:(total/adults).toFixed(2),dup,bad,html,kinds,ex}},N);
console.log(JSON.stringify(r,null,1));const ok=!errs.length&&!r.dup&&!r.bad&&!r.html&&r.withOne>0;console.log(errs.length?'ERR '+errs[0]:ok?'OK':'FAIL');await b.close();process.exit(ok?0:1)})();
