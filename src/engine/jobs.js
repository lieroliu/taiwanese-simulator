/* ================= jobs: the specific occupation inside each job group, and its pay =================
   s.job stays the broad group (公司、工廠…) that events, mood and the map read; s.occ is the job title.
   Pay = average wage × that occupation's wage relative to the average (勞動部 職類別薪資調查 2021, OCCW)
       × a seniority curve (years worked, 估算) × bonus share × sex × education × region.
   Earlier years assume each occupation keeps its 2021 position relative to the average (估算). */
const EDU_LV={'國小':0,'國中':1,'高中':2,'高職':2,'五專':3,'大學':4,'碩士':5};
/* [title in the diary, row in the survey (or [ratio,bonus] when not surveyed), minimum education, weight, options]
   options: y0/y1 first/last year it exists, maj majors that lean to it, sx the sex most hired, early more common before 1990 */
const OCC_DEF={
 '公司':[['行政文書','一般辦公室事務人員(含文書)',2,40,{sx:'F'}],['會計助理','會計助理、簿記、出納',2,30,{sx:'F',maj:['商管']}],['會計','會計人員',3,8,{maj:['商管']}],
  ['業務','工商業銷售代表(含業務員)',2,33],['行銷企劃','廣告及行銷專業人員(含企劃)',4,8,{y0:1985,maj:['商管','文法']}],['人資','人力資源管理師',4,3,{y0:1990,maj:['商管','文法']}],
  ['採購','採購員',2,6],['秘書','專業秘書',3,3,{sx:'F'}],['客服','電話及網路客服人員',2,4,{y0:1995}],['保險業務員','保險代理人 (含保險業務員)',2,8,{y0:1985}],
  ['理財專員','證券金融交易員及經紀人 (含理財專員)',4,4,{y0:1995,maj:['商管']}],['銀行櫃員','銀行、郵局櫃台事務人員',2,5,{maj:['商管']}],['網管','資訊管理及維護技術員',3,5,{y0:1990,maj:['理工']}],
  ['平面設計','平面及多媒體設計師',3,2,{y0:1990}],['房仲','不動產經紀人',2,3,{y0:1985}],['報關','報關員(含報驗、船務人員)',2,1],['倉管','存貨事務人員',2,7]],
 '工廠':[['組裝作業員','組裝(現場)人員',0,50],['車床操作員','金屬工具機設定及操作人員',1,14,{sx:'M'}],['塑膠射出操作員','塑膠製品機械操作人員',0,7],['紡織女工','紡織及針織機械操作人員',0,6,{sx:'F',early:1,y1:2005}],
  ['車縫女工','縫製機械操作人員(含裁縫、刺繡)',0,5,{sx:'F',early:1}],['食品廠作業員','食品製造及處理人員(含酒類、飲料、製糖、菸葉)',0,9],['品管','品管技術員',2,8],['機械技術員','機械技術員(含造船、輪機、鑄造)',2,7,{sx:'M'}],
  ['電子技術員','電子技術員',2,7,{y0:1975}],['半導體廠作業員','半導體製品機械設備操作人員',2,9,{y0:1990}],['電路板廠作業員','印刷電路板製造工',1,6,{y0:1980}],['電焊工','焊接及切割人員(含電焊工、氣焊工)',0,5,{sx:'M'}],['包裝工','包裝機械操作人員',0,3]],
 '營造':[['水電師傅','建築物電力系統裝修人員(含水電工)',1,3],['泥作師傅','泥作工作人員',0,2],['模板工','模板人員',0,2],['鋼筋工','鋼筋彎紮人員',0,1],['木工師傅','營建木作人員',0,2],
  ['油漆師傅','油漆、噴漆人員(含裱糊工)',0,2],['吊車司機','推土、吊車、起重機等移運設備操作人員',1,4],['鷹架工','其他營建構造人員(含鷹架工)',0,2]],
 '服務':[['餐廳服務生','餐飲服務人員',0,17],['廚師','廚師',0,6],['店員','商店銷售人員(含百貨公司樓管人員)',1,27,{sx:'F'}],['超商店員','收銀員及售票員',1,6,{y0:1980}],['美髮師','美髮、美容及造型設計人員',0,3,{sx:'F'}],
  ['保全','建築物管理員、保全及警衛人員',1,10,{sx:'M',y0:1980}],['清潔人員','清潔及家事工作人員(含建築清潔工)',0,12],['貨車司機','小客、貨車駕駛人員',1,12,{sx:'M'}],['客運司機','大客、貨車駕駛人員',1,6,{sx:'M'}],
  ['外送員','機車送件駕駛人員',1,4,{y0:2015,sx:'M'}],['汽機車技師','車輛維修人員(含自行車、機車、汽車、火車)',1,6,{sx:'M'}],['看護','健康照顧人員(含看護、月子照護)',0,4,{sx:'F'}],['理貨員','理貨員',0,10],['加油站員工','加油站服務員',1,2]],
 '科技':[['電子工程師','電子工程師',4,7],['軟體工程師','軟體開發及程式設計師',4,7,{y0:1985}],['電機工程師','電機工程師',4,5],['系統分析師','資訊系統分析及設計師',4,3,{y0:1985}],
  ['機械工程師','機械工程師(含造船、輪機、鑄造)',4,4],['製程工程師','工管及生管工程師',4,2],['光學工程師','光學工程師',4,1,{y0:2000}]],
 '醫護':[['護理師','護理人員',3,17,{sx:'F'}],['藥師','藥事人員(含藥師)',4,3],['醫檢師','醫學及病理檢驗人員',4,1],['物理治療師','物理治療師',4,1,{y0:1985}],['醫師','醫師',4,2]],
 '公教':[['公務員',[1.15,1],2,6],['老師',[1.3,1],4,4,{maj:['師範']}]],
 '台幹':[['台商幹部','監督人員(含現場及辦公室主任、科/股長)',2,1]]};
