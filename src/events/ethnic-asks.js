/* ================= ethnic asks: 「你想不想…？」 choices that your ethnic group makes easier or blocks (texts in content/ethnic.json › asks) =================
   Each ask is one milestone (id ea_<key>) asked at most once per life (some once more after the era opens up).
   Picking yes rolls against the era; a block goes to the era wall (eraLog), a success to 你滿意的事 when it has a sat line. */
const EAT=ETHC.asks||{};
const eaPick=x=>Array.isArray(x)?pick(x):x;
/* every ask text goes through this: ethnic.js placeholders plus {lang} / {gm} for the home language and the grandmother */
const EA_LANG={'客家':'客家話','閩南':'台語'},EA_GM={'客家':'阿婆','閩南':'阿嬤'};
const eaFill=(s,t)=>ethPH(s,t).replace(/\{lang\}/g,EA_LANG[s.eth]||'家裡的話').replace(/\{gm\}/g,EA_GM[s.eth]||'阿嬤');
const EA=[];
/* spread about one expected hit over the eligible window */
const eaRate=months=>Math.min(.5,1.4/Math.max(1,months));
function eaAdd(key,o){const T=EAT[key];if(!T)return;const id='ea_'+key;
  LEAN[id+':'+T.yes]=T.lean.yes;LEAN[id+':'+T.no]=T.lean.no;
  if(o.pull)for(const lb in o.pull)PULL[id+':'+T[lb]]=o.pull[lb];
  EA.push({id,key,T,ctx:o.ctx,eth:[].concat(o.eth)});
  MS.push({id,choice:1,check:s=>!abroad(s)&&!s.dead&&[].concat(o.eth).includes(s.eth)&&o.when(s)&&chance(o.p(s)),
    run:s=>{s.f[id]=(s.f[id]||0)+1;if(o.hush)for(const k of o.hush)s.f[k]=1;
      return {cat:'族群',title:eaFill(s,T.title),text:eaFill(s,T.text),choices:[{label:T.yes,go:s=>o.yes(s,T)},{label:T.no,go:s=>o.no(s,T)}]}}})}
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

/* ---------- 客家 ---------- */
/* 學校講母語: before 1987 the 說國語運動 fined and tagged pupils who spoke 方言; from 2001 鄉土語言 is a school subject */
eaAdd('hk_lang',{eth:['客家','閩南'],
  when:s=>!s.f.ea_hk_lang&&s.age>=7&&s.age<=12&&!s.urban,p:s=>eaRate(48),
  ctx:(s,T)=>s.y<1987?{text:T.normOld,norm:[T.no]}:s.y>=2001?{text:T.normNew,norm:[T.yes]}:{text:T.normMid,norm:[T.no]},
  yes:(s,T)=>{const L=EA_LANG[s.eth];if(s.y<1987){fx(s,{pride:-3,rebel:2});eaLog(s,T,T.eraWhy,1.2);return T.blocked.replace(/\{lang\}/g,L)}
    if(s.y>=2001){fx(s,{pride:4});return T.okNew.replace(/\{lang\}/g,L)}fx(s,{pride:2});return T.okMid.replace(/\{lang\}/g,L)},
  no:(s,T)=>{fx(s,{pride:-1});return T.noText.replace(/\{lang\}/g,EA_LANG[s.eth]).replace(/\{gm\}/g,EA_GM[s.eth])}});
/* 長孫顧祖堂: a rural Hakka eldest son born before 1985 who tries 北上打拼 is often called back by the family */
{const a=ASP.loc&&ASP.loc['北上打拼'];if(a){const p0=a.p,f0=a.fail;
  const held=s=>s.eth==='客家'&&!s.urban&&s.sex==='M'&&s.by<1985&&(sibList(s),s.f.eldest||s.f.only);
  a.p=s=>{const p=typeof p0==='function'?p0(s):p0;return held(s)?p*.6:p};
  a.fail=s=>{if(held(s)&&chance(.7)){const T=EAT.hk_heir;fx(s,{self:-4,lonely:3});eaLog(s,T,T.eraWhy,1.5);return T.fail}return f0(s)}}}
{const cf1=ctxFor;ctxFor=function(s,id){if(s.eth==='客家'&&s.by<=1985){
   if(id==='major'&&s.pjob!=='公教')return {text:EAT.hk_heir.normMajor,norm:['師範']};
   if(id==='loc'&&!s.urban&&s.sex==='M'&&(sibList(s),s.f.eldest||s.f.only))return {text:EAT.hk_heir.normLoc,norm:['留在家鄉']}}
  return cf1(s,id)}}
{const pt=PULL['師範'];PULL['師範']=s=>(pt?pt(s):1)*(s.eth==='客家'&&s.by<=1985?1.8:1)}

/* ---------- 外省 ---------- */
/* 軍校: a 眷村 son finishing high school before about 2008 is pushed toward the military academy (free board, a job waiting) */
eaAdd('ws_academy',{eth:'外省',hush:['eth_ws_academy'],
  when:s=>!s.f.ea_ws_academy&&s.juancun&&s.sex==='M'&&s.y<2008&&s.studying==='高中'&&s.t>=s.studyEnd-3&&s.t<s.studyEnd,p:s=>.5,
  ctx:(s,T)=>({text:T.norm,norm:[T.yes]}),
  pull:{yes:s=>1.5},
  yes:(s,T)=>{if(!chance(.85)){fx(s,{self:-2});return eaPick(T.fail)}
    s.studying=null;s.edu='大學';s.pend=null;s.needJob=false;s.needService=false;s.f.served=1;s.f.officer=1;s.job='公教';s.jobStart=s.t;s.inServiceUntil=0;
    fx(s,{rebel:-4,money:3});key(s,'讀了軍校');sat(s,'ea_academy','讀完軍校，掛上了少尉。',null,1.2);return T.ok},
  no:(s,T)=>{fx(s,{self:4,rebel:3});return T.noText}});
