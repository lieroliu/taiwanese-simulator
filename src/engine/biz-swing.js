/* ================= small business swings: 做小生意 rides the economy, a salary stays put ================= */
/* s.bizLv is how well the shop is doing (-4..5); it adds to the money index every year the character runs it,
   so a good run or a bad run keeps showing up in income and savings instead of fading back to the job average. */
const BIZ_UP=['這一年生意很好，客人排到騎樓外面。我收攤的時候數錢，數到手都黑了。','過年前的生意特別好，我跟家裡的人輪班顧店，連吃飯都站著吃。','常來的客人幫我介紹了一筆大訂單。我做到半夜，心裡卻很踏實。'];
const BIZ_DOWN=['對面開了一間連鎖店，便宜一半。我撐了半年，客人還是越來越少。','這一年生意很差，月底算帳的時候，扣掉房租和進貨，我等於白做。','批貨的上游跑了，我先付的貨款拿不回來。那幾個月，我連作夢都在算帳。'];
const BIZ_BOOM=['我開了第二間店，把第一間交給表弟顧。親戚過年看我的眼神不一樣了。','我的店上了電視美食節目。隔天開始，門口每天排隊。'];
{const y0=yearly;yearly=function(s){y0(s);
  if(s.job!=='自營'||!working(s)){if(s.bizLv&&s.job!=='自營')s.bizLv=0;return}
  s.bizLv=s.bizLv||0;const yrs=(s.t-(s.jobStart||s.t))/12,h=hardY(s.y);if(yrs<1){s.money+=s.bizLv*1.5;clampAll(s);return}
  const r=R(),line=(arr,tone)=>{const u=s.f.bizU=s.f.bizU||[];const c=arr.filter(t=>!u.includes(t));if(!c.length)return;const t=pick(c);u.push(t);s.q.push({pri:1,cat:'生活',tone,text:t})};
  if(!s.f.bizBoom&&yrs>=3&&r<.03*(1-h)){s.f.bizBoom=1;s.bizLv+=3;fx(s,{money:15,risk:2});key(s,'生意做起來了');line(BIZ_BOOM,'good')}
  else if(r<.03+.2*(h?.5:1)){s.bizLv=Math.min(5,s.bizLv+1);fx(s,{money:6});line(BIZ_UP,'good')}
  else if(r<.23+.18*(h?1.8:1)){s.bizLv=Math.max(-4,s.bizLv-1);fx(s,{money:-7});line(BIZ_DOWN,'bad')}
  if(yrs>=6&&(s.bizLv<=-3?chance(.25):chance(.015))){const n=Math.round(yrs);s.job=pick(['服務','工廠']);s.jobStart=s.t;s.bizLv=0;fx(s,{money:-15,risk:-3});key(s,'店收起來了');s.f.bizY=s.y;s.f.bizFail=`，你開的店撐了 ${n} 年還是收了`;scar(s,'店收掉以後欠的錢還沒還完',3,.3);
    s.q.push({pri:1,cat:'人生',tone:'bad',text:`店開了 ${n} 年，最後還是收起來了。剩下的貨賣不掉，裝潢也拆不走，我還欠了銀行一筆錢。`});return}
  s.money+=s.bizLv*1.5;clampAll(s)}}
/* the shop's run sets the real income too: a bad run earns 40% of the usual, a long good run up to 175% */
{const m0=myIncome;myIncome=function(s){const v=m0(s);return s.job==='自營'&&s.bizLv?v*Math.max(.4,1+.15*s.bizLv):v}}
