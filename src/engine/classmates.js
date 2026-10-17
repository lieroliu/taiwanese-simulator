/* ================= 國小同班同學: five kids born the same year in the same county, each with a light life of their own ================= */
/* rolled the year you start school with the same chain as you (newLife: county → ethnicity → sex → family), then moved once a year by
   a few dice per year, never by the monthly loop. The end screen tells what became of them (ui/classmates.js). */
const MATE_N=5;
/* % of 國中 graduates going on to senior secondary, 教育部 各級學校畢業生升學率 (data/stats/education.json) */
const JH_CONT={1965:78.5,1970:82.7,1975:65.8,1980:65.2,1985:71.3,1990:84.7,1995:89.2,2000:95.3,2005:94.9,2010:98.2,2015:99.6};
const atYear=(T,y)=>{const ys=Object.keys(T).map(Number);let lo=ys[0],hi=ys[ys.length-1];if(y<=lo)return T[lo];if(y>=hi)return T[hi];
  for(let i=1;i<ys.length;i++)if(y<=ys[i]){const a=ys[i-1],b=ys[i];return lerp(T[a],T[b],(y-a)/(b-a))}return T[hi]};
/* share of an age group that ends up in a university, rough from 高等教育淨在學率 (57% in 2005, 71% in 2015) and earlier 大學聯考 intakes */
const uniShare=y=>y<1980?.1:y<1990?.14:y<1995?.2:y<2000?.3:y<2005?.5:y<2010?.62:.7;
const MATE_TITLE={'農':['種田'],'工廠':['在工廠上班','在電子廠做作業員','在紡織廠上班'],'營造':['做水電','在工地做模板'],
  '服務':['在餐廳上班','做業務','當美髮師','在百貨公司當櫃姐','開計程車'],'公教':['當老師','當公務員','當警察'],
  '公司':['在公司當會計','在貿易公司上班','在保險公司上班'],'科技':['當工程師'],'醫護':['當護理師','在醫院上班'],
  '自營':['開小吃店','開早餐店','開五金行','開機車行'],'台幹':['當台幹']};
function mateTitle(m,y){let a=MATE_TITLE[m.job]||['上班'];
  if(m.job==='公教'&&m.edu!=='大學')a=['當公務員','當警察','在郵局上班'];
  a=a.filter(t=>!(m.sex==='M'&&/櫃姐|護理師|美髮師/.test(t))&&!(m.sex==='F'&&/警察|開計程車|模板|水電|機車行/.test(t))&&!(y<1985&&/電子廠/.test(t))&&!(y>=2000&&/紡織廠/.test(t)));
  return a.length?pick(a):'上班'}
function mateMk(s,home){let m,tries=0;const taken=[s.given].concat((s.mates||[]).map(x=>x.given),(s.people||[]).map(p=>p.given));
  do{m=newLife(s.by,{county:home})}while(taken.includes(m.given)&&++tries<5);
  return {sur:m.sur,given:m.given,tribal:m.tribal,sex:m.sex,eth:m.eth,by:s.by,home,pjob:m.pjob,inc:m.inc,fam:m.fam,
    money:m.money,study:m.study,ax:{risk:m.ax.risk,self:m.ax.self},health:m.health,
    edu:'國小',job:null,title:null,place:home,uniCity:null,retry:false,married:false,marAge:null,kids:0,kidsWant:0,divorced:false,
    house:false,houseAge:null,housePlace:null,alive:true,dyAge:null,dyY:null,away:null,
    log:[]}}
function mateLog(m,y,a,k,t){m.log.push({y,age:a,k,t})}
function mateCity(m){/* where they go to university: mostly a big city, nearer home more often */
  const rg=regionOf(m.home),near={'北':'台北','中':'台中','南':pick(['台南','高雄']),'東':pick(['花蓮','台北']),'離島':pick(['台北','高雄'])}[rg]||'台北';
  return chance(.5)?near:pickW([['台北',5],['台中',2],['台南',2],['高雄',1.5],['新竹',1],['花蓮',.5],['嘉義',.5]],x=>x[1])[0]}
function mateWork(m,y,a){const p={by:m.by,sex:m.sex};let job=pJob(p,y);
  if(m.edu==='國中'&&['公教','醫護','科技','公司'].includes(job))job=pick(['工廠','服務','營造']);
  if(m.edu==='大學'&&['工廠','營造'].includes(job)&&chance(.7))job=pick(['公司','科技','公教']);
  if(m.pjob==='農'&&['國中','高職'].includes(m.edu)&&y<1995&&chance(.25))job='農';
  if(m.pjob==='小生意'&&chance(.15))job='自營';
  if(job==='自營'&&a<25)job='服務';
  if(job==='科技'&&!['大學','五專'].includes(m.edu))job='工廠';
  m.job=job;
  /* where the job is: home, or the city the work pulls them to */
  const urbanHome=['台北市','台北縣','台中市','高雄市','台南市','新竹市','基隆市','嘉義市'].includes(m.home);
  if(job==='農')m.place=m.home;
  else if(job==='科技'&&y>=1985)m.place=y>=2004&&chance(.35)?pick(['台南縣','台中縣']):'新竹市';
  else if(chance(urbanHome?.8:m.edu==='大學'?.35:y<1995?.5:.6))m.place=m.home;
  else m.place=pickW([['台北市',4],['台北縣',4],['桃園縣',2],['台中市',2],['高雄市',2]],x=>x[1])[0];
  m.title=mateTitle(m,y);m.firstJob={job,title:m.title,place:m.place,age:a};
  mateLog(m,y,a,'job',`開始${m.title}`)}
