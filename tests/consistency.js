const { chromium } = require(process.env.PW||'playwright');
const file=process.argv[2]||'index.html',N=+process.argv[3]||400;
(async()=>{const b=await chromium.launch();const p=await b.newPage();p.on('pageerror',e=>console.log('ERR',e.message));await p.goto('file://'+process.cwd()+'/'+file);
const r=await p.evaluate((N)=>{
 const strip=t=>t.replace(/「[^」]*」/g,'');
 const R=[
  ['未成年就在上班',(s,e,t)=>s.age<15&&/(上班|下班|同事|加班|年終|薪水|主管|老闆)/.test(t)&&!/(爸|媽|叔|阿姨|大人|鄰居|哥|姊|姐)/.test(t)],
  ['父母過世後還出現',(s,e,t)=>s.f.parentdie&&e.id!=='parentdie'&&/(媽媽|爸爸|爸媽)/.test(t)&&!/(過世|走了|告別|墳|遺|生前|以前)/.test(t)],
  ['七十歲以後還有父母',(s,e,t)=>s.age>=70&&/(媽媽|爸爸|爸媽)/.test(t)&&!/(過世|走了|告別|墳|遺|生前|以前|小時候|當年)/.test(t)],
  ['五十五歲以後祖父母還在',(s,e,t)=>s.age>=55&&/(阿公|阿嬤|爺爺|奶奶|阿婆|vuvu)/.test(t)&&!/(過世|小時候|以前|當年|孫)/.test(t)],
  ['已婚還在交往',(s,e,t)=>s.married&&e.id!=='marry'&&(['meet','relstep','crush'].includes(e.id)||['crush'].includes(e._re)||/(交往|約會|相親|告白|情書|在一起嗎)/.test(t))],
  ['沒孩子卻提到孩子',(s,e,t)=>s.kids===0&&/(孩子們|我的孩子|兒子|女兒|孫子|孫女|帶孩子|陪孩子|家裡的孩子)/.test(t)&&!/(生了|出生|懷孕)/.test(t)],
  ['沒結婚卻提到配偶',(s,e,t)=>!s.married&&!/(離婚|過世|分居)/.test(t)&&/(老婆|老公|另一半|丈夫|妻子|我們的婚姻|岳父|岳母|公公|婆婆)/.test(t)],
  ['三十歲以後還在上學',(s,e,t)=>s.age>=30&&!s.studying&&/(放學|上課|考試|作業(?!員)|班上|同學們)/.test(t)&&!/(同學會|老同學|以前|小時候|孩子|兒子|女兒|補習班教書|老師說我)/.test(t)],
  ['沒工作卻在上班',(s,e,t)=>s.age>=15&&(!s.job||['退休','家管','失業'].includes(s.job)||s.studying)&&/(上班|下班|同事|加班|主管說|公司開始)/.test(t)&&!/(爸|媽|叔|阿姨|孩子|兒子|女兒|老公|老婆|另一半|以前|退休|找工作)/.test(t)],
  ['人在國外卻遇到台灣在地的事',(s,e,t)=>s._ab0&&!e.death&&/(早餐店|夜市|騎樓|捷運|颱風假|颱風|菜市場|廟口|柑仔店|機車|統一發票|放鞭炮|淹水|健保卡|凱道|投票所|號子)/.test(t)&&!/(想念|傳到這裡|台灣的朋友|回台灣|過年回家|新聞說|電視|臉書|翻牆|網路)/.test(t)],
  ['有對象還在告白或認識新對象',(s,e,t)=>(s.married||(s.rel&&e.id!=='meet'&&e._pre!==undefined&&e._pre))&&/(告白|情書|暗戀|曖昧|聯誼|喜歡上|搭訕|交友軟體|在一起嗎|第一次牽手)/.test(t)&&!/(以前|當年|孩子|兒子|女兒|同學在|朋友說|喜歡上別人|同事)/.test(t)],
  ['人物工作前後不一',(s,e,t)=>s.people.some(p=>p.role!=='kid'&&t.includes(nm(p)+'')&&new RegExp('(新來的|前輩)'+nm(p)).test(t)&&p.job!==s.job)],
  ['免役卻寫到當兵',(s,e,t)=>s.f.exempt&&/(新訓|班長|我在當兵|入伍)/.test(t)&&e.id!=='service'],
  ['自己做生意卻有主管或尾牙',(s,e,t)=>['自營','農'].includes(s.job)&&/(主管|尾牙|公司聚餐|公司開始)/.test(t)&&!/(以前|當年|孩子|兒子|女兒|朋友|另一半|老公|老婆)/.test(t)],
  ['老了還在幫人作保',(s,e,t)=>s.age>65&&/作保/.test(t)],
  ['沒兒子卻說家裡的男孩',(s,e,t)=>s.age>=30&&/家裡的男孩/.test(t)&&!s.people.some(p=>p.role==='kid'&&p.sex==='M')],
  ['父母過世後見家長還有爸媽',(s,e,t)=>s.f.parentdie&&/(我爸|你爸|我媽|你媽)/.test(t)],
  ['未成年自己騎車或開車',(s,e,t)=>s.age<18&&/(我|你)(自己)?(騎機車|騎車|騎著機車|騎摩托車|開車|有了自己的機車)/.test(t)&&(s.age<16||!/(駕照)/.test(t))],
  ['未成年抽菸喝酒',(s,e,t)=>s.age<18&&/((約|拉)?我|你)(也)?(去)?(抽菸|點了一根菸|喝一杯|喝酒|喝了酒|喝到假酒|喝了幾瓶|灌酒|嚼檳榔|喝醉)/.test(t)&&!/(教官|偷抽|偷喝|不准|大人|爸|媽)/.test(t)],
  ['科技早於年代',(s,e,t)=>!e._pop&&((s.y<1993&&/手機/.test(t))||(s.y<2009&&/(智慧型手機|LINE|App(?![a-z])|臉書|IG|抖音|YouTube|家族群組)/.test(t))||(s.y<1995&&/(上網|網路|e-mail|Email)/.test(t))||(s.y<1998&&/MSN/.test(t))||(s.y<1988&&/(BB.?Call|呼叫器)/.test(t))||(s.y<1988&&/大哥大(?!姐)/.test(t)))],
  ['科技過時',(s,e,t)=>!e._pop&&((s.y>2005&&/(BB.?Call|呼叫器|大哥大(?!姐))/.test(t))||(s.y>2016&&/(MSN|無名小站|即時通)/.test(t)))&&!/(以前|當年|小時候|那時候|那年|還記得|收起來|抽屜|老照片)/.test(t)],
  ['年輕人不會用手機',(s,e,t)=>s.by>=1976&&s.y>=2005&&/(我|你)(還)?(沒有手機|不會用手機|不會用電腦|不會打字|沒有 ?LINE|不會用 ?LINE|不會上網|學會用 ?LINE|習慣按鍵的手機|才學會打字|手機拿得太近)/.test(t)],
  ['只剩半句',(s,e,t)=>/^(對方|他|她)回得/.test(t)],
  ['性別不合',(s,e,t)=>s.sex==='M'?/(我(發現自己)?懷孕|坐月子的那一個月|我當阿嬤|我的月經)/.test(t):/((?<!自己|我)懷孕了|我(入伍|在當兵|當兵的時候|退伍)|我當阿公)/.test(t)],
  ['結了兩次婚沒離',(s,e,t)=>e.id==='marry'&&s._mc>1&&!s.f.divorced&&!s.f.widowed]];
 const cnt={},ex={},by={};const eng=[];let lives=0,entries=0;
 for(let i=0;i<N;i++){const s=newLife(1961+(i%45));lives++;s._mc=0;let g=0;
  while(!s.dead&&g<1500){g++;const pre=!!s.rel||s.married;const out=step(s);s._ab0=abroad(s);out.forEach(e=>e._pre=pre);for(const e of out){let t=e.text||'';if(e.choices){const c=autoChoose(s,e);const pre=s.married;const res=doChoice(s,e,c);t=t+res.text;if(e.id==='marry'&&!pre&&s.married)s._mc++}
    entries++;const st=strip(t);for(const [k,f] of R){try{if(f(s,e,st)){cnt[k]=(cnt[k]||0)+1;const id=e.id||e._re||e._tl||'?';by[k]=by[k]||{};by[k][id]=(by[k][id]||0)+1;ex[k]=ex[k]||[];if(ex[k].length<4)ex[k].push(s.age+'歲 '+id+' '+t.slice(0,70))}}catch(err){}}}}
  if(s.age>=18){const h=s.hist[s.hist.length-1];eng.push(h?h.eng:s.eng)}}
 const band=x=>x>=55?'關心':x>=30?'有看法':'冷感';const eb={};eng.forEach(x=>eb[band(x)]=(eb[band(x)]||0)+1);for(const k in eb)eb[k]=Math.round(eb[k]/eng.length*100)+'%';
 const top={};for(const k in by)top[k]=Object.entries(by[k]).sort((a,b)=>b[1]-a[1]).slice(0,5).map(x=>x[0]+':'+x[1]).join(' ');
 const per={};for(const k in cnt)per[k]=(cnt[k]/lives).toFixed(2);
 return {lives,entries,perLife:per,top,ex,politics:eb}},N);
console.log(JSON.stringify(r,null,1));await b.close()})();
