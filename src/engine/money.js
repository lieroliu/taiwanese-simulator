/* ================= money: savings and family wealth (萬元, nominal) ================= */
const wageM=y=>y<1973?WAGE[1973]*Math.pow(1.11,y-1973):y>2025?WAGE[2025]*Math.pow(1.02,y-2025):WAGE[y];
const wageY=y=>wageM(y)*12/1e4;
const JM={'農':.55,'工廠':.85,'營造':.95,'服務':.72,'公教':1.05,'公司':1.1,'科技':1.7,'自營':1,'台幹':1.6,'醫護':1.35,'家管':0,'退休':.3,'失業':0};
const EDM={'大學':1.25,'五專':1.08,'高中':1,'高職':1,'國中':.9,'國小':.8};
const HPR_PTS=[[1960,4],[1980,4.5],[1987,4.5],[1990,7],[1995,6.2],[2002,5.2],[2008,6.5],[2012,8.5],[2016,9.3],[2020,9.2],[2024,10.6],[2040,11.5]];
function hpr(y){for(let i=1;i<HPR_PTS.length;i++){const [a,va]=HPR_PTS[i-1],[b,vb]=HPR_PTS[i];if(y<=b)return va+(vb-va)*Math.max(0,(y-a))/(b-a)}return 11.5}
let regM=s=>1+((REG_PAY[regionOf(s.place)]||0)+(inTaipei(s)&&s.y>=1990?3:0))/40;
function myIncome(s){if(!s.job||s.studying)return 0;let m=JM[s.job]??.7;if(s.job==='退休'&&s.f.wasGJ)m=.65;if(s.job==='自營')m*=.6+R();
  return wageY(s.y)*m*(EDM[s.edu]||.9)*(s.sex==='F'?(s.y<1990?.75:.85):1.08)*regM(s)}
