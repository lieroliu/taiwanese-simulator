/* ================= relatives' career advice (content/kin_advice.json) ================= */
//@include data/kin.js
const inR=(v,r)=>!r||(v>=r[0]&&v<=r[1]);
function kOK(s,e){if(!fOK(s,e))return false;if(!inR(s.by,e.by))return false;if(e.pjob&&!e.pjob.includes(s.pjob))return false;if(e.inc&&e.inc!==s.inc)return false;
  if(e.studyAtLeast!=null&&s.study<e.studyAtLeast)return false;if(e.moneyAtLeast!=null&&s.money<e.moneyAtLeast)return false;if(e.edu&&!e.edu.includes(s.edu))return false;
  if(e.major&&!(Array.isArray(e.major)?e.major:[e.major]).includes(s.major))return false;if(e.like&&e.like!==s.like)return false;return true}
const aOK=(s,a)=>kOK(s,Object.assign({},a,{major:null}));
const wPick=L=>{const t=L.reduce((a,x)=>a+x[1],0);let r=R()*t;for(const x of L){r-=x[1];if(r<=0)return x[0]}return L.length?L[L.length-1][0]:null};
const likeOf=s=>(KIN.likes||[]).find(l=>l.id===s.like);
const kinCo=s=>(KIN.cohorts||[]).find(c=>inR(s.by,c.by));
function kinT(s,t){const l=likeOf(s);return fillPH(s,t.replace(/\{adv\}/g,s.kinAdv?s.kinAdv.sub:'').replace(/\{like\}/g,l?l.sub:'').replace(/\{got\}/g,s.f.kinGot||''))}
function rollLike(s){const L=(KIN.likes||[]).filter(l=>inR(s.by,l.by)&&(l.moneyAtLeast==null||s.money>=l.moneyAtLeast));
  s.like=wPick(L.map(l=>{let e=0;for(const k in l.ax||{})e+=l.ax[k]*((s.ax[k]??50)-50)/25;return [l.id,(l.w||1)*Math.exp(e)]}))}
function rollAdv(s){const c=kinCo(s);if(!c)return null;const L=c.advice.filter(a=>aOK(s,a));const A=L.length?L:c.advice.filter(a=>!a.sex||a.sex===s.sex);s.kinAdv=wPick(A.map(a=>[a,a.w||1]));return s.kinAdv}
function kinClash(s){if(!s.kinAdv)rollAdv(s);if(!s.like)rollLike(s);const a=s.kinAdv,l=likeOf(s);if(!a||!l)return null;
  const g=KIN.clash.gradeNeed[a.sub];if(g!=null&&s.study<g)return 'grades';if(l.major!==a.major)return 'interest';return null}
function setMajor(s,m){s.major=m;s.edu='大學';s.studying='大學';s.studyEnd=s.t+48;if(!['北','away'].includes(regionOf(s.place))&&m!=='師範')s.pend='uniloc';key(s,`考上大學，讀${m}`)}
const firstOK=(s,L)=>(L||[]).find(x=>kOK(s,x))||(L||[])[L.length-1];
const majP=(s,m)=>{const a=ASP.major[m];return a?(typeof a.p==='function'?a.p(s):a.p):1};
function kinTry(s,c,tgt){const m=tgt==='adv'?s.kinAdv.major:likeOf(s).major;
  if(chance(majP(s,m))){setMajor(s,m);return kinT(s,firstOK(s,c.ok).text)}
  ASP.major[m].fail(s);s.f.kinGot=s.major+'科系';return kinT(s,firstOK(s,c.fail).text)+failFx(s)}
ODDS.kinMajor={'聽親戚的':s=>majP(s,s.kinAdv.major),'讀自己想讀的':s=>majP(s,likeOf(s).major),'先讀再轉系':s=>majP(s,s.kinAdv.major)};
(KIN.clash?KIN.clash.choices:[]).forEach(c=>{LEAN['kinMajor:'+c.label]=c.lean||{}});
{const mi=MS.findIndex(x=>x.id==='major');MS.splice(mi,0,{id:'kinMajor',choice:1,check:s=>s.pend==='major'&&!!KIN.clash&&!!(s._kc=kinClash(s)),run:s=>{s.pend=null;const type=s._kc,C=KIN.clash;
  const tx=C.text.find(t=>t.type===type&&inR(s.by,t.by))||C.text.find(t=>t.type===type);
  const ch=C.choices.filter(c=>{const f=c.if;if(!f)return true;if(f.y&&!inR(s.y,f.y))return false;if(f.type&&f.type!==type)return false;if(f.advSub&&!f.advSub.includes(s.kinAdv.sub))return false;return true});
  return {cat:'人生',title:C.title,text:kinT(s,tx.text)+'我要怎麼填？',choices:ch.map(c=>({label:c.label,go:s=>{fx(s,c.fx||{});let t;
    if(c.retake){s.f.kin='retake';s.studying='重考';s.studyEnd=s.t+11;s.f.kinRetake=1;return kinT(s,firstOK(s,c.ok).text)}
    if(c.block&&kOK(s,c.block)&&chance(c.block.p)){s.f.kin='listen';const adv=C.choices.find(x=>x.target==='adv'&&!x.then);const t0=kinT(s,c.block.text)+kinTry(s,adv,'adv');if(s.major!==likeOf(s).major)regret(s,'kinListen',kinT(s,KIN.clash.regret.listen),'爸爸替我把志願填好了',2);return t0}
    s.f.kin=c.then==='transfer'?'mid':c.target==='adv'?'listen':'own';t=kinTry(s,c,c.target);
    if(c.then==='transfer'&&s.major===s.kinAdv.major&&s.studying==='大學')s.f.kinTr=s.t+(C.transfer.afterMonths||12);
    if(s.f.kin==='listen'&&KIN.clash.regret.listen&&s.major!==likeOf(s).major)regret(s,'kinListen',kinT(s,C.regret.listen),`親戚都說讀${s.kinAdv.sub}比較有出路`,2);
    return t}}))}}})}
{const r2=MS.find(x=>x.id==='retake2'),c0=r2.check;r2.check=s=>!s.f.kinRetake&&c0(s)}
{const cf0=ctxFor;ctxFor=function(s,id){if(id==='kinMajor'){const c=kinCo(s);return c&&c.clashCtx?{text:c.clashCtx.text,norm:c.clashCtx.norm||[]}:null}
  const r=cf0(s,id);
  if(id==='major'&&s.kinAdv&&r&&/^親戚都說讀商管/.test(r.text))return {text:`親戚都說讀${s.kinAdv.sub}比較有出路`,norm:[s.kinAdv.major]};
  if((id==='m15'&&r&&r.text==='同學有人考高中，有人讀高職，也有人準備工作')||(id==='job'&&r&&r.text==='大家都想找一份穩定的工作')){const e=(KIN.ctx&&KIN.ctx[id]||[]).find(x=>kOK(s,x));if(e)return {text:e.text,norm:e.norm||[]}}
  return r}}
