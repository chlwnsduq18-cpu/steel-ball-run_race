import '../scripts/prepare-reports.mjs';
import fs from 'node:fs';import assert from 'node:assert/strict';
import {createRace} from '../src/race.js';import {mulberry32} from '../src/engine.js';import {standPack} from '../src/stand.js';
import {journeyScreen} from '../src/journey-ui.js';import {waitForFollowup} from './followup-test-fixture.mjs';import {boot} from './ui-test-harness.mjs';
const D=JSON.parse(fs.readFileSync('game-data.json')),R=JSON.parse(fs.readFileSync('runtime-base.json'));
const checks=[],test=(n,f)=>{try{f();checks.push({n,ok:true});}catch(e){checks.push({n,ok:false,error:e.stack});}};
function make(stand=false){const r=createRace(D,R,{rng:mulberry32(96)});r.start('검수 참가자',{origins:'ranch',talents:stand?'recovery':'steady',flaws:'slow',weapons:'sabre'});return r;}
function at(r,id,index=0){const e=D.events.find(e=>e.id===id);r.state.tick=Math.max(r.state.tick,(e.from-1)*8);waitForFollowup(r,id);r.state.mode='event';r.state.event=id;assert(r.chooseEvent(index),id+'/'+index);}
test('고유 스탠드 덱 전환은 해당 능력·전용 카드와 연결하며 이름·편성·능력치·보유 수량 보존',()=>{
 const r=make(true),g=r.state;assert(r.setStandIdentity('나의 이름','계속 달린다.').ok);const stats={...g.ch.stats},cash=g.ch.money,side=g.ch.side.length,oldItem=D.stands.types[g.stand.type].item;assert(r.transform('time'));assert.equal(g.stand.type,'time');assert.equal(g.stand.name,'나의 이름');assert.equal(g.stand.line,'계속 달린다.');assert.equal(g.stand.level,0);assert.equal(g.stand.uses,0);assert(!g.items.includes(oldItem));assert(g.items.includes(D.stands.types.time.item));assert.deepEqual(g.ch.stats,stats);assert.equal(g.ch.money,cash+4*D.rules.cardCash);assert.equal(g.ch.side.length,side);assert.deepEqual(g.ch.deck,D.starts.find(o=>o.id==='time').deck);assert(g.ch.side.every(id=>D.cards[id].stand==='time'));
});
test('모든 고유 스탠드 계열로 전환해도 새 전용 카드가 일반 카드로 떨어지지 않음',()=>{
 for(const o of D.starts.filter(x=>x.stand)){const r=make(true);assert(r.transform(o.id));assert.equal(r.state.stand.type,o.stand,o.id);assert(r.state.ch.deck.some(id=>D.cards[id].stand===o.stand),o.id);assert(r.state.ch.deck.length>=4&&r.state.ch.deck.length<=12);assert([...r.state.ch.deck,...r.state.ch.side].every(id=>D.cards[id]));}
});
test('이미 잘못 전환한 저장도 능력과 전용 카드를 복구하고 반복 로드로 보상하지 않음',()=>{
 const r=make(true),g=r.state;g.origin='time';g.changed=true;g.ch.deck=D.starts.find(o=>o.id==='time').deck.map(id=>D.cards[id].standBase||D.cards[id].dedicatedFamily||id);const saved=JSON.parse(JSON.stringify(g));assert(r.restore(saved));assert.equal(r.state.stand.type,'time');assert(r.state.ch.deck.includes('sbr_dedicated_time_1_0'));assert.equal(r.state.ch.money,saved.ch.money);const once=JSON.parse(JSON.stringify(r.state));assert(r.restore(once));assert.deepEqual(r.state,once);
});
test('기존 전투의 스탠드 전환 복구는 전투·연출 종료까지 지연',()=>{
 const r=make(true);r.state.mode='encounter';r.state.encounter='rough_rider';assert(r.encounter('fight'));r.state.origin='time';r.state.changed=true;const saved=JSON.parse(JSON.stringify(r.state));assert(r.restore(saved));assert.equal(r.state.stand.type,'force');assert(r.flee());assert.equal(r.state.stand.type,'time');
});
test('샘 전투의 승리·패배·도주 전용 결말을 실제 정산과 결과 요약에 보존',()=>{
 for(const outcome of ['win','lose','escape']){const r=make();at(r,'spring_offer');at(r,'spring_barter',2);const g=r.state,C=g.combat,ctx=structuredClone(g.combatContext);C.P.hp=C.P.maxHp=C.E.hp=C.E.maxHp=10000;C.P.eva=C.E.eva=-300;C.ePlan=[];
  if(outcome==='escape')assert(r.flee());else if(outcome==='win'){C.P.atk=C.P.spd=300;C.P.dmgB=100000;C.P.light=10;C.P.hand=['sbr_basic_shoot'];C.E.hp=1;assert(r.round([0]));}else{C.P.hp=1;C.E.atk=C.E.spd=300;C.E.dmgB=100000;C.ePlan=[r.engine.D.cards.sbr_basic_shoot];assert(r.round([]));}
  const text=ctx[outcome==='win'?'winText':outcome==='lose'?'loseText':'fleeText'];assert.equal(g.battleResult.outcome,outcome);assert.equal(g.battleResult.story,text);assert(g.message.includes(text));assert(!g.items.includes('spring_gifts'));assert(Number.isSafeInteger(g.ch.money));
 }
});
test('유해·샘 미완료 이야기도 완주 엔딩에 남기고 이미 마친 결과는 바꾸지 않음',()=>{
 const r=make();at(r,'saint_palm');at(r,'spring_offer');r.state.tick=72;r.state.mode='finish-gate';assert(r.finishRace());for(const id of ['saint_path','spring_trial']){assert.equal(r.state.routeResults[id],'expired');assert(r.state.endingStories.some(s=>s.n===D.routes.find(x=>x.id===id).n&&s.result==='expired'));}
 const done=make();at(done,'spring_offer');at(done,'spring_barter');done.state.tick=72;done.state.mode='finish-gate';assert(done.finishRace());assert.equal(done.state.routeResults.spring_trial,'bartered');
});
test('구버전 출생 주사위 누락은 상세 화면에서 기록 없음으로 표시',()=>{
 const h=boot();h.ui.action('start');delete h.ui.race.state.birth.rolls;h.ui.action('birth-detail:origins');const html=h.elements.get('#sheet-body').innerHTML;assert(html.includes('주사위 기록 없음'));assert(!/undefined|NaN/.test(html));
});
test('손상된 저장은 현재 진행·적 데이터·개인 스탠드 이름을 바꾸지 않고 거절',()=>{
 const r=make(true);assert(r.setStandIdentity('보존할 이름','그대로 간다.').ok);const before=structuredClone(r.state),names=Object.values(r.engine.D.cards).map(c=>c.n),enemies=structuredClone(r.engine.D.enemies);
 const mutations=[s=>s.tick=-1,s=>s.tick=NaN,s=>s.mode='unknown',s=>s.ch.stats.maxHp=null,s=>s.ch.deck=['missing'],s=>s.event='missing',s=>s.birth.weapons='missing',s=>s.economy=5];
 for(const mutate of mutations){const bad=structuredClone(before);bad.mode='event';bad.event='camp_meal';mutate(bad);assert.equal(r.restore(bad),false);assert.deepEqual(r.state,before);assert.deepEqual(r.engine.D.enemies,enemies);assert.deepEqual(Object.values(r.engine.D.cards).map(c=>c.n),names);}
});
test('이어하기 실패 시 저장 원문을 덮어쓰거나 현재 화면을 진행시키지 않음',()=>{
 const h=boot();h.ui.action('start');const state=structuredClone(h.ui.race.state),html=h.text();const bad=JSON.stringify({...state,tick:-1});h.storage.set('sbr-race-v04',bad);h.ui.action('continue');assert.equal(h.storage.get('sbr-race-v04'),bad);assert.deepEqual(h.ui.race.state,state);assert.equal(h.text(),html);assert(h.elements.get('#toast').textContent.includes('기존 저장 기록은 유지'));
});
let effectDefinitions=0;
test('전체 사건 효과·조건의 아이템·카드·적·경로 참조와 숫자 유효',()=>{
 const fx=(x,label)=>{if(!x)return;effectDefinitions++;for(const id of [...(x.item?[x.item]:[]),...(x.items||[]),...(Array.isArray(x.consumeItem)?x.consumeItem:x.consumeItem?[x.consumeItem]:[])])assert(D.items[id],label+'/'+id);if(x.card)assert(D.cards[x.card]);if(x.route)assert(D.routes.some(r=>r.id===x.route.id));for(const k of ['money','hp','atk','spd','eva','maxHp','startBreath','startBleed'])if(x[k]!==undefined)assert(Number.isFinite(x[k]),label+'/'+k);if(x.combat&&typeof x.combat==='object'){if(x.combat.enemy)assert(D.enemies[x.combat.enemy]);for(const k of ['winFx','loseFx','fleeFx'])fx(x.combat[k],label+'/'+k);}};
 for(const e of D.events)for(const c of e.c){fx(c.ok.fx,e.id);fx(c.fail?.fx,e.id);}for(const [id,r]of Object.entries(D.relics))fx(r.fx,id);for(const r of D.routes)for(const id of r.events||[])assert(D.events.some(e=>e.id===id));
});
let eventRenders=0;
test('22개 출신 × 230개 사건 화면에 예외·undefined·NaN 없음',()=>{
 for(const o of D.starts){const r=make();r.start('화면검사',o.id);for(const e of D.events){const g=r.state;g.tick=(e.from-1)*8;g.mode='event';g.event=e.id;g.ch.money=1000;const html=journeyScreen('event',{data:D,race:r,esc:s=>String(s??''),btn:(a,l)=>l,speech:()=>''});assert(!/undefined|NaN/.test(html),o.id+'/'+e.id);eventRenders++;}}
});
let journeys=0,journeySteps=0;const covered=new Set();
test('22개 출신의 66회 연속 플레이·중간 저장 복원에서 자금·카드·진행 상태 유효',()=>{
 for(let seed=1;seed<=66;seed++){const rng=mulberry32(seed),r=createRace(D,R,{rng});r.start('연속검사',D.starts[(seed-1)%22].id);for(let step=0;step<1100;step++){journeySteps++;let g=r.state;assert(Number.isSafeInteger(g.ch.money)&&g.ch.money>=0);assert(g.ch.deck.length>=4&&g.ch.deck.length<=12);assert([...g.ch.deck,...g.ch.side].every(id=>D.cards[id]));assert(g.items.every(id=>D.items[id]));assert(['atk','spd','eva','maxHp'].every(k=>Number.isFinite(g.ch.stats[k])));if(['ending','retired'].includes(g.mode)){journeys++;break;}if(step%13===0){assert(r.restore(JSON.parse(JSON.stringify(g))));g=r.state;}
  if(g.mode==='travel')assert(r.travel(['ride','rest','town','explore'][Math.floor(rng()*4)]));
  else if(g.mode==='event'){const e=D.events.find(e=>e.id===g.event);covered.add(e.id);const choices=e.c.map((c,i)=>[c,i]).filter(([c])=>r.canChoice(c));assert(choices.length,e.id);if(e.shop){const rows=r.shop().filter(x=>!x.reason);if(rows.length&&rng()<.6)assert(r.buy(rows[Math.floor(rng()*rows.length)].id));if(r.canVisitTrader()&&rng()<.25)assert(r.visitTrader());else assert(r.chooseEvent(choices[Math.floor(rng()*choices.length)][1]));}else assert(r.chooseEvent(choices[Math.floor(rng()*choices.length)][1]));}
  else if(['omen','encounter'].includes(g.mode))assert(r.encounter(r.canAlly()&&rng()<.6?'ally':rng()<.55?'avoid':'fight'));
  else if(g.mode==='combat'){const C=g.combat;assert(C.round>12&&rng()<.5?r.flee():r.round(C.P.actionBlocked?[]:r.engine.autoPick(C)));}
  else if(g.mode==='reward')assert(r.reward(['cash','store','card'][Math.floor(rng()*3)]));
  else if(g.mode==='transition')assert(r.declineForm());
  else if(g.mode==='finish-gate')assert(g.tick<76&&rng()<.3?r.extendRace(4):r.finishRace());
  else assert.fail('Unexpected mode '+g.mode);assert(step<1099,'Journey did not terminate');
 }}assert.equal(journeys,66);
});
fs.writeFileSync('reports/generated/audit-checks.json',JSON.stringify({checks,effectDefinitions,eventRenders,journeys,journeySteps,eventCoverage:covered.size},null,2));console.log(JSON.stringify({auditChecks:checks.length,passed:checks.filter(x=>x.ok).length,effectDefinitions,eventRenders,journeys,journeySteps,eventCoverage:covered.size,failures:checks.filter(x=>!x.ok)},null,2));if(checks.some(x=>!x.ok))process.exitCode=1;
