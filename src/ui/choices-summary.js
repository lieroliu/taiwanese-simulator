/* ================= end page: the decisions you made, next to what people around you chose ================= */
const CH_SKIP=new Set(['after10']);
function choicesSection(s){const L=(s.ch||[]).filter(x=>!CH_SKIP.has(x.id)&&!String(x.id).startsWith('dg_')&&!(x.id==='meet'&&x.title==='認識一個人'));
  if(!L.length)return '';const seen=new Set(),pickd=[];
  for(let i=L.length-1;i>=0;i--){const x=L[i],k=x.id+'|'+x.title;if(seen.has(k))continue;seen.add(k);pickd.unshift(x)}
  const LOW=x=>['租房子','要不要在一起'].includes(x.title);let shown=pickd;if(shown.length>10)shown=shown.filter(x=>!LOW(x));shown=shown.slice(0,10);
  const rows=shown.map(x=>{const other=x.norm.filter(n=>n!==x.label);
    const peer=x.norm.includes(x.label)?'跟身邊大多數人一樣':other.length?`那時身邊的人多半選「${other[0]}」`:'';
    const res=x.fail?'，可是沒能做到':'';
    return `<li><b>${x.age} 歲</b><span>${esc(x.title?x.title+'：':'')}${esc(x.label)}${res}${peer?`<span class="muted small">（${esc(peer)}）</span>`:''}</span></li>`}).join('');
  const own=shown.filter(x=>x.norm.length&&!x.norm.includes(x.label)).length;
  const lead=own===0?'這一生，你幾乎都走了身邊的人走的路。':own>=3?`這一生，你有 ${own} 次沒有照身邊的人的路走。`:`這一生，你有 ${own} 次走了跟身邊的人不一樣的路。`;
  return `<div><h2 style="font-size:22px;margin-bottom:4px">你做的決定</h2><p class="muted small" style="margin:0 0 8px">${lead}</p><ul class="keys">${rows}</ul></div>`}
