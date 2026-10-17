/* ================= scene: a small pixel picture of where and how the character lives right now ================= */
const SC_W=240,SC_H=100,SC_GROUND=78;
const SC_TERR={'基隆市':'port','澎湖縣':'port','金門縣':'port','連江縣':'port','宜蘭縣':'sea','花蓮縣':'mount','台東縣':'mount','南投縣':'mount','苗栗縣':'mount','新竹縣':'mount','屏東縣':'plain','雲林縣':'plain','彰化縣':'plain','嘉義縣':'plain','台南縣':'plain','高雄縣':'plain','台中縣':'plain','桃園縣':'plain'};
const SC_BIG=new Set(['台北市','台北縣','台中市','高雄市','台南市','新竹市','嘉義市','基隆市']);
function scWhere(s){
  if(s.place==='中國')return {terr:'city',city:true,label:'中國的台商工廠旁'};
  const city=s.place==='台北市'||(s.urban&&SC_BIG.has(s.place))||(s.urban&&s.y>=1995);
  const terr=city?'city':(SC_TERR[s.place]||'plain');
  const lab={port:'漁港邊',sea:'海邊',mount:'山邊',plain:'田邊',city:'市區'}[terr];
  return {terr,city,label:`${s.place}${city?'的市區':`${lab}的鄉下`}`};
}
function scHouse(s,where,hh){
  const own=s.house==='own',home=hh.atHome||s.age<18;
  const lvl=home&&!own?({'低':0,'中':1,'高':2}[s.inc]+(s.money>70?1:s.money<25?-1:0)):(s.money>68?2:s.money<28?0:1);
  const cls=!home&&!own&&s.age>=18?'租屋':['貧窮','小康','富有'][clamp(lvl,0,2)];
  if(s.place==='中國')return {kind:'dorm',name:'工廠宿舍',cls:'宿舍'};
  if(s.t<(s.inServiceUntil||0))return {kind:'camp',name:'營區',cls:'當兵'};
  let kind,name;const y=s.y,rural=!where.city;
  if(s.juancun&&home&&y<1997){kind='juancun';name='眷村'}
  else if(cls==='租屋'){kind=where.city?(y<1975?'flat':'rooftop'):'flat';name=where.city?(y<1975?'租來的平房':'頂樓加蓋'):'租來的平房'}
  else if(rural&&s.eth==='原住民'&&(home||y<2000)){kind='tribe';name=y<1985?'部落的老房子':'部落的家'}
  else if(rural&&y<1988&&(s.eth==='閩南'||s.eth==='客家')){kind='sanheyuan';name=s.eth==='客家'?'夥房':'三合院'}
  else if(rural&&cls==='貧窮'){kind='shack';name='鐵皮屋'}
  else if(rural){kind=cls==='富有'&&y>=1995?'villa':'townhouse';name=kind==='villa'?'別墅':'透天厝'}
  else if(y<1972){kind='flat';name='平房'}
  else if(cls==='富有'&&y>=1990){kind='tower';name='電梯大樓'}
  else if(y<1995||cls==='貧窮'){kind='apt';name='老公寓'}
  else{kind=s.f.scTower??(s.f.scTower=scRng(s.by*13+s.bm)()<.5?'tower':'apt');name=kind==='tower'?'電梯大樓':'公寓'}
  return {kind,name,cls};
}
function scSky(s){
  const t=S._scTxt||'';const r=scRng(s.t*97+s.by);
  if(/颱風/.test(t))return 'storm';
  if(/過年|圍爐|鞭炮|除夕|年夜飯/.test(t)&&(s.m<=2))return 'newyear';
  if(/地震/.test(t))return 'night';
  if(s.m>=5&&s.m<=9&&r()<.18)return 'rain';
  const v=r();return v<.55?'day':v<.75?'dusk':'night';
}
function scMood(s){const tone=S._scTone;let v=(s.money*.3+s.health*.35+(100-s.lonely)*.35)-50;if(tone==='good')v+=20;if(tone==='bad')v-=25;return v>12?'happy':v<-12?'sad':'calm'}
function drawScene(){
  const s=S,cv=$('sceneCv');if(!cv||!s)return;const x=cv.getContext('2d');x.imageSmoothingEnabled=false;
  const R2=scRng(s.by*1009+s.bm*31+(s.place||'').length);const F=(c,a,b,w,h)=>{x.fillStyle=c;x.fillRect(a|0,b|0,w|0,h|0)};
  const where=scWhere(s),hh=scHousehold(s),hs=scHouse(s,where,hh),sky=scSky(s),night=sky==='night'||sky==='newyear',era=s.y<1978?0:s.y<1998?1:2;
  /* sky */
  const SK={day:['#7FB6DE','#BFE0EE'],dusk:['#5C6A9E','#E9A27A'],night:['#141A33','#2D3560'],newyear:['#141A33','#3A2C55'],rain:['#6F7C86','#A3AEB4'],storm:['#3E474F','#6B767D']}[sky];
  for(let i=0;i<SC_GROUND;i++){const k=i/SC_GROUND;F(mix(SK[0],SK[1],k),0,i,SC_W,1)}
  if(night){const rs=scRng(s.t);for(let i=0;i<26;i++)F('#E8EEF7',rs()*SC_W,rs()*40,1,1);F('#F1E7B5',196,10,7,7);F(SK[0],199,9,5,5)}
  else if(sky==='day'){F('#FFE9A8',200,9,9,9);F('#FFF6D5',202,11,5,5)}
  else if(sky==='dusk'){F('#F6C178',196,40,12,6);F('#F9D59A',198,38,8,2)}
  const cl=sky==='rain'||sky==='storm'?'#58636B':night?'#3C4468':'#F2F6F8';const rc=scRng(s.t*3+1);
  for(let i=0;i<(sky==='storm'?6:3);i++){const cx=rc()*SC_W,cy=6+rc()*20,w=18+rc()*22;F(cl,cx,cy,w,4);F(cl,cx+4,cy-3,w-10,3)}
  /* far layer: every layer reaches down to the grass so no strip of sky shows under it */
  const T=where.terr;
  if(T==='mount'||(T==='plain'&&R2()<.5)){const c1=night?'#24363A':'#4F7F63',c2=night?'#1C2B2E':'#3E6B52';
    for(let i=0;i<SC_W;i++){const h=T==='mount'?28+12*Math.sin(i/17)+8*Math.sin(i/7+1):10+5*Math.sin(i/23);F(c1,i,SC_GROUND-6-h,1,h+6)}
    if(T==='mount')for(let i=0;i<SC_W;i++){const h=16+8*Math.sin(i/11+2);F(c2,i,SC_GROUND-6-h,1,h+6)}}
  if(T==='sea'||T==='port'){const w=night?'#1D2C4A':'#4F8DB8';F(w,0,SC_GROUND-18,SC_W,18);for(let i=0;i<14;i++)F(night?'#2E4570':'#9CC8E3',(i*37+s.t)%SC_W,SC_GROUND-15+(i%3)*3,4,1);
    if(T==='port')for(let i=0;i<3;i++){const bx=130+i*34;F('#E8E4DA',bx,SC_GROUND-12,16,3);F(i%2?'#C0392B':'#2E6DA4',bx+2,SC_GROUND-14,12,2);F('#5A4632',bx+7,SC_GROUND-24,1,10);F('#E8E4DA',bx+3,SC_GROUND-22,4,1)}}
  if(T==='city'){const n=era===0?9:era===1?12:14;for(let i=0;i<n;i++){const bw=12+R2()*12,bh=(era===0?10:era===1?20:30)+R2()*(era===2?28:16),bx=i*(SC_W/n)+R2()*6;
      F(night?'#262C40':'#8E9AA6',bx,SC_GROUND-6-bh,bw,bh+6);for(let wy=SC_GROUND-3-bh;wy<SC_GROUND-8;wy+=4)for(let wx=bx+2;wx<bx+bw-2;wx+=4)if(R2()<(night?.45:.8))F(night?'#E9C46A':'#BFD3E0',wx,wy,2,2)}
    if(s.place==='台北市'&&s.y>=2004){const tx=150;F(night?'#3B4660':'#6F8A93',tx,6,8,SC_GROUND-12);for(let k=0;k<8;k++)F(night?'#4B5878':'#87A3AB',tx-2,10+k*7,12,3);F('#9AA',tx+3,1,2,6)}}
  /* street props */
  if(!where.city||era===0){F('#4A3A2C',176,SC_GROUND-38,2,38);F('#4A3A2C',171,SC_GROUND-34,12,1);x.fillStyle='#2B2B2B';for(let i=0;i<SC_W;i+=1){const yy=SC_GROUND-33+Math.round(3*Math.sin((i-176)/40*Math.PI)**2);if(i%1===0)x.fillRect(i,yy,1,1)}}
  if(where.city&&era>=1){F('#5B6470',150+(era===2?40:0),SC_GROUND-30,2,30);F('#F2E6B0',148+(era===2?40:0),SC_GROUND-32,6,2)}
  if(T==='plain'&&!where.city){for(let r=0;r<3;r++)for(let i=96;i<SC_W;i+=5)F(s.m>=6&&s.m<=10?'#B8A63E':'#5E9E4A',i,SC_GROUND-4+r*0-r,3,2)}
  if((where.city&&s.y>=1980)||s.y>=1995){const sx=196;F('#EDEDE6',sx,SC_GROUND-20,36,20);F('#2F9E5B',sx,SC_GROUND-20,36,3);F('#E6862E',sx,SC_GROUND-17,36,2);F(night?'#F6E9A6':'#BFD9E6',sx+4,SC_GROUND-12,28,9);F('#666',sx+16,SC_GROUND-12,4,12)}
  if(s.y>=1975){const mx=where.city?120:150;F('#C0392B',mx,SC_GROUND-5,10,3);F('#222',mx,SC_GROUND-2,3,3);F('#222',mx+8,SC_GROUND-2,3,3);F('#555',mx+8,SC_GROUND-8,1,3)}
  /* ground */
  const road=!where.city&&s.y<1976?'#7A6448':'#4C4F54';F(night?'#2F4A33':'#5D8C4A',0,SC_GROUND,SC_W,3);F(road,0,SC_GROUND+3,SC_W,SC_H-SC_GROUND-3);
  if(road!=='#7A6448')for(let i=0;i<SC_W;i+=16)F('#D9D3B8',i,SC_GROUND+12,8,1);
  const rg=scRng(s.by);for(let i=0;i<30;i++)F('rgba(0,0,0,.18)',rg()*SC_W,SC_GROUND+4+rg()*16,1,1);
  /* house */
  scDrawHouse(F,hs,night,s,R2);
  /* weather overlay */
  if(sky==='rain'||sky==='storm'){const rr=scRng(s.t*5);x.fillStyle='rgba(210,225,235,.55)';for(let i=0;i<(sky==='storm'?160:90);i++){const a=rr()*SC_W,b=rr()*SC_H;x.fillRect(a,b,1,3);if(sky==='storm')x.fillRect(a+1,b+3,1,2)}}
  if(sky==='newyear'){const rf=scRng(s.t*11);for(let k=0;k<3;k++){const fx0=40+rf()*170,fy=10+rf()*22,c=['#F25F5C','#FFE066','#70C1B3'][k];for(let a=0;a<12;a++){const an=a/12*Math.PI*2;for(let d=3;d<9;d+=2)F(c,fx0+Math.cos(an)*d,fy+Math.sin(an)*d,1,1)}}}
  /* people */
  const ppl=(s.dead?[]:[{me:1,age:s.age,sex:s.sex}]).concat(s.dead?[]:hh.H.sort((a,b)=>b.age-a.age));
  const gap=13,start=Math.max(72,140-ppl.length*gap/2);const mood=scMood(s);
  ppl.forEach((p,i)=>scPerson(F,start+i*gap,SC_GROUND+2,p,p.me?mood:'calm',s,p.me));
  $('sceneCap').textContent=s.dead?`${where.label}・${hs.name}・這一生走完了`:`${where.label}・${hs.name}${hs.cls&&!['宿舍','當兵'].includes(hs.cls)?`（${hs.cls}）`:''}・${hh.with}`;
}
function mix(a,b,k){const p=h=>[1,3,5].map(i=>parseInt(h.slice(i,i+2),16));const A=p(a),B=p(b);return 'rgb('+A.map((v,i)=>Math.round(v+(B[i]-v)*k)).join(',')+')'}
function scDrawHouse(F,h,night,s,R2){
  const G=SC_GROUND,win=night?'#F4D35E':'#A9C8D8',k=h.kind;const poor=h.cls==='貧窮',rich=h.cls==='富有';
  const W=(a,b,w=4,hh=4)=>{F(win,a,b,w,hh);if(!night)F('#7C9AAA',a,b,w,1)};
  if(k==='sanheyuan'){const wall=s.eth==='客家'?'#E9E1CF':'#B5603F',roof=s.eth==='客家'?'#3C3F44':'#A5432F';
    F(wall,8,G-14,16,14);F(wall,64,G-14,16,14);F(roof,6,G-17,20,3);F(roof,62,G-17,20,3);
    F(wall,22,G-20,44,20);F(roof,19,G-25,50,5);F(roof,22,G-27,44,2);F('#6B3A22',40,G-12,8,12);F('#C0392B',39,G-13,10,1);W(28,G-14);W(56,G-14);F('#C9B28A',22,G,44,2)}
  else if(k==='townhouse'||k==='villa'){const fl=k==='villa'?2:poor?2:rich?4:3,w=k==='villa'?50:30,x0=12,top=G-fl*12;
    F(k==='villa'?'#E8E2D6':['#D9CDB8','#C9D3CF','#E3D7C3'][s.by%3],x0,top,w,fl*12);for(let f=0;f<fl;f++){W(x0+4,top+3+f*12,6,5);W(x0+w-10,top+3+f*12,6,5);F('#555',x0+3,top+9+f*12,w-6,1)}
    F('#6B6B6B',x0+w/2-4,G-10,8,10);F(k==='villa'?'#9C3D2B':'#8F959A',x0-2,top-3,w+4,3);if(k!=='villa'){F('#3B7FBF',x0+w-10,top-8,8,5);F('#5A5A5A',x0+w-8,top-3,1,3)}else{F('#5D8C4A',x0+w+2,G-6,10,6);F('#3E6B3A',x0+w+4,G-12,6,6)}}
  else if(k==='flat'){F(poor?'#9A9A92':'#B9B3A3',10,G-16,40,16);F('#6E5A49',8,G-19,44,3);W(15,G-12);W(40,G-12);F('#5B4636',28,G-11,6,11)}
  else if(k==='apt'||k==='rooftop'){const x0=6,w=48,fl=5,top=G-fl*11;F(['#C6BBA8','#B8B0A0','#CBC2B1'][s.by%3],x0,top,w,fl*11);
    for(let f=0;f<fl;f++)for(let c=0;c<3;c++){const lit=night&&R2()<.6;F(lit?'#F4D35E':win,x0+4+c*15,top+3+f*11,8,5);F('#3D3D3D',x0+3+c*15,top+8+f*11,10,1)}
    F('#555',x0+w/2-3,G-8,6,8);if(k==='rooftop'){F('#4F7FA8',x0+20,top-8,22,8);F('#3B6A92',x0+18,top-10,26,2);F(night?'#F4D35E':win,x0+26,top-6,5,4)}else F('#8C8C8C',x0+30,top-6,10,6)}
  else if(k==='tower'){const x0=10,w=34,top=6;F(rich?'#5E7C8C':'#8B98A3',x0,top,w,G-top);for(let yy=top+3;yy<G-10;yy+=6)for(let c=0;c<4;c++)F(night&&R2()<.5?'#F4D35E':(rich?'#9CC3D6':win),x0+3+c*8,yy,5,3);F('#3E4A52',x0+11,G-9,12,9);F('#C9C2B0',x0-4,G-2,w+8,2)}
  else if(k==='juancun'){for(let i=0;i<3;i++){const bx=4+i*24;F('#8E8E86',bx,G-14,22,14);F('#4A4A48',bx-1,G-17,24,3);F('#B23A2E',bx+8,G-10,6,10);W(bx+2,G-11,4,4)}F('#D8D3C2',10,G-24,30,1);F('#E07A5F',14,G-23,3,4);F('#81B29A',24,G-23,3,4)}
  else if(k==='tribe'){if(s.y<1985){F('#7D7468',12,G-14,44,14);F('#5E574E',8,G-20,52,6);for(let i=0;i<6;i++)F('#4C463F',10+i*8,G-20,6,2);F('#3B2F25',30,G-10,8,10);W(16,G-11)}
    else{F('#D6CFC2',12,G-16,44,16);F('#6E7E8A',9,G-20,50,4);for(let i=0;i<6;i++)F('#B23A2E',14+i*7,G-6,4,2);F('#3B2F25',30,G-11,8,11);W(16,G-12);W(44,G-12)}}
  else if(k==='shack'){F('#7E8C93',12,G-15,40,15);F('#3E6E9E',9,G-19,46,4);for(let i=12;i<52;i+=3)F('#6C7A80',i,G-15,1,15);F('#4A3B2E',26,G-10,7,10);W(40,G-11)}
  else if(k==='dorm'){F('#B9BDB7',6,G-36,58,36);for(let f=0;f<4;f++)for(let c=0;c<6;c++)F(night&&R2()<.5?'#F4D35E':win,9+c*9,G-33+f*8,5,4);F('#7A7A7A',68,G-48,6,48);F('#9AA0A6',66,G-52,10,4)}
  else if(k==='camp'){F('#6E7B5A',8,G-16,56,16);F('#556147',6,G-19,60,3);for(let i=0;i<5;i++)W(12+i*10,G-11,5,4);F('#C0392B',70,G-40,1,40);F('#C0392B',71,G-40,8,5)}
}
function scPerson(F,x0,base,p,mood,s,me){
  const a=p.age,old=a>=60,kid=a<12,baby=a<3,teen=a<18;const h=baby?7:kid?10+Math.floor(a/3):teen?16:old?16:18;const top=base-h;const w=baby?5:7;
  const skin=me?'#E8B98F':['#E6B48B','#DDAA7E','#EBC29C'][(a+p.sex.length)%3],hair=old?'#C9C9C9':'#2B2320';
  let shirt,pants='#3E4A61';const j=me?s.job:null;
  if(me&&s.t<(s.inServiceUntil||0)){shirt='#5E6B3E';pants='#4C5733'}
  else if(me&&s.studying&&a>=6){shirt='#F2F2EE';pants=s.sex==='F'?'#2F3E66':'#6E6A5A'}
  else if(j==='工廠'){shirt='#3D6FA6';pants='#3D6FA6'}else if(j==='公教'){shirt='#BFD6EA';pants='#2E3440'}else if(j==='公司'||j==='台幹'){shirt='#2F3640';pants='#2F3640'}
  else if(j==='科技'){shirt='#4B5563';pants='#3A3F47'}else if(j==='醫護'){shirt='#F4F6F7';pants='#F4F6F7'}else if(j==='營造'){shirt='#D9822B';pants='#5A5045'}
  else if(j==='農'){shirt='#8A8F80';pants='#4E4A3E'}else if(j==='服務'||j==='家管'){shirt='#E58FA0';pants='#4A4E5A'}else if(j==='自營'){shirt='#3E8E7E';pants='#3E4A61'}
  else if(j==='退休'){shirt='#9C7A5B';pants='#5A5045'}
  else{const pal=['#7A9CC6','#C77D7D','#8FB28A','#C9A76A','#9C88C2'];shirt=pal[(a*7+(p.role||'').length)%pal.length]}
  if(baby){F(skin,x0+1,top,3,3);F(hair,x0+1,top,3,1);F('#F3E3C3',x0,top+3,5,4);return}
  const hd=kid?4:5;const hx=x0+1;
  F(skin,hx,top,5,hd);F(hair,hx,top,5,1);F(hair,hx-0,top+1,1,p.sex==='F'?hd+(old?0:2):1);F(hair,hx+4,top+1,1,p.sex==='F'?hd+(old?0:2):1);
  F('#1E1E1E',hx+1,top+2,1,1);F('#1E1E1E',hx+3,top+2,1,1);
  const my=top+hd-1;if(mood==='happy'){F('#7A3B2E',hx+1,my-1,1,1);F('#7A3B2E',hx+2,my,1,1);F('#7A3B2E',hx+3,my-1,1,1)}else if(mood==='sad'){F('#7A3B2E',hx+1,my,1,1);F('#7A3B2E',hx+2,my-1,1,1);F('#7A3B2E',hx+3,my,1,1)}else F('#7A3B2E',hx+2,my,1,1);
  const bt=top+hd,bh=Math.round((h-hd)*.5),lh=h-hd-bh;F(shirt,x0,bt,w,bh);F(skin,x0-1,bt+1,1,bh-1);F(skin,x0+w,bt+1,1,bh-1);
  if(!me||!(s.sex==='F'&&j==='服務'))F(pants,x0+1,bt+bh,2,lh),F(pants,x0+4,bt+bh,2,lh);else F(pants,x0+1,bt+bh,5,lh);
  if(me&&j==='農'){F('#D9C27A',hx-2,top-1,9,1);F('#D9C27A',hx,top-2,5,1)}
  if(me&&j==='營造'){F('#F2C230',hx,top-1,5,2)}
  if(me&&j==='公司'){F('#C0392B',x0+3,bt,1,bh-1)}
  if(old&&a>=72){F('#6B4E2E',x0+w+1,bt+2,1,h-hd-2)}
  if(me){const ey=top-5;if(mood==='happy'){F('#F25F7A',x0+2,ey,1,1);F('#F25F7A',x0+4,ey,1,1);F('#F25F7A',x0+2,ey+1,3,1);F('#F25F7A',x0+3,ey+2,1,1)}
    else if(mood==='sad'){F('#6FA8DC',x0+3,ey,1,1);F('#6FA8DC',x0+2,ey+1,3,2)}
    F('#F4D35E',x0+2,base+1,3,1)}
}

