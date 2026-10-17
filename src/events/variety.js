/* ================= variety: background-specific versions, noticing, personal events ================= */
const isW=s=>s.eth==='外省', isFarm=s=>s.job==='農'||(s.pjob==='農'&&!s.job), isFac=s=>s.job==='工廠'||s.job==='營造'||(s.pjob==='工'&&!s.job),
 isInd=s=>s.eth==='原住民', isHk=s=>s.eth==='客家', isGJ=s=>s.job==='公教'||(s.pjob==='公教'&&!s.job), isStu=s=>isStudent(s)||(s.age>=12&&s.age<18),
 isOld=s=>s.age>=65, isBiz=s=>s.job==='自營'||s.job==='服務'||(s.pjob==='小生意'&&!s.job), isOff=s=>['公司','科技'].includes(s.job), isMed=s=>s.job==='醫護',
 isRich=s=>s.money>65, isVic=s=>s.fam==='受難者家屬', reg=s=>regionOf(s.place);
const VAR={
 un:[[isW,'聽到退出聯合國，爸爸一整晚沒說話。他說，當年離開大陸的時候，沒想到會走到這一步。'],[isFarm,'在田裡聽到收音機說退出聯合國。爸爸說：「聯合國又不會幫我們割稻。」說完又低頭工作。'],[isInd,'教會裡，牧師要大家為國家禱告。我不太懂聯合國是什麼，只知道大人們都很嚴肅。'],[isStu,'學校要我們寫作文，題目是「莊敬自強，處變不驚」。我寫了三百字，每一句都是從報紙抄來的。'],[isGJ,'爸爸從機關回來，說上面交代大家要穩住，不要亂講話。']],
 cks:[[s=>isFac(s)||isFarm(s),'總統過世了。收音機只放哀樂，大家照樣做事，只是一整天都沒人說笑。'],[isStu,'總統過世了，學校要我們排隊去靈堂致敬。隊伍好長，太陽很大，有同學中暑昏倒。'],[isInd,'部落裡也掛起了黑布條。我不認識那個人，但大家都說要難過。'],[isHk,'阿婆小聲說，以前日本天皇的時候也是這樣，大家都要哭。']],
 martial:[[isW,'解嚴了。巷口的伯伯們說，這樣下去國家要亂了。我不知道該不該同意。'],[isFarm,'解嚴了。田裡的事一樣多，爸爸說：「解什麼嚴，稻子還是要割。」'],[isInd,'解嚴了。部落的年輕人開始說要討回土地，長輩們搖頭，說不要惹事。'],[s=>isGJ(s)||isOff(s),'解嚴了。辦公室裡大家假裝沒事，下班後卻在小吃店討論到很晚。'],[isStu,'解嚴了。教官看起來沒那麼兇了，同學開始偷偷傳閱黨外雜誌。'],[isVic,'解嚴了。家裡那位長輩一句話都沒說，只是把收音機關掉。']],
 cck:[[isW,'蔣經國過世了。巷子裡家家戶戶都在哭，爸爸說，這次是真的回不去了。'],[isFarm,'蔣經國過世了。阿公說他是好總統，下鄉的時候還跟農民一起吃飯。'],[isStu,'蔣經國過世了。同學們在走廊上小聲討論，接下來會是誰。'],[isFac,'蔣經國過世了。工廠停工一天，說是要哀悼，我其實只是在家多睡了一天。']],
 missile:[[isW,'飛彈試射的新聞天天播。爸爸說對岸只是在嚇人，可是他晚上都睡不好。'],[isBiz,'飛彈一試射，店裡的生意就少了一半。大家都把錢收起來，不敢花。'],[isFarm,'飛彈的新聞在播，阿公說：「打過來就打過來，田還是要種。」'],[isRich,'同事辦了加拿大移民，問我要不要也去問問看。'],[isStu,'學校要我們演練躲防空洞，大家笑成一團，只有老師一臉嚴肅。']],
 turnover:[[isW,'開票那晚，巷子裡一片安靜。爸爸關掉電視，說：「國家要變了。」'],[s=>isFarm(s)||reg(s)==='南','開票那晚，村子裡放了一整晚的鞭炮。阿公說，他活了這麼久，第一次看到換人做。'],[isGJ,'換總統了。辦公室裡大家表情都很複雜，都在猜上面會不會換一批人。'],[isInd,'換總統了。部落的長輩說，不管誰當總統，我們還是一樣。'],[isStu,'換總統了。班上有人歡呼，有人臭臉，老師叫大家不要在教室裡吵。']],
 quake:[[s=>reg(s)==='北'&&!CENTRAL_921.includes(s.place),'凌晨一點四十七分，我被搖醒，書架上的東西掉了一地。台北有一棟大樓倒了，我們全家睡在客廳，不敢回房間。'],[s=>reg(s)==='南','凌晨一點四十七分，我被搖醒。電視上中部的房子倒成一片，我打了好幾通電話給中部的親戚，都打不通。'],[s=>reg(s)==='東','凌晨一點四十七分，我被搖醒。花東人對地震早就習慣了，但這次不一樣，搖了好久好久。'],[s=>working(s)&&!CENTRAL_921.includes(s.place),'地震後好幾天都在限電，公司輪流放假。大家捐了一天的薪水給災區。'],[s=>isStu(s)&&!CENTRAL_921.includes(s.place),'地震後學校停課了好幾天。後來我們班去中部當志工，搬了一整天的物資。']],
 '319':[[s=>isW(s)||isGJ(s),'投票前一天的槍擊案，我怎麼想都覺得不對勁。選完以後，家裡的人在凱道待了好幾天。'],[s=>isFarm(s)||reg(s)==='南','投票前一天的槍擊案，村子裡的人都說好險人沒事。開票結果出來，大家放了鞭炮。'],[s=>s.age<25,'槍擊案之後，身邊的人分成兩派，吵到大家都不想說話。'],[isOld,'我活了這把年紀，第一次看到選舉選成這樣。']],
 sun:[[isFarm,'台北的學生佔領了立法院。阿伯在廟口說，這些學生不用讀書嗎？我不知道該怎麼回。'],[isBiz,'學生在立法院的那段時間，我店裡的電視整天開著直播。客人邊吃邊吵，我只負責煮麵。'],[isGJ,'主管提醒大家，上班時間不要討論太陽花。LINE 群組裡卻吵得很兇。'],[isOld,'電視上整天都是學生。我想起自己年輕的時候，什麼都不敢說。']],
 covid:[[isMed,'疫情來了，我每天穿著防護衣上班。回家第一件事，是把衣服全部丟進洗衣機。'],[isBiz,'疫情一來，店裡的客人少了一半。我每天照樣開門，看著空空的座位。'],[isStu,'疫情來了，畢業旅行取消了。我們在教室裡隔著透明隔板吃午餐。'],[s=>s.place==='中國','疫情一來，我被困在對岸回不了台灣，隔離了好幾個禮拜。'],[isOff,'公司開始分流上班，我第一次在家工作，穿著睡衣開視訊會議。']],
 elect:[[s=>isW(s)&&s.age>=20,'第一次總統直選，巷子裡的長輩互相提醒要去投票，說一定要投對人。'],[s=>isInd(s)&&s.age>=20,'第一次投總統票，部落的人一起坐車去投票所，投完還在活動中心吃了一頓。'],[s=>isFarm(s)&&s.age>=20,'第一次直選總統，阿公說他這輩子終於可以自己選總統了，投完票笑得很開心。'],[s=>s.age>=20&&s.age<=25,'人生第一次投票就是選總統。我在圈選處猶豫了很久，才蓋下去。']],
 pelosi:[[isBiz,'軍演那幾天，店裡的客人都在聊會不會打仗。聊完照樣點菜。'],[s=>s.age<35,'朋友傳來一份「戰爭來了要準備什麼」的清單。我存了起來，沒有真的去買。'],[s=>isOld(s)&&isW(s),'我看著新聞，想起爸爸說過的逃難故事。'],[s=>s.place==='中國','在對岸的工廠裡，大家都不提軍演的事，但氣氛很怪。']],
 usa:[[isW,'台美斷交那天，爸爸說美國人靠不住，跟日本人一樣。'],[isStu,'學校發起捐款買飛機，同學們把零用錢都捐了，我也捐了一百塊。'],[isFarm,'台美斷交了。阿公說，不管誰跟誰斷交，稻子還是要割。']],
 tsai:[[s=>isOld(s)&&s.sex==='F','阿嬤說，女人當總統，以前想都不敢想。'],[isStu,'班上的女生說，以後她也要當總統，大家都笑了，她沒有笑。']],
 lv3:[[isOff,'三級警戒，公司開始在家上班。我每天穿著睡衣開視訊會議，下半身是短褲。'],[isOld,'三級警戒，我連公園都不能去了，每天只能跟電視說話。'],[s=>s.kids&&s.age<60&&working(s),'三級警戒，孩子在家上課，我一邊工作一邊顧他，快要瘋了。']],
 sars:[[isBiz,'SARS 一來，店裡門可羅雀，我每天坐在店門口發呆。'],[isOld,'孩子們叫我不要出門，我每天在家量好幾次體溫。']],
};
const NOTICE={un:.5,japan:.45,usa:.6,dpp:.45,cck:.75,mobil:.5,'319':.75,red:.55,hung:.5,sun:.65,tsai:.55,ssm:.6,pelosi:.6,turnover:.75,jiangnan:.6,lin:.5,chen:.6,zhongli:.6,lily:.5,formosa:.6,missile:.75,martial:.85,cks:.85,
 dajia:.6,highway:.55,'711':.6,cable:.7,mrt:.7,hsr:.7,phone:.8,weekend:.6,asia:.6,elect:.85,'mobil2':0};
