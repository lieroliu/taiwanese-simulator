const { chromium } = require(process.env.PW||'playwright');
(async()=>{const b=await chromium.launch();const p=await b.newPage();p.on('pageerror',e=>console.log('ERR',e.message));await p.goto('file://'+process.cwd()+'/index.html');
const r=await p.evaluate(()=>{const o={};for(const by of [1965,1975,1985,1995]){const at={30:[],45:[],65:[]};let notes={};let houses=0;const ex=[];for(let i=0;i<150;i++){const s=newLife(by);let g=0;while(!s.dead&&g<1500){g++;for(const e of step(s)){if(e.choices){const r=doChoice(s,e,autoChoose(s,e));if(e.id==='house'&&i<2)ex.push(s.y+' '+e.text+' => '+r.text);if(e.id==='marry'&&i<2)ex.push(s.y+' '+r.text);continue}
 for(const k of ['寄','學貸','見底','一百萬','還清','分到','欠了'])if(e.text.includes(k))notes[k]=(notes[k]||0)+1}
 for(const a of [30,45,65])if(s.age===a&&s.m===s.bm&&s.cash!==undefined)at[a].push(s.cash)}if(s.house)houses++}
 const med=a=>{a=a.slice().sort((x,y)=>x-y);return Math.round(a[a.length>>1])};o[by]={c30:med(at[30]),c45:med(at[45]),c65:med(at[65]),w:Math.round(wageY(by+30)),house:houses/150,notes,ex}}return o});
console.log(JSON.stringify(r,null,1));await b.close()})();
