/* ================= avatar: a small crisp pixel face on the status card, outlined so it reads at a glance.
   Sex shows in the hair (short, pigtails, long), age in the head shape and hair colour (baby, child, adult, old),
   and five expressions follow s.mood through the eyes and the mouth ================= */
const AV_N=20;
const AV_LV=['痛苦','難過','普通','快樂','幸福'];
const avLevel=m=>m>=72?4:m>=58?3:m>=42?2:m>=28?1:0;
const avStage=a=>a<3?0:a<13?1:a<60?2:3;
const AV_STAGE=['嬰兒','小孩','大人','老人'];
function drawAvatar(s){const cv=$('avatar');if(!cv||!s)return;
  const lv=avLevel(s.mood===undefined?50:s.mood),st=avStage(s.age),F=s.sex==='F';
  const key=[lv,st,s.sex,s.by,s.bm].join();if(cv._k===key)return;cv._k=key;
  const N=AV_N,r=scRng(s.by*97+s.bm*13+(s.given||'').charCodeAt(0));
  const bg=['#B9C3CE','#CDD5DA','#E4DFD3','#EEDFC4','#F5D9B4'][lv];
  const grid=[];for(let y=0;y<N;y++)grid.push(new Array(N).fill(bg));
  const put=(x,y,c)=>{if(x>=0&&y>=0&&x<N&&y<N)grid[y][x]=c};
  const skin=st===3?'#E2B591':'#F2C9A2',hair=st===0?'#8A6446':st===3?'#D6D2CA':'#2E2622';
  const shirt=st===0?'#F4E19A':st===3?['#8C8A84','#6F7F6A','#7E6A5A'][Math.floor(r()*3)]:F?['#D0675A','#C98BB0','#6FA38E'][Math.floor(r()*3)]:['#4F7EA8','#5E8C5A','#8A6C4E'][Math.floor(r()*3)];
  const [cx,cy,rx,ry]=[[10,10.6,6.3,5.8],[10,9.6,5.7,6],[10,9,5.3,6.4],[10,9.2,5.3,6.2]][st];
  const ell=(x,y,ex,ey)=>{const dx=(x+.5-cx)/ex,dy=(y+.5-cy)/ey;return dx*dx+dy*dy<=1};
  /* shoulders */
  const sh0=Math.ceil(cy+ry),sw=st===0?4.5:st===1?5.5:7;
  for(let y=sh0;y<N;y++)for(let x=0;x<N;x++)if(Math.abs(x+.5-cx)<sw+(y-sh0)*.7)put(x,y,shirt);
  for(let y=sh0-1;y<sh0+1;y++)for(let x=9;x<11;x++)put(x,y,skin);
  /* hair behind the head: long for women, pigtails for girls, a bun for old women */
  const hl=st===0?-1:Math.floor(cy-ry*(F?.25:.5));
  const face=(x,y)=>ell(x,y,rx,ry)&&!(y<hl||(y<hl+2&&Math.abs(x+.5-cx)>rx-.7));
  if(F&&st===2)for(let y=hl;y<=sh0+1;y++)for(let x=0;x<N;x++)if(Math.abs(x+.5-cx)<rx+1.3&&!face(x,y))put(x,y,hair);
  if(F&&st===1)for(const sx of [-1,1])for(let y=Math.round(cy)-1;y<=Math.round(cy)+2;y++){put(Math.round(cx+sx*(rx+1)-.5),y,hair);if(y>Math.round(cy))put(Math.round(cx+sx*(rx+1.9)-.5),y,hair)}
  if(F&&st===3)for(let y=0;y<3;y++)for(let x=8;x<12;x++)if(!(y===0&&(x===8||x===11)))put(x,y,hair);
  /* hair cap, then the face below the hairline; an old man's crown is bald */
  if(st>0)for(let y=0;y<N;y++)for(let x=0;x<N;x++)if(ell(x,y,rx+.6,ry+.7)&&y<hl+2&&!face(x,y)&&!(st===3&&!F&&y<hl-1&&Math.abs(x+.5-cx)<rx-1.6))put(x,y,hair);
  for(let y=0;y<N;y++)for(let x=0;x<N;x++)if(face(x,y)||(st===3&&!F&&ell(x,y,rx+.6,ry+.7)&&y<hl-1&&Math.abs(x+.5-cx)<rx-1.6))put(x,y,skin);
  if(st===0){const top=Math.floor(cy-ry);put(9,top,hair);put(10,top-1,hair);put(10,top,hair);put(11,top-1,hair)}
  /* outline everything so the shape is sharp */
  const L='#4A3A34',filled=grid.map(row=>row.map(c=>c!==bg));
  for(let y=0;y<N;y++)for(let x=0;x<N;x++)if(!filled[y][x]&&[[1,0],[-1,0],[0,1],[0,-1]].some(([a,b])=>filled[y+b]&&filled[y+b][x+a]))put(x,y,L);
  /* eyes and brows */
  const E='#2B201C',ey=Math.round(cy+(st===0?.6:0)),ex=[7,12];
  if(lv===4)for(const x of ex){put(x-1,ey,E);put(x,ey-1,E);put(x+1,ey,E)}
  else if(lv===0){put(6,ey-1,E);put(7,ey,E);put(6,ey+1,E);put(13,ey-1,E);put(12,ey,E);put(13,ey+1,E);put(5,ey+2,'#5E9FD8');put(5,ey+3,'#5E9FD8');put(14,ey+2,'#5E9FD8')}
  else for(const x of ex){put(x,ey,E);put(x,ey+(lv===1?0:-1),E)}
  if(lv<=1&&st>0){put(6,ey-2,E);put(7,ey-3,E);put(13,ey-2,E);put(12,ey-3,E)}
  if(lv>=3||st===0){put(5,ey+2,'#EE9A88');put(14,ey+2,'#EE9A88')}
  if(st===3){put(4+(lv===0?0:1),ey-1,'#B9876A');put(15-(lv===0?0:1),ey-1,'#B9876A')}
  /* mouth */
  const m=Math.round(cy+ry*(st===0?.45:.5)),D='#5A2E2A',O='#C9564C';
  if(lv===4){for(let x=7;x<=12;x++)put(x,m,D);put(8,m+1,D);put(9,m+1,O);put(10,m+1,O);put(11,m+1,D);put(9,m+2,D);put(10,m+2,D)}
  else if(lv===3){put(7,m,D);put(12,m,D);for(let x=8;x<=11;x++)put(x,m+1,D)}
  else if(lv===2){for(let x=8;x<=11;x++)put(x,m,D)}
  else if(lv===1){put(9,m,D);put(10,m,D);put(8,m+1,D);put(11,m+1,D)}
  else{for(let x=8;x<=11;x++)put(x,m,D);put(7,m+1,D);put(8,m+1,O);put(9,m+1,O);put(10,m+1,O);put(11,m+1,O);put(12,m+1,D)}
  cv.width=N;cv.height=N;const g=cv.getContext('2d');
  for(let y=0;y<N;y++)for(let x=0;x<N;x++){g.fillStyle=grid[y][x];g.fillRect(x,y,1,1)}
  cv.setAttribute('aria-label',`${AV_STAGE[st]}${F?'女生':'男生'}的頭像，看起來${AV_LV[lv]}`)}
{const rc0=renderCal;renderCal=function(t){rc0(t);try{drawAvatar(S)}catch(err){console.error(err)}}}
