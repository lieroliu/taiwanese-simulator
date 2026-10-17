/* ================= 生活重心 chips on the status card (engine/focus.js) ================= */
function renderFocus(s){const box=$('focus');if(!box)return;const o=focusOpts(s);if(!o.length||s.dead){box.innerHTML='';return}
  const cur=focusNow(s),locks=o.map(k=>[k,focusLock(s,k)]).filter(x=>x[1]);
  box.innerHTML=`<div class="focus-h"><span>生活重心</span><span class="muted small">${s.focusPick?'你選的':'照個性'}</span></div>
   <div class="focus-o" role="group" aria-label="生活重心">${o.map(k=>{const L=focusLock(s,k);return `<button type="button" class="fchip${k===cur?' on':''}" data-k="${k}" aria-pressed="${k===cur}"${L?' disabled':''}>${k}</button>`}).join('')}</div>
   <p class="focus-tip">${cur?esc(FOCUS_TIP[cur]):''}</p>${locks.map(x=>`<p class="focus-lock">${x[0]}：${esc(x[1])}</p>`).join('')}`;
  box.onclick=e=>{const b=e.target.closest('.fchip');if(!b||b.disabled)return;s.focusPick=b.dataset.k;s.focus=b.dataset.k;renderFocus(s)}}
