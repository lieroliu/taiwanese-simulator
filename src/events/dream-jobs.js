/* ================= dream jobs: 歌手、演員、樂團、電競、職棒、漫畫家、布袋戲、YouTuber =================
   Asked once (12–24 歲, before the first job) when that year had the road. 想 can be blocked by the era (eraLog),
   fail for personal reasons (diary only), or get a first break. A break adds the job as an option at the 工作 milestone;
   taking it sets s.job='特殊' and s.sp {k,tier,title}. While on it: its own daily lines, and family, relatives, the
   partner's parents and classmates talk about it. It ends (age, scandal, money) and you look for an ordinary job. */
const DJ={
 star:{w:s=>s.ax.open>58?1.2:.3,y0:1961,age:[13,24],base:.1,taipei:1,t1:'駐唱歌手',t2:'歌手',place:'錄音室',lost:'沒能當上歌手。',
  ask:s=>s.y<1978?'電視上的歌唱比賽，台上唱歌的人跟你差不多大。':s.y<=1998?'電視上的五燈獎，有個跟你差不多大的人唱到了五度五關。':s.y<2007?'有人在 KTV 聽你唱完一首歌，說你應該去參加比賽。':s.y<=2011?'超級星光大道又開放報名了，班上有人說你唱歌很好聽。':'電視上的選秀節目又開始報名了，朋友說你唱歌很好聽。',
  q:'你想不想去試試看當歌手？',block:s=>s.y<1993&&chance(.5)?'那時候電視只有三台，每個新人都在搶同樣那幾個節目':null,
  fail:['我去參加歌唱比賽，第一輪就被淘汰。評審說我「很有勇氣」，我想了一整個晚上這是什麼意思。','我寄了一卷錄音帶給唱片公司，等了三個月，沒有人回。','我在比賽唱到一半忘詞，台下有人笑出聲。我笑著唱完，回家把被子蒙在頭上。'],
  brk:s=>s.y<1985?'我去歌廳試唱，老闆說下個月可以來唱晚上那一場。':s.y>=2007&&s.y<=2011?'我在星光大道唱進了第三輪。有一間經紀公司留了我的電話。':'我在比賽拿了第三名。有一間唱片公司的人在後台給了我一張名片。',
  day:['經紀人說我要再瘦三公斤。我把晚餐的便當推給了旁邊的樂手。','今天在百貨公司門口唱了三首歌，台下站了二十幾個人，有一半在等公車。','我在錄音室把同一句唱了四十次，製作人終於說：「好，這次可以。」'],
  up:'我的歌被選進了一部連續劇當片尾曲。走在路上，聽到便利商店在放。',fan:'有人在夜市認出我，要我在他的衣服上簽名。'},
 actor:{w:s=>s.ax.open>58?1:.3,y0:1962,age:[15,24],base:.1,taipei:1,t1:'臨時演員',t2:'演員',place:'片場',lost:'沒能當上演員。',
  ask:s=>s.y<1990?'報紙上有電視台招考演員訓練班的廣告。':s.y<2005?'電視上的偶像劇演到最後一集，女主角哭得整個台灣都在哭。':'有人在網路上貼了一則徵選演員的消息，還標註了你。',
  q:'你想不想去當演員？',block:s=>s.y<1993&&chance(.5)?'那時候電視只有三台，每個新人都在搶同樣那幾齣戲':null,
  fail:['我去試鏡，導演叫我演一個很生氣的人。我演完，他說：「你是不是在演很餓？」','我去了三次試鏡，三次都沒有消息。第四次，我就沒有去了。','我排了一整天的隊去試鏡，輪到我的時候，他們說人已經找好了。'],
  brk:s=>'我在試鏡會上被叫住了，副導說有一個小角色適合我。',
  day:['我今天演一個路人，NG 了七次，因為我一直偷看鏡頭。','早上五點到片場，等到晚上十點才拍到我那一場，一共兩句台詞。','我在劇裡被車撞，一個下午被撞了十二次。'],
  up:'我演的角色在戲裡死掉的那一集，收視率衝到了第一。',fan:'在捷運上，有個阿姨盯著我看了很久，最後問我：「你是不是那個壞人？」'},
 band:{w:s=>s.ax.rebel>55?1.2:.4,y0:1965,age:[14,24],base:.15,taipei:1,t1:'地下樂團樂手',t2:'樂團樂手',place:'live house',lost:'沒能組成自己的樂團。',
  ask:s=>s.y<1985?'你在唱片行聽到一首西洋搖滾，回家拿掃把當吉他彈了一整晚。':s.y<2000?'你跟同學去 PUB 看了一場樂團表演，回家耳朵一直嗡嗡叫。':'你在海洋音樂祭的沙灘上，看台上的樂團演了一整晚。',
  q:'你想不想組一個樂團？',block:s=>s.y<1995&&chance(.4)?'那時候樂團能表演的地方很少，野台開唱要到 1995 年才辦第一屆':null,
  fail:['我們組了一個樂團，練了三個月，鼓手跑去補習了。','我們第一次上台，貝斯手緊張到彈錯調，台下只有我們的女朋友在拍手。','團裡的人一個一個去考試、當兵、上班，最後練團室只剩我一個人。'],
  brk:s=>'我們在學校的比賽拿了冠軍。一間小唱片行的老闆說，可以幫我們出一張專輯。',
  day:['練團室的冷氣壞了，我們四個人在裡面練到全身濕透。','今天在 live house 演出，台下二十個人，有十五個是朋友。','我們開著借來的廂型車去台中演出，回程在休息站吃了三碗泡麵。'],
  up:'我們的歌在音樂祭上被台下一起大合唱。主唱唱到一半停下來，讓大家唱。',fan:'有人在網路上說，我們的歌陪他度過了最難的那一年。我看了好幾遍。'},
 esports:{w:s=>s.ax.rebel>52||s.ax.risk>55?1.1:.4,y0:2000,age:[15,22],base:.1,t1:'電競選手',t2:'職業電競選手',place:'比賽會場',lost:'沒能當上電競選手。',
  ask:s=>s.y===2012||s.y===2013?'台北暗殺星拿下了英雄聯盟的世界冠軍，你在網咖看完了整場轉播。':s.y<2010?'你在網咖打了一整晚的星海爭霸，旁邊圍了一圈人在看。':'你在網咖打英雄聯盟，隔壁的人說你可以去打職業。',
  q:'你想不想當職業電競選手？',block:s=>s.y<2017&&chance(.4)?'電競要到 2017 年才被法律列為運動，那時候大人都說打電動是不務正業':null,
  fail:['我去戰隊試訓，三天就被刷下來。教練說我的反應很快，只是判斷很慢。','我一個暑假打到了天梯前一千名，開學以後就掉回去了。','我報名了比賽，打到第二場網路斷線。隊友到現在還在怪我。'],
  brk:s=>'我在天梯打進了前一百名。有個戰隊傳訊息給我，問我要不要去試訓。',
  day:['一天練十二個小時，手腕貼滿了痠痛貼布。','我們住在戰隊的宿舍，五個人擠在一間，冰箱裡只有能量飲料。','比賽打輸了，我被網友罵了三百則留言。教練說不要看，我還是一則一則看完。'],
  up:'我們拿到了國內聯賽的冠軍，主辦單位給了一張比人還大的支票。',fan:'有個國中生在比賽會場外面等我，拿他的鍵盤要我簽名。'},
 baseball:{w:s=>s.sex==='M'?(s.ax.risk>50?1:.5):.15,y0:1968,age:[12,19],base:.08,t1:'職棒二軍球員',t2:'職棒選手',place:'球場',lost:'沒能當上職棒選手。',
  ask:s=>s.y<1990?'你半夜爬起來看少棒在美國比賽的轉播，隔天在巷子裡對著牆壁練投球。':'你去球場看了一場職棒，回家把手套放在枕頭旁邊睡覺。',
  q:'你想不想當職棒選手？',block:s=>s.sex==='F'?'台灣一直沒有女子職棒，女生打球打到高中就沒有地方打了':null,
  fail:['我去參加球隊的選拔，跑了三圈操場就吐了。教練拍拍我的肩膀，叫我明年再來。','我練了兩年，最後還是沒被選進校隊。我把手套送給了隔壁的小孩。','我在比賽被觸身球打到手，休息了半年，回來就跟不上了。'],
  brk:s=>'我被選進了學校的棒球隊。比賽的時候，看台上有一個職棒球探在記筆記。',
  day:['客場比賽，我們坐了五個小時的遊覽車到台東。','我在二軍的球場練打擊，太陽大到球棒都燙手。','今天上場代打，三振。回休息區的時候，總教練看都沒看我。'],
  up:'我被升上一軍了。第一次在大球場打擊，看台上有一萬個人在喊。',fan:'有個小朋友在球場外面等我，手上拿著我的球員卡。'},
 comic:{w:s=>s.ax.open<52?1:.4,y0:1961,age:[12,24],base:.12,taipei:1,t1:'漫畫助手',t2:'漫畫家',place:'出版社',lost:'沒能當上漫畫家。',
  ask:s=>s.y<2000?'你在租書店看了一整個下午的漫畫，回家在課本的空白處畫了一整排人物。':'你把自己畫的漫畫放上網路，有一百多個人按讚。',
  q:'你想不想當漫畫家？',block:s=>s.y>=1966&&s.y<=1987&&chance(.6)?'那時候漫畫要送國立編譯館審查，很多台灣的漫畫家都停筆了':null,
  fail:['我把稿子寄去出版社投稿，三個月後被退了回來，信封裡只有一張印好的回條。','我畫了一整個暑假，畫到第二十頁，發現主角的臉每一頁都長得不一樣。','我參加漫畫比賽，得了佳作，獎品是一盒網點紙。'],
  brk:s=>'我投稿的短篇得了新人獎。出版社的編輯打電話來，問我有沒有在畫長篇。',
  day:['截稿前一晚，我跟另一個助手在桌上趴著睡了兩個小時。','我今天一整天都在幫老師畫背景，畫了四十扇窗戶。','編輯說這一話的劇情要改。我把畫好的十二頁收進抽屜。'],
  up:'我的漫畫出了單行本。我去書店看了三次，偷偷把它擺到比較前面。',fan:'簽書會上，排在最前面的是一個國中生，她把我畫的角色畫得比我還好。'},
 puppet:{w:s=>s.eth==='閩南'?1:.4,y0:1970,y1:1992,age:[10,20],base:.2,t1:'布袋戲團學徒',t2:'布袋戲主演',place:'廟口的戲台邊',lost:'沒能把布袋戲學下去。',
  ask:s=>s.y<1975?'電視上的史艷文又出場了，全班隔天都在學他講話。':'廟口在演布袋戲，你在台下一直看到散場。',
  q:'你想不想去學布袋戲？',block:s=>s.y>=1974&&s.y<=1982&&chance(.4)?'1974 年，電視上的布袋戲被停播，戲班的工作越來越少':null,
  fail:['我去戲班拜師，師傅叫我先學搬戲台。搬了一個月，我的腰比我的手先放棄了。','我學了半年的口白，一開口還是像在念課文。','爸媽說學這個以後沒飯吃，把我帶回了家。'],
  brk:s=>'師傅說我的手很巧，讓我在戲台後面幫忙拿尪仔。',
  day:['跟著戲班去廟口演戲，台下只有三個阿伯和一隻狗。','今天一個人配了七個角色的聲音，下戲以後喉嚨啞了。','中元節一個月演了二十場，我在卡車後面睡著了好幾次。'],
  up:'我第一次當主演。戲演完，廟公塞了一個紅包給我，說演得比師傅年輕時還好。',fan:'有個老阿嬤每場都坐在第一排，今天她帶了一袋自己種的橘子給我。'},
 youtuber:{w:s=>s.ax.open>55?1.2:.4,y0:2014,age:[13,24],base:.2,t1:'YouTuber',t2:'全職 YouTuber',place:'網聚',lost:'沒能靠拍影片過日子。',
  ask:s=>s.y>=2016&&chance(.4)?'你開了一次直播，有 12 個人進來看，其中 3 個是親戚。':'你拍了一支開箱影片放上 YouTube，竟然有 300 個人看。',
  q:'你想不想當 YouTuber？',block:s=>null,
  fail:['我拍了二十支影片，訂閱人數停在 87 人。其中一個是我媽。','我有一支影片突然爆紅，下一支的觀看數又變回兩百。','我花了三天剪一支影片，留言區第一則是「聲音好小」。'],
  brk:s=>'我有一支影片衝上了發燒影片。訂閱數一個禮拜多了三萬人。',
  day:['一支影片被酸民留言洗版，我看到半夜。','我今天拍了一整天，只剪出八分鐘能用的畫面。','廠商寄了一箱業配的零食來，我吃到第三包就不想再吃了。'],
  up:'我的頻道訂閱破了十萬，YouTube 寄來一個銀色的獎牌。',fan:'在捷運站有人小聲問我：「你是不是那個 YouTuber？」我點頭，她開心到跳起來。'}};
