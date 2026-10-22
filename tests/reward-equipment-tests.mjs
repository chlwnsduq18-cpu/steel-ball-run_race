import '../scripts/prepare-reports.mjs';
import fs from 'node:fs';import assert from 'node:assert/strict';
import {createRace} from '../dist/src/race.js';import {mulberry32} from '../dist/src/engine.js';
import {itemEffects,activeEffects} from '../dist/src/progression.js';
import {gearSuperior} from '../dist/src/economy.js';import {boot} from './ui-test-harness.mjs';
const D=JSON.parse(fs.readFileSync('dist/game-data.json')),R=JSON.parse(fs.readFileSync('dist/runtime-base.json'));
const checks=[],test=(n,f)=>{try{f();checks.push({n,ok:true});}catch(e){checks.push({n,ok:false,error:e.stack});}};
const make=()=>{const r=createRace(D,R,{rng:mulberry32(400)});r.start('보상 장비 검사',{origins:'ranch',talents:'steady',flaws:'slow',weapons:'sabre'});return r;};
function equip(r,id){if(!r.state.items.includes(id))r.state.items.push(id);assert(r.equipItem(id));}
function fight(r){const g=r.state;g.encounterProtectionUntil=0;g.mode='encounter';g.encounter='rough_rider';assert(r.encounter('fight'));const C=g.combat;C.E.hp=C.E.maxHp=10000;C.P.atk=1000;C.E.eva=-1000;C.P.light=10;C.ePlan=[];return C;}
function round(r,cards=['sbr_basic_strike'],enemy=[]){const C=r.state.combat;C.P.hand=cards;C.P.light=10;C.ePlan=enemy;assert(r.round(cards.map((_,i)=>i)));return C;}
test('보스 보상 전부 강화·일반 상점과 유료 주문은 기존 성능 유지',()=>{
 const ids=new Set(Object.values(D.bossLoot).flatMap(p=>[p.base,...p.variants].flatMap(p=>p.fx.items)));
 assert.equal(ids.size,17);for(const id of ids)assert.equal(D.items[id].rewardGrade,'boss',id);
 for(const id of ['route_ironball','route_duelgun','route_bulwark','spring_kit'])assert.equal(D.items[id].rewardGrade,'route');
 assert.equal(D.items.market_duel_revolver.stats.atk,4);assert.equal(D.items.rare_carbine.stats.atk,4);assert.equal(D.items.rare_duster.effects[0].fx.shield,18);
 for(const id of ['commission_ball','sbr_spare_rifle','merchant_sabre','canon_catalog_bear'])assert(!D.items[id].rewardGrade,id);
});
test('같은 역할의 상점 최상급 장비가 보스 보상을 압도하지 않음',()=>{
 const r=make();for(const [earned,store]of [['trophy_ringo','rare_carbine'],['trophy_gyro_ball','market_light_lance'],['trophy_magenta','rare_duster'],['trophy_hotpants','endurance_saddle'],['trophy_diego','magnetic_spurs']]){
  assert(D.items[store],store);assert(!gearSuperior(D,r.state,D.items[store],D.items[earned]),earned);
 }
});
test('강화 장비 전부 보관만으로는 효과 없음·장착/복원/해제 시 정확한 능력치',()=>{
 for(const it of Object.values(D.items).filter(x=>x.rewardGrade)){
  const r=make();assert(r.unequipItem('weapon_sabre'));const base={...r.state.ch.stats};r.state.items.push(it.id);
  assert(!activeEffects(D,r.state).some(e=>e.sourceId===it.id));equip(r,it.id);
  const expected={...base};for(const[k,v]of Object.entries(it.stats))expected[k]=(expected[k]||0)+v;
  assert.deepEqual(r.state.ch.stats,expected,it.id);for(let i=0;i<3;i++){assert(r.restore(structuredClone(r.state)));assert.deepEqual(r.state.ch.stats,expected,it.id);}
  assert(r.unequipItem(it.id));assert.deepEqual(r.state.ch.stats,base,it.id);
 }
});
test('0.39 무기 능력치가 적용된 저장은 차액만 한 번 보완·일반 무기로 교체 시 완전 제거',()=>{
 for(const id of ['trophy_ringo','trophy_gyro_ball','trophy_wrecking','route_duelgun','route_ironball']){
  const r=make();assert(r.unequipItem('weapon_sabre'));const base={...r.state.ch.stats};equip(r,id);
  const old=structuredClone(r.state),legacy=D.items[id].weaponStatsBefore040;
  for(const k of new Set([...Object.keys(D.items[id].stats),...Object.keys(legacy)]))old.ch.stats[k]=(old.ch.stats[k]||0)-(D.items[id].stats[k]||0)+(legacy[k]||0);
  delete old.gearStats.weaponStats;assert(r.restore(old));const upgraded=structuredClone(r.state.ch.stats);
  assert.equal(upgraded.atk,base.atk+D.items[id].stats.atk);for(let i=0;i<3;i++){assert(r.restore(r.state));assert.deepEqual(r.state.ch.stats,upgraded);}
  equip(r,'weapon_sabre');for(const k of ['atk','spd','eva','maxHp'])assert.equal(r.state.ch.stats[k],(base[k]||0)+(D.items.weapon_sabre.stats[k]||0));
 }
});
test('0.39 시계 회피 2를 회피 5·속도 2로 보완하며 최대 HP 장비는 자동 회복 없음',()=>{
 const r=make();const base={...r.state.ch.stats};equip(r,'canon_ringo_watch');let old=structuredClone(r.state);old.ch.stats.eva=base.eva+2;old.ch.stats.spd=base.spd;old.gearStats.extraStats.charm={eva:2};assert(r.restore(old));assert.equal(r.state.ch.stats.eva,base.eva+5);assert.equal(r.state.ch.stats.spd,base.spd+2);
 assert(r.unequipItem('canon_ringo_watch'));assert.deepEqual(r.state.ch.stats,base);
 r.state.ch.hp-=15;const hp=r.state.ch.hp;equip(r,'trophy_magenta');assert.equal(r.state.ch.hp,hp);assert.equal(r.state.ch.stats.maxHp,base.maxHp+20);assert(r.unequipItem('trophy_magenta'));assert.equal(r.state.ch.hp,hp);
});
test('링고 무기는 실제 피해 주사위·기세·호흡을 함께 제공하며 다단 적중에도 턴당 한 번',()=>{
 const r=make();equip(r,'trophy_ringo');const C=fight(r),start=C.P.breath||0;round(r,['sbr_enemy_johnny']);
 const hits=C.evs.filter(e=>e.k==='atk'&&e.att==='P');assert(hits.length>=3);assert(hits.every(e=>e.rolls.length===2));assert.equal(C.P.charge,2);assert(C.evs.some(e=>e.snap.P.breath===start+3));assert.equal(C.log.filter(x=>x.s?.includes(D.items.trophy_ringo.n)&&x.s.includes('호흡 +3')).length,1);
});
test('방어구 개성: 마젠트 초기 방어·반격 기세, 블랙모어 지속 회복',()=>{
 const r=make();equip(r,'trophy_magenta');const C=fight(r);C.E.atk=1000;C.P.eva=-1000;C.P.hp=C.P.maxHp=500;round(r,[],[{...r.engine.D.cards.sbr_basic_strike,b:150}]);assert(C.evs.some(e=>e.snap.P.shield>=45));assert.equal(C.P.charge,4);assert(C.log.some(x=>x.s?.includes(D.items.trophy_magenta.n)));
 const b=make();equip(b,'trophy_blackmore');const B=fight(b);B.P.hp-=12;const hp=B.P.hp;round(b,[]);assert.equal(B.P.hp,hp+3);assert(B.evs.some(e=>e.snap.P.shield>=36));
});
test('핫 팬츠 보상은 상점 회복 장비보다 높은 실제 회복·보호막 제공',()=>{
 const r=make();equip(r,'trophy_hotpants');const C=fight(r);C.P.hp-=20;const hp=C.P.hp;round(r,[]);assert.equal(C.P.hp,hp+7);assert(C.evs.some(e=>e.snap.P.shield>=3));
});
test('렉킹 볼은 d8 추가 주사위·기세를 주며 위축 상한은 유지',()=>{
 const r=make();equip(r,'trophy_wrecking');const C=fight(r);C.E.sink=5;round(r,['sbr_enemy_johnny']);assert.equal(C.P.pdie,8);assert.equal(C.P.charge,0);assert.equal(C.log.filter(x=>x.s.includes('틈을 넓히는 회전')).length,1);assert(C.evs.every(e=>e.snap.E.sink<=6));assert(C.evs.filter(e=>e.k==='atk'&&e.att==='P').every(e=>e.rolls.length===2));
});
test('성장 무기는 기존 문턱 유지·완성 후 적중 효과 확대·정비는 소유품에 유지',()=>{
 for(const[id,at]of [['route_ironball',[5,12]],['route_duelgun',[4,10]]]){
  const r=make();equip(r,id);assert.deepEqual(D.items[id].growth.at,at);r.state.itemLevels[id]=2;r.state.economy.tuning[id]=2;
  const effects=itemEffects(D,r.state,id);assert(effects.some(e=>e.to==='opponent'&&e.fx.rupture===4));assert(effects.some(e=>e.to==='self'&&e.fx.charge>=6));
  assert(r.unequipItem(id));assert.equal(r.state.itemLevels[id],2);assert.equal(r.state.economy.tuning[id],2);
 }
});
test('구버전 진행 중 전투는 능력치·주사위·장비 효과를 유지하고 도주 후에 갱신',()=>{
 const r=make();assert(r.unequipItem('weapon_sabre'));const base={...r.state.ch.stats};equip(r,'trophy_ringo');fight(r);
 const old=structuredClone(r.state);delete old.gearStats.weaponStats;delete old.combat.rewardEquipmentVersion;
 old.ch.stats.atk=base.atk+4;old.ch.stats.eva=base.eva;old.combat.P.atk=1000;
 old.combat.P.effects=[{on:'hit',to:'self',fx:{breath:2},limit:1,sourceId:'trophy_ringo',source:D.items.trophy_ringo.n}];
 const captured=structuredClone(old.combat);assert(r.restore(old));assert.deepEqual(r.state.combat,captured);assert.equal(r.state.ch.stats.atk,base.atk+4);
 round(r);assert.deepEqual(r.state.combat.P.effects,captured.P.effects);assert(r.flee());assert.equal(r.state.ch.stats.atk,base.atk+9);assert.equal(r.state.ch.stats.eva,base.eva+2);
 const C=fight(r);assert.equal(C.rewardEquipmentVersion,1);assert(C.P.effects.some(e=>e.sourceId==='trophy_ringo'&&e.fx.charge===2));
});
test('실제 장비 UI에서 새 능력치·피해 주사위·발동 효과 확인',()=>{
 const h=boot();h.ui.action('start');equip(h.ui.race,'trophy_wrecking');h.ui.action('equipment');const html=h.elements.get('#sheet-body').innerHTML;assert.match(html,/공격.*10/);assert.match(html,/피해 주사위 d8/);assert.match(html,/기세.*4/);assert(!/undefined|NaN/.test(html));
});
fs.writeFileSync('reports/generated/reward-equipment-checks.json',JSON.stringify({checks},null,2));console.log(JSON.stringify({rewardEquipmentChecks:checks.length,passed:checks.filter(x=>x.ok).length,failures:checks.filter(x=>!x.ok)},null,2));if(checks.some(x=>!x.ok))process.exitCode=1;
