/* ================= era wall: things you wanted that the era did not allow, shown on the end screen =================
   eraLog(s,k,txt,why,w): any file can add one. txt = 沒能…。, why = the era reason with a real figure when there is one.
   A choice that fails for an era reason goes here instead of 你後悔的事 (regrets keep only personal reasons). */
function eraLog(s,k,txt,why,w){s.eraLog=s.eraLog||[];if(s.eraLog.some(r=>r.k===k))return;s.eraLog.push({k,txt,why,w:w||1,y:s.y,age:s.age})}
const pctOf=(k,y)=>{const o=offAt(k,y);return o?Math.round(o.v):null};
const wan=n=>Math.round(n/1e4);
const unempAt=y=>{const o=offAt('unemp',y);return o?`那一年失業率 ${o.v.toFixed(2)}%`:'那一年景氣很差，到處都在裁員'};
/* era reason for a failed choice at this moment, or null when the failure was personal */
const ERA_WHY={
 '考大學':s=>{const u=pctOf('uni',s.y);return u!==null&&u<50?`那年${uniLbl(s.y)}只有 ${u}%，班上 50 個人，大概 ${Math.round(u/2)} 個考上`:null},
 '考高中':s=>{const j=pctOf('jh',s.y);return j!==null&&j<80?`那一年，國中畢業生只有 ${j}% 繼續升學`:null},
 '去學校教書':s=>{if(s.y<2004)return null;const a=OFF.births[s.by],b=offAt('births',s.y-6);return a&&b?`你出生那年，台灣生了 ${wan(a)} 萬個孩子；那年上小學的，只剩 ${wan(b.v)} 萬個`:'那幾年少子化，學校一直在減班'},
 '進公司上班':s=>hardY(s.y)?unempAt(s.y):null,
 '進科學園區':s=>hardY(s.y)?unempAt(s.y)+'，科技業正在裁員':null,
 '北上打拼':s=>hardY(s.y)?unempAt(s.y):null,
 '找同樣的工作':s=>hardY(s.y)?unempAt(s.y):null,
 '進工廠':s=>s.y>=2000?'附近的工廠一間一間搬去了對岸':null,
 '買':s=>houseWhy(s),'買（貸三十年）':s=>houseWhy(s),'買（新青安四十年）':s=>houseWhy(s),
 '退休':s=>s.f.wasGJ||s.job==='公教'?(s.y>=2018?'年金改革以後，退休金少了一大截':null):null};
function houseWhy(s){if(s.y>=1987&&s.y<=1990)return '那幾年房價一個月漲一次，存錢的速度追不上';
  const inc=myIncome(s)+spIncome(s),hp=housePrice(s);if(s.y>=2005&&inc>0&&hp/inc>=8)return `一間房子的總價，是你們家 ${Math.round(hp/inc)} 年的收入`;return null}
const ERA_TXT={'考大學':'沒能讀大學。','考高中':'沒能讀高中。','去學校教書':'沒能當上正式老師。','進公司上班':'沒能找到想要的工作。','進科學園區':'沒能進科學園區。',
 '北上打拼':'沒能在台北待下來。','找同樣的工作':'失業以後，沒能回到原本的行業。','進工廠':'沒能進工廠。','買':'沒能買下自己的房子。','買（貸三十年）':'沒能買下自己的房子。',
 '買（新青安四十年）':'沒能買下自己的房子。','退休':'沒能在想退休的時候退休。'};
const eraWhyLine=(s,cause)=>`${s.y} 年，你 ${s.age} 歲。${cause}`;
{const dc4=doChoice;doChoice=function(s,e,c){const r=dc4(s,e,c);
  if(r&&r.text&&(r.fail||/可是/.test(r.text))&&ERA_WHY[c.label]){const cause=ERA_WHY[c.label](s),txt=ERA_TXT[c.label]||REG_T[c.label]?.[0]||'沒能做到想做的事。';
    if(cause)eraLog(s,'e_'+txt,txt,eraWhyLine(s,cause),REG_T[c.label]?.[1]||1)}
  if(r&&r.text&&/供弟弟讀書/.test(r.text)&&s.regrets&&s.regrets.some(x=>x.k==='nostudy')){const j=pctOf('jh',s.y);
    eraLog(s,'nostudy','沒能繼續讀書。',eraWhyLine(s,'家裡要你去工作，供弟弟讀書'+(j!==null&&j<80?`。那一年，國中畢業生有 ${100-j}% 沒有繼續升學`:'')),3)}
  if(s.eraLog&&s.regrets){const T=new Set(s.eraLog.map(x=>x.txt));s.regrets=s.regrets.filter(x=>x.k!=='nostudy'&&!T.has(x.txt)&&!(x.k==='c_'+c.label&&s.eraLog.some(y=>y.y===s.y&&y.txt===(ERA_TXT[c.label]||''))))}
  return r}}
const ERA_SHOW=8;
function eraWallSection(s){const L=(s.eraLog||[]).slice().sort((a,b)=>a.y-b.y||a.age-b.age);if(!L.length)return '';
  const li=r=>`<li><span><span class="say">${esc(you(r.txt))}</span><br><span class="small">${esc(you(r.why))}。</span></span></li>`;
  const top=L.length>ERA_SHOW?L.slice().sort((a,b)=>b.w-a.w).slice(0,ERA_SHOW):L,shown=L.filter(r=>top.includes(r)),rest=L.filter(r=>!top.includes(r));
  return `<div><h2 style="font-size:22px;margin-bottom:4px">時代沒讓你做到的事</h2><p class="muted small" style="margin:0 0 10px">你這一生，有 ${L.length} 次，你想做，時代說不行。</p>
  <ul class="keys habits">${shown.map(li).join('')}</ul>${rest.length?`<details><summary class="small">再看 ${rest.length} 項</summary><ul class="keys habits">${rest.map(li).join('')}</ul></details>`:''}</div>`}