const occRow=d=>Array.isArray(d[1])?d[1]:(OCCW[d[1]]||[1,1]);
function occPick(s){const L=OCC_DEF[s.job];if(!L)return null;const lv=EDU_LV[s.edu]??1;
  if(s.job==='公教')return L.find(d=>d[0]==='老師'&&s.major==='師範')||L.find(d=>d[0]===(s.edu==='大學'&&s.f.phdJob?'老師':'公務員'));
  if(s.job==='醫護'&&s.major==='醫護'&&lv>=4){if(s.study>=80&&chance(.35))return L.find(d=>d[0]==='醫師')}
  const ok=L.filter(d=>{const o=d[4]||{};return d[0]!=='醫師'&&lv>=d[2]&&(!o.y0||s.y>=o.y0)&&(!o.y1||s.y<=o.y1)});
  if(!ok.length)return L[0];
  return pickW(ok,d=>{const o=d[4]||{};let w=d[3];if(o.sx)w*=o.sx===s.sex?2.5:.4;if(o.maj)w*=o.maj.includes(s.major)?3:.6;if(o.early)w*=s.y<1990?2:s.y>2000?.4:1;
    if(lv>=4)w*=d[2]>=3?1.6:.8;else if(lv<=1)w*=d[2]<=0?1.5:.7;return w})}
/* years worked → share of the occupation's average pay (估算: a new hire earns about 68% of the average, peak about 113% after 25 years) */
/* 基本工資 (勞動部) in force that year, monthly NT$ */
const minW=y=>{let v=0;for(const k in MINW)if(+k<=y)v=MINW[k];return v||600};
const senF=x=>.68+.46*(1-Math.exp(-Math.max(0,x)/10));
function occSync(s){if(s._occJob===s.job)return false;const was=s._occJob;s._occJob=s.job;
  if(s.exp==null)s.exp=0;
  if(['失業','家管','退休'].includes(s.job)){return false}
  if(was&&was!==s.job&&!['失業','家管'].includes(was))s.exp*=.6;else if(was==='失業'||was==='家管')s.exp*=.5;
  const d=occPick(s);s.occ=d?d[0]:null;s._occD=d;return !!d}
const jobTitle=s=>s.occ&&OCC_DEF[s.job]&&!['失業','家管','退休'].includes(s.job)?s.occ:JOBLABEL[s.job];
myIncome=function(s){if(!s.job||s.studying)return 0;occSync(s);const W=wageY(s.y),lv=EDU_LV[s.edu]??1;
  let m;const d=s._occD&&OCC_DEF[s.job]&&s._occD;
  if(d){const [r,b]=occRow(d);m=r*(1+.3*(b-1))*senF(s.exp||0)*(lv>=5?1.12:lv>=4?1.06:lv<=1?.95:1)}
  else{m=JM[s.job]??.7;if(s.job==='退休'&&s.f.wasGJ)m=.65;if(s.job==='自營')m*=.6+R();if(!['退休','家管','失業'].includes(s.job))m*=(EDM[s.edu]||.9)*senF(s.exp||0)/1.0}
  if(s.age>=58&&!['退休'].includes(s.job))m*=.95;
  const v=W*m*(s.sex==='F'?(s.y<1990?.85:.92):1.02)*regM(s);
  return d&&s.job!=='台幹'?Math.max(v,minW(s.y)*13/1e4):v};
spIncome=function(s){const sp=spouse(s);if(!spWork(s))return 0;return wageY(s.y)*(JM[sp.job]??.7)*.95*senF(s.y-sp.by-23)*regM(s)};
{const y0=yearly;yearly=function(s){occSync(s);if(working(s)&&!s.studying)s.exp=(s.exp||0)+1;y0(s);if(working(s)&&s.occ&&OCC_DEF[s.job])s.lastOcc=s.occ}}
/* the first time a choice lands you in a new job, the diary names the title and the monthly pay */
{const dc=doChoice;doChoice=function(s,e,c){const before=s._occJob;const r=dc(s,e,c);
  if(r&&typeof r.text==='string'&&s.job!==before&&occSync(s)&&s.occ&&!s.studying){const mo=Math.max(minW(s.y),myIncome(s)*1e4/14.5);
    r.text+=`職稱是${s.occ}，一個月大約 ${mo>=1e4?(Math.round(mo/1e3)/10).toString()+' 萬':Math.round(mo/100)*100+' 塊'}。`}
  return r}}
