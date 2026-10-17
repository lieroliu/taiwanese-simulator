/* ================= minigames: a few moments the player does by hand =================
   Paddy 2026-10-17: at three moments the choice popup becomes a small hands-on game. The odds stay the game's own:
   - 選填志願 (every era): you order the five 科系 on a 志願卡; you land on the first one your grades reach (same rule as the
     科系 options, so a 醫護 put first can miss).
   - 跟會標會 (1970–1995, adults): you name your 標金; the other 會腳's top bid is rolled, highest bid takes the pot.
     Taking it early (死會) costs the interest but softens a later 倒會.
   - 大家樂 (1985–1987): you pick two digits (or ask 土地公 for a 明牌); the draw is 1 in 100. Children pick for their dad.
   The UI (ui/minigame.js) puts its answer in s._gv before doChoice; auto-run leaves it empty and each go() picks by personality.
   會錢 sizes and bids are rough estimates (估算). */
const gv=s=>{const v=s._gv;delete s._gv;return v};
/* the label the game lands on, from the player's answer */
function gameResolve(e,v){const g=e.game;if(g.type==='wish'){const ok=e.choices.map(c=>c.label);return v.find(l=>ok.includes(l))||ok[0]}
  return v&&v.skip?g.off:g.on}
/* --- 選填志願: wraps the 科系 choice --- */
{const mj=MS.find(x=>x.id==='major'),mr=mj.run;mj.run=s=>{const e=mr(s);const all=e.choices.map(c=>c.label);
  e.game={type:'wish',all,exam:s.y<=2001?'大學聯考':'分發'};e.text=e.text.replace('我要讀什麼？','我要怎麼填志願？');
  e.choices.forEach(c=>{const go=c.go;c.go=s=>{const v=gv(s);const t=go(s);if(!v||!v.length||v[0]===c.label)return t;
    const n=v.indexOf(c.label)+1,first=v[0];
    return (first==='醫護'?'我把醫科填在第一志願，那是爸媽最想看到的。可是分數差了一大截，':`我把${first}填在第一志願，可是分數差了一點，`)+`最後分發到第 ${n} 志願。`+t}});return e}}
/* --- 跟會標會 --- */
const huiMoney=y=>y<1980?1000:y<1988?3000:5000;
const HUI_WHO=['隔壁的阿珠姨','菜市場賣魚的老闆娘','會頭的小叔','巷口開雜貨店的阿伯','樓下的王太太'];
const HUI_WHY=['說是要給兒子繳學費','說是店裡要週轉','說是女兒要辦嫁妝','沒說要做什麼，大家都在猜'];
const pr0=w=>/阿伯|小叔/.test(w)?'他':'她';
const huiNeed=s=>s.inc==='低'||(typeof owed==='function'&&owed(s)>=.05)||(s.cash!==undefined&&s.cash<3);
const huiBidAuto=s=>huiMoney(s.y)*(s.ax.risk>65||huiNeed(s)?.15:.1);
MS.push({id:'huiBid',choice:1,check:s=>s.y>=1970&&s.y<=1995&&s.age>=22&&s.age<=60&&!s.f.huiBid&&s.cash!==undefined&&!s.studying&&chance(.003),
 run:s=>{s.f.huiBid=1;s.f.huiIn=s.y;const m=huiMoney(s.y),host=pick(['媽媽','同事','隔壁的鄰居']);
  const opts=[.05,.1,.15,.2].map(k=>Math.round(m*k/50)*50);
  return {cat:'生活',title:'標會',game:{type:'bid',on:'出標',off:'不標',m,opts,pot:m*11},
   text:`我跟了${host}起的會，十二個人，每個月繳 ${m.toLocaleString()} 塊。今天晚上在${host==='同事'?'同事家':'會頭家'}開標，誰的標金出得高，這期的會款就是誰的。${huiNeed(s)?'我最近手頭很緊，':''}要標嗎？`,choices:[
   {label:'出標',go:s=>{const v=gv(s);const bid=v&&v.bid?v.bid:Math.round(huiBidAuto(s)/50)*50;
     const hot=chance(.15),top=Math.round(m*(hot?.25:.06+R()*.12)/50)*50,who=pick(HUI_WHO);
     if(bid>top){const cost=bid*11/1e4;s.cash=Math.max(0,s.cash-cost);s.f.huiDead=s.y;
       return `我寫了 ${bid} 塊，對折塞進會頭的紙盒裡。打開來，${who}只寫了 ${top}。我標到了！一次拿到 ${(m*11/1e4).toFixed(1).replace(/\.0$/,'')} 萬，代價是之後每期照繳全額，等於付了 ${(bid*11).toLocaleString()} 塊利息。`}
     return `我寫了 ${bid} 塊。打開來，${who}寫了 ${top}，${hot?pick(HUI_WHY)+'，':''}這期被${pr0(who)}標走了。大家一邊數錢一邊嗑瓜子，我回家的路上還在想，下次要不要寫高一點。`}},
   {label:'不標',go:s=>{const top=Math.round(m*(.06+R()*.12)/50)*50;s.cash+=top/1e4;
     return `我沒有出標，坐在旁邊嗑瓜子看大家寫紙條。這期被標走了，標金 ${top} 塊，我這個月少繳 ${top} 塊，也算賺了一點利息。`}}]}}});
