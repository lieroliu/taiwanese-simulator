/* ================= random life events ================= */
const RE=[
 {id:'sick',p:s=>.0012+(s.age>50?.002:0),run:s=>{fx(s,{health:-12});if(s.age<12)return {cat:'健康',text:'我發高燒住院，媽媽在病床邊守了好幾個晚上。'};let t='我生了一場病，住院住了好幾個禮拜。';if(s.y<1995&&s.money<40){fx(s,{money:-8});t+='那時還沒有健保，住院費讓家裡借了錢。'}return {cat:'健康',text:t}}},
 {id:'scooter',p:s=>s.age>=16&&s.age<=50?.0012*(.6+s.ax.risk/100):0,run:s=>{if(chance(.3)){fx(s,{health:-25});return {cat:'健康',text:'我騎機車出了車禍，在醫院躺了兩個月。到現在走路還是有點跛。'}}fx(s,{health:-10});return {cat:'健康',text:'我騎機車出了車禍，腳上縫了十幾針。'}}},
 {id:'workinj',p:s=>['工廠','營造','農'].includes(s.job)?.0008:0,run:s=>{fx(s,{health:-15});return {cat:'健康',text:s.job==='營造'?'我從鷹架上摔了下來，休養了好幾個月。':s.job==='農'?'我在田裡被農機割傷，傷口好久才好。':'我在工廠受了傷，手指被機器夾到。'}}},
 {id:'theft',p:s=>s.y<2010&&s.urban&&s.age>=15?.0006:0,run:s=>{fx(s,{money:-2});return {cat:'生活',text:pick(['我的機車被偷了。','我家遭小偷，抽屜被翻得亂七八糟。'])}}},
 {id:'snatch',p:s=>s.y>=1985&&s.y<=2005&&s.age>=18&&s.urban?.0003:0,run:s=>{fx(s,{money:-3,lonely:2});return {cat:'生活',text:'一個騎機車的人從我身邊經過，一把搶走了我的包包。'}}},
 {id:'scam',p:s=>s.y>=2000&&s.age>=20?.0003+(s.age>=60?.001:0)+s.lonely/100*.0006:0,run:s=>{fx(s,{money:-12});let t;
   if(s.y<2011)t='我接到一通電話，說我的帳戶被盜用，要我去 ATM 照指示操作。我照做了，存款就這樣不見了。';
   else if(s.age>=60)t=`LINE 上有人假裝是我的${s.f.gk?'孫子':s.kids?'孩子':'姪子'}，說急需用錢。我匯了錢，才發現被騙了。`;
   else t='我加入了一個投資群組。「老師」帶我賺了兩次小錢，第三次，我把存款都投了進去。';
   return {cat:'生活',text:t,note:'接到可疑來電或訊息，可撥打 165 反詐騙諮詢專線。'}}},
 {id:'dv',p:s=>s.married?.0003:0,run:s=>{fx(s,{health:-8,lonely:10});return {cat:'家庭',text:'家裡的爭吵，那天晚上變成了拳頭。我沒有跟任何人說。',note:'如果你或身邊的人正遭受家暴，可撥打 113 保護專線，24 小時都有人接聽。'}}},
 {id:'hui',p:s=>s.y>=1970&&s.y<=1995?.0005:0,run:s=>{if(s.age<18){fx(s,{money:-10});return {cat:'家庭',text:'媽媽跟的會被倒了，會頭連夜跑路。那陣子家裡吵了好幾個月。'}}fx(s,{money:-15});key(s,'跟會被倒');return {cat:'家庭',text:'我跟的會被倒了，好幾年的積蓄一夜之間沒了。'}}},
 {id:'guarantee',p:s=>s.age>=12&&s.age<=65?.00025:0,run:s=>{if(s.age<18){fx(s,{money:-12});return {cat:'家庭',text:'爸爸幫朋友作保，朋友跑了。銀行找上門，家裡背了一筆債。'}}fx(s,{money:-18,lonely:4});key(s,'幫人作保被拖累');return {cat:'家庭',text:'我幫朋友作保，他跑了，銀行找上了我。我們再也沒有聯絡。'}}},
 {id:'lottery',p:s=>s.y>=1985&&s.y<=1989?(s.age>=20&&s.ax.risk>60?.004:s.age<18?.0015:0):0,run:s=>{if(s.age<18){fx(s,{money:-8});return {cat:'家庭',text:'爸爸迷上了大家樂，每天跑去土地公廟求明牌，家裡的錢越來越少。'}}fx(s,{money:-10,risk:3});return {cat:'家庭',text:'大家樂正熱，我也每期都簽，最後把好幾個月的薪水都賠了進去。'}}},
 {id:'card',p:s=>s.y>=2005&&s.y<=2007&&s.age>=20&&s.age<=35&&s.ax.risk>55?.006:0,run:s=>{fx(s,{money:-15});key(s,'卡債');return {cat:'家庭',text:'我用現金卡和信用卡借錢，借了又借。卡債風暴那年，我的帳單像雪球一樣越滾越大。'}}},
 {id:'shark',p:s=>s.money<12&&s.age>=20&&!s.f.shark?.003:0,run:s=>{s.f.shark=1;fx(s,{lonely:8,health:-5});return {cat:'家庭',text:'我向地下錢莊借了錢。討債的人開始打電話到公司，在我家門口噴漆。'}}},
 {id:'friend',p:s=>.0012,run:s=>{fx(s,{lonely:-10});return {cat:'生活',text:s.age<18?'我交到一個很要好的朋友，我們什麼話都說。':s.age<45?'我認識了一個很聊得來的朋友。':'我在社區大學交到幾個新朋友，每週一起爬山。'}}},
 {id:'loss',p:s=>s.age>=55?.001:0,run:s=>{fx(s,{lonely:8});return {cat:'生活',text:'一位老朋友過世了。告別式上，我看見許多多年沒見的臉。'}}},
 {id:'reunion',p:s=>s.age>=40&&s.age<=65&&!s.f.reunion?.002:0,run:s=>{s.f.reunion=1;return {cat:'生活',text:s.f.cow?'我參加了國中同學會。當年放牛班的同學，有人當了老闆，有人已經不在了。':'我參加了國中同學會。大家都胖了，聊的都是孩子和健康檢查。'}}},
 {id:'promo',p:s=>working(s)&&s.age>=25&&s.age<=55&&!['農','自營'].includes(s.job)?.001:0,run:s=>{fx(s,{money:8});return {cat:'人生',text:'我升職了。薪水多了一點，責任多了很多。'}}},
 {id:'receipt',p:s=>s.age>=12?.0003:0,run:s=>({cat:'生活',text:'我對中了統一發票兩百塊，開心了一整天。'})},
 {id:'gpdie',p:s=>s.age>=5&&s.age<=35&&(s.f.gp||0)<2?.0012:0,run:s=>{s.f.gp=(s.f.gp||0)+1;fx(s,{lonely:3});return {cat:'家庭',text:s.eth==='外省'?'爺爺過世了。他到最後，都沒能回去看一眼老家。':s.eth==='原住民'?'vuvu 過世了。我想起小時候她用族語唱給我聽的歌。':`${elders(s).slice(-2)}過世了。我想起小時候${s.fam==='隔代教養'?'是她把我帶大的':'過年在她家的大圓桌吃飯'}。`}}},
 {id:'typhoon',p:s=>s.m>=7&&s.m<=9&&['南','東','離島'].includes(regionOf(s.place))?.006:0,run:s=>{fx(s,{money:-3});return {cat:'災難',text:'颱風過境，家裡淹了水。我們花了好幾天清理泥巴。'}}},
];

