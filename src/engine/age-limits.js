/* ================= age limits: riding, smoking, drinking (license at 18; tobacco/alcohol under 18 banned from 1989, tobacco under 20 from 2023) ================= */
const RIDE_RX=/(^|[，。])(我|你)(自己|也)?(跟朋友|跟同學)?(騎機車|騎車|騎著機車|站著騎|騎摩托車|有了自己的機車|騎到一百|在彎道上摔車)/;
const SUB_RX=/(約我|拉我|找我|我也?)(去)?(喝一杯|喝酒|喝了酒|喝醉|喝到|喝完|喝了一瓶|喝了幾瓶|抽菸|點了一根菸|嚼檳榔|買香菸)|一罐啤酒|被拉去喝酒/;
function rideLine(s){if(s.f.noLic)return '';s.f.noLic=1;const y=s.y,rural=!s.urban;
 const pc=y<1980?(rural?.05:.25):y<1997?(rural?.1:.3):(rural?.25:.45);
 if(chance(pc)){s.f.noLicCaught=1;fx(s,{money:-1,rebel:2});
  return y<1980?'騎到半路被警察攔下來。我沒有駕照，警察叫爸爸來派出所把車牽回去，回家以後我一個月不准出門。'
   :y<1997?'在路口被警察攔下來。我沒有駕照，車子被扣了，爸媽要去監理站繳罰單，媽媽一路念到回家。'
   :'在路口被警察攔下來。我未滿十八歲，沒有駕照，罰單寄到家裡，車子被拖走。爸媽去領車那天，一路上都沒講話。'}
 fx(s,{risk:2});
 return y<1980&&rural?'我還沒有駕照，可是村子裡十幾歲的孩子都在騎，派出所的警員看到了，也只叫我騎慢一點。'
  :y<1997?'我還沒有駕照。每次經過路口看到警察，我就把頭壓低，心跳得很快。'
  :'我還沒滿十八歲，沒有駕照。我專挑小路騎，遠遠看到警察就繞路。'}
function rideFix(s,t){if(s.age>=18||s.dead||!t||!RIDE_RX.test(t))return t;const l=rideLine(s);return l?t+l:t}
{const st1=step;step=function(s){const out=st1(s);if(s.age<18&&!s.dead)for(const e of out){if(e.choices||e.death||e.birth)continue;e.text=rideFix(s,e.text)}return out}}
{const dc1=doChoice;doChoice=function(s,e,c){const r=dc1(s,e,c);if(r&&r.text&&s.age<18&&!s.dead&&RIDE_RX.test((e.text||'')+'。'+r.text)){const l=rideLine(s);if(l)r.text+=l}return r}}
{const so0=sentOK;sentOK=function(s,x){if(s.age<18&&SUB_RX.test(x.replace(/「[^」]*」/g,''))&&!/(偷|教官|被抓|不准|大人|爸|媽|阿公|阿伯|舅)/.test(x))return false;return so0(s,x)}}
/* a teenager offered a cigarette: whether it's sold to minors and whether school catches it follow that year's rules */
RE.push({id:'teen_smoke',p:s=>s.age>=14&&s.age<=17&&!s.f.teenSmoke&&!abroad(s)?.0012*(.5+(s.ax.rebel+s.ax.risk)/100):0,run:s=>{s.f.teenSmoke=1;const y=s.y;
 const yes=chance(.25+(s.ax.rebel+s.ax.risk-100)/120);
 if(!yes){return {tone:'neutral',cat:'生活',text:cyc(s,'tsNo',['下課躲在廁所後面，同學遞了一根菸給我。我搖搖頭，他們笑我乖寶寶，我也沒說什麼。','同學在頂樓偷抽菸，問我要不要。我說我會咳嗽，就先下樓了。'])}}
 fx(s,{rebel:3});s.f.teenSmoked=1;
 const buy=y<1989?'那時候小孩去柑仔店買菸，老闆只當是幫爸爸買。':y<1997?'柑仔店老闆明明知道我還在讀書，還是把菸賣給我。':y<2023?'便利商店的店員要看證件，菸是同學從他哥哥那裡拿來的。':'現在要滿二十歲才能買菸，菸是同學從網路上找人代買的。';
 const pc=y<1997?.3:.4;
 if(chance(pc)){return {tone:'bad',cat:'生活',text:'我跟同學躲在廁所後面抽了第一根菸，嗆到一直咳。'+buy+(y<1997?'教官從後面走過來，我們每個人記了一支警告，爸爸知道以後一整個禮拜沒跟我說話。':'教官把我們帶去學務處，學校打電話通知家長，還要我們去上戒菸課。')}}
 return {tone:'neutral',cat:'生活',text:'我跟同學躲在廁所後面偷抽了第一根菸，嗆到一直咳。'+buy+'回家前我嚼了好幾片口香糖，怕媽媽聞到。'}}});