LEAN['出標']={risk:.6};LEAN['不標']={risk:-.6};PULL['huiBid:出標']=s=>huiNeed(s)?1.8:.9;
{const cf=ctxFor;ctxFor=function(s,id){if(id!=='huiBid')return cf(s,id);
  if(huiNeed(s))return {text:'會裡手頭緊的人，每期都搶著標',norm:['出標']};
  return {text:'會裡的老會腳都說，不急著用錢就別標，放著領利息',norm:['不標']}}}
/* in a 會 the next few years: a 倒會 is likelier, and hurts less once you already took the pot */
{const he=RE.find(x=>x.id==='hui'),hp=he.p,hr=he.run;
 he.p=s=>hp(s)*(s.f.huiIn&&s.y-s.f.huiIn<=2&&s.age>=18?3:1);
 he.run=s=>{if(s.age>=18&&s.f.huiDead&&s.y-s.f.huiDead<=3){fx(s,{money:-3});return {cat:'家庭',text:'我跟的會被倒了，會頭連夜跑路。好在我早就標到了，損失不大。還沒標到的會腳，天天堵在會頭家門口。'}}return hr(s)}}
/* --- 大家樂 --- */
const djlNum=n=>String(n).padStart(2,'0');
MS.push({id:'djl',choice:1,check:s=>s.y>=1985&&s.y<=1987&&s.age>=7&&!s.f.djl&&chance(.025),
 run:s=>{s.f.djl=1;const kid=s.age<18;
  if(kid&&(dadGone(s)||s.f.parentdie||s.fam==='隔代教養'))return null;
  if(kid)return {cat:'家庭',title:'大家樂',game:{type:'num',on:'幫爸爸想號碼',off:'說不知道',kid:1},
   text:'爸爸最近迷上了大家樂，每天晚上都在研究愛國獎券的號碼。他說小孩子手氣好，要我隨便說兩個數字。',choices:[
   {label:'幫爸爸想號碼',go:s=>{const v=gv(s),n=v&&v.n!=null?v.n:Math.floor(R()*100),d=Math.floor(R()*100);s.f.djlN=n;
     if(n===d){fx(s,{money:4,lonely:-4});return `我說了 ${djlNum(n)}。開獎那天，末兩碼真的是 ${djlNum(d)}！爸爸抱著我轉了三圈，帶全家去吃牛排。之後他每期都來問我。`}
     const near=Math.floor(n/10)===Math.floor(d/10)||n%10===d%10;
     return `我說了 ${djlNum(n)}${v&&v.temple?'，那是我在土地公廟香爐裡看到的形狀':''}。開出來是 ${djlNum(d)}。${near?'差一個號碼，爸爸懊惱了一整晚。':'爸爸嘆了一口氣，說小孩子的手氣也沒多好。'}`}},
   {label:'說不知道',go:s=>'我說我不知道。爸爸自己去土地公廟擲筊求明牌，回來的時候還是一臉沒把握。'}]};
  return {cat:'生活',title:'大家樂',game:{type:'num',on:'簽一支',off:'不簽'},
   text:`大家樂正熱。${working(s)?'午休時，同事都圍著報紙研究愛國獎券的號碼':'巷口的雜貨店，每天都擠滿了來問明牌的人'}。組頭問我要不要簽一支，五百塊，猜中愛國獎券頭獎的末兩碼。`,choices:[
   {label:'簽一支',go:s=>{const v=gv(s),n=v&&v.n!=null?v.n:Math.floor(R()*100),d=Math.floor(R()*100);s.f.djlN=n;
     if(n===d){s.cash+=3;fx(s,{money:4,risk:3});return `我簽了 ${djlNum(n)}。開出來的末兩碼，真的是 ${djlNum(d)}！我拿到三萬多塊，${working(s)?'請整個辦公室喝了飲料':'請巷口的鄰居吃了一頓'}。那一整個月，大家都來問我明牌。`}
     s.cash=Math.max(0,s.cash-.05);const near=Math.floor(n/10)===Math.floor(d/10)||n%10===d%10;
     return `我簽了 ${djlNum(n)}${v&&v.temple?'，這是土地公廟擲了三個聖筊才求到的明牌':''}。開出來是 ${djlNum(d)}。${near?'只差一個號碼，我氣到晚飯都吃不下。':'五百塊就這樣沒了。'}`}},
   {label:'不簽',go:s=>{const d=Math.floor(R()*100);return `我沒有簽。開獎那天，開出來的末兩碼是 ${djlNum(d)}，剛好是我家門牌號碼。我一整晚都睡不著。`}}]}}});
LEAN['簽一支']={risk:.8};LEAN['不簽']={risk:-.8};LEAN['幫爸爸想號碼']={rebel:-.2};LEAN['說不知道']={rebel:.2};
PULL['djl:簽一支']=s=>1.2;PULL['djl:幫爸爸想號碼']=s=>2.5;
{const cf=ctxFor;ctxFor=function(s,id){if(id!=='djl')return cf(s,id);
  if(s.age<18)return {text:'班上同學的爸爸，好幾個也在簽',norm:['幫爸爸想號碼']};
  return {text:'身邊的人，十個有八個都簽過',norm:['簽一支']}}}
