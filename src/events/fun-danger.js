/* ================= content files (funny / near_death / death_causes / danger) ================= */
const EDU_RK={'國小':0,'國中':1,'高職':2,'高中':2,'五專':3,'大學':4,'碩士':5,'博士':6};
function fOK(s,e){if(e.y&&(s.y<e.y[0]||s.y>e.y[1]))return false;if(Array.isArray(e.by)&&(s.by<e.by[0]||s.by>e.by[1]))return false;if(e.minAge!=null&&s.age<e.minAge)return false;if(e.maxAge!=null&&s.age>e.maxAge)return false;
  if(e.months&&!e.months.includes(s.m))return false;if(e.region&&!anyOf(e.region,regionOf(s.place)))return false;if(e.county&&!e.county.includes(s.place))return false;
  if(e.eth&&!anyOf(e.eth,s.eth))return false;if(e.sex&&e.sex!==s.sex)return false;if(!needOK(s,e.need))return false;if(e.urban!=null&&e.urban!==s.urban)return false;
  if(e.job&&!e.job.includes(s.job))return false;if(e.eduMax&&(EDU_RK[s.edu]??0)>(EDU_RK[e.eduMax]??9))return false;if(e.moneyBelow!=null&&s.money>=e.moneyBelow)return false;return true}
const txtOK=(s,t)=>splitSent(t).every(x=>sentOK(s,x));
const mkHabit=(s,h)=>{if(h)habit(s,h.k,h.say,h.does,h.why)};
const HW_ADD=new Set();
/* funny: everyday absurd-but-real moments, each at most once per life */
for(const e of FUN){if(e.habit)HW_ADD.add(e.habit.k);
  const army=/新訓|當兵|入伍|退伍|班長/.test(e.text);PE.push({id:'fn_'+e.id,p:s=>!s.f['fn_'+e.id]&&!(s._fnSkip&&s._fnSkip[e.id])&&s.age>=3&&fOK(s,e)&&(!army||(s.f.served&&!s.f.exempt&&s.inServiceUntil>s.t))&&txtOK(s,fillPH(s,e.text))?FUN_P*(e.weight||1)*(e.months?2.5:1):0,
    run:s=>{s.f['fn_'+e.id]=1;mkHabit(s,e.habit);return {tone:e.tone||'neutral',cat:e.cat||'生活',text:fillPH(s,e.text)}}})}
var FUN_P=.009;
/* each life only gets part of the funny pool, so the next life does not replay the same jokes */
var FUN_KEEP=.35;
{const nl0=newLife;newLife=function(by,F){const s=nl0(by,F);s._fnSkip={};for(const e of FUN)if(!chance(FUN_KEEP))s._fnSkip[e.id]=1;return s}}
/* near death: close calls the character survives */
function nearApply(s,n){fx(s,{health:n.health||0});if(n.scar)scar(s,n.scar.phrase,n.scar.yrs,n.scar.w);mkHabit(s,n.habit);return {tone:'bad',cat:'健康',text:fillPH(s,n.text),note:n.note}}
for(const n of NEAR)if(n.habit)HW_ADD.add(n.habit.k);
RE.push({id:'near',p:s=>{if(s.age<3)return 0;const L=NEAR.filter(n=>!(s.f.nearU||[]).includes(n.id)&&fOK(s,n));s._nearL=L;return L.length?.0007:0},
  run:s=>{const n=pickW(s._nearL,x=>x.weight||1);(s.f.nearU=s.f.nearU||[]).push(n.id);return nearApply(s,n)}});
RTONE.near='bad';
/* death causes: an 意外 slot for ages 5+, and everyday scenes for the last diary line */
{const c0=causeOf;causeOf=function(s){
  for(const L of (s.lates||[]))if(s.t>=L.fromT&&chance((L.mult-1)/L.mult))return L.cause;
  const a=s.age;if(a>=5){const w=DCF.addWeights.find(x=>a>=(x.minAge??0)&&a<=(x.maxAge??200));if(w){const tot=a<15?10:a<35?11.5:a<65?14:14.5;if(chance(w.weight/(tot+w.weight)))return '意外'}}
  return c0(s)}}
{const q0=annualQ;annualQ=function(s){let q=q0(s);for(const L of (s.lates||[]))if(s.t>=L.fromT)q*=L.mult;return Math.min(q,.6)}}
{const d0=deathEntry;deathEntry=function(s,cause){const e=d0(s,cause);if(cause==='自殺'||s.age<5)return e;
  const when=`民國 ${roc(s.y)} 年 ${s.m} 月`,tail=`享年 ${s.age} 歲。`;let sc=s._dTxt;
  if(!sc&&chance(.7)){const L=(DCF.flavor[cause]||[]).filter(x=>fOK(s,x)&&txtOK(s,x.text));if(L.length)sc=pick(L).text}
  if(sc)e.text=`${when}，${fillPH(s,sc)}${tail}`;
  else if(['船難','礦坑災變'].includes(cause))e.text=`${when}，你在一場${cause}中離開人世，${tail}`;
  return e}}
