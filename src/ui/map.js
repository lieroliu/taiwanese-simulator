/* ================= 足跡地圖：所在縣市、住過／通勤／旅遊點亮 ================= */
// County outlines come from tools/build_map.py (g0v twgeojson, 1982 town boundaries dissolved into the pre-2010 counties).
//@include data/map.js
const MAPK={home:3,work:2,trip:1}, MAPLBL={home:'居住',work:'通勤',trip:'旅遊'};
const inTW=p=>!!CMAP[p];
function visit(s,c,k){if(!CMAP[c])return;s.vis=s.vis||{};if((MAPK[s.vis[c]]||0)<MAPK[k])s.vis[c]=k}
// where people from each county commonly commute to: [county, chance, from year]
const COMMUTE={'台北縣':[['台北市',.55]],'基隆市':[['台北市',.22],['台北縣',.1]],'桃園縣':[['台北市',.12,1990],['台北縣',.1],['新竹縣',.05,1985]],
 '新竹縣':[['新竹市',.4]],'新竹市':[['新竹縣',.35,1982]],'苗栗縣':[['新竹縣',.12,1985],['新竹市',.1],['台中縣',.08]],
 '台中縣':[['台中市',.42]],'台中市':[['台中縣',.28]],'彰化縣':[['台中市',.18],['台中縣',.08]],'南投縣':[['台中市',.1],['台中縣',.1]],
 '雲林縣':[['嘉義縣',.05],['彰化縣',.05]],'嘉義縣':[['嘉義市',.42]],'嘉義市':[['嘉義縣',.25]],'台南縣':[['台南市',.38],['高雄縣',.04]],
 '台南市':[['台南縣',.3]],'高雄縣':[['高雄市',.48]],'高雄市':[['高雄縣',.32]],'屏東縣':[['高雄市',.16],['高雄縣',.1]],'宜蘭縣':[['台北市',.07,2006]]};
