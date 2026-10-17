/* ================= wiring ================= */
cohortList();testInit();
$('yearform').onsubmit=e=>{e.preventDefault();const v=parseInt($('year').value,10);if(!(v>=1961&&v<=2010)){$('err').textContent='請輸入 1961 到 2010 之間的年份。';return}$('err').textContent='';begin(v)};
$('rand').onclick=()=>{const y=1961+Math.floor(R()*50);$('year').value=y;begin(y)};
$('feed').addEventListener('click',ev=>{const b=ev.target.closest('.gl');if(!b)return;const art=b.closest('.entry');let x=art.querySelector('.glx');const k=b.dataset.g;
  if(x&&x.dataset.g===k){x.remove();return}if(!x){x=document.createElement('p');x.className='glx';b.closest('p').after(x)}x.dataset.g=k;x.innerHTML=`<b>${esc(k)}</b>　${esc(GLOSS[k])}`});
$('next').onclick=advance;
$('auto').onclick=()=>{setAuto(!autoOn());if(autoOn()&&!pending&&S&&!S.dead)schedule()};
try{const v=localStorage.getItem('spd');if(v&&$('speed').querySelector(`option[value="${v}"]`))$('speed').value=v}catch(e){}
$('speed').onchange=()=>{try{localStorage.setItem('spd',$('speed').value)}catch(e){}if(autoOn()&&!pending)schedule()};
document.addEventListener('keydown',e=>{if(e.key==='Enter'&&!$('play').hidden&&!$('introOv')&&document.activeElement.tagName!=='INPUT'&&!document.activeElement.classList.contains('choice')){e.preventDefault();advance()}});
if(matchMedia('(max-width:820px)').matches)$('det').open=false;
$('det').addEventListener('toggle',fitFeed);
window.__sim={newLife,step,scHousehold,hhSnap,annualQ,doChoice,autoChoose,drawShare,shareLine,inTW};
