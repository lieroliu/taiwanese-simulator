/* ================= partners.json: background, ways to meet, two people, fit, in-laws ================= */
//@include data/pt.js
//@include data/af.js
const at3=(t,y,d=0)=>{if(!t)return d;const r=t.find(r=>y>=r[0]&&y<=r[1]);return r?r[2]:d};
const atMin=(t,v)=>{for(const r of t)if(v>=r[0])return r[1];return t[t.length-1][1]};
const ri=(a,b)=>a+Math.floor(R()*(b-a+1));
const CN_NUM=['零','一','兩','三','四','五','六','七','八','九'];
const famIdx=l=>{const L=PT.profile?PT.profile.famLevels:['拮据','小康','寬裕','富裕'];return Math.max(0,L.indexOf(l==='欠債'?'拮据':l))};
const myFamIdx=s=>s.famW===undefined?({'低':0,'中':1,'高':2}[s.inc]??1):famIdx(famLabel(s));
function meRoll(s){if(s.f.eldR||!PT.profile)return;s.f.eldR=1;s.f.only=chance(at3(PT.profile.only,s.by));s.f.eldest=s.f.only||chance(at3(PT.profile.eldest,s.by))}
function ptParAlive(s,p){if(p.parDie==null)p.parDie=p.by-28+74+ri(0,16);return s.y<p.parDie}
const ptU=s=>s._ptU||(s._ptU=new Set());
function ptPick(s,L,pt){const U=ptU(s);const c=L.filter(x=>!U.has(x.text)&&txtOK(s,fillPH(s,x.text,pt)));const v=c.length?pick(c):null;if(v)U.add(v.text);return v}
const ptLine=(s,L,pt)=>{const v=ptPick(s,L,pt);return v?fillPH(s,v.text,pt):null};
const tOK=(s,x)=>(parAlive(s)||!/(媽媽|爸爸|爸媽|我媽|我爸)/.test(x.text))&&inY(s,x.y)&&(!x.sex||x.sex===s.sex)&&needOK(s,x.need)&&(x.minAge==null||s.age>=x.minAge)&&(x.maxAge==null||s.age<=x.maxAge)&&(!x.moved||s.place!==s.birthCounty)&&(!x.myJob||(working(s)&&x.myJob.includes(s.job)));
const PT_HOW={matchmaker:'經媒人介紹',family:'經長輩安排相親',workFactory:'在工廠',workOffice:'',friends:'經朋友介紹',school:'在學校',mixer:'在聯誼的時候',hometown:'在老家',faith:'在一次廟會上',letters:'透過寫信',bbs:'在 BBS 上',msn:'在 MSN 上',fb:'在臉書上',app:'在交友軟體上',wedding:'在朋友的婚禮上'};
function chOK(s,c){if(!(at3(c.w,Math.min(s.y,2040))>0))return false;if(c.minAge!=null&&s.age<c.minAge)return false;if(c.maxAge!=null&&s.age>c.maxAge)return false;if(c.sex&&c.sex!==s.sex)return false;if(!needOK(s,c.need))return false;
  if(c.myJob&&!(working(s)&&c.myJob.includes(s.job)))return false;if(c.moved&&s.place===s.birthCounty)return false;return true}
function pickCh(s,f){const L=(PT.channels?PT.channels.list:[]).filter(c=>chOK(s,c)&&(!f||f(c)));return L.length?pickW(L,c=>at3(c.w,Math.min(s.y,2040))*(s.urban?(c.urban||1):(c.rural||1))):null}
const chById=id=>(PT.channels?PT.channels.list:[]).find(c=>c.id===id);
function ptEth(s,c,o){if(o.eth==='same')return s.eth==='新住民子女'?'閩南':s.eth;if(o.eth==='cross')return ['閩南','客家'].includes(s.eth)?'外省':'閩南';
  const es=c&&c.ethSame!=null?c.ethSame:.7;if(s.eth!=='新住民子女'&&chance(es))return s.eth;return pickW([['閩南',70],['客家',13],['外省',12],['原住民',3]],x=>x[1])[0]}
