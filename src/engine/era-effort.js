/* ================= the era eats effort: same choice, different year, different result ================= */
const govP=s=>clamp((.25+s.study/150)*(s.y<1990?1.2:s.y<2009?.9:s.y<=2016?.45:.7),.05,.8);
ODDS.job['考公職']=govP;
{const H=houseFail;houseFail=function(s){const t=H(s);return s.y>=2004&&!/貸不到/.test(t)?t.replace(/可是[^。]*。/,'可是那幾年房價一年比一年高，我存錢的速度怎麼樣都追不上。'):t}}
for(const k in ASP.house)ASP.house[k].fail=houseFail;
ASP.job['找大學教職']={p:s=>s.y<2005?.75:s.y<2012?.35:.15,fail:jobFail('公司',s=>`可是那幾年大學一直在減招，我投了${s.y<2012?'十幾':'幾十'}間學校，只拿到一年一聘的博士後。合約到期以後，我去了一間公司上班。`)};
ASP.gradschool={'考研究所':{p:s=>clamp((s.y<1995?.15:s.y<2003?.35:.7)+(s.study-60)/100,.08,.95),fail:s=>{s.studyEnd=s.t+6;return `可是${s.y<1995?'那時候研究所一年只收幾個人，':''}我差了幾分，沒考上。我決定先去工作。`}}};
LEAN['考研究所']={open:.5,risk:-.3};LEAN['畢業就工作']={self:-.3};LEAN['讀博士']={open:1,risk:.5};LEAN['先去工作']={self:-.3};LEAN['找大學教職']={open:.7};
PULL['考研究所']=s=>s.y<1995?.5:s.y<2003?1:1.6;PULL['讀博士']=s=>.35;
{const T=id=>TL.find(e=>e.id===id);
 const st=T('stock'),r0=st.run;st.run=s=>{const k=s.key.length;const t=r0(s);if(s.key.length>k&&s.cash>0){s.cash*=.6;regret(s,'stock','把積蓄投進股市。','股市從一萬兩千點一路崩到兩千多點',2)}return t};
 const lb=T('lehman'),r1=lb.run;lb.run=s=>{const t=r1(s);if(t&&s.ax.risk>58&&s.cash>wageY(s.y)*.5&&chance(.6)){s.cash*=.75;regret(s,'stock','把積蓄拿去買基金。','金融海嘯，基金一個月跌掉了四分之一',1.6);return t+'我買的基金，一個月跌掉了四分之一。'}return t};
 TL.push({id:'dotcom',y:2000,m:11,cat:'生活',title:'網路泡沫',run:s=>s.age>=24&&s.ax.risk>55&&s.cash>wageY(s.y)*.3&&chance(.6)?(s.cash*=.7,regret(s,'stock','把積蓄投進股市。','網路泡沫破了，前一年跟著同事買的科技股只剩三成',1.8),'科技股一路往下跌。我前一年跟著同事買的網路股，現在只剩三成，我不敢跟家裡說。'):null})}
{const gi=MS.findIndex(x=>x.id==='grad');
 MS.splice(gi,0,
 {id:'gradschool',choice:1,check:s=>s.studying==='大學'&&!s.tech&&s.y>=1985&&!s.f.gsAsk&&s.t>=s.studyEnd-5,run:s=>{s.f.gsAsk=1;return {cat:'人生',title:'畢業以後',text:`大學快畢業了。${s.y>=2003?'系上一半的同學都在準備研究所。':'系上只有幾個人在準備研究所。'}我要繼續讀嗎？`,choices:[
   {label:'考研究所',go:s=>{s.studyEnd=s.t+29;s.f.master=1;fx(s,{study:4});key(s,'考上研究所');return '我考上了研究所，又多讀了兩年。'}},
   {label:'畢業就工作',go:s=>'我決定畢業就去工作。'}]}}},
 {id:'phd',choice:1,check:s=>s.f.master&&!s.f.phdAsk&&s.studying==='大學'&&s.t>=s.studyEnd-4&&s.study>=60,run:s=>{s.f.phdAsk=1;return {cat:'人生',title:'要不要讀博士',text:`碩士快讀完了。指導教授問我要不要繼續讀博士。${s.y>=2008?'學長說現在博士找不到教職，可是我還是有點想。':'教授說台灣的大學正在擴張，很缺老師。'}`,choices:[
   {label:'讀博士',go:s=>{s.studyEnd=s.t+60;s.f.phd=1;key(s,'讀博士');return '我留下來讀博士。同學們開始領薪水的時候，我還在實驗室裡。'}},
   {label:'先去工作',go:s=>'我拿了碩士學位，去找工作。'}]}}});
 const g=MS.find(x=>x.id==='grad'),gr=g.run;g.run=s=>{const e=gr(s);if(s.f.phd)e.text='我拿到了博士學位。口試結束那天，我在研究室坐了很久。';else if(s.f.master)e.text='我研究所畢業了，拿到了碩士學位。';return e};
 const j=MS.find(x=>x.id==='job'),jr=j.run;j.run=s=>{const e=jr(s);if(s.f.phd&&!s.f.phdJob){s.f.phdJob=1;e.choices.unshift({label:'找大學教職',go:s=>{s.job='公教';s.jobStart=s.t;s.f.wasGJ=1;fx(s,{risk:-4});return '我拿到了一間大學的教職，終於可以教書了。'}})}
   const gv=e.choices.find(c=>c.label==='考公職');if(gv){const uni=s.edu==='大學';gv.go=s=>{if(chance(govP(s))){s.job='公教';s.jobStart=s.t;s.f.wasGJ=1;fx(s,{risk:-8});return '我考上了公務員。爸媽說，這是一輩子的鐵飯碗。'}
     s.job=uni?'公司':'工廠';s.jobStart=s.t;return `可是${s.y>=2009&&s.y<=2016?'那幾年景氣差，大家都去考公職，錄取率不到百分之五':'公職的錄取率太低'}，我沒考上，先進了${uni?'一間公司':'工廠'}上班。`}}
   return e}}

