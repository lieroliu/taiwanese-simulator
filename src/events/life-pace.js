/* ================= pacing: small choices at 5–9, choices and diary lines after 50 ================= */
/* the first big choice is at 10 (after10), and life after 50 was mostly quiet; these fill both ends */
const LP_kid=s=>{if(!s.f.gkSex)s.f.gkSex=chance(.5)?'孫子':'孫女';return s.f.gkSex};
const LP_gp=s=>s.eth==='外省'?(s.sex==='M'?'爺爺':'奶奶'):s.eth==='客家'?(s.sex==='M'?'阿公':'阿婆'):(s.sex==='M'?'阿公':'阿嬤');
const LP_par=s=>{const d=!dadGone(s)&&!s.f.parentdie,m=!momGone(s)&&!s.f.parentdie;return d&&m?'爸媽':d?'爸爸':m?'媽媽':null};
const LP_hit=s=>!abroad(s)&&!s.dead;
const LP=[
 /* ---------- childhood ---------- */
 {id:'c_fair',choice:1,check:s=>s.age===5&&!s.f.c_fair&&LP_hit(s)&&chance(.08),run:s=>{s.f.c_fair=1;const coin=s.y<1975?'五毛':s.y<1990?'十塊':s.y<2005?'五十塊':'一百塊';const where=s.urban?'夜市':'廟口的熱鬧';
  return {cat:'童年',title:'口袋裡的錢',text:`大人帶我去${where}，塞給我${coin}，說只能花這些。攤子一攤接一攤，我站在中間不知道往哪裡走。我要花在哪裡？`,choices:[
   {label:'套圈圈',go:s=>{fx(s,{risk:3});return chance(.3)?'我套中了一瓶養樂多。我把它抱在懷裡走了一整晚，捨不得喝。':'三個圈圈都彈了出去。老闆送我一顆糖，說下次會更好。'}},
   {label:'撈金魚',go:s=>{fx(s,{open:2});return '紙網破了兩次，老闆還是裝了一隻給我。那隻金魚在臉盆裡游了三天，第四天早上就浮起來了。'}},
   {label:'買糖葫蘆',go:s=>{fx(s,{risk:-2});return '我買了一串糖葫蘆，舔了一路，舔到手指黏在一起，被大人拉著去廁所洗手。'}}]}}},
 {id:'c_red',choice:1,check:s=>s.age===6&&s.m<=2&&!s.f.c_red&&LP_hit(s),run:s=>{s.f.c_red=1;const amt=s.y<1975?'二十塊':s.y<1990?'三百塊':s.y<2005?'兩千塊':'三千六';
  return {cat:'童年',title:'紅包',text:`過年了。親戚一個一個塞紅包給我，我偷偷數過，加起來有${amt}。大人伸出手說：「我先幫你收著。」我要怎麼辦？`,choices:[
   {label:'交給大人保管',go:s=>{fx(s,{rebel:-2,self:-2});return '我把紅包全部交出去。大人說等我長大再還我。到現在，那筆錢還在「保管中」。'}},
   {label:'自己藏起來',go:s=>{fx(s,{self:3,rebel:2});return chance(.5)?'我把紅包藏在枕頭套裡。半年後換枕頭套的時候被找到，全數沒收，連利息都沒有。':'我把紅包藏在衣櫃最裡面的襪子裡。藏得太好，後來連我自己都找不到了。'}},
   {label:'拿去買玩具',go:s=>{fx(s,{risk:3,rebel:2});return s.y<1980?'我拿了一張去柑仔店，買了一把會發出聲音的塑膠槍。剩下的被大人發現，收走了。':s.y<2000?'我拿了一張去文具店，買了一台四驅車。剩下的被大人發現，收走了。':'我拿了一張去玩具店，買了一盒積木。剩下的被大人發現，收走了。'}}]}}},
 {id:'c_recess',choice:1,check:s=>s.age===7&&s.m>=9&&!s.f.c_recess&&LP_hit(s),run:s=>{s.f.c_recess=1;const g=lpGames(s);
  return {cat:'童年',title:'下課十分鐘',text:`下課鐘一響，全班衝出教室。操場上有人在${g[0]}，走廊上有人在${g[1]}。下課只有十分鐘，我要去哪一邊？`,choices:[
   {label:g[0],go:s=>{fx(s,{risk:4,lonely:-6});return g[0]==='打躲避球'?'我在躲避球場上一直被打中，可是每次都笑著爬起來。上課鐘響的時候，我的制服上全是球印。':g[0]==='打彈珠'?'我蹲在操場邊打彈珠，贏了隔壁班三顆。上課鐘響了我還蹲著，被老師拎著耳朵回教室。':'我跑到上課鐘響才停下來，滿頭大汗地衝回座位。老師說我們班一進教室，整間都是汗臭味。'}},
   {label:g[1],go:s=>{fx(s,{lonely:-4,open:2});return g[1]==='交換卡牌'?'我用兩張普通卡換到一張閃卡。後來才知道，那張閃卡在文具店只要五塊。':g[1]==='跳橡皮筋'?'我們把橡皮筋從腳踝跳到膝蓋，再跳到腰。我卡在腰那一關，卡了一整個學期。':'我在走廊跟同學玩，玩到忘記上廁所，上課上到一半舉手。'}},
   {label:'留在教室畫畫',go:s=>{fx(s,{open:3,risk:-3,lonely:2});return '我留在教室，在課本的空白處畫了一整排小人。後來那本課本的每一頁，都有一個小人在角落跑步。'}}]}}},
 {id:'c_coins',choice:1,check:s=>s.age===8&&!s.f.c_coins&&LP_hit(s)&&chance(.12),run:s=>{s.f.c_coins=1;const it=lpTreat(s);
  return {cat:'童年',title:'零錢罐',text:`${it[0]}。我每天放學都經過，每天都只能看。家裡電視櫃上有一罐零錢，從來沒有人數過。我要怎麼辦？`,choices:[
   {label:'偷拿一個銅板',go:s=>{fx(s,{risk:5,rebel:4});if(chance(.45)){fx(s,{rebel:-2});return s.y<2000?'我才拿了一個銅板，大人就發現了，因為零錢罐的蓋子我沒蓋好。那天晚上我被藤條打了五下，哭到睡著。':'我才拿了一個銅板，大人就發現了，因為零錢罐的蓋子我沒蓋好。我被罰一個月沒有零用錢，還要寫一張悔過書。'}return `我拿了一個銅板。${it[1]}。那幾天，我一經過電視櫃就心虛，晚上都睡不好。`}},
   {label:'忍住不拿',go:s=>{fx(s,{rebel:-3});return `我每天經過還是看一眼，就是沒拿。過了一個月，${it[2]}`}},
   {label:'開口跟大人要',go:s=>{fx(s,{self:3});return chance(.5)?'我鼓起勇氣開口要。大人看了我一眼，說考試考一百分就給我。那學期我第一次考了一百分。':'我鼓起勇氣開口要。大人說：「錢是會自己長出來的嗎？」我就沒有再問了。'}}]}}},
 {id:'c_sign',choice:1,check:s=>s.age===9&&!s.f.c_sign&&LP_hit(s)&&chance(.1),run:s=>{s.f.c_sign=1;const sc=pick([38,42,46,51,55]);
  return {cat:'童年',title:'考卷要簽名',text:`數學考卷發回來，我考了 ${sc} 分。老師說，不及格的人明天要拿家長簽名回來。放學走回家的路，我走得特別慢。我要怎麼辦？`,choices:[
   {label:'老實拿回家簽',go:s=>{fx(s,{rebel:-3,study:3});return s.y<2000?'我把考卷拿回家。大人看了很久，簽了名，然後叫我把錯的題目每一題抄十遍。':'我把考卷拿回家。大人看了很久，簽了名，隔天幫我報名了數學補習班。'}},
   {label:'自己模仿簽名',go:s=>{fx(s,{risk:5,rebel:5});return chance(.55)?`我練了一晚上的簽名。隔天老師把考卷跟我的作業簿放在一起，說家長的字跟我的字一模一樣。${s.y<2006?'我被叫上台打了手心。':'我被留下來，打電話請家長來學校。'}`:'我練了一晚上的簽名，老師竟然沒有看出來。我得意了一整個禮拜，然後下一次考試又考不及格。'}},
   {label:'趁大人看電視時拿去簽',go:s=>{fx(s,{risk:3});return '我趁大人在看八點檔，把考卷折到只剩簽名欄遞過去。大人眼睛沒離開電視，就簽了。我覺得自己好聰明，也有一點對不起。'}}]}}},
 /* ---------- after 50 ---------- */
 {id:'l_pill',choice:1,check:s=>s.age>=48&&s.age<=60&&!s.f.l_pill&&LP_hit(s)&&chance(.006),run:s=>{s.f.l_pill=1;
  return {cat:'健康',title:'血壓',text:'醫生看著我的血壓，皺了一下眉頭，說要開始吃降血壓的藥，而且一吃就是一輩子。我坐在診間，想起自己年輕時熬夜都沒事。我要怎麼辦？',choices:[
   {label:'乖乖吃藥',go:s=>{fx(s,{health:4,risk:-2});return '我買了一個分成七格的藥盒，放在餐桌上。每天早上吃一顆，吃著吃著，就跟刷牙一樣了。'}},
   {label:'先自己運動看看',go:s=>{fx(s,{health:chance(.5)?3:-2,self:2});return '我每天晚上去學校操場走路。走了三個月，血壓降了一點點，膝蓋倒是開始痛了。'}},
   {label:'聽朋友的吃偏方',go:s=>{fx(s,{health:-3,money:-1,risk:3});return s.y<2005?'朋友介紹我喝一種泡了好幾味藥材的酒，說他喝了都好了。我喝了半年，血壓沒降，酒量倒是變好了。':'朋友在群組傳了一段影片，說每天吃一顆洋蔥就好。我吃了兩個月的洋蔥，血壓沒變，家裡的人都不太想靠近我。'}}]}}},
 {id:'l_par',choice:1,check:s=>s.age>=40&&s.age<=66&&!s.f.l_par&&!s.f.parentill&&!s.f.caring&&LP_hit(s)&&parAge(s)>=75&&!!LP_par(s)&&chance(.006),run:s=>{s.f.l_par=1;const p=LP_par(s),w=p==='爸媽'?'他們':p==='爸爸'?'他':'她',who=p==='爸媽'?pick(['爸爸','媽媽']):w;
  const hap=pick([`上個月在浴室滑了一跤，還好只是瘀青`,`出門忘了關瓦斯，是鄰居聞到味道來敲門`,`打電話來問同一件事，一個晚上問了三次`]);
  return {cat:'家庭',title:'爸媽老了',text:`${p}今年都七十好幾了，還住在老家。${who}${hap}。電話裡${w}一直說沒事，叫我不要擔心。我要怎麼辦？`,choices:[
   {label:'每個週末回去',go:s=>{fx(s,{self:-3,lonely:-3,money:-1});return `我每個禮拜六都回去。${w}早就把菜買好了，一桌子的菜，兩個人根本吃不完。回程的時候，後車廂被塞滿了水果。`}},
   {label:'每天打一通電話',go:s=>{fx(s,{lonely:-1});return `我每天晚上九點打一通電話。${w}講的都是今天吃了什麼、鄰居誰住院了。有一天我忘了打，九點十分我的電話就響了。`}},
   {label:'在家裡裝監視器',if:s.y>=2012,go:s=>{fx(s,{risk:2});return `我在老家客廳裝了一台監視器，手機就能看。第一天，我看到${w==='他們'?'他們兩個':w}對著鏡頭研究了半個小時，最後拿一條毛巾把它蓋起來了。`}}]}}},
 {id:'l_ret',choice:1,check:s=>s.job==='退休'&&s.age>=50&&s.age<=75&&!s.f.l_ret&&LP_hit(s)&&chance(.25),run:s=>{s.f.l_ret=1;
  return {cat:'人生',title:'退休以後',text:'退休一個月了。每天早上醒來，我都要想一下今天是禮拜幾，然後發現禮拜幾都一樣。我要怎麼打發這麼多時間？',choices:[
   {label:'去社區大學上課',if:s.y>=1998,go:s=>{fx(s,{open:4,lonely:-6});return pick(['我報名了社區大學的烏克麗麗班。全班只有我一個人到第三週還按不出 C 和弦，老師說我是全班最認真的。','我報名了社區大學的攝影班，買了一台比我孫子還貴的相機。拍了一整年，最滿意的一張是家裡的貓。'])}},
   {label:'去當志工',go:s=>{fx(s,{self:-2,lonely:-5});return s.y>=1995?'我去醫院當志工，穿著背心在大廳幫人指路。每天都有人問我廁所在哪裡，我覺得自己很被需要。':'我去廟裡當志工，幫忙摺金紙、排桌椅。廟公說我摺的金紙最整齊。'}},
   {label:'去公園跳舞',go:s=>{fx(s,{lonely:-8,health:2,risk:2});return s.y<2005?'我跟著公園的土風舞隊每天早上六點跳。第一個禮拜我一直踩到別人的腳，第二個禮拜換別人踩我的。':'我跟著公園的阿姨們每天晚上跳舞，音響大到樓上的住戶來抗議過兩次。我們把音量轉小了一格。'}},
   {label:'找份兼差',if:s.health>=45,go:s=>{fx(s,{money:2,self:2});return '我去當大樓的管理員，每天收包裹、跟住戶點頭。做了半年，整棟樓的人我都叫得出名字，他們的包裹裡裝什麼我也大概知道。'}}]}}},
 {id:'l_gk',choice:1,check:s=>s.f.gk&&!s.f.l_gk&&s.age<=78&&LP_hit(s)&&kidsOf(s).some(k=>k.alive)&&chance(.08),run:s=>{s.f.l_gk=1;const k=pick(kidsOf(s).filter(x=>x.alive));
  return {cat:'家庭',title:'帶孫',text:`${nm(k)}跟另一半都要上班，托嬰中心一個月好幾萬。${nm(k)}吞吞吐吐地問我，白天能不能幫忙帶小孩。我要怎麼回答？`,choices:[
   {label:'幫忙帶',go:s=>{fx(s,{lonely:-10,health:-2,self:-3});s.f.raiseGk=1;return `我每天早上七點去接${LP_kid(s)}。第一個會叫的不是爸爸也不是媽媽，是「${LP_gp(s)}」。我假裝不在意，偷偷跟每個鄰居都說了一遍。`}},
   {label:'週末才帶',go:s=>{fx(s,{lonely:-4});return `我說平日不行，週末可以。每個禮拜天傍晚${LP_kid(s)}被接走的時候，家裡突然好安靜，我把玩具一個一個撿回箱子裡。`}},
   {label:'說自己也要過生活',go:s=>{fx(s,{self:5,lonely:2});return `我說我帶了一輩子的小孩，現在想過自己的日子。${nm(k)}說好，我知道他們有點失望。後來我每個月包一個紅包，給${LP_kid(s)}付托嬰的錢。`}}]}}},
 {id:'l_moto',choice:1,check:s=>s.age>=74&&s.age<=88&&!s.f.l_moto&&LP_hit(s)&&!inTaipei(s)&&s.y>=1985&&s.health<70&&chance(.006),run:s=>{s.f.l_moto=1;const who=s.kids?'孩子':'姪子';
  return {cat:'生活',title:'機車鑰匙',text:`上個月我騎機車去市場，在路口差點撞到人。${who}知道以後，伸手跟我要機車鑰匙，說${s.y>=2017?'我這個年紀本來就要重新考駕照了':'我年紀大了，反應不像以前'}。我要怎麼辦？`,choices:[
   {label:'把鑰匙交出去',go:s=>{fx(s,{risk:-3,lonely:4});return `我把鑰匙交出去了。從那天起，去市場要等${who}有空，要不然就走二十分鐘的路。那台機車停在門口，我每天都會去擦一下。`}},
   {label:'偷偷繼續騎',go:s=>{fx(s,{risk:5,rebel:4});if(chance(.25))fx(s,{health:-6});return `我把備用鑰匙藏在花盆底下，趁${who}上班偷偷騎去市場。市場的人都認識我，每次都有人幫我打電話給${who}告狀。`}},
   {label:'改騎電動代步車',if:s.y>=2005,go:s=>{fx(s,{lonely:-2});return '我買了一台電動代步車，四個輪子，最快只有時速十公里。我每天開著它去市場，被一台腳踏車超車的時候，我還是會不服氣。'}}]}}},
 {id:'l_reunion',choice:1,check:s=>s.age>=60&&s.age<=72&&!s.f.l_reunion&&LP_hit(s)&&chance(.005),run:s=>{s.f.l_reunion=1;
  return {cat:'生活',title:'國小同學會',text:`${s.y>=2012?'有個國小同學在 LINE 上建了一個群組，':'有個國小同學挨家挨戶打電話，'}說要辦一次同學會，地點就在我們以前的學校。我已經想不起來，那些名字是哪一張臉了。要去嗎？`,choices:[
   {label:'去同學會',go:s=>{fx(s,{lonely:-6,open:2});return pick(['我去了。當年最調皮、天天被罰站的那個同學，後來當了校長。他上台致詞的時候，台下笑成一片。','我去了。大家站在舊教室裡，桌椅變得好小。有人一直坐在當年的位子上，不肯起來。','我去了。名牌上的名字我都記得，臉一張都認不出來。吃到第三道菜，大家終於聊開了，聊的都是膝蓋和血壓。'])}},
   {label:'這次不去',go:s=>{fx(s,{lonely:2});return '我說那天有事，沒有去。群組裡傳來好多張照片，我一張一張放大看，認出了兩個人。'}}]}}},
 {id:'l_will',choice:1,check:s=>s.age>=70&&s.y>=2019&&!s.f.l_will&&LP_hit(s)&&chance(.004),run:s=>{s.f.l_will=1;
  return {cat:'健康',title:'預立醫療決定',text:'回診的時候，醫院的社工跟我說，現在可以先簽「預立醫療決定」，想好最後要不要插管、要不要急救，以後就不用讓家人替我決定。我要簽嗎？',choices:[
   {label:'去簽',go:s=>{fx(s,{self:4,open:3});return `我帶著${s.kids?'孩子':'家人'}去醫院簽了。簽完出來，大家都不知道該說什麼，我就說去吃火鍋吧。那一餐，我們吃得特別久。`}},
   {label:'不想談這個',go:s=>{fx(s,{open:-2});return '我說呸呸呸，好好的講這個做什麼。社工笑了笑，把單子放進我的袋子裡。那張紙後來一直夾在我的健保卡套裡。'}}]}}}];
