/* ================= three cohorts side by side on the end screen ================= */
const medOf=a=>{const b=a.filter(x=>x!==null&&x!==undefined);return b.length?median(b):null};
function gensData(by){const c=COH[by];if(!c||!c.ready)return null;const L=c.lives,N=L.length;const own=L.filter(x=>x.houseAge!==null&&x.houseAge!==undefined);
  return {uni:Math.round(L.filter(x=>x.uni).length/N*100),house:Math.round(own.length/N*100),hAge:medOf(own.map(x=>x.houseAge)),c40:medOf(L.map(x=>x.c40)),big:medOf(L.map(x=>x.big))}}
function gensTable(s){const ys=[s.by-10,s.by,s.by+10].filter(y=>y>=1961&&y<=2010);const D=ys.map(gensData);
  if(D.some(d=>!d)){let left=ys.length;ys.forEach(y=>cohortRun(y,()=>{if(--left===0){const el=document.getElementById('gens');if(el&&S===s)el.outerHTML=gensTable(s)}}));
    return `<div id="gens"><h2 style="font-size:22px;margin-bottom:4px">上一屆、你這一屆、下一屆</h2><p class="muted small" style="margin:0">正在模擬前後兩屆的人生……</p></div>`}
  const lbl=y=>y===s.by?`<b>你這一屆</b><br><span class="small muted">${cohortOf(y)}・${y}</span>`:`${y<s.by?'上一屆':'下一屆'}<br><span class="small muted">${cohortOf(y)}・${y}</span>`;
  const me={uni:s.edu==='大學'?'讀了':'沒讀',house:s.houseAge!=null?`${s.houseAge} 歲買房`:'沒買房',c40:s.cash40m!=null?`約 ${Math.max(0,Math.round(s.cash40m))} 個月薪水`:'—',big:`${s.bigN||0} 件`};
  const row=(k,f,mine)=>`<tr><th scope="row">${k}</th>${D.map(d=>`<td>${f(d)}</td>`).join('')}<td>${mine}</td></tr>`;
  return `<div id="gens"><h2 style="font-size:22px;margin-bottom:4px">上一屆、你這一屆、下一屆</h2><p class="muted small" style="margin:0 0 10px">各模擬 300 個人生，相隔十年出生。財產是存款加上房子扣掉房貸，換算成當年的月薪，才能跨年代比較。</p>
   <div class="tblwrap"><table class="cmp"><thead><tr><th></th>${ys.map(y=>`<th>${lbl(y)}</th>`).join('')}<th>你</th></tr></thead><tbody>
   ${row('讀大學',d=>`${d.uni}%`,me.uni)}
   ${row('買房',d=>`${d.house}%${d.hAge?`，一半在 ${d.hAge} 歲前`:''}`,me.house)}
   ${row('40 歲財產',d=>d.c40!=null?`約 ${Math.max(0,Math.round(d.c40))} 個月薪水`:'—',me.c40)}
   ${row('遇過的大事',d=>`${d.big} 件`,me.big)}
   </tbody></table></div></div>`}
{const y0=yearly;yearly=function(s){y0(s);if(s.age===40&&s.cash40m==null)s.cash40m=netWorth(s)*1e4/wageM(s.y)}}
const regretTop=s=>(s.regrets||[]).filter(r=>!(r.single&&s.f.everMar)).sort((a,b)=>b.w-a.w||a.age-b.age).slice(0,3).sort((a,b)=>a.age-b.age);
function regretsSection(s){const H=regretTop(s);if(!H.length)return '';
  return `<div><h2 style="font-size:22px;margin-bottom:4px">你後悔的事</h2><p class="muted small" style="margin:0 0 10px">這些事，你後來常常想起。</p>
  <ul class="keys habits">${H.map(r=>`<li><span><span class="say">${esc(you(r.txt))}</span><br><span class="small">${esc(you(r.why))}。</span></span></li>`).join('')}</ul></div>`}

