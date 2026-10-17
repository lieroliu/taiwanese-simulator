/* ================= content files (history_variants / early_childhood / romance) ================= */
function fillPH(s,t,pt){const L=LC(s);return t.replace(/\{n\}/g,pt?nm(pt):'對方').replace(/\{p\}/g,pt?pr(pt):'他').replace(/\{spot\}/g,L.spot).replace(/\{nm\}/g,L.nm).replace(/\{food\}/g,L.food).replace(/\{temple\}/g,L.temple).replace(/\{elders\}/g,elders(s))}
const NEED={parentsAlive:s=>parAlive(s),working:s=>working(s),kids:s=>s.kids>0,student:s=>isStudent(s)||s.age<18,married:s=>s.married,rural:s=>!s.urban,urban:s=>s.urban};
const needOK=(s,n)=>!n||[].concat(n).every(k=>!NEED[k]||NEED[k](s));
const inY=(s,y)=>!y||(y.length===2&&y[1]-y[0]>1&&!y.includes(s.y)?(s.y>=y[0]&&s.y<=y[1]):y.length===2?(s.y>=y[0]&&s.y<=y[1]):y.includes(s.y));
/* history takeaways merge into PERS */
for(const k in HVP){if(k.startsWith('_'))continue;PERS[k]=(PERS[k]||[]).concat(HVP[k].map(v=>[v.axis,v.dir,v.text,v]))}
/* early childhood */
const anyOf=(v,x)=>v==null||(Array.isArray(v)?v.includes(x):v===x);
function ecOK(s,e){if(s.age<e.minAge||s.age>e.maxAge)return false;if(e.by&&(s.by<e.by[0]||s.by>e.by[1]))return false;if(e.y&&!e.y.includes(s.y))return false;if(e.months&&!e.months.includes(s.m))return false;
  if(!anyOf(e.region,regionOf(s.place))||!anyOf(e.county,s.place)||!anyOf(e.eth,s.eth)||!anyOf(e.pjob,s.pjob))return false;if(e.urban!=null&&e.urban!==s.urban)return false;
  if(e.sex&&e.sex!==s.sex)return false;if(e.fam&&!anyOf(e.fam,s.fam))return false;if(e.inc&&!anyOf(e.inc,s.inc))return false;if(e.juancun!=null&&!!s.juancun!==e.juancun)return false;
  if(e.tribe&&!e.tribe.includes(s.tribe))return false;if(e.momFrom&&!e.momFrom.includes(s.momFrom))return false;if(e.group&&s.f['eg_'+e.group])return false;return true}
if(EC.length){for(let i=PE.length-1;i>=0;i--)if(PE[i].id.startsWith('e0_'))PE.splice(i,1);
  for(const e of EC)PE.push({id:'e0_'+e.id,p:s=>s.age<=6&&(s.f.e0n||0)<5&&!s.f['e0_'+e.id]&&ecOK(s,e)?(e.y||e.months?.1:.008)*(e.weight||1):0,
    run:s=>{s.f['e0_'+e.id]=1;s.f.e0n=(s.f.e0n||0)+1;if(e.group)s.f['eg_'+e.group]=1;if(e.fx)fx(s,e.fx);if(e.flag)s.f[e.flag]=1;return {tone:e.tone||'neutral',cat:e.cat||'家庭',text:fillPH(s,e.text)}}})}
/* romance pools */
function rmPick(s,pool,f){const L=(RM[pool]||[]).filter(x=>(parAlive(s)||!/(我爸|我媽|爸媽|你爸|你媽)/.test(x.text))&&inY(s,x.y)&&(x.minAge==null||s.age>=x.minAge)&&(x.maxAge==null||s.age<=x.maxAge)&&(!x.sex||x.sex===s.sex)&&needOK(s,x.need)&&(!f||f(x))&&splitSent(x.text).every(z=>sentOK(s,z)));
  s._rmU=s._rmU||new Set();const c=L.filter(x=>!s._rmU.has(x.text));const v=c.length?pick(c):null;if(v)s._rmU.add(v.text);return v}
