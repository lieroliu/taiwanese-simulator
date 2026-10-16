const { chromium } = require(process.env.PW||'playwright');
(async()=>{const b=await chromium.launch();const p=await b.newPage();await p.goto('file://'+process.cwd()+'/index.html');
const r=await p.evaluate(()=>{const o={};for(const by of [1965,1975,1985,1995,2005]){const L=[];for(let i=0;i<300;i++)L.push(simOne(by));
 o[by]={uni:L.filter(x=>x.uni).length/300,ever:L.filter(x=>x.marAge!==null).length/300,marMed:median(L.filter(x=>x.marAge!==null).map(x=>x.marAge)),kids:L.reduce((a,x)=>a+x.kids,0)/300,house:L.filter(x=>x.house).length/300,death:median(L.map(x=>x.death))}}return o});
console.log(JSON.stringify(r));await b.close()})();
