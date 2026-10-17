/* ================= callbacks: years later, the diary brings back a choice you made ================= */
/* Uses the choice log (s.ch). Each line fires once, at most 3 per life, and never says whether the choice was right. */
const chose=(s,id,labels)=>(s.ch||[]).filter(x=>x.id===id&&!x.fail&&[].concat(labels).includes(x.label)).pop();
const since=(s,x)=>x?s.y-x.y:-1;
const CB=[
 {k:'cb_early1',when:s=>{const x=chose(s,'m15','去工作');return x&&['國中','國小'].includes(s.edu)&&s.kidBorn.some(b=>{const a=(s.t-b)/12;return a>=18&&a<19})},
  text:'孩子拿到大學錄取通知那天，我想起十五歲那年，我把升學的報名表摺起來塞進抽屜。'},
 {k:'cb_early2',when:s=>{const x=chose(s,'m15','去工作');return x&&working(s)&&since(s,x)>=20&&s.age<=55},
  text:'以前國中同班、後來繼續讀書的那個同學，現在是我們公司的經理。他還記得我的綽號。'},
 {k:'cb_uni',when:s=>{const x=chose(s,'uni','考大學');return x&&['大學','碩士','博士'].includes(s.edu)&&since(s,x)>=20},
  text:'整理舊東西的時候，翻到大學的學生證。照片上的我，看起來什麼都還沒決定。'},
 {k:'cb_north1',when:s=>{const x=chose(s,'loc','北上打拼')||chose(s,'uniloc','北上讀書');return x&&since(s,x)>=15&&regionOf(s.place)==='北'},
  text:'我在外地住得比在家鄉還久了。可是有人問我是哪裡人，我還是說家鄉的名字。'},
 {k:'cb_north2',when:s=>{const x=chose(s,'loc','北上打拼')||chose(s,'uniloc','北上讀書');return x&&since(s,x)>=20&&s.f.parentdie},
  text:'爸媽都走了以後，老家的房子空著。我回去開窗通風，坐在以前的房間裡，想起北上那天媽媽塞給我的那包茶葉蛋。'},
 {k:'cb_home',when:s=>{const x=chose(s,'loc','留在家鄉');return x&&since(s,x)>=20&&s.place===s.birthCounty},
  text:'去台北辦事的時候，我站在捷運站的人潮裡想，如果當年我也來了，現在會在哪一站下車。'},
 {k:'cb_rent',when:s=>{const x=chose(s,'house','繼續租');return x&&since(s,x)>=15&&s.house!=='own'},
  text:'當年說「繼續租」的時候，那一區的房價我還算得出來。現在看新聞上的數字，我連算都不想算了。'},
 {k:'cb_own',when:s=>{const x=(s.ch||[]).filter(c=>c.id==='house'&&!c.fail&&c.label.startsWith('買')).pop();return x&&s.house==='own'&&s.mortgageEnd&&s.t>=s.mortgageEnd&&s.t<s.mortgageEnd+12},
  text:'最後一期房貸繳完那天，我去銀行拿了清償證明。走出來的時候，我買了一杯平常捨不得買的咖啡。'},
 {k:'cb_biz',when:s=>{const x=chose(s,'job','做小生意');return x&&s.job==='自營'&&since(s,x)>=15},
  text:'早上拉起鐵門的時候，我想起第一天開店，手抖到鑰匙插不進去。'},
 {k:'cb_factory',when:s=>{const x=chose(s,'job','進工廠');return x&&s.age>=60&&since(s,x)>=30},
  text:'工廠的老同事辦退休，大家一起去吃飯。我想起剛進工廠那天，師傅叫我先把手洗乾淨。'},
 {k:'cb_single',when:s=>chose(s,'marry','先不要')&&!s.married&&!s.f.everMar&&s.age>=55&&s.y>=2008,
  text:'在臉書上看到以前交往過的人，放了孫子的照片。我想起那年我說「先不要」，對方說「好，我等你想清楚」。'},
 {k:'cb_married',when:s=>{const x=chose(s,'marry','結婚');return x&&x.age<=27&&s.married&&since(s,x)>=30&&spouse(s)},
  text:'結婚三十年了。我看著{n}在陽台澆花，想起那年我們什麼都還沒想清楚，就說了「好」。'}];
RE.push({id:'callback',p:s=>{if(abroad(s)||(s.f.cbN||0)>=3||s.age<30)return 0;return CB.some(c=>!s.f[c.k]&&c.when(s))?.02:0},
 run:s=>{const c=pick(CB.filter(c=>!s.f[c.k]&&c.when(s)));s.f[c.k]=1;s.f.cbN=(s.f.cbN||0)+1;
   const t=fillPH(s,c.text,spouse(s));return {_eid:c.k,tone:'neutral',cat:'人生',text:splitSent(t).every(x=>sentOK(s,x))?t:''}}});
