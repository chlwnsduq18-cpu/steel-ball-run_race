// Earned equipment has a larger budget than purchased equipment. Shared triggers
// and keywords remain the only combat mechanism; the objects do not grant Stands.
export function addRewardEquipment(D){
 const effect=(on,fx,to='self')=>({on,fx,to,limit:1});
 const hit=fx=>effect('hit',fx),foe=fx=>effect('hit',fx,'opponent');
 const reward=(id,grade,stats,effects,extra={})=>{
  const it=D.items[id];if(!it?.slot)throw Error('Missing reward equipment: '+id);
  if(it.slot==='weapon')it.weaponStatsBefore040={...it.stats};
  Object.assign(it,{rewardGrade:grade,stats,effects,...extra});
  const timing={battleStart:'전투 시작',roundStart:'턴 시작',hit:'적중',hurt:'피격',defense:'방어 카드 사용'};
  it.d=effects.map(e=>timing[e.on]+': '+(e.to==='opponent'?'상대 ':'')+Object.entries(e.fx).map(([k,v])=>(D.keywords[k]?.n||'HP')+' +'+v).join(' · ')+(e.on==='battleStart'?' (전투당 1회)':' (턴당 1회)')).join(' / ');
  return it;
 };
 reward('trophy_gyro','boss',{atk:4},[hit({charge:3}),effect('defense',{charge:4,breath:2})]);
 reward('trophy_gyro_ball','boss',{atk:9,eva:2},[hit({charge:3}),foe({rupture:3})]);
 reward('trophy_johnny','boss',{atk:5,eva:2},[foe({rupture:4}),hit({breath:2})]);
 reward('trophy_diego','boss',{spd:5,eva:2},[effect('roundStart',{breath:2,charge:3})]);
 reward('trophy_hotpants','boss',{maxHp:16},[effect('roundStart',{hp:7,shield:3})]);
 reward('trophy_mountain','boss',{atk:8,eva:3},[foe({sink:2}),hit({charge:3}),effect('defense',{shield:7})],{weaponDice:{die:8,add:1}});
 reward('trophy_oye','boss',{atk:10},[foe({burn:5}),hit({charge:2})]);
 reward('trophy_ringo','boss',{atk:9,eva:2},[hit({breath:3,charge:2})]);
 reward('trophy_ringo_sight','boss',{atk:10,eva:3},[hit({breath:3,charge:2}),foe({rupture:2})]);
 reward('trophy_sandman','boss',{spd:4,eva:4},[effect('roundStart',{breath:2,shield:6})]);
 reward('trophy_blackmore','boss',{eva:4},[effect('battleStart',{shield:36}),effect('roundStart',{hp:3,shield:3})]);
 reward('trophy_wekapipo','boss',{atk:3,eva:3},[hit({shield:4,charge:2}),effect('defense',{shield:7,charge:3})]);
 reward('trophy_wrecking','boss',{atk:10,eva:2},[foe({sink:3}),hit({charge:4})],{weaponDice:{die:8,add:1}});
 reward('trophy_magenta','boss',{maxHp:20},[effect('battleStart',{shield:45}),effect('hurt',{charge:4,shield:4})]);
 reward('trophy_valentine','boss',{maxHp:16,eva:4},[effect('battleStart',{shield:24}),effect('defense',{breath:3,shield:6}),foe({rupture:3})]);
 reward('trophy_otherdiego','boss',{atk:11,spd:4},[hit({breath:3,charge:3}),foe({rupture:3})]);
 // A wristwatch is precision equipment, not Mandom's time reversal.
 reward('canon_ringo_watch','boss',{eva:5,spd:2},[effect('battleStart',{breath:4}),effect('roundStart',{charge:2})]);
 const rotation=[
  [hit({charge:2}),foe({rupture:1})],
  [hit({charge:4}),foe({rupture:2})],
  [hit({charge:6}),foe({rupture:4})]
 ];
 const gun=[
  [hit({breath:2,charge:1})],
  [hit({breath:3,charge:2}),foe({rupture:2})],
  [hit({breath:4,charge:4}),foe({rupture:4})]
 ];
 for(const[id,stats,levels]of [['route_ironball',{atk:9,eva:2},rotation],['route_duelgun',{atk:10,eva:3},gun]]){
  const it=reward(id,'route',stats,levels[0],{levels});
  it.d='장착 중 '+(it.growth.usage==='hit'?'공격 카드 적중':'공격 카드 사용')+' '+it.growth.at.join(' / ')+'회에 성장합니다. 단계별 적중 효과가 강화되며 다음 행동부터 적용됩니다.';
 }
 reward('route_bulwark','route',{maxHp:12},[effect('battleStart',{shield:24}),effect('hurt',{shield:6}),effect('defense',{charge:3})]);
 reward('spring_kit','route',{maxHp:12,eva:2},[effect('battleStart',{shield:32}),effect('roundStart',{shield:4})]);
 reward('canon_zombie_thread','event',{},[effect('hurt',{hp:5})]);
}
