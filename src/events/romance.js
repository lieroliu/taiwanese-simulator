/* ================= romance: dating takes time ================= */
const RN=s=>nm(partnerOf(s)), RP=s=>pr(partnerOf(s));
function relCompat(s,pt){return 100-(Math.abs(s.ax.self-pt.ax.self)+Math.abs(s.ax.risk-pt.ax.risk))/2}
function relEnd(s,why){const pt=partnerOf(s);if(pt){pt.role='ex';storyAdd(s,pt,'跟你分手')}s.rel=null;s.f.ptId=null;s.f.relCool=s.t+12+Math.floor(R()*18);s.f.exes=(s.f.exes||0)+1;fx(s,{lonely:10,self:3});
  const n=pt?nm(pt):'對方',p=pt?pr(pt):'他';
  return {tone:'bad',cat:'人生',text:why==='fam'?`${n}說${p}沒辦法跟家裡翻臉。我們在常去的那家店坐了最後一次，誰都沒有把飲料喝完。`:why==='wait'?`${n}說${p}等不下去了。${p}想要的是一個家，我給不起一個日期。我們就這樣分手了。`:why==='far'?`分隔兩地久了，電話越講越短。有一天${n}說，${p}好像已經習慣沒有我的日子了。`:
   pick([`我們分手了。不是誰做錯了什麼，只是越來越沒話說。`,`${n}說${p}累了。我把${p}的東西裝成一箱，放在${p}家樓下的管理室。`,`我們分手了。後來好幾個月，經過我們常去的那條路，我都會繞開。`])}}
let DATE=s=>{const n=RN(s),p=RP(s),L=LC(s);
  if(s.y<1975)return pick([`我跟${n}約在冰果室，一杯木瓜牛奶喝了一個下午，誰都不好意思先開口。`,`我們去看了一場二輪電影。散場的時候，${n}一直走在我後面兩步。`,`我們一個禮拜寫兩封信。我把${n}的信藏在抽屜最裡面，怕被弟妹偷看。`]);
  if(s.y<1990)return pick([`我跟${n}去西餐廳吃牛排，鐵板上的醬汁噴到衣服上，我們笑了好久。`,`每天晚上，我在巷口的公共電話跟${n}講到零錢用完。`,`我們去 MTV 看了一部片，其實我整場都沒在看電影。`,`我騎機車載${n}去${L.spot}。${p}在後座抓著我的衣角，一路上都沒說話。`]);
  if(s.y<2006)return pick([`BB.Call 響了，是${n}傳來的「520」。我在上課的時候笑出聲，被老師瞪了一眼。`,`我們騎機車去${L.spot}看夕陽，回程下起大雨，兩個人淋成落湯雞。`,`我們在 KTV 包廂合唱了一首情歌。${n}唱走音了，還硬要唱完。`,`我跟${n}在${L.nm}一路吃到尾，${p}說${L.food.replace(/^一[碗盤份個串盒顆]/,'')}是這裡最好吃的。`]);
  return pick([`我跟${n}每天晚上都講電話，講到其中一個人先睡著。`,s.y<1993?`${n}寫了一封好長的信給我，我看了好幾遍才睡。`:s.y<2000?`${n}半夜 call 我，螢幕上是「520」。我躲在被子裡偷笑。`:s.y<2012?`我們在 MSN 上聊到半夜，誰都不想先下線。`:`我們用 LINE 傳了一整晚的貼圖，誰都不想先說晚安。`,`我跟${n}去${L.nm}，吃了${L.food}。${p}拍了好多張照片，說要做成相簿。`,[12,1].includes(s.m)?`我們一起去看跨年煙火。人擠人，${n}一直牽著我的手不敢放。`:`我們去山上看夜景。風很大，${n}一直牽著我的手不敢放。`])};
