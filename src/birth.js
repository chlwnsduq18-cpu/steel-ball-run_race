import {birthStand,standPack} from './stand.js';
export const BIRTH_FIELDS=['origins','talents','flaws','weapons'];
export function birthEntry(data,birth,field){
 const x=data.birth.tables[field].find(x=>x.id===birth[field]);
 return field==='talents'&&x?.id==='recovery'&&(birth.version||1)<2?{...x,n:'빠른 회복',t:'전투 중에도 조금씩 기운을 되찾는다.',e:'턴마다 HP 회복 +1',stand:false,hidden:false}:x;
}
export function pickBirthEntry(data,field,roll){
 if(!Number.isInteger(roll)||roll<1||roll>100)throw Error('출생 주사위 범위 오류');
 const row=data.birth.tables[field]?.find(x=>roll>=x.min&&roll<=x.max);if(!row)throw Error('출생 표 누락');return row;
}
export function rollBirth(data,rng=Math.random){
 const birth={version:data.birth.version,rolls:{}};
 for(const field of BIRTH_FIELDS){const roll=1+Math.floor(rng()*100);birth.rolls[field]=roll;birth[field]=pickBirthEntry(data,field,roll).id;}
 return birth;
}
export function initialCharacter(data,birth){
 const o=data.starts.find(x=>x.id===birth.origins);if(!o)throw Error('출신 데이터 오류');
 const stats={maxHp:80,atk:o.stats.atk,eva:o.stats.eva,spd:o.stats.spd,check:0,startBleed:0,startBreath:0,enemyHp:0,dmin:1,dminUp:0,dr:0,regen:0,defUp:0,adv:0,extraD2:0,dmgB:0,burnHit:0,pdie:6,mindMax:0,egoSight:0,relicApt:0};
 const apply=fx=>{for(const[k,v]of Object.entries(fx||{})){if(!(k in stats))throw Error('지원하지 않는 출생 효과 '+k);if(k==='dmin')stats[k]=Math.max(stats[k],v);else stats[k]+=v;}};
 apply(o.fx);for(const field of ['talents','flaws','weapons']){const entry=data.birth.tables[field].find(x=>x.id===birth[field]);if(!entry)throw Error('출생 항목 누락 '+field);apply(entry.fx);}
 apply(data.playerSupport?.start);
 const w=data.birth.tables.weapons.find(x=>x.id===birth.weapons),preset=data.achievementDecks[birth.achievementDeck],deck=(preset?.deck||o.deck).slice(),side=[];
 if(!preset&&!o.hidden)if(deck.length<data.rules.deckMax)deck.push(w.card);else {side.push(deck.pop());deck.push(w.card);}
 const stand=birthStand(data,birth);if(stand&&!o.stand&&!preset)side.push(...standPack(data,{type:stand,level:0}));
 return {stats,hp:stats.maxHp,deck,side,origin:o,stand};
}