function lpGames(s){if(s.y<1985)return ['打彈珠','跳橡皮筋'];if(s.y<2000)return ['打躲避球','玩紅綠燈'];return ['玩鬼抓人','交換卡牌']}
function lpTreat(s){
  if(s.y<1975)return ['巷口的柑仔店擺了一盒抽抽樂，一抽一塊錢，最大獎是一把塑膠劍','我抽到一顆小糖果','那盒抽抽樂被別人抽完了'];
  if(s.y<1995)return ['巷口的柑仔店擺了一盒抽抽樂，一抽五塊錢，最大獎是一台遙控車','我抽到一張貼紙','那盒抽抽樂被別人抽完了'];
  if(s.y<2014)return ['學校對面的文具店掛了一排新的卡牌，一包五十塊','我買到一包卡，裡面全是重複的','那一排卡牌被別人買完了'];
  return ['學校旁邊開了一家夾娃娃機店，一次十塊','我夾了一次，爪子碰到娃娃又鬆開了','那家店收起來了，換成一家手搖飲'];}
LP.forEach(e=>MS.push(e));
Object.assign(LEAN,{'套圈圈':{risk:.7},'撈金魚':{open:.5},'買糖葫蘆':{risk:-.5},
 '交給大人保管':{self:-.8,rebel:-.5},'自己藏起來':{self:.8,rebel:.3},'拿去買玩具':{risk:.6,rebel:.5},
 '打彈珠':{risk:.6},'跳橡皮筋':{open:.3},'打躲避球':{risk:.8},'玩紅綠燈':{open:.3},'玩鬼抓人':{risk:.8},'交換卡牌':{open:.5},'留在教室畫畫':{open:.7,risk:-.6},
 '偷拿一個銅板':{risk:1,rebel:1},'忍住不拿':{rebel:-1},'開口跟大人要':{self:.8},
 '老實拿回家簽':{rebel:-1},'自己模仿簽名':{risk:.8,rebel:1},'趁大人看電視時拿去簽':{risk:.5,rebel:.3},
 '乖乖吃藥':{risk:-.8,rebel:-.5},'先自己運動看看':{self:.8},'聽朋友的吃偏方':{open:-.5,risk:.5},
 '每個週末回去':{self:-1},'每天打一通電話':{self:.3},'在家裡裝監視器':{open:.6},
 '去社區大學上課':{open:1},'去當志工':{self:-.7},'去公園跳舞':{risk:.4,open:.3},'找份兼差':{self:.5,risk:-.3},
 '幫忙帶':{self:-1},'週末才帶':{self:.3},'說自己也要過生活':{self:1,rebel:.4},
 '把鑰匙交出去':{self:-.7,risk:-.7},'偷偷繼續騎':{risk:1,rebel:.8,self:.5},'改騎電動代步車':{open:.6},
 '去同學會':{open:.6},'這次不去':{open:-.5},'去簽':{open:.8,self:.5},'不想談這個':{open:-.8}});
