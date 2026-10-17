// Mood value: average mood by age, share of lives with depression, diagnosis by era, suicide share, and that the diary never names depression.
// Run: PW=... node tests/mood.js [index.html] [N]
const { chromium } = require(process.env.PW||'playwright');
const file=process.argv[2]||'index.html',N=+process.argv[3]||1500;
(async()=>{const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium-1194/chrome-linux/chrome'}).catch(()=>chromium.launch());
 const p=await b.newPage();const errs=[];p.on('pageerror',e=>errs.push(e.message));
 await p.goto('file://'+process.cwd()+'/'+file);
 const r=await p.evaluate(N=>{const {newLife,step,doChoice,autoChoose}=window.__sim;const ageB={},era={},st={n:0,dep:0,adult:0,suic:0,depSuic:0,diaryDep:0,lowLife:0,hiLife:0,choiceUp:0,choiceDown:0};
  for(let i=0;i<N;i++){const s=newLife(1961+Math.floor(Math.random()*50));s.track=true;let g=0;
   while(!s.dead&&g<1500){g++;for(const e of step(s)){const t=(e.text||'')+(e.mood?e.mood.line:'');if(/憂鬱|身心科|自殺|輕生/.test(t)&&!e.death)st.diaryDep++;
     if(e.choices){const m0=s.mood;doChoice(s,e,autoChoose(s,e));if(s.mood-m0>=5)st.choiceUp++;if(s.mood-m0<=-5)st.choiceDown++}}}
   st.n++;if(s.age>=18)st.adult++;
   for(const h of s.hist)if(h.mood!==undefined){const k=Math.min(8,Math.floor(h.age/10));(ageB[k]=ageB[k]||[]).push(h.mood)}
   const eps=s.depHist.concat(s.dep?[s.dep]:[]);if(eps.length)st.dep++;
   for(const e of eps){const k=e.y<1990?'<1990':e.y<2000?'1990s':e.y<2010?'2000s':e.y<2020?'2010s':'2020+';const o=era[k]=era[k]||{n:0,dx:0};o.n++;if(e.dx)o.dx++}
   if(s.cause==='自殺'){st.suic++;if(s.dep)st.depSuic++}
   const ms=s.hist.filter(h=>h.mood!==undefined&&h.age>=6).map(h=>h.mood);if(ms.length){const a=ms.reduce((x,y)=>x+y,0)/ms.length;if(a<45)st.lowLife++;if(a>=62)st.hiLife++}}
  const avg=a=>Math.round(a.reduce((x,y)=>x+y,0)/a.length);
  return {lives:st.n,moodByDecade:Object.fromEntries(Object.entries(ageB).map(([k,v])=>[k*10+'s',avg(v)])),depShareAdults:+(st.dep/st.adult).toFixed(3),
   dxByEra:Object.fromEntries(Object.entries(era).map(([k,o])=>[k,o.n+' 次, 診斷 '+Math.round(o.dx/o.n*100)+'%'])),suicide:st.suic,suicideWhileDepressed:st.depSuic,
   lowMoodLives:st.lowLife,happyLives:st.hiLife,choicesUp:st.choiceUp,choicesDown:st.choiceDown,diaryMentionsDepression:st.diaryDep}},N);
 console.log(JSON.stringify(r,null,1));
 const ok=!errs.length&&r.diaryMentionsDepression===0&&r.depShareAdults>.05&&r.depShareAdults<.35;
 console.log(errs.length?'ERR '+errs[0]:ok?'OK':'FAIL');await b.close();process.exit(ok?0:1)})();
