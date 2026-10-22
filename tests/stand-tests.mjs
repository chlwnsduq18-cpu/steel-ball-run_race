import '../scripts/prepare-reports.mjs';
import fs from 'node:fs';import assert from 'node:assert/strict';
import {createRace} from '../dist/src/race.js';import {mulberry32} from '../dist/src/engine.js';
import {activeEffects} from '../dist/src/progression.js';import {birthStand,standCard} from '../dist/src/stand.js';
import {initialCharacter,pickBirthEntry} from '../dist/src/birth.js';import {replayFrame,advanceReplay} from '../dist/src/playback.js';
const D=JSON.parse(fs.readFileSync('dist/game-data.json')),R=JSON.parse(fs.readFileSync('dist/runtime-base.json'));
const checks=[];const test=(n,f)=>{try{f();checks.push({n,ok:true});}catch(e){checks.push({n,ok:false,error:e.stack});}};
const make=(origin='ranch',talents='steady')=>{const r=createRace(D,R,{rng:mulberry32(17)});r.start('각성 검사',{origins:origin,talents,flaws:'slow',weapons:'rifle'});return r;};
const awaken=(r,type='special')=>{r.state.tick=8;r.state.mode='event';r.state.event='stand_palm';const e=D.events.find(e=>e.id==='stand_palm'),i=e.c.findIndex(c=>c.ok.fx.awakenStand===type);assert(i>=0);assert(r.chooseEvent(i));return r.state.stand;};
const fight=r=>{r.state.mode='encounter';r.state.encounter='rough_rider';assert(r.encounter('fight'));const C=r.state.combat;C.P.hp=C.P.maxHp=C.E.hp=C.E.maxHp=100000;C.ePlan=[];return C;};
const play=(r,ids,ep=[])=>{const C=r.state.combat;C.P.hand=ids;C.P.light=20;C.ePlan=ep;return r.round(ids.map((_,i)=>i));};