const hiSch=s=>['高中','高職','五專'].includes(s.studying)&&s.age<=19;
function mapTrack(s){
  if(!inTW(s.place))return;visit(s,s.place,'home');
  const w=working(s),sch=hiSch(s);if(!w&&!sch)return;
  const k=s.place+'|'+(w?s.job+'|'+(s.jobStart||0):s.studying);
  if(s.f.cmtKey!==k){s.f.cmtKey=k;s.f.cmt=null;s.f.cmtNew=null;
    for(const [c,p,y0] of COMMUTE[s.place]||[]){if(y0&&s.y<y0)continue;let q=p*(sch?.6:1);if(w&&s.job==='科技'&&/新竹/.test(c))q*=2;
      if(chance(q)){s.f.cmt=c;s.f.cmtNew=sch?'school':'work';break}}}
  if(s.f.cmt)visit(s,s.f.cmt,'work');
}
function cmtText(s){const d=s.f.cmt,sch=s.f.cmtNew==='school',to=sch?'上學':'上班',bus=s.y<1990?'公路局的車':'客運';
  if(s.place==='台北縣'&&d==='台北市')return s.y>=1997?pick([`每天早上，我在捷運站跟著人潮被推進車廂，到台北市${to}。整節車廂沒有人說話。`,`我每天搭捷運過河到台北市${to}，站著也能睡著。`]):`每天早上，我擠公車過橋到台北市${to}。橋上永遠在塞，我在車上把早餐吃完。`;
  if(s.place==='基隆市')return `我每天搭${s.y<1985?'火車':'客運'}到${d}${to}。出門的時候基隆在下雨，到了${d}，雨還在下。`;
  if(s.place==='宜蘭縣')return `雪隧通了以後，我每天搭客運穿過山到${d}${to}。遇到連假前一天，回家的路要多塞兩個鐘頭。`;
  if(sch)return pick([`我每天坐${bus}到${d}${to}，在最後一排背英文單字。`,`我每天天還沒亮就出門，騎腳踏車到車站，再搭火車到${d}${to}。`]);
  if(s.job==='科技'&&/新竹/.test(d))return `我每天開車進園區${to}，早上園區門口的路口，一塞就是半個鐘頭。`;
  return pick([`我每天騎機車到${d}${to}，單程四十分鐘。下雨天，我穿著雨衣在車陣裡鑽。`,`我每天搭${bus}到${d}${to}。車上幾張常見的臉，久了會互相點頭。`]);
}
// travel spots: [county, name, from year, to year, tags, lines, extra condition]
const SPOTS=[
 ['台北市','台北',1961,1999,'kid6 kid9',s=>[s.y<1986?'我們參觀了總統府，又去圓山動物園看大象林旺。':'我們去木柵動物園看大象林旺，牠老得一直站著不動。','我在台北車站前抬頭看高樓，覺得台北人走路都好快。'],s=>regionOf(s.place)!=='北'],
 ['台北市','故宮',1966,2099,'kid9 fam',['在故宮，我擠在人群裡看翠玉白菜，只看到玻璃櫃的一個角。']],
 ['台北縣','野柳',1964,2099,'kid6 fam old',['在野柳，大家排隊跟女王頭拍照。','海風很大，我抓著欄杆，看浪打在奇形怪狀的石頭上。']],
 ['台北縣','九份',1990,2099,'young co old',['九份的石階又窄又陡，我在茶樓窗邊坐了一下午，看山下的海。','我在九份吃了一碗芋圓，霧一下子就把整條老街蓋住了。']],
 ['台北縣','淡水',1980,2099,'young fam',['在淡水河邊等夕陽，我一手拿著阿給，一手拿著很長的霜淇淋。']],
 ['桃園縣','小人國',1984,2099,'kid6 fam',['在小人國，我站在迷你的總統府旁邊，覺得自己變成了巨人。']],
 ['新竹縣','六福村',1994,2099,'kid6 kid9 fam',['在六福村坐完大怒神，我下來的時候腳一直在抖。']],
 ['新竹縣','內灣',2000,2099,'fam old',['在內灣老街，我們排隊買野薑花粽，再搭小火車慢慢晃回竹東。']],
 ['苗栗縣','大湖',1990,2099,'fam',['在大湖採草莓，我一邊採一邊偷吃，最後籃子裡沒剩幾顆。']],
 ['台中市','逢甲夜市',1990,2099,'young',['在逢甲夜市，我從頭吃到尾，排了半個鐘頭買一份大腸包小腸。']],
 ['台中縣','月眉的遊樂園',2000,2099,'kid6 kid9',['在月眉的遊樂園，我被拉去坐雲霄飛車，尖叫到喉嚨都啞了。']],
 ['彰化縣','鹿港',1975,2099,'fam old young kid6',['在鹿港老街，我第一次吃到蝦猴，又在九曲巷裡迷了路。']],
 ['南投縣','日月潭',1961,2099,'kid6 fam co old honey',['我們在日月潭坐船，船老大一路講著潭裡的傳說。','在日月潭邊，我吃了一顆用香菇和茶葉滷的茶葉蛋，那個味道一直記得。']],
 ['南投縣','溪頭',1965,2099,'kid9 fam co',s=>[`溪頭的空氣涼涼的，${s.age<15?'大人':'導遊'}說這裡的空氣乾淨到可以裝瓶賣錢。`,'我們在柳杉林裡走了一個早上，衣服上都是樹的味道。']],
 ['南投縣','九族文化村',1986,2099,'kid6 kid9',['在九族文化村，我坐了好幾次雲霄飛車，排隊的時間比坐的時間長十倍。']],
 ['南投縣','清境',2000,2099,'young fam',['在清境，我隔著柵欄餵綿羊，手上都是牠的口水。']],
 ['南投縣','合歡山',1975,2099,'young',['聽說合歡山下雪了，我們半夜開車上山。車子塞在半路，雪只看到路邊一小堆。'],s=>s.m<=2&&s.ax.risk>50],
 ['雲林縣','劍湖山',1990,2099,'kid6 kid9',['在劍湖山，我被拉去坐摩天輪，到了最高的地方，我不敢往下看。']],
 ['嘉義縣','阿里山',1961,2099,'fam co old honey kid12',['凌晨四點被叫起床，我裹著外套擠在山上等日出。太陽出來的那一刻，所有人都「哇」了一聲。','我們搭小火車上山，車廂搖搖晃晃，窗外的樹越來越高。']],
 ['台南市','台南',2003,2099,'young fam old',['我在台南一天吃了五攤小吃，牛肉湯、碗粿、豆花，撐到走不動。']],
 ['台南市','赤崁樓',1961,2002,'kid6 kid9',['在赤崁樓，導遊講著荷蘭人和鄭成功，我只記得門口的冰很好吃。']],
 ['高雄縣','佛光山',1970,2099,'old fam',['佛光山的大佛好大，我跟著大家在殿裡繞了好幾圈，求了一個平安符。']],
 ['高雄市','駁二',2012,2099,'young',['在駁二的倉庫之間，我拍了一堆照片，最後一張也沒有上傳。']],
 ['高雄市','西子灣',1970,2099,'young honey',['在西子灣看夕陽，海面整片變成橘色，旁邊的情侶多到要排隊找位子。']],
 ['屏東縣','墾丁',1975,2099,'kid9 kid12 fam co young honey',['我在墾丁的沙灘上曬了一整個下午，晚上背痛到睡不著。','墾丁大街上人擠人，我買了一顆椰子，邊走邊喝。']],
 ['屏東縣','小琉球',1995,2099,'young',['在小琉球浮潛，我跟一隻海龜游在一起，牠一點都不怕人。']],
 ['宜蘭縣','礁溪',2006,2099,'fam young old co',['雪隧通了以後，開車一個鐘頭就到礁溪泡湯。回程塞在雪隧裡，又花了三個鐘頭。']],
 ['宜蘭縣','冬山河',1996,2011,'kid6 fam',['夏天的冬山河到處都是玩水的小孩，我全身濕透了還不想走。']],
 ['花蓮縣','太魯閣',1961,2099,'kid12 co old honey young',['在太魯閣，我仰頭看峽谷，看到脖子都酸了。','走到燕子口，導遊叫大家戴好安全帽，說上面隨時會掉石頭。']],
 ['花蓮縣','七星潭',1985,2099,'young fam',['在七星潭，我撿了一顆很圓的石頭，帶回家放在書桌上。']],
 ['台東縣','綠島',1990,2099,'young',['在綠島租了一台機車，環島一圈只要一個鐘頭。浮潛的時候，一群小丑魚從我腳邊游過去。']],
 ['台東縣','鹿野高台',2011,2099,'young fam',['為了看熱氣球，我凌晨四點就到鹿野高台卡位。熱氣球升起來的時候，旁邊的小孩都在拍手。'],s=>s.m>=6&&s.m<=8],
 ['澎湖縣','澎湖',1985,2099,'co young honey',s=>['我第一次坐船去澎湖，一路暈到吐。到了以後，海藍得不像真的。',s.y>=2003?'晚上在觀音亭看海上的煙火，海風吹得頭髮都是鹹的。':'在澎湖，我們騎機車到處跑，太陽大到手臂曬成兩種顏色。']],
 ['金門縣','金門',1993,2099,'co young old',['在金門的坑道裡，導遊說這些全是阿兵哥一鏟一鏟挖出來的。','我買了一把用砲彈殼打的菜刀，排隊上飛機的時候，一直怕被攔下來。']]];
