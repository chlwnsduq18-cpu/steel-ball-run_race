import {weaponDiceDescription} from './weapon-dice.js';
import {itemName,itemEffects} from './progression.js';
import {canAdvanceDeck} from './stand.js';
// Reject coercion: undefined, null, strings and non-finite values are never currency.
export const isFundsAmount=n=>Number.isSafeInteger(n)&&n>=0;
export const isSalePrice=n=>isFundsAmount(n)&&n>0;
const saleText=s=>typeof s==='string'&&!!s.trim()&&!['undefined','null'].includes(s.trim());
const saleDefinitionValid=it=>!!it&&saleText(it.n)&&typeof it.d==='string'&&isSalePrice(it.price);
const saleGearValid=(D,it)=>saleDefinitionValid(it)&&!!D.equipmentSlots[it.slot]&&(!it.weaponCard||!!D.cards[it.weaponCard]);
export function canSpendFunds(g,price){
 const spent=g.counters?.spent===undefined?0:g.counters.spent;
 return isFundsAmount(price)&&isFundsAmount(g.ch.money)&&isFundsAmount(spent)&&Number.isSafeInteger(spent+price)&&g.ch.money>=price;
}
export function spendFunds(g,price){
 if(!canSpendFunds(g,price))return false;
 g.ch.money-=price;g.counters.spent=(g.counters.spent??0)+price;return true;
}
export function checkpointFunds(g){
 if(isFundsAmount(g.ch.money))g.economy.lastValidMoney=g.ch.money;
 const spent=g.counters?.spent===undefined?0:g.counters.spent;
 if(isFundsAmount(spent))g.economy.lastValidSpent=spent;
}
export function repairFunds(D,g){
 g.economy??={};g.counters??={};g.history??=[];
 if(!isFundsAmount(g.ch.money)){
  const known=isFundsAmount(g.economy.lastValidMoney);
  g.ch.money=known?g.economy.lastValidMoney:D.rules.startMoney;
  g.fundsNotice=known?'손상된 소지금을 마지막 정상 저장 금액 $'+g.ch.money+'로 복구했습니다.':
   '저장된 소지금이 손상되어 이전 금액을 확인할 수 없습니다. 시작 자금 $'+g.ch.money+'를 적용했습니다. 여정·카드·장비는 유지됩니다.';
  g.history.push(g.fundsNotice);
 }
 if(g.counters.spent!==undefined&&!isFundsAmount(g.counters.spent)){
  const known=isFundsAmount(g.economy.lastValidSpent);g.counters.spent=known?g.economy.lastValidSpent:0;
  g.history.push(known?'손상된 지출 집계를 마지막 정상 기록으로 복구했습니다.':'이전 지출을 확인할 수 없어 지출 집계를 0으로 초기화했습니다.');
 }
}
export function validateEconomyCatalog(D){
 const check=(ok,id)=>{if(!ok)throw Error('Invalid shop catalog: '+id);};
 const e=D.economy;
 for(const id of new Set([...e.gear,...Object.values(e.stockByStage||{}).flat(),...e.market.rare])){
  const it=D.items[id];check(saleGearValid(D,it),id);check(Number.isSafeInteger(it.from??1)&&(it.from??1)>=1&&(it.from??1)<=D.stages.length,id+' from');
 }
 for(const [id,it]of Object.entries(e.supplies))check(saleDefinitionValid(it)&&(it.fx||isSalePrice(it.cleanse))&&isSalePrice(it.carry)&&isSalePrice(it.perStage),id);
 for(const it of e.services||[])check(saleDefinitionValid(it)&&it.fx,it.id);
 check(isSalePrice(e.clinic.base)&&isFundsAmount(e.clinic.step),'clinic');
 check(isSalePrice(e.tuning.base)&&isFundsAmount(e.tuning.step),'tuning');
 for(const event of D.events)for(const c of event.c||[])if(c.cost!==undefined)check(isFundsAmount(c.cost),event.id+' cost');
 return true;
}
export function initializeEconomy(g){
 g.economy??={};const x=g.economy;x.training??={};x.tuning??={};x.stock??={};x.buys??={};x.supplyRound??=0;
}
export function resalePrice(it){return saleDefinitionValid(it)?Math.floor(it.price/2):0;}
export function inventorySaleRows(D,g){
 const rows=[];
 const add=(id,it,kind,count)=>{
  const price=resalePrice(it);if(!price||!Number.isSafeInteger(count)||count<1)return;
  const reason=kind==='gear'&&Object.values(g.equipment||{}).includes(id)?'장착 해제 후 판매할 수 있습니다.':
   !isFundsAmount(g.ch.money)||!Number.isSafeInteger(g.ch.money+price)?'자금 기록을 확인할 수 없습니다.':'';
  rows.push({id:kind+'_'+id,item:id,n:kind==='gear'?itemName(D,g,id):it.n,d:it.d,price,retail:it.price,count,kind,slot:it.slot,reason});
 };
 for(const id of new Set(g.items||[])){
  const it=D.items[id];if(!it?.slot||!D.equipmentSlots[it.slot]||it.tradable===false||it.growth||it.stand||['quest','experience'].includes(it.category))continue;
  add(id,it,'gear',1);
 }
 for(const[id,it]of Object.entries(D.economy.supplies))add(id,{...it,n:it.n},'supply',g.economy.stock[id]);
 return rows;
}
// Compare every stat and shared effect; price or rarity alone never implies superiority.
export function gearSuperior(D,g,better,worse,{owned=false,learned=false}={}){
 if(!better||!worse||better.id===worse.id||better.slot!==worse.slot||better.growth||worse.growth)return false;
 if(worse.weaponCard&&better.weaponCard!==worse.weaponCard&&!(learned&&[...g.ch.deck,...g.ch.side].includes(worse.weaponCard)))return false;
 const vector=it=>{const out={'weapon:die':it.weaponDice?.die||6,'weapon:add':it.weaponDice?.add||0,'weapon:min':it.weaponDice?.min||0};for(const[k,v]of Object.entries(it.stats||{}))out['stat:'+k]=v;
  for(const e of owned?itemEffects(D,g,it.id):it.effects||[])for(const[k,v]of Object.entries(e.fx||{}))out['fx:'+e.on+':'+e.to+':'+(e.limit||'all')+':'+k]=(out['fx:'+e.on+':'+e.to+':'+(e.limit||'all')+':'+k]||0)+v;
  return out;},a=vector(better),b=vector(worse),keys=new Set([...Object.keys(a),...Object.keys(b)]);
 let strict=false;for(const k of keys){const fallback=k==='stat:dmin'?1:0,av=a[k]??fallback,bv=b[k]??fallback;if(av<bv)return false;if(av>bv)strict=true;}return strict||(owned&&((better.price||0)<(worse.price||0)||((better.price||0)===(worse.price||0)&&better.id<worse.id)));
}
export function gearDominated(D,g,item){return (g.items||[]).some(id=>gearSuperior(D,g,D.items[id],item,{owned:true,learned:true}));}
export function inferiorSaleRows(D,g){
 const ordinary=new Set([...D.economy.gear,...D.birth.tables.weapons.filter(w=>!w.hidden).map(w=>w.item)]);
 return inventorySaleRows(D,g).filter(r=>r.kind==='gear'&&!r.reason&&ordinary.has(r.item)&&!D.items[r.item].trophy&&!D.items[r.item].rare&&!g.itemNames?.[r.item]&&gearDominated(D,g,D.items[r.item]));
}
export function shopGearIds(D,g,stage,ids){
 const unlocked=ids.filter(id=>saleGearValid(D,D.items[id])&&stage>=(D.items[id].from||1));
 return unlocked.filter(id=>!g.items.includes(id)&&!gearDominated(D,g,D.items[id])&&!unlocked.some(other=>gearSuperior(D,g,D.items[other],D.items[id])));
}
export function shopSupplyIds(D,stage){
 const entries=Object.entries(D.economy.supplies).filter(([,it])=>saleDefinitionValid(it)&&stage>=it.from);
 return entries.filter(([id,it])=>!entries.some(([other,b])=>{
  if(other===id||!!(it.outside||id==='bandage')!==!!(b.outside||other==='bandage'))return false;
  const a={...(b.fx||{}),cleanse:b.cleanse||0},w={...(it.fx||{}),cleanse:it.cleanse||0},keys=new Set([...Object.keys(a),...Object.keys(w)]);
  return [...keys].every(k=>(a[k]||0)>=(w[k]||0))&&[...keys].some(k=>(a[k]||0)>(w[k]||0));
 })).map(([id])=>id);
}
export function effectBenefits(D,g,fx={},locked=false){
 const out=[];
 for(const k of ['atk','spd','eva','maxHp'])if(fx[k]>0)out.push((D.stats[k]||'최대 HP')+' +'+fx[k]);
 if(fx.hp>0){const n=Math.max(0,Math.min(fx.hp,g.ch.stats.maxHp-g.ch.hp));if(n)out.push('HP +'+n);}
 if(fx.startBleed<0&&g.ch.stats.startBleed>0)out.push('시작 출혈 감소');
 if(fx.money>0)out.push('$'+fx.money);
 if(fx.dedicatedCards&&!g.dedicatedClaims?.[fx.dedicatedCards])out.push('전용 기술 보관');
 if(fx.advanceDeck&&canAdvanceDeck(D,g,fx.advanceDeck))out.push('전용 능력·성장 기록 강화');
 if(fx.card&&!locked)out.push('카드 보관: '+D.cards[fx.card].n);
 for(const id of [...(fx.item?[fx.item]:[]),...(fx.items||[])])if(!g.items.includes(id)&&!gearDominated(D,g,D.items[id]))out.push('소지품: '+D.items[id].n);
 const flags=Array.isArray(fx.flag)?fx.flag:fx.flag?[fx.flag]:[];if(flags.some(f=>!g.ch.flags[f]))out.push('후속 사건 진행');
 for(const[k,n]of Object.entries(fx.count||{}))if(n>0){const growth=(g.items||[]).map(id=>D.items[id]?.growth).filter(x=>x?.counter===k),cap=Math.max(0,...growth.flatMap(x=>x.at));const v=growth.length?Math.min(n,Math.max(0,cap-(g.counters[k]||0))):0;if(v)out.push((k==='cards'?'무기 성장 진척':'연습 기록')+' +'+v);}
 if(fx.route&&g.routeResults[fx.route.id]!==fx.route.result)out.push('이야기 진행');
 return out;
}
export function paidChoiceStatus(D,g,c,locked){
 if(c.cost!==undefined&&!isFundsAmount(c.cost))return {ok:false,reason:'비용 정보를 확인할 수 없습니다.',benefit:''};
 if(!c.cost)return {ok:true,benefit:''};
 if(locked&&c.cardPurchase)return {ok:false,reason:'전용 덱은 일반 카드를 구입하지 않습니다.',benefit:''};
 const benefits=effectBenefits(D,g,c.ok.fx,locked);if(c.passage)benefits.unshift('위험 판정 없이 통과');
 return benefits.length?{ok:true,benefit:benefits.join(' · ')}:{ok:false,reason:'현재 받을 수 있는 효과가 없습니다.',benefit:''};
}
export function shopRows(D,g,stage){
 const x=g.economy,e=D.economy,spent=id=>x.buys[stage+':'+id]||0,rows=[];
 const add=(id,n,price,d,reason='',extra={})=>{if(!saleDefinitionValid({n,price,d}))return;rows.push({id,n,price,d,reason:reason||(!isFundsAmount(g.ch.money)?'자금 기록을 확인할 수 없습니다.':!canSpendFunds(g,price)?'자금 부족':''),...extra});};
 const healPrice=e.clinic.base+spent('heal')*e.clinic.step;
 add('heal','상처 치료',healPrice,'HP +'+Math.min(e.clinic.hp,Math.max(0,g.ch.stats.maxHp-g.ch.hp)),g.ch.hp>=g.ch.stats.maxHp?'이미 최대 체력입니다.':spent('heal')>=e.clinic.perStage?'이 구간의 치료 한도에 도달했습니다.':'',{kind:'heal'});
 const weapon=D.items[g.equipment.weapon],lv=x.tuning[weapon?.id]||0,cap=Math.min(weapon?.tuning?.max||0,1+Math.floor((stage-1)/2));
 add('tune','무기 정비',e.tuning.base+e.tuning.step*lv,weapon?.tuning?itemName(D,g,weapon.id)+' +'+lv+' → +'+(lv+1)+' · '+Object.entries(weapon.tuning.fx).map(([k,v])=>(D.keywords[k]?.n||'HP')+' +'+v).join(' · ')+' (영구, 기존 무기 효과에 추가)':'장착한 무기가 필요합니다.',!weapon?'장착한 무기가 없습니다.':!weapon.tuning?'이 무기는 일반 정비 대상이 아닙니다.':lv>=cap?'다음 구간 또는 정비 한도를 확인하십시오.':'',{kind:'tune',item:weapon?.id});
 for(const service of e.services||[]){if(!saleDefinitionValid(service)||!service.fx||stage<service.from)continue;const done=service.once&&Object.keys(service.fx).includes('item')&&g.items.includes(service.fx.item);add('service_'+service.id,service.n,service.price,service.d,done?'이미 이용한 서비스입니다.':!effectBenefits(D,g,service.fx).length?'현재 받을 수 있는 효과가 없습니다.':'',{kind:'service',fx:service.fx});}
 for(const id of shopGearIds(D,g,stage,e.stockByStage?.[stage]||e.gear)){const it=D.items[id];if(!saleGearValid(D,it))continue;if(stage<(it.from||1)||g.items.includes(id)||gearDominated(D,g,it))continue;const stats=Object.entries(it.stats||{}).map(([k,v])=>k==='dmin'?'피해 주사위 최솟값 '+v:(D.stats[k]||'최대 HP')+' +'+v);add('gear_'+id,it.n,it.price,[...stats,...(it.weaponDice?[weaponDiceDescription(it.weaponDice)]:[]),...(!it.basic||it.effects?.length?[it.d]:[])].join(' · '),'',{kind:'gear',item:id});}
 for(const id of shopSupplyIds(D,stage)){const it=e.supplies[id];const n=x.stock[id]||0;add('supply_'+id,it.n,it.price,it.d+' · 보유 '+n+'/'+it.carry,n>=it.carry?'소지 한도입니다.':spent('supply_'+id)>=it.perStage?'이 구간의 구입 한도입니다.':'',{kind:'supply',item:id,stock:n});}
 return rows;
}
export function rareShopRows(D,g,stage){
 return shopGearIds(D,g,stage,(g.economy.market?.rareStock||[]).filter(id=>D.economy.market.rare.includes(id))).map(id=>{const it=D.items[id],stats=Object.entries(it.stats||{}).map(([k,v])=>(D.stats[k]||'최대 HP')+' +'+v);return {id:'rare_'+id,n:it.n,price:it.price,d:[...stats,...(it.weaponDice?[weaponDiceDescription(it.weaponDice)]:[]),it.d].join(' · '),reason:!isFundsAmount(g.ch.money)?'자금 기록을 확인할 수 없습니다.':!canSpendFunds(g,it.price)?'자금 부족':'',kind:'rare',item:id};});
}
export function supplyStatus(D,g,id){
 const it=D.economy.supplies[id];if(!it||(g.economy.stock[id]||0)<1)return {ok:false,reason:'보유하지 않은 보급품입니다.'};
 if(g.playback)return {ok:false,reason:'전투 연출 중에는 사용할 수 없습니다.'};
 const combat=g.mode==='combat',P=combat?g.combat.P:null;
 if(combat&&(P.actionBlocked||g.economy.supplyRound===g.combat.round))return {ok:false,reason:'이번 턴에는 보급품을 사용할 수 없습니다.'};
 if(!combat&&!['travel','event','omen','encounter'].includes(g.mode))return {ok:false,reason:'지금은 사용할 수 없습니다.'};
 if(!combat&&id!=='bandage'&&!it.outside)return {ok:false,reason:'전투 중 사용하는 보급품입니다.'};
 const X=combat?P:{hp:g.ch.hp,maxHp:g.ch.stats.maxHp},delta={};
 for(const[k,v]of Object.entries(it.fx||{})){const cap=k==='hp'?X.maxHp:k==='breath'?12:k==='shield'?150:X.chargeCap||40;const n=Math.max(0,Math.min(v,cap-(X[k]||0)));if(n)delta[k]=n;}
 if(it.cleanse)for(const k of ['bleed','burn','rupture','sink']){const n=Math.min(X[k]||0,it.cleanse);if(n)delta[k]=-n;}
 return Object.keys(delta).length?{ok:true,delta}:{ok:false,reason:'현재 받을 수 있는 효과가 없습니다.'};
}