function spIncome(s){const sp=spouse(s);return spWork(s)?wageY(s.y)*(JM[sp.job]??.7)*.95*regM(s):0}
const housePrice=s=>hpr(s.y)*(HPR_C[s.place]||1)*wageY(s.y)*1.55;
/* rent follows local house prices: a whole flat rents for about 1.7% of its price a year (估算); 套房、雅房 are a share of that */
const RENT_T={'雅房':.33,'套房':.55,'整層':1};
const rentY=s=>housePrice(s)*.017*RENT_T[s.rentTier||(s.married?'整層':'套房')];
/* yearly interest on money owed to the bank and others (s.debt); engine/debt.js sets it by how the money was borrowed */
let debtRate=s=>s.age>=65?0:(s.y>=2005?.06:.05);
/* everything owed except the student loan and the mortgage */
const owed=s=>(s.debt||0)+(s.kinDebt||0);
const atHome=s=>!s.married&&s.age<28&&s.place===s.birthCounty&&!s.f.parentdie;
const w0=s=>wageY(s.y);
const fmtW=v=>{const a=Math.abs(v);const t=a<1?'不到 1':a<10?a.toFixed(1).replace(/\.0$/,''):String(Math.round(a));return t};
function famInit(s){const k={'低':.3,'中':1.6,'高':5}[s.inc]*({'公教':1.2,'小生意':1.3,'農':.8,'工':.8,'白領':1.2}[s.pjob]||1);s.famW=w0(s)*k*(1+(R()-.5)*.4);s.cash=0;s.loan=0;s.famHouse=s.inc!=='低'||chance(.3)}
function famLabel(s){const r=s.famW/w0(s);return r<0?'欠債':r<.5?'拮据':r<2?'小康':r<5?'寬裕':'富裕'}
/* fx money deltas move real money */
const _fx=fx;fx=function(s,o){if(o&&o.money&&s.cash!==undefined&&!s._noCash){const d=o.money*w0(s)*.04;if(s.age<20&&!working(s))s.famW+=d*1.5;else s.cash+=d}return _fx(s,o)};
function moneyYear(s){if(s.cash===undefined)famInit(s);const W=w0(s);
  /* parents' household */
  if(s.age<30)s.famW+=W*{'低':.04,'中':.22,'高':.6}[s.inc];else if(!s.f.parentdie)s.famW-=W*.12;
  if(s.f.parentill&&!s.f.parentdie)s.famW-=W*.2;
  /* school costs paid by family, or by loan */
  if(s.studying==='大學'){const c=W*(s.tech?.2:.15)+(s.place!==s.birthCounty?W*.25:0);if(s.famW>c*1.5)s.famW-=c;else{s.loan+=c;s.f.hadLoan=1}}
  else if(s.studying)s.famW-=W*.04;
  /* my household */
  let inc=myIncome(s)+spIncome(s);let ex=0;
  if(s.age>=65){if(['家管','失業',null,undefined].includes(s.job)||s.job==='農')inc+=W*(s.y>=2008?.12:.06);if(s.kids&&s.cash<W*2)inc+=W*.12*Math.min(2,s.kids)}
  if(s.age>=18||working(s)){const kids=s.kidBorn.filter(b=>s.t-b<22*12).length;
    if(atHome(s))ex=W*.2+inc*.3;else{const rent=s.house==='own'||s.house==='family'?0:rentY(s);
      /* a big rent squeezes everything else */
      ex=(W*(s.married?.3:.25)+Math.max(0,inc-(s.t<s.mortgageEnd?s.mortY||0:0))*(s.married?.52:.5))*(1-Math.min(.35,inc>0?rent/inc*.6:.35))+rent+kids*W*.08}
    if(s.debt>0)ex*=.85;
    /* someone with a job lives within the paycheck; debt comes from shocks, not from everyday spending */
    if(working(s)&&s.age<65)ex=Math.min(ex,Math.max(W*(s.married?.3:.2),inc-(s.t<s.mortgageEnd?s.mortY||0:0)+W*.02));
    if(s.age>=70)ex+=W*.08;
    if(s.age>=65)ex=Math.max(W*.15,Math.min(ex,inc+Math.max(0,s.cash)*.08));
    else if(owed(s)>W*2)ex*=.8;if(s.t<s.mortgageEnd)ex+=s.mortY||0;
    if(s.f.sendHome&&!s.f.parentdie){const sh=Math.min(W*s.f.sendHome,inc*.1);ex+=sh;s.famW+=sh}
    if(atHome(s)&&working(s)){ex+=W*.15;s.famW+=W*.15}}
  if(!working(s)&&!s.married&&s.age<30&&!s.f.parentdie&&s.famW>-W){s.famW-=ex*.7;ex=0}
  /* the year's budget is paid out month by month (engine/cashflow.js): pay in, rent, mortgage, living costs, student loan */
  s._mFlow=s.age>=18||working(s)?(inc-ex)/12:0;s._loanM=s.loan>0&&working(s)?Math.min(s.loan,W*.08)/12:0;
  const r=s.y<1990?.07:s.y<2000?.05:s.y<2010?.02:.01;if(s.cash>0)s.cash*=1+r;s.famW*=s.famW>0?1+r*.8:1.08;
  /* the money index the story reads */
  const rr=(working(s)||s.age>=23)?(s.cash-owed(s))/W:s.famW/W/2;const idx=clamp(35+18*Math.log2(Math.max(.15,1+2*rr)),3,97);
  s.money+=(idx-s.money)*.35;
  moneyNotes(s,W)}
