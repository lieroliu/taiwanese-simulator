/* ================= rent: 雅房、套房、整層 =================
   Whenever you start renting, marry, have the first child or move, you pick how much to rent (money.js rentY prices it
   from local house prices). The tier keeps pulling mood: 雅房 saves money but wears you down, 整層 costs more and feels like home. */
const renting=s=>s.cash!==undefined&&(s.age>=18||working(s))&&!s.studying&&!atHome(s)&&s.house!=='own'&&s.house!=='family'&&!abroad(s);
const rentKey=s=>s.place+'|'+(s.married?1:0)+'|'+(s.kids>0?1:0);
const fmtRent=v=>{const m=v*1e4/12;return m>=1e4?(Math.round(m/1e3)/10)+' 萬':Math.round(m/100)*100+' 塊'};
const RENT_TXT={
 '雅房':['我租了一間雅房，跟別人共用浴室。房間小到只放得下一張床和一張書桌。','我租了一間雅房。晚上躺在床上，聽得到隔壁的人在講電話。'],
 '套房':['我租了一間小套房，有自己的浴室，雖然窗戶對著別人家的牆。','我租了一間套房。不大，但門一關，就是我自己的地方。'],
 '整層':['{we}租了一整層公寓，有客廳、有廚房，週末可以在家煮飯。','我租了一整層的舊公寓，房租不便宜，但回家的時候覺得是真的回到家。']};
const RENT_LIFE={
 '雅房':['室友半夜洗澡，熱水器轟轟響，我又被吵醒了。','冰箱裡我的牛奶又被喝掉了一半。','房東說下個月要漲房租。我看著那間連窗戶都沒有的房間，不知道該不該搬。','夏天的雅房像蒸籠，我常常在便利商店待到半夜才回去。'],
 '套房':['我在套房裡用電鍋煮了一鍋滷肉，整個房間都是醬油的味道。','樓上又在裝潢，電鑽聲從早上響到晚上。','租約到期，房東說要漲一千。我想了想，還是續約了。'],
 '整層':['朋友來家裡吃火鍋，客廳擠了七八個人，鍋子一直冒煙。','每個月繳完房租，我都會算一下，這些錢加起來，好像可以付一間房子的頭期了。','陽台上的盆栽長得很好，我開始覺得這裡就是家。']};
MS.push({id:'rent',choice:1,check:s=>renting(s)&&s._rentKey!==rentKey(s),run:s=>{const first=!s._rentKey;s._rentKey=rentKey(s);
  const P=t=>rentY(Object.assign(Object.create(s),{rentTier:t}));
  const why=first?'要開始自己租房子了。':s.kids>0&&!s.f.rentKid?'孩子出生了，家裡越來越擠。':s.married&&!s.f.rentMar?'結婚了，要找兩個人住的地方。':'搬到新的地方，要重新找房子。';
  if(s.kids>0)s.f.rentKid=1;if(s.married)s.f.rentMar=1;
  const go=t=>s=>{s.rentTier=t;fx(s,t==='雅房'?{lonely:4}:t==='整層'?{lonely:-2}:{});return pick(RENT_TXT[t]).replace('{we}',s.married?'我們':'我')+`每個月房租 ${fmtRent(P(t))}。`};
  return {cat:'生活',title:'租房子',text:`${why}這附近雅房一個月大約 ${fmtRent(P('雅房'))}，套房 ${fmtRent(P('套房'))}，整層公寓 ${fmtRent(P('整層'))}。我要租哪一種？`,
   choices:[{label:'租雅房',go:go('雅房')},{label:'租套房',go:go('套房')},{label:'租整層',go:go('整層')}]}}});
/* auto-run leans on money, marriage and children */
PULL['rent:租雅房']=s=>(s.married?.15:1.4)*(s.kids>0?.2:1)*(s.money<40?1.6:.8);
PULL['rent:租套房']=s=>(s.kids>0?.5:1.2);
PULL['rent:租整層']=s=>(s.married?2.2:.35)*(s.kids>0?2:1)*(s.money>60?1.5:.8);
LEAN['rent:租雅房']={risk:-.3,self:-.3};LEAN['rent:租整層']={self:.5,risk:.3};
VERB['租雅房']='租雅房';VERB['租套房']='租套房';VERB['租整層']='租整層公寓';
{const cf=ctxFor;ctxFor=function(s,id){if(id!=='rent')return cf(s,id);
  if(s.kids>0)return {text:'有小孩的朋友，都租整層的公寓',norm:['租整層']};
  if(s.married)return {text:'剛結婚的朋友，多半租一層小公寓',norm:['租整層','租套房']};
  return {text:regionOf(s.place)==='北'?'在台北工作的年輕人，大多租雅房或小套房':'同年紀的人，多半租套房',norm:regionOf(s.place)==='北'?['租雅房','租套房']:['租套房']}}}
MOOD_C['租雅房']=-2;MOOD_C['租整層']=2;
/* the tier keeps pulling mood while you live there */
{const mt=moodTarget;moodTarget=function(s){let t=mt(s);if(renting(s)&&s.rentTier){const crowd=s.kids>0||s.married;
   t+=s.rentTier==='雅房'?(crowd?-8:-4):s.rentTier==='套房'?(s.kids>0?-4:0):3}return clamp(t,5,95)}}
{const y0=yearly;yearly=function(s){y0(s);if(!renting(s)){if(s.house==='own'||s.house==='family')s._rentKey=null;return}
  if(s.rentTier&&chance(.12)){const L=RENT_LIFE[s.rentTier],i=s.f.rentLn=(s.f.rentLn||0)+1;if(i<=L.length)s.q.push({cat:'生活',tone:s.rentTier==='雅房'?'bad':'neutral',text:L[(i-1)%L.length]})}}}
