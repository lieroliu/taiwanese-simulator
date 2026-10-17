/* ================= era technology: who grew up with which device ================= */
// people born 1976+ were 35 or younger when smartphones arrived; lines about struggling with phones or LINE don't fit them
/* brothers and sisters stay consistent: the eldest has no 哥哥/姊姊, an only child has none at all */
{const so2=sentOK;sentOK=function(s,x){const o=x.replace(/「[^」]*」/g,'');const up=/(我跟哥哥|我跟姊姊|我跟姐姐|我哥|我姊|我姐|哥哥說|姊姊說|哥哥帶我|姊姊帶我|哥哥把|姊姊把)/.test(o),dn=/(我有了弟弟|我有了妹妹|我跟弟弟|我跟妹妹|我弟|我妹)/.test(o);
  if(up||dn){meRoll(s);if(s.f.only||(up&&s.f.eldest))return false}if(s.birthCounty==='連江縣'&&/(台語|布袋戲|歌仔戲|史艷文)/.test(o))return false;return so2(s,x)}}
{const so1=sentOK;sentOK=function(s,x){if(s.by>=1976&&/(學會用 ?LINE|教我用手機|學會怎麼用手機|是孫子幫我挑的|習慣按鍵的手機|才學會打字|手機拿得太近)/.test(x))return false;return so1(s,x)}}
/* fraud that hits the family: parents first, by the scam of that year */
RE.push({id:'famscam',p:s=>s.y>=2000&&s.age>=20&&!abroad(s)&&parAlive(s)&&parAge(s)>=60?.0009:0,run:s=>{const P=pick(['爸爸','媽媽']),y=s.y,ta=P==='爸爸'?'他':'她';
  const how=y<2007?`接到一通電話，說${ta}中了刮刮樂的大獎，要先匯一筆稅金才能領`
   :y<2014?`接到一通電話，對方自稱地檢署，說${ta}的帳戶涉及洗錢，要${ta}把存款領出來交給「監管人員」`
   :y<2019?`接到電話說網購的時候被設成分期付款，要${ta}去 ATM 照著指示「解除」`
   :`被拉進一個投資群組，「老師」說穩賺不賠，${ta}把一輩子的積蓄分好幾次匯了出去`;
  const caught=chance(y>=2014?.35:.2);
  if(caught){const by=y>=2014?'銀行行員看${ta}一直講電話，覺得不對勁，報了警':'我剛好打電話回家，聽出不對勁，叫${ta}什麼都不要動';
   return {cat:'家庭',tone:'neutral',text:`${P}${how}。${by.replace(/\$\{ta\}/g,ta)}。錢沒有被騙走，${P}嘴上說自己才不會被騙，可是那天晚上一直睡不著。`,note:'接到可疑來電或訊息，可撥打 165 反詐騙諮詢專線。'}}
  const help=s.money>=45||chance(.4);if(help)fx(s,{money:-4});
  const r=help?`我把自己的存款拿出一部分給${ta}，叫${ta}以後接到陌生電話先打給我。`:`我沒有能力幫忙補回來，只能每天打電話回家，提醒${ta}不要再接陌生電話。`;
  return {cat:'家庭',tone:'bad',text:`${P}${how}。等到發現被騙，錢已經追不回來了。${P}一直說是自己老了、太笨，${r}`,note:'接到可疑來電或訊息，可撥打 165 反詐騙諮詢專線。'}}});
