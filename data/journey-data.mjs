export function addJourneyData(data){
 data.rules.turnsPerStage=8;data.rules.startMoney=35;data.rules.cardCash=10;
 for(const stage of data.stages)stage.turns=data.rules.turnsPerStage;
 data.hiddenBosses=[];
 const routes={
 gyro:['회전이 남긴 자국','바위 표면에 둥근 자국이 남아 있다. 멀리서 철구가 돌아오는 소리가 들린다.','회전의 흔적을 따라가 본다','두 개의 철구를 찬 기수가 길 건너에서 기다린다. 자신이 배운 것을 시험해 볼 기회다.',true],
 johnny:['손톱만 한 탄흔','바위에 작은 탄흔이 이어진다. 총알의 흔적과는 다르다.','탄흔의 방향을 기록한다','말 위의 기수가 손끝을 들어 올린다. 당신이 좇아온 궤도가 그 앞에서 끝난다.',true],
 diego:['세 갈래 발자국','말발굽 자국 사이에 낯선 발톱 자국이 섞여 있다.','발자국을 추적한다','바위 능선 위에 디에고가 서 있다. 가까이 다가가면 추격전이 대결로 바뀔 것이다.',false],
 hotpants:['기묘하게 아문 상처','버려진 붕대 옆에서 상처가 거의 사라진 참가자를 만났다.','치료를 받은 경위를 묻는다','작은 분사기를 든 인물이 길을 가로막는다. 알아낸 비밀을 두고 대화하거나 맞설 수 있다.',true],
 mountain:['절벽의 밧줄','절벽 너머로 밧줄 한 가닥이 흔들린다. 당신 쪽을 향한 신호처럼 보인다.','밧줄을 붙잡고 건넌다','밧줄을 다루는 기수가 앞서 기다린다. 자신의 길을 지킬 수 있는지 확인하려 한다.',true],
 oye:['초침 같은 소리','남겨진 짐에서 규칙적인 쇳소리가 난다. 손대기 전에 이상함을 눈치챘다.','짐을 건드리지 않고 흔적을 살핀다','방울 달린 옷을 입은 인물이 좁은 길 끝에 있다. 주변의 물건마다 불길한 소리가 난다.',false],
 ringo:['과수원의 결투 소문','들어간 길로 되돌아온 기수들이 작은 집 한 채를 이야기한다.','길을 잃은 위치를 지도에 남긴다','과수원 한가운데 작은 집이 있다. 문 앞의 사내는 도망이 아닌 결투를 제안한다.',false],
 sandman:['바위 위에 남은 소리','아무도 없는데 바위 너머에서 발소리가 이어진다.','들리는 소리의 간격을 기억한다','발소리가 멎고 샌드맨이 모습을 드러낸다. 소리가 닿는 거리가 곧 위험한 거리다.',false],
 blackmore:['멈추지 않는 빗방울','바람과 다른 방향으로 비가 흐른다. 누군가 그 위를 지난 듯하다.','비가 끊기는 지점을 살핀다','빗속에 가면 쓴 그림자가 떠 있다. 발밑보다 머리 위를 조심해야 할 대결이다.',false],
 wekapipo:['놓쳐 버린 왼쪽 길','분명 보았던 표식을 다시 찾지 못했다. 옆 바위에는 작은 철구가 박혀 있다.','작은 철구의 흔적을 기록한다','기묘한 철구를 쥔 웨카피포가 길을 막는다. 감각이 어긋났던 이유가 눈앞에 있다.',false],
 magenta:['총성이 멎은 자리','주저앉은 사람이 총탄을 견뎠다는 소문이 돈다. 바닥에는 빈 탄피만 가득하다.','탄피가 쌓인 장소를 찾아본다','마젠트 마젠트가 길 한복판에 자세를 잡는다. 성급히 공격을 쏟아붓기엔 불길한 상대다.',false],
 valentine:['대통령 측의 봉투','대회 관계자가 봉인된 봉투를 전달한다. 경로에 대한 질문은 하지 말라고 했다.','봉투의 발신인을 조사한다','대통령 측의 초대가 도착했다. 받아들이면 레이스의 이면에 직접 발을 들이게 된다.',false],
 otherdiego:['서로 맞지 않는 목격담','같은 시각, 다른 장소에서 디에고를 봤다는 두 기록을 얻었다.','두 기록의 차이를 추적한다','익숙한 얼굴인데 움직임은 낯설다. 잠깐의 침묵 뒤, 자신만 뒤처졌다는 감각이 든다.',false]
 };
 for(const [id,e]of Object.entries(data.enemies)){
  data.relics[e.relic].sourceEnemy=id;
  Object.assign(e,{kind:'boss',hp:70+e.from*7,atk:22+e.from*2,eva:10+e.from,spd:8+e.from,money:70+e.from*10});
  const [t,x,l,omen,ally]=routes[id];
  data.hiddenBosses.push({id,from:e.from,to:e.to,req:['flag:route_'+id],chance:id==='valentine'||id==='otherdiego'?10:16,omen,ally,allyFx:{eva:1,hp:8}});
 }
 const npcs=[
 ['rough_rider','시비 거는 참가자',1,3,['sbr_basic_strike','sbr_basic_rush','sbr_basic_guard']],
 ['road_bandit','길목의 강도',1,4,['sbr_weapon_knife','sbr_basic_cut','sbr_basic_step']],
 ['stray_gunner','떠돌이 총잡이',1,5,['sbr_weapon_revolver','sbr_basic_aim','sbr_basic_guard']],
 ['horse_thief','마구를 노리는 도둑',1,5,['sbr_basic_feint','sbr_basic_cut','sbr_basic_step']],
 ['desert_raider','사막의 약탈자',2,5,['sbr_weapon_hatchet','sbr_basic_pressure','sbr_basic_brace']],
 ['hired_guard','거친 호위꾼',2,6,['sbr_basic_strike','sbr_basic_guard','sbr_basic_brace']],
 ['knife_rider','칼을 든 기수',2,7,['sbr_weapon_bowie','sbr_basic_cut','sbr_basic_guard']],
 ['nameless_stand','이름 없는 스탠드 사용자',2,9,['sbr_basic_pressure','sbr_basic_feint','sbr_basic_aim']],
 ['ridge_sniper','능선의 사수',3,7,['sbr_weapon_rifle','sbr_basic_aim','sbr_basic_guard']],
 ['bounty_hunter','현상금 사냥꾼',3,9,['sbr_weapon_revolver','sbr_weapon_lasso','sbr_basic_aim']],
 ['camp_raider','야영지 습격자',3,8,['sbr_basic_rush','sbr_basic_cut','sbr_basic_step']],
 ['mine_thug','광산의 불량배',4,8,['sbr_basic_burst','sbr_basic_brace','sbr_basic_strike']],
 ['paid_tracker','고용된 추적자',4,9,['sbr_weapon_whip','sbr_basic_feint','sbr_basic_shoot']],
 ['river_outlaw','강가의 무법자',4,9,['sbr_basic_cut','sbr_weapon_shotgun','sbr_basic_guard']],
 ['station_ruffian','역전의 난동꾼',5,9,['sbr_weapon_knuckles','sbr_basic_rush','sbr_basic_brace']],
 ['hooded_rider','두건 쓴 기수',5,9,['sbr_basic_breathe','sbr_basic_step','sbr_basic_burst']],
 ['eastern_gunner','동부의 총잡이',6,9,['sbr_weapon_rifle','sbr_weapon_revolver','sbr_basic_aim']],
 ['masked_assailant','가면 쓴 습격자',6,9,['sbr_basic_pressure','sbr_basic_feint','sbr_basic_rush']]
 ];
 for(const [i,[id,n,from,to,deck]]of npcs.entries()){
  data.enemies[id]={n,kind:'normal',ability:'길 위에서 익힌 싸움',hp:24+from*4,atk:12+from*2,eva:4+from,spd:3+from,evadeDie:65,from,to,deck:deck.flatMap(id=>[id,id]),rewardCards:[deck[0]],money:12+from*3,story:'길을 막던 상대를 물리치고 보급품을 지켰다.'};
 }
 data.events=[];
 const yes=(t,fx={})=>({t,fx});
 const option=(l,t,fx={},extra={})=>({l,ok:yes(t,fx),...extra});
 const gamble=(l,s,dc,t,fx,ft,ffx,extra={})=>({l,check:{s,dc},ok:yes(t,fx),fail:yes(ft,ffx),...extra});
 const add=(id,t,x,where,c,extra={})=>data.events.push({id,t,x,where,c,from:1,to:9,weight:10,...extra});
 add('river','불어난 강물','전날 내린 비로 강물이 불었다. 돌아가면 안전하지만 물살을 건너는 법을 배울 기회도 있다.',['road','explore'],[gamble('물살을 읽고 건넌다','eva',65,'흐름을 읽어 무사히 건넜다. 몸을 흘리는 요령이 남았다.',{eva:1,flag:'river_crossed'},'발을 헛디뎌 짐과 몸이 물에 휩쓸렸다.',{hp:-8,money:-5}),option('얕은 여울로 돌아간다','조금 돌아가 안전하게 강을 건넜다.',{hp:2})],{to:5});
 add('broken_wagon','부서진 마차','바퀴가 부서진 마차 옆에서 가족이 도움을 청한다.',['road','explore'],[gamble('마차를 들어 수리한다','atk',40,'마차가 다시 굴러갔다. 가족은 감사의 표시로 먹을 것을 나눴다.',{maxHp:2,hp:5,flag:'wagon_helped'},'바퀴를 고치다 어깨를 다쳤지만 가족을 도왔다.',{hp:-5,flag:'wagon_helped'}),option('길을 알려 주고 출발한다','가까운 마을의 위치를 알려 주었다.')],{once:true});
 add('gunfire','멀리서 들리는 총성','능선 아래에서 몇 발의 총성이 들린다. 혼란을 틈타 남의 짐을 노리는 자가 있다.',['road','explore'],[option('습격자에게 맞선다','총성이 난 자리로 말을 달렸다.',{combat:'normal'}),option('눈에 띄지 않게 지나간다','능선을 우회했다. 레이스를 이어 가는 것이 우선이다.',{hp:2})]);
 add('racing_line','기수의 주행선','앞서가는 무명 참가자가 말의 움직임을 작게 유지하며 속도를 내고 있다.',['road'],[gamble('주행선을 따라 배운다','spd',25,'불필요한 움직임을 줄이는 법을 익혔다.',{spd:1},'무리하게 따라가다 몸이 크게 흔들렸다.',{hp:-4}),option('자신의 페이스를 지킨다','호흡을 지키며 꾸준히 달렸다.',{hp:4})]);
 add('fallen_pack','찢어진 짐 꾸러미','길 한복판에 주인을 잃은 짐 꾸러미가 떨어져 있다.',['road','explore'],[gamble('안쪽까지 살펴본다','eva',20,'쓸 만한 보급품과 약간의 돈을 찾았다.',{money:18,hp:3},'짐에 숨은 날카로운 금속에 손을 베었다.',{hp:-5}),option('주인이 찾기 쉽게 걸어 둔다','보이는 곳에 짐을 걸어 두었다.',{flag:'honest'})]);
 add('dust','모래 먼지','맞바람이 거세져 앞이 잘 보이지 않는다. 달리던 기수들도 속도를 늦춘다.',['road'],[gamble('먼지 속의 표식을 읽는다','eva',40,'작은 표식까지 놓치지 않는 눈을 얻었다.',{eva:1},'눈에 모래가 들어가 한동안 쉬어야 했다.',{hp:-6}),option('몸을 낮추고 천천히 간다','바람이 약해질 때까지 조심해 나아갔다.',{hp:2})],{to:4});
 add('chase','뒤쫓는 말발굽','같은 기수가 오래도록 당신 뒤를 따라온다. 길을 틀어도 거리가 줄어든다.',['road','explore'],[gamble('지형을 이용해 떼어 낸다','spd',55,'추적을 뿌리치며 움직임의 완급을 익혔다.',{spd:1},'돌아선 길에서 추적자와 마주쳤다.',{combat:'normal'}),option('멈춰 서서 맞선다','상대의 의도를 직접 확인하기로 했다.',{combat:'normal'})]);
 add('duel_offer','무명 참가자의 도전','한 참가자가 작은 내기를 걸고 짧은 대결을 제안한다.',['road','explore'],[option('대결을 받아들인다','말에서 내려 대결할 자리를 잡았다.',{combat:'normal'}),gamble('움직임만 비교해 본다','spd',35,'짧은 시범만으로도 배울 것이 있었다.',{spd:1},'상대의 박자를 따라잡지 못했다.',{hp:-3})]);
 add('rockslide','산길의 낙석','좁은 길 위로 돌이 쏟아진다. 멈추기보다 비껴 지나가는 편이 안전해 보인다.',['road'],[gamble('낙석 사이를 빠져나간다','eva',75,'떨어지는 돌의 궤적을 읽고 빠져나왔다.',{eva:2},'돌에 어깨를 부딪혔다.',{hp:-10}),option('바위 뒤에서 기다린다','낙석이 멎은 뒤 길을 나아갔다.',{hp:2})],{from:3,to:5});
 add('reins','손에 익지 않는 고삐','말과 자신의 움직임이 조금씩 어긋난다. 지나온 길에서 같은 실수를 반복하고 있다.',['road','camp'],[option('고삐를 쥐는 법을 다시 익힌다','작은 움직임부터 맞췄다. 말의 움직임이 전보다 잘 느껴진다.',{spd:1}),option('말을 쉬게 한다','재촉하지 않고 함께 숨을 골랐다.',{hp:8})],{once:true});
 add('tracks','갈라지는 발자국','갈림길마다 말발굽이 흩어져 있다. 바른 길을 찾으려면 흔적을 자세히 살펴야 한다.',['road','explore'],[gamble('흔적을 읽는다','eva',30,'흩어진 자국 속에서 지나간 순서를 알아냈다.',{eva:1,money:5},'잘못된 길로 들어가 보급을 더 썼다.',{money:-8,hp:-3}),option('확실한 이정표를 따른다','낯선 지름길을 택하지 않았다.')]);
 add('night_ride','해가 진 뒤의 길','해가 기울었지만 지평선 너머의 표식은 아직 보인다.',['road'],[gamble('어두워지기 전에 밀어붙인다','spd',50,'남은 빛을 이용해 길을 뚫었다.',{spd:1,money:12},'어둠 속 웅덩이에 발이 빠졌다.',{hp:-8}),option('서두르지 않고 나아간다','급히 달리는 대신 체력을 보존했다.',{hp:6})],{from:2});
 add('target','버려진 표적','누군가 세운 빈 병들이 바위 위에 남아 있다. 잠깐 멈춰 정확도를 시험할 수 있다.',['road','explore'],[gamble('흔들리는 말 위에서 맞힌다','atk',75,'정확히 힘을 싣는 감각을 얻었다.',{atk:1},'동작이 무너져 손목에 무리가 갔다.',{hp:-4}),option('안정된 자세부터 확인한다','기본 자세를 반복해 익혔다.',{card:'sbr_basic_aim'})],{once:true});
 add('cold_rain','차가운 비','오랫동안 비를 맞아 손끝이 굳어 간다.',['road'],[gamble('손을 풀며 달린다','atk',35,'굳은 몸에서도 힘을 잃지 않는 법을 배웠다.',{atk:1},'무리한 탓에 기력이 더 소모됐다.',{hp:-7}),option('처마 아래에서 비를 피한다','젖은 옷을 짜고 체온을 되찾았다.',{hp:7})],{from:5});
 add('finish_fatigue','결승을 앞둔 피로','결승이 가까워지자 오래 버틴 몸이 한꺼번에 무거워진다.',['road','camp'],[option('몸 상태를 정리하고 달린다','남은 힘을 아낄 수 있도록 움직임을 고쳤다.',{maxHp:3,hp:6}),gamble('끝까지 속도를 올린다','spd',65,'쌓인 피로를 넘어 자신의 페이스를 찾았다.',{spd:2},'무리하게 속도를 올려 몸을 상했다.',{hp:-10})],{from:8,once:true});
 add('ambush','수풀 속의 인기척','낮게 웅크린 그림자가 당신의 보급품을 노린다.',['road','explore'],[option('짐을 지키며 맞선다','보급품 앞을 막고 섰다.',{combat:'normal'}),option('일부 짐을 버리고 벗어난다','몸을 지키기 위해 작은 손실을 받아들였다.',{money:-10})]);
 add('camp_meal','작은 모닥불','남겨 둔 식량을 꺼냈다. 한 번 쉬는 동안 어떻게 몸을 돌볼지 정할 수 있다.',['camp'],[option('충분히 먹고 쉰다','따뜻한 식사 뒤에 기운을 되찾았다.',{hp:16}),option('식사 뒤 가볍게 움직인다','몸의 긴장을 풀며 기본 동작을 반복했다.',{hp:6,eva:1})]);
 add('camp_breath','밤의 호흡','야영지가 조용해졌다. 들리는 것은 자신의 숨과 말의 콧김뿐이다.',['camp'],[option('호흡을 고르게 다듬는다','처음부터 무리하지 않는 호흡을 몸에 익혔다.',{startBreath:1,hp:6}),option('바로 잠든다','오랜만에 깊이 잠들었다.',{hp:18})],{once:true});
 add('camp_practice','잠들기 전의 반복','낮에 빗나갔던 공격이 마음에 남는다.',['camp'],[gamble('같은 동작을 반복한다','atk',30,'힘이 빠지는 구간을 고쳤다.',{atk:1,hp:4},'연습을 지나치게 오래 해 몸이 무거워졌다.',{hp:-3}),option('실수를 기록하고 쉰다','기록을 남기고 충분히 쉬었다.',{hp:14})]);
 add('camp_watch','교대할 사람이 없는 밤','야영지 주변에서 발소리가 들렸다. 잠들기 전 한 번 더 살펴볼 수 있다.',['camp'],[gamble('야영지 바깥을 확인한다','eva',35,'접근하던 도둑을 먼저 알아채고 쫓아냈다.',{eva:1,money:8},'짐을 노리던 상대와 마주쳤다.',{combat:'normal'}),option('짐을 가까이 두고 쉰다','잠은 얕았지만 물건을 잃지는 않았다.',{hp:9})]);
 add('camp_wound','붕대 아래의 상처','오래 달리며 생긴 상처가 다시 벌어졌다.',['camp'],[option('상처를 씻고 새로 감는다','꼼꼼히 상처를 돌봤다.',{hp:18}),option('약을 써서 제대로 치료한다','약을 아끼지 않은 덕에 몸이 한결 가벼워졌다.',{hp:25,maxHp:2},{cost:12})]);
 add('camp_stories','길 위에서 들은 이야기','먼저 달렸던 기수가 근처의 수상한 흔적을 이야기한다.',['camp'],[option('대처법을 듣는다','쉽게 다가가면 안 되는 위험을 하나 배웠다.',{eva:1,flag:'heard_warning'}),option('조용히 식사를 나눈다','대화보다 휴식이 필요한 밤이었다.',{hp:14})],{once:true});
 add('camp_gear','헐거워진 장비','장비를 살피니 손잡이와 끈이 조금씩 헐거워져 있다.',['camp'],[gamble('직접 손질한다','atk',25,'몸에 맞게 장비를 조정했다.',{atk:1,hp:5},'수리를 잘못해 재료를 더 썼다.',{money:-6}),option('간단히 묶고 쉰다','당장 풀리지 않게 고정하고 쉬었다.',{hp:12})]);
 add('camp_wind','바람을 막아 주는 바위','지형을 잘 고르면 바람을 피하며 쉴 수 있다.',['camp'],[option('바위 뒤에 자리를 잡는다','추위를 덜 맞은 덕에 몸이 충분히 회복됐다.',{hp:18}),gamble('다음 길까지 미리 살핀다','eva',25,'안전한 길을 눈에 익혔다.',{eva:1,hp:7},'예상보다 바람이 세 몸만 더 차가워졌다.',{hp:2})]);
 add('town_clinic','작은 진료소','작은 진료소가 여행객을 받고 있다. 치료비를 내면 상처를 제대로 돌볼 수 있다.',['town'],[option('치료를 받는다','상처를 씻고 새 붕대를 감았다.',{hp:30},{cost:18}),option('응급처치법을 배운다','지혈하는 방법을 배워 두었다.',{card:'sbr_colony_mend'},{cost:12}),option('물만 얻어 마신다','물을 마시며 잠시 쉬었다.',{hp:5})]);
 add('town_job','역마차의 짐','마차 주인이 잠깐 짐을 옮길 사람을 찾고 있다.',['town'],[gamble('무거운 짐을 옮긴다','atk',35,'일을 마치고 품삯을 받았다. 몸도 조금 단단해졌다.',{money:24,maxHp:2},'짐을 옮기다 허리를 삐끗했다. 품삯은 적게 받았다.',{money:6,hp:-7}),option('가벼운 심부름만 한다','작은 품삯을 받아 보급에 보탰다.',{money:10})]);
 add('town_range','마을의 사격장','사격장 주인이 표적을 세워 두고 있다. 몸에 익은 방식과 비교해 볼 수 있다.',['town'],[option('조준을 연습한다','표적에 집중하며 공격의 흔들림을 줄였다.',{atk:1,card:'sbr_basic_shoot'},{cost:15}),gamble('작은 상금에 도전한다','atk',50,'좋은 성적으로 상금을 받았다.',{money:30},'표적을 놓쳤다. 참가비만 쓰고 돌아왔다.',{money:-6}),option('구경하며 배운다','다른 사람의 자세를 눈에 담았다.',{hp:3})]);
 add('town_merchant','여행 상인의 보급품','상인이 붕대와 식량, 오래된 전투 요령을 적은 쪽지를 팔고 있다.',['town'],[option('식량을 산다','허기를 채우고 다음 길을 준비했다.',{hp:20},{cost:10}),option('전투 요령을 산다','허점을 만드는 동작을 익혔다.',{card:'sbr_basic_feint'},{cost:20}),option('물건을 사지 않는다','필요한 것만 살펴보고 떠났다.')]);
 add('town_thief','사라진 지갑','시장 한복판에서 주머니가 가벼워진 것을 느꼈다. 골목 안으로 누군가 달아난다.',['town'],[gamble('곧바로 뒤쫓는다','spd',45,'놓치기 전에 붙잡았다. 급히 방향을 바꾸는 법이 남았다.',{spd:1,money:8},'골목에서 놓쳤다. 일부 돈을 잃었다.',{money:-15}),option('추격 대신 주변을 살핀다','큰 손실은 막았지만 몇 달러는 되찾지 못했다.',{money:-5})]);
 add('town_letters','전하지 못한 편지','우편 직원이 길 위의 작은 초소까지 편지를 전해 달라고 부탁한다.',['town'],[option('편지를 맡는다','다음 초소로 전할 편지를 소중히 챙겼다.',{flag:'letter_carried',money:8}),option('지금은 맡지 않는다','자신의 짐을 챙겨 마을을 나섰다.')],{to:6,once:true});
 add('town_broker','수상한 중개인','익명 의뢰를 맡으면 사례를 주겠다는 중개인이 다가온다. 짐의 주인은 알려 주지 않는다.',['town'],[gamble('대가를 받고 운반한다','spd',60,'눈에 띄지 않고 일을 마쳤다.',{money:35,flag:'broker_job'},'짐을 노리던 자들이 뒤를 밟았다.',{combat:'normal'}),option('일의 내용을 알아본다','앞뒤가 맞지 않는 말을 듣고 제안을 거절했다.',{flag:'heard_warning'})]);
 add('town_repairs','마구간의 수선','마구간 주인이 장비를 손보면 불필요한 움직임을 줄일 수 있다고 한다.',['town'],[option('장비를 수선한다','고삐와 끈이 손에 맞게 고쳐졌다.',{spd:1},{cost:16}),option('직접 조정법을 배운다','간단한 조정을 배워 두었다.',{card:'sbr_basic_step'},{cost:12}),option('이번에는 지나친다','남은 돈을 아끼기로 했다.')]);
 add('different_power','낯선 힘의 감각','익숙한 힘과 다른 방식으로 움직일 수 있을 듯한 감각이 찾아왔다. 받아들이기 전에 무엇이 바뀌는지 살펴볼 수 있다.',['explore'],[option('새로운 전투 방식을 살핀다','낯선 힘을 자신의 방식과 비교해 보았다.',{form:true}),option('지금의 힘을 더 익힌다','익숙한 힘의 활용법을 다듬었다.',{atk:1})],{from:3,once:true,weight:5});
 for(const r of data.hiddenBosses){const [t,x,l]=routes[r.id];add('clue_'+r.id,t,x,['explore','road'],[option(l,'길 위에서 얻은 단서를 기억해 두었다.',{flag:'route_'+r.id}),option('지금은 레이스에 집중한다','흔적을 뒤로하고 자신의 길을 달렸다.',{hp:3})],{from:r.from,to:r.to,once:true,weight:3,req:['noflag:route_'+r.id]});}
 add('wagon_reply','다시 만난 수선된 마차','도왔던 마차가 길가에 서 있다. 가족은 당신을 기억하고 있다.',['road','town'],[option('마련해 둔 보급을 받는다','당신을 위해 남겨 둔 음식을 받았다.',{hp:18,money:15}),option('길에서 배운 것을 나눈다','서로의 경험을 나누며 길을 살피는 눈이 넓어졌다.',{eva:1,maxHp:2})],{once:true,req:['flag:wagon_helped']});
 add('letter_delivered','초소의 작은 우편함','맡아 둔 편지를 전할 초소에 닿았다. 종이 한 장이 누군가를 안심시켰다.',['road','town'],[option('편지를 전하고 떠난다','맡은 일을 끝냈다. 사례와 따뜻한 식사를 받았다.',{money:22,hp:12,flag:'letter_done'})],{from:3,once:true,req:['flag:letter_carried']});
 add('river_again','다시 마주한 물살','한 번 건넜던 강과 닮은 물길 앞에 섰다. 처음과 달리 몸이 먼저 반응한다.',['road'],[option('배웠던 흐름을 활용한다','지난 경험이 몸에 남아 있었다.',{eva:1,hp:5}),option('다른 참가자에게 여울을 알려 준다','길을 설명하며 자신의 판단도 정리됐다.',{atk:1,flag:'helped_rider'})],{from:4,once:true,req:['flag:river_crossed']});
 add('honesty_return','되돌아온 작은 보답','찾기 쉽게 걸어 두었던 짐의 주인이 당신을 알아봤다.',['town','camp'],[option('사례를 받는다','찾아 준 짐에 대한 보답을 받았다.',{money:28}),option('경험담을 듣는다','그동안의 여정과 싸움 이야기를 들었다.',{atk:1,eva:1})],{once:true,req:['flag:honest']});
 add('broker_shadow','뒤따라온 의뢰','지난 의뢰를 맡겼던 중개인의 표식이 또 보인다. 이번에는 누군가 당신을 기다리고 있다.',['town','explore'],[option('기다리던 상대와 맞선다','지난 의뢰가 남긴 위험을 직접 마주했다.',{combat:'normal'}),option('대금을 포기하고 관계를 끊는다','돈을 일부 돌려주고 더는 의뢰를 받지 않겠다고 했다.',{money:-12,flag:'broker_left'})],{from:4,once:true,req:['flag:broker_job','noflag:broker_left']});
 add('warning_saved','기억해 둔 징후','수상한 짐에서 전에 들었던 소리가 난다. 경고가 기억났기 때문에 제때 손을 멈췄다.',['road','explore'],[option('위험한 짐을 피하고 길을 확보한다','남의 경험이 이번에는 당신을 지켰다.',{eva:1,money:10}),option('주변 참가자에게 경고한다','위험을 알리며 안전한 길을 함께 찾았다.',{spd:1,hp:5})],{once:true,req:['flag:heard_warning']});
 data.journeySource={reference:'도시의 한 해 events: t/x/c/check/ok/fail/fx + hiddenBosses: req/from/chance/omen',note:'원작 캐릭터는 일반 조우 표에 넣지 않는다. 단서와 구간 조건을 만족한 뒤 낮은 확률로 전조를 만나고 도전을 선택한다.'};
}
