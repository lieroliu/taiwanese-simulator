/* ================= same month, other generations: what a family member of another 年級 was doing ================= */
const GEN_EV=new Set(['stock','lehman','covid','lv3','dotcom','asia','sars','quake','morakot','nari','kaohsiung','formosafun']);
function genWho(s){const ks=kidsOf(s).filter(k=>k.alive&&s.y>=k.by),out=[];
  if(ks.length&&s.age>=30)out.push(...ks.map(k=>({n:nm(k),a:s.y-k.by,p:pr(k)})));
  if(parAlive(s)&&(s.age<45||!out.length)){const m=chance(.5);out.push({n:m?'媽媽':'爸爸',a:parAge(s)-(m?2:0),p:m?'她':'他'})}
  if(!out.length){const o=s.people.find(p=>['mentor','teacher'].includes(p.role)&&p.alive&&Math.abs(p.by-s.by)>=8);if(o)out.push({n:nm(o),a:s.y-o.by,p:pr(o)})}
  return out.length?pick(out):null}
function genLine(s){const w=genWho(s);if(!w||Math.abs(w.a-s.age)<8)return null;const {n,a,p}=w,y=s.y;const A=a<1?'還不到一歲':` ${a} 歲`;
  const G=(k,arr)=>`${n}${A}，`+cyc(s,'gen'+k,arr);let t;
  if(a<3)t=G(0,['什麼都不懂，那天晚上照樣哭著要人抱','剛學會走路，整天在客廳裡跌跌撞撞','只知道肚子餓了要喝奶']);
  else if(a<7)t=G(1,['在念幼稚園，只在意那天的卡通有沒有播','在念幼稚園，拿著蠟筆在牆上亂畫','問我電視上的人為什麼在哭']);
  else if(a<13)t=G(2,['在念國小，隔天在學校學大人講了幾句','在念國小，最煩惱的是暑假作業還沒寫','在念國小，問我這件事課本會不會教']);
  else if(a<16)t=G(3,[`正在準備${examHS(y)}，問我這會不會考`,`正在準備${examHS(y)}，每天補習到九點才回家`,'正在叛逆期，整天把房門關著']);
  else if(a<19)t=G(4,[`正在準備${examU(y)}，房間的燈亮到半夜`,`正在準備${examU(y)}，說等考完再來關心這些`,'第一次跟我爭這件事，說我們這一代不懂']);
  else if(a<25)t=G(5,[`${y>=1995&&uniRate(y)>.5?'還在讀大學':'剛出社會'}，${y>=1998?'在網路上跟同學吵這件事':'跟同學聊到很晚'}`,`${p==='他'?'正在當兵，放假回家才知道這件事':'剛出社會，領著第一份薪水'}`,'整天在外面，很少回家吃飯']);
  else if(a<40)t=G(6,['每天忙著上班，只在午休時看了一眼新聞','剛成家沒幾年，最擔心的是房貸','加班到很晚，回到家什麼都不想聽']);
  else if(a<60)t=G(7,[`正是家裡最需要錢的時候，${p}最擔心的是工作會不會受影響`,`${p}把存摺拿出來算了又算`,`${p}在飯桌上講這件事，講到菜都涼了`]);
  else if(a<76)t=G(8,[`已經退休了，${p}說這種事${p}年輕的時候看多了`,`每天早上去公園，跟老朋友聊的都是這件事`,`${p}打電話來，叫我們不要出門`]);
  else t=G(9,['耳朵不太好了，問了我好幾次發生了什麼事',`${p}看著電視，想起了很久以前的事`,'已經記不太清楚現在是哪一年']);
  return `同一個月，${t}。`}

