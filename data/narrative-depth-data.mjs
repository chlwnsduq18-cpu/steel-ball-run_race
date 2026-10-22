// Original fan-game branches; these outcomes do not claim to retell canon endings.
export function addNarrativeDepth(D){
 const choice=(l,t,fx,extra={})=>({l,ok:{t,fx},...extra});
 const effect=(on,fx,to='self')=>({on,fx,to,limit:1});
 const item=(id,n,d,effects)=>D.items[id]={id,n,d,effects,category:'experience'};
 const scene=(id,t,x,c)=>D.events.push({id,t,x,c,expedition:'saint',once:true,where:['road','camp','town','explore'],from:1,to:9,weight:0,req:[],guideTitle:'결승선 밖의 여정',guide:'이미 레이스 참가를 포기했습니다. 이 사건들은 순위·구간을 진행시키지 않고 연속해서 이어집니다. 선택과 전투 결과가 마지막 결말의 조건을 바꿉니다.'});
 D.hiddenEndings={
  sanctuary:{title:'지도에 없는 안식처',text:'빈 마차가 동쪽으로 달리는 동안, 당신은 유해를 들고 지도에서 지워진 길로 들어갔다. 은신처의 위치는 누구에게도 팔지 않았다. 기록표에는 기권으로 남았지만, 유해를 빼앗기 위해 찾아오는 총성도 그곳에는 닿지 않았다. 당신의 마지막 목적지는 결승선이 아니라, 누구도 소유를 주장하지 못하는 장소였다.'},
  witness:{title:'이름을 남기지 않은 증언자',text:'추격의 명령서와 이동 기록이 서로 다른 역으로 흩어졌다. 유해의 위치를 감춘 채, 그것을 차지하려 했던 자들의 발자취만 세상에 남겼다. 루시는 다음 길을 택했고 당신은 이름 없는 증언자가 되었다. 뉴욕의 순위표에는 없는 결말이었다.'},
  keeper:{title:'기적을 짊어진 순례자',text:'당신은 유해를 다른 사람에게 맡기지 않았다. 습격이 끝난 뒤에도 발소리를 확인하는 습관은 사라지지 않았다. 기적을 지키는 일은 기적을 소유하는 일보다 길었다. 레이스는 끝났지만, 유해와 함께 걷는 당신의 여정에는 결승선이 없었다.'}
 };
 const depart=choice('레이스를 포기하고 유해의 은신처로 향한다','참가 표식을 내려놓았다. 이제 순위도 완주 보상도 돌아오지 않는다. 유해를 좇던 길은 레이스 밖으로 이어진다.',{saintJourney:'saint_exile_1'},{hint:'되돌릴 수 없는 레이스 기권 · 별도 사건 3개와 히든 엔딩으로 진행',req:['item:saint_left_arm','flag:saint_passed'],actionCost:0});
 D.events.find(e=>e.id==='saint_lucy').c.push(structuredClone(depart));
 D.events.push({id:'saint_departure',t:'결승선과 반대 방향의 지도',x:'유해를 감싼 천 안에 오래된 역의 이름이 남아 있다. 그곳으로 가면 뉴욕의 기록대에는 돌아올 수 없다. 루시가 지키려던 것은 우승자의 이름이 아니었다. 무엇을 끝까지 운반할 것인가?',from:7,to:9,where:['road','camp','town','explore'],once:true,weight:6,req:['item:saint_left_arm','flag:saint_passed','noflag:saint_stay'],followup:{triggers:['flag:saint_passed']},c:[structuredClone(depart),choice('유해를 지닌 채 레이스를 계속한다','지도는 접어 두었다. 자신의 순위를 끝까지 기록하기로 했다.',{flag:'saint_stay'},{actionCost:0})]});
 scene('saint_exile_1','표식을 버린 역','레이스의 표식이 사라지자 역무원은 당신을 기억하지 못했다. 그러나 뒤따르는 마차는 여전히 같은 간격을 유지한다. 마지막 연락책을 살릴 것인가, 추격자의 명령서를 확보할 것인가?',[
  choice('연락책을 먼저 피신시킨다','연락책은 오래된 배수로의 출구를 알려 주었다. 명령서는 회수자에게 남았지만, 은신처로 이어지는 길을 얻었다.',{flag:'saint_shelter',hp:-10,saintJourney:'saint_exile_2'},{hint:'HP -10 · 은신처 결말의 단서 확보'}),
  choice('빈 마차로 시선을 돌리고 명령서를 훔친다','마차를 내주고 명령서와 역별 운송 기록을 손에 넣었다. 연락책의 행방을 확인할 시간은 없었다.',{flag:'saint_evidence',money:-35,saintJourney:'saint_exile_2'},{cost:0,req:[],hint:'보유금에서 최대 $35 사용 · 증언자 결말의 증거 확보'}),
  choice('모든 흔적을 지우고 혼자 떠난다','누구의 위치도 기록에 남기지 않았다. 도움받을 곳도 없지만, 다른 사람을 추격에 끌어들이지 않았다.',{flag:'saint_alone',hp:12,saintJourney:'saint_exile_2'},{hint:'HP +12 · 홀로 유해를 지키는 길'})
 ]);
 const next={saintJourney:'saint_exile_3'};
 scene('saint_exile_2','기록되지 않는 검문소','배수로 끝을 막은 회수자는 참가 번호를 묻지 않는다. 유해를 내놓으라는 말뿐이다. 이 대결의 목적은 상대를 죽이는 것이 아니라, 뒤따르는 자들의 눈앞에서 사라지는 것이다.',[
  choice('세 번의 공방을 버티며 탈출로를 연다','유해를 몸에 고정하고 회수자의 사선을 향해 걸어 나갔다.',{combat:{name:'유해 회수대의 추격자',story:'레이스 밖의 검문소를 지키는 회수자.',objective:{type:'survive',rounds:3},rewards:false,nonlethal:true,winFx:{...next,flag:'saint_clean_escape'},loseFx:{...next,flag:'saint_tracked'},fleeFx:{...next,flag:'saint_tracked'},winText:'추격을 완전히 끊었다. 은신처도 증거도 안전하게 다음 장소로 옮길 수 있다.',loseText:'간신히 유해를 지켰지만 발자국을 감추지 못했다. 마지막 장소에서 대가를 치러야 한다.',fleeText:'유해를 안고 달아났다. 회수자는 아직 당신의 뒤를 쫓고 있다.'}},{hint:'3턴 생존 또는 격파 · 실패·도주해도 히든 루트 계속'}),
  choice('연락책이 알려 준 배수로로 빠져나간다','몸을 긁는 돌틈을 통과했다. 회수자는 빈 통로만 발견했다.',{...next,flag:'saint_clean_escape',hp:-14},{req:['flag:saint_shelter'],hint:'연락책 구출 필요 · HP -14 · 전투 없이 추격 단절'}),
  choice('명령서의 인장을 위조해 다른 역으로 유도한다','확보한 원본을 불태우고 위조된 명령만 남겼다. 추격은 사라졌지만 세상에 보일 증거도 잃었다.',{...next,flag:'saint_clean_escape',count:{saint_burned:1}},{req:['flag:saint_evidence'],hint:'명령서 확보 필요 · 증언자 결말을 포기하고 전투 회피'}),
  choice('남은 짐을 버리고 숲으로 달아난다','짐이 흩어진 동안 거리를 벌렸다. 유해만은 품에 남았다.',{...next,flag:'saint_tracked',money:-25},{hint:'보유금에서 최대 $25 소모 · 추격이 남은 채 마지막 선택'})
 ]);
 scene('saint_exile_3','누구의 기적도 아닌 것','작은 예배당의 문이 열린다. 유해를 잠시 내려놓자 팔의 떨림이 멎었다. 이곳에 남길 것인가, 추격의 진실을 남길 것인가, 아니면 끝까지 자신이 짊어질 것인가?',[
  choice('위치를 지우고 유해를 안식처에 봉한다','마지막 표식을 지웠다. 다시 찾아올 수 있는 사람조차 남기지 않았다.',{hiddenEnding:'sanctuary',consumeItem:['saint_left_arm','saint_trail']},{req:['flag:saint_shelter','flag:saint_clean_escape'],hint:'연락책 구출 + 추격 단절 · 「지도에 없는 안식처」'}),
  choice('유해는 숨기고 회수 명령의 증거를 세상에 보낸다','증거를 여러 봉투에 나누고 서로 다른 역으로 보냈다.',{hiddenEnding:'witness',consumeItem:['saint_left_arm','saint_trail']},{req:['flag:saint_evidence','count:saint_burned<1','flag:saint_clean_escape'],hint:'온전한 명령서 + 추격 단절 · 「이름을 남기지 않은 증언자」'}),
  choice('다른 누구도 위험에 넣지 않고 유해와 함께 떠난다','문을 닫았다. 도망칠 곳을 찾는 대신, 자신이 유해의 마지막 운반자가 되기로 했다.',{hiddenEnding:'keeper'},{hint:'항상 선택 가능 · 유해 보유 · 「기적을 짊어진 순례자」'}),
  choice('유해를 숨긴 뒤 자신이 미끼가 되어 추격을 끌어낸다','자신의 이름으로 역에 숙박 기록을 남겼다. 추격은 이제 유해 대신 당신을 따라온다.',{hiddenEnding:'sanctuary',consumeItem:['saint_left_arm','saint_trail'],flag:'saint_decoy'},{req:['flag:saint_shelter','flag:saint_tracked'],hint:'추격이 남았을 때의 대가 · 안전한 귀환을 포기하고 안식처 보호'})
 ]);
 D.routes.find(r=>r.id==='saint_path').events.push('saint_departure','saint_exile_1','saint_exile_2','saint_exile_3');
 D.corpseJourney.events.push('saint_departure','saint_exile_1','saint_exile_2','saint_exile_3');
 addOriginStories(D,{choice,effect,item});
}

