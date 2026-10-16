// Under-18 riding / smoking / drinking: each underage ride gets a law line for that year, teen smoking follows that year's rules.
const { chromium } = require(process.env.PW||'playwright');
const file=process.argv[2]||'index.html',N=+process.argv[3]||600;
(async()=>{const b=await chromium.launch();const p=await b.newPage();p.on('pageerror',e=>console.log('ERR',e.message));await p.goto('file://'+process.cwd()+'/'+file);
const r=await p.evaluate((N)=>{const c={lives:0,rideTeen:0,rideNoLaw:0,under16Ride:0,caught:0,smokeOffer:0,smoked:0,teenDrink:0},ex=[],bad=[];
 const LAW=/(駕照|警察)/;
 for(let i=0;i<N;i++){const s=newLife(1961+(i%45));c.lives++;let g=0;
  while(!s.dead&&g<1500){g++;const out=step(s);for(const e of out){let t=e.text||'';if(e.choices){const ch=autoChoose(s,e);t=t+'。'+doChoice(s,e,ch).text}
   if(s.age<18&&!e.death&&RIDE_RX.test(t)){c.rideTeen++;if(s.age<16)c.under16Ride++;if(!LAW.test(t)&&!s.f.noLic)c.rideNoLaw++;if(ex.length<6&&LAW.test(t))ex.push(s.y+' '+s.age+'歲 '+t.slice(-70))}
   if(e._re==='teen_smoke'||e.id==='teen_smoke'){c.smokeOffer++;if(ex.length<10)ex.push(s.y+' '+s.age+'歲 '+t)}
   if(s.age<18&&SUB_RX.test(t)&&!/(教官|偷|大人|爸|媽)/.test(t)){c.teenDrink++;if(bad.length<5)bad.push(s.age+' '+t)}}}
  if(s.f.noLicCaught)c.caught++;if(s.f.teenSmoked)c.smoked++}
 return {c,ex,bad}},N);
console.log(JSON.stringify(r,null,1));
const ok=r.c.under16Ride===0&&r.c.rideNoLaw===0&&r.c.teenDrink===0;console.log(ok?'OK':'FAIL');await b.close();process.exit(ok?0:1)})();
