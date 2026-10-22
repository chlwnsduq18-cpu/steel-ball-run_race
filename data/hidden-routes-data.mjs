// Original crossover stories. All new rewards belong to the current race only.
export function addHiddenRoutes(D){
 const atk=(n,x,d)=>({n,c:2,t:'atk',hits:1,dice:2,hit:6,b:0,...x,d});
 const def=(n,x,d)=>({n,c:1,t:'def',eva:18,...x,d});
 const buff=(n,x,d)=>({n,c:2,t:'buff',...x,d});
 const bosses={
  bruford:['브루포드','머리카락 구속과 검격','bind',atk('머리카락을 감은 검격',{kw:[['sink',2,'t']]},'검격 적중 시 위축 +2'),buff('피를 되찾는 검',{heal:12},'HP 12 회복'),'검사의 명예','defense',{charge:2},'방어 카드 사용 시 기세 +2'],
  tarkus:['타커스','쇠사슬과 강타','heavy',atk('쇠사슬 절단 강타',{dice:3,c:3,kw:[['rupture',2,'t']]},'3d6 · 취약 +2'),def('거인의 버팀',{shield:8},'회피 +18'),'사슬을 끊는 호흡','hit',{breath:2},'적중 시 호흡 +2'],
  dio1:['디오 — 돌가면','기화냉동법과 흡혈','freeze',atk('기화냉동법',{kw:[['sink',3,'t']]},'접촉을 얼려 위축 +3'),buff('흡혈 재생',{heal:18},'HP 18 회복'),'얼어붙지 않는 호흡','roundStart',{breath:1,shield:2},'턴 시작 호흡 +1 · 보호막 +2'],
  esidisi:['에시디시','혈관의 열과 화상','heat',atk('괴염왕의 혈관',{hits:3,dice:1,kw:[['burn',1,'t']]},'3회 타격 · 적중마다 화상 +1'),buff('끓어오르는 혈액',{shield:9},'보호막 +9'),'열을 흘리는 호흡','roundStart',{burn:-2,breath:1},'턴 시작 화상 2 감소 · 호흡 +1'],
  wamuu:['와무우','풍압과 집중 강타','wind',atk('신사폭풍',{dice:3,c:3},'3d6 강타'),def('바람 속의 자세',{eva:28},'회피 +28'),'풍압을 읽는 감각','defense',{charge:3},'방어 카드 사용 시 기세 +3'],
  kars:['카즈 — 휘채활도','연속 참격과 방어 절단','blade',atk('휘채활도',{hits:2,kw:[['rupture',2,'t']]},'2회 참격 · 취약 +2'),def('빛을 굴절하는 칼날',{eva:24},'회피 +24'),'칼날을 잇는 호흡','hit',{breath:2,charge:1},'적중 시 호흡 +2 · 기세 +1'],
  dire:['다이어','접근을 유도하는 반격','counter',atk('썬더 크로스 스플릿 어택',{dice:3,c:3},'3d6 교차 강타'),def('교차 방어',{eva:25},'회피 +25'),'접근을 끊는 재생','defense',{hp:5},'방어 카드 사용 시 HP +5'],
  will:['윌 A. 체펠리','호흡 관리와 파문 전도','hamon',atk('파문 전도',{kw:[['breath',2,'s'],['burn',2,'t']]},'자신 호흡 +2 · 상대 화상 +2'),buff('호흡을 고르다',{kw:[['breath',3,'s']],shield:5},'호흡 +3 · 보호막 +5'),'파문을 흘리는 신체','roundStart',{burn:-2,shield:3},'턴 시작 화상 2 감소 · 보호막 +3'],
  jonathan:['죠나단 죠스타','검에 흐르는 파문과 정면 돌파','hamon',atk('럭 앤 플럭의 파문',{dice:3,c:3,kw:[['breath',1,'s']]},'3d6 검격 · 호흡 +1'),def('물러서지 않는 자세',{eva:22},'회피 +22'),'불굴의 검격','hit',{hp:4,charge:2},'적중 시 HP +4 · 기세 +2'],
  santana:['산타나','흡수와 신체 변형','absorb',atk('갈비뼈 칼날',{hits:3,dice:1},'3회 타격'),buff('흡수하는 육체',{heal:14,shield:5},'HP 14 회복 · 보호막 +5'),'흡수기관의 제어','hurt',{hp:4},'피격 시 HP +4'],
  rudol:['루돌 폰 슈트로하임','연사와 자외선 조사','uv',atk('기관총 연사',{hits:4,dice:1},'4회 연사'),atk('자외선 조사 장치',{dice:3,c:3,kw:[['burn',3,'t']]},'3d6 · 화상 +3'),'빛을 피하는 외피','defense',{shield:7,burn:-1},'방어 시 보호막 +7 · 화상 1 감소'],
  joseph2:['죠셉 죠스타 — 파문','공개된 함정과 역습','trap',atk('예고한 함정의 역습',{dice:3,c:3,kw:[['sink',2,'t']]},'3d6 · 위축 +2'),def('계산된 후퇴',{eva:26},'회피 +26'),'책략을 읽은 본능','defense',{charge:2,shield:4},'방어 시 기세 +2 · 보호막 +4'],
  chaka:['차카','반복되는 검격의 학습','learn',atk('학습하는 검격',{hits:2},'2회 검격'),def('공격 궤도 기억',{eva:22},'회피 +22'),'다른 궤도의 검격','hit',{charge:2},'적중 시 기세 +2'],
  khan:['칸','기억한 검격을 되받아치다','learn',atk('칼집에서 이어지는 반격',{dice:3,c:3},'3d6 반격'),def('칼날 받아내기',{eva:27},'회피 +27'),'받아치는 검의 기억','defense',{charge:2,shield:3},'방어 시 기세 +2 · 보호막 +3'],
  polnareff:['장 피에르 폴나레프','실버 채리엇의 정밀 검술','fencer',atk('실버 채리엇 연격',{hits:4,dice:1},'4회 정밀 검격'),def('검끝으로 흘리기',{eva:28},'회피 +28'),'검격의 완급','hit',{charge:3,shield:3},'적중 시 기세 +3 · 보호막 +3'],
  westwood:['비비아노 웨스트우드','격투와 예고된 운석','meteor',atk('플래닛 웨이브스',{dice:3,c:3,kw:[['burn',2,'t']]},'3d6 운석 · 화상 +2'),atk('교도관의 격투',{hits:2,dice:1},'2회 타격'),'낙하지점을 읽는 실','defense',{shield:6},'방어 시 보호막 +6'],
  rikiel:['리키엘','로즈의 체온 탈취','cold',atk('스카이 하이',{hits:3,dice:1,kw:[['sink',1,'t']]},'3회 타격 · 위축 +1'),buff('로즈 재집결',{shield:10},'보호막 +10'),'체온을 잇는 실','roundStart',{sink:-2,hp:3},'턴 시작 위축 2 감소 · HP +3'],
  pucci_mih:['푸치 — 메이드 인 헤븐','상한이 있는 가속과 선공','acceleration',atk('가속된 일격',{hits:3,dice:1,hit:12},'3회 고속 타격'),def('가속 속의 이탈',{eva:26},'회피 +26'),'가속을 붙드는 매듭','roundStart',{shield:4,breath:2},'턴 시작 보호막 +4 · 호흡 +2'],
  lang:['랭 랭글러','무중력과 원거리 압박','gravity',atk('점핑 잭 플래시',{hits:2,dice:1,kw:[['sink',2,'t']]},'2회 사격 · 위축 +2'),def('무중력 궤도',{eva:26},'회피 +26'),'자세를 되찾은 군체','defense',{sink:-2,shield:4},'방어 시 위축 2 감소 · 보호막 +4'],
  sports:['스포츠 맥스','보이지 않는 사체의 추격','invisible',atk('림프 비즈킷의 습격',{hits:3,dice:1,hit:12},'3회 습격'),def('사체 뒤의 본체',{eva:25},'회피 +25'),'흔적을 읽는 군체','hit',{breath:2,hp:3},'적중 시 호흡 +2 · HP +3'],
  pucci_ws:['푸치 — 화이트스네이크','회수 가능한 기억 DISC','seal',atk('화이트스네이크의 손',{kw:[['sink',3,'t']]},'위축 +3'),buff('환각의 안개',{shield:14},'보호막 +14'),'되찾은 자아','roundStart',{sink:-3,hp:4},'턴 시작 위축 3 감소 · HP +4'],
  prosciutto:['프로슈토','노화와 장기전 압박','age',atk('그레이트풀 데드',{kw:[['sink',2,'t']]},'위축 +2'),atk('노화를 틈탄 사격',{hits:2,dice:1},'2회 사격'),'냉각을 유지하는 탄창','roundStart',{sink:-1,charge:1},'턴 시작 위축 1 감소 · 기세 +1'],
  ghiaccio:['기아초','중장갑의 빈틈','armor',atk('화이트 앨범 돌진',{dice:3,c:3},'3d6 돌진'),def('얼음 장갑',{eva:24},'회피 +24'),'장갑의 틈을 노리는 탄도','hit',{rupture:2},'적중 시 상대 취약 +2'],
  diavolo:['디아볼로','예지와 시간 삭제의 빈틈','prediction',atk('킹 크림슨 기습',{dice:3,c:3,hit:14},'3d6 기습'),def('에피타프',{eva:30},'회피 +30'),'예지를 벗어나는 탄도','defense',{charge:3,breath:2},'방어 시 기세 +3 · 호흡 +2'],
  ndoul:['은두르','소리 감지와 원거리 수격','sound',atk('게브의 수격',{hits:2,hit:14},'2회 수격'),def('멀리 떨어진 본체',{eva:26},'회피 +26'),'소리 없는 접근','defense',{charge:2},'방어 시 기세 +2'],
  vanilla:['바닐라 아이스','크림의 돌진과 노출','void',atk('크림의 소멸 돌진',{dice:3,c:3,hit:14},'3d6 돌진'),def('암흑 공간 잠복',{eva:30},'회피 +30'),'노출 순간의 포착','hit',{breath:2,charge:1},'적중 시 호흡 +2 · 기세 +1'],
  dio3:['DIO — THE WORLD','정지와 설치 공격','time',atk('정지 속의 나이프',{hits:4,dice:1},'4회 나이프'),buff('THE WORLD',{skipTurns:1,once:true,c:3},'전투당 한 번 상대 다음 1턴 정지'),'정지 뒤의 맹공','battleStart',{charge:5,breath:3},'전투 시작 기세 +5 · 호흡 +3'],
  kakyoin:['카쿄인 노리아키','결계와 설치 사격','barrier',atk('반경 20미터 에메랄드 스플래시',{hits:4,dice:1,c:3},'4회 결계 사격'),buff('법황의 결계',{shield:12},'보호막 +12'),'결계의 틈을 보는 눈','defense',{shield:6},'방어 시 보호막 +6'],
  joseph3:['죠셉 죠스타 — 허밋 퍼플','덩굴 구속과 파문 함정','trap',atk('허밋 퍼플의 파문',{kw:[['sink',2,'t'],['burn',2,'t']]},'위축 +2 · 화상 +2'),def('파문을 두른 덩굴',{eva:24},'회피 +24'),'접촉을 흘리는 정지','roundStart',{burn:-2,charge:1},'턴 시작 화상 2 감소 · 기세 +1'],
  jotaro:['쿠죠 죠타로 — 스타 플래티나','정밀 방어와 짧은 시간정지','jotaro',atk('스타 플래티나 연격',{hits:4,dice:1,hit:12},'4회 정밀 연격'),def('정지된 시간 속의 대응',{eva:30},'회피 +30'),'정지된 시간 속의 대응','defense',{shield:7,breath:2},'방어 시 보호막 +7 · 호흡 +2'],
  mike:['마이크 O','금속 풍선의 추적','tracking',atk('튜블러 벨즈',{hits:3,dice:1,kw:[['rupture',1,'t']]},'3회 추적 타격 · 취약 +1'),buff('풍선의 추적 준비',{shield:9},'보호막 +9'),'추적을 벗어나는 회전','defense',{rupture:-2,charge:2},'방어 시 취약 2 감소 · 기세 +2']
 };
 D.hiddenBossCatalog={};
 for(const [key,b]of Object.entries(bosses)){
  const [n,ability,mechanic,a,s,reward,on,fx,desc]=b,id='hr_'+key;
  const basic=atk(n.split(' — ')[0]+'의 견제',{c:1,dice:1,hit:10},'1d6 견제');
  const ids=[id+'_strike',id+'_support',id+'_probe'];[a,s,basic].forEach((c,i)=>D.cards[ids[i]]={...c,sbrId:ids[i]});
  D.enemies[id]={n,ability,hp:84,atk:29,eva:12,spd:10,evadeDie:75,deck:ids,rewardCards:[ids[0]],signature:ids[0],from:1,to:9,kind:'boss',money:45,story:ability+'의 빈틈을 넘었다.',hiddenRouteOnly:true};
  D.hiddenBossCatalog[id]={mechanic,reward:id+'_memory',card:id+'_lesson'};
  D.items[id+'_memory']={id:id+'_memory',n:reward,d:desc+' · 턴당 1회, 현재 회차 동안 유지',category:'experience',effects:[{id:id+'_effect',on,to:key==='ghiaccio'?'opponent':'self',fx,limit:1}]};
  D.cards[id+'_lesson']={...a,n:reward+' · 응용',c:Math.min(2,a.c),d:a.d+' · 전용 보상, 보관함에서 편성',sbrId:id+'_lesson'};
 }
 for(const [id,mechanic,n,on,fx] of [['oye','bomb','폭발 조건을 끊는 회전','defense',{burn:-2,charge:2}],['wekapipo','blind','사각을 읽는 회전','hit',{breath:2,shield:3}],['magenta','stance','방어가 풀리는 순간','defense',{charge:3}],['valentine','exchange','차원을 잇는 회전','hit',{charge:2,shield:4}]]){
  const reward='hr_'+id+'_memory',card='hr_'+id+'_lesson';D.hiddenBossCatalog[id]={mechanic,reward,card};
  D.items[reward]={id:reward,n,d:'턴당 1회 · '+Object.entries(fx).map(([k,v])=>(D.keywords[k]?.n||k)+' '+(v>0?'+':'')+v).join(' · ')+' · '+(on==='defense'?'방어 카드 사용 시':'적중 시'),category:'experience',effects:[{id:reward,on,to:'self',fx,limit:1}]};
  D.cards[card]={...D.cards[D.enemies[id].rewardCards[0]],n:n+' · 응용',sbrId:card};
 }
 const routes=[
  ['steel','steel','회전으로 구하는 사람들',['oye','wekapipo','valentine'],'폭발한 운송대 옆에서 살아남은 마부가 당신의 철구를 알아본다. 짐에는 대통령의 회수 명령과 아직 사람이 갇힌 마차의 위치가 함께 적혀 있다.','핀을 뽑아낸 마차에서 회수 명령의 수신인을 찾았다. 웨카피포는 명령서를 내놓으라며 위성 철구를 돌린다. 사람을 구한 회전이 이번에는 보이지 않는 사각을 넘어야 한다.','구조된 사람들을 안전한 역참으로 보냈다. 서로 다른 회전이 남긴 궤도가 대통령의 이동로를 가리킨다. 유해를 손에 넣는 것보다, 누구를 위해 그 힘을 쓸지가 결전을 결정한다.','대통령의 교대가 멎은 순간, 당신은 사람들을 실은 마차를 먼저 보냈다. 회전은 누군가의 목숨을 지키는 기술로 남았다. 유해와 레이스의 결말은 아직 앞에 있다.'],
  ['satellite','satellite','회수 명령에서 벗어난 철구',['magenta','hr_mike','valentine'],'유해 호송을 돕는 계약서에는 부상자를 버리고 짐부터 회수하라는 조항이 숨어 있다. 마젠트 마젠트는 명령대로 움직이지 않는 당신을 길 한복판에서 막는다.','마젠트가 자세를 푼 틈에 사람들을 빼냈다. 하지만 금속 조각이 동물 모양으로 부풀어 올라 도망간 사람들을 추적한다. 마이크 O는 계약보다 도주자를 되찾는 데 관심이 있다.','추적 풍선의 금속을 회수해 명령의 출처를 확인했다. 버려질 운명이었던 사람들은 당신의 사각에서 몸을 숨긴다. 대통령의 교대마저 끊어야 추격이 끝난다.','회수 명령서는 찢어졌고 사람들은 이름을 되찾았다. 남의 명령을 위해 돌리던 철구로 자신의 탈출로를 열었다. 당신은 다시 레이스의 길에 합류한다.'],
  ['hamon_mask','hamon','돌가면의 밤',['hr_bruford','hr_tarkus','hr_dio1'],'역참에서 해가 진 뒤에만 돌아오는 실종자가 발견된다. 그의 짐 속 돌가면에 손을 댄 순간, 묘지에서 검을 든 기사가 걸어 나온다.','브루포드의 검이 멈추자 갇혀 있던 사람들의 위치가 드러났다. 낡은 성문을 지키는 타커스는 사슬로 출구부터 봉쇄한다. 살아 있는 이들을 빼내기 위해 사슬을 끊어야 한다.','성문 너머에서 생존자들을 햇빛이 드는 곳으로 보냈다. 디오는 파문을 전하는 손부터 얼리겠다고 한다. 접근할 시점과 호흡을 유지할 틈을 함께 준비한다.','디오가 남긴 가면을 부수고 새벽을 맞았다. 밤을 건너온 사람들은 각자의 집으로 돌아간다. 당신에게는 아직 결승선까지 전해야 할 호흡이 남아 있다.'],
  ['hamon_ruin','hamon','깨어난 유적',['hr_esidisi','hr_wamuu','hr_kars'],'발굴 현장에서 사라진 인부들의 수첩을 주웠다. 고대의 그림 속 신체와 눈앞의 흔적이 일치한다. 돌가면의 소문보다 먼저 유적의 열기가 당신을 이끈다.','에시디시가 남긴 열기 속에서 봉인 기록을 건졌다. 와무우는 도망치는 사람을 쫓는 대신 당신과의 정면 승부를 요구한다. 바람의 방향을 읽고 약속한 장소로 간다.','와무우와의 대결 뒤 드러난 목적지는 카즈가 기다리는 채석장이다. 완전생물에 이르기 전, 휘채활도가 기록과 목격자를 지우려 한다.','휘채활도의 빛을 넘었고 유적의 기록은 살아남았다. 카즈의 추격을 끝낸 당신은 파문의 호흡을 고르며 레이스로 돌아간다.'],
  ['vampire','vampire','돌가면을 지키는 자',['hr_dire','hr_will','hr_jonathan'],'파문 일행은 당신의 짐에 든 돌가면을 넘기라고 요구한다. 가면을 가지고 달아난 당신 앞에 다이어가 선다. 이 갈등은 종족이 아니라 지금 지키려는 물건에서 시작됐다.','다이어의 교차 공격을 넘었지만 가면을 노리는 추적은 계속된다. 체펠리는 생존자의 행방을 먼저 묻는다. 답을 기다리는 동안에도 그의 호흡은 흐트러지지 않는다.','파문이 번진 상처를 추스른 뒤 죠나단과 마주한다. 그는 가면을 통한 또 다른 희생을 막으려 한다. 당신의 힘을 어디까지 쓸 것인지 마지막 대결에서 드러난다.','죠나단과의 대결은 끝났다. 당신은 힘을 증명했지만, 그 힘이 남길 결과까지 대신 결정해 주는 승리는 없다. 가면을 품은 채 레이스의 결말을 향해 달린다.'],
  ['pillar','pillar','신체에 새겨진 유적',['hr_santana','hr_rudol','hr_joseph2'],'피부 아래의 문양과 같은 표식을 유적에서 발견했다. 산타나는 기록을 읽는 대신 당신을 흡수하려 한다. 살아남으려면 동족의 신체가 어떻게 변하는지 먼저 읽어야 한다.','산타나의 변형을 넘자 연구 시설의 문서가 나왔다. 슈트로하임은 표본 회수를 위해 자외선 장치를 준비한다. 장치가 켜지기 전에 조사 각도를 무너뜨려야 한다.','연구 기록은 회수했지만 죠셉은 이미 탈출로를 살피고 있다. 지나치게 눈에 띄는 밧줄과 후퇴는 미끼다. 힘을 쏟기 전에 그가 공개한 준비를 읽는다.','죠셉의 함정을 넘어 자신의 기록을 되찾았다. 몸의 힘만으로 설명할 수 없던 승부가 남았다. 당신은 유적의 이름 대신 레이스 참가자의 이름으로 길을 이어간다.'],
  ['sword','sword','낯선 칼날의 기억',[['hr_bruford','hr_chaka'],['hr_jonathan','hr_khan'],['hr_polnareff','hr_kars']],'검이 주인의 기억에 없던 궤도를 꿈꾼다. 다른 세계에서 건너온 검사들이 길 위에 흔적을 남기고 있다. 검은 배울 수 있지만, 칼을 휘두를 이유는 당신이 정해야 한다.','첫 검사의 궤도가 칼날에 남았다. 다음 상대는 그 움직임을 받아내고 되돌려 보낸다. 같은 수를 반복하는 대신 검을 거두는 순간까지 자신의 기술로 삼는다.','두 검술을 경험한 칼은 스스로 움직이려 한다. 마지막 상대와 마주하기 전에 손을 쥐고 호흡을 고른다. 기억을 사용하는 것은 칼의 의지가 아니라 당신이다.','마지막 칼날과의 대결을 마쳤다. 검에는 서로 다른 세 사람의 움직임이 남았고, 손에는 그중 무엇을 쓸지 결정할 의지가 남았다. 검을 거두고 결승선으로 향한다.'],
  ['thread','thread','천국을 향한 호송',['hr_westwood','hr_rikiel','hr_pucci_mih'],'호송 마차에서 실 한 가닥을 붙잡는 손이 나왔다. 사람을 구하자 웨스트우드가 운석의 낙하지점으로 길을 몰아간다. 호송 명부 끝에는 푸치라는 이름이 적혀 있다.','구출한 사람은 신부가 중력과 시간을 실험했다고 증언한다. 리키엘의 로즈가 체온을 빼앗는 동안에도 당신의 실은 놓친 사람들을 연결해야 한다.','기록 속 신부의 능력이 바뀌고 있다. 중력이 뒤틀린 관측소를 지나자 시계의 초침이 빨라진다. 매듭을 지형에 남겨 가속 속에서도 돌아올 위치를 확보한다.','가속 속에서 끊어질 뻔한 사람들을 실로 붙잡았다. 푸치의 계획을 멈춘 뒤 남은 매듭을 거두고, 자신의 속도로 레이스를 다시 달린다.'],
  ['colony','colony','내 기억의 주인',['hr_lang','hr_sports','hr_pucci_ws'],'자신의 기억 일부와 같은 문장이 회수 명령서에 적혀 있다. 랭 랭글러는 당신을 사람 대신 회수할 표본으로 부른다. 무중력 속에서도 지켜야 할 것은 몸만이 아니다.','떨어져 나온 군체를 모으자 잃어버린 장면이 이어진다. 스포츠 맥스가 보이지 않는 사체를 풀어 증인을 지우려 한다. 흔적을 드러내고 기억의 출처를 추적한다.','회수할 DISC의 이름에 자신의 이름이 적혀 있다. 푸치는 지성과 기억을 돌려받겠다고 말한다. 당신은 누가 그것을 처음 주었는지보다 지금 누가 살아가는지를 답한다.','화이트스네이크의 손에서 기억을 되찾았다. 군체는 하나의 목소리로 자신을 소개한다. 완주 기록에 남길 이름은 이제 누구의 소유물도 아니다.'],
  ['pistols','pistols','운반되지 않은 비밀',['hr_prosciutto','hr_ghiaccio','hr_diavolo'],'호위하던 짐에서 살아 있는 사람의 목소리가 들린다. 암살팀은 보스의 비밀을 빼앗으려 하고, 보스 측은 비밀 자체를 지우려 한다. 프로슈토가 탄 열차에서 노화가 시작된다.','노화를 버티고 보호 대상을 빼냈다. 이번에는 기아초가 얼음 장갑으로 철로를 막는다. 첫 탄환의 궤도로 빈틈을 드러내고 다음 탄환이 그 길을 이어야 한다.','암살팀이 노리던 비밀은 보스의 정체였다. 디아볼로는 당신이 그 이름을 운반하도록 두지 않는다. 예지된 공격을 흘려보내고 다시 나타날 자리를 겨눈다.','조직의 비밀은 사람과 함께 살아남았다. 보스의 계산 밖으로 탄환을 보낸 당신은 보수보다 무거운 약속을 지키고 레이스로 돌아간다.'],
  ['time_dio','time','같은 시간의 지배자',['hr_ndoul','hr_vanilla','hr_dio3'],'멈춘 시간 속에 당신 외의 발자국이 찍혔다. DIO는 같은 능력을 복종의 이유로 삼는다. 거절의 답을 전한 뒤 은두르의 물소리가 사막을 가른다.','소리의 주인을 찾아낸 뒤 저택으로 이어지는 길이 열렸다. 바닐라 아이스의 돌진은 시간을 멈춰도 사라지지 않는다. 모습을 드러내는 순간을 기다린다.','저택의 벽에는 이미 나이프가 꽂혀 있다. DIO는 당신의 정지가 끝나는 순간을 기다린다. 멈추는 능력과 다시 움직이는 순간의 방비를 함께 준비한다.','DIO가 지배하려던 시간에서 걸어 나왔다. 다른 사람의 초침도 다시 움직인다. 당신은 누구에게도 바치지 않은 시간을 레이스의 남은 길에 쓴다.'],
  ['time_joestar','time','죠스타 일행의 추적',['hr_kakyoin','hr_joseph3','hr_jotaro'],'죠스타 일행은 당신의 시간정지에서 DIO와 같은 위협을 보았다. 오해와 경계가 추적이 되었고 카쿄인의 결계가 탈출로를 막는다. 이름도 신체도 그대로지만, 이번 승부에서 당신은 그들이 쫓는 쪽이다.','결계를 넘었지만 죠셉의 덩굴이 흔적을 따라온다. 정지 속에서 손쉽게 잡을 수 있는 덩굴일수록 파문이 준비돼 있다. 시간보다 접촉의 결과를 먼저 읽는다.','죠타로는 앞선 두 싸움의 흔적을 보고 당신의 능력을 파악했다. 정지된 시간 속에서 그의 손가락이 움직인다. 짧은 대응을 허용한 뒤의 반격까지 계산해야 한다.','죠타로와의 대결이 끝났다. 정지 속에서 마주친 시선을 기억하며 자신의 이름으로 말에 오른다. DIO의 자리에 섰던 여정과 레이스의 최종 결과는 별개로 남는다.']
 ];
 D.hiddenRoutes={};
 for(const [id,origin,n,bosses,intro,bridge1,bridge2,ending]of routes){
  const route=D.hiddenRoutes[id]={id,origin,n,bosses,intro,bridge1,bridge2,ending};
  for(let step=0;step<7;step++){
   const battle=step%2===1,index=(step-1)/2,candidates=battle?[].concat(bosses[index]):[null];
   for(const enemy of candidates){
    const eventId=`hidden_${id}_${step}${enemy?'_'+enemy:''}`,name=enemy?D.enemies[enemy].n:null;
    const text=battle?`${name}과 마주했다. ${D.enemies[enemy].ability}. 앞선 길에서 남긴 흔적이 여기까지 이어졌다. 상대가 움직이자 말의 고삐를 놓고 땅을 딛는다.`:[intro,bridge1,bridge2,ending][step/2];
    const fx=battle?{combat:{enemy,hiddenRoute:id,nonlethal:true,winFx:{hiddenWin:enemy},loseFx:{hiddenRetry:true},fleeFx:{hiddenRetry:true},winText:name+'의 움직임을 넘었다. 숨을 고르자 아직 이어질 길이 보인다.',loseText:'이번 대결은 물러났다. 정비하고 같은 상대에게 다시 도전할 수 있다.',fleeText:'거리를 벌렸다. 다른 사건을 거친 뒤 같은 상대의 흔적을 찾을 수 있다.'}}:{hiddenAdvance:true};
    const c=battle?[{l:name+'과 맞선다',hint:'패배·도주 후 재도전 가능 · 승리 시 전용 경험·응용 카드 확정',ok:{t:text,fx}}]:[{l:step===6?'이 여정을 기억하며 레이스를 이어간다':'흔적을 읽고 공격할 순간을 준비한다',hint:step===6?'루트 완료 · 레이스 계속':'다음 전용 대결 시작 시 기세 +3',ok:{t:text,fx:{...fx,...(step<6?{hiddenPrepare:'attack'}:{})}}}];
    if(!battle&&step<6)c.push({l:'사람들을 안전하게 보내고 방비를 준비한다',hint:'다음 전용 대결 시작 시 보호막 +10',ok:{t:'안전한 동선을 남겼다. '+text,fx:{...fx,hiddenPrepare:'defense'}}});
    if(battle)c.push({l:'지금은 거리를 두고 레이스를 계속한다',actionCost:0,hint:'3행동 뒤 다시 만남 · 루트 변경 없음',ok:{t:'대결을 미루고 장비를 손질하며 몸을 추스른다.',fx:{hiddenDelay:true}}});
    if(step===6)c[0].actionCost=0;
    if(step===0&&id==='vampire')c.push({l:'돌가면을 넘기고 대립에서 물러난다',actionCost:0,hint:'파문 일행과 싸우지 않고 레이스 계속 · 전용 루트 포기',ok:{t:'가면을 넘겼다. 당신의 출생만으로 이들이 적이 될 이유는 없다.',fx:{hiddenAbandon:true}}});
    D.events.push({id:eventId,t:route.n+' · '+(battle?name:step===6?'남은 길':'남겨진 흔적'),x:text,c,from:1,to:9,where:['road','camp','town','explore'],once:false,weight:0,req:[],hiddenRouteScene:true,hiddenRouteId:id,hiddenStep:step,hiddenEnemy:enemy,guideTitle:'히든 출생의 여정',guide:'루트는 우연한 만남으로 정해지고 저장됩니다. 전용 대결 뒤에도 레이스는 계속됩니다.'});
   }
  }
 }
}