function tripPick(s,tag,f){const L=SPOTS.filter(x=>x[4].split(' ').includes(tag)&&s.y>=x[2]&&s.y<=x[3]&&x[0]!==s.place&&(!x[6]||x[6](s))&&(!f||f(x)));
  return L.length?pickW(L,x=>s.vis&&s.vis[x[0]]?1:2.5):null}
function tripGo(s,x){visit(s,x[0],'trip');s.f.trips=(s.f.trips||0)+1;s._tripU=s._tripU||{};const L=(typeof x[5]==='function'?x[5](s):x[5]).filter(t=>!s._tripU[t]);const t=L.length?pick(L):'';if(t)s._tripU[t]=1;return t}
function tripTail(s,group){const c=[];if(s.age>=18&&s.ax.risk>65)c.push('回程的路上，我一直在想下次要去更遠的地方。');
  if(s.age>=18&&s.ax.self<35)c.push('我買了一大袋名產回去，分給每一個人。');
  if(s.money<30&&s.age>=18)c.push('我算著口袋裡的錢，只買了一包最便宜的名產。');
  if(group&&s.lonely>58)c.push('大家都有伴，我一個人坐在遊覽車的最後一排。');
  if(s.ax.open>66)c.push('我拍了好多照片，回家以後一張一張翻。');
  const L=c.filter(t=>!(s._tripU||{})[t]);if(!L.length||!chance(.4))return '';const t=pick(L);s._tripU[t]=1;return t}