function ptProfile(s,pt,c,o){const pf=PT.profile;if(!pf)return;const sim=pf.sim+(c&&c.simAdd||0)+(o.simAdd||0),sh=Object.assign({},c&&c.shift);for(const k in o.shift||{})sh[k]=(sh[k]||0)+o.shift[k];
  for(const k of pf.axes){const me=k==='eng'?(s.eng??50):(s.ax[k]??50);pt.ax[k]=clamp(50+sim*(me-50)+(R()-.5)*2*pf.noise+(sh[k]||0),0,100)}
  pt.wantKids=clamp(.5+(50-pt.ax.self)/80+(pt.by<1975?.2:0));
  const fs=c&&c.famSame!=null?c.famSame:pf.famSame;
  if(chance(fs))pt.pjob=s.pjob;else{const row=pf.pjob.find(r=>pt.by>=r[0]&&pt.by<=r[1])||pf.pjob[pf.pjob.length-1];pt.pjob=pickW(Object.entries(row[2]),([k,w])=>w*(k==='農'?(s.urban?.5:2):1))[0]}
  let i=myFamIdx(s);if(!chance(fs))i+=(chance(pf.famStep.one)?1:2)*(chance(.5)?1:-1);pt.fam=pf.famLevels[clamp(i,0,pf.famLevels.length-1)];
  pt.only=chance(at3(pf.only,pt.by));pt.eldest=pt.only||chance(at3(pf.eldest,pt.by));
  const sb=at3(pf.sibs,pt.by,[1,2]);pt.sibs=pt.eldest&&!pt.only?ri(sb[0],sb[1]):0}
meetPartner=function(s,o={}){const older=s.sex==='M'?-1:1;const by=Math.min(o.by??(s.by+older*Math.floor(R()*5)),s.y-18);const c=o.c||null;
  const age=s.y-by;let job=null,stud=false;const pj=o.job||(c&&c.ptJob);
  if(pj==='same'&&s.job&&working(s))job=s.job;else if(pj==='student')stud=true;else if(Array.isArray(pj)&&(age>=22||o.job))job=pick(pj);
  const pt=mkPerson(s,'partner',{by,sex:s.sex==='M'?'F':'M',eth:ptEth(s,c,o),job:job||undefined});
  if(stud)pt.job=null;else if(o.needJob&&!pt.job)pt.job=pJob(pt,s.y);
  ptProfile(s,pt,c,o);pt.ch=c?c.id:null;pt.chLbl=c?c.label:null;
  pt.home=chance(o.sameCounty??(c&&c.sameCounty)??.5)?s.birthCounty:null;
  if(!o.noBind)s.f.ptId=pt.id;return pt};
function ptDescribe(s,pt){const D=PT.describe;if(!D||s.y-pt.by>45)return '';
  if((pt.eldest||pt.only)&&chance(.5)){const t=ptLine(s,D.eldest.filter(x=>x.ptSex===pt.sex&&!!x.only===!!pt.only&&(pt.only||pt.sibs>0)),pt);if(t)return t}
  return ptLine(s,D.bg.filter(x=>(!x.pjob||x.pjob===pt.pjob)&&(!x.fam||x.fam.includes(pt.fam))&&inY(s,x.y)&&(!x.ptSex||x.ptSex===pt.sex)),pt)||''}
if(PT.channels)relMeet=function(s){const ab=abroad(s),re=(s.f.divorced||s.f.widowed)&&!s.married;const c=pickCh(s,ab||re?x=>!x.blind:null)||chById('friends');
  const blind=!!c.blind;const pt=meetPartner(s,{c});const n=nm(pt),p=pr(pt);
  let t=ptLine(s,(c.texts||[]).filter(x=>tOK(s,x)),pt);
  if(!t)t=ptLine(s,(RM.meet||[]).concat(RM.blind||[]).filter(x=>x.ch===c.id&&tOK(s,x)&&(parAlive(s)||!/(我爸|我媽)/.test(x.text))&&(x.ptJob!=='same'||pt.job===s.job)&&(x.ptJob!=='student'||!pt.job)),pt);
  if(!t)t=`我${c.id==='workOffice'?({'公教':'在單位上','醫護':'在醫院','台幹':'在廠裡'}[s.job]||'在公司'):PT_HOW[c.id]||'經朋友介紹'}認識了${n}。`;
  if((s.f.divorced||s.f.widowed)&&!s.married){const v=rmPick(s,'remarry');if(v)t=fillPH(s,v.text,pt)}
  t+=(pt.job?`${p}是${JOBLABEL[pt.job]}。`:`${p}還在讀書。`)+ptDescribe(s,pt);
  return {blind,pt,text:t,c}};
