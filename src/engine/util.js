/* ================= utilities ================= */
const R=Math.random;
const clamp=(v,a=0,b=1)=>Math.max(a,Math.min(b,v));
const lerp=(a,b,t)=>a+(b-a)*t;
const pick=a=>a[Math.floor(R()*a.length)];
const chance=p=>R()<p;
function shuffle(a){a=a.slice();for(let i=a.length-1;i>0;i--){const j=Math.floor(R()*(i+1));[a[i],a[j]]=[a[j],a[i]]}return a}
function pickW(arr,wf){let tot=0;const ws=arr.map(x=>{const w=Math.max(0,wf(x));tot+=w;return w});let r=R()*tot;for(let i=0;i<arr.length;i++){r-=ws[i];if(r<=0)return arr[i]}return arr[arr.length-1]}
const roc=y=>y-1911;

