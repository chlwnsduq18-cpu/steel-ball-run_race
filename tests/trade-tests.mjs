import '../scripts/prepare-reports.mjs';
import fs from 'node:fs';import assert from 'node:assert/strict';
import {createRace} from '../dist/src/race.js';import {mulberry32} from '../dist/src/engine.js';
import {resalePrice,inventorySaleRows,checkpointFunds} from '../dist/src/economy.js';
import {activeEffects} from '../dist/src/progression.js';import {initializeLoot} from '../dist/src/loot.js';
import {boot} from './ui-test-harness.mjs';
const D=JSON.parse(fs.readFileSync('dist/game-data.json')),R=JSON.parse(fs.readFileSync('dist/runtime-base.json'));
const checks=[],test=(n,f)=>{try{f();checks.push({n,ok:true});}catch(e){checks.push({n,ok:false,error:e.stack});}};
function make(origin='ranch',data=D){const r=createRace(data,R,{rng:mulberry32(38)});r.start('거래 검사',{origins:origin,talents:'steady',flaws:'slow',weapons:'sabre'});return r;}
function market(r,stage=4,black=false){const g=r.state;g.tick=(stage-1)*8;g.mode='event';g.event=black?'hidden_trader':'supply_caravan';g.economy.market.tick=g.tick;g.ch.money=1000;return r;}
function event(r,id,i=0){const e=D.events.find(e=>e.id===id);r.state.tick=(e.from-1)*8;r.state.mode='event';r.state.event=id;assert(r.meets(e.req));assert(r.chooseEvent(i));}
test('기존 상품 25% 인상·홀수 매입가 버림·서비스 및 자동 강화 비용 유지',()=>{
 for(const it of [...Object.values(D.items).filter(x=>x.basePrice),...Object.values(D.economy.supplies)]){assert.equal(it.price,Math.ceil(it.basePrice*1.25),it.n);assert.equal(resalePrice(it),Math.floor(it.price/2));}
 assert.equal(D.economy.supplies.cleanser.price,13);assert.equal(resalePrice(D.economy.supplies.cleanser),6);assert.equal(D.economy.clinic.base,8);assert.equal(D.economy.tuning.base,24);assert.equal(D.items.weapon_shotgun.price,75);
});
test('장착 장비는 차단하고 해제·판매하면 능력치·기술·정비·행동은 유지하며 중복 판매 거절',()=>{
 const r=market(make()),g=r.state;assert(r.buy('gear_weapon_bowie'));const cash=g.ch.money,deck=[...g.ch.deck],side=[...g.ch.side],tick=g.tick;
 assert(!r.sellItem('gear_weapon_bowie'));assert(r.unequipItem('weapon_bowie'));const stats={...g.ch.stats};g.economy.tuning.weapon_bowie=2;
 assert(r.sellItem('gear_weapon_bowie'));assert.equal(g.ch.money,cash+resalePrice(D.items.weapon_bowie));assert(!g.items.includes('weapon_bowie'));assert.deepEqual(g.ch.stats,stats);assert.deepEqual(g.ch.deck,deck);assert.deepEqual(g.ch.side,side);assert.equal(g.tick,tick);assert.equal(g.economy.tuning.weapon_bowie,2);
 const save=structuredClone(g);assert(!r.sellItem('gear_weapon_bowie'));assert.deepEqual(g,save);
});
test('쌓인 소모품은 한 개씩 차감하며 재구입·판매로 수익이 발생하지 않음',()=>{
 for(const origin of ['ranch','steel']){const r=market(make(origin)),g=r.state;for(const id of r.shop().filter(x=>x.kind==='supply').map(x=>x.item)){assert(r.buy('supply_'+id));assert(r.buy('supply_'+id));const money=g.ch.money;assert(r.sellItem('supply_'+id));assert.equal(g.economy.stock[id],1);assert.equal(g.ch.money,money+resalePrice(D.economy.supplies[id]));assert(r.sellItem('supply_'+id));const save=structuredClone(g);assert(!r.sellItem('supply_'+id));assert.deepEqual(g,save);}assert(g.ch.money<1000);}
});
test('일반·희귀 상점에서만 매입하고 전투·연출·지난 방문에서 판매 차단',()=>{
 const r=market(make()),g=r.state;g.items.push('weapon_knife');for(const mode of ['travel','combat','reward','ending']){g.mode=mode;const before=structuredClone(g);assert(!r.sellItem('gear_weapon_knife'));assert.deepEqual(g,before);}
 g.mode='event';g.playback={};assert(!r.sellItem('gear_weapon_knife'));delete g.playback;g.economy.market.tick--;assert(!r.sellItem('gear_weapon_knife'));g.economy.market.tick=g.tick;g.event='hidden_trader';assert(r.sellItem('gear_weapon_knife'));
});
test('유해·샘 재물·스탠드·경험·영구 처치·성장 장비·맨손은 판매 불가',()=>{
 const r=market(make()),g=r.state;for(const id of ['spring_gifts','saint_left_arm','stand_force','spring_wine','tailored_tack','field_medical_care','route_ironball','weapon_unarmed']){if(!g.items.includes(id))g.items.push(id);const before=structuredClone(g);assert(!r.sellItem('gear_'+id),id);assert.deepEqual(g,before);assert(!r.sellable().some(x=>x.item===id));}
});
test('잘못된 가격·수량·소지금과 정수 범위 초과는 판매 직전에 거절하고 상태 보존',()=>{
 const bad=[undefined,null,NaN,Infinity,-1,'20',0.5,Number.MAX_SAFE_INTEGER+1];
 for(const value of bad){const data=structuredClone(D),r=market(make('ranch',data)),g=r.state;g.items.push('weapon_knife');data.items.weapon_knife.price=value;let before=structuredClone(g);assert(!r.sellItem('gear_weapon_knife'));assert.deepEqual(g,before);g.economy.stock.bandage=value;before=structuredClone(g);assert(!r.sellItem('supply_bandage'));assert.deepEqual(g,before);}
 for(const money of [...bad,Number.MAX_SAFE_INTEGER]){const r=market(make()),g=r.state;g.items.push('weapon_knife');g.ch.money=money;const before=structuredClone(g);assert(!r.sellItem('gear_weapon_knife'));assert.deepEqual(g,before);}
});
test('새 물자 구간·효과·턴당 1개 제한·기존 저장 수량 유지',()=>{
 const r=market(make(),1),g=r.state;assert(r.shop().some(x=>x.item==='herb_tea'));assert(!r.shop().some(x=>x.item==='chamomile'));assert(r.buy('supply_herb_tea'));assert(!r.useSupply('herb_tea'));
 g.mode='encounter';g.encounter='rough_rider';assert(r.encounter('fight'));const C=g.combat;C.P.breath=0;C.P.charge=0;assert(r.useSupply('herb_tea'));assert.equal(C.P.breath,3);assert.equal(C.P.charge,3);g.economy.stock.chamomile=1;assert(!r.useSupply('chamomile'));assert(r.restore(g));assert.equal(r.state.economy.stock.chamomile,1);
});
test('좀비말 사건의 실제 보상·수동 장착·판매 후 사건 재발 방지',()=>{
 const r=make(),g=r.state;g.ch.hp-=20;event(r,'canon_zombie_mending');assert(g.items.includes('canon_zombie_thread'));assert(!activeEffects(D,g).some(e=>e.sourceId==='canon_zombie_thread'));assert(r.equipItem('canon_zombie_thread'));assert(activeEffects(D,g).some(e=>e.sourceId==='canon_zombie_thread'&&e.on==='hurt'&&e.fx.hp===5));assert(r.unequipItem('canon_zombie_thread'));market(r);assert(r.sellItem('gear_canon_zombie_thread'));assert(!r.availableEvents().some(e=>e.id==='canon_zombie_mending'));
});
test('카탈로그는 실제 가격을 결제하고 물건 보관·재구매 사건은 반복하지 않음',()=>{
 const r=make(),g=r.state;g.ch.money=200;event(r,'canon_bear_catalog');assert.equal(g.ch.money,110);assert(g.items.includes('canon_catalog_bear'));assert(!Object.values(g.equipment).includes('canon_catalog_bear'));assert(!D.economy.gear.includes('canon_catalog_bear'));
});
test('링고 모든 전리품 분기에 시계 포함·시간 역행 효과 없음·이전 격파 기록 한 번 보완',()=>{
 for(const p of [D.bossLoot.ringo.base,...D.bossLoot.ringo.variants])assert(p.fx.items.includes('canon_ringo_watch'));
 assert(!D.items.canon_ringo_watch.effects.some(e=>'skipTurns'in e.fx));const r=make();let g=r.state;delete g.canonItemsVersion;g.beaten.push('ringo');assert(r.restore(g));g=r.state;assert(g.items.includes('canon_ringo_watch'));market(r);assert(r.sellItem('gear_canon_ringo_watch'));assert(r.restore(g));assert(!r.state.items.includes('canon_ringo_watch'));
});
test('무기 재매입·카드 환전 차익 없음·NPC 직접 판매도 상점 기준가 일치',()=>{
 for(const id of [...D.economy.gear,...D.economy.market.rare]){const it=D.items[id];assert(it.price>resalePrice(it)+(it.weaponCard?D.rules.cardCash:0),id);}
 for(const id of ['race_gunsmith','race_norisuke','canon_bear_catalog'])for(const c of D.events.find(e=>e.id===id).c)if(c.cost&&c.ok.fx.item)assert.equal(c.cost,D.items[c.ok.fx.item].price);
});
test('실제 판매 UI·상품명·부위·수량·가격·자동 저장·복원으로 중복 매입하지 않음',()=>{
 const h=boot();h.ui.action('start');const r=h.ui.race,g=r.state;market(r);g.economy.stock.bandage=2;g.items.push('weapon_knife');h.ui.render();h.ui.action('shop-tab:sell');let html=h.elements.get('#sheet-body').innerHTML;assert.match(html,/응급 붕대/);assert.match(html,/보유 2개/);assert.match(html,/매입가 \$5/);assert.match(html,/무기/);assert(!/undefined|NaN|Infinity/.test(html));
 h.ui.action('sell-item:supply_bandage');assert.equal(g.ch.money,1005);assert.equal(g.economy.stock.bandage,1);html=h.elements.get('#sheet-body').innerHTML;assert.match(html,/보유 1개/);assert.match(html,/판매 목록/);
 const copy=boot(h.storage);copy.ui.action('continue');assert.equal(copy.ui.race.state.ch.money,1005);assert.equal(copy.ui.race.state.economy.stock.bandage,1);
});
fs.writeFileSync('reports/generated/trade-checks.json',JSON.stringify({checks},null,2));console.log(JSON.stringify({tradeChecks:checks.length,passed:checks.filter(x=>x.ok).length,failures:checks.filter(x=>!x.ok)},null,2));if(checks.some(x=>!x.ok))process.exitCode=1;
