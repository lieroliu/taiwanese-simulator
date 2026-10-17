/* ================= same-year cohort: simulate others born the same year ================= */
const pctBelow=(arr,v)=>arr.length?Math.round(arr.filter(x=>x<v).length/arr.length*100):0;
const median=a=>{if(!a.length)return null;const b=a.slice().sort((x,y)=>x-y);return b[Math.floor(b.length/2)]};
const tenths=x=>{const v=Math.round(x*10);return v<=0?'不到一':v>=10?'幾乎全部':['','一','兩','三','四','五','六','七','八','九'][v]};
function birthCohort(by){const n=1000,c={pjob:{},inc:[],farm:0,county:{},eth:{}};for(let i=0;i<n;i++){const s=newLife(by);c.pjob[s.pjob]=(c.pjob[s.pjob]||0)+1;c.inc.push(s.money);c.county[s.birthCounty]=(c.county[s.birthCounty]||0)+1;c.eth[s.eth]=(c.eth[s.eth]||0)+1}c.n=n;return c}
/* one simulated classmate, run a few months at a time so the cohort can fill in while the player's own life keeps moving */
function simStart(by){return {s:newLife(by),o:{uni:false,marAge:null,house:false,kids:0,m30:null,death:0},g:0}}
function simMonths(r,until){const s=r.s,o=r.o;
  while(!s.dead&&r.g<1500){if(performance.now()>until)return false;r.g++;for(const e of step(s)){if(e.choices)doChoice(s,e,autoChoose(s,e))}
    if(s.edu==='大學')o.uni=true;if(s.married&&o.marAge===null)o.marAge=s.age;if(s.house==='own')o.house=true;if(s.age===30&&o.m30===null)o.m30=s.money}
  o.kids=s.kids;o.death=s.age;o.houseAge=s.houseAge??null;o.c40=s.cash40m??null;o.big=s.bigN||0;return true}
/* tests/cohort.js simulates whole cohorts with this; the game itself compares against official statistics (OFF) instead */
function simOne(by){const r=simStart(by);simMonths(r,Infinity);return r.o}
function birthCmp(s){const c=birthCohort(s.by);const same=Math.round((c.pjob[s.pjob]||0)/c.n*100);const beat=pctBelow(c.inc,s.money);const cs=Math.round((c.county[s.birthCounty]||0)/c.n*100);
  return `同一年出生的 100 個孩子裡，有 ${same} 個跟我一樣，爸媽${JOBNAME[s.pjob]}；有 ${Math.max(1,cs)} 個跟我一樣生在${s.birthCounty}。我的家境，好過同年 ${beat}% 的人。`}
/* official figures for one year: the nearest year the table has, so a life past the last published year uses the latest one */
function offAt(k,y){const T=OFF[k],ys=Object.keys(T).map(Number);if(!ys.length)return null;const lo=Math.min(...ys),hi=Math.max(...ys),yy=Math.max(lo,Math.min(hi,y));
  let best=lo;for(const x of ys)if(Math.abs(x-yy)<Math.abs(best-yy))best=x;return {y:best,v:T[best]}}
const sexKey=s=>s.sex==='M'?'M':'F';
const uniLbl=y=>y<2002?'大學聯考錄取率':'大學考試分發錄取率';
function cmpLine(s,e){s.f.cmp=s.f.cmp||{};const F=s.f.cmp;
  if(e&&e.death){const l=offAt('le',s.by);return l?`我出生那年，${s.sex==='M'?'男':'女'}生的平均預期壽命是 ${Math.round(l.v[sexKey(s)])} 歲。`:null}
  if(s.edu==='大學'&&!F.uni){F.uni=1;const u=offAt('uni',s.y);return u?`那一年，${uniLbl(u.y)}是 ${Math.round(u.v)}%。`:null}
  if(s.married&&!F.mar){F.mar=1;const m=offAt('mar',s.y);if(!m)return null;const a=m.v[sexKey(s)];return `那一年第一次結婚的${s.sex==='M'?'男生':'女生'}，平均 ${a.toFixed(1)} 歲。我${s.age<a-1.5?'比大多數人早':s.age>a+1.5?'比大多數人晚':'跟大家差不多'}。`}
  if(s.kids===1&&!F.kid){F.kid=1;const t=offAt('tfr',s.y);return t?`那一年，台灣的女人平均一輩子生 ${t.v.toFixed(1)} 個孩子。`:null}
  if(s.age===25&&!F.w25&&working(s)){F.w25=1;const w=offAt('wage',s.y);return w&&w.y===s.y?`那一年，受僱的人平均每個月領 ${w.v.toLocaleString()} 元。`:null}
  return null}
/* the end screen's 你這一屆: official statistics for the year each thing happened to this cohort, with sources */
const OFF_SRC='出生數、初婚年齡、總生育率：內政部戶政司；大學錄取率：大學考試入學分發委員會等；預期壽命：內政部簡易生命表。';
function cohortTable(s){const by=s.by,K=sexKey(s),roc=y=>`民國 ${y-1911} 年`,row=(k,me,them)=>`<tr><th scope="row">${k}</th><td>${me}</td><td>${them}</td></tr>`;
  const b=offAt('births',by),u=offAt('uni',by+18),m=offAt('mar',by+28),t=offAt('tfr',by+30),l=offAt('le',by);
  const ma=s.key.find(k=>k.text==='結婚'||k.text.includes('結婚'));const R=[];
  if(b)R.push(row('出生','你是其中一個',`${roc(b.y)}全台出生 ${b.v.toLocaleString()} 人`));
  if(u&&s.age>=18)R.push(row('上大學',s.edu==='大學'?'讀了':'沒讀',`${roc(u.y)}${uniLbl(u.y)} ${Math.round(u.v)}%`));
  if(m&&s.age>=25)R.push(row('結婚',ma?`${ma.age} 歲`:'沒有結婚',`${roc(m.y)}初婚的${K==='M'?'男生':'女生'}平均 ${m.v[K].toFixed(1)} 歲`));
  if(t&&s.age>=30)R.push(row('孩子',`${s.kids} 個`,`${roc(t.y)}總生育率 ${t.v.toFixed(2)}`));
  if(l)R.push(row('壽命',`${s.age} 歲`,`${roc(l.y)}出生的${K==='M'?'男生':'女生'}平均預期壽命 ${Math.round(l.v[K])} 歲`));
  const u0=offAt('uni',by+8),u1=offAt('uni',by+28),era=s.age>=18&&u&&u0&&u1&&u0.y!==u.y&&u1.y!==u.y?`<p style="margin:10px 0 0">比你大十歲的人考大學那年，錄取率是 ${Math.round(u0.v)}%；比你小十歲的人，是 ${Math.round(u1.v)}%。</p>`:'';
  return `<div><h2 style="font-size:22px;margin-bottom:4px">你這一屆</h2><p class="muted small" style="margin:0 0 10px">${by} 年出生的人，在人生各個時候碰到的真實數字。</p>
   <div class="tblwrap"><table class="cmp"><thead><tr><th></th><th>你</th><th>你這一屆那時候</th></tr></thead><tbody>${R.join('')}</tbody></table></div>${era}
   <p class="muted small" style="margin:8px 0 0">資料來源：${OFF_SRC}超出已公布年份的，用最近一年的數字。</p></div>`}
