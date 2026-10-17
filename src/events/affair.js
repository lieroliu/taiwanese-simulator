/* ================= affair.json: it happens to the marriage ================= */
const kidOldest=s=>{const K=kidsOf(s).filter(k=>k.alive);return K.length?s.y-Math.min(...K.map(k=>k.by)):-1};
const axOK=(s,x)=>{for(const k in x.axisMin||{})if((s.ax[k]??50)<x.axisMin[k])return false;for(const k in x.axisMax||{})if((s.ax[k]??50)>x.axisMax[k])return false;return true};
const afOK=(s,x,sp)=>inY(s,x.y)&&(!x.months||x.months.includes(s.m))&&(!x.sex||x.sex===s.sex)&&(!x.spSex||(sp&&x.spSex===sp.sex))&&needOK(s,x.need)&&(x.money!=='low'||s.money<30)
  &&(!x.away||(sp&&sp.away==='中國'))&&(x.minAge==null||s.age>=x.minAge)&&(x.maxAge==null||s.age<=x.maxAge)&&(!x.job||x.job.includes(s.job))&&axOK(s,x)&&(!x.famNot||!x.famNot.includes(s.fam))&&(!x.flag||s.f[x.flag])
  &&(!x.kidAge||(kidOldest(s)>=x.kidAge[0]&&kidOldest(s)<=x.kidAge[1]));
function afT(s,t,sp,who){s._oSex=who==='self'?(s.sex==='M'?'F':'M'):null;const r=fillPH(s,t,sp);s._oSex=null;return r}
function afLine(s,L,sp,who){const U=ptU(s);const c=L.filter(x=>!U.has(x.text)&&afOK(s,x,sp)&&txtOK(s,afT(s,x.text,sp,who)));const v=c.length?pick(c):null;if(!v)return null;U.add(v.text);return afT(s,v.text,sp,who)}
const afExp=(ax,src)=>{let v=0;for(const k in ax)v+=ax[k]*((src[k]??50)-50);return Math.exp(v)};
function divorceEnd(s,sp){if(!s.married)return;s.married=false;s.f.divorced=1;s.f.everMar=1;s.f.liveWith=null;s.aff=null;key(s,'離婚');if(sp&&sp.role==='spouse'){sp.role='ex';storyAdd(s,sp,'跟你離婚')}}
function affHR(s,when,sp){for(const h of AF.habits||[])if(h.when===when&&(!h.sex||h.sex===s.sex))habit(s,h.k,h.say,h.does,h.why);
  for(const r of AF.regrets||[])if(r.when===when)regret(s,r.k,fillPH(s,r.txt,sp),fillPH(s,r.why,sp),r.w)}
function affPost(s,pool,pid,dt){(s.affPost=s.affPost||[]).push({t:s.t+dt,pool,pid,fc:s.f.affFound||0})}
function affThen(s,th,sp){s.aff=null;s.f.affFound=(s.f.affFound||0)+1;affHR(s,'spouse',sp);
  if(th==='talk')s.f.affTalked=1;if(th==='endure')s.f.affairEndured=1;if(th==='separate')s.f.separated=1;if(th==='divorce')divorceEnd(s,sp);
  if(th==='sue'){s.f.affairSued=1;s.affSue=s.t+ri(6,12);s.affSuePid=sp.id}
  if(th!=='sue')affHR(s,th,sp);const n=th==='sue'?1:chance(.5)?2:1;for(let i=0;i<n;i++)affPost(s,th,sp.id,ri(3,12));
  if(s.kids>0&&chance(.5))affPost(s,'kids',sp.id,ri(1,6))}
function affGo(s,c){const sp=spouse(s);if(!sp)return '';/* no spouse left by the time the choice is answered */
  const v=c.go.find(g=>afOK(s,g,sp))||c.go[c.go.length-1];const t=afT(s,v.text,sp,'spouse');if(c.fx)fx(s,c.fx);affThen(s,c.then,sp);return t}
function selfFound(s,sp){const R0=AF.self.spouseReacts,a=sp.ax.self??50;s.aff=null;
  const w={forgive:1+(50-a)/40,cold:1,separate:.8+(a-50)/60,divorce:.6+(a-50)/40};const k=pickW(Object.keys(w),x=>Math.max(.1,w[x]));const o=R0[k];
  let t=afLine(s,AF.found.filter(x=>x.who==='self'),sp,'self')||'';t+=afT(s,pick(o.text),sp,'self');fx(s,o.fx||{});
  if(k==='separate')s.f.separated=1;if(k==='divorce')divorceEnd(s,sp);key(s,'外遇被發現');affHR(s,'selfFound',sp);return t}
