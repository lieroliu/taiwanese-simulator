/* ================= character creation ================= */
/* the family you are born into, from official rates of your birth year (data/stats/family.json, FAMD):
   單親: half of 非婚生 births (the rest are legitimised when the parents marry, 估算) plus the mother's age-band divorce rate
   over the first three years (×.6 for couples with a newborn, 估算; later divorces happen as childhood events);
   隔代教養: twice the 祖孫 household share (households vs children, 估算), 2001's figure held for earlier years;
   家人久病: two parents × the 18–64 disability share scaled to that year × the 61.5% of moderate or worse cases. */
function famOdds(by){const yy=(o,y,lo,hi)=>{y=clamp(y,lo,hi);while(o[y]===undefined&&y<hi)y++;return o[y]};
  const ma=Math.round((yy(FAMD.ma,by,1975,2025)||23)+1.5),band=ma<25?'20-24':ma<30?'25-29':ma<35?'30-34':'35-39';
  const d=yy(FAMD.div,by,1975,2025),r=d[band]||d.total;
  const single=yy(FAMD.nm,by,1976,2025)/100*.5+r/1000*3*.6;
  const grand=2*yy(FAMD.gp,by,2001,2025)/100;
  const dy=by<=2002?FAMD.dis[2002]:by<=2011?lerp(FAMD.dis[2002],FAMD.dis[2011],(by-2002)/9):FAMD.dis[2012];
  const ill=2*FAMD.dis18*dy/FAMD.dis[2012]/100*.615;
  return {single,grand,ill,unwed:yy(FAMD.nm,by,1976,2025)/100*.5/single}}
function newLife(by,F){F=F||{};
  const bm=1+Math.floor(R()*12), t0=by*12+bm-1, tt=clamp((by-1961)/49);
  const c=F.county&&CMAP[F.county]?CMAP[F.county]:pickW(COUNTIES,c=>lerp(c[2],c[3],tt));
  const urban=R()<c[4];
  const nv=newImmShare(by)*(urban?.8:1.3), ind=c[6]/100*(urban?.6:1.3), hk=c[5]/100, wh=c[7]/100*(1-.4*tt);
  const eth=F.eth||pickW([['新住民子女',nv],['原住民',ind],['客家',hk],['外省',wh],['閩南',Math.max(.05,1-nv-ind-hk-wh)]],x=>x[1])[0];
  const sex=F.sex||(R()<(by<1985?.515:.522)?'M':'F');
  let farm=urban?.08*(1-tt)+.01:.6*(1-tt)+.06, gj=.07+(eth==='外省'?.25:0), white=.03+.3*tt+(urban?.1:0), biz=.18, fac=.3;
  if(eth==='原住民'){farm*=1.2;white*=.4;gj*=.5;fac*=1.3}
  if(eth==='新住民子女'){farm*=1.4;white*=.5;fac*=1.4}
  {const w=typeof PJW!=='undefined'&&PJW[c[0]];if(w){farm*=w[0];fac*=w[1];biz*=w[2];gj*=w[3]}}
  const pjob=F.pjob||pickW([['農',farm],['工',fac],['小生意',biz],['公教',gj],['白領',white]],x=>x[1])[0];
  const incW={'農':[60,35,5],'工':[40,50,10],'小生意':[25,50,25],'公教':[10,70,20],'白領':[15,55,30]}[pjob];
  const inc=F.inc||pickW([['低',incW[0]*(urban?.8:1.2)],['中',incW[1]],['高',incW[2]*(urban?1.3:.8)]],x=>x[1])[0];
  const fo=famOdds(by),grand=fo.grand*(urban?.6:1.4)+(by>=1970&&by<=1995?.02:0)+(eth==='原住民'?.04:0);
  const fam=pickW([['無',1-fo.single-grand-fo.ill],['單親',fo.single],['隔代教養',grand],['家人久病',fo.ill],['受難者家屬',by<=1975?.015:by<=1985?.006:0]],x=>x[1])[0];
  const juancun=eth==='外省'&&pjob==='公教'&&by<1990&&R()<.6;
  const tribe=eth==='原住民'?pickW(TRIBES[c[0]]||[['阿美',3],['泰雅',1],['排灣',1]],x=>x[1])[0]:null;
  const momFrom=eth==='新住民子女'?pickW([['中國大陸',45],['越南',35],['印尼',10],['泰國',5],['菲律賓',5]],x=>x[1])[0]:null;
  const b=()=>50+(R()-.5)*34;
  const ax={risk:b(),rebel:b(),self:b(),open:b(),pride:hasPride({eth})?lerp(30,55,tt)+(R()-.5)*20:null};
  if(pjob==='農'){ax.risk-=5;ax.self-=8;ax.open-=8}
  if(pjob==='小生意')ax.risk+=8;
  if(pjob==='公教'){ax.rebel-=5;ax.open-=4}
  if(fam==='單親')ax.self+=5;
  ax.open+=14*tt;ax.self+=10*tt;
  const money={'低':25,'中':50,'高':75}[inc]+(R()-.5)*10;
  let study=35+R()*35+(inc==='高'?10:inc==='低'?-8:0)+(pjob==='公教'?8:pjob==='白領'?5:0)+(fam==='隔代教養'?-5:0);
  const s={by,bm,t0,t:t0,y:by,m:bm,age:0,birthCounty:c[0],place:c[0],urban,eth,tribe,momFrom,sex,pjob,inc,fam,juancun,
    ax,eng:8+R()*8,idOff:(R()-.5)*70,id:idNorm(by)+ETH_OFF[eth]+(momFrom==='中國大陸'?-10:0),money,baseMoney:money,health:82+R()*8,lonely:28+(fam==='隔代教養'?10:0),study,
    edu:'',studying:null,studyEnd:0,job:null,married:false,marriedT:0,kids:0,kidBorn:[],house:null,mortgageEnd:0,
    hbv:t0>=1986*12+6,f:{},key:[],hist:[],dead:false,cause:null,inServiceUntil:0,needJob:false,needService:false,pend:null,events:{}};
  if(fam==='單親'&&R()<fo.unwed)s.f.unwed=1;
  s.people=[];s.q=[];nameSelf(s);
  clampAll(s);
  // place ranged timeline events
  for(const e of TL){ if(e.r){ const y=e.r[0]+Math.floor(R()*(e.r[1]-e.r[0]+1)); s.events[e.id]=y*12+Math.floor(R()*12) } else s.events[e.id]=e.y*12+e.m-1 }
  sample(s);
  return s;
}
function clampAll(s){for(const k in s.ax){if(s.ax[k]!==null)s.ax[k]=clamp(s.ax[k],3,97)}s.eng=clamp(s.eng,0,100);s.id=clamp(s.id,-100,100);s.money=clamp(s.money,0,100);s.health=clamp(s.health,0,100);s.lonely=clamp(s.lonely,0,100);s.study=clamp(s.study,0,100)}
function fx(s,o){for(const k in o){if(k in s.ax){if(s.ax[k]!==null)s.ax[k]+=o[k]}else s[k]+=o[k]}clampAll(s)}
function key(s,text){s.key.push({age:s.age,y:s.y,text})}
function sample(s){s.hist.push({age:s.age,risk:s.ax.risk,rebel:s.ax.rebel,self:s.ax.self,open:s.ax.open,pride:s.ax.pride,eng:s.eng,id:s.id})}