const TRIP_OK=s=>inTW(s.place)&&!s.dead;
const tripFail=t=>({tone:'neutral',cat:'生活',text:t});
const PAR=s=>s.fam==='單親'?soleP(s):s.fam==='隔代教養'?elders(s):'爸爸';
const WEST=['台北市','台北縣','桃園縣','新竹市','新竹縣','苗栗縣','台中市','台中縣','彰化縣','雲林縣','嘉義縣','嘉義市','台南縣','台南市','高雄縣','高雄市'];
const TRIP=[
 ...[[11,'g6','kid6'],[14,'g9','kid9'],[17,'g12','kid12']].map(([a,k,tag])=>({id:'trip_'+k,
  p:s=>s.age===a&&s.m>=3&&s.m<=6&&!s.f['t'+k]&&TRIP_OK(s)&&(k!=='g12'||hiSch(s))?.3:0,
  run:s=>{s.f['t'+k]=1;
   if(s.money<28&&chance(.45)){const fee=s.y<1980?'幾百塊':s.y<1995?'兩千多塊':'五六千塊';return {tone:'bad',cat:'生活',text:`畢業旅行要繳${fee}。我把通知單折起來塞進書包最底層，大家出發的那幾天，我在家看電視。`}}
   const x=tripPick(s,tag);if(!x)return tripFail('畢業旅行，我們只去了附近的風景區，當天來回。');
   const op=k==='g6'?pick(['畢業旅行出發那天，我天還沒亮就醒了，背包裡塞滿零食。','畢業旅行的遊覽車上，全班輪流拿麥克風唱歌，連老師都被逼著唱了一首。'])
     :k==='g9'?pick(['國中的畢業旅行，三天兩夜。晚上睡大通鋪，我們聊天聊到老師來敲門。',s.y<2005?'畢業旅行那幾天，我帶的那捲底片第一天就拍完了。':'畢業旅行那幾天，大家拿著手機一直拍，晚上在房間裡互傳照片。'])
     :pick(['高中的畢業旅行，三天裡有一半的時間在遊覽車上。','畢業旅行的最後一晚，我們在房間裡聊以後要考哪裡，聊到天亮。']);
   const night=k!=='g12'&&!op.includes('晚上')&&chance(.5)?(s.ax.risk>62?'晚上我們偷溜到別班的房間打枕頭仗，被老師抓去走廊罰站。':s.lonely>55?'晚上大家在聊誰喜歡誰，我縮在被子裡假裝睡著。':''):'';
   return {tone:'good',cat:'生活',text:op+tripGo(s,x)+night}}})),
 {id:'trip_fam',p:s=>{if(!TRIP_OK(s))return 0;const kid=s.age>=4&&s.age<=13&&parAlive(s),par=s.age>=27&&s.age<=60&&kidsOf(s).some(k=>k.alive&&s.y-k.by<14);if(!kid&&!par)return 0;
   let p=s.money>60?.004:s.money>40?.002:.0007;if(s.y<1980)p*=.5;if(s.y>=1998)p*=1.4;return p},
  run:s=>{const x=tripPick(s,'fam');if(!x)return tripFail('放假的時候，我們去附近的河邊烤肉，當天就回家了。');
   let op;
   if(s.age<=13){const P=PAR(s);
     op=s.y>=2007&&WEST.includes(s.place)&&WEST.includes(x[0])&&chance(.4)?`${P}帶我們搭高鐵去${x[1]}，當天來回。`
       :s.y<1978?`${P}帶著全家坐公路局的車去${x[1]}，我在車上吐了兩次。`
       :s.y<1990&&s.money<55?`${P}跟朋友借了一台車，全家擠在裡面開去${x[1]}。`
       :`連假，${P}開車載全家去${x[1]}。回程塞在高速公路上，我在後座睡著了。`}
   else op=`連假，我帶著孩子去${x[1]}。`+(s.ax.self<40?'行程都繞著孩子排，我自己什麼也沒逛到。':'');
   return {tone:'good',cat:'生活',text:op+tripGo(s,x)+tripTail(s,false)}}},
 {id:'trip_co',p:s=>working(s)&&TRIP_OK(s)&&s.y>=1970&&['工廠','公司','科技','公教','醫護','服務','營造'].includes(s.job)?(['科技','公司'].includes(s.job)&&s.y>=1990?.0025:.0015):0,
  run:s=>{const x=tripPick(s,'co');if(!x)return tripFail('公司的員工旅遊取消了，聽說是今年的預算不夠。');
   const op=s.job==='公教'?(s.y>=2003&&chance(.5)?`國旅卡的額度要用完，我請了兩天假去${x[1]}。`:`單位辦自強活動，大家坐遊覽車去${x[1]}。`)
     :s.y<1985?`${s.job==='工廠'?'工廠':'公司'}辦員工旅遊，兩台遊覽車一早就停在門口，大家穿上最體面的衣服去${x[1]}。`
     :s.y<2008?`公司的員工旅遊去${x[1]}。遊覽車上，主管拿著麥克風唱卡拉OK，我假裝睡著。`
     :`公司的員工旅遊，大家在群組裡吵了兩個禮拜要去哪，最後還是去了${x[1]}。`;
   return {tone:'good',cat:'生活',text:op+tripGo(s,x)+tripTail(s,true)}}},
 {id:'trip_young',p:s=>s.age>=18&&s.age<=35&&TRIP_OK(s)&&s.y>=1985&&s.money>20?.0012*(.5+(s.ax.risk+s.ax.open)/100):0,
  run:s=>{const x=tripPick(s,'young');if(!x)return tripFail('我本來想跟朋友出去玩，最後大家都說沒空，只好在家睡了一整天。');
   const pt=s.rel&&s.rel.stage!=='met'&&!s.married?partnerOf(s):null;
   const op=pt&&chance(.5)?`我跟${nm(pt)}去${x[1]}玩，這是我們第一次一起出遠門。`
     :s.y<2008?pick([`週末我跟朋友騎機車去${x[1]}。`,`放假的時候，我跟幾個朋友擠一台車去${x[1]}。`])
     :pick([`我在網路上看到${x[1]}的照片，週末就跟朋友殺過去了。`,`連假，我跟朋友訂了民宿去${x[1]}。`]);
   return {tone:'good',cat:'生活',text:op+tripGo(s,x)+tripTail(s,false)}}},
 {id:'trip_honey',p:s=>s.married&&s.t-s.marriedT<=3&&!s.f.honey&&TRIP_OK(s)?.35:0,
  run:s=>{s.f.honey=1;const sp=spouse(s),n=sp?nm(sp):'另一半';
   if(s.y>=1990&&s.money>45&&chance(.55))return {tone:'good',cat:'生活',text:`我們去${pick(s.y<2000?['峇里島','泰國','關島']:['日本','峇里島','普吉島'])}度蜜月。${n}在飯店的陽台上說，以後每年都要出來玩一次。`};
   if(s.money<25&&chance(.5))return tripFail(`婚禮的錢花完了，我們沒去度蜜月。${n}說，等以後有錢再補。`);
   const x=tripPick(s,'honey');if(!x)return tripFail(`我們沒有去度蜜月，婚禮隔天${n}就回去上班了。`);
   return {tone:'good',cat:'生活',text:`結婚以後，我跟${n}去${x[1]}度蜜月。`+tripGo(s,x)}}},
 {id:'trip_old',p:s=>s.age>=60&&s.health>45&&TRIP_OK(s)?.0018:0,
  run:s=>{const x=tripPick(s,'old');if(!x)return tripFail('社區的老人會辦旅遊，我報了名，出發前一天膝蓋痛，只好不去了。');
   const op=s.kids>0&&chance(.4)?`孩子放假，開車載我去${x[1]}走走。`:`社區的老人會辦旅遊，遊覽車一早就停在活動中心門口，我們去了${x[1]}。`;
   const t=chance(.4)?'到了景點，很多人只在停車場附近走一走，就回車上唱歌了。':'';
   return {tone:'good',cat:'生活',text:op+tripGo(s,x)+t}}},
 {id:'trip_pray',p:s=>s.age>=35&&['閩南','客家'].includes(s.eth)&&s.ax.open<58&&TRIP_OK(s)&&s.m>=3&&s.m<=5?(s.eth==='閩南'?.004:.0015):0,
  run:s=>{const daj=s.place==='雲林縣'||(s.place!=='台中縣'&&s.y>=1988&&s.age<65&&chance(.5));
   if(daj){visit(s,'台中縣','trip');visit(s,'彰化縣','trip');return {tone:'good',cat:'生活',text:'我跟著大甲媽祖走了一段遶境的路，腳底起了好幾個水泡。路邊的人家擺了桌子，免費請人吃點心、喝涼水。'}}
   visit(s,'雲林縣','trip');return {tone:'good',cat:'生活',text:'我跟著廟裡的進香團，坐遊覽車到北港朝天宮。回程的車上，大家分著在北港買的大餅，一路唱歌唱到家。'}}},
 {id:'trip_round',p:s=>s.y>=2007&&s.age>=17&&s.age<=32&&!s.f.round&&TRIP_OK(s)&&s.health>55&&(s.ax.risk>58||s.ax.open>62)?.0025:0,
  run:s=>{s.f.round=1;['台北市','台北縣','桃園縣','新竹縣','苗栗縣','台中縣','彰化縣','雲林縣','嘉義縣','台南縣','高雄縣','屏東縣','台東縣','花蓮縣','宜蘭縣'].forEach(c=>visit(s,c,'trip'));key(s,'環島一圈');
   return {tone:'good',cat:'生活',text:s.age<=22&&chance(.6)?'我跟朋友騎腳踏車環島，花了九天繞台灣一圈。騎上壽卡那天，我的腿一直抖，在山頂的超商門口躺了半個鐘頭。'
     :'我跟朋友騎機車環島，七天繞了台灣一圈。在台東的時候，我們坐在超商門口吃泡麵，看著太平洋發呆。'}}},
 {id:'trip_covid',p:s=>s.y>=2020&&s.y<=2022&&s.age>=18&&s.age<=75&&s.money>35&&TRIP_OK(s)?.008:0,
  run:s=>{const stay=x=>['日月潭','阿里山','墾丁','礁溪','澎湖','金門','台南','清境','太魯閣','綠島','小琉球','七星潭','鹿野高台'].includes(x[1]);
   const x=tripPick(s,'fam',stay)||tripPick(s,'young',stay);if(!x)return tripFail('不能出國，我把存好的旅費拿去換了一台新冰箱。');
   return {tone:'neutral',cat:'生活',text:`不能出國，那年連假到處都是人。我訂了${x[1]}的住宿，一晚的價錢跟以前去日本差不多。`+tripGo(s,x)}}},
 {id:'commute',p:s=>s.f.cmtNew&&s.f.cmt&&s.place&&inTW(s.place)?.2:0,run:s=>{const t=cmtText(s);s.f.cmtNew=null;return {tone:'neutral',cat:'生活',text:t}}}];
