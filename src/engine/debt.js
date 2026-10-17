/* ================= debt: money is settled every month, and savings never go below zero =================
   money.js sets the year's budget; here it is paid out month by month (pay in, rent, mortgage, living costs, student loan).
   When a month can't be paid, the gap is raised right away, in this order: the family (if they can spare it), relatives,
   the bank (信用卡、信貸, from 1990), and only with no one left, 地下錢莊. Before banks lent to people, or once nobody
   will lend, the bill just goes unpaid (欠房租、賒帳). What is borrowed is owed: s.kinDebt to relatives, s.debt to the
   bank, the 地下錢莊 or the landlord, paid back from savings each month.
   From 2006 banks offer 債務協商, from 2008 the 消債條例 lets a court clear the debt (no new loans for seven years).
   Rarely, with no family and no work, you lose your home. You only ever borrow or get chased for money; you never commit a crime. */
const KIN_ASK=['舅舅','阿姨','伯父','姑姑','叔叔','表哥'];
debtRate=s=>{if(s.age>=65&&!s.f.sharkD)return 0;if(s.f.nego&&s.y>=2006)return .03;if(s.f.sharkD)return .4;
  if(s.f.card)return s.y<2015?.18:.15;return s.y<1990?.1:.06};
let famCanHelp=s=>!s.f.parentdie&&s.famW>w0(s)*.3&&(s.f.famAsk||0)<6;
const bankLends=s=>s.y>=1990&&!(s.f.bankrupt&&s.y-s.f.bankrupt<7)&&(s.debt||0)<w0(s)*4;
/* one month's gap of D (萬), raised from whoever can give it */
function cover(s){if(s.cash===undefined||s.cash>=-1e-9)return;let D=-s.cash;s.cash=0;const W=w0(s);
  if(s.age<18&&!working(s)){s.famW-=D;return}
  /* 1. family: as much as they can spare; the diary notes the first ask and the fourth year of asking */
  if(famCanHelp(s)){const g=Math.min(D,(s.famW-W*.2)*.5);if(g>0){s.famW-=g;D-=g;
    if(s.t-(s.f.famAskT??-99)>=12){s.f.famAskT=s.t;s.f.famAsk=(s.f.famAsk||0)+1;
      if(s.f.famAsk===1||s.f.famAsk===4)s.q.push({cat:'家庭',tone:'neutral',text:s.f.famAsk===1?'這個月的錢不夠用，我打電話回家。爸媽沒有多問，隔天就匯了錢給我。':'我又打電話回家要錢了。電話那頭停了一下，才說：「好，我明天去領。」'})}}}
  if(D<=1e-9)return;
  /* 2. relatives, at most once every six years, up to about half a year's pay */
  if(s.t-(s.f.kinAskT??-999)>=72&&(s.kinDebt||0)<W&&chance(s.y<1995?.6:.35)){const a=Math.max(D,Math.min(W*.6,W-(s.kinDebt||0)));s.kinDebt=(s.kinDebt||0)+a;s.cash+=a-D;D=0;s.f.kinAskT=s.t;
    s.q.push({cat:'家庭',tone:'neutral',text:`我硬著頭皮去跟${pick(KIN_ASK)}借了 ${fmtW(a)} 萬。開口之前，我在門口站了好久。`});return}
  /* 3. the bank, from 1990: a card balance that snowballs, worst in 2005–06 */
  if(bankLends(s)){s.debt=(s.debt||0)+D;
    if(!s.f.card&&s.debt>W*.6){s.f.card=s.y;s.q.push(s.y>=2004&&s.y<=2007?(key(s,'卡債'),{cat:'人生',tone:'bad',text:'信用卡刷到額度滿了，我又辦了一張現金卡，用這張繳那張。電視上天天在講卡債，我不敢跟任何人說，自己也是其中一個。'}):{cat:'人生',tone:'bad',text:'這個月的帳單繳不出來，我第一次只繳了信用卡的最低應繳金額。'})}
    return}
  /* 4. 地下錢莊: only when the bank says no and the family has nothing left */
  if(!s.f.sharkD&&(s.debt||0)+D>W*1.5&&!famCanHelp(s)&&s.f.sharkTry!==s.y&&(s.f.sharkTry=s.y,chance(s.y<1990?.03:.08))){s.f.sharkD=s.t;s.f.shark=1;s.debt=(s.debt||0)+D;fx(s,{lonely:6,health:-4});scar(s,'地下錢莊的人還在追債',5,.5);key(s,'向地下錢莊借錢');
    s.q.push({cat:'人生',tone:'bad',text:'銀行不肯再借，我在電線桿上看到「免保人、當日撥款」的廣告，打了那支電話。利息一週一算，沒多久就有人到家門口潑漆。鄰居說，遇到恐嚇要打 110。'});return}
  /* 5. nobody lends: the rent and the shop bills go unpaid */
  s.debt=(s.debt||0)+D;if(!s.f.arrears){s.f.arrears=s.t;s.q.push({cat:'人生',tone:'bad',text:s.house==='own'||s.house==='family'?'這個月的水電、菜錢都付不出來。我跟巷口的雜貨店說，先記在帳上。':'這個月的房租付不出來。我跟房東說再等我幾天，他沒說話，只是看了我一眼。'})}}
