/* ================= people: names and their own lives ================= */
const SUR=[['陳',11],['林',8],['黃',6],['張',5],['李',5],['王',4],['吳',4],['劉',3],['蔡',3],['楊',3],['許',2],['鄭',2],['謝',2],['郭',2],['洪',2],['邱',1.5],['曾',1.5],['廖',1.5],['賴',1.5],['徐',1.5],['周',1.5],['葉',1.3],['蘇',1.3],['莊',1.2],['呂',1.2],['江',1],['何',1],['蕭',1],['羅',1],['高',1]];
const SUR_HK=[['徐',6],['彭',5],['羅',5],['劉',5],['邱',5],['鍾',5],['陳',5],['曾',4],['張',4],['黃',4],['溫',3],['謝',3],['范',3],['李',3],['吳',3],['傅',2],['古',2]];
const SUR_WS=[['王',5],['張',5],['李',5],['劉',4],['陳',4],['楊',3],['趙',3],['孫',3],['周',3],['馬',2],['胡',2],['朱',2],['高',2],['宋',2],['徐',2],['何',2]];
const GN={
 4:{M:['文德','金城','清水','振興','明輝','榮華','正義','進財','天賜','金水'],F:['秀英','玉蘭','美珠','秀蘭','月娥','玉珠','碧霞','素月','金枝','阿嬌']},
 5:{M:['志明','建宏','俊傑','文雄','明德','志成','國華','正雄','俊雄','文彬','金龍','榮輝'],F:['淑芬','美玲','淑惠','秀琴','麗華','雅惠','美惠','淑娟','秀鳳','玉梅','麗玲','素貞']},
 6:{M:['志偉','家豪','建志','俊宏','志豪','政宏','信宏','宗翰','建銘','志遠','文傑','俊賢'],F:['雅婷','怡君','佩君','淑君','雅雯','怡婷','靜宜','惠如','佳慧','怡如','美君','佩玲']},
 7:{M:['家豪','冠宇','志豪','宗翰','承翰','彥廷','柏翰','俊宇','建宇','冠廷','家銘','哲瑋'],F:['雅婷','怡君','詩涵','雅筑','佳穎','怡萱','欣怡','思妤','佳蓉','宜庭','筱涵','郁婷']},
 8:{M:['冠廷','承恩','柏宇','宇翔','彥廷','冠宇','家瑋','品睿','柏翰','宇軒','子豪','承翰'],F:['詩涵','宜蓁','欣妤','品妍','子涵','雅筑','思妤','郁婷','宜庭','詩婷','芷瑄','佳穎']},
 9:{M:['承恩','宥廷','品睿','宸睿','子睿','柏睿','宇恩','恩碩','冠霖','宥宇','承睿','睿恩'],F:['品妍','子晴','詠晴','羽彤','苡安','宥蓁','芯妤','可晴','語彤','子芸','宜蓁','品蓁']},
 10:{M:['宥辰','睿恩','承睿','宸佑','宥翔','恩宇','品睿','晨睿'],F:['苡晴','語彤','沐恩','恩綺','芊妤','宥晴','品希','若晞']}};
const GN_WS={M:['建國','國強','家駿','德明','維新','立群','繼光','志強'],F:['曉薇','慧敏','怡文','文琪','雅琳','小萍','慧君','瑞芬']};
const GN_IND={M:['瓦歷斯','馬耀','比令','尤幹','拉罕','巴勇','吉努','阿道','法拉度斯','達努'],F:['巴奈','伊萬','莎韻','雅外','比黛','瑪雅','阿布娥','慕娃','娃利','卡娃']};
const GN_VN=['阮氏玉蘭','黎氏秋香','陳氏梅','范氏蓉','武氏花','阮氏清'], GN_ID=['西蒂','黛維','努莉','莉娜','阿妮'];
const cohIdx=by=>by<1961?4:by<=1970?5:by<=1980?6:by<=1990?7:by<=2000?8:by<=2010?9:10;
const rollSur=eth=>pickW(eth==='客家'?SUR_HK:eth==='外省'?SUR_WS:SUR,x=>x[1])[0];
function rollGiven(s,by,sex,eth){const avoid=(s.people||[]).map(p=>p.given).concat(s.given?[s.given]:[]);
  const L=eth==='外省'&&by<1985&&chance(.45)?GN_WS[sex]:GN[cohIdx(by)][sex];const c=L.filter(x=>!avoid.includes(x));return pick(c.length?c:L)}
const pr=p=>p.sex==='M'?'他':'她';
function nm(p){if(!p)return '他';if(p.callTribal)return p.tribal;if(p.foreign)return p.given.length>2?'阿'+p.given.slice(-1):p.given;
  if(p.role==='teacher')return p.sur+'老師';if(p.role==='mentor')return p.sur+(p.sex==='M'?'大哥':'姐');
  if(p.role==='friend'&&p.sex==='M'&&p.by<1985)return '阿'+p.given.slice(-1);return p.given}
const fullName=p=>(p.sur||'')+p.given+(p.tribal?`（${p.tribal}）`:'');
function nameSelf(s){const eth=s.eth==='新住民子女'?'閩南':s.eth;s.sur=rollSur(eth);s.given=rollGiven(s,s.by,s.sex,s.eth);s.tribal=s.eth==='原住民'?pick(GN_IND[s.sex]):null}
function pJob(p,y){if(y<1985)return pickW([['農',p.by<1960?3:1],['工廠',4],['營造',p.sex==='M'?2:0],['服務',2],['自營',2],['公教',1.5],['公司',1.5]],x=>x[1])[0];
  if(y<2005)return pickW([['工廠',3],['營造',p.sex==='M'?1:0],['服務',3],['自營',2],['公教',1.5],['公司',3],['科技',1],['醫護',.6]],x=>x[1])[0];
  return pickW([['工廠',1.5],['服務',3],['自營',1.5],['公教',1.5],['公司',3.5],['科技',1.3],['醫護',.8]],x=>x[1])[0]}
