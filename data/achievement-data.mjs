export function addAchievementData(D){
 const add=(id,n,c,fx,d)=>{D.cards[id]={n,c,t:'atk',hits:1,dice:1,b:0,hit:5,...fx,d};return id;};
 const worldRush=add('sbr_reward_world_rush','THE WORLD · 연속 타격',2,{hits:3},'3회 공격 · 명중 +5');
 const worldShot=add('sbr_reward_world_shot','찰나의 사격',1,{hit:15,kw:[['charge',1,'s']]},'공격 · 명중 +15 · 적중 시 기세 +1');
 const spin=add('sbr_reward_tusk_spin','회전을 이어 가는 손톱탄',1,{kw:[['charge',2,'s']]},'공격 · 적중 시 기세 +2');
 const slip=add('sbr_reward_d4c_slip','D4C · 차원의 틈새',1,{turnStart:{eva:8},kw:[['charge',1,'s']]},'턴 시작부터 이번 턴 회피 +8 · 공격 · 적중 시 기세 +1');
 const pistol=add('sbr_reward_d4c_pistol','D4C · 사각의 총격',1,{hit:15,kw:[['rupture',1,'t']]},'공격 · 명중 +15 · 적중 시 취약 +1');
 // Technique templates retain legacy IDs; dedicated-deck-data.mjs sets current start recipes.
 const rows=[
  ['world','THE WORLD','멈춘 세계를 넘어','otherdiego',null,'평행세계의 디에고 격파','시간정지 · 연타 · 화상',[worldRush,'sbr_enemy_otherdiego','sbr_otherdiego_knife','sbr_otherdiego_wire',worldShot]],
  ['tusk','터스크','무한의 회전을 넘어','johnny','act4','터스크 ACT.4를 사용하는 죠니 격파','회전 · 취약 · 추적 탄흔',['sbr_johnny_nail','sbr_johnny_hole','sbr_johnny_hide','sbr_johnny_infinite',spin]],
  ['d4c','D4C','차원의 벽을 넘어','valentine',null,'퍼니 밸런타인 격파','협공 · 보호막 · 회피',['sbr_valentine_flag','sbr_enemy_valentine','sbr_valentine_love',slip,pistol]]
 ];
 D.achievements=[];D.achievementDecks={};
 for(const[id,n,title,enemy,form,condition,focus,bases]of rows){
  const type='reward_'+id,bundles=[];
  for(let lv=0;lv<4;lv++)bundles.push(bases.map((base,i)=>{
   const cid='sbr_'+type+'_'+i+'_'+lv,c=structuredClone(D.cards[base]);
   Object.assign(c,{n:c.n+' · '+D.stands.tiers[lv],stand:type,standLevel:lv,standSkill:i,standSkillName:D.cards[base].n,fixed:false});
   if(c.once)c.onceFamily=type+'_'+i;
   if(c.t==='atk')c.b=(c.b||0)+lv;else if(c.shield)c.shield+=lv*3;
   c.d+=(lv?' · 숙련 강화 +'+lv:'')+' · 전용 카드 사용으로 성장';D.cards[cid]=c;return cid;
  }));
  const item='stand_'+type;
  D.items[item]={id:item,n:'스탠드 · '+n,d:focus+' · 전용 공격 카드 사용으로 숙련 강화',stand:true,levels:Array.from({length:4},(_,lv)=>[{on:'battleStart',to:'self',limit:1,fx:id==='world'?{charge:1+lv}:id==='tusk'?{breath:1+lv}:{shield:3+lv*2}}])};
  D.stands.types[type]={id:type,n,form:focus,cards:bundles.map(x=>x[0]),bundles,item};
  D.achievementDecks[id]={id,n,focus,stand:type,deck:bundles[0].slice(),rewardPolicy:'cash',achievement:id};
  D.achievements.push({id,n:title,enemy,form,condition,deck:id,hidden:true});
 }
 // Distinct, short Korean lines for each Johnny action; repeated ACT.4 uses rotate.
 const q=D.quotes.johnny,game='https://namu.moe/w/'+encodeURIComponent('죠니 죠스타/죠죠의 기묘한 모험 올 스타 배틀 R');
 const tusk='https://seore.org/w/'+encodeURIComponent('터스크(죠죠의 기묘한 모험)');
 q.cardLines={
  sbr_enemy_johnny:[{text:q.text,source:q.source}],
  sbr_johnny_nail:[{text:'이제부터는 「터스크」라 부르겠어!',source:game}],
  sbr_johnny_hole:[{text:'회전은 「구멍」이 되고도 죽지 않아!',source:game},{text:q.text,source:q.source}],
  sbr_johnny_hide:[{text:'자신의 육체를 구멍 안으로 집어넣는다!',source:tusk}],
  sbr_johnny_infinite:[{text:'완전한 황금의 『회전 에너지』',source:game},{text:'오라오라오라오라오라오라오라오라오라오라오라!!!!',source:q.source},{text:'『제물』은... 어느 쪽이 될 것 같아?',source:game}]
 };
 q.cards=Object.keys(q.cardLines);
}
