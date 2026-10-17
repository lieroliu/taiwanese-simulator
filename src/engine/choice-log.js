/* ================= choice log: what the character decided, and what people around them chose ================= */
/* s.ch keeps every choice from a popup: id, title, label, age, year, whether it failed, and the peer norm at that moment.
   The end page lists them; later diary lines can call back to them. */
{const d0=doChoice;doChoice=function(s,e,c){const ctx=ctxFor(s,e.id),age=s.age,y=s.y;const r=d0(s,e,c);
  (s.ch=s.ch||[]).push({id:e.id,title:e.title||'',label:c.label,age,y,fail:!!r.fail,norm:ctx&&ctx.norm?ctx.norm.slice():[]});return r}}
