/* ================= 生活重心: what you put this year into. The player can switch it any time; auto picks by personality.
   The options change with age, and the era and family can lock some of them (with the reason shown). Effects are small and yearly. ================= */
const FOCUS={
  '讀書':{fx:{study:4,lonely:2},mood:-1},
  '玩':{fx:{study:-2,lonely:-4,health:1},mood:3},
  '幫家裡':{fx:{study:-2,money:1,lonely:-1},mood:-1},
  '打工':{fx:{money:2,study:-2,health:-1},mood:-1},
  '賺錢':{fx:{money:3,health:-1,lonely:1},mood:-2},
  '交朋友':{fx:{lonely:-5,money:-1},mood:2,friend:.25},
  '談戀愛':{fx:{lonely:-2,money:-1},mood:1,love:1.8},
  '陪家人':{fx:{lonely:-3,money:-1},mood:2},
  '顧身體':{fx:{health:1.5,money:-1},mood:1},
  '進修':{fx:{study:3,money:-1,lonely:1},mood:0}};
const FOCUS_TIP={'讀書':'成績比較好，但比較少跟人來往','玩':'比較開心、朋友多，成績會掉一點','幫家裡':'家裡輕鬆一點，自己的時間變少',
  '打工':'有點零用錢，讀書的時間變少','賺錢':'存得到錢，身體和心情會累','交朋友':'比較不孤單，花錢','談戀愛':'比較容易遇到對象',
  '陪家人':'家裡的人比較親，少賺一點','顧身體':'身體比較好，花一點錢','進修':'多學一點東西，花錢花時間'};
const farmKid=s=>s.pjob==='農'&&s.y<1980&&s.age<=15;
function focusOpts(s){const a=s.age;if(a<7)return [];
  if(a<12)return ['玩','讀書','幫家裡'];
  if(s.studying||a<18){const o=['讀書','玩','交朋友','幫家裡'];if(a>=15)o.push('打工');if(a>=18&&!s.married)o.push('談戀愛');return o}
  if(s.job==='退休'||a>=65)return ['顧身體','陪家人','交朋友'];
  const o=['賺錢','交朋友'];if(!s.married&&a<50)o.push('談戀愛');if(s.married||(s.kids||0)>0||a>=30)o.push('陪家人');o.push('顧身體');if(a<50)o.push('進修');return o}
/* why an option is closed to you right now, or null */
function focusLock(s,k){
  if(k==='讀書'&&s.sex==='F'&&s.inc==='低'&&s.by<1972&&s.age>=12&&s.age<18&&!s.studying)return '家裡說女孩子讀那麼多書沒用，要你早點出去賺錢。';
  if(k==='玩'&&farmKid(s))return '放學後要下田幫忙，沒有時間玩。';
  if(k==='陪家人'&&(['台幹','漁工','海員'].includes(s.job)||s.place==='中國'))return '人在外地，一年回家沒幾次。';
  if(k==='進修'&&s.money<20)return '連生活費都不太夠，沒有錢去上課。';
  if(k==='談戀愛'&&s.age<20&&s.y<1987&&s.studying)return '學校禁止談戀愛，被教官抓到要記過。';
  return null}
function focusAuto(s){const o=focusOpts(s).filter(k=>!focusLock(s,k));if(!o.length)return null;const ax=s.ax,has=k=>o.includes(k)?k:null;
  if(s.age<12)return farmKid(s)&&has('幫家裡')||(s.study>=60&&has('讀書'))||has('玩');
  if(s.studying||s.age<18)return (s.study>=58&&has('讀書'))||(s.money<30&&s.age>=15&&has('打工'))||(ax.open>60&&has('交朋友'))||has('玩')||o[0];
  if(s.age>=55)return (ax.self<40&&has('陪家人'))||(ax.open>65&&has('交朋友'))||has('顧身體')||o[0];
  if(!s.married&&s.age>=24&&s.age<38&&!s.rel&&ax.open>55&&has('談戀愛'))return '談戀愛';
  if(ax.self<40&&has('陪家人'))return '陪家人';
  if(ax.open>65&&s.lonely>45&&has('交朋友'))return '交朋友';
  return has('賺錢')||o[0]}
/* the focus actually in force: the player's pick while it is still open to them, else the auto pick */
function focusNow(s){const p=s.focusPick;if(p&&focusOpts(s).includes(p)&&!focusLock(s,p))return p;if(p)s.focusPick=null;return focusAuto(s)}
function focusYear(s){const k=focusNow(s);s.focus=k;if(!k)return;const F=FOCUS[k];fx(s,F.fx);
  if(F.friend&&friendsOf(s).length<5&&chance(F.friend)){const p=newFriend(s);storyAdd(s,p,'跟你成為朋友');
    qPush(s,{pri:1,cat:'生活',tone:'good',text:pick([`這一年常跟${nm(p)}混在一起，不知不覺就變成朋友了。`,`這一年認識了${nm(p)}，我們很聊得來。`])})}}
const focusMood=s=>s.focus&&FOCUS[s.focus]?FOCUS[s.focus].mood:0;
{const y0=yearly;yearly=function(s){y0(s);focusYear(s);clampAll(s)}}
/* the focus follows you between years: once school ends, a job takes you away or an option locks, it moves to what fits now */
const focusFix=s=>{if(s.focus&&!s.dead&&(!focusOpts(s).includes(s.focus)||focusLock(s,s.focus)))s.focus=focusNow(s)};
{const st0=step;step=function(s){const out=st0(s);focusFix(s);return out}}
{const dc0=doChoice;doChoice=function(s,e,c){const r=dc0(s,e,c);focusFix(s);return r}}