/* danger: choices that were genuinely dangerous in their era. Exposure adds risk on top of annualQ(); base mortality is untouched */
Object.assign(JOB_T,{'漁工':44,'礦工':42,'海員':50});Object.assign(JOBLABEL,{'漁工':'遠洋漁船的船員','礦工':'礦工','海員':'跑船的海員'});Object.assign(JM,{'漁工':.9,'礦工':1.3,'海員':1.4});
const NEW_JOB=new Set(['漁工','礦工','海員']);
const nearById=id=>NEAR.find(n=>n.id===id);
const dFlavor=ref=>{if(!ref)return null;const [c,id]=ref.split('/');const x=(DCF.flavor[c]||[]).find(v=>v.id===id);return x&&x.text};
const deathQ=(d,y)=>Array.isArray(d)?((d.find(r=>y>=r[0]&&y<=r[1])||[0,0,0])[2]):(d||0);
function riskStart(s,ev,c){const r=c.risk;let until=r.once?s.t+1:r.years?s.t+r.years*12:1e9;
  if(r.untilY)until=Math.min(until,r.untilY*12+(r.untilM||1)-1);
  if(until<=s.t)return;
  const dur=Math.min(until,s.t+600)-s.t,dur2=Math.max(1,dur);const dm={};
  if(!r.once&&r.during&&r.during.length){const n=Math.min(r.during.length,1+(chance(.5)?1:0));shuffle(r.during.slice()).slice(0,n).forEach(t=>{let k=s.t+1+Math.floor(R()*dur2);while(dm[k])k++;dm[k]=t})}
  const job=c.job&&s.job;(s.risks=s.risks||[]).push({id:ev.id,r,from:s.t,until,dm,used:[],job,prevJob:s._prevJob});
  if(r.late){const L=r.late;const end=Math.min(until,s.t+600);(s.lates=s.lates||[]).push({id:ev.id,cause:L.cause,mult:L.mult,fromT:L.fromAge!=null?Math.max(s.t+1,s.t0+L.fromAge*12):end+(L.fromYearsAfter||0)*12,text:L.text,reveal:L.reveal,shown:0,rv:0})}}
function riskEnd(s,k,out,alive){const x=s.risks[k];s.risks.splice(k,1);if(!alive)return;const r=x.r;
  if(x.job&&s.job===x.job){const fb=r&&x.fallback;s.job=NEW_JOB.has(x.job)?(x.prevJob&&!NEW_JOB.has(x.prevJob)&&JOB_T[x.prevJob]&&!['退休','家管','失業'].includes(x.prevJob)?x.prevJob:(x.fallback||'營造')):s.job;s.jobStart=s.t+1}
  if(r.end&&!x.quit){out.push({pri:2,cat:'人生',tone:'neutral',text:fillPH(s,r.end.text)});if(r.end.fx)fx(s,r.end.fx)}
  if(!x.quit)mkHabit(s,r.habit)}
function riskTick(s){const t1=s.t+1,y1=Math.floor(t1/12),m1=t1%12+1,q=[];
  for(const L of (s.lates||[])){if(L.text&&!L.shown&&t1>=L.fromT){L.shown=1;q.push({pri:2,cat:'健康',tone:'bad',text:fillPH(s,L.text)})}
    if(L.reveal&&!L.rv&&y1>=L.reveal.y){L.rv=1;q.push({pri:2,cat:'生活',tone:'bad',text:fillPH(s,L.reveal.text)})}}
  for(let k=(s.risks||[]).length-1;k>=0;k--){const x=s.risks[k],r=x.r;
    if(x.job&&s.job!==x.job){x.quit=1;riskEnd(s,k,q,true);continue}
    if(t1>x.until){riskEnd(s,k,q,true);continue}
    const inM=!r.months||r.months.includes(m1);const per=r.once?1:r.months?r.months.length:12;
    if(inM&&!s.forceDeath){const dq=deathQ(r.death,y1);
      if(dq>0&&chance(dq/per)){
        if(chance(DG_SAVE)){const L=(r.near||[]).map((n,i)=>[n.ref?nearById(n.ref.split('/')[1]):n,i]).filter(([n,i])=>n&&!x.used.includes(i));if(L.length){const [n,i]=pick(L);x.used.push(i);q.push(Object.assign({pri:2},nearApply(s,n)))}}
        else{s.forceDeath=r.cause;s._dTxt=(r.deaths&&r.deaths.length?pick(r.deaths):dFlavor(r.deathFlavor))||null;s.risks.splice(k,1);continue}}
      if(r.injury>0&&chance(r.injury/per)){const L=(r.near||[]).map((n,i)=>[n.ref?nearById(n.ref.split('/')[1]):n,i]).filter(([n,i])=>n&&!x.used.includes(i));
        if(L.length){const [n,i]=pick(L);x.used.push(i);q.push(Object.assign({pri:2},nearApply(s,n)))}}
      else if(r.once&&r.safe){q.push({pri:2,cat:'人生',tone:'good',text:fillPH(s,r.safe)});if(r.fx)fx(s,r.fx)}}
    if(x.dm[t1]){q.push({pri:2,cat:'人生',tone:'neutral',text:fillPH(s,x.dm[t1])})}
    if(r.moneyPerYear&&(t1-x.from)%12===0)fx(s,{money:r.moneyPerYear});
    if(r.once&&s.risks[k]===x)s.risks.splice(k,1)}
  if(q.length)s.q.push(...q)}
{const st0=step;step=function(s){if(!s.dead&&((s.risks&&s.risks.length)||(s.lates&&s.lates.length)))riskTick(s);const out=st0(s);s._dTxt=s.dead?s._dTxt:null;return out}}
