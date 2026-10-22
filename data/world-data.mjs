// Canonical roles/names are sourced; player meetings and rewards are fan-game scenes.
export function addWorldData(D){
 const url=s=>'https://seore.org/w/'+encodeURIComponent(s);
 D.world={marketName:'SBR 대회 보급소',organizer:'스티븐 스틸',sponsors:['스피드왜건 석유회사','윈체스터 총포사','후원 신문사'],adaptation:'원작의 인물·단체 설정을 바탕으로 플레이어의 만남과 보상을 각색했습니다.',sources:[url('스틸 볼 런 레이스'),url('스틸 볼 런')],characters:{
  official:{n:'SBR 진행요원',role:'대회 운영',source:url('스틸 볼 런')},reporter:{n:'후원 신문사의 기자',role:'대회 취재',source:url('스틸 볼 런 레이스')},
  stephen:{n:'스티븐 스틸',role:'대회 주최자',source:url('스티븐 스틸')},lucy:{n:'루시 스틸',role:'스틸의 동행인',source:url('루시 스틸')},
  pocoloco:{n:'포코로코',role:'레이스 참가자',source:url('포코로코')},norisuke:{n:'히가시카타 노리스케',role:'레이스 참가자',source:'https://namu.moe/w/'+encodeURIComponent('히가시카타 노리스케')},
  dot:{n:'도트 칸',role:'레이스 참가자',source:url('도트 칸')},avdol:{n:'우루무드 압둘',role:'낙타를 탄 참가자',source:url('우루무드 압둘')},
  gaucho:{n:'가우쵸',role:'레이스 참가자',source:url('가우쵸')},dixie:{n:'딕시 치킨',role:'레이스 참가자',source:url('스틸 볼 런')},sloop:{n:'슬룹 존 B',role:'레이스 참가자',source:url('스틸 볼 런')}
 }};
 D.equipmentSlots={weapon:'무기',charm:'보조 장비'};D.economy.market.name=D.world.marketName;
 const wear={rein:'말 · 고삐',coat:'몸통',pouch:'허리',compass:'휴대',riding_gloves:'손',travel_boots:'발',padded_vest:'몸통',steel_bracer:'팔',field_kit:'허리',balanced_harness:'말 · 마구',magnetic_spurs:'발',amber_goggles:'눈',lined_bandolier:'몸통',barbed_lariat:'휴대',counter_bracer:'팔',dusk_scarf:'목',survey_watch:'휴대',muzzle_wrap:'총신',endurance_saddle:'말 · 안장',silver_reins:'말 · 고삐',trophy_gyro:'손',trophy_johnny:'총신',trophy_diego:'발',trophy_hotpants:'허리',trophy_sandman:'발',trophy_blackmore:'몸통',trophy_wekapipo:'손목',trophy_magenta:'몸통',trophy_valentine:'휴대',route_bulwark:'몸통'};
 for(const it of Object.values(D.items))if(it.slot)it.wear=wear[it.id]||'손';
 const supply=D.events.find(e=>e.id==='supply_caravan');
 supply.t='SBR 대회 보급소';supply.actor='official';supply.x='스티븐 스틸이 주최한 레이스의 깃발 아래, 스피드왜건 석유회사와 윈체스터 총포사의 이름이 적힌 상자가 놓여 있다. 진행요원이 참가자를 확인하고, 의무원과 정비공이 다음 출발을 준비한다.';supply.c[0].l='보급소를 떠나 여정을 계속한다';supply.c[0].ok.t='대회 깃발을 뒤로하고 가던 길을 이어 갔다.';
 const black=D.events.find(e=>e.id==='hidden_trader');black.x='공식 보급소 뒤쪽에서 이름을 밝히지 않는 상인이 천막을 들어 올린다. 대회 후원사의 표식이 없는 상자들이다. 상인은 출처 대신 값을 적은 쪽지를 내민다.';black.c[0].l='대회 보급소로 돌아간다';black.c[0].ok.t='천막을 나와 대회 깃발이 보이는 쪽으로 돌아갔다.';black.c[1].l='거래를 마치고 보급소를 떠난다';black.guide=black.guide.replace('상단으로','보급소로');
 refineChoices(D);
 const option=(l,t,fx={},extra={})=>({l,ok:{t,fx},...extra});
 const add=(id,t,x,actor,c,extra={})=>D.events.push({id,t,x,actor,c,where:['road','explore','camp','town'],from:1,to:9,weight:5,once:true,...extra});
 D.routes.push({id:'rescued_rider',n:'길 위의 보답',ending:'위험한 길에서 멈춰 선 선택이 뜻밖의 보답으로 돌아왔다.'},{id:'lucy_note',n:'봉인된 쪽지',ending:'눈에 띄지 않는 부탁을 끝까지 맡아 자신의 길을 이어 갔다.'},{id:'press_story',n:'신문에 남긴 길',ending:'자신이 지나온 길의 일부가 다른 사람에게 전해졌다.'});
 add('rescued_rider_return','보급소에 맡겨진 작은 상자','진행요원이 당신의 이름이 적힌 상자를 꺼낸다. 길에서 도움을 받았던 참가자가 보답을 맡기고 갔다고 한다. 상자에는 나침반과 여비가 함께 들어 있다.','official',[
  option('나침반을 받는다','손때 묻은 나침반을 챙기고 남은 여비는 돌려보냈다.',{item:'compass',route:{id:'rescued_rider',result:'delivered'}},{req:'noitem:compass'}),
  option('장비 대신 여비를 받는다','기존 장비를 유지하고 다음 구간에 쓸 여비를 챙겼다.',{money:20,route:{id:'rescued_rider',result:'shared'}})
 ],{req:['flag:helped_rider','noroute:rescued_rider'],after:{flag:'helped_rider',ticks:2},priority:10});
 add('stephen_briefing','스티븐 스틸의 출발 안내','스티븐 스틸이 대회 깃발 앞에서 진행요원들과 서류를 확인한다. 노선 안내를 받아 가려는 참가자와 자신이 지나온 길을 설명하려는 참가자가 줄을 나누어 선다.','stephen',[
  option('위험 구간의 안내를 받아 간다','진행요원이 표시한 위험 구간을 지도에 옮겨 적었다.',{flag:'heard_warning'}),
  option('안내는 나중에 받고 출발을 준비한다','수통과 짐의 매듭을 확인하고 출발선 쪽으로 돌아갔다.',{hp:10})
 ],{to:2});
 add('official_route_check','진행요원의 검인','진행요원이 참가 서류와 노선 표식을 대조한다. 옆 작업대에는 다음 초소로 옮길 서류 가방이 놓여 있다.','official',[
  option('검인을 마치고 휴식한다','서류를 돌려받고 그늘에서 잠시 쉬었다.',{hp:10}),
  option('다음 초소의 서류 운반을 맡는다','가벼운 서류 가방을 안장에 묶고 약속한 초소의 위치를 확인했다.',{flag:'official_dispatch'})
 ]);
 add('official_dispatch_return','다음 초소의 서류 가방','다음 초소의 진행요원이 봉인을 살피고 서류 가방을 받아 든다. 책상 위에는 약속한 품삯과 참가자용 식사가 준비되어 있다.','official',[
  option('품삯을 받는다','서류 인계에 서명하고 품삯을 챙겼다.',{money:22,flag:'official_dispatch_done'}),
  option('품삯 대신 식사와 응급처치를 받는다','가방을 내려놓고 따뜻한 식사와 치료를 받았다.',{hp:28,flag:'official_dispatch_done'})
 ],{req:['flag:official_dispatch','noflag:official_dispatch_done'],after:{flag:'official_dispatch',ticks:2},priority:8});
 add('press_story_1','후원 신문사의 취재','후원 신문사의 기자가 노트와 사진기를 들고 다가온다. 기사에 실을 레이스 체험담을 찾고 있지만, 당신의 이름과 지나온 길도 함께 공개할 생각이다.','reporter',[
  option('이름을 밝히고 취재에 응한다','기자가 이름과 체험담을 받아 적었다. 기사가 실리면 다음 보급소에 한 부 맡기겠다고 했다.',{flag:'press_interviewed'}),
  option('이름을 밝히지 않고 취재를 사양한다','기자의 노트를 덮게 하고 남은 휴식 시간을 지켰다.',{hp:12})
 ],{to:7,req:'noflag:press_interviewed'});
 add('press_story_2','기사 옆에 적힌 이름','진행요원이 접힌 신문을 내민다. 낯익은 길의 묘사 아래 자신의 이름이 적혀 있다. 신문사에서 맡긴 사례도 함께 도착했다.','reporter',[
  option('취재 사례를 받는다','자신의 이름이 적힌 기사를 접어 넣고 사례를 받았다.',{money:24,route:{id:'press_story',result:'published'}}),
  option('사례 대신 취재용 방풍 안경을 받는다','기자가 쓰던 예비 안경을 받아 먼지를 닦았다.',{item:'amber_goggles',route:{id:'press_story',result:'equipped'}},{req:'noitem:amber_goggles'})
 ],{from:2,req:['flag:press_interviewed','noroute:press_story'],after:{flag:'press_interviewed',ticks:2},priority:8});
 add('lucy_note_1','루시 스틸의 봉인된 쪽지','루시 스틸이 주변을 살피고 작은 봉투를 내민다. 다음 초소의 진행요원에게 직접 전해 달라는 부탁이다. 봉투 겉면에는 받는 사람을 구분할 짧은 표식만 남아 있다.','lucy',[
  option('봉인을 그대로 두고 맡는다','봉투를 옷 안쪽에 넣고 약속한 표식을 기억했다.',{flag:'lucy_note_carried'}),
  option('운반은 맡지 않고 자리를 비켜 준다','루시가 다른 전달자를 찾을 수 있도록 길을 비켜 주었다.',{hp:8,route:{id:'lucy_note',result:'declined'}})
 ],{from:3,to:7});
 add('lucy_note_2','초소 안쪽의 표식','루시가 알려 준 표식을 단 진행요원이 당신을 알아본다. 사람이 많은 접수대 대신 천막 안쪽의 조용한 책상을 가리킨다.','official',[
  option('안쪽에서 봉투를 직접 건넨다','봉인이 온전한 것을 확인받고 짧은 답신을 들었다.',{money:18,card:'sbr_basic_step',route:{id:'lucy_note',result:'delivered'}}),
  option('접수대에 봉투를 맡기고 바로 떠난다','봉투를 접수대에 남기고 기다리지 않은 채 길을 나섰다.',{hp:16,route:{id:'lucy_note',result:'parted'}})
 ],{from:3,req:['flag:lucy_note_carried','noroute:lucy_note'],after:{flag:'lucy_note_carried',ticks:2},priority:8});
 add('pocoloco_path','포코로코가 고른 길','포코로코가 울퉁불퉁한 내리막을 망설임 없이 달려간다. 낮게 드리운 나뭇가지 사이로 버려진 보급 상자가 보인다. 웃음소리는 이미 멀어지고 있다.','pocoloco',[
  {l:'같은 내리막에서 보급을 챙긴다',check:{s:'eva',dc:40},ok:{t:'튀어 오른 안장을 붙잡고 상자에 닿았다.',fx:{money:20}},fail:{t:'나뭇가지를 피하다 짐을 놓쳤다. 포코로코를 따라가기는 그만두었다.',fx:{hp:-5}}},
  option('그의 운에 기대지 않고 완만한 길을 간다','먼 길을 돌아 말과 자신의 호흡을 골랐다.',{hp:10})
 ],{to:3});
 add('norisuke_photo','노리스케의 기념사진','히가시카타 노리스케가 사진기에 맞춰 자세를 고친다. 촬영이 끝나자 노선 지도를 펼치고 자신이 본 길과 당신이 본 길을 비교해 보자고 손짓한다.','norisuke',[
  option('사진 뒤편에서 길 정보를 나눈다','서로 다른 표식을 맞춰 보며 위험한 갈림길을 지도에 남겼다.',{flag:'heard_warning'}),
  option('인사만 하고 쉬어 간다','촬영이 끝나기를 기다렸다가 인사를 건네고 물을 마셨다.',{hp:12})
 ],{from:4,to:6});
 add('dot_khan_pace','도트 칸의 말발굽','도트 칸의 말이 일정한 간격으로 흙을 걷어찬다. 따라가며 발굽의 간격을 살필 수도 있지만, 자신의 말은 이미 숨이 거칠어져 있다.','dot',[
  {l:'발굽의 간격을 따라 속도를 맞춘다',check:{s:'spd',dc:30},ok:{t:'말을 몰아붙이는 대신 박자를 맞추는 요령을 잡았다.',fx:{spd:1}},fail:{t:'자신에게 맞지 않는 박자를 억지로 좇아 몸이 굳었다.',fx:{hp:-4}}},
  option('거리를 두고 말의 숨을 고른다','발굽 소리가 멀어질 때까지 자신의 박자를 지켰다.',{hp:12})
 ],{to:3});
 add('avdol_camel','우루무드 압둘의 낙타','출발선 가까이에서 우루무드 압둘의 커다란 낙타가 다른 탈것 사이로 고개를 내민다. 진행요원이 몰려든 구경꾼을 물리고 참가 서류를 확인한다.','avdol',[
  option('낙타의 발과 모래에 남은 자국을 관찰한다','넓게 찍힌 자국과 자신의 말발굽을 비교했다.',{card:'sbr_basic_step'}),
  option('구경꾼을 피해 출발 준비를 마친다','복잡한 줄에서 벗어나 물과 짐을 정리했다.',{hp:10})
 ],{to:1});
 add('gaucho_range','가우쵸의 사격 거리','가우쵸가 권총을 꺼내 멀리 있는 나무를 겨눈다. 표적 옆에는 조금 전 탄환이 빗겨간 자국이 남아 있다. 가까운 표적을 새로 세울 자리는 비어 있다.','gaucho',[
  option('가까운 표적으로 자신의 사거리를 확인한다','맞힐 수 있는 거리부터 확인하고 총을 거두었다.',{card:'sbr_basic_aim'}),
  option('탄피 정리를 도와 품삯을 받는다','사격장 관리인의 부탁으로 흩어진 탄피를 모았다.',{money:10})
 ],{from:2,to:3});
 add('dixie_camp','딕시 치킨과 나눈 모닥불','딕시 치킨이 말 옆에 짐을 내려놓는다. 다른 참가자들이 떠난 모닥불에는 아직 불씨가 남아 있고, 건너편에는 물을 길어 올 도구가 놓여 있다.','dixie',[
  option('불가에 앉아 충분히 쉰다','불씨를 살려 몸을 녹이고 긴 주행의 피로를 풀었다.',{hp:18}),
  option('물을 길어 야영객에게 나누고 품삯을 받는다','수통을 채워 나른 뒤 약속한 품삯을 받았다.',{money:12,hp:4})
 ],{to:5});
 add('sloop_crossing','슬룹 존 B의 물가','슬룹 존 B가 얕은 물가를 살피고 있다. 물에 잠긴 길을 곧장 건너면 다음 표지에 빨리 닿겠지만, 물살 아래의 돌은 잘 보이지 않는다.','sloop',[
  {l:'돌의 간격을 읽고 건넌다',check:{s:'eva',dc:45},ok:{t:'미끄러운 돌을 피해서 건너며 균형을 잡는 법을 익혔다.',fx:{eva:1,money:8}},fail:{t:'발을 헛디뎌 젖은 짐을 다시 묶어야 했다.',fx:{hp:-5}}},
  option('상류의 다리로 돌아간다','물가를 떠나 다리를 건넌 뒤 잠시 쉬었다.',{hp:8})
 ],{from:5,to:8});
 const names=['샌디에이고 비치','애리조나 사막 횡단','록키 마운틴','대초원의 작은 묘표','일리노이 스카이라인','미시건 레이크라인','필라델피아 트라이앵글','보스 사이드 나우','맨해튼 랩소디'];
 const descriptions=['출발선 너머의 해안','모뉴먼트 밸리로 이어지는 사막','캐논 시티로 이어지는 산길','캔자스시티를 향한 대초원','시카고와 미시건 해협','마키노 시티와 휴런 호수','필라델피아를 향한 노선','뉴저지의 마지막 주행','맨해튼 섬의 결승선'];
 D.stages.forEach((s,i)=>{s.n=names[i];s.d=descriptions[i];});
 const stageStories=[['해안 초소의 명부','출발선의 모래를 털어 내는 참가자들 사이에서 진행요원이 이름을 확인한다.'],['사막의 급수 통','스피드왜건 석유회사의 이름이 적힌 상자 옆에 급수 통이 놓여 있다. 진행요원이 참가자들을 차례로 부른다.'],['산행을 앞둔 매듭','산길 초소의 진행요원이 무너진 노면을 지도에 표시하고 있다.'],['초원의 바람','대초원에 세운 깃발이 한쪽으로 길게 휘어진다. 초소에는 바람을 피할 천막이 남아 있다.'],['도시의 취재 수첩','후원 신문사의 기자가 시카고로 들어오는 참가자들의 이름을 적는다.'],['호숫가의 정비대','호숫바람을 맞은 장비가 젖어 있다. 윈체스터 총포사의 표식 아래 정비공이 마른 천을 펴 놓는다.'],['동쪽 초소의 표식','필라델피아 쪽 노선을 가리키는 표식 아래 진행요원이 서 있다.'],['뉴저지의 마지막 초소','다음 출발을 기다리는 참가자들 사이로 결승에 관한 이야기가 오간다.'],['맨해튼의 참가 기록','마지막 초소의 진행요원이 당신의 이름을 명부에서 찾아낸다. 결승선을 향한 길이 가까워졌다.']];
 const stageChoices=[
  [option('명부 확인을 마치고 짐을 정리한다','자신의 이름을 확인하고 짐을 내려 잠시 쉬었다.',{hp:12}),option('무거운 짐을 다시 묶으며 자세를 고친다','안장에 걸린 무게를 고르게 나누며 힘을 쓰는 자세를 고쳤다.',{atk:1})],
  [option('수통을 채우고 그늘에서 쉰다','물을 나누어 마시고 달아오른 몸을 식혔다.',{hp:16}),option('급수 통을 나르는 일을 돕는다','통을 채워 나르고 보급 담당에게 품삯을 받았다.',{money:12})],
  [option('산행용 밧줄을 묶는 법을 익힌다','밧줄이 풀리지 않는 매듭과 몸을 지탱할 위치를 확인했다.',{card:'sbr_basic_guard'}),option('무너진 노면의 표식을 살핀다','돌이 구르는 방향과 우회할 틈을 눈에 익혔다.',{eva:1})],
  [option('맞바람 속에서 자세를 고쳐 잡는다','몸이 바람에 들리지 않도록 힘을 모으는 위치를 바꿨다.',{atk:1}),option('천막에서 바람을 피하며 쉰다','모래를 털고 천막 안쪽에서 몸을 풀었다.',{hp:14})],
  [option('자신의 이름으로 취재에 응한다','기자가 당신의 이름과 지나온 길을 기사 수첩에 적었다.',{flag:'press_interviewed'},{req:'noflag:press_interviewed'}),option('취재를 사양하고 물가에서 쉰다','붐비는 길을 벗어나 조용한 곳에서 다리를 풀었다.',{hp:12})],
  [option('마른 천으로 장비와 손을 닦는다','미끄러지던 손잡이를 닦고 움직임을 다시 확인했다.',{card:'sbr_basic_step'}),option('의무원에게 젖은 붕대를 갈아 달라고 한다','상처를 씻고 마른 붕대로 다시 감았다.',{hp:16})],
  [option('다음 표식을 찾는 요령을 확인한다','바람에 돌아간 표지와 바닥의 흔적을 대조했다.',{eva:1}),option('진행요원의 서류 가방을 맡는다','다음 초소에 인계할 가방의 봉인을 확인했다.',{flag:'official_dispatch'},{req:'noflag:official_dispatch'})],
  [option('다음 출발 전 충분히 쉬어 둔다','마지막 급수를 마치고 안장 옆에서 눈을 붙였다.',{hp:20}),option('짧게 달리며 출발 박자를 맞춘다','긴장을 풀고 말과 함께 움직일 박자를 골랐다.',{spd:1})],
  [option('명부 검인을 마치고 마지막 휴식을 취한다','이름 옆에 찍힌 검인을 확인하고 숨을 골랐다.',{hp:20}),option('혼잡한 길의 틈을 미리 살핀다','사람과 말이 몰린 길에서 피해야 할 틈을 눈에 익혔다.',{eva:1})]
 ];
 stageStories.forEach(([t,x],i)=>{const e=D.events.find(e=>e.id==='stage_story_'+(i+1));e.t=t;e.x=x;e.actor=i===4?'reporter':'official';e.c=stageChoices[i];});
}

function refineChoices(D){
 // Curate individual common events; route alternatives are authored at their source.
 for(const id of ['broken_wagon','dust','reins','night_ride','cold_rain','camp_practice','camp_watch','camp_gear','tracks','town_letters','town_merchant','town_repairs']){const e=D.events.find(e=>e.id===id);e.c=e.c.slice(0,id==='town_merchant'||id==='town_repairs'?3:2);}
 D.events.find(e=>e.id==='fallen_pack').c.pop();
 D.events.find(e=>e.id==='town_clinic').c.pop();
 const broker=D.events.find(e=>e.id==='town_broker');broker.c=broker.c.slice(0,3);
 const gun=D.events.find(e=>e.id==='gunfire');gun.c=gun.c.slice(0,3);Object.assign(gun.c[2],{cost:6,hint:'붕대 비용 · 구조한 참가자의 후속 보답',req:'noflag:helped_rider'});gun.c[2].ok.fx={flag:'helped_rider'};gun.c[2].ok.t='붕대를 사서 부상자를 옮긴 뒤 진행요원에게 인계했다. 참가자는 당신의 이름을 물었다.';
}
