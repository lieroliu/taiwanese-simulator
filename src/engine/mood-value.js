/* ================= mood value: 0–100, pushed every month by family money, work, love, family and the era =================
   s.mood absorbs s.lonely (loneliness drags it down). Choices trade money for mood. Low mood for a long stretch becomes
   depression; whether it gets diagnosed depends on the era. Depression and its suicide risk are only written on the end page. */
const MOOD_C={'跟朋友到處玩':6,'學才藝':4,'北上讀書':3,'先出國打工度假':10,'做小生意':4,'文法':2,'轉行':3,'開早餐店':3,'結婚':6,'見面，然後結婚':2,'生':5,'再生一個':3,'不生':2,'繼續租':1,
 '提早退休':6,'退休':5,'自己住':1,'跟孩子住':3,'離婚':2,'去看浪':7,'去飆車':8,'去爬山':6,'跟去游泳':6,'不戴':2,'每期都簽':3,'偶爾簽一點':2,'跟著嚼':1,'住安養中心':1,
 '去補習班':-4,'回家幫忙':-3,'去工作':-3,'直接去工作':-2,'讀高職':-1,'去中國當台幹':-6,'跟過去':-5,'進工廠':-3,'回家幫忙種田':-2,'繼續工作':-3,
 '上船':-8,'下礦坑':-7,'去跑船':-7,'去沙烏地':-8,'去做高空':-4,'出海':-4,'去美商電子廠':-2,'去紡織廠':-3,'打電話借':-6,'再去求親戚':-5,'自己撐過去':-4,
 '自己照顧':-8,'撐下去':-6,'送安養中心':-2};
const MOOD_UP={kid:['那段時間，我每天都玩得很開心。','我每天都很期待放學。'],
 adult:['這是我自己想做的事，再累也甘願。','那陣子，我每天醒來都覺得有事情可以期待。','家裡的人不太懂，可是我過得很開心。','錢沒有比較多，可是我覺得日子是自己的。','我覺得，這幾年沒有白活。']};
const MOOD_DOWN={kid:['我常常一個人發呆，不知道自己在忙什麼。','我好想跟別人一樣去玩。'],
 adult:['錢是多了一點，可是我每天回家都累得說不出話。','存摺上的數字變多了，我卻高興不起來。','我告訴自己，忍幾年就好。','我常常想，這真的是我要的日子嗎。','日子過得去，只是越來越少笑。']};
function moodTarget(s){
  let t=(s.age<12?60+(s.money-50)*.15:52+(s.money-50)*.3)+s._tmp;
  if(s.health<70)t-=Math.min(8,(70-s.health)*.15);
  t-=Math.max(0,s.lonely-30)*.6;
  if(s.age<18)t-=({'單親':4,'家人久病':6,'隔代教養':3,'受難者家屬':2}[s.fam]||0);
  if(s.job==='失業')t-=12;if(['台幹','漁工','礦工','海員'].includes(s.job))t-=4;
  if(s.f.caring)t-=s.f.parentill?7:4;if(s.f.separated)t-=8;if(s.f.kidConflict)t-=3;
  if(s.married&&s.marriedT&&s.t-s.marriedT<36)t+=4;if(s.kidBorn&&s.kidBorn.some(b=>s.t-b<12))t+=3;if(s.job==='退休')t+=2;
  const sc=activeScar(s);if(sc)t-=sc.w*10;
  if(s.age>=15){if(hardY(s.y))t-=5;if(s.y>=2020&&s.y<=2022)t-=3}
  if(s.dep)t-=s.dep.dx?4:10;
  return clamp(t,5,95)}
