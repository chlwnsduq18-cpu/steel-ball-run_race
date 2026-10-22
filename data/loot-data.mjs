export function addLootData(D){
 const effect=(on,fx,to='self')=>({on,fx,to,limit:1});
 const timing={battleStart:'전투 시작',roundStart:'턴 시작',hit:'적중',hurt:'피격',defense:'방어 카드 사용'};
 const desc=rows=>rows.map(e=>timing[e.on]+': '+(e.to==='opponent'?'상대 ':'')+Object.entries(e.fx).map(([k,v])=>(D.keywords[k]?.n||'HP')+' +'+v).join(' · ')+(e.on==='battleStart'?' (전투당 1회)':' (턴당 1회)')).join(' / ');
 const gear=(id,n,slot,rows,stats={})=>D.items[id]={id,n,slot,stats,effects:rows,d:desc(rows),trophy:true,...(slot==='weapon'?{tuning:{max:3,on:'hit',fx:{charge:1}}}:{})};
 gear('trophy_gyro','회전 보조 장갑','charm',[effect('defense',{charge:2})]);
 gear('trophy_gyro_ball','손에 맞춘 회전용 철구','weapon',[effect('hit',{charge:1}),effect('hit',{rupture:1},'opponent')],{atk:4});
 gear('trophy_johnny','탄도 관측용 조준구','charm',[effect('hit',{rupture:2},'opponent')]);
 gear('trophy_diego','추격용 박차','charm',[effect('roundStart',{breath:2,charge:1})]);
 gear('trophy_hotpants','압박 치료 주머니','charm',[effect('roundStart',{hp:3})]);
 gear('trophy_mountain','매듭을 보강한 올가미','weapon',[effect('hit',{sink:2},'opponent'),effect('defense',{shield:3})],{atk:3,eva:1});
 gear('trophy_oye','방열 손잡이 투척탄','weapon',[effect('hit',{burn:2},'opponent')],{atk:4});
 gear('trophy_ringo','맞춤 결투용 리볼버','weapon',[effect('hit',{breath:2})],{atk:4});
 gear('trophy_ringo_sight','미세 조정 결투용 리볼버','weapon',[effect('hit',{breath:2}),effect('hit',{rupture:1},'opponent')],{atk:4});
 gear('trophy_sandman','발걸음 측정끈','charm',[effect('roundStart',{breath:2,shield:2})]);
 gear('trophy_blackmore','빗물막이 망토','charm',[effect('battleStart',{shield:12}),effect('roundStart',{hp:1})]);
 gear('trophy_wekapipo','사각 대응용 손목띠','charm',[effect('defense',{shield:3,charge:1})]);
 gear('trophy_wrecking','연습용 렉킹 볼','weapon',[effect('hit',{sink:3},'opponent'),effect('hit',{charge:1})],{atk:4});
 gear('trophy_magenta','다층 방호 조끼','charm',[effect('battleStart',{shield:18}),effect('hurt',{charge:2})]);
 gear('trophy_valentine','두 갈래 나침반','charm',[effect('defense',{breath:2}),effect('hit',{rupture:1},'opponent')]);
 gear('trophy_otherdiego','가벼운 결투용 나이프','weapon',[effect('hit',{breath:2}),effect('hit',{rupture:1},'opponent')],{atk:3,spd:1});
 const packageFor=id=>({id:'base',fx:{items:['trophy_'+id]}});
 D.bossLoot=Object.fromEntries(Object.keys(D.enemies).filter(id=>D.enemies[id].kind==='boss').map(id=>[id,{base:packageFor(id),variants:[]}]));
 D.bossLoot.gyro.base.form='steel';
 D.bossLoot.gyro.variants=[{id:'rotation',req:{any:['origin:steel','flag:spiral_practiced']},fx:{items:['trophy_gyro_ball']},form:'steel'}];
 D.bossLoot.wekapipo.variants=[{id:'satellite',req:'origin:satellite',fx:{items:['trophy_wrecking']}}];
 D.bossLoot.ringo.variants=[{id:'gunslinger',req:{any:['origin:marksman','weapon:revolver']},fx:{items:['trophy_ringo_sight']}}];
 const growWeapon=(id,n,stats,usage,at,profiles)=>{
  const it=gear(id,n,'weapon',profiles[0],stats);it.customName=true;it.levels=profiles;it.growth={counter:'use_'+id,usage,at};it.d='장착 중 '+(usage==='hit'?'공격 카드 적중':'공격 카드 사용')+' '+at.join(' / ')+'회에 성장합니다. 성장 효과는 다음 행동부터 적용됩니다.';
 };
 growWeapon('route_ironball','궤도를 맞춘 철구',{atk:4},'attack',[5,12],[
  [effect('hit',{charge:1})],
  [effect('hit',{charge:2}),effect('hit',{rupture:1},'opponent')],
  [effect('hit',{charge:3}),effect('hit',{rupture:2},'opponent')]
 ]);
 growWeapon('route_duelgun','결투장의 교정 리볼버',{atk:4,eva:1},'hit',[4,10],[
  [effect('hit',{breath:1})],
  [effect('hit',{breath:2}),effect('hit',{rupture:1},'opponent')],
  [effect('hit',{breath:3}),effect('hit',{rupture:2},'opponent')]
 ]);
 gear('route_bulwark','정비공의 방호 외투','charm',[effect('hurt',{shield:3}),effect('defense',{charge:2})]);
 D.items.duel_plan={id:'duel_plan',n:'총열 교정 도면',effects:[],d:'결투장 정비공과 함께 남긴 도면. 교정 작업을 이어갈 단서입니다.'};
 D.items.bulwark_mark={id:'bulwark_mark',n:'정비공의 표식',effects:[],d:'방호 장비를 맡긴 정비공의 표식. 다음 만남에서 돌려줄 물건입니다.'};
 const spiral=D.events.find(e=>e.id==='spiral_3');for(const c of spiral.c)c.ok.fx.items=['route_ironball'];spiral.guide+=' 어느 쪽을 선택하든 완성한 철구를 보관하며, 덱 전환을 거절해도 장비는 유지됩니다.';
 const choice=(l,t,fx,extra={})=>({l,ok:{t,fx},...extra});
 const add=(id,t,x,c,extra)=>D.events.push({id,t,x,c,where:['road','town','camp','explore'],from:3,to:9,once:true,priority:14,...extra});
 D.routes.push({id:'duelwork',n:'결투장의 교정',ending:'낯선 결투에서 얻은 단서를 자신의 무기에 새겼다.'},{id:'bulwark',n:'정비공의 약속',ending:'길 위에서 맺은 약속이 몸을 지킬 장비로 남았다.'});
 add('duelwork_1','결투장에 남은 정비공','모래 묻은 총열을 살피던 정비공이 결투 때 탄환이 스친 자리를 가리킨다. 쇠를 긁는 소리 사이로 자신의 손목이 흔들렸던 순간을 되짚는다.',[
  choice('정비공과 총열을 함께 살핀다','탄환이 지나간 길과 손목의 각도를 종이 위에 남겼다.',{item:'duel_plan',flag:'duelwork_started'}),
  choice('조언만 듣고 길을 나선다','짧은 조언을 기억하고 고삐를 쥐었다.',{hp:8,route:{id:'duelwork',result:'adapted'}})
 ],{req:['beat:ringo','noroute:duelwork','noflag:duelwork_started'],to:8});
 add('duelwork_2','도면 위의 한 발','정비공이 도면을 펼친 채 기다리고 있다. 새로 깎은 부품이 서로 맞물리고, 시험 표적에는 이전보다 작은 탄흔이 남는다.',[
  choice('교정한 총을 받아 든다','총을 쥔 손에 익숙한 균형과 달라진 무게가 함께 전해졌다.',{consumeItem:'duel_plan',items:['route_duelgun'],route:{id:'duelwork',result:'mastered'}},{cost:28}),
  choice('도면을 돌려주고 지금 무기를 유지한다','기존 무기를 다시 쥐고 손목의 흔들림을 가라앉혔다.',{consumeItem:'duel_plan',eva:1,route:{id:'duelwork',result:'adapted'}})
 ],{req:['flag:duelwork_started','item:duel_plan','noroute:duelwork'],after:{flag:'duelwork_started',ticks:1},guideTitle:'장비 안내',guide:'비용은 교정 리볼버를 구입할 때만 지불합니다. 새 무기는 보관되며 기존 장비와 덱은 유지됩니다.'});
 add('bulwark_1','마차 아래의 작업대','정비공이 찢어진 천과 얇은 철판을 작업대 위에 나란히 놓는다. 비바람과 충격을 견딘 흔적을 살피다가 당신에게 완성품을 맡아 줄 수 있는지 묻는다.',[
  choice('다음 초소에서 다시 만나기로 한다','정비공이 약속의 표시를 건넸다. 마차가 떠난 자리에도 쇠를 두드리는 소리가 남았다.',{item:'bulwark_mark',flag:'bulwark_started'}),
  choice('작업을 도와주고 먼저 떠난다','천을 붙잡아 주고 나서 불가에 앉아 굳은 어깨를 풀었다.',{hp:12,route:{id:'bulwark',result:'helped'}})
 ],{from:4,to:8,req:[{any:['beat:magenta','flag:shelter_shared']},'noroute:bulwark','noflag:bulwark_started']});
 add('bulwark_2','약속한 외투','다음 초소의 울타리에 두툼한 외투가 걸려 있다. 안감의 이음새에 약속할 때와 같은 표식이 남아 있고, 정비공이 말없이 먼지를 털어 준다.',[
  choice('표식을 돌려주고 외투를 받는다','오래 견딜 옷을 접어 안장 옆에 묶었다.',{consumeItem:'bulwark_mark',items:['route_bulwark'],route:{id:'bulwark',result:'delivered'}}),
  choice('외투를 남기고 정비공에게 여비를 받는다','필요한 몫을 건네받고 다음 길을 준비했다.',{consumeItem:'bulwark_mark',money:35,route:{id:'bulwark',result:'shared'}})
 ],{from:4,req:['flag:bulwark_started','item:bulwark_mark','noroute:bulwark'],after:{flag:'bulwark_started',ticks:1},guideTitle:'장비 안내',guide:'외투는 보관 후 직접 장착합니다. 장신구 칸을 사용하며 기존 장비는 보관됩니다.'});
}