RE.push(...TRIP);
{const _nl=newLife;newLife=function(by,F){const s=_nl(by,F);visit(s,s.place,'home');return s}}
{const _st=step;step=function(s){const out=_st(s);if(!s.dead)mapTrack(s);return out}}
// cities sitting inside or beside a county: drawn last with an outline so a grey one still shows inside a lit county
const TWCITY=['台北市','基隆市','新竹市','台中市','嘉義市','台南市','高雄市'];
function mapSVG(cls){const M=TWMAP,i=M.inset;
  return `<svg class="tw ${cls}" viewBox="0 0 ${M.w} ${M.h}" role="img" aria-label="台灣縣市地圖"><rect class="tw-inset" x="${i[0]}" y="${i[1]}" width="${i[2]}" height="${i[3]}" rx="3"/>`+(M.inset2?`<rect class="tw-inset" x="${M.inset2[0]}" y="${M.inset2[1]}" width="${M.inset2[2]}" height="${M.inset2[3]}" rx="3"/>`:'')+
    Object.entries(M.c).sort((a,b)=>TWCITY.includes(a[0])-TWCITY.includes(b[0])).map(([c,v])=>`<path data-c="${c}"${TWCITY.includes(c)?' data-city="1"':''} d="${v.d}"><title>${c}</title></path>`).join('')+
    `<g class="tw-dot"><circle class="tw-ring" r="7"/><circle r="3.4"/></g></svg>`}
