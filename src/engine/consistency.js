/* ================= consistency guard ================= */
const parAge=s=>{if(s.parBy===undefined)s.parBy=s.by-(24+Math.floor(R()*10));return s.y-s.parBy};
const parAlive=s=>!s.f.parentdie&&parAge(s)<99;
function splitSent(t){const out=[];let cur='',d=0;for(const ch of t){cur+=ch;if(ch==='「')d++;else if(ch==='」'&&d>0)d--;else if((ch==='。'||ch==='！'||ch==='？')&&d===0){out.push(cur);cur=''}}if(cur)out.push(cur);return out}
const OTHERS=/(大家|同事|別人|朋友|鄰居|親戚|他們|她們|台幹|族人|同學的|人家)/;
function sentOK(s,x){const o=x.replace(/「[^」]*」/g,'');
  if(!parAlive(s)&&/(媽媽|爸爸|爸媽|父母)/.test(o)&&!/(過世|走了|走的時候|留下|告別|生前|以前|小時候|當年|墳|遺|[^我]的(爸媽|爸爸|媽媽))/.test(o))return false;
  if(s.age>=50&&/(阿公|阿嬤|爺爺|奶奶|阿婆|vuvu)/.test(o)&&!/(過世|小時候|以前|當年|孫|我當阿公|我當阿嬤)/.test(o))return false;
  if(s.kids===0&&!s.babyDue&&/(孩子們|我的孩子|兒子|女兒|孫子|孫女|帶孩子|陪孩子|家裡的孩子|孩子的)/.test(o)&&!OTHERS.test(o))return false;
  if(!s.married&&/(老婆|老公|另一半|丈夫|妻子|我們的婚姻|岳父|岳母|公公|婆婆)/.test(o)&&!OTHERS.test(o)&&!/(離婚|過世|前夫|前妻)/.test(o))return false;
  const workW=/(上班|下班|同事|加班|年終|主管|公司開始|公司說)/;
  if(['自營','農'].includes(s.job)&&/(主管|公司聚餐|公司開始|公司說|尾牙|同事|單位)/.test(o)&&!/(以前|當年|孩子|兒子|女兒|朋友|另一半|老公|老婆)/.test(o))return false;
  if((s.age<15||!working(s))&&workW.test(o)&&!/(爸|媽|叔|阿姨|大人|鄰居|哥|姊|姐|他們|她們|不用上班|以前|退休|找工作|孩子|老公|老婆|另一半)/.test(o))return false;
  if(s.age>=25&&!s.studying&&/(放學|上課|考試|作業|班上|同學們|老師說)/.test(o)&&!/(同學會|老同學|以前|小時候|孩子|兒子|女兒|補習班|教書|學生)/.test(o))return false;
  if(s.married&&/(交往|約會|相親|告白|情書)/.test(o)&&!/(以前|當年|孩子|兒子|女兒|朋友)/.test(o))return false;
  if((s.married||s.rel)&&/(告白|情書|暗戀|曖昧|搭訕|交友軟體)/.test(o)&&!/(以前|當年|孩子|兒子|女兒|朋友說|同學在|同事)/.test(o))return false;
  return true}
/* a sentence that leans on the one before it: if that one was dropped, this one goes too */
const LEAN_RX=/^(他們|他|她|它|我贏了|我輸了|結果|後來|所以|可是|但是|但|然後|那天|那時|這|晚上|隔天|回程|回家的路上|說著說著)/;
function guardText(s,t){if(!t)return t;const ss=splitSent(t);const ok=ss.map(x=>sentOK(s,x));if(ok.every(Boolean))return t;if(!ok[0])return '';
  const k=[];for(let i=0;i<ss.length;i++){if(!ok[i])continue;if(i>0&&!ok[i-1]&&LEAN_RX.test(ss[i].trim())){ok[i]=false;continue}k.push(ss[i])}return k.join('')}
