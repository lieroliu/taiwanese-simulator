// 國中能力分班: share of each class by birth decade and family income. Run: node tests/classes.js [index.html] [N]
const { chromium } = require(process.env.PW||'playwright');
(async()=>{const b=await chromium.launch();const p=await b.newPage();p.on('pageerror',e=>console.log('ERR',e.message));
await p.goto('file://'+process.cwd()+'/'+(process.argv[2]||'index.html'));const N=+process.argv[3]||2000;
const r=await p.evaluate(N=>{const T={},st={};const cls=s=>s.f.cls||(s.f.good?'升學班':s.f.cow?'放牛班':'沒分班');
 for(let i=0;i<N;i++){const by=1961+Math.floor(Math.random()*50);const s=newLife(by);let g=0;while(!s.dead&&s.age<14&&g<400){g++;for(const e of step(s))if(e.choices)doChoice(s,e,autoChoose(s,e))}
  if(s.dead)continue;const k1=(Math.floor((by-1961)/10)*10+1961)+'s',k2='家境'+s.inc;
  for(const k of [k1,k2,'全部']){T[k]=T[k]||{n:0};T[k].n++;const c=cls(s);T[k][c]=(T[k][c]||0)+1}
  (st[k1]=st[k1]||[]).push(s.f.study13??s.study)}
 const o={};for(const k in T){const t=T[k];o[k]=Object.fromEntries(Object.entries(t).filter(([x])=>x!=='n').map(([x,v])=>[x,Math.round(v/t.n*100)+'%']))}
 for(const k in st){const a=st[k].sort((x,y)=>x-y);o[k].study中位=Math.round(a[a.length>>1])}return o},N);
console.log(JSON.stringify(r,null,1));await b.close()})();
