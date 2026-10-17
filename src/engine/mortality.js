/* ================= mortality ================= */
function annualQ(s){
  const a=s.age,y=s.y;let q;
  if(a===0)q=lerp(.03,.004,clamp((y-1961)/45));
  else if(a<5)q=lerp(.004,.0003,clamp((y-1961)/40));
  else if(a<15)q=lerp(.0008,.00012,clamp((y-1961)/40));
  else if(a<25)q=.0009;
  else if(a<45)q=.0012+(a-25)*.0001;
  else q=.0032*Math.exp(.085*(a-45));
  if(a>=15)q*=Math.pow(.985,clamp(y-1980,-20,55));
  q*=s.sex==='M'?(a<15?1.15:a<75?1.6:1.3):1;
  q*=clamp(1+(60-s.health)/60,.6,2.5);
  if(!s.hbv&&a>=35&&a<75)q*=1.1;
  return Math.min(q,.6);
}
function causeOf(s){
  const a=s.age,y=s.y,heavy=['工廠','營造','農'].includes(s.job);let o;
  if(a<5)o=y<1980?[['肺炎',3],['腸胃炎',3],['早產與先天疾病',2],['意外',1]]:[['早產與先天疾病',4],['肺炎',1],['意外',1]];
  else if(a<15)o=[['溺水',3],['交通事故',3],['血癌',2],['疾病',2]];
  else if(a<35)o=[['機車事故',6],['自殺',2.5],['癌症',1.5],['職業災害',heavy?2:.3],['疾病',1]];
  else if(a<65)o=[['癌症',5],['肝病與肝癌',s.hbv?.6:2.5],['心臟病',2],['腦中風',1.5],['交通事故',1],['自殺',1],['糖尿病',.8],['口腔癌',s.sex==='M'&&heavy&&s.by<1990?1.2:0]];
  else o=[['癌症',5],['心臟病',3],['肺炎',2.5],['腦中風',2],['糖尿病',1],['失智與衰老',a>=80?3:.5]];
  return pickW(o,x=>x[1])[0];
}
function deathEntry(s,cause){
  s.dead=true;s.cause=cause;sample(s);
  const when=`民國 ${roc(s.y)} 年 ${s.m} 月`;let t,note;
  if(cause==='自殺'){t=`${when}，你在 ${s.age} 歲那年離開了這個世界。`;note='如果你或身邊的人正感到痛苦，請撥打 1925 安心專線，24 小時都有人接聽。'}
  else if(['機車事故','交通事故','職業災害','溺水','意外','921 大地震'].includes(cause))t=`${when}，你在一場${cause==='921 大地震'?'地震':cause}中離開人世，享年 ${s.age} 歲。`;
  else t=`${when}，你因為${cause}離開人世，享年 ${s.age} 歲。`;
  if(s.age<5)t=`${when}，你因為${cause}，在${s.age<1?'還不滿一歲':' '+s.age+' 歲'}的時候離開了。那個年代，這樣的事並不少見。`;
  return {cat:'終',death:1,text:t,note};
}

