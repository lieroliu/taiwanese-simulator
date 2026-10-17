/* ================= main step: one month of a life, and the yearly check-up ================= */
function step(s){
  s.t++;s.y=Math.floor(s.t/12);s.m=s.t%12+1;s.age=Math.floor((s.t-s.t0)/12);
  const out=[];
  if(s.m===s.bm&&s.age>0)yearly(s);
  const ab=abroad(s);if(ab&&s.q.length)s.q=s.q.filter(x=>x.cat!=='災難');
  if(s.q.length){s.q.sort((a,b)=>(b.pri||0)-(a.pri||0));s.q.forEach((x,i)=>{if(i===0||x.pri>=2)out.push(x)});s.q=[]}
  for(const e of TL){if(s.events[e.id]===s.t){if(ab&&!TL_ANY.has(e.id)){const f=ABR[e.id];const txt=f&&f(s);if(txt)out.push({_ab:1,_tl:e.id,cat:e.cat,title:e.title,text:txt,tone:TONE[e.id]||CAT_TONE[e.cat]||'neutral'});continue}if(NOTICE[e.id]!==undefined&&!chance(noticeP(s,e)))continue;s._st=undefined;let txt=e.run(s);if(txt&&!ab&&VAR[e.id]&&s._st!=='in'&&s._st!=='sym'&&s.age>=12){const vs=VAR[e.id].filter(x=>x[0](s));if(vs.length&&chance(.7))txt=pick(vs)[1]}if(txt&&!ab){const hv=hvPick(s,e.id);if(hv){txt=hv;s._hvHit=1}else s._hvHit=0}if(txt)out.push({_ab:ab?1:0,_hv:ab?0:s._hvHit,_tl:e.id,_st:s._st,cat:e.cat,title:e.title,text:txt,tone:TONE[e.id]||CAT_TONE[e.cat]||'neutral'})}}
  if(!ab)out.push(...regTL(s));
  let hasChoice=false;
  for(const ms of MS){if(hasChoice&&ms.choice)continue;if(ab&&ms.id==='house')continue;if(ms.check(s)){const e=ms.run(s);if(e){e.id=ms.id;e.tone=e.tone||MTONE[ms.id]||toneFromText(e.text);out.push(e);if(e.choices){e.choices=e.choices.filter(c=>c.if===undefined||c.if);hasChoice=true}}}}
  if(!out.length||chance(.5)){for(const r of shuffle(RE.concat(PE))){if(ab&&!r.ab&&!RE_ANY.has(r.id))continue;s._reT=s._reT||{};if(s._reT[r.id]!==undefined&&s.t-s._reT[r.id]<36)continue;const p=r.p(s);if(p>0&&chance(p)){s._reT[r.id]=s.t;const en=r.run(s);en._re=r.id;if(ab)en._ab=1;if(r.id==='lend')regret(s,'lend','借錢給朋友，從此少了一個朋友。','好朋友跟我借了一筆錢，後來就不接我的電話',.6);if(r.id==='guarantee'&&s.age>=18)regret(s,'guar','幫朋友作保。','朋友跑了，銀行找上了我',1.2);en.tone=en.tone||RTONE[r.id]||'neutral';out.push(en);break}}}
  if(s.forceDeath){out.push(deathEntry(s,s.forceDeath))}
  else if(chance(annualQ(s)/12)||s.age>=105){out.push(deathEntry(s,s.age>=105?'衰老':causeOf(s)))}
  applyLens(s,out);out.forEach(e=>{if(e._tl&&!e.choices&&!e._hv&&!e._ab)persAdd(s,e)});dedupe(s,out);guardOut(s,out);
  if(s.dead)out.forEach(e=>{if(e.choices&&!e.death){delete e.choices;e.text+='（我沒能來得及做決定。）'}});
  out.forEach(e=>{e.t=s.t;e.age=s.age;if(!e.death&&!e.choices){e.mood=mood(s,e.tone,e.cat,e.text);if(e.mood&&e.mood.line&&!splitSent(e.mood.line).every(x=>sentOK(s,x)))e.mood=null}if(s.track&&e.text&&!e.death&&!e.choices&&!e.birth)(s.log=s.log||[]).push({age:s.age,y:s.y,text:e.text,cat:e.cat,tone:e.tone})});
  if(s.age>=6)s.bigN=(s.bigN||0)+out.filter(e=>!e.choices&&!e.death&&(e.cat==='歷史'||e.cat==='災難')).length;
  if(s.house==='own'&&s.houseAge==null)s.houseAge=s.age;if(s.married)s.f.everMar=1;
  if(ab&&out.some(e=>e.id==='parentdie'))regret(s,'pdie','沒見到最後一面。',`家裡的人過世的時候，我人${AW(s)}，趕回去已經來不及了`,3);
  if(s.track&&s.age>=6)for(const e of out){if(e._tl&&!e.choices&&!s._gen0&&(e.cat==='歷史'||e.cat==='災難'||GEN_EV.has(e._tl))&&chance(.6)){const g=genLine(s);if(g&&splitSent(g).every(x=>sentOK(s,x))){e.gen=g;s._gen0=1}}}s._gen0=0;
  if(s.track){const last=out.filter(e=>!e.choices).pop();if(last){const c=cmpLine(s,last);if(c)last.cmp=c}}
  return out;
}
function yearly(s){
  const rate=s.age<25?.12:.04;s.id+=(idNorm(s.y)+ETH_OFF[s.eth]+(s.momFrom==='中國大陸'?-10:0)+s.idOff-s.id)*rate;
  s.eng+=(engTarget(s)-s.eng)*(s.age<15?.04:.08);
  let target;
  if(s.job&&!s.studying){target=JOB_T[s.job]+(s.job==='退休'&&s.f.wasGJ?22:0);if(s.f.fwife)target-=3}else target=s.baseMoney;
  if(spWork(s))target+=(JOB_T[spouse(s).job]-30)*.3;
  if(working(s))target+=(REG_PAY[regionOf(s.place)]||0)+(inTaipei(s)&&s.y>=1990?3:0);
  if(working(s))target+=({'大學':s.tech?4:7,'五專':3,'高中':1,'高職':1}[s.edu]||0)*(s.y>=2005?.6:1);
  if(s.t<s.mortgageEnd)target-=12;
  target-=4*s.kidBorn.filter(b=>s.t-b<22*12).length;
  if(s.house==='own'&&s.t>=s.mortgageEnd)target+=6;
  s.money+=(target-s.money)*.12;
  if(s.age>75)s.health-=2.2;else if(s.age>60)s.health-=1.3;else if(s.age>40)s.health-=.6;else if(s.health<75)s.health+=2;
  s.lonely+=((30+(s.age>70?12:0)+(s.f.alone?12:0)-(s.married?10:0))-s.lonely)*.1;
  peopleYearly(s);
  if(s.job==='自營'&&s.jobStart&&s.t-s.jobStart<72&&chance(.05+.12*hardY(s.y))){const yrs=Math.max(1,Math.round((s.t-s.jobStart)/12));s.job=pick(['服務','工廠']);s.jobStart=s.t;fx(s,{money:-10,risk:-3});key(s,'店收起來了');s.f.bizY=s.y;s.f.bizFail=`，你開的店撐了 ${yrs} 年還是收了`;scar(s,'店收掉以後欠的錢還沒還完',3,.3);
    s.q.push({pri:1,cat:'人生',tone:'bad',text:`撐了 ${yrs} 年，${hardY(s.y)?'景氣太差':'生意一直沒有起色'}，我的店還是收起來了。拉下鐵門那天，我在門口站了很久。`});}
  clampAll(s);sample(s);
}
