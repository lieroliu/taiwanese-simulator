/* ================= summary ================= */
function idLabel(v){return v>25?'台灣人':v<-25?'中國人':'都是（台灣人也是中國人）'}
const ROLE_LBL={spouse:'配偶',ex:'前任',kid:'孩子',friend:'朋友',crush:'初戀',teacher:'老師',mentor:'前輩'};
function peopleSection(s){const order=['spouse','ex','kid','friend','crush','mentor','teacher'];
  const ps=s.people.filter(p=>ROLE_LBL[p.role]).sort((a,b)=>order.indexOf(a.role)-order.indexOf(b.role)).slice(0,12);if(!ps.length)return '';
  return `<div><h2 style="font-size:22px;margin-bottom:8px">你身邊的人</h2><ul class="keys">${ps.map(p=>`<li><b>${ROLE_LBL[p.role]}</b><span>${esc(fullName(p))}<span class="muted small">（${p.by}–${p.alive?'':p.dyY}${p.job?'・'+JOBLABEL[p.job]:''}${p._meetTxt||''}）</span>${p.story.length?'<br><span class="small">'+esc(p.story.join('，'))+'。</span>':''}</span></li>`).join('')}</ul></div>`}
function summary(){const s=S;show('end');setAuto(false);window.scrollTo(0,0);
  const dy=s.y, h=s.hist;
  const keys=s.key.slice(0,16).map(k=>`<li><b>${k.age} 歲</b><span>${esc(k.text)}<span class="muted small">（${k.y}）</span></span></li>`).join('')||'<li><b>—</b><span>你的人生很短，還來不及留下什麼。</span></li>';
  const rows=[['risk','安穩','冒險'],['rebel','順從','反抗'],['self','顧家','顧自己'],['open','傳統','開放']];
  if(s.ax.pride!==null)rows.push(['pride','隱藏身分','以身分為傲']);
  rows.push(['eng','政治冷感','關心政治']);rows.push(['id','中國人','台灣人']);
  const maxA=Math.max(1,s.age);
  const spark=k=>{const pts=h.map(p=>{let v=p[k];if(v===null||v===undefined)return null;if(k==='id')v=(v+100)/2;return [6+p.age/maxA*588,50-v/100*42]}).filter(Boolean);
    if(!pts.length)return '';const d=pts.map((p,i)=>(i?'L':'M')+p[0].toFixed(1)+' '+p[1].toFixed(1)).join(' ');const L=pts[pts.length-1];
    return `<svg viewBox="0 0 600 56" preserveAspectRatio="none" aria-hidden="true"><line x1="6" x2="594" y1="29" y2="29" stroke="var(--line)" stroke-dasharray="3 4" vector-effect="non-scaling-stroke"/><path d="${d}" fill="none" stroke="${k==='eng'||k==='id'?'var(--red)':'var(--jade)'}" stroke-width="2" vector-effect="non-scaling-stroke"/><circle cx="${L[0]}" cy="${L[1]}" r="3.5" fill="${k==='eng'||k==='id'?'var(--red)':'var(--jade)'}"/></svg>`};
  const lastId=h[h.length-1].id;
  let idTxt='';if(s.age>=18){const changes=[];let prev=null;h.forEach(p=>{if(p.age<15)return;const l=idLabel(p.id);if(l!==prev){changes.push([p.age,l]);prev=l}});
    idTxt=`如果在你晚年問你是哪裡人，你會說自己是「${idLabel(lastId)}」。`+(changes.length>1?`這個答案在你 ${changes.slice(1).map(c=>c[0]+' 歲').join('、')}時改變過。`:'這個答案你一輩子沒有變過。')}
  const engEnd=h[h.length-1].eng;
  const engTxt=s.age>=18?(engEnd>=55?'你是個關心政治的人，':engEnd>=30?'你對政治有自己的看法，但不常說出口，':'你一輩子跟政治保持距離，')+'這是你的性格、出身和經歷一起推出來的結果。':'';
  const ticks=[0,.25,.5,.75,1].map(k=>Math.round(maxA*k));
  $('end').innerHTML=`
   <div class="tomb">
     <div class="muted small">${cohortOf(s.by)}・${s.birthCounty}・${s.eth}・${s.sex==='M'?'男':'女'}</div>
     <div style="font-family:var(--f-display);font-size:22px;font-weight:700">${esc(s.sur+s.given)}${s.tribal?`<small class="muted" style="font-size:15px">（${esc(s.tribal)}）</small>`:''}</div>
     <div class="yrs">${s.by}–${dy}<small>享年 ${s.age} 歲</small></div>
     <p style="margin:0">${s.cause==='自殺'?'你選擇離開了這個世界。':`死因：${esc(s.cause)}`}</p>
     <p class="muted small" style="margin:0">${[s.edu&&`學歷：${s.edu}${s.major?`（${s.major}）`:''}`,s.job&&`最後的工作：${JOBLABEL[s.job]}`,s.kids?`${s.kids} 個孩子`:null,s.house==='own'&&s.houseVal?`房子市值 ${fmtW(s.houseVal)} 萬${s.mortLeft>=1?`（房貸還剩 ${fmtW(s.mortLeft)} 萬）`:''}`:null].filter(Boolean).join('　')}</p>
   </div>
   ${helpSection(s)}
   <div><h2 style="font-size:22px;margin-bottom:8px">你這一生</h2><ul class="keys">${keys}</ul></div>
   ${peopleSection(s)}
   ${habitsSection(s)}
   ${satsSection(s)}
   ${regretsSection(s)}
   ${cohortTable(s)}
   ${popLine(s)}
   ${gensTable(s)}
   <div><h2 style="font-size:22px;margin-bottom:4px">你怎麼變成這樣的人</h2>
     <p class="muted small" style="margin:0 0 12px">線條是每一年的狀態，中間虛線是平均。政治關心度和認同不是你選的，是由性格、出身和經歷推算出來的。${idTxt||engTxt?'':''}</p>
     <p style="margin:0 0 14px">${engTxt}${idTxt}</p>
     <div class="spark">${rows.map(r=>`<div class="spark-row"><div class="lbl"><span>${r[1]}</span><b>${r[0]==='eng'?'政治關心度':r[0]==='id'?'認同':''}</b><span>${r[2]}</span></div>${spark(r[0])}</div>`).join('')}
       <div class="axis-x">${ticks.map(t=>`<span>${t} 歲</span>`).join('')}</div></div>
     <p class="muted small" style="margin:10px 0 0">認同的三個分類，參考政大選舉研究中心「台灣民眾台灣人／中國人認同」長期調查的問法；各年代的社會平均也依該調查趨勢估算。</p>
   </div>
   <div class="endbtns"><button class="btn" id="share" style="background:var(--red);border-color:var(--red)">存成分享圖</button><button class="btn ghost" id="again">同一年再出生一次</button>${s.by-28>=1961?`<button class="btn ghost" id="gUp">看看爸媽那一屆（${s.by-28}）</button>`:''}${s.by+28<=2010?`<button class="btn ghost" id="gDown">看看孩子那一屆（${s.by+28}）</button>`:''}<button class="btn ghost" id="other">換一個年份</button></div>`;
  $('share').onclick=()=>openShare(s);$('again').onclick=()=>begin(s.by);if($('gUp'))$('gUp').onclick=()=>begin(s.by-28);if($('gDown'))$('gDown').onclick=()=>begin(s.by+28);$('other').onclick=()=>{show('start');$('year').focus()};
}

