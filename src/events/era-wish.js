/* ================= era wishes: 「你想不想…？」 asked first, then the era decides =================
   Picking 想 can be blocked by that year's conditions; a block is written lightly in the diary and logged with eraLog for the end screen.
   Picking 不想 is the character's own decision and is not logged. */
const WISH_STUDY=['考高中','讀高職','讀五專'];
const poorHome=s=>s.inc==='低'||s.pjob==='農';
/* 國中畢業: a poor family before 1976 may need the child at work, whatever the child wanted */
{const dc5=doChoice;doChoice=function(s,e,c){
  if(e.id==='m15'&&WISH_STUDY.includes(c.label)&&s.by<=1975&&poorHome(s)&&!s.f.m15Block&&chance(s.sex==='F'?.5:.2)){s.f.m15Block=1;
    s.edu='國中';s.studying=null;s.job='工廠';s.jobStart=s.t;if(s.sex==='M'){s.needService=true;s.serviceAt=s.t0+19*12}fx(s,{self:-8});key(s,'國中畢業就進工廠');
    const why=pick(['家裡剛生了弟弟','家裡還有三個弟妹要養','爸爸做工傷了腰']),j=pctOf('jh',s.y);
    eraLog(s,'e_m15','沒能繼續讀書。',eraWhyLine(s,`你很想${c.label.replace(/^考/,'讀')}，可是${why}，爸媽要你去工廠上班`+(j!==null&&j<80?`。那一年，國中畢業生有 ${100-j}% 沒有繼續升學`:'')),3);
    return {text:`雖然我很想${c.label.replace(/^考/,'讀')}，但${why}，爸媽要我去工廠上班。我把書包送給了隔壁的妹妹，她高興了一整個禮拜。`,fail:true,cmp:null}}
  return dc5(s,e,c)}}
/* who asks 想不想結婚 this year: never the same person two years running, only people who are there that year */
const MAR_ASK=[
 {k:'mom',ok:s=>!s.f.momDie&&s.by<=1995,t:['過年回家，媽媽一邊包水餃一邊問：「今年有沒有好消息？」','過年拜拜的時候，媽媽在神明面前小聲說，希望你今年有好消息。']},
 {k:'dad',ok:s=>!s.f.dadDie,t:['吃年夜飯的時候，爸爸喝了兩杯，突然問你：「你到底打算什麼時候結婚？」','爸爸看電視看到一半，說隔壁老王上個月又去喝了一次喜酒。']},
 {k:'aunt',ok:s=>true,t:['過年回家，阿姨夾了一塊雞肉給你，順便問：「什麼時候要結婚？」','大姑姑一進門，還沒坐下就問你有沒有對象。']},
 {k:'grand',ok:s=>s.age<=32&&s.by<=1985&&!abroad(s),t:['阿嬤拉著你的手說，她想在走之前看到你結婚。她已經這樣說了五年。']},
 {k:'match',ok:s=>s.y<1995&&!abroad(s)&&!sxSame(s),t:['巷口的媒人婆又來家裡泡茶，手上拿著一疊照片。']},
 {k:'neighbor',ok:s=>!s.urban&&!abroad(s),t:['鄰居阿伯在廟口看到你，大聲問：「啊你是要等到幾歲才娶／嫁？」整個廟口都聽到了。']},
 {k:'cowork',ok:s=>working(s)&&!['自營','農'].includes(s.job),t:['尾牙的時候，主管拿著酒杯走過來，問你怎麼還不結婚。','同事的喜帖放在你桌上，旁邊貼了一張便條：「下一個就是你了。」']},
 {k:'friend',ok:s=>true,t:['朋友又寄喜帖來了，這是今年第三張。','你在朋友的婚禮上被安排坐在「單身桌」，旁邊的人也一直在剝花生。']},
 {k:'group',ok:s=>s.y>=2012,t:['家族 LINE 群組裡，表姊貼了她的婚紗照，下面有人標了你：「換你了喔。」']},
 {k:'fortune',ok:s=>!abroad(s),t:['媽媽帶你去廟裡求籤，籤詩說你的正緣「近在眼前」。你看了一下眼前，是一個香爐。']},
 {k:'self',ok:s=>true,t:['過年一個人在家，你滑到朋友的婚紗照。','你在除夕夜想了一下今年。']}];
function marryAsker(s){const L=MAR_ASK.filter(a=>a.ok(s)&&a.k!==s.f.wMarLast&&!(a.k==='fortune'&&s.f.momDie));const a=pick(L);s.f.wMarLast=a.k;
  return pick(a.t).replace('娶／嫁',s.sex==='M'?'娶':'嫁')}
