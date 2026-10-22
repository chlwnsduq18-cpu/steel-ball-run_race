import '../scripts/prepare-reports.mjs';
import fs from 'node:fs';import assert from 'node:assert/strict';
import {createRace} from '../src/race.js';import {mulberry32} from '../src/engine.js';
import {resolveCompanionSupport,companionProfile,prepareCompanions,companionsScreen} from '../src/companions.js';
import {validateCompanionData} from '../data/companions-data.mjs';import {boot} from './ui-test-harness.mjs';
const D=JSON.parse(fs.readFileSync('game-data.json')),R=JSON.parse(fs.readFileSync('runtime-base.json'));
const checks=[],test=(n,f)=>{try{f();checks.push({n,ok:true});}catch(e){checks.push({n,ok:false,error:e.stack});}};
function make(data=D){const r=createRace(data,R,{rng:()=>.999});r.start('지원 검사',{origins:'ranch',talents:'steady',flaws:'slow',weapons:'revolver'});return r;}
function fight(ids=[],stage=6){const r=make();r.state.allies=ids;r.state.companionId=ids[0]||null;r.state.tick=(stage-1)*8;r.restore(r.state);r.state.mode='encounter';r.state.encounter='ringo';assert(r.encounter('fight'));const C=r.state.combat;C.P.hp=C.P.maxHp=C.E.hp=C.E.maxHp=10000;C.P.light=10;C.P.hand=[];C.ePlan=[];return r;}
function force(C){for(const c of C.companions)for(const s of c.supports)s.chance=100;}
function direct(C,on,roll=()=>1){const events=[],lines=[];resolveCompanionSupport(C,on,(t,s)=>lines.push({t,s}),e=>events.push({...e,lines:lines.splice(0),snap:{P:{hp:C.P.hp},E:{hp:C.E.hp}}}),roll,R);return events;}
test('기존 동행 4명 및 웨카피포 조건, 격파·중복 영입 거절',()=>{
 for(const id of ['gyro','johnny','hotpants','mountain']){const r=make();r.state.mode='omen';r.state.encounter=id;const tick=r.state.tick;assert(r.canAlly());assert(r.encounter('ally'));assert(r.state.allies.includes(id));assert.equal(r.state.tick,tick+1);assert(!r.eligibleBosses().includes(id));r.state.mode='omen';assert(!r.canAlly());assert(!r.encounter('ally'));}
 for(const condition of ['none','gyro','magenta']){const r=make();r.state.tick=40;r.state.mode='omen';r.state.encounter='wekapipo';if(condition==='gyro')r.state.allies.push('gyro');if(condition==='magenta')r.state.beaten.push('magenta');assert.equal(r.canAlly(),condition!=='none');if(condition!=='none')assert(r.encounter('ally'));}
 const r=make();r.state.allies=['gyro'];r.state.mode='omen';r.state.encounter='wekapipo';assert(!r.canAlly());r.state.tick=40;r.state.beaten=['wekapipo'];assert(!r.canAlly());
});
test('다른 네임드도 동행 데이터만 추가하면 영입·지원이 같은 코드로 동작',()=>{
 const data=structuredClone(D);data.companions.robinson={n:data.enemies.robinson.n,joinFrom:2,joinReq:['flag:cooperate'],joinFx:{hp:5},supports:[{id:'insect',skill:'벌레의 엄호',on:['roundStart'],chance:100,cooldown:2,fx:{self:{shield:3}}}]};assert(validateCompanionData(data));
 const r=make(data);r.state.tick=8;r.state.mode='encounter';r.state.encounter='robinson';assert(!r.canAlly());r.state.ch.flags.cooperate=true;assert(r.canAlly());assert(r.encounter('ally'));r.state.encounter='ringo';r.state.mode='encounter';assert(r.encounter('fight'));assert(r.state.combat.companions.some(c=>c.id==='robinson'));assert(direct(r.state.combat,'roundStart').some(e=>e.companion.id==='robinson'));
});
test('죠니는 구간에 맞는 기술만 사용하고 기존 한국어 기술 대사를 연결',()=>{
 for(const [stage,skill]of [[1,'말 위'],[2,'ACT.1'],[4,'ACT.1'],[5,'ACT.2'],[7,'ACT.3'],[8,'ACT.4']]){const s=companionProfile(D,'johnny',stage).supports[0];assert(s.skill.includes(skill));assert(s.lines.length);assert(s.lines.every(q=>q.text&&q.source));}
 assert(validateCompanionData(D));assert.deepEqual(Object.keys(D.stats),['atk','spd','eva']);assert.equal(Object.keys(D.keywords).length,8);
});
test('5명 모두 실제 전투의 해당 타이밍에서 자신의 효과와 전용 지원 이벤트 실행',()=>{
 for(const id of Object.keys(D.companions)){const r=fight([id]),C=r.state.combat;force(C);
  if(id==='hotpants'){C.P.hp=4000;C.P.bleed=2;C.P.burn=2;}
  if(['gyro','wekapipo'].includes(id)){C.P.atk=300;C.E.eva=-300;C.P.hand=['sbr_basic_shoot'];}
  if(id==='mountain'){C.E.atk=300;C.P.eva=-300;C.E.dmgB=1;C.ePlan=[r.engine.D.cards.sbr_basic_shoot];}
  assert(r.round(C.P.hand.length?[0]:[]));const ev=C.evs.find(e=>e.k==='support'&&e.companion.id===id);assert(ev,id);assert(ev.companion.skill);assert(ev.lines.some(l=>l.t==='support'));assert(ev.snap.P&&ev.snap.E);assert(!ev.card&&!ev.att&&!ev.side);
  if(id==='hotpants')assert(ev.supportEffects.some(x=>x.k==='hp'&&x.next>x.before));if(id==='mountain')assert(ev.supportEffects.some(x=>x.k==='shield'&&x.next>x.before));if(id==='gyro')assert(ev.supportEffects.some(x=>x.k==='charge'));if(id==='wekapipo')assert(ev.supportEffects.some(x=>x.k==='sink'));if(id==='johnny')assert(ev.damage>0);
 }
});
test('지원은 카드·덱·행동력·행동 순서·자금·성장 카운터를 소모하거나 대체하지 않음',()=>{
 const r=fight(['johnny']),g=r.state,C=g.combat;force(C);const before={deck:C.P.deck.slice(),hand:C.P.hand.slice(),light:C.P.light,order:C.order.map(x=>x.uid),stats:{...g.ch.stats},money:g.ch.money,counters:{...g.counters},tick:g.tick,usedOnce:C.P.usedOnce};assert.equal(direct(C,'roundStart').length,1);
 assert.deepEqual({deck:C.P.deck.slice(),hand:C.P.hand.slice(),light:C.P.light,order:C.order.map(x=>x.uid),stats:{...g.ch.stats},money:g.ch.money,counters:{...g.counters},tick:g.tick,usedOnce:C.P.usedOnce},before);
});
test('내 행동이 막히거나 카드를 내지 않아도 독립적으로 자동 지원',()=>{
 const r=fight(['johnny']),g=r.state,C=g.combat;force(C);C.P.actionBlocked=true;const cards=g.counters.cards;assert(r.round([]));assert(C.evs.some(e=>e.k==='support'));assert(!C.evs.some(e=>e.card&&(e.att||e.side)==='P'));assert.equal(g.counters.cards,cards);assert.equal(g.tick,40);
});
test('실패한 확률도 한 턴에 한 번만 판정, 성공 후 재사용 간격과 지원 횟수 유지',()=>{
 const r=fight(['gyro']),C=r.state.combat;C.companions[0].supports[0].firstGuaranteed=false;let rolls=0;assert.equal(direct(C,'afterHit',()=>{rolls++;return 100;}).length,0);assert.equal(direct(C,'afterHit',()=>{rolls++;return 1;}).length,0);assert.equal(rolls,1);
 C.round=2;assert.equal(direct(C,'afterHit').length,1);assert.equal(direct(C,'afterHit').length,0);C.round=3;assert.equal(direct(C,'afterHit').length,0);C.round=4;assert.equal(direct(C,'afterHit').length,1);assert.equal(C.companionUses['gyro:rotation'].uses,2);
});
test('합류 기록이 여러 명이어도 한 인물만 지원하며 한 턴에 중복 발동하지 않음',()=>{
 const r=fight(Object.keys(D.companions)),C=r.state.combat;force(C);C.P.hp=4000;const events=[...direct(C,'roundStart'),...direct(C,'hurt'),...direct(C,'afterHit'),...direct(C,'hurt'),...direct(C,'afterHit')];assert.equal(events.length,1);assert.deepEqual(events.map(x=>x.companion.id),['gyro']);assert(C.P.hp<=C.P.maxHp);
 const g=r.state;g.encounter='gyro';assert(!prepareCompanions(D,g,6).some(c=>c.id==='gyro'));
});
test('받을 효과가 없거나 양쪽 중 하나가 쓰러지면 지원·확률 재추첨 없음',()=>{
 const r=fight(['hotpants']),C=r.state.combat;let rolls=0;assert.equal(direct(C,'roundStart',()=>{rolls++;return 1;}).length,0);assert.equal(rolls,0);C.P.hp=0;assert.equal(direct(C,'hurt').length,0);C.P.hp=4000;C.E.hp=0;assert.equal(direct(C,'roundStart').length,0);
 const caps=fight(['gyro']).state.combat;caps.companions[0].supports[0].damage=0;caps.P.charge=caps.P.chargeCap;caps.E.rupture=20;assert.equal(direct(caps,'afterHit',()=>{rolls++;return 1;}).length,0);assert.equal(rolls,0);
});
test('지원 사격은 보호막을 먼저 소모하고 특수 불사 조건을 우회하지 않음',()=>{
 const C=fight(['johnny'],1).state.combat;C.E.shield=3;const hp=C.E.hp;let e=direct(C,'roundStart')[0];assert.equal(e.absorbed,3);assert.equal(e.damage,2);assert.equal(C.E.hp,hp-2);C.round+=2;C.E.hp=2;C.E.shield=0;C.E.passive={id:'lockledger'};e=direct(C,'roundStart')[0];assert.equal(C.E.hp,1);assert.equal(e.damage,1);
});
test('지원만으로 격파해도 승리·카드·돈 정산은 한 번, 플레이어 사용 횟수는 증가하지 않음',()=>{
 const r=fight(['johnny'],1),g=r.state,C=g.combat;force(C);C.E.hp=1;const count=g.counters.cards;assert(r.round([]));assert.equal(C.over,'win');assert.equal(g.mode,'reward');assert.equal(g.counters.cards,count);assert.equal(g.beaten.filter(x=>x==='ringo').length,1);const money=g.ch.money;assert(r.reward('cash'));assert.equal(g.ch.money,money+D.rules.cardCash);assert(!r.reward('cash'));
});
test('진행 중인 저장 복원은 지원 횟수·간격·기술 형태를 보존하고 과거 동행 기록도 지원 연결',()=>{
 const r=fight(['gyro']),C=r.state.combat;assert.equal(direct(C,'afterHit').length,1);const saved=JSON.parse(JSON.stringify(r.state));assert(r.restore(saved));assert.deepEqual(r.state.combat.companionUses,saved.combat.companionUses);assert.deepEqual(r.state.combat.companions,saved.combat.companions);assert.equal(direct(r.state.combat,'afterHit').length,0);
 const old=JSON.parse(JSON.stringify(r.state));delete old.combat.companions;delete old.combat.companionUses;assert(r.restore(old));assert(r.state.combat.companions.some(x=>x.id==='gyro'));
});
test('전투 연출에 동료 이름·기술·한국어 대사 표시, 재생·메뉴·재접속은 추가 발동 없음',()=>{
 const h=boot();h.ui.action('start');const r=h.ui.race;r.state.allies=['johnny'];r.state.companionId='johnny';r.state.mode='encounter';r.state.encounter='ringo';h.ui.action('encounter:fight');const C=r.state.combat;force(C);C.P.hp=C.P.maxHp=C.E.hp=C.E.maxHp=10000;C.P.hand=[];C.ePlan=[];h.ui.action('resolve');const ev=r.state.playback.events.find(e=>e.k==='support');assert(ev);const before=structuredClone(C.companionUses);let saw=false,n=300;
 while(r.state.playback&&n--){if(h.text().includes('자동 지원')&&h.text().includes('말 위의 엄호 사격')&&h.text().includes('companion-speech'))saw=true;h.step();}assert(n>0&&saw);assert.deepEqual(C.companionUses,before);
 h.ui.action('companions');assert(h.elements.get('#sheet-body').innerHTML.includes('내 카드·행동력·행동 순서'));assert.deepEqual(C.companionUses,before);h.close();const copy=boot(new Map(h.storage));copy.ui.action('continue');assert.deepEqual(copy.ui.race.state.combat.companionUses,before);
});
test('보통·빠르게·생략 설정에서 지원 정산은 같고 지원은 조작 버튼이 아님',()=>{
 const states=[];for(const speed of ['normal','fast','off']){const h=boot();h.ui.action('settings');h.ui.action('speed:'+speed);h.close();h.ui.action('start');const r=h.ui.race;r.state.allies=['johnny'];r.state.companionId='johnny';r.state.mode='encounter';r.state.encounter='ringo';h.ui.action('encounter:fight');const C=r.state.combat;force(C);C.P.hp=C.P.maxHp=C.E.hp=C.E.maxHp=10000;C.P.hand=[];C.ePlan=[];h.ui.action('resolve');let n=300;while(r.state.playback&&n--)h.step();assert(n>0);states.push({hp:C.P.hp,enemyHp:C.E.hp,uses:structuredClone(C.companionUses),cards:r.state.counters.cards,deck:r.state.ch.deck.slice()});assert(!h.text().includes('data-action="support:'));}assert.deepEqual(states[0],states[1]);assert.deepEqual(states[1],states[2]);
});
test('각자의 길로 떠나면 우호 기록을 유지하면서 실제 지원과 활성 인원에서 제외',()=>{
 const r=make(),g=r.state;g.allies=['gyro','johnny'];g.companionId='gyro';g.companionJoinedAt={gyro:0,johnny:0};r.availableEvents();g.tick=g.followups.ally_gyro_1.readyAt;g.mode='event';g.event='ally_gyro_1';assert(r.chooseEvent(2));assert.equal(g.routeResults.ally_gyro,'parted');assert(g.allies.includes('gyro'));g.encounter='ringo';assert.deepEqual(prepareCompanions(D,g,6),[]);assert(r.setCompanion('johnny'));assert.deepEqual(prepareCompanions(D,g,6).map(c=>c.id),['johnny']);
 const html=companionsScreen({data:D,race:r,esc:s=>String(s)});assert(html.includes('자이로 체펠리'));assert(html.includes('자동 지원 종료'));assert(html.includes('말 위의 엄호 사격'));
});
test('잘못된 지원 데이터는 빌드 검증에서 거절',()=>{
 for(const mutate of [d=>d.companions.gyro.supports[0].chance=101,d=>d.companions.gyro.supports[0].cooldown=0,d=>d.companions.gyro.supports[0].fx={self:{made_up:1}},d=>d.companions.gyro.supports[0].damage=NaN]){const data=structuredClone(D);mutate(data);assert.throws(()=>validateCompanionData(data),/Invalid companion/);}
});
fs.writeFileSync('reports/generated/companion-checks.json',JSON.stringify({checks},null,2));console.log(JSON.stringify({companionChecks:checks.length,passed:checks.filter(x=>x.ok).length,failures:checks.filter(x=>!x.ok)},null,2));if(checks.some(x=>!x.ok))process.exitCode=1;
