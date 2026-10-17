/* ================= money-trouble: what years of owing money do to a life =================
   Paddy 2026-10-17: running out of money for long can end badly: a marriage that breaks over money, 跑路 to get away
   from debt collectors, the street (engine/debt.js), or death through failing health and mood (engine/mood-value.js).
   s.f.troubleY counts the years in a row with debts over 1.5 years of pay. You never commit a crime. */
const inTrouble=s=>owed(s)>w0(s)*1.5||!!s.f.sharkD;
{const y0=yearly;yearly=function(s){y0(s);if(s.cash===undefined||s.age<18)return;s.f.troubleY=inTrouble(s)?(s.f.troubleY||0)+1:0;
  /* back home once the debt collectors have stopped looking */
  if(s.f.fled&&s.t-s.f.fled>=72&&chance(.25)){const was=s.f.fled;s.f.fled=0;s.f.fledBack=s.t;s.place=s.f.fledFrom||s.birthCounty;fx(s,{lonely:-6});
    s.q.push({cat:'家庭',tone:'neutral',text:parAlive(s)?'躲了好幾年，我終於回到家鄉。爸媽老了很多，媽媽看到我，什麼都沒問，只說「回來就好」。':'躲了好幾年，我終於回到家鄉。老家的門口長滿了草，已經沒有人在等我了。'})}}}
/* a marriage under money trouble breaks more easily (on top of the divorce odds set elsewhere) */
{const d=MS.find(x=>x.id==='divorce'),c0=d.check,r0=d.run;
 d.check=s=>{if(c0(s))return true;if(!s.married||!(s.f.troubleY>=2)||s.t<s.marriedT+12)return false;if(chance(.025*Math.min(s.f.troubleY,4)/12)){s._moneyDiv=1;return true}return false};
 d.run=s=>{const e=r0(s);if(s._moneyDiv&&e){s._moneyDiv=0;const sp=spouse(s),n=sp?nm(sp):'對方';e.text=`為了錢，我們幾乎每天都在吵。${n}說，這樣的日子看不到盡頭。要離婚嗎？`}return e}}
PULL['divorce:離婚']=s=>s.f.troubleY>=3?1.8:1;
/* 跑路: when the collectors come to the door and nobody can help */
MS.push({id:'flee',choice:1,check:s=>!s.f.fled&&!s.f.fledBack&&!s.f.homeless&&s.age>=22&&s.age<62&&(s.f.sharkD||owed(s)>w0(s)*3)&&s.f.troubleY>=2&&!abroad(s)&&chance(.12/12),
 run:s=>({cat:'人生',title:'跑路',text:s.f.sharkD?'討債的人又來了，在門口的鐵門上噴了紅漆。鄰居都在看。我要怎麼辦？':'催收的電話一天打十幾通，連公司都打來了。我要怎麼辦？',choices:[
  {label:'跑路',go:s=>{s.f.fled=s.t;s.f.fledFrom=s.place;const far=Object.keys(HPR_C).filter(c=>c!==s.place&&c!==s.birthCounty&&regionOf(c)!==regionOf(s.place)&&regionOf(c)!=='離島');
    s.place=pick(far.length?far:['台東縣']);s.house=s.house==='own'?'own':null;s.rentTier=null;s.job='服務';s.jobStart=s.t;s.f.sharkD=0;fx(s,{lonely:15,risk:6,health:-3});famLikeAdd(s,-25);key(s,'跑路');
    regret(s,'flee','為了躲債，離開家鄉好幾年。','討債的人找上門',2.5);
    return `我收了一個背包，連夜搭車去了${s.place}。我換了手機號碼，在一間小吃店洗碗，老闆不問我從哪裡來。我不敢打電話回家。`}},
  {label:'留下來面對',go:s=>{fx(s,{self:4,lonely:5});if(s.y>=2006&&!s.f.nego&&!s.f.sharkD){s.f.nego=s.t;return '我沒有跑。我去銀行申請債務協商，利息降下來，分八年慢慢還。'}return '我沒有跑。我把每一張帳單攤在桌上，一筆一筆算，能還多少就先還多少。'}}]})});
LEAN['跑路']={risk:1.2,self:-.5};LEAN['留下來面對']={risk:-.6,self:.6};PULL['flee:跑路']=s=>s.f.sharkD?1.4:.7;
VERB['跑路']='跑路躲債';
/* while away the collectors lose track: the debt stops growing, and no bank will lend */
{const d0=debtRate;debtRate=s=>s.f.fled?0:d0(s)}
/* money trouble weighs on mood; the street wears down the body */
{const mt=moodTarget;moodTarget=function(s){let t=mt(s);if(s.cash!==undefined&&s.age>=18){const o=owed(s)/w0(s);t-=s.f.sharkD?8:o>3?6:o>1.5?3:0;if(s.f.troubleY>=3)t-=3;if(s.f.fled)t-=4}return clamp(t,5,95)}}
{const q0=annualQ;annualQ=function(s){const q=q0(s);return s.f&&s.f.homeless?Math.min(q*2.5+.004,.6):q}}
