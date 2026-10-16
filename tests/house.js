// Buying a house: down payment by era, amortized mortgage at era rates, bank income check, house as an asset.
const { chromium } = require(process.env.PW||'playwright');
const file=process.argv[2]||'index.html',N=+process.argv[3]||900;
(async()=>{const b=await chromium.launch();const p=await b.newPage();const errs=[];p.on('pageerror',e=>errs.push(e.message));await p.goto('file://'+process.cwd()+'/'+file);
const r=await p.evaluate((N)=>{const offers=[],buys=[],bad={negCash:0,overCap:0,leftAtEnd:0},ex=[];const TP=s=>['台北市','台北縣'].includes(s.place);
 for(let i=0;i<N;i++){const s=newLife(1955+(i%50));let g=0,endChk=null;
  while(!s.dead&&g<1500){g++;for(const e of step(s)){if(e.choices){if(e.id==='house'){const inc=(myIncome(s)+spIncome(s))/12,P=housePrice(s),dr=s.y<1990?.3:.2,r=mRate(s.y),L=P*(1-dr),pm=L*(r/12)/(1-Math.pow(1+r/12,-240));
      offers.push({y:s.y,tp:TP(s),burden:inc>0?pm/inc:9,yrs:inc>0?P/inc/12:99});const c0=s.cash;const rr=doChoice(s,e,autoChoose(s,e));
      if(s.house==='own'&&s._plan&&s._plan.ok&&s.houseY===s.y&&!buys.includes(s)){buys.push(s);const h=s._plan;if(s.cash<-1e-6&&s.cash<c0-h.fromCash-1e-6)bad.negCash++;if(h.mPay>h.mInc*(s.y<2000?.33:.5)+1e-6)bad.overCap++;endChk=s.mortgageEnd;
        if(ex.length<6)ex.push(s.y+(TP(s)?' 北北 ':' ')+you(e.text)+' => '+you(rr.text))}}else doChoice(s,e,autoChoose(s,e))}}
   if(endChk&&s.t>=endChk+12){if(s.mortLeft>1)bad.leftAtEnd++;endChk=null}}}
 const med=a=>{a=a.slice().sort((x,y)=>x-y);return a.length?+a[a.length>>1].toFixed(2):null};
 const win=(a,b,tp)=>offers.filter(o=>o.y>=a&&o.y<=b&&(tp==null||o.tp===tp));
 const rows={};for(const [k,a,b2] of [['1985-92',1985,1992],['1993-2002',1993,2002],['2003-15',2003,2015],['2016-25',2016,2025],['2026+',2026,2100]])for(const tp of [true,false]){const O=win(a,b2,tp);const B=buys.filter(s=>s.houseY>=a&&s.houseY<=b2&&TP(s)===tp);rows[k+(tp?' 北北':' 其他')]={offers:O.length,buy:O.length?Math.round(B.length/O.length*100)+'%':'-',burden:med(O.map(o=>o.burden)),yrs:med(O.map(o=>o.yrs))}}
 const chk={b1990TP:med(win(1988,1992,true).map(o=>o.burden)),b2005all:med(win(2003,2007).map(o=>o.burden)),b2024TP:med(win(2022,2026,true).map(o=>o.burden))};
 return {offers:offers.length,buys:buys.length,rows,chk,bad,ex}},N);
console.log(JSON.stringify(r,null,1));
const ok=!errs.length&&r.bad.negCash===0&&r.bad.overCap===0&&r.bad.leftAtEnd===0&&r.chk.b1990TP>=.7&&r.chk.b2005all<=.4&&r.chk.b2024TP>=.55;
console.log(errs.length?'ERR '+errs[0]:ok?'OK':'FAIL');await b.close();process.exit(ok?0:1)})();
