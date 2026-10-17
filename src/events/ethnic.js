/* ================= ethnic content (content/ethnic.json) ================= */
//@include data/eth.js
function ethOK(s,w){if(!w)return true;
  if(w.age&&(s.age<w.age[0]||s.age>w.age[1]))return false;if(w.by&&(s.by<w.by[0]||s.by>w.by[1]))return false;if(w.y&&(s.y<w.y[0]||s.y>w.y[1]))return false;
  if(w.months&&!w.months.includes(s.m))return false;if(!anyOf(w.eth,s.eth)||!anyOf(w.region,regionOf(s.place))||!anyOf(w.county,s.place)||!anyOf(w.pjob,s.pjob))return false;
  if(w.tribe&&!w.tribe.includes(s.tribe))return false;if(w.momFrom&&!w.momFrom.includes(s.momFrom))return false;if(w.juancun!=null&&!!s.juancun!==w.juancun)return false;
  if(w.urban!=null&&w.urban!==s.urban)return false;if(w.served&&(!s.f.served||s.f.exempt))return false;if(w.sex&&w.sex!==s.sex)return false;if(w.married!=null&&!!s.married!==w.married)return false;if(w.kids!=null&&(s.kids>0)!==w.kids)return false;
  if(w.trait)for(const t of w.trait){const v=s.ax[t.slice(0,-1)];if(v==null||(t.endsWith('+')?v<55:v>45))return false}
  return needOK(s,w.need)}
const ethSent=(s,t)=>splitSent(t).every(x=>sentOK(s,x));
const MOM_LAND={'中國大陸':'大陸','越南':'越南','印尼':'印尼','泰國':'泰國','菲律賓':'菲律賓'},MOM_LANG={'中國大陸':'家鄉話','越南':'越南話','印尼':'印尼話','泰國':'泰語','菲律賓':'菲律賓話'};
const ethPH=(s,t)=>fillPH(s,t).replace(/\{momLand\}/g,MOM_LAND[s.momFrom]||'外婆家').replace(/\{momLang\}/g,MOM_LANG[s.momFrom]||'家鄉話').replace(/\{tribe\}/g,s.tribe||'');
/* lens: ethnic versions of shared events, keyed by timeline / random-event / milestone id ("_any" matches every event) */
function ethLens(s,out){const L=ETHC.lens;if(!L||abroad(s))return;s._ethU=s._ethU||new Set();
  for(const e of out){if(e.choices||e.death||e.birth||e._ethL||e._ab)continue;const k=e._tl||e._re||e.id;
    if(e._st==='in'||e._st==='sym')continue;const c=(L[k]||[]).concat(L._any||[]).filter(v=>!s._ethU.has(v.text)&&ethOK(s,v.when)&&(!v.match||(v._re=v._re||new RegExp(v.match)).test(e.text)));
    if(!c.length)continue;const v=pick(c);if(!ethSent(s,ethPH(s,v.text)))continue;if(!chance(v.p??.75))continue;s._ethU.add(v.text);e._ethL=1;const t=ethPH(s,v.text);
    e.text=v.mode==='add'?e.text+t:v.match?e.text.replace(v._re,t):t;if(v.fx)fx(s,v.fx)}}
{const aL0=applyLens;applyLens=(s,out)=>{aL0(s,out);ethLens(s,out)}}
/* events: ethnic life events from age 7 on, each at most once per life; the rate spreads one expected hit over the eligible window.
   They sit in the pool as one entry (fewer entries keeps the monthly shuffle fast) that rolls each eligible event at its own rate. */
{const EV=(ETHC.events||[]).map(e=>{const w=Object.assign({},e,{age:e.age||[7,90]});
  return {e,w,span:s=>{let a=Math.max(w.age[0],w.y?w.y[0]-s.by:-1),b=Math.min(w.age[1],w.y?w.y[1]-s.by:200);return Math.max(1,(b-a+1)*(w.months?w.months.length:12))}}});
 const byEth={};for(const x of EV)for(const g of x.w.eth||Object.keys(ETH_OFF))(byEth[g]=byEth[g]||[]).push(x);
 const ok=(s,x)=>!s.f['eth_'+x.e.id]&&!(x.e.group&&s.f['ethg_'+x.e.group])&&ethOK(s,x.w);
 const rate=(s,x)=>Math.min(.2,(x.e.weight||1)*.9/x.span(s));
 PE.push({id:'eth',p:s=>{let q=1;for(const x of byEth[s.eth]||[])if(ok(s,x))q*=1-rate(s,x);return 1-q},
  run:s=>{delete s._reT.eth;const c=(byEth[s.eth]||[]).filter(x=>ok(s,x)),x=pickW(c,x=>rate(s,x)),e=x.e;
    s.f['eth_'+e.id]=1;if(e.group)s.f['ethg_'+e.group]=1;if(e.fx)fx(s,e.fx);if(e.key)key(s,e.key);const t=ethPH(s,e.text);return {_eid:'eth_'+e.id,tone:e.tone||'neutral',cat:e.cat||'族群',text:ethSent(s,t)?t:''}}})}
