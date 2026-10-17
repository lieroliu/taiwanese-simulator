/* ================= reaction helpers ================= */
function pIn(s){let sc=.35*s.ax.rebel+.25*s.ax.risk+.4*s.eng-(s.kids?12:0)-(s.ax.self<35?8:0)+(s.studying==='大學'?10:0);return clamp((sc-40)/40,0,.85)}
function engTarget(s){if(s.engOff===undefined)s.engOff=(R()-.5)*50;if(s.age<15)return 8;
  let t=23+(s.ax.rebel-50)*.5+(s.ax.open-50)*.15+(s.ax.risk-50)*.1+s.engOff+(s.engExp||0)
   +({'大學':8,'高中':3,'五專':3}[s.edu]||0)+(s.fam==='受難者家屬'?14:0)+(s.f.served&&s.y<1990?-2:0)
   +(s.y>=1986&&s.y<=2000?6:0)+(s.y>=2014&&s.y<=2016&&s.age<35?6:0)+(s.age>=55?4:0)-(s.kids&&s.age<45?3:0);
  if(s.engExp)s.engExp*=.97;return clamp(t,0,92)}
function pol(s,o){
  if(s.age<12) return o.kid||null;
  let st='far';
  if(o.in&&o.join&&o.join(s)&&chance(pIn(s))) st='in';
  else if(s.eng>=40||s.ax.rebel>=62) st='sym';
  let txt=o[st]; if(typeof txt==='function')txt=txt(s);
  if(!txt&&st==='sym'){txt=typeof o.far==='function'?o.far(s):o.far;st='far'}
  if(!txt) return null;
  s._st=st;
  txt+=polWhy(s,st,txt);
  s.engExp=(s.engExp||0)+(st==='in'?8:st==='sym'?3:0);
  if(st==='in'){fx(s,{eng:10,rebel:4,risk:3,id:o.idIn||0});key(s,o.keyIn||o.title)}
  else if(st==='sym')fx(s,{eng:4,id:o.idSym||0});
  else fx(s,{eng:-1});
  return txt;
}
function hl(s,o){if(s.age<12)return o.kid||null;const t=s.eng>=40?(o.hi||o.lo):(o.lo||o.hi);return typeof t==='function'?t(s):t}
const schoolKid=(s,a0=6)=>{const L=(s.people||[]).filter(p=>p.role==='kid'&&p.alive!==false&&s.y-p.by>=a0&&s.y-p.by<=17);if(L.length)return pick(L);if((s.people||[]).some(p=>p.role==='kid'))return null;return (s.kidBorn||[]).some(t=>s.t-t>=a0*12&&s.t-t<=17*12+11)?{}:null};
const templeAsk=s=>working(s)?'工作':s.kids&&s.age>=45?'孩子':s.age>=60?'身體':'家裡';
const working=s=>s.job&&!['退休','家管','失業'].includes(s.job)&&!s.studying;
const isStudent=s=>!!s.studying;
const inTaipei=s=>['台北市','台北縣'].includes(s.place);
const media=s=>s.y<1975?'收音機':s.y<1990?pick(['電視','報紙']):s.y<2008?'電視新聞':s.y<2014?'網路新聞':'手機上的新聞';
function mom(s){if(s.age<12)return pick(['吃晚飯的時候','放學回到家','睡覺前']);if(isStudent(s)||s.age<18)return pick(['放學回家','下課的時候','晚自習前']);const j=s.job;
  if(j==='工廠')return '在工廠午休時';if(j==='營造')return '在工地休息時';if(j==='農')return '從田裡回來';if(j==='自營')return '顧店的時候';if(j==='台幹')return '在對岸的宿舍裡';if(j==='退休'||s.age>=65)return '在公園跟老朋友泡茶時';return pick(['下班回家','吃早餐的時候','午休的時候'])}

