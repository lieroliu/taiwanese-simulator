/* ================= household: who lives under the same roof, and a diary line whenever that changes ================= */
function scRng(seed){let a=seed>>>0;return ()=>{a=(a+0x6D2B79F5)>>>0;let t=a;t=Math.imul(t^t>>>15,t|1);t^=t+Math.imul(t^t>>>7,t|61);return((t^t>>>14)>>>0)/4294967296}}
/* brothers and sisters: how many, born when, and the months each one leaves home or comes back (and why) */
function sibList(s){
  if(s.f.sibL)return s.f.sibL;
  if(s.f.scSib===undefined){meRoll(s);const r=scRng(s.by*131+s.bm);s.f.scSib=s.f.only?0:s.by<1975?1+Math.floor(r()*3):s.by<1990?1+Math.floor(r()*2):(r()<.6?1:0);s.f.scSibOld=s.f.eldest?0:1}
  const L=[];
  for(let i=0;i<s.f.scSib;i++){const r=scRng(s.by*7+i),sex=r()<.5?'M':'F',old=i<s.f.scSibOld;
    const bt=s.t0+(old?-(2+i*2):(2+i*2))*12+Math.floor(r()*7)-3,by=Math.floor(bt/12),A=a=>bt+a*12+Math.floor(r()*12);
    const ev=[];let gone=false;
    const awayStudy=r()<(by<1975?.12:by<1990?.28:.42)*(s.urban?.7:1.3);
    if(awayStudy){ev.push({t:A(18),out:1,why:'study'});if(r()<.5){ev.push({t:A(22),out:1,why:'work'});gone=true}else ev.push({t:A(22),out:0,why:'grad'})}
    if(sex==='M'){const st=A(gone?23:awayStudy?22:19),[mo]=serviceLen(by);if(!gone){ev.push({t:st,out:1,why:'army'},{t:st+mo,out:0,why:'armyBack'})}}
    if(!gone){const [lo,hi]=sex==='F'?(by<1975?[21,26]:by<1990?[24,30]:[26,33]):(by<1975?[24,30]:by<1990?[26,32]:[28,35]);
      const work=r()<(s.birthCounty==='台北市'?.2:.4),wa=24+Math.floor(r()*4);
      if(work&&wa<lo)ev.push({t:A(wa),out:1,why:'work'});
      else ev.push({t:A(lo+Math.floor(r()*(hi-lo+1))),out:1,why:r()<(by<1980?.9:.7)?'marry':'alone'})}
    ev.sort((a,b)=>a.t-b.t);
    L.push({sex,old,bt,by,ev,base:old?(sex==='M'?'哥哥':'姊姊'):(sex==='M'?'弟弟':'妹妹')})}
  /* two of the same kind: 大弟 and 小弟 */
  for(const x of L){const same=L.filter(y=>y.base===x.base);x.rel=same.length<2?x.base:(same[0]===x?'大':same[same.length-1]===x?'小':'二')+x.base.slice(-1)}
  return s.f.sibL=L}