const DJ_LBL=k=>'去當'+DJ[k].t1;
const djOK=(s,k,d)=>s.y>=d.y0&&(!d.y1||s.y<=d.y1)&&s.age>=d.age[0]&&s.age<=d.age[1];
function djPick(s){const L=Object.keys(DJ).filter(k=>djOK(s,k,DJ[k]));if(!L.length)return null;return pickW(L,k=>DJ[k].w(s))}
const djTitle=s=>s.sp?(s.sp.tier>=2?DJ[s.sp.k].t2:DJ[s.sp.k].t1):'';
MS.push({id:'dream',choice:1,check:s=>!s.f.dream&&s.age>=10&&s.age<=24&&!working(s)&&!s.married&&!abroad(s)&&chance(.003)&&!!(s._dk=djPick(s)),run:s=>{s.f.dream=1;const k=s._dk,d=DJ[k];
  return {cat:'人生',title:'夢想',text:d.ask(s)+d.q,choices:[
  {label:'想',go:s=>{s.f.dreamK=k;const why=d.block(s);
    if(why){eraLog(s,'e_dj_'+k,d.lost,eraWhyLine(s,why),1.6);return `雖然我很想，但${why}。`+pick(['我把這件事放在心裡，誰都沒說。','我還是偷偷練，練到隔壁的人來敲門。','我把貼在牆上的海報撕下來，捲好收進衣櫃。'])}
    let p=d.base*(s.inc==='高'?1.4:s.inc==='低'?.7:1)*(d.taipei&&inTaipei(s)?1.3:1);
    if(!chance(p))return pick(d.fail);
    s.sp={k,tier:1,ready:1};key(s,'第一次有機會當'+d.t1);if(!working(s)&&!s.studying&&(s.job==='失業'||!s.job)&&s.age>=16)s.needJob=true;
    return d.brk(s)+(s.studying||s.age<18?'我想等畢業以後，再認真走這條路。':'')}},
  {label:'不想',go:s=>pick(['我覺得這只是看看就好。隔天，我照常去上學。','我想了一下，還是算了。這種事，留給電視上的人去做。','我把這個念頭放著。後來每次看到電視上的人，都會想起那一天。'])}]}}});