const WISH=[
 /* 結婚以後想不想上班: before the early 1990s many firms made women quit on marriage */
 {id:'w_work',choice:1,check:s=>s.married&&!s.f.wWork&&s.t>=s.marriedT+1&&working(s)&&s.age<55,run:s=>{s.f.wWork=1;
   return {cat:'人生',title:'結婚以後',text:'結婚以後，你想不想繼續工作？',choices:[
   {label:'想',go:s=>{if(s.sex==='F'&&s.y<1992&&['公司','工廠','服務'].includes(s.job)&&chance(.35)){s.job='家管';key(s,'結婚以後被要求離職');
       eraLog(s,'e_work','結婚以後，沒能繼續上班。',eraWhyLine(s,'公司說女職員結婚就要離職。那幾年，很多公司都有這條規矩'),2.2);
       return '雖然我很想，但公司規定女職員結婚就要離職。主管笑著說恭喜，還送了我一盒喜餅。'}
     return '我照常上班。喜宴隔天，我把喜糖放在每個同事的桌上。'}},
   {label:'不想',go:s=>{s.job='家管';return '我把工作辭了，在家裡顧家。第一個禮拜，我把整間房子打掃了三遍。'}}]}}},
 /* 想不想要有自己的房子: asked once; 不想 skips the buying decisions, 想 lets them come */
 {id:'w_house',choice:1,check:s=>!s.house&&!s.f.wHouse&&s.age>=(s.by<1968?27:s.by<1978?29:s.by<1988?31:33)&&s.age<=46&&!s.studying,run:s=>{s.f.wHouse=1;
   return {cat:'人生',title:'自己的房子',text:'你想不想要有一間自己的房子？',choices:[
   {label:'想',go:s=>{s.f.wantHouse=1;return '我開始存頭期款。每個月領薪水那天，我先把一筆錢轉進另一個戶頭，假裝它不存在。'}},
   {label:'不想',go:s=>{s.f.noHouse=1;return '我決定不買房。房東人不錯，過年還會送我一盒鳳梨酥。'}}]}}},
 /* 想不想結婚: every year at 過年 while single, asked by yourself or a relative */
 {id:'w_marry',choice:1,check:s=>!s.married&&!s.f.divorced&&s.age>=25&&s.age<=40&&s.m===2&&!(s.y-s.f.wMarY<4)&&(s.f.wMarN||0)<4&&!s.studying,run:s=>{s.f.wMarY=s.y;s.f.wMarN=(s.f.wMarN||0)+1;
   const ask=marryAsker(s);
   return {cat:'人生',title:'想不想結婚',text:`${ask}你想不想結婚？`,choices:[
   {label:'想',go:s=>{const pt=partnerOf(s);
     if(pt&&pt.sex===s.sex&&typeof sxWait==='function'&&sxWait(s,pt)){s.f.noMarryUntil=Math.max(s.f.noMarryUntil||0,s.t+12);
       eraLog(s,'e_sxmar',`沒能早一點跟${nm(pt)}結婚。`,eraWhyLine(s,'那時候，法律還不讓兩個同性的人結婚'),2.5);
       return `雖然我們很想，但法律上還不能結婚。我們先在朋友面前辦了一桌，${nm(pt)}喝到把敬酒詞說反了。`}
     if(pt&&hardY(s.y)&&['公司','工廠','科技','服務','營造'].includes(s.job)&&chance(.35)){s.f.noMarryUntil=Math.max(s.f.noMarryUntil||0,s.t+12);
       eraLog(s,'e_hardmar','沒能在想結婚的那一年結婚。',eraWhyLine(s,unempAt(s.y)+`，你跟${nm(pt)}的工作都不穩`),1.5);
       return `雖然我們很想，但那一年景氣很差，兩個人的工作都不穩。喜宴的錢，先拿去繳房租。`}
     s.f.wantMarY=s.y;return pt?`我開始認真想跟${nm(pt)}的以後。`:'我開始認真想這件事，連朋友介紹的飯局都答應了。'}},
   {label:'還不想',go:s=>{s.f.noMarryUntil=Math.max(s.f.noMarryUntil||0,s.t+10);return pick(['我說還不想。阿姨嘆了一口氣，又夾了一塊雞肉給我。','我還不想。一個人過年也滿好的，電視遙控器都是我的。','我說工作比較重要，然後趕快去廚房幫忙洗碗。'])}}]}}},
 /* 想不想出國玩: before 1979 ordinary people could not travel abroad */
 {id:'w_trip',choice:1,check:s=>!s.f.wTrip&&s.age>=(s.y<1979?15:18)&&s.age<=30&&!abroad(s)&&chance(.01),run:s=>{s.f.wTrip=1;
   return {cat:'生活',title:'出國',text:'你想不想出國玩一趟？',choices:[
   {label:'想',go:s=>{if(s.y<1979){eraLog(s,'e_trip','年輕的時候，沒能出國玩。',eraWhyLine(s,'那時候一般人還不能出國觀光'),1);
       return '雖然我很想，但那時候一般人還不能出國觀光。我搭公車去松山機場，看了一下午的飛機。'}
     if(s.money<30)return '我想去，可是算了算存款，還是先不要。';
     key(s,'第一次出國玩');sat(s,'trip','年輕的時候，出國玩過。',s.y<1990?'第一次搭飛機出國':null,.8);
     return s.y<1990?'我跟旅行團去了日本。導遊一路揮著小旗子，我在免稅店買了一台隨身聽。':'我跟朋友去了一趟日本，一天走三萬步，回來腿痠了一個禮拜。'}},
   {label:'不想',go:s=>'我覺得出國很麻煩，台灣就很好玩了。'}]}}},
 /* 外省: going back to the family hometown in China was closed until 1987-11 */
 {id:'w_home',choice:1,check:s=>s.eth==='外省'&&!s.f.wHome&&s.age>=15&&s.y<1987&&chance(.01),run:s=>{s.f.wHome=1;
   return {cat:'家庭',title:'老家',text:'爸爸又在講他小時候的老家。你想不想去那裡看看？',choices:[
   {label:'想',go:s=>{eraLog(s,'e_home','沒能在年輕的時候，回去看看爸爸的老家。',eraWhyLine(s,'那時候還不能去大陸'),1.5);
     return '雖然我很想，但那時候還不能去。爸爸寫了一封信，託朋友從香港轉寄，信封上的地址，他寫了三次才寫對。'}},
   {label:'不想',go:s=>'那是爸爸的老家，不是我的。我還是比較想去墾丁。'}]}}}];
