/* ================= liking the same sex (content/sexuality.json; rules in content/FORMAT.md) ================= */
const sxT=(y,m)=>y*12+m-1;
const sxR=s=>!!(s.orient&&s.f.realized);
const sxPt=s=>s.married?spouse(s):s.rel&&s.rel.stage!=='met'?partnerOf(s):null;
const sxSame=s=>{const p=sxPt(s);return !!(p&&p.alive!==false&&p.sex===s.sex)};
const sxKnow=s=>s.f.know||'none';
const sxGay=s=>s.orient==='gay'&&s.f.realized;
/* a same-sex couple can marry from 2019-05-24 (the 登記 one-shot covers that May), a foreign partner from 2023-01-19, never one from 中國 */
const sxWait=(s,pt)=>s.t<=sxT(2019,5)||(pt&&pt.foreign&&(pt.foreign==='中國'||s.t<sxT(2023,1)));
if(SX.orient)(()=>{
 const L=SX.law,Y=(arr,y)=>(arr||[]).find(x=>!x.y||(y>=x.y[0]&&y<=x.y[1]))||(arr&&arr.length&&y>arr[arr.length-1].y[1]?arr[arr.length-1]:null);
 const ym=a=>sxT(a[0],a[1]);
 const regOK=s=>{const c=s.place==='台北縣'?'新北市':s.place==='桃園縣'?'桃園市':s.place.replace('縣','市');const f=L.partnerReg[c]||L.partnerReg.default;return s.t>=ym(f)&&s.t<=ym(L.partnerReg.until)};
 const trOK=(s,tr)=>{for(const t of [].concat(tr||[])){const v=s.ax[t.slice(0,-1)];if(v==null||(t.endsWith('+')?v<55:v>45))return false}return true};
 function sxOK(s,x,pt){if(x.y&&(s.y<x.y[0]||(s.y>x.y[1]&&!(x.y[1]>=2040))))return false;if(x.months&&!x.months.includes(s.m))return false;if(x.sex&&x.sex!==s.sex)return false;
  if(x.minAge!=null&&s.age<x.minAge)return false;if(x.maxAge!=null&&s.age>x.maxAge)return false;if(!needOK(s,x.need))return false;
  if(x.hasPt!=null&&x.hasPt!==sxSame(s))return false;if(x.know&&!x.know.includes(sxKnow(s)))return false;if(x.band&&x.band!==s.f.band)return false;
  if(x.after&&s.t<ym(x.after))return false;if(x.before&&s.t>=ym(x.before))return false;if(x.regOK&&!regOK(s))return false;
  if(x.trait&&!trOK(s,x.trait))return false;if(x.job&&!x.job.includes(s.job))return false;if(x.fam&&!x.fam.includes(s.fam))return false;if(x.urban!=null&&x.urban!==s.urban)return false;
  if(/\{[np]\}/.test(x.text)&&!pt)return false;if(/同事|公司|部門|主管/.test(x.text)&&!working(s))return false;if(/同學|班上|社團/.test(x.text)&&x.band!=='child'&&x.band!=='teen'&&!isStudent(s)&&s.age>=18)return false;return true}
 const sxFill=(s,t,pt)=>fillPH(s,t.replace(/\{same\}/g,s.sex==='M'?'男生':'女生').replace(/\{opp\}/g,s.sex==='M'?'女生':'男生'),pt);
 function sxPick(s,list,pt,o={}){const U=s.f.sxU||(s.f.sxU=[]);const all=(list||[]).filter(x=>sxOK(s,x,pt));let c=all.filter(x=>!U.includes(x.text));if(!c.length&&o.again)c=all;
  if(o.prefer){const h=c.filter(o.prefer);if(h.length)c=h}if(!c.length)return null;const v=pickW(c,x=>x.w||1);if(!U.includes(v.text))U.push(v.text);return sxFill(s,v.text,pt)}
 const goLine=(s,g,pt)=>Array.isArray(g)?sxPick(s,g,pt,{again:1}):g?sxFill(s,g,pt):'';
 const sxE=(text,cat,tone)=>({cat:cat||'人生',tone:tone||'neutral',text,_sx:1});
 const wPickK=w=>pickW(Object.keys(w).filter(k=>w[k]>0),k=>w[k]);
 for(const k of ['chosen_family','keep_quiet','say_it','paper_matters'])HW[k]=2;
 const hab=(s,when)=>{const h=(SX.habits||[]).find(x=>x.when===when);if(h)habit(s,h.k,h.say,h.does,h.why)};
 const reg=(s,when,pt)=>{const r=(SX.regrets||[]).find(x=>x.when===when);if(r)regret(s,r.k,sxFill(s,r.txt,pt),sxFill(s,r.why,pt),r.w)};

 /* nobody is born knowing: about a third get a 12–17 month of wondering, and the player decides. A forced orient (tests) realizes in childhood or the teens */
 {const nl0=newLife;newLife=function(by,F){const s=nl0(by,F);F=F||{};
  s.orient=F.orient!==undefined?F.orient:null;s.famOpen=clamp(50+25*(R()+R()-1),5,95);s.f.told={};s.f.know='none';
  if(F.orient===undefined){if(F.curious!==undefined?F.curious:chance(1/3))s.f.curT=s.t0+ri(12,17)*12+ri(0,11)}
  else if(s.orient){const co=SX.realize.cohorts.find(c=>s.by>=c.by[0]&&s.by<=c.by[1])||SX.realize.cohorts[SX.realize.cohorts.length-1];
   const band=F.band||wPickK({child:co.w.child,teen:co.w.teen}),b=SX.realize.bands[band];s.f.band=band;s.f.realizeT=s.t0+ri(b[0],b[1])*12+ri(0,11)}
  return s}}
 const sameW=s=>s.sex==='M'?'男生':'女生';
 const CU={gay:s=>`我應該是喜歡${sameW(s)}`,bi:()=>'男生女生我都會喜歡',none:()=>'應該只是好奇'};
 for(const sx of ['M','F']){const s0={sex:sx};LEAN['sx_curious:'+CU.gay(s0)]={open:.5,self:.4,rebel:.2};PULL['sx_curious:'+CU.gay(s0)]=()=>.085}
 LEAN['sx_curious:'+CU.bi()]={open:.6,self:.2};PULL['sx_curious:'+CU.bi()]=()=>.085;LEAN['sx_curious:'+CU.none()]={open:-.2,risk:-.2};
 const realizeNow=(s,o)=>{s.orient=o;s.f.realized=1;s.f.realY=s.y;s.f.realizeT=s.t;s.f.band=s.f.band||'teen';if(s.rel&&o==='gay'){const pt=partnerOf(s);if(pt&&pt.sex!==s.sex)s.f.passRel=1}};
 MS.push({id:'sx_curious',choice:1,check:s=>s.f.curT!=null&&!s.f.curDone&&!s.orient&&s.t>=s.f.curT&&s.age<=18,run:s=>{s.f.curDone=1;
  let t=null;for(const band of ['teen','child']){s.f.band=band;t=sxPick(s,SX.realize.lines.filter(x=>x.band===band));if(t)break}s.f.band=null;
  return {cat:'人生',title:`是不是喜歡${sameW(s)}`,text:(t||'')+`我是不是喜歡${sameW(s)}？`,_sx:1,choices:[
   {label:CU.gay(s),go:s=>{realizeNow(s,'gay');s.f.band='teen';key(s,`發現自己喜歡${sameW(s)}`);return `我在心裡偷偷承認了：我喜歡${sameW(s)}。這件事，我還沒有跟任何人說。`}},
   {label:CU.bi(),go:s=>{realizeNow(s,'bi');s.f.band='teen';key(s,'發現自己男生女生都會喜歡');return '我想了很久，發現喜歡一個人，跟對方是男生還是女生好像沒有關係。這件事，我還沒有跟任何人說。'}},
   {label:CU.none(),go:s=>{s.f.curNo=1;return '我跟自己說，應該只是一時好奇。過了一陣子，我就不太去想了。'}}]}}});
 {const cf=ctxFor;ctxFor=function(s,id){if(id==='sx_curious'){const n=s.y<2000?{text:'身邊的人不會把這種事說出來',norm:[CU.none()]}:s.y<2019?{text:'身邊開始有人私下說自己是同志',norm:[]}:{text:'身邊有人大方說自己喜歡同性',norm:[]};return n}return cf(s,id)}}

 /* realizing (forced orient only; the late bands and the married-life discovery no longer happen) */
 MS.push({id:'sx_realize',choice:1,check:s=>s.orient&&!s.f.realized&&s.f.realizeT!=null&&s.t>=s.f.realizeT,run:s=>{s.f.realized=1;s.f.realY=s.y;
  if(s.rel&&s.orient==='gay'){const pt=partnerOf(s);if(pt&&pt.sex!==s.sex)s.f.passRel=1}
  const t=sxPick(s,SX.realize.lines.filter(x=>x.band===s.f.band))||sxPick(s,SX.realize.lines);return t?sxE(t):null}});
 const ST=SX.pass.spouseTold;
 function spouseTold(s,sp,found){const w=Y(ST.w,s.y).w,k=wPickK(w);let t=found?sxPick(s,ST.found,sp)||'':'';
  if(k==='stay'){t+=sxPick(s,ST.stay,sp,{again:1})||'';s.f.spouseKnows=1}else{t+=sxPick(s,ST.split,sp,{again:1})||'';s.f.passMarry=0;s.f.pass=0;divorceEnd(s,sp)}return t}

 /* coming out */
 const CO=SX.comeout,targets=['friends','family','work'];
 const untold=s=>targets.some(k=>!s.f.told[k]);
 const coOK=(s,c)=>{const f=c.if||{};if(f.notTold&&f.notTold.some(k=>s.f.told[k]))return false;if(f.minAge!=null&&s.age<f.minAge)return false;if(!needOK(s,f.need))return false;return true};
 const coW=s=>(Y(CO.auto.w,s.y)||{}).w||{};
 for(const c of CO.choices){LEAN['comeout:'+c.label]=c.lean;PULL['comeout:'+c.label]=s=>{const n=Y(CO.normText,s.y);return (coW(s)[c.target]??1)*(n&&n.norm===c.label?1.5:1)*(c.target==='family'?.6:1)}}
 const coOnce=s=>{const pt=sxPt(s);const k=[];if(pt&&sxSame(s)&&s.rel&&s.t-s.rel.since>=24)k.push('pt24');if(s.t===sxT(2017,5))k.push('y2017');if(s.t===sxT(2019,5))k.push('y2019');return k.filter(x=>!(s.f.coOnce||[]).includes(x))};
 MS.push({id:'comeout',choice:1,check:s=>sxR(s)&&s.age>=15&&!abroad(s)&&untold(s)&&(((s.f.coN||0)<5&&s.t>=(s.f.coNext||0))||coOnce(s).length>0),run:s=>{
  const once=coOnce(s);(s.f.coOnce=s.f.coOnce||[]).push(...once);if(!once.length)s.f.coN=(s.f.coN||0)+1;s.f.coNext=s.t+ri(24,48);
  const pt=sxSame(s)?sxPt(s):null;const C=CO.choices.filter(c=>c.target==='pass'||coOK(s,c));if(C.length<2)return null;
  return {cat:'人生',title:CO.title,text:(sxPick(s,CO.text,pt,{again:1})||'')+sxFill(s,CO.ask,pt),_sx:1,choices:C.map(c=>({label:c.label,go:s=>{fx(s,c.fx||{});
   if(c.target==='pass'){s.f.pass=1;s.f.passT=s.f.passT??s.t;return goLine(s,c.go,pt)||'我把話吞回去。'}
   s.f.told[c.target]=1;if(c.target==='family'){s.f.pass=0;s.f.passT=null}return react(s,c.target,false,pt)}}))}}});
 {const cf=ctxFor;ctxFor=function(s,id){if(id==='comeout'){const n=Y(CO.normText,s.y);return n?{text:n.text,norm:[n.norm]}:null}return cf(s,id)}}

 /* how family, friends and work take it */
 const RF=SX.react.family,ORDER={none:0,reject:1,deny:2,silent:3,accept:4};
 function famReact(s,outed,pt){const b=Y(RF.base,s.y).w,T=RF.terms,w={};
  for(const k in b){let e=0;e+=(T.famOpen[k]||0)*(s.famOpen-50)/10;if(s.urban)e+=T.urban[k]||0;if(s.sex==='M'&&s.by<=1985)e+=T.sonDuty[k]||0;
   if(s.parBy!==undefined&&s.parBy<1940)e+=T.oldParents[k]||0;if(outed)e+=T.outed[k]||0;if(sxSame(s))e+=T.hasPt[k]||0;w[k]=b[k]*Math.exp(e)}
  const k=wPickK(w);s.f.know=k;if(s.rel&&k!=='deny')s.rel.blind=false;fx(s,RF.fx[k]||{});if(k==='reject'&&chance(RF.cutP))s.f.famCut=1;key(s,outed?'家裡知道了我的事':'跟家裡出櫃');
  if(k==='reject')hab(s,'reject');if(k==='accept')hab(s,'accept');
  let t=sxPick(s,RF.lines[k],pt,{again:1})||'';if(k==='reject'||k==='deny'){(s._help||(s._help=new Set())).add('同志')}return t}
 function react(s,target,outed,pt){
  if(target==='family')return famReact(s,outed,pt);
  if(target==='friends'){const R=SX.react.friends,k=wPickK(Y(R.w,s.y).w);fx(s,R.fx[k]||{});let t=sxPick(s,R.lines[k],pt,{again:1})||'';
   if(k==='spread'&&isStudent(s)&&!s.f.told.family&&parAlive(s)&&chance(.25)){s.f.told.family=1;s.f.outed=1;t+=famReact(s,true,pt)}return t}
  const R=SX.react.work,w=Object.assign({},Y(R.w,s.y).w);if(s.job==='公教'&&s.y<2015){w.gossip*=1.5;w.sidelined*=1.5}if(s.t>=ym(L.workProtect))w.fired*=.4;
  const k=wPickK(w);fx(s,R.fx[k]||{});const t=sxPick(s,R.lines[k],pt,{again:1})||'';if(k==='fired'){s.job='失業';s.needJob=true}return t}

 /* passing as straight: blind dates, the marry choice, a spouse who finds out */
 {const pc0=pickCh;pickCh=function(s,f){if(sxR(s)&&!['none','deny'].includes(sxKnow(s)))return pc0(s,x=>!x.blind&&(!f||f(x)));return pc0(s,f)}}
 {const mk0=mkPerson;mkPerson=function(s,role,o={}){if(role==='crush'&&sxR(s)&&(s.orient==='gay'||chance(SX.orient.biSame.p)))o=Object.assign({},o,{sex:s.sex});return mk0(s,role,o)}}
 {const pt0=pairTry;pairTry=s=>sxR(s)?null:pt0(s)}
 {const cl0=commitLine;commitLine=function(s,sp){if(sp&&sp.sex===s.sex)return '';return cl0(s,sp)}}
 {const mp0=meetPartner;meetPartner=function(s,o={}){const pt=mp0(s,o);const blind=o.c&&o.c.blind;
  const same=sxR(s)&&!blind&&(s.orient==='gay'?!(s.f.pass&&chance(.3)):chance(SX.orient.biSame.p*(s.f.pass?.5:1)));
  if(same){pt.sex=s.sex;pt.given=rollGiven(s,pt.by,pt.sex,pt.eth);if(pt.tribal)pt.tribal=pick(GN_IND[pt.sex])}return pt}}
 {const rm0=relMeet;relMeet=function(s){const m=rm0(s);if(m.pt.sex===s.sex){m.blind=false;const v=sxPick(s,SX.couple.meet,m.pt);if(v)m.text=v+(m.pt.job?`${pr(m.pt)}是${JOBLABEL[m.pt.job]}。`:`${pr(m.pt)}還在讀書。`);m._sx=1}
  else if(m.blind&&sxGay(s)&&sxKnow(s)==='deny'){const v=sxPick(s,SX.pass.blind.deny,m.pt,{again:1});if(v)m.text=v}return m}}
 {const mt=MS.find(x=>x.id==='meet'),mc=mt.check;mt.check=s=>mc(s)&&(!(s.orient==='gay'&&!s.f.realized&&s.age>=18)||chance(.6))}
 {const fw=MS.find(x=>x.id==='foreignwife'),fc=fw.check;fw.check=s=>fc(s)&&!(sxGay(s)&&!s.f.pass)}
 {const kd=MS.find(x=>x.id==='kid'),kc=kd.check;kd.check=s=>kc(s)&&!sxSame(s)}
 const PM=SX.pass.marry;
 for(const c of PM.choices)if(c.label!=='結婚')LEAN['marry:'+c.label]=c.lean;
 for(const c of SX.couple.cohab.choices)if(!LEAN['marry:'+c.label])LEAN['marry:'+c.label]=c.lean;
 const passing=s=>{const pt=partnerOf(s);return sxGay(s)&&pt&&pt.sex!==s.sex};
 {const mar=MS.find(x=>x.id==='marry'),mc0=mar.check,mr0=mar.run;
  mar.check=s=>{if(!mc0(s))return false;const pt=partnerOf(s);if(pt&&pt.sex===s.sex)return !(s.f.cohab&&sxWait(s,pt));if(passing(s))return !!s.f.pass;return true};
  mar.run=s=>{const pt=partnerOf(s);
   if(pt&&pt.sex===s.sex&&sxWait(s,pt)&&!s._regNow){const C=SX.couple.cohab;return {cat:'人生',title:C.title,text:sxPick(s,C.text,pt,{again:1}),_sx:1,choices:C.choices.map(c=>({label:c.label,go:s=>{fx(s,c.fx||{});const t=goLine(s,c.go,pt);
    if(c.then==='cohab'){s.f.cohab=1;s.f.cohabT=s.t;if(s.rel)s.rel.stage='cohab';key(s,`跟${nm(pt)}住在一起`);storyAdd(s,pt,'跟你住在一起')}else s.f.noMarryUntil=s.t+18;return t}}))}}
   const e=mr0(s);if(!e||!e.choices)return e;if(sxR(s)&&!['none','deny'].includes(sxKnow(s)))e.text=e.text.replace('家裡一直在催。','');
   const g0=e.choices[0].go;
   if(pt&&pt.sex===s.sex){e.choices[0].go=s=>{const r=g0(s);if(!s.married)return sxClean(s,r)||'可是那一年，事情一直沒有談成。';s.f.cohab=0;key(s,'登記結婚');hab(s,'married2019');
     return (sxPick(s,SX.couple.marry.lines,pt)||'')+r.replace(/^[^。]*(婚禮|喜酒|婚紗)[^。]*。/,'')};return e}
   if(passing(s)){e.title=PM.title;e.text=sxPick(s,PM.text,pt,{again:1});e._sx=1;e.choices=PM.choices.map(c=>({label:c.label,go:s=>{fx(s,c.fx||{});const t=goLine(s,c.go,pt);
     if(c.then==='marry'){const r=g0(s);if(s.married){s.f.passMarry=1;reg(s,'passMarry',pt)}return t+r.replace(/^[^。]*(婚禮|喜酒|婚紗)[^。]*。/,'')}
     if(c.then==='tell'){if(s.y>=2000&&chance(.2)){const r=g0(s);if(s.married){s.f.formal=1;s.f.passMarry=0;key(s,'形式婚姻')}return t+(sxPick(s,PM.formal,pt,{again:1})||'')+r.replace(/^[^。]*(婚禮|喜酒|婚紗)[^。]*。/,'')}
       const end=sxPick(s,PM.end,pt,{again:1})||'';relEnd(s);return t+end}
     relEnd(s);return t}}));return e}
   return e}}
 /* 2019-05: couples already living together get to register (a foreign partner: 2023-01) */
 MS.push({id:'sx_reg',choice:1,check:s=>{if(!(s.f.cohab&&!s.married&&!s.f.regAsk&&sxSame(s)&&s.rel))return false;const pt=partnerOf(s);return pt.foreign?!sxWait(s,pt):s.t>=sxT(2019,5)},run:s=>{s.f.regAsk=1;const pt=partnerOf(s);s.rel.stage='ready';s.rel.readyT=-999;
  const mar=MS.find(x=>x.id==='marry');let e;s._regNow=1;try{e=mar.run(s)}finally{s._regNow=0}if(!e||!e.choices)return e;e.title='登記結婚';
  e.text=(s.t===sxT(2019,5)?'同婚可以登記了。':pt.foreign?'跨國同婚也可以登記了。':'同婚已經可以登記了。')+`要跟${nm(pt)}去登記嗎？`;return e}});
 PULL['sx_reg:結婚']=()=>3;LEAN['sx_reg:結婚']=LEAN['marry:結婚'];

 /* children for a same-sex couple */
 const KD=SX.kids;
 for(const c of KD.choices)LEAN['sx_kids:'+c.label]=c.lean;
 const kOK=(s,c)=>{const f=c.if||{};if(f.coupleSex&&f.coupleSex!==s.sex)return false;if(f.y&&(s.y<f.y[0]||(s.y>f.y[1]&&f.y[1]<2040)))return false;if(f.moneyAtLeast!=null&&s.money<f.moneyAtLeast)return false;return true};
 MS.push({id:'sx_kids',choice:1,check:s=>sxSame(s)&&(s.married||s.f.cohab)&&!s.f.noKids&&(s.f.sxKidTry||0)<2&&!s.babyDue&&s.kids<2&&s.age<=45&&s.t>=(s.f.cohabT??s.marriedT??0)+24&&s.t>=(s.f.sxKidNext||0)&&chance(.02),run:s=>{
  s.f.sxKidTry=(s.f.sxKidTry||0)+1;s.f.sxKidNext=s.t+36;const pt=sxPt(s);const C=KD.choices.filter(c=>kOK(s,c));if(C.length<2)return null;
  return {cat:'人生',title:KD.title,text:sxPick(s,KD.text,pt,{again:1})+'要有孩子嗎？',_sx:1,choices:C.map(c=>({label:c.label,go:s=>{fx(s,c.fx||{});
   if(c.id==='none'){s.f.noKids=1;return goLine(s,c.go.ok,pt)}
   let p=c.pAfter&&s.t>=ym(c.pAfter.y)?c.pAfter.p:c.p;if(s.age>40)p*=.7;
   if(!chance(p))return goLine(s,c.go.fail,pt);
   if(c.id==='adopt'){s.babyDue=s.t+ri(12,36);s.f.sxCarry='adopt'}else{s.babyDue=s.t+10;s.f.sxCarry=c.id==='surrogacy'?'surrogate':s.age<=40&&chance(.5)?'me':'pt'}
   return goLine(s,c.go.ok,pt)}}))}}});
 {const bi=MS.find(x=>x.id==='birth'),b0=bi.run;bi.run=s=>{const c=s.f.sxCarry;if(!c){const e=b0(s);if(e&&sxSame(s)){const k=kidsOf(s).pop();if(k){e.text=`${k.given}出生了。家裡又多了一個小小的人。`;e._sx=1}}return e}s.f.sxCarry=null;const e=b0(s);const k=kidsOf(s).pop();const pt=sxPt(s);
  const t=c==='adopt'?`孩子來到我們家了。我們幫${k?pr(k):'他'}取名叫${k?k.given:''}。`:(sxPick(s,KD.birth.filter(x=>x.carry===c),pt,{again:1})||'孩子出生了。')+(k?`我們幫${pr(k)}取名叫${k.given}。`:'');
  e.text=t;e._sx=1;return e}}

 /* dating lines for a same-sex couple, and a passing relationship that cannot go on */
 {const rs=MS.find(x=>x.id==='relstep'),r0=rs.run;rs.run=s=>{const st=s.rel&&s.rel.stage,pt=partnerOf(s);
  if(st==='ready'&&passing(s)&&!s.f.pass&&chance(.3))return relEnd(s);
  const e=r0(s);if(!e||!pt||pt.sex!==s.sex||st==='met')return e;const C=SX.couple;let v=null;
  if(!s.rel)v=chance(.85)&&sxPick(s,C.breakup,pt);
  else if(st==='dating'||(st==='habit'&&e.tone==='good'))v=chance(.45)&&sxPick(s,C.date,pt,{prefer:x=>sxKnow(s)!=='accept'?x.hidden:!x.hidden});
  else if(st==='family')v=chance(.8)&&sxPick(s,C.family,pt);
  else if(st==='ready')v=chance(.5)&&sxPick(s,C.ready,pt);
  if(v){e.text=v;e._sx=1}return e}}
 {const ps0=peopleSection;peopleSection=function(s){ROLE_LBL.partner='伴侶';const tmp=[];for(const p of s.people)if(p.role==='partner'&&!(s.f.cohab&&p.id===s.f.ptId)){tmp.push(p);p.role='_dating'}
  let h;try{h=ps0(s)}finally{for(const p of tmp)p.role='partner'}
  if(s.f.cohab&&!h.includes('伴侶')){const p=partnerOf(s);if(p)h=h.replace('</ul>',`<li><b>伴侶</b><span>${esc(fullName(p))}<span class="muted small">（${p.by}–）</span></span></li></ul>`)}
  if(sxR(s)&&!s.f.told.family&&s.age>=25)h=`<p class="small" style="margin:0 0 8px">這件事，你一輩子沒有跟家裡說。</p>`+h;return h}}
 {const a0=afT;afT=function(s,t,sp,who){if((sp&&sp.sex===s.sex)||(who==='self'&&(s.orient==='gay'||s.f.secretSame))){s._oSex=sp&&sp.sex===s.sex&&who!=='self'?'X':s.sex;const r=fillPH(s,t,sp);s._oSex=null;return r}return a0(s,t,sp,who)}}

 /* every month: the family finds out, softens, the new-year questions, era lines */
 const AMB=SX.ambient.lines;
 {const st0=step;step=function(s){const out=st0(s);if(s.dead||!s.orient||!s.f.realized)return out;if(out.some(e=>e.death))return out;
  const pt=sxSame(s)?sxPt(s):null;const say=(t,cat,tone)=>{if(t)out.push(sxE(t,cat,tone))};
  if(out.some(e=>e.id==='parentdie')&&s.f.parentdie&&!s.f.told.family)reg(s,'neverToldDead');
  if(s.f.cohab&&s.rel&&s.rel.stage==='cohab'&&!sxWait(s,pt)&&s.t>sxT(2019,6))s.rel.stage='ready';
  if(s.f.cohab&&!s.married&&(!pt||!s.rel)){s.f.cohab=0}
  if(s.f.cohab&&s.rel&&chance(.0025)){const v=sxPick(s,SX.couple.breakup,pt);s.f.cohab=0;const r=relEnd(s);say(v||r.text,'人生','bad');return out}
  if(!s.f.told.family&&!s.f.outedDone&&s.age>=13&&parAlive(s)&&s.place===s.birthCounty&&chance(pt?.0012:s.y>=2000?.0003:0)){
   const v=sxPick(s,SX.react.outed.lines.filter(x=>pt||!x.hasPt),pt);if(v){s.f.outedDone=1;s.f.told.family=1;s.f.outed=1;s.f.pass=0;say(v+famReact(s,true,pt),'家庭','bad');return out}}
  if(s.m===s.bm){const k=sxKnow(s);
   if(parAlive(s)&&['deny','silent','reject'].includes(k)){let p=Y(SX.react.soften.p,s.y).p;if(pt&&s.rel&&s.t-s.rel.since>=36)p*=1.5;if(s.f.gk)p*=2;
    if(chance(p)){const to=k==='reject'?'silent':k==='deny'?(chance(.5)?'silent':'accept'):'accept';const v=sxPick(s,SX.react.soften.lines[k+'-'+to],pt,{again:1});s.f.know=to;if(s.rel)s.rel.blind=false;if(k==='reject')s.f.famCut=0;if(to==='accept')hab(s,'accept');if(v){say(v,'家庭','good');return out}}}
   if(s.f.pass&&s.f.passT!=null&&s.t-s.f.passT>=120)hab(s,'passLong');
   if(pt&&s.rel&&s.t-s.rel.since>=60&&k!=='accept')reg(s,'hiddenLong',pt);
   if(s.f.passMarry&&!s.f.formal&&s.married&&chance(.02)){const sp=spouse(s);if(sp){say(spouseTold(s,sp,true),'家庭','bad');return out}}}
  if(s.married&&pt&&s.kids&&!s.f.stepAd&&s.t>=sxT(2019,5)&&chance(.03)){s.f.stepAd=1;key(s,'辦了繼親收養');say(KD.stepAdopt.text,'家庭','good');return out}
  if(out.some(e=>e.choices))return out;
  if(s.m<=2&&s.age>=18&&parAlive(s)&&s.t-(s.f.sxNY??-99)>=24&&chance(.3)){const v=sxPick(s,SX.pass.newyear,pt);if(v){s.f.sxNY=s.t;say(v,'家庭');return out}}
  const amb=AMB.filter(x=>!(s.f.sxU||[]).includes(x.text)&&sxOK(s,x,pt)&&(!x.region||x.region.includes(RG(s))));
  const hot=amb.filter(x=>x.y&&x.y[0]===x.y[1]&&x.months);
  if(hot.length&&chance(.4)){say(sxPick(s,hot,pt),'生活');return out}
  if(s.t-(s.f.sxAmbT??-99)>=36&&chance(.012)){const v=sxPick(s,amb.filter(x=>!hot.includes(x)),pt);if(v){s.f.sxAmbT=s.t;say(v,'生活');return out}}
  if((s.f.pass||(!s.f.told.family&&s.age>25))&&s.t-(s.f.sxPassT??-99)>=36&&chance(.01)){const v=sxPick(s,SX.pass.lines,pt);if(v){s.f.sxPassT=s.t;say(v,'人生','bad');return out}}
  if(s.f.cohab&&!s.married&&s.t-(s.f.sxCoT??-99)>=36&&chance(.012)){const v=sxPick(s,SX.couple.cohab.lifeLines,pt);if(v){s.f.sxCoT=s.t;say(v,'生活','bad');return out}}
  if(s.married&&pt&&s.t-(s.f.sxAftT??-99)>=36&&chance(.006)){const v=sxPick(s,SX.couple.marry.after,pt);if(v){s.f.sxAftT=s.t;say(v,'家庭');return out}}
  if(s.f.passMarry&&!s.f.formal&&s.married){const sp=spouse(s);
   if(sp&&s.t<sxT(2020,6)&&s.t-(s.f.sxHtT??-99)>=36&&chance(.015)){const v=sxPick(s,SX.pass.heart,sp);if(v){s.f.sxHtT=s.t;say(v,'人生');return out}}
   if(sp&&s.t>=sxT(2020,6)&&!s.aff&&!s.f.selfAffN&&s.age>=26&&s.age<=65&&chance(.003)){const v=sxPick(s,SX.pass.secret,sp);if(v){s.f.selfAffN=1;s.f.secretSame=1;s.aff={who:'self',pid:sp.id,t:s.t,next:s.t+ri(3,6)};key(s,`私下跟一個${s.sex==='M'?'男生':'女生'}來往`);say(v,'家庭');return out}}}
  if(s.f.formal&&s.t-(s.f.sxFmT??-99)>=36&&chance(.01)){const v=sxPick(s,SX.pass.formalLines,spouse(s));if(v){s.f.sxFmT=s.t;say(v,'家庭');return out}}
  return out}}
 /* kin_advice's new-year dating questions give way to the lines above */
 {const so=sentOK;sentOK=function(s,x){if(sxR(s)&&s.m<=2&&/(對象|交男朋友|交女朋友|什麼時候(要)?結婚|什麼時候嫁)/.test(x))return false;return so(s,x)}}
})();

//@include data/fn.js
