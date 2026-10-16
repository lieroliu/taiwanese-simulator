const { chromium } = require(process.env.PW||'playwright');
(async()=>{const b=await chromium.launch();const p=await b.newPage();p.on('pageerror',e=>console.log('ERR',e.message));await p.goto('file://'+process.cwd()+'/index.html');
const r=await p.evaluate(()=>{let n=0,tot=0,hist={};const ex=[];for(let i=0;i<200;i++){const s=newLife(1960+(i%50));let c=0,all=0;while(!s.dead&&s.age<=6){for(const e of step(s)){if(e.choices){doChoice(s,e,autoChoose(s,e));continue}all++;if(e._re&&e._re.startsWith('e0_')){c++;if(i<3)ex.push(s.by+' '+e.age+' '+e.text)}}}n+=c;tot+=all;hist[c]=(hist[c]||0)+1}return {avgEarly:n/200,avgAll0to6:tot/200,hist,ex}});
console.log(JSON.stringify(r,null,1));await b.close()})();