/* the 工作 milestone offers the dream job to whoever got a break; an era that has no such job yet blocks it */
const djStartBlock=s=>s.sp.k==='baseball'&&s.y<1990?'那時候台灣還沒有職業棒球，中華職棒要到 1990 年才開打':s.sp.k==='esports'&&s.y<2008?'那時候台灣幾乎還沒有領薪水的電競戰隊':null;
const djParents=s=>!parAlive(s)?'':s.y<1990||s.inc==='低'?pick(['爸爸聽到以後，三天沒跟我講話。','媽媽說：「這個能當飯吃嗎？」我說可以，她不相信。','爸爸只說了一句：「隨便你，以後不要回來哭。」']):pick(['媽媽說好，可是要我先去考一張證照放著。','爸媽說試試看也好，反正還年輕。','爸爸說他年輕的時候也想過，後來去上班了。'])+'';
{const J=MS.find(x=>x.id==='job'),jr=J.run;J.run=s=>{const sp=s.sp,e=jr(s);if(!e||!e.choices||!sp||!sp.ready||s.age<16)return e;sp.ready=0;const d=DJ[sp.k],why=djStartBlock(s);
  if(why){eraLog(s,'e_dj_'+sp.k,d.lost,eraWhyLine(s,why),1.8);e.text=`你本來想去當${d.t1}，可是${why}。`+e.text;return e}
  e.choices.unshift({label:DJ_LBL(sp.k),go:s=>{s.job='特殊';s.jobStart=s.t;sp.on=1;sp.y0=s.y;fx(s,{risk:6,self:4});key(s,'當上了'+d.t1);
    sat(s,'sp_'+sp.k,`當過${d.t1}。`,`身邊的人都去上班了，我還是決定去當${d.t1}`,1.8);
    return `我去當了${d.t1}，一個月的收入，有時候一萬，有時候三千。`+djParents(s)}});return e}}
