export function addBirthData(data){
 const cards=data.cards;
 const add=(id,n,c,t,fx,d)=>{cards[id]={n,c,t,...(t==='atk'?{hits:1,dice:1,b:0,hit:5}:{}),...fx,d};return id;};
 const base={
 strike:add('sbr_basic_strike','스탠드 타격',1,'atk',{dice:2},'1회 × 2d6 공격 · 명중 +5'),
 rush:add('sbr_basic_rush','연속 타격',2,'atk',{hits:3,hit:0},'3회 × 1d6 공격 · 명중 +0'),
 shoot:add('sbr_basic_shoot','원거리 견제',1,'atk',{hit:15},'1회 × 1d6 공격 · 명중 +15'),
 aim:add('sbr_basic_aim','공격 준비',1,'buff',{passNext:10,kw:[['charge',2,'s']]},'기세 +2 · 다음 턴 명중 +10'),
 guard:add('sbr_basic_guard','공격을 흘리다',1,'def',{eva:15,shield:3},'이번 턴 회피 +15 · 보호막 +3'),
 brace:add('sbr_basic_brace','방어를 굳히다',1,'buff',{shield:6},'보호막 +6'),
 breathe:add('sbr_basic_breathe','호흡 가다듬기',1,'buff',{kw:[['breath',3,'s']]},'자신의 호흡 +3'),
 step:add('sbr_basic_step','가벼운 발놀림',1,'def',{eva:20,selfHit:5},'이번 턴 회피 +20 · 명중 +5'),
 burst:add('sbr_basic_burst','기세를 실은 일격',3,'atk',{dice:3,spend:3,fixPer:2},'1회 × 3d6 · 기세 최대 3 소비 · 소비당 적중 피해 +2'),
 feint:add('sbr_basic_feint','허를 찌르다',1,'atk',{kw:[['sink',3,'t']]},'1회 × 1d6 · 적중 시 위축 +3'),
 pressure:add('sbr_basic_pressure','방어를 무너뜨리다',2,'atk',{hits:2,kw:[['rupture',1,'t']]},'2회 × 1d6 · 적중마다 취약 +1'),
 cut:add('sbr_basic_cut','스치는 상처',1,'atk',{kw:[['bleed',1,'t']]},'1회 × 1d6 · 적중 시 출혈 +1')
 };
 const normal=[
 ['ranch','목장 출신',10,'근거리 강타형','기세 · 취약',{atk:2},['strike','pressure','guard','breathe','aim','burst']],
 ['frontier','변경 개척민',8,'원거리 견제형','명중 · 출혈',{maxHp:6},['shoot','cut','step','aim','feint','burst']],
 ['drifter','떠돌이',8,'근거리 연타형','연타 · 회피',{spd:2},['strike','rush','step','breathe','feint','cut']],
 ['marksman','사격수 집안',7,'원거리 정밀형','명중 · 기세',{atk:3},['shoot','aim','guard','breathe','feint','burst']],
 ['medic','시골 의사의 조수',7,'방어 지원형','호흡 · 보호막',{maxHp:8},['strike','shoot','guard','breathe','brace','cut']],
 ['caravan','역마차 호위',7,'근거리 방어형','보호막 · 강타',{eva:2},['strike','guard','brace','aim','pressure','burst']],
 ['craftsman','공방 집안',7,'원거리 준비형','기세 · 정밀 공격',{atk:1,eva:1},['shoot','aim','guard','pressure','feint','burst']],
 ['riverboat','강가의 뱃사람',7,'근거리 교란형','위축 · 연타',{eva:3},['rush','step','cut','breathe','feint','pressure']],
 ['miner','광부 집안',6,'근거리 중량형','보호막 · 취약',{maxHp:10},['strike','brace','guard','aim','pressure','burst']],
 ['performer','유랑 공연단',6,'근거리 기교형','호흡 · 회피',{eva:1,spd:1},['rush','step','breathe','feint','pressure','cut']],
 ['scout','황야의 길잡이',6,'원거리 추격형','속도 · 명중',{spd:3},['shoot','aim','step','feint','cut','rush']],
 ['messenger','우편 기수',6,'근거리 속공형','속도 · 연타',{spd:2,eva:1},['rush','strike','step','aim','breathe','pressure']]
 ].map(([id,n,weight,form,focus,fx,keys])=>({id,n,weight,hidden:false,form,focus,fx,stats:{atk:24,spd:6,eva:10},deck:keys.flatMap(k=>[base[k],base[k]])}));
 const hiddenWeights={steel:3,satellite:2,hamon:1,vampire:1,pillar:1,sword:2,thread:1,colony:1,pistols:2,time:1};
 for(const o of data.starts)Object.assign(o,{hidden:true,weight:hiddenWeights[o.id],form:o.n,fx:{},otherPartProtagonist:['hamon','thread','time'].includes(o.id)});
 data.starts=[...normal,...data.starts];
 const talents=[
 ['steady','안정된 손','손끝이 흔들리지 않는다.',{atk:2}],
 ['reflex','재빠른 반응','움직임에 즉시 반응한다.',{spd:2}],
 ['perceptive','예리한 관찰력','공격의 징후를 먼저 읽는다.',{eva:3}],
 ['hardy','튼튼한 체질','오랜 여정에도 쉽게 지치지 않는다.',{maxHp:10}],
 ['breathing','호흡의 재능','싸움이 시작되어도 호흡을 유지한다.',{startBreath:2}],
 ['calm','침착함','흐트러지지 않고 상대를 본다.',{atk:1,eva:1}],
 ['lightfoot','가벼운 발','발을 옮기는 데 망설임이 없다.',{spd:1,eva:2}],
 ['duelist','승부 감각','공격을 넣을 순간을 알아본다.',{atk:3}],
 ['survivor','생존 본능','위험한 상황을 여러 번 넘겼다.',{maxHp:6,eva:1}],
 ['timing','박자를 읽는 감각','상대와 자신의 움직임을 맞춘다.',{atk:1,spd:1}],
 ['tenacious','강인한 육체','상처를 입고도 버틸 힘이 있다.',{maxHp:14}],
 ['quickbreath','빠른 호흡 정돈','움직이는 동안에도 호흡을 되찾는다.',{startBreath:1,spd:1}],
 ['surehands','정확한 힘 조절','약한 타격에도 힘을 실을 수 있다.',{dmin:2}],
 ['brace','방어 감각','공격을 받아내는 자세가 좋다.',{defUp:5}],
 ['longride','장거리 체질','긴 길을 버티는 데 익숙하다.',{maxHp:6,spd:1}],
 ['recovery','빠른 회복','전투 중에도 조금씩 기운을 되찾는다.',{regen:1}]
 ];
 const flaws=[
 ['weak_condition','허약한 체질','체력이 쉽게 바닥난다.',{maxHp:-10}],
 ['slow','느린 발','움직임을 시작하는 데 시간이 걸린다.',{spd:-2}],
 ['shaky','떨리는 손','급할수록 조준이 흔들린다.',{atk:-3}],
 ['stiff','굳은 몸','큰 동작에 대응하기 어렵다.',{eva:-3}],
 ['rash','성급함','공격을 서두르다 틈을 보인다.',{atk:1,eva:-4}],
 ['frail','가냘픈 몸','몸은 가볍지만 상처에 약하다.',{maxHp:-14,spd:1}],
 ['shortwind','짧은 지구력','오래 움직이면 자세가 무너진다.',{maxHp:-4,eva:-2}],
 ['oldwound','오래된 부상','지나간 상처가 아직 남아 있다.',{maxHp:-8,atk:-1}],
 ['unsteady','불안정한 자세','공격과 방어 사이에서 균형이 흔들린다.',{atk:-2,eva:-1}],
 ['restless','집중력 부족','주변 움직임에 시선을 빼앗긴다.',{spd:-1,eva:-2}],
 ['tunnel','좁은 시야','하나에 몰두하면 다른 위협을 놓친다.',{atk:-1,eva:-2}],
 ['thinblood','아물지 않은 상처','전투에 들어갈 때 상처가 벌어진다.',{startBleed:1}],
 ['heavybody','무거운 움직임','몸을 급히 돌리기 어렵다.',{spd:-2,eva:-1}],
 ['weakgrip','약한 악력','힘을 끝까지 싣기 어렵다.',{atk:-2,maxHp:-4}],
 ['hesitant','주저하는 버릇','첫 움직임을 결정하는 데 망설인다.',{spd:-1,atk:-2}],
 ['wornbody','지친 몸','레이스가 시작되기 전부터 몸이 피로하다.',{maxHp:-8,spd:-1}]
 ];
 const weaponDefs=[
 ['revolver','리볼버',{atk:2},'조준 사격',1,'atk',{hit:20},'1회 × 1d6 · 명중 +20'],
 ['rifle','사냥총',{atk:3},'긴 사거리의 일격',2,'atk',{dice:3,hit:10},'1회 × 3d6 · 명중 +10'],
 ['shotgun','산탄총',{atk:1},'근접 사격',2,'atk',{hits:3,die:4},'3회 × 1d4 · 명중 +5'],
 ['knife','단검',{spd:1},'빠른 베기',1,'atk',{kw:[['bleed',1,'t']]},'1회 × 1d6 · 적중 시 출혈 +1'],
 ['bowie','보위나이프',{dmin:2},'깊게 베기',2,'atk',{dice:2,kw:[['rupture',2,'t']]},'1회 × 2d6 · 적중 시 취약 +2'],
 ['sabre','기병도',{atk:1,eva:1},'말 위의 참격',2,'atk',{hits:2,rr:1},'2회 × 1d6 · 피해 재굴림'],
 ['lance','기병창',{atk:2},'창끝 돌진',3,'atk',{dice:3,spend:2,fixPer:2},'1회 × 3d6 · 기세 최대 2 소비 · 소비당 적중 피해 +2'],
 ['whip','채찍',{eva:2},'움직임 끊기',1,'atk',{kw:[['sink',3,'t']]},'1회 × 1d6 · 적중 시 위축 +3'],
 ['lasso','올가미',{eva:1,spd:1},'밧줄로 흘리기',1,'def',{eva:20,selfHit:5},'이번 턴 회피 +20 · 명중 +5'],
 ['hatchet','손도끼',{atk:2},'도끼 투척',2,'atk',{dice:2,hit:15},'1회 × 2d6 · 명중 +15'],
 ['knuckles','황동 너클',{maxHp:4},'짧은 연타',2,'atk',{hits:3,hit:0},'3회 × 1d6 · 명중 +0'],
 ['unarmed','맨손',{spd:2},'자세 정돈',1,'buff',{kw:[['breath',2,'s']],shield:4},'호흡 +2 · 보호막 +4']
 ];
 const effects={atk:'공격',spd:'속도',eva:'회피',maxHp:'최대 HP',startBreath:'전투 시작 호흡',startBleed:'전투 시작 출혈',dmin:'피해 주사위 최소값',defUp:'방어 카드 회피',regen:'턴마다 HP 회복'};
 const describe=fx=>Object.entries(fx).map(([k,v])=>effects[k]+(k==='dmin'?' ':v<0?' ':' +')+v).join(' · ');
 const table=rows=>{let max=0;return rows.map((r,i)=>{const weight=r.weight??Math.floor(100/rows.length)+(i<100%rows.length?1:0),min=max+1;max+=weight;return {...r,weight,min,max};});};
 data.birth={die:100,version:1,notes:'네 항목을 각각 독립된 1d100으로 뽑는다. 히든의 확률은 전체 출신 표에서의 확률이며 일반 출신 실패 후 다시 굴리지 않는다.',tables:{
 origins:table(data.starts.map(o=>({id:o.id,n:o.n,weight:o.weight,hidden:o.hidden,otherPartProtagonist:!!o.otherPartProtagonist,fx:o.fx,e:describe(o.fx)}))),
 talents:table(talents.map(([id,n,t,fx])=>({id,n,t,fx,e:describe(fx)}))),
 flaws:table(flaws.map(([id,n,t,fx])=>({id,n,t,fx,e:describe(fx)}))),
 weapons:table(weaponDefs.map(([id,n,fx,cn,c,t,x,d])=>({id,n,fx,e:describe(fx),card:add('sbr_weapon_'+id,cn,c,t,x,d)})))
 }};
 for(const o of data.starts)o.probability=o.weight;
}
