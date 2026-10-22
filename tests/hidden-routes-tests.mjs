import '../scripts/prepare-reports.mjs';
import fs from 'node:fs';
import assert from 'node:assert/strict';
import {createRace} from '../src/race.js';
import {mulberry32} from '../src/engine.js';
import {hiddenRouteEvent,hiddenBeforeRound,hiddenCombatPlan,validHiddenRoute} from '../src/hidden-routes.js';
import {mergeAchievementProfile,normalizeAchievementProfile,achievementsScreen} from '../src/achievements.js';
import {boot} from './ui-test-harness.mjs';
const D=JSON.parse(fs.readFileSync('game-data.json')),R=JSON.parse(fs.readFileSync('runtime-base.json'));
const checks=[];function test(name,fn){try{fn();checks.push({name,ok:true});}catch(e){checks.push({name,ok:false,error:e.stack});}}
function make(origin,seed=27){const r=createRace(D,R,{rng:mulberry32(seed)});r.start('회차 검증',{origins:origin,talents:'steady',flaws:'slow',weapons:'revolver'});return r;}
function restore(r){const x=make(r.state.origin,999);assert(x.restore(structuredClone(r.state)));return x;}
function next(r){const g=r.state;g.tick=Math.max(g.tick,g.hiddenRoute.nextTick,g.hiddenRoute.step===5&&g.hiddenRoute.roster[2]==='valentine'?40:0);g.economy.market.nextTick=g.tick+10;assert(r.travel());if(D.events.find(e=>e.id===g.event)?.standAwakening){assert(r.chooseEvent(3));assert(r.travel());}assert.equal(g.mode,'event');assert.equal(g.event,hiddenRouteEvent(D,g).id);}
function win(r){const g=r.state,C=g.combat;C.P.atk=500;C.P.spd=500;C.P.dmgB=1000;C.P.hand=['sbr_basic_shoot'];C.P.light=20;C.E.hp=1;C.E.eva=-500;C.ePlan=[];C.hiddenPhase='attack';assert(r.round([0],{playback:true}));assert(r.finishPlayback());if(g.mode==='reward')assert(r.reward('cash'));assert.equal(g.mode,'travel');}
test('12 routes, valid rosters, current-run rewards, no new achievement deck unlocks',()=>{
 assert.equal(Object.keys(D.hiddenRoutes).length,12);
 for(const route of Object.values(D.hiddenRoutes))for(const id of route.bosses.flat()){assert(D.enemies[id]);const b=D.hiddenBossCatalog[id];assert(D.items[b.reward].effects.length);assert(D.cards[b.card]);assert(!D.achievements.some(a=>a.enemy===id&&id.startsWith('hr_')));}
});
test('all branches are reachable and fixed across restore; ordinary origins never enter',()=>{
 const found=new Set(),swords=new Set();for(let seed=1;seed<=80;seed++)for(const o of ['hamon','time','sword']){const r=make(o,seed),h=r.state.hiddenRoute;found.add(h.id);if(o==='sword')swords.add(h.roster.join(','));assert.deepEqual(restore(r).state.hiddenRoute,h);assert.equal(restore(r).state.runId,r.state.runId);}
 assert(found.has('hamon_mask')&&found.has('hamon_ruin')&&found.has('time_dio')&&found.has('time_joestar'));assert.equal(swords.size,8);assert.equal(make('ranch').state.hiddenRoute,null);
});
test('all twelve routes run through real event/combat/reward/ending APIs and records survive',()=>{
 const covered=new Set();for(let seed=1;seed<=20;seed++)for(const o of D.starts.filter(x=>x.hidden)){
  let r=make(o.id,seed);const routeId=r.state.hiddenRoute.id;if(covered.has(routeId))continue;covered.add(routeId);
  const originalDeck=r.state.ch.deck.slice();let profile={version:1,unlocked:{}};
  for(let step=0;step<7;step++){
   next(r);profile=mergeAchievementProfile(D,profile,r.state);assert(r.chooseEvent(0));
   if(step%2){assert.equal(r.state.mode,'combat');r=restore(r);const before=r.state.ch.side.length;win(r);assert(r.state.ch.side.length>before);assert.equal(r.state.ch.hp,r.state.ch.stats.maxHp);}
   assert.notEqual(r.state.mode,'ending');profile=mergeAchievementProfile(D,profile,r.state);r=restore(r);
  }
  const g=r.state;assert(g.hiddenRoute.completed);assert(g.tick<60);assert.deepEqual(g.ch.deck,originalDeck);assert.equal(Object.keys(g.hiddenRoute.claims).length,3);
  const count=Object.keys(profile.journeys).length;for(let i=0;i<3;i++)profile=mergeAchievementProfile(D,profile,restore(r).state);assert.equal(Object.keys(profile.journeys).length,count);
  g.tick=72;g.mode='finish-gate';assert(r.finishRace());assert(g.endingStories.some(x=>x.n===D.hiddenRoutes[routeId].n&&x.result==='completed'));profile=mergeAchievementProfile(D,profile,g);assert(Object.values(profile.journeys).some(x=>x.kind==='combination'));assert(Object.values(profile.journeys).some(x=>x.kind==='finish'));
  const newRun=make(o.id,seed+100);assert.equal(newRun.state.items.filter(id=>id.startsWith('hr_')).length,0);assert.equal(Object.keys(mergeAchievementProfile(D,profile,newRun.state).journeys).length,Object.keys(profile.journeys).length);
 }
 assert.equal(covered.size,12);
});
test('scheduler leaves three other actions; retry does not duplicate rewards or reroll',()=>{
 const r=make('time');next(r);r.chooseEvent(0);const h=r.state.hiddenRoute;assert.equal(hiddenRouteEvent(D,r.state),null);r.state.tick=h.nextTick-1;assert.equal(hiddenRouteEvent(D,r.state),null);next(r);r.chooseEvent(0);const id=r.state.encounter;assert(r.flee());assert.equal(h.step,1);assert(!h.claims[id]);r.state.encounterProtectionUntil=0;next(r);r.chooseEvent(0);win(r);assert.equal(h.step,2);assert(h.claims[id]);assert.equal(r.state.ch.side.filter(c=>c===D.hiddenBossCatalog[id].card).length,1);
});
test('canonical already defeated bosses are not fought again',()=>{
 const r=make('steel');next(r);r.chooseEvent(0);r.state.beaten.push('oye');r.state.ch.beaten.push('oye');next(r);assert(r.chooseEvent(0));assert.equal(r.state.hiddenRoute.step,2);assert(!r.state.combat);assert(r.state.hiddenRoute.claims.oye);
});
test('invalid roster cannot replace save, legacy active story remains intact',()=>{
 const r=make('time'),bad=structuredClone(r.state);bad.hiddenRoute.roster[0]='hr_kars';assert(!validHiddenRoute(D,bad));assert(!r.restore(bad));
 const old=structuredClone(r.state);delete old.hiddenRoute;delete old.runId;old.usedEvents.push('origin_time_1');assert(r.restore(old));assert.equal(r.state.hiddenRoute,null);assert.equal(r.state.runId,undefined);
});
test('legacy saved mechanics retain magenta invulnerability, seal release and capped acceleration',()=>{
 const r=make('satellite');next(r);r.chooseEvent(0);next(r);r.chooseEvent(0);const C=r.state.combat;delete r.enemy().hiddenDeckVersion;C.hiddenMechanic='stance';C.hiddenPhase='prepare';C.ePlan=[];C.P.atk=500;C.P.spd=500;C.P.dmgB=20;C.P.hand=['sbr_basic_shoot'];C.P.light=10;const hp=C.E.hp;assert(r.round([0]));assert.equal(C.E.hp,hp);assert.equal(C.round,2);C.P.hand=['sbr_basic_shoot'];C.E.eva=-500;assert(r.round([0]));assert(C.E.hp<hp);
 const mock={P:{uid:'P',hp:100,maxHp:100,regen:1,hand:['sbr_basic_shoot']},E:{uid:'E',hp:100,maxHp:100,spd:10,dr:0,usedOnce:[],light:5},round:1,hiddenMechanic:'seal',hiddenSeal:'sbr_basic_shoot',hiddenPhase:'prepare'};
 const card={...D.cards.sbr_basic_shoot,sbrId:'sbr_basic_shoot'};assert.equal(hiddenBeforeRound(mock,[card],[],()=>{}).pp.length,0);assert.equal(hiddenBeforeRound(mock,[{t:'def'},card],[],()=>{}).pp.length,2);
 mock.hiddenMechanic='acceleration';for(let i=1;i<=20;i++){mock.round=i;hiddenBeforeRound(mock,[],[],()=>{});assert(mock.E.spd<=20);}assert.equal(mock.E.spd,20);
});
test('negative cleansing never makes stacks negative and rewards activate in following battles',()=>{
 const r=make('hamon'),g=r.state;g.items.push('hr_esidisi_memory');g.tick=30;g.encounter='rough_rider';g.mode='encounter';assert(r.encounter('fight'));const C=g.combat;C.P.burn=0;C.P.hp=C.P.maxHp;C.ePlan=[];assert(r.round([]));assert(C.P.burn>=0);assert(C.log.some(x=>x.s.includes('열을 흘리는 호흡')));
});
test('actual offline UI renders route events, mechanics, records and final epilogue',()=>{
 const b=boot(),r=make('time');next(r);assert(b.ui.race.restore(r.state));b.ui.render();assert(b.text().includes(D.hiddenRoutes[r.state.hiddenRoute.id].n));r.chooseEvent(0);next(r);r.chooseEvent(0);assert(b.ui.race.restore(r.state));b.ui.render();assert(b.text().includes(D.hiddenBossCatalog[r.state.encounter].guide));
 let p=mergeAchievementProfile(D,{},r.state);const html=achievementsScreen({data:D,profile:p,starting:false,esc:s=>String(s),btn:()=>''});assert(html.includes('루트 발견'));
});
test('all boss decks resolve several real turns without nonfinite state',()=>{
 for(const [id,info]of Object.entries(D.hiddenBossCatalog)){
  const route=Object.values(D.hiddenRoutes).find(r=>r.bosses.flat().includes(id));const r=make(route.origin),g=r.state;g.hiddenRoute.id=route.id;g.hiddenRoute.roster=route.bosses.map(b=>[].concat(b)[0]);const index=route.bosses.findIndex(b=>[].concat(b).includes(id));g.hiddenRoute.roster[index]=id;g.hiddenRoute.step=index*2+1;g.hiddenRoute.nextTick=40;g.tick=40;
  if(id==='valentine'){g.beaten.push('wekapipo');g.ch.beaten.push('wekapipo');}next(r);assert(r.chooseEvent(0),id);assert.equal(g.mode,'combat',id);
  for(let turn=0;turn<8&&g.mode==='combat';turn++){const C=g.combat;C.P.hp=C.P.maxHp=2000;assert(r.round([]));for(const X of [C.P,C.E])for(const k of ['hp','maxHp','atk','spd','eva'])assert(Number.isFinite(X[k]),id+':'+k);}
 }
});
test('losing a route battle preserves the branch and gives no victory reward',()=>{
 const r=make('time');next(r);r.chooseEvent(0);next(r);r.chooseEvent(0);const g=r.state,id=g.encounter,C=g.combat;
 C.P.hp=1;C.P.eva=-500;C.E.atk=500;C.E.spd=500;C.E.dmgB=1000;C.order=[C.E,C.P];C.ePlan=[r.engine.D.cards.sbr_basic_shoot];
 assert(r.round([]));assert.equal(g.mode,'travel');assert(g.ch.hp>0);assert.equal(g.hiddenRoute.step,1);assert(!g.hiddenRoute.claims[id]);assert(!g.beaten.includes(id));assert.deepEqual(restore(r).state.hiddenRoute,g.hiddenRoute);
});
test('once-only stop and conditional boss rewards stay bounded over multiple turns',()=>{
 const r=make('time');r.state.hiddenRoute.id='time_dio';r.state.hiddenRoute.roster=D.hiddenRoutes.time_dio.bosses.slice();r.state.hiddenRoute.step=5;r.state.hiddenRoute.nextTick=30;r.state.tick=30;next(r);r.chooseEvent(0);const C=r.state.combat;C.P.hp=C.P.maxHp=10000;
 for(let i=0;i<16;i++){assert(r.round([]));assert(C.P.skipTurns<=1);}
 assert.equal(C.E.usedOnce.filter(id=>id==='hr_dio3_support').length,1);
});
test('localStorage retains journey records through a new run and reload',()=>{
 const b=boot(),r=make('time');next(r);r.chooseEvent(0);next(r);r.chooseEvent(0);win(r);assert(b.ui.race.restore(r.state));b.ui.render();
 const saved=JSON.parse(b.storage.get('sbr-race-achievements-v1'));assert(Object.values(saved.journeys).some(x=>x.kind==='boss'));
 b.ui.action('new-run');b.ui.action('start');const count=Object.keys(saved.journeys).length;assert.equal(Object.keys(JSON.parse(b.storage.get('sbr-race-achievements-v1')).journeys).length,count);
 const copy=boot(new Map(b.storage));copy.ui.action('achievements');assert(copy.elements.get('#sheet-body').innerHTML.includes('보스 격파'));
});
fs.writeFileSync('reports/generated/hidden-routes-checks.json',JSON.stringify({checks},null,2));console.log(JSON.stringify(checks,null,2));if(checks.some(x=>!x.ok))process.exitCode=1;