test('세 번째 공격 카드의 턴 효과가 첫 적 공격보다 먼저 적용·공격 순서 유지',()=>{
 const r=make();awaken(r);const C=fight(r),id=standCard(D,r.state);C.order=[C.E,C.P];C.P.atk=300;C.E.eva=-100;
 assert(play(r,['sbr_basic_strike','sbr_basic_strike',id],[r.engine.D.cards.sbr_basic_strike]));const ev=r.state.lastRound.events;
 const first=ev.findIndex(e=>e.k==='atk');assert.equal(ev[0].k,'turnStart');assert.equal(ev[0].snap.P.evaB,6);assert(first>0);assert.equal(ev[first].att,'E');assert.equal(ev[first].dm,C.P.eva+6);
 assert.deepEqual(ev.filter(e=>e.k==='atk'&&e.att==='P').map(e=>e.card.n),['힘을 실은 타격','힘을 실은 타격',D.cards[id].n]);assert.equal(r.state.stand.uses,1);
});
test('방어 카드의 이번 턴 명중·회피는 시작 시 합산하고 중복 적용하지 않음',()=>{
 const r=make(),C=fight(r);C.P.defUp=3;C.order=[C.E,C.P];assert(play(r,['sbr_basic_strike','sbr_basic_step'],[r.engine.D.cards.sbr_basic_strike]));
 const ev=r.state.lastRound.events;assert.equal(ev[0].snap.P.evaB,23);assert.equal(ev[0].snap.P.passHit,5);assert.equal(ev.at(-1).snap.P.evaB,23);assert.equal(ev.at(-1).snap.P.passHit,5);assert.equal(C.P.evaB,0);assert.equal(C.P.passHit,0);assert.equal(r.state.counters.cards,2);
});
test('적의 턴 효과도 뒷순서 공격 카드에서 먼저 적용',()=>{
 const r=make(),C=fight(r),c=r.engine.D.cards.sbr_basic_shoot;c.turnStart={eva:13,hit:7};C.order=[C.P,C.E];assert(play(r,['sbr_basic_strike'],[r.engine.D.cards.sbr_basic_strike,c]));
 const ev=r.state.lastRound.events,first=ev.find(e=>e.k==='atk');assert.equal(ev[0].side,'E');assert.equal(first.dm,C.E.eva+13);assert(ev.filter(e=>e.k==='atk'&&e.att==='E').every(e=>e.snap.E.passHit===7));
});
test('선택하지 않은 카드와 행동 불가인 쪽의 턴 효과는 발동하지 않음',()=>{
 const r=make(),C=fight(r);C.P.hand=['sbr_basic_step','sbr_basic_strike'];C.ePlan=[];assert(r.round([1]));assert(!r.state.lastRound.events.some(e=>e.k==='turnStart'));C.P.actionBlocked=true;C.ePlan=[r.engine.D.cards.sbr_basic_step];assert(r.round([]));assert(!r.state.lastRound.events.some(e=>e.k==='turnStart'&&e.side==='P'));
});
test('일회용 카드 중복 입력에서도 턴 효과 한 번·다음 턴 재사용 불가',()=>{
 const r=make(),C=fight(r),c=r.engine.D.cards.sbr_basic_shoot;c.turnStart={eva:7};c.once=true;assert(play(r,['sbr_basic_shoot','sbr_basic_shoot']));assert.equal(r.state.lastRound.events.filter(e=>e.k==='turnStart').length,1);assert.equal(r.state.lastRound.events.filter(e=>e.k==='atk').length,1);assert(play(r,['sbr_basic_shoot']));assert(!r.state.lastRound.events.some(e=>e.k==='turnStart'));
});
test('다음 턴 명중과 적중 기세는 시작 시 당겨오지 않음',()=>{
 const r=make(),C=fight(r);C.P.atk=300;C.E.eva=-100;assert(play(r,['sbr_basic_strike','sbr_basic_aim']));const ev=r.state.lastRound.events;assert.equal(ev.find(e=>e.k==='head').snap.P.charge,0);assert.equal(ev.find(e=>e.k==='atk').snap.P.passHit,0);assert.equal(C.P.passHit,10);assert.equal(C.P.charge,2);
 const r2=make(),C2=fight(r2);C2.P.atk=300;C2.E.eva=-100;assert(play(r2,['sbr_steel_prepare']));assert.equal(r2.state.lastRound.events.find(e=>e.k==='head').snap.P.charge,0);assert.equal(r2.state.lastRound.events.find(e=>e.k==='atk').snap.P.charge,2);
});
test('연출 결과 단계에서만 턴 시작 효과가 나타나고 복원해도 재적용하지 않음',()=>{
 const r=make(),C=fight(r);C.P.hand=['sbr_basic_step'];C.ePlan=[];assert(r.round([0],{playback:true}));const p=r.state.playback;assert.equal(p.events[0].k,'turnStart');assert.equal(replayFrame(p).P.evaB,0);advanceReplay(p);assert.equal(replayFrame(p).P.evaB,20);const copy=make();assert(copy.restore(JSON.parse(JSON.stringify(r.state))));assert.equal(replayFrame(copy.state.playback).P.evaB,20);const before=JSON.stringify(copy.state.combat);assert(!copy.round([0]));assert.equal(JSON.stringify(copy.state.combat),before);copy.finishPlayback();assert.equal(copy.state.combat.P.evaB,0);
});
test('미각성 일반 출발·각성 사건의 수락과 거절·중복 각성 방지',()=>{
 const r=make();assert(!r.state.stand);assert(!r.state.ch.deck.some(id=>D.cards[id].stand));r.state.tick=8;assert(r.availableEvents().some(e=>e.id==='stand_palm'));const before=r.state.ch.deck.slice();r.state.mode='event';r.state.event='stand_palm';assert(r.chooseEvent(3));assert(!r.state.stand);assert.deepEqual(r.state.ch.deck,before);const r2=make();awaken(r2);assert.equal(r2.state.stand.type,'special');assert.equal(r2.state.ch.deck.length,4);assert.equal(r2.state.ch.side.length,3);assert(!r2.availableEvents().some(e=>e.id.startsWith('stand_')));r2.state.mode='event';r2.state.event='stand_palm';assert(!r2.chooseEvent(0));
});
test('늦은 구간의 각성 기회도 모든 행선지에 존재·첫 각성 거절 뒤 재도전 가능',()=>{
 const r=make();r.state.tick=8;r.state.mode='event';r.state.event='stand_palm';r.chooseEvent(3);r.state.tick=40;
 for(const where of ['road','camp','town','explore'])assert(r.availableEvents(where).some(e=>e.id==='stand_last_call'));r.travel('rest');if(r.canShop()){assert(r.chooseEvent(0));assert(r.travel('rest'));}assert(['stand_echo','stand_last_call'].includes(r.state.event));
});
test('이미 각성한 재능은 독립 3%·기존 1~3% 히든 확률 유지',()=>{
 let count=0;for(let roll=1;roll<=100;roll++)if(pickBirthEntry(D,'talents',roll).stand)count++;assert.equal(count,3);assert.equal(D.starts.filter(x=>x.hidden).reduce((a,x)=>a+x.weight,0),15);
 const r=make('ranch','recovery');assert.equal(r.state.stand.type,'force');assert.equal(r.state.ch.deck.length,4);assert.equal(r.state.ch.side.length,3);assert(r.state.ch.flags.stand_awakened);assert(r.state.message.includes('스탠드 각성 상태'));assert.equal(initialCharacter(D,r.state.birth).deck.length,r.state.ch.deck.length);
});
test('스탠드 계열 히든 다섯 출발은 전용 덱 크기를 유지하며 각성·비 스탠드 출발 구별',()=>{
 for(const o of D.starts){const r=make(o.id);if(o.stand){assert(r.state.stand);assert.deepEqual(r.state.ch.deck,o.deck);assert.equal(r.state.ch.deck.filter(id=>D.cards[id].stand).length,D.starts.find(o=>o.id===r.state.origin).deck.filter(id=>D.cards[id].stand).length);}else assert(!r.state.stand);}
});
test('각성 재능과 스탠드 히든이 겹쳐도 스탠드는 하나·재추첨 없음',()=>{const r=make('time','recovery');assert.equal(r.state.stand.type,'time');assert.equal(r.state.ch.deck.filter(id=>D.cards[id].stand).length,D.starts.find(o=>o.id===r.state.origin).deck.filter(id=>D.cards[id].stand).length);assert.equal(birthStand(D,r.state.birth),'time');});
test('12장 덱 각성은 기존 카드와 순서를 유지하고 추가 카드 3장을 보관',()=>{
 const r=make();while(r.state.ch.deck.length<12)r.state.ch.deck.push('sbr_basic_strike');const deck=r.state.ch.deck.slice(),cash=r.state.ch.money;awaken(r);assert.deepEqual(r.state.ch.deck,deck);assert.equal(r.state.ch.side.length,3);assert.equal(r.state.ch.money,cash);assert.equal(r.state.ch.deck.filter(id=>D.cards[id].stand).length,0);assert(!r.insertCard(0));assert(r.swapCard(0,0));assert.equal(r.state.ch.deck.length,12);assert(r.removeCard(0));
});

