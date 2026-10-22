export function addEconomyData(D){
 for(const o of D.starts){o.deckPolicy=o.hidden?'dedicated':'flexible';o.rewardPolicy=o.hidden?'cash':'choice';}
 const effect=(on,fx)=>({on,fx,to:'self',limit:1});
 const gear=[
  ['riding_gloves','손에 맞춘 장갑',42,2,[effect('hit',{charge:1})]],
  ['travel_boots','길들인 승마화',42,2,[effect('roundStart',{breath:1})]],
  ['padded_vest','덧댄 방호 조끼',54,3,[effect('battleStart',{shield:10}),effect('hurt',{shield:1})]],
  ['steel_bracer','균형 잡힌 팔 보호대',72,5,[effect('defense',{charge:2})]],
  ['field_kit','정비된 구급 장비',72,5,[effect('roundStart',{hp:2})]],
  ['balanced_harness','맞춤형 승마 장구',96,7,[effect('battleStart',{breath:4,charge:3})]]
 ];
 const timing={hit:'적중',roundStart:'턴 시작',battleStart:'전투 시작',hurt:'피격',defense:'방어 카드 사용'};
 const describe=rows=>rows.map(e=>timing[e.on]+': '+(e.to==='opponent'?'상대 ':'')+Object.entries(e.fx).map(([k,v])=>(D.keywords[k]?.n||'HP')+' +'+v).join(' · ')+(e.on==='battleStart'?'':' (턴당 1회)')).join(' / ');
 for(const[id,n,price,from,effects]of gear)D.items[id]={id,n,price,from,effects,slot:'charm',d:describe(effects)};
 const rare=[
  ['magnetic_spurs','자철석 박차',52,2,'roundStart',{charge:2}],
  ['amber_goggles','호박색 방풍 안경',52,2,'hit',{breath:1}],
  ['lined_bandolier','철판을 댄 탄띠',58,2,'battleStart',{shield:12,breath:2}],
  ['barbed_lariat','가시를 엮은 밧줄',58,2,'hit',{bleed:2},'opponent'],
  ['counter_bracer','흠집 난 결투용 완갑',72,3,'hurt',{rupture:2},'opponent'],
  ['dusk_scarf','황혼빛 목도리',72,3,'defense',{breath:2}],
  ['survey_watch','측량사의 회중시계',84,4,'roundStart',{shield:4}],
  ['muzzle_wrap','소리를 죽이는 총신 덮개',84,4,'hit',{sink:2},'opponent'],
  ['endurance_saddle','긴 여정의 맞춤 안장',96,5,'roundStart',{hp:3}],
  ['silver_reins','은사를 엮은 고삐',112,6,'battleStart',{charge:6,breath:5}]
 ];
 for(const[id,n,price,from,on,fx,to='self']of rare){const effects=[{...effect(on,fx),to}];D.items[id]={id,n,price,from,rare:true,slot:'charm',effects,d:describe(effects)};}
 // Basic weapons have fixed birth bonuses; maintenance is purchased explicitly.
 D.events.push({id:'supply_caravan',shop:true,t:'길 위의 보급 상단',x:'레이스 노선 옆에 보급 마차들이 멈춰 있다. 장비를 살피는 상인과 무기를 손보는 정비공, 상처를 치료하는 의무원이 참가자들을 맞는다. 필요한 물건을 구하거나 그대로 길을 이어갈 수 있다.',where:[],from:1,to:9,c:[{l:'상단을 떠나 여정을 계속한다',ok:{t:'보급 마차를 뒤로하고 가던 길을 이어 갔다.',fx:{}}}]});
 D.events.push({id:'hidden_trader',shop:true,blackShop:true,t:'천막 뒤편의 거래상',x:'상인이 보급 마차 뒤의 천막을 들어 올렸다. 먼지 쌓인 상자 안에서 저마다 다른 세월을 견딘 물건들이 모습을 드러낸다. 상인은 물건의 출처 대신 값을 적은 쪽지를 내민다.',guide:'희귀 장비는 이번 방문에만 진열됩니다. 구입하면 보관하며, 장비에서 직접 장착할 수 있습니다. 상단으로 돌아와도 이번 진열은 유지됩니다.',guideTitle:'거래 안내',where:[],from:2,to:9,c:[{l:'보급 마차 쪽으로 돌아간다',returnMarket:true,ok:{t:'천막을 나와 보급 마차 쪽으로 돌아갔다.',fx:{}}},{l:'거래를 마치고 상단을 떠난다',ok:{t:'천막의 불빛을 뒤로하고 길을 이어 갔다.',fx:{}}}]});
 D.economy={version:1,market:{every:4,event:'supply_caravan',blackEvent:'hidden_trader',blackFrom:2,blackChance:35,blackStock:2,rare:rare.map(x=>x[0])},tuning:{base:24,step:18},clinic:{base:8,step:4,hp:20,perStage:2},gear:['rein','coat','pouch',...gear.map(x=>x[0])],supplies:{
  bandage:{n:'응급 붕대',price:8,carry:3,perStage:3,from:1,fx:{hp:18},d:'HP +18. 전투 중에는 다른 보급품과 합쳐 턴당 1개 사용.'},
  cleanser:{n:'상처 세척제',price:10,carry:2,perStage:2,from:1,cleanse:4,d:'출혈·화상·취약·위축을 각각 최대 4 감소. 전투 중 사용.'},
  stimulant:{n:'집중 보급식',price:12,carry:2,perStage:2,from:2,fx:{charge:3,breath:2},d:'기세 +3 · 호흡 +2. 전투 중 사용.'},
  smoke:{n:'방호 연막',price:12,carry:2,perStage:2,from:1,fx:{shield:12},d:'보호막 +12. 전투 중 사용.'}
 }};
 for(const e of D.events)for(const c of e.c){
  for(const r of [c.ok,c.fail].filter(Boolean)){delete r.fx.unlockDeck;r.t=r.t.replace('지금의 덱을 유지하면서 새 기술을 섞을 여유가 생겼다.','익숙한 움직임에 새로 배운 요령을 더했다. 몸이 흔들리던 순간에도 자세를 잃지 않았다.');}
  if(c.cost&&c.ok.fx.card)c.cardPurchase=true;
  // These fees buy safe passage; the optional recovery is not the whole benefit.
  if(e.id==='river'&&c.l==='나룻배에 돈을 내고 건넌다'||e.id==='chase'&&c.l==='보급 일부를 남겨 추격을 끊는다')c.passage=true;
 }
}
