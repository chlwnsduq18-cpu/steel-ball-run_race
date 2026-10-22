// Canonical abilities are expressed with the existing shared card/keyword vocabulary.
export function addEncounterData(D){
 const wiki=name=>'https://seore.org/w/'+encodeURIComponent(name);
 const atk=(id,n,c,fx,d)=>{D.cards[id]={n,c,t:'atk',hits:1,dice:1,b:0,hit:5,...fx,d};return id;};
 const buff=(id,n,c,fx,d)=>{D.cards[id]={n,c,t:'buff',...fx,d};return id;};
 const def=(id,n,c,fx,d)=>{D.cards[id]={n,c,t:'def',...fx,d};return id;};
 const card=(who,key,n,c,fx,d)=>atk('sbr_'+who+'_'+key,n,c,fx,d);
 const a={};
 a.gyro=card('gyro','throw','회전하는 두 철구',1,{hits:2,kw:[['charge',1,'s']]},'2회 공격 · 적중마다 기세 +1');
 a.scan=card('gyro','scan','스캔 · 꿰뚫어 본 궤적',2,{hits:2,hit:18,kw:[['rupture',1,'t']]},'2회 공격 · 명중 +18 · 적중마다 취약 +1');
 a.ball=card('gyro','ballbreaker','볼 브레이커',3,{hits:2,dice:2,spend:3,fixPer:2,kw:[['sink',2,'t']]},'2회 × 2d6 공격 · 기세 최대 3 소비, 소비당 피해 +2 · 적중마다 위축 +2');
 a.nail=card('johnny','nail','터스크 ACT.1 · 회전하는 손톱탄',1,{hits:2,kw:[['rupture',1,'t']]},'2회 공격 · 적중마다 취약 +1');
 a.hole=card('johnny','hole','터스크 ACT.2 · 추적하는 탄흔',2,{hits:2,dice:2,hit:12,kw:[['rupture',2,'t']]},'2회 × 2d6 공격 · 명중 +12 · 적중마다 취약 +2');
 a.hide=def('sbr_johnny_hide','터스크 ACT.3 · 구멍 속으로',1,{eva:18,turnStart:{eva:18}},'턴 시작부터 이번 턴 회피 +18');
 a.infinite=card('johnny','infinite','터스크 ACT.4 · 무한의 회전',3,{hits:3,dice:2,hit:15,kw:[['rupture',2,'t']]},'3회 × 2d6 공격 · 명중 +15 · 적중마다 취약 +2');
 a.diego=card('diego','pounce','스케어리 몬스터즈 · 도약',1,{hits:2,kw:[['bleed',1,'t'],['breath',1,'s']]},'2회 공격 · 적중마다 출혈 +1 · 호흡 +1');
 a.hotpants=card('hotpants','spray','크림 스타터 · 살점 분사',1,{hits:2,kw:[['sink',1,'t']]},'2회 공격 · 적중마다 위축 +1');
 a.mask=card('hotpants','mask','크림 스타터 · 감각을 덮다',2,{dice:2,kw:[['sink',3,'t']]},'2d6 공격 · 위축 +3');
 a.rope=card('mountain','rope','오! 론섬 미 · 밧줄을 타는 총격',1,{hits:2,kw:[['charge',1,'s']]},'2회 공격 · 적중마다 기세 +1');
 a.unravel=def('sbr_mountain_unravel','오! 론섬 미 · 풀어낸 몸',1,{eva:15,turnStart:{eva:15}},'턴 시작부터 이번 턴 회피 +15');
 a.oye=card('oye','pin','나의 리듬을 들어 줘 · 안전핀',1,{kw:[['burn',2,'t']]},'공격 · 화상 +2');
 a.blast=card('oye','blast','폭탄으로 바뀐 물방울',2,{hits:2,kw:[['burn',2,'t']]},'2회 공격 · 적중마다 화상 +2');
 a.duel=card('ringo','duel','정면에서 뽑은 권총',1,{dice:2,hit:10},'2d6 공격 · 명중 +10');
 a.sand=card('sandman','foot','대지를 박차는 발',1,{hits:2,kw:[['breath',1,'s']]},'2회 공격 · 적중마다 호흡 +1');
 a.sound=card('sandman','sound','인 어 사일런트 웨이 · 소리의 함정',2,{hits:2,kw:[['bleed',1,'t'],['sink',1,'t']]},'2회 공격 · 적중마다 출혈 +1 · 위축 +1');
 a.rain=card('blackmore','rain','캐치 더 레인보우 · 고정된 비',1,{hits:2,kw:[['bleed',1,'t']]},'2회 공격 · 적중마다 출혈 +1');
 a.rainstep=def('sbr_blackmore_step','빗방울 위의 발판',1,{eva:16,turnStart:{eva:16}},'턴 시작부터 이번 턴 회피 +16');
 a.satellite=card('wekapipo','satellite','렉킹 볼 · 작은 철구',1,{hits:2,kw:[['sink',1,'t']]},'2회 공격 · 적중마다 위축 +1');
 a.magenta=card('magenta','shot','자세를 풀고 쏘는 권총',1,{dice:2},'2d6 공격');
 a.flag=card('valentine','flag','D4C · 틈새의 습격',1,{hits:2,kw:[['charge',1,'s']]},'2회 공격 · 적중마다 기세 +1');
 a.love=buff('sbr_valentine_love','D4C · 러브 트레인',2,{shield:24,once:true},'보호막 +24 · 전투당 한 번');
 a.knife=card('otherdiego','knife','THE WORLD · 나이프 투척',1,{hits:3,kw:[['bleed',1,'t']]},'3회 공격 · 적중마다 출혈 +1');
 a.wire=card('otherdiego','wire','와이어와 기름의 함정',2,{hits:2,kw:[['burn',2,'t']]},'2회 공격 · 적중마다 화상 +2');
 const decks={gyro:[a.gyro,a.gyro,'sbr_enemy_gyro'],johnny:['sbr_basic_shoot','sbr_basic_shoot','sbr_basic_aim'],diego:[a.diego,a.diego,'sbr_enemy_diego'],hotpants:[a.hotpants,a.hotpants,a.mask,'sbr_enemy_hotpants'],mountain:[a.rope,a.rope,'sbr_enemy_mountain',a.unravel],oye:[a.oye,a.oye,a.blast,'sbr_enemy_oye'],ringo:[a.duel,a.duel,'sbr_enemy_ringo'],sandman:[a.sand,a.sand,'sbr_basic_step'],blackmore:[a.rain,a.rain,'sbr_enemy_blackmore',a.rainstep],wekapipo:[a.satellite,a.satellite,'sbr_enemy_wekapipo'],magenta:[a.magenta,a.magenta,'sbr_enemy_magenta'],valentine:[a.flag,a.flag,'sbr_enemy_valentine'],otherdiego:[a.knife,a.knife,a.wire,'sbr_enemy_otherdiego']};
 const profiles={gyro:[88,29,13,11],johnny:[82,29,12,8],diego:[84,28,14,15],hotpants:[90,24,13,10],mountain:[80,26,16,12],oye:[84,28,9,9],ringo:[88,31,13,10],sandman:[80,26,15,17],blackmore:[80,27,18,11],wekapipo:[90,30,13,12],magenta:[110,25,7,6],valentine:[104,31,15,12],otherdiego:[96,30,16,17]};
 const abilities={hotpants:'크림 스타터',mountain:'오! 론섬 미',oye:'나의 리듬을 들어 줘',ringo:'맨덤',blackmore:'캐치 더 레인보우',wekapipo:'렉킹 볼',magenta:'20th Century Boy',otherdiego:'THE WORLD'};
 for(const b of D.hiddenBosses){
  const e=D.enemies[b.id];b.from=b.id==='valentine'?6:b.id==='otherdiego'?8:1;b.to=9;
  e.from=b.from;e.to=9;e.deck=decks[b.id];e.signature=e.rewardCards[0];e.canonical=true;
  // The level of the individual, not its old appearance window, sets the base threat.
  const [hp,atk,eva,spd]=profiles[b.id];Object.assign(e,{hp,atk,eva,spd,ability:abilities[b.id]||e.ability});
  const clue=D.events.find(x=>x.id==='clue_'+b.id);if(clue){clue.from=b.from;clue.to=9;}
 }
 for(const [id,t,x,l]of [
  ['johnny','젊은 기수의 발자취','낡은 말굽 자국이 길게 이어진다. 앞서간 참가자는 죠니라는 젊은 기수를 보았다고 말한다.','기수가 지나간 방향을 기록한다'],
  ['diego','빠른 기수가 남긴 흔적','서로 일정한 간격의 말굽 자국이 길을 가로지른다. 영국에서 온 유명한 기수가 이 길을 지났다는 소문을 들었다.','말굽 자국이 향한 곳을 기억한다']
 ]){const e=D.events.find(e=>e.id==='clue_'+id);e.t=t;e.x=x;e.c[0].l=l;}
 const form=(id,from,n,deck,signature,extra={})=>({id,from,n,deck,signature,...extra});
 D.enemies.gyro.forms=[form('rotation',1,'철구의 회전',[a.gyro,a.gyro,'sbr_enemy_gyro'],'sbr_enemy_gyro'),form('scan',3,'스캔',[a.gyro,a.scan,a.scan,'sbr_enemy_gyro'],a.scan,{power:1.12}),form('ballbreaker',8,'볼 브레이커',[a.gyro,a.scan,a.ball,a.ball],a.ball,{power:1.35})];
 D.enemies.johnny.forms=[form('rider',1,'말 위의 사격',decks.johnny,'sbr_basic_shoot',{rewardCards:['sbr_basic_shoot']}),form('act1',2,'터스크 ACT.1',[a.nail,a.nail,'sbr_enemy_johnny'],'sbr_enemy_johnny'),form('act2',5,'터스크 ACT.2',[a.nail,a.hole,a.hole],a.hole,{power:1.12}),form('act3',7,'터스크 ACT.3',[a.hole,a.hole,a.hide],a.hole,{power:1.2}),form('act4',8,'터스크 ACT.4',[a.hole,a.hide,a.infinite,a.infinite],a.infinite,{power:1.4})];
 D.enemies.diego.forms=[form('rider',1,'천재 기수',['sbr_basic_rush','sbr_basic_shoot','sbr_basic_feint'],'sbr_basic_rush',{rewardCards:['sbr_basic_rush']}),form('scary',3,'스케어리 몬스터즈',decks.diego,'sbr_enemy_diego',{power:1.12})];
 D.enemies.sandman.forms=[form('runner',1,'맨발의 주자',decks.sandman,a.sand,{rewardCards:[a.sand]}),form('sound',5,'인 어 사일런트 웨이',[a.sand,a.sound,'sbr_enemy_sandman'],'sbr_enemy_sandman',{power:1.15})];
 D.enemies.valentine.forms=[form('d4c',6,'D4C',decks.valentine,'sbr_enemy_valentine'),form('love',8,'D4C · 러브 트레인',[a.flag,'sbr_enemy_valentine',a.love],a.love,{power:1.2})];
 const named=[
  ['robinson','미세스 로빈슨','벌레를 이용한 습격',1,'선인장 곁에서 기수가 고삐를 당긴다. 안대를 쓴 얼굴 가까이에서 작은 벌레들이 흩어진다.',[
   ['insects','벌레가 몰아낸 바늘',1,{hits:2,kw:[['bleed',1,'t']]},'2회 공격 · 적중마다 출혈 +1'],['cactus','초야의 사정거리',2,{dice:2,kw:[['rupture',2,'t']]},'2d6 공격 · 취약 +2']]],
  ['boomboom','붐붐 일가','툼 오브 더 붐',1,'닮은 얼굴의 세 기수가 길을 에워싼다. 몸에 묻은 핏자국 쪽으로 작은 쇳조각들이 끌려온다.',[
   ['magnet','툼 오브 더 붐 · 끌려오는 쇳조각',1,{hits:2,kw:[['rupture',1,'t']]},'2회 공격 · 적중마다 취약 +1'],['blood','피가 묻은 탄환',2,{hits:2,kw:[['bleed',2,'t']]},'2회 공격 · 적중마다 출혈 +2']]],
  ['stroheim','프리츠 폰 슈트로하임','주먹에 숨긴 총',1,'검문을 하듯 다가온 남자가 주먹을 들어 올린다. 손 안쪽의 총구가 당신을 향한다.',[
   ['fist','주먹 안의 총구',1,{dice:2,hit:10},'2d6 공격 · 명중 +10'],['ambush','지근거리의 기습 사격',2,{hits:2,hit:15},'2회 공격 · 명중 +15']]],
  ['porkpie','포크 파이 햇 꼬마','와이어드',1,'나뭇가지에 걸린 낚싯바늘이 흔들린다. 보이지 않는 곳에서 줄이 팽팽하게 당겨진다.',[
   ['hooks','와이어드 · 두 개의 갈고리',1,{hits:2,kw:[['bleed',1,'t']]},'2회 공격 · 적중마다 출혈 +1'],['pull','와이어드 · 낚아 올리다',2,{dice:2,kw:[['sink',3,'t']]},'2d6 공격 · 위축 +3']]],
  ['eleven','11명의 남자','타투 유',1,'한 사람의 발소리를 따라 돌아보자 같은 옷차림의 남자들이 나타난다. 한 명의 등 뒤에서 또 다른 총구가 나온다.',[
   ['tattoo','타투 유 · 등 뒤의 총구',1,{hits:3},'3회 공격'],['crossfire','겹쳐지는 사선',2,{hits:3,kw:[['rupture',1,'t']]},'3회 공격 · 적중마다 취약 +1']]],
  ['disco','디·스·코','초콜릿 디스코',6,'과묵한 남자가 팔의 장치를 누른다. 당신이 선 바닥 위로 격자 모양의 선이 드러난다.',[
   ['grid','초콜릿 디스코 · 좌표 지정',1,{dice:2,hit:15},'2d6 공격 · 명중 +15'],['drop','좌표 위로 떨어지는 공격',2,{hits:2,kw:[['rupture',2,'t']]},'2회 공격 · 적중마다 취약 +2']]]
 ];
 D.namedEncounters=[];
 for(const[id,n,ability,from,omen,rows]of named){const ids=rows.map(([key,n,c,fx,d])=>card(id,key,n,c,fx,d));D.enemies[id]={n,ability,kind:'named',canonical:true,hp:52,atk:23,eva:9,spd:8,evadeDie:75,from,to:9,deck:[ids[0],ids[0],ids[1]],signature:ids[1],rewardCards:[ids[1]],money:36,story:'상대의 독특한 공격을 견뎌 내고 자신의 레이스로 돌아왔다.',source:wiki(n)};D.namedEncounters.push({id,from,to:9,omen});}
 D.encounterRules={namedChance:8,growthCap:30,growthShare:.35,hpPerStep:.035,actionsPerStep:2,atkEvery:2,variance:.06};
 // One short, verified Korean excerpt per speaker. These are wiki transcriptions,
 // not claims of independently checking a licensed Korean volume or game subtitle.
 const quote=(id,text,cards,source)=>({text,cards,source,verification:'한국어 위키에 수록된 대사',checked:'2026-10-18'});
 D.quotes={
  gyro:quote('gyro','회전은 무한의 힘이다. 그걸 믿어라',['sbr_enemy_gyro',a.scan,a.ball],wiki('자이로 체펠리')),
  johnny:quote('johnny','방금 알았다. 쏴야만 할 장소를...!',['sbr_enemy_johnny',a.hole,a.infinite],wiki('죠니 죠스타')),
  ringo:{...quote('ringo','능력 이름 『맨덤』. 그렇게 알아뒀으면 좋겠다.',['sbr_enemy_ringo'],'https://namu.moe/w/'+encodeURIComponent('맨덤')),trigger:'defeated',defeatedText:"어서 와라… '남자의 세계'에…",defeatedSource:wiki('링고 로드어게인')},
  blackmore:quote('blackmore','내 능력명은 『캐치 더 레인보우』. 건드린 빗방울을... 공중에 『고정』할 수 있다...',['sbr_enemy_blackmore'], 'https://namu.moe/w/'+encodeURIComponent('캐치 더 레인보우')),
  valentine:quote('valentine','아주 간단히 행해지는 지독한 행위',['sbr_enemy_valentine'],wiki('퍼니 밸런타인')),
  otherdiego:quote('otherdiego','THE WORLD... 나만의 시간이다.',['sbr_enemy_otherdiego'],wiki('디에고 브란도(평행세계)')),
  boomboom:quote('boomboom','행복하냐? 행복하지. 우리 가족으은!',['sbr_boomboom_blood'],wiki('붐붐 일가')),
  disco:quote('disco','초콜릿 디스코... 내 스탠드의 이름이다.',['sbr_disco_drop'],wiki('디 스 코'))
 };
 D.journeySource.note='원작 인물은 무명 적과 별도의 무작위 조우 표를 사용한다. 보스는 단서가 필요하고 일부 후반 인물만 최소 구간을 둔다. 격파한 인물은 형태와 무관하게 재등장하지 않는다.';
}
