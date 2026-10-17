/* ================= pop culture: what each cohort grew up with (content/popculture.json) ================= */
//@include data/pop.js
function popW(s,it){let w=it.weight||1;const k=it.skew||{};if(k.urban&&s.urban)w*=k.urban;if(k.rural&&!s.urban)w*=k.rural;if(k[s.eth])w*=k[s.eth];return w}
const popLOK=(s,l)=>(l.minAge==null||s.age>=l.minAge)&&(l.maxAge==null||s.age<=l.maxAge)&&inR(s.y,l.y)&&(!l.sex||l.sex===s.sex)&&(!l.eth||anyOf(l.eth,s.eth))&&needOK(s,l.need);
{const st3=step;step=function(s){const out=st3(s);if(s.dead||abroad(s)||out.some(e=>e.choices||e.death))return out;
  s.pop=s.pop||[];if(s.pop.length>=12||s.t-(s.f.popT??-99)<4||!chance(s.age>=5&&s.age<=18?.045:.02))return out;
  const C=[];for(const it of POP){if(s.pop.some(p=>p.id===it.id)||!inR(s.y,it.y)||s.age<it.minAge||s.age>it.maxAge||(it.eth&&!anyOf(it.eth,s.eth)))continue;
    const L=it.lines.filter(l=>popLOK(s,l)&&txtOK(s,fillPH(s,l.text)));if(L.length)C.push([[it,L],popW(s,it)])}
  const hit=wPick(C);if(!hit)return out;const [it,L]=hit;const l=pick(L);
  s.pop.push({id:it.id,name:it.name,age:s.age});s.f.popT=s.t;out.push({cat:'生活',tone:l.tone||'neutral',text:fillPH(s,l.text),_pop:it.id});return out}}
const popNames=s=>{const P=(s.pop||[]).slice();const a=P.filter(p=>p.age>=5&&p.age<=18),b=P.filter(p=>!(p.age>=5&&p.age<=18));return a.concat(b).slice(0,6).map(p=>p.name)};
function popLine(s){const n=popNames(s);if(n.length<2)return '';return `<p style="margin:0"><b>你那一屆的童年：</b>${esc(n.join('、'))}……</p>`}
