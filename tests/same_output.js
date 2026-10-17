// Refactor guard: two builds must play the exact same lives. Seeds Math.random, plays N whole lives in each file
// (engine step + auto choices, then the end screen) and compares every diary line and the end-screen HTML.
// Run: PW=... node tests/same_output.js before.html after.html [N]
const { chromium } = require(process.env.PW||'playwright');
const A=process.argv[2],B=process.argv[3]||'index.html',N=+process.argv[4]||40;
const play=async(b,file)=>{const p=await b.newPage();const errs=[];p.on('pageerror',e=>errs.push(e.message));
 await p.addInitScript(()=>{let a=12345;Math.random=()=>{a=(a+0x6D2B79F5)>>>0;let t=a;t=Math.imul(t^t>>>15,t|1);t^=t+Math.imul(t^t>>>7,t|61);return((t^t>>>14)>>>0)/4294967296}});
 await p.goto('file://'+require('path').resolve(file));
 const r=await p.evaluate(N=>{const lives=[];for(let i=0;i<N;i++){const s=newLife(1961+(i*7)%50);S=s;s.track=true;const L=[];let g=0;
   while(!s.dead&&g<1500){g++;for(const e of step(s)){if(e.choices){const c=autoChoose(s,e);const r=doChoice(s,e,c);L.push(e.text+'|'+c.label+'|'+(r&&r.text))}else L.push((e.t)+':'+e.text+'|'+(e.note||''))}}
   show('play');summary();L.push($('end').innerHTML);lives.push(L)}return lives},N);
 await p.close();return {r,errs}};
(async()=>{const b=await chromium.launch();const x=await play(b,A),y=await play(b,B);let diff=0,ex=null;
 for(let i=0;i<N;i++){const a=x.r[i],c=y.r[i];const n=Math.max(a.length,c.length);for(let k=0;k<n;k++)if(a[k]!==c[k]){diff++;if(!ex)ex={life:i,line:k,a:(a[k]||'').slice(0,160),b:(c[k]||'').slice(0,160)};break}}
 const lines=x.r.reduce((n,l)=>n+l.length,0);console.log(JSON.stringify({lives:N,lines,livesDiffer:diff,first:ex,errs:[...x.errs,...y.errs].slice(0,3)}));
 const ok=!diff&&!x.errs.length&&!y.errs.length&&lines>N*50;console.log(ok?'OK':'FAIL');await b.close();process.exit(ok?0:1)})();