function moneyNotes(s,W){
  if(s.age>=22&&!s.f.sendHome&&!s.f.parentdie&&s.famW<W*.3&&working(s)&&s.age<60&&chance(.6)){s.f.sendHome=s.ax.self<50?.12:.06;
    s.q.push({pri:1,cat:'家庭',tone:'neutral',text:`爸媽的積蓄快用完了。從這個月起，我每個月寄 ${(()=>{const m=W*s.f.sendHome/12;return m>=1?fmtW(m)+' 萬':Math.round(m*10)*1000+' 塊'})()}回家。`})}
  if(s.f.hadLoan&&!s.studying&&!s.f.loanNote&&s.loan>0){s.f.loanNote=1;s.q.push({pri:1,cat:'人生',tone:'neutral',text:`畢業了。我背著 ${fmtW(s.loan)} 萬的就學貸款，第一份薪水要先拿去還。`})}
  if(s.f.hadLoan&&s.loan<=0&&!s.f.loanDone&&s.f.loanNote){s.f.loanDone=1;s.q.push({cat:'人生',tone:'good',text:'就學貸款終於繳完了。我把最後一張繳款單收進抽屜。'})}
  if(owed(s)>W*.5&&!s.f.debtNote&&s.age>=18)s.f.debtNote=s.t;
  if(s.f.debtNote&&!s.f.debtFree&&owed(s)<=.01){s.f.debtFree=1;s.q.push({cat:'人生',tone:'good',text:'欠的錢終於還清了。那天晚上，我睡得特別好。'})}
  if(!s.f.cash100&&s.cash>=100&&s.age<70){s.f.cash100=1;s.q.push({cat:'人生',tone:'good',text:`存款第一次超過一百萬。我${s.y>=1985?'在 ATM 前面':'翻開存摺'}看著那個數字，看了好久。`})}}
const _yearly=yearly;yearly=function(s){_yearly(s);moneyYear(s);clampAll(s);if(working(s))s.lastWork=s.job};
const famHouseVal=s=>hpr(s.y)*(HPR_C[s.birthCounty]||1)*wageY(s.y)*1.55*.8;
{const y1=yearly;yearly=function(s){const yp=s.y-1;y1(s);
  if(s.mortLeft>0){const r=s.mortR||.05;if(s.mortIOEnd&&s.t>=s.mortIOEnd){const left=Math.max(12,s.mortgageEnd-s.t);s.mortY=s.mortLeft*(r/12)/(1-Math.pow(1+r/12,-left))*12;s.mortIOEnd=0}
    const it=s.mortLeft*r,pr=Math.max(0,(s.mortY||0)-it);s.mortLeft=s.t>=s.mortgageEnd?0:Math.max(0,s.mortLeft-pr)}
  if(s.kinDebt>0&&s.age>=18){const pay=Math.min(s.kinDebt,Math.max(0,s.cash),Math.max(w0(s)*.04,(myIncome(s)+spIncome(s))*.08));s.kinDebt-=pay;s.cash-=pay;if(s.kinDebt<=.01&&!s.f.kinDebtDone){s.kinDebt=0;s.f.kinDebtDone=1;s.q.push({cat:'人生',tone:'good',text:'買房時跟親戚借的錢，今年終於還完了。過年回去，我買了一盒最好的茶葉送過去。'})}}
  if(s.house==='own'&&s.houseVal>0){const g=hpr(s.y)*wageY(s.y)/(hpr(yp)*wageY(yp));if(isFinite(g)&&g>0)s.houseVal*=g}}}
