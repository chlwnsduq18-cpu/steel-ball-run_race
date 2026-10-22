// A dedicated route changes available techniques. Legacy card IDs remain untouched.
export function addDeckGrowthData(D){
 D.deckGrowth={};
 const labels={tusk:['ACT.1','ACT.2','ACT.3','ACT.4'],world:['발현','정밀 제어','공격 연계','5초의 활용'],d4c:['차원의 틈','이웃 세계','평행세계의 협공','러브 트레인']};
 const effects={tusk:[{on:'hit',to:'opponent',fx:{rupture:1},limit:1},{on:'defense',to:'self',fx:{breath:2},limit:1},{on:'hit',to:'opponent',fx:{rupture:2},limit:1}],world:[{on:'battleStart',to:'self',fx:{charge:2},limit:1},{on:'hit',to:'self',fx:{breath:1},limit:1},{on:'roundStart',to:'self',fx:{charge:1},limit:1}],d4c:[{on:'roundStart',to:'self',fx:{shield:2},limit:1},{on:'hit',to:'opponent',fx:{rupture:1},limit:1},{on:'hurt',to:'self',fx:{shield:4},limit:1}]};
 const custom=(c,n,fx,d)=>{for(const k of ['skipTurns','heal','cleanseRand','shield','turnStart','eva','kw','spend','fixPer'])delete c[k];Object.assign(c,{t:'atk',hits:1,dice:1,b:0,hit:5},fx,{n,standSkillName:n,d});};
 for(const id of ['tusk','world','d4c']){
  const old=D.stands.types['reward_'+id],type='route_'+id,stages=labels[id],bundles=[];
  for(let lv=0;lv<4;lv++)bundles.push(old.bundles[lv].map((oldId,skill)=>{
   const c=structuredClone(D.cards[oldId]),cid='sbr_'+type+'_'+skill+'_'+lv;
   Object.assign(c,{stand:type,standLevel:lv,standSkill:skill,fixed:false});
   if(id==='tusk'){
    if(skill===1&&lv===0)custom(c,'지면을 깎는 손톱탄', {dice:2,kw:[['rupture',1,'t']]},'2d6 공격 · 취약 +1');
    if(skill===2&&lv<2)custom(c,'회전으로 흘리다',{t:'def',eva:12+lv*2,turnStart:{eva:12+lv*2}},'턴 시작부터 이번 턴 회피 +'+(12+lv*2));
    if(skill===3&&lv<3)custom(c,lv===0?'발톱탄의 연사':lv===1?'황금장방형의 손톱탄':'회전하는 구멍의 사선',{hits:lv===0?3:2,dice:lv===0?1:2,hit:lv===2?15:5,kw:[['rupture',1,'t']]},(lv===0?'3회 공격':'2회 × 2d6 공격')+' · 적중마다 취약 +1');
   }
   if(id==='world'){
    if(skill===1){c.c=lv?2:3;c.skipTurns=lv===3?2:1;c.d='상대 다음 '+c.skipTurns+'턴 행동 불가 · 전투당 한 번';}
    if(skill===2&&lv>=1){c.kw=[['bleed',2,'t']];c.d=c.hits+'회 공격 · 적중마다 출혈 +2';}
    if(skill===3&&lv>=2){c.kw=[['burn',3,'t']];c.d=c.hits+'회 공격 · 적중마다 화상 +3';}
   }
   if(id==='d4c'&&skill===1&&lv<2)custom(c,lv===0?'D4C · 깃발 뒤의 총격':'D4C · 이웃 세계의 사선',{hits:lv?2:1,dice:lv?1:2,hit:10},(lv?'2회 공격':'2d6 공격')+' · 명중 +10');
   if(id==='d4c'&&skill===2&&lv<3){custom(c,lv===0?'D4C · 틈새로 몸을 숨기다':'D4C · 이웃 세계의 교체',{t:'buff',shield:10+lv*4,once:true,...(lv?{heal:6+lv*2}: {})},'보호막 +'+(10+lv*4)+(lv?' · HP +'+(6+lv*2):'')+' · 전투당 한 번');}
   if(id==='d4c'&&skill===2&&lv===3){c.standSkillName='차원의 방벽';c.d='보호막 +'+c.shield+' · 전투당 한 번';}
   if(id==='tusk')c.standSkillName=c.standSkillName.replace(/^터스크 ACT\.\d · /,'터스크 · ');
   if(c.once)c.onceFamily=type+'_'+skill;
   c.n=c.standSkillName+' · '+stages[lv];
   c.d=c.d.replace(/ · 숙련 강화 \+\d| · 전용 카드 사용으로 성장/g,'');
   if(c.t==='atk'){c.b=Math.max(c.b||0,lv);if(lv)c.d+=' · 각 타격 피해 +'+c.b;}
   c.d+=' · 전용 사건으로 성장';D.cards[cid]=c;return cid;
  }));
  const item='stand_'+type;D.items[item]={...structuredClone(D.items[old.item]),id:item,d:D.achievementDecks[id].focus+' · 전용 사건으로 단계 성장'};
  D.stands.types[type]={id:type,n:old.n,form:old.form,cards:bundles.map(x=>x[0]),bundles,item,eventGrowth:true,stageNames:stages};
  Object.assign(D.achievementDecks[id],{stand:type,deck:bundles[0].slice()});
  const lesson='growth_lesson_'+id;
  D.items[lesson]={id:lesson,n:old.n+'의 전용 성장 기록',d:'전용 사건에서 익힌 공통 효과가 누적됩니다.',levels:[[],...effects[id].map((_,i)=>structuredClone(effects[id].slice(0,i+1)))]};
  D.deckGrowth[id]={id,n:old.n,type,legacyType:old.id,item:lesson,stages,uses:[2,5,9],from:[2,4,7],events:[1,2,3].map(n=>'growth_'+id+'_'+n)};
  D.routes.push({id:'growth_'+id,n:old.n+'의 깨달음',ending:'자신의 전용 능력에 숨은 가능성을 레이스 위에서 완성했다.'});
 }
 const stories={
  tusk:[
   ['계속 움직이는 탄흔','바위에 쏜 손톱탄이 작은 구멍을 남겼다. 탄환은 멎었는데 구멍의 가장자리는 아직 움직인다. 옆의 꽃잎과 말의 몸에서 같은 비율이 눈에 들어온다.','황금장방형을 따라 회전을 잇는다','손끝에서 끊기던 회전이 바위의 표면으로 이어졌다. 탄흔이 겨눈 곳을 향해 움직이기 시작한다.',4],
   ['자신을 향한 조준','추격을 피해 몸을 숨겼지만 벽 너머에서도 사선이 좁혀 온다. 손톱탄이 남긴 구멍의 안쪽으로 옷자락이 빨려 들어간다. 이번에 겨눌 곳은 바깥이 아니다.','망설임을 버리고 자신의 몸에 구멍을 연다','회전이 몸의 윤곽을 감싸고, 시야가 구멍의 안쪽으로 이어졌다. 조금 전까지 막혀 있던 길의 반대편에서 다시 고삐를 쥔다.',8],
   ['말이 선택한 보폭','황야를 달리는 말의 호흡이 안정된다. 억지로 재촉할 때와 다른 보폭이다. 손끝의 회전과 말이 대지를 차는 힘이 하나의 비율로 겹쳐진다.','말의 자연스러운 주행에 회전을 맞춘다','말의 힘이 손톱탄으로 이어진다. 회전은 탄흔의 안에 머물지 않고, 앞을 가로막은 틈을 끝까지 밀고 들어간다.',10]
  ],
  world:[
   ['멈춘 빗방울 사이','시간을 멈추자 흩어진 빗방울과 먼지가 허공에 매달린다. 손을 뻗을 곳은 여럿인데 움직임이 서로 겹친다. 아무렇게나 서둘러서는 짧은 틈을 낭비할 뿐이다.','나이프를 마련해 짧은 동선을 반복한다','같은 순간에 손이 지나갈 자리가 정리된다. 시간이 돌아왔을 때 서로 다른 사선의 나이프가 한꺼번에 날아갔다.',0],
   ['다시 움직일 순간의 함정','멈춘 세계에서 늘어뜨린 와이어는 그대로지만, 시간이 돌아오면 말발굽과 바람에 끌려간다. 기름이 흐를 자리까지 계산해야 한다.','시간이 돌아온 뒤의 움직임까지 엮는다','기름과 와이어가 서로의 사각을 메웠다. 상대가 반응하기 시작한 순간, 이미 다음 공격의 자리가 만들어져 있다.',6],
   ['오 초 안에 남긴 모든 것','멈춘 시간의 한계는 바뀌지 않는다. 다섯 초. 이제는 손을 뻗고 물러나는 순간까지 몸이 기억한다. 마지막 한 동작을 어디에 둘 것인지 고삐를 쥔 채 정한다.','다섯 초를 마지막 동작까지 사용한다','시간이 다시 흐른다. 던져 둔 나이프와 함정 사이를 자신의 다음 공격이 이어 간다. 한정된 순간을 남김없이 썼다.',9]
  ],
  d4c:[
   ['두 문 사이의 바람','맞닿는 문 사이로 깃발 자락이 끼어든다. 문틈을 넘은 손끝에 이쪽과 다른 바람이 닿는다. 틈을 넓히기보다 몸이 지나갈 정확한 순간을 잡아야 한다.','깃발과 문 사이로 몸을 통과시킨다','겹쳐진 두 면이 사각을 만들었다. 상대가 보던 자리와 자신의 몸이 나온 자리가 어긋난다.',5],
   ['이웃 세계의 발소리','낯익은 자신의 발소리가 문 너머에서 들린다. 같은 얼굴이 같은 방향으로 움직인다고 같은 결과에 이르는 것은 아니다. 이쪽과 저쪽의 사선을 겹쳐 본다.','이웃 세계의 자신과 공격 시점을 맞춘다','서로 다른 두 사선이 같은 빈틈을 겨눈다. 혼자서는 닿지 않던 방향으로 공격이 이어졌다.',4],
   ['유해가 만든 빛의 틈','물가의 마차 곁에서 루시 스틸을 발견한다. 성인의 유해와 결합한 그녀의 주위로 빛의 기둥이 뻗는다. 날아온 파편은 그 경계를 따라 비껴가고, D4C가 빛의 틈에 반응한다.','루시를 지키며 빛의 틈에 몸을 둔다','D4C가 빛의 틈과 겹쳐졌다. 자신에게 향하던 위협이 경계를 따라 밀려난다. 유해가 만든 현상을 자신의 차원 이동에 이어 붙였다.',12]
  ]
 };
 for(const [id,rows]of Object.entries(stories))rows.forEach(([t,x,l,done,hp],i)=>{
  const stage=i+1,key='growth_'+id+'_'+stage,defer='defer_'+key;
  const advance={advanceDeck:{deck:id,stage},...(hp?{hp:-hp}: {})};
  const c=[{l,ok:{t:done,fx:advance}}];
  if(id==='world'&&i===0)c[0].cost=12;
  if(id==='tusk'&&i===1||id==='d4c'&&i===1||id==='world'&&i===0)c.push({l:id==='tusk'?'공격의 궤적을 읽고 빠져나갈 길을 찾는다':id==='d4c'?'상대의 사각을 읽어 협공을 시도한다':'동작을 줄여 가진 도구로 시도한다',check:{s:id==='world'?'spd':id==='d4c'?'eva':'atk',dc:id==='tusk'?55:50},ok:{t:done,fx:{advanceDeck:{deck:id,stage}}},fail:{t:'노린 방향은 찾았지만 몸이 따라가지 못했다. 자세를 추스르고 다시 시도할 기회를 기다린다.',fx:{hp:-3,flag:defer}}});
  c.push({l:'지금은 몸을 추스르고 다음 기회를 기다린다',ok:{t:'눈앞의 현상을 기억에 남기고 몸을 추슬렀다. 준비를 갖추면 다시 시도할 수 있을 것이다.',fx:{hp:6,flag:defer}}});
  D.events.push({id:key,t,x,from:D.deckGrowth[id].from[i],to:9,where:['road','explore','camp','town'],req:{stand:{types:[D.deckGrowth[id].type,D.deckGrowth[id].legacyType],growthStage:i,minUses:D.deckGrowth[id].uses[i]}},c,once:false,weight:5,priority:12,deckGrowth:id,after:{flag:defer,ticks:3,optional:true},guideTitle:'전용 성장 안내',guide:'성공하면 전용 능력과 성장 기록이 강화됩니다. 장착·보관한 카드의 위치와 장수는 유지됩니다. 보류하거나 판정에 실패하면 여정을 세 행동 이어간 뒤 다시 기회를 얻을 수 있습니다.'});
 });
}