function compat(s,pt){const C=PT.compat;if(!C)return 100-(Math.abs(s.ax.self-pt.ax.self)+Math.abs(s.ax.risk-pt.ax.risk))/2;let a=0,W=0;
  for(const k in C.w){if(k==='eng'&&s.y<C.engFrom)continue;const me=k==='eng'?(s.eng??50):(s.ax[k]??50);a+=C.w[k]*Math.abs(me-(pt.ax[k]??50));W+=C.w[k]}
  const g=pt.fam?Math.max(0,Math.abs(myFamIdx(s)-famIdx(pt.fam))-1):0;return 100-a/W-g*C.famPenalty}
relCompat=compat;
/* what the fight is about: the biggest real difference between the two */
function causeW(s,pt,married){const C=PT.compat,F=PT.fights,W={};
  for(const k of ['risk','self','open','rebel']){const a=s.ax[k]??50,b=pt.ax[k]??50;W[k]=[C.w[k]*Math.max(0,Math.abs(a-b)-15),a>b?'me':'pt']}
  if(s.y>=C.engFrom){const a=s.eng??50,b=pt.ax.eng??50;W.politics=[C.w.eng*Math.max(0,Math.abs(a-b)-15),a>b?'me':'pt']}
  const mi=myFamIdx(s),pi=pt.fam?famIdx(pt.fam):mi;W.fam=[25*Math.max(0,Math.abs(mi-pi)-1),mi>pi?'me':'pt'];
  meRoll(s);W.eldest=[pt.eldest&&!pt.only&&(s.sex==='F'||pt.sex==='F')?(s.y<2010?20:10):0,null];
  W.job=[F.shiftJobs.includes(s.job)||F.shiftJobs.includes(pt.job)?20:0,null];
  W.inlaw=[married&&s.f.liveWith?30:0,null];return W}
const youngKid=s=>{const K=kidsOf(s).filter(k=>k.alive);return K.length?s.y-Math.max(...K.map(k=>k.by)):99};
function lifeOK(s,t,pt){if(/過年一定要先回|初二才能回/.test(t)&&(!parAlive(s)||(pt&&!ptParAlive(s,pt))||s.age>65))return false;if(/孩子/.test(t)&&!s.kids)return false;if(/(我媽|我爸|我家吃飯|爸媽)/.test(t.replace(/\{[np]\}爸媽/g,''))&&!parAlive(s))return false;if(/(孩子發燒|抱著孩子|孩子太小|孩子半夜|帶孩子出去)/.test(t)&&youngKid(s)>10)return false;
  if(/(辭職|上班|加班|夜班|應酬|做生意|工作|主管)/.test(t)&&s.age>62)return false;if(/結婚以後/.test(t)&&s.married)return false;
  if(/頭期款|房契/.test(t)&&(s.age>50||(/頭期款/.test(t)&&s.house==='own')))return false;if(/(弟弟|弟妹|爸媽一定要跟著住)/.test(t)&&(s.age>65||(pt&&!ptParAlive(s,pt)&&/爸媽/.test(t))))return false;return true}