/* 眷村改建: after the 1996 國軍老舊眷村改建條例 the villages were torn down one by one; wanting to keep the old house does not stop it */
eaAdd('ws_rebuild',{eth:'外省',hush:['eth_ws_jc_rebuild'],
  when:s=>!s.f.ea_ws_rebuild&&s.juancun&&s.age>=10&&s.y>=1997&&s.y<=2008,p:s=>eaRate(72),
  ctx:(s,T)=>({text:T.norm,norm:[T.no]}),
  yes:(s,T)=>{fx(s,{lonely:5});eaLog(s,T,T.eraWhy,1.5);return T.blocked},
  no:(s,T)=>{fx(s,{lonely:2});return T.noText}});

/* ---------- 新住民子女 ---------- */
/* 學媽媽的話: the father's family often told the mother to speak only 國語; from 2019 (108 課綱) 新住民語文 is a primary-school subject */
const eaMomLang=s=>s.momFrom&&s.momFrom!=='中國大陸';
eaAdd('xz_lang',{eth:'新住民子女',
  when:s=>!s.f.ea_xz_lang&&eaMomLang(s)&&s.age>=6&&s.age<=11,p:s=>eaRate(48),
  ctx:(s,T)=>s.y>=2019?{text:T.normNew,norm:[T.yes]}:{text:T.normOld,norm:[T.no]},
  yes:(s,T)=>{const block=s.y<2005?.7:s.y<2019?.4:.1;
    if(chance(block)){fx(s,{pride:-2,lonely:2});eaLog(s,T,s.y<2019?T.eraWhy:T.eraWhyNew,1.5);return ethPH(s,T.blocked)}
    s.f.momLang=1;fx(s,{pride:5,lonely:-2});return ethPH(s,s.y>=2019?T.okNew:T.ok)},
  no:(s,T)=>ethPH(s,T.noText)});
/* 外派: from the 2016 新南向 push, speaking the mother's language becomes something a company pays for */
eaAdd('xz_work',{eth:'新住民子女',hush:['eth_xz_asset'],
  when:s=>!s.f.ea_xz_work&&s.f.momLang&&s.y>=2016&&s.age>=22&&s.age<=40&&working(s)&&['公司','科技','工廠','服務'].includes(s.job),p:s=>eaRate(60),
  ctx:(s,T)=>({text:T.norm,norm:[T.yes]}),
  yes:(s,T)=>{if(chance(.8)){fx(s,{money:5,pride:4,self:3});key(s,'因為會講媽媽的話，被派去'+(MOM_LAND[s.momFrom]||'國外')+'出差');sat(s,'ea_xzwork',ethPH(s,T.sat),null,1.3);return ethPH(s,T.ok)}
    return ethPH(s,eaPick(T.fail))},
  no:(s,T)=>ethPH(s,T.noText)});
/* 母親國籍那一欄: not blocked, but before about 2010 writing it down often got you called 外配的小孩 */
eaAdd('xz_form',{eth:'新住民子女',hush:['eth_xz_form'],
  when:s=>!s.f.ea_xz_form&&s.age>=9&&s.age<=14,p:s=>eaRate(48),
  ctx:(s,T)=>s.y<2010?{text:T.normOld,norm:[T.no]}:null,
  yes:(s,T)=>{if(s.y<2010&&chance(.6)){fx(s,{lonely:5,pride:-2});return ethPH(s,T.teased)}fx(s,{pride:3});return ethPH(s,T.ok)},
  no:(s,T)=>{fx(s,{pride:-2});return ethPH(s,T.noText)}});

/* ---------- 閩南 ---------- */
/* 接家裡的店: before about 1980 births the shop usually went to a son; a daughter who wants it is often passed over */
const eaBro=s=>sibList(s).some(x=>x.sex==='M');
eaAdd('mn_shop',{eth:'閩南',
  when:s=>!s.f.ea_mn_shop&&s.pjob==='小生意'&&parAlive(s)&&s.age>=20&&s.age<=32&&!s.studying&&s.job!=='自營'&&!abroad(s),p:s=>eaRate(60),
  ctx:(s,T)=>s.sex==='F'&&s.by<1980?{text:T.normDaughter,norm:[T.no]}:s.sex==='M'&&s.by<1985?{text:T.normSon,norm:[T.yes]}:null,
  pull:{yes:s=>s.sex==='M'&&s.by<1985?1.6:1},
  yes:(s,T)=>{if(s.sex==='F'&&s.by<1980&&chance(.7)){fx(s,{self:-3,pride:-2});eaLog(s,T,T.eraWhy,1.6);return eaBro(s)?T.blocked:T.blockedCousin}
    if(chance(s.y>=2000?.75:.9)){s.job='自營';s.jobStart=s.t;fx(s,{risk:3,money:2});key(s,'接下家裡的店');sat(s,'ea_shop','接下了家裡的店。',null,1.3);return eaPick(T.ok)}
    return T.fail},
  no:(s,T)=>{if(s.sex==='M'&&s.by<1985){fx(s,{self:4,lonely:2});return T.noSon}return T.noText}});