Object.assign(MOOD_C,{'拿去買玩具':4,'套圈圈':3,'玩鬼抓人':3,'打躲避球':3,'交給大人保管':-2,'去公園跳舞':4,'去社區大學上課':4,'幫忙帶':3,'把鑰匙交出去':-4,'去同學會':3});
{const cf=ctxFor;ctxFor=function(s,id){
  switch(id){
  case 'c_fair':return {text:'旁邊的小孩都擠在套圈圈的攤子前面',norm:['套圈圈']};
  case 'c_red':return s.by<1995?{text:'鄰居的小孩，紅包也都是一拿到就被大人收走',norm:['交給大人保管']}:{text:'班上有同學說，他的紅包是自己拿去郵局存的',norm:[]};
  case 'c_recess':{const g=lpGames(s);return {text:`班上大部分的人都在${g[0]}`,norm:[g[0]]}}
  case 'c_coins':return {text:'同學說他們都拿過，大人根本不會發現',norm:['偷拿一個銅板']};
  case 'c_sign':return {text:'班上考不及格的同學，大多還是乖乖拿回家簽',norm:['老實拿回家簽']};
  case 'l_pill':return s.y>=2000?{text:'身邊同年紀的朋友，一半都在吃血壓藥，聚餐時還會比誰吃的顆數多',norm:['乖乖吃藥']}:{text:'身邊的朋友都說西藥傷身，不要一開始就吃',norm:['聽朋友的吃偏方']};
  case 'l_par':return s.by<=1975?{text:'親戚說，做子女的要常回家看看',norm:['每個週末回去']}:{text:'身邊的朋友，多半是每天打一通電話回家',norm:['每天打一通電話']};
  case 'l_ret':return {text:'先退休的同事，有一半每天早上都在公園',norm:['去公園跳舞']};
  case 'l_gk':return s.by<=1975?{text:'身邊的朋友，孫子幾乎都是自己在帶',norm:['幫忙帶']}:{text:'身邊很多朋友說，帶孫是孩子自己的事',norm:['週末才帶']};
  case 'l_moto':return {text:'鄉下沒有公車，同年紀的人大多還在騎車',norm:['偷偷繼續騎']};
  case 'l_reunion':return {text:'群組裡的人說，這可能是最後一次辦了',norm:['去同學會']};
  case 'l_will':return {text:'同年紀的朋友聽到這個，都說不吉利',norm:['不想談這個']};
  }
  return cf(s,id)}}

