/* ================= same-year cohort: simulate others born the same year ================= */
const COH={};
const pctBelow=(arr,v)=>arr.length?Math.round(arr.filter(x=>x<v).length/arr.length*100):0;
const median=a=>{if(!a.length)return null;const b=a.slice().sort((x,y)=>x-y);return b[Math.floor(b.length/2)]};
const tenths=x=>{const v=Math.round(x*10);return v<=0?'不到一':v>=10?'幾乎全部':['','一','兩','三','四','五','六','七','八','九'][v]};
function birthCohort(by){const n=1000,c={pjob:{},inc:[],farm:0,county:{},eth:{}};for(let i=0;i<n;i++){const s=newLife(by);c.pjob[s.pjob]=(c.pjob[s.pjob]||0)+1;c.inc.push(s.money);c.county[s.birthCounty]=(c.county[s.birthCounty]||0)+1;c.eth[s.eth]=(c.eth[s.eth]||0)+1}c.n=n;return c}
function simOne(by){const s=newLife(by);const o={uni:false,marAge:null,house:false,kids:0,m30:null,death:0};let g=0;
  while(!s.dead&&g<1500){g++;for(const e of step(s)){if(e.choices)doChoice(s,e,autoChoose(s,e))}
    if(s.edu==='大學')o.uni=true;if(s.married&&o.marAge===null)o.marAge=s.age;if(s.house==='own')o.house=true;if(s.age===30&&o.m30===null)o.m30=s.money}
  o.kids=s.kids;o.death=s.age;return o}
function cohortRun(by,done){if(COH[by]&&COH[by].ready){done&&done();return}const c=COH[by]=COH[by]||{lives:[],ready:false};const N=300;
  const chunk=()=>{const t0=performance.now();while(c.lives.length<N&&performance.now()-t0<40)c.lives.push(simOne(by));if(c.lives.length<N)setTimeout(chunk,0);else{
    const L=c.lives;c.uni=L.filter(x=>x.uni).length/N;c.marAges=L.filter(x=>x.marAge!==null).map(x=>x.marAge);c.ever=c.marAges.length/N;c.house=L.filter(x=>x.house).length/N;
    c.kidsAvg=L.reduce((a,x)=>a+x.kids,0)/N;c.m30=L.filter(x=>x.m30!==null).map(x=>x.m30);c.deaths=L.map(x=>x.death);c.ready=true;done&&done()}};chunk()}
function birthCmp(s){const c=birthCohort(s.by);const same=Math.round((c.pjob[s.pjob]||0)/c.n*100);const beat=pctBelow(c.inc,s.money);const cs=Math.round((c.county[s.birthCounty]||0)/c.n*100);
  return `同一年出生的 100 個孩子裡，有 ${same} 個跟我一樣，爸媽${JOBNAME[s.pjob]}；有 ${Math.max(1,cs)} 個跟我一樣生在${s.birthCounty}。我的家境，好過同年 ${beat}% 的人。`}
function cmpLine(s,e){const c=COH[s.by];if(!c||!c.ready)return null;s.f.cmp=s.f.cmp||{};const F=s.f.cmp;
  if(e&&e.death){const d=c.deaths;return `同一年出生的人，一半活過 ${median(d)} 歲。我活得比 ${pctBelow(d,s.age)}% 的人久。`}
  if(s.edu==='大學'&&!F.uni){F.uni=1;return `同一年出生的人，大約${tenths(c.uni)}成讀了大學。`}
  if(s.married&&!F.mar){F.mar=1;const m=median(c.marAges);return `同一年出生的人，${tenths(c.ever)}成這輩子結了婚，一半在 ${m} 歲以前。我${s.age<m?'比大多數人早':s.age>m?'比大多數人晚':'跟大家差不多'}。`}
  if(s.house==='own'&&!F.house){F.house=1;return `同一年出生的人，大約${tenths(c.house)}成這輩子買了房子。`}
  if(s.kids===1&&!F.kid){F.kid=1;return `同一年出生的人，平均每人有 ${c.kidsAvg.toFixed(1)} 個孩子。`}
  if(s.age===30&&!F.m30&&c.m30.length){F.m30=1;const top=100-pctBelow(c.m30,s.money);return `30 歲這年，我的經濟狀況排在同年出生的人的${top<=50?`前 ${Math.max(1,top)}%`:`後 ${Math.max(1,100-top)}%`}。`}
  if(s.age===35&&!s.married&&!s.f.divorced&&!F.single){F.single=1;return `35 歲了，我還沒結婚。同一年出生的人，到這個年紀約${tenths(c.marAges.filter(a=>a<=35).length/c.lives.length)}成已經結婚了。`}
  return null}
function cohortTable(s){const c=COH[s.by];if(!c||!c.ready)return '';const marMed=median(c.marAges),dMed=median(c.deaths);
  const row=(k,me,them,pos)=>`<tr><th scope="row">${k}</th><td>${me}</td><td>${them}</td><td>${pos}</td></tr>`;
  const ma=s.key.find(k=>k.text==='結婚'||k.text.includes('結婚'));const marAge=ma?ma.age:null;
  const m30=s.hist.find(h=>h.age===30);
  return `<div><h2 style="font-size:22px;margin-bottom:4px">你在同屆裡的位置</h2><p class="muted small" style="margin:0 0 10px">跟 ${s.by} 年出生的另外 ${c.lives.length} 個模擬人生比較，依模擬估算。</p>
   <div class="tblwrap"><table class="cmp"><thead><tr><th></th><th>你</th><th>同屆</th><th>你的位置</th></tr></thead><tbody>
   ${row('學歷',s.edu||'—',`${Math.round(c.uni*100)}% 讀了大學`,s.edu==='大學'?`前 ${Math.round(c.uni*100)}%`:`後 ${100-Math.round(c.uni*100)}%`)}
   ${row('結婚',marAge!==null?marAge+' 歲':'沒有結婚',`${Math.round(c.ever*100)}% 結過婚，一半在 ${marMed} 歲前`,marAge===null?'—':marAge<marMed?'比多數人早':marAge>marMed?'比多數人晚':'跟大家差不多')}
   ${row('房子',s.f.cmp&&s.f.cmp.house||s.house==='own'?'買了':'沒有買',`${Math.round(c.house*100)}% 買了房`,'—')}
   ${row('孩子',s.kids+' 個',`平均 ${c.kidsAvg.toFixed(1)} 個`,s.kids>c.kidsAvg+.5?'比多數人多':s.kids<c.kidsAvg-.5?'比多數人少':'跟大家差不多')}
   ${row('壽命',s.age+' 歲',`一半活過 ${dMed} 歲`,`活得比 ${pctBelow(c.deaths,s.age)}% 的人久`)}
   </tbody></table></div></div>`}
