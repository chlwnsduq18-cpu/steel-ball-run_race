export function addExpandedBirthEconomy(D){
 const card=(id,n,c,fx,d)=>{D.cards[id]={n,c,t:'atk',hits:1,dice:1,b:0,hit:5,...fx,d,sbrId:id};return id;};
 const item=(id,n,d,effects=[],extra={})=>D.items[id]={id,n,d,effects,category:'quest',...extra};
 const effect=(on,to,fx)=>({on,to,fx,limit:1});
 const addHidden=(field,rows)=>{
  const table=D.birth.tables[field],total=rows.reduce((n,r)=>n+r.weight,0),common=table.filter(r=>!r.hidden);
  for(let i=0;i<total;i++)common[i%common.length].weight--;
  table.push(...rows.map(r=>({...r,hidden:true})));let end=0;
  for(const r of table){r.min=end+1;end+=r.weight;r.max=end;}if(end!==100)throw Error('invalid birth total '+field);
 };
 const traits=[
  {id:'golden_eye',n:'황금장방형의 감각',weight:1,fx:{startBreath:1,eva:1},t:'자연의 곡선에서 회전을 이어 갈 비율이 눈에 들어온다.',e:'시작 호흡 +1 · 회피 +1 · 전용 사건',item:'trait_golden_eye'},
  {id:'black_resolve',n:'칠흑의 의지',weight:1,fx:{maxHp:8,atk:1},t:'잃을 각오를 한 순간에도 자신의 결정을 바꾸지 않는다.',e:'최대 HP +8 · 공격 +1 · 전용 사건',item:'trait_black_resolve'},
  {id:'lucky_rider',n:'행운을 믿는 기수',weight:1,fx:{eva:2},money:25,t:'불안한 순간에도 자신에게 올 기회를 믿는다.',e:'회피 +2 · 시작 자금 +$25 · 전용 사건',item:'trait_lucky_rider'},
  {id:'palm_survivor',n:'악마의 손바닥 생환자',weight:1,fx:{maxHp:10},t:'길이 바뀌는 사막에서 돌아온 적이 있다. 몸은 아직 그 감각을 기억한다.',e:'최대 HP +10 · 전용 사건',item:'trait_palm_survivor'}
 ];
 for(const t of traits)item(t.item,t.n,'타고난 특성. 전용 사건에서 자신의 방식으로 다듬을 수 있다.',[],{category:'experience',birthTrait:true});
 addHidden('talents',traits);
 addHidden('flaws',[
  {id:'four_fear',n:'4라는 숫자에 대한 공포',weight:1,fx:{eva:-2},t:'네 번째 표식을 볼 때마다 손끝이 굳는다.',e:'회피 -2 · 극복 사건'},
  {id:'unforgiven',n:'떨쳐 내지 못한 죄책감',weight:1,fx:{maxHp:-8},t:'버리고 온 물건을 볼 때마다 지나간 선택이 떠오른다.',e:'최대 HP -8 · 과거와 마주하는 사건'}
 ]);
 const rare=[
  ['family_ball','체펠리 가문의 철구',2,{atk:2,eva:1},'기세를 싣는 철구',1,{hits:2,kw:[['charge',1,'s']]},'2회 공격 · 적중마다 기세 +1'],
  ['wrecking_ball','작은 철구를 품은 렉킹 볼',1,{eva:2},'갈라지는 작은 철구',1,{hits:2,kw:[['sink',1,'t']]},'2회 공격 · 적중마다 위축 +1'],
  ['clacker','크래커 볼레이',1,{spd:2},'교차하는 강철 구슬',1,{hits:2,kw:[['breath',1,'s']]},'2회 공격 · 적중마다 호흡 +1'],
  ['pluck','행운과 용기의 검',1,{atk:2,maxHp:4},'용기를 실은 참격',2,{hits:2,kw:[['rupture',1,'t']]},'2회 공격 · 적중마다 취약 +1']
 ];
 const weapons=rare.map(([id,n,weight,fx,cn,c,cf,d])=>{
  const cid=card('sbr_weapon_'+id,cn,c,cf,d),iid='weapon_'+id;
  const passive=id==='wrecking_ball'?effect('hit','opponent',{sink:1}):id==='clacker'?effect('hit','self',{breath:1}):id==='pluck'?effect('hit','opponent',{rupture:1}):effect('hit','self',{charge:1});
  const passiveText=id==='wrecking_ball'?'적중 시 상대 위축 +1 (턴당 1회)':id==='clacker'?'적중 시 호흡 +1 (턴당 1회)':id==='pluck'?'적중 시 상대 취약 +1 (턴당 1회)':'적중 시 기세 +1 (턴당 1회)';
  item(iid,n,passiveText,[passive],{slot:'weapon',wear:'손',category:'gear',stats:fx,weaponCard:cid,rare:true,price:125,from:3,basic:true,tuning:{on:'hit',fx:{charge:1},max:4}});
  return {id,n,weight,fx,card:cid,item:iid,t:'원작의 도구를 모티브로 한 희귀 시작 무기. 출신 덱은 유지한다.',e:Object.entries(fx).map(([k,n])=>(D.stats[k]||'최대 HP')+' +'+n).join(' · ')};
 });
 addHidden('weapons',weapons);D.birth.version=3;
 // Any newly acquired weapon provides its associated technique in storage (or cash).
 for(const w of D.birth.tables.weapons)if(D.items[w.item])D.items[w.item].weaponCard=w.card;
 const marketCards={market_winchester:'sbr_weapon_rifle',market_sabre:'sbr_weapon_sabre',market_duel_revolver:'sbr_weapon_revolver',rare_carbine:'sbr_weapon_rifle',rare_duel_blade:'sbr_weapon_sabre'};
 for(const [id,cid]of Object.entries(marketCards))D.items[id].weaponCard=cid;
 D.economy.market.rare.push(...weapons.map(w=>w.item));
 item('tailored_tack','체형에 맞춘 안장과 등자','전투 시작: 호흡 +2 · 보호막 +8',[effect('battleStart','self',{breath:2,shield:8})]);
 item('field_medical_care','의무원의 장거리 처치','전투 시작: 보호막 +12',[effect('battleStart','self',{shield:12})]);
 D.economy.supplies.field_dressing={n:'외상용 압박 붕대',price:18,carry:2,perStage:2,from:4,fx:{hp:32},d:'전투 중 HP +32. 다른 보급품과 합쳐 턴당 1개.'};
 D.economy.supplies.tool_roll={n:'예비 탄약과 현장 공구',price:22,carry:2,perStage:2,from:3,fx:{charge:4,shield:10},d:'전투 중 기세 +4 · 보호막 +10. 다른 보급품과 합쳐 턴당 1개.'};
 const lateWeapons=[['market_desert_carbine','사막용 카빈',3,76,{atk:3,eva:1},'sbr_weapon_rifle'],['market_light_lance','균형을 맞춘 기병창',6,106,{atk:3,spd:1},'sbr_weapon_lance'],['market_eastern_pistol','동부제 장총신 권총',8,128,{atk:4,eva:1},'sbr_weapon_revolver']];
 for(const [id,n,from,price,stats,weaponCard]of lateWeapons)item(id,n,'적중 시 호흡 +1 (턴당 1회)',[effect('hit','self',{breath:1})],{category:'gear',slot:'weapon',wear:'손',basic:true,stats,price,from,weaponCard,tuning:{on:'hit',fx:{charge:1},max:4}});
 Object.assign(D.items.weapon_shotgun,{price:60,from:3});
 D.economy.stockByStage[3].splice(0,2,'market_desert_carbine','weapon_shotgun');D.economy.stockByStage[6].splice(1,1,'market_light_lance');D.economy.stockByStage[8].splice(0,1,'market_eastern_pistol');
 D.economy.gear=[...new Set(Object.values(D.economy.stockByStage).flat())];
 D.economy.services=[
  {id:'tack_fit',n:'안장·등자 맞춤',from:2,price:65,once:true,fx:{item:'tailored_tack'},d:'전투 시작마다 호흡 +2 · 보호막 +8. 한 번 맞추면 이번 레이스 동안 유지.'},
  {id:'medical_fit',n:'장거리용 보호 처치',from:3,price:80,once:true,fx:{item:'field_medical_care',maxHp:8,hp:16},d:'최대 HP +8 · HP +16 · 전투 시작마다 보호막 +12. 레이스당 한 번.'}
 ];
 D.expandedBirth={traits:traits.map(t=>t.id),flaws:['four_fear','unforgiven'],weapons:weapons.map(w=>w.id)};
}