function affMonthly(s,say){if(!AF.onset)return;const sp=spouse(s);
  if(!s.married||!sp||s.f.separated){s.aff=null;return}
  if(s.aff&&s.aff.pid!==sp.id)s.aff=null;
  const yrs=(s.t-(s.marriedT||s.t))/12,fm=s.f.lastFightT!=null&&s.t-s.f.lastFightT<=24?1:0;
  if(!s.aff){const o=AF.onset.spouse,a=s.y-sp.by,away=sp.away==='中國'&&inY(s,o.away.y);
    if((sp.affN||0)<o.maxPerMarriage&&a>=o.ageRange[0]&&a<=o.ageRange[1]){
      const p=o.annual*at3(o.era,s.y,1)*(at3(o.spSexMult,s.y,{})[sp.sex]||1)*at3(o.yearsMarried,yrs,1)*afExp(o.axis,sp.ax)*(away?o.away.mult:1)*(fm?o.fightMult:1);
      if(chance(p/12)){sp.affN=(sp.affN||0)+1;s.aff={who:'spouse',pid:sp.id,t:s.t,away,next:s.t+ri(2,6)};s.f.spAffN=(s.f.spAffN||0)+1;return}}
    const q=AF.onset.self;if(s.t>=q.from[0]*12+q.from[1]-1&&(s.f.selfAffN||0)<q.maxPerLife&&s.age>=q.ageRange[0]&&s.age<=q.ageRange[1]){
      const p=q.annual*at3(q.yearsMarried,yrs,1)*afExp(q.axis,s.ax)*(s.age>60&&s.lonely>60?q.lonelyOver60:1);
      if(chance(p/12)){s.f.selfAffN=1;s.aff={who:'self',pid:sp.id,t:s.t,next:s.t+ri(3,6)};say(afLine(s,AF.self.start,sp,'self'),'家庭','neutral')}}
    return}
  const A=s.aff,D=AF.discover;if(A.found)return;A.away=sp.away==='中國';
  if(chance(D.endMonthly)){s.aff=null;if(A.who==='spouse'){storyAdd(s,sp,A.away?AF.neverKnown.storyAway:AF.neverKnown.story);s.f.affNever=(s.f.affNever||0)+1}else say(afLine(s,AF.self.end,sp,'self'),'家庭','neutral');return}
  if(chance(D.monthly*at3(D.era,s.y,1)*(A.away?D.awayMult:1))){if(A.who==='spouse'){A.found=1;return}say(selfFound(s,sp),'家庭','bad');return}
  if(s.t>=A.next){A.next=s.t+(A.who==='spouse'?ri(4,8):ri(3,6));say(afLine(s,A.who==='spouse'?AF.signs:AF.self.during,sp,A.who),'家庭',A.who==='spouse'?'bad':'neutral')}}
function affLater(s,say){
  if(s.affSue&&s.t>=s.affSue){const sp=s.people.find(x=>x.id===s.affSuePid);s.affSue=0;const out=s.ax.self>=50&&s.married?'divorce':'endure';
    if(out==='divorce'){fx(s,{lonely:15,open:5,money:-6});divorceEnd(s,sp)}else s.f.affairEndured=1;affHR(s,out,sp);affPost(s,out,sp?sp.id:0,ri(3,9));
    say(afLine(s,AF.after.sue,sp,'spouse'),'家庭','bad');return}
  const P=s.affPost;if(!P||!P.length)return;const i=P.findIndex(x=>s.t>=x.t);if(i<0)return;const x=P.splice(i,1)[0];
  if(x.pool==='talk'&&(s.f.affFound||0)>x.fc)return;const sp=s.people.find(p=>p.id===x.pid);
  say(afLine(s,x.pool==='kids'?AF.kids.lines:AF.after[x.pool]||[],sp,'spouse'),'家庭',x.pool==='talk'?'neutral':'bad')}
{const i=MS.findIndex(x=>x.id==='divorce');MS.splice(i,0,{id:'affair',choice:1,check:s=>!!(AF.respond&&s.aff&&s.aff.found&&s.aff.who==='spouse'&&s.married&&spouse(s)&&spouse(s).id===s.aff.pid),run:s=>{const sp=spouse(s);
  const f=afLine(s,AF.found.filter(x=>x.who==='spouse'),sp,'spouse')||afT(s,'我發現{n}在外面有人。',sp,'spouse');key(s,`發現${nm(sp)}外遇`);
  const ch=AF.respond.choices.filter(c=>!c.until||s.t<=c.until[0]*12+c.until[1]-1).map(c=>({label:c.label,go:s=>affGo(s,c)}));
  return {cat:'家庭',title:'另一半外遇',tone:'bad',text:f+fillPH(s,AF.respond.ask,sp),choices:ch}}})}