test('기본 스탠드 없는 히든은 공용 각성을 허용하고 기존 덱을 유지',()=>{
 const r=make('vampire'),deck=r.state.ch.deck.slice(),cash=r.state.ch.money;r.state.tick=8;assert(r.availableEvents().some(e=>e.standAwakening));r.state.mode='event';r.state.event='stand_palm';assert(r.chooseEvent(0));assert(r.state.stand);assert.deepEqual(r.state.ch.deck,deck);assert.equal(r.state.ch.side.length,3);assert.equal(r.state.ch.money,cash);
});

test('5·15·30회 실제 전용기 사용으로 진화·연타는 카드당 한 번·현재 공격은 기존 단계',()=>{
 const r=make('drifter','recovery'),C=fight(r);C.P.atk=300;C.E.eva=-100;const weapon=r.state.equipment.weapon;r.state.economy.tuning[weapon]=2;
 for(let uses=1;uses<=30;uses++){
  const old=standCard(D,r.state),level=r.state.stand.level;assert(play(r,[old]));assert.equal(r.state.stand.uses,uses);assert.equal(r.state.stand.level,uses>=30?3:uses>=15?2:uses>=5?1:0);
  assert(r.state.lastRound.events.filter(e=>e.k==='atk').every(e=>e.card.n===D.cards[old].n));if(r.state.stand.level>level)assert(!r.state.ch.deck.includes(old));
 }
 assert.equal(r.state.itemLevels[D.stands.types.rapid.item],3);assert.equal(r.state.ch.deck.length,4);assert.equal(r.state.ch.side.length,3);assert.equal(r.state.economy.tuning[weapon],2);assert.equal(r.state.history.filter(x=>x.startsWith('스탠드 진화')).length,3);
});
test('스탠드 성장 효과도 기존 공통 효과·진화 후 전용기는 여전히 공격',()=>{
 for(const t of Object.values(D.stands.types)){for(let lv=0;lv<4;lv++){const c=D.cards[t.cards[lv]];assert.equal(c.t,'atk');if(t.baseCard)assert(c.fixed);else assert(!c.fixed);assert(c.c<=3);const it=D.items[t.item];for(const e of it.levels[lv])for(const k of Object.keys(e.fx))assert(D.keywords[k]);}}
 const r=make('ranch','recovery');r.state.stand.level=2;r.state.itemLevels.stand_force=2;assert(activeEffects(D,r.state).some(e=>e.source==='스탠드 · 파워형 스탠드'&&e.fx.charge===4));
});
test('일반 카드·승리·무기 숙련 보상으로 전용기 사용 횟수를 대신 쌓지 않음',()=>{
 const r=make('ranch','recovery'),C=fight(r);C.P.atk=300;C.E.eva=-100;assert(play(r,['sbr_basic_strike']));r.state.counters.cards=100;r.state.counters.wins=20;assert.equal(r.state.stand.uses,0);assert.equal(r.state.stand.level,0);
});
test('빗나간 전용기도 사용으로 세며 공격 전 출혈로 쓰러지면 세지 않음',()=>{
 const r=make('ranch','recovery'),C=fight(r);C.P.atk=-500;C.E.eva=500;assert(play(r,[standCard(D,r.state)]));assert.equal(r.state.stand.uses,1);C.P.hp=1;C.P.bleed=10;assert(play(r,[standCard(D,r.state)]));assert.equal(r.state.stand.uses,1);
});
test('진화 직전 저장·연출 중 저장 복원·진화와 아이템 중복 지급 방지',()=>{
 const r=make('ranch','recovery'),C=fight(r);r.state.stand.uses=4;const id=standCard(D,r.state);C.P.hand=[id];C.ePlan=[];assert(r.round([0],{playback:true}));assert.equal(r.state.stand.level,1);const save=JSON.parse(JSON.stringify(r.state)),copy=make();assert(copy.restore(save));assert.equal(copy.state.stand.uses,5);assert.equal(copy.state.stand.level,1);assert.equal(copy.state.items.filter(id=>id==='stand_force').length,1);assert.equal(copy.state.playback.events.find(e=>e.k==='atk').card.n,D.cards[id].n);copy.finishPlayback();assert(copy.state.ch.side.includes(D.stands.types.force.cards[1]));const stable=JSON.stringify(copy.state);assert(copy.restore(JSON.parse(stable)));assert.equal(JSON.stringify(copy.state),stable);
});
test('구버전 일반 저장은 재능을 소급 각성하지 않음·히든은 전투 종료 후 안전하게 도입',()=>{
 const r=make('ranch');r.state.birth.talents='recovery';const copy=make();assert(copy.restore(JSON.parse(JSON.stringify(r.state))));assert(!copy.state.stand);
 const hidden=make('time'),C=fight(hidden);const old=JSON.parse(JSON.stringify(hidden.state));delete old.stand;old.items=old.items.filter(id=>!D.items[id]?.stand);delete old.ch.flags.stand_awakened;old.ch.deck=old.ch.deck.map(id=>D.cards[id].stand?'sbr_time_strike':id);old.combat.P.deck=old.ch.deck.slice();const h=make();assert(h.restore(old));assert(!h.state.ch.deck.some(id=>D.cards[id].stand));h.state.combat.E.hp=1;h.state.combat.E.eva=-300;h.state.combat.P.atk=300;h.state.combat.P.hand=['sbr_basic_strike'];h.state.combat.ePlan=[];assert(h.round([0]));assert(h.state.ch.deck.some(id=>D.cards[id].stand));assert.equal(h.state.stand.type,'time');
});
test('고유 스탠드 없는 덱으로 전환하면 자신의 스탠드·진화 단계를 보존',()=>{
 const r=make('ranch','recovery');r.state.stand.uses=15;r.state.stand.level=2;r.state.itemLevels.stand_force=2;const cash=r.state.ch.money;assert(r.transform('hamon'));assert.equal(r.state.stand.type,'force');assert.equal(r.state.stand.level,2);assert.equal(r.state.ch.deck.filter(id=>D.cards[id].stand).length,0);assert.equal(r.state.ch.side.length,3);assert(r.state.ch.side.includes(D.stands.types.force.cards[2]));assert.equal(r.state.ch.money,cash+4*D.rules.cardCash);
 const unawakened=make();assert(unawakened.transform('thread'));assert.equal(unawakened.state.stand.type,'thread');
});
test('구버전 다섯 스탠드 히든의 전용기는 한 장 교환·능력치·돈·장비 보존',()=>{
 for(const o of D.starts.filter(o=>o.stand)){
  const r=make(o.id),old=structuredClone(r.state),base=D.stands.types[o.stand].baseCard;delete old.stand;delete old.ch.flags.stand_awakened;old.items=old.items.filter(id=>!D.items[id]?.stand);old.ch.deck=old.ch.deck.map(id=>D.cards[id].stand?base:id);const cash=old.ch.money,stats=structuredClone(old.ch.stats),size=old.ch.deck.length;
  assert(r.restore(old));assert.equal(r.state.ch.deck.length,size);assert.equal(r.state.ch.money,cash);assert.deepEqual(r.state.ch.stats,stats);assert.equal(r.state.ch.deck.filter(id=>D.cards[id].stand).length,1);assert.equal(r.state.ch.side.length,0);
  const saved=JSON.stringify(r.state);assert(r.restore(JSON.parse(saved)));assert.equal(JSON.stringify(r.state),saved);
 }
});
test('구버전 히든 경제 마이그레이션은 스탠드를 환전하지 않고 잉여 일반 카드만 정산',()=>{
 for(const o of D.starts.filter(o=>o.stand)){
  const r=make(o.id),old=structuredClone(r.state);delete old.economy.version;old.ch.side=['sbr_enemy_gyro'];const cash=old.ch.money;assert(r.restore(old));assert.equal(r.state.ch.money,cash+D.rules.cardCash);assert.equal(r.state.ch.deck.filter(id=>D.cards[id].stand).length,D.starts.find(o=>o.id===r.state.origin).deck.filter(id=>D.cards[id].stand).length);assert.equal(r.state.ch.side.length,0);
 }
});
fs.writeFileSync('reports/generated/stand-checks.json',JSON.stringify({scope:'Resolver timing, awakening, growth and persistence; no visual browser validation',checks},null,2));
console.log(JSON.stringify({standChecks:checks.length,passed:checks.filter(x=>x.ok).length,failures:checks.filter(x=>!x.ok)},null,2));if(checks.some(x=>!x.ok))process.exitCode=1;
