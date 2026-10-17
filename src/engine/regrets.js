/* ================= regrets: what this character kept thinking about, each with the year that caused it ================= */
function regret(s,k,txt,why,w,o){s.regrets=s.regrets||[];if(s.regrets.some(r=>r.k===k))return;s.regrets.push(Object.assign({k,txt,why:`${s.y} 年，${why}`,w:w||1,age:s.age},o||{}))}
const REG_T={'考高中':['沒考上高中。',2],'讀五專':['沒考上五專。',1],'考大學':['沒有讀大學。',2.5],'醫護':['沒能讀醫科。',1.5],'北上讀書':['沒能去台北讀書。',1.2],
 '北上打拼':['沒能在台北待下來。',1.5],'先出國打工度假':['沒能出國看看。',1],'進科學園區':['沒能進科學園區。',1],'進公司上班':['第一份工作沒能進公司上班。',1],
 '去學校教書':['沒能當上正式老師。',2],'考公職':['沒考上公職。',1.5],'做小生意':['沒能開自己的店。',1.5],'找大學教職':['讀了好幾年博士，沒能留在大學教書。',2.5],
 '買':['沒能買下自己的房子。',1.8],'買（貸三十年）':['沒能買下自己的房子。',1.8],'買（新青安四十年）':['沒能買下自己的房子。',1.8],'轉行':['沒能轉行成功。',1.2],'開早餐店':['沒能開自己的早餐店。',1],
 '退休':['沒能早點退休。',1],'學才藝':['鋼琴沒有學下去。',.8],'去補習班':['小時候沒能去補習。',.6],'跟孩子住':['老了沒能跟孩子住在一起。',1.5],'考研究所':['沒考上研究所。',1.2]};
function whyOf(t){const i=t.indexOf('可是');if(i<0)return null;let w=t.slice(i+2);const j=w.indexOf('。');if(j>=0)w=w.slice(0,j);return w.replace(/^那年的?/,'').replace(/^那幾年/,'')}
{const dc0=doChoice;doChoice=function(s,e,c){const pn=e.id==='marry'&&s.f.ptId&&partnerOf(s)?nm(partnerOf(s)):null;const r=dc0(s,e,c);
  if(r.text){const why=whyOf(r.text);
   if(s.f.noUniMoney&&!s.f.regNoUni){s.f.regNoUni=1;regret(s,'nouni','考上了大學，卻沒有去讀。',why||'學費湊不出來',3)}
   else if(/供弟弟讀書/.test(r.text))regret(s,'nostudy','國中畢業就沒有再讀書。','家裡要我去工作，供弟弟讀書',3);
   else if(why&&e.id==='marry'&&c.label==='結婚')regret(s,'marry'+s.t,`沒能跟${pn||'那個人'}結婚。`,why,2);
   else if(why&&REG_T[c.label])regret(s,'c_'+c.label,REG_T[c.label][0],why,REG_T[c.label][1])}
  if(e.id==='marry'&&c.label==='先不要'&&pn)regret(s,'notmarry',`沒有跟${pn}走下去。`,`${pn}想結婚，我說再等等`,1.6,{single:1});
  return r}}