const DEP_DX=y=>y<1990?.05:y<2000?.15:y<2010?.3:y<2020?.5:.65;
function moodMonth(s,out){
  let d=0;for(const e of out){if(e.choices||e.death)continue;d+=e.tone==='good'?3:e.tone==='bad'?-4:e.tone==='tense'?-1.5:0}
  s.mood=clamp(s.mood+clamp(d,-10,10)+(moodTarget(s)-s.mood)*.06,0,100);
  if(s.age<12)return;
  if(s.mood<30)s.lowM++;else if(s.mood>40)s.lowM=Math.max(0,s.lowM-2);
  if(!s.dep){if(s.lowM>=s._depTh){s.dep={from:s.t,age:s.age,y:s.y,dx:0,dxAt:chance(clamp(DEP_DX(s.y)*(s.urban?1.15:.8)*(s.edu==='大學'?1.2:1)*(s.age<18?.6:1),0,.9))?s.t+2+Math.floor(R()*16):0};(s._help||(s._help=new Set())).add('心情')}return}
  const p=s.dep;
  if(!p.dx&&p.dxAt&&s.t>=p.dxAt){p.dx=1;p.dxAge=s.age;p.dxY=s.y}
  if(working(s)&&chance(.006)){s.f.depWork=1;fx(s,{money:-3})}
  if(s.married&&chance(.006)){s.f.depFight=1;fx(s,{lonely:3})}
  if(chance(p.dx?.045:moodTarget(s)>35?.012:.003)){s.depHist.push({from:p.from,to:s.t,age:p.age,toAge:s.age,y:p.y,dx:p.dx,dxAge:p.dxAge,dxY:p.dxY});s.dep=null;s.lowM=0;s.mood=clamp(s.mood+8,0,100);s._depTh=12+Math.floor(R()*13)}}
{const nl0=newLife;newLife=function(by,F){const s=nl0(by,F);s._tmp=(R()+R()-1)*16;s.mood=clamp(60+(s.money-50)*.15-(s.fam!=='無'?4:0),20,80);s.lowM=0;s._depTh=12+Math.floor(R()*13);s.dep=null;s.depHist=[];return s}}
{const sp0=sample;sample=function(s){sp0(s);if(s.mood!==undefined)s.hist[s.hist.length-1].mood=s.mood}}
{const st0=step;step=function(s){const out=st0(s);if(!s.dead&&s.mood!==undefined)moodMonth(s,out);return out}}
{const y0=yearly;yearly=function(s){y0(s);if(s.mood>68)s.health=clamp(s.health+.8,0,100);else if(s.mood<30)s.health=clamp(s.health-1,0,100)}}
/* good mood means fewer fights; depression means more */
{const dv=MS.find(x=>x.id==='divorce'),c0=dv.check;dv.check=s=>{if(s.mood>65&&chance(.5))return false;return c0(s)||(!!s.dep&&c0(s))}}
/* depression raises suicide risk a little; the extra deaths are all suicide */
const DEP_Q=s=>s.dep&&s.age>=15&&s.age<85?.0015:0;
{const q0=annualQ;annualQ=function(s){return Math.min(q0(s)+DEP_Q(s),.6)}}
{const c0=causeOf;causeOf=function(s){const x=DEP_Q(s);if(x&&chance(x/annualQ(s)))return '自殺';return c0(s)}}
/* choices: the mood they bring, a line in the diary when it is big, and the tone of the mood line */
{const dc=doChoice;doChoice=function(s,e,c){const r=dc(s,e,c);if(!r||s.mood===undefined)return r;
  let d=MOOD_C[c.label]||0;if(c.risk&&!c.job)d+=(s.ax.risk-50)/50*4;
  const ls=leanScore(s,e.id,c.label);if(ls>=10)d+=3;else if(ls<=-10)d-=3;
  if(r.fail)d=Math.min(d,0)-6;
  s.mood=clamp(s.mood+d,0,100);
  if(!r.fail){if(d>=5)r.mtone='good';else if(d<=-5)r.mtone='bad'}
  if(!r.fail&&Math.abs(d)>=6&&s.age>=6&&r.text&&!FELT.test(r.text)&&chance(.6)){const P=(d>0?MOOD_UP:MOOD_DOWN)[s.age<15?'kid':'adult'];const l=cyc(s,'mc'+(d>0?'+':'-')+(s.age<15?'k':'a'),P);if(splitSent(l).every(x=>sentOK(s,x)))r.text+=l}
  return r}}
/* end page: how this life felt, and the low stretches */
function moodSection(s){const h=s.hist.filter(p=>p.mood!==undefined&&p.age>=6);if(h.length<3)return '';
  const avg=h.reduce((a,p)=>a+p.mood,0)/h.length;
  const win=k=>{let best=null;for(let i=0;i+4<h.length;i++){const v=h.slice(i,i+5).reduce((a,p)=>a+p.mood,0)/5;if(!best||(k>0?v>best.v:v<best.v))best={v,a:h[i].age,b:h[i+4].age}}return best};
  const hi=win(1),lo=win(-1);let t=avg>=62?'你這一生，大部分的時候過得還算開心。':avg>=45?'你這一生，開心和難過的日子差不多一半一半。':'你這一生，心裡苦的時候比開心的時候多。';
  if(hi&&lo&&hi.v-lo.v>12)t+=`最開心的是 ${hi.a} 到 ${hi.b} 歲那幾年，最難熬的是 ${lo.a} 到 ${lo.b} 歲。`;
  const eps=s.depHist.slice();if(s.dep)eps.push({age:s.dep.age,toAge:null,y:s.dep.y,dx:s.dep.dx,dxAge:s.dep.dxAge,dxY:s.dep.dxY});
  const lines=eps.slice(0,2).map((p,i)=>{const span=p.toAge==null?`${p.age} 歲以後`:p.toAge>p.age?`${p.age} 到 ${p.toAge} 歲`:`${p.age} 歲`;
    if(p.dx)return `${p.dxAge} 歲那年，你去看了身心科，醫生說是憂鬱症。`+(p.toAge==null?(s.cause==='自殺'?'那一段低潮，最後沒有走出來。':'到最後都沒有完全好起來。'):`吃了一陣子的藥，你慢慢好了起來。`);
    return `${span}那段時間，你什麼都提不起勁。${p.y<1995?'那個年代，沒有人會說這是生病，':''}你一直以為自己只是累了。現在回頭看，那很可能是憂鬱症。`+(p.toAge==null&&s.cause==='自殺'?'那一段低潮，最後沒有走出來。':'')});
  if(eps.length&&(s.f.depWork||s.f.depFight))lines.push(`低潮的那幾年，${[s.f.depWork&&'工作常常出狀況',s.f.depFight&&'跟另一半也吵得很兇'].filter(Boolean).join('，')}。`);
  return `<div><h2 style="font-size:22px;margin-bottom:8px">你的心情</h2><p style="margin:0">${esc(t)}</p>${lines.map(l=>`<p style="margin:8px 0 0">${esc(l)}</p>`).join('')}</div>`}
