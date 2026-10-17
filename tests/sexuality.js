// Same-sex lives in the real engine: how many, when they realize, whom they tell, how families react, and the eight logic rules
// from content/FORMAT.md (sexuality.json). The blind-date rule uses what the family knew before the month began. Forces gay or bi characters so the rules get enough cases.
// Without a forced orient, nobody is born knowing: about a third meet the 12–17 對同性好奇 choice (curiousRate) and auto-run keeps gay+bi near 6% (orientRate).
// Run: PW=... node tests/sexuality.js index.html [N]
const { chromium } = require(process.env.PW||'playwright');
const file=process.argv[2]||'index.html',N=+process.argv[3]||600;
(async()=>{const b=await chromium.launch();const p=await b.newPage();const errs=[];p.on('pageerror',e=>errs.push(e.message));
// fixed seed: orientRate is a ~2-sd-wide check on 1200 lives, so unseeded runs of the same build could flip
await p.addInitScript(()=>{let a=20261017;Math.random=()=>{a=(a+0x6D2B79F5)>>>0;let t=a;t=Math.imul(t^t>>>15,t|1);t^=t+Math.imul(t^t>>>7,t|61);return((t^t>>>14)>>>0)/4294967296}});await p.goto('file://'+process.cwd()+'/'+file);
const r=await p.evaluate((N)=>{const T=(y,m)=>y*12+m-1;const bad={},ex={},st={real:{},told40:{},react:{},mar:0,cohab:0,pass:0,formal:0,kids:{},lines:0,sxLines:0};
 const hit=(k,t)=>{bad[k]=(bad[k]||0)+1;(ex[k]=ex[k]||[]).length<3&&ex[k].push(t)};
 let n0=0,nc=0;const NR=1200;for(let i=0;i<NR;i++){const s=newLife(1961+i%50);let g=0;while(!s.dead&&s.age<19&&g<400){g++;for(const e of step(s)){if(e.id==='sx_curious')nc++;if(e.choices)doChoice(s,e,autoChoose(s,e))}}if(s.orient)n0++}
 const dec=y=>Math.floor(y/10)*10+'s';const RANK={none:0,reject:1,deny:2,silent:3,accept:4};
 for(let i=0;i<N;i++){const s=newLife(1961+i%50,{orient:i%3?'gay':'bi'});let g=0,know='none',told={},realT=null,sameMar=false;
  while(!s.dead&&g<1500){g++;const out=step(s);
   for(const e of out){const t=e.text||'';st.lines++;if(/心裡一直放著|舊照片|停車場坐了很久|如果那年沒有結婚|從來不用真名/.test(t))st.heart=(st.heart||0)+1;
    if(s.f.secretSame&&s.aff&&s.t<T(2020,6))hit('2020-06 以前私下跟同性來往',s.y);
    if(e.id==='comeout'&&!/喜歡(男生|女生)|同婚|只是我的朋友/.test(t))hit('出櫃題沒說是什麼事',t);
    // the teen band ends at 18, and a realizeT late that year can fire at 19 when another milestone takes the month
    if(e.id==='sx_realize'&&s.age>=20)hit('成年後才發現',s.age);if(e._sx)st.sxLines++;
    if(!s.f.realized&&(e.id==='comeout'||e.id==='sx_kids'||e.id==='sx_reg'))hit('出現在知道自己之前',s.age+' '+t);
    if(e.id==='foreignwife'&&s.orient==='gay'&&s.f.realized&&!s.f.pass)hit('沒在假裝卻娶外籍配偶',t);
    if(e.choices){const c=autoChoose(s,e);const pt0=partnerOf(s);const k0=s.kids;doChoice(s,e,c);
     if(e.id==='marry'&&/相親|媒人/.test(t)&&s.f.realized&&!['none','deny'].includes(know))hit('家裡知道了還在相親',t);
     if(e.id==='meet'&&/相親|媒人/.test(t)&&s.f.realized&&!['none','deny'].includes(know))hit('家裡知道了還在相親',t);
     if(e.id==='comeout'&&/^跟家裡說/.test(c.label)&&!s.f.parentdie&&s.age<15)hit('未滿 15 跟家裡說',t)}
    const sp=spouse(s);
    if(sp&&sp.sex===s.sex&&s.married&&s.t<T(2019,5))hit('2019-05 以前同性結婚',s.y+'/'+s.m);
    if(sp&&sp.sex===s.sex&&sp.foreign&&(sp.foreign==='中國'||s.t<T(2023,1)))hit('跨國同婚太早',s.y);
    const pt=s.married?sp:s.rel?partnerOf(s):null;if(pt&&pt.sex===s.sex&&!e._sx&&/懷孕|懷了|坐月子|產房|嫁妝|聘金|提親|媒人|入贅|傳宗接代/.test(t))hit('同性伴侶出現異性戀才有的事',t);
    if(pt&&pt.sex===s.sex&&!e._sx&&/(我太太|我老婆|我先生|我老公)/.test(t)&&!/(以前|前夫|前妻)/.test(t)){const w=pt.sex==='M'?/(我太太|我老婆)/:/(我先生|我老公)/;if(w.test(t))hit('同性伴侶用錯稱呼',t)}
    if(e.birth||e.id==='birth'){if(pt&&pt.sex===s.sex&&!e._sx)hit('同性伴侶一般的生產',t)}}
   if(s.f.realized&&realT==null){realT=s.t;const k=dec(s.by);(st.real[k]=st.real[k]||[]).push(s.age)}
   const k=s.f.know||'none';if(RANK[k]<RANK[know]&&!(know==='reject'&&k==='silent')&&!(know==='deny'&&k==='silent'))hit('家裡的態度倒退',know+'→'+k);
   if(k!==know&&know==='none'){const d=dec(s.y);st.react[d]=st.react[d]||{};st.react[d][k]=(st.react[d][k]||0)+1}know=k;
   for(const x in told)if(told[x]&&!s.f.told[x])hit('說過的又變成沒說',x);told=Object.assign({},s.f.told);
   const sp=spouse(s);if(sp&&sp.sex===s.sex&&s.married)sameMar=true}
  const d=dec(s.by);st.told40[d]=st.told40[d]||[0,0];if(s.age>=40){st.told40[d][1]++;if(s.f.told.family)st.told40[d][0]++}
  if(sameMar)st.mar++;if(s.f.cohabT!=null)st.cohab++;if(s.f.passMarry)st.pass++;if(s.f.secretSame)st.secret=(st.secret||0)+1;if(s.f.formal)st.formal++;
  for(const kid of s.people.filter(x=>x.role==='kid')){const sp=s.people.find(x=>['spouse','ex','partner'].includes(x.role)&&x.sex===s.sex);if(sp){st.kids.same=(st.kids.same||0)+1}}}
 const med=a=>{a.sort((x,y)=>x-y);return a[a.length>>1]};const real={};for(const k in st.real)real[k]=med(st.real[k]);
 const told={};for(const k in st.told40)told[k]=st.told40[k][1]?Math.round(st.told40[k][0]/st.told40[k][1]*100)+'%':'-';
 const react={};for(const d of Object.keys(st.react).sort()){const o=st.react[d],t=Object.values(o).reduce((a,b)=>a+b,0);react[d]=['accept','silent','deny','reject'].map(k=>Math.round((o[k]||0)/t*100)).join('/')+' (n='+t+')'}
 return {orientRate:(n0/NR*100).toFixed(1)+'%',curiousRate:(nc/NR*100).toFixed(1)+'%',heart:st.heart||0,secret:st.secret||0,lives:N,realizeMedianAge:real,toldFamilyBy40:told,familyReaction:react,sameSexMarried:st.mar,livedTogether:st.cohab,passingMarriages:st.pass,formal:st.formal,kidsInSameSexCouples:st.kids.same||0,sxShare:(st.sxLines/st.lines*100).toFixed(1)+'%',bad,ex}},N);
console.log(JSON.stringify(r,null,1));
const or=parseFloat(r.orientRate),cr=parseFloat(r.curiousRate);if(or<4.5||or>7.5)r.bad.orientRate=or;if(cr<28||cr>38)r.bad.curiousRate=cr;
const ok=!errs.length&&!Object.keys(r.bad).length;console.log(errs.length?'ERR '+errs[0]:ok?'OK':'FAIL');await b.close();process.exit(ok?0:1)})();
