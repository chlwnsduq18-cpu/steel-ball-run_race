export function addUniqueEquipment(D){
 const add=(id,name,on,when,fx,to,description,extra={})=>{
  const it=D.items[id];if(!it?.rewardGrade)throw Error('Missing earned equipment: '+id);
  const effect={id:'unique_'+id,on,when,fx,to,limit:1,uniqueVersion:1,label:name,description,...extra};
  if(it.levels)for(const level of it.levels)level.push(structuredClone(effect));else it.effects.push(effect);
  it.uniqueDescription=name+' — '+description;it.d+=' / '+it.uniqueDescription;
 };
 add('trophy_gyro_ball','축적 회전','hit',{self:{charge:6}},{rupture:6},'opponent','적중 시 기세가 6 이상이면 6을 소비해 상대 취약 +6. 턴당 1회.',{consume:{charge:6}});
 add('route_ironball','이어지는 회전','hit',{self:{charge:5}},{rupture:5},'opponent','적중 시 기세가 5 이상이면 5를 소비해 상대 취약 +5. 턴당 1회.',{consume:{charge:5}});
 for(const id of ['trophy_ringo','trophy_ringo_sight','route_duelgun'])add(id,'단발 정밀 조준','hit',{singleHit:true},{breath:3,shield:6},'self','1회 타격 공격 카드 적중 시 호흡 +3·보호막 +6. 다단 공격에는 발동하지 않음. 턴당 1회.');
 add('trophy_mountain','틈을 묶는 매듭','hit',{opponent:{sink:2}},{rupture:5},'opponent','위축 2 이상인 상대에게 적중하면 취약 +5. 턴당 1회.');
 add('trophy_oye','남은 불씨','hit',{opponent:{burn:5},self:{charge:3}},{burn:4,rupture:3},'opponent','상대 화상 5 이상·내 기세 3 이상일 때 적중하면 기세 3 소비, 상대 화상 +4·취약 +3. 턴당 1회.',{consume:{charge:3}});
 add('trophy_hotpants','비상 압박 처치','hurt',{hpBelow:0.4},{hp:18,shield:10},'self','피격 후 HP 40% 이하이면 HP +18·보호막 +10. 전투당 1회, 치명상으로 쓰러진 뒤에는 발동하지 않음.',{battleLimit:1});
 add('trophy_magenta','버틴 뒤의 준비','hurt',{defended:true},{charge:5,shield:8},'self','이번 턴 방어 카드를 사용한 뒤 피해를 받으면 기세 +5·보호막 +8. 턴당 1회.');
 add('route_bulwark','수비에서 반격으로','hit',{defended:true},{rupture:5},'opponent','이번 턴 방어 카드를 사용한 뒤 적중하면 상대 취약 +5. 턴당 1회.');
 add('trophy_wrecking','틈을 넓히는 회전','hit',{opponent:{sink:3},self:{charge:4}},{rupture:6},'opponent','위축 3 이상인 상대에게 적중하면 기세 4를 소비해 취약 +6. 턴당 1회.',{consume:{charge:4}});
}
