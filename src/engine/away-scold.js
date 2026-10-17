/* Paddy 2026-10-17: once the character lives away from home, family can't scold them at the dinner table.
   The scolding either comes over the phone (mood drops) or the character keeps it from the family (a smaller, guilty drop). */
const awayFromFam=s=>s.age>=18&&parAlive(s)&&!(s.f.liveWith&&s.f.lwMine)&&!scHousehold(s).home;
/* [pattern, phone version, hide version]; a null side means that way doesn't fit the scene */
const AWAY_SCOLD=[
 [/回家被媽媽罵了一頓。/,'晚上媽媽打電話來，我一不小心說溜嘴，她在電話裡罵了我半個小時。','我沒跟家裡說。媽媽打電話來問颱風有沒有怎樣，我說我整天都待在家。'],
 [/回家被罵也不管。/,null,'反正住在外面，沒有人等我回家，也沒有人罵我。'],
 [/媽媽念了我好幾天。/,'媽媽連續幾天打電話來念我，我把話筒拿得離耳朵遠遠的。','我跟媽媽說，是對方不喜歡我。'],
 [/下班回家跟媽媽說這件事，她念了我一整頓飯。/,'晚上打電話跟媽媽說這件事，她在電話裡念了我半個小時。','這件事我沒跟媽媽說，怕她又念我。'],
 [/媽媽哭了，爸爸整整一個禮拜不跟我說話。/,'媽媽在電話裡哭了，後來那個禮拜，換爸爸接電話，他都直接把話筒交給媽媽。',null],
 [/回家(以後)?被(爸爸|媽媽|爸媽|阿公|阿嬤|阿公阿嬤|阿婆|家裡的人)罵了一頓。/,'$2知道以後打電話來，在電話裡罵了我一頓。','我沒讓$2知道。打電話回家的時候，我什麼都沒提。']];
function awayScold(s,t){if(!t||!awayFromFam(s))return t;
 for(const [rx,ph,hd] of AWAY_SCOLD){const m=t.match(rx);if(!m)continue;
  const hide=hd&&(!ph||chance(.3+(s.ax.rebel+s.ax.risk-100)/200));
  s.mood=clamp((s.mood??50)-(hide?2:4),0,100);
  return t.replace(rx,(hide?hd:ph).replace(/\$2/g,m[2]||'家裡的人'))}
 return t}
{const st0=step;step=function(s){const out=st0(s);if(!s.dead)for(const e of out)if(e.text&&!e.choices)e.text=awayScold(s,e.text);return out}}
{const dc0=doChoice;doChoice=function(s,e,c){const r=dc0(s,e,c);if(r&&r.text&&!s.dead)r.text=awayScold(s,r.text);return r}}
