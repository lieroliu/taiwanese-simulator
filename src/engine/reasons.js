/* ================= reasons: the character's surroundings vs. the choice ================= */
const VERB={'生':'生小孩','不生':'不生小孩','買':'買房','買（貸三十年）':'背房貸買房','買（新青安四十年）':'用新青安買房','住家裡':'住在家裡','理工':'讀理工','商管':'讀商管','文法':'讀文法','醫護':'讀醫護','師範':'讀師範','退休':'退休','見面，然後結婚':'跟對方見面、結婚','不要':'拒絕'};
function verbOf(id,label){if(label==='先不要')return id==='marry'?'先不結婚':'先不生';return VERB[label]||label}
const near=s=>s.urban?'我家附近':'我們村子裡';
function ctxFor(s,id){
  const low=s.pjob==='農'||s.pjob==='工'||s.inc==='低', educated=s.pjob==='公教'||s.pjob==='白領';
  switch(id){
  case 'after10':
    if(s.y<1985&&s.money<45)return {text:'班上只有開診所那家的孩子去補習。其他人放學後，不是回家幫忙，就是在外面玩到天黑',norm:['回家幫忙','跟朋友到處玩']};
    if(s.y>=1985&&s.urban)return {text:'班上一大半的同學，放學後都去補習',norm:['去補習班','學才藝']};
    if(s.pjob==='農')return {text:'鄉下的孩子放學後，多半要幫忙家裡',norm:['回家幫忙']};
    return {text:'班上有人去補習，也有人回家幫忙',norm:[]};
  case 'm15':
    if(s.sex==='F'&&s.by<=1975&&(s.inc==='低'||s.pjob==='農'))return {text:'家裡希望我早點去工作，讓家裡的男孩繼續讀書',norm:['去工作']};
    if(s.by<=1975&&(!s.urban||s.inc==='低'))return {text:'隔壁的阿兄國中一畢業就去工廠上班了，班上也有一半的人不打算升學',norm:['去工作','讀高職']};
    if(s.study>=65&&(educated||s.inc==='高'))return {text:'老師和爸媽都覺得，我該拚一間好高中',norm:['考高中']};
    if(s.y>=2001)return {text:'幾乎所有同學都會繼續升學',norm:['考高中','讀高職','讀五專']};
    return {text:'同學有人考高中，有人讀高職，也有人準備工作',norm:[]};
  case 'uni':{const r=uniRate(s.y);
    if(s.sex==='F'&&s.by<=1975&&!s.urban)return {text:`阿嬤說女孩子讀那麼多書要做什麼，${near(s)}也沒有一個女生讀大學`,norm:['直接去工作']};
    if(low&&r<.5)return {text:`${near(s)}很少有人讀過大學，爸媽也希望我早點賺錢`,norm:['直接去工作']};
    if(r>=.8)return {text:'班上每個人都在填志願，不考的話，連老師都會來問為什麼',norm:['考大學']};
    if(educated)return {text:'爸媽都是讀過書的人，一直希望我考上大學',norm:['考大學']};
    return {text:'身邊的同學，一半準備考大學，一半準備工作',norm:[]}}
  case 'retake':
    if(educated||s.inc==='高')return {text:'爸媽說一定要讀大學，南陽街的補習班擠滿了跟我一樣落榜的人',norm:['重考一年']};
    return {text:'家裡已經供我讀到高中，不太想再花錢讓我重考',norm:['去工作']};
  case 'major':
    if(s.pjob==='公教'&&s.by<=1985)return {text:'爸媽說師範公費、畢業就有工作，最穩',norm:['師範']};
    if(s.study>=75)return {text:'大家都說，成績好就該讀醫科或理工',norm:['醫護','理工']};
    return {text:'親戚都說讀商管比較好找工作，讀文法沒出路',norm:['商管']};
  case 'uniloc':
    if(s.money<35)return {text:'台北的房租和生活費不便宜，家裡負擔得很吃力',norm:['留在家鄉附近']};
    if(s.ax.self<40)return {text:'爸媽希望我留在身邊',norm:['留在家鄉附近']};
    return {text:'同學很多都往台北跑',norm:['北上讀書']};
  case 'loc':
    if(regionOf(s.place)==='北')return {text:'身邊有朋友去澳洲打工度假，回來都說像換了一個人，但大部分人還是直接找工作',norm:['留在台北']};
    if(!s.urban)return {text:'家鄉的工作機會越來越少，年輕人一個個往北走',norm:['北上打拼']};
    return {text:'家鄉也有工作，只是薪水比台北少一截',norm:['留在家鄉']};
  case 'job':
    if(s.pjob==='公教')return {text:'爸媽說公家機關最穩，跟他們一樣就好',norm:['考公職','去學校教書']};
    if(s.major==='理工'&&s.y>=1995)return {text:'理工畢業的同學，大多進了科學園區',norm:['進科學園區']};
    if(s.y>=1992&&s.y<=2010&&s.ax.risk>55)return {text:'以前的同事去了東莞，過年回來開的是新車',norm:['去中國當台幹']};
    if(['國中','高職'].includes(s.edu))return {text:'身邊的朋友，大多進了工廠',norm:['進工廠']};
    if(s.pjob==='農')return {text:'爸媽年紀大了，田需要人接手，可是同學都去了都市',norm:['進工廠','進公司上班']};
    return {text:'大家都想找一份穩定的工作',norm:['考公職','進公司上班']};
  case 'foreignwife':return {text:'村子裡好幾個跟我一樣的男人，都娶了外籍配偶',norm:['見面，然後結婚']};
  case 'marry':
    if(s.by<=1980&&s.age>=28)return {text:'家裡催了好幾年，親戚也一直問',norm:['結婚']};
    if(s.age<25)return {text:'我還很年輕，身邊的朋友都還在玩',norm:['先不要']};
    if(s.by>=1985)return {text:'身邊很多朋友都還沒結婚，也沒打算結',norm:['先不要']};
    return {text:'身邊的朋友陸續結婚了',norm:['結婚']};
  case 'kid':
    if(s.kids){if(s.by<=1975)return {text:'長輩說只有一個孩子太孤單',norm:['再生一個']};return {text:'一個孩子的開銷就已經很吃緊',norm:['一個就好']}}
    if(s.by<=1980)return {text:'每次回家，長輩一開口就是「什麼時候生？」',norm:['生']};
    if(s.y>=2010)return {text:'養一個孩子要花多少錢，我們算過好幾次，身邊很多夫妻都不生',norm:['先不要','不生']};
    return {text:'身邊的朋友陸續有了孩子',norm:['生']};
  case 'house':{const hi=myIncome(s)+spIncome(s);
    if(hi>0&&housePrice(s)/hi>=12)return {text:'我看了一間房子，總價是我十幾年的薪水。身邊的同齡人很多都不看了',norm:['繼續租']};
    if(s.y<1995)return {text:'爸媽常說「有土斯有財」，每次去親戚家，大家聊的都是誰又買了房',norm:['買','買（貸三十年）']};
    return {text:s.y>=2023?'身邊的朋友都在搶新青安':'身邊的朋友陸續買了房',norm:['買','買（貸三十年）','買（新青安四十年）']}}
  case 'layoff':
    if(s.age>=45)return {text:'這個年紀，履歷投出去常常石沉大海。身邊失業的人，很多都開了早餐店',norm:['開早餐店','轉行']};
    return {text:'我還年輕，大家都勸我趕快找下一份工作',norm:['找同樣的工作']};
  case 'move':
    if(s.ax.risk>50)return {text:'工廠裡很多同事都跟著去了',norm:['跟過去']};
    return {text:'家人都在台灣，我很難想像一個人去對岸',norm:['留在台灣']};
  case 'parentill':
    if(s.by<=1975)return {text:'親戚說，把爸媽交給外人照顧，會被鄰居說閒話',norm:['自己照顧']};
    return {text:'身邊很多人都請了外籍看護',norm:['請外籍看護']};
  case 'divorce':
    if(s.y<1995)return {text:'親戚都勸我忍，說離婚的事傳出去，整條街都會知道',norm:['撐下去']};
    return {text:'身邊已經有好幾個朋友離婚了，他們都說不必勉強',norm:['離婚']};
  case 'retire':
    if(s.money<35)return {text:'我的存款不夠養老',norm:['繼續工作']};
    return {text:'同齡的人陸續退休了',norm:['退休']};
  case 'old':
    if(s.kids&&s.by<=1975)return {text:'我爸媽老了，也是跟我們住的',norm:['跟孩子住']};
    if(s.kids)return {text:'孩子工作忙，家裡也不大',norm:['自己住','住安養中心']};
    return {text:'我沒有孩子可以依靠',norm:['自己住','住安養中心']};
  }
  return null;
}
function reasonLine(s,id,label,ctx){
  if(!ctx)return '';const v=verbOf(id,label);
  if(!ctx.norm.length)return `${ctx.text}，我決定${v}。`;
  return ctx.norm.includes(label)?`${ctx.text}，所以我也決定${v}。`:`${ctx.text}，但我還是決定${v}。`;
}
function polWhy(s,st,txt){
  if(st==='in'){if(s.studying==='大學')return '身邊的同學一個拉一個，我也跟著去了。';if(s.ax.rebel>65)return '我一向受不了被壓著的感覺。';if(s.eng>55)return '這些事我關心很久了。';return '我也說不清為什麼，就是想去看看。'}
  if(st==='sym'){if(s.kids)return '我心裡支持，但家裡有孩子要顧，走不開。';if(s.money<35)return '我心裡支持，但請一天假就少一天工錢。';if(s.fam==='受難者家屬')return '我心裡支持，但家裡的經驗讓我不敢靠太近。';return '我心裡支持，但還沒有勇氣走出去。'}
  if(txt.includes('政治'))return '';
  if(s.fam==='受難者家屬')return '家裡的事讓我明白，有些事最好不要碰。';
  if((s.pjob==='公教'||s.eth==='外省')&&s.ax.rebel<50)return '我從小聽大人說，不要碰政治。';
  if(s.money<35)return '光是生活就讓我喘不過氣，沒有力氣管這些。';
  if(s.kids)return '我有家要顧，這些事離我太遠。';
  return '';
}

