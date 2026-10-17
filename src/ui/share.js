/* ================= share image: a vertical card of the end screen for Threads ================= */
function shareLine(s){if(s.shareLine)return s.shareLine;const L=(s.log||[]).filter(x=>x.age>=12&&x.text.length>=18&&x.text.length<=90&&!/[{}]/.test(x.text));
  if(!L.length)return null;const w=x=>(x.tone==='bad'||x.tone==='good'||x.tone==='tense'?3:1)*(['人生','家庭','歷史','災難','族群'].includes(x.cat)?2:1)*(x.age>=15&&x.age<=65?1.5:1);
  let t=L.reduce((a,x)=>a+w(x),0)*R();for(const x of L){t-=w(x);if(t<=0)return s.shareLine=x}return s.shareLine=L[L.length-1]}
const eduDone=s=>s.studying&&s.studying!==s.edu?`${s.edu}畢業，還在讀${s.studying}`:s.studying||(s.edu==='國小'&&s.age<12)||(s.edu==='國中'&&s.age<15)?`還在讀${s.studying||s.edu}`:`${s.edu}畢業`;
function epitaph(s){const P=s.sex==='M'?'爸爸':'媽媽';return [`生在${s.birthCounty}`,s.edu&&eduDone(s),(s.lastWork||working(s)&&s.job)&&(L=>/^(自己|在|當|做|開|務)/.test(L)?L.replace(/^自己做/,'做過'):`做過${L}`)(JOBLABEL[s.lastWork||s.job]),s.kids?`${s.kids} 個孩子的${P}`:s.married?'結過婚，沒有孩子':s.age>=30?'一個人過了一輩子':null].filter(Boolean).join('，')+'。'}
function shareStats(s){const out=[],K=sexKey(s),u=offAt('uni',s.by+18),m=offAt('mar',s.by+28),b=offAt('births',s.by);
  if(b)out.push([`${Math.round(b.v/1e4)} 萬`,`${s.by} 年全台出生的人，你是其中一個`]);
  if(u&&s.age>=18)out.push([`${Math.round(u.v)}%`,`你 18 歲那年的大學錄取率${s.edu==='大學'?'，你考上了':''}`]);
  const ma=s.key.find(k=>k.text.includes('結婚'));if(m&&s.age>=25)out.push(ma?[`${ma.age} 歲`,`結婚，那時初婚平均 ${m.v[K].toFixed(1)} 歲`]:[`${m.v[K].toFixed(1)} 歲`,'你這一屆初婚的平均年齡，你沒有結婚']);
  return out.slice(0,3)}
function wrapCJK(ctx,text,maxW){const lines=[];let cur='';const noStart='，。、；：！？」』）…';
  for(const ch of text){if(ctx.measureText(cur+ch).width>maxW&&cur){if(noStart.includes(ch)){cur+=ch;continue}lines.push(cur);cur=ch}else cur+=ch}if(cur)lines.push(cur);return lines}
