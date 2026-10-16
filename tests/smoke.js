const { chromium } = require(process.env.PW||'playwright');
(async()=>{
 const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium-1194/chrome-linux/chrome'}).catch(async()=>chromium.launch());
 const p=await b.newPage();const errs=[];p.on('pageerror',e=>errs.push(e.message));p.on('console',m=>{if(m.type()==='error')errs.push(m.text())});
 await p.goto('file://'+process.cwd()+'/index.html');
 const r=await p.evaluate(()=>{
  const {newLife,step}=window.__sim;const st={n:0,ages:[],stops:[],choices:[],noJob:0,stuck:0,cats:{},causes:{},eth:{},ids:{},emptyChoice:0,neverStudy:0};
  for(let i=0;i<1500;i++){const by=1961+Math.floor(Math.random()*50);const s=newLife(by);let stops=0,ch=0,g=0;
   st.eth[s.eth]=(st.eth[s.eth]||0)+1;
   while(!s.dead&&g<1500){const o=step(s);g++;if(o.length)stops++;for(const e of o){st.cats[e.cat]=(st.cats[e.cat]||0)+1;if(e.choices){if(!e.choices.length)st.emptyChoice++;ch++;const t=window.__sim.doChoice(s,e,window.__sim.autoChoose(s,e)).text;if(typeof t!=='string'||t.includes('undefined'))throw new Error('bad text '+t)}}}
   if(!s.dead)st.stuck++;st.ages.push(s.age);st.stops.push(stops);st.choices.push(ch);st.causes[s.cause]=(st.causes[s.cause]||0)+1;
   if(s.age>=30&&!s.job)st.noJob++;
   if(s.age>=30&&s.needJob)st.stuck++;
   if(s.age>=60){const l=s.id>25?'台':s.id<-25?'中':'都';st.ids[l]=(st.ids[l]||0)+1}
  }
  const avg=a=>a.reduce((x,y)=>x+y,0)/a.length;
  return {avgAge:avg(st.ages),avgStops:avg(st.stops),avgChoices:avg(st.choices),noJob:st.noJob,stuck:st.stuck,emptyChoice:st.emptyChoice,cats:st.cats,causes:st.causes,eth:st.eth,ids:st.ids,maxStops:Math.max(...st.stops),under5:st.ages.filter(a=>a<5).length};
 });
 console.log(JSON.stringify(r,null,1));console.log('errors',errs);await b.close();
})();