function mkPerson(s,role,o={}){
  const by=o.by??s.by, sex=o.sex??(chance(.5)?'M':'F');
  const eth=o.eth??(chance(.7)&&s.eth!=='新住民子女'?s.eth:pickW([['閩南',70],['客家',13],['外省',12],['原住民',3]],x=>x[1])[0]);
  const p={id:s.people.length+1,role,by,sex,eth,sur:o.sur??rollSur(eth),given:'',tribal:null,foreign:o.foreign||null,alive:true,dyY:null,job:o.job||null,married:false,story:[],
    ax:{self:50+(R()-.5)*40,risk:50+(R()-.5)*40},health:80};
  if(o.foreign){p.sur='';p.given=o.foreign==='越南'?pick(GN_VN):pick(GN_ID)}else p.given=rollGiven(s,by,sex,eth);
  if(eth==='原住民'){p.tribal=pick(GN_IND[sex]);p.callTribal=chance(.5)}
  p.wantKids=clamp(.5+(50-p.ax.self)/80+(by<1975?.2:0));
  if(!p.job&&s.y-by>=22&&role!=='kid')p.job=pJob(p,s.y);
  s.people.push(p);return p}
const spouse=s=>s.people.find(p=>p.role==='spouse'&&p.alive);
const kidsOf=s=>s.people.filter(p=>p.role==='kid');
const friendsOf=s=>s.people.filter(p=>p.role==='friend'&&p.alive&&!p.lost);
const partnerOf=s=>s.people.find(p=>p.id===s.f.ptId);
function storyAdd(s,p,txt){p.story.push(`${s.y} 年${txt}`)}
/* a friend the diary has not mentioned yet gets a few words saying who they are */
const frIntro=p=>p.shown?'':pick(['認識很多年的朋友','老朋友','很要好的朋友']);
function friendOf(s){const a=friendsOf(s);return a.length?pick(a):null}
const WPL=s=>({'公教':'單位','工廠':'廠裡','醫護':'醫院','營造':'工地','服務':'店裡','科技':'公司','公司':'公司','台幹':'廠裡'}[s.job]||'公司');
function newFriend(s,o={}){return mkPerson(s,'friend',{by:s.by+Math.round((R()-.5)*(s.age<45?4:12)),sex:chance(.7)?s.sex:(s.sex==='M'?'F':'M'),...o})}
const BAD_Y=new Set([1974,1975,1982,1983,1998,2001,2002,2008,2009,2020]);
const hardY=y=>BAD_Y.has(y)?1:0;
function qPush(s,e){s.q.push(e)}
function onPDeath(s,p,a){
  if(p.role==='spouse'){s.married=false;s.f.widowed=1;s.f.widowY=s.y;fx(s,{lonely:20,health:-5});key(s,`${nm(p)}過世`);
    qPush(s,{pri:3,cat:'家庭',tone:'bad',text:a<60?`${nm(p)}走了，才 ${a} 歲。我到現在還會在吃飯的時候，多拿一副碗筷。`:`${nm(p)}先走了。家裡突然安靜得可怕，${pr(p)}的拖鞋還放在門口，我一直捨不得收。`});return}
  if(p.role==='kid'){fx(s,{lonely:15,health:-8});key(s,`孩子${nm(p)}過世`);
    qPush(s,{pri:3,cat:'家庭',tone:'bad',text:`${nm(p)}走了，才 ${a} 歲。白髮人送黑髮人，告別式上我站都站不穩。`});return}
  if(p.role==='friend'&&!p.lost&&chance(.75)){fx(s,{lonely:5});
    qPush(s,{pri:2,cat:'生活',tone:'bad',text:a<50?`接到電話，說${nm(p)}走了，才 ${a} 歲。我拿著電話，很久說不出話。`:`${nm(p)}走了。告別式上看著${pr(p)}的照片，我想起我們${s.age<40?'年輕的時候':'以前'}一起${pick(['逛夜市','騎車去海邊','在巷口聊到半夜','唱 KTV'])}的樣子。`})}
}
function peopleYearly(s){
  for(const p of s.people){if(!p.alive||['partner'].includes(p.role))continue;const a=s.y-p.by;if(a<0)continue;
    if(chance(annualQ({age:a,y:s.y,sex:p.sex,health:p.health,hbv:true}))){p.alive=false;p.dyY=s.y;storyAdd(s,p,`過世，${a} 歲`);onPDeath(s,p,a);continue}
    if(a>=60)p.health-=1;
    if(!p.job&&a>=22&&p.role!=='kid')p.job=pJob(p,s.y);
    if(p.job&&p.job!=='退休'&&a>=63){p.job='退休'}
    const n=nm(p),ta=pr(p);
    if(p.role==='friend'&&!p.lost){
      if(!p.married&&a>=23&&a<=36&&chance(.12)){p.married=true;storyAdd(s,p,'結婚');if(chance(.35))qPush(s,{cat:'生活',tone:'good',text:!s.married&&s.age>=28?`${n}結婚了，我去喝喜酒。看著台上的${ta}，我想到自己。`:`${n}結婚了。喜宴上${ta}喝得滿臉通紅，一桌一桌敬酒。`})}
      else if(!p.away&&a>=25&&s.y>=1992&&s.y<=2012&&['工廠','公司'].includes(p.job)&&chance(.025)){p.away='中國';storyAdd(s,p,'去中國工作');if(chance(.6))qPush(s,{cat:'生活',tone:'neutral',text:`${n}說要去${pick(['東莞','昆山','上海'])}的台商工廠上班。臨走前我們喝到半夜，${ta}說三年就回來。`})}
      else if(p.away&&chance(.06)){p.away=null;storyAdd(s,p,'回到台灣');if(chance(.5))qPush(s,{cat:'生活',tone:'neutral',text:`在對岸待了好幾年的${n}回台灣了。${ta}說那邊變得太快，回來反而覺得台灣好慢。`})}
      else if(p.job==='自營'&&chance(.03+.08*hardY(s.y))){p.job='服務';storyAdd(s,p,'生意失敗');if(chance(.5))qPush(s,{cat:'生活',tone:'bad',text:`${n}打電話來，說店收起來了。電話那頭${ta}一直說沒事，我聽得出來不是。`})}
      else if(p.married&&a>=30&&a<=60&&chance(.008)){p.married=false;storyAdd(s,p,'離婚');if(chance(.4))qPush(s,{cat:'生活',tone:'neutral',text:`聽說${n}離婚了。${ta}約我出來吃飯，什麼都沒提，我也沒問。`})}
      else if(!p.sick&&a>=45&&chance(.012)){p.sick=1;p.health-=30;storyAdd(s,p,'生了重病');if(chance(.6))qPush(s,{cat:'健康',tone:'bad',text:`聽說${n}生病了，我去醫院看${ta}。${ta}瘦了好多，還是笑著跟我說沒事。`})}
      else if(s.age>30&&chance(.02)){p.lost=true;storyAdd(s,p,'跟你漸漸沒聯絡');if(chance(.3))qPush(s,{cat:'生活',tone:'neutral',text:`翻到以前的照片，才發現我跟${n}已經好多年沒聯絡了。`})}
    } else if(p.role==='spouse'){
      if(['公司','工廠','科技','營造','服務'].includes(p.job)&&chance(.006+.05*hardY(s.y))){p.job='失業';storyAdd(s,p,'被裁員');fx(s,{money:-6});scar(s,`${nm(p)}被裁員以後，家裡只剩一份薪水`,2,.2);qPush(s,{cat:'家庭',tone:'bad',text:`${n}被公司裁員了。那天晚上${ta}坐在陽台，${p.sex==='M'?'抽了好幾根菸':'一個人坐到半夜'}。我沒說什麼，只是把燈留著。`})}
      else if(p.job==='失業'&&chance(.6)){p.job='服務';storyAdd(s,p,'找到新工作')}
      else if(['公司','科技','公教','醫護'].includes(p.job)&&a<55&&chance(.02)){storyAdd(s,p,'升職');if(chance(.5))qPush(s,{cat:'家庭',tone:'good',text:`${n}升職了。我們去吃了一頓好的，${ta}難得喝了兩杯。`})}
      else if(!p.sick&&a>=50&&chance(.012)){p.sick=1;p.health-=25;storyAdd(s,p,'生了重病');fx(s,{money:-4,lonely:4});qPush(s,{cat:'家庭',tone:'bad',text:`${n}檢查出${pick(['癌症','心臟的毛病','糖尿病'])}。我開始陪${ta}跑醫院，在候診區一坐就是一整個早上。`})}
    } else if(p.role==='kid'){
      if(a===16&&s.habits&&s.habits.length&&!p.heard){p.heard=1;const hb=pick(s.habits);qPush(s,{cat:'家庭',tone:'neutral',text:`${n}跟我頂嘴的時候，我忍不住又說了那句：「${hb.say}」${n}翻了個白眼，回房間把門關上。`})}
      else if(a===18&&!p.edu){const uni=chance(s.y>=2000?.8:clamp(.15+s.money/130));p.edu=uni?'大學':'高中';storyAdd(s,p,uni?'考上大學':'高中畢業就去工作');
        qPush(s,{cat:'家庭',tone:'good',text:uni?`${n}考上了大學，要去${pick(['台北','台中','高雄','台南','花蓮'])}讀書。我幫${ta}把行李搬上車，${ta}頭也不回就走了。`:`${n}高中畢業就去工作了。領到第一份薪水，${ta}買了一雙鞋給我。`})}
      else if(a===23&&!p.job){p.job=pJob(p,s.y)}
      else if(!p.married&&a>=26&&a<=40&&chance(s.y<2005?.12:.07)){p.married=true;storyAdd(s,p,'結婚');if(chance(.8))qPush(s,{cat:'家庭',tone:'good',text:`${n}結婚了。${s.y<2000?'喜宴辦了三十桌':'婚禮不大，只請了親近的人'}。看著${ta}走上台，我想起${ta}小時候${pick(['跌倒不肯哭的樣子','黏著我不放的樣子','第一天上學的樣子'])}。`})}
      else if(!p.away&&a>=22&&s.y>=1995&&chance(.015)){p.away=pick(['上海','美國','日本','澳洲','新加坡']);storyAdd(s,p,`去${p.away}工作`);fx(s,{lonely:5});qPush(s,{cat:'家庭',tone:'neutral',text:`${n}要去${p.away}工作了。去機場送機回來，我在車上一句話都沒說。`})}
    }
  }
}
/* aspirations: what I want vs. what happens */
function failFx(s){s.fails=(s.fails||0)+1;if(s.ax.rebel>58||s.ax.risk>58){fx(s,{rebel:3,risk:2});return '我很不甘心。'}fx(s,{risk:-3,rebel:-2});return s.fails>=3?'我開始覺得，人生很多事不是努力就有用。':''}
const jobFail=(j,txt)=>s=>{s.job=j;s.jobStart=s.t;return typeof txt==='function'?txt(s):txt};
const majFail=m=>s=>{const n=pick(['理工','商管','文法'].filter(x=>x!==m));s.major=n;s.edu='大學';s.studying='大學';s.studyEnd=s.t+48;if(!['北','away'].includes(regionOf(s.place)))s.pend='uniloc';key(s,`考上大學，讀${n}`);return `可是分數差了一點，我被分發到${n}科系。`};
function houseBurden(s){return (s.y<1988?1:s.y<2000?1.6:s.y<2010?1.5:2.4)*(inTaipei(s)?1.6:1)}
const spWork=s=>{const sp=spouse(s);return sp&&sp.job&&!['失業','家管','退休'].includes(sp.job)};
function marryP(s){const pt=partnerOf(s);let f=.1;if(pt&&pt.eth!==s.eth&&(pt.eth==='外省'||s.eth==='外省')&&s.y<1990)f+=.15;if(s.money<25)f+=.1;return 1-f}
function uniFailWhy(s){const sc=activeScar(s);if(sc&&chance(.6))return sc.phrase+'，我沒辦法專心念書';if(s.money<30&&chance(.5))return '考前那幾個月，我放學還要去打工';if(s.fam==='家人久病'&&chance(.5))return '考前家裡的人又住院了，我在醫院走廊念書';
  if(uniRate(s.y)<.4)return `那年的錄取率只有${Math.round(uniRate(s.y)*100)}%`;return pick(['考數學的時候，我的腦袋一片空白','我就是差了那幾分'])}
