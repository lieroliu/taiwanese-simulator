// content/variants.json: format check, then 80 lives to see variants show up and leave no placeholders behind.
const fs=require('fs');const V=JSON.parse(fs.readFileSync(__dirname+'/../content/variants.json','utf8'));
const KEYS=new Set(['mood','money','urban','region','county','eth','sex','orient','y','by','age','married','kids','job']);
const bad=[];const chk=(where,v,mood)=>{if(!v||typeof v.text!=='string'||!v.text)return bad.push(where+': no text');
  for(const k in v.when||{})if(!KEYS.has(k))bad.push(where+': unknown when key '+k);
  if(mood&&!/^[^:]{1,4}:/.test(v.text))bad.push(where+': mood text needs 詞:句子');
  if(/所以|因此|憂鬱|自殺/.test(v.text))bad.push(where+': banned word in '+v.text)};
for(const [k,L] of Object.entries(V.lines||{})){if(!/[。！？]$/.test(k))bad.push('lines key must be one sentence: '+k);if(/[0-9{]/.test(k))bad.push('lines key has a number or placeholder: '+k);L.forEach((v,i)=>chk('lines '+k+' #'+i,v))}
for(const [k,L] of Object.entries(V.events||{}))L.forEach((v,i)=>chk('events '+k+' #'+i,v));
for(const [st,T] of Object.entries(V.mood||{})){if(!['kid','teen','young','mid','old'].includes(st))bad.push('mood stage '+st);for(const [t,L] of Object.entries(T)){if(!['good','bad','neutral','tense'].includes(t))bad.push('mood tone '+t);L.forEach((v,i)=>chk('mood '+st+'.'+t+' #'+i,v,1))}}
if(bad.length){console.log(bad.slice(0,30).join('\n'));process.exit(1)}
const { chromium } = require(process.env.PW||'playwright');
(async()=>{const b=await chromium.launch();const p=await b.newPage();const errs=[];p.on('pageerror',e=>errs.push(e.message));
 await p.goto('file://'+process.cwd()+'/'+(process.argv[2]||'index.html'));
 const r=await p.evaluate(()=>{const texts=new Set();for(const L of Object.values(TXV.lines||{}))for(const v of L)texts.add(v.text);
  let hits=0,left=[];for(let i=0;i<80;i++){const s=newLife(1961+i%50);let g=0;while(!s.dead&&g<1500){g++;for(const e of step(s)){
   if(e.choices){const t=doChoice(s,e,autoChoose(s,e)).text||'';if(/\{[a-z]+\}|undefined/.test(t))left.push(t);continue}
   const t=(e.text||'')+(e.mood?e.mood.line||'':'');if(/\{[a-z]+\}|undefined/.test(t))left.push(t);for(const x of texts)if(t.includes(x)){hits++;break}}}}
  return {hits,left:left.slice(0,5)}});
 console.log(JSON.stringify(r));await b.close();
 if(errs.length||r.left.length){console.log('FAIL',errs.slice(0,3));process.exit(1)}
 if(Object.keys(V.lines||{}).length>20&&r.hits<20){console.log('FAIL: line variants almost never show');process.exit(1)}
 console.log('OK')})();
