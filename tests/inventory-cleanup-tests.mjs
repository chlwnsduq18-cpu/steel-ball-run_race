import '../scripts/prepare-reports.mjs';
import fs from 'node:fs';import assert from 'node:assert/strict';
import {createRace} from '../src/race.js';import {mulberry32} from '../src/engine.js';
import {gearSuperior,gearDominated,shopSupplyIds,resalePrice} from '../src/economy.js';
import {boot} from './ui-test-harness.mjs';
const D=JSON.parse(fs.readFileSync('game-data.json')),R=JSON.parse(fs.readFileSync('runtime-base.json'));
const checks=[],test=(n,f)=>{try{f();checks.push({n,ok:true});}catch(e){checks.push({n,ok:false,error:e.stack});}};
function make(data=D,weapon='knife'){const r=createRace(data,R,{rng:mulberry32(39)});r.start('정리 검사',{origins:'ranch',talents:'steady',flaws:'slow',weapons:weapon});return r;}
function market(r,stage=7){const g=r.state;g.tick=(stage-1)*8;g.mode='event';g.event='supply_caravan';g.economy.market.tick=g.tick;g.ch.money=1000;return r;}
test('같이 해금된 상위품이 있으면 미소유·자금 부족이어도 하위 진열 숨김',()=>{
 const data=structuredClone(D);data.economy.stockByStage[7]=['weapon_rifle','market_winchester','coat','market_riding_coat','weapon_bowie'];const r=market(make(data)),g=r.state;g.ch.money=0;
 const ids=r.shop().map(x=>x.item);assert(!ids.includes('weapon_rifle'));assert(!ids.includes('coat'));assert(ids.includes('market_winchester'));assert(ids.includes('market_riding_coat'));assert(ids.includes('weapon_bowie'));
 g.ch.money=1000;assert(r.buy('gear_market_winchester'));assert(!r.shop().some(x=>x.item==='weapon_rifle'));assert(!r.buy('gear_weapon_rifle'));
});
test('아직 해금되지 않은 상위품 때문에 현재 상품을 숨기지 않음',()=>{
 const data=structuredClone(D);data.economy.stockByStage[1]=['weapon_rifle','market_winchester','coat','market_riding_coat','rein'];const r=market(make(data),1);assert(r.shop().some(x=>x.item==='coat'));assert(!r.shop().some(x=>x.item==='market_riding_coat'));
});
test('다른 기술·발동 조건·능력치 장단점·성장 가능성은 단순 등급으로 숨기지 않음',()=>{
 const r=make(),g=r.state;assert(!gearSuperior(D,g,D.items.rare_carbine,D.items.weapon_sabre));assert(!gearSuperior(D,g,D.items.field_kit,D.items.travel_boots));assert(!gearSuperior(D,g,D.items.rare_duel_blade,D.items.market_winchester));assert(!gearSuperior(D,g,D.items.trophy_gyro_ball,D.items.route_ironball));
 const a={...D.items.rein,id:'a',effects:[{on:'hit',to:'self',fx:{charge:4},limit:1}]},b={...D.items.rein,id:'b',effects:[{on:'hit',to:'self',fx:{charge:2}}]};assert(!gearSuperior(D,g,a,b));
});
test('회복·허브 물자는 상위품으로 교체 진열하고 소지 한도로 하위품 재등장 없음',()=>{
 assert(shopSupplyIds(D,1).includes('bandage'));const r=market(make(),4),g=r.state,ids=r.shop().map(x=>x.item);assert(!ids.includes('bandage'));assert(ids.includes('field_dressing'));assert(!ids.includes('herb_tea'));assert(ids.includes('chamomile'));
 g.economy.stock.chamomile=D.economy.supplies.chamomile.carry;assert(!r.shop().some(x=>x.item==='herb_tea'));assert(r.shop().find(x=>x.item==='chamomile').reason);
 g.economy.stock.bandage=1;g.ch.hp-=20;assert(r.useSupply('bandage'));g.economy.stock.field_dressing=1;g.ch.hp-=20;assert(r.useSupply('field_dressing'));
});
test('선택 판매는 총액·소유권·수량을 함께 반영하고 행동·편성·장착 보존',()=>{
 const r=market(make()),g=r.state;g.items.push('coat','rein');g.economy.stock.bandage=2;const eq={...g.equipment},deck=[...g.ch.deck],tick=g.tick,price=resalePrice(D.items.coat)+resalePrice(D.items.rein)+resalePrice(D.economy.supplies.bandage);
 assert(r.sellItems(['gear_coat','gear_rein','supply_bandage']));assert.equal(g.ch.money,1000+price);assert(!g.items.includes('coat'));assert.equal(g.economy.stock.bandage,1);assert.deepEqual(g.equipment,eq);assert.deepEqual(g.ch.deck,deck);assert.equal(g.tick,tick);
});
test('선택 판매의 중복·장착품·없는 품목·오래된 선택·금액 초과는 전체 취소',()=>{
 for(const ids of [[],['gear_coat','gear_coat'],['gear_coat','gear_weapon_knife'],['gear_coat','missing'],['gear_coat','supply_bandage']]){const r=market(make()),g=r.state;g.items.push('coat');const before=structuredClone(g);assert(!r.sellItems(ids));assert.deepEqual(g,before);}
 const r=market(make()),g=r.state;g.items.push('coat','rein');g.ch.money=Number.MAX_SAFE_INTEGER-25;const before=structuredClone(g);assert(!r.sellItems(['gear_coat','gear_rein']));assert.deepEqual(g,before);
});
test('하위 일반 장비 자동 선택은 보스·희귀·명명·성장·장착품을 보존',()=>{
 const r=market(make(D,'rifle')),g=r.state;assert(r.unequipItem('weapon_rifle'));g.items.push('market_winchester','trophy_ringo','rare_carbine','route_ironball','coat','market_riding_coat');g.itemNames.coat='남길 외투';
 const ids=r.inferiorSales().map(x=>x.item);assert(ids.includes('weapon_rifle'));for(const id of ['trophy_ringo','rare_carbine','route_ironball','coat'])assert(!ids.includes(id));
});
test('판매한 출발 무기는 반복 저장·복원에서 재생성되지 않음',()=>{
 const r=market(make(D,'sabre'));assert(r.unequipItem('weapon_sabre'));assert(r.sellItem('gear_weapon_sabre'));const cash=r.state.ch.money;for(let i=0;i<4;i++){assert(r.restore(JSON.parse(JSON.stringify(r.state))));assert(!r.state.items.includes('weapon_sabre'));assert(!r.state.equipment.weapon);assert.equal(r.state.ch.money,cash);assert(!r.sellItem('gear_weapon_sabre'));}
});
test('시계 보조 능력치는 장착·해제·구버전 복원에서 정확히 한 번 적용',()=>{
 const r=make(),g=r.state,base=g.ch.stats.eva;g.items.push('canon_ringo_watch');assert(r.equipItem('canon_ringo_watch'));assert.equal(g.ch.stats.eva,base+5);assert(r.restore(g));assert.equal(r.state.ch.stats.eva,base+5);assert(r.unequipItem('canon_ringo_watch'));assert.equal(r.state.ch.stats.eva,base);
 const old=structuredClone(r.state);old.equipment.charm='canon_ringo_watch';delete old.gearStats.extraStats;assert(r.restore(old));assert.equal(r.state.ch.stats.eva,base+5);assert(r.restore(r.state));assert.equal(r.state.ch.stats.eva,base+5);
});
test('장비창 실제 UI는 부위별 필터·하위 접기·여정 소지품·소모품 분리',()=>{
 const h=boot();h.ui.action('start');const r=h.ui.race,g=r.state;g.items.push('coat','market_riding_coat','pouch');g.economy.stock.bandage=1;g.items.push('sealed_letter');h.ui.action('equipment');h.ui.action('equipment-tab:armor');const html=h.elements.get('#sheet-body').innerHTML;
 assert.match(html,/data-slot="armor" >/);assert.match(html,/data-slot="charm" hidden/);assert.match(html,/class="inferior-items"/);assert.match(html,/여정 소지품/);assert.match(html,/class="inventory-section supply-items"/);assert(!/undefined|NaN|Infinity/.test(html));
});
test('상점 실제 UI에서 하위 장비 선택·합계 확인·선택 해제·판매·자동 저장',()=>{
 const h=boot();h.ui.action('start');const r=h.ui.race,g=r.state;market(r);g.items.push('coat','market_riding_coat');h.ui.render();h.ui.action('shop-tab:sell');h.ui.action('sale-inferior');let html=h.elements.get('#sheet-body').innerHTML;assert.match(html,/선택품 1개 판매 · \+\$20/);h.ui.action('sale-clear');assert.match(h.elements.get('#sheet-body').innerHTML,/선택품 0개/);h.ui.action('sale-inferior');h.ui.action('sale-confirm');assert(!g.items.includes('coat'));assert(g.items.includes('market_riding_coat'));assert.equal(g.ch.money,1020);assert(!JSON.parse(h.storage.get('sbr-race-v04')).items.includes('coat'));
});
test('상점 장비창에서 바로 판매해도 위치와 판매 결과·소유권이 갱신',()=>{
 const h=boot();h.ui.action('start');const r=h.ui.race,g=r.state;market(r);g.items.push('pouch');h.ui.render();h.ui.action('equipment');assert.match(h.elements.get('#sheet-body').innerHTML,/inventory-sell:gear_pouch/);h.ui.action('inventory-sell:gear_pouch');assert(!g.items.includes('pouch'));assert.equal(g.ch.money,1015);assert.equal(h.elements.get('#sheet-title').textContent,'장비');
});
fs.writeFileSync('reports/generated/inventory-cleanup-checks.json',JSON.stringify({checks},null,2));console.log(JSON.stringify({cleanupChecks:checks.length,passed:checks.filter(x=>x.ok).length,failures:checks.filter(x=>!x.ok)},null,2));if(checks.some(x=>!x.ok))process.exitCode=1;
