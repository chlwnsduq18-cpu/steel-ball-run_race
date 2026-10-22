import '../scripts/prepare-reports.mjs';
import fs from 'node:fs';
import assert from 'node:assert/strict';
import {createRace} from '../src/race.js';
import {validateEconomyCatalog,checkpointFunds,canSpendFunds,spendFunds,shopRows,rareShopRows} from '../src/economy.js';
import {shopScreen} from '../src/shop-ui.js';
import {boot} from './ui-test-harness.mjs';
const D=JSON.parse(fs.readFileSync('game-data.json')),R=JSON.parse(fs.readFileSync('runtime-base.json'));
const checks=[],test=(n,f)=>{try{f();checks.push({n,ok:true});}catch(e){checks.push({n,ok:false,error:e.stack});}};
const bad=[undefined,null,NaN,Infinity,-Infinity,-1,'60','',{},0.5,Number.MAX_SAFE_INTEGER+1];
function market(data=D,stage=3,money=1000){
 const r=createRace(data,R,{rng:()=>0});r.start('거래 검사',{origins:'ranch',talents:'steady',flaws:'slow',weapons:'sabre'});
 r.state.tick=(stage-1)*8;r.restore(r.state);const g=r.state;g.mode='event';g.event='supply_caravan';g.economy.market.tick=g.tick;g.ch.money=money;return r;
}
test('제보 재현 경로: 3구간 산탄총은 $75, 자금 부족 구매 거절, 정확히 한 번 결제',()=>{
 const r=market(D,3,1),g=r.state;const row=r.shop().find(x=>x.id==='gear_weapon_shotgun');assert.equal(row.price,75);assert(row.reason);
 const before=structuredClone(g);assert.equal(r.buy(row.id),false);assert.deepEqual(g,before);
 g.ch.money=75;const tick=g.tick,deck=g.ch.deck.slice(),side=g.ch.side.length;assert(r.buy(row.id));assert.equal(g.ch.money,0);assert.equal(g.counters.spent,75);
 assert.equal(g.tick,tick);assert.equal(g.equipment.weapon,'weapon_shotgun');assert.deepEqual(g.ch.deck,deck);assert.equal(g.ch.side.length,side+1);
 const paid=structuredClone(g);assert(!r.buy(row.id));assert(!r.buy('supply_bandage'));assert.deepEqual(g,paid);
});
test('전 구간 일반·희귀 진열, 소모품·서비스·정비의 이름과 가격 검증',()=>{
 assert(validateEconomyCatalog(D));
 for(let stage=1;stage<=9;stage++){
  const r=market(D,stage),g=r.state;g.economy.market.rareStock=D.economy.market.rare.slice();
  for(const row of [...shopRows(D,g,stage),...rareShopRows(D,g,stage)]){assert.equal(typeof row.n,'string');assert(row.n.trim());assert(Number.isSafeInteger(row.price)&&row.price>0,row.id);}
  const esc=s=>String(s??''),btn=(a,l,c='',e='')=>`<button data-action="${a}" ${e}>${l}</button>`;
  for(const tab of ['supplies','gear','service'])assert(!/undefined|NaN|Infinity/.test(shopScreen({data:D,race:r,esc,btn,tab})));
  g.event='hidden_trader';assert(!/undefined|NaN|Infinity/.test(shopScreen({data:D,race:r,esc,btn})));
 }
});
test('일반·희귀 장비와 소모품·서비스의 잘못된 가격은 진열·구매 모두 차단',()=>{
 for(const price of [...bad,0])for(const kind of ['gear','rare','supply','service']){
  const data=structuredClone(D),r=market(data),g=r.state;
  const id=kind==='gear'?'weapon_shotgun':kind==='rare'?'rare_carbine':kind==='supply'?'bandage':'tack_fit';
  const it=kind==='supply'?data.economy.supplies[id]:kind==='service'?data.economy.services.find(x=>x.id===id):data.items[id];it.price=price;
  if(kind==='rare'){g.tick=24;g.economy.market.tick=g.tick;g.event='hidden_trader';g.economy.market.rareStock=[id];}
  const rowId=kind+'_'+id,before=structuredClone(g);assert(!r.shop().some(x=>x.id===rowId));assert(!r.buy(rowId));assert.deepEqual(g,before);
 }
});
test('상품명·장비 참조·기술 카드가 누락되어도 undefined 상품 생성이나 예외 없이 거절',()=>{
 for(const mutate of [d=>delete d.items.weapon_shotgun,d=>delete d.items.weapon_shotgun.n,d=>d.items.weapon_shotgun.n='undefined',d=>d.items.weapon_shotgun.n='',d=>d.items.weapon_shotgun.slot='missing',d=>d.items.weapon_shotgun.weaponCard='missing']){
  const data=structuredClone(D);mutate(data);assert.throws(()=>validateEconomyCatalog(data),/Invalid shop catalog/);
  const r=market(data),before=structuredClone(r.state);assert(!r.shop().some(x=>x.id==='gear_weapon_shotgun'));assert(!r.buy('gear_weapon_shotgun'));assert.deepEqual(r.state,before);
 }
 const data=structuredClone(D),r=market(data);r.state.event='hidden_trader';r.state.economy.market.rareStock=['missing'];data.economy.market.rare.push('missing');assert.deepEqual(r.shop(),[]);assert(!r.buy('rare_missing'));
});
test('가격 누락과 비정상 가격은 데이터 빌드 검증에서 즉시 실패',()=>{
 for(const price of [...bad,0]){const data=structuredClone(D);data.items.weapon_shotgun.price=price;assert.throws(()=>validateEconomyCatalog(data),/weapon_shotgun/);}
 for(const list of ['gear','rare']){const data=structuredClone(D);(list==='gear'?data.economy.gear:data.economy.market.rare).push('missing');assert.throws(()=>validateEconomyCatalog(data),/missing/);}
 const data=structuredClone(D);data.events[0].c[0].cost=NaN;assert.throws(()=>validateEconomyCatalog(data),/cost/);
});
test('NaN·무한대·문자열·음수 자금에서 추가 구매와 사건 결제를 부작용 없이 차단',()=>{
 for(const money of bad){const r=market(D,3),g=r.state;g.ch.money=money;const before=structuredClone(g);for(const row of r.shop())assert(row.reason);assert(!r.buy('gear_weapon_shotgun'));assert(!r.buy('supply_bandage'));assert.deepEqual(g,before);}
 for(const spent of [null,NaN,Infinity,-1,'3',Number.MAX_SAFE_INTEGER]){const r=market(),g=r.state;g.counters.spent=spent;const before=structuredClone(g);assert(!r.buy('supply_bandage'));assert.deepEqual(g,before);}
 const r=market(),g=r.state;g.event='camp_meal';g.ch.money=NaN;const before=structuredClone(g);assert(!r.chooseEvent(0));assert.deepEqual(g,before);
});
test('결제 함수 자체도 가격·자금·누적 지출을 독립 검증하고 0원 사건은 허용',()=>{
 const r=market(),g=r.state;for(const cost of bad){const before=structuredClone(g);assert(!canSpendFunds(g,cost));assert(!spendFunds(g,cost));assert.deepEqual(g,before);}
 assert(spendFunds(g,0));assert.equal(g.ch.money,1000);assert.equal(g.counters.spent,0);assert(spendFunds(g,1000));assert.equal(g.ch.money,0);assert.equal(g.counters.spent,1000);assert(!spendFunds(g,1));
});
test('손상된 저장은 마지막 정상 금액 복구, 재접속·재저장에도 복구 중복 없음',()=>{
 const r=market(),g=r.state;g.ch.money=137;g.counters.spent=81;checkpointFunds(g);g.ch.money=NaN;g.counters.spent=NaN;
 const saved=JSON.parse(JSON.stringify(g)),items=g.items.slice(),deck=g.ch.deck.slice();assert.equal(saved.ch.money,null);
 assert(r.restore(saved));assert.equal(r.state.ch.money,137);assert.equal(r.state.counters.spent,81);assert.deepEqual(r.state.items,items);assert.deepEqual(r.state.ch.deck,deck);assert.equal(r.state.tick,g.tick);assert.match(r.state.fundsNotice,/마지막 정상/);
 checkpointFunds(r.state);const clean=JSON.parse(JSON.stringify(r.state));assert(r.restore(clean));assert.deepEqual(r.state,clean);
});
test('구버전 손상 저장은 $35와 명시적 안내 적용, 정상 금액 0은 보존',()=>{
 for(const money of bad){const r=market(),g=r.state;delete g.economy.lastValidMoney;g.ch.money=money;g.counters.spent=null;const saved=structuredClone(g);assert(r.restore(saved));assert.equal(r.state.ch.money,D.rules.startMoney);assert.equal(r.state.counters.spent,0);assert.match(r.state.fundsNotice,/이전 금액을 확인할 수 없습니다/);assert.deepEqual(r.state.items,saved.items);assert.deepEqual(r.state.ch.deck,saved.ch.deck);}
 for(const money of [0,1,9999]){const r=market(),g=r.state;g.ch.money=money;g.economy.lastValidMoney=300;const before=structuredClone(g);assert(r.restore(before));assert.deepEqual(r.state,before);assert.equal(r.state.ch.money,money);assert(!r.state.fundsNotice);}
});
test('화면 구매·자동 저장·손상 기록 이어하기와 안내 확인의 실제 UI 경로',()=>{
 const h=boot();h.ui.action('start');let r=h.ui.race,g=r.state;g.tick=16;g.mode='event';g.event='supply_caravan';g.economy.market.tick=16;g.ch.money=75;
 h.ui.render();h.ui.action('shop-tab:gear');assert.match(h.elements.get('#sheet-body').innerHTML,/산탄총/);assert(!/undefined|NaN/.test(h.elements.get('#sheet-body').innerHTML));h.ui.action('buy:gear_weapon_shotgun');assert.equal(g.ch.money,0);
 let saved=JSON.parse(h.storage.get('sbr-race-v04'));assert.equal(saved.economy.lastValidMoney,0);
 saved.ch.money=null;saved.counters.spent=null;h.storage.set('sbr-race-v04',JSON.stringify(saved));const copy=boot(h.storage);copy.ui.action('continue');g=copy.ui.race.state;assert.equal(g.ch.money,0);assert.match(copy.text(),/마지막 정상 저장 금액 \$0/);assert(!/NaN|undefined/.test(copy.text()));copy.ui.action('funds-notice');assert(!g.fundsNotice);assert(!copy.text().includes('마지막 정상 저장 금액'));
});
fs.writeFileSync('reports/generated/shop-integrity-checks.json',JSON.stringify({checks},null,2));console.log(JSON.stringify({shopIntegrityChecks:checks.length,passed:checks.filter(x=>x.ok).length,failures:checks.filter(x=>!x.ok)},null,2));if(checks.some(x=>!x.ok))process.exitCode=1;
