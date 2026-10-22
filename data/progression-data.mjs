export function addProgressionData(D){
 D.items={};D.routes=[];
 const effect=(on,fx,to='self')=>({on,fx,to,limit:1});
 const item=(id,n,d,effects,extra={})=>D.items[id]={id,n,d,effects,...extra};
 const opt=(l,t,fx={},req)=>({l,ok:{t,fx},...(req?{req}: {})});
 const event=(id,t,x,c,extra={})=>D.events.push({id,t,x,c,where:['road','explore','camp','town'],from:1,to:9,weight:2,once:true,...extra});
 const flags=(id,step)=>'story_'+id+'_'+step;
 const profiles=[
 ['ranch','고삐에 남은 습관','말이 작은 손짓에 반응한다. 목장에서 익힌 힘 조절을 싸움에도 쓸 수 있을 듯하다.','달려드는 힘을 흘리고 다시 중심을 잡는 연습을 했다.','상대의 힘을 받는 순간에도 자신의 자세를 잃지 않았다.','atk','charge'],
 ['frontier','경계선의 표식','바람에 쓰러진 경계 표식을 발견했다. 개척지에서 보던 방식으로 길을 다시 표시할 수 있다.','사각에서 날아오는 돌멩이를 표식 삼아 거리를 재었다.','낯선 땅에서도 자신이 설 거리를 먼저 정할 수 있게 됐다.','eva','shield'],
 ['drifter','떠돌이의 뒷길','옛 야영지의 흔적을 알아봤다. 정면으로만 달리지 않아도 길은 이어진다.','발을 바꾸는 순간에 시선을 다른 곳으로 유도했다.','물러서는 발걸음도 다음 공격을 준비하는 움직임이 됐다.','spd','breath'],
 ['marksman','흔들리는 조준선','말 위에서 총구가 흔들렸다. 집안에서 배운 고정 자세를 그대로 고집할 수는 없다.','말발굽이 땅에 닿는 박자에 맞춰 표적을 좇았다.','정지한 표적에서 배운 조준을 달리는 자신에게 맞췄다.','atk','charge'],
 ['medic','붕대를 묶는 손','길가의 붕대를 보고 손이 먼저 움직였다. 남을 돌보던 기술로 자신의 약점을 살필 차례다.','움직임을 막지 않게 붕대를 감고 짧게 자세를 바꿨다.','상처를 숨기기보다 다친 몸에 맞춰 싸우는 법을 익혔다.','eva','shield'],
 ['caravan','마차 옆의 자리','호위하던 시절에는 늘 짐을 등지고 섰다. 이제 지켜야 할 것은 자신의 여정이다.','한쪽을 막고 나머지 방향에 집중하는 자세를 반복했다.','공격을 모두 피하려 애쓰는 대신 받아낼 순간을 구분했다.','atk','shield'],
 ['craftsman','손잡이의 작은 틈','손잡이의 미세한 틈이 힘을 빼앗고 있었다. 공방에서 배운 눈으로 자신의 무기를 다시 살폈다.','재료를 바꾸고 무게 중심을 손안으로 끌어왔다.','고친 무기가 손의 일부처럼 움직이기 시작했다.','atk','charge'],
 ['riverboat','물결과 같은 발','모래 위의 움직임에서 물살을 떠올렸다. 뱃사람의 균형은 땅 위에서도 쓸모가 있다.','밀려나는 방향을 따라 발을 옮기며 중심을 지켰다.','충돌을 거스르지 않고 다음 움직임으로 이어 갔다.','eva','breath'],
 ['miner','암반을 읽는 감각','바위의 가는 균열을 알아봤다. 광산에서 배운 것은 세게 치는 일만이 아니었다.','약한 틈에 힘을 집중하고 튀는 파편을 견뎠다.','단단한 상대도 빈틈을 찾으면 무너질 수 있다는 감각이 남았다.','atk','shield'],
 ['performer','박수 없는 무대','관객 없는 들판에서 몸을 풀었다. 공연에서 익힌 박자를 전투의 움직임으로 바꿔 볼 수 있다.','같은 동작의 간격을 바꾸며 상대가 기다리는 순간을 피했다.','보여 주는 움직임과 실제로 힘을 싣는 순간을 구분했다.','spd','breath'],
 ['scout','끊어진 흔적','바람이 발자국을 지웠지만 작은 풀잎은 아직 누워 있었다. 길잡이의 눈이 다음 방향을 찾았다.','보이는 것보다 사라진 흔적을 먼저 살폈다.','눈앞의 움직임만 좇지 않고 이어질 길을 읽었다.','eva','breath'],
 ['messenger','전해지지 않은 말','초소에서 반송된 편지를 보았다. 우편 기수였던 당신은 길이 끊기는 의미를 안다.','도착할 곳을 먼저 정하고 돌아갈 여유까지 남겼다.','앞으로 나아갈 이유가 분명해지자 발걸음에도 망설임이 줄었다.','spd','charge'],
 ['steel','철구가 돌아오는 길','철구가 돌아온 자리에 작은 원이 남았다. 손목의 힘과 말의 박자를 함께 살필 수 있다.','철구를 던진 뒤에도 원의 중심을 놓치지 않으려 했다.','회전의 궤도에 다른 싸움에서 얻은 요령을 섞을 여유가 생겼다.','atk','charge'],
 ['satellite','궤도의 간격','자신의 주위를 맴도는 움직임 사이에서 빈 간격을 발견했다.','먼저 힘을 모으고 궤도가 겹치는 순간을 기다렸다.','크게 움직이지 않아도 힘을 한곳에 모으는 방식을 익혔다.','eva','charge'],
 ['hamon','먼지 속의 호흡','건조한 바람 속에서는 익숙한 호흡도 흐트러졌다. 폐보다 먼저 자세를 고칠 필요가 있었다.','말 위에서도 숨을 끊지 않도록 작은 동작부터 맞췄다.','배운 호흡을 다른 기술과 함께 사용할 수 있게 됐다.','spd','breath'],
 ['vampire','긴 그림자의 휴식','해가 기울자 몸의 긴장이 달라졌다. 자신의 몸이 회복하는 순간을 살필 수 있다.','상처가 아물 시간을 벌며 상대의 거리를 벗어났다.','회복만 믿고 버티기보다 위험을 줄이며 기회를 잡았다.','eva','shield'],
 ['pillar','몸이 기억하는 형태','익숙한 움직임을 버리자 몸이 다른 자세를 찾았다. 힘을 쓰는 순서가 중요해 보인다.','단단히 버티는 자세와 빠르게 움직이는 자세를 번갈아 익혔다.','하나의 자세에 갇히지 않고 상황에 맞춰 중심을 바꿨다.','atk','shield'],
 ['sword','칼끝의 긴장','칼끝이 흔들릴 때마다 손이 먼저 굳었다. 힘을 더 주는 대신 풀어야 할 부분을 찾았다.','상대가 다가오는 박자에 맞춰 칼을 거두고 다시 내밀었다.','칼에 끌려가지 않고 자신이 멈출 순간을 정했다.','atk','charge'],
 ['thread','매듭의 기억','풀린 실을 다시 감으며 힘이 전달되는 지점을 찾았다.','한 번에 조이기보다 여러 지점의 긴장을 나눠 유지했다.','실의 움직임과 자신의 발걸음을 한 흐름으로 이었다.','eva','shield'],
 ['colony','작은 움직임들의 합','흩어진 움직임을 하나씩 맞추려 하자 오히려 흐름이 끊겼다.','각 움직임이 돌아갈 자리를 남기고 전체의 박자를 맞췄다.','빠진 부분을 다른 움직임으로 메우는 여유가 생겼다.','spd','breath'],
 ['pistols','탄환 사이의 틈','같은 사격이라도 준비하는 순간이 다르다는 것을 알아봤다.','발사보다 먼저 다음 사격을 준비할 거리를 정했다.','한 발의 결과에 매달리지 않고 이어지는 공격을 만들었다.','atk','charge'],
 ['time','멈춤 뒤의 한 걸음','짧은 정적 뒤에도 자신의 몸은 다음 움직임을 준비해야 했다.','멈춘 순간을 길게 쓰려 하기보다 끝난 뒤의 자세를 정했다.','특별한 순간과 평소의 움직임을 함께 연결할 수 있게 됐다.','spd','breath']
 ];
 for(const o of D.starts){o.deckPolicy=['steel','time'].includes(o.id)?'fixed':'flexible';o.rewardPolicy=o.deckPolicy==='fixed'?'cash':'choice';}
 for(const w of D.birth.tables.weapons){const id='weapon_'+w.id,kind=['lasso','whip','unarmed'].includes(w.id)?'defense':'hit',kw=['rifle','revolver','lance','hatchet'].includes(w.id)?'charge':['knife','bowie','sabre','shotgun','knuckles'].includes(w.id)?'breath':'shield';
  item(id,w.n,'일반 무기',[],{slot:'weapon',basic:true,stats:{...w.fx},tuning:{on:kind,fx:{[kw]:1},max:4}});w.item=id;
 }
 item('rein','손에 맞춘 고삐','전투 시작: 기세 +2.',[effect('battleStart',{charge:2})],{slot:'charm',price:28});
 item('coat','덧댄 여행 외투','전투 시작: 보호막 +7.',[effect('battleStart',{shield:7})],{slot:'charm',price:32});
 item('pouch','응급 약주머니','전투 시작: HP +7.',[effect('battleStart',{hp:7})],{slot:'charm',price:24});
 item('compass','손때 묻은 나침반','턴 시작: 호흡 +1.',[effect('roundStart',{breath:1})],{slot:'charm'});
 item('sealed_letter','봉인된 운송 서류','주인을 확인하기 전까지 함부로 버릴 수 없는 서류.',[]);
 item('pass','초소의 통행 증서','당신이 맡은 일을 끝냈다는 기록. 특별한 거래의 조건입니다.',[]);
 item('spiral_note','회전 관찰 수첩','방어 카드 사용 시 턴당 1회 기세 +1.',[effect('defense',{charge:1})]);
 item('shelter_mark','피난처의 표식','전투 시작: 보호막 +3.',[effect('battleStart',{shield:3})]);
 for(const [id,title,a,b,c,stat,kw]of profiles){const root=flags(id,1),mid=flags(id,2),master=flags(id,'master'),done='origin_'+id,hidden=D.starts.find(o=>o.id===id).hidden;
  item('lesson_'+id,title+'의 기록',`턴 시작: ${D.keywords[kw].n} +1.`,[effect('roundStart',{[kw]:1})]);
  D.routes.push({id:done,n:title,ending:'자신에게 맞는 싸움의 방식을 끝까지 다듬었다.'});
  event(done+'_1',title,a,[opt('발견한 감각을 시험해 본다','작은 차이를 기억해 두었다.',{flag:root}),opt('지금은 자신의 페이스를 지킨다','새 연습을 시작하지 않고 레이스에 집중했다.',{route:{id:done,result:'declined'}})],{req:['origin:'+id,'noroute:'+done,'noflag:'+root],to:5,weight:hidden?2:3});
  const ok={flag:[mid,master],count:{practice:1}},fail={flag:mid,hp:-4};
  const practice=hidden?opt('세 번의 공방 동안 자세를 유지한다','지나가던 무명 기수에게 짧은 대련을 청했다.',{combat:{objective:{type:'survive',rounds:3},winFx:ok,winText:b,loseFx:fail,rewards:false,nonlethal:true}}):{l:'익숙한 기술을 새로운 상황에 맞춘다',check:{s:stat,dc:35},ok:{t:b,fx:ok},fail:{t:'아직 움직임이 어긋났다. 부족한 부분을 기록했다.',fx:fail}};
  event(done+'_2',title+' · 실전',b,[practice,opt('무리하지 않고 기본 동작을 정리한다','지금 가능한 범위까지 익혔다.',{flag:mid,hp:5})],{req:['flag:'+root,'noflag:'+mid],after:{flag:root,ticks:2},priority:20,to:7});
  event(done+'_3',title+' · 자신의 방식',c,[opt('배운 요령을 전투에 통합한다','지금의 덱을 유지하면서 새 기술을 섞을 여유가 생겼다.',{item:'lesson_'+id,unlockDeck:true,route:{id:done,result:'mastered'}},'flag:'+master),opt('안정된 동작으로 여정을 이어 간다','자신에게 맞는 페이스를 지키기로 했다.',{eva:1,hp:8,route:{id:done,result:'adapted'}})],{req:['flag:'+mid,'noroute:'+done],after:{flag:mid,ticks:1},priority:20,to:8});
 }
 // The same common trigger schema serves every experience; no character-specific resolver.
 const specials={gyro:effect('defense',{charge:1}),johnny:effect('hit',{rupture:1},'opponent'),diego:effect('hit',{bleed:1},'opponent'),hotpants:effect('battleStart',{hp:8}),mountain:effect('defense',{shield:2}),oye:effect('hit',{burn:1},'opponent'),ringo:effect('roundStart',{breath:1}),sandman:effect('hit',{sink:1},'opponent'),blackmore:effect('battleStart',{breath:2}),wekapipo:effect('hurt',{charge:1}),magenta:effect('hurt',{shield:2}),valentine:effect('roundStart',{shield:1}),otherdiego:effect('defense',{breath:2})};
 const names={battleStart:'전투 시작',roundStart:'턴 시작',hit:'적중 시',hurt:'피격 시',defense:'방어 카드 사용 시'};
 let index=0;for(const [id,r]of Object.entries(D.relics)){const p=specials[id]||effect('battleStart',{[['shield','charge','breath'][index++%3]]:1});r.effects=[p];r.d+=' · '+names[p.on]+': '+(p.to==='opponent'?'상대 ':'')+Object.entries(p.fx).map(([k,v])=>(D.keywords[k]?.n||'HP')+' +'+v).join(' · ')+(p.on==='battleStart'?'':' (턴당 1회)');}
 for(const boss of D.hiddenBosses){const id=boss.id,e=D.enemies[id];
  if(boss.ally){const f='ally_help_'+id;event('ally_'+id+'_1',e.n+'과 다시 마주한 길','잠시 함께 달렸던 상대가 다음 길의 위험을 알려 주었다. 이번에는 당신이 보급을 나눌 수 있다.',[opt('보급을 나누고 길을 함께 살핀다','도움을 주고받은 경험이 남았다.',{flag:f,hp:8},{any:['item:pouch','talent:survivor','flag:heard_warning']}),{...opt('보급을 마련해 나눈다','보급을 나누고 안전한 길을 확인했다.',{flag:f}),cost:12},opt('서로의 행운을 빌고 떠난다','동맹은 기억하되 지금의 길을 지키기로 했다.',{route:{id:'ally_'+id,result:'parted'}})],{req:['ally:'+id,'noroute:ally_'+id],priority:9});event('ally_'+id+'_2','되돌아온 길 안내','나눴던 보급에 대한 답이 도착했다. 돌아갈 필요 없이 다음 초소에서 필요한 물건을 받을 수 있다.',[opt('남겨 둔 물건을 받는다','이어지는 길에서 서로를 도운 기록이 남았다.',{item:'compass',route:{id:'ally_'+id,result:'helped'}}),opt('보급을 다른 참가자에게 양보한다','도움을 이어 주고 가벼운 몸으로 떠났다.',{spd:1,route:{id:'ally_'+id,result:'shared'}})],{req:['flag:'+f,'noroute:ally_'+id],after:{flag:f,ticks:3},priority:15});D.routes.push({id:'ally_'+id,n:e.n+'과 나눈 도움',ending:'짧은 동행 뒤에도 서로의 길에 도움이 되는 선택을 남겼다.'});}
 }
 D.routes.push({id:'delivery',n:'봉인된 운송 서류',ending:'레이스 도중 맡은 서류를 끝까지 전했다.'},{id:'spiral',n:'회전의 흔적',ending:'발견한 흔적을 자신의 전투 방식과 연결했다.'},{id:'shelter',n:'폭풍 속 피난처',ending:'길 위에 머물 곳을 남기고 결승선으로 향했다.'});
 event('delivery_1','주인 없는 운송 서류','초소 직원이 다음 구간으로 갈 서류를 맡길 기수를 찾는다. 봉투 안의 이름을 묻자 잠시 머뭇거린다.',[opt('봉인을 지킨 채 맡는다','서류를 받아 다음 초소로 향했다.',{item:'sealed_letter',flag:'delivery_started'}),opt('맡지 않고 떠난다','자신의 여정에 집중하기로 했다.',{route:{id:'delivery',result:'declined'}})],{where:['town','explore'],from:2,to:4,req:['noroute:delivery','noflag:delivery_started'],weight:2});
 event('delivery_2','갈림길의 검문','검문소에서 봉투를 넘기라는 요구를 받았다. 서류를 맡긴 초소의 표식과는 다르다.',[opt('봉인을 확인하고 정식 초소로 향한다','겉에 찍힌 인장을 대조해 우회로를 찾았다.',{flag:'delivery_safe'}, {any:['weapon:rifle','origin:messenger','talent:perceptive','item:compass']}),opt('서류를 지키며 추적자를 떼어 낸다','서류를 노리는 무명 추적자와 마주했다.',{combat:{winFx:{flag:'delivery_safe'},loseFx:{flag:'delivery_lost',consumeItem:'sealed_letter',route:{id:'delivery',result:'lost'}},nonlethal:true}}),opt('서류를 넘기고 물러난다','위험을 감수하지 않고 봉투를 넘겼다.',{consumeItem:'sealed_letter',money:15,route:{id:'delivery',result:'surrendered'}})],{req:['item:sealed_letter','flag:delivery_started','noroute:delivery'],after:{flag:'delivery_started',ticks:2},from:3,to:6,priority:16});
 event('delivery_3','봉인을 확인하는 손','정식 초소의 직원이 봉투의 봉인을 확인했다. 당신이 무엇을 지켰는지 묻지는 않았다.',[opt('사례와 증서를 받는다','맡은 일을 끝내고 통행 증서를 받았다.',{consumeItem:'sealed_letter',item:'pass',money:45,route:{id:'delivery',result:'delivered'}}),opt('사례 대신 길 안내를 받는다','돈보다 다음 길을 읽는 경험을 택했다.',{consumeItem:'sealed_letter',item:'compass',eva:1,route:{id:'delivery',result:'guided'}})],{req:['flag:delivery_safe','noroute:delivery'],from:3,to:7,priority:20});
 event('spiral_1','돌에 남은 나선','둥근 자국이 여러 겹 남은 돌을 발견했다. 이전에 보았던 회전과 닮았지만 직접 확인해야 할 차이가 있다.',[opt('차이를 관찰해 기록한다','회전이 멎은 자리부터 다시 살폈다.',{item:'spiral_note',flag:'spiral_started'}),opt('돌을 두고 길을 나아간다','지금은 흔적을 좇지 않기로 했다.',{route:{id:'spiral',result:'declined'}})],{where:['explore','road'],from:2,to:5,req:[{any:['origin:steel','relic:gyro','flag:route_gyro']},'noroute:spiral','noflag:spiral_started'],weight:2});
 event('spiral_2','원의 중심','수첩의 자국을 겹쳐 보자 자신의 움직임에서 놓친 중심이 보였다. 익숙한 전투 방식에도 적용할 수 있다.',[opt('회전의 동작을 몸에 익힌다','기세를 흘리지 않는 동작을 익혔다.',{flag:'spiral_practiced',atk:1}),opt('지금의 힘으로 거리를 다시 잰다','바꾸지 않고 활용할 부분을 정리했다.',{eva:1,route:{id:'spiral',result:'observed'}})],{req:['item:spiral_note','flag:spiral_started','noroute:spiral'],after:{flag:'spiral_started',ticks:2},priority:16,to:7});
 event('spiral_3','새로운 던지기','원을 그리며 날아간 철구가 곧게 손안으로 돌아온다. 몇 번이고 되풀이한 동작 끝에, 다른 무기를 쥔 손에도 같은 회전의 감각이 남는다.',[opt('철구 중심의 전투 방식을 살핀다','철구를 쥔 손에 힘을 주고 낯선 동작을 다시 되짚었다.',{form:'steel',route:{id:'spiral',result:'rotation'}}),opt('지금의 방식에 배운 요령을 더한다','익숙한 동작에 회전의 감각을 더해 힘이 새는 틈을 줄였다.',{unlockDeck:true,card:'sbr_basic_aim',route:{id:'spiral',result:'integrated'}})],{guideTitle:'전환 안내',guide:'철구 전투 방식을 선택하면 전용 덱으로 바꿀지 한 번 더 결정합니다. 지금의 방식을 유지하면 카드 보상을 받으며, 히든 출신은 일반 카드 대신 돈을 받습니다.',req:['flag:spiral_practiced','noroute:spiral'],priority:16,to:8});
 event('shelter_1','폭풍 앞의 빈 헛간','폭풍을 피할 헛간이 보이지만 지붕 한쪽이 무너졌다. 오늘만 버틸 수도, 다음 기수도 쓸 수 있게 고칠 수도 있다.',[{...opt('재료를 사서 지붕을 고친다','빈 헛간에 비를 피할 자리를 만들었다.',{flag:'shelter_built',hp:10}),cost:15},opt('자신이 머물 자리만 정리한다','밤을 넘길 자리를 마련했다.',{hp:15,route:{id:'shelter',result:'rested'}})],{where:['camp','road'],from:4,to:6,req:['noroute:shelter','noflag:shelter_built'],weight:3});
 event('shelter_2','뒤이어 도착한 기수','뒤늦게 헛간을 찾은 기수가 당신이 고친 지붕을 올려다봤다. 다음 초소로 갈 사람에게 표식을 전해 달라고 한다.',[opt('표식을 받아 전한다','길 위에서 받은 도움을 다음 구간으로 이었다.',{flag:'shelter_shared',item:'shelter_mark'}),opt('보답 없이 쉬도록 한다','받을 것을 정하지 않고 자리를 내주었다.',{hp:12,route:{id:'shelter',result:'sheltered'}})],{req:['flag:shelter_built','noroute:shelter'],after:{flag:'shelter_built',ticks:2},priority:15,to:7});
 event('shelter_3','지붕 아래 남긴 이름','다음 초소에서 헛간의 표식을 알아봤다. 건네받은 외투 안쪽에는 그날 머물렀던 기수들의 짧은 감사가 남아 있다.',[opt('남겨 둔 외투를 받는다','다음 비를 견딜 옷과 지나온 길의 기억을 얻었다.',{item:'coat',route:{id:'shelter',result:'connected'}}),opt('보급비로 받아 남은 길을 준비한다','자신이 필요한 방식으로 도움을 돌려받았다.',{money:35,route:{id:'shelter',result:'prepared'}})],{req:['flag:shelter_shared','item:shelter_mark','noroute:shelter'],priority:15,to:8});
 for(const id of ['rein','coat','pouch']){const it=D.items[id];event('shop_'+id,'초소의 여행 장비 · '+it.n,'상인이 마차에 걸어 둔 장비를 내려놓는다. 가죽의 이음새와 닳은 자국을 살피며 다음 길에 필요한 물건인지 가늠해 본다.',[{...opt('장비를 구입해 보관한다','필요할 때 장착할 수 있도록 물건을 챙겼다.',{item:id}),cost:it.price},opt('물건을 살피고 떠난다','남은 돈을 아꼈다.',{hp:3})],{where:['town'],req:['noitem:'+id],weight:6});}
 event('weapon_tune','초소의 무기 정비','익숙해진 무기를 손질해 다음 단계의 성능을 준비할 수 있다. 정비는 현재 사용 중인 무기의 경험을 보탠다.',[{...opt('정비를 맡긴다','무기의 균형을 맞추고 손에 익는 동작을 확인했다.',{count:{cards:6}}),cost:35},opt('기본 손질만 하고 떠난다','큰 정비는 다음으로 미뤘다.',{hp:4})],{where:['town'],req:['count:cards<18'],weight:5,once:false});
 event('pass_trade','증서를 알아본 상인','봉인 서류를 전한 기록을 보고 상인이 따로 남겨 둔 보급품을 꺼냈다.',[opt('초소의 특별 보급을 받는다','증서가 열어 준 거래로 여유를 얻었다.',{item:'pouch',money:12}),opt('먼 길을 위한 고삐를 고른다','다음 여정을 위한 준비를 마쳤다.',{item:'rein'})],{req:['item:pass'],priority:8});
 event('talent_work','떨리지 않는 손끝','작은 부품을 맞추던 기수가 당신의 손끝을 보고 도움을 청했다. 평소의 재능을 길 위에서도 활용할 수 있다.',[opt('정밀한 손질을 도와준다','가느다란 부품을 손상 없이 맞췄다.',{money:22,card:'sbr_basic_aim'},{any:['talent:steady','talent:surehands','talent:calm']}),opt('필요한 물품을 구해 준다','손질을 맡길 물건을 옮겨 주었다.',{money:8,hp:4})],{where:['town','camp'],weight:4});
 event('flaw_wound','다시 아픈 오래된 자리','말에서 내리자 예전의 상처가 당겼다. 같은 곳에 힘을 주는 습관을 바꿀 필요가 있다.',[{...opt('상처에 맞는 자세와 붕대를 배운다','약점을 감춘 채 무리하기보다 몸에 맞춰 움직이기로 했다.',{hp:14,maxHp:4,startBleed:-1}),cost:10},opt('몸을 쉬게 하며 움직임을 기록한다','상처를 살피며 다음 길을 준비했다.',{hp:12})],{req:{any:['flaw:oldwound','flaw:thinblood','flaw:wornbody']},where:['camp','town'],weight:5});
 event('used_technique','손이 먼저 기억한 동작','같은 기술을 반복하던 끝에 손이 먼저 다음 동작을 준비했다. 쌓인 사용 경험을 다듬을 수 있다.',[opt('힘을 모으는 박자를 기록한다','의식하지 않던 준비 동작을 자신의 요령으로 만들었다.',{item:'rein'}),opt('몸을 지키는 간격을 기록한다','공격 사이에 쉴 틈을 찾았다.',{item:'pouch'})],{req:['count:cards>=12'],priority:4});
 event('earned_rest','이겨 낸 뒤의 휴식','몇 번의 대결을 마친 뒤, 맞서지 않아도 되는 순간을 알아보게 됐다.',[opt('싸움에서 얻은 요령을 정리한다','다음 상대의 움직임을 먼저 읽을 여유가 생겼다.',{eva:1}),opt('보급을 정리하고 쉰다','부족한 보급을 채우고 몸을 돌봤다.',{money:12,hp:10})],{req:['beat:any'],where:['camp','town'],weight:4});
 const scenes=[['해안의 마지막 모래','바닷바람이 남은 발자국을 지운다. 출발선에서 가져온 긴장을 풀고 자신의 페이스를 정한다.'],['사막의 물 분배','작은 우물 앞에 말들이 모였다. 자신이 마실 물과 남은 길에 챙길 물을 나눠 담는다.'],['바위 그늘의 표식','바위 그늘에 앞선 기수의 짧은 경고가 남아 있다. 숨겨진 길보다 현재의 위험을 먼저 살핀다.'],['산길의 매듭','끊어진 끈이 바위에 걸렸다. 고도를 높이기 전에 자신의 장비를 다시 묶는다.'],['도시를 가로지르는 짐','사람과 마차가 길을 가득 채웠다. 말을 재촉하기보다 혼잡을 벗어날 순서를 정한다.'],['철길 옆의 빗소리','비가 철길 위에 고인다. 지나온 상처와 남은 장비를 한 번 더 확인한다.'],['동쪽으로 남은 표식','길을 알려 주던 표식이 드문드문 바뀐다. 익힌 요령 중 지금 쓸 것을 정리한다.'],['결승 너머의 불빛','멀리 목적지의 불빛이 보인다. 서두르기 전에 끝내지 못한 선택을 떠올린다.'],['자신의 이름을 적는 자리','결승선 앞의 기록대가 보인다. 어느 누구의 여정도 대신 쓰지 않고 자신이 지나온 길을 돌아본다.']];
 scenes.forEach(([t,x],i)=>event('stage_story_'+(i+1),t,x,[opt('몸과 장비를 추스른다','남은 길을 위한 여유를 확보했다.',{hp:12}),opt('지나온 경험을 다음 움직임에 연결한다','작은 습관 하나를 고쳐 달리기 시작했다.',{[i%3===0?'atk':i%3===1?'spd':'eva']:1})],{from:i+1,to:i+1,weight:9}));
 for(const e of D.events)if(['wagon_reply','letter_delivered','river_again','honesty_return','broker_shadow','warning_saved'].includes(e.id))e.priority=5;
}