const inlawOK=(s,x)=>x.cause!=='inlaw'||(x.sex==='M'?!!s.f.lwMine:!s.f.lwMine);
function causeLine(s,pt,married){if(!PT.fights)return null;const W=causeW(s,pt,married),U=ptU(s),C=[];
  for(const k in W){const [w,hi]=W[k];if(!(w>0))continue;
    const L=PT.fights.pool.filter(x=>x.cause===k&&(!x.hi||!hi||x.hi===hi)&&(married?x.married!==false:x.married!==true)&&(!x.sex||x.sex===s.sex)&&inY(s,x.y)&&!U.has(x.text)&&inlawOK(s,x)&&(k!=='eldest'||pt.eldest)&&lifeOK(s,x.text,pt)&&txtOK(s,fillPH(s,x.text,pt)));
    if(L.length)C.push([[k,L],w])}
  const h=wPick(C);if(!h)return null;const v=pick(h[1]);U.add(v.text);return fillPH(s,v.text,pt)}
{const F1=FIGHT;FIGHT=s=>{const pt=partnerOf(s);if(pt&&!abroad(s)&&chance(.6)){const t=causeLine(s,pt,false);if(t)return t}return F1(s)}}
function famConds(s,pt){const mi=myFamIdx(s),pi=famIdx(pt.fam||'小康');meRoll(s);
  return {ptRich:pi-mi>=2,ptPoor:mi-pi>=2,ptEldestSon:pt.sex==='M'&&pt.eldest&&s.sex==='F',meEldestSon:s.sex==='M'&&s.f.eldest&&pt.sex==='F',ptFarm:pt.pjob==='農'&&s.urban,
    ptGJ:pt.pjob==='公教'&&(!s.job||['工廠','營造','服務','自營'].includes(s.job)),ptShop:pt.pjob==='小生意',ptOnly:!!pt.only}}
{const fm1=famMeet;famMeet=function(s){const pt=partnerOf(s),r=s.rel||{};let res=null;
  if(pt&&pt.fam&&PT.family&&chance(.7)){const C=famConds(s,pt);const v=ptPick(s,PT.family.pool.filter(x=>C[x.cond]&&(!x.sex||x.sex===s.sex)&&inY(s,x.y)&&(parAlive(s)||!/(我爸|我媽)/.test(x.text))),pt);
    if(v){res=[fillPH(s,v.text,pt),v.delta||0,false];if((v.delta||0)<=-10&&!r.famLike&&chance(.4))r.famNo=1}}
  if(!res)res=fm1(s);
  if(r.famLike){res=[res[0],res[1]+8,false];r.famNo=0}
  return res}}
function ptImpress(s,pt){const I=PT.describe&&PT.describe.impress;if(!I)return null;let best=null,bv=15;
  for(const k of PT.profile.axes){const v=Math.abs((pt.ax[k]??50)-50);if(v>bv){bv=v;best=k}}
  if(!best)return null;const dir=pt.ax[best]>50?1:-1;return ptLine(s,I.list.filter(x=>x.axis===best&&x.dir===dir&&inY(s,x.y)),pt)}
{const stp=MS.find(x=>x.id==='relstep'),sr0=stp.run;stp.run=s=>{const r=s.rel,pt=partnerOf(s);
  if(r&&pt&&pt.alive&&r.stage==='dating'&&!r.imp){r.imp=1;const t=ptImpress(s,pt);if(t){r.last=s.t;r.score+=4;return {tone:'good',cat:'人生',text:t}}}return sr0(s)}}
