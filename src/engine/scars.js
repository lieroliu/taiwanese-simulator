/* ================= scars: earlier family events change later outcomes ================= */
function scar(s,phrase,yrs,w){(s.scars=s.scars||[]).push({until:s.t+yrs*12,phrase,w})}
function activeScar(s){const a=(s.scars||[]).filter(x=>x.until>s.t);return a.length?a.sort((x,y)=>y.w-x.w)[0]:null}
const CONSEQ={'去補習班':'補習費只好省下來。我每天放學就回家，自己寫參考書。','學才藝':'鋼琴課上了幾次就停了。','讀五專':'五專的學費太貴，我只好去讀公立的高職。',
 '北上讀書':'家裡沒辦法再供我去台北住。我選了家鄉附近的學校。','做小生意':'開店的錢湊不出來，我只好先去上班。','開早餐店':'頂店的錢湊不出來，我只好先去別人的店裡幫忙。',
 '買':'頭期款湊不出來，房子只好繼續租。','買（貸三十年）':'銀行看了我的帳戶，不肯貸款給我。房子只好繼續租。','買（新青安四十年）':'銀行看了我的帳戶，不肯貸款給我。房子只好繼續租。','退休':'我不敢停下來，只好繼續工作。',
 '送安養中心':'安養中心的費用付不起，我只好自己照顧。','結婚':'對方家裡知道以後，婚事就這樣拖著，最後我們分手了。'};
(()=>{const P=id=>PE.find(x=>x.id===id)||RE.find(x=>x.id===id),M=id=>MS.find(x=>x.id===id);
 const wrap=(r,fn)=>{const o=r.run;r.run=s=>{const e=o(s);if(e)fn(s,e);return e}};
 wrap(P('hui'),s=>s.age<18?scar(s,'那年家裡的會被倒了',4,.35):scar(s,'我跟的會被倒了，積蓄一夜之間沒了',4,.35));
 wrap(P('guarantee'),s=>s.age<18?scar(s,'爸爸幫人作保，家裡背了一筆債',6,.45):scar(s,'我幫人作保，背了一身的債',6,.45));
 wrap(P('lottery'),s=>s.age<18?scar(s,'爸爸把家裡的錢都簽了大家樂',3,.3):scar(s,'我把錢都賠在大家樂裡',3,.3));
 wrap(P('card'),s=>scar(s,'我還在還卡債',5,.4));
 wrap(P('shark'),s=>scar(s,'地下錢莊的人還在追債',5,.5));
 wrap(P('sick'),(s,e)=>{if(e.text.includes('借了錢'))scar(s,'家裡為了我住院借的錢還沒還完',3,.25)});
 wrap(M('layoff'),s=>scar(s,'我失業了一陣子，存款早就見底',2,.3));
})();
