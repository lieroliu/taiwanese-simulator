// Relatives' career advice wired into the engine: coverage, the 填志願 clash and how it plays out.
const { chromium } = require(process.env.PW||'playwright');
const file=process.argv[2]||'index.html',N=+process.argv[3]||500;
(async()=>{const b=await chromium.launch();const p=await b.newPage();const errs=[];p.on('pageerror',e=>errs.push(e.message));await p.goto('file://'+process.cwd()+'/'+file);
const r=await p.evaluate((N)=>{const c={lives:0,reached18:0,adv:0,advShown:0,likes:0,hobby:0,uniMajor:0,clash:0,kin:{},picked:{},ny:0,echo:0,transfer:0,trOK:0,retake:0,retakeFail:0,regretListen:0},ex=[];
 for(let i=0;i<N;i++){const s=newLife(1961+(i%50));c.lives++;let g=0,shown=false;
  while(!s.dead&&g<1500){g++;const out=step(s);for(const e of out){let t=e.text||'';if(e.choices){const ch=autoChoose(s,e);if(e.id==='kinMajor'){c.clash++;c.picked[ch.label]=(c.picked[ch.label]||0)+1}const rr=doChoice(s,e,ch);t+=' => '+rr.text;if(e.id==='kinMajor'&&ex.length<8)ex.push(s.y+' '+t)}
   if(e._kin&&s.kinAdv&&t.includes(s.kinAdv.text?'':'x'))shown=true}}
  if(s.age>=18||s.dead&&s.age>=18)c.reached18++;if(s.kinAdv)c.adv++;if(s.f.kinNY!=null)c.advShown++;if(s.like)c.likes++;if(s.f.kinHob)c.hobby++;if(s.major)c.uniMajor++;
  if(s.f.kin)c.kin[s.f.kin]=(c.kin[s.f.kin]||0)+1;c.ny+=s.f.nyN||0;c.echo+=s.f.echoN||0;if(s.f.kin==='mid')c.transfer++;if(s.f.kinTrOK)c.trOK++;if(s.f.kin==='retake')c.retake++;if(s.f.kinRetakeFail)c.retakeFail++;if((s.regrets||[]).some(x=>x.k==='kinListen'))c.regretListen++}
 return {c,ex}},N);
console.log(JSON.stringify(r,null,1));console.log(errs.length?'ERR '+errs.slice(0,3).join(' | '):'no page errors');await b.close();process.exit(errs.length?1:0)})();
