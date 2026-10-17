/* ================= job-region: where you live shapes which jobs are around and what they pay =================
   JRI: each county's share of workers by industry relative to Taiwan [農, 製造, 商業, 公共教育醫療, 其他服務]
        (主計總處 1990/1995 普查, 2020 人力資源調查; years between are interpolated, 估算).
   JRC: each county's household disposable income relative to the national average (主計總處 家庭收支調查).
   Pay uses 60% of that gap, because household income also counts how many people in the house work (估算). */
const jrLerp=(T,y,c,dflt)=>{const ys=Object.keys(T).map(Number).sort((a,b)=>a-b);const at=k=>T[k]&&T[k][c];
  let lo=ys.filter(k=>k<=y&&at(k)!=null).pop(),hi=ys.find(k=>k>=y&&at(k)!=null);if(lo==null)lo=hi;if(hi==null)hi=lo;if(lo==null)return dflt;
  const a=at(lo),b=at(hi),f=hi===lo?0:(y-lo)/(hi-lo);return Array.isArray(a)?a.map((v,i)=>v+(b[i]-v)*f):a+(b-a)*f};
const IND=s=>{const v=jrLerp(JRI,s.y,s.place,null)||[1,1,1,1,1];return {a:v[0],m:v[1],c:v[2],p:v[3],o:v[4]}};
regM=s=>{if(abroad(s)||s.place==='中國')return 1.15;const r=jrLerp(JRC,s.y,s.place,1);return 1+(r-1)*.6};
/* which job options people around you actually take (auto-run only; damped so no option disappears) */
const indPull=x=>clamp(Math.pow(x,.8),.4,2.5);
PULL['job:進工廠']=s=>indPull(IND(s).m);PULL['job:進公司上班']=s=>indPull(IND(s).o);
PULL['job:考公職']=s=>indPull(IND(s).p);PULL['job:去學校教書']=s=>indPull(IND(s).p);
/* science parks: 竹科 (1980), 南科 (1996), 中科 (2003). Living elsewhere, the job means moving to the nearest one */
const PARKS=[{y:1985,county:'新竹市',near:['新竹市','新竹縣'],name:'新竹',park:'新竹科學園區'},{y:1996,county:'台南縣',near:['台南縣','台南市'],name:'台南',park:'南部科學園區'},
 {y:2003,county:'台中縣',near:['台中縣','台中市'],name:'台中',park:'中部科學園區'}];
function parkFor(s){const open=PARKS.filter(p=>s.y>=p.y);if(!open.length)return null;const h=open.find(p=>p.near.includes(s.place));if(h)return Object.assign({here:1},h);
  const rg=regionOf(s.place);return (rg==='南'&&open.find(p=>p.name==='台南'))||(rg==='中'&&open.find(p=>p.name==='台中'))||open[0]}
for(const p of PARKS){const lb=`搬去${p.name}進園區`;ASP.job[lb]=ASP.job['進科學園區'];LEAN[lb]=LEAN['進科學園區'];REG_T[lb]=REG_T['進科學園區'];SAT_T[lb]=SAT_T['進科學園區']}
LEAN['回家討海']={self:-1,open:-.5};
/* the job title inside each group leans on what that county makes (縣市製造業前三大行業 1990, 工業區官方介紹; 估算) */
const OCC_REG=[
 [['電子技術員','半導體廠作業員','電路板廠作業員','組裝作業員'],['新竹市','新竹縣','桃園縣','基隆市','台北縣','台北市','高雄市'],1.6],
 [['車床操作員','電焊工','機械技術員'],['高雄市','高雄縣','台中市','台中縣','彰化縣','台南市','嘉義市'],1.6],
 [['紡織女工'],['桃園縣','新竹縣','彰化縣','台南縣','雲林縣'],1.8],[['車縫女工'],['宜蘭縣','雲林縣','嘉義縣','台南市'],1.8],
 [['塑膠射出操作員'],['台中縣','彰化縣','台南市'],1.6],[['食品廠作業員'],['雲林縣','嘉義縣','屏東縣','台南縣','澎湖縣'],1.8],
 [['理財專員','行銷企劃','人資','秘書','銀行櫃員','系統分析師','軟體工程師'],['台北市'],1.8],
 [['餐廳服務生','廚師','店員'],['花蓮縣','台東縣','澎湖縣','金門縣','連江縣'],1.5],[['看護'],['花蓮縣','台東縣','屏東縣','雲林縣','嘉義縣'],1.4]];
function occRegW(s,t){let w=1;for(const [ts,cs,m] of OCC_REG)if(ts.includes(t))w*=cs.includes(s.place)?m:1;
  if(['理財專員','行銷企劃'].includes(t)&&!['北'].includes(regionOf(s.place)))w*=.6;return w}
/* the peer-norm tag follows the local job market when nothing more specific applies */
{const cf=ctxFor;ctxFor=function(s,id){const r=cf(s,id);if(id!=='job'||!r)return r;
  if(r.norm&&r.norm.includes('進科學園區'))return Object.assign({},r,{norm:r.norm.concat(PARKS.map(p=>`搬去${p.name}進園區`))});
  if(r.text!=='大家都想找一份穩定的工作'&&r.text!=='身邊的朋友，大多進了工廠')return r;const I=IND(s),mid=['高中','五專','大學'].includes(s.edu);
  if(mid&&['澎湖縣','金門縣','連江縣'].includes(s.place))return {text:'島上的年輕人，不是考公職，就是去台灣找工作',norm:['考公職']};
  if(I.m>=1.25)return {text:'這附近到處都是工廠，同學大多進了工廠',norm:['進工廠']};
  if(mid&&I.p>=1.15&&I.m<.7)return {text:'家鄉工作不多，大家都想考公職',norm:['考公職']};
  if(mid&&s.place==='台北市')return {text:'在台北，大家都想進公司上班',norm:['進公司上班']};
  return r}}
/* fishing families on the islands: the job group is 農, the title says 討海 */
{const jt=jobTitle;jobTitle=s=>s.f&&s.f.fish&&s.job==='農'?'討海':jt(s)}
