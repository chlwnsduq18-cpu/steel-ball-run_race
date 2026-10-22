import '../scripts/prepare-reports.mjs';
import fs from 'node:fs';import assert from 'node:assert/strict';
import {createRace} from '../src/race.js';import {mulberry32} from '../src/engine.js';
import {CFG} from '../src/config.js';import {gradedPlayerCard,playerCardGrade} from '../src/player-support.js';
import {weaponDiceProfile,visibleWeaponDice,validWeaponDice} from '../src/weapon-dice.js';
import {gearSuperior} from '../src/economy.js';import {resolveCompanionSupport} from '../src/companions.js';
import {boot} from './ui-test-harness.mjs';
const D=JSON.parse(fs.readFileSync('game-data.json')),R=JSON.parse(fs.readFileSync('runtime-base.json'));
const checks=[],test=(n,f)=>{try{f();checks.push({n,ok:true});}catch(e){checks.push({n,ok:false,error:e.stack});}};
function make(weapon=null,stage=1,rng=mulberry32(390)){const r=createRace(D,R,{rng});r.start('주사위 검사',{origins:'ranch',talents:'steady',flaws:'slow',weapons:'sabre'});if(weapon){r.state.items.push(weapon);assert(r.equipItem(weapon));}r.state.tick=(stage-1)*8;assert(r.restore(r.state));return r;}
function fight(r){r.state.mode='encounter';r.state.encounter='rough_rider';assert(r.encounter('fight'));const C=r.state.combat;C.P.hp=C.P.maxHp=C.E.hp=C.E.maxHp=100000;C.P.atk=1000;C.E.eva=-1000;C.P.light=10;C.ePlan=[];return C;}
function attack(r,id='sbr_basic_strike',playback=false){const C=r.state.combat;C.P.hand=[id];C.ePlan=[];assert(r.round([0],{playback}));return C.evs.filter(e=>e.k==='atk'&&e.att==='P');}
test('위축 카드 누적은 최대 6·턴 종료 3으로 감소하고 양쪽에 동일 적용',()=>{
 assert.deepEqual(CFG.sink,{per:3,hit:4,dmg:1,cap:6,keep:0.5});for(const side of ['P','E']){const r=make(),C=fight(r);if(side==='P'){C.P.hand=Array(3).fill('sbr_gyro_joint');assert(r.round([0,1,2]));}else{C.E.atk=1000;C.P.eva=-1000;C.ePlan=Array(3).fill(r.engine.D.cards.sbr_gyro_joint);assert(r.round([]));}
  const target=side==='P'?'E':'P';assert(C.evs.some(e=>e.snap[target].sink===6));assert(C.evs.every(e=>e.snap[target].sink<=6));assert.equal(C[target].sink,3);
 }
});
test('추가 위축이 없으면 6→3→1→0으로 해제·구버전 과다 중첩도 첫 행동 전 정상화',()=>{
 const r=make(),C=fight(r);C.P.sink=C.E.sink=10;assert(r.round([]));assert.equal(C.evs[0].snap.P.sink,6);assert.equal(C.P.sink,3);C.ePlan=[];assert(r.round([]));assert.equal(C.P.sink,1);C.ePlan=[];assert(r.round([]));assert.equal(C.P.sink,0);
});
test('장비 효과·동행 효과도 위축 최대 6을 초과하지 않음',()=>{
 const r=make(),C=fight(r);C.E.sink=5;C.P.effects=[{on:'hit',to:'opponent',fx:{sink:20},limit:1,source:'검증 장비'}];attack(r);assert(C.evs.every(e=>e.snap.E.sink<=6));
 C.E.sink=5;C.companions=[{id:'check',n:'검사',supports:[{id:'sink',on:['roundStart'],chance:100,cooldown:1,fx:{opponent:{sink:20}}}]}];resolveCompanionSupport(C,'roundStart',()=>{},()=>{},()=>1,D);assert.equal(C.E.sink,6);
});
test('모든 스탠드 카드의 일반 단계 꼬리표 제거·ACT와 사용자 이름 유지',()=>{
 for(const c of Object.values(D.cards).filter(c=>c.stand))assert(!/ · (발현|성장|진화|완성)$/.test(c.n),c.n);
 assert.match(D.cards.sbr_route_tusk_0_0.n,/ACT\.1/);assert.match(D.cards.sbr_route_tusk_0_3.n,/ACT\.4/);
 const r=make();assert(r.transform('time'));assert(r.setStandIdentity('나의 시계').ok);for(const id of r.state.ch.deck.filter(id=>D.cards[id].stand)){assert.match(r.cardName(id),/나의 시계/);assert(!/발현|성장|진화|완성/.test(r.cardName(id)));}
});
test('무기 면 수 변경은 실제 d8·d10 범위로 굴리며 기본 개수 보존',()=>{
 for(const[id,die]of [['market_winchester',8],['rare_carbine',10]]){const r=make(id,1,()=>0.999),C=fight(r),observed=[];for(let i=0;i<12;i++){const ev=attack(r)[0];assert.equal(ev.rolls.length,2);assert(ev.rolls.every(n=>n>=1&&n<=die));observed.push(...ev.rolls);}assert(observed.every(n=>n===die));assert.equal(C.P.pdie,die);}
});
test('무기 추가 주사위·최소 개수·카드 자동 강화는 각 한 번만 합산',()=>{
 for(const[weapon,expected]of [['market_sabre',4],['trophy_gyro_ball',4],['trophy_ringo',4]]){const r=make(weapon,7),C=fight(r),grade=playerCardGrade(D,r.state.tick),profile=weaponDiceProfile(D,r.state),card=D.cards.sbr_basic_strike,shown=gradedPlayerCard(card,grade,profile),ev=attack(r)[0];assert.equal(shown.dice,expected);assert.equal(ev.rolls.length,expected);assert.equal(C.P.cg.dice,1);}
});
test('카드의 d4는 유지·추가 주사위는 d4·무기 최소 개수는 적용하지 않음',()=>{
 const r=make('trophy_ringo',7);fight(r);const card=D.cards.sbr_weapon_shotgun,shown=gradedPlayerCard(card,playerCardGrade(D,r.state.tick),weaponDiceProfile(D,r.state)),events=attack(r,'sbr_weapon_shotgun');assert.equal(shown.die,4);assert.equal(shown.dice,3);assert.equal(events.length,3);for(const e of events){assert.equal(e.rolls.length,3);assert(e.rolls.every(n=>n<=4));}
 const t=make('trophy_gyro_ball');fight(t);assert.equal(attack(t,'sbr_weapon_shotgun')[0].rolls.length,1);
});
test('무기 해제·교체 뒤 다음 전투에서 기본 d6·개수로 복귀하고 중복 적용 없음',()=>{
 const r=make('trophy_ringo');fight(r);assert.equal(attack(r)[0].rolls.length,3);assert(r.flee());assert(r.unequipItem('trophy_ringo'));r.state.encounterProtectionUntil=0;fight(r);assert.equal(r.state.combat.P.pdie,6);assert.equal(attack(r)[0].rolls.length,2);assert(r.flee());assert(r.equipItem('market_sabre')===false);
});
test('전투·연출 저장은 캡처한 무기 주사위를 보존하고 재생은 재굴림하지 않음',()=>{
 const r=make('trophy_ringo');fight(r);attack(r,'sbr_basic_strike',true);const save=JSON.parse(JSON.stringify(r.state)),copy=make();assert(copy.restore(save));assert.deepEqual(copy.state.playback,save.playback);assert.deepEqual(visibleWeaponDice(D,copy.state),D.items.trophy_ringo.weaponDice);assert.deepEqual(copy.state.combat.P.weaponDice,save.combat.P.weaponDice);
 const before=JSON.stringify(copy.state.combat);copy.finishPlayback();assert.equal(JSON.stringify(copy.state.combat),before);
});
test('구버전 전투는 새 무기 주사위를 소급하지 않으며 손상된 프로필 복원 거절',()=>{
 const r=make('rare_carbine');fight(r);const old=structuredClone(r.state);delete old.combat.P.weaponDice;old.combat.P.pdie=6;old.combat.P.wx=null;assert(r.restore(old));assert.equal(visibleWeaponDice(D,r.state),null);assert.equal(r.state.combat.P.pdie,6);
 for(const p of [{die:Infinity},{die:0},{add:100000},{min:-1},{bad:2}]){assert(!validWeaponDice(p));const bad=structuredClone(r.state);bad.combat.P.weaponDice=p;assert(!r.restore(bad));}
});
test('장비 비교는 주사위 차이를 포함해 강한 주사위 무기를 하위품으로 분류하지 않음',()=>{
 const r=make(),a={...D.items.weapon_rifle,id:'a',stats:{atk:9},effects:[],weaponDice:{die:6}},b={...a,id:'b',stats:{atk:3},weaponDice:{die:10}};assert(!gearSuperior(D,r.state,a,b));assert(!gearSuperior(D,r.state,b,a));
});
test('실제 장비·상점·덱·손패 UI에 무기 주사위와 적용된 카드 수치 표시',()=>{
 const h=boot();h.ui.action('start');const r=h.ui.race,g=r.state;g.items.push('rare_carbine');assert(r.equipItem('rare_carbine'));h.ui.action('equipment');assert.match(h.elements.get('#sheet-body').innerHTML,/피해 주사위 d10/);h.ui.action('deck');assert.match(h.elements.get('#sheet-body').innerHTML,/d10/);g.mode='encounter';g.encounter='rough_rider';assert(r.encounter('fight'));r.state.combat.P.hand=['sbr_basic_strike'];h.ui.render();assert.match(h.text(),/2d10/);
});
fs.writeFileSync('reports/generated/combat-equipment-checks.json',JSON.stringify({checks},null,2));console.log(JSON.stringify({combatEquipmentChecks:checks.length,passed:checks.filter(x=>x.ok).length,failures:checks.filter(x=>!x.ok)},null,2));if(checks.some(x=>!x.ok))process.exitCode=1;