function mapPaint(svg,s,live){const here=live&&inTW(s.place)?s.place:null,V=s.vis||{};svg.classList.toggle('away',live&&!here);
  svg.querySelectorAll('path').forEach(p=>{const c=p.dataset.c;p.setAttribute('class',(V[c]?'k-'+V[c]:'')+(c===here?' here':''));
    p.firstChild.textContent=c+(V[c]?`・${MAPLBL[V[c]]}`:'')});
  const g=svg.querySelector('.tw-dot');if(here){const v=TWMAP.c[here];g.setAttribute('transform',`translate(${v.x} ${v.y})`);g.style.display=''}else g.style.display='none'}
const awayName=s=>/^[一-鿿]{2,6}$/.test(s.place||'')&&!inTW(s.place)?s.place:'國外';
const mapLegend=()=>`<ul class="tw-leg">${['home','work','trip'].map(k=>`<li><i class="k-${k}"></i>${MAPLBL[k]}</li>`).join('')}<li><i></i>還沒去過</li></ul>`;
function mapInit(){
  const a=document.createElement('aside');a.className='twmap';a.id='twmap';a.setAttribute('aria-label','足跡地圖');
  a.innerHTML=`<div class="tw-top"><h3>足跡</h3><button type="button" class="tw-x" id="twX" aria-label="關閉地圖">✕</button></div>${mapSVG('tw-side')}<p class="tw-now" id="twNow"></p>${mapLegend()}<p class="tw-cnt" id="twCnt"></p>`;
  $('play').append(a);
  const b=document.createElement('button');b.type='button';b.className='twmini';b.id='twMini';b.setAttribute('aria-label','打開足跡地圖');b.setAttribute('aria-controls','twmap');b.innerHTML=mapSVG('tw-mini');
  $('cal').append(b);
  const close=()=>{a.classList.remove('open');b.setAttribute('aria-expanded','false')};
  b.onclick=e=>{e.stopPropagation();const o=a.classList.toggle('open');b.setAttribute('aria-expanded',String(o))};
  $('twX').onclick=close;
  document.addEventListener('click',e=>{if(a.classList.contains('open')&&!a.contains(e.target))close()});
  document.addEventListener('keydown',e=>{if(e.key==='Escape'&&a.classList.contains('open'))close()});
}
function renderMap(){if(!S||!$('twmap'))return;const s=S;document.querySelectorAll('#play svg.tw').forEach(v=>mapPaint(v,s,true));
  const n=Object.keys(s.vis||{}).length,here=inTW(s.place);
  $('twNow').innerHTML=here?`現在在<b>${esc(s.place)}</b>${s.place===s.birthCounty?'（家鄉）':''}`:`現在人在<b>${esc(awayName(s))}</b>，不在台灣`;
  $('twCnt').textContent=`去過 ${n} / ${COUNTIES.length} 個縣市`;
  $('twMini').classList.toggle('away',!here)}
