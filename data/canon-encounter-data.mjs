// Canonical affiliations inform route conditions. Encounter timing remains random.
export function addCanonEncounterData(D){
 const aides=['porkpie','eleven','ringo','blackmore','wekapipo','magenta','disco'];
 // Clue-only turns and invented anonymous gatekeepers are no longer encounters.
 for(const e of D.events.filter(e=>e.id.startsWith('clue_'))){e.retired=true;e.retiredClue=true;e.x='단서 없이 해당 인물과 직접 조우하는 방식으로 변경되었습니다.';e.c=[{l:'여정으로 돌아간다',actionCost:0,ok:{t:'레이스를 이어 간다.',fx:{}}}];}
 const scenes={
  gyro:'두 개의 철구를 찬 자이로 체펠리가 말을 세운다. 같은 길을 달리던 기수와 눈이 마주쳤다.',
  johnny:'죠니 죠스타가 앞서 달리던 말의 고삐를 당긴다. 서로의 진로가 겹친 자리에서 기수가 당신을 돌아본다.',
  diego:'디에고 브란도가 실버 불렛을 몰아 능선을 내려온다. 앞자리를 놓고 두 말의 간격이 좁아진다.',
  hotpants:'가축이 지나는 길목에서 핫 팬츠와 마주쳤다. 작은 분사기를 쥔 손이 멈추고 당신을 경계하는 시선이 돌아온다.',
  mountain:'마운틴 팀이 말 위에서 밧줄을 거둔다. 길을 살피던 기수는 당신이 다가오자 몸을 돌린다.',
  oye:'오예코모바가 길을 가로막았다. 그가 건드린 물건에서 작은 핀이 떨어지고, 익숙한 길목이 위험한 장소로 바뀐다.',
  ringo:'같은 과수원의 집 앞을 몇 번째 지나쳤다. 링고 로드어게인이 문을 열고 나와 시계와 권총을 확인한다.',
  sandman:'말보다 빠른 발소리가 곁을 스친다. 샌드맨이 걸음을 멈추고, 당신과 거리를 둔 채 돌아선다.',
  blackmore:'갑자기 쏟아진 비 속에서 가면을 쓴 블랙모어가 내려다본다. 허공에 멈춘 빗방울 위로 그의 발이 움직인다.',
  wekapipo:'웨카피포가 위성탄이 박힌 철구를 꺼낸다. 자이로의 것과는 다른 철구가 그의 손에서 회전한다.',
  magenta:'마젠트 마젠트가 산탄총을 들고 길을 막는다. 땅에 손을 짚을 수 있는 자리를 살피며 당신의 움직임을 기다린다.',
  valentine:'퍼니 발렌타인이 성조기를 거둔다. 대통령 측의 습격을 넘어온 당신 앞에, 마침내 그 지시를 내린 인물이 서 있다.',
  otherdiego:'발렌타인을 쓰러뜨린 뒤에도 레이스는 끝나지 않았다. 실버 불렛을 탄 디에고가 나타나고, 다음 순간 주변의 움직임이 끊긴다.'
 };
 for(const b of D.hiddenBosses){
  b.req=b.id==='valentine'?['beat:'+aides.join('|')]:b.id==='otherdiego'?['beat:valentine']:[];
  b.omen=scenes[b.id];
 }
 for(const b of D.namedEncounters)b.req=[];
 // A combat victory opens a route, not an obligatory next fight or extra event.
 D.encounterLinks=[
  {from:aides,to:'valentine',text:'대통령 측의 습격에서 살아남았다. 이 싸움의 배후를 마주할 가능성이 열렸다.'},
  {from:['valentine'],to:'otherdiego',text:'대통령과의 대결은 끝났다. 그러나 결승선을 향한 길에는 아직 뜻밖의 상대가 남아 있다.'}
 ];
 D.canonEncounterSources=[
  {url:'https://namu.moe/w/포크%20파이%20해트%20꼬마',fact:'정부가 보낸 발렌타인 측 자객. 레이스 참가자와 구분한다.'},
  {url:'https://namu.moe/w/블랙모어',fact:'대통령 측근과 고용 암살자들을 구분하며, 모두 대통령 측 루트에 연결한다.'},
  {url:'https://namu.moe/w/웨카피포',fact:'발렌타인에게 고용되었고 마젠트 마젠트와 함께 습격한다.'},
  {url:'https://namu.moe/w/디에고%20브란도(평행세계)',fact:'발렌타인의 마지막 수로 등장하며, 발렌타인 격파 이후에 조우한다.'},
  {url:'https://seore.org/w/오예코모바',fact:'자이로를 노리는 참가자이며 대통령의 고용 암살자로 분류하지 않는다.'}
 ];
 const junction=D.events.find(e=>e.id==='junction_4');
 junction.c[2].hint='회피 +1 · 흔적 탐색';
 for(const e of D.events.filter(e=>!e.retired))for(const c of e.c)for(const result of [c.ok,c.fail].filter(Boolean))if(['route_mountain','route_blackmore'].includes(result.fx.flag))delete result.fx.flag;
 D.journeySource.note='원작 참가자와 암살자는 직접 무작위 조우한다. 대통령은 실제 대통령 측 인물과의 승리로 루트가 열리고, 평행세계 디에고는 대통령 격파 이후에만 등장한다. 두 후반 인물의 최소 구간은 유지한다. 무명 추적자 선행 전투는 없다.';
}