MS.push(...WISH);
/* 想 or 不想 decides the later steps */
{const H=MS.find(x=>x.id==='house'),hc=H.check;H.check=s=>!s.f.noHouse&&!!s.f.wHouse&&hc(s)}
{const M=MS.find(x=>x.id==='marry'),mc=M.check;M.check=s=>mc(s)||(s.f.wantMarY===s.y&&mc(s))}
{const cf=ctxFor;ctxFor=function(s,id){
  if(id==='w_work'){if(s.sex==='F'&&s.y<1990)return {text:'身邊的女同事，結婚以後大多辭職回家了',norm:['不想']};return {text:s.sex==='M'?'身邊的男人結婚以後都照常上班':'身邊的朋友結婚以後，大多還在上班',norm:['想']}}
  if(id==='w_house'){if(s.y<1995)return {text:'爸媽常說「有土斯有財」',norm:['想']};if(s.y>=2012&&inTaipei(s))return {text:'身邊的同齡人很多都說，買房這輩子不用想了',norm:['不想']};return {text:'身邊的朋友陸續在看房子',norm:['想']}}
  if(id==='w_marry'){if(s.by<=1980)return {text:'這個年紀還沒結婚，親戚都會問',norm:['想']};return {text:'身邊很多朋友都還沒結婚',norm:[]}}
  if(id==='w_trip')return s.y<1979?{text:'身邊沒有人出過國',norm:['不想']}:{text:'身邊的朋友都出國玩過了',norm:['想']};
  if(id==='w_home')return {text:'爸爸常說，有一天要帶你回去',norm:['想']};
  return cf(s,id)}}
Object.assign(LEAN,{'w_work:想':{self:.5,open:.5},'w_work:不想':{self:-.7,open:-.7},'w_house:想':{risk:-.5},'w_house:不想':{risk:.3,open:.5},
 'w_marry:想':{open:-.5,self:-.5},'w_marry:還不想':{self:.7,open:.5},'w_trip:想':{risk:.7,open:.7},'w_trip:不想':{risk:-.7},'w_home:想':{self:-.5},'w_home:不想':{self:.7}});
Object.assign(PULL,{'w_work:想':s=>s.sex==='M'?8:2,'w_work:不想':s=>s.sex==='M'?.1:s.by<1970?.6:.25,'w_house:想':s=>s.by<1980?10:7,'w_house:不想':s=>.3,
 'w_marry:想':s=>(1+Math.max(0,s.age-26)*.3)*(s.by<1980?1.8:1),'w_marry:還不想':s=>s.age<28?1.2:.7,'w_trip:想':s=>1.5});