function endMap(s){const V=s.vis||{},by=k=>COUNTIES.map(c=>c[0]).filter(c=>V[c]===k),n=Object.keys(V).length;
  const rows=[['home','住過'],['work','通勤去過'],['trip','旅行去過']].map(([k,l])=>{const L=by(k);return L.length?`<dt>${l}</dt><dd>${L.join('、')}</dd>`:''}).join('');
  const never=COUNTIES.map(c=>c[0]).filter(c=>!V[c]);
  return `<div class="tw-end"><h2 style="font-size:22px;margin-bottom:8px">你走過的台灣</h2><div class="tw-endgrid">${mapSVG('tw-endsvg')}<div>
    <p style="margin:0 0 6px">這一生，你到過 <b>${n}</b> 個縣市。</p><dl class="reg">${rows}</dl>
    ${never.length&&never.length<COUNTIES.length?`<p class="muted small" style="margin:8px 0 0">沒去過：${never.join('、')}</p>`:''}${mapLegend()}</div></div></div>`}
{const _rc=renderCal;renderCal=function(t){_rc(t);renderMap()}}
{const _sum=summary;summary=function(){_sum();const s=S,b=$('end').querySelector('.endbtns');if(!b)return;b.insertAdjacentHTML('beforebegin',endMap(s));
  const v=$('end').querySelector('svg.tw-endsvg');if(v)mapPaint(v,s,false)}}
mapInit();
