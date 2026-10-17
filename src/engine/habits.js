/* ================= habits: what the character keeps saying for life, and why ================= */
function habit(s,k,say,does,why,y){s.habits=s.habits||[];if(s.habits.some(h=>h.k===k))return;s.habits.push({k,say,does,why:`${y||s.y} 年${why}`,age:s.age})}
(()=>{const P=id=>PE.find(x=>x.id===id)||RE.find(x=>x.id===id),M=id=>MS.find(x=>x.id===id),T=id=>TL.find(x=>x.id===id);
 const wrap=(r,fn)=>{if(!r)return;const o=r.run;r.run=s=>{const e=o(s);if(e)fn(s,e);return e}};
 wrap(P('hui'),s=>habit(s,'money','錢要存在自己身上。','一輩子不跟會，也不肯把錢交給別人管',s.age<18?'，家裡被倒了一次會':'，你跟的會被倒了'));
 wrap(P('guarantee'),s=>habit(s,'guarantee','千萬不要幫人作保。','誰來開口都不肯當保證人',s.age<18?'，爸爸幫朋友作保，家裡背了債':'，你幫朋友作保，背了一身的債'));
 wrap(P('lend'),s=>habit(s,'lend','借錢給朋友，就當作送他。','再也不借錢給朋友','，最好的朋友借了錢就消失'));
 wrap(P('lottery'),s=>habit(s,'gamble','賭博的錢，一毛都不能碰。','連樂透都不買',s.age<18?'，爸爸把家裡的錢都簽了大家樂':'，你把錢賠在大家樂裡'));
 wrap(P('card'),s=>habit(s,'card','沒錢就不要花，卡不要刷。','只用現金，信用卡剪掉了','，你欠了一身卡債'));
 wrap(P('shark'),s=>habit(s,'card','沒錢就不要花，卡不要刷。','再缺錢也不跟人借','，你被地下錢莊追債'));
 wrap(P('scam'),s=>habit(s,'scam','陌生電話不要接。','看到不認識的號碼就掛掉','，你被詐騙集團騙走了存款'));
 wrap(M('layoff'),s=>habit(s,'iron','去考公務員，鐵飯碗最實在。','一直勸身邊的年輕人去考公職',`，${s.age} 歲的你被公司裁員`));
 wrap(P('parentsfight'),(s,e)=>{if(s.money<35)habit(s,'thrift','做人要省，不要浪費。','剩菜捨不得倒，塑膠袋都留著','前後，你常聽爸媽為了錢吵架')});
 wrap(P('typhoon'),s=>habit(s,'flood','颱風來之前，東西一定要搬高。','每次颱風警報一發，就先把家電搬上樓','，家裡淹過一次大水'));
 wrap(P('bully'),s=>{if(s.eth==='新住民子女')habit(s,'hide','不要跟別人說你媽媽是哪裡人。','很少在外面提起媽媽的家鄉','，你在學校因為媽媽的口音被嘲笑');else if(s.eth==='原住民')habit(s,'hide','在外面，不要讓人知道你是原住民。','在都市裡很少說自己是哪一族','，同學叫你「番仔」')});
 wrap(T('quake'),s=>{if(CENTRAL_921.includes(s.place)&&s.age>=6)habit(s,'quake','家裡一定要放一個緊急避難包。','床邊永遠放著手電筒和一雙鞋','，921 地震把你家附近的房子震倒了一半')});
 wrap(T('wto'),s=>{if(s.pjob==='農'||s.job==='農')habit(s,'farm','不要回來種田。','勸家裡的年輕人不要留在田裡','，進口的米讓家裡的收入少了一截')});
 wrap(M('school7'),s=>{if(s.by<=1980&&['閩南','客家','原住民'].includes(s.eth))habit(s,'mandarin','在外面講國語就好。',`在家也很少講${langOf(s)}了`,`，你在小學講${langOf(s)}被罰、掛狗牌`)});
 wrap(M('parentill'),s=>habit(s,'burden','以後不要拖累孩子。','早早就去買了長照保險','，你照顧中風的爸爸，照顧到自己都病了'));
 wrap(M('loc'),s=>{if(regionOf(s.place)==='北'&&s.birthCounty!==s.place)habit(s,'home','有空就要回家。','每個連假都塞在高速公路上回老家','，你一個人北上打拼')});
})();
function habitFromState(s){
  if(s.fam==='受難者家屬')habit(s,'politics','政治的事不要碰。','從不跟人討論選舉，連投票都不太去','前後，家裡有長輩在白色恐怖時被帶走過',s.by+8);
  else if(s.by<=1970&&s.eng<30&&s.age>=20)habit(s,'politics','政治的事不要碰。','一聊到選舉就轉移話題','前後，大人總交代你外面的事不要多問',s.by+10);
  if(s.f.noUniMoney)habit(s,'study','讀書才有出路，再苦也要讓孩子讀。','把讀書看得比什麼都重要',s.f.noUniMoney,s.f.noUniY);
  if(s.eth==='外省'&&s.by<=1975)habit(s,'roots','要記得自己從哪裡來。','常常跟家人講老家的事','前後，大人常說起回不去的老家',s.by+10);
  if(s.f.bizFail)habit(s,'salary','做生意風險太大，領薪水比較安心。','勸身邊的人不要創業',s.f.bizFail,s.f.bizY);
  if(s.f.widowed&&s.age<70)habit(s,'health','身體顧好最重要。','每年都去做健康檢查','，另一半比你早走',s.f.widowY);
}
const HW={guarantee:5,money:5,study:5,politics:5,iron:4,mandarin:4,hide:4,gamble:4,card:4,farm:3,quake:3,burden:3,roots:3,salary:3,lend:3,health:2,flood:2,scam:2,thrift:2,home:2};
function habitsSection(s){habitFromState(s);const H=(s.habits||[]).slice().sort((x,y)=>(HW[y.k]||1)-(HW[x.k]||1)||x.age-y.age).slice(0,3);if(!H.length)return '';
  return `<div><h2 style="font-size:22px;margin-bottom:4px">你後來的口頭禪</h2><p class="muted small" style="margin:0 0 10px">這些話，你後來常常掛在嘴邊。</p>
  <ul class="keys habits">${H.map(h=>`<li><span><span class="say">「${esc(h.say)}」</span><br><span class="small">你${esc(h.does)}。${esc(h.why.replace(' 年，',' 年，').replace(/^(\d+) 年前後，/,'$1 年前後，'))}。</span></span></li>`).join('')}</ul></div>`}