function addOriginStories(D,{choice,effect,item}){
 // Every row authors a dilemma, an encounter and two different resolutions.
 const stories={
 steel:{title:'돌아오지 않는 철구',a:'부서진 마차 아래에 사람이 깔려 있다. 철구 하나로 받침을 만들면 구할 수 있지만, 지금껏 익힌 한 쌍의 회전을 포기해야 한다. 언덕 위에서는 마차를 부순 자가 다음 투척을 기다린다.',vow:'철구 하나를 받침으로 남겨 사람을 구한다',other:'두 철구를 유지하고 가해자의 퇴로부터 끊는다',b:'살려 둔 사람의 증언과 언덕의 발자국이 같은 기수를 가리킨다. 그는 첫 철구가 돌아올 자리를 노리고 있다. 되돌아오는 궤도를 고집할 것인가, 지형을 이용해 새 궤도를 만들 것인가?',fight:'반환점을 노리는 투척수',act:'돌아오는 철구를 미끼로 삼아 사선을 무너뜨린다',solve:'남겨 둔 받침과 수레바퀴로 투척의 사각을 만든다',otherSolve:'퇴로에서 두 철구의 충돌점을 바꿔 길을 봉쇄한다',c:'철구는 다시 손에 돌아왔다. 그러나 한 번 누군가를 살리기 위해 손을 떠난 궤도는 전과 같을 수 없다.',master:'귀환 궤도를 고쳐 다시 던진다',alternate:'빗나간 철구로도 사람을 지킬 수 있는 자세를 남긴다',endA:'회전의 정확함을 되찾되, 멈춰야 할 순간을 함께 기억했다.',endB:'돌아오지 않는 투척까지 자신의 기술로 받아들였다.',fx:{shield:4},on:'defense',stat:'atk'},
 satellite:{title:'사각에 남은 동행자',a:'절벽의 굽이에서 동행자가 왼쪽을 보지 못한 채 발을 헛디딘다. 자신에게도 익숙한 사각의 감각이다. 구출용 표식을 남길 것인가, 그 감각을 만든 철구의 흔적을 추적할 것인가?',vow:'벽에 표식을 남겨 동행자의 발판을 안내한다',other:'철구가 스친 자국을 따라 공격자의 위치를 좁힌다',b:'좁은 통로에서 철구가 벽을 튀기며 돌아온다. 상대는 보이지 않는 쪽으로 발을 내딛게 만든다. 눈으로만 따라가면 같은 함정에 빠질 것이다.',fight:'반사각을 숨긴 철구 사용자',act:'철구의 반사각을 끊어 사각을 되돌려 준다',solve:'구출 때 남긴 촉각 표식을 더듬어 안전지대를 찾는다',otherSolve:'벽의 흠집으로 반사 시점을 계산해 먼저 움직인다',c:'한쪽 풍경이 돌아와도 몸은 여전히 그쪽을 피하려 한다. 이 감각을 상대에게 강요할 것인가, 같은 처지의 사람을 안내하는 데 쓸 것인가?',master:'사각을 만드는 궤도를 자신의 무기로 남긴다',alternate:'보이지 않는 방향을 읽는 발걸음을 남긴다',endA:'감각의 빈틈을 공격할 순간과 멈출 순간을 구별하게 되었다.',endB:'보이지 않는 것을 두려워하는 대신 몸으로 길을 확인했다.',fx:{breath:1,shield:2},on:'roundStart',stat:'eva'},
 hamon:{title:'숨을 나누는 우물',a:'우물에 쓰러진 사람이 있고 물 표면에는 기묘한 떨림이 번진다. 호흡을 나누어 먼저 끌어올릴 것인가, 물을 통해 떨림의 근원을 찾아낼 것인가?',vow:'자신의 호흡을 늦추고 쓰러진 사람을 끌어올린다',other:'물의 파문으로 지하 통로의 형상을 읽는다',b:'갇힌 통로에서 먼지가 쏟아진다. 길을 막은 적은 당신이 깊게 숨을 들이마시는 순간을 기다린다. 큰 호흡 한 번보다 끊기지 않는 작은 박자가 필요하다.',fight:'호흡의 틈을 노리는 매복자',act:'짧은 호흡으로 파문을 이어 통로를 뚫는다',solve:'구출한 사람과 호흡 박자를 맞추며 지지대를 옮긴다',otherSolve:'우물에서 읽은 물길로 파문을 보내 출구를 찾는다',c:'지상으로 나온 뒤 첫 들숨이 유난히 길었다. 남은 호흡을 공격에 모을 것인가, 함께 살아 나오는 리듬으로 남길 것인가?',master:'끊기지 않는 파문을 공격에 잇는다',alternate:'남의 호흡까지 기다리는 회복의 박자를 남긴다',endA:'호흡이 흔들리는 장소에서도 파문을 끊지 않았다.',endB:'강한 한 번보다 살아서 이어지는 다음 숨을 택했다.',fx:{hp:2,breath:1},on:'roundStart',stat:'spd'},
 vampire:{title:'새벽까지 남은 피',a:'야영지의 부상자가 당신의 손을 붙든다. 가까워진 맥박에 갈증이 깨어난다. 먹을 것을 찾아 떠날 것인가, 갈증을 견디며 부상자를 지킬 것인가?',vow:'갈증을 견디고 부상자 곁에 남는다',other:'사람 없는 사냥터로 떠나 허기를 먼저 채운다',b:'새벽빛이 창고의 틈으로 들어온다. 당신을 뒤쫓던 사냥꾼은 문을 열어 둔 채 기다린다. 몸의 회복에 의지해 돌파하면 더 오래 빛에 노출될 수 있다.',fight:'새벽을 기다리는 사냥꾼',act:'그늘 사이를 건너 사냥꾼의 무장을 꺾는다',solve:'지켜 준 부상자가 남긴 덮개로 햇빛의 틈을 막는다',otherSolve:'사냥터에서 찾은 지하 굴로 낮을 피해 이동한다',c:'문 너머에서는 아직 아침을 기다리는 사람이 있다. 자신을 위험한 존재로 부르는 말보다, 다음 갈증 앞에서 무엇을 할지가 중요해졌다.',master:'갈증을 통제하며 재생을 전투에 사용한다',alternate:'사냥을 줄이고 빛을 피하는 생존 규칙을 세운다',endA:'굶주림을 핑계로 타인의 목숨을 결정하지 않기로 했다.',endB:'허기를 먼저 해결하고 자신을 멈출 경계를 남겼다.',fx:{shield:3},on:'hurt',stat:'eva'},
 pillar:{title:'몸에 남은 옛 명령',a:'돌벽의 문양에 손을 대자 몸이 먼저 칼날의 형태를 기억한다. 그 기억을 따라 벽을 부수면 안쪽 사람도 다칠 수 있다. 손을 되돌릴 것인가, 다른 통로를 찾아 형태를 시험할 것인가?',vow:'칼날을 거두고 안쪽의 사람부터 불러낸다',other:'빈 통로에서 몸의 형태를 바꾸어 출구를 찾는다',b:'기둥 사이에서 사냥꾼의 그물이 조여 온다. 몸은 오래된 방식으로 찢고 삼키려 한다. 좁아지는 공간 안에서 어느 부분까지 바꿀지 스스로 결정해야 한다.',fight:'변형의 틈을 묶는 사냥꾼',act:'몸의 중심을 유지한 채 그물의 장력을 끊는다',solve:'피신시킨 사람이 알려 준 빈 기둥 속으로 몸을 접는다',otherSolve:'시험한 형태로 관절의 폭을 줄여 결박을 벗어난다',c:'돌에 비친 모습이 다시 사람의 윤곽을 얻는다. 변할 수 있다는 사실이 변해야 한다는 명령은 아니었다.',master:'필요한 부분만 바꾸는 전투 형태를 완성한다',alternate:'외형을 지키며 충격을 흘리는 몸의 기억을 남긴다',endA:'오래된 본능 대신 자신의 판단으로 형태를 정했다.',endB:'모든 것을 바꾸지 않고도 살아남는 몸을 선택했다.',fx:{hp:2,shield:1},on:'hurt',stat:'atk'},
 sword:{title:'칼이 기억하는 패배',a:'칼자루를 잡자 아직 싸운 적 없는 상대의 자세가 떠오른다. 칼은 그를 베라고 재촉한다. 기억의 주인을 찾아갈 것인가, 칼을 묶어 둔 채 그 기억부터 기록할 것인가?',vow:'칼을 천으로 묶고 떠오른 자세를 기록한다',other:'기억 속 자세를 가진 검사를 찾아간다',b:'마주 선 검사는 칼의 첫 움직임을 이미 알고 있다. 칼이 재촉하는 공격은 상대가 기다리는 반격선과 겹친다. 기억을 따르는 손과 멈추려는 손이 같은 칼자루를 쥔다.',fight:'기억 속 반격을 기다리는 검사',act:'기억의 첫 수를 버리고 자신의 칼로 맞선다',solve:'기록에 없는 빈 박자를 넣어 반격의 간격을 흔든다',otherSolve:'추적하며 읽은 발놀림으로 결투 대신 무장을 풀게 한다',c:'칼은 패배까지 기억하지만, 누구의 목숨을 끊을지는 기억이 정할 수 없다. 다음 움직임의 주인을 정한다.',master:'기억을 쓰되 베는 순간은 자신이 결정한다',alternate:'칼을 뽑지 않는 간격을 전투의 일부로 남긴다',endA:'칼의 기억을 익혔고 칼의 명령을 거절했다.',endB:'상대를 쓰러뜨리는 것과 베는 것을 같은 일로 여기지 않았다.',fx:{breath:2},on:'defense',stat:'spd'},
 thread:{title:'풀어야 하는 매듭',a:'끊어지는 다리 양끝에 사람이 매달려 있다. 몸을 실로 풀면 둘을 연결할 수 있지만 되돌아올 매듭을 잃을지 모른다. 먼저 자신을 고정할 것인가, 멀리 떨어진 사람부터 붙들 것인가?',vow:'자신의 매듭을 교각에 남겨 안전줄을 만든다',other:'몸을 길게 풀어 먼 쪽 사람부터 붙든다',b:'다리를 노린 적이 실을 타고 오는 진동을 역으로 읽는다. 실을 끊으면 사람이 떨어지고, 팽팽하게 유지하면 위치가 드러난다. 느슨한 한 줄로 주의를 돌릴 여지가 남아 있다.',fight:'실의 진동을 좇는 절단자',act:'미끼 실과 몸의 실을 나누어 칼날을 유도한다',solve:'교각의 매듭으로 하중을 옮기고 몸의 실을 회수한다',otherSolve:'먼 쪽에 닿은 실로 반대편에서 밧줄을 당긴다',c:'모두 건넌 뒤에도 손가락의 매듭 하나가 풀리지 않는다. 잡아당길수록 단단해지는 것과 놓아야 이어지는 것이 있다.',master:'끊어질 지점을 정하고 실의 전장을 만든다',alternate:'다시 돌아올 매듭을 남기는 방어법을 익힌다',endA:'몸을 풀어도 자신이 돌아갈 지점을 잃지 않았다.',endB:'더 멀리 닿는 대신 다시 이어질 실을 남겼다.',fx:{shield:5},on:'defense',stat:'eva'},
 colony:{title:'흩어진 목소리',a:'급류에 흩어진 군체의 일부가 반대편 신호를 전한다. 모두 회수하면 구조를 기다리는 사람에게 늦는다. 작은 일부를 남겨 구조를 돕게 할 것인가, 먼저 군체를 하나로 모을 것인가?',vow:'일부를 강가에 남겨 구조 신호를 유지한다',other:'흩어진 군체를 회수해 하나의 감각으로 모은다',b:'오염된 웅덩이에서 서로 다른 위험 신호가 밀려온다. 적은 가장 큰 몸만을 겨눈다. 분산하면 살릴 수 있는 부분이 늘지만 판단이 늦어진다.',fight:'군체의 중심을 노리는 추적자',act:'미끼 군체와 본체를 나누어 추적을 끊는다',solve:'강가에 남긴 군체의 신호로 깨끗한 수로를 찾는다',otherSolve:'모은 감각을 한곳에 집중해 오염원을 먼저 제거한다',c:'돌아온 신호의 수는 출발할 때와 같지 않다. 하나의 몸을 지키는 일과 작은 생명들을 지키는 일 사이에 자신의 이름을 적는다.',master:'흩어진 판단을 하나의 공격으로 모은다',alternate:'손실을 줄이고 서로 회복시키는 군체를 남긴다',endA:'자신의 몸에 속한 작은 목소리까지 결정의 일부로 삼았다.',endB:'가장 강한 한 부분보다 다시 모일 수 있는 다수를 지켰다.',fx:{hp:3},on:'roundStart',stat:'eva'},
 pistols:{title:'여섯 개의 불만',a:'탄환을 놓고 작은 목소리들이 서로 다른 표적을 주장한다. 한쪽은 갇힌 사람의 자물쇠, 다른 쪽은 달아나는 습격자의 총을 가리킨다. 모두의 의견을 들을 시간은 없다.',vow:'자물쇠를 먼저 쏴 갇힌 사람을 풀어 준다',other:'습격자의 총을 먼저 떨어뜨려 추가 사격을 막는다',b:'거울과 철판 사이로 탄도가 갈라진다. 한 발에 모든 일을 시키려 하면 탄환끼리 길을 막는다. 역할을 나누고 돌아올 자리를 정해야 한다.',fight:'도탄 사이에 숨은 총잡이',act:'탄환마다 역할을 나누어 사격의 틈을 만든다',solve:'풀어 준 사람이 열어 둔 옆문으로 사선을 옮긴다',otherSolve:'떨어뜨린 총의 각도를 표식 삼아 도탄 지점을 정한다',c:'전투가 끝나자 다시 먹을 것을 달라는 소리가 난다. 귀찮은 목소리들을 명령으로 잠재울 것인가, 각자의 역할을 인정할 것인가?',master:'역할과 복귀 신호를 정해 연계 사격을 완성한다',alternate:'한 발을 비워 두는 엄호 사격의 약속을 남긴다',endA:'서로 다른 목소리가 같은 명령보다 정확한 한 발을 만들었다.',endB:'모든 탄환을 쏘지 않아도 지킬 수 있는 틈을 배웠다.',fx:{charge:2},on:'defense',stat:'atk'},
 time:{title:'멈춘 동안 놓친 것',a:'마차가 전복되는 순간 시간이 멎는다. 움직일 수 있는 거리는 짧다. 쓰러질 사람을 옮기면 마부가 쥔 장부에는 닿지 못한다. 무엇을 먼저 되돌릴 것인가?',vow:'멈춘 시간 안에서 쓰러질 사람을 옮긴다',other:'장부를 확보해 사고를 꾸민 자의 흔적을 찾는다',b:'장부의 주인이 좁은 객차에서 당신을 기다린다. 시간이 다시 흐르는 순간을 향해 총구가 고정되어 있다. 멈춤 자체보다 끝난 뒤 어디에 설지가 중요하다.',fight:'다시 흐를 순간을 겨누는 사수',act:'시간정지 뒤의 위치까지 계산해 사선을 벗어난다',solve:'구해 낸 마부가 남긴 연결쇠를 풀어 객차를 분리한다',otherSolve:'장부의 열차 시간표로 사수보다 먼저 출구를 연다',c:'정지된 순간에는 누구도 당신의 선택을 보지 못한다. 보이지 않았다는 이유로 없던 일이 되지는 않는다. 다시 흐를 시간을 누구와 나눌 것인가?',master:'멈춤 이후까지 이어지는 자신의 동작을 완성한다',alternate:'누군가를 기다리기 위해 시간을 비워 둔다',endA:'멈춘 순간의 이익보다 다시 흐를 시간의 책임을 남겼다.',endB:'혼자 움직이는 힘으로 함께 살아갈 다음 순간을 만들었다.',fx:{breath:2,shield:2},on:'battleStart',stat:'spd'}
 };
 for(const [id,p]of Object.entries(stories)){
  const es=[1,2,3].map(n=>D.events.find(e=>e.id===`origin_${id}_${n}`)),root=`story_${id}_`,route=`origin_${id}`;
  const a=root+'vow',b=root+'pursuit',reward=`origin_alternative_${id}`;
  item(reward,p.title+' · 남긴 약속',`${{battleStart:'전투 시작',roundStart:'턴 시작',defense:'방어 카드 사용',hurt:'피격'}[p.on]}: ${Object.entries(p.fx).map(([k,v])=>(D.keywords[k]?.n||'HP')+' +'+v).join(' · ')} (${p.on==='battleStart'?'전투당':'턴당'} 1회)`,[effect(p.on,p.fx)]);
  es[0].t=p.title;es[0].x=p.a;es[0].c[0].l=p.vow;es[0].c[0].ok.t='그 선택을 기억해 두었다. 다음에 같은 위험을 만나면 이때 남긴 것이 길을 바꿀 것이다.';es[0].c[0].ok.fx.flag=[root+'1',a];
  const other=structuredClone(es[0].c[0]);other.l=p.other;other.ok.fx.flag=[root+'1',b];other.ok.t='위험의 근원을 먼저 좇았다. 그 과정에서 얻은 단서는 다음 사건에서 사용할 수 있다.';es[0].c.push(other);
  es[1].t=p.title+' · 돌아온 대가';es[1].x=p.b;
  const ctx=es[1].c[0].ok.fx.combat;ctx.name=p.fight;ctx.story=p.b;ctx.winText=p.endA;ctx.loseText='선택의 대가를 감당하지 못했다. 준비를 더 하거나 다른 해결 방법을 택할 수 있다.';
  es[1].c[0].l=p.act;es[1].c[0].ok.t=p.b;
  es[1].c[1].l='대결을 멈추고 자신이 지킬 수 있는 것부터 회수한다';es[1].c[1].ok.t=p.endB;es[1].c[1].hint='전투 없이 마지막 장으로 · 완성 보상 대신 별도의 방어·회복 경험 선택';
  const resolve=(l,flag,stat)=>choice(l,'처음 선택할 때 남긴 단서가 돌아왔다. '+p.endA,{flag:[root+'2',root+'master'],hp:-8,...(D.items['insight_'+id]?{item:'insight_'+id}:{})},{req:['flag:'+flag],hint:'첫 장의 선택 필요 · HP -8 · 전투 없이 문제 해결'});
  const safe=resolve(p.solve,a),risk=resolve(p.otherSolve,b);
  safe.ok.fx.hp=-12;safe.hint='첫 장에서 남긴 도움 필요 · HP 최대 12 소모 · 확정 해결';
  risk.check={s:p.stat,dc:p.stat==='atk'?72:52};risk.ok.fx.hp=8;
  risk.fail={t:'단서는 맞았지만 실행할 순간을 놓쳤다. '+p.endB,fx:{flag:root+'2',hp:-10}};
  risk.hint='첫 장에서 확보한 단서 필요 · 성공: HP +8·완성 자격 / 실패: HP 최대 10 소모·별도 경험으로 마무리';
  es[1].c.push(safe,risk);
  es[2].t=p.title+' · 남긴 방식';es[2].x=p.c;es[2].c[0].l=p.master;es[2].c[0].ok.t=p.endA;
  es[2].c[1].l=p.alternate;es[2].c[1].ok.t=p.endB;es[2].c[1].ok.fx.item=reward;es[2].c[1].hint=D.items[reward].d+' · 완성 경험과 양자택일';
  for(const e of es){e.guideTitle='출신 이야기 · '+p.title;e.guide='첫 장의 도움은 체력을 써서 확정 해결하는 길을, 추적은 능력치 판정으로 기회를 잡는 길을 엽니다. 판정 실패는 별도의 경험으로 마무리됩니다. 전용 기술로 직접 싸울 수도 있습니다. 마지막 보상은 양자택일이며 장 사이에는 기존 여정 간격이 적용됩니다.';e.narrativeDepth=true;}
  D.routes.find(r=>r.id===route).n=p.title;D.routes.find(r=>r.id===route).ending=p.endA;D.routes.find(r=>r.id===route).adaptedEnding=p.endB;
  D.hiddenGrowth[id].title=p.title;D.hiddenGrowth[id].alternative=reward;
 }
}