let HABIT=s=>{const pt=partnerOf(s),n=nm(pt),p=pr(pt),out=[];
  if(Math.abs(s.ax.risk-pt.ax.risk)>20)out.push(s.ax.risk>pt.ax.risk?[`我想換工作，${n}說穩定比較重要。我們為這件事討論了好幾個晚上，誰也沒說服誰。`,-6]:[`${n}想辭職去做自己的事，我覺得太冒險。${p}說我什麼都怕。`,-6]);
  if(Math.abs(s.ax.self-pt.ax.self)>20)out.push(s.ax.self<pt.ax.self?[`${n}很少回家看爸媽，我覺得${p}對家裡太冷淡。${p}說，那是${p}家的事。`,-5]:[`${n}每個週末都要回家陪爸媽。我開始覺得，自己在${p}心裡排在很後面。`,-5]);
  out.push([`我們第一次為了錢吵架。${n}覺得我花錢太大方，我覺得${p}太計較。`,-4],
   [`${n}約會總是遲到。我在約好的地方等了四十分鐘，${p}一出現，我就把剛剛想好要罵的話忘了。`,-1],
   [`${n}習慣把牙膏從中間擠，我每次看到都忍不住。這種小事，我們居然也吵了一次。`,-2],
   [`我發現${n}不太會說好聽的話。可是每次我加班到很晚，${p}都會買宵夜在樓下等我。`,8],
   [`${n}生病那幾天，我每天下班都去${p}家煮粥。${p}媽媽偷偷跟${p}說：「這個不錯。」`,7],
   [`我們開始知道對方的脾氣。${n}生氣的時候不說話，我學會先讓${p}安靜一下，再去找${p}。`,6]);
  return pick(out)};
let FIGHT=s=>{const n=RN(s),p=RP(s);return pick([`我們大吵了一架。${n}說我從來不聽${p}說話，我說${p}根本不懂我。那個禮拜，我們都沒有聯絡。`,`為了一件小事，我們在路邊吵到路人都在看。${n}頭也不回地走了。`,`${n}看到我手機裡跟別人的對話，問了我一整個晚上。我解釋到後來，自己都覺得累。`.replace('手機裡',s.y<2000?'抽屜裡的信，看到我':'手機裡')])};
let MAKEUP=s=>{const n=RN(s),p=RP(s);return pick([`後來是我先打電話過去的。電話接通的時候，兩個人都沉默了好久。`,`${n}在我家樓下等了一個晚上。我們都說了對不起。`,`過了幾天，${n}傳來一句「吃飯了嗎」。我們就這樣和好了，誰都沒再提那件事。`])};
function famMeet(s){const pt=partnerOf(s),n=nm(pt),p=pr(pt);let d=0,t;
  const mixed=s.y<1992&&pt.eth!==s.eth&&(pt.eth==='外省'||s.eth==='外省'),lang=pt.eth!==s.eth&&['閩南','客家','原住民'].includes(pt.eth)&&s.eth!=='新住民子女';
  if(mixed){d=-18;t=`第一次去${n}家吃飯。${p}爸爸聽說我是${s.eth==='外省'?'外省人':'本省人'}，整頓飯都沒怎麼說話。回去的路上，${n}一直跟我道歉。`}
  else if(s.money<30&&chance(.5)){d=-12;t=`第一次去${n}家。客廳比我們家整間還大，${p}媽媽客氣地問我爸媽是做什麼的。回家的路上，我一句話都沒說。`}
  else if(lang&&chance(.6)){d=4;t=`第一次去${n}家。${p}的${pt.eth==='客家'?'阿婆只講客家話':pt.eth==='原住民'?'vuvu 只講族語':'阿嬤只講台語'}，我聽得懂一半，只能一直點頭笑。臨走前，老人家塞了一包水果給我。`}
  else{d=6;t=`第一次去${n}家吃飯。${p}媽媽一直夾菜給我，${p}爸爸只問了一句：「你做什麼工作？」我緊張到手心都是汗。`}
  const back=chance(.5)?`我也帶${n}回家。爸媽表面上很客氣，等${p}走了以後，媽媽問我：「${p}家裡是做什麼的？」`:'';
  return [t+(back?back:''),d,mixed]}
