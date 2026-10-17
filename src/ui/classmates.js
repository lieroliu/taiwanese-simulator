/* ================= end screen: 你國小同班的人 — what became of the five classmates (engine/classmates.js) ================= */
const MATE_JOB_PH={'國中':'國中畢業就','高職':'讀了高職，畢業後','五專':'讀了五專，畢業後'};
const placeShort=p=>String(p).replace(/[縣市]$/,'');
function mateLine(s,m){const a=(m.alive?s.y:m.dyY)-m.by,out=[];
  if(!m.alive&&m.dyAge<15)return `${m.dyAge} 歲那年就走了。`;
  const fj=m.firstJob,where=fj?(fj.place===m.home?`在${placeShort(m.home)}`:`到${placeShort(fj.place)}`):'',
    work=fj?(fj.title.startsWith('在')?where+'的'+fj.title.slice(1):where+fj.title):'';
  let p='';
  if(m.edu==='大學')p=`${m.retry===true?'重考一年，':''}考上${m.uniCity}的大學`+(fj?`，畢業後${work}`:'');
  else if(m.noUni)p='高中畢業沒考上大學'+(fj?`，${work}`:'');
  else if(MATE_JOB_PH[m.edu]&&fj)p=MATE_JOB_PH[m.edu]+work;
  else if(m.edu==='高中'||m.edu==='高職'||m.edu==='五專')p=`還在讀${m.edu}`;
  else p=a<12?'還在讀國小':'還在讀國中';
  out.push(p);
  /* what happened after, in the order it happened */
  const ev=[],china=m.log.find(l=>l.k==='china');
  if(china)ev.push([china.age,m.away?`${china.age} 歲去${m.away}當台幹`:`${china.age} 歲去對岸待了幾年`]);
  if(m.moved){const l=m.log.find(l=>l.k==='abroad');ev.push([l.age,`${l.age} 歲搬去${m.moved}`])}
  if(m.bust)ev.push([m.bust,`${m.bust} 歲那年店收了起來`]);else if(m.laidOff)ev.push([m.laidOff,`${m.laidOff} 歲那年被裁員`]);
  if(m.marAge!==null){ev.push([m.marAge,`${m.marAge} 歲結婚`+(m.kids?`，有 ${m.kids} 個孩子`:a>=40?'，沒有孩子':'')]);if(m.divorced)ev.push([m.divAge,`${m.divAge} 歲離婚`])}
  else if(a>=40)ev.push([999,'一直沒有結婚']);
  if(m.house)ev.push([m.houseAge,`${m.houseAge} 歲在${placeShort(m.housePlace)}買了房`]);else if(a>=45&&!m.moved)ev.push([999,'一直租房子']);
  ev.sort((x,y)=>x[0]-y[0]);
  for(let i=0;i<ev.length;i+=3)out.push(ev.slice(i,i+3).map(e=>e[1]).join('，'));
  let t=out.join('。')+'。';
  if(!m.alive)t+=`${m.dyAge} 歲那年過世。`;else if(m.job==='退休')t+='現在退休了。';
  return t}
function matesSection(s){if(!s.mates||!s.mates.length)return '';const ms=s.mates;
  const uni=ms.filter(m=>m.edu==='大學').length,house=ms.filter(m=>m.house).length,gone=ms.filter(m=>!m.alive).length;
  const sum=s.age>=30?`<p style="margin:10px 0 0">五個人裡，${uni?`${uni} 個讀了大學`:'沒有人讀大學'}，${house?`${house} 個買了房`:'沒有人買房'}，${gone?`${gone} 個已經不在了`:'到現在都還在'}。</p>`:'';
  const tag=m=>[m.eth,`爸媽${JOBNAME[m.pjob]}`].concat(m.fam==='單親'?['單親']:m.fam==='隔代教養'?['阿公阿嬤帶大']:[]).join('・');
  return `<div><h2 style="font-size:22px;margin-bottom:4px">你國小同班的人</h2><p class="muted small" style="margin:0 0 10px">${s.by} 年出生、跟你一起在${placeShort(ms[0].home)}上國小的五個同學，到 ${s.y} 年的樣子。</p>
   <ul class="keys">${ms.map(m=>`<li><b>${esc(m.sur+m.given)}</b><span><span class="muted small">${esc(tag(m))}</span><br>${esc(mateLine(s,m))}</span></li>`).join('')}</ul>${sum}
   <p class="muted small" style="margin:8px 0 0">同學的族群、性別和家境，跟你一樣依同年同縣市的出生統計抽出；升學依當年國中升學率和大學入學比例，結婚依當年初婚年齡。</p></div>`}
