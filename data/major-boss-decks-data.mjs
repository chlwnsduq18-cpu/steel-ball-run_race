// Enemy selection pools, separate from editable player achievement decks.
// All effects use the existing resolver; no private status vocabulary.
export function addMajorBossDecks(D){
 const add=(id,n,c,fx,d)=>{const key='sbr_'+id;D.cards[key]={n,c,t:'atk',hits:1,dice:1,b:0,hit:5,...fx,d,sbrId:key};return key;};
 const riderShot=add('rider_precision','기승 사격 · 조준점',1,{hits:2,hit:12},'2회 공격 · 명중 +12');
 const riderRush=add('rider_flank','측면으로 파고들다',1,{hits:2,kw:[['rupture',1,'t']]},'2회 공격 · 적중마다 취약 +1');
 const riderEvade=add('rider_low','말의 옆구리에 몸을 낮추다',1,{hits:1,dice:2,turnStart:{eva:8}},'턴 시작부터 이번 턴 회피 +8 · 2d6 공격');
 const jCut=add('johnny_cut','터스크 ACT.1 · 회전하는 손톱날',1,{hits:2,kw:[['bleed',1,'t']]},'2회 공격 · 적중마다 출혈 +1');
 const jSpin=add('johnny_spin','터스크 ACT.1 · 연속 손톱탄',1,{hits:2,kw:[['charge',1,'s']]},'2회 공격 · 적중마다 기세 +1');
 const jTrack=add('johnny_track','터스크 ACT.2 · 지면을 좇는 구멍',1,{hits:2,hit:18,kw:[['rupture',1,'t']]},'2회 공격 · 명중 +18 · 적중마다 취약 +1');
 const jTunnel=add('johnny_tunnel','터스크 ACT.3 · 구멍 너머의 사격',2,{hits:2,dice:2,turnStart:{eva:10},kw:[['rupture',1,'t']]},'턴 시작부터 이번 턴 회피 +10 · 2회 × 2d6 공격 · 적중마다 취약 +1');
 const jStride=add('johnny_stride','터스크 ACT.4 · 말의 황금 회전',1,{hits:2,kw:[['charge',2,'s']]},'2회 공격 · 적중마다 기세 +2');
 const jPersist=add('johnny_persist','터스크 ACT.4 · 멈추지 않는 회전',2,{hits:2,dice:2,spend:3,fixPer:2,kw:[['rupture',2,'t']]},'2회 × 2d6 공격 · 기세 최대 3 소비, 소비당 피해 +2 · 적중마다 취약 +2');
 const gReturn=add('gyro_return','손으로 돌아오는 철구',1,{hits:2,kw:[['rupture',1,'t'],['charge',1,'s']]},'2회 공격 · 적중마다 취약 +1 · 기세 +1');
 const gJoint=add('gyro_joint','관절에 전하는 회전',2,{hits:2,spend:2,fixPer:2,kw:[['sink',2,'t']]},'2회 공격 · 기세 최대 2 소비, 소비당 피해 +2 · 적중마다 위축 +2');
 const gAim=add('gyro_aim','황금장방형 · 꿰뚫는 철구',1,{hits:2,hit:12,kw:[['rupture',1,'t']]},'2회 공격 · 명중 +12 · 적중마다 취약 +1');
 const gMuscle=add('gyro_muscle','근육에 전하는 회전',1,{hits:1,dice:2,turnStart:{eva:8},kw:[['charge',1,'s']]},'턴 시작부터 이번 턴 회피 +8 · 2d6 공격 · 기세 +1');
 const dClaw=add('diego_claw','스케어리 몬스터즈 · 발톱',1,{hits:2,kw:[['bleed',2,'t']]},'2회 공격 · 적중마다 출혈 +2');
 const dSense=add('diego_sense','공룡의 감각 · 움직임을 읽다',1,{hits:1,dice:2,hit:15,kw:[['breath',1,'s']]},'2d6 공격 · 명중 +15 · 호흡 +1');
 const dTail=add('diego_tail','스케어리 몬스터즈 · 꼬리 강타',2,{hits:2,dice:2,kw:[['sink',2,'t']]},'2회 × 2d6 공격 · 적중마다 위축 +2');
 const dHunt=add('diego_hunt','스케어리 몬스터즈 · 추격',2,{hits:1,dice:2,breathDice:true,kw:[['bleed',1,'t']]},'2d6 공격 · 현재 호흡만큼 적중 피해 추가 · 출혈 +1');
 const dScale=add('diego_scales','비늘로 받아내는 습격',1,{hits:1,dice:2,kw:[['shield',4,'s']]},'2d6 공격 · 보호막 +4');
 const vShot=add('valentine_shot','D4C · 다른 세계에서의 총격',1,{hits:2,hit:12},'2회 공격 · 명중 +12');
 const vStrike=add('valentine_strike','D4C · 근거리 러시',2,{hits:2,dice:2,kw:[['rupture',1,'t']]},'2회 × 2d6 공격 · 적중마다 취약 +1');
 const vSide=add('valentine_side','D4C · 깃발 뒤의 사각',1,{hits:1,dice:2,turnStart:{eva:8}},'턴 시작부터 이번 턴 회피 +8 · 2d6 공격');
 const vCollision=add('valentine_collision','D4C · 겹쳐지는 두 세계',2,{hits:1,dice:3,spend:3,fixPer:4,kw:[['rupture',2,'t']]},'3d6 공격 · 기세 최대 3 소비, 소비당 피해 +4 · 취약 +2');
 const vExchange=add('valentine_exchange','D4C · 다른 자신과 교대',2,{t:'buff',heal:24,cleanseRand:2,once:true},'HP +24 · 출혈·취약·화상 중 무작위 1종의 중첩 -2 · 전투당 한 번');
 const vLight=add('valentine_light','러브 트레인 · 빛의 틈에서 쏘다',1,{hits:2,kw:[['shield',3,'s']]},'2회 공격 · 적중마다 보호막 +3');
 const oGun=add('otherdiego_gun','THE WORLD · 지근거리 총격',1,{hits:3,hit:10},'3회 공격 · 명중 +10');
 const oRush=add('otherdiego_rush','THE WORLD · 근거리 러시',1,{hits:3,kw:[['rupture',1,'t']]},'3회 공격 · 적중마다 취약 +1');
 const oWire=add('otherdiego_snare','THE WORLD · 와이어를 둘러치다',1,{hits:2,kw:[['sink',2,'t']]},'2회 공격 · 적중마다 위축 +2');
 const oFuel=add('otherdiego_fuel','기름을 끼얹고 성냥을 던지다',2,{hits:2,kw:[['burn',3,'t']]},'2회 공격 · 적중마다 화상 +3');
 const oRide=add('otherdiego_ride','실버 불릿 · 말 옆으로 숨다',1,{hits:2,turnStart:{eva:10}},'턴 시작부터 이번 턴 회피 +10 · 2회 공격');
 const decks={
  gyro:{rotation:['sbr_gyro_throw',gReturn,gJoint,gAim,gMuscle,'sbr_enemy_gyro'],scan:['sbr_gyro_throw',gReturn,gJoint,gAim,gMuscle,'sbr_enemy_gyro','sbr_gyro_scan'],ballbreaker:['sbr_gyro_throw',gReturn,gJoint,gAim,gMuscle,'sbr_enemy_gyro','sbr_gyro_scan','sbr_gyro_ballbreaker']},
  johnny:{rider:['sbr_basic_shoot','sbr_basic_aim',riderShot,riderRush,riderEvade],act1:['sbr_johnny_nail',jCut,jSpin,riderShot,riderEvade,'sbr_enemy_johnny'],act2:['sbr_johnny_nail',jCut,jSpin,jTrack,'sbr_johnny_hole',riderEvade,'sbr_enemy_johnny'],act3:['sbr_johnny_nail',jCut,jSpin,jTrack,'sbr_johnny_hole',jTunnel,'sbr_johnny_hide','sbr_enemy_johnny'],act4:['sbr_johnny_nail',jSpin,jTrack,'sbr_johnny_hole',jTunnel,'sbr_johnny_hide',jStride,jPersist,'sbr_johnny_infinite']},
  diego:{rider:['sbr_basic_rush','sbr_basic_shoot','sbr_basic_feint',riderShot,riderEvade],scary:['sbr_diego_pounce',dClaw,dSense,dTail,dHunt,dScale,'sbr_enemy_diego']},
  valentine:{d4c:['sbr_valentine_flag',vShot,vStrike,vSide,vCollision,vExchange,'sbr_enemy_valentine'],love:['sbr_valentine_flag',vShot,vStrike,vSide,vCollision,vExchange,'sbr_enemy_valentine','sbr_valentine_love',vLight]},
  otherdiego:{base:['sbr_otherdiego_knife',oGun,oRush,oWire,oFuel,oRide,'sbr_enemy_otherdiego']}
 };
 for(const [id,forms]of Object.entries(decks)){
  const e=D.enemies[id];
  if(e.forms){for(const f of e.forms)f.deck=forms[f.id];e.deck=[...e.forms[0].deck];e.signature=e.forms[0].signature;}
  else e.deck=forms.base;
 }
 D.enemies.otherdiego.signatureEvery=2;
 // Preserve existing once identity and prior saved card objects.
 const q=D.quotes.johnny;
 const lesson4={text:'『Lesson 4』경의를 표해라.',source:D.quotes.gyro.cardLines.sbr_gyro_scan[0].source,context:'사용자 지정 문구. 자이로의 Lesson 4를 되새기는 ACT.3 연출'};
 q.cardLines.sbr_johnny_hide=[lesson4];
 const link=(who,to,from)=>{D.quotes[who].cardLines[to]=structuredClone(D.quotes[who].cardLines[from]);};
 for(const id of [jCut,jSpin])link('johnny',id,'sbr_johnny_nail');
 link('johnny',jTrack,'sbr_johnny_hole');link('johnny',jTunnel,'sbr_johnny_hide');
 for(const id of [jStride,jPersist])link('johnny',id,'sbr_enemy_johnny');
 for(const id of [gReturn,gJoint,gAim,gMuscle])link('gyro',id,id===gAim?'sbr_gyro_scan':'sbr_gyro_throw');
 for(const id of [vShot,vStrike,vSide,vCollision,vExchange])link('valentine',id,id===vCollision||id===vStrike?'sbr_enemy_valentine':'sbr_valentine_flag');
 link('valentine',vLight,'sbr_valentine_love');
 for(const id of ['johnny','gyro','valentine'])D.quotes[id].cards=Object.keys(D.quotes[id].cardLines);
 D.quotes.diego.cards=[...decks.diego.scary];
 D.quotes.otherdiego.cards=[...decks.otherdiego.base];
 D.representativeQuotes.johnny.push(lesson4);
 D.majorBossDecks={version:1,ids:Object.keys(decks),decks,note:'적의 무작위 행동 후보. 플레이어의 업적 시작 덱과 별도.'};
}
