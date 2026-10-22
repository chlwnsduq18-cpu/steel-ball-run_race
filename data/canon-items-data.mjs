// Korean lore references identify objects; numerical effects and OC encounters are adaptations.
export function addCanonItems(D){
 D.world.characters.gyro={n:'자이로 체펠리',role:'철구를 사용하는 레이스 참가자',source:'https://namu.moe/w/자이로%20체펠리'};
 const effect=(on,fx)=>({on,to:'self',fx,limit:1});
 const gear=(id,n,d,price,effects,extra={})=>D.items[id]={id,n,d,price,effects,category:'gear',slot:'charm',wear:'소지',from:1,...extra};
 D.economy.supplies.herb_tea={n:'허브티',d:'호흡 +3 · 기세 +3',price:16,from:1,carry:3,perStage:2,fx:{breath:3,charge:3}};
 D.economy.supplies.chamomile={n:'캐모마일을 섞은 허브티',d:'호흡 +5 · 기세 +5',price:24,from:4,carry:2,perStage:2,fx:{breath:5,charge:5}};
 gear('canon_zombie_thread','좀비말의 실','상처를 꿰매는 좀비말에서 나눈 실. 피격 시 HP +3 (턴당 1회)',180,[effect('hurt',{hp:3})],{from:3});
 gear('canon_ringo_watch','링고의 손목시계','결투의 간격을 기억하는 시계. 회피 +2 · 전투 시작: 호흡 +2',160,[effect('battleStart',{breath:2})],{stats:{eva:2},wear:'손목',from:3,trophy:true});
 gear('canon_catalog_bear','카탈로그의 곰인형','자이로가 살펴보던 카탈로그에서 주문한 곰인형. 전투 시작: 호흡 +2 · 보호막 +6',72,[effect('battleStart',{breath:2,shield:6})],{from:6});
 // Boss victory remains the only acquisition path; the watch carries no Stand power.
 for(const p of [D.bossLoot.ringo.base,...D.bossLoot.ringo.variants])p.fx.items.push('canon_ringo_watch');
 const choice=(l,t,fx={},extra={})=>({l,ok:{t,fx},...extra});
 const leave=()=>choice('자신의 여정을 계속한다','짐을 고쳐 묶고 다시 길에 올랐다.',{},{actionCost:0});
 D.events.push({id:'canon_zombie_mending',t:'상처를 잇는 실',x:'야영지에서 자이로가 말의 형상이 새겨진 돌 앞에서 실을 풀어 낸다. 그 실로 벌어진 상처를 꿰매자 출혈이 멎기 시작한다. 그는 당신에게 깨끗한 천과 물을 가져와 달라는 손짓을 한다.',from:3,to:8,where:['camp','road'],weight:4,once:true,actor:'gyro',req:['unbeaten:gyro','noitem:canon_zombie_thread'],guide:'사건 보상은 보관 장비로 지급합니다. 장착해야 효과가 적용됩니다.',c:[
  choice('물과 천을 챙겨 봉합을 돕는다','상처를 씻고 천을 붙잡아 봉합을 도왔다. 자이로는 다음 응급 처치에 쓰라며 좀비말의 실을 조금 나눠 주었다.',{item:'canon_zombie_thread',hp:16}),
  choice('자신의 상처부터 치료받는다','남은 실로 벌어진 상처를 꿰맸다. 말을 다시 탈 수 있을 만큼 몸이 가벼워졌다.',{hp:40}),leave()
 ]});
 D.events.push({id:'canon_bear_catalog',t:'야영지의 우편 주문서',x:'자이로가 펼쳐 놓은 카탈로그의 한쪽에는 곰인형이 그려져 있다. 그는 짐을 줄여야 한다면서도 그 페이지를 접지 못한다. 옆의 우편 취급인이 다음 초소에서 받을 주문을 적고 있다.',from:6,to:9,where:['camp','town'],weight:4,once:true,actor:'gyro',req:['unbeaten:gyro','noitem:canon_catalog_bear'],guide:'구입한 곰인형은 보조 장비로 보관합니다. 원작의 카탈로그 장면을 이용한 플레이어용 사건입니다.',c:[
  choice('같은 카탈로그에서 곰인형을 주문한다','자신의 이름으로 주문서를 작성했다. 다음 보급 마차에서 건네받은 작은 곰인형을 짐에 묶었다.',{item:'canon_catalog_bear'},{cost:72}),
  choice('주문 대신 모닥불 옆에서 쉬어 간다','카탈로그를 돌려주고 모닥불 가까이 자리를 잡았다. 짧은 휴식이 굳은 몸을 풀어 주었다.',{hp:18}),leave()
 ]});
 // Explicit appraisals for old birth/boss gear. No guessed price at transaction time.
 const appraisals={weapon_knife:24,weapon_lance:48,weapon_whip:32,weapon_lasso:32,weapon_hatchet:36,weapon_knuckles:32,compass:32,trophy_gyro:120,trophy_gyro_ball:160,trophy_johnny:120,trophy_diego:120,trophy_hotpants:120,trophy_mountain:140,trophy_oye:150,trophy_ringo:150,trophy_ringo_sight:170,trophy_sandman:120,trophy_blackmore:140,trophy_wekapipo:130,trophy_wrecking:160,trophy_magenta:160,trophy_valentine:160,trophy_otherdiego:160,route_bulwark:140};
 for(const[id,price]of Object.entries(appraisals))D.items[id].price=price;
 D.items.weapon_unarmed.tradable=false;
 // Apply markup once to fresh builder input, never to a restored player's state.
 for(const it of [...Object.values(D.items).filter(it=>it.slot&&it.price),...Object.values(D.economy.supplies)]){it.basePrice=it.price;it.price=Math.ceil(it.price*1.25);}
 // Direct NPC merchandise uses the same retail price, closing discounted resale loops.
 for(const id of ['race_gunsmith','race_norisuke','canon_bear_catalog'])for(const c of D.events.find(e=>e.id===id).c)if(c.cost&&c.ok.fx.item)c.cost=D.items[c.ok.fx.item].price;
 D.economy.supplies.field_dressing.outside=true;
 D.economy.trade={markup:1.25,sellRatio:0.5};
 D.canonItems={gear:['canon_zombie_thread','canon_ringo_watch','canon_catalog_bear'],supplies:['herb_tea','chamomile'],events:['canon_zombie_mending','canon_bear_catalog'],sources:['https://namu.moe/w/터스크(죠죠의%20기묘한%20모험)','https://namu.moe/w/자이로%20체펠리','https://namu.moe/w/맨덤','https://namu.moe/w/좀비말'],note:'물품의 출처만 원작을 따릅니다. 수치와 플레이어용 획득 장면은 게임에 맞춘 각색입니다.'};
}