async function drawShare(s){const W=1080,H=1920,cv=document.createElement('canvas');cv.width=W;cv.height=H;const x=cv.getContext('2d');
  const SERIF='"Noto Serif TC","Songti TC","PMingLiU",serif',SANS='"Noto Sans TC","PingFang TC","Microsoft JhengHei",sans-serif';
  try{await Promise.all(['900 80px "Noto Serif TC"','600 40px "Noto Serif TC"','400 30px "Noto Sans TC"','700 30px "Noto Sans TC"'].map(f=>document.fonts.load(f,'台灣人生模擬')))}catch(e){}
  const C={bg:'#E7ECE8',paper:'#FBFCFA',ink:'#1C2320',muted:'#5C6862',line:'#C8D2CB',red:'#B8352D',jade:'#2C6652'};
  x.fillStyle=C.bg;x.fillRect(0,0,W,H);x.fillStyle=C.paper;x.fillRect(60,60,W-120,H-120);
  x.fillStyle=C.red;x.fillRect(60,60,W-120,120);x.fillStyle='#fff';x.textBaseline='middle';
  x.font=`900 46px ${SERIF}`;x.fillText('台灣人生模擬',110,120);x.font=`500 30px ${SANS}`;x.textAlign='right';x.fillText('找回你那一屆',W-110,122);x.textAlign='left';x.textBaseline='alphabetic';
  let y=270;const L=110,MW=W-220;
  x.fillStyle=C.muted;x.font=`400 32px ${SANS}`;x.fillText(`${cohortOf(s.by)}・${s.birthCounty}・${s.eth}・${s.sex==='M'?'男':'女'}`,L,y);y+=100;
  x.fillStyle=C.ink;x.font=`900 92px ${SERIF}`;x.fillText(s.sur+s.given,L,y);y+=80;
  x.font=`600 44px ${SERIF}`;x.fillText(`${s.by}–${s.y}`,L,y);const yw=x.measureText(`${s.by}–${s.y}　`).width;x.fillStyle=C.red;x.font=`700 44px ${SANS}`;x.fillText(`享年 ${s.age} 歲`,L+yw,y);y+=64;
  x.fillStyle=C.muted;x.font=`400 32px ${SANS}`;for(const l of wrapCJK(x,epitaph(s),MW).slice(0,2)){x.fillText(l,L,y);y+=48}y+=24;
  const rule=()=>{x.strokeStyle=C.line;x.lineWidth=2;x.beginPath();x.moveTo(L,y);x.lineTo(W-L,y);x.stroke();y+=70};rule();
  const label=t=>{x.fillStyle=C.red;x.font=`700 28px ${SANS}`;x.fillText(t,L,y);y+=62};
  habitFromState(s);const hb=(s.habits||[]).slice().sort((a,b)=>(HW[b.k]||1)-(HW[a.k]||1)||a.age-b.age)[0];
  if(hb){label('你的口頭禪');x.fillStyle=C.ink;x.font=`900 56px ${SERIF}`;wrapCJK(x,`「${hb.say}」`,MW).slice(0,3).forEach((l,i)=>{x.fillText(l,i?L:L-26,y);y+=76});
    x.fillStyle=C.muted;x.font=`400 30px ${SANS}`;const why=hb.why.replace(/^，/,'');for(const l of wrapCJK(x,why.startsWith('你')||/^\d/.test(why)?why+'。':'因為'+why+'。',MW).slice(0,2)){x.fillText(l,L,y);y+=46}y+=30;rule()}
  const d=shareLine(s);
  if(d){label(`${d.age} 歲・民國 ${roc(d.y)} 年`);x.fillStyle=C.ink;x.font=`600 42px ${SERIF}`;const ls=wrapCJK(x,you(d.text),MW);const max=hb?5:7;
    ls.slice(0,max).forEach((l,i)=>{x.fillText(i===max-1&&ls.length>max?l.slice(0,-1)+'…':l,L,y);y+=64});y+=36;rule()}
  const pn=popNames(s);if(pn.length>=2){label('你那一屆的童年');x.fillStyle=C.ink;x.font=`600 38px ${SERIF}`;wrapCJK(x,pn.join('、')+'……',MW).slice(0,2).forEach(l=>{x.fillText(l,L,y);y+=56});y+=30;rule()}
  const st=shareStats(s);
  if(st.length){label('跟同一年出生的人比');for(const [big,txt] of st){if(y>H-330)break;x.fillStyle=C.jade;x.font=`900 64px ${SERIF}`;x.fillText(big,L,y);const bw=Math.max(220,x.measureText(big).width+30);
    x.fillStyle=C.ink;x.font=`400 32px ${SANS}`;const ls=wrapCJK(x,txt,MW-bw);ls.slice(0,2).forEach((l,i)=>x.fillText(l,L+bw,y-(ls.length>1?22:10)+i*44));y+=104}}
  x.fillStyle=C.ink;x.font=`600 34px ${SERIF}`;x.textAlign='center';x.fillText('你可能是任何一個台灣人，',W/2,H-210);x.fillText('而時代決定了你能怎麼活。',W/2,H-160);
  x.fillStyle=C.muted;x.font=`400 26px ${SANS}`;x.fillText('靈感來自 1in8b.life',W/2,H-100);x.textAlign='left';
  return cv}
async function openShare(s){
  const cv=await drawShare(s);const blob=await new Promise(r=>cv.toBlob(r,'image/png'));const url=URL.createObjectURL(blob);const name=`台灣人生模擬-${s.by}-${s.sur}${s.given}.png`;
  const ov=document.createElement('div');ov.className='shareov';ov.setAttribute('role','dialog');ov.setAttribute('aria-label','分享圖');
  const file=new File([blob],name,{type:'image/png'});const canShare=navigator.canShare&&navigator.canShare({files:[file]});
  ov.innerHTML=`<div class="sharebox"><img alt="這一生的分享圖" src="${url}"><p class="muted small" style="margin:0">手機可以長按圖片儲存，再貼到 Threads。</p><div class="row">${canShare?'<button class="btn" id="shGo">分享</button>':''}<button class="btn${canShare?' ghost':''}" id="shDl">下載圖片</button><button class="btn ghost" id="shX">關閉</button></div></div>`;
  document.body.appendChild(ov);const close=()=>{ov.remove();URL.revokeObjectURL(url)};
  ov.querySelector('#shX').onclick=close;ov.onclick=e=>{if(e.target===ov)close()};
  if(canShare)ov.querySelector('#shGo').onclick=()=>navigator.share({files:[file],text:`我在台灣人生模擬裡活了 ${s.age} 歲。你那一屆呢？`}).catch(()=>{});
  ov.querySelector('#shDl').onclick=async()=>{let dl=null;try{dl=window.claude&&window.claude.use?await window.claude.use('downloads'):null}catch(e){}
    if(dl){try{await dl.save({filename:name,data:blob})}catch(e){}return}
    const a=document.createElement('a');a.href=url;a.download=name;document.body.appendChild(a);a.click();a.remove()};
  ov.querySelector('#shX').focus()}

