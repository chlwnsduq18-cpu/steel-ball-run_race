// Remake: shared engine fields only. Existing IDs remain valid for saved decks.
export function rebuildHiddenBosses(D){
 D.hiddenLegacyCards=Object.fromEntries(Object.keys(D.hiddenBossCatalog).flatMap(id=>D.enemies[id].deck.map(cid=>[cid,structuredClone(D.cards[cid])])));
 const A=(n,c,dice,x={})=>({n,c,t:'atk',hits:1,dice,hit:8,b:0,...x});
 const F=(n,eva,x={})=>({n,c:1,t:'def',eva,...x});
 const B=(n,x)=>({n,c:2,t:'buff',...x});
 const self=(k,n)=>[k,n,'s'],target=(k,n)=>[k,n,'t'];
 const q=(k,n)=>({kw:[self(k,n)]}),t=(k,n)=>({kw:[target(k,n)]});
 const rows={
 bruford:{stats:[88,29,15,11],plan:'머리카락으로 위축을 쌓고 검으로 출혈을 남긴다. 출혈 참조 검격이 마무리이며 피를 빼앗는 공격으로 보호막을 얻는다.',cards:[A('댄스 머카브 헤어',2,2,t('sink',3)),B('피를 되찾는 검',{heal:14}),A('머리카락으로 휘두르는 검',1,1,q('charge',2)),A('흑기사의 참격',2,2,t('bleed',2)),A('검에 남은 혈흔',3,3,{bleedDmg:1}),F('수면 아래의 회피',24,{charge:2}),A('머리카락의 흡혈',2,2,{hitShield:5})]},
 tarkus:{stats:[108,32,7,6],plan:'쇠사슬 구속 뒤 취약과 위축을 이용한 강타. 느리고 회피가 낮지만 단발 피해가 높다.',cards:[A('헬 헤븐 스네이킬',3,3,{sinkDmg:4,pierce:true}),F('거인의 버팀',16,{shield:8}),A('사슬 끌어당기기',1,1,t('sink',3)),A('쌍두룡의 사슬',2,2,t('rupture',2)),A('갑옷 파편 산탄',2,1,{hits:3}),A('대검 내려치기',3,3,{spend:3,fixPer:2}),A('송곳니 기습',1,1,q('charge',2))]},
 dio1:{stats:[94,31,13,12],plan:'냉각으로 위축을 쌓고 공열안자경으로 방어를 관통한다. 재생은 부상 때만 사용한다.',cards:[A('기화냉동법',2,2,t('sink',4)),B('흡혈 재생',{heal:18}),A('흡혈 손아귀',1,1,{hitShield:4}),A('공열안자경',3,3,{pierce:true,hit:16}),A('얼어붙은 신체 파쇄',2,2,{sinkDmg:4}),A('인간을 초월한 연격',2,1,{hits:3,kw:[self('charge',1)]}),F('냉동 접촉 회피',22)]},
 esidisi:{stats:[96,29,10,10],plan:'혈관 연타로 화상을 누적하고 공격하면서 기세를 얻어 열혈 사출에 쓴다.',cards:[A('괴염왕의 혈관',3,1,{hits:3,...t('burn',1)}),F('혈관을 뻗은 방비',18,{shield:6}),A('끓어오르는 혈액',1,1,q('charge',2)),A('혈관 찌르기',2,2,{kw:[target('burn',2),target('bleed',1)]}),A('열혈 사출',3,3,{spend:3,fixPer:2}),A('지면을 타는 혈관',2,1,{hits:2,ignoreEva:true,...t('burn',1)})]},
 wamuu:{stats:[100,31,17,13],plan:'풍압 공격으로 기세를 모으고 신사폭풍·최종유법에 소비한다. 바람의 자세는 자원과 회피를 함께 제공한다.',cards:[A('신사폭풍',3,3,{spend:3,fixPer:2}),F('바람만을 느끼는 자세',26,{charge:2}),A('풍압의 일격',1,1,q('charge',2)),A('회오리 연타',2,1,{hits:3}),A('석궁 사격',2,2,{hit:20}),A('최종유법 · 혼설삽',3,3,{spend:5,fixPer:2,pierce:true}),A('바람의 칼날',2,2,t('bleed',2))]},
 kars:{stats:[96,32,16,14],plan:'휘채활도로 출혈을 남긴 뒤 출혈 참조 참격. 빛을 굴절하며 회피를 확보하고 칼날로 보호막을 얻는다.',cards:[A('휘채활도',2,1,{hits:2,...t('bleed',2)}),F('빛을 굴절하는 칼날',24,{charge:2}),A('빛의 칼날',1,1,q('charge',2)),A('톱니 칼날',2,2,{bleedDmg:1}),A('방어를 가르는 참격',3,3,{pierce:true,spend:3,fixPer:2}),A('칼날로 탄환 절단',2,2,{hitShield:5}),A('사각의 절단',2,2,{ignoreEva:true})]},
 dire:{stats:[88,30,14,11],plan:'공격으로 호흡을 얻은 뒤 교차 공격과 파문 장미에 활용한다. 접근 중 방어도 호흡을 보충한다.',cards:[A('썬더 크로스 스플릿 어택',3,3,{breathDice:true}),F('교차 방어',24,q('breath',2)),A('썬더 스플릿 어택',1,1,q('breath',2)),A('파문을 담은 장미',2,2,{breathDice:true,...t('burn',1)}),A('공중 교차 발차기',2,1,{hits:2,...q('breath',1)}),A('가드를 여는 발차기',2,2,{pierce:true})]},
 will:{stats:[88,28,17,12],plan:'파문 전도로 호흡을 확보하고 줌 펀치로 거리를 넘는다. 생명 파문은 전투당 한 번 회복과 호흡을 준다.',cards:[A('선라이트 옐로 오버드라이브',3,2,{hits:2,breathDice:true}),B('생명 파문',{heal:20,once:true,...q('breath',4)}),A('파문 전도',1,1,q('breath',2)),A('줌 펀치',2,2,{ignoreEva:true,...q('breath',1)}),A('와인에 전도한 파문',2,2,{breathDice:true,...t('burn',1)}),F('파문 커터',22,{shield:5}),A('토네이도 오버드라이브',2,1,{hits:3})]},
 jonathan:{stats:[108,32,11,10],plan:'정면 공격으로 호흡을 쌓고 파문 질주에 사용한다. 검격과 맨손 공격을 섞어 방어를 돌파한다.',cards:[A('선라이트 옐로 오버드라이브',3,2,{hits:2,breathDice:true}),F('불굴의 호흡',20,{shield:6,...q('breath',2)}),A('줌 펀치',1,1,q('breath',2)),A('스칼렛 오버드라이브',2,2,{breathDice:true,...t('burn',2)}),A('럭 앤 플럭',2,2,{pierce:true,...q('breath',1)}),A('은색의 파문질주',3,3,{breathDice:true}),A('터쿼이즈 블루 오버드라이브',2,2,{ignoreEva:true})]},
 santana:{stats:[108,28,10,8],plan:'살점과 늑골로 출혈을 남기며 보호막을 얻는다. 신체 회복과 변형으로 버티되 파문 같은 누적 피해에 압박받는다.',cards:[A('립스 블레이드',2,1,{hits:3,...t('bleed',1)}),B('흡수하는 육체',{heal:16,shield:5}),A('살점의 침입',1,1,t('sink',2)),A('손가락 탄환',2,1,{hits:3,hit:12}),A('소화하는 신체',2,2,{hitShield:6}),A('늑골 조이기',3,3,{bleedDmg:1}),F('관절 변형',24)]},
 rudol:{stats:[104,30,8,8],plan:'제압 사격과 금속 손아귀로 기세를 모아 자외선 조사에 사용한다. 기계 몸체는 보호막으로 버틴다.',cards:[A('복부 기관총',3,1,{hits:4}),A('자외선 조사 장치',3,3,{spend:4,fixPer:2,...t('burn',3)}),A('금속 손아귀',1,1,q('charge',2)),A('의안의 자외선',2,2,t('burn',2)),A('수류탄 투척',2,2,t('rupture',2)),F('기계 몸체',18,{shield:8}),A('기관총 제압 사격',2,1,{hits:2,...q('charge',1)})]},
 joseph2:{stats:[94,28,20,14],plan:'파문을 전도한 무기로 호흡을 모으고 크래커 볼레이를 강화한다. 함정은 위축과 후속 피해로 처리한다.',cards:[A('크래커 볼레이',3,1,{hits:3,breathDice:true}),F('계산된 후퇴',26,q('breath',2)),A('파문을 실은 주먹',1,1,q('breath',2)),A('크래커 부메랑',2,2,{ignoreEva:true,...q('breath',1)}),A('실에 전도한 파문',2,2,t('sink',3)),A('리버프 오버드라이브',3,3,{breathDice:true}),A('숨겨둔 수류탄',2,2,{sinkDmg:4,...t('burn',1)})]},
 chaka:{stats:[86,30,17,13],plan:'빗나간 검격도 호흡과 다음 명중을 남긴다. 공격으로 얻은 호흡을 검격 피해로 연결한다.',cards:[A('아누비스신의 학습',2,2,{breathDice:true,onMiss:{breath:2,hitNext:8}}),F('공격 궤도 기억',22,q('breath',2)),A('칼을 뽑는 순간',1,1,q('breath',2)),A('기둥을 통과한 참격',2,2,{pierce:true}),A('연속 검격',2,1,{hits:3}),A('기억한 궤도의 베기',3,3,{breathDice:true,hit:16})]},
 khan:{stats:[96,31,12,9],plan:'받아내며 기세를 모은 뒤 발도에 소비한다. 빗나가도 다음 명중을 얻어 같은 허점을 다시 노린다.',cards:[A('아누비스신 · 발도',3,3,{spend:4,fixPer:2}),F('칼날 받아내기',26,{charge:3}),A('칼집으로 밀어내기',1,1,q('charge',2)),A('사각의 발도',2,2,{ignoreEva:true}),A('기억한 반격',2,2,{onMiss:{breath:1,hitNext:10},breathDice:true}),A('가로지르는 칼날',2,1,{hits:2,...t('bleed',2)})]},
 polnareff:{stats:[94,30,22,16],plan:'정밀 찌르기로 호흡을 얻고 빠른 연격에 활용한다. 검신 사출은 전투당 한 번 방어를 관통한다.',cards:[A('실버 채리엇 연격',3,1,{hits:4}),F('검끝으로 흘리기',28,q('breath',2)),A('레이피어 찌르기',1,1,q('breath',2)),A('갑주 해제 연격',2,1,{hits:3,spdDice:[12,1]}),A('검신 사출',3,3,{pierce:true,once:true,hit:24}),A('잔상을 남긴 참격',2,2,{turnStart:{eva:12}}),A('정밀한 급소 찌르기',2,2,{breathDice:true})]},
 westwood:{stats:[104,31,8,9],plan:'격투와 관절기로 기세·취약을 쌓고 운석에 연결한다. 운석은 기세 소비 공격으로 실제 계획에 드러난다.',cards:[A('플래닛 웨이브스',3,3,{spend:4,fixPer:2,...t('burn',2)}),A('교도관의 격투',2,1,{hits:2,...q('charge',1)}),A('어퍼컷',1,1,q('charge',2)),A('암바',2,2,t('rupture',2)),A('데드록',2,2,t('sink',3)),F('고통을 버티는 자세',16,{shield:8})]},
 rikiel:{stats:[88,28,19,13],plan:'로즈의 공격으로 위축을 누적한 뒤 기능을 잃은 부위를 노린다. 불을 붙여 집중을 되찾는 방비는 누적된 해로운 효과를 정리한다.',cards:[A('스카이 하이',2,1,{hits:3,...t('sink',1)}),B('불꽃 속의 집중',{shield:8,cleanseRand:3}),A('눈꺼풀의 체온 탈취',1,1,t('sink',2)),A('로즈의 급강하',2,2,{hit:18}),A('뇌간의 체온 탈취',3,3,{sinkDmg:4}),A('호흡기관을 노리는 로즈',2,2,{kw:[target('sink',2),self('charge',2)]}),A('집중한 로즈의 습격',2,2,{spend:3,fixPer:2})]},
 pucci_mih:{stats:[94,30,23,20],plan:'속도를 참조하는 공격과 기세 소비 일격. 행동 횟수를 무한히 늘리지 않고 빠른 선공과 회피로 가속을 표현한다.',cards:[A('메이드 인 헤븐',3,1,{hits:3,spdDice:[16,1]}),F('가속 속의 이탈',28,{charge:2}),A('시간을 앞지른 접근',1,1,q('charge',2)),A('가속된 칼날',2,2,{spdDice:[16,1],hit:18}),A('사각을 가로지르는 일격',2,2,{ignoreEva:true}),A('나이프 궤도',2,1,{hits:3}),A('천국으로 향하는 일격',3,3,{spend:4,fixPer:2})]},
 lang:{stats:[88,28,18,12],plan:'무중력 압박은 위축으로, 회전 사격은 다중 타격으로 표현한다. 위축이 쌓인 상대에게 진공 공격이 강해진다.',cards:[A('점핑 잭 플래시',2,2,t('sink',3)),F('무중력 궤도',26,{charge:2}),A('무중력 침',1,1,t('sink',2)),A('손목 원심 사격',2,1,{hits:3}),A('진공의 상처',3,3,{sinkDmg:4,...t('bleed',1)}),A('회전하는 파편',2,2,{spend:3,fixPer:2}),A('벽면 도약 사격',2,2,{turnStart:{eva:10}})]},
 sports:{stats:[96,29,17,10],plan:'보이지 않는 사체는 회피와 연타, 물어뜯기는 출혈로 표현한다. 출혈이 누적되면 본체의 습격이 강해진다.',cards:[A('림프 비즈킷',3,1,{hits:3,...t('bleed',1)}),F('보이지 않는 본체',26,{shield:5}),A('보이지 않는 새',1,1,q('charge',2)),A('악어 사체의 습격',2,2,{spend:3,fixPer:2}),A('묘지의 사체들',2,1,{hits:3}),A('본체의 물어뜯기',3,3,{bleedDmg:1}),A('사체를 방패로 삼다',2,2,{hitShield:6})]},
 pucci_ws:{stats:[100,29,16,12],plan:'DISC를 노리는 손은 위축을 쌓고 후속 공격이 이를 참조한다. 환각은 실제 방어·명중 약화 카드로 표시된다.',cards:[A('화이트스네이크 · DISC 추출',3,3,{sinkDmg:4}),B('환각의 안개',{shield:12,debuffHit:-12}),A('기억을 노리는 손',1,1,t('sink',2)),A('스탠드를 노리는 손',2,2,t('sink',3)),A('화이트스네이크 연격',2,1,{hits:3}),A('산성의 환각',2,2,t('burn',2)),F('환각 속의 신부',22)]},
 prosciutto:{stats:[96,29,11,10],plan:'접촉 노화가 위축을 쌓는다. 노화된 상대를 사격으로 마무리하며 턴 경과로 위축이 줄어든다.',cards:[A('그레이트풀 데드',2,2,t('sink',3)),A('노화를 틈탄 사격',2,2,{sinkDmg:4}),A('접촉 노화',1,1,t('sink',2)),A('빈틈없는 권총 사격',2,1,{hits:3}),A('노화의 손아귀',3,3,{sinkDmg:4,hitShield:4}),F('냉정을 유지하는 방비',22,{shield:5})]},
 ghiaccio:{stats:[108,30,10,11],plan:'얼음 장갑은 보호막, 냉각은 위축. 보호막을 얻으며 공격하고 젠틀리 위프스로 방비를 집중한다.',cards:[A('화이트 앨범 돌진',3,3,{sinkDmg:3}),F('화이트 앨범 · 젠틀리 위프스',22,{shield:10}),A('빙판 위의 질주',1,1,q('charge',2)),A('접촉 냉각',2,2,t('sink',3)),A('빙결 장갑 강타',2,2,{hitShield:6}),A('공기마저 얼리는 냉기',3,2,{hits:2,...t('sink',1)}),A('얼음 파편',2,1,{hits:3,spend:3,fixPer:1})]},
 diavolo:{stats:[96,33,20,17],plan:'에피타프로 회피·기세를 확보한 뒤 킹 크림슨에 소비한다. 방어 중에도 공격 계획을 확인할 수 있다.',cards:[A('킹 크림슨',3,3,{spend:4,fixPer:2,pierce:true}),F('에피타프',30,{charge:3}),A('사각으로 파고들기',1,1,q('charge',2)),A('시간 삭제의 일격',2,2,{turnStart:{eva:16},ignoreEva:true}),A('복부를 꿰뚫는 주먹',2,2,t('bleed',2)),A('예지한 궤도의 공격',2,2,{hit:24}),A('지워진 과정의 결말',3,3,{bleedDmg:1})]},
 ndoul:{stats:[86,30,18,10],plan:'게브의 수격으로 출혈을 만들고 소리 감지로 명중을 보완한다. 접근을 저지하는 공격도 기세를 얻는다.',cards:[A('게브의 수격',2,1,{hits:2,...t('bleed',2)}),F('멀리 떨어진 본체',26,{charge:2}),A('지면을 타는 물',1,1,q('charge',2)),A('소리를 포착한 수격',2,2,{hit:24}),A('물의 칼날',3,3,{bleedDmg:1}),A('흔적을 좇는 수격',2,2,{spend:3,fixPer:2,ignoreEva:true})]},
 vanilla:{stats:[104,32,14,13],plan:'암흑 공간 잠복으로 기세를 얻은 뒤 돌진에 소비한다. 노출되는 공격 턴과 회피하는 턴이 실제 카드로 결정된다.',cards:[A('크림의 소멸 돌진',3,3,{spend:4,fixPer:2,pierce:true}),F('암흑 공간 잠복',30,{charge:3}),A('공간을 삼키는 궤도',1,1,q('charge',2)),A('원형으로 좁혀오는 돌진',2,2,t('rupture',2)),A('출구를 막는 돌진',2,2,{ignoreEva:true}),A('모습을 드러낸 강타',2,2,{hit:18})]},
 dio3:{stats:[108,32,16,15],plan:'시간정지는 전투당 한 번. 견제와 무다 러시로 기세를 모아 로드롤러에 소비하며 부상 시 흡혈한다.',cards:[A('정지 속의 나이프',3,1,{hits:4}),B('THE WORLD',{c:3,skipTurns:1,once:true}),A('더 월드의 견제',1,1,q('charge',2)),A('무다무다 러시',2,1,{hits:3,...q('charge',1)}),A('로드롤러',3,3,{spend:5,fixPer:2}),B('흡혈',{heal:18}),A('나이프 포위',2,2,{ignoreEva:true}),A('최고로 HIGH한 일격',2,2,{spend:3,fixPer:2})]},
 kakyoin:{stats:[90,29,17,12],plan:'법황의 촉수로 위축을 남기고 결계 사격이 이를 참조한다. 보호막과 원거리 명중으로 사격을 지속한다.',cards:[A('반경 20미터 에메랄드 스플래시',3,1,{hits:4}),F('법황의 결계',22,{shield:6}),A('법황의 촉수',1,1,t('sink',2)),A('에메랄드 스플래시',2,1,{hits:3}),A('결계의 집중 사격',3,3,{sinkDmg:4}),A('촉수로 끌어당기기',2,2,{kw:[target('sink',2),self('charge',2)]}),A('사각의 에메랄드',2,2,{spend:3,fixPer:2,hit:18})]},
 joseph3:{stats:[94,28,18,10],plan:'허밋 퍼플로 위축을 쌓으며 호흡을 얻고 덩굴에 전도한 파문으로 후속 공격한다.',cards:[A('허밋 퍼플의 파문',2,2,{breathDice:true,...t('burn',2)}),F('파문을 두른 덩굴',24,q('breath',2)),A('허밋 퍼플 구속',1,1,t('sink',2)),A('덩굴을 타는 파문',2,2,q('breath',2)),A('구속된 상대의 빈틈',3,3,{sinkDmg:4}),A('파문 방어선',2,2,{hitShield:5,breathDice:true})]},
 jotaro:{stats:[108,33,19,16],plan:'정밀 공격으로 호흡을 얻고 스타 핑거가 이를 참조한다. 짧은 시간정지는 전투당 한 번, 오라 러시는 다중 타격이다.',cards:[A('스타 플래티나 · 오라 러시',3,1,{hits:4,hit:16}),F('정밀한 방어',26,q('breath',2)),A('스타 플래티나의 주먹',1,1,q('breath',2)),A('스타 핑거',2,2,{breathDice:true,ignoreEva:true}),A('오라오라 연격',2,1,{hits:3}),B('스타 플래티나 · 더 월드',{c:3,skipTurns:1,once:true}),A('제로 거리의 일격',3,3,{breathDice:true,pierce:true}),A('탄환을 붙잡는 정밀함',2,2,{hitShield:5})]},
 mike:{stats:[92,29,15,11],plan:'금속 풍선으로 취약을 누적하고 추적 공격의 명중을 높인다. 셔터 절단은 출혈과 단발 피해를 담당한다.',cards:[A('튜블러 벨즈 · 추적견',2,1,{hits:3,...t('rupture',1)}),F('금속 풍선의 방비',22,{shield:6}),A('못에 불어넣은 숨',1,1,q('charge',2)),A('냄새를 기억한 추적견',2,2,{hit:24}),A('철제 셔터 절단',3,3,t('bleed',2)),A('풍선의 내부 침입',2,2,{spend:3,fixPer:2,pierce:true})]}
 };
 const describe=c=>{const s=[c.t==='atk'?c.hits+'회 × '+c.dice+'d6 · 명중 +'+c.hit:c.t==='def'?'회피 +'+c.eva:'보조'];if(c.kw)for(const[k,n,to]of c.kw)s.push((to==='s'?'자신 ':'상대 ')+D.keywords[k].n+' +'+n+(c.t==='atk'?' (적중마다)':''));if(c.spend)s.push('기세 최대 '+c.spend+' 소비 · 소비당 피해 +'+c.fixPer);if(c.breathDice)s.push('자신 호흡만큼 피해 가산');if(c.sinkDmg)s.push('상대 위축 단계당 피해 +'+c.sinkDmg);if(c.bleedDmg)s.push('상대 출혈당 피해 +'+c.bleedDmg);if(c.hitShield)s.push('적중마다 보호막 +'+c.hitShield);if(c.shield)s.push('보호막 +'+c.shield);if(c.cleanseRand)s.push('출혈·화상·취약 중 무작위 한 종류 '+c.cleanseRand+' 정화');if(c.heal)s.push('HP '+c.heal+' 회복');if(c.charge)s.push('기세 +'+c.charge);if(c.pierce)s.push('방어 관통');if(c.ignoreEva)s.push('상대 회피 보너스 무시');if(c.turnStart?.eva)s.push('턴 시작 회피 +'+c.turnStart.eva);if(c.onMiss)s.push('빗나감: 호흡 +'+c.onMiss.breath+' · 다음 명중 +'+c.onMiss.hitNext);if(c.spdDice)s.push('속도 '+c.spdDice[0]+' 이상: 주사위당 +'+c.spdDice[1]);if(c.debuffHit)s.push('상대 다음 라운드 명중 '+c.debuffHit);if(c.skipTurns)s.push('상대 다음 '+c.skipTurns+'턴 정지');if(c.once)s.push('전투당 1회');return s.join(' · ');};
 for(const[key,row]of Object.entries(rows)){
  const id='hr_'+key,e=D.enemies[id];const suffix=['strike','support','probe','art','combo','finish','extra','last'];
  e.deck=row.cards.map((c,i)=>{const cid=id+'_'+suffix[i];D.cards[cid]={...c,d:describe(c),sbrId:cid};return cid;});
  [e.hp,e.atk,e.eva,e.spd]=row.stats;e.signature=e.deck[0];e.signatureEvery=3;e.hiddenDeckVersion=2;e.ability=row.plan;
  D.hiddenBossCatalog[id].shared=true;D.hiddenBossCatalog[id].guide=row.plan;
  // Bespoke multi-hit decks already carry resource payoffs; do not add a die to every hit.
  D.opponentOverrides??={};D.opponentOverrides[id]={dice:0,b:2};
  // Keep the existing reward ID, but let the lesson teach the actual remade signature.
  const lesson=D.hiddenBossCatalog[id].card,old=D.cards[lesson];D.cards[lesson]={...D.cards[e.signature],n:old.n,c:Math.min(2,D.cards[e.signature].c),sbrId:lesson};D.cards[lesson].d=describe(D.cards[lesson])+' · 전용 보상';
 }
 // Existing SBR bosses already have complete canonical decks; never truncate their plans.
 for(const id of ['oye','wekapipo','magenta','valentine']){D.hiddenBossCatalog[id].shared=true;D.hiddenBossCatalog[id].guide=D.enemies[id].ability;}
 for(const e of D.events.filter(e=>e.hiddenEnemy)){const foe=D.enemies[e.hiddenEnemy];e.x=foe.n+'과 마주했다. '+foe.ability+' 앞선 여정에서 모은 단서와 장비를 확인하고 대결에 나선다.';e.c[0].ok.t=e.x;}

 const aftermath={
 bruford:'검을 쥔 머리카락이 풀리고 브루포드가 무릎을 꿇었다. 그는 더 이상 도망치는 사람들을 붙잡지 않았다. 성문으로 이어지는 길이 드러났다.',
 tarkus:'엇갈려 조이던 사슬의 한쪽이 끊겼다. 타커스가 다시 힘을 주기 전에 강철 목걸이의 열쇠를 빼냈다. 갇힌 사람들의 출구가 열렸다.',
 dio1:'얼어붙은 손에서 벗어나 마지막 파문을 전했다. 디오의 재생이 멎는 사이 돌가면을 회수했다. 성 밖의 하늘이 밝아오기 시작했다.',
 esidisi:'발밑을 뻗던 혈관이 끊기고 유적의 열기가 잦아들었다. 불에 타기 전에 봉인 기록을 꺼냈다. 다음 흔적은 바람이 드나드는 투기장으로 이어졌다.',
 wamuu:'회오리가 흩어지고 와무우의 자세가 무너졌다. 그는 승부가 끝났음을 인정하고 추격로에서 물러섰다. 남은 기록에는 카즈의 목적지가 적혀 있었다.',
 kars:'톱니처럼 빛나던 칼날의 궤도를 끊었다. 카즈가 다시 몸을 돌리기 전에 기록과 목격자를 밖으로 보냈다. 그의 완전한 승리를 위한 계획은 여기서 멈췄다.',
 dire:'교차한 팔 사이를 빠져나와 파문이 전도될 접촉을 끊었다. 쓰러진 다이어 곁에는 장미 한 송이가 남았다. 가면을 둘러싼 추적은 끝나지 않았다.',
 will:'체펠리의 호흡 사이로 생긴 짧은 틈을 잡았다. 그는 물러서면서도 가면이 또 다른 희생을 만들 것이라 경고했다. 당신은 그 경고를 들은 채 길을 이어 갔다.',
 jonathan:'검끝의 파문이 잦아들었다. 죠나단을 넘어섰지만 가면을 지키기로 한 선택의 결과까지 사라지지는 않았다. 승부 뒤의 침묵을 안고 레이스로 돌아간다.',
 santana:'안으로 파고들던 살점을 떼어내고 늑골의 틈을 벌렸다. 산타나가 몸을 다시 맞추기 전에 신체 문양과 같은 유적 기록을 손에 넣었다.',
 rudol:'금속 손아귀를 벗어나 자외선 장치의 조사축을 꺾었다. 기관총의 탄띠가 끊어진 사이 표본 회수 문서를 챙겼다. 시설 밖에는 다른 추적자가 기다렸다.',
 joseph2:'눈에 띄는 미끼 뒤에 숨겨진 두 번째 함정을 걷어냈다. 죠셉의 다음 수보다 먼저 기록을 회수했다. 유적의 이름으로 불리던 몸이 다시 자신의 것이 되었다.',
 chaka:'칼이 기억한 궤도에서 벗어나 다른 방향으로 마지막 공격을 넣었다. 차카의 손에서 검이 떨어졌다. 빼앗을 수 있는 기술과 지켜야 할 의지를 구별했다.',
 khan:'칼집이 움직이는 순간을 읽어 발도를 멈췄다. 기억된 반격이 돌아오기 전에 검을 거뒀다. 다음 싸움에서도 같은 수만 반복할 수는 없다.',
 polnareff:'겹쳐 보이던 검끝 중 실제 궤도를 붙잡았다. 실버 채리엇의 마지막 찌르기가 멎었다. 남의 검술을 기억하던 칼을 자신의 의지로 거둔다.',
 westwood:'관절기를 풀고 운석이 사라지는 경계 밖으로 몸을 던졌다. 타오른 잔해 사이에서 호송 명부를 건졌다. 구출한 사람들과 함께 다음 목적지를 확인한다.',
 rikiel:'로즈가 선회하는 흐름을 끊어 빼앗긴 체온을 되찾았다. 리키엘의 집중이 흐트러진 틈에 연결한 실을 당겼다. 관측소로 향하는 사람들을 놓치지 않았다.',
 pucci_mih:'눈으로 쫓을 수 없는 속도 속에서 지형에 남긴 매듭을 기준으로 마지막 공격을 맞췄다. 가속을 좇던 대신 돌아올 자리를 지킨 승리였다.',
 lang:'떠오른 파편 사이에 발을 고정하고 원심 사격의 방향을 바꿨다. 랭 랭글러가 물러나자 무중력이 풀렸다. 흩어졌던 군체와 기억을 다시 모았다.',
 sports:'사체가 남긴 상처와 발자국을 따라 보이지 않는 본체를 붙잡았다. 마지막 습격이 멎고 묘지가 조용해졌다. 지워질 뻔한 증언을 들고 나왔다.',
 pucci_ws:'DISC를 노리는 손목을 붙잡고 환각 밖으로 빠져나왔다. 기억은 다시 군체 안에 자리 잡았다. 누가 주었든 지금 살아가는 자신에게 속한 기억이었다.',
 prosciutto:'노화가 퍼지는 접촉을 끊고 열차의 출구를 열었다. 차가운 공기가 들어오는 동안 보호 대상을 옮겼다. 남은 추격자는 앞쪽 철로를 막고 있었다.',
 ghiaccio:'얼음 장갑 전체를 깨려던 공격을 멈추고 드러난 틈에 탄환을 모았다. 철로를 막던 얼음이 무너지자 보호 대상이 건널 길이 열렸다.',
 diavolo:'그가 다시 나타날 자리에 탄환을 남겼다. 지워진 시간 뒤에도 보호 대상과 약속은 사라지지 않았다. 보스의 정체를 숨기던 추격이 끝났다.',
 ndoul:'물소리가 아닌 지팡이의 위치를 좇아 본체에 닿았다. 마지막 수격이 모래 속으로 스며들었다. 사막을 지나 저택으로 향할 길이 열렸다.',
 vanilla:'암흑 공간을 향해 무작정 공격하지 않고 그가 확인하러 나오는 순간을 붙잡았다. 원형으로 좁혀오던 소멸의 궤도가 끊겼다. 저택 안쪽의 시계는 아직 움직이지 않았다.',
 dio3:'멈춘 시간이 끝나고도 남은 나이프를 피했다. 마지막 돌진을 넘자 저택의 시계들이 다시 움직였다. 누구에게도 바치지 않은 시간을 되찾았다.',
 kakyoin:'결계의 한 점을 끊고 쏟아지는 에메랄드 사이로 빠져나왔다. 카쿄인의 추적이 멈췄지만 당신의 능력을 경계하는 일행은 아직 남아 있었다.',
 joseph3:'덩굴의 접촉을 끊은 뒤 파문이 빠져나갈 때까지 기다렸다. 죠셉의 추적선을 넘었고 앞에는 정지된 시간을 바라보는 눈이 있었다.',
 jotaro:'서로 움직일 수 있는 짧은 순간이 끝났다. 마지막 주먹을 넘은 뒤 자신의 이름을 밝혔다. 그의 경계와 이번 승부의 기록을 남긴 채 말에 오른다.',
 mike:'냄새를 좇는 금속 풍선을 끊고 셔터의 날을 피했다. 추적에서 벗어난 사람들이 역참으로 향했다. 남은 것은 그들에게 내려진 회수 명령의 주인이었다.'
 };
 for(const[key,text]of Object.entries(aftermath)){const id='hr_'+key;D.enemies[id].story=text;for(const e of D.events.filter(e=>e.hiddenEnemy===id))e.c[0].ok.fx.combat.winText=text;}
 const sceneLabels={
 steel:['폭발 흔적에서 핀의 위치를 읽는다','갇힌 사람들의 탈출로를 확보한다'],satellite:['추적할 금속 조각을 거둔다','호송대의 사각으로 사람들을 옮긴다'],hamon_mask:['사슬과 냉각의 접촉점을 살핀다','햇빛이 드는 퇴로를 남긴다'],hamon_ruin:['혈관과 바람이 지난 궤도를 읽는다','봉인 기록과 인부들을 먼저 보호한다'],vampire:['파문이 전도될 접촉을 피하며 접근한다','가면을 감싸고 호흡의 틈을 기다린다'],pillar:['신체와 장치의 약점을 기록한다','빛을 피할 탈출로를 만든다'],sword:['새로 배운 검격을 공격에 연결한다','검을 거두고 상대의 첫 수를 기다린다'],thread:['실로 다음 공격의 기준점을 남긴다','사람들과 퇴로를 실로 묶는다'],colony:['군체를 나누어 적의 흔적을 좇는다','흩어진 군체와 기억부터 모은다'],pistols:['다음 탄환이 들어갈 궤도를 정한다','보호 대상을 엄폐물 뒤로 옮긴다'],time_dio:['정지가 끝난 직후의 공격을 준비한다','남겨질 나이프와 돌진의 퇴로를 읽는다'],time_joestar:['결계와 덩굴 사이의 공격로를 찾는다','상대의 반격을 피할 거리를 남긴다']};
 for(const e of D.events.filter(e=>e.hiddenRouteScene&&!e.hiddenEnemy&&e.hiddenStep<6)){const labels=sceneLabels[e.hiddenRouteId];e.c[0].l=labels[0];e.c[1].l=labels[1];}

 D.hiddenBossRemake={version:2,sharedEffectsOnly:true};
}
