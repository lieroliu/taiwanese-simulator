/* ================= shop: opening your own business takes money, and many shops close =================
   Paddy 2026-10-17: 做小生意 should depend on whether you can raise the money. A shopfront costs about a year's pay
   (half that before 1990), a stall or a 頂 breakfast shop about a quarter to half (估算). The money comes from savings,
   then the family (if they can spare it, which costs goodwill), then a relative (richer families have richer relatives, 估算). Short of a shopfront you start with a stall;
   short of a stall you go to work instead. Shops fail most in the first years (估算: about half are gone within five years). */
const SHOP={'做小生意':{shop:s=>w0(s)*(s.y<1990?.5:1),stall:s=>w0(s)*.25},'開早餐店':{shop:s=>w0(s)*.5,stall:null}};
/* how much you could raise right now, without taking it yet */
function shopFunds(s){const W=w0(s);let a=Math.max(0,s.cash||0);if(famCanHelp(s))a+=Math.max(0,(s.famW-W*.2)*.5);
  if(s.t-(s.f.kinAskT??-999)>=72&&(s.kinDebt||0)<W)a+=W*({'低':.15,'中':.35,'高':.6}[s.inc]||.3);return a}
/* take it: savings first, then family, then a relative; returns where it came from */
function shopRaise(s,need){const W=w0(s),src=[];let n=need;const c=Math.min(n,Math.max(0,s.cash));if(c>0){s.cash-=c;n-=c;src.push('存款')}
  if(n>0&&famCanHelp(s)){const g=Math.min(n,Math.max(0,(s.famW-W*.2)*.5));if(g>0){s.famW-=g;n-=g;famLikeAdd(s,-6);src.push('爸媽')}}
  if(n>.001){s.kinDebt=(s.kinDebt||0)+n;s.f.kinAskT=s.t;src.push(pick(KIN_ASK))}return src}
for(const [id,lb] of [['job','做小生意'],['layoff','開早餐店']]){const a=ASP[id]&&ASP[id][lb];if(!a)continue;const C=SHOP[lb];
  a.p=s=>shopFunds(s)>=(C.stall||C.shop)(s)?.95:0}
{const dc=doChoice;doChoice=function(s,e,c){const C=c&&SHOP[c.label];const r=dc(s,e,c);
  if(!C||!r||r.fail||s.job!=='自營'||s.cash===undefined)return r;
  const big=!C.stall||shopFunds(s)>=C.shop(s),need=big?C.shop(s):C.stall(s),src=shopRaise(s,need);
  s.f.shop={t:s.t,kind:big?'店':'攤',cap:need};
  const L=src.map(x=>x==='存款'?'我自己存的':x==='爸媽'?'爸媽出的':`跟${x}借的`),from=L.length===1?'都是'+L[0]:L.map(x=>'一部分是'+x).join('，');
  r.text=(c.label==='開早餐店'?'我頂下一間早餐店，每天凌晨四點起床煎蛋餅。':big?'我租了一間小店面，自己當老闆，每天早上六點開門。':'錢不夠租店面，我在市場擺了一個攤子。')+`本錢 ${fmtW(need)} 萬，${from}。`;return r}}
/* a stall earns less than a shop */
{const mi=myIncome;myIncome=function(s){const v=mi(s);return s.job==='自營'&&s.f.shop&&s.f.shop.kind==='攤'?v*.75:v}}
/* closing down: high in the first years, higher in bad years */
const SHOP_BAD=y=>(y>=2001&&y<=2002)||y===2003||(y>=2008&&y<=2009)||(y>=2020&&y<=2021);
{const y0=yearly;yearly=function(s){y0(s);const sh=s.f.shop;if(!sh||s.job!=='自營'){if(sh&&s.job!=='自營')s.f.shop=null;return}
  const yrs=(s.t-sh.t)/12;let p=yrs<1?.2:yrs<2?.15:yrs<3?.1:.05;if(SHOP_BAD(s.y))p*=2;if(s.y>=1990&&sh.kind==='店')p*=1.15;
  if(!chance(p))return;
  const owe=sh.cap*.3;s.debt=(s.debt||0)+owe;s.f.shop=null;s.f.shopClosed=(s.f.shopClosed||0)+1;
  s.job=['高中','五專','大學'].includes(s.edu)?pick(['公司','服務']):pick(['工廠','服務']);s.jobStart=s.t;fx(s,{self:-4,lonely:5});key(s,'收掉自己的店');
  regret(s,'shop',sh.kind==='攤'?'擺的攤撐不下去。':'開的店撐不下去。',SHOP_BAD(s.y)?'景氣很差，客人越來越少':'生意一直沒有起色',2);
  s.q.push({cat:'人生',tone:'bad',text:`${sh.kind==='攤'?'攤車':'店'}收起來了。${sh.kind==='攤'?'我把攤車便宜賣給了別人。':'拉下鐵門那天，我在門口站了很久。'}還欠廠商 ${fmtW(owe)} 萬的貨款，我得先去找一份工作。`})}}