/* monthly: interest at 12, hobby line, advice at 春節, new-year talk, transfer / retake results, echoes */
{const st2=step;step=function(s){const out=st2(s);if(s.dead||!KIN.likes)return out;const add=(text,cat,tone)=>{if(text&&txtOK(s,text))out.push({cat:cat||'家庭',tone:tone||'neutral',text,_kin:1});else if(text&&cat==='人生')out.push({cat,tone:tone||'neutral',text,_kin:1})};
  if(!s.like&&s.age>=12)rollLike(s);
  if(s.like&&!s.f.kinHob&&s.age>=12&&s.age<=14&&chance(.07)){s.f.kinHob=1;const h=firstOK(s,likeOf(s).hobby.filter(x=>inR(s.by,x.by)));if(h)add(kinT(s,h.text),'生活')}
  const ny=s.m<=2&&!abroad(s);
  if(ny&&!s.kinAdv&&s.age>=13&&s.age<=17){const c=kinCo(s);if(c){const L=c.advice.filter(a=>aOK(s,a)&&txtOK(s,kinT(s,a.text)));if(L.length){s.kinAdv=wPick(L.map(a=>[a,a.w||1]));s.f.kinNY=s.t;add(kinT(s,s.kinAdv.text),'家庭')}}}
  if(ny&&s.f.kinNY!==s.t&&(s.f.nyN||0)<3&&s.t-(s.f.nyT??-99)>=36&&chance(.35)){const U=s.f.nyU||(s.f.nyU=[]);const L=(KIN.newyear||[]).filter(e=>!U.includes(e.id)&&kOK(s,e)&&txtOK(s,kinT(s,e.text)));
    if(L.length){const e=pick(L);U.push(e.id);s.f.nyN=(s.f.nyN||0)+1;s.f.nyT=s.t;add(kinT(s,e.text),'家庭')}}
  if(s.f.kinTr&&s.t>=s.f.kinTr){const T=KIN.clash.transfer;s.f.kinTr=0;if(s.studying==='大學'){const P=T.p;let p=P.base+P.perStudy*s.study;(P.addIf||[]).forEach(a=>{if(inR(s.y,a.y))p+=a.add});p=clamp(p,P.min,P.max);
    if(chance(p)){s.major=likeOf(s).major;s.f.kinTrOK=1;add(kinT(s,pick(T.ok)),'人生','good')}else add(kinT(s,pick(T.fail)),'人生','bad')}}
  if(s.f.kinRetake&&s.t>=s.studyEnd&&s.studying==='重考'){s.f.kinRetake=0;s.studying=null;const Rt=KIN.clash.retake;
    if(chance(majP(s,'醫護'))){setMajor(s,'醫護');add(kinT(s,pick(Rt.ok.filter(t=>s.y>=2012||!/(群組|LINE)/.test(t)))||Rt.ok[0]),'人生','good')}
    else{setMajor(s,likeOf(s).major);s.f.kinRetakeFail=1;if(KIN.clash.regret.retakeFail)regret(s,'kinRetake',KIN.clash.regret.retakeFail,'為了考醫學系，多重考了一年',2);add(kinT(s,pick(Rt.fail)),'人生','bad')}}
  if((s.f.echoN||0)<2&&s.age>=18&&chance(.02)){const U=s.f.echoU||(s.f.echoU=[]);const L=(KIN.echo||[]).filter(e=>!U.includes(e.id)&&(e.kin==='any'?(s.kinAdv&&s.f.kin):e.kin===s.f.kin)&&kOK(s,e)&&txtOK(s,kinT(s,e.text)));
    if(L.length){const e=pick(L);U.push(e.id);s.f.echoN=(s.f.echoN||0)+1;if(e.fx)fx(s,e.fx);add(kinT(s,e.text),'人生',e.tone||'neutral')}}
  return out}}
