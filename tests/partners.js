// Partners and affairs in play: ways to meet by decade, two-people offers, fit, in-laws, and how often a spouse affair happens.
// Run: PW=... node tests/partners.js index.html [N]
const { chromium } = require(process.env.PW||'playwright');
const file=process.argv[2]||'index.html',N=+process.argv[3]||600;
(async()=>{const b=await chromium.launch();const p=await b.newPage();const errs=[];p.on('pageerror',e=>errs.push(e.message));await p.goto('file://'+process.cwd()+'/'+file);
const r=await p.evaluate((N)=>{const ch={},pairs={},resp={},lab={},bad=[],ex=[];let mar30=0,mar30aff=0,found=0,never=0,selfN=0,lw=0,mar=0,lines=0,ptLines=0,minor=0,jobClash=0;
 const dec=y=>Math.floor(y/10)*10+'s';
 for(let i=0;i<N;i++){const s=newLife(1961+(i%50));let g=0;const seen=new Set();
  while(!s.dead&&g<1500){g++;const out=step(s);
   for(const e of out){if(e._pt)ptLines++;lines++;
    if(e.choices){if(e.id==='meet'&&e.title==='兩個人'){const c=autoChoose(s,e);pairs[c.label]=(pairs[c.label]||0)+1;if(ex.length<4)ex.push(you(e.text)+' => '+you(doChoice(s,e,c).text));else doChoice(s,e,c);continue}
     if(e.id==='affair'){const c=autoChoose(s,e);const k=(s.y<1995?'~1994 ':s.y<2010?'1995-2009 ':'2010~ ')+c.label;resp[k]=(resp[k]||0)+1;doChoice(s,e,c);continue}
     doChoice(s,e,autoChoose(s,e))}}
   const pt=partnerOf(s);if(pt&&!seen.has(pt.id)&&pt.ch){seen.add(pt.id);const d=dec(s.y);ch[d]=ch[d]||{};ch[d][pt.chLbl]=(ch[d][pt.chLbl]||0)+1;if(s.y-pt.by<18)minor++;
     if(['workFactory','workOffice'].includes(pt.ch)&&pt.job!==s.job)jobClash++}}
  const ms=s.marriedT!=null&&s.f.everMar;if(ms){mar++;if(s.f.everLW)lw++;const sp=s.people.find(x=>x.role==='spouse'||x.role==='ex');if(sp){const c=compat(s,sp);const l=PT.compat.label.find(x=>c>=x[0])[1];lab[l]=(lab[l]||0)+1}}
  if(ms&&(s.t-s.marriedT)>=360){mar30++;if(s.f.spAffN)mar30aff++}
  found+=s.f.affFound||0;never+=s.f.affNever||0;selfN+=s.f.selfAffN||0}
 const pct=o=>{const t=Object.values(o).reduce((a,b)=>a+b,0);const r={};for(const k of Object.keys(o).sort((a,b)=>o[b]-o[a]))r[k]=Math.round(o[k]/t*100)+'%';return r};
 const chP={};for(const d of Object.keys(ch).sort())chP[d]=pct(ch[d]);
 return {lives:N,channels:chP,pairOffers:pairs,fit:lab,married:mar,inlawsShare:mar?Math.round(lw/mar*100)+'%':'-',
  spouseAffair30y:mar30?(mar30aff/mar30*100).toFixed(1)+'% of '+mar30:'-',found,neverKnown:never,selfAffairs:selfN,responses:resp,ptLinesShare:(ptLines/lines*100).toFixed(1)+'%',minorPartners:minor,jobClash,ex}},N);
console.log(JSON.stringify(r,null,1));
const a=parseFloat(r.spouseAffair30y);
const ok=!errs.length&&r.minorPartners===0&&r.jobClash===0&&a>=7&&a<=20;
console.log(errs.length?'ERR '+errs[0]:ok?'OK':'FAIL');await b.close();process.exit(ok?0:1)})();
