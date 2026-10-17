/* ================= life paths (content/paths.json): diary lines that only happen on the path a choice led to ================= */
//@include data/pa.js
const NORTH_BORN=s=>regionOf(s.birthCounty)==='北';
const PATH={
  north:s=>!NORTH_BORN(s)&&regionOf(s.place)==='北',
  home:s=>!NORTH_BORN(s)&&s.age>=22&&s.place===s.birthCounty,
  factory:s=>working(s)&&['工廠','營造'].includes(s.job),
  biz:s=>working(s)&&s.job==='自營',
  office:s=>working(s)&&['公司','科技'].includes(s.job),
  gj:s=>working(s)&&s.job==='公教',
  earlyWork:s=>s.age>=16&&['國中','國小'].includes(s.edu)&&!s.studying,
  uni:s=>['大學','碩士','博士'].includes(s.edu),
  renter:s=>s.age>=30&&s.house!=='own'&&s.house!=='family',
  owner:s=>s.house==='own'&&s.t<s.mortgageEnd,
  single:s=>s.age>=35&&!s.married&&!s.f.everMar,
  childless:s=>s.age>=40&&s.married&&s.kids===0&&!s.babyDue};
const dadOK=s=>!dadGone(s)&&!s.f.parentdie,momOK=s=>!momGone(s)&&!s.f.parentdie;
function pathOK(s,e){if(!PATH[e.path]||!PATH[e.path](s))return false;
  if(e.minAge!=null&&s.age<e.minAge||e.maxAge!=null&&s.age>e.maxAge)return false;if(e.y&&(s.y<e.y[0]||s.y>e.y[1]))return false;
  if(e.sex&&e.sex!==s.sex)return false;if(!needOK(s,e.need))return false;
  if(e.kidAge&&!s.kidBorn.some(b=>{const a=(s.t-b)/12;return a>=e.kidAge[0]&&a<=e.kidAge[1]}))return false;
  const t=e.text;if(/爸媽/.test(t)&&!(dadOK(s)&&momOK(s)))return false;if(/爸爸/.test(t)&&!dadOK(s))return false;if(/媽媽/.test(t)&&!momOK(s))return false;
  if(/\{par\}/.test(t)&&!dadOK(s)&&!momOK(s))return false;return true}
function pathText(s,t){const par=dadOK(s)&&momOK(s)?pick(['爸爸','媽媽']):dadOK(s)?'爸爸':'媽媽';
  return fillPH(s,t).replace(/\{par\}/g,par).replace(/\{kid\}/g,s.sex==='M'?'兒子':'女兒')}
/* one pool entry (fewer entries keeps the monthly shuffle fast); each line spreads PATH_HIT expected hits over its age window */
const PATH_HIT=.55;
{const EV=(PAC.events||[]).map((e,i)=>Object.assign({_k:'pa'+i},e));
 const rate=e=>Math.min(.05,PATH_HIT/(12*Math.max(1,(e.maxAge??90)-(e.minAge??0)+1)));
 const ok=(s,e)=>!s.f[e._k]&&pathOK(s,e);
 PE.push({id:'path',p:s=>{if(abroad(s))return 0;let q=1;for(const e of EV)if(ok(s,e))q*=1-rate(e);return 1-q},
  run:s=>{delete s._reT.path;const c=EV.filter(e=>ok(s,e)),e=pickW(c,rate);s.f[e._k]=1;
    const fo=Object.assign({},e.fx||{});if(e.money)fo.money=(fo.money||0)+e.money;fx(s,fo);
    const t=pathText(s,e.text);return {_eid:e._k,tone:e.tone||(e.money>0?'good':e.money<0?'bad':'neutral'),cat:e.cat||'生活',text:splitSent(t).every(x=>sentOK(s,x))?t:''}}})}
