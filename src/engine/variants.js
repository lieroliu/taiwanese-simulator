/* ================= text variants (content/variants.json; format in content/FORMAT.md) =================
   The same moment reads differently by mood, money, place, orientation and era. `lines` swaps one exact
   sentence wherever it appears (diary, choice results, mood lines); `events` swaps a whole entry by event id;
   `mood` adds extra mood lines that only fit some lives. The original text stays in the draw. */
//@include data/var.js
const VAR_L=TXV.lines||{},VAR_E=TXV.events||{},VAR_M=TXV.mood||{};
function varOK(s,w){if(!w)return true;
  if(w.mood==='low'&&!(s.mood<35))return false;if(w.mood==='high'&&!(s.mood>65))return false;
  if(w.money==='poor'&&!(s.money<30))return false;if(w.money==='rich'&&!(s.money>68))return false;if(w.money==='mid'&&(s.money<30||s.money>68))return false;
  if(w.urban!=null&&!!s.urban!==w.urban)return false;if(w.region&&!w.region.includes(regionOf(s.place)))return false;if(w.county&&!w.county.includes(s.place))return false;
  if(w.eth&&!w.eth.includes(s.eth))return false;if(w.sex&&w.sex!==s.sex)return false;
  if(w.orient==='same'&&!(s.orient&&s.f.realized))return false;if(w.orient==='straight'&&s.orient&&s.f.realized)return false;
  if(w.y&&(s.y<w.y[0]||s.y>w.y[1]))return false;if(w.by&&(s.by<w.by[0]||s.by>w.by[1]))return false;
  if(w.age&&(s.age<w.age[0]||s.age>w.age[1]))return false;if(w.married!=null&&!!s.married!==w.married)return false;
  if(w.kids!=null&&!!s.kids!==w.kids)return false;if(w.job&&!w.job.includes(s.job))return false;return true}
/* a variant never names a gadget before (or long after) its time, whatever its when says */
function varTechOK(s,t){t=t.replace(/「[^」]*」/g,'');const y=s.y;
  if((y<1993&&/手機/.test(t))||(y<2009&&/(智慧型手機|LINE|App(?![a-z])|臉書|IG|抖音|YouTube|家族群組|限動|外送)/.test(t))||(y<1995&&/(上網|網路|e-mail|Email)/.test(t))||(y<1998&&/MSN/.test(t))||(y<1988&&/(BB.?Call|呼叫器|大哥大(?!姐))/.test(t)))return false;
  if((y>2005&&/(BB.?Call|呼叫器|大哥大(?!姐))/.test(t))||(y>2016&&/(MSN|無名小站|即時通)/.test(t)))return /(以前|當年|小時候|那時候|那年|還記得|收起來|抽屜|老照片)/.test(t);return true}
/* the original counts as one option; matching variants are drawn evenly, and a line this life already showed is skipped */
function varPick(s,orig,L){const c=L.filter(v=>varOK(s,v.when)).map(v=>fillPH(s,v.text,sxPt(s))).filter(x=>txtOK(s,x)&&varTechOK(s,x));if(!c.length)return orig;
  const used=s._varU||(s._varU={});const all=orig==null?c:[orig,...c],fresh=all.filter(x=>!used[x]);if(orig==null&&!fresh.length)return null;const t=pick(fresh.length?fresh:all);used[t]=1;return t}
function varText(s,t,id){if(!t||typeof t!=='string')return t;
  if(id&&VAR_E[id])t=varPick(s,t,VAR_E[id]);
  if(t.indexOf('。')<0&&!VAR_L[t])return t;
  return t.split(/(?<=[。！？])/).map(x=>VAR_L[x]?varPick(s,x,VAR_L[x]):x).join('')}
/* whole-entry swaps happen where the event is written, before later wrappers add lines (household changes, people) to it */
for(const r of RE.concat(PE))if(VAR_E[r.id]){const f=r.run,id=r.id;r.run=function(s){const en=f.apply(this,arguments);if(en&&!en.choices&&en.text)en.text=varPick(s,en.text,VAR_E[id]);return en}}
{const st0=step;step=function(s){const out=st0(s);
  for(const e of out){if(e.death)continue;if(e.text)e.text=varText(s,e.text);
    if(e.mood&&e.mood.line){const st=STAGE(s.age),ex=((VAR_M[st]||{})[e.tone||'neutral']||[]).filter(v=>varOK(s,v.when));
      if(ex.length&&chance(.5)&&!(e.text&&FELT.test(e.text))){const x=varPick(s,null,ex),k=x?x.indexOf(':'):-1;if(!x);else if(k>0){e.mood.word=x.slice(0,k);e.mood.line=x.slice(k+1)}else e.mood.line=x}
      else e.mood.line=varText(s,e.mood.line)}}
  return out};
 const dc0=doChoice;doChoice=function(s,e,c){const r=dc0(s,e,c);if(r&&r.text)r.text=varText(s,r.text);return r}}
