/* ================= 人生圖鑑: every life played is collected in localStorage (eras, counties, ethnicities, jobs, special lives) ================= */
const DEX_KEY='dex1',DEX_ERAS=['五年級','六年級','七年級','八年級','九年級'],DEX_ETH=Object.keys(ETH_OFF),
  DEX_JOBS=Object.keys(JOBLABEL).filter(j=>!['家管','退休','失業'].includes(j));
/* special lives: [id, name, test at death]; locked ones show as ？？？ */
const DEX_END=[
  ['100','百歲人瑞',s=>s.age>=100],
  ['90','活過九十',s=>s.age>=90],
  ['home','有自己的房子',s=>s.house==='own'],
  ['rich','千萬身家',s=>netWorth(s)>=1000],
  ['kids','兒孫滿堂',s=>(s.kids||0)>=3],
  ['old2','牽手到老',s=>s.married&&s.age>=80],
  ['solo','一個人的晚年',s=>!s.married&&s.age>=65],
  ['away','住過國外',s=>!!s._dexAway],
  ['stay','一輩子沒離開家鄉',s=>s.age>=50&&!s._dexLeft],
  ['jobs','換過三種工作',s=>(s._dexJobs||[]).length>=3],
  ['street','睡過街頭',s=>!!s.f.homeless],
];
function dexLoad(){try{const d=JSON.parse(localStorage.getItem(DEX_KEY));if(d&&d.lives)return d}catch(e){}return {lives:0,kinds:[],era:[],county:[],eth:[],job:[],end:[]}}
function dexSave(d){try{localStorage.setItem(DEX_KEY,JSON.stringify(d))}catch(e){}}
/* track what only shows up during a life: jobs held, leaving home, living abroad */
{const y0=yearly;yearly=function(s){y0(s);
  if(working(s)&&DEX_JOBS.includes(s.job)){s._dexJobs=s._dexJobs||[];if(!s._dexJobs.includes(s.job))s._dexJobs.push(s.job)}
  if(s.place&&s.place!==s.birthCounty)s._dexLeft=1;if(abroad(s)||s.f.abroad)s._dexAway=1}}
/* adds this life to the collection once; returns what was new */
function dexRecord(s){const d=dexLoad();if(s._dexNew)return [d,s._dexNew];
  const add=(k,v)=>{if(v&&!d[k].includes(v)){d[k].push(v);return v}return null},nw=[];
  d.lives++;
  add('kinds',[cohortOf(s.by),s.birthCounty,s.eth,s.sex].join('|'));
  [add('era',cohortOf(s.by)),add('county',s.birthCounty),add('eth',s.eth)].forEach(v=>v&&nw.push(v));
  (s._dexJobs||[]).forEach(j=>add('job',j)&&nw.push(JOBLABEL[j]));
  DEX_END.forEach(([id,n,t])=>{let ok=false;try{ok=t(s)}catch(e){}if(ok&&add('end',id))nw.push(n)});
  dexSave(d);s._dexNew=nw;return [d,nw]}
function dexRow(label,all,got,name=x=>x,lock=false){const n=all.filter(x=>got.includes(x)).length;
  return `<div class="dex-row"><div class="dex-lbl"><b>${label}</b><span class="muted small">${n}/${all.length}</span></div><div class="dex-chips">${all.map(x=>got.includes(x)?`<span class="dex-chip on">${esc(name(x))}</span>`:`<span class="dex-chip">${lock?'？？？':esc(name(x))}</span>`).join('')}</div></div>`}
function dexSection(s){const [d,nw]=dexRecord(s),k=d.kinds.length;
  const lead=d.lives===1?'這是你活的第一輩子。':`你已經活過 <b class="dex-n">${k}</b> 種台灣人（一共 ${d.lives} 輩子）。`;
  const newTxt=nw.length?`這一生新收集到：${nw.map(esc).join('、')}。`:'這一生沒有收集到新東西，跟上輩子的你有點像。';
  const missE=DEX_ETH.filter(e=>!d.eth.includes(e)),missR=DEX_ERAS.filter(e=>!d.era.includes(e));
  const tip=missR.length?`還沒活過${missR[0]}，下一輩子試試看？`:missE.length?`還沒當過${missE[0]}，不過這要看運氣。`:'';
  return `<div class="dex"><h2 style="font-size:22px;margin-bottom:4px">人生圖鑑</h2>
   <p style="margin:0 0 4px">${lead}${newTxt}</p>${tip?`<p class="muted small" style="margin:0 0 12px">${tip}</p>`:''}
   ${dexRow('年級',DEX_ERAS,d.era)}
   ${dexRow('出生地',COUNTIES.map(c=>c[0]),d.county)}
   ${dexRow('族群',DEX_ETH,d.eth)}
   ${dexRow('做過的工作',DEX_JOBS,d.job,j=>JOBLABEL[j])}
   ${dexRow('特別的一生',DEX_END.map(e=>e[0]),d.end,id=>DEX_END.find(e=>e[0]===id)[1],true)}
   <p class="muted small" style="margin:8px 0 0">圖鑑只存在這台裝置的瀏覽器裡。</p></div>`}
/* one line on the start screen once there is something collected */
function dexStartLine(){const d=dexLoad();let el=$('dexLine');
  if(!el){el=document.createElement('p');el.id='dexLine';el.className='small muted';el.style.margin='0';$('yearform').insertAdjacentElement('afterend',el)}
  el.textContent=d.lives?`人生圖鑑：你已經活過 ${d.kinds.length} 種台灣人，收集了 ${d.county.length} 個縣市、${d.eth.length} 個族群、${d.end.length} 種特別的一生。`:'';el.hidden=!d.lives}
{const _sum=summary;summary=function(){_sum();const s=S,b=$('end').querySelector('.endbtns');if(!b)return;b.insertAdjacentHTML('beforebegin',dexSection(s));dexStartLine()}}
dexStartLine();
