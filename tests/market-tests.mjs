import '../scripts/prepare-reports.mjs';
import fs from 'node:fs';import assert from 'node:assert/strict';
import {createRace} from '../dist/src/race.js';import {mulberry32} from '../dist/src/engine.js';
import {activeEffects} from '../dist/src/progression.js';import {shopScreen} from '../dist/src/shop-ui.js';
import {normalizePreferences,applyTheme} from '../dist/src/preferences.js';
const D=JSON.parse(fs.readFileSync('dist/game-data.json','utf8')),R=JSON.parse(fs.readFileSync('dist/runtime-base.json','utf8')),legacy=JSON.parse(fs.readFileSync('fixtures/market-v025.json','utf8'));
const checks=[],test=(n,f)=>{try{f();checks.push({n,ok:true});}catch(e){checks.push({n,ok:false,error:e.stack});}};
const make=(stage=1,origin='ranch')=>{const r=createRace(D,R,{rng:mulberry32(37)});r.start('상점 검사',{origins:origin,talents:'steady',flaws:'weak_condition',weapons:'revolver'});r.state.tick=(stage-1)*8;r.restore(r.state);r.state.mode='event';r.state.event='supply_caravan';r.state.economy.market.tick=r.state.tick;r.state.ch.money=1000;return r;};
const esc=s=>String(s).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;');
const html=(r,tab)=>shopScreen({data:D,race:r,tab,esc,btn:(a,l,c='',attrs='')=>`<button data-action="${a}" class="${c}" ${attrs}>${l}</button>`});