/* each month: the budget, the student loan, then paying back what is owed out of savings */
function cashMonth(s){if(s.cash===undefined||s.f.homeless)return;s.cash+=s._mFlow||0;
  if(s._loanM&&s.loan>0){const p=Math.min(s.loan,s._loanM);s.loan-=p;s.cash-=p}
  cover(s);
  if(s.debt>0){const W=w0(s),spare=s.cash-W*.05;if(spare>0){const p=Math.min(s.debt,spare);s.debt-=p;s.cash-=p;if(s.debt<1e-6){s.debt=0;if(s.f.sharkD)s.f.sharkD=0}}}}
/* the yearly part: interest, 協商, 清算, and losing the roof */
function debtYear(s){if(s.cash===undefined||s.age<18)return;const W=w0(s),D=s.debt||0;
  if(D>0)s.debt*=1+debtRate(s);
  if(s.f.sharkD&&D<W*.3)s.f.sharkD=0;if(s.f.nego&&D<=0)s.f.nego=0;
  if(s.f.homeless)return;
  /* 債務協商 (from 2006) */
  if(s.y>=2006&&s.f.card&&!s.f.nego&&D>W*1.2&&chance(.4)){s.f.nego=s.t;s.q.push({cat:'人生',tone:'neutral',text:'我去銀行申請債務協商，利息降下來，分八年慢慢還。每個月一到繳款日，我就先把那筆錢轉出去。'});return}
  /* 消債條例 (from 2008): a court clears it, no loans for seven years */
  if(s.y>=2008&&!s.f.bankrupt&&D>W*3.5&&(!working(s)||s.f.nego)&&chance(.35)){s.f.bankrupt=s.y;s.debt=0;s.f.nego=0;s.f.sharkD=0;key(s,'聲請清算');scar(s,'信用破產，銀行不肯借錢',7,.2);
    s.q.push({cat:'人生',tone:'neutral',text:'我向法院聲請清算。法官裁定免責那天，我走出法院，覺得鬆了一口氣，也覺得很丟臉。接下來好幾年，我辦不了信用卡，也借不到錢。'});return}
  /* losing the roof: rare, only with no family, no partner and no work */
  const alone=(s.f.parentdie||s.famW<W*.3)&&!s.married&&!(s.kids>0);
  if(D>W*3&&alone&&!working(s)&&s.house!=='own'&&s.age>=25&&s.age<75&&chance(.08)){s.f.homeless=s.t;s.house=null;s.rentTier=null;s.f.homeJob=s.job;s.job='失業';fx(s,{lonely:12,health:-8});key(s,'流落街頭');
    s.q.push({cat:'人生',tone:'bad',text:`我付不出房租，被房東請了出去。那陣子，我晚上睡在${s.urban?'車站的地下道':'廟口的長椅'}，白天去找零工。後來一個社工給了我一張紙條，上面寫著一支可以求助的電話。（福利諮詢專線 1957）`})}}
/* coming back from the street: a shelter, a social worker, or family who finally found you */
function debtRecover(s){if(!s.f.homeless)return;if(chance(.35)){const by=s.f.homeless;s.f.homeless=0;s.f.wasHomeless=1;s.job='服務';s.jobStart=s.t;fx(s,{lonely:-6});
  s.q.push({cat:'人生',tone:'good',text:s.t-by<24&&chance(.5)?'一個很久沒聯絡的親戚找到了我，讓我先住在他們家。我在附近找了一份清潔的工作，重新開始。':'社工幫我申請了安置，也介紹了一份清潔的工作。第一次領到薪水，我租了一間很小的雅房。'})}}
/* the monthly settle-up wraps step in engine/settle.js, the last engine file, so every event's cost is in before the month closes */
{const y0=yearly;yearly=function(s){if(s.cash!==undefined){debtRecover(s);debtYear(s)}y0(s);
  if(s.f.card&&!s.f.debtReg&&(s.debt||0)>w0(s)*1.5){s.f.debtReg=1;regret(s,'debt',s.f.card>=2004&&s.f.card<=2007?'背了好幾年的卡債。':'借錢過日子，欠了好幾年。',s.f.card>=2004&&s.f.card<=2007?'銀行到處發現金卡，我刷了一張又一張':'錢一直不夠用',2)}}}
/* banks won't lend for seven years after 清算, and a homeless year has no house to buy */
for(const lb of ['買','買（貸三十年）','買（新青安四十年）']){const a=ASP.house&&ASP.house[lb];if(!a)continue;const p0=a.p;a.p=s=>(s.f.bankrupt&&s.y-s.f.bankrupt<7)||s.f.homeless?0:(typeof p0==='function'?p0(s):p0)}
