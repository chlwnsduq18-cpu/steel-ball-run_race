// A form selects a complete pool, not a list of cards appended to its predecessor.
// Shared techniques can remain, while its core and signature change.
export function addFormDecks(D){
 const add=(id,n,c,fx,d)=>{const key='sbr_'+id;D.cards[key]={n,c,t:'atk',hits:1,dice:1,b:0,hit:5,...fx,d,sbrId:key};return key;};
 const jHole=add('johnny_hole_strike','터스크 ACT.2 · 파고드는 탄흔',2,{hits:2,dice:2,spend:2,fixPer:1,kw:[['rupture',1,'t']]},'2회 × 2d6 공격 · 기세 최대 2 소비, 소비당 피해 +1 · 적중마다 취약 +1');
 const jPivot=add('johnny_pivot','손톱탄 · 비껴 쏘기',1,{hits:1,dice:2,turnStart:{eva:8}},'턴 시작부터 이번 턴 회피 +8 · 2d6 공격');
 const jExit=add('johnny_wormshot','터스크 ACT.3 · 사각에서 내미는 손',1,{hits:2,hit:12,turnStart:{eva:6}},'턴 시작부터 이번 턴 회피 +6 · 2회 공격 · 명중 +12');
 const jShift=add('johnny_shift','터스크 ACT.3 · 구멍을 옮기는 사격',1,{hits:1,dice:2,kw:[['shield',3,'s']]},'2d6 공격 · 보호막 +3');
 const jOra=add('johnny_ora','터스크 ACT.4 · 오라오라 러시',2,{hits:3,kw:[['rupture',1,'t']]},'3회 공격 · 적중마다 취약 +1');
 const gScan=add('gyro_scan_shot','스캔 · 사각을 꿰는 철구',1,{hits:2,hit:18,kw:[['rupture',1,'t']]},'2회 공격 · 명중 +18 · 적중마다 취약 +1');
 const gGolden=add('gyro_golden','말의 걸음에 싣는 회전',1,{hits:2,kw:[['charge',2,'s']]},'2회 공격 · 적중마다 기세 +2');
 const vRedirect=add('valentine_redirect','러브 트레인 · 넘어가는 불운',2,{hits:2,dice:2,kw:[['sink',2,'t']]},'2회 × 2d6 공격 · 적중마다 위축 +2');
 const vSlit=add('valentine_slit','러브 트레인 · 빛의 틈새',1,{hits:1,dice:2,turnStart:{eva:12}},'턴 시작부터 이번 턴 회피 +12 · 2d6 공격');
 const decks={
  johnny:{
   rider:[...D.enemies.johnny.forms[0].deck],
   act1:['sbr_johnny_nail','sbr_johnny_cut','sbr_rider_precision','sbr_rider_low','sbr_rider_flank','sbr_enemy_johnny'],
   act2:['sbr_johnny_nail','sbr_johnny_spin','sbr_johnny_track','sbr_johnny_hole',jHole,jPivot,'sbr_enemy_johnny'],
   act3:['sbr_johnny_track','sbr_johnny_hole','sbr_johnny_tunnel','sbr_johnny_hide',jExit,jShift,jPivot,'sbr_enemy_johnny'],
   act4:['sbr_johnny_hole','sbr_johnny_tunnel',jExit,jShift,'sbr_johnny_stride','sbr_johnny_persist','sbr_johnny_infinite',jOra,jPivot]
  },
  gyro:{
   rotation:[...D.enemies.gyro.forms[0].deck],
   scan:['sbr_gyro_throw','sbr_gyro_return','sbr_gyro_joint','sbr_gyro_aim','sbr_gyro_muscle','sbr_gyro_scan',gScan],
   ballbreaker:['sbr_gyro_throw','sbr_gyro_return','sbr_gyro_scan',gScan,'sbr_gyro_muscle','sbr_gyro_ballbreaker',gGolden,'sbr_gyro_joint']
  },
  valentine:{d4c:[...D.enemies.valentine.forms[0].deck],love:['sbr_valentine_flag','sbr_valentine_shot','sbr_valentine_strike','sbr_valentine_exchange','sbr_enemy_valentine','sbr_valentine_love','sbr_valentine_light',vRedirect,vSlit]}
 };
 for(const [id,forms]of Object.entries(decks))for(const f of D.enemies[id].forms)f.deck=forms[f.id];
 D.enemies.johnny.forms.find(f=>f.id==='act3').signature='sbr_johnny_tunnel';
 const copy=(who,to,from)=>{D.quotes[who].cardLines[to]=structuredClone(D.quotes[who].cardLines[from]);};
 copy('johnny',jHole,'sbr_johnny_hole');copy('johnny',jPivot,'sbr_enemy_johnny');
 copy('johnny',jExit,'sbr_johnny_hide');copy('johnny',jShift,'sbr_johnny_hole');
 D.quotes.johnny.cardLines[jOra]=[structuredClone(D.quotes.johnny.cardLines.sbr_johnny_infinite.at(-1))];
 copy('gyro',gScan,'sbr_gyro_scan');copy('gyro',gGolden,'sbr_gyro_throw');
 copy('valentine',vRedirect,'sbr_valentine_love');copy('valentine',vSlit,'sbr_valentine_flag');
 // The same inherited technique can use a different line after evolution.
 D.quotes.johnny.formCardLines={act4:{
  sbr_johnny_tunnel:[structuredClone(D.quotes.johnny.cardLines.sbr_enemy_johnny[1])],
  [jExit]:[structuredClone(D.quotes.johnny.cardLines.sbr_enemy_johnny[0])]
 }};
 const byCard=(who,mapping)=>{const q=D.quotes[who],lines=q.lines;delete q.lines;q.cardLines=Object.fromEntries(Object.entries(mapping).map(([id,indices])=>[id,indices.map(i=>({...lines[i],context:'기존에 확인한 한국어 대사를 해당 기술에 배치'}))]));};
 byCard('diego',{
  sbr_diego_pounce:[0,1],sbr_diego_claw:[0],sbr_diego_sense:[1],sbr_diego_tail:[0],sbr_diego_hunt:[1,2],sbr_diego_scales:[2],sbr_enemy_diego:[0,2],
  sbr_basic_rush:[1],sbr_basic_shoot:[1],sbr_basic_feint:[2],sbr_rider_precision:[1],sbr_rider_low:[2]
 });
 byCard('otherdiego',{
  sbr_enemy_otherdiego:[0],sbr_otherdiego_knife:[2],sbr_otherdiego_wire:[3],sbr_otherdiego_gun:[2],sbr_otherdiego_rush:[2,1],sbr_otherdiego_snare:[3],sbr_otherdiego_fuel:[1],sbr_otherdiego_ride:[1]
 });
 // Old wire card stays in saved fights, but is not part of the new pool.
 D.quotes.otherdiego.legacyCardLines={sbr_otherdiego_wire:D.quotes.otherdiego.cardLines.sbr_otherdiego_wire};
 delete D.quotes.otherdiego.cardLines.sbr_otherdiego_wire;
 byCard('ringo',{sbr_enemy_ringo:[2],sbr_ringo_duel:[0,1]});
 for(const id of ['johnny','gyro','valentine','diego','otherdiego','ringo'])D.quotes[id].cards=Object.keys(D.quotes[id].cardLines);
 for(const [id,forms]of Object.entries(decks))D.majorBossDecks.decks[id]=forms;
 D.majorBossDecks.version=2;
}