test('9구간의 일반 장비는 각 5종이며 무기·몸통·보조와 적정 해금 구간을 갖춤',()=>{
 for(let stage=1;stage<=9;stage++){const ids=D.economy.stockByStage[stage];assert.equal(ids.length,5);assert.equal(new Set(ids).size,5);for(const slot of ['weapon','armor','charm'])assert(ids.some(id=>D.items[id].slot===slot));for(const id of ids)assert((D.items[id].from||1)<=stage);}
});
test('모든 출신·구간의 실제 진열은 현재 표만 사용·소유한 물건은 다시 팔지 않음',()=>{
 for(const o of D.starts)for(let stage=1;stage<=9;stage++){const r=make(stage,o.id),gear=r.shop().filter(x=>x.kind==='gear');assert(gear.length<=5);for(const row of gear){assert(D.economy.stockByStage[stage].includes(row.item));assert(!r.state.items.includes(row.item));}assert(gear.some(x=>D.items[x.item].slot==='weapon'));assert(gear.some(x=>D.items[x.item].slot==='armor'));}
});
test('물자·장비·정비 분류는 상품을 혼합하지 않고 해당 부위·가격·효과를 노출',()=>{
 const r=make(5),supplies=html(r,'supplies'),gear=html(r,'gear'),service=html(r,'service');
 assert(supplies.includes('supply_field_dressing'));assert(!supplies.includes('supply_bandage'));assert(!supplies.includes('data-item="gear_'));assert(!supplies.includes('data-item="tune"'));
 assert(gear.includes('data-item="gear_market_winchester"'));assert(gear.includes('slot-tag">무기'));assert(gear.includes('slot-tag">몸통'));assert(gear.includes('공격 +3'));assert(gear.includes('$'+D.items.market_winchester.price));
 assert(service.includes('data-item="tune"'));assert(!service.includes('data-item="gear_'));
 for(const h of [supplies,gear,service]){assert(h.includes('aria-pressed="true"'));assert(!h.includes('<br>'));assert(h.includes('shop-info'));}
});
test('기본 화면은 물자, 일반 장비 최대 5행·희귀 진열은 최대 2행',()=>{
 const r=make(9);assert(html(r).includes('data-action="shop-tab:supplies" class="active"'));assert((html(r,'gear').match(/class="shop-row"/g)||[]).length<=5);
 r.state.event='hidden_trader';r.state.economy.market.rareStock=['rare_carbine','rare_duster'];const h=html(r,'gear');assert.equal((h.match(/class="shop-row"/g)||[]).length,2);assert(h.includes('shop-tab:sell'));assert(h.includes('무기')&&h.includes('몸통'));
});
test('가격·상품명·현재 장비 이름은 안전하게 표시하고 사유가 있으면 구입 비활성',()=>{
 const r=make(4);r.state.items.push('route_ironball');assert(r.equipItem('route_ironball'));assert(r.setItemName('route_ironball','<나의 철구>').ok);r.state.ch.money=0;const h=html(r,'gear');assert(h.includes('&lt;나의 철구&gt;'));assert(!h.includes('<나의 철구>'));assert(h.includes('disabled'));assert(h.includes('자금 부족'));
});
test('무기·몸통·보조의 구입은 동시에 장착되고 시간과 덱을 바꾸지 않음',()=>{
 const r=make(5),g=r.state,deck=g.ch.deck.slice(),tick=g.tick;for(const id of ['market_winchester','padded_vest','steel_bracer'])assert(r.buy('gear_'+id));
 assert.equal(g.equipment.weapon,'market_winchester');assert.equal(g.equipment.armor,'padded_vest');assert.equal(g.equipment.charm,'steel_bracer');assert.equal(g.tick,tick);assert.deepEqual(g.ch.deck,deck);
 for(const id of ['padded_vest','steel_bracer'])assert(activeEffects(D,g).some(e=>e.source===D.items[id].n));
});
test('무기 교체·해제를 반복해도 기본 능력치·정비 보너스가 중복되지 않음',()=>{
 const r=make(5),g=r.state,before={...g.ch.stats};assert(r.buy('gear_market_winchester'));assert.equal(g.ch.stats.atk,before.atk-2+3);assert.equal(g.ch.stats.spd,before.spd+1);assert(r.buy('tune'));const tuning=g.economy.tuning.market_winchester;
 assert(r.equipItem('weapon_revolver'));assert.deepEqual(g.ch.stats,before);for(let i=0;i<4;i++){assert(r.equipItem('market_winchester'));assert(r.equipItem('weapon_revolver'));}assert.deepEqual(g.ch.stats,before);assert.equal(g.economy.tuning.market_winchester,tuning);
});
test('구간별 상품은 떠나거나 재접속해도 경계를 넘겨 우회 구매할 수 없음',()=>{
 const r=make(1),before=JSON.stringify(r.state);assert(!r.buy('gear_market_winchester'));assert.equal(JSON.stringify(r.state),before);r.restore(r.state);assert(!r.buy('gear_market_duel_revolver'));assert.equal(r.state.tick,0);
});
test('희귀 무기·몸통은 구입 시 보관만 하고 기존 장착을 유지',()=>{
 const r=make(5);r.state.event='hidden_trader';r.state.economy.market.rareStock=['rare_carbine','rare_duster'];const eq={...r.state.equipment};assert(r.buy('rare_rare_carbine'));assert(r.buy('rare_rare_duster'));assert.deepEqual(r.state.equipment,eq);assert(r.equipItem('rare_carbine'));assert(r.equipItem('rare_duster'));assert.equal(r.state.equipment.armor,'rare_duster');
});
test('기존 외투 장착은 몸통으로 한 번 이동·소유권·수치·정비·덱 유지',()=>{
 const r=make(),saved=legacy.outside;assert(r.restore(saved));assert.equal(r.state.equipment.armor,'coat');assert.equal(r.state.equipment.charm,undefined);for(const k of ['items','itemLevels'])assert.deepEqual(r.state[k],saved[k]);assert.deepEqual(r.state.ch,saved.ch);assert.deepEqual(r.state.economy.tuning,saved.economy.tuning);assert.equal(r.state.equipmentSchemaVersion,2);
 const once=JSON.stringify(r.state);r.restore(r.state);assert.equal(JSON.stringify(r.state),once);
});
test('진행 중인 이전 전투·연출의 장착과 판정은 보존·전투 후 슬롯 정리',()=>{
 for(const key of ['combat','playback']){const r=make(),saved=legacy[key];assert(r.restore(saved));assert.deepEqual(r.state.equipment,saved.equipment);assert.deepEqual(r.state.combat.P,saved.combat.P);if(key==='playback'){assert.deepEqual(r.state.playback,saved.playback);r.finishPlayback();}const C=r.state.combat;C.P.atk=300;C.P.dmgB=10000;C.P.light=5;C.P.actionBlocked=false;C.P.hp=C.P.maxHp=10000;C.P.hand=['sbr_basic_shoot'];C.E.hp=1;C.E.shield=0;C.E.eva=-300;C.ePlan=[];assert(r.round([0]));if(r.state.mode==='reward')assert(r.reward('cash'));assert.equal(r.state.equipment.armor,'coat');assert.equal(r.state.equipment.charm,undefined);}
});
test('기존 전투 연출 설정과 잘못된 테마 값은 호환되는 기본 설정으로 해석',()=>{
 assert.deepEqual(normalizePreferences({combat:'fast'}),{combat:'fast',theme:'dusk'});assert.deepEqual(normalizePreferences({combat:'off',theme:'bogus'}),{combat:'off',theme:'dusk'});assert.deepEqual(normalizePreferences(null),{combat:'normal',theme:'dusk'});const doc={documentElement:{dataset:{}}};assert.equal(applyTheme(doc,'paper'),'paper');assert.equal(doc.documentElement.dataset.theme,'paper');
});
test('세 테마의 본문·보조 텍스트·가격 색상은 배경 대비 4.5 이상',()=>{
 const css=fs.readFileSync('dist/style.css','utf8'),luminance=hex=>{const rgb=hex.match(/\w\w/g).map(x=>parseInt(x,16)/255).map(x=>x<=.04045?x/12.92:((x+.055)/1.055)**2.4);return rgb[0]*.2126+rgb[1]*.7152+rgb[2]*.0722;};
 for(const name of ['dusk','paper','ink']){const block=name==='dusk'?css.match(/:root\{([^}]+)\}/)[1]:css.match(new RegExp(':root\\[data-theme="'+name+'"\\]\\{([^}]+)\\}'))[1];const vars=Object.fromEntries(Array.from(block.matchAll(/--([a-z-]+):#([0-9a-f]{6})/g),m=>[m[1],m[2]]));for(const key of ['ink','muted','gold']){const a=luminance(vars[key]),b=luminance(vars.bg);assert((Math.max(a,b)+.05)/(Math.min(a,b)+.05)>=4.5,name+' '+key);}}
});

fs.writeFileSync('reports/generated/market-checks.json',JSON.stringify({checks},null,2));console.log(JSON.stringify({marketChecks:checks.length,passed:checks.filter(x=>x.ok).length,failures:checks.filter(x=>!x.ok)},null,2));if(checks.some(x=>!x.ok))process.exitCode=1;
