// Pop-culture diary lines: how many per life, how many in childhood, and the 你那一屆的童年 line.
const { chromium } = require(process.env.PW||'playwright');
const file=process.argv[2]||'index.html',N=+process.argv[3]||300;
(async()=>{const b=await chromium.launch();const p=await b.newPage();const errs=[];p.on('pageerror',e=>errs.push(e.message));await p.goto('file://'+process.cwd()+'/'+file);
const r=await p.evaluate((N)=>{let lives=0,adults=0,tot=0,kid=0,withLine=0,gapBad=0;const ex=[],lines=[];
 for(let i=0;i<N;i++){const s=newLife(1961+(i%50));lives++;let g=0,last=-99;while(!s.dead&&g<1500){g++;for(const e of step(s)){if(e.choices)doChoice(s,e,autoChoose(s,e));if(e._pop){if(s.t-last<4)gapBad++;last=s.t;if(lines.length<6)lines.push(s.y+' '+s.age+'歲 '+you(e.text))}}}
  const P=s.pop||[];tot+=P.length;kid+=P.filter(x=>x.age>=5&&x.age<=18).length;if(s.age>=18){adults++;if(popNames(s).length>=2)withLine++}
  if(ex.length<6&&s.age>=18)ex.push(s.by+'：'+popNames(s).join('、'))}
 return {lives,perLife:(tot/lives).toFixed(1),childhoodPerLife:(kid/lives).toFixed(1),adultsWithLine:withLine+'/'+adults,gapBad,ex,lines}},N);
console.log(JSON.stringify(r,null,1));const ok=!errs.length&&r.gapBad===0;console.log(errs.length?'ERR '+errs[0]:ok?'OK':'FAIL');await b.close();process.exit(ok?0:1)})();
