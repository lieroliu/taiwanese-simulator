/* ================= family lines for the end screen's 時代沒讓你做到的事 (engine/era-wall.js) =================
   Only where the era itself stood in the way, each with an official figure (data/stats/family.json via FAMD, OFF):
   staying in a marriage when almost nobody divorced, losing your children under the pre-1996 custody rule,
   and a childhood made poorer by a parent's job loss or the 2005–06 卡債 years. */
{const dc=doChoice;doChoice=function(s,e,c){const r=dc(s,e,c);
  if(e&&e.id==='divorce'&&c){
    if(c.label==='撐下去'&&s.y<1990){const d=FAMD.divT[s.y]||FAMD.divT[1975];
      eraLog(s,'stayMar','沒能離開那段婚姻。',eraWhyLine(s,`那一年，每一千個已婚的人裡，只有 ${d.toFixed(1)} 個離婚。親戚、鄰居、公司，每個人都會知道`),2)}
    if(c.label==='離婚'&&s.f.kidsEx===s.t&&s.sex==='F'&&s.y<1996)
      eraLog(s,'custody','沒能把孩子帶在身邊。',eraWhyLine(s,'那時候的民法寫著，離婚以後孩子由爸爸監護，除非另有約定。1996 年才改成看孩子的最佳利益'),3)}
  return r}}
{const st=step;step=function(s){const out=st(s);
  if(s.f.parJob===s.t){const u=offAt('unemp',s.y);
    eraLog(s,'kidMoney','沒能有一個不用擔心錢的童年。',eraWhyLine(s,`${s.pjob==='小生意'?'爸媽的店收了':'家裡有人丟了工作'}。${u?`那一年失業率 ${u.v.toFixed(2)}%`:'那一年景氣很差'}`),1.5)}
  if(s.f.parCard===s.t){const h=FAMD.hd[s.y];
    eraLog(s,'kidMoney','沒能有一個不用擔心錢的童年。',eraWhyLine(s,`銀行天天打電話到家裡。${h?`那一年，台灣家庭的借款加起來是一整年 GDP 的 ${Math.round(h)}%`:'那幾年，銀行到處發現金卡'}`),1.5)}
  return out}}