if(AF.respond){for(const c of AF.respond.choices){if(c.lean)LEAN['affair:'+c.label]=c.lean;
    if(c.hard){const h=c.hard;(ASP.affair=ASP.affair||{})[c.label]={p:s=>inY(s,h.y)&&(!h.sex||h.sex===s.sex)&&(h.money!=='low'||s.money<30)?0:1,
      fail:s=>{const sp=spouse(s),alt=AF.respond.choices.find(x=>x.then===h.fail);if(alt&&alt.fx)fx(s,alt.fx);const t=afT(s,h.failText,sp,'spouse');affThen(s,h.fail,sp);return t}}}}
  PULL['affair:離婚']=s=>s.f.affTalked?2:1;
  for(const h of AF.habits||[])HW[h.k]=HW[h.k]||2}
{const c0=ctxFor;ctxFor=function(s,id){if(id==='meet'&&s._pair){const v=(s._pair.tp.normText||[]).find(x=>inY(s,x.y));return v?{text:v.text,norm:[v.norm]}:null}
  if(id==='affair'&&AF.respond){const v=(AF.respond.normText||[]).find(x=>inY(s,x.y)&&(!x.sex||x.sex===s.sex));return v?{text:v.text,norm:[v.norm]}:null}return c0(s,id)}}
for(const x of AF.ambient||[])PE.push({id:'af_'+x.id,p:s=>{if(s.f['af_'+x.id])return 0;if(x.id==='am_law2020'&&s.f.affairSued)return 0;
    if(x.id==='am_parents'){if(s.f.amPar===undefined)s.f.amPar=chance(x.p??1)?1:0;if(!s.f.amPar)return 0}
    const sp=spouse(s);if(x.spAway&&!(sp&&sp.away==='中國'))return 0;if(!afOK(s,x,sp)||guardText(s,fillPH(s,x.text,sp))!==fillPH(s,x.text,sp))return 0;return FUN_P*(x.months?2.5:1)},
  run:s=>{s.f['af_'+x.id]=1;if(/^am_law2020/.test(x.id)){s.f.af_am_law2020=1;s.f.af_am_law2020_sued=1}return {cat:'生活',tone:'neutral',text:fillPH(s,x.text,spouse(s))}}});
/* spouse sent to a Taiwanese factory in China */
{const py0=peopleYearly;peopleYearly=function(s){py0(s);const sp=spouse(s);if(!sp||!sp.alive||s.place==='中國'||!s.married)return;const a=s.y-sp.by;
  if(!sp.away&&a>=25&&a<=55&&s.y>=1992&&s.y<=2012&&['工廠','公司'].includes(sp.job)&&chance(.015)){sp.away='中國';storyAdd(s,sp,'被派去中國工作');
    qPush(s,{pri:1,cat:'家庭',tone:'neutral',text:`${nm(sp)}被公司派去${pick(['東莞','昆山','上海','蘇州'])}的工廠。臨走前${pr(sp)}說，最多三年就回來。`})}
  else if(sp.away==='中國'&&chance(s.y>2015?.15:.06)){sp.away=null;storyAdd(s,sp,'從中國回到台灣');
    qPush(s,{pri:1,cat:'家庭',tone:'good',text:`在對岸待了好幾年的${nm(sp)}回台灣了。第一天晚上，${pr(sp)}在家裡找不到碗放在哪裡。`})}}}
{const fp0=fillPH;fillPH=function(s,t,pt){if(t&&t.indexOf('{')>=0){
    if(s._pairAB){const [A,B]=s._pairAB,J=p=>p.job?JOBLABEL[p.job]:'學生';t=t.replace(/\{ap\}/g,pr(A)).replace(/\{bp\}/g,pr(B)).replace(/\{aj\}/g,J(A)).replace(/\{bj\}/g,J(B)).replace(/\{a\}/g,nm(A)).replace(/\{b\}/g,nm(B))}
    if(t.indexOf('{o}')>=0){const sx=s._oSex||(pt?(pt.sex==='M'?'F':'M'):null);t=t.replace(/\{o\}/g,sx==='M'?'那個男人':sx==='F'?'那個女人':'那個人')}
    if(t.indexOf('{sibs}')>=0)t=t.replace(/\{sibs\}/g,CN_NUM[Math.min(9,Math.max(1,(pt&&pt.sibs)||1))])}
  return fp0(s,t,pt)}}
/* monthly: affair, after-lines, the other one, in-laws, married fights */
{const stP=step;step=function(s){const out=stP(s);if(s.dead||out.some(e=>e.death))return out;let said=false;
  const say=(t,cat,tone)=>{if(said||!t||!txtOK(s,t))return false;out.push({cat:cat||'家庭',tone:tone||'neutral',text:t,_pt:1});said=true;return true};
  if(!s.married){s.aff=null;s.f.liveWith=null}
  affMonthly(s,say);affLater(s,say);if(PT.pairs)pairOtherLine(s,say);if(PT.inlaws)lwMonthly(s,say);
  const f=marFight(s);if(f)say(f,'家庭','bad');
  if(s.m===s.bm&&s.age>0&&PT.inlaws)lwYearly(s,say);return out}}
//@include data/sx.js
