/* ================= fam-like: how the family feels about you (hidden, 0–100) =================
   Paddy 2026-10-17: asking home for money costs goodwill, more so when the family itself is short.
   Sending money home, living with them and caring for a sick parent win it back; time slowly heals the rest.
   It changes how the family talks to you, and below 25 they stop sending money. Not shown on the status card. */
const famLike=s=>s.famLike??(s.famLike=clamp(62+(s.inc==='高'?6:s.inc==='低'?-4:0)+(R()-.5)*16,30,90));
function famLikeAdd(s,d){s.famLike=clamp(famLike(s)+d,0,100)}
/* the family's answer when you call home for money, by how they feel about you */
function famAskLine(s,n){const L=famLike(s);
  if(n===1)return L>=60?'這個月的錢不夠用，我打電話回家。爸媽沒有多問，隔天就匯了錢給我。':L>=40?'這個月的錢不夠用，我打電話回家。媽媽唸了我半個小時，最後還是說：「我明天去匯。」':'這個月的錢不夠用，我打電話回家。爸爸沉默了很久，說：「你都幾歲了？」隔天錢還是匯來了。';
  return L>=60?'我又打電話回家要錢了。電話那頭停了一下，才說：「好，我明天去領。」':L>=40?'我又打電話回家要錢了。媽媽說，家裡也不是印鈔票的。掛電話前，她叫我記得吃飯。':'我又打電話回家要錢了。爸爸說這是最後一次。我聽得出來，他是認真的。'}
/* below 25 the family won't give any more */
{const f0=famCanHelp;famCanHelp=s=>f0(s)&&famLike(s)>=25}
{const c0=cover;cover=function(s){if(s.cash===undefined||s.cash>=-1e-9)return c0(s);const a0=s.f.famAsk||0,w=s.famW;
  if(!s.f.famRefused&&s.age>=18&&!s.f.parentdie&&s.famW>w0(s)*.3&&famLike(s)<25){s.f.famRefused=s.t;fx(s,{lonely:6});
    s.q.push({cat:'家庭',tone:'bad',text:'我打電話回家要錢。爸爸只說了一句「你自己想辦法」，就把電話掛了。'})}
  c0(s);const a1=s.f.famAsk||0;
  if(a1>a0){famLikeAdd(s,-(w<w0(s)*2?14:8));const q=s.q[s.q.length-1];if(q&&/打電話回家/.test(q.text)&&(a1===1||a1===4))q.text=famAskLine(s,a1)}}}
/* yearly: what wins goodwill back, and the lines when it crosses a threshold */
{const y0=yearly;yearly=function(s){y0(s);if(s.cash===undefined||s.age<16||!parAlive(s))return;const L0=famLike(s);
  if(L0<80){if(s.f.sendHome)famLikeAdd(s,3);if(atHome(s)&&working(s))famLikeAdd(s,1);if(s.f.caring)famLikeAdd(s,4)}
  if(L0<60)famLikeAdd(s,1.5);else if(L0>85)famLikeAdd(s,-1);
  const L=famLike(s);
  if(L<40&&!s.f.famCold){s.f.famCold=s.t;s.q.push({cat:'家庭',tone:'bad',text:'過年回家，飯桌上沒有人問我工作的事。親戚聊得很熱鬧，輪到我說話，大家就安靜下來。'})}
  else if(L<20&&!s.f.famIce){s.f.famIce=s.t;s.q.push({cat:'家庭',tone:'bad',text:'媽媽打電話來，講沒兩句就說「好啦，你忙」。我拿著電話，不知道該說什麼。'})}
  else if(L>=60&&s.f.famCold&&!s.f.famWarm){s.f.famWarm=s.t;s.q.push({cat:'家庭',tone:'good',text:'回家的時候，媽媽煮了一桌我愛吃的菜。爸爸開了一瓶酒，說：「最近有比較好吧？」'})}}}
/* choices that cost or win goodwill */
{const dc=doChoice;doChoice=function(s,e,c){const fam0=s.famW,r=dc(s,e,c);if(s.cash===undefined||!r||typeof r.text!=='string')return r;
  if(c&&c.label==='自己照顧')famLikeAdd(s,10);
  if(e&&e.id==='house'&&s.house==='own'&&s._plan&&s._plan.fromFam>=1)famLikeAdd(s,-4);
  if(/是爸媽出的/.test(r.text)&&fam0>s.famW)famLikeAdd(s,-4);
  return r}}
/* a cold family weighs on you */
{const mt=moodTarget;moodTarget=function(s){let t=mt(s);if(s.famLike!==undefined&&parAlive(s)&&s.age>=16)t+=s.famLike<20?-6:s.famLike<35?-3:s.famLike>=80?2:0;return clamp(t,5,95)}}