const netWorth=s=>(s.cash||0)+(s.house==='own'?(s.houseVal||0):0)-(s.mortLeft||0)-owed(s);
/* decisions that cost money */
(()=>{const M=id=>MS.find(x=>x.id===id),P=id=>PE.find(x=>x.id===id)||RE.find(x=>x.id===id);
 /* house */
 /* house: era down payment, amortized mortgage at era rates, bank income check (rates 依央行利率估算) */
 const mRate=y=>y<1986?.11:y<1991?.09:y<1996?.095:y<2001?.075:y<2003?.05:y<2009?.028:y<2023?.019:.022;
 const pmtM=(L,r,n)=>L*(r/12)/(1-Math.pow(1+r/12,-n));
 const pvM=(p,r,n)=>p*(1-Math.pow(1+r/12,-n))/(r/12);
 const hhInc=s=>myIncome(s)+spIncome(s);
 const KIN_LEND=['舅舅','阿姨','伯父','姑姑','叔叔'];
 function housePlan(s,opt){const P=housePrice(s),dr=s.y<1990?.3:.2,r=mRate(s.y),n=opt==='40'?480:opt==='30'?360:240,io=opt==='40'?60:0;
   let L=P*(1-dr);const mInc=hhInc(s)/12,cap=mInc*(s.y<2000?.33:.5);
   const pay=L2=>io?L2*r/12:pmtM(L2,r,n);let capped=false;
   if(pay(L)>cap){capped=true;L=io?cap/(r/12):pvM(cap,r,n)}
   const D=P-L,cash=Math.max(0,s.cash),fam=Math.max(0,Math.min(s.famW*.4,D*.6)),kinCap=Math.max(0,hhInc(s));
   const fromCash=Math.min(cash,D),fromFam=Math.min(fam,D-fromCash),fromKin=Math.min(kinCap,D-fromCash-fromFam);
   const ok=fromCash+fromFam+fromKin>=D-1e-6;
   return {P,D,L,r,n,io,mPay:pay(L),mInc,capped,fromCash,fromFam,fromKin,ok,dr}}
 window.housePlan=housePlan;window.mRate=mRate;
 const hs=M('house');hs.run=s=>{if(s.f.houseAgain)s.f.houseAsk2=1;else s.f.houseAgain=40;if(s.cash===undefined)famInit(s);
   const P=housePrice(s),D=P*(s.y<1990?.3:.2),inc=hhInc(s),yrs=inc>0?P/inc:99,help=Math.max(0,Math.min(s.famW*.4,D*.6)),we=s.married?'們':'';
   s._hp={price:P,down:D,help};
   const ch=[{label:'買',go:s=>houseBuy(s,'20')}];
   if(s.y>=2000)ch.push({label:'買（貸三十年）',go:s=>houseBuy(s,'30')});
   if(s.y>=2023&&s.age<40)ch.push({label:'買（新青安四十年）',go:s=>houseBuy(s,'40')});
   ch.push({label:'繼續租',go:s=>{s.house=s.f.houseAsk2?'rent':null;fx(s,{risk:2});return yrs>=12?'我算了算，這輩子大概買不起。我決定繼續租，把錢花在現在的生活上。':'我決定再租一陣子。'}});
   if(s.place===s.birthCounty)ch.push({label:'住家裡',go:s=>{s.house='family';fx(s,{self:-4});return '我跟家人住在老家，省下房租，也多了很多摩擦。'}});
   return {cat:'人生',title:'買房',text:`這附近一間房子大約 ${fmtW(P)} 萬，是我${we}家 ${yrs<99?Math.round(yrs):'好幾十'} 年的收入。頭期款要 ${fmtW(D)} 萬，我${we}的存款${s.cash>=1?'有 '+fmtW(s.cash)+' 萬':'幾乎是零'}${help>=1?`，爸媽說可以幫忙出 ${fmtW(help)} 萬`:''}。要買房嗎？`,choices:ch}};
 function houseBuy(s,opt){const h=housePlan(s,opt);s._plan=h;
   if(!h.ok)return houseFail(s);
   s.house='own';s.cash-=h.fromCash;s.famW-=h.fromFam;if(h.fromKin>0)s.kinDebt=(s.kinDebt||0)+h.fromKin;
   s.mortLeft=h.L;s.mortR=h.r;s.mortN=h.n;s.mortIOEnd=h.io?s.t+h.io:0;s.mortY=h.mPay*12;s.mortgageEnd=s.t+h.n;s.houseVal=h.P;s.houseY=s.y;
   fx(s,{risk:-3});key(s,'買了房子');const heavy=h.mPay>=h.mInc*.45;
   let t=heavy?`我${opt==='20'?'':opt==='30'?'背了三十年的房貸，':'用新青安貸了四十年，'}買了一間不大的房子。從此每個月的薪水，一半是銀行的。`:`我${s.married?'們':''}買了房子。拿到鑰匙那天，我在空蕩蕩的客廳裡坐了很久。`;
   if(h.fromFam>=1)t+=`頭期款有 ${fmtW(h.fromFam)} 萬是爸媽出的。`;
   if(h.fromKin>=1)t+=`不夠的 ${fmtW(h.fromKin)} 萬，是跟${pick(KIN_LEND)}借的，說好每年慢慢還。`;
   if(h.capped)t+='銀行算了我的薪水，只肯貸這麼多，剩下的都得自己湊。';
   const m=h.mPay;t+=`每個月要繳 ${m>=1?m.toFixed(1).replace(/\.0$/,''):m.toFixed(2)} 萬的房貸${h.io?'，前五年只繳利息':''}。`;return t}
 houseFail=function(s){s.house=null;const h=s._plan;const why=h&&h.capped&&h.fromCash+h.fromFam+h.fromKin<h.D?'銀行算了我的薪水，說貸不到這麼多，剩下的頭期款我湊不出來':s.y>=1987&&s.y<=1990?'房價一個月漲一次，我存錢的速度根本追不上':'頭期款差太多，連跟親戚借都湊不齊';return `可是${why}。看了半年的房子，最後還是繼續租。`};
 for(const lb of ['買','買（貸三十年）','買（新青安四十年）']){const o=lb==='買'?'20':lb==='買（貸三十年）'?'30':'40';
   ASP.house[lb]={p:s=>housePlan(s,o).ok?.97:0,fail:houseFail};
}
 /* wedding */
 const mr=M('marry'),mrun=mr.run;mr.run=s=>{const e=mrun(s);const g=e.choices[0].go;e.choices[0].go=s=>{s._noCash=1;let t;try{t=g(s)}finally{s._noCash=0}if(s.cash===undefined)famInit(s);
   if(s._regOnly)return t.replace(/[^。]*(婚禮|喜酒|婚紗)[^。]*。/g,'');
   const W=w0(s),cost=W*(s.y<1995?.9:.6),back=cost*.55,net=cost-back;let add;
   if(s.cash>=net*2){s.cash-=net;add=`婚禮花了 ${fmtW(cost)} 萬，收回來的紅包有 ${fmtW(back)} 萬。`}
   else if(s.cash>=net){s.cash-=net;add=`婚禮花了 ${fmtW(cost)} 萬，扣掉紅包，存款只剩 ${fmtW(s.cash)} 萬。`}
   else if(s.famW>net){s.famW-=net-Math.max(0,s.cash);s.cash=Math.min(s.cash,0);add=`婚禮花了 ${fmtW(cost)} 萬。我們存的錢不夠，剩下的是爸媽出的。`}
   else{const k=net-Math.max(0,s.cash);s.cash=Math.max(0,s.cash-net);s.kinDebt=(s.kinDebt||0)+k;add=`婚禮花了 ${fmtW(cost)} 萬。錢不夠，我們跟親戚借了 ${fmtW(k)} 萬，說好慢慢還。`}
   return t+add};return e};
 /* illness */
 const sk=P('sick'),sr=sk.run;sk.run=s=>{const e=sr(s);if(s.cash===undefined)return e;const c=w0(s)*(s.y<1995?.4:.05);if(s.age<18)s.famW-=c;else s.cash-=c;return e};
 /* inheritance */
 const pd=M('parentdie'),pr0=pd.run;pd.run=s=>{const e=pr0(s);if(!s.f.parentdie)return e;if(e&&s.famW!==undefined&&s.famHouse&&!s.f.famHouseDone){s.f.famHouseDone=1;const v=famHouseVal(s);if(s.house==='family'){s.house='own';s.houseVal=v;s.houseY=s.y;if(s.houseAge==null)s.houseAge=s.age;e.text+=`老家留給了我，現在值 ${fmtW(v)} 萬。我還是住在那裡，只是屋子裡少了一個人。`}else{const sh=v*(s.by<1975?.3:.5);s.cash+=sh;e.text+=`老家賣掉以後，兄弟姊妹分一分，我分到了 ${fmtW(sh)} 萬。`}}
   if(e&&s.famW!==undefined){const W=w0(s);if(s.famW>W*1.5){const share=s.famW*(s.by<1975?.3:.5);s.cash+=share;e.text+=`爸媽留下的錢，兄弟姊妹分一分，我分到了 ${fmtW(share)} 萬。`}else if(s.famW<0){s.cash+=s.famW*.5;e.text+=`爸媽走的時候還欠了 ${fmtW(-s.famW)} 萬，我們幾個孩子一起分著還。`}s.famW=0}return e};
})();

