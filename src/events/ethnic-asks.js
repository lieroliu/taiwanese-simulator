/* ================= ethnic asks: 「你想不想…？」 choices that your ethnic group makes easier or blocks (texts in content/ethnic.json › asks) =================
   Each ask is one milestone (id ea_<key>) asked at most once per life (some once more after the era opens up).
   Picking yes rolls against the era; a block goes to the era wall (eraLog), a success to 你滿意的事 when it has a sat line. */
const EAT=ETHC.asks||{};
const eaPick=x=>Array.isArray(x)?pick(x):x;
const EA=[];
/* spread about one expected hit over the eligible window */
const eaRate=months=>Math.min(.5,1.4/Math.max(1,months));
function eaAdd(key,o){const T=EAT[key];if(!T)return;const id='ea_'+key;
  LEAN[id+':'+T.yes]=T.lean.yes;LEAN[id+':'+T.no]=T.lean.no;
  if(o.pull)for(const lb in o.pull)PULL[id+':'+T[lb]]=o.pull[lb];
  EA.push({id,key,T,ctx:o.ctx});
  MS.push({id,choice:1,check:s=>!abroad(s)&&!s.dead&&s.eth===o.eth&&o.when(s)&&chance(o.p(s)),
    run:s=>{s.f[id]=(s.f[id]||0)+1;if(o.hush)for(const k of o.hush)s.f[k]=1;
      return {cat:'族群',title:T.title,text:T.text,choices:[{label:T.yes,go:s=>o.yes(s,T)},{label:T.no,go:s=>o.no(s,T)}]}}})}
{const cf0=ctxFor;ctxFor=function(s,id){const a=EA.find(x=>x.id===id);if(a)return a.ctx?a.ctx(s,a.T):null;return cf0(s,id)}}
const eaLog=(s,T,cause,w)=>eraLog(s,'ea_'+T.eraTxt,T.eraTxt,eraWhyLine(s,cause),w||1.5);

/* ---------- 原住民 ---------- */
/* 族語認證 (from 2013 the exam bonus is 35% with the certificate, 10% without; before that a flat 25%) */
eaAdd('in_cert',{eth:'原住民',hush:['eth_in_cert'],
  when:s=>!s.f.ea_in_cert&&s.studying==='高中'&&s.y>=2012&&s.age>=16&&s.age<=17,p:s=>eaRate(18),
  ctx:(s,T)=>({text:T.norm,norm:[T.yes]}),
  yes:(s,T)=>{const p=clamp((s.urban?.5:.8)+(s.fam==='隔代教養'?.12:0)+(s.study-50)/200,.3,.95);
    if(chance(p)){s.f.inCert=1;fx(s,{pride:4});return eaPick(T.ok)}fx(s,{pride:-1});return eaPick(T.fail)},
  no:(s,T)=>T.noText});
const uniBonus=s=>s.eth!=='原住民'?0:s.y<2013?.25:s.f.inCert?.35:.1;
{const un=MS.find(x=>x.id==='uni'),ur=un.run;un.run=s=>{const e=ur(s);const b=uniBonus(s);const c=e&&e.choices&&e.choices.find(c=>c.label==='考大學');
  if(c&&b){const go=c.go;c.go=s=>{const st=s.study;s.study=st+(70+st)*b*1.6;let r;try{r=go(s)}finally{s.study=st}if(s.pend==='major'||s.studying==='大學')s.f.inBonusUsed=1;return r}}
  return e}}

/* 下山 or stay: before about 2005 there was almost no steady work near the tribe; 文化健康站 open from 2006, tourism from about 2000 */
eaAdd('in_stay',{eth:'原住民',
  when:s=>!s.f.ea_in_stay&&!s.urban&&s.place===s.birthCounty&&s.age>=20&&s.age<=32&&working(s)&&['農','工廠','營造','服務'].includes(s.job),p:s=>eaRate(60),
  ctx:(s,T)=>s.y<2005?{text:T.normOld,norm:[T.no]}:{text:T.normNew,norm:[]},
  pull:{no:s=>s.y<2000?1.6:1},
  yes:(s,T)=>{const p=s.y<2000?.3:s.y<2006?.45:.7;
    if(chance(p)){fx(s,{lonely:-4,pride:4,money:-2});sat(s,'ea_stay','一直住在部落。',null,1.2);
      if(s.y>=2006&&chance(.6)){s.job='服務';s.jobStart=s.t;return T.okNew}if(s.y>=2000&&chance(.5)){s.job='服務';s.jobStart=s.t;return T.okTour}
      s.job='農';s.jobStart=s.t;return T.okOld}
    eaLog(s,T,T.eraWhy);return T.fail+eaDown(s,T)},
  no:(s,T)=>eaDown(s,T)});
function eaDown(s,T){s.place=pick(['台北縣','台北縣','桃園縣','台北市'].filter(x=>x!==s.place));const f=s.sex==='F';s.job=f?'工廠':'營造';s.jobStart=s.t;fx(s,{lonely:6,money:3,self:3});key(s,'下山到都市工作');return f?T.downF:T.down}

/* 傳統名字: not allowed before the 1995 姓名條例 amendment; a block is asked again once after it opens */
eaAdd('in_name',{eth:'原住民',hush:['eth_in_name'],
  when:s=>s.age>=18&&s.age<=60&&s.y>=1985&&(!s.f.ea_in_name||(s.f.eaNameNo===1&&s.f.ea_in_name===1&&s.y>=1995&&s.t>=s.f.eaNameT+12)),
  p:s=>s.f.eaNameNo?eaRate(36):eaRate(240),
  ctx:(s,T)=>null,
  yes:(s,T)=>{if(s.y<1995){s.f.eaNameNo=1;s.f.eaNameT=s.t;fx(s,{pride:-2});eaLog(s,T,T.eraWhy,1.2);return T.blocked}
    s.f.eaNameNo=2;fx(s,{pride:6});
    const L=s.eraLog&&s.eraLog.find(r=>r.txt===T.eraTxt);if(L)L.txt=`想用部落的名字登記，等到 ${s.y} 年才登記成。`;
    sat(s,'ea_name',T.sat,null,1.2);return T.ok},
  no:(s,T)=>{s.f.eaNameNo=2;return T.noText}});
