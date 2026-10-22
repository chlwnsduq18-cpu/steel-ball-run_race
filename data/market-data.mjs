export function addMarketData(D){
 D.equipmentSlots={weapon:'무기',armor:'몸통',charm:'보조 장비'};
 D.equipmentSchemaVersion=2;
 for(const id of ['coat','padded_vest','lined_bandolier','trophy_blackmore','trophy_magenta','route_bulwark'])D.items[id].slot='armor';
 const effect=(on,fx)=>({on,fx,to:'self',limit:1});
 const add=(id,n,price,from,slot,wear,stats,effects,d,rare=false)=>D.items[id]={id,n,price,from,slot,wear,category:'gear',stats,effects,d,rare,...(slot==='weapon'?{basic:true,tuning:{on:'hit',fx:{charge:1},max:4}}:{})};
 add('market_winchester','윈체스터 연발총',88,4,'weapon','손',{atk:3,spd:1},[effect('hit',{charge:1})],'적중: 기세 +1 (턴당 1회)');
 add('market_sabre','균형 잡힌 기병도',86,5,'weapon','손',{atk:2,eva:2},[effect('defense',{breath:1})],'방어 카드 사용: 호흡 +1 (턴당 1회)');
 add('market_duel_revolver','결투용 리볼버',104,6,'weapon','손',{atk:4},[effect('hit',{breath:1})],'적중: 호흡 +1 (턴당 1회)');
 add('market_riding_coat','보강한 승마 외투',88,7,'armor','몸통',{},[effect('battleStart',{shield:15}),effect('hurt',{shield:2})],'전투 시작: 보호막 +15 / 피격: 보호막 +2 (턴당 1회)');
 add('rare_carbine','강선을 손본 카빈',130,4,'weapon','손',{atk:4,eva:1},[effect('hit',{breath:2})],'적중: 호흡 +2 (턴당 1회)',true);
 add('rare_duel_blade','결투사의 외날검',116,3,'weapon','손',{atk:3,spd:2},[effect('defense',{charge:2})],'방어 카드 사용: 기세 +2 (턴당 1회)',true);
 add('rare_duster','안감을 보강한 더스터',124,4,'armor','몸통',{},[effect('battleStart',{shield:18}),effect('hurt',{shield:3})],'전투 시작: 보호막 +18 / 피격: 보호막 +3 (턴당 1회)',true);
 for(const[id,price,from]of [['weapon_revolver',40,1],['weapon_sabre',44,1],['weapon_rifle',56,2],['weapon_bowie',48,2]])Object.assign(D.items[id],{price,from});
 const stock=[
  ['weapon_revolver','weapon_sabre','coat','rein','pouch'],
  ['weapon_rifle','weapon_bowie','coat','riding_gloves','travel_boots'],
  ['weapon_rifle','weapon_sabre','padded_vest','riding_gloves','pouch'],
  ['market_winchester','weapon_bowie','padded_vest','riding_gloves','travel_boots'],
  ['market_winchester','market_sabre','padded_vest','steel_bracer','field_kit'],
  ['market_duel_revolver','market_sabre','padded_vest','steel_bracer','field_kit'],
  ['market_duel_revolver','market_winchester','market_riding_coat','field_kit','balanced_harness'],
  ['market_duel_revolver','market_sabre','market_riding_coat','field_kit','balanced_harness'],
  ['market_duel_revolver','market_winchester','market_riding_coat','field_kit','balanced_harness']
 ];
 D.economy.stockByStage=Object.fromEntries(stock.map((ids,i)=>[i+1,ids]));
 D.economy.gear=[...new Set(stock.flat())];
 D.economy.market.rare.push('rare_carbine','rare_duel_blade','rare_duster');
}
