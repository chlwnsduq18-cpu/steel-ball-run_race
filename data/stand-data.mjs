export function addStandData(D){
 D.stands={choices:['force','rapid','special'],need:[0,5,15,30],tiers:['발현','성장','진화','완성'],types:{},source:{engine:'src/engine.js setEgo / egoGrow / egoNameErr',config:'src/config.js egoGrow.need [0,5,15,30]',world:'https://namu.moe/w/악마의%20손바닥'},note:'진화 단계와 전용 카드 수치는 팬게임용 각색입니다.'};
 const types=[
  ['force','파워형 스탠드','파워형',{hits:1,dice:3,hit:5,spend:3,fixPer:2,kw:[['rupture',1,'t']]},'1회 × 3d6 · 기세 최대 3 소비 · 소비당 피해 +2 · 적중 시 취약 +1','battleStart',{charge:2}],
  ['rapid','스피드형 스탠드','스피드형',{hits:3,dice:1,hit:0,spdDice:[8,1],kw:[['breath',1,'s']]},'3회 × 1d6 · 속도 8 이상: 주사위당 피해 +1 · 적중마다 호흡 +1','roundStart',{breath:1}],
  ['special','특수능력형 스탠드','특수능력형',{hits:1,dice:2,hit:10,turnStart:{eva:6},kw:[['rupture',2,'t'],['sink',2,'t']]},'턴 시작 회피 +6 · 1회 × 2d6 · 적중 시 취약 +2 · 위축 +2','battleStart',{shield:4}],
  ['ranged','파 호라이즌','원거리 정밀형',{hits:2,dice:1,hit:15,kw:[['bleed',1,'t']]},'2회 × 1d6 · 명중 +15 · 적중마다 출혈 +1','battleStart',{breath:2}],
  ['guard','스틸 하트','방어 반격형',{hits:1,dice:2,hit:5,turnStart:{eva:6},hitShield:4},'턴 시작 회피 +6 · 1회 × 2d6 · 적중 시 보호막 +4','battleStart',{shield:6}]
 ];
 const register=(id,n,form,base,d,on,fx)=>{
  const cards=[];
  for(let lv=0;lv<4;lv++){
   const cid='sbr_stand_'+id+'_'+lv,c={c:2,t:'atk',hits:1,dice:1,b:0,hit:5,...structuredClone(base),n:(base.n||n)+' · '+D.stands.tiers[lv],fixed:!['force','rapid','special','ranged','guard'].includes(id),stand:id,standSkill:0,standLevel:lv};
   c.b=(base.b||0)+lv*2;c.d=d+(lv?' · 각 타격 피해 +'+lv*2:'')+' · 전용기 사용으로 성장';D.cards[cid]=c;cards.push(cid);
  }
  const levels=Array.from({length:4},(_,lv)=>[{on,fx:Object.fromEntries(Object.entries(fx).map(([k,v])=>[k,v+lv])),to:'self',limit:1}]);
  D.items['stand_'+id]={id:'stand_'+id,n:'스탠드 · '+n,d:form+' · 전용기 사용 5 / 15 / 30회에 진화합니다.',stand:true,levels};
  D.stands.types[id]={id,n,form,cards,item:'stand_'+id};
 };
 for(const x of types)register(...x);
 const skills={
  force:[['힘을 싣는 타격',1,{dice:2,hit:5,kw:[['charge',2,'s']]},'1회 × 2d6 · 적중 시 기세 +2'],['방어를 깨는 연격',2,{hits:2,hit:5,kw:[['rupture',2,'t']]},'2회 × 1d6 · 적중마다 취약 +2']],
  rapid:[['잔상을 남기는 견제',1,{hit:10,turnStart:{eva:10},kw:[['breath',1,'s']]},'턴 시작 회피 +10 · 1회 × 1d6 · 적중 시 호흡 +1'],['속도를 싣는 추격',2,{hits:2,hit:5,spdDice:[8,2]},'2회 × 1d6 · 속도 8 이상: 주사위당 피해 +2']],
  special:[['틈을 만드는 타격',1,{hit:15,kw:[['rupture',1,'t'],['sink',1,'t']]},'1회 × 1d6 · 적중 시 취약·위축 +1'],['약점을 찌르는 연격',2,{hits:2,hit:5,sinkDmg:2,kw:[['rupture',1,'t']]},'2회 × 1d6 · 상대 위축 3당 피해 +2 · 적중마다 취약 +1']]
 };
 for(const [id,rows]of Object.entries(skills)){
  const type=D.stands.types[id];type.bundles=type.cards.map(cid=>[cid]);
  rows.forEach(([n,c,fx,desc],i)=>{for(let lv=0;lv<4;lv++){
   const cid='sbr_stand_'+id+'_skill'+(i+1)+'_'+lv;
   D.cards[cid]={n:n+' · '+D.stands.tiers[lv],c,t:'atk',hits:1,dice:1,b:lv,...structuredClone(fx),stand:id,standSkill:i+1,standSkillName:n,standLevel:lv,fixed:false,d:desc+(lv?' · 각 타격 피해 +'+lv:'')+' · 스탠드 카드 사용으로 성장'};
   type.bundles[lv].push(cid);
  }});
 }
 for(const id of ['ranged','guard'])D.stands.types[id].legacy=true;
 // Wrecking Ball and the Zeppeli steel balls are Spin techniques, not Stands.
 const hidden={sword:['검에 깃든 스탠드','sbr_sword_slash'],thread:['실로 풀리는 스탠드','sbr_thread_bind'],colony:['군체형 스탠드','sbr_colony_shot'],pistols:['탄환을 이끄는 스탠드','sbr_pistol_shoot'],time:['시간에 간섭하는 스탠드','sbr_time_strike']};
 for(const [id,[n,cid]]of Object.entries(hidden)){
  const o=D.starts.find(o=>o.id===id),c=D.cards[cid];if(!c||!o.deck.includes(cid))throw Error('스탠드 전용기 참조 오류 '+id);
  register(id,n,o.form,c,c.d,'battleStart',{charge:1});D.stands.types[id].baseCard=cid;o.stand=id;
  o.deck[o.deck.indexOf(cid)]=D.stands.types[id].cards[0];
 }
 // Keep four independent birth rolls and sixteen talents. Awakening is a 3% talent.
 D.birth.version=2;
 const talents=D.birth.tables.talents,awakened=talents.find(x=>x.id==='recovery'),extra=awakened.weight-3;
 Object.assign(awakened,{n:'이미 각성한 정신',t:'레이스에 참가하기 전부터 자신의 스탠드를 다루어 왔다.',e:'자신의 스탠드로 출발 · 각성 카드는 보관함에서 직접 편성 · 턴마다 HP +1',weight:3,stand:true,hidden:true});talents[0].weight+=extra;
 let end=0;for(const t of talents){t.min=end+1;end+=t.weight;t.max=end;}
 // Ordinary attacks must not imply a Stand before awakening.
 D.cards.sbr_basic_strike.n='힘을 실은 타격';
 const result=(l,type)=>({l,hint:{force:'1회 × 3d6 · 기세를 소비해 피해 강화',rapid:'3회 × 1d6 · 속도 8 이상이면 추가 피해',special:'턴 시작 회피 +6 · 적중 시 취약·위축 +2'}[type],ok:{t:'낯선 형상이 자신의 의지에 응답했다. 남의 능력이 아닌, 자신의 정신이 모습을 드러냈다.',fx:{awakenStand:type}}});
 const leave={l:'지금은 안전한 길로 돌아간다',ok:{t:'이해할 수 없는 감각을 기억에 남기고 레이스로 돌아갔다.',fx:{hp:4,flag:'stand_declined'}}};
 const choices=()=>[
  result('파워형 · 강한 일격과 기세 소비','force'),
  result('스피드형 · 속도를 살리는 연속 타격','rapid'),
  result('특수능력형 · 취약·위축과 회피','special'),leave
 ];
 const event=(id,t,x,from,to,req,priority=0)=>({id,t,x,from,to,where:['road','explore','camp','town'],req:['noflag:stand_awakened','stand:eligible',...req],standAwakening:true,guideTitle:'각성 안내 · 카드 3장 보관',guide:'선택한 유형의 스탠드 카드 3장을 보관함으로 받습니다. 현재 덱은 유지됩니다. 이름과 대사는 선택 입력이며, 받은 카드는 덱에서 직접 편성할 수 있습니다.',once:true,weight:4,priority,c:choices()});
 D.events.push(
  event('stand_palm','악마의 손바닥','같은 바위를 몇 번이나 지나쳤다. 빠져나가려는 순간, 자신의 움직임과 겹쳐지는 또 하나의 형체가 보인다.',1,2,[],30),
  event('stand_echo','사라지지 않는 또 하나의 움직임','앞서 지나친 형체가 손끝과 함께 움직인다. 고삐를 쥔 손에 힘을 주자 흐릿했던 윤곽이 조금씩 선명해진다.',2,4,['flag:stand_declined'],25),
  event('stand_last_call','황야에서 되찾은 형체','먼지 너머에서 앞선 여정의 감각이 되살아난다. 외면했던 형체가 이번에는 자신의 그림자와 나란히 서 있다.',3,9,[],2)
 );
 Object.assign(D.events.find(e=>e.id==='stand_palm'),{fromTick:2,guaranteed:true});
 Object.assign(D.events.find(e=>e.id==='stand_echo'),{guaranteed:true});
 // Explicit timing data also supports an attack carrying a whole-turn bonus.
 for(const c of Object.values(D.cards))if(c.t==='def')c.turnStart={eva:c.eva||15,...(c.selfHit?{hit:c.selfHit}:{})};
}