function sibHome(x,t){if(t<x.bt)return false;let h=true;for(const e of x.ev){if(e.t>t)break;h=!e.out}return h}
/* who lives under the same roof this month */
function scHousehold(s){
  const H=[];const alive=p=>p&&p.alive!==false;
  if(abroad(s)&&s.place!=='中國')return {H,with:'在國外'};
  if(s.t<(s.inServiceUntil||0))return {H,with:'在營區當兵'};
  const SL=sibList(s);
  const sp=s.married?spouse(s):null,pt=!s.married&&s.f.cohab?partnerOf(s):null;
  const kids=kidsOf(s).filter(k=>alive(k)&&s.y-k.by<22&&s.y-k.by>=0&&!(s.f.kidsEx&&k.by*12<s.f.kidsEx));
  /* living away from the home county (studying or working up north) is not living at home */
  const atHome=!s.married&&!pt&&(s.age<18||s.place===s.birthCounty||s.house==='family')&&(s.age<22||s.house==='family'||(s.age<30&&s.house!=='own'&&!s.f.rent));
  const par=[];
  if(atHome||s.f.liveWith){
    const old=s.age>=45;
    if(s.fam==='隔代教養'&&s.age<12){par.push({role:'grandpa',age:62+s.age,sex:'M'},{role:'grandma',age:60+s.age,sex:'F'})}
    else if(parAlive(s)&&(atHome||s.f.lwMine!==false)){if(!dadGone(s))par.push({role:'dad',age:s.age+28,sex:'M',old});if(!momGone(s))par.push({role:'mom',age:s.age+26,sex:'F',old})}
    else if(s.f.liveWith&&!s.f.lwMine){par.push({role:'inlaw',age:s.age+29,sex:'M',old:true},{role:'inlaw',age:s.age+27,sex:'F',old:true})}
  }
  H.push(...par);
  if(sp&&alive(sp))H.push({role:'spouse',age:s.y-sp.by,sex:sp.sex,p:sp});
  if(pt&&alive(pt))H.push({role:'partner',age:s.y-pt.by,sex:pt.sex,p:pt});
  if(atHome)SL.forEach((x,i)=>{if(sibHome(x,s.t))H.push({role:'sib',age:Math.max(0,Math.floor((s.t-x.bt)/12)),sex:x.sex,sib:i})});
  for(const k of kids)H.push({role:'kid',age:s.y-k.by,sex:k.sex,p:k});
  const n=H.length;let w;
  if(!n)w=s.age<18?'跟家人住':'一個人住';
  else{const g=[];if(par.length)g.push(par[0].role==='grandpa'?'阿公阿嬤':par[0].role==='inlaw'?(s.sex==='M'?'岳父岳母':'公公婆婆'):par.length===2?'爸媽':par[0].role==='dad'?'爸爸':'媽媽');
    if(sp)g.push(s.sex===sp.sex?'伴侶':'另一半');if(pt)g.push('伴侶');
    const ns=H.filter(x=>x.role==='sib').length;if(ns)g.push(`${ns} 個兄弟姊妹`);if(kids.length)g.push(`${kids.length} 個孩子`);
    w=`跟${g.length>1?g.slice(0,-1).join('、')+'和'+g[g.length-1]:g[0]}同住`.replace(/([和、跟])(\d)/g,'$1 $2')}
  return {H,with:w,atHome:atHome||!!s.f.liveWith,home:atHome};
}
/* a snapshot to compare month by month: where the character is, and who is in the house */
function hhSnap(s){const h=scHousehold(s),sp=s.married?spouse(s):null,pt=!s.married&&s.f.cohab?partnerOf(s):null;
  const keys=new Set(h.H.map(x=>x.role==='sib'?'sib'+x.sib:x.p?x.role+x.p.id:x.role));
  return {keys,self:[abroad(s)?'ab':'',s.t<(s.inServiceUntil||0)?'sv':'',h.home?'home':'',sp?'sp'+sp.id:'',pt?'pt'+pt.id:'',s.f.liveWith||''].join('|'),
    sv:s.t<(s.inServiceUntil||0),ab:abroad(s),home:h.home,sp:!!sp,pt:!!pt,lw:!!s.f.liveWith}}
/* what a diary line has to say for a change to count as explained */
const HH_RX={self:/(婚禮|登記|搬|北上|宿舍|雅房|租|外地|離開家|回家|回到|老家|住家裡|入伍|當兵|退伍|結婚|嫁|娶|離婚|過世|走了|分手|分開|住在一起|出國|澳洲|中國|東莞|昆山|蘇州|深圳|廈門|上海|台幹|回台灣)/,
  par:/(過世|走了|離婚|分開|搬)/,kid:/(出生|生下|生了|寶寶|兒子|女兒|孩子|走了|過世)/,spouse:/(婚禮|登記|結婚|嫁|娶|離婚|過世|走了|分開|搬)/,partner:/(住在一起|同居|搬|分手|分開)/,inlaw:/(住|搬)/};