/* who of the two parents is still around: a single parent's father never shows up, and after one parent dies the lines speak of the one left */
/* a single parent is 媽媽 unless the parents divorced in your childhood and you stayed with 爸爸 (s.f.withDad) */
const soleP=s=>s.f.withDad?'爸爸':'媽媽';
const dadGone=s=>(s.fam==='單親'&&!s.f.withDad)||!!s.f.dadDie,momGone=s=>(s.fam==='單親'&&!!s.f.withDad)||!!s.f.momDie;
/* raised by grandparents: in childhood the daily care comes from them, not from the parents working away */
const CARE_RX=/(爸爸|媽媽|爸媽)(每天|早上|晚上)?(煮|幫我|牽著我|牽我|帶我|叫我起床|載我|下班回家|陪我|抱著我|哄我|背著我)/;
function grandFix(s,t){if(s.fam!=='隔代教養'||s.age>=12||!t)return t;const el=elders(s),gm=el.slice(-2),gp=el.slice(0,2),hasEl=/(阿公|阿嬤|阿婆|爺爺|奶奶)/.test(t);
  return splitSent(t).map(x=>{if(!CARE_RX.test(x)||/(外婆|外公|越南|印尼|泰國|菲律賓|口音|家長會|回來|放假)/.test(x))return x;if(hasEl)return '';
    return x.replace(/爸媽/g,el).replace(/媽媽/g,gm).replace(/爸爸/g,gp).replace(/他(?!們)/g,/媽媽/.test(x)&&!/爸爸/.test(x)?'她':'他')}).join('')}
function parFix(s,t){if(!t)return t;t=grandFix(s,t);const dg=dadGone(s),mg=momGone(s);if(dg===mg&&!(dg&&s.fam==='單親'))return t;
  const [one,oneMy,gone,goneMy,pr]=dg?['媽媽','我媽','爸爸','我爸','她']:['爸爸','我爸','媽媽','我媽','他'];
  return splitSent(t).map(x=>{if(s.fam==='單親'&&(dg||mg)&&/(分開|離開|離婚|不在|沒有爸爸|沒有媽媽|爸爸那邊|媽媽那邊|爸爸家|媽媽家|親生|再婚)/.test(x))return x;if(s.fam!=='單親'&&/(過世|走了|生前|以前|當年|小時候|還在的時候|那時候|告別式|後事|出殯)/.test(x))return x;
    let y=x.replace(/爸爸跟媽媽|爸爸和媽媽|媽媽跟爸爸|爸媽|父母(?!親)/g,one);
    const rx=new RegExp('(^|[^他她的當做是你叫新有想])('+gone+'|'+goneMy+')','g');
    if(rx.test(y)){if(y.includes(one)||y.includes(oneMy))return '';y=y.replace(rx,(m,a,b)=>a+(b===gone?one:oneMy)).replace(/他(?!們)|她(?!們)/g,pr)}
    return y}).join('')}
function guardOut(s,out){for(let i=out.length-1;i>=0;i--){const e=out[i];if(e.choices||e.death||e.birth)continue;const t=guardText(s,e.text);if(!t||t.length<6){out.splice(i,1);continue}e.text=t}}
//@include data/hv.js
const HV_BG={stu:s=>isStu(s),working:s=>working(s),farm:s=>isFarm(s),fac:s=>isFac(s),gj:s=>isGJ(s),biz:s=>isBiz(s),off:s=>isOff(s),med:s=>isMed(s),old:s=>isOld(s),rich:s=>isRich(s),poor:s=>s.money<35,vic:s=>isVic(s),urban:s=>s.urban,rural:s=>!s.urban};
function hvOK(s,w){if(w.age&&(s.age<w.age[0]||s.age>w.age[1]))return false;
  for(const t of w.trait||[]){const a=t.slice(0,-1),v=s.ax[a];if(v==null)return false;if(t.endsWith('+')?v<58:v>42)return false}
  if(w.eng&&(w.eng==='hi')!==(s.eng>=40))return false;if(w.eth&&!w.eth.includes(s.eth))return false;if(w.region&&!w.region.includes(regionOf(s.place)))return false;
  for(const b of w.bg||[]){const f=HV_BG[b];if(!f||!f(s))return false}if(w.sex&&w.sex!==s.sex)return false;if(w.kids!==undefined&&(!!s.kids)!==w.kids)return false;if(w.married!==undefined&&!!s.married!==w.married)return false;
  if(w.stance&&w.stance!==(s._st||'far'))return false;return true}
function hvPick(s,id){const L=HV[id];if(!L||s._st==='in'||!chance(.7))return null;s._hvU=s._hvU||new Set();
  const c=L.filter(v=>!s._hvU.has(v.text)&&hvOK(s,v.when||{}));if(!c.length)return null;const sc=v=>Object.keys(v.when||{}).length;const best=Math.max(...c.map(sc));const v=pick(c.filter(x=>sc(x)===best));s._hvU.add(v.text);return v.text}