function techRate(y){return y<1996?.35:y<2000?.55:y<2005?.8:.92}
const ASP={
 after10:{'去補習班':{p:s=>s.money>=45?.97:s.money>=30?.75:.55,fail:s=>{fx(s,{study:2});return `可是${s.y<1985?'補習費對我們家來說太貴了':'那陣子家裡手頭很緊'}，媽媽說以後再說。我只好每天放學就回家，自己寫參考書。`}},
  '學才藝':{p:s=>s.money>=65?.9:.6,fail:s=>'可是學了半年，爸媽說學費太貴，就停了。那台鋼琴後來一直蓋著布。'}},
 m15:{'讀五專':{p:s=>clamp(.3+s.study/100*.7,.2,.95),fail:s=>{s.edu='高職';s.studying='高職';s.studyEnd=s.t+36;return '可是五專的分數差了一點，我只好去讀高職。'}}},
 major:{'醫護':{p:s=>clamp((s.study-55)/35,.15,.9),fail:majFail('醫護')},'師範':{p:s=>clamp((s.study-35)/40,.3,.9),fail:majFail('師範')},'理工':{p:.85,fail:majFail('理工')},'商管':{p:.85,fail:majFail('商管')},'文法':{p:.9,fail:majFail('文法')}},
 uniloc:{'北上讀書':{p:s=>s.money<30?.55:.97,fail:s=>{fx(s,{self:-3});return '可是算了算台北的房租和生活費，家裡負擔不起。最後我選了家鄉附近的學校，週末還能回家幫忙。'}}},
 loc:{'北上打拼':{p:s=>.85-.3*hardY(s.y)-(s.edu==='大學'?0:.1),fail:s=>{fx(s,{lonely:4,money:-4});return `可是我北上找了三個月的工作，${hardY(s.y)?'那年景氣很差，到處都在裁員':'投出去的履歷都沒有回音'}。存款見底，我只好回到家鄉。`}},
  '先出國打工度假':{p:.9,fail:s=>{s.whUntil=0;return '可是簽證名額一下就被搶光了，我沒搶到，只好先在台灣找工作。'}}},
 job:{'進科學園區':{p:s=>.85-.35*hardY(s.y),fail:jobFail('公司','可是那年科技業正在裁員，園區的公司都不缺人。我先進了一間小公司。')},
  '進公司上班':{p:s=>(s.edu==='大學'?.9:.75)-.25*hardY(s.y)-(s.y>=2009&&s.y<=2013?.1:0),fail:jobFail('服務',s=>`可是我投了幾十封履歷，${hardY(s.y)?'那年景氣很差，':''}都沒有消息。我只好先去${s.y>=1990?'便利商店':'餐廳'}打工。`)},
  '進工廠':{p:s=>s.y<2000?.97:.8,fail:jobFail('服務','可是附近的工廠一間一間關了，我只好去做服務業。')},
  '去中國當台幹':{p:.7,fail:jobFail('公司','可是公司最後派了別人過去，我留在台灣的辦公室。')},
  '去學校教書':{p:s=>s.y<2004?.95:.45,fail:jobFail('服務','可是那幾年少子化，教甄名額少得可憐。我當了三年代課老師，最後去補習班教書。')},
  '做小生意':{p:s=>s.money>=25?.9:.6,fail:jobFail('工廠','可是我籌不到開店的錢，親戚也不肯借。我只好先去上班，把開店的夢想收起來。')}},
 marry:{'結婚':{p:marryP,fail:s=>{const pt=partnerOf(s),n=nm(pt);pt.role='ex';storyAdd(s,pt,'跟你分手');s.f.noMarryUntil=s.t+24;fx(s,{lonely:8});
   const r=pt.eth!==s.eth&&(pt.eth==='外省'||s.eth==='外省')&&s.y<1990&&chance(.7)?`${n}的爸媽反對，說省籍不同，生活習慣合不來`:s.money<25&&chance(.7)?`${n}家裡嫌我們家沒錢，${s.sex==='M'?'聘金':'嫁妝'}的事一直談不攏`:pick(['我們為了婚後要住哪裡吵了好幾個月',`${n}說${pr(pt)}還沒準備好`,'兩家人為了聘金和喜餅的事鬧得很僵']);
   return `可是${r}。拖了一年多，我們還是分手了。`}}},
 house:{'買':{p:s=>clamp(.97-(houseBurden(s)-1)*.18-(s.money<35?.25:0)+(spWork(s)?.1:0),.15,.97),fail:houseFail},'買（貸三十年）':{p:s=>clamp(.6+(spWork(s)?.15:0),.2,.9),fail:houseFail}},
 layoff:{'轉行':{p:s=>s.age<45?.75:.5,fail:s=>{s.job='服務';fx(s,{money:-4});return `可是職訓結業以後，沒有公司想用 ${s.age} 歲的新人。我最後去當了${s.sex==='M'?'保全':'清潔人員'}。`}},
  '開早餐店':{p:s=>s.money>=20?.9:.6,fail:s=>{s.job='服務';return '可是頂店的錢比我想的多太多，積蓄不夠。我只好先去別人的早餐店幫忙。'}}},
 parentill:{'送安養中心':{p:.7,fail:s=>{s.f.caring=1;fx(s,{self:-6,lonely:4});return '可是附近的安養中心都要排隊，排了半年還是沒有床位。這段時間，我只能自己照顧。'}},
  '請外籍看護':{p:.85,fail:s=>{s.f.caring=1;fx(s,{self:-4,money:-3});return '可是申請看護要等，等了好幾個月才來。那段時間，我白天上班、晚上照顧，瘦了好幾公斤。'}}},
 divorce:{'離婚':{p:.8,fail:s=>{s.f.separated=1;fx(s,{lonely:10});const sp=spouse(s);return `可是${sp?nm(sp):'對方'}不肯簽字。我們就這樣分居，名義上還是夫妻。`}}},
 retire:{'退休':{p:s=>s.money<28?.35:.97,fail:s=>{s.f.retireAsk=s.t+36;return '可是我算了算存款和退休金，根本不夠過下半輩子。我只好繼續做下去。'}}},
 old:{'跟孩子住':{p:.7,fail:s=>{fx(s,{lonely:12});s.f.alone=1;const ks=kidsOf(s).filter(k=>k.alive),k=ks.length?pick(ks):null;return `可是${k?nm(k):'孩子'}家太小，${pick(['孩子的另一半也有意見','孩子工作忙，常常不在家'])}。最後我還是一個人住。`}}}};