/* Paddy 2026-10-17: danger choices come up about three times as often (rare jobs six times), and half of what used to be a death is a close call instead (see riskTick) */
const DG_SAVE=.7,DG_RARE=new Set(['coal_mine','ocean_fishing','merchant_sea','saudi','scaffold_high']);
for(const ev of DGR){const k=DG_RARE.has(ev.id)?9:4.5;ev.p*=k;if(ev.alsoIf)ev.alsoIf.p*=k}
for(const ev of DGR){const id='dg_'+ev.id,hasJob=ev.choices.some(c=>c.job);
  ev.choices.forEach(c=>{LEAN[id+':'+c.label]=c.lean||{};const pl=c.pull;PULL[id+':'+c.label]=s=>(pl&&s.money<pl.moneyBelow?pl.mult:1)*(c.norm?1.4:1);
    if(c.risk){const h=c.risk.habit;if(h)HW_ADD.add(h.k);(c.risk.near||[]).forEach(n=>n.habit&&HW_ADD.add(n.habit.k))}});
  MS.push({id,choice:1,check:s=>{if(s.dead||abroad(s)||s.t<(s.inServiceUntil||0)||(!ev.repeat&&s.f[id])||(s.risks||[]).some(x=>x.id===ev.id))return false;
      if(hasJob&&(!working(s)||s.needJob||s.studying||NEW_JOB.has(s.job)))return false;
      const inC=!ev.county||ev.county.includes(s.place);let p=ev.p;
      if(!inC){if(!ev.alsoIf||s.money>=ev.alsoIf.moneyBelow)return false;p=ev.alsoIf.p}
      const e2=Object.assign({},ev,{county:null});if(!fOK(s,e2))return false;
      if(ev.countyWeight&&ev.countyWeight[s.place])p*=ev.countyWeight[s.place];if(ev.sexWeight&&ev.sexWeight[s.sex]!=null)p*=ev.sexWeight[s.sex];
      return chance(p)},
    run:s=>{s.f[id]=1;return {cat:'人生',tone:'tense',title:ev.title,text:fillPH(s,ev.text),choices:ev.choices.map(c=>({label:c.label,go:s=>{
      if(c.fx)fx(s,c.fx);if(c.setFlag)s.f[c.setFlag]=1;s._prevJob=s.job;
      if(c.job){const code=JOB_T[c.job.code]!=null?c.job.code:(c.job.fallback||s.job);if(code!==s.job){s.job=code;s.jobStart=s.t}}
      if(c.risk){riskStart(s,ev,c);const x=(s.risks||[]).slice(-1)[0];if(x&&x.id===ev.id&&c.job)x.fallback=c.job.fallback}
      return fillPH(s,c.go)}}))}}})}
const DG_C={};DGR.forEach(ev=>ev.choices.forEach(c=>DG_C['dg_'+ev.id+':'+c.label]=c));
{const ct0=choiceTags;choiceTags=function(s,e,c,ctx){const t=ct0(s,e,c,ctx);const d=DG_C[e.id+':'+c.label];if(d){if(d.norm)t.push(['norm','身邊的人多半這樣選'])}return t}}
HW_ADD.forEach(k=>{if(HW[k]==null)HW[k]=2.5});
