/* ================= rare moments (content/rare.json): each life rolls at birth which of them are possible ================= */
//@include data/rr.js
for(const e of RARE)if(e.habit)HW_ADD.add(e.habit.k);
{const nl0=newLife;newLife=function(by,F){const s=nl0(by,F);s._rare=RARE.filter(e=>chance(e.p)).map(e=>e.id);s.rareSeen=[];return s}}
/* a one-year window fires soon once it opens; an open-ended one waits a few years on average */
const rareRate=e=>e.y&&e.y[1]-e.y[0]<=1?.6:.03;
PE.push({id:'rare',p:s=>{if(!s._rare||!s._rare.length)return 0;
    const L=RARE.filter(e=>s._rare.includes(e.id)&&fOK(s,e)&&txtOK(s,fillPH(s,e.text)));s._rareL=L;return L.length?Math.max(...L.map(rareRate)):0},
  run:s=>{const e=pick(s._rareL);s._rare=s._rare.filter(x=>x!==e.id);s.rareSeen.push(e.id);
    if(e.cash&&s.cash!==undefined){if(s.age<20&&!working(s))s.famW+=e.cash;else s.cash+=e.cash}
    if(e.fx)fx(s,e.fx);mkHabit(s,e.habit);
    return {tone:e.tone||'good',cat:e.cat||'生活',text:fillPH(s,e.text),rare:1}}});