function houseFail(s){s.house=null;const lowInc=s._hp&&(s._hp.price*.7*.065)>(myIncome(s)+spIncome(s))*.6;return `可是${lowInc?'銀行算了我的薪水，說貸不到這麼多':s.y>=1987&&s.y<=1990?'房價一個月漲一次，我存錢的速度根本追不上':'頭期款差太多，銀行也不肯多貸'}。看了半年的房子，最後還是繼續租。`}
/* built-in rolls inside go(): odds for the difficulty tag only */
const ODDS={m15:{'考高中':s=>clamp(.15+s.study/100*.8+(s.y>=2001?.15:0)+(s.y>=2014?.1:0),.1,.95)},uni:{'考大學':s=>clamp(uniRate(s.y)*(.7+s.study/100),.05,.98)},
 job:{'考公職':s=>clamp(.25+s.study/150,.1,.75)},kid:{'生':s=>s.age<30?.9:s.age<35?.8:.55,'再生一個':s=>s.age<30?.9:s.age<35?.8:.55},layoff:{'找同樣的工作':s=>s.age<45?.7:.4}};
function oddsOf(s,id,label){const a=ASP[id]&&ASP[id][label];if(a)return typeof a.p==='function'?a.p(s):a.p;const o=ODDS[id]&&ODDS[id][label];return o?o(s):1}
/* personality lean of each option: + means the right side of the axis */
const LEAN={'去補習班':{rebel:-1},'回家幫忙':{self:-1,risk:-.5},'學才藝':{open:1},'跟朋友到處玩':{risk:1,rebel:.5},
 '考高中':{rebel:-.5},'讀高職':{risk:-.5,self:-.5},'讀五專':{risk:-.3},'去工作':{self:-1},
 '考大學':{open:.5,rebel:-.3},'直接去工作':{self:-.7,risk:-.3},'重考一年':{risk:.5,self:.5},
 '理工':{risk:.3},'商管':{risk:-.3,self:.5},'文法':{open:1,rebel:.7},'醫護':{self:-.5,rebel:-.3},'師範':{risk:-1,rebel:-.5},
 '北上讀書':{risk:1,self:.7,open:.5},'留在家鄉附近':{self:-1,risk:-.7},'留在台北':{risk:-.7,self:-.5},'留在家鄉':{risk:-.7,self:-.7},'北上打拼':{risk:1,self:.7},'先出國打工度假':{risk:1,open:1,self:.5},
 '去學校教書':{risk:-1},'考公職':{risk:-1,rebel:-.5},'進科學園區':{risk:.3,self:.3},'去醫院工作':{self:-.5},'進公司上班':{risk:-.3},'進工廠':{risk:-.5,self:-.3},'做小生意':{risk:1.2,rebel:.5},'回家幫忙種田':{self:-1,open:-.7,risk:-.5},'去中國當台幹':{risk:1,self:.7},
 '見面，然後結婚':{self:-.5,risk:.5},'不要':{risk:-.3},'結婚':{self:-1,open:-.5},'marry:先不要':{self:1,open:.7},'kid:先不要':{self:.7},
 '生':{self:-1,open:-.5},'再生一個':{self:-1,open:-.5},'一個就好':{self:.3},'不生':{self:1,open:1},
 '買':{risk:-.5,self:-.3},'買（貸三十年）':{risk:-.3,self:-.3},'買（新青安四十年）':{risk:.2,self:-.3},'繼續租':{risk:.3,self:.5,open:.3},'住家裡':{self:-1,open:-.5},
 '找同樣的工作':{risk:-1},'轉行':{risk:.7,open:.5},'開早餐店':{risk:1},'提早退休':{self:.5},'跟過去':{risk:1},'留在台灣':{risk:-1,self:-.3},
 '自己照顧':{self:-1.2,open:-.5},'請外籍看護':{open:.5},'送安養中心':{self:1,open:.7},'離婚':{self:1,rebel:.7,open:.7},'撐下去':{self:-1,open:-.7,rebel:-.5},
 '退休':{self:.5},'繼續工作':{self:-.3},'跟孩子住':{self:-.7,open:-.7},'自己住':{self:.7,risk:.3},'住安養中心':{open:.7}};
