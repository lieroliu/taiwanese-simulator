/* ================= 國小同班同學 in the diary: now and then one of the five (engine/classmates.js) crosses your life ================= */
/* at most one classmate line a year, picked from what just happened to them; 同學會 every ten years or so from 30 */
const mName=m=>m.given.length>1?m.given:m.sur+m.given;
const mTa=m=>m.sex==='M'?'他':'她';
/* how news reaches you: in person while you are kids, later through other classmates, a group chat from the LINE years */
const mHear=s=>s.age<18?'':s.y>=2013?'國小同學的群組裡傳來消息，':s.y>=2009?'在臉書上看到，':'聽老同學說，';
const MATE_TALK={
  school:(s,m)=>s.studying?null:`${m.edu==='高中'?'考上高中的':'去讀'+m.edu+'的'}${mName(m)}，開學那天穿著新制服從我家門口經過。`,
  uni:(s,m)=>`${mHear(s)||'放榜那天，'}${mName(m)}考上了${m.uniCity}的大學。${s.edu==='大學'?'':'我想起國小的時候，'+mTa(m)+'的考卷都借我抄。'}`,
  job:(s,m)=>m.age0<18?`國中畢業典禮那天，${mName(m)}說下禮拜就要去${m.title.replace(/^在/,'').replace(/上班$/,'做事').replace(/^做事$/,'工作')}。${mTa(m)}笑得很開心，說以後${s.y<1990?'可以拿錢回家':s.y<2000?'可以自己買隨身聽':'可以自己買手機'}。`:null,
  marry:(s,m)=>s.age<20?null:s.married||s.age>m.marAge+1?`收到${mName(m)}的喜帖。喜酒上坐的一整桌都是國小同學，大家輪流說誰以前被罰站最多次。`
    :`收到${mName(m)}的喜帖。坐我旁邊的老同學一直問我，什麼時候換我。`,
  china:(s,m)=>`${mHear(s)}${mName(m)}去了${m.away}的台商工廠。${s.age>=25?'以前坐我隔壁的人，現在要管幾百個工人。':''}`,
  laid:(s,m)=>`${mName(m)}打電話來，${s.age>=25&&working(s)?'問我那邊還有沒有缺人。':'說被裁員了，想找人出來喝一杯。'}我們聊到很晚，誰都沒提國小的事。`,
  bust:(s,m)=>`${mName(m)}的店要收了。我去吃了最後一次，${mTa(m)}硬是不收我錢。`,
  house:(s,m)=>s.age<25?null:`${mHear(s)}${mName(m)}在${placeShort(m.housePlace)}買了房子。`+(s.house==='own'?'':s.y>=2009?'我滑過去，沒有按讚。':'我嘴上說恭喜，心裡算了一下自己的存款。'),
  abroad:(s,m)=>`${mName(m)}要搬去${m.moved}了。出發前${mTa(m)}約了幾個國小同學吃飯，說以後回來再約。`,
  divorce:(s,m)=>`${mHear(s)||'聽說'}${mName(m)}離婚了。`+(s.age<35?'':s.y>=2000?`我想傳個訊息給${mTa(m)}，打了幾個字又刪掉。`:`我想打電話給${mTa(m)}，拿起話筒又放下。`),
  die:(s,m)=>m.dyAge<15?`${mName(m)}很久沒來上學。老師說${mTa(m)}不會回來了，${mTa(m)}的位子空了一整個學期。`
    :`${mHear(s)||'聽說'}${mName(m)}走了，才 ${m.dyAge} 歲。${cyc(s,'mateDie',[`我翻出國小的畢業照，${mTa(m)}站在第二排，笑得眼睛都瞇起來。`,`我想起${mTa(m)}以前在走廊上跑給老師追的樣子。`,`我想起${mTa(m)}以前每天都把營養午餐的牛奶分給我。`,`告別式上來了好幾個國小同學，有幾個我已經叫不出名字。`])}`,
};
const MATE_P={school:.25,uni:.35,job:.5,marry:.3,china:.4,laid:.5,bust:.6,house:.25,abroad:.5,divorce:.3,die:.8};
function matesDiary(s){let said=false;
  for(const m of s.mates){const n0=m._seen||0;m._seen=m.log.length;
    for(const l of m.log.slice(n0)){if(said||!MATE_TALK[l.k]||!chance(MATE_P[l.k]))continue;m.age0=l.age;
      const t=MATE_TALK[l.k](s,m);if(!t)continue;said=true;
      qPush(s,{pri:l.k==='die'?2:0,cat:'生活',tone:['die','laid','bust','divorce'].includes(l.k)?'bad':l.k==='house'&&s.house!=='own'?'bad':'neutral',text:t});
      if(l.k==='die')fx(s,{lonely:3})}}
  /* 同學會: one every ten years or so, from 30 on, with whatever the others have become */
  if(!said&&s.age>=30&&s.age<80&&s.age%10===(s.mates[0].sur.charCodeAt(0)%3)&&!abroad(s)&&chance(.55)){
    const deadNm=new Set((s.people||[]).filter(q=>!q.alive).map(q=>q.given)),alive=s.mates.filter(m=>m.alive&&!deadNm.has(m.given)),gone=s.mates.filter(m=>!m.alive);if(alive.length<2)return;
    const a=pick(alive),b=pick(alive.filter(x=>x!==a));
    const news=m=>m.away?`在${m.away}當台幹`:m.moved?`從${m.moved}回來探親`:m.job==='退休'?'剛退休，整天去爬山':m.house&&chance(.5)?`在${placeShort(m.housePlace)}買了房，${pick(['一直在講房貸','說每個月都在幫銀行打工',s.y>=2009?'拿手機給大家看新家的照片':'拿出新家的照片給大家傳著看'])}`:m.kids>=2&&s.age<55?(s.y>=2009?'手機裡全是小孩的照片':'皮夾裡夾著小孩的照片，一直拿出來給大家看'):m.bust?'店收了以後換了工作':m.title?`還在${m.title.replace(/^在/,'').replace(/上班$/,'')}`:'還是老樣子';
    const na=news(a),nb=news(b);let t=`${s.y>=2013?'群組裡有人揪':'有人打電話來揪'}國小同學會。${na===nb?`${mName(a)}跟${mName(b)}都${na}`:`${mName(a)}${na}，${mName(b)}${nb}`}。`;
    if(gone.length)t+=`有人提起${mName(gone[0])}，桌上安靜了一下，又有人開始倒酒。`;
    else t+=cyc(s,'mateReu',s.age<45?['大家講起以前誰偷吃營養午餐的布丁，笑到隔壁桌一直看過來。','有人把國小的週記帶來，大家搶著唸別人寫的志願。','大家比誰的肚子大，最後一起去唱 KTV 唱到半夜。']
      :['散場的時候大家說明年再約，結果又是好幾年。','大家聊的都是血壓和膝蓋，聊到最後還是回到國小的那棵老榕樹。','有人提議一起回國小看看，校門口的柑仔店已經變成便利商店。']);
    qPush(s,{pri:0,cat:'生活',tone:'good',text:t});fx(s,{lonely:-4})}
}
{const y0=yearly;yearly=function(s){y0(s);if(s.dead||!s.mates)return;
  if(!s.f.mateIntro){s.f.mateIntro=1;const a=s.mates[0],b=s.mates[1];
    qPush(s,{pri:0,cat:'人生',tone:'good',text:`上小學的第一天，老師排座位，我坐在${mName(a)}旁邊。下課的時候，${mName(b)}跑過來問我要不要一起${s.y<1985?'去跳房子':s.y<2005?'去福利社':'去盪鞦韆'}。`});
    for(const m of s.mates)m._seen=m.log.length;return}
  matesDiary(s)}}
