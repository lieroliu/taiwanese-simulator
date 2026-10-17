/* ================= UI ================= */
const $=id=>document.getElementById(id);
let S=null,pending=null,autoT=null,busy=false;
const CAT_LBL={'歷史':'歷史','人生':'人生','家庭':'家庭','族群':'族群','生活':'生活','流行':'流行','災難':'災難','健康':'健康','終':'終'};
function show(which){if(which!=='play')clearTimeout(autoT);$('start').hidden=which!=='start';$('play').hidden=which!=='play';$('end').hidden=which!=='end';$('actions').hidden=which!=='play'}
function cohortList(){const C=[['五年級',1961,1970],['六年級',1971,1980],['七年級',1981,1990],['八年級',1991,2000],['九年級',2001,2010]];
  $('cohorts').innerHTML=C.map(c=>`<button type="button" class="cohort" data-a="${c[1]}" data-b="${c[2]}"><b>${c[0]}</b><span>民國 ${roc(c[1])}–${roc(c[2])} 年・${c[1]}–${c[2]}</span></button>`).join('');
  $('cohorts').onclick=e=>{const b=e.target.closest('.cohort');if(!b)return;const y=+b.dataset.a+Math.floor(R()*(b.dataset.b-b.dataset.a+1));$('year').value=y;begin(y)}}
const TEST=window.__TESTMODE||/[?&]test=1\b/.test(location.search);
function testForce(){if(!TEST)return null;const v=id=>$(id).value||undefined;return {county:v('tCounty'),eth:v('tEth'),sex:v('tSex'),pjob:v('tJob'),inc:v('tInc')}}
function testInit(){if(!TEST)return;const opt=(id,list)=>{$(id).innerHTML='<option value="">隨機</option>'+list.map(([v,l])=>`<option value="${v}">${l}</option>`).join('')};
  opt('tCounty',COUNTIES.map(c=>[c[0],c[0]]));opt('tEth',['閩南','客家','外省','原住民','新住民子女'].map(x=>[x,x]));opt('tSex',[['M','男'],['F','女']]);
  opt('tJob',Object.entries(JOBNAME));opt('tInc',[['低','清寒'],['中','普通'],['高','寬裕']]);$('testbox').hidden=false}
function begin(by){S=newLife(by,testForce());S.track=true;cohortRun(by);pending=null;$('feed').innerHTML='';show('play');setAuto(true);renderCal(S.t);renderPanel();addEntry(birthEntry(S));window.scrollTo(0,0);$('next').focus();schedule()}
function birthEntry(s){
  const urbanTxt=['台北市','高雄市','台中市','台南市','新竹市','嘉義市','基隆市'].includes(s.birthCounty)?s.birthCounty:(s.urban?`${s.birthCounty}的市區`:`${s.birthCounty}的鄉下`);
  let t=`${s.by} 年 ${s.bm} 月，我出生在${urbanTxt}，是個${s.sex==='M'?'男孩':'女孩'}，爸媽幫我取名叫${s.given}。${s.tribal?`我的族名是${s.tribal}。`:''}`;
  if(s.eth==='閩南')t+=`家裡講${langOf(s)}。`;
  else if(s.eth==='客家')t+='家裡講客家話。';
  else if(s.eth==='原住民')t+=s.urban?`我是在都市長大的${s.tribe}族孩子。`:`我是${s.tribe}族人，家在部落裡。`;
  else if(s.eth==='外省')t+=s.by>=1985?'爺爺是 1949 年前後來台灣的外省人。':(s.juancun?'我在眷村長大，爸爸是跟著部隊來台灣的外省人。':'爸爸是 1949 年前後來台灣的外省人。');
  else t+=`媽媽是從${s.momFrom}嫁來台灣的。`;
  t+=`爸媽${JOBNAME[s.pjob]}，家境${{'低':'不太寬裕','中':'普通','高':'算是寬裕'}[s.inc]}。`;
  t+={'單親':'我出生沒多久，爸媽就分開了，我跟著媽媽長大。','隔代教養':`爸媽忙著工作，我是${elders(s)}帶大的。`,'家人久病':'家裡有一位長年臥病的家人，大人們總是很累。','受難者家屬':'家裡有位長輩，曾在白色恐怖時被帶走過。這件事，家裡沒有人提。','無':''}[s.fam];
  return {cat:'人生',birth:1,title:`我是${cohortOf(s.by)}生`,text:t,cmp:birthCmp(s),t:s.t,age:0,note:'出生地、族群、性別和家境，是依當年的出生統計估算後隨機抽出的。'};
}
function renderCal(t){const y=Math.floor(t/12),m=t%12+1,age=Math.floor((t-S.t0)/12);
  $('calMonth').innerHTML=`${age}<small>歲</small>`;$('calRoc').textContent=`民國 ${roc(y)} 年`;
  $('calSub').innerHTML=`<span>${y}</span><span>${cohortOf(S.by)}</span>`;
  const s=S,rows=[['現居',s.place==='中國'?`中國${s.cnCity?`（${s.cnCity}）`:''}`:abroad(s)?'澳洲（打工度假）':s.place+(s.place===s.birthCounty?'（家鄉）':'')]];
  if(s.cash!==undefined&&s.age>=16)rows.push(['存款',s.cash<0?`<span class="neg">負債 ${fmtW(-s.cash)} 萬</span>`:`${fmtW(s.cash)} 萬`+(s.loan>0?`<small class="muted">（學貸 ${fmtW(s.loan)} 萬）</small>`:'')]);
  if(s.cash!==undefined&&!s.f.parentdie)rows.push(['爸媽家境',famLabel(s)]);
  if(s.t<s.mortgageEnd&&s.mortY)rows.push(['房貸',`每月 ${(s.mortY/12).toFixed(1).replace(/\.0$/,'')} 萬`]);
  if(s.house==='own'&&s.houseVal)rows.push(['房子',`市值 ${fmtW(s.houseVal)} 萬${s.mortLeft>=1?`，房貸還剩 ${fmtW(s.mortLeft)} 萬`:''}`]);
  $('calNow').innerHTML=rows.map(r=>`<div><dt>${r[0]}</dt><dd>${r[1]}</dd></div>`).join('')}