function leanScore(s,id,label){const l=LEAN[id+':'+label]||LEAN[label];if(!l)return 0;let v=0;for(const k in l)v+=l[k]*(s.ax[k]-50);return v}
function choiceTags(s,e,c,ctx){const t=[];const sc=leanScore(s,e.id,c.label);
  if(sc>=10)t.push(['me','像我會做的事']);else if(sc<=-10)t.push(['notme','不太像我']);
  if(ctx&&ctx.norm.includes(c.label))t.push(['norm','身邊的人多半這樣選']);
  const sp=spouse(s);if(sp&&e.id==='kid'){if(['生','再生一個'].includes(c.label)&&sp.wantKids>.6)t.push(['sp',`${nm(sp)}也想要`]);if(['不生','先不要','一個就好'].includes(c.label)&&sp.wantKids>.6)t.push(['notme',`${nm(sp)}會失望`])}
  return t}
function autoChoose(s,e){const ctx=ctxFor(s,e.id),sp=spouse(s);
  return pickW(e.choices,c=>{let w=Math.exp(clamp(leanScore(s,e.id,c.label),-30,30)/20);if(ctx&&ctx.norm.includes(c.label))w*=1.4;if(sp&&e.id==='kid'&&['生','再生一個'].includes(c.label))w*=.6+sp.wantKids;const pull=PULL[e.id+':'+c.label]||PULL[c.label];if(pull)w*=pull(s);return w})}
