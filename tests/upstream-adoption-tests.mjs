import '../scripts/prepare-reports.mjs';
import fs from 'node:fs';import assert from 'node:assert/strict';
import {createRace} from '../dist/src/race.js';import {mulberry32} from '../dist/src/engine.js';
import {eventWeight,initializeChoiceMemory} from '../dist/src/choice-memory.js';
import {equipmentScreen} from '../dist/src/inventory-ui.js';
const D=JSON.parse(fs.readFileSync('dist/game-data.json')),R=JSON.parse(fs.readFileSync('dist/runtime-base.json'));
const results=[];function test(n,f){try{f();results.push({n,ok:true});}catch(e){results.push({n,ok:false,error:e.stack});}}
function make(){const r=createRace(D,R,{rng:mulberry32(420)});r.start('재회 검사',{origins:'ranch',talents:'steady',flaws:'slow',weapons:'sabre'});return r;}
function choose(r,id,i){r.state.mode='event';r.state.event=id;assert(r.chooseEvent(i),id);}
function fight(r,id){if(id){r.state.items.push(id);assert(r.equipItem(id));}r.state.mode='encounter';r.state.encounter='rough_rider';assert(r.encounter('fight'));const C=r.state.combat;C.P.hp=C.P.maxHp=C.E.hp=C.E.maxHp=10000;C.P.atk=1000;C.E.eva=-1000;C.P.light=10;C.ePlan=[];return C;}
function round(r,ids,enemy=[]){r.state.combat.P.hand=ids;r.state.combat.P.light=10;r.state.combat.ePlan=enemy;assert(r.round(ids.map((_,i)=>i)));}
test('반복 가중치: 같은 기본 비중이면 0회 > 1회 > 4회, 이전 저장 이력은 한 번만 변환',()=>{
 const g={usedEvents:['a','a','b']};initializeChoiceMemory(g);assert.deepEqual(g.eventSeen,{a:2,b:1});initializeChoiceMemory(g);assert.equal(g.eventSeen.a,2);
 assert(eventWeight(g,{id:'new',weight:5})>eventWeight(g,{id:'b',weight:5}));assert(eventWeight(g,{id:'b',weight:5})>eventWeight(g,{id:'a',weight:5}));
 const r=make();r.state.eventSeen.river=4;const s=structuredClone(r.state);assert(r.restore(s));assert.equal(r.state.eventSeen.river,4);
});
test('실제 사건 노출은 한 번 집계·복원이나 목록 조회는 추가 집계하지 않음',()=>{
 const r=make();assert(r.travel('rest'));assert.equal(r.state.mode,'event');const id=r.state.event;assert.equal(r.state.eventSeen[id],1);r.availableEvents('camp');assert(r.restore(structuredClone(r.state)));assert.equal(r.state.eventSeen[id],1);
});
test('도움/외면 재회 분리·다른 행동 4회 대기·후속 사건 간격·인사 무행동',()=>{
 for(const[i,value,id]of [[2,'help','reunion_rider_aid'],[1,'pass','reunion_rider_pass']]){
  const r=make();choose(r,'gunfire',i);assert.equal(r.state.choiceMemory.rider.value,value);const tick=r.state.tick;
  for(let n=0;n<4;n++){r.state.tick=tick+n;assert(!r.availableEvents('road').some(e=>e.id===id));}
  r.state.tick=tick+4;assert(r.availableEvents('road').some(e=>e.id===id));assert(!r.availableEvents('road').some(e=>e.id===(value==='help'?'reunion_rider_pass':'reunion_rider_aid')));
  r.state.lastFollowupTick=r.state.tick-1;assert(!r.availableEvents('road').some(e=>e.id===id));delete r.state.lastFollowupTick;
  const now=r.state.tick;choose(r,id,2);assert.equal(r.state.tick,now);assert(r.state.choiceMemory.rider.done);assert(!r.availableEvents('road').some(e=>e.id===id));assert(r.restore(structuredClone(r.state)));assert(r.state.choiceMemory.rider.done);
 }
});
test('같은 원사건 재선택은 첫 기억과 누적 행적을 덮어쓰거나 복제하지 않음',()=>{
 const r=make();choose(r,'gunfire',2);const first=structuredClone(r.state.choiceMemory);choose(r,'gunfire',1);assert.deepEqual(r.state.choiceMemory,first);assert.equal(r.state.choiceLedger.help,1);assert.equal(r.state.choiceLedger.pass,0);
});
test('재회 9종은 정확한 조건만 선택·보상 한 번·게임 내 모든 경로 실행 가능',()=>{
 assert.equal(D.events.filter(e=>e.memoryKey).length,9);
 for(const e of D.events.filter(e=>e.memoryKey)){const r=make(),[key,value]=e.req[0].slice(7).split('=');r.state.choiceMemory[key]={value,tick:1,source:'gunfire',done:false};r.state.tick=8;assert(r.availableEvents('road').some(x=>x.id===e.id));choose(r,e.id,0);assert(r.state.choiceMemory[key].done);r.state.mode='event';r.state.event=e.id;assert(!r.chooseEvent(0));}
});
test('손상된 기억/등장횟수는 현재 저장을 교체하지 않고 거절',()=>{
 const r=make();for(const bad of [{eventSeen:{x:-1}},{choiceMemory:{x:{value:'help',tick:-1,source:'x',done:false}}},{choiceLedger:{help:1.2}}]){const s={...structuredClone(r.state),...bad},before=JSON.stringify(r.state);assert(!r.restore(s));assert.equal(JSON.stringify(r.state),before);}
});
test('철구는 기세 조건 충족 때만 소비·고유 효과 턴당 1회',()=>{
 const r=make(),C=fight(r,'trophy_gyro_ball');C.P.charge=6;round(r,['sbr_enemy_johnny']);assert(C.log.some(x=>x.s?.includes('축적 회전')));assert.equal(C.log.filter(x=>x.s?.includes('축적 회전')).length,1);assert.equal(C.P.charge,3);
 const s=make(),S=fight(s,'trophy_gyro_ball');S.P.charge=0;round(s,['sbr_basic_strike']);assert(!S.log.some(x=>x.s?.includes('축적 회전')));
});
test('정밀 조준은 단발에만 발동·다단 공격에 발동하지 않음',()=>{
 for(const[id,expected]of [['sbr_basic_strike',true],['sbr_enemy_johnny',false]]){const r=make(),C=fight(r,'trophy_ringo');round(r,[id]);assert.equal(C.log.some(x=>x.s?.includes('단발 정밀 조준')),expected);}
});
test('치료 주머니 긴급 처치는 전투당 1회·저장 복원에도 사용 횟수 유지',()=>{
 const r=make(),C=fight(r,'trophy_hotpants');C.P.maxHp=500;C.P.hp=60;C.E.atk=1000;C.P.eva=-1000;const card={...r.engine.D.cards.sbr_basic_strike,b:20,dice:1};round(r,[],[card]);assert.equal(C.log.filter(x=>x.s?.includes('비상 압박 처치')).length,1);
 const key='battle:P:unique_trophy_hotpants';assert.equal(C.effectUses[key],1);assert(r.restore(structuredClone(r.state)));r.state.combat.P.hp=60;round(r,[],[card]);assert.equal(r.state.combat.effectUses[key],1);assert(!r.state.lastRound.lines.some(x=>x.includes('비상 압박 처치')));
});
test('방호 외투 반격은 이번 턴 방어 사용 후에만 발동',()=>{
 for(const defend of [false,true]){const r=make(),C=fight(r,'route_bulwark');round(r,defend?['sbr_basic_guard','sbr_basic_strike']:['sbr_basic_strike']);assert.equal(C.log.some(x=>x.s?.includes('수비에서 반격으로')),defend);}
});
test('진행 중 구버전 전투에는 새 효과 미적용·새 전투에는 적용·성장 장비에도 표시',()=>{
 const r=make(),C=fight(r,'route_ironball');delete C.uniqueEquipmentVersion;C.P.effects=C.P.effects.filter(e=>!e.uniqueVersion);assert(r.restore(structuredClone(r.state)));assert(!r.state.combat.P.effects.some(e=>e.uniqueVersion));assert(r.flee());r.state.encounterProtectionUntil=0;fight(r);assert(r.state.combat.P.effects.some(e=>e.uniqueVersion));
 const html=equipmentScreen({data:D,race:r,esc:s=>String(s),btn:()=>''});assert(html.includes('이어지는 회전'));assert(html.includes('기세가 5 이상'));
});
test('연출 저장/재생 종료는 고유 효과나 자원 소비를 다시 계산하지 않음',()=>{
 const r=make(),C=fight(r,'trophy_gyro_ball');C.P.charge=6;C.P.hand=['sbr_basic_strike'];assert(r.round([0],{playback:true}));const save=JSON.parse(JSON.stringify(r.state));assert(r.restore(save));const before=JSON.stringify(r.state.combat);r.finishPlayback();assert.equal(JSON.stringify(r.state.combat),before);
});
console.log(JSON.stringify(results,null,2));fs.writeFileSync('reports/generated/upstream-adoption-checks.json',JSON.stringify(results,null,2));if(results.some(x=>!x.ok))process.exitCode=1;
