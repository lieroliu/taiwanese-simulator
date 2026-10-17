/* ================= settle: the month's money, after every other step wrapper has run (engine/debt.js) ================= */
{const st0=step;step=function(s){cashMonth(s);const out=st0(s);cover(s);return out}}
{const dc=doChoice;doChoice=function(s,e,c){const r=dc(s,e,c);cover(s);return r}}