/* era pull: what most people of that cohort actually ended up doing (calibrated to cohort statistics, est.) */
const PULL={'考高中':s=>1.6,'考大學':s=>2.2,'重考一年':s=>1.6,'marry:結婚':s=>(1+Math.max(0,s.age-25)*.35)*(s.by<1980?1.8:1.2),'marry:先不要':s=>s.by<1980?.5:.8,
 '買':s=>s.by<1980?2.6:2.4,'買（貸三十年）':s=>1.5,'買（新青安四十年）':s=>1.6,'繼續租':s=>.6,'生':s=>s.by<1975?2.4:3.6,'kid:先不要':s=>.6,'不生':s=>.35,'再生一個':s=>s.by<1970?2.4:2.2,'一個就好':s=>.6,'兩個就好':s=>s.by<1965?.6:1.5};
const AFTER={
 marry:{'先不要':s=>{const pt=partnerOf(s);if(pt){pt.role='ex';storyAdd(s,pt,'跟你分開')}}},
 parentill:{'自己照顧':s=>scar(s,`我要照顧中風的${s.f.illP||'爸爸'}，每天下班就往醫院跑`,5,.2)},
 kid:{'不生':s=>{const sp=spouse(s);if(sp&&sp.wantKids>.6){s.f.kidConflict=1;fx(s,{lonely:5})}}},
 divorce:{'離婚':s=>{const sp=spouse(s);if(sp){sp.role='ex';storyAdd(s,sp,'跟你離婚')}}}};
function doChoice(s,e,c){const a=ASP[e.id]&&ASP[e.id][c.label];const job0=s.job;let text,fail=false;const sc=activeScar(s);
  const scarHit=sc&&CONSEQ[c.label]&&chance(sc.w);
  if(scarHit){if(a)a.fail(s);else if(c.label==='退休')s.f.retireAsk=s.t+36;text=`可是${sc.phrase}，${CONSEQ[c.label]}`;text+=failFx(s);fail=true}
  else if(a&&!chance(typeof a.p==='function'?a.p(s):a.p)){text=a.fail(s);text+=failFx(s);fail=true}
  else{text=c.go(s);const h=AFTER[e.id]&&AFTER[e.id][c.label];if(h)h(s);
    if(c.label==='考大學'&&s.pend==='major'&&sc&&sc.w>=.3&&chance(.45)){s.pend=null;s.edu='高中';setNeedJob(s);key(s,'考上大學，但沒錢去讀');s.f.noUniY=s.y;s.f.noUniMoney=`，你考上了大學，可是${sc.phrase.replace(/^我/,'你')}，沒錢去讀`;text=`我考上了大學。可是${sc.phrase}，學費湊不出來。我把錄取通知單收進抽屜，去找了工作。`+failFx(s);fail=true}}
  if(s.job!==job0)s.jobStart=s.t;clampAll(s);return {text,fail,cmp:s.track?cmpLine(s):null}}