//@include data/reg.js
function regEntry(s,e){const ev=e.ev,a=s.age,kid=a<12,farm=isFarm(s);
  switch(e.ty){
  case '颱風':case '颱風/堰塞湖':{let t=kid?`${ev}來的那天晚上，風把窗戶吹得一直響。`+pick(['停電了，全家點著蠟燭吃泡麵。','隔天早上，巷子裡都是吹斷的樹枝。','爸媽整晚都在拿水桶接漏水。']):`${ev}掃過我們這裡。`+(farm?pick(['田裡的作物全泡在水裡，我站在田埂上，一句話都說不出來。','果樹倒了一大半，今年的收成沒了。']):pick(['我整晚沒睡，一直起來看門口有沒有淹水。','隔天出門，招牌、樹枝倒得到處都是。','家裡停了兩天的電，冰箱裡的東西全壞了。','雨停以後，我跟鄰居一起清了一整天的泥巴。']));
    if(!kid&&farm)fx(s,{money:-4});if(e.dn>=50&&chance(.4))t+='後來新聞說，全台死了好幾十個人。';return {cat:'災難',tone:'bad',text:t}}
  case '乾旱':return {cat:'生活',tone:'bad',text:'好幾個月沒下雨。'+(s.urban?cyc(s,'dryU',['家裡開始分區限水，浴缸先裝滿了水，洗澡只能用水瓢舀。','水庫見底的照片上了新聞。停水那幾天，我們提著水桶去公園的水龍頭排隊。','又限水了。洗菜的水留下來沖馬桶，陽台擺滿了裝水的寶特瓶。']):cyc(s,'dryR',['田裡的水圳乾到見底，大人們為了誰先放水吵了起來。','田裡裂開一條一條的縫。農會說這一期稻作休耕，補助比收成還少。','井裡的水抽不上來，我們每天騎車去親戚家載水。']))};
  case '地震':return {cat:'災難',tone:'bad',text:`${ev}。`+pick(['我被搖醒，抱著棉被衝到門口。','櫃子上的東西掉了一地，牆上多了一條裂縫。','整棟樓搖了好久，我躲在桌子底下，聽到外面有人在尖叫。'])};
  case '地層下陷':return {cat:'生活',tone:'bad',text:'門口的路又墊高了一次，我們家的門檻變得好矮。只要下大雨，一樓就會淹水。'};
  case '水災':return {cat:'災難',tone:'bad',text:'大雨下了一整天，家門口的水淹到了小腿。'+(kid?'我跟鄰居的小孩坐在臉盆裡划來划去，被大人罵了一頓。':'我把家裡的東西一件一件往樓上搬。')};
  case '山崩':return {cat:'災難',tone:'bad',text:'山上的路坍了一大片，進出只能繞遠路。'};
  case '交通':return {cat:'生活',tone:'good',text:`${ev}。`+(kid?'週末爸爸帶全家去走了一趟，我把臉貼在窗戶上看了一路。':working(s)?'我上班的路，一下子快了好多。':'我第一次走這條路，覺得外面的世界好像變近了。')};
  case '空難':return {cat:'災難',tone:'bad',text:`新聞說${ev}。那天晚上，附近好幾戶人家都在打電話問消息。`};
  case '礦災':return {cat:'災難',tone:'bad',text:`${ev}。這裡很多人在礦坑工作，我認識的人裡，有人沒有回來。`};
  case '產業沒落':return {cat:'生活',tone:'bad',text:`${ev}。這裡的工廠一間一間關了，街上的年輕人越來越少。`};
  case '公害':case '公害抗爭':case '環境運動':return {cat:'生活',tone:'bad',text:`${ev}。附近的人都在說空氣和水變了，有人在門口掛起了白布條。`};
  case '兩岸交通':return {cat:'生活',tone:'neutral',text:`${ev}。從這裡坐船到對岸，一下子變得好近。`};
  default:return {cat:'生活',tone:'neutral',text:`${ev}。`+(kid?'大人們在客廳討論了好幾天。':'我們這裡好幾天都在聊這件事。')}}}
function regTL(s){if(s.age<4)return [];const out=[];for(const e of REGD){if(e.y!==s.y||e.m!==s.m||!e.c.includes(s.place))continue;
  if(TL.some(t=>t.y===e.y&&t.m===e.m&&t.cat==='災難'))continue;if(e.c.length>12&&!chance(.4))continue;if(e.k==='t'&&!chance(.6))continue;
  const en=regEntry(s,e);if(en){en._rg=1;out.push(en)}}return out}
//@include data/ct.js
