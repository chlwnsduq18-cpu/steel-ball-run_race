import {activeCompanionIds} from './companions.js';
import {initializeChoiceMemory,memoryCondition} from './choice-memory.js';
import {canAwakenStand,standDisplayName} from './stand.js';
export function meetsCondition(req,g,D){
 if(req==null)return true;if(Array.isArray(req))return req.every(x=>meetsCondition(x,g,D));
 if(typeof req==='object'){
  if(req.any)return req.any.some(x=>meetsCondition(x,g,D));if(req.all)return req.all.every(x=>meetsCondition(x,g,D));
  if(req.stand){const r=req.stand;return !!g.stand&&r.types.includes(g.stand.type)&&g.deckGrowth?.stage===r.growthStage&&(g.stand.uses||0)>=(r.minUses||0);}
  return false;
 }
 if(typeof req!=='string')return false;const at=req.indexOf(':'),kind=req.slice(0,at),id=req.slice(at+1),has=a=>id==='any'?a.length>0:id.split('|').some(x=>a.includes(x));
 if(kind==='flag')return !!g.ch.flags[id];if(kind==='noflag')return !g.ch.flags[id];if(kind==='beat')return has(g.beaten);if(kind==='unbeaten')return !has(g.beaten);if(kind==='relic')return has(g.relics);if(kind==='ally')return has(g.allies);if(kind==='item')return has(g.items||[]);if(kind==='noitem')return !(g.items||[]).includes(id);if(kind==='origin')return !g.achievementDeck&&g.origin===id;if(['talent','flaw','weapon'].includes(kind))return g.birth?.[{talent:'talents',flaw:'flaws',weapon:'weapons'}[kind]]===id;
 if(kind==='companion')return activeCompanionIds(D,g).includes(id);
 if(kind==='memory'||kind==='memoryAge')return memoryCondition(g,kind,id);
 if(kind==='stand')return id==='eligible'&&canAwakenStand(D,g);
 if(kind==='noroute')return !g.routeResults?.[id];if(kind==='route')return !!g.routeResults?.[id];if(kind==='count'){const m=id.match(/^([a-z_]+)(>=|<)(\d+)$/);if(!m)return false;const value=g.counters?.[m[1]]||0;return m[2]==='>='?value>=+m[3]:value<+m[3];}return false;
}
export function itemName(D,g,id){return g.itemNames?.[id]||D.items[id]?.n||id;}
export function itemEffects(D,g,id){
 const it=D.items[id];if(!it)return [];
 const effects=(it.levels?.[g.itemLevels[id]||0]||it.effects||[]).map(e=>({...e,fx:{...e.fx}})),level=g.economy?.tuning?.[id]||0;
 if(level&&it.tuning){let e=effects.find(e=>e.on===it.tuning.on&&e.to==='self');if(!e){e={on:it.tuning.on,fx:{},to:'self',limit:1};effects.push(e);}for(const[k,v]of Object.entries(it.tuning.fx))e.fx[k]=(e.fx[k]||0)+v*level;}
 return effects;
}
export function activeEffects(D,g){
 const rows=[];for(const id of g.relics.filter(id=>D.relics[id]?.sourceEnemy))for(const e of D.relics[id]?.effects||[])rows.push({...e,source:D.relics[id].n});
 for(const id of g.items||[]){const it=D.items[id];if(!it||it.slot&&!Object.values(g.equipment||{}).includes(id))continue;
  for(const e of itemEffects(D,g,id))rows.push({...e,sourceId:id,source:it.stand&&id===D.stands.types[g.stand?.type]?.item?'스탠드 · '+standDisplayName(D,g.stand):itemName(D,g,id)});} return rows;
}
// Legacy battles keep their captured reward effects until they end. New battles
// can still update growth and tuning effects after each action as before.
export function combatEquipmentEffects(D,g,C){
 const rows=activeEffects(D,g).filter(e=>!e.uniqueVersion||C.uniqueEquipmentVersion===1);if(C.rewardEquipmentVersion===1)return rows;
 const reward=e=>!!D.items[e.sourceId]?.rewardGrade;
 return [...rows.filter(e=>!reward(e)),...(C.P.effects||[]).filter(reward)];
}
export function recordEquipmentUse(D,g,events){
 for(const id of Object.values(g.equipment)){const growth=D.items[id]?.growth;if(!growth?.usage)continue;
  const steps=new Set(events.filter(e=>e.k==='atk'&&e.att==='P'&&e.step>=0&&(growth.usage==='attack'||growth.usage==='hit'&&e.hit)).map(e=>e.step));
  g.counters[growth.counter]=(g.counters[growth.counter]||0)+steps.size;
 }
}
export function growItems(D,g){const notes=[];for(const id of g.items||[]){const it=D.items[id];if(!it?.growth)continue;const level=it.growth.at.filter(n=>(g.counters[it.growth.counter]||0)>=n).length;if(level>(g.itemLevels[id]||0)){g.itemLevels[id]=level;notes.push(`${it.n} · 성장 ${level}단계`);}}return notes;}
export function initializeProgression(g,D){
 initializeChoiceMemory(g);
 const hadInventory=Array.isArray(g.items);
 g.ch.sbr=true;
 g.items??=[];g.itemLevels??={};g.equipment??={};g.counters??={cards:0,wins:0};g.flagTicks??={};g.routeResults??={};g.eventTicks??={};g.eventPools??={};g.eventPoolStage??={};g.spawned??={};g.serial??=0;
 g.counters.cards??=0;g.counters.wins??=0;
 if(!g.combat&&!g.playback){
  if(g.basicWeaponVersion!==1){
   const refund=g.history.reduce((sum,t)=>sum+(t.includes('초소의 무기 정비\n')&&t.includes('비용 $35')?35:t.includes('기억 속의 공방에 맞춰 무기의 균형을 손보고')&&t.includes('비용 $8')?8:0),0);
   if(refund){g.ch.money=(g.ch.money??D.rules.startMoney)+refund;g.economyNotice='일반 무기의 자동 성장 정리 · 이전 숙련 비용 $'+refund+' 환불';g.history.push(g.economyNotice);}g.basicWeaponVersion=1;
  }
  for(const id of g.items)if(D.items[id]?.basic)delete g.itemLevels[id];
 }
 for(const [id,h]of Object.entries(D.hiddenGrowth||{}))if(h.insight&&g.ch.flags?.['story_'+id+'_master']&&!g.items.includes(h.insight))g.items.push(h.insight);
 const w=D.birth.tables.weapons.find(x=>x.id===g.birth?.weapons);if(w&&!g.items.includes(w.item)&&(!g.equipmentInitialized||!hadInventory)){g.items.push(w.item);if(!g.equipmentInitialized||!hadInventory)g.equipment.weapon=w.item;}
 if(!g.equipmentInitialized){
  const o=D.starts.find(x=>x.id===g.origin),talent=D.birth.tables.talents.find(x=>x.id===g.birth?.talents),flaw=D.birth.tables.flaws.find(x=>x.id===g.birth?.flaws);
  g.gearStats={weapon:w?.item||null,weaponStats:{...D.items[w?.item]?.stats},dmin:Math.max(1,o?.fx?.dmin||1,talent?.fx?.dmin||1,flaw?.fx?.dmin||1)};g.equipmentInitialized=true;
 }
 if(D.equipmentSchemaVersion&&!g.combat&&!g.playback&&g.equipmentSchemaVersion!==D.equipmentSchemaVersion){
  let moved=false;
  for(const[slot,id]of Object.entries(g.equipment)){const next=D.items[id]?.slot;if(next&&next!==slot){delete g.equipment[slot];if(!g.equipment[next])g.equipment[next]=id;moved=true;}}
  g.equipmentSchemaVersion=D.equipmentSchemaVersion;
  if(moved)g.history.push('외투·방호복을 몸통 장비 칸으로 정리했습니다. 보유 장비와 정비 기록은 유지됩니다.');
 }
 if(!g.combat&&!g.playback){
  // Reconcile stored numerical bonuses once; never alter an active battle or replay.
  syncWeaponGearStats(D,g,g.equipment.weapon);
  // Older versions applied weapon stats only. Track accessory/armor bonuses separately.
  for(const slot of ['armor','charm'])syncExtraGearStats(D,g,slot,g.equipment[slot]);
  const kept=g.relics.filter(id=>D.relics[id]?.sourceEnemy);if(kept.length!==g.relics.length){g.relics=kept;g.history.push('일반 적의 경험 기록을 정리했습니다. 기존 능력치는 유지되며, 앞으로 영구 경험은 특별한 대결에서만 획득합니다.');}
 }

}

