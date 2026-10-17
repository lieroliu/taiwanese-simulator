/* ================= avatar: a blurry mosaic face on the status card. Only a rough sex cue and a mouth;
   five expressions follow s.mood, four age stages (baby, child, adult, old) ================= */
const AV_N=16;
const AV_LV=['痛苦','難過','普通','快樂','幸福'];
const avLevel=m=>m>=72?4:m>=58?3:m>=42?2:m>=28?1:0;
const avStage=a=>a<3?0:a<13?1:a<60?2:3;
const AV_STAGE=['嬰兒','小孩','大人','老人'];
function avHex(h){return [parseInt(h.slice(1,3),16),parseInt(h.slice(3,5),16),parseInt(h.slice(5,7),16)]}
function drawAvatar(s){const cv=$('avatar');if(!cv||!s)return;
  const lv=avLevel(s.mood===undefined?50:s.mood),st=avStage(s.age),F=s.sex==='F';
  const key=[lv,st,s.sex,s.by,s.bm].join();if(cv._k===key)return;cv._k=key;
  const g=cv.getContext('2d'),r=scRng(s.by*97+s.bm*13+(s.given||'').charCodeAt(0)),N=AV_N;
  const bg=['#C9CFD6','#D3D8D9','#E2DED3','#EADFC9','#F0DDBF'][lv];
  const grid=[];for(let y=0;y<N;y++)grid.push(new Array(N).fill(bg));
  const put=(x,y,c)=>{if(x>=0&&y>=0&&x<N&&y<N)grid[y][x]=c};
  const skin=st===3?'#DDB08E':'#EBC09A',hair=st===0?'#7A5A40':st===3?'#C4C0B8':'#2E2622';
  const shirt=st===0?'#F2E3A6':st===3?'#8C8A84':F?'#C26A5E':'#5D7F9C';
  const [cx,cy,rx,ry]=[[8,8.6,5,4.7],[8,7.9,4.6,4.8],[8,7.2,4.4,5.1],[8,7.4,4.4,5]][st];
  /* shoulders */
  const sh=st===0?[13,4.2]:st===1?[13,5]:[13,6.5];for(let y=sh[0];y<N;y++)for(let x=0;x<N;x++)if(Math.abs(x+.5-8)<sh[1]+(y-sh[0])*.6)put(x,y,shirt);
  /* long hair falls behind the shoulders */
  if(F&&st>=1)for(let y=Math.floor(cy);y<(st===1?13:14);y++){put(Math.floor(cx-rx)-1,y,hair);put(Math.floor(cx-rx),y,hair);put(Math.ceil(cx+rx),y,hair);put(Math.ceil(cx+rx)-1,y,hair)}
  /* hair cap first, then the face below the hairline: a tuft for a baby, short for boys and men, a fringe for girls and women, thin and grey when old */
  const ell=(x,y,ex,ey)=>{const dx=(x+.5-cx)/ex,dy=(y+.5-cy)/ey;return dx*dx+dy*dy<=1};
  const hl=st===0?-1:Math.floor(cy-ry*(F?.25:.45));
  if(st>0)for(let y=0;y<N;y++)for(let x=0;x<N;x++)if(ell(x,y,rx+.5,ry+.6)&&(y<hl||(y<hl+2&&Math.abs(x+.5-cx)>rx-.6))&&!(st===3&&r()<.3))put(x,y,hair);
  for(let y=0;y<N;y++)for(let x=0;x<N;x++)if(ell(x,y,rx,ry)&&!(y<hl||(y<hl+2&&Math.abs(x+.5-cx)>rx-.6)))put(x,y,skin);
  if(F&&st>=1)for(let y=hl;y<(st===1?13:14);y++){put(Math.floor(cx-rx),y,hair);put(Math.ceil(cx+rx)-1,y,hair)}
  if(st===0){const top=Math.floor(cy-ry);put(7,top+1,hair);put(8,top+1,hair);put(8,top,hair)}
  /* mouth */
  const m=Math.round(cy+ry*.48),D='#5A2E2A',O='#B5524A';
  if(lv===4){put(5,m-1,D);put(10,m-1,D);for(let x=6;x<=9;x++)put(x,m,D);put(7,m+1,O);put(8,m+1,O)}
  else if(lv===3){put(6,m-1,D);put(9,m-1,D);put(7,m,D);put(8,m,D)}
  else if(lv===2){for(let x=6;x<=9;x++)put(x,m,D)}
  else if(lv===1){put(7,m,D);put(8,m,D);put(6,m+1,D);put(9,m+1,D)}
  else{for(let x=6;x<=9;x++)put(x,m,D);put(5,m+1,D);put(10,m+1,D);put(7,m-1,D)}
  /* mosaic: jitter every cell a little and soften edges into the neighbours */
  const img=g.createImageData(N,N);
  for(let y=0;y<N;y++)for(let x=0;x<N;x++){let c=avHex(grid[y][x]);const nb=[[1,0],[-1,0],[0,1],[0,-1]].map(([a,b])=>grid[y+b]&&grid[y+b][x+a]).filter(Boolean);
    const diff=nb.filter(v=>v!==grid[y][x]);if(diff.length&&grid[y][x]!==D&&grid[y][x]!==O){const o=avHex(diff[0]);c=c.map((v,i)=>v*.78+o[i]*.22)}
    const j=(r()-.5)*14;const i=(y*N+x)*4;img.data[i]=clamp(c[0]+j,0,255);img.data[i+1]=clamp(c[1]+j,0,255);img.data[i+2]=clamp(c[2]+j,0,255);img.data[i+3]=255}
  cv.width=N;cv.height=N;g.putImageData(img,0,0);
  cv.setAttribute('aria-label',`${AV_STAGE[st]}${F?'女生':'男生'}的頭像，看起來${AV_LV[lv]}`)}
{const rc0=renderCal;renderCal=function(t){rc0(t);try{drawAvatar(S)}catch(err){console.error(err)}}}