function relMeet(s){const blind=s.y<1988&&(s.age>=23||chance(.5))&&chance(s.y<1975?.8:.55);const pt=meetPartner(s);const n=nm(pt),p=pr(pt);
  const job=pt.job?`${p}是${JOBLABEL[pt.job]}，`:`${p}還在讀書，`;
  let how;if(blind)how=`媒人帶我去相親。我們在餐廳見面，雙方家長坐在旁邊，我跟${n}一句話都沒講上。${job}看起來很老實。`;
  else{const w=s.studying==='大學'?pick(['在社團認識了','聯誼的時候認識了','在系上的課認識了']):s.y<1980?pick(['在工廠認識了','在同鄉會認識了','在教會認識了']):s.y<2010?pick(['在公司認識了','朋友介紹，認識了','在朋友的生日派對上認識了']):pick(['在公司認識了','朋友介紹，認識了','在交友軟體上認識了']);const wk=w==='在公司認識了'?(['公司','科技','公教','醫護','台幹'].includes(s.job)&&working(s)):w==='在工廠認識了'?(s.job==='工廠'&&working(s)):true;how=`我${wk?w:'朋友介紹，認識了'}${n}。${job}笑起來${pick(['眼睛會瞇成一條線','很好看','有點傻'])}。`}
  return {blind,pt,text:how}}
const RMS=[
 {id:'meet',choice:1,check:s=>!s.married&&!s.rel&&!s.f.divorced&&s.age>=18&&s.age<=48&&s.t>=(s.f.relCool||0)&&chance((s.age<22?.01:s.age<36?.032:.012)*(s.by<1975?1.6:1)*(.7+s.ax.open/150)),run:s=>{const m=relMeet(s);s._meet=m;
   return {cat:'人生',title:'認識一個人',text:m.text+(m.blind?'要繼續見面嗎？':`要跟${nm(m.pt)}在一起嗎？`),choices:[
    {label:m.blind?'繼續見面':'在一起',go:s=>{s.rel={stage:m.blind?'habit':'dating',since:s.t,last:s.t,score:m.blind?55:60,blind:m.blind,fights:0,asks:0};key(s,m.blind?`相親認識${nm(m.pt)}`:`跟${nm(m.pt)}在一起`);storyAdd(s,m.pt,m.blind?'跟你相親':'跟你交往');fx(s,{lonely:-8});
      return m.blind?`我們又見了幾次面，一起去看了一場電影。${pr(m.pt)}話不多，可是會幫我開門。`:`我們開始交往了。第一次牽手的時候，我的手心全是汗。`}},
    {label:'先當朋友',go:s=>{const pt=m.pt;pt.role='friend';s.f.ptId=null;s.f.relCool=s.t+8;fx(s,{self:3});return m.blind?'我跟媒人說不合適。媽媽念了我好幾天。':`我覺得還沒準備好。我們後來還是會一起吃飯，只是沒有再更近一步。`}}]}}},
 {id:'relstep',check:s=>s.rel&&!s.married&&s.t-s.rel.last>=(s.rel.blind?2:4)&&chance(.35),run:s=>{const r=s.rel,pt=partnerOf(s);if(!pt||!pt.alive){s.rel=null;return null}
   r.last=s.t;const mo=s.t-r.since,comp=relCompat(s,pt);
   if(r.stage==='dating'){if(mo>=8&&chance(.5)){r.stage='habit';}const t=DATE(s);r.score+=4;return {tone:'good',cat:'人生',text:t}}
   if(r.stage==='habit'){
     if(chance(.3+(100-comp)/200)){r.fights++;r.score-=10+Math.round((100-comp)/8);
       if(r.score<25||(r.fights>=3&&chance(.35)))return relEnd(s);
       const mk=chance(.5+(50-s.ax.self)/150)?MAKEUP(s):'';if(mk)r.score+=6;return {tone:'bad',cat:'人生',text:FIGHT(s)+(mk?mk:'')}}
     const [t,d]=HABIT(s);r.score+=d+(comp-60)/10;if(r.score<20)return relEnd(s);
     if(mo>=(r.blind?3:12)&&r.score>=45)r.stage='family';return {tone:d>0?'good':'neutral',cat:'人生',text:t}}
   if(r.stage==='family'){const [t,d,mixed]=famMeet(s);r.score+=d;if(mixed&&chance(.4))r.famNo=1;
     if(r.famNo&&r.score<40&&chance(.5))return relEnd(s,'fam');r.stage='ready';r.readyT=s.t;return {tone:d>0?'good':'bad',cat:'家庭',text:t}}
   if(r.stage==='ready'){if(s.f.farT===undefined&&chance(.12)&&s.age<40){s.f.farT=s.t;r.score-=8;return {tone:'bad',cat:'人生',text:`${RN(s)}被公司調去外地，我們開始分隔兩地。每個週末，不是我搭車去找${RP(s)}，就是${RP(s)}搭車來找我。`}}
     if(s.f.farT!==undefined&&r.score<35&&chance(.3))return relEnd(s,'far');
     r.score+=2;r.rdU=s.f.rdU=s.f.rdU||[];const RD=[`我們開始會聊以後要住在哪裡、要不要養狗。`,`${RN(s)}的家人開始會在過年的時候，多準備一副碗筷給我。`,`我們在一起${Math.max(1,Math.round(mo/12))}年了。朋友們開始問我們什麼時候要請喝喜酒。`].map((t,k)=>[k,t]).filter(([k])=>!r.rdU.includes(k));if(!RD.length)return null;const [rk,rt]=pick(RD);r.rdU.push(rk);return {tone:'good',cat:'人生',text:rt}}
   return null}}];
