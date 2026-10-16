// Same person, different 年級: fixes county, ethnicity, sex, family and personality, then compares how lives turn out by birth year.
const { chromium } = require(process.env.PW||'playwright');
(async()=>{const b=await chromium.launch();const p=await b.newPage();p.on('pageerror',e=>console.log('ERR',e.message));
await p.goto('file://'+process.cwd()+'/'+(process.argv[2]||'index.html'));const N=+process.argv[3]||300;
const r=await p.evaluate(N=>{const out={};const med=a=>{a=a.filter(x=>x!=null).sort((x,y)=>x-y);return a.length?a[Math.floor(a.length/2)]:null};
 for(const by of [1965,1975,1985,1995,2005]){const L=[];
  for(let i=0;i<N;i++){const s=newLife(by,{county:'台中市',eth:'閩南',sex:i%2?'F':'M',pjob:'工',inc:'中'});for(const k of ['risk','rebel','self','open'])s.ax[k]=50;s.study=60;let g=0;
   while(!s.dead&&g<1500){g++;for(const e of step(s)){if(e.choices)doChoice(s,e,autoChoose(s,e))}}
   const R0=regretTop(s);L.push({uni:s.edu==='大學',ms:!!s.f.master,phd:!!s.f.phd,gj:!!s.f.wasGJ,hA:s.houseAge??null,c40:s.cash40m??null,mar:!!s.f.everMar,kids:s.kids,big:s.bigN||0,reg:R0.map(r=>r.txt),age:s.age})}
  const pc=f=>Math.round(L.filter(f).length/N*100)+'%';const rc={};L.forEach(l=>l.reg.forEach(t=>rc[t]=(rc[t]||0)+1));
  out[by]={大學:pc(l=>l.uni),碩士:pc(l=>l.ms),博士:pc(l=>l.phd),軍公教:pc(l=>l.gj),買房:pc(l=>l.hA!=null),買房年齡中位:med(L.map(l=>l.hA)),'40歲存款(月薪)':Math.round(med(L.map(l=>l.c40))||0),結過婚:pc(l=>l.mar),平均孩子:(L.reduce((a,l)=>a+l.kids,0)/N).toFixed(2),
   遇過大事:med(L.map(l=>l.big)),最常後悔:Object.entries(rc).sort((a,b)=>b[1]-a[1]).slice(0,3).map(([t,n])=>t+Math.round(n/N*100)+'%').join(' ')}}
 return out},N);
console.log(JSON.stringify(r,null,1));await b.close()})();