function syncWeaponGearStats(D,g,id){
 g.gearStats??={weapon:null,dmin:1};
 const tracked=D.items[g.gearStats.weapon];
 const before=g.gearStats.weaponStats??tracked?.weaponStatsBefore040??tracked?.stats??{},after=D.items[id]?.stats||{};
 for(const k of new Set([...Object.keys(before),...Object.keys(after)]))if(k!=='dmin')g.ch.stats[k]=(g.ch.stats[k]||0)-(before[k]||0)+(after[k]||0);
 g.ch.stats.dmin=Math.max(g.gearStats.dmin||1,after.dmin||1);
 g.gearStats.weapon=id||null;g.gearStats.weaponStats={...after};
 g.ch.stats.maxHp=Math.max(20,g.ch.stats.maxHp);g.ch.hp=Math.min(g.ch.hp,g.ch.stats.maxHp);
}

function syncExtraGearStats(D,g,slot,id){
 const before=g.gearStats?.extraStats?.[slot]||{},after=D.items[id]?.stats||{};
 if(!Object.keys(before).length&&!Object.keys(after).length)return;
 for(const k of new Set([...Object.keys(before),...Object.keys(after)]))if(k!=='dmin')g.ch.stats[k]=(g.ch.stats[k]||0)-(before[k]||0)+(after[k]||0);
 g.gearStats??={weapon:g.equipment.weapon||null,dmin:1};g.gearStats.extraStats??={};g.gearStats.extraStats[slot]={...after};
 g.ch.stats.maxHp=Math.max(20,g.ch.stats.maxHp);g.ch.hp=Math.min(g.ch.hp,g.ch.stats.maxHp);
}

// Equipment bonuses are applied as differences; growth and tuning remain on the owned item.
export function changeEquipment(D,g,slot,id=null){
 const old=D.items[g.equipment[slot]],next=id?D.items[id]:null;
 if(slot==='weapon'){
  syncWeaponGearStats(D,g,id);
 }
 if(slot!=='weapon')syncExtraGearStats(D,g,slot,id);
 if(id)g.equipment[slot]=id;else delete g.equipment[slot];
 return old?.id!==next?.id;
}