const MATE_JT=k=>JOB_T[k]||40;
function matesYearly(s){const y=s.y;
  for(const m of s.mates){if(!m.alive)continue;const a=y-m.by;
    if(chance(annualQ({age:a,y,sex:m.sex,health:m.health,hbv:true}))){m.alive=false;m.dyAge=a;m.dyY=y;mateLog(m,y,a,'die','過世');continue}
    if(a>60)m.health-=1.2;else if(a>40)m.health-=.4;
    if(a===15){const p=clamp(atYear(JH_CONT,y)/100+(m.study-50)/120+(m.money-50)/200,.05,.99);
      if(chance(p)){m.edu=m.study+(R()-.5)*30>60?'高中':chance(y>=1970&&y<2000?.2:.05)?'五專':'高職';mateLog(m,y,a,'school',m.edu)}
      else{m.edu='國中';mateWork(m,y,a)}}
    else if(a===18&&(m.edu==='高中'||m.edu==='高職')||a===19&&m.retry==='try'){
      const p=clamp(uniShare(y)*(m.edu==='高中'?1.9:.5)+(m.study-50)/90+(m.money-50)/250,.02,.97);
      if(chance(p)){if(m.retry==='try')m.retry=true;m.edu='大學';m.uniCity=mateCity(m);mateLog(m,y,a,'uni',`考上${m.uniCity}的大學`)}
      else if(m.retry!=='try'&&m.edu==='高中'&&y<2005&&chance(.3)){m.retry='try';mateLog(m,y,a,'retry','重考')}
      else{if(m.retry==='try')m.retry=false;m.noUni=m.edu==='高中';mateWork(m,y,a)}}
    else if(a===20&&m.edu==='五專')mateWork(m,y,a);
    else if(!m.job&&m.edu==='大學'&&a>=(m.sex==='M'&&y<2010?24:22))mateWork(m,y,a);
    if(m.job){
      m.money+=(MATE_JT(m.job)+(m.edu==='大學'?6:0)-m.money)*.1;
      if(m.job!=='退休'&&a>=(m.job==='公教'?58:63)){m.job='退休';mateLog(m,y,a,'retire','退休')}
      else if(m.job==='自營'&&chance(.03+.1*hardY(y))){m.job='服務';m.title=mateTitle(m,y);m.bust=a;mateLog(m,y,a,'bust','店收起來了')}
      else if(['工廠','公司','營造','服務'].includes(m.job)&&a<60&&chance(.004+.04*hardY(y))){m.laidOff=a;mateLog(m,y,a,'laid','被裁員');m.job=pick(['服務','工廠']);m.title=mateTitle(m,y)}
      else if(!m.away&&['工廠','公司'].includes(m.job)&&y>=1992&&y<=2012&&a>=25&&a<50&&chance(.02)){m.away=pick(['東莞','昆山','上海','蘇州']);m.awayY=y;m.job='台幹';m.title=mateTitle(m,y);mateLog(m,y,a,'china',`去${m.away}`)}
      else if(m.away&&chance(.08)){mateLog(m,y,a,'back',`從${m.away}回來`);m.away=null;m.job=pick(['公司','自營']);m.title=mateTitle(m,y)}
      else if(!m.away&&!m.moved&&m.edu==='大學'&&y>=1975&&y<=2015&&a>=24&&a<35&&chance(.008)){m.moved=pick(['美國','美國','加拿大','日本','新加坡','澳洲']);mateLog(m,y,a,'abroad',`搬去${m.moved}`)}
    }
    /* marriage: around the average first-marriage age of their year and sex, some never */
    if(m.marTarget===undefined){const mm=offAt('mar',m.by+27);const avg=mm?mm.v[m.sex]:m.sex==='M'?28:25;
      m.marTarget=chance(m.by<1970?.07:m.by<1980?.13:m.by<1990?.22:.3)?null:Math.max(19,Math.round(avg+(R()+R()-1)*5))}
    if(!m.married&&!m.divorced&&m.marTarget!==null&&a>=m.marTarget&&(m.job||m.edu==='國中'||a>=24)){m.married=true;m.marAge=a;
      const t=offAt('tfr',y);m.kidsWant=Math.max(0,Math.round((t?t.v:1.5)*1.15+(R()-.5)*2));mateLog(m,y,a,'marry','結婚')}
    if(m.married&&m.kids<m.kidsWant&&a<44&&chance(.35)){m.kids++;mateLog(m,y,a,'kid','生了孩子')}
    if(m.married&&a>=Math.max(28,m.marAge+2)&&a<=60&&chance(y<1990?.002:y<2005?.008:.01)){m.married=false;m.divorced=true;m.divAge=a;mateLog(m,y,a,'divorce','離婚')}
    /* buying a home: harder in the years and places where prices ran ahead of pay */
    if(!m.house&&!m.moved&&a>=26&&m.job&&m.job!=='退休'){const pl=m.away?m.home:m.place;
      const p=clamp(.09*(m.money/45)*(m.married?1.7:.6)/houseBurden({y,place:pl})+(m.inc==='高'?.03:0),.004,.3);
      if(chance(p)){m.house=true;m.houseAge=a;m.housePlace=pl;mateLog(m,y,a,'house',`在${pl}買房`)}}
  }}
{const y0=yearly;yearly=function(s){y0(s);if(s.dead)return;
  if(!s.mates&&s.age>=7&&s.age<=8){const home=CMAP[s.place]?s.place:s.birthCounty;s.mates=[];for(let i=0;i<MATE_N;i++)s.mates.push(mateMk(s,home))}
  if(s.mates)matesYearly(s)}}
/* people met later never share a given name with a classmate, so the diary never mixes them up */
{const r0=rollGiven;rollGiven=function(s,...a){let g,i=0;do g=r0(s,...a);while(s&&s.mates&&s.mates.some(m=>m.given===g)&&++i<6);return g}}
