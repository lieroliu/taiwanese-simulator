/* ================= 開場過場: what the dice rolled, one line at a time, before the first diary page ================= */
function introRows(s){const big=['台北市','高雄市','台中市','台南市','新竹市','嘉義市','基隆市'].includes(s.birthCounty);
  const eth=s.eth==='原住民'?`原住民・${s.tribe}族`:s.eth==='新住民子女'?`新住民子女・媽媽來自${s.momFrom}`:s.eth==='外省'?(s.juancun&&s.by<1985?'外省・眷村':'外省'):s.eth;
  const r=[['出生',`民國 ${roc(s.by)} 年 ${s.bm} 月・${cohortOf(s.by)}`],['地方',big?s.birthCounty:`${s.birthCounty}・${s.urban?'市區':'鄉下'}`],
    ['性別',s.sex==='M'?'男孩':'女孩'],['族群',eth],['爸媽',JOBNAME[s.pjob]],['家境',{'低':'不太寬裕','中':'普通','高':'算是寬裕'}[s.inc]]];
  if(s.fam!=='無')r.push(['家裡',{'單親':'單親，跟著媽媽','隔代教養':`隔代教養，${elders(s)}帶大`,'家人久病':'有家人長年臥病','受難者家屬':'有長輩是政治受難者'}[s.fam]||s.fam]);
  return r}
function closeIntro(){const ov=$('introOv');if(!ov)return false;ov.remove();if(S&&!S.dead){$('next').focus();if(autoOn())schedule()}return true}
function showIntro(s){const old=$('introOv');if(old)old.remove();
  const rows=introRows(s),n=rows.length,name=s.sur+s.given+(s.tribal?`（${s.tribal}）`:'');
  const ov=document.createElement('div');ov.id='introOv';ov.className='intro';ov.setAttribute('role','dialog');ov.setAttribute('aria-modal','true');ov.setAttribute('aria-label','你這一生的起點');
  ov.innerHTML=`<div class="intro-card"><p class="intro-k">這一次，骰到的是</p><dl class="intro-rows">${rows.map((r,i)=>`<div style="animation-delay:${.25+i*.45}s"><dt>${r[0]}</dt><dd>${esc(r[1])}</dd></div>`).join('')}</dl>
    <p class="intro-name" style="animation-delay:${.45+n*.45}s"><small>爸媽幫你取名叫</small>${esc(name)}</p>
    <p class="intro-cmp" style="animation-delay:${.9+n*.45}s">${esc(you(birthCmp(s)))}</p>
    <button class="btn intro-go" type="button" style="animation-delay:${1.1+n*.45}s">開始這一生</button>
    <p class="fine intro-note">出生地、族群、性別和家境，是依當年的出生統計估算後隨機抽出的。點一下畫面可以跳過。</p></div>`;
  ov.onclick=e=>{if(e.target.closest('.intro-go'))closeIntro();else ov.classList.add('skip')};
  ov.onkeydown=e=>{if(e.key==='Escape')closeIntro()};
  document.body.appendChild(ov);setTimeout(()=>{const b=ov.querySelector('.intro-go');if(b)b.focus()},30)}
