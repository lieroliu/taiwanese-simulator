/* ================= parents divorcing in your childhood =================
   From age 3 to 17, each month your parents may divorce at that year's official divorce rate for married women of your
   mother's age (data/stats/family.json, FAMD.div; ×.6 for couples with children at home, 估算). Before the 1996
   民法 change custody went to the father unless agreed otherwise, so more children stayed with 爸爸 (55%, 估算); after,
   most stayed with 媽媽 (35% with 爸爸, 估算). A few lines of that life follow while you are still under 18. */
function pdivRate(s){const a=(s.f.ma0||25)+s.age,band=a<20?null:a<25?'20-24':a<30?'25-29':a<35?'30-34':a<40?'35-39':a<45?'40-44':'45-49';
  let y=clamp(s.y,1975,2025);while(!FAMD.div[y]&&y<2025)y++;const d=FAMD.div[y]||{};
  /* before 1975 there is no age split: scale 1975's age-band rate by the all-ages rate of that year */
  const r=(band&&d[band])||d.total||3;return s.y<1975?r*(FAMD.divT[s.y]||FAMD.divT[1975])/FAMD.divT[1975]:r}
function pdivText(s){const w=soleP(s),o=w==='爸爸'?'媽媽':'爸爸',op=o==='爸爸'?'他':'她',a=s.age,y=s.y;
  if(a<7)return pick([`爸媽離婚了。那天${o}收拾了一個行李箱，我以為${op}只是要出門買東西。後來我才知道，以後是我跟${w}兩個人住。`,
    `爸媽離婚了。家裡少了一雙拖鞋，我每天晚上都問${w}，${o}什麼時候回來。`]);
  if(a<13)return y<1990?`爸媽離婚了。親戚來家裡講了一整個晚上，我躲在房間寫功課，一個字也沒寫進去。從此我跟${w}住，${o}搬了出去。`
    :y<2000?`爸媽離婚了。我跟${w}住，${o}搬了出去。聯絡簿上家長簽名那一欄，從此只剩一種筆跡。`
    :`爸媽離婚了。我跟${w}住，${o}搬了出去。班上也有好幾個同學是這樣，我們從來不聊這件事。`;
  return y<1996?`爸媽離婚了。大人們沒有問我想跟誰，我就跟著${w}，${o}搬了出去。我把房門關起來，音樂開得很大聲。`
    :`爸媽離婚了。社工來家裡問我想跟誰住，我說都可以。最後我跟${w}住，${o}搬了出去。`}
{const st0=step;step=function(s){
  if(!s.dead&&s.age>=3&&s.age<18&&!s.f.pdiv&&['無','家人久病','受難者家屬'].includes(s.fam)&&!s.f.dadDie&&!s.f.momDie&&!abroad(s)
     &&chance(pdivRate(s)/1000/12*.6)){
    s.f.pdiv=s.t;s.f.withDad=chance(s.y<1996?.55:.35)?1:0;s.f.pdivFam=s.fam;s.fam='單親';
    fx(s,{lonely:8,money:-5,self:3});key(s,'爸媽離婚');
    s.q.push({cat:'家庭',tone:'bad',pri:2,_pdiv:1,text:pdivText(s)})}
  return st0(s)}}
/* the years after, while you are still a kid: weekends at the other parent's, two 年夜飯, a new marriage */
RE.push({id:'pdivlife',p:s=>s.f.pdiv&&s.age<18&&(s.f.pdivN||0)<3&&s.t-s.f.pdiv>=6?.02:0,run:s=>{
  const w=soleP(s),o=w==='爸爸'?'媽媽':'爸爸',op=o==='爸爸'?'他':'她',used=s.f.pdivU||(s.f.pdivU=[]);
  const L=[['wk',`週末去${o}那邊。${op}帶我去吃${pick(s.y>=1984?['牛排','麥當勞','火鍋']:['牛排','火鍋','冰'])}，一直問我在學校好不好，我只會說還好。`],
    ['ny',`過年要分兩邊吃年夜飯。在${w}這邊吃完，我再坐車去${o}那邊吃第二輪，回家的路上撐到不想講話。`],
    ['form','學校要填家庭狀況調查表，我在「父母離異」那一格打了勾，寫得很小。'],
    ['call',`${o}打電話來，我拿著話筒不知道要說什麼。${w}在旁邊假裝看電視，音量轉得很小。`],
    ['re',`${o}再婚了。喜酒我沒去，${w}說不想去就不要去。`]].filter(x=>!used.includes(x[0])&&(x[0]!=='re'||s.age>=8));
  if(!L.length)return {cat:'家庭',_pdiv:1,text:`${w}下班回來，煮了兩個人的晚餐。我們邊吃邊看電視，沒有人說話，也不覺得尷尬。`};
  const x=pick(L);used.push(x[0]);s.f.pdivN=(s.f.pdivN||0)+1;return {cat:'家庭',_pdiv:1,text:x[1]}}});
/* after your own divorce, while the children are small: a few lines, at most two per life */
RE.push({id:'odivlife',p:s=>(s.f.kidsEx||s.f.kidsMine)&&!s.married&&(s.f.odivN||0)<2&&kidsOf(s).some(k=>k.alive!==false&&s.y-k.by<18)?.015:0,run:s=>{
  const k=kidsOf(s).find(k=>k.alive!==false&&s.y-k.by<18),n=nm(k);s.f.odivN=(s.f.odivN||0)+1;
  const L=s.f.kidsEx?[`週末去接${n}。${pr(k)}一上車就戴上耳機，我在想要問什麼才不會像在問功課。`,`過年${n}要待在另一邊吃年夜飯。我一個人在家，電視開著，桌上只有一盤水餃。`,`${n}的家長日，我坐在教室最後一排。老師以為我是別人的家長。`]
    :[`我一個人帶${n}。早上送上學，下班趕回來煮飯，晚上改完聯絡簿，才發現自己還沒吃。`,`${n}問我，為什麼別人的爸媽都會一起來運動會。我說，因為我一個人就跑得很快。`,`過年${n}去另一邊吃年夜飯，隔天回來，手上多了一個大紅包。`];
  return {cat:'家庭',text:L[(s.f.odivN-1)%L.length]}}});
