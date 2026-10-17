/* ================= family money trouble seen from a child's eyes =================
   While you are under 18, a parent may lose a job at that year's official unemployment rate (OFF.unemp, ×.4 a month
   for one of two working parents, 估算; 公教 and 農 excluded), the family shop may close in a bad year, and in the
   2005–06 卡債 years a parent may be the one the bank keeps calling. Each happens at most once and leaves the family
   poorer when you grow up (s.f.famHitK shrinks the parents' wealth at engine/money.js famInit). */
const famP=s=>s.fam==='單親'?soleP(s):s.f.dadDie?'媽媽':s.f.momDie?'爸爸':chance(.7)?'爸爸':'媽媽';
const famHit=(s,k,m)=>{s.f.famHitK=(s.f.famHitK||1)*k;fx(s,{money:-m,lonely:3})};
RE.push({id:'parjob',p:s=>s.age>=4&&s.age<18&&!s.f.parJob&&['工','白領','小生意'].includes(s.pjob)&&!abroad(s)
    &&!(s.pjob==='工'&&s.y>=1990&&s.y<=1997)?(OFF.unemp[s.y]||2)/100/12*.4*(s.pjob==='小生意'?.5:1):0,run:s=>{
  s.f.parJob=s.t;const P=famP(s),p=P==='爸爸'?'他':'她';famHit(s,.8,8);
  if(s.pjob==='小生意'){const shop=pick(s.y<1990?['雜貨店','五金行','布行']:['早餐店','服飾店','雜貨店']);
    return {cat:'家庭',tone:'bad',text:`爸媽的${shop}收起來了。鐵門拉下來那天，${P}在門口站了很久，${p}說：「沒關係，再想辦法。」`}}
  if(s.y>=2000&&s.y<=2003&&s.pjob==='工')return {cat:'家庭',tone:'bad',text:`${P}的工廠搬去大陸了。${P}每天早上還是準時出門，後來我才知道，${p}是去公園坐著。`};
  if(s.y>=2008&&s.y<=2009)return {cat:'家庭',tone:'bad',text:`${P}的公司放無薪假，一個月只上兩個禮拜的班。晚餐的菜少了一道，大人說是要吃清淡一點。`};
  return {cat:'家庭',tone:'bad',text:`${P}被裁員了。那陣子${p}每天${s.y>=2000?'上網找工作':'翻報紙的求職欄'}，用紅筆圈了好幾個，${s.age<10?'我在旁邊幫忙念地址。':'我假裝沒看到。'}`}}});
RE.push({id:'parcard',p:s=>s.y>=2004&&s.y<=2007&&s.age>=6&&s.age<18&&!s.f.parCard&&!abroad(s)?.0015*(s.inc==='高'?.4:1):0,run:s=>{
  s.f.parCard=s.t;const P=famP(s),p=P==='爸爸'?'他':'她';famHit(s,.85,6);
  return {cat:'家庭',tone:'bad',text:`家裡的電話一直響。${P}叫我去接，說如果是銀行打來的，就說${p}不在。`}}});
{const fi0=famInit;famInit=function(s){const r=fi0(s);if(s.f.famHitK&&s.famW>0)s.famW*=s.f.famHitK;return r}}
