/* ================= satisfactions: things that worked out, shown beside regrets on the end screen ================= */
function sat(s,k,txt,why,w){s.sats=s.sats||[];if(s.sats.some(r=>r.k===k))return;s.sats.push({k,txt,why:why?`${s.y} 年，${why}`:null,w:w||1,age:s.age})}
const SAT_T={'考高中':['考上了高中。',1],'考大學':['考上了大學。',1.5,s=>s.pend==='major'||s.studying==='大學'],'先出國打工度假':['年輕的時候，出國看過外面的世界。',1],
 '進科學園區':['進了科學園區。',1,s=>s.job==='科技'],'去學校教書':['當上了老師。',1.5,s=>s.job==='公教'],'考公職':['考上了公職。',1.5,s=>s.job==='公教'],
 '做小生意':['開了自己的店。',1.5,s=>s.job==='自營'],'開早餐店':['開了自己的早餐店。',1.2,s=>s.job==='自營'],'轉行':['轉行成功了。',1.2],'考研究所':['考上了研究所。',1,s=>s.studying==='碩士'||s.edu==='碩士']};
const sent1=t=>{const ss=splitSent(t||'').map(x=>x.replace(/[。！？]$/,''));return ss};
{const dc2=doChoice;doChoice=function(s,e,c){const ctx=ctxFor(s,e.id);const r=dc2(s,e,c);const T=SAT_T[c.label];
  if(T&&r&&!r.fail&&(!T[2]||T[2](s))){const lb=c.label.replace(/（.*）/,'');const against=ctx&&ctx.norm&&ctx.norm.length&&!ctx.norm.includes(c.label);
    const ss=sent1(r.text);const why=against?`${ctx.text}，我還是決定${lb}`:(ss[1]||ss[0]||null);sat(s,'c_'+(c.label==='開早餐店'?'做小生意':c.label),T[0],why,T[1]+(against?1:0))}
  return r}}
{const dc3=doChoice;doChoice=function(s,e,c){const r=dc3(s,e,c);if(r&&r.text)r.text=parFix(s,r.text);return r}}
{const mk0=mkPerson;mkPerson=function(s,role,o){const p=mk0(s,role,o||{});p.metY=s.y;return p}}
const keyOf=(s,re)=>s.key.find(k=>re.test(k.text));
function endSats(s){const L=(s.sats||[]).slice(),add=(k,txt,y,why,w)=>{if(!L.some(x=>x.k===k))L.push({k,txt,why:why?(y?`${y} 年，${why}`:why):null,w,age:y?y-s.by:s.age})};
  if(s.age<18)return L;
  const lk=likeOf(s);
  if(s.f.kin==='own'&&lk&&s.major===lk.major)add('kinOwn',`讀了自己想讀的${lk.sub}。`,null,`親戚都說讀${s.kinAdv.sub}比較有出路，我還是填了${lk.sub}`,2.2);
  if(s.f.kinTrOK&&lk)add('kinTr',`轉到了自己想讀的${lk.sub}。`,null,`先照親戚說的讀了${s.kinAdv.sub}，一年後轉系成功`,2);
  if(s.f.kin==='retake'&&!s.f.kinRetakeFail&&s.major==='醫護')add('kinMed','重考一年，考上了醫學系。',null,null,2);
  const kids=s.people.filter(p=>p.role==='kid').sort((a,b)=>a.by-b.by);
  if(kids.length)add('kids',kids.length===1?'有了一個孩子。':`有了 ${kids.length} 個孩子。`,kids[0].by,`第一個孩子${nm(kids[0])}出生`,1.6);
  const gk=keyOf(s,/有了孫子/);if(gk)add('gk',s.sex==='M'?'當了阿公。':'當了阿嬤。',gk.y,'第一次抱到孫子',1.3);
  const sp=spouse(s),mk=keyOf(s,/^結婚$|結婚$/);if(sp&&s.married&&mk&&s.y-mk.y>=20)add('mar',`跟${nm(sp)}一起過了 ${s.y-mk.y} 年。`,mk.y,'我們結婚',2);
  if(s.house==='own'&&s.houseAge!=null)add('house','買下了自己的房子。',s.by+s.houseAge,'拿到了房子的鑰匙',1.6);
  const fr=s.people.filter(p=>p.role==='friend'&&p.metY&&s.y-p.metY>=30).sort((a,b)=>a.metY-b.metY)[0];if(fr)add('fr',`跟${nm(fr)}當了 ${s.y-fr.metY} 年的朋友。`,fr.metY,`我們認識`,1.3);
  const lo=keyOf(s,/中年失業/);if(lo&&s.job!=='失業')add('lo','失業以後，又重新站了起來。',lo.y,'我中年失業',1.8);
  const ds=keyOf(s,/921 地震|八八風災/);if(ds)add('ds','把家園重新整理了起來。',ds.y,ds.text,1.5);
  const db=keyOf(s,/卡債|跟會被倒|作保被拖累/);if(db&&s.money>=40)add('db',/跟會/.test(db.text)?'被倒掉的錢，後來慢慢賺了回來。':'把欠的錢都還清了。',db.y,db.text,1.6);
  const rd=keyOf(s,/環島一圈/);if(rd)add('rd','環島過一圈。',rd.y,null,.8);
  const rt=keyOf(s,/^退休$/);if(rt)add('rt','平平安安做到退休。',rt.y,null,.7);
  if(!L.length&&s.age>=75)add('old',`活到了 ${s.age} 歲。`,null,null,.5);
  if(!L.length&&s.job&&!['失業','家管'].includes(s.job))add('work','一直靠自己的雙手過日子。',null,null,.5);
  return L}
const satTop=s=>endSats(s).sort((a,b)=>b.w-a.w||a.age-b.age).slice(0,3).sort((a,b)=>a.age-b.age);
function satsSection(s){const H=satTop(s);if(!H.length)return '';
  return `<div><h2 style="font-size:22px;margin-bottom:4px">你滿意的事</h2><p class="muted small" style="margin:0 0 10px">這些事，你一直記得。</p>
  <ul class="keys habits">${H.map(r=>`<li><span><span class="say">${esc(you(r.txt))}</span>${r.why?`<br><span class="small">${esc(you(r.why))}。</span>`:''}</span></li>`).join('')}</ul></div>`}