function renderPanel(){const s=S;renderCal(s.t);try{drawScene()}catch(err){console.error(err)}requestAnimationFrame(fitFeed);
  const rows=[['姓名',s.sur+s.given+(s.tribal?`（${s.tribal}）`:'')],['出生地',s.birthCounty+(s.urban?'・市區':'・鄉下')],['族群',s.eth+(s.tribe?`（${s.tribe}族）`:'')+(s.momFrom?`（母親來自${s.momFrom}）`:'')],['性別',s.sex==='M'?'男':'女'],['父母',JOBNAME[s.pjob]+`・家境${s.inc}`]];
  if(s.fam!=='無')rows.push(['家庭',s.fam]);
  if(s.edu)rows.push(['學歷',s.edu+(s.major?`（${s.major}）`:'')+(s.studying?'・在學':'')]);
  if(s.job)rows.push(['工作',JOBLABEL[s.job]]);
  const sp=spouse(s);rows.push(['婚姻',s.married?(sp?`已婚・${fullName(sp)}`:'已婚'):s.f.widowed?'喪偶':s.f.divorced?'離婚':s.age>=20?'未婚':'—']);
  const kn=kidsOf(s).map(k=>k.given+(k.alive?'':'（已故）'));if(kn.length)rows.push(['孩子',kn.join('、')]);
  const fr=friendsOf(s).map(nm);if(fr.length)rows.push(['朋友',fr.slice(-3).join('、')]);
  $('reg').innerHTML=rows.map(r=>`<dt>${r[0]}</dt><dd>${r[1]}</dd>`).join('');
  const M=[['經濟',s.money],['健康',s.health],['孤獨感',s.lonely]];
  $('meters').innerHTML=M.map(m=>`<div class="meter"><span>${m[0]}</span><div class="bar" role="img" aria-label="${m[0]} ${Math.round(m[1])}"><i style="width:${m[1]}%"></i></div></div>`).join('');
}
function esc(t){return String(t).replace(/[&<>]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;'}[c]))}
/* second person: narration says 你, quotes keep the speaker's 我 */
function you(t){if(!t)return t;const cv=x=>x.replace(/自我/g,'\u0001').replace(/我國退出/g,'\u0002').replace(/我們家/g,'你家').replace(/我家/g,'你家').replace(/我/g,'你').replace(/\u0001/g,'自我').replace(/\u0002/g,'我國退出');
  let out='',buf='',d=0;for(const ch of t){if(ch==='「'){if(d===0){out+=cv(buf);buf=''}d++;out+=ch;continue}if(ch==='」'&&d>0){d--;out+=ch;continue}if(d>0)out+=ch;else buf+=ch}return out+cv(buf)}
/* help lines stay out of the diary; the end page lists the ones this life touched */
const HELP_LN=[['同志',/同志諮詢/,'同志身分、出櫃、家人不接受：台灣同志諮詢熱線 02-2392-1970'],['家暴',/113/,'家暴、性侵、兒少受虐：113 保護專線（24 小時）'],['詐騙',/165/,'接到可疑來電或訊息：165 反詐騙諮詢專線'],['討債',/110/,'遭到暴力討債或威脅：110 報警'],['心情',/1925/,'感到痛苦、睡不著、想不開：1925 安心專線（24 小時）']];
function helpTake(e){if(!S)return;const h=S._help||(S._help=new Set()),hit=x=>{for(const[k,re]of HELP_LN)if(re.test(x))h.add(k)};
  if(e.note&&/專線|熱線|報警/.test(e.note)){hit(e.note);delete e.note}
  if(e.text&&/（(?:[^（）]|（[^（）]*）)*(?:專線|熱線)(?:[^（）]|（[^（）]*）)*）/.test(e.text))e.text=e.text.replace(/（(?:[^（）]|（[^（）]*）)*(?:專線|熱線)(?:[^（）]|（[^（）]*）)*）/g,m=>{hit(m);return ''})}
function helpSection(s){const h=s._help||new Set();if(s.cause==='自殺')h.add('心情');const ls=HELP_LN.filter(x=>h.has(x[0]));if(!ls.length)return '';
  return `<div class="note small" style="background:var(--slate-soft);padding:10px 12px;border-radius:4px"><p style="margin:0 0 4px">如果你也正在經歷這一生碰到的事：</p><ul style="margin:0;padding-left:18px">${ls.map(x=>`<li>${x[2]}</li>`).join('')}</ul></div>`}
function addEntry(e){
  helpTake(e);
  if(S&&!e.choices){if(e.tone)S._scTone=e.tone;else if(e.mood&&e.mood.tone)S._scTone=e.mood.tone;S._scTxt=e.text||''}
  if(e.choices&&e.choices.length){openModal(e);return}
  const el=document.createElement('article');el.className='entry'+(e.birth?' birth':'')+(e.death?' death':'');
  const y=Math.floor(e.t/12),m=e.t%12+1;
  el.innerHTML=`<div class="meta"><span class="chip c-${e.cat}">${CAT_LBL[e.cat]||e.cat}</span><span>民國 ${roc(y)} 年 ${m} 月・${e.age} 歲</span></div>${e.birth&&e.title?`<h4>${esc(e.title)}</h4>`:''}<p>${glossify(esc(you(e.text)))}</p>${e.mood?`<p class="mood"><span class="mchip">${esc(e.mood.word)}</span><span>${glossify(esc(you(e.mood.line)))}</span></p>`:''}${e.gen?`<p class="cmp gen">${esc(you(e.gen))}</p>`:''}${e.cmp?`<p class="cmp">${esc(you(e.cmp))}</p>`:''}${e.note?`<p class="note">${esc(e.note)}</p>`:''}`;
  const fd=$('feed');fd.prepend(el);if(!noScroll)fd.scrollTop=0;
  updateBtns();
}
/* the diary scrolls inside its own box, sized to what is left of the screen, so the page itself never jumps */
function fitFeed(){const f=$('feed');if(!f||$('play').hidden)return;const a=document.querySelector('.actions'),ah=a&&getComputedStyle(a).position==='fixed'?a.offsetHeight:0;
  f.style.maxHeight=Math.max(240,Math.floor(innerHeight-(f.getBoundingClientRect().top+scrollY)-ah-12))+'px'}
addEventListener('resize',fitFeed);
function openModal(e){
  pending=e;updateBtns();
  const y=Math.floor(e.t/12),m=e.t%12+1,ctx=ctxFor(S,e.id);
  $('mMeta').textContent=`民國 ${roc(y)} 年 ${m} 月・${e.age} 歲`;
  $('mTitle').textContent=e.title||'做個決定';
  $('mText').textContent=you(e.text);
  $('mCtx').hidden=!ctx;if(ctx)$('mCtx').textContent=you(ctx.text)+'。';
  const box=$('mChoices');box.innerHTML='';
  e.choices.forEach(c=>{const b=document.createElement('button');b.className='choice';b.type='button';b.innerHTML=`<span>${esc(c.label)}</span>`+(()=>{const tg=choiceTags(S,e,c,ctx);return tg.length?`<span class="tags">${tg.map(t=>`<em class="tag t-${t[0]}">${esc(t[1])}</em>`).join('')}</span>`:''})();b.onclick=()=>{
    const why=reasonLine(S,e.id,c.label,ctxFor(S,e.id));
    const res=doChoice(S,e,c),r=res.text;
    $('modal').hidden=true;pending=null;
    addEntry({cat:e.cat,title:e.title,t:e.t,age:e.age,text:why+r,cmp:res.cmp,mood:mood(S,res.fail?'bad':toneFromText(r),e.cat,r)});
    renderPanel();updateBtns();$('next').focus();if(autoOn())schedule()};box.appendChild(b)});
  $('modal').hidden=false;
  setTimeout(()=>{const f=box.querySelector('button');if(f)f.focus()},30);
}
function updateBtns(){const dead=S&&S.dead;$('auto').hidden=!!dead;$('next').textContent=dead?'看這一生':'繼續';$('next').disabled=!!pending||busy;}
function advance(){if(!S||pending||busy)return;if(S.dead){summary();return}
  const from=S.t;let out=[],g=0;while(!out.length&&!S.dead&&g<1400){out=step(S);g++}
  animate(from,S.t,()=>{out.forEach(addEntry);renderPanel();updateBtns();if(autoOn()&&!pending&&!S.dead)schedule();if(S.dead)setAuto(false)})}
function autoPick(e){const ctx=ctxFor(S,e.id);const c=autoChoose(S,e);const why=reasonLine(S,e.id,c.label,ctx);const res=doChoice(S,e,c);
  return {cat:e.cat,title:e.title,t:e.t,age:e.age,text:(e.text?e.text+' ':'')+why+res.text,note:'（自動選擇：'+c.label+'）',cmp:res.cmp,mood:mood(S,res.fail?'bad':toneFromText(res.text),e.cat,res.text)}}
let noScroll=false;
function runAll(){if(!S||busy||S.dead)return;setAuto(false);const all=[];
  if(pending){const e=pending;$('modal').hidden=true;pending=null;all.push(autoPick(e))}
  let g=0;while(!S.dead&&g<1500){g++;for(const e of step(S)){all.push(e.choices&&e.choices.length?autoPick(e):e)}}
  noScroll=true;all.forEach(addEntry);noScroll=false;renderCal(S.t);renderPanel();updateBtns();
  $('next').focus()}
function fastForward(){if(!S||pending||busy||S.dead)return;const from=S.t;const all=[];let g=0;
  while(!S.dead&&g<1400){const o=step(S);all.push(...o);g++;if(o.some(e=>e.choices&&e.choices.length))break}
  animate(from,S.t,()=>{all.forEach(addEntry);renderPanel();updateBtns()})}
function animate(from,to,done){renderCal(to);done();return;const n=to-from;const rm=matchMedia('(prefers-reduced-motion: reduce)').matches;
  if(n<=1||rm){renderCal(to);flip();done();return}
  busy=true;updateBtns();const dur=Math.min(900,n*28);const t0=performance.now();
  const tick=now=>{const k=Math.min(1,(now-t0)/dur);renderCal(Math.round(from+(to-from)*k));if(k<1)requestAnimationFrame(tick);else{busy=false;flip();done()}};requestAnimationFrame(tick)}
function flip(){const c=$('cal');c.classList.remove('flip');void c.offsetWidth;c.classList.add('flip')}
let autoState=true;const autoOn=()=>autoState;
const speed=()=>+$('speed').value||1;
function schedule(){clearTimeout(autoT);autoT=setTimeout(()=>{if(autoOn())advance()},6800/speed())}
function setAuto(v){autoState=v;$('auto').textContent=v?'暫停':'自動播放';$('auto').setAttribute('aria-pressed',v?'true':'false');if(!v)clearTimeout(autoT)}

