/* ================= parttime: working while in school =================
   Paddy 2026-10-17: at 16+ in 高中、高職、五專 or 大學 you choose whether to work part-time. The jobs follow the era:
   家庭代工 and factory summer work before the mid-80s, fast food and cram-school desks after, convenience stores and
   drink stands from 2000. Pay follows that year's 基本工資: about a quarter of a full-time month (估算, ~60 hours).
   Working costs some study; the money is saved (for a shop or a down payment) or handed to the family. */
const PT_JOB=s=>{const uni=s.studying==='大學';return pick(s.y<1985?['在家幫忙做家庭代工，裝聖誕燈泡','暑假去加工廠當臨時工','去市場幫人顧攤']:s.y<2000?['在速食店打工','在補習班櫃台打工','去餐廳端盤子'].concat(uni?['去當家教']:[]):['在便利商店打工','在手搖飲料店打工','在餐廳打工'].concat(uni?['去當家教']:['在加油站打工']))};
const ptPay=s=>minW(s.y)*12*.25/1e4;
const ptStage=s=>s.studying==='大學'?'大學':s.studying;
MS.push({id:'parttime',choice:1,check:s=>s.age>=16&&['高中','高職','五專','大學'].includes(s.studying)&&s.f.ptStage!==ptStage(s)&&s.cash!==undefined&&s.age<26,
 run:s=>{s.f.ptStage=ptStage(s);const poor=s.inc==='低'||s.famW<w0(s)*.5;s.f.pt=null;
  const m=ptPay(s)*1e4/12;const pay=m>=1e4?(Math.round(m/1e3)/10)+' 萬':Math.round(m/100)*100+' 塊';
  return {cat:'人生',title:'打工',text:`${poor?'家裡的錢一直很緊，':''}${s.studying==='大學'?'同學很多都在打工':'班上有同學下課去打工'}。打工一個月大概可以賺 ${pay}。我要打工嗎？`,choices:[
   {label:'專心讀書',go:s=>{fx(s,{study:4});return '我決定先專心讀書。'}},
   {label:'打工存錢',go:s=>{s.f.pt='save';fx(s,{risk:2,self:2});return `我${PT_JOB(s)}，每個月領到的錢，我都存起來。`}},
   {label:'打工貼補家用',if:poor,go:s=>{s.f.pt='home';fx(s,{self:-2});famLikeAdd(s,6);return `我${PT_JOB(s)}。領到薪水，我把大部分交給媽媽。`}}]}}});
LEAN['專心讀書']={self:-.3,risk:-.5};LEAN['打工存錢']={risk:.5,self:.5};LEAN['打工貼補家用']={self:-.8};
PULL['parttime:打工貼補家用']=s=>1.6;PULL['parttime:打工存錢']=s=>s.y>=1995?1.4:1;
MOOD_C['打工貼補家用']=-2;
{const cf=ctxFor;ctxFor=function(s,id){if(id!=='parttime')return cf(s,id);
  if(s.inc==='低')return {text:'家境跟我差不多的同學，放學後都在打工',norm:['打工貼補家用','打工存錢']};
  if(s.studying==='大學'&&s.y>=1995)return {text:'大學同學幾乎都有在打工',norm:['打工存錢']};
  return {text:'身邊的同學，大多下課就去補習',norm:['專心讀書']}}}
/* each school year: the pay, a little less study, and now and then a scene from the job */
const PT_LIFE=['店長排班總是把我排在週末，同學出去玩，我在店裡。','今天遇到一個很兇的客人，我忍住沒哭，下班走路回家的時候才哭了一下。','打工的地方有個學長很照顧我，下班常載我去吃宵夜。','領到第一份薪水那天，我請爸媽吃了一頓飯。'];
{const y0=yearly;yearly=function(s){y0(s);if(!s.f.pt)return;if(!['高中','高職','五專','大學'].includes(s.studying)){s.f.pt=null;return}
  const v=ptPay(s);fx(s,{study:-3});if(s.f.pt==='save')s.cash+=v*.7;else{s.famW+=v*.7;s.cash+=v*.15}
  if(chance(.3)){const i=s.f.ptLn=(s.f.ptLn||0)+1;if(i<=PT_LIFE.length)s.q.push({cat:'生活',tone:'neutral',text:PT_LIFE[i-1]})}}}