/* two people at once */
function pairTry(s){const P=PT.pairs;if(!P||!parAlive(s)||s.f.divorced||s.f.widowed||abroad(s)||(s.f.pairN||0)>=2||!chance(at3(P.offer,s.y)))return null;
  const U=s.f.pairU||[];const T=P.templates.filter(t=>!U.includes(t.id)&&inY(s,t.y)&&s.age>=t.minAge&&s.age<=t.maxAge&&needOK(s,t.need)&&(!t.moved||(s.place!==s.birthCounty&&s.place!=='中國'))&&(!t.eth||t.eth.includes(s.eth)));
  if(!T.length)return null;const tp=pickW(T,t=>t.w||1);
  const mk=g=>{const c=g.ch&&g.ch!=='any'?chById(g.ch):(pickCh(s,x=>!x.blind&&!x.myJob&&x.ptJob!=='student')||chById('friends'));
    const pt=meetPartner(s,{c,job:g.job,eth:g.eth,sameCounty:g.sameCounty,shift:g.shift,simAdd:g.simAdd,noBind:1,needJob:1});
    if(g.eldest){pt.eldest=true;pt.only=false;if(!pt.sibs)pt.sibs=ri(1,2)}
    if(g.famMin||g.famMax){let i=famIdx(pt.fam);if(g.famMin)i=Math.max(i,famIdx(g.famMin));if(g.famMax)i=Math.min(i,famIdx(g.famMax));pt.fam=PT.profile.famLevels[i]}
    if(g.sameCounty===1)pt.home=s.birthCounty;else if(g.sameCounty===0)pt.home=null;pt.parents=g.parents||null;return pt};
  const A=mk(tp.a),B=mk(tp.b);const ask=tp.ask.find(x=>inY(s,x.y))||tp.ask[tp.ask.length-1];
  s.f.pairN=(s.f.pairN||0)+1;s.f.pairU=U.concat(tp.id);s._pair={tp,A,B};s._pairAB=[A,B];const text=fillPH(s,ask.text,null);s._pairAB=null;
  return {cat:'人生',title:'兩個人',text,choices:tp.choices.map(c=>({label:c.label,go:s=>pairGo(s,tp,c,A,B)}))}}
function pairGo(s,tp,c,A,B){s._pair=null;const v=c.go.find(g=>inY(s,g.y)&&(!g.sex||g.sex===s.sex))||c.go[c.go.length-1];
  s._pairAB=[A,B];const t=fillPH(s,v.text,null);s._pairAB=null;
  const pk=c.pick==='a'?A:c.pick==='b'?B:null,ot=pk===A?B:pk===B?A:null;
  if(c.moveHome&&s.place!==s.birthCounty){s.place=s.birthCounty;if(s.job==='台幹')s.job=pick(['公司','服務']);s.jobStart=s.t}
  for(const o of [A,B])if(o!==pk){o.role='friend';o.pairOf=tp.id;storyAdd(s,o,'跟你認識')}
  if(!pk){s.f.ptId=null;s.f.relCool=s.t+12;fx(s,{self:3});return t}
  const ch=chById(pk.ch),blind=!!(ch&&ch.blind);s.f.ptId=pk.id;
  s.rel={stage:blind?'habit':'dating',since:s.t,last:s.t,score:PT.pairs.base+(compat(s,pk)-60)/2,blind,fights:0,asks:0};
  if(pk.parents==='like')s.rel.famLike=1;if(pk.parents==='against'){s.rel.famNo=1;s.rel.score-=8}
  key(s,`跟${nm(pk)}在一起`);storyAdd(s,pk,'跟你交往');fx(s,{lonely:-8});
  if(ot&&tp.otherLine&&chance(.5)){s.f.pairOther=ot.id;s.f.pairOtherT=s.t+ri(36,120);s.f.pairTpl=tp.id}
  return t}
if(PT.pairs){const meetMS=MS.find(x=>x.id==='meet'),mr0=meetMS.run;meetMS.run=s=>{s._pair=null;return pairTry(s)||mr0(s)};
  for(const tp of PT.pairs.templates)for(const c of tp.choices){if(c.lean){LEAN['meet:'+c.label]=c.lean;LEAN['pair_'+tp.id+':'+c.label]=c.lean}
    if(c.pull){const p=c.pull;PULL['meet:'+c.label]=s=>s.y<p.before?p.mult:1}}}
/* the commit line opens a wedding (romance.json ready entries with commit:true) */
function commitLine(s,sp){if(!RM_COMMIT.length||!chance(.45))return '';
  const L=RM_COMMIT.filter(x=>inY(s,x.y)&&(!x.sex||x.sex===s.sex)&&(!/懷孕/.test(x.text)||(s.age<=40&&!s.kids&&!s.babyDue&&!s.f.noKids)));const v=ptPick(s,L,sp);if(!v)return '';
  if(/懷孕/.test(v.text))s.babyDue=s.t+ri(5,8);return fillPH(s,v.text,sp)}
