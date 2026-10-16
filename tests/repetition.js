const { chromium } = require(process.env.PW||'playwright');
(async()=>{const b=await chromium.launch();const p=await b.newPage();p.on('pageerror',e=>console.log('ERR',e.message));
await p.goto('file://'+process.cwd()+'/'+(process.argv[2]||'index.html'));
const r=await p.evaluate(()=>{
 for(const r of RE.concat(PE)){if(r._w)continue;const f=r.run;r.run=function(s){const en=f.apply(this,arguments);if(en)en._id=r.id;return en};r._w=1}
 const run=(y,county,eth)=>{let s,g0=0;do{s=newLife(y);g0++}while(g0<20000&&((county&&s.birthCounty!==county)||(eth&&s.eth!==eth)));
  const t=[],ids=[],moods=[];let g=0;while(!s.dead&&g<1500){g++;for(const e of step(s)){if(e.choices){doChoice(s,e,autoChoose(s,e));continue}t.push(e.text);ids.push(e._id||e.id||e.title||'?');if(e.mood&&e.mood.line)moods.push(e.mood.line);if(e._id)ids.re=(ids.re||0)+1}}
  return {t,ids,moods}};
 const grp=(n,y,c,e)=>Array.from({length:n},()=>run(y,c,e));
 const ov=(A,B)=>{const sb=new Set(B.t);return A.t.filter(x=>sb.has(x)).length/Math.max(1,A.t.length)};
 const within=G=>{let s=0,k=0;for(let i=0;i<G.length;i++)for(let j=0;j<G.length;j++)if(i!==j){s+=ov(G[i],G[j]);k++}return s/k};
 const across=(G,H)=>{let s=0,k=0;for(const a of G)for(const b of H){s+=ov(a,b)+ov(b,a);k+=2}return s/k};
 const N=25,Y=1975;
 const tp=grp(N,Y,'台北市','閩南'),tp2=grp(N,Y,'台北市','閩南'),tt=grp(N,Y,'台東縣','閩南'),yl=grp(N,Y,'雲林縣','閩南'),ks=grp(N,Y,'高雄市','閩南'),km=grp(N,Y,'金門縣',null);
 const hlM=grp(N,Y,'花蓮縣','閩南'),hlH=grp(N,Y,'花蓮縣','客家'),hlI=grp(N,Y,'花蓮縣','原住民'),tpW=grp(N,Y,'台北市','外省');
 const Y2=1998,tcM=grp(N,Y2,'台北縣','閩南'),tcX=grp(N,Y2,'台北縣','新住民子女');
 const all=[].concat(tp,tt,yl,ks,hlM,hlH,hlI,tpW);
 // within-life repetition
 let mT=0,mDup=0,eT=0,eDup=0;const moodFreq={};
 for(const L of all){const seen=new Set();for(const m of L.moods){mT++;moodFreq[m]=(moodFreq[m]||0)+1;if(seen.has(m))mDup++;seen.add(m)}
  const ids=L.ids.filter((x,i)=>L.t[i]&&1);const st=new Set();const tx=new Set();for(const x of L.t){eT++;if(tx.has(x))eDup++;tx.add(x)}}
 const topMood=Object.entries(moodFreq).sort((a,b)=>b[1]-a[1]).slice(0,8).map(([k,v])=>k+' '+(v/all.length).toFixed(2));
 // personal-event frequency across lives: share of lives containing each text
 const tf={};all.forEach(L=>new Set(L.t).forEach(x=>tf[x]=(tf[x]||0)+1));
 const common=Object.entries(tf).sort((a,b)=>b[1]-a[1]).slice(0,15).map(([k,v])=>(v/all.length).toFixed(2)+' '+k.slice(0,40));
 const pct=x=>Math.round(x*100);
 return {sameRegion:pct(within(tp)),sameRegion2:pct(across(tp,tp2)),
  diffRegion:{台東:pct(across(tp,tt)),雲林:pct(across(tp,yl)),高雄:pct(across(tp,ks)),金門:pct(across(tp,km))},
  diffEth:{花蓮閩vs客:pct(across(hlM,hlH)),花蓮閩vs原:pct(across(hlM,hlI)),花蓮閩vs閩:pct(within(hlM)),台北閩vs外省:pct(across(tp,tpW)),新北閩vs閩_1998:pct(within(tcM)),新北閩vs新住民_1998:pct(across(tcM,tcX))},
  entries:Math.round(all.reduce((a,L)=>a+L.t.length,0)/all.length),moodPerLife:Math.round(mT/all.length),moodRepeatInLife:pct(mDup/mT),textRepeatInLife:pct(eDup/eT),
  topMood,common}});
console.log(JSON.stringify(r,null,1));await b.close()})();