Object.keys(DJ).forEach(k=>{LEAN['job:'+DJ_LBL(k)]={risk:1,self:.5};PULL['job:'+DJ_LBL(k)]=s=>4});
Object.assign(LEAN,{'dream:想':{risk:.6,open:.5},'dream:不想':{risk:-.4}});
Object.assign(PULL,{'dream:想':s=>clamp((s.ax.risk+s.ax.open-90)/10,.4,3),'dream:不想':s=>1});
{const cf=ctxFor;ctxFor=function(s,id){
  if(id==='dream'){if(s.y<1990||s.inc==='低')return {text:'身邊的大人都說，這種事不能當飯吃',norm:['不想']};
    if(['esports','youtuber'].includes(s._dk)&&s.y>=2015)return {text:'班上好幾個同學也有一樣的夢想',norm:['想']};return {text:'身邊的朋友說，你可以去試試看',norm:[]}}
  return cf(s,id)}}
/* the job itself: its title, its pay, and the way the life runs while on it */
Object.assign(JOBLABEL,{'特殊':'特殊職業'});JM['特殊']=.7;JOB_T['特殊']=34;
{const jt=jobTitle;jobTitle=s=>s.job==='特殊'&&s.sp?djTitle(s):jt(s)}
{const mi=myIncome;myIncome=function(s){if(s.job!=='特殊'||s.studying||!s.sp)return mi(s);return wageY(s.y)*(s.sp.m||.6)*regM(s)}}
function djEnd(s,why,txt){const sp=s.sp,d=DJ[sp.k];sp.on=0;sp.end=s.y;s.job='失業';s.needJob=true;s.f.locDone=1;key(s,'不再當'+djTitle(s));
  s.q.push({cat:'人生',tone:'neutral',pri:1,text:txt});if(why)eraLog(s,'e_dje_'+sp.k,'沒能一直當'+djTitle(s)+'。',eraWhyLine(s,why),1.5)}
{const y0=yearly;yearly=function(s){y0(s);const sp=s.sp;if(!sp||!sp.on)return;
  if(s.job!=='特殊'){sp.on=0;sp.end=s.y;return}
  const d=DJ[sp.k],yrs=s.y-sp.y0;sp.m=sp.tier>=2?1.4+R()*1.2:.4+R()*.45;
  if(sp.tier<2&&yrs>=1&&chance(.09*(s.ax.risk>55?1.3:1))){sp.tier=2;fx(s,{money:8,self:3});key(s,'成了小有名氣的'+d.t2);
    sat(s,'sp2_'+sp.k,`成了小有名氣的${d.t2}。`,d.up.replace(/。.*$/,''),2.4);s.q.push({cat:'人生',tone:'good',pri:1,text:d.up});return}
  if(sp.k==='baseball'&&s.y>=1997&&s.y<=1999&&chance(.35))return djEnd(s,'職棒爆發簽賭案，球隊一隊一隊解散',`球團宣布解散了。我把球衣摺好收進箱子，第二天開始去找工作。`);
  const old=(sp.k==='esports'&&s.age>=26)||(sp.k==='baseball'&&s.age>=33)||(s.age>=40&&sp.tier<2);
  const pq=old?.5:sp.tier>=2?.07:.17+(s.money<20?.15:0);
  if(chance(pq))djEnd(s,null,old?(sp.k==='esports'?'我的反應慢了，二十六歲，在這一行已經算老了。我宣布退役，把鍵盤送給了隊上的新人。':sp.k==='baseball'?'球團沒有跟我續約。我在球場的置物櫃前坐了很久，才把東西收完。':`我決定不再當${djTitle(s)}了。這一行，年輕人一個接一個上來。`):
    pick([`我算了算這一年的收入，決定不再當${djTitle(s)}了。我去找了一份每個月固定領薪水的工作。`,`房租又漲了。我把${djTitle(s)}這條路先放下，開始投履歷。`,`${s.age} 歲那年，我跟自己說，再試一年。那一年過完，我去找了一份正職。`]))}}