function wedLW(s,sp){const I=PT.inlaws;if(!I||abroad(s)||s.place==='中國'||s.house==='own')return '';meRoll(s);
  const hus=s.sex==='M'?null:sp,wife=s.sex==='F'?null:sp;
  const husEO=hus?(hus.eldest||hus.only):(s.f.eldest||s.f.only),husPJ=hus?hus.pjob:s.pjob,husPar=hus?ptParAlive(s,hus):parAlive(s);
  const p=Math.min(.85,at3(I.his,s.y)*(husEO?1.4:.6)*(!s.urban?1.3:1)*(['農','小生意'].includes(husPJ)?1.3:1));
  let w=null;if(husPar&&chance(p))w='his';
  else{const wOne=wife?(wife.only||(wife.eldest&&chance(.5))):(s.f.only||(s.f.eldest&&chance(.5))),wPar=wife?ptParAlive(s,wife):parAlive(s);if(wOne&&wPar&&chance(at3(I.hers,s.y)))w='hers'}
  if(!w)return '';s.f.liveWith=w;s.f.lwMine=(w==='his')===(s.sex==='M');s.f.lwT=s.t;s.f.lwNext=s.t+ri(8,18);s.f.everLW=1;
  return ptLine(s,I.start.filter(x=>x.who===w&&(!x.sex||x.sex===s.sex)&&inY(s,x.y)),sp)||''}
function wedMoney(s,sp){const W=PT.wedding;if(!W)return '';let t='';
  if(['寬裕','富裕'].includes(sp.fam)){const h=W.help.find(x=>inY(s,x.y));if(h&&s.house!=='own'&&chance(h.p))s.f.inlawHelp=1}
  else if(sp.fam==='拮据'&&!sp.only){const h=W.support.find(x=>inY(s,x.y));if(h&&chance(h.p)){s.f.supportInlaws=sp.id;t+=fillPH(s,h.text,sp)}}
  if(s.sex==='F'&&myFamIdx(s)===0){const h=W.dowry.find(x=>inY(s,x.y)&&(!x.sex||x.sex===s.sex));if(h&&chance(h.p))t+=fillPH(s,h.text,sp)}
  return t}
{const mw=MS.find(x=>x.id==='marry'),mw0=mw.run;mw.run=s=>{const e=mw0(s);if(!e||!e.choices)return e;const g=e.choices[0].go;
  e.choices[0].go=s=>{const p0=partnerOf(s)||spouse(s),bd0=s.babyDue;const cm=p0?commitLine(s,p0):'';s._regOnly=/婚禮以後再說/.test(cm);let t;try{t=g(s)}finally{s._regOnly=false}const sp=spouse(s);if(!s.married||!sp){s.babyDue=bd0;return t}return (cm||'')+t+wedLW(s,sp)+wedMoney(s,sp)};return e}}
/* in-laws help with the down payment when the house comes */
const ilhRefund=s=>{if(s._ilh){s.cash-=s._ilh;s._ilh=0}};
{const hf0=houseFail;houseFail=function(s){ilhRefund(s);return hf0(s)}}
{const hs=MS.find(x=>x.id==='house'),h0=hs.run;hs.run=s=>{const e=h0(s);const sp=spouse(s);if(!e||!e.choices||!s.f.inlawHelp||!sp||!s.married||!s._hp||s._ilh||!ptParAlive(s,sp))return e;
  const mine=/爸媽說可以幫忙出|媽媽說可以幫忙出|爸爸說可以幫忙出/.test(e.text);const amt=s._hp.down*(mine?.25:.5);s.cash+=amt;s._ilh=amt;e.text=e.text.replace('要買房嗎？',mine?`${nm(sp)}爸媽聽說了，也說要補 ${fmtW(amt)} 萬。要買房嗎？`:`${nm(sp)}爸媽說，頭期款他們可以出一半。要買房嗎？`);
  for(const c of e.choices){const g=c.go;c.go=s=>{const r=g(s);if(s.house==='own'&&s._ilh){s._ilh=0;s.f.inlawHelp=0;const h=PT.wedding.help.find(x=>inY(s,x.y))||PT.wedding.help[0];return r+fillPH(s,h.text,sp)}ilhRefund(s);return r}}return e}}