const HH_OWN=/(搬出去|搬回|搬進|搬到|分手|先走了|走了|過世|離婚|結婚|登記|婚禮|嫁|住在一起|退伍|入伍)/;
const hhRole=k=>/^sib/.test(k)?'sib':/^kid/.test(k)?'kid':/^(spouse)/.test(k)?'spouse':/^partner/.test(k)?'partner':/^inlaw/.test(k)?'inlaw':'par';
const hhCity=s=>pick(['台北','台中','台南','高雄','新竹','嘉義'].filter(c=>!s.birthCounty.startsWith(c)));
function sibLine(s,x,e){const r=x.rel,p=x.sex==='M'?'他':'她',kid=s.age<12;
  if(!e){const again=s.f.sibL.some(y=>y!==x&&y.base===x.base&&y.bt<x.bt);
    /* a third 妹妹 must not repeat the second one's line word for word, or the repeat filter drops the birth */
    const hd=`${again?`家裡又多了一個${x.base}`:`${r}出生了`}。`,L=s.age<3?['大人都圍著小嬰兒轉，家裡多了一張小床。','家裡又多了一張小床，晚上常常被哭聲吵醒。']:s.age<7?[pick([`${p}好小，哭聲好大。我偷偷摸了${p}的手，${p}就抓著我的手指不放。`,'大人都圍著小嬰兒轉，我在旁邊站了很久，沒有人注意到我。']),`${p}好小，哭聲好大。我偷偷摸了${p}的手，${p}就抓著我的手指不放。`,'大人都圍著小嬰兒轉，我在旁邊站了很久，沒有人注意到我。','家裡又更擠了。媽媽一邊餵奶，一邊叫我去幫忙拿尿布。']:['媽媽在坐月子，房間裡都是麻油雞的味道。','媽媽又在坐月子了，廚房裡整天燉著麻油雞。'];
    return hd+(L.find(x=>!(s._said&&s._said.has(hd+x)))||L[L.length-1])}
  switch(e.why){
    case 'study':return `${r}考上${hhCity(s)}的學校，搬去外面住了。`+(kid?`${p}走的那天，我躲在房間裡沒有出去送。`:'飯桌上一下子空了一個位子。');
    case 'grad':return `${r}畢業了，搬回家裡住。`+(kid?`${p}帶回來一大箱書，堆在我們房間的角落。`:'家裡又熱鬧了起來，浴室又要排隊了。');
    case 'army':return `${r}去當兵了。`+(kid?'晚上房間裡少了一個人講話，我有點睡不著。':`媽媽每個禮拜都在算${p}什麼時候放假。`);
    case 'armyBack':return `${r}退伍回家了，${pick(['曬得好黑','整個人瘦了一圈','講話變得很大聲'])}。`;
    case 'work':return `${r}${s.birthCounty.startsWith('台北')?'去外地工作':'北上工作'}，搬出去住了。`+(kid?`${p}說放假會買東西回來給我。`:'家裡突然安靜很多。');
    case 'alone':return `${r}在外面租了房子，搬出去自己住了。`+(kid?'我們的房間變成我一個人的了。':`${p}說這樣比較自由，媽媽嘴上沒說什麼。`);
    case 'marry':{const inl={'哥':'嫂嫂','姊':'姊夫','弟':'弟妹','妹':'妹夫'}[x.base[0]];
      return x.sex==='F'&&x.by<1990?`${r}嫁出去了。`+(kid?`出嫁那天，${p}哭著上車，我也跟著哭。`:'喜酒吃完，收完桌子，家裡突然好安靜。'):`${r}結婚了，跟${inl}搬出去住。`+(kid?'我多了一個房間，卻有點不習慣。':'媽媽嘴上說省事，週末一直問他們要不要回來吃飯。')}}
  return `${r}搬出去住了。`}
/* a line said once already in this life gets another wording, so the repeat filter does not drop it */
function hhU(s,L){const S=s._said;for(const x of L)if(!S||!S.has(x))return x;return L[L.length-1]}
function selfLine(s,a,b){
  if(b.sv&&!a.sv)return '我入伍當兵了。';
  if(a.sv&&!b.sv)return b.home?'我退伍了，回到家裡住。房間跟走的時候一模一樣。':'我退伍了，開始自己在外面生活。';
  if(b.ab&&!a.ab)return hhU(s,['我出國了，家裡的房間空了下來。','我又出國了。']);
  if(a.ab&&!b.ab)return hhU(s,[b.home?'我回到台灣，暫時住回家裡。':'我回到台灣，重新找了地方住。','我又回到台灣了。']);
  if(b.sp&&!a.sp)return hhU(s,['我結婚了，搬去跟另一半一起住。','結婚以後，我們搬到了一起住。','我們搬到一起住了。']);
  if(a.sp&&!b.sp)return hhU(s,['我又變回一個人住了。','家裡又剩下我一個人。']);
  if(b.pt&&!a.pt)return hhU(s,['我們搬到一起住了。','我們又搬到一起住了。']);
  if(a.pt&&!b.pt)return hhU(s,['我們分開了，我搬了出來。','分開以後，我搬了出去。']);
  if(a.home&&!b.home)return s._said&&s._said.has('我搬出家裡，第一次一個人住。晚上回到房間，安靜得有點不習慣。')?'我又搬出家裡了。':s.age>=28?'年紀到了，我搬出家裡，在外面租了一間小房間。爸媽嘴上沒說，送我出門的時候一直塞東西給我。':'我搬出家裡，第一次一個人住。晚上回到房間，安靜得有點不習慣。';
  if(!a.home&&b.home)return hhU(s,['我搬回家裡住。媽媽每天煮一大桌，好像我還是小孩。','我又搬回家裡住了。']);
  if(b.lw&&!a.lw)return hhU(s,[`我們搬去跟${lwEld(s)}一起住。`,'我們又搬回去住。']);
  if(a.lw&&!b.lw)return hhU(s,[`我們搬出${lwEld(s)}家，自己住。`,'我們又搬出來自己住。']);
  return '我搬家了。'}