const RM_LATER=/(交往|再結一次婚)/;
const rmT=(s,v)=>v?fillPH(s,v.text,partnerOf(s)):null;
const RM_COMMIT=(RM.ready||[]).filter(x=>x.commit);if(RM.ready)RM.ready=RM.ready.filter(x=>!x.commit&&!/登記|求婚|喜餅|懷孕/.test(x.text));
(()=>{if(!RM.date)return;
 const D0=DATE;DATE=s=>{if((s.f.divorced||s.f.widowed)&&chance(.5)){const v=rmPick(s,'remarry',x=>RM_LATER.test(x.text));if(v)return rmT(s,v)}return chance(.6)?(rmT(s,rmPick(s,'date'))||D0(s)):D0(s)};
 const H0=HABIT;HABIT=s=>{const pt=partnerOf(s);if(chance(.6)){const v=rmPick(s,'habit',x=>!x.axis||Math.abs(s.ax[x.axis]-(pt.ax[x.axis]??50))>15);if(v)return [rmT(s,v),v.delta??-2]}return H0(s)};
 const F0=FIGHT;FIGHT=s=>chance(.6)?(rmT(s,rmPick(s,'fight'))||F0(s)):F0(s);
 const M0=MAKEUP;MAKEUP=s=>chance(.6)?(rmT(s,rmPick(s,'makeup'))||M0(s)):M0(s);
 const fm0=famMeet;famMeet=s=>{const pt=partnerOf(s),side=s.eth==='外省'?'外省':s.eth==='原住民'?'原住民':'本省';
   const C={mixed_wai:s.y<1992&&pt.eth!==s.eth&&(pt.eth==='外省'||s.eth==='外省'),poor:s.money<30,lang:pt.eth!==s.eth&&['閩南','客家','原住民'].includes(pt.eth),ind:pt.eth==='原住民'||s.eth==='原住民',newimm:s.eth==='新住民子女',rich:s.money<45&&chance(.25),house:s.y>=2005&&s.house!=='own',bazi:s.eth!=='原住民'&&chance(.12),eldest:s.sex==='F'&&chance(.3),faith:chance(.08),divorced:!!s.f.divorced,ok:true};
   const ok=x=>C[x.cond]&&(!x.me||x.me===side)&&(!x.ptEth||x.ptEth===pt.eth);
   const special=rmPick(s,'family',x=>x.cond!=='ok'&&ok(x));const v=special&&chance(.75)?special:rmPick(s,'family',x=>x.cond==='ok'&&ok(x));
   if(!v||chance(.3))return fm0(s);return [rmT(s,v),v.delta??0,v.cond==='mixed_wai']};
 const e0=relEnd;relEnd=(s,why)=>{let w=why||(chance(.25)?pick(['cheat','future']):'plain');const v=rmPick(s,'breakup',x=>x.why===w);if(!v||chance(.3))return e0(s,why);const t=rmT(s,v);const r=e0(s,why);r.text=t;return r};
 const mt0=relMeet;relMeet=s=>{const m=mt0(s);if(!m.blind&&chance(.55)){const v=rmPick(s,'meet');if(v)m.text=fillPH(s,v.text,m.pt)+(m.pt.job?`${pr(m.pt)}是${JOBLABEL[m.pt.job]}。`:'')}
   else if(m.blind&&chance(.6)){const v=rmPick(s,'blind');if(v)m.text=fillPH(s,v.text,m.pt)}
   if((s.f.divorced||s.f.widowed)&&!s.married){const v=rmPick(s,'remarry',x=>!RM_LATER.test(x.text));if(v)m.text=fillPH(s,v.text,m.pt)}return m};
 const meet=MS.find(x=>x.id==='meet'),mc=meet.check;meet.check=s=>mc(s)||(!s.married&&!s.rel&&(s.f.divorced||s.f.widowed)&&!s.f.separated&&s.age>=30&&s.age<=75&&s.t>=(s.f.relCool||0)&&chance(.004));
 const cf=MS.find(x=>x.id==='confess'),cr=cf.run;cf.run=s=>{const e=cr(s);if(!e||!e.choices)return e;const g=e.choices[0].go;e.choices[0].go=s=>{const r=g(s);if(!s.rel||s.rel.blind||!chance(.6))return r;const v=rmPick(s,'together');return v?rmT(s,v):r};return e};
 const st=MS.find(x=>x.id==='relstep'),sr=st.run;st.run=s=>{if(s.rel&&s.rel.stage!=='met'&&s.sex==='M'&&s.t<(s.inServiceUntil||0)&&!s.rel.blind&&chance(.12)&&!s.f.army){s.f.army=1;s.rel.last=s.t;return relEnd(s,'army')}
   if(s.rel&&s.rel.stage==='ready'&&chance(.5)){const v=rmPick(s,'ready');if(v){s.rel.last=s.t;s.rel.score+=2;return {tone:'good',cat:'人生',text:rmT(s,v)}}}return sr(s)};
})();
