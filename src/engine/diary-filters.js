/* remember which friends the diary has named, so a friend who first shows up borrowing money gets introduced */
{const seenFr=(s,t)=>{if(!t)return;for(const p of s.people)if(p.role==='friend'&&!p.shown&&t.includes(nm(p)))p.shown=1};
 /* the same diary line twice in one life (two dates that read alike, a second layoff told the same way) shows only the first time */
 const st0=step;step=function(s){const out=st0(s);const seen=s._said||(s._said=new Set());
  for(let i=out.length-1;i>=0;i--){const e=out[i],t=e.text||'';if(e.choices||e.death||t.length<=14)continue;if(seen.has(t))out.splice(i,1)}
  if(s.job==='公教')for(const e of out)if(e.text&&/老闆(一直call我|說景氣)/.test(e.text))e.text=e.text.replace('老闆一直call我','長官一直call我').replace('老闆說景氣','辦公室的同事說景氣');
  /* lines added by wrappers after the base step never got their month and age; the date header showed 民國 NaN 年 */
  for(const e of out){if(typeof e.t!=='number'||isNaN(e.t))e.t=s.t;if(typeof e.age!=='number')e.age=s.age}
  for(const e of out){seenFr(s,e.text);if(!e.choices&&e.text)seen.add(e.text)}return out};
 const dc0=doChoice;doChoice=function(s,e,c){const r=dc0(s,e,c);seenFr(s,r&&r.text);return r}}