/* overrides: events that now involve named people */
function meetPartner(s){const older=s.sex==='M'?-1:1;const by=s.by+older*Math.floor(R()*5);const pt=mkPerson(s,'partner',{by,sex:s.sex==='M'?'F':'M'});s.f.ptId=pt.id;return pt}
function meetTxt(s,pt){const how=s.y<1980?pick(['經人介紹相親，認識了','在工廠認識了','在同鄉會認識了']):s.y<2005?pick(['在公司認識了','朋友介紹，認識了','大學聯誼的時候認識了','在朋友的生日派對上認識了']):pick(['在公司認識了','朋友介紹，認識了',s.y>=2013?'在交友軟體上認識了':'在網路上認識了']);
  return `我${how}${nm(pt)}。${pr(pt)}${pt.job?'是'+JOBLABEL[pt.job]:'還在讀書'}，我們在一起${pick(['一年多','兩年','好幾年'])}了。`}
(()=>{const M=id=>MS.find(x=>x.id===id),P=id=>PE.find(x=>x.id===id)||RE.find(x=>x.id===id);
 const un=MS.find(x=>x.id==='uni'),uc=un.check,ur=un.run;un.check=s=>uc(s)||(['高職','五專'].includes(s.studying)&&s.y>=1994&&s.t>=s.studyEnd);
 un.run=s=>{const d=s.studying;if(d==='高中')return ur(s);s.studying=null;s.edu=d;return {cat:'人生',title:'要不要繼續讀',text:`${d}畢業了。要繼續考${d==='五專'?'二技':'四技二專'}嗎？`,choices:[
   {label:'考大學',go:s=>{if(chance(clamp(techRate(s.y)*(.6+s.study/100),.1,.97))){s.major=pick(['理工','商管']);s.edu='大學';s.tech=1;s.studying='大學';s.studyEnd=s.t+(d==='五專'?24:48);key(s,'考上科技大學');return `我考上了${d==='五專'?'二技':'科技大學'}。`}
     setNeedJob(s);return '可是'+uniFailWhy(s)+'，我沒考上，只好先去工作。'+failFx(s)}},
   {label:'直接去工作',go:s=>{setNeedJob(s);return '我決定不讀了，早點出社會賺錢。'}}]}};
 const mar=M('marry'),orig=mar.run;mar.run=s=>{const e=orig(s);const pt=meetPartner(s);e.text=e.text.replace('我遇到了一個想一起生活的人。',meetTxt(s,pt)).replace('要結婚嗎？',`要跟${nm(pt)}結婚嗎？`);
   const go=e.choices[0].go;e.choices[0].go=s=>{const r=go(s);pt.role='spouse';storyAdd(s,pt,'跟你結婚');return r};return e};
 const fw=M('foreignwife'),fo=fw.run;fw.run=s=>{const e=fo(s);const go=e.choices[0].go;e.choices[0].go=s=>{const sp=mkPerson(s,'spouse',{by:s.by+10+Math.floor(R()*8),sex:'F',eth:'新住民',foreign:chance(.75)?'越南':'印尼',job:'家管'});storyAdd(s,sp,'嫁來台灣跟你結婚');
   return go(s).replace('她一開始',`${nm(sp)}一開始`)};return e};
 const dv=M('divorce'),dvo=dv.run,dvc=dv.check;dv.check=s=>!s.f.separated&&dvc(s)&&(!s.f.kidConflict||chance(.67)?true:chance(.5))&&(!spouse(s)||chance(clamp(.6+(spouse(s).ax.self-50)/100,.2,1)));
 dv.run=s=>{const e=dvo(s);const sp=spouse(s);if(sp)e.text=`我跟${nm(sp)}的婚姻出了問題，吵架越來越多。要離婚嗎？`;return e};
 M('spousedie').check=()=>false;
 const bi=M('birth');bi.run=s=>{s.babyDue=0;s.kids++;s.kidBorn.push(s.t);fx(s,{lonely:-6,self:-6,risk:-3});const sp=spouse(s);
   const k=mkPerson(s,'kid',{by:s.y,eth:s.eth==='新住民子女'?'閩南':s.eth,sur:s.sex==='M'||!sp?s.sur:(sp.sur||s.sur)});storyAdd(s,k,'出生');key(s,`${k.given}出生`);
   return {cat:'家庭',text:s.kids===1?`我的孩子出生了，我們幫${pr(k)}取名叫${k.given}。`+(s.sex==='F'?'坐月子那一個月，麻油雞吃到怕，半夜每三個小時就要起來餵一次奶。':`我在產房外面走來走去，${sp?nm(sp):'太太'}被推出來的時候，臉白得像紙。`)+'抱著那個小小的身體，我第一次覺得自己真的是大人了。':`${['','第一','第二','第三','第四','第五','第六'][Math.min(6,s.kids)]}個孩子${k.given}出生了。`+(s.kids===2?'家裡變得更擠，也更吵了。':s.kids===3?'家裡又多了一張嘴，飯桌要再加一張椅子。':'家裡已經習慣這種吵了。')}};
 const gk=M('grandkid'),gkc=gk.check;gk.check=s=>gkc(s)&&kidsOf(s).some(k=>k.married&&k.alive);
 gk.run=s=>{s.f.gk=1;fx(s,{lonely:-8});key(s,'有了孫子');const k=pick(kidsOf(s).filter(k=>k.married&&k.alive));storyAdd(s,k,'有了孩子');
   return {cat:'家庭',text:`${nm(k)}生了孩子，我當${s.sex==='M'?'阿公':'阿嬤'}了。抱著孫子，我想起${nm(k)}剛出生時的樣子。`}};
 const fr=P('friend');fr.p=s=>friendsOf(s).length<5?.0012:0;fr.run=s=>{fx(s,{lonely:-10});const cw=s.age>=18&&s.age<45&&working(s)&&!['農','自營','退休','家管','失業'].includes(s.job)&&chance(.5);const p=newFriend(s,cw?{job:s.job}:{});if(cw)p.metAs='同事';storyAdd(s,p,cw?'成為你的同事':'跟你成為朋友');const n=nm(p);
   return {cat:'生活',text:s.age<18?`我跟班上的${n}變成很要好的朋友，我們什麼話都說。`:cw?`${WPL(s)}新來的${n}跟我很合得來，下班常常一起去吃飯。`:s.age<45?`我認識了${n}，我們很聊得來。`:`我在社區大學認識了${n}，我們每週一起爬山。`}};
 const lo=P('loss'),loo=lo.run;lo.run=s=>{const ol=friendsOf(s).filter(p=>s.y-p.by>=50);if(!ol.length)return loo(s);const p=pick(ol);p.alive=false;p.dyY=s.y;storyAdd(s,p,`過世，${s.y-p.by} 歲`);fx(s,{lonely:8});
   return {cat:'生活',text:`${nm(p)}過世了。告別式上，我看見許多多年沒見的臉，大家都老了。`}};
 const le=P('lend');le.run=s=>{s.f.lend=1;fx(s,{money:-6,lonely:5});const p=friendOf(s)||newFriend(s);const iv=frIntro(p);p.lost=true;storyAdd(s,p,'跟你借錢後失聯');
   return {tone:'bad',cat:'生活',text:`${iv}${nm(p)}跟我借了一筆錢，說下個月就還。後來${pr(p)}就不接我的電話了。我心疼的不是錢。`}};
 const gu=P('guarantee'),guo=gu.run;gu.run=s=>{if(s.age<18)return guo(s);fx(s,{money:-18,lonely:4});key(s,'幫人作保被拖累');const p=friendOf(s)||newFriend(s);const iv=frIntro(p);p.lost=true;storyAdd(s,p,'讓你作保後跑路');
   return {cat:'家庭',text:`我幫${iv}${nm(p)}作保，${pr(p)}跑了，銀行找上了我。我們再也沒有聯絡。`}};
 const cr=P('crush');cr.run=s=>{s.f.crush=(s.f.crush||0)+1;const p=mkPerson(s,'crush',{by:s.by+Math.round((R()-.5)*2),sex:s.sex==='M'?'F':'M'});const n=nm(p);const r=R();
   if(r<.35){storyAdd(s,p,'寫情書給你');return {tone:'good',cat:'人生',text:`我收到人生第一封情書，是${n}寫的，夾在課本裡。我假裝不在意，回家卻偷偷看了好幾遍，後來藏了好多年。`}}
   if(r<.7){storyAdd(s,p,'是你暗戀的人');return {tone:'neutral',cat:'人生',text:`我喜歡上隔壁班的${n}，每天下課都故意經過${pr(p)}們教室，一句話也沒說過。`}}
   fx(s,{lonely:4});storyAdd(s,p,'跟別人在一起');return {tone:'bad',cat:'人生',text:`我喜歡的${n}跟別人在一起了。我在棉被裡哭了一整晚，隔天照樣去上課。`}};
 const te=P('teacher');te.run=s=>{s.f.teacher=1;fx(s,{study:6,lonely:-4});const p=mkPerson(s,'teacher',{by:s.by-25-Math.floor(R()*15)});storyAdd(s,p,'當過你的老師');
   return {tone:'good',cat:'人生',text:`${nm(p)}特別照顧我，說我是可以讀書的料。那是我第一次覺得，自己被人看見了。`}};
 const me=P('mentor');me.run=s=>{s.f.mentor=1;fx(s,{study:3,lonely:-4});const p=mkPerson(s,'mentor',{by:s.by-8-Math.floor(R()*8),job:working(s)?s.job:undefined});storyAdd(s,p,'在工作上帶過你');
   return {tone:'good',cat:'人生',text:`${WPL(s)}的前輩${nm(p)}很照顧我，教我做事的方法，也教我怎麼看人臉色。`}};
 const kidName=s=>{const ks=kidsOf(s).filter(k=>k.alive);return ks.length?pick(ks):null};
 const kg=P('kidgood');kg.run=s=>{s.f.kidgood=1;const k=schoolKid(s);return {tone:'good',cat:'家庭',text:`${k&&k.by!=null?nm(k):'孩子'}拿了一張獎狀回家。我把它貼在冰箱上，每次開冰箱都會看一眼。`}};
 const kb=P('kidbad');kb.run=s=>{s.f.kidbad=1;const k=schoolKid(s,7);return {tone:'bad',cat:'家庭',text:`${k&&k.by!=null?nm(k):'孩子'}在學校跟人打架，我被叫去學校道歉。回家的路上，我們誰都沒說話。`}};
 const kl=P('kidleave');kl.run=s=>{s.f.kidleave=1;fx(s,{lonely:6});const k=kidName(s);return {tone:'neutral',cat:'家庭',text:`${k?nm(k):'孩子'}搬出去住了。我站在${k?pr(k):'他'}空掉的房間門口，想起${k?pr(k):'他'}小時候在這裡哭著不肯睡覺。`}};
})();

