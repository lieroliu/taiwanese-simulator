/* ================= life milestones (some with choices) ================= */
const examHS=y=>y<=2000?'高中聯考':y<=2013?'基測':'會考';
const examU=y=>y<=2001?'大學聯考':'學測';
function uniRate(y){return y<1975?.25:y<1985?.3:y<1990?.38:y<1995?.45:y<2000?.6:y<2002?.65:y<2008?.85:.95}
function serviceLen(by){return by<=1981?[24,'兩年']:by<=1993?[18,'一年多']:by<=2004?[4,'四個月']:[12,'一年']}
function setNeedJob(s){s.studying=null;s.needJob=true;if(s.sex==='M'&&!s.f.served)s.needService=true}

const CLS_HI=65,CLS_LO=45;
const MS=[
 {id:'grand4',check:s=>s.fam==='隔代教養'&&s.age>=4&&!s.f.grand4,run:s=>{s.f.grand4=1;return {cat:'家庭',text:`爸媽去外地工作，我跟${elders(s)}住。一年只有過年的時候，才見得到爸媽。`}}},
 {id:'sick4',check:s=>s.fam==='家人久病'&&s.age>=6&&!s.f.sick4,run:s=>{s.f.sick4=1;fx(s,{self:-6});return {cat:'家庭',text:'家裡那位長年臥病的家人，需要有人輪流照顧。我很早就學會了換尿布、餵飯，也學會了不要吵。'}}},
 {id:'school7',check:s=>!s.f.school7&&((s.m===9&&s.t-s.t0>=72)||s.age>=8),run:s=>{s.f.school7=1;s.edu='國小';let t;
   const nonMand=['閩南','客家','原住民'].includes(s.eth);
   if(s.by<=1980&&nonMand){t=`我上小學了。學校規定只能講國語，講${langOf(s)}會被罰錢、掛狗牌。我很快學會在學校閉嘴。`;fx(s,{pride:-8,rebel:-3})}
   else if(s.by<=1980&&s.eth==='外省')t='我上小學了。我國語講得標準，常被老師叫上台朗讀。';
   else if(s.by<=1995)t='我上小學了。學校還是要大家講國語，但已經沒有人掛狗牌了。';
   else if(s.eth==='新住民子女'){t='我上小學了。媽媽來參加家長會的時候，有同學偷偷學她的口音。';fx(s,{pride:-5})}
   else if(nonMand)t=`我上小學了。學校每週有一節${langOf(s)}課，可是我在家其實也很少講了。`;
   else t='我上小學了。';
   if(s.fam==='隔代教養')t+=`開學那天，是${elders(s).slice(-2)}牽我去的。`;
   return {cat:'人生',text:t}}},
 {id:'after10',choice:1,check:s=>s.age>=10&&!s.f.after10,run:s=>{s.f.after10=1;return {cat:'人生',title:'放學以後',text:'十歲了。放學以後，我通常去哪裡？',choices:[
   {label:'去補習班',if:s.money>=35||s.y>=1985,go:s=>{fx(s,{study:12,rebel:-2,lonely:3});return '我每天放學後坐在補習班裡，寫不完的考卷，背不完的公式。'}},
   {label:'回家幫忙',if:['農','小生意','工'].includes(s.pjob),go:s=>{fx(s,{self:-8,study:-4,risk:-2});return s.pjob==='農'?'放學後我要去田裡幫忙，作業常常在燈下寫到很晚。':s.pjob==='小生意'?'放學後我在店裡顧攤、找錢，學會了看大人的臉色。':'放學後我要照顧弟妹、煮飯，等爸媽下工回家。'}},
   {label:'學才藝',if:s.money>=55&&s.y>=1975,go:s=>{fx(s,{open:4,study:4});return '我學了鋼琴，每週被載去老師家上課。我不確定自己喜不喜歡。'}},
   {label:'跟朋友到處玩',go:s=>{fx(s,{risk:6,lonely:-8,study:-4});return s.y<1985?'我跟巷子裡的孩子玩到天黑，打彈珠、抓蟋蟀，在大排水溝旁邊冒險。':s.y<2005?'我放學後跟同學去柑仔店抽籤、打電動，直到媽媽出來找人。':'我跟同學在公園玩，回家以後玩手機遊戲玩到睡覺。'}}]}}},
 {id:'class13',check:s=>!s.f.class13&&((s.m===9&&s.t-s.t0>=144)||s.age>=14),run:s=>{s.f.class13=1;s.edu='國中';if(s.by>1995)return {cat:'人生',text:'我上國中了。補習班的傳單塞滿了書包。'};const sc=s.study+(s.inc==='高'?3:0)+(R()+R()-1)*12;
  if(sc>=CLS_HI){fx(s,{study:5,rebel:-3});s.f.good=1;s.f.cls='升學班';return {cat:'人生',text:'國中分了班，我被分進升學班。每天考試、每天挨打，老師說這是為我好。'}}
  if(sc<CLS_LO){fx(s,{study:-5,rebel:5,risk:3});s.f.cow=1;s.f.cls='放牛班';return {cat:'人生',text:'國中分了班，我被分進「放牛班」。老師不太管我們，大家都知道自己考不上好學校。'}}
  s.f.cls='普通班';return {cat:'人生',text:pick(['國中分了班，我在普通班。前段班的教室在樓上，老師講到他們，聲音都不一樣。','國中分了班，我在普通班。考得好可以轉去前段班，考不好也不會被趕去後段，我就一直待在中間。'])}}},
 {id:'m15',choice:1,check:s=>s.age>=15&&s.m>=6&&!s.f.m15,run:s=>{s.f.m15=1;const ex=examHS(s.y);
   const poorGirl=s.sex==='F'&&s.by<=1975&&(s.inc==='低'||s.pjob==='農');
   let t=`國中畢業了，${ex}也考完了。接下來要往哪裡走？`;if(poorGirl)t+='家裡希望我早點去工作，讓家裡的男孩繼續讀書。';
   return {cat:'人生',title:'國中畢業',text:t,choices:[
   {label:'考高中',go:s=>{const p=clamp(.15+s.study/100*.8+(s.y>=2001?.15:0)+(s.y>=2014?.1:0),.1,.95);if(chance(p)){s.edu='高中';s.studying='高中';s.studyEnd=s.t+36;return '我考上了高中'+(s.study>78?'，而且是第一志願。':'。')}s.edu='高職';s.studying='高職';s.studyEnd=s.t+36;return '可是聯考差了幾分，我沒考上高中，只好去讀高職。'+failFx(s)}},
   {label:'讀高職',go:s=>{fx(s,{risk:-2});s.edu='高職';s.studying='高職';s.studyEnd=s.t+36;return '我去讀了高職，想早點學一技之長。'}},
   {label:'讀五專',if:s.y>=1966,go:s=>{s.edu='五專';s.studying='五專';s.studyEnd=s.t+60;return '我考上了五專，五年後就能出來工作。'}},
   {label:'去工作',if:s.by<=1980||s.money<30,go:s=>{s.edu='國中';s.job='工廠';s.jobStart=s.t;if(s.sex==='M'){s.needService=true;s.serviceAt=s.t0+19*12}
     if(poorGirl){fx(s,{self:-10});key(s,'國中畢業就進工廠，薪水寄回家');return regionOf(s.place)==='南'?'我沒有繼續升學，進了加工出口區的電子工廠。薪水一半寄回家，供弟弟讀書。':'我沒有繼續升學，進了紡織廠當女工。薪水一半寄回家，供弟弟讀書。'}
     key(s,'國中畢業就去工作');return '我沒有繼續升學，去當學徒、進工廠，十五歲就開始領薪水。'}}]}}},
 {id:'uni',choice:1,check:s=>s.studying==='高中'&&s.t>=s.studyEnd,run:s=>{s.studying=null;return {cat:'人生',title:examU(s.y),text:`高中畢業了。${examU(s.y)}我要考嗎？`,choices:[
   {label:'考大學',go:s=>{const p=clamp(uniRate(s.y)*(.7+s.study/100),.05,.98);if(chance(p)){s.pend='major';fx(s,{eng:5});return '我考上了大學。'+(uniRate(s.y)<.5?'那年的錄取率不到一半，家裡放了鞭炮。':'')}s.pend='retake';return '可是'+uniFailWhy(s)+'，我落榜了。'+failFx(s)}},
   {label:'直接去工作',go:s=>{s.edu='高中';setNeedJob(s);return '我決定不考了，早點出社會賺錢。'}}]}}},
 {id:'retake',choice:1,check:s=>s.pend==='retake',run:s=>{s.pend=null;return {cat:'人生',title:'落榜之後',text:'大學沒考上。要重考一年嗎？',choices:[
   {label:'重考一年',go:s=>{s.studying='重考';s.studyEnd=s.t+11;fx(s,{study:8,lonely:6});return regionOf(s.place)==='北'?'我去南陽街的補習班報到，重考一年。':'我北上，在南陽街的補習班重考了一年，住在四坪大的雅房裡。'}},
   {label:'去工作',go:s=>{s.edu='高中';setNeedJob(s);return '我決定不考了，先去找工作。'}}]}}},
 {id:'retake2',check:s=>s.studying==='重考'&&s.t>=s.studyEnd,run:s=>{const p=clamp(uniRate(s.y)*(.7+s.study/100),.05,.98);if(chance(p)){s.studying=null;s.pend='major';return {cat:'人生',text:'放榜了，這次我考上了大學。'}}s.edu='高中';setNeedJob(s);return {cat:'人生',text:'放榜了，我又落榜了。我決定不再考了。'}}},
 {id:'major',choice:1,check:s=>s.pend==='major',run:s=>{s.pend=null;const go=(m,o,t)=>s=>{s.major=m;fx(s,o);s.edu='大學';s.studying='大學';s.studyEnd=s.t+48;if(!['北','away'].includes(regionOf(s.place))&&m!=='師範')s.pend='uniloc';key(s,`考上大學，讀${m}`);return t};
   return {cat:'人生',title:'選科系',text:'考上大學了，要選科系。我要讀什麼？',choices:[
   {label:'理工',go:go('理工',{risk:2},'我選了理工科，每天跟微積分和實驗報告奮戰。')},
   {label:'商管',go:go('商管',{},'我選了商管科系，大家都說以後比較好找工作。')},
   {label:'文法',go:go('文法',{open:4,eng:5},'我選了文法科系，第一次讀到課本以外的台灣歷史。')},
   {label:'醫護',if:s.study>=65,go:go('醫護',{self:-3},'我選了醫護科系，課業重得讓我喘不過氣。')},
   {label:'師範',if:s.study>=50,go:go('師範',{risk:-6},'我讀了師範，畢業後就有教職。爸媽很放心。')}]}}},
 {id:'uniloc',choice:1,check:s=>s.pend==='uniloc',run:s=>{s.pend=null;return {cat:'人生',title:'去哪裡讀書',text:'台北的學校和家鄉附近的學校都可以選。我要去哪裡？',choices:[
   {label:'北上讀書',go:s=>{s.place='台北市';fx(s,{self:6,risk:5,lonely:6,open:3});return '我拖著行李搭上北上的火車。第一次一個人住在台北的雅房，晚上聽得到隔壁的電視聲。'}},
   {label:'留在家鄉附近',go:s=>{fx(s,{self:-5,risk:-3});return '我選了離家近的學校，週末還能回家吃飯。'}}]}}},
 {id:'grad',check:s=>['大學','高職','五專'].includes(s.studying)&&s.t>=s.studyEnd,run:s=>{const d=s.studying;setNeedJob(s);return {cat:'人生',text:d==='大學'?'我大學畢業了。穿著學士服拍照的那天，爸媽特地從家裡趕來。':`我${d}畢業了。`}}},
 {id:'service',check:s=>s.needService&&!s.studying&&(!s.serviceAt||s.t>=s.serviceAt),run:s=>{s.needService=false;s.f.served=1;if(chance(.05)){s.f.exempt=1;return {cat:'人生',text:'我因為體位不合格，免服兵役。'}}
   const [mo,lbl]=serviceLen(s.by);s.inServiceUntil=s.t+mo;fx(s,{rebel:-3,lonely:3});let t=`我入伍當兵，要當${lbl}。`;
   if(chance(s.by<=1993?.15:.05)){t+=`我抽到了「金馬獎」，被分發到${pick(['金門','馬祖'])}，一年只能回台灣幾次。`;fx(s,{lonely:5})}
   else t+=mo<=4?'學長們都說我們是「草莓兵」。':'在新訓中心，我學會了服從，也學會了怎麼偷懶。';return {cat:'人生',text:t}}},
 {id:'loc',choice:1,check:s=>s.needJob&&!s.f.locDone&&s.t>=s.inServiceUntil&&!s.needService&&(regionOf(s.place)!=='北'||(s.by>=1985&&s.edu==='大學')),run:s=>{s.f.locDone=1;const north=regionOf(s.place)==='北';
   return {cat:'人生',title:'要去哪裡',text:'要開始工作了。我要留在哪裡？',choices:[
   {label:north?'留在台北':'留在家鄉',go:s=>{fx(s,{self:-5,risk:-3});return north?'我留在台北，跟大多數同學一樣。':'我留在家鄉，離爸媽近一點。'}},
   {label:'北上打拼',if:!north,go:s=>{s.place=pick(['台北市','台北縣','台北縣']);fx(s,{self:5,risk:6,lonely:8});key(s,'北上工作');return '我一個人北上，租了一間小雅房。每次過年回家，都覺得家鄉變小了一點。'}},
   {label:'先出國打工度假',if:s.by>=1985&&s.edu==='大學'&&s.age<=30,go:s=>{s.whUntil=s.t+12;fx(s,{risk:8,open:6,lonely:-3});key(s,'出國打工度假一年');return '我去澳洲打工度假一年，在農場摘草莓、在肉廠切肉。回來的時候，我覺得自己不太一樣了。'}}]}}},
 {id:'job',choice:1,check:s=>s.needJob&&s.t>=s.inServiceUntil&&!s.needService&&(s.f.locDone||!(regionOf(s.place)!=='北'||(s.by>=1985&&s.edu==='大學')))&&(!s.whUntil||s.t>=s.whUntil),run:s=>{s.needJob=false;
   const uni=s.edu==='大學', mid=['高中','五專','大學'].includes(s.edu);
   const set=(j,o,t)=>s=>{s.job=j;s.jobStart=s.t;fx(s,o);if(j==='公教')s.f.wasGJ=1;let tx=t;if(uni&&s.y>=2009&&s.y<=2013&&['公司','服務'].includes(j)){fx(s,{money:-5});tx+='起薪兩萬二，扣掉房租，所剩不多。'}return tx};
   const opts=[
    {label:'去學校教書',if:s.major==='師範',go:set('公教',{risk:-4},'我分發到一所國中教書，一教就是好多年。')},
    {label:'考公職',if:mid&&s.major!=='師範',go:s=>{if(chance(clamp(.25+s.study/150,.1,.75)))return set('公教',{risk:-8},'我考上了公務員。爸媽說，這是一輩子的鐵飯碗。')(s);return set(uni?'公司':'工廠',{},'可是公職的錄取率太低，我沒考上，先進了'+(uni?'一間公司':'工廠')+'上班。')(s)}},
    {label:'進科學園區',if:uni&&s.major==='理工'&&s.y>=1985,go:set('科技',{risk:2},'我進了科學園區當工程師。薪水不錯，但常常加班到半夜。')},
    {label:'去醫院工作',if:s.major==='醫護',go:set('醫護',{self:-3},'我進了醫院工作，輪班讓我的日夜顛倒。')},
    {label:'進公司上班',if:mid,go:set('公司',{},'我進了一間公司當職員，每天打卡上下班。')},
    {label:'進工廠',go:set('工廠',{},'我進了工廠，跟著師傅學。')},
    {label:'做小生意',go:set('自營',{risk:8},s.y<1995?'我跟親戚借了錢，在市場擺攤做小生意。':'我開了一間小店，每天早上六點開門。')},
    {label:'回家幫忙種田',if:s.pjob==='農',go:s=>{s.place=s.birthCounty;return set('農',{self:-8,risk:-5},'我回家幫忙種田。同學們都在都市，我在田裡。')(s)}},
    {label:'去中國當台幹',if:s.y>=1992&&s.y<=2015&&mid&&s.age>=20,go:s=>{s.place='中國';key(s,'到中國當台幹');return set('台幹',{risk:10,self:5,lonely:8},`我去了${pick(['東莞','昆山','蘇州','深圳'])}的台商工廠當幹部。薪水比台灣高，但一年只能回家幾次。`)(s)}}];
   return {cat:'人生',title:'第一份工作',text:'要出社會了。我要找什麼樣的工作？',choices:opts}}},
 {id:'chinaBack',check:s=>(s.job==='台幹'&&(s.age>=48||(s.y>=2016&&chance(.02))))||(s.place==='中國'&&s.job!=='台幹'),run:s=>{s.place=s.birthCounty;if(s.job==='台幹')s.job=pick(['公司','自營']);fx(s,{lonely:5});return {cat:'人生',text:'我結束了在中國的工作，回到台灣。家鄉的街景變了很多，我像個外地人。'}}},
 {id:'foreignwife',choice:1,check:s=>s.sex==='M'&&!s.married&&!s.rel&&!s.f.fw&&s.age>=30&&s.age<=45&&s.y>=1995&&s.y<=2010&&(!s.urban||s.money<35)&&chance(.01),run:s=>{s.f.fw=1;return {cat:'人生',title:'介紹對象',text:'親戚說可以透過仲介，幫我介紹越南或印尼的對象。我要見面嗎？',choices:[
   {label:'見面，然後結婚',go:s=>{s.married=true;s.marriedT=s.t;s.f.fwife=1;fx(s,{lonely:-12,self:-5});key(s,'和外籍配偶結婚');return '我們見了幾次面就結婚了。她一開始不太會說中文，我也慢慢學了幾句她的話。'}},
   {label:'不要',go:s=>'我拒絕了。我想再等等看。'}]}}},
 {id:'marry',choice:1,check:s=>!s.married&&!s.f.divorced&&s.age>=23&&s.age<=46&&s.t>=(s.f.noMarryUntil||0)&&!s.studying&&chance(.012*(s.by<=1975?1.5:1.5)*(1+(50-s.lonely)/100)),run:s=>{
   const press=s.age>=28&&s.by<=1980;
   return {cat:'人生',title:'結婚',text:`我遇到了一個想一起生活的人。${press?'家裡一直在催。':''}要結婚嗎？`,choices:[
   {label:'結婚',go:s=>{s.married=true;s.marriedT=s.t;fx(s,{lonely:-15,self:-5});key(s,'結婚');return s.y<1995?'我們在餐廳辦了幾十桌喜酒，親戚朋友都來了。':'我們拍了婚紗，辦了一場不大的婚禮。'}},
   {label:'先不要',go:s=>{s.f.noMarryUntil=s.t+36;fx(s,{self:4,open:3});return press?'我說還不想結。爸媽嘆了口氣，親戚開始在過年的時候問我。':'我覺得現在還不是時候。'}}]}}},
 {id:'kid',choice:1,check:s=>s.married&&!s.f.noKids&&s.kids+(s.babyDue?1:0)<(s.by<1972?3:2)&&!s.babyDue&&s.age<=42&&s.t>=s.marriedT+12+(s.kids?24:0)&&s.t>=(s.f.kidAsk||0),run:s=>{
   const first=!s.kids;let t=first?'結婚一陣子了。要生小孩嗎？':`我們已經有${s.kids===1?'一':s.kids===2?'兩':'三'}個孩子了。要再生一個嗎？`;
   if(first&&s.by<=1975&&s.sex==='F')t='結婚一陣子了，長輩一直問我什麼時候生。要生小孩嗎？';
   return {cat:'人生',title:first?'生小孩':s.kids===1?'第二個孩子':'再生一個',text:t,choices:[
   {label:first?'生':'再生一個',go:s=>{const p=s.age<30?.9:s.age<35?.8:.55;if(chance(p)){s.babyDue=s.t+10;const sp=spouse(s);return s.sex==='F'?(s.kids?'我們決定再要一個。':'我們決定要一個孩子。')+'幾個月後，我發現自己懷孕了。':(s.kids?'我們決定再要一個。':'我們決定要一個孩子。')+`幾個月後，${sp?nm(sp):'太太'}懷孕了。`}s.f.kidTry=(s.f.kidTry||0)+1;s.f.kidAsk=s.t+24;if(s.f.kidTry>=2){s.f.noKids=1;return '我們又試了好幾年，孩子還是沒有來。後來，我們就不再試了。'}return '我們試了很久，孩子一直沒有來。'}},
   {label:first?'先不要':s.kids===1?'一個就好':'兩個就好',go:s=>{if(first){s.f.kidNo=(s.f.kidNo||0)+1;s.f.kidAsk=s.t+36;if(s.age>=38||s.f.kidNo>=2){s.f.noKids=1;return '我們又等了幾年，後來就沒有再提這件事了。'}return '我們想再等等。'}s.f.noKids=1;return s.kids===1?'我們決定一個就好。':'我們決定兩個就好。'}},
   {label:'不生',if:first&&s.by>=1975,go:s=>{s.f.noKids=1;fx(s,{self:5,open:3});return '我們決定不生小孩。這個決定，我們跟家裡解釋了好多次。'}}]}}},
 {id:'birth',check:s=>s.babyDue&&s.t>=s.babyDue,run:s=>{s.babyDue=0;s.kids++;s.kidBorn.push(s.t);fx(s,{lonely:-6,self:-6,risk:-3});key(s,s.kids===1?'第一個孩子出生':'第二個孩子出生');return {cat:'家庭',text:s.kids===1?(s.sex==='F'?'我的孩子出生了。坐月子的那一個月，麻油雞吃到怕，半夜每三個小時就要起來餵一次奶。抱著那個小小的身體，我第一次覺得自己真的是大人了。':`我的孩子出生了。我在產房外面走來走去，${spouse(s)?nm(spouse(s)):'太太'}被推出來的時候，臉白得像紙。抱著那個小小的身體，我第一次覺得自己真的是大人了。`):'第二個孩子出生了。家裡變得更擠，也更吵了。'}}},
 {id:'house',choice:1,check:s=>!s.house&&s.age>=(s.f.houseAgain||(s.by<1968?28:s.by<1978?30:s.by<1988?32:34))&&s.age<=48&&working(s)&&!s.f.houseAsk2,run:s=>{if(s.f.houseAgain)s.f.houseAsk2=1;else s.f.houseAgain=40;
   const pf=s.y<1988?1:s.y<2000?1.6:s.y<2010?1.5:2.4, tp=inTaipei(s)?1.6:1, burden=pf*tp, cant=s.money<30&&burden>2;
   return {cat:'人生',title:'買房',text:burden>2.5?'房價已經漲到我薪水的十幾倍。要買房嗎？':'要買房嗎？',choices:[
   {label:cant?'買（貸三十年）':'買',go:s=>{s.house='own';s.mortgageEnd=s.t+(cant?360:240);fx(s,{money:-8,risk:-3});key(s,'買了房子');return burden>2.5?'我背了三十年的房貸，買了一間不大的房子。從此每個月的薪水，一半是銀行的。':'我們買了房子。拿到鑰匙那天，我在空蕩蕩的客廳裡坐了很久。'}},
   {label:'繼續租',go:s=>{s.house=s.f.houseAsk2?'rent':null;fx(s,{risk:2});return burden>2.5?'我算了算，這輩子大概買不起。我決定繼續租，把錢花在現在的生活上。':'我決定再租一陣子。'}},
   {label:'住家裡',if:s.place===s.birthCounty,go:s=>{s.house='family';fx(s,{self:-4});return '我跟家人住在老家，省下房租，也多了很多摩擦。'}}]}}},
 {id:'layoff',choice:1,check:s=>working(s)&&['公司','工廠','科技','營造','服務'].includes(s.job)&&s.age>=35&&s.age<=58&&chance(.0015*(s.y>=2001&&s.y<=2002||s.y>=2008&&s.y<=2009?3:1)),run:s=>{
   const old=s.job;s.job='失業';fx(s,{money:-10,lonely:6});key(s,'中年失業');
   return {cat:'人生',title:'失業',text:`${s.age} 歲，我被裁員了。接下來怎麼辦？`,choices:[
   {label:'找同樣的工作',go:s=>{if(chance(s.age<45?.7:.4)){s.job=old;return '我投了上百封履歷，終於找到一份差不多的工作，薪水少了一點。'}s.job='服務';fx(s,{money:-5});return '我找了很久都找不到，最後去當保全。'}},
   {label:'轉行',go:s=>{s.job=pick(['服務','公司']);fx(s,{risk:5});return '我去上了職訓課程，轉行重新開始。比我年輕的主管叫我「大哥」或「大姐」。'}},
   {label:'開早餐店',go:s=>{s.job='自營';fx(s,{risk:8,money:-6});return '我拿出積蓄，開了一間早餐店。每天凌晨四點起床煎蛋餅。'}},
   {label:'提早退休',if:s.age>=50,go:s=>{s.job='退休';return '我決定不找了，提早退休。'}}]}}},
 {id:'move',choice:1,check:s=>s.job==='工廠'&&s.y>=1990&&s.y<=1998&&s.age>=22&&!s.f.moved&&chance(.01),run:s=>{s.f.moved=1;return {cat:'生活',title:'工廠外移',text:'工廠要搬去中國了。老闆問我要不要跟過去。',choices:[
   {label:'跟過去',go:s=>{s.job='台幹';s.place='中國';fx(s,{risk:8,lonely:8});key(s,'跟著工廠去中國');return '我跟著工廠去了中國，從作業員變成幹部，管著一整條生產線。'}},
   {label:'留在台灣',go:s=>{s.job=chance(.6)?'工廠':'服務';fx(s,{money:-8});return '我留在台灣，找了另一份工作，薪水少了一些。'}}]}}},
 {id:'parentill',choice:1,check:s=>!s.f.parentill&&!s.f.parentdie&&s.age>=30&&((s.age>=40&&s.age<=62&&chance(.004))||(parAge(s)>=72&&chance(.0006*(parAge(s)-70)))),run:s=>{s.f.parentill=s.t;s.f.illP=dadGone(s)?'媽媽':momGone(s)?'爸爸':pick(['爸爸','媽媽']);return {cat:'家庭',title:'父母病倒',text:`${s.f.illP}中風了，需要有人全天照顧。我要怎麼安排？`,choices:[
   {label:'自己照顧',go:s=>{s.f.caring=1;fx(s,{self:-10,money:-8,lonely:6});if(working(s)&&chance(.4)){s.job='家管';return '我辭掉工作，回家照顧。白天餵飯、翻身，晚上睡不到四個小時。'}return '我下班後就去照顧，週末也是。我已經想不起上次休假是什麼時候。'}},
   {label:'請外籍看護',if:s.y>=1992&&s.money>=30,go:s=>{s.f.caring=1;fx(s,{money:-8});return `我請了一位印尼來的看護。她比我更了解${s.f.illP}的作息，我有時候會覺得愧疚。`}},
   {label:'送安養中心',if:s.money>=40,go:s=>{fx(s,{money:-10,self:4,lonely:3});return `我把${s.f.illP}送進安養中心。每週去看一次，每次離開都不敢回頭。`}}]}}},
 {id:'parentdie',check:s=>!s.f.parentdie&&(!s.f.par1T||s.t>=s.f.par1T+12)&&((s.f.parentill&&s.t>=s.f.parentill+12&&chance(.02))||(parAge(s)>=80&&chance(.0015*(parAge(s)-78)*(s.f.par1T?1.6:1)))||parAge(s)>=99),run:s=>{
   const ill=s.f.parentill&&s.t>=s.f.parentill+12?s.f.illP:null;const who=s.fam==='單親'||s.f.dadDie?'媽媽':s.f.momDie?'爸爸':ill||(chance(.6)?'爸爸':'媽媽');const other=who==='爸爸'?'媽媽':'爸爸';
   const last=s.fam==='單親'||!!s.f.par1T;if(who==='爸爸')s.f.dadDie=1;else s.f.momDie=1;if(ill===who||s.f.illP===who){s.f.caring=0;s.f.parentill=0}fx(s,{lonely:last?6:4});
   if(!last){s.f.par1T=s.t;key(s,who+'過世');
     return {cat:'家庭',text:s.eth==='外省'&&who==='爸爸'?'爸爸過世了。他到最後，都沒能回去葬在老家。':s.eth==='原住民'?`${who}過世了。告別式那天，部落的族人用母語唱了很久的歌。`:`${who}過世了。辦完後事，${other}一個人住在老家，我開始每個禮拜打電話回去。`}}
   s.f.parentdie=1;s.f.caring=0;key(s,'父母過世');
   return {cat:'家庭',text:s.fam==='單親'?'媽媽過世了。她一個人把我帶大，到最後也沒跟我說過一句累。':s.eth==='外省'&&who==='爸爸'?'爸爸也走了。他到最後，都沒能回去葬在老家。':s.eth==='原住民'?`${who}也走了。告別式那天，部落的族人用母語唱了很久的歌。`:`${who}也走了。辦完後事，兄弟姊妹為了分家產吵了一架，有些人從此不再聯絡。`}}},
 {id:'divorce',choice:1,check:s=>s.married&&s.t>=s.marriedT+24&&chance((s.y<1990?.003:s.y<2005?.008:.011)/12*(1+(s.ax.self-50)/100)),run:s=>({cat:'家庭',title:'婚姻',text:'我們的婚姻出了問題，吵架越來越多。要離婚嗎？',choices:[
   {label:'離婚',go:s=>{s.married=false;s.f.divorced=1;fx(s,{lonely:15,open:5,money:-6});key(s,'離婚');return s.y<1995?'我們離婚了。親戚們議論了很久。':'我們離婚了。辦完手續那天，我一個人去吃了一碗麵。'}},
   {label:'撐下去',go:s=>{fx(s,{self:-5,lonely:5});return '我們決定撐下去。'+(s.kids?'為了孩子。':'也許會好起來。')}}]})},
 {id:'retire',choice:1,check:s=>working(s)&&s.age>=((s.job==='公教'&&s.y<2018)?55:60)&&s.t>=(s.f.retireAsk||0),run:s=>{const forced=s.age>=(s.job==='公教'?65:68);
   return {cat:'人生',title:'退休',text:forced?(s.job==='公教'?'我滿 65 歲，屆齡退休了。單位幫我辦了一場歡送會，送了一面匾額。':['自營','農'].includes(s.job)?'我年紀大了，身體做不太動了。':s.job==='醫護'?'我年紀大了，醫院請我退休。':s.job==='工廠'?'我年紀大了，廠裡請我退休。':'我年紀大了，公司請我退休。'):s.job==='公教'&&s.y<2018?'我可以退休了，還有 18% 的優惠存款。要退休嗎？':'我到了可以退休的年紀。要退休嗎？',choices:[
   {label:'退休',go:s=>{s.job='退休';fx(s,{lonely:6});key(s,'退休');return '我退休了。第一個星期，我每天早上還是六點就醒來。'}},
   {label:'繼續工作',if:!forced,go:s=>{s.f.retireAsk=s.t+60;fx(s,{money:3});return s.money<35?'我的存款不夠養老，只能繼續工作。':'我還想再做幾年。'}}]}}},
 {id:'old',choice:1,check:s=>s.age>=76&&!s.f.old,run:s=>{s.f.old=1;return {cat:'人生',title:'晚年',text:'年紀大了，我想住在哪裡？',choices:[
   {label:'跟孩子住',if:s.kids>0,go:s=>{fx(s,{lonely:-10,self:-4});return '我搬去跟孩子住。孫子很吵，我很開心。'}},
   {label:'自己住',go:s=>{fx(s,{lonely:12});s.f.alone=1;return '我一個人住在老房子裡。電視開著，不是為了看，是為了有聲音。'}},
   {label:'住安養中心',if:s.money>=40,go:s=>{fx(s,{lonely:2});return '我住進安養中心，有人陪我下棋、唱卡拉 OK。'}}]}}},
 {id:'grandkid',check:s=>s.kids>0&&s.age>=56&&s.age<=75&&!s.f.gk&&chance(.004),run:s=>{s.f.gk=1;fx(s,{lonely:-8});key(s,'有了孫子');return {cat:'家庭',text:(s.sex==='M'?'我當阿公了。':'我當阿嬤了。')+'抱著孫子，我想起自己的孩子剛出生時的樣子。'}}},
 {id:'spousedie',check:s=>s.married&&s.age>=62&&chance(.0018*Math.exp((s.age-62)*.07)),run:s=>{s.married=false;fx(s,{lonely:20,health:-5});key(s,'伴侶過世');return {cat:'家庭',text:'我的另一半先走了。家裡突然安靜得可怕。'}}},
];

