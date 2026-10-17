/* ================= end-screen helpers: money at 40 and regrets ================= */
{const y0=yearly;yearly=function(s){y0(s);if(s.age===40&&s.cash40m==null)s.cash40m=netWorth(s)*1e4/wageM(s.y)}}
const regretTop=s=>(s.regrets||[]).filter(r=>!(r.single&&s.f.everMar)).sort((a,b)=>b.w-a.w||a.age-b.age).slice(0,3).sort((a,b)=>a.age-b.age);
function regretsSection(s){const H=regretTop(s);if(!H.length)return '';
  return `<div><h2 style="font-size:22px;margin-bottom:4px">你後悔的事</h2><p class="muted small" style="margin:0 0 10px">這些事，你後來常常想起。</p>
  <ul class="keys habits">${H.map(r=>`<li><span><span class="say">${esc(you(r.txt))}</span><br><span class="small">${esc(you(r.why))}。</span></span></li>`).join('')}</ul></div>`}

