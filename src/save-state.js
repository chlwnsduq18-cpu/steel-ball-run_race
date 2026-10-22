import {validWeaponDice} from './weapon-dice.js';
import {validHiddenRoute} from './hidden-routes.js';
// Validate the core before installing a candidate. Missing optional legacy fields
// remain the responsibility of the existing migrations; damaged funds are repairable.
export function restorableRaceSave(D,s){
 const object=x=>!!x&&typeof x==='object'&&!Array.isArray(x);
 const ids=(x,table)=>Array.isArray(x)&&x.every(id=>typeof id==='string'&&(!table||table[id]));
 if(!object(s)||s.v!==1||!D.starts.some(o=>o.id===s.origin)||!Number.isSafeInteger(s.tick)||s.tick<0||!validHiddenRoute(D,s))return false;
 if(!['travel','event','omen','encounter','combat','reward','transition','finish-gate','ending','retired'].includes(s.mode))return false;
 if(typeof s.name!=='string'||!object(s.ch)||!object(s.ch.stats)||!['atk','spd','eva','maxHp'].every(k=>Number.isFinite(s.ch.stats[k]))||s.ch.stats.maxHp<=0||!Number.isFinite(s.ch.hp)||s.ch.hp<0)return false;
 for(const key of ['eventSeen','choiceLedger'])if(s[key]!==undefined&&(!object(s[key])||Object.values(s[key]).some(n=>!Number.isSafeInteger(n)||n<0)))return false;
 if(s.choiceMemory!==undefined&&(!object(s.choiceMemory)||Object.values(s.choiceMemory).some(m=>!object(m)||typeof m.value!=='string'||typeof m.source!=='string'||!Number.isSafeInteger(m.tick)||m.tick<0||typeof m.done!=='boolean')))return false;
 if(!ids(s.ch.deck,D.cards)||!s.ch.deck.length||s.ch.side!==undefined&&!ids(s.ch.side,D.cards))return false;
 for(const k of ['seen','beaten','allies','history','relics'])if(!ids(s[k]))return false;
 if(s.items!==undefined&&!ids(s.items,D.items)||s.stand&&(!D.stands.types[s.stand.type]||!Number.isInteger(s.stand.level)||!D.stands.types[s.stand.type].cards[s.stand.level]))return false;
 if(s.expedition!==undefined&&(!object(s.expedition)||s.expedition.id!=='saint'||!D.events.some(e=>e.expedition==='saint'&&e.id===s.expedition.step)||!Number.isSafeInteger(s.expedition.startedAt)||s.expedition.startedAt<0||s.expedition.startedAt>s.tick||!Number.isSafeInteger(s.expedition.actions)||s.expedition.actions<0))return false;
 if(s.hiddenEnding!==undefined&&(!D.hiddenEndings[s.hiddenEnding]||s.endingKind!=='hidden'||s.mode!=='ending'||!s.expedition))return false;
 if(s.mode==='event'&&D.events.find(e=>e.id===s.event)?.expedition&&!s.expedition)return false;
 if(s.birth&&(!object(s.birth)||['origins','talents','flaws','weapons'].some(k=>!D.birth.tables[k].some(x=>x.id===s.birth[k]))))return false;
 if(s.mode==='event'&&!D.events.some(e=>e.id===s.event)&&!D.removedEvents?.includes(s.event)||s.mode==='transition'&&!D.starts.some(o=>o.id===s.formOffer))return false;
 if(['omen','encounter'].includes(s.mode)&&!D.enemies[s.encounter]&&!s.spawned?.[s.encounter])return false;
 if(s.equipment&&(!object(s.equipment)||Object.values(s.equipment).some(id=>id!=null&&!D.items[id])))return false;
 if(s.mode==='combat'&&!s.combat||s.mode==='reward'&&!D.cards[s.offer])return false;
 if(s.mode==='reward'&&!s.achievementDeck&&D.starts.find(o=>o.id===s.origin)?.rewardPolicy!=='cash'&&!D.enemies[s.encounter]&&!s.spawned?.[s.encounter])return false;
 if(s.combat){const C=s.combat;if(!object(C)||!Number.isInteger(C.round)||C.round<1||!Array.isArray(C.order)||C.order.length!==2||C.order.some(x=>!['P','E'].includes(x?.uid)))return false;
  for(const side of ['P','E']){const X=C[side];if(!object(X)||!['hp','maxHp','atk','spd','eva'].every(k=>Number.isFinite(X[k]))||X.maxHp<=0||X.hp<0||!validWeaponDice(X.weaponDice))return false;}
  if(!ids(C.P.deck,D.cards)||!ids(C.P.hand,D.cards)||!D.enemies[s.encounter]&&!s.spawned?.[s.encounter])return false;
 }
 if(s.playback&&(!object(s.playback)||!Array.isArray(s.playback.events)||!s.playback.events.length||!object(s.playback.before)||!Number.isInteger(s.playback.cursor)||s.playback.cursor<0||s.playback.cursor>=s.playback.events.length||!['announce','roll','result'].includes(s.playback.phase)))return false;
 return true;
}
