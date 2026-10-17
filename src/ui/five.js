/* ================= 身邊的五個人: who is around you right now, five seats, empty when nobody is there ================= */
/* read-only view of s.people (engine/people.js) and s.mates (engine/classmates.js); never changes the life */
const FIVE_N=5;
const FIVE_JOB={'農':'種田','工廠':'在工廠上班','營造':'做工地','服務':'做服務業','自營':'做小生意','公教':'當公教','公司':'在公司上班','科技':'當工程師','醫護':'在醫院上班','台幹':'在對岸當台幹','退休':'退休了','家管':'在家顧家','失業':'沒有工作'};
const fiveSchool=a=>a<7?'還沒上學':a<13?'讀國小':a<16?'讀國中':null;
/* the latest thing that happened to a person, only if it happened this year or last */
function fiveNews(s,p){const l=(p.story||[]).slice(-1)[0];if(!l)return null;const m=/^(\d{4}) 年(.*)$/.exec(l);if(!m||s.y-+m[1]>1)return null;
  const n=m[2];if(/過世|失聯|沒聯絡|分手/.test(n))return null;
  return n==='出生'?'剛出生':/^(跟你|成為)/.test(n)?'剛'+n:n}
function fiveDoing(s,p){const a=s.y-p.by;if(p.role==='kid'){if(a<1)return '剛出生';return fiveSchool(a)||(p.job?FIVE_JOB[p.job]||'在上班':a<23?'在讀書':'在上班')}
  return p.job?FIVE_JOB[p.job]||'在上班':fiveSchool(a)||'在讀書'}
function fiveMateDoing(s,m){const a=s.y-m.by;if(m.away)return `在${m.away}當台幹`;if(m.title)return m.title;return fiveSchool(a)||(m.edu==='大學'?`在${m.uniCity}讀大學`:`讀${m.edu}`)}
function fiveMateNews(s,m){const l=m.log.slice(-1)[0];if(!l||s.y-l.y>1)return null;
  return {school:`上了${l.t}`,uni:'考上大學',job:'開始工作',marry:'結婚了',kid:'生了孩子',house:'買了房子',china:`去了${l.t.replace(/^去/,'')}`,back:'從對岸回來',abroad:'搬去國外'}[l.k]||null}
function fivePeople(s){const out=[],seen=new Set(),add=(p,rel,doing,news)=>{if(out.length>=FIVE_N||seen.has(p))return;seen.add(p);out.push({p,rel,doing,news})};
  const sp=spouse(s);if(sp)add(sp,sp.sex==='M'?'先生':'太太',fiveDoing(s,sp),fiveNews(s,sp));
  const pt=!sp&&s.rel&&partnerOf(s);if(pt&&pt.alive)add(pt,s.rel.stage==='met'?'剛認識':'交往中',fiveDoing(s,pt),fiveNews(s,pt));
  for(const k of kidsOf(s).filter(k=>k.alive).slice(0,3))add(k,'孩子',fiveDoing(s,k),fiveNews(s,k));
  for(const f of friendsOf(s).slice().reverse())add(f,f.metAs==='同事'?'同事':'朋友',fiveDoing(s,f),fiveNews(s,f));
  /* 國小同班: all five while you are in school together, then only the ones still in your town, and they drift away after 22 */
  if(s.mates&&s.age<23){const ms=s.mates.filter(m=>m.alive&&(s.age<15||(m.place===s.place&&!m.away&&!m.moved)));
    for(const m of (s.age<15?ms:ms.slice(0,2)))add(m,s.age<15?'同學':'老同學',fiveMateDoing(s,m),fiveMateNews(s,m))}
  return out}
function renderFive(s){const box=$('five');if(!box)return;
  if(s.age<7&&!(s.mates&&s.mates.length)){box.innerHTML='<li class="five-empty">還小，身邊都是家裡的人。</li>';return}
  const L=fivePeople(s),rows=L.map(x=>`<li><b>${esc(x.p.callTribal||x.p.foreign?nm(x.p):x.p.sur+x.p.given)}</b><span class="five-rel">${x.rel}・${s.y-x.p.by} 歲</span><span class="five-do">${esc(x.news||x.doing)}</span></li>`);
  while(rows.length<FIVE_N)rows.push('<li class="five-empty">（空著）</li>');
  box.innerHTML=rows.join('')}