/* what the people around you say about it */
const djPT=s=>{const p=partnerOf(s);return p&&!s.married&&s.rel?p:null};
PE.push(
 {id:'sp_day',p:s=>s.job==='特殊'&&s.sp?.03:0,run:s=>({tone:'neutral',cat:'生活',text:pick(DJ[s.sp.k].day)})},
 {id:'sp_fan',p:s=>s.job==='特殊'&&s.sp&&s.sp.tier>=2?.03:0,run:s=>{fx(s,{lonely:-3});return {tone:'good',cat:'生活',text:DJ[s.sp.k].fan}}},
 {id:'sp_kin',p:s=>s.job==='特殊'&&s.sp&&s.m===2?.3:0,run:s=>({tone:'neutral',cat:'家庭',text:s.sp.tier>=2?pick(['過年回家，親戚的小孩拿著手機要跟我合照。阿伯問我一個月賺多少，我說不一定，他點點頭，好像懂了又好像沒懂。','過年拜拜的時候，廟裡有人認出我，阿嬤在旁邊笑得比我還開心。']):
   pick([`過年回家，阿姨問我現在在做什麼。我說${djTitle(s)}，她停了兩秒，說：「那有勞保嗎？」`,`除夕吃年夜飯，舅舅問我${djTitle(s)}能做到幾歲。整桌都安靜下來，等我回答。`,`過年回家，表哥說他同事的兒子也在做這個，後來去考了公務員。說完，他夾了一塊雞肉給我。`])})},
 {id:'sp_par',p:s=>s.job==='特殊'&&s.sp&&parAlive(s)?.012:0,run:s=>({tone:'neutral',cat:'家庭',text:s.sp.tier>=2?pick(['媽媽把我上電視的那一段錄下來，在菜市場放給攤販看。','爸爸在里民大會上說我是他兒子，'.replace('兒子',s.sex==='F'?'女兒':'兒子')+'說完自己先不好意思了。']):
   pick([`媽媽打電話來，問我${djTitle(s)}能做到幾歲，要不要去考個公職。`,'爸爸寄了一箱米上來，裡面夾了一張報紙的求職廣告。','媽媽說隔壁的孩子考上了銀行，說完又說：「你開心就好。」'])})},
 {id:'sp_pt',p:s=>s.job==='特殊'&&s.sp&&djPT(s)&&!s.f.spPt?.05:0,run:s=>{s.f.spPt=1;const p=djPT(s);return {tone:'neutral',cat:'家庭',text:`第一次去見${nm(p)}的爸媽。${p.sex==='F'?'她':'他'}爸爸聽到我是${djTitle(s)}，沉默了很久，最後問我：「那你以後打算做什麼？」`}}},
 {id:'sp_mate',p:s=>s.job==='特殊'&&s.sp&&s.age>=22?.008:0,run:s=>({tone:'neutral',cat:'生活',text:s.sp.tier>=2?'同學會上，大家輪流跟我拍照。班長說他早就知道我會紅，我記得他以前說我上課太吵。':`同學會上，大家在聊房貸和小孩。有人問我還在當${djTitle(s)}嗎，我說對，他說：「好羨慕喔。」我聽不出來他是不是真的羨慕。`})},
 {id:'sp_broke',p:s=>s.job==='特殊'&&s.sp&&s.sp.tier<2?.02:0,run:s=>{fx(s,{money:-3});return {tone:'bad',cat:'生活',text:pick(['這個月的收入只有八千塊。我跟朋友借了房租，答應他下個月請他吃飯。','我在便利商店打工補收入，有個客人認出我，我假裝他認錯人了。','這個月接不到工作，我每天吃泡麵，加一顆蛋算是加菜。'])}}},
 {id:'sp_back',p:s=>s.sp&&s.sp.end&&s.job!=='特殊'&&!s.f.spBack&&s.y-s.sp.end>=5?.01:0,run:s=>{s.f.spBack=1;const d=DJ[s.sp.k];
   return {tone:'good',cat:'生活',text:s.sp.k==='baseball'||s.sp.k==='esports'?`有人在網路上翻出我當年比賽的影片，留言說：「這不是那個${d.t1}嗎？」我看了三遍，沒有留言。`:`有人在網路上翻出我當${djTitle(s)}時候的東西，留言說好懷念。我點了一個讚，又偷偷收回來。`}}});
/* office talk does not fit this job: a partner met 在公司 is met where the job happens, and lines about 主管、尾牙、同事 are dropped */
{const st=step;step=function(s){const out=st(s);if(s.job!=='特殊'||!s.sp)return out;const pl=DJ[s.sp.k].place;
  for(let i=out.length-1;i>=0;i--){const e=out[i];if(!e.text||e.choices)continue;e.text=e.text.replace(/(在公司|在單位上|在廠裡)(認識)/g,`在${pl}$2`);
    if(!e._re?.startsWith('sp_')&&/(主管|尾牙|公司聚餐|同事|打卡|加班|上班|下班|老闆)/.test(e.text)&&!/(以前|當年|孩子|兒子|女兒|朋友|另一半|老公|老婆|同學)/.test(e.text))out.splice(i,1)}
  return out}}
