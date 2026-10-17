/* ================= minigame UI: the choice popup becomes a small hands-on game =================
   Odds and outcomes live in engine/minigames.js; this only collects the player's answer into S._gv and calls pickChoice. */
const mgReveal=(box,msg,done)=>{box.innerHTML=`<p class="mg-wait">${esc(msg)}</p>`;
  if(matchMedia('(prefers-reduced-motion: reduce)').matches)done();else setTimeout(done,750)};
const mgBtn=(cls,html,fn)=>{const b=document.createElement('button');b.type='button';b.className=cls;b.innerHTML=html;b.onclick=fn;return b};
const MG={
 /* 志願卡: tap the 科系 in the order you want them */
 wish(e,box){const order=[],btns={};const card=document.createElement('div');card.className='mg mg-card';
  const send=mgBtn('btn mg-go','送出志願卡',()=>{S._gv=order.slice();const c=e.choices.find(x=>x.label===gameResolve(e,order));mgReveal(box,'放榜中……',()=>pickChoice(e,c))});
  const draw=()=>{card.innerHTML=`<p class="mg-h">${esc(e.game.exam)}志願卡<small>依序點下面的科系，點卡上的志願可以拿掉</small></p>`;
    const ol=document.createElement('ol');ol.className='mg-slots';
    e.game.all.forEach((_,i)=>{const li=document.createElement('li');const l=order[i];li.innerHTML=`<span>第 ${i+1} 志願</span><b>${l?esc(l):'＿＿'}</b>`;
      if(l){li.tabIndex=0;li.className='on';li.onclick=()=>{order.splice(i,1);draw()}}ol.appendChild(li)});
    card.appendChild(ol);card.appendChild(send);send.disabled=order.length<e.game.all.length;
    for(const l in btns){btns[l].disabled=order.includes(l);btns[l].classList.toggle('picked',order.includes(l))}};
  const have=[...box.children];box.innerHTML='';
  e.game.all.forEach(l=>{const ci=e.choices.findIndex(c=>c.label===l);let b=ci>=0?have[ci]:mgBtn('choice',`<span>${esc(l)}</span>`);
    b.onclick=()=>{if(!order.includes(l)){order.push(l);draw()}};btns[l]=b;box.appendChild(b)});
  box.parentNode.insertBefore(card,box);box._mg=card;draw()},
 /* 標會: write your 標金 on the slip */
 bid(e,box){const g=e.game,on=e.choices.findIndex(c=>c.label===g.on);if(on<0)return;
  box.children[on].onclick=()=>{box.innerHTML=`<p class="mg-h">標金要寫多少？<small>寫得越高越容易標到，但利息也付得越多。這期的會款大約 ${(g.pot/1e4).toFixed(1).replace(/\.0$/,'')} 萬。</small></p>`;
   const row=document.createElement('div');row.className='mg-row';
   g.opts.forEach(v=>row.appendChild(mgBtn('choice mg-amt',`<b>${v.toLocaleString()}</b><small>塊</small>`,()=>{S._gv={bid:v};mgReveal(box,'會頭一張一張打開紙條……',()=>pickChoice(e,e.choices[on]))})));
   box.appendChild(row);const off=e.choices.find(c=>c.label===g.off);
   if(off)box.appendChild(mgBtn('choice mg-off','算了，不標',()=>pickChoice(e,off)))}},
 /* 大家樂: two digits, or a 明牌 from 土地公 */
 num(e,box){const g=e.game,on=e.choices.findIndex(c=>c.label===g.on);if(on<0)return;
  box.children[on].onclick=()=>{let d=[],temple=false;box.innerHTML='';
   const head=document.createElement('p');head.className='mg-h';head.innerHTML=`${g.kid?'要跟爸爸說哪兩個數字？':'要簽哪兩個號碼？'}<small>猜愛國獎券頭獎的末兩碼，00 到 99。</small>`;
   const disp=document.createElement('div');disp.className='mg-num';const tip=document.createElement('p');tip.className='mg-tip';
   const pad=document.createElement('div');pad.className='mg-pad';
   const go=mgBtn('btn mg-go',g.kid?'就這兩個':'簽下去',()=>{S._gv={n:d[0]*10+d[1],temple};mgReveal(box,'開獎中……',()=>pickChoice(e,e.choices[on]))});
   const draw=()=>{disp.innerHTML=[0,1].map(i=>`<b>${d[i]==null?'＿':d[i]}</b>`).join('');go.disabled=d.length<2};
   for(const k of [1,2,3,4,5,6,7,8,9,0])pad.appendChild(mgBtn('choice mg-key',String(k),()=>{if(d.length>=2)d=[];d.push(k);temple=false;tip.textContent='';draw()}));
   pad.appendChild(mgBtn('choice mg-key mg-wide','清除',()=>{d=[];temple=false;tip.textContent='';draw()}));
   const ming=mgBtn('choice mg-ming',g.kid?'看香爐的灰像什麼數字':'去土地公廟求明牌',()=>{d=[Math.floor(R()*10),Math.floor(R()*10)];temple=true;
     tip.textContent=pick(g.kid?['香爐的灰歪歪的，看起來有點像這兩個數字。','阿嬤說，香灰說的準。']:['擲了三個聖筊，土地公好像同意了。','廟口的阿伯說這組很多人簽，他自己也簽了。','香爐的灰看起來就是這兩個數字。']);draw()});
   [head,disp,tip,pad,ming,go].forEach(x=>box.appendChild(x));draw()}}};
{const om=openModal;openModal=function(e){const old=$('mChoices')._mg;if(old){old.remove();$('mChoices')._mg=null}om(e);
  if(e.game&&MG[e.game.type])MG[e.game.type](e,$('mChoices'))}}