function noticeP(s,e){const b=NOTICE[e.id];if(e.cat==='歷史'){let p=b-.15+s.eng/100*.5+(s.age>=60?.1:0);if(s.age<12)p*=.6;return clamp(p,.15,.97)}return b}

/* personal everyday events */
const PE=[
 {id:'crush',p:s=>s.age>=13&&s.age<=24&&!s.married&&!s.rel&&(s.f.crush||0)<2?.004:0,run:s=>{s.f.crush=(s.f.crush||0)+1;const r=R();if(r<.35)return {tone:'good',cat:'人生',text:'我收到人生第一封情書，夾在課本裡。我假裝不在意，回家卻偷偷看了好幾遍，後來藏了好多年。'};if(r<.7)return {tone:'neutral',cat:'人生',text:'我喜歡上隔壁班的一個人，每天下課都故意經過他們教室，一句話也沒說過。'};fx(s,{lonely:4});return {tone:'bad',cat:'人生',text:'我喜歡的人跟別人在一起了。我在棉被裡哭了一整晚，隔天照樣去上課。'}}},
 {id:'bully',p:s=>s.age>=7&&s.age<=15&&!s.f.bully?(['新住民子女','原住民'].includes(s.eth)||s.money<30?.004:.0015):0,run:s=>{s.f.bully=1;fx(s,{lonely:10,pride:-5});return {tone:'bad',cat:'人生',text:s.eth==='新住民子女'?'班上幾個同學一直學我媽媽的口音，叫我「外籍的」。我開始不想上學，也不想讓媽媽來學校。':s.eth==='原住民'?'班上同學叫我「番仔」，問我是不是住在山上、會不會打獵。我笑著帶過，回家什麼都沒說。':'我被班上的人排擠，午餐都一個人吃。我假裝在看書，其實一個字都沒看進去。'}}},
 {id:'teacher',p:s=>s.age>=8&&s.age<=17&&!s.f.teacher?.002:0,run:s=>{s.f.teacher=1;fx(s,{study:6,lonely:-4});return {tone:'good',cat:'人生',text:'有個老師特別照顧我，說我是可以讀書的料。那是我第一次覺得，自己被人看見了。'}}},
 {id:'parentsfight',p:s=>s.age>=7&&s.age<=17&&s.fam!=='單親'?.0015:0,run:s=>{fx(s,{lonely:4});return {tone:'bad',cat:'家庭',text:s.money<35?'爸媽又為了錢吵架了。我躲在房間裡，把收音機開得很大聲。':'爸媽又吵架了，摔東西的聲音從客廳傳來。我抱著枕頭，等他們吵完。'}}},
 {id:'exam',p:s=>s.age>=14&&s.age<=18&&isStudent(s)?.004:0,run:s=>({tone:'bad',cat:'人生',text:pick(['模擬考考砸了。我在補習班的廁所哭了一下，擦乾眼淚又回去上課。','段考成績單發下來，我把它塞進書包最底層，不敢拿回家。','每天念書念到凌晨一點，早上六點起床。我常常在公車上睡著，坐過站。'])})},
 {id:'typhoonday',p:s=>s.m>=7&&s.m<=9&&s.age>=7&&s.age<=60?.006:0,run:s=>({tone:'good',cat:'生活',text:s.age<23?'放颱風假！我睡到中午，結果下午颱風根本沒來，出太陽了。':'放颱風假。說好要在家休息，結果我還是在家回了一整天的公事。'})},
 {id:'cny',p:s=>s.m===2&&s.age>=6&&s.age<=75?.03:0,run:s=>({tone:'neutral',cat:'家庭',text:s.age<13?'過年回老家圍爐，拿到紅包的第一件事，就是被媽媽「先幫我保管」。':s.age<25?`過年回家，長輩一直問我${isStudent(s)?'成績':'工作'}的事。我只想趕快吃完去找表兄弟姊妹玩。`:s.age<40&&!s.married?'過年回家，親戚一個接一個問我什麼時候結婚。我笑著夾菜，假裝沒聽到。':s.age<60?'過年回家，一大家子擠在客廳。我包紅包包到心在淌血。':'過年了，孩子們都回來了，家裡很熱鬧。他們一走，屋子又空了。'})},
 {id:'pet',p:s=>s.age>=6&&s.age<=70&&!s.f.pet?.0012:0,run:s=>{s.f.pet=s.t;fx(s,{lonely:-8});return {tone:'good',cat:'生活',text:'家裡收養了一隻流浪的小黃狗。我叫牠「小黑」，雖然牠明明是黃的。'}}},
 {id:'petdie',p:s=>s.f.pet&&!s.f.petdie&&s.t>s.f.pet+120?.008:0,run:s=>{s.f.petdie=1;fx(s,{lonely:6});return {tone:'bad',cat:'生活',text:'陪了我十幾年的小黑走了。我把牠埋在後山，回家的時候，門口不再有誰在等我。'}}},
 {id:'move',p:s=>.0007,run:s=>({tone:'neutral',cat:'生活',text:s.age<15?'我們搬家了。我得轉學，在新學校一個朋友都沒有。':'我搬了家。新的房間比較大，但離熟悉的地方更遠了。'})},
 {id:'abroad',p:s=>s.age>=20&&s.age<=72&&s.y>=1979&&s.money>40&&(s.f.abroad||0)<2?.0015:0,run:s=>{s.f.abroad=(s.f.abroad||0)+1;fx(s,{open:3});return {tone:'good',cat:'生活',text:s.f.abroad===1?(s.y<1995?'我第一次出國，跟著旅行團去了香港和泰國。在飛機上，我一直盯著窗外的雲看。':'我第一次出國，跟朋友去了日本。在便利商店裡，我覺得什麼都好新奇。'):'我又出國玩了一趟。回到桃園機場，聞到熟悉的空氣，才覺得真的到家了。'}}},
 {id:'lend',p:s=>s.age>=22&&s.age<=60&&!s.f.lend?.001:0,run:s=>{s.f.lend=1;fx(s,{money:-6,lonely:5});return {tone:'bad',cat:'生活',text:'好朋友跟我借了一筆錢，說下個月就還。後來他就不接我的電話了。我心疼的不是錢。'}}},
 {id:'mentor',p:s=>s.age>=20&&s.age<=40&&working(s)&&!s.f.mentor?.002:0,run:s=>{s.f.mentor=1;fx(s,{study:3,lonely:-4});return {tone:'good',cat:'人生',text:'工作上有個前輩很照顧我，教我做事的方法，也教我怎麼看人臉色。'}}},
 {id:'overtime',p:s=>working(s)&&s.age>=22&&s.age<=55&&['公司','科技','醫護','工廠'].includes(s.job)?.003:0,run:s=>{fx(s,{health:-2});return {tone:'bad',cat:'生活',text:s.job==='工廠'?'這個月趕貨，每天加班到晚上十點。領到加班費的時候，覺得手都不是自己的了。':'這個月每天加班到十點，回到家只想倒在床上。週末我睡了一整天。'}}},
 {id:'parentsick',p:s=>s.age>=18&&s.age<=55&&!s.f.parentsick&&parAlive(s)?.0015:0,run:s=>{s.f.parentsick=1;fx(s,{self:-3});return {tone:'bad',cat:'家庭',text:'媽媽住院開刀，我請了假在醫院陪了好幾天。看著她變小的身體，我才發現她老了。'}}},
 {id:'sibling',p:s=>s.age>=25&&s.age<=65?.0008:0,run:s=>({tone:'bad',cat:'家庭',text:'我跟兄弟姊妹為了一件小事吵起來，最後誰都沒讓誰。後來想想，其實吵的根本不是那件事。'})},
 {id:'temple',p:s=>s.age>=12&&['閩南','客家'].includes(s.eth)?.0015:.0004,run:s=>({tone:'neutral',cat:'生活',text:s.age<25?'跟著媽媽去廟裡拜拜，她幫我求了一個考試的平安符，要我放在鉛筆盒裡。':`我去廟裡拜拜，求籤問了${templeAsk(s)}的事。籤詩寫得模稜兩可，我卻安心了不少。`})},
 {id:'nightmkt',p:s=>s.age>=12&&s.age<=60?.0015:0,run:s=>{fx(s,{lonely:-2});return {tone:'good',cat:'生活',text:s.age<20||isStudent(s)?'放學跟同學去逛夜市，用零用錢買了一包雞排，四個人分著吃。':(working(s)?'下班後':'晚上')+'跟朋友去逛夜市，吃了一碗蚵仔麵線。我覺得，這樣就很好了。'}}},
 {id:'ktv',p:s=>s.y>=1988&&s.age>=16&&s.age<=50?.0012:0,run:s=>{fx(s,{lonely:-3});return {tone:'good',cat:'生活',text:'跟朋友去 KTV 唱到半夜，大家都唱得很難聽，卻笑得很開心。'}}},
 {id:'wedding',p:s=>s.age>=25&&s.age<=38?.0015:0,run:s=>({tone:'neutral',cat:'生活',text:s.married?'這個月包了三個紅包，參加了三場婚禮。台上的新人在哭，我在算這個月還剩多少錢。':'又去參加朋友的婚禮了。台上的新人在哭，同桌的親戚轉頭問我：「下一個換你了吧？」'})},
 {id:'kidgood',p:s=>s.kids&&!s.f.kidgood&&schoolKid(s)?.002:0,run:s=>{s.f.kidgood=1;return {tone:'good',cat:'家庭',text:'孩子拿了一張獎狀回家。我把它貼在冰箱上，每次開冰箱都會看一眼。'}}},
 {id:'kidbad',p:s=>s.kids&&!s.f.kidbad&&schoolKid(s,7)?.0015:0,run:s=>{s.f.kidbad=1;return {tone:'bad',cat:'家庭',text:'孩子在學校跟人打架，我被叫去學校道歉。回家的路上，我們誰都沒說話。'}}},
 {id:'kidleave',p:s=>s.kids&&s.age>=45&&s.age<=65&&!s.f.kidleave?.0015:0,run:s=>{s.f.kidleave=1;fx(s,{lonely:6});return {tone:'neutral',cat:'家庭',text:'孩子搬出去住了。我站在他空掉的房間門口，想起他小時候在這裡哭著不肯睡覺。'}}},
 {id:'checkup',p:s=>s.age>=45?.0015:0,run:s=>{fx(s,{health:-1});return {tone:'neutral',cat:'健康',text:'健康檢查報告出來，好幾項都是紅字。醫生叫我少吃一點、多運動，我點點頭，晚上照樣吃宵夜。'}}},
 {id:'volunteer',p:s=>s.age>=63&&!s.f.vol?.002:0,run:s=>{s.f.vol=1;fx(s,{lonely:-10});return {tone:'good',cat:'生活',text:`我開始去${s.eth==='原住民'?pick(['教會','醫院','部落的文健站']):pick(['醫院','廟裡','社區的關懷據點'])}當志工，每天早上有個地方可以去，有人會跟我打招呼。`}}},
 {id:'grandcare',p:s=>s.kids&&s.age>=55&&s.age<=75&&!s.f.gcare?.002:0,run:s=>{s.f.gcare=1;fx(s,{lonely:-6});return {tone:'good',cat:'家庭',text:'孩子把孫子交給我帶。我每天接送他上下學，很累，但我覺得自己還被需要。'}}},
 {id:'lotto',p:s=>s.y>=2002&&s.age>=20?.0008:0,run:s=>({tone:'good',cat:'生活',text:'我買了幾張樂透，對中了三個號碼，四百塊。我開心地拿去買了一杯珍珠奶茶和一個便當。'})},
 {id:'insomnia',p:s=>s.lonely>60&&s.age>=18?.002:0,run:s=>({tone:'bad',cat:'健康',text:'我已經好幾個晚上睡不著了。半夜兩點，我躺在床上聽著冷氣的聲音，不知道該打給誰。（睡不好、心情低落時，可撥打 1925 安心專線。）'})},
];