function memLine(s,k,on){const role=hhRole(k);
  if(role==='kid'){const p=s.people.find(x=>'kid'+x.id===k);if(!p)return null;if(on)return `${nm(p)}出生了。`;if(!p.alive)return null;
    return pick([`${nm(p)}去外地讀書，搬出去住了。${pr(p)}的房間我一直沒去動。`,`${nm(p)}搬出去自己住了。家裡突然安靜下來，吃飯時少了一雙筷子。`,`${nm(p)}去外地工作，搬出去了。出門那天我一直叮嚀${pr(p)}要吃飽。`])}
  if(role==='par'){if(k==='grandpa'||k==='grandma')return on?null:'我回到爸媽身邊住。阿公阿嬤留在老家，我每個禮拜都打電話回去。';
    const who=k==='dad'?'爸爸':'媽媽';return on?`${who}回到家裡住了。`:`${who}不在家裡住了。`}
  if(role==='inlaw')return on?`我們搬去跟${lwEld(s)}一起住。`:`我們搬出${lwEld(s)}家，自己住。`;
  if(role==='spouse')return on?hhU(s,['我結婚了，搬去跟另一半一起住。','結婚以後，我們搬到了一起住。','我們搬到一起住了。']):hhU(s,['另一半搬出去了，家裡剩我一個人。','家裡又剩下我一個人。']);
  if(role==='partner')return on?hhU(s,['我們搬到一起住了。','我們又搬到一起住了。']):hhU(s,['我們分開了，各自搬走。','分開以後，我搬了出去。']);
  return null}
{const said=(t,rx)=>t.some(x=>rx.test(x));
 const dc0=doChoice;doChoice=function(s,e,c){const r=dc0(s,e,c);if(r&&r.text)(s._hhCh=s._hhCh||[]).push(r.text);return r};
 const st0=step;step=function(s){const out=st0(s);if(s.dead){s._hhCh=null;return out}
  const a=s._hh,b=hhSnap(s);s._hh=b;const ch=s._hhCh||[];s._hhCh=null;if(!a)return out;
  const add=(t,why)=>{if(!t)return;const f=splitSent(t)[0];t=guardText(s,parFix(s,t))||f;if(s._said&&s._said.has(t))t=f;out.push({cat:'家庭',tone:'neutral',text:t,_hh:why,t:s.t,age:s.age});(s.hhLog=s.hhLog||[]).push({t:s.t,why,gen:1})};
  const T=out.filter(e=>e.text&&!e.choices).map(e=>e.text).concat(ch);
  /* the character's own move counts as told by a life milestone, a choice's result, or a line that plainly says someone moved, married, split up or died; not by a passing line about a friend going to 東莞 */
  const TS=out.filter(e=>e.text&&!e.choices&&(e.id||HH_OWN.test(e.text))).map(e=>e.text).concat(ch);
  if(a.self!==b.self){if(said(TS,HH_RX.self))(s.hhLog=s.hhLog||[]).push({t:s.t,why:'self'});else add(selfLine(s,a,b),'self');return out}
  const SL=s.f.sibL||[];
  for(const k of new Set([...a.keys,...b.keys])){const on=b.keys.has(k);if(a.keys.has(k)===on)continue;const role=hhRole(k);
    if(role==='sib'){const x=SL[+k.slice(3)];if(!x)continue;const e=on&&s.t<x.bt+2?null:[...x.ev].reverse().find(v=>v.t<=s.t);add(sibLine(s,x,e),k);continue}
    if(k==='grandma'||(role==='par'&&(k==='dad'||k==='mom')&&on&&a.keys.has('grandpa')))continue;
    if(said(T,HH_RX[role])){(s.hhLog=s.hhLog||[]).push({t:s.t,why:k});continue}
    add(memLine(s,k,on),k)}
  return out}}
/* only the brothers and sisters this household actually has show up in the diary */
{const sibOf=(s,base)=>sibList(s).some(x=>x.base===base);
 const so=sentOK;sentOK=function(s,x){const o=x.replace(/「[^」]*」/g,'');
  if(/我(有了|多了一個)(弟弟|妹妹)/.test(o))return false;
  if(/(我跟哥哥|我哥|哥哥說|哥哥帶我|哥哥把)/.test(o)&&!sibOf(s,'哥哥'))return false;
  if(/(我跟姊姊|我跟姐姐|我姊|我姐|姊姊說|姊姊帶我|姊姊把)/.test(o)&&!sibOf(s,'姊姊'))return false;
  if(/(我跟弟弟|我弟)/.test(o)&&!sibOf(s,'弟弟'))return false;
  if(/(我跟妹妹|我妹)/.test(o)&&!sibOf(s,'妹妹'))return false;
  return so(s,x)}}