(()=>{const i=MS.findIndex(x=>x.id==='marry');MS.splice(i,0,...RMS);
 const mar=MS.find(x=>x.id==='marry');
 mar.check=s=>!s.married&&s.rel&&s.rel.stage==='ready'&&s.age>=21&&s.age<=55&&s.t>=(s.f.noMarryUntil||0)&&!(s.studying&&!s.rel.blind)&&s.t-s.rel.readyT>=(s.rel.blind?1:4)&&chance(s.rel.blind?.4:.1*(s.by<1980?1.6:1)*(1+Math.max(0,s.age-27)*.1));
 const base=mar.run;mar.run=s=>{const pt=partnerOf(s),meet0=meetPartner;meetPartner=()=>pt;let e;try{e=base(s)}finally{meetPartner=meet0}
   const mo=s.t-s.rel.since,yrs=mo<12?`${Math.max(1,mo)} 個月`:`${Math.round(mo/12)} 年`;
   e.text=(s.rel.blind?`從相親到現在，才過了 ${yrs}。兩家人已經在看日子了。`:`我跟${nm(pt)}在一起 ${yrs}了。${s.age>=28&&s.by<=1980?'家裡一直在催。':''}`)+`要跟${nm(pt)}結婚嗎？`;
   const g0=e.choices[0].go;e.choices[0].go=s=>{const r=g0(s);s.rel=null;return r};
   const g1=e.choices[1].go;e.choices[1].go=s=>{const r=g1(s);s.f.noMarryUntil=s.t+18;if(s.rel){s.rel.asks++;s.rel.score-=12;if(s.rel.asks>=2||s.rel.score<30)return r+relEnd(s,'wait').text}return r};return e}})();

const WAGE={"1973": 2254, "1974": 3078, "1975": 3637, "1976": 4267, "1977": 5069, "1978": 5632, "1979": 6728, "1980": 8843, "1981": 10677, "1982": 11473, "1983": 12122, "1984": 13410, "1985": 13981, "1986": 15119, "1987": 16497, "1988": 18400, "1989": 21247, "1990": 24315, "1991": 26875, "1992": 29436, "1993": 31689, "1994": 33637, "1995": 35355, "1996": 36655, "1997": 38435, "1998": 39603, "1999": 40781, "2000": 41831, "2001": 41952, "2002": 41533, "2003": 42068, "2004": 42684, "2005": 43162, "2006": 43492, "2007": 44411, "2008": 44419, "2009": 42300, "2010": 44647, "2011": 45963, "2012": 46075, "2013": 46087, "2014": 47744, "2015": 48956, "2016": 49257, "2017": 50634, "2018": 52468, "2019": 53551, "2020": 54278, "2021": 56127, "2022": 58042, "2023": 58420, "2024": 61002, "2025": 63383};
const HPR_C={"台北市": 1.54, "台北縣": 1.3, "基隆市": 0.61, "桃園縣": 0.86, "新竹市": 0.89, "新竹縣": 0.99, "苗栗縣": 0.82, "台中市": 1.2, "台中縣": 1.2, "彰化縣": 0.89, "南投縣": 0.93, "雲林縣": 0.74, "嘉義縣": 0.7, "嘉義市": 0.77, "台南縣": 0.96, "台南市": 0.96, "高雄縣": 0.97, "高雄市": 0.97, "屏東縣": 0.73, "宜蘭縣": 0.88, "花蓮縣": 0.9, "台東縣": 0.8, "澎湖縣": 0.86, "金門縣": 0.85, "連江縣": 0.8};
