// Original situations, adapted around the player's own route through the race.
export function addCorpseJourney(D){
 const firstEvent=D.events.length;
 const effect=(on,to,fx)=>({on,to,fx,limit:1});
 const item=(id,n,d,effects=[],extra={})=>D.items[id]={id,n,d,effects,category:'quest',...extra};
 const choice=(l,t,fx={},extra={})=>({l,ok:{t,fx},...extra});
 const leave=(l='지금은 관여하지 않는다')=>choice(l,'자신이 정한 길을 따라 말을 돌렸다.',{}, {actionCost:0});
 const route=(id,result)=>({id,result});
 const add=(id,t,x,from,to,req,c,extra={})=>{
  const triggers=req.filter(r=>typeof r==='string'&&/^(flag|item):/.test(r));
  const e={id,t,x,from,to,req,c,where:['road','explore','camp','town'],weight:5,once:true,...(triggers.length?{followup:{triggers}}:{}),...extra};D.events.push(e);return e;
 };
 item('saint_trail','유해가 가리킨 길','움직이는 사막에서 얻은 흔적. 전투 시작: 기세 +2',[effect('battleStart','self',{charge:2})]);
 item('saint_left_arm','성인의 좌완부','왼팔에 융합한 유해. 전투 시작: 보호막 +12 · 호흡 +1',[effect('battleStart','self',{shield:12,breath:1})]);
 item('saint_resolve','유해를 놓은 뒤의 결심','유해의 소유보다 자신의 선택을 믿었다. 적중 시 기세 +1 (턴당 1회)',[effect('hit','self',{charge:1})],{category:'experience'});
 item('corpse_cover','유해 운반용 이중 안낭','몸통 · 전투 시작: 보호막 +18',[effect('battleStart','self',{shield:18})],{category:'gear',slot:'armor',wear:'몸통',price:90,from:4});
 item('spring_gifts','샘에서 받은 금과 유해','금·귀중품과 성인의 양쪽 귀·오른팔. 해질녘까지 정당한 거래로 전부 처분해야 한다. 일반 자금과 별도 보관.');
 item('spring_wine','남겨진 와인 한 병','유해를 놓아주고 무사히 샘의 시련을 마쳤다. 전투 시작: 호흡 +3',[effect('battleStart','self',{breath:3})],{category:'experience'});
 item('spring_kit','샘의 재물로 맞춘 여행 장비','몸통 · 전투 시작: 보호막 +20',[effect('battleStart','self',{shield:20})],{category:'gear',slot:'armor',wear:'몸통',from:4,price:140});
 item('sbr_spare_rifle','윈체스터 현장 정비총','무기 · 공격 +4 · 적중 시 기세 +1',[effect('hit','self',{charge:1})],{category:'gear',slot:'weapon',wear:'손',stats:{atk:4},basic:true,from:3,price:105,weaponCard:'sbr_weapon_rifle',tuning:{on:'hit',fx:{charge:1},max:4}});
 item('commission_ball','정비공이 맞춘 회전용 철구','무기 · 공격 +3 · 회피 +1 · 적중 시 호흡 +1',[effect('hit','self',{breath:1})],{category:'gear',slot:'weapon',wear:'손',stats:{atk:3,eva:1},basic:true,from:3,price:115,weaponCard:'sbr_weapon_family_ball',tuning:{on:'hit',fx:{charge:1},max:4}});
 item('merchant_sabre','노리스케의 교역용 기병도','무기 · 공격 +3 · 속도 +1 · 적중 시 기세 +1',[effect('hit','self',{charge:1})],{category:'gear',slot:'weapon',wear:'손',stats:{atk:3,spd:1},basic:true,from:4,price:110,weaponCard:'sbr_weapon_sabre',tuning:{on:'hit',fx:{charge:1},max:4}});
 D.routes.push(
  {id:'saint_path',events:['saint_palm','saint_arm','saint_hotpants','saint_agents','saint_lucy'],n:'성인의 유해를 둘러싼 선택',ending:'유해를 손에 넣은 뒤, 힘을 어디에 맡길지 스스로 결정했다.'},
  {id:'spring_trial',events:['spring_offer','spring_barter'],n:'슈거 마운틴의 샘',ending:'손에 들어온 재물을 놓아주고 샘의 시련에서 벗어났다.'},
  {id:'weapon_order',n:'대회 정비공의 주문',ending:'자신의 손에 맞는 무기를 골라 남은 레이스를 달렸다.'}
 );
 add('saint_palm','악마의 손바닥이 지나간 자리','지도에 있던 능선이 등 뒤로 사라졌다. 같은 모래 언덕을 돌아 나왔는데 말굽 자국은 당신보다 앞서 있다. 바위 틈의 희미한 빛이 왼팔 안쪽에서 맥박처럼 되울린다.',2,5,['noroute:saint_path','noflag:saint_started'],[
  choice('바뀌는 지형을 따라 빛의 근원을 찾는다','길이 바뀌는 순간을 눈으로 좇았다. 팔 안쪽의 감각을 잊지 않도록 남은 물과 지도를 챙겼다.',{item:'saint_trail',flag:'saint_started'}),
  choice('물과 장비를 보충하고 흔적을 조사한다','물통을 채우고 등자끈을 고쳐 맸다. 모래 속에서 드러난 흔적을 따라갈 준비가 되었다.',{item:'saint_trail',flag:'saint_started',hp:20},{cost:18}),
  choice('이상 지대를 벗어나 레이스로 돌아간다','낯선 빛을 뒤로하고 익숙한 말굽 자국을 골랐다.',{route:route('saint_path','declined')},{actionCost:0})
 ],{guide:'원작의 악마의 손바닥과 유해를 바탕으로 한 선택형 이야기입니다. 기존 스탠드와 덱은 유지됩니다.'});
 add('saint_arm','왼팔 안쪽의 낯선 뼈','왼팔에 낯선 뼈의 윤곽이 떠오른다. 피부를 뚫고 나오려는 것이 아니라, 오래전부터 거기에 있었던 것처럼 몸과 겹쳐진다. 황야 너머로 보이지 않던 길이 잠깐 모습을 드러낸다.',2,9,['flag:saint_started','noroute:saint_path','noflag:saint_carried'],[
  choice('유해를 몸에 받아들이고 그 길을 기억한다','낯선 윤곽이 팔 안쪽으로 가라앉았다. 유해가 다른 무언가를 향해 이끈다는 것을 느꼈다.',{item:'saint_left_arm',flag:'saint_carried',hp:12}),
  choice('이 흔적은 남기되 더는 유해를 좇지 않는다','팔에서 빠져나온 윤곽을 모래 위에 내려놓았다. 자신이 걸어 나온 길의 감각만은 남았다.',{item:'saint_resolve',consumeItem:'saint_trail',route:route('saint_path','released')})
 ]);
 add('saint_hotpants','크림 스타터와 유해','핫 팬츠의 시선이 당신의 왼팔에서 멈춘다. 살점처럼 움직이는 분사구를 내보인 그는, 유해를 노리는 이들이 참가자만은 아니라는 사실과 자신 역시 그것을 회수하고 있다는 뜻을 전한다.',3,9,['flag:saint_carried','item:saint_left_arm','noroute:saint_path','unbeaten:hotpants','noflag:saint_contact'],[
  choice('유해를 맡기고 치료를 받는다','크림 스타터가 팔에서 유해를 분리했다. 핫 팬츠는 약속한 처치를 마친 뒤 자신의 길로 사라졌다.',{consumeItem:['saint_left_arm','saint_trail'],item:'saint_resolve',maxHp:6,hp:28,route:route('saint_path','entrusted')}),
  choice('유해를 지키되 회수자들의 움직임을 묻는다','유해는 넘기지 않았다. 대신 어느 깃발 아래의 사람들이 당신을 찾게 될지 기억해 두었다.',{flag:'saint_contact',eva:1}),
  choice('추적을 피할 운반 장비를 산다','겹친 천과 두꺼운 안낭에 유해의 흔적을 감췄다. 팔을 흔드는 통증도 한결 줄었다.',{item:'corpse_cover',flag:'saint_contact',hp:12},{cost:70})
 ],{actor:'hotpants'});
 add('saint_agents','유해를 확인하는 총구','성조기가 새겨진 서류를 든 자들이 길을 나눈다. 말을 확인하는 척하지만 시선은 당신의 왼팔에 닿아 있다. 멀리서 남자들이 서로의 등 뒤로 사라졌다 나타나며 퇴로를 막는다.',5,9,['flag:saint_carried','item:saint_left_arm','noroute:saint_path','noflag:saint_passed'],[
  choice('회수자들에게 정면으로 맞선다','등 뒤에서 또 다른 얼굴이 솟아올랐다. 유해를 넘겨주지 않으려면 사격의 포위를 끊어야 한다.',{combat:{enemy:'eleven',winFx:{flag:'saint_passed',atk:1},winText:'회수자들의 포위를 뚫고 유해를 지켰다.'}},{req:['unbeaten:eleven']}),
  choice('정비소의 이중 안낭과 우회 안내를 이용한다','유해를 숨긴 안낭을 마차 안쪽에 묶었다. 안내받은 골짜기를 따라 검문선 밖으로 나왔다.',{item:'corpse_cover',flag:'saint_passed',eva:1},{cost:90}),
  choice('지금은 유해를 내려놓고 자신의 생존을 택한다','팔에서 분리된 유해를 내려놓고 총구에서 멀어졌다. 무엇을 지켜야 하는지 스스로 결정했다.',{consumeItem:['saint_left_arm','saint_trail'],item:'saint_resolve',hp:18,route:route('saint_path','released')})
 ]);
 add('saint_lucy','루시가 지키려는 것','루시 스틸은 대통령 측의 움직임이 레이스의 순위와 무관하다는 것을 짚는다. 당신의 팔을 본 뒤, 유해를 계속 지킬지 자신에게 맡길지는 당신이 결정해야 한다는 뜻을 전한다.',7,9,['item:saint_left_arm','flag:saint_passed','noroute:saint_path'],[
  choice('유해를 루시에게 맡기고 레이스로 돌아간다','유해가 팔에서 떨어져 나갔다. 자신이 맡았던 몫을 마치고, 당신의 결승선을 향해 고삐를 잡았다.',{consumeItem:['saint_left_arm','saint_trail'],item:'saint_resolve',spd:2,hp:20,route:route('saint_path','entrusted')}),
  choice('계속 지니고 가되 루시의 탈출을 돕는다','유해를 품은 팔로 고삐를 당겼다. 시선을 자신 쪽으로 끌어 루시가 빠져나갈 틈을 만들었다.',{atk:2,route:route('saint_path','guarded')}),
  choice('여비와 마차를 마련해 안전한 길을 확보한다','필요한 마차와 물자를 갖췄다. 루시를 배웅하고, 자신 역시 몸을 추슬러 결승으로 향했다.',{consumeItem:['saint_left_arm','saint_trail'],item:'saint_resolve',maxHp:10,hp:30,route:route('saint_path','sheltered')},{cost:100})
 ],{actor:'lucy'});
 add('spring_offer','슈거 마운틴의 샘','샘에 떨어진 작은 물건을 소녀가 건져 올린다. 원래 물건 옆에는 금과 귀중품, 사람의 귀와 팔처럼 생긴 유해가 놓여 있다. 소녀는 해질녘까지 받은 것을 모두 써 버려야 한다고 경고한다.',4,7,['noroute:spring_trial','noflag:spring_accepted'],[
  choice('원래 자신의 물건을 가리키고 선물을 받는다','거짓말은 하지 않았다. 금과 귀중품, 유해까지 받아 들자 뿌리가 잠깐 손목을 스쳤다.',{item:'spring_gifts',flag:'spring_accepted'}),
  choice('아무것도 받지 않고 샘을 떠난다','반짝이는 재물에 손을 대지 않았다. 자신의 짐만 되찾고 소녀에게 등을 돌렸다.',{route:route('spring_trial','declined')},{actionCost:0})
 ],{guide:'샘에서 받은 재물은 일반 자금과 구분해 보관합니다. 후속 사건에서 금과 유해까지 정당한 거래로 모두 처분해야 시련을 마칩니다. 원작의 하루를 사건 사이의 여정으로 압축했습니다.'});
 add('spring_barter','해질녘까지 제로로','해가 낮아지고 손목 아래로 가느다란 뿌리가 번진다. 금만 써서는 끝나지 않는다. 품 안의 유해까지 대가를 받고 넘겨야 한다. 근처의 거래상은 여행 장비를 펼쳤고, 뒤편에서는 서로의 등 뒤에서 총을 뽑는 남자들이 나타난다.',4,9,['item:spring_gifts','noroute:spring_trial'],[
  choice('금과 유해 전부를 정비총·여행 장비와 교환한다','받았던 금과 유해까지 값을 매겨 넘겼다. 손목의 뿌리가 사라지고 정비된 총과 여행 장비가 남았다.',{consumeItem:'spring_gifts',items:['sbr_spare_rifle','spring_kit'],route:route('spring_trial','bartered')}),
  choice('자신의 돈도 보태 더 좋은 장비로 교환한다','샘의 재물에 자신의 여비까지 보태 거래했다. 유해까지 모두 넘어가자 뿌리가 손목에서 떨어졌다.',{consumeItem:'spring_gifts',items:['rare_carbine','spring_kit'],maxHp:6,route:route('spring_trial','equipped')},{cost:65}),
  choice('열한 명의 남자와 맞서 거래할 틈을 만든다','마지막까지 자신이 놓아줄 것을 결정하기 위해 총구를 마주했다.',{combat:{enemy:'eleven',winText:'유해를 남아 있던 와인과 교환했다. 손에 들어온 것을 모두 놓아주자 나무의 뿌리가 사라졌다.',winFx:{consumeItem:'spring_gifts',item:'spring_wine',route:route('spring_trial','bartered')},loseText:'총구 앞에서 남은 와인 한 병과 치료를 대가로 금과 유해를 전부 넘겼다. 샘의 재물은 남지 않았지만 대결에서는 밀려났다.',loseFx:{consumeItem:'spring_gifts',item:'spring_wine',route:route('spring_trial','surrendered')},fleeText:'금과 유해를 모두 내주는 대신 퇴로를 열어 달라고 거래했다. 받은 재물을 대가로 길을 사서 빠져나왔다.',fleeFx:{consumeItem:'spring_gifts',route:route('spring_trial','surrendered')},nonlethal:true}},{req:['unbeaten:eleven']})
 ],{guide:'받은 유해도 거래 대상입니다. 보상을 유지한 채 조건만 해제하거나 무료로 버리는 선택은 없습니다. 전투는 승리 시 기존 전투 보상도 받습니다.'});
 add('race_gunsmith','윈체스터의 현장 정비대','윈체스터 총포사의 상자가 실린 마차가 초소 옆에 섰다. 정비공은 낡은 총의 약실과 총열을 살피고, 사막용 예비총 두 자루를 꺼내 놓는다.',2,9,[],[
  choice('정비된 예비총을 구입한다','약실과 조준을 확인한 총을 손에 넣었다. 정비공이 해당 총으로 쓰는 사격법도 짚어 주었다.',{item:'sbr_spare_rifle'},{cost:85,req:['noitem:sbr_spare_rifle']}),
  choice('기본 사냥총과 사격법을 받는다','비싼 총 대신 손에 익히기 쉬운 사냥총을 골랐다.',{item:'weapon_rifle'},{cost:48,req:['noitem:weapon_rifle']}),leave()
 ],{repeatAfter:16,once:false,req:[{any:['noitem:sbr_spare_rifle','noitem:weapon_rifle']}]});
 add('weapon_order_1','정비공이 받아 적은 주문','당신이 무기를 쥐는 자세를 본 정비공이 종이를 편다. 사막의 모래에도 견딜 손잡이와 맞는 무게를 골라 달라는 제안이다.',2,5,['noroute:weapon_order','noflag:weapon_ordered'],[
  choice('회전용 철구를 주문한다','선금과 함께 손에 맞는 무게를 적어 주었다. 완성품은 다음 초소로 보내기로 했다.',{flag:'weapon_ordered',hp:10},{cost:35}),leave()
 ]);
 add('weapon_order_2','손에 맞춰 돌아온 철구','초소의 정비공이 당신의 이름이 적힌 상자를 내민다. 모래를 털어 낸 철구는 손바닥 위에서 끊김 없이 회전한다.',3,9,['flag:weapon_ordered','noroute:weapon_order'],[
  choice('잔금을 내고 완성품을 받는다','손에 맞춘 철구와 투척법을 확인했다. 새 무기는 자신의 장비에 보관했다.',{item:'commission_ball',route:route('weapon_order','equipped')},{cost:45}),
  choice('주문을 취소하고 선금을 돌려받는다','완성품을 넘겨받지 않고 선금을 정산했다. 자신의 원래 무기를 다시 쥐었다.',{money:35,route:route('weapon_order','declined')},{actionCost:0})
 ]);
 add('race_norisuke','히가시카타 노리스케의 짐','노리스케의 말 옆에는 레이스에 필요한 짐과 교역할 물건이 나란히 묶여 있다. 그는 무게를 줄이려 한다며 칼집 하나와 튼튼한 장갑을 펼쳐 보인다.',4,8,[],[
  choice('교역용 기병도를 산다','날과 손잡이를 확인하고 값을 치렀다. 무기를 다루는 요령도 함께 익혔다.',{item:'merchant_sabre'},{cost:95,req:['noitem:merchant_sabre']}),
  choice('장거리용 장갑을 산다','고삐를 놓치지 않을 장갑을 골랐다.',{item:'riding_gloves'},{cost:25,req:['noitem:riding_gloves']}),leave()
 ],{repeatAfter:16,once:false,req:[{any:['noitem:merchant_sabre','noitem:riding_gloves']}]});
 add('race_pocoloco','포코로코가 고른 길','포코로코는 갈림길 앞에서도 망설임이 없다. 뒤를 돌아본 그가 당신에게 웃으며 바람을 타는 쪽을 가리킨다. 설명하기 어려운 자신감이 말의 걸음에도 전해진다.',1,8,[],[
  choice('그가 읽는 바람과 지형을 살핀다','운이 좋다는 말 뒤에 가려진 지형을 살폈다. 돌풍이 끊기는 틈을 놓치지 않았다.',{spd:1}),
  choice('같은 야영지에서 말과 몸을 쉰다','물통을 나누고 말을 쉬게 했다. 다음 출발을 버틸 힘이 돌아왔다.',{hp:20}),leave()
 ]);
 // Four rare talents have two separated, substantive growth events each.
 const growth=[
  ['golden_eye','황금장방형','바위의 곡선과 잎맥 사이에서 같은 비율이 눈에 들어온다.',{eva:1,startBreath:1},{atk:2,eva:1},'회전의 비율을 놓치지 않고 자신의 동작에 이었다.'],
  ['black_resolve','칠흑의 의지','불빛이 닿지 않는 야영지에서 자신이 포기하지 않은 선택을 떠올린다.',{maxHp:4},{atk:2,maxHp:6},'결정을 미루지 않고 자신의 몸으로 끝까지 지켰다.'],
  ['lucky_rider','행운을 붙잡는 손','우연히 열린 길을 발견했다. 행운을 기다릴지 직접 붙잡을지는 당신의 몫이다.',{money:20},{spd:2,eva:1},'자신에게 온 기회를 놓치지 않고 다음 길로 이었다.'],
  ['palm_survivor','돌아온 사막의 감각','과거에 지나온 사막과 같은 모양의 바위가 다시 나타난다.',{maxHp:4,eva:1},{maxHp:8,startBreath:1},'낯선 땅의 감각에 휩쓸리지 않고 자신의 몸을 지켰다.']
 ];
 for(const [id,n,x,first,last,text]of growth){
  const rid='talent_'+id,flag=rid+'_practiced';D.routes.push({id:rid,n,ending:text});
  add(rid+'_1',n+'의 징조',x,2,6,['talent:'+id,'noflag:'+flag,'noroute:'+rid],[choice('지금 느낀 감각을 직접 확인한다',text,{...first,flag}),leave()]);
  add(rid+'_2',n+'을 자신의 것으로',x+' 이번에는 그 감각을 끝까지 유지할 수 있을지 시험한다.',5,9,['talent:'+id,'flag:'+flag,'noroute:'+rid],[choice('충분한 물자와 휴식으로 몸을 갖춘 뒤 시도한다',text,{...last,hp:16,route:route(rid,'mastered')},{cost:40}),choice('지금의 몸으로 무리하지 않고 마무리한다',text,{eva:1,hp:10,route:route(rid,'adapted')})],{after:{flag,ticks:8}});
 }
 for(const [id,n,x,fx]of [
  ['four_fear','네 번째 표식','네 번째 말뚝 앞에서 굳던 손이 다시 떨린다. 표식 대신 자신의 호흡에 움직임을 맞춰 본다.',{eva:3,startBreath:1}],
  ['unforgiven','버리고 온 물건','짐에서 빠졌던 작은 물건을 길 위에서 발견했다. 피해 온 기억을 끝까지 바라볼 기회다.',{maxHp:12}]
 ]){const rid='flaw_'+id;D.routes.push({id:rid,n,ending:'두려움과 과거를 자신의 방식으로 마주했다.'});add(rid+'_resolve',n,x,3,9,['flaw:'+id,'noroute:'+rid],[choice('안전한 장소와 처치를 마련해 끝까지 마주한다','다시는 보지 않으려 했던 것을 자신의 손으로 정리했다.',{...fx,hp:16,route:route(rid,'mastered')},{cost:35}),choice('조금씩 익숙해지며 자신의 속도로 넘는다','모든 것을 한 번에 바꾸려 하지 않았다. 다음 걸음을 내딛을 만큼은 몸이 풀렸다.',{hp:18,route:route(rid,'adapted')})]);}
 D.world.characters.hotpants={n:'핫 팬츠',role:'유해를 회수하는 참가자',source:'https://namu.moe/w/핫%20팬츠(죠죠의%20기묘한%20모험)'};D.world.characters.sugar_mountain={n:'슈거 마운틴',role:'샘의 수호자',source:'https://namu.moe/w/슈거%20마운틴의%20샘'};
 for(const [id,actor]of [['race_pocoloco','pocoloco'],['race_norisuke','norisuke'],['spring_offer','sugar_mountain'],['spring_barter','sugar_mountain']])D.events.find(e=>e.id===id).actor=actor;
 D.corpseJourney={events:D.events.slice(firstEvent).map(e=>e.id),items:['saint_left_arm','spring_gifts'],sources:['https://namu.moe/w/성인의%20유해','https://namu.moe/w/슈거%20마운틴의%20샘']};
}
