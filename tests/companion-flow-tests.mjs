import '../scripts/prepare-reports.mjs';
import fs from 'node:fs';import assert from 'node:assert/strict';
import {createRace} from '../dist/src/race.js';import {mulberry32} from '../dist/src/engine.js';
import {activeCompanionIds,companionProfile,resolveCompanionSupport} from '../dist/src/companions.js';
import {boot} from './ui-test-harness.mjs';
const D=JSON.parse(fs.readFileSync('dist/game-data.json')),R=JSON.parse(fs.readFileSync('dist/runtime-base.json'));
const checks=[],test=(n,f)=>{try{f();checks.push({n,ok:true});}catch(e){checks.push({n,ok:false,error:e.stack});}};
function make(roll=.999){const r=createRace(D,R,{rng:typeof roll==='function'?roll:()=>roll});r.start('동행 여정 검사',{origins:'ranch',talents:'steady',flaws:'slow',weapons:'sabre'});return r;}
function encounter(r,id){r.state.mode='omen';r.state.encounter=id;r.state.bossVisits[id]=r.stage();}
function rest(r){r.state.mode='event';r.state.event='camp_practice';assert(r.chooseEvent(1));}
function fight(r,id='ringo'){encounter(r,id);assert(r.encounter('fight'));const C=r.state.combat;C.P.hp=C.P.maxHp=C.E.hp=C.E.maxHp=10000;C.P.light=20;C.P.atk=1000;C.E.eva=-1000;C.P.hand=[];C.ePlan=[];return C;}
test('복기 13종은 전체 사건·추첨에서 제거하고 기존 승리 카드 보상 유지',()=>{
 assert.equal(D.removedEvents.length,13);assert(!D.events.some(e=>e.id.startsWith('memory_')));
 const r=make();r.state.relics=Object.keys(D.bossLoot);for(const where of ['road','camp','town','explore'])assert(!r.availableEvents(where).some(e=>e.id.startsWith('memory_')));
 const t=make(),C=fight(t);C.E.hp=1;C.P.hand=['sbr_basic_strike'];assert(t.round([0]));assert.equal(t.state.offer,t.enemy().rewardCards[0]);const tick=t.state.tick,deck=t.state.ch.deck.length;assert(t.reward('card'));assert.equal(t.state.tick,tick+1);assert.equal(t.state.ch.deck.length,deck+1);
});
test('모든 대기 복기 저장은 추가 행동·보상 없이 복원하고 중복 선택 거절',()=>{
 for(const id of D.removedEvents){const r=make(),g=structuredClone(r.state);g.tick=10;g.mode='event';g.event=id;g.followups[id]={readyAt:0,openedAt:0};const before={money:g.ch.money,deck:g.ch.deck,side:g.ch.side,items:g.items};assert(r.restore(g));assert.equal(r.state.mode,'travel');assert.equal(r.state.event,null);assert.equal(r.state.tick,10);assert.deepEqual({money:r.state.ch.money,deck:r.state.ch.deck,side:r.state.ch.side,items:r.state.items},before);assert(!r.state.followups[id]);assert(!r.chooseEvent(0));}
});
test('5명 모두 공개된 d100+능력치 판정으로 성공·실패하며 합류 보상은 성공 시 한 번',()=>{
 for(const id of Object.keys(D.companions))for(const success of [false,true]){
  const r=make(success?.999:0);if(id==='wekapipo'){r.state.tick=40;r.state.beaten.push('magenta');assert(r.restore(r.state));}encounter(r,id);const stats={...r.state.ch.stats},tick=r.state.tick;assert(r.canAlly());assert(r.encounter('ally'));assert.equal(r.state.lastCheck.success,success,id);assert.equal(r.state.lastCheck.score,r.state.lastCheck.roll+r.state.lastCheck.bonus);assert.equal(r.state.tick,tick+1);assert.equal(r.state.allies.includes(id),success);assert(!r.state.beaten.includes(id));
  if(success){assert.deepEqual(activeCompanionIds(D,r.state),[id]);assert.equal(r.state.ch.stats.eva,stats.eva+(D.companions[id].joinFx.eva||0));encounter(r,id);assert(!r.encounter('ally'));}
  else assert.equal(r.state.ch.stats.eva,stats.eva);
 }
});
test('합류 실패 뒤 기존 동행 유지·3행동 보호·구간 방문 제한 없이 무작위 재조우 후보 복귀',()=>{
 const r=make(0);r.state.allies=['johnny'];r.state.companionId='johnny';encounter(r,'gyro');assert(r.encounter('ally'));assert.deepEqual(activeCompanionIds(D,r.state),['johnny']);assert(!r.eligibleBosses().includes('gyro'));const at=r.state.companionRetryAt.gyro;assert.equal(at-r.state.tick,3);assert(r.restore(r.state));
 rest(r);rest(r);assert(!r.eligibleBosses().includes('gyro'));rest(r);assert(r.eligibleBosses().includes('gyro'));assert(!r.state.beaten.includes('gyro'));assert(!r.state.allies.includes('gyro'));
});
test('성공한 새 합류만 동행 교대·기존 합류 기록 보존·교대/대기 중 보상 재지급 없음',()=>{
 const r=make();encounter(r,'gyro');assert(r.encounter('ally'));encounter(r,'johnny');assert(r.encounter('ally'));assert.deepEqual(r.state.allies,['gyro','johnny']);assert.deepEqual(activeCompanionIds(D,r.state),['johnny']);const before={tick:r.state.tick,stats:{...r.state.ch.stats},hp:r.state.ch.hp,money:r.state.ch.money,joined:{...r.state.companionJoinedAt}};
 assert(r.setCompanion('gyro'));assert.deepEqual(activeCompanionIds(D,r.state),['gyro']);assert(r.setCompanion(null));assert.deepEqual(activeCompanionIds(D,r.state),[]);assert(r.setCompanion('johnny'));assert(!r.setCompanion('valentine'));assert.deepEqual({tick:r.state.tick,stats:r.state.ch.stats,hp:r.state.ch.hp,money:r.state.ch.money,joined:r.state.companionJoinedAt},before);
 fight(r);assert(!r.setCompanion('gyro'));assert.equal(r.state.combat.companions.length,1);
});
test('첫 동행 사건은 합류 후 다른 행동 3회 뒤 등장·다음 답례 사건도 간격 유지',()=>{
 const r=make();encounter(r,'gyro');assert(r.encounter('ally'));const g=r.state;assert(!r.availableEvents().some(e=>e.id==='ally_gyro_1'));rest(r);rest(r);assert(!r.availableEvents().some(e=>e.id==='ally_gyro_1'));rest(r);assert(r.availableEvents().some(e=>e.id==='ally_gyro_1'));
 g.items.push('pouch');g.mode='event';g.event='ally_gyro_1';assert(r.chooseEvent(0));assert(!r.availableEvents().some(e=>e.id==='ally_gyro_2'));rest(r);assert(!r.availableEvents().some(e=>e.id==='ally_gyro_2'));rest(r);assert(r.availableEvents().some(e=>e.id==='ally_gyro_2'));
});
test('너무 이른 구형 동행 사건·예약은 행동 소모 없이 정리하고 원래 보유품 보존',()=>{
 const r=make(),old=structuredClone(r.state);old.tick=12;old.allies=['gyro'];old.mode='event';old.event='ally_gyro_1';old.followups.ally_gyro_1={openedAt:0,readyAt:0};delete old.companionId;delete old.companionJoinedAt;assert(r.restore(old));assert.equal(r.state.mode,'travel');assert.equal(r.state.tick,12);assert.equal(r.state.followups.ally_gyro_1.readyAt,15);assert.deepEqual(r.state.items,old.items);assert(r.restore(r.state));assert.equal(r.state.followups.ally_gyro_1.readyAt,15);
});
test('예전 다인 동행 저장은 1명만 활성화하고 이미 계산된 연출은 그대로 보존',()=>{
 const r=make();r.state.allies=['johnny','gyro','mountain'];delete r.state.companionId;assert(r.restore(r.state));assert.deepEqual(activeCompanionIds(D,r.state),['johnny']);const C=fight(r);C.companions=['johnny','gyro','mountain'].map(id=>companionProfile(D,id,1));delete C.companionVersion;assert(r.restore(r.state));assert.equal(r.state.combat.companions.length,1);
 const T=r.state.combat;T.P.hand=[];T.ePlan=[];assert(r.round([],{playback:true}));const saved=structuredClone(r.state);saved.combat.companions=['johnny','gyro'].map(id=>companionProfile(D,id,1));delete saved.combat.companionVersion;assert(r.restore(saved));assert.deepEqual(r.state.playback,saved.playback);assert(r.finishPlayback());assert.equal(r.state.combat.companions.length,1);
});
test('첫 지원은 확률 강제 조작 없이 5명 모두 실제 전투에서 발동·플레이어 카드 소모와 별도',()=>{
 for(const id of Object.keys(D.companions)){
  const r=make(0);r.state.allies=[id];r.state.companionId=id;const C=fight(r);if(id==='hotpants')C.P.hp=4000;if(['gyro','wekapipo'].includes(id))C.P.hand=['sbr_basic_strike'];const cards=C.P.hand.length;assert(r.round(cards?[0]:[]));const ev=C.evs.filter(e=>e.k==='support');assert.equal(ev.length,1,id);assert.equal(ev[0].companion.id,id);assert.equal(r.state.counters.cards,cards);assert(!ev[0].card&&!ev[0].att);assert(C.lastCompanionSupport.text.includes(D.companions[id].n));
 }
});
test('첫 지원은 확률 추첨을 생략하고 이후 지원부터 성공률을 적용',()=>{
 for(const id of Object.keys(D.companions)){
  const r=make(),C=fight(r);C.companions=[companionProfile(D,id,1)];C.P.hp=4000;
  const s=C.companions[0].supports[0],events=[];let rolls=0;
  const support=()=>resolveCompanionSupport(C,s.on[0],()=>{},e=>events.push(e),()=>{rolls++;return 100;},R);
  support();assert.equal(events.length,1,id);assert.equal(rolls,0,id);
  C.round+=s.cooldown;support();assert.equal(events.length,1,id);assert.equal(rolls,1,id);
 }
});

