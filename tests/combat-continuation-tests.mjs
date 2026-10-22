import '../scripts/prepare-reports.mjs';
import fs from 'node:fs';import assert from 'node:assert/strict';
import {createRace} from '../src/race.js';import {waitForFollowup} from './followup-test-fixture.mjs';import {boot} from './ui-test-harness.mjs';
const D=JSON.parse(fs.readFileSync('game-data.json')),R=JSON.parse(fs.readFileSync('runtime-base.json'));
const checks=[],test=(n,f)=>{try{f();checks.push({n,ok:true});}catch(e){checks.push({n,ok:false,error:e.stack});}};
function make(){const r=createRace(D,R,{rng:()=>.5});r.start('전투 검사',{origins:'ranch',talents:'steady',flaws:'slow',weapons:'sabre'});return r;}
function springFight(){const r=make();r.state.tick=24;r.restore(r.state);const g=r.state;g.mode='event';g.event='spring_offer';assert(r.chooseEvent(0));waitForFollowup(r,'spring_barter');g.mode='event';g.event='spring_barter';assert(r.chooseEvent(2));return r;}
function survive(r,n){const C=r.state.combat;C.round=n;C.P.hp=C.P.maxHp=C.E.hp=C.E.maxHp=99999;C.P.hand=[];C.ePlan=[];return C;}
test('30·31·80·100턴 이후에도 같은 전투·사건·자금을 유지하고 다음 턴 진행',()=>{
 for(const n of [29,30,31,80,100]){const r=springFight(),g=r.state,C=survive(r,n),tick=g.tick,money=g.ch.money;assert(r.round([]));assert.equal(g.mode,'combat');assert.equal(g.combat,C);assert.equal(C.round,n+1);assert(!C.over);assert.equal(g.tick,tick);assert.equal(g.ch.money,money);assert(g.items.includes('spring_gifts'));assert(!g.routeResults.spring_trial);assert(!g.battleResult);}
});
test('30턴 이후 저장·복원·연출을 거쳐도 계속 싸우거나 기존 도주로 정산',()=>{
 const r=springFight();survive(r,30);assert(r.round([],{playback:true}));assert(r.state.playback);assert(r.restore(JSON.parse(JSON.stringify(r.state))));assert(r.state.playback);assert(r.finishPlayback());assert.equal(r.state.mode,'combat');assert.equal(r.state.combat.round,31);assert(!r.state.combat.over);assert(r.flee());assert.equal(r.state.battleResult.outcome,'escape');assert(!r.state.items.includes('spring_gifts'));assert.equal(r.state.routeResults.spring_trial,'surrendered');assert.equal(r.encounterGrace(),3);
});
test('30턴 이후에도 승리·패배는 기존 판정과 샘 정산을 그대로 실행',()=>{
 for(const outcome of ['win','lose']){const r=springFight(),g=r.state,C=survive(r,35);C.P.eva=C.E.eva=-300;
  if(outcome==='win'){C.P.atk=C.P.spd=300;C.P.dmgB=100000;C.P.light=10;C.P.hand=['sbr_basic_shoot'];C.E.hp=1;assert(r.round([0]));}
  else{C.P.hp=1;C.E.atk=C.E.spd=300;C.E.dmgB=100000;C.ePlan=[r.engine.D.cards.sbr_basic_shoot];assert(r.round([]));}
  assert.equal(g.battleResult.outcome,outcome);assert(g.items.includes('spring_wine'));assert(!g.items.includes('spring_gifts'));assert.equal(g.routeResults.spring_trial,outcome==='win'?'bartered':'surrendered');assert(Number.isFinite(g.ch.money));
 }
});
test('기존 자동 무승부로 잠긴 샘만 재개방하고 돈·보유품·보상을 중복 지급하지 않음',()=>{
 const r=springFight(),g=r.state;g.combat=null;g.combatContext=null;g.mode='travel';g.tick++;g.ch.money=123;g.history.push('오랜 대결에도 승부가 나지 않았다. 서로 거리를 벌리고 레이스로 돌아갔다.');
 const saved=JSON.parse(JSON.stringify(g));assert(saved.usedEvents.includes('spring_barter'));const items=saved.items.slice(),deck=saved.ch.deck.slice();assert(r.restore(saved));assert.equal(r.state.ch.money,123);assert.deepEqual(r.state.items,items);assert.deepEqual(r.state.ch.deck,deck);assert(!r.state.usedEvents.includes('spring_barter'));
 waitForFollowup(r,'spring_barter');assert(r.availableEvents().some(e=>e.id==='spring_barter'));r.state.mode='event';r.state.event='spring_barter';assert(r.chooseEvent(0));assert(!r.state.items.includes('spring_gifts'));assert(r.state.items.includes('spring_kit'));assert.equal(r.state.routeResults.spring_trial,'bartered');
 const settled=JSON.parse(JSON.stringify(r.state));assert(r.restore(settled));assert(r.state.usedEvents.includes('spring_barter'));assert(!r.availableEvents().some(e=>e.id==='spring_barter'));
});
test('진행 중인 샘 전투는 복원·연출 종료 시 거래를 재개방하지 않음',()=>{
 const r=springFight(),g=r.state;survive(r,30);assert(r.round([],{playback:true}));assert(r.restore(JSON.parse(JSON.stringify(g))));assert(r.state.usedEvents.includes('spring_barter'));assert(r.state.combat);assert(r.finishPlayback());assert(r.state.usedEvents.includes('spring_barter'));assert(!r.availableEvents().some(e=>e.id==='spring_barter'));
});
test('실제 UI에서 30턴 행동 계산·연출 생략 후에도 전투 조작 유지',()=>{
 const h=boot();h.ui.action('settings');h.ui.action('speed:off');h.close();h.ui.action('start');const r=h.ui.race;r.state.mode='encounter';r.state.encounter='ringo';h.ui.action('encounter:fight');survive(r,30);const tick=r.state.tick;h.ui.action('resolve');assert.equal(r.state.mode,'combat');assert.equal(r.state.combat.round,31);assert.equal(r.state.tick,tick);assert(!h.text().includes('전투 결과 · 무승부'));assert(h.text().includes('data-action="flee"'));
});
fs.writeFileSync('reports/generated/combat-continuation-checks.json',JSON.stringify({checks},null,2));console.log(JSON.stringify({combatContinuationChecks:checks.length,passed:checks.filter(x=>x.ok).length,failures:checks.filter(x=>!x.ok)},null,2));if(checks.some(x=>!x.ok))process.exitCode=1;
