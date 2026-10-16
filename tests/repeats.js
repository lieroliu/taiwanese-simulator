// Within-life repeats: how often the same diary text, or the same question, comes up more than once in one life.
// Run: node tests/repeats.js [index.html] [N]
const { chromium } = require(process.env.PW||'playwright');
(async()=>{const b=await chromium.launch();const p=await b.newPage();p.on('pageerror',e=>console.log('ERR',e.message));
await p.goto('file://'+process.cwd()+'/'+(process.argv[2]||'index.html'));const N=+process.argv[3]||300;
const r=await p.evaluate(N=>{let ent=0,dup=0,qs=0,qdup=0;const T={},Q={};
 for(let i=0;i<N;i++){const s=newLife(1961+Math.floor(Math.random()*50));const seen={},qseen={};let g=0;
  while(!s.dead&&g<1500){g++;for(const e of step(s)){
   if(e.choices){qs++;const k=e.id+'|'+(e.title||'');qseen[k]=(qseen[k]||0)+1;if(qseen[k]>1){qdup++;Q[k]=(Q[k]||0)+1}doChoice(s,e,autoChoose(s,e));continue}
   if(e.death||e.birth)continue;ent++;const t=(e.text||'').slice(0,40);seen[t]=(seen[t]||0)+1;if(seen[t]>1){dup++;T[t]=(T[t]||0)+1}
   if(e.mood&&e.mood.line){const m='心情:'+e.mood.line.slice(0,30);seen[m]=(seen[m]||0)+1;if(seen[m]>1){T[m]=(T[m]||0)+1}}}}}
 const top=o=>Object.entries(o).sort((a,b)=>b[1]-a[1]).slice(0,12).map(([k,v])=>(v/N).toFixed(2)+' '+k);
 return {entriesPerLife:+(ent/N).toFixed(1),repeatedEntries:+(dup/ent).toFixed(3),repeatsPerLife:+(dup/N).toFixed(1),questionsPerLife:+(qs/N).toFixed(1),repeatedQuestionsPerLife:+(qdup/N).toFixed(2),topText:top(T),topQuestion:top(Q)}},N);
console.log(JSON.stringify(r,null,1));await b.close()})();