/* diary lines after 50: everyday small things, so the later years are not empty */
const LATE=[
 [s=>s.age>=48&&s.age<=52,'我的右手舉不起來了，醫生說是五十肩。我說我還沒五十，醫生說肩膀不知道。'],
 [s=>s.age>=55,'這一年，我包出去的白包比紅包還多。'],
 [s=>s.age>=50&&s.urban&&s.y>=1997,'在捷運上，有個年輕人站起來讓位給我。我掙扎了很久，最後還是坐下了，坐下以後一路都在想自己是不是看起來很老。'],
 [s=>s.age>=65&&s.age<=67&&s.y>=2000,'我拿到敬老卡了。第一次刷卡上公車，嗶的聲音跟別人不一樣，我假裝沒聽見。'],
 [s=>s.age>=60&&s.y>=1995,'我的藥盒分成早、中、晚三排，每排七格。每個禮拜天晚上，我坐在餐桌前把藥一顆一顆放進去。'],
 [s=>s.age>=60,'在醫院候診的時候，我遇到以前的鄰居。我們聊了一個小時，聊的都是膝蓋。'],
 [s=>s.age>=60&&s.y>=2016&&s.y<=2019,'公園裡有一個阿伯，腳踏車上綁了六支手機在抓寶可夢。我站在旁邊看了很久，他教了我一招。'],
 [s=>s.age>=58&&s.y>=2000,'我每天早上去便利商店，買一杯咖啡，坐在窗邊把報紙從頭看到尾。店員已經不用問我要什麼了。'],
 [s=>s.age>=62&&s.y>=2006,'里長拉我去社區關懷據點，量血壓、吃午餐、唱卡拉 OK。我本來只想去一次，後來每個禮拜三都去。'],
 [s=>s.age>=60&&s.y<2010&&!s.urban,'我每天聽地方電台。主持人說哪個藥好，我就打電話去訂，家裡的櫃子堆滿了沒拆的盒子。'],
 [s=>s.age>=70,'我過生日，蛋糕上的蠟燭插不下了，只好插了兩根數字蠟燭。'],
 [s=>s.age>=60&&s.married&&!!spouse(s),'我們兩個吃飯的時候，常常一整頓都沒說話。誰也不覺得奇怪。'],
 [s=>s.age>=60&&!s.married,'我學會了一個人煮一人份的菜。煮太多的時候，就分給隔壁。'],
 [s=>s.age>=56&&!!s.f.gk,s=>`${LP_kid(s)}來家裡玩，把我的手機設成了卡通的桌布。我不會改回來，就一直用著。`],
 [s=>s.age>=56&&!!s.f.raiseGk,s=>`${LP_kid(s)}上小學了，不用我每天接送。第一個沒帶小孩的早上，我在家裡走來走去，不知道手要放哪裡。`],
 [s=>s.age>=65&&s.y>=2010,'我把年輕時候的照片掃描起來，存在手機裡。翻著翻著，我看到一張想不起來是在哪裡拍的。'],
 [s=>s.age>=68,'我開始會在下午睡著，醒來的時候電視還開著，在播我沒看過的新聞。'],
 [s=>s.age>=52&&s.age<=64&&working(s),'公司來了一批新人，叫我「大哥」「大姐」的人越來越少，叫我「前輩」的人越來越多。'],
 [s=>s.age>=55&&s.y>=2008,'我去參加了一場喜酒，新郎是我看著長大的孩子。我坐在主桌旁邊那一桌，突然覺得時間好快。'],
 [s=>s.age>=72,'我開始把一些東西送人。年輕時捨不得丟的那些，現在送出去，覺得心裡比較輕。']];
{const rate=.004;const ok=(s,i)=>!s.f['lt'+i]&&LATE[i][0](s);
 PE.push({id:'late',p:s=>{if(s.age<48||abroad(s))return 0;let n=0;for(let i=0;i<LATE.length;i++)if(ok(s,i))n++;return n?1-Math.pow(1-rate,n):0},
  run:s=>{delete s._reT.late;const c=[];for(let i=0;i<LATE.length;i++)if(ok(s,i))c.push(i);const i=pick(c);s.f['lt'+i]=1;
    const t=typeof LATE[i][1]==='function'?LATE[i][1](s):LATE[i][1];return {_eid:'lt'+i,tone:'neutral',cat:'生活',text:splitSent(t).every(x=>sentOK(s,x))?t:''}}})}