/* personality fit after marriage */
{const dv=MS.find(x=>x.id==='divorce'),dc1=dv.check,dr1=dv.run;dv.check=s=>{const sp=spouse(s);if(!sp||!PT.compat)return dc1(s);const m=atMin(PT.compat.divorceMult,compat(s,sp));return m<1?dc1(s)&&chance(m):dc1(s)||(chance(m-1)&&dc1(s))};
  dv.run=s=>{s.f.lastFightT=s.t;return dr1(s)}}
function marFight(s){const sp=spouse(s);if(!PT.compat||!s.married||!sp||s.f.separated||abroad(s))return null;if(!chance(atMin(PT.compat.fightMonthly,compat(s,sp))))return null;
  s.f.lastFightT=s.t;s.f.fightsY=(s.f.fightsY||0)+1;s.f.marFights=(s.f.marFights||0)+1;fx(s,{lonely:4});return chance(.35)&&s.age<=75?causeLine(s,sp,true):null}
const lwEld=s=>s.f.lwMine?'爸媽':s.sex==='F'?'公婆':'岳父岳母';
function lwMonthly(s,say){const I=PT.inlaws,sp=spouse(s);if(!s.f.liveWith)return;
  if(!s.married||!sp){s.f.liveWith=null;return}
  if(s.f.lwMine?!parAlive(s):!ptParAlive(s,sp)){s.f.liveWith=null;return}
  if(s.house==='own'){s.f.liveWith=null;const L=s.f.lwMine?I.house:I.moveOut.slice(1);say(ptLine(s,L.map(x=>({...x,text:x.text.replace(/\{elders\}/g,lwEld(s))})),sp),'家庭','good');return}
  if(s.t>=s.f.lwNext){s.f.lwNext=s.t+ri(8,18);say(ptLine(s,I.during.filter(x=>x.who===s.f.liveWith&&(!x.sex||x.sex===s.sex)&&needOK(s,x.need)&&inY(s,x.y)),sp),'家庭','neutral')}}
function lwYearly(s,say){const I=PT.inlaws;if(s.f.liveWith){fx(s,{lonely:-2,self:-1});
    if(chance(at3(I.moveOutRate,s.y)+.05*(s.f.fightsY||0))){s.f.liveWith=null;say(ptLine(s,I.moveOut.map(x=>({...x,text:x.text.replace(/\{elders\}/g,lwEld(s))})),spouse(s)),'家庭','good')}}
  s.f.fightsY=0;
  if(s.f.supportInlaws){const p=s.people.find(x=>x.id===s.f.supportInlaws);if(!p||!s.married||!ptParAlive(s,p))s.f.supportInlaws=0;else fx(s,{money:-2})}}
/* the other one, years later */
function pairOtherLine(s,say){if(!s.f.pairOther||s.t<s.f.pairOtherT)return;const o=s.people.find(x=>x.id===s.f.pairOther);const tp=PT.pairs.templates.find(t=>t.id===s.f.pairTpl);s.f.pairOther=0;
  if(!o||!o.alive||o.married||!tp)return;const t=ptLine(s,tp.otherLine.filter(x=>inY(s,x.y)),o);if(t&&say(t,'人生','neutral')){o.married=true;storyAdd(s,o,'跟別人結婚了')}}
{const ps0=peopleSection;peopleSection=function(s){for(const p of s.people)if(p.chLbl&&['spouse','ex'].includes(p.role)&&!p._lbl){p._lbl=1;const how=/介紹|相親|同事|同學|同鄉/.test(p.chLbl)?p.chLbl:p.chLbl+'認識';
    const fact=p.only?(p.sex==='M'?'獨子':'獨生女'):p.eldest?(p.sex==='M'?'家裡是長子':'家裡是長女'):p.pjob==='農'?'家裡務農':p.pjob==='小生意'?'家裡開店':'';p._meetTxt='・'+how+(fact?'・'+fact:'')}
  return ps0(s)}}