test('턴 시작 지원이 여러 공격 뒤에도 요약에 남고 이후 발동은 재사용 간격 준수',()=>{
 const r=make();r.state.allies=['johnny'];r.state.companionId='johnny';const C=fight(r);C.P.hand=Array(3).fill('sbr_basic_strike');assert(r.round([0,1,2]));assert.match(r.state.lastRound.summary,/자동 지원.*죠니/);const used=C.companionUses['johnny:cover'].uses;C.P.hand=[];C.ePlan=[];assert(r.round([]));assert.equal(C.companionUses['johnny:cover'].uses,used);C.ePlan=[];assert(r.round([]));assert(C.companionUses['johnny:cover'].uses<=used+1);
});
test('실제 UI에서 합류 성공률·1명 교대·지원 내역 확인 및 전투 중 전환 차단',()=>{
 const h=boot();h.ui.action('start');const r=h.ui.race;encounter(r,'gyro');h.ui.render();assert.match(h.text(),/성공 \d+%/);assert.match(h.text(),/목표 65/);r.state.allies=['gyro','johnny'];r.state.companionId='gyro';h.ui.action('companions');assert.match(h.elements.get('#sheet-body').innerHTML,/한 번에 1명/);h.ui.action('companion:johnny');assert.deepEqual(activeCompanionIds(D,r.state),['johnny']);const g=JSON.parse(h.storage.get('sbr-race-v04'));assert.equal(g.companionId,'johnny');h.close();const C=fight(r);C.P.hand=[];C.ePlan=[];assert(r.round([]));h.ui.render();assert.match(h.text(),/자동 지원/);assert.match(h.text(),/동행 · 죠니/);assert(!r.setCompanion('gyro'));
});
fs.writeFileSync('reports/generated/companion-flow-checks.json',JSON.stringify({checks},null,2));console.log(JSON.stringify({companionFlowChecks:checks.length,passed:checks.filter(x=>x.ok).length,failures:checks.filter(x=>!x.ok)},null,2));if(checks.some(x=>!x.ok))process.exitCode=1;
