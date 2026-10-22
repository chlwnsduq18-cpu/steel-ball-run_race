import {meetsCondition} from './progression.js';
export function bossLootPackage(D,g,id,{legacy=false}={}){
 const row=D.bossLoot[id];if(!row)return null;
 return !legacy&&row.variants.find(x=>meetsCondition(x.req,g,D))||row.base;
}
export function grantBossLoot(D,g,id,apply,{legacy=false}={}){
 g.lootClaims??={};if(g.lootClaims[id]||D.enemies[id]?.kind!=='boss'||!g.beaten.includes(id))return [];
 const reward=bossLootPackage(D,g,id,{legacy});if(!reward)return [];
 g.lootClaims[id]=legacy?'legacy_base':reward.id;const before=new Set(g.items),notes=apply(reward.fx);
 if(!legacy){g.lastLoot={enemy:id,branch:reward.id,items:g.items.filter(x=>!before.has(x)&&D.items[x]?.slot)};if(reward.form&&reward.form!==g.origin&&!g.changed)g.pendingLootForm=reward.form;}
 return notes;
}
export function initializeLoot(D,g,apply){
 if(D.canonItems&&!g.canonItemsVersion&&!g.combat&&!g.playback){
  if(g.beaten.includes('ringo')&&!g.items.includes('canon_ringo_watch')){
   apply({item:'canon_ringo_watch'});g.history.push('이전 링고 격파 기록의 추가 전리품 · 링고의 손목시계를 보관했습니다.');
  }
  g.canonItemsVersion=1;
 }
 g.lootClaims??={};g.itemNames??={};if(g.lootVersion===1||g.combat||g.playback)return;
 const notes=[];for(const id of g.beaten)notes.push(...grantBossLoot(D,g,id,apply,{legacy:true}));
 if(['rotation','integrated'].includes(g.routeResults.spiral)&&!g.items.includes('route_ironball'))notes.push(...apply({items:['route_ironball']}));
 g.lootVersion=1;if(notes.length){g.lootNotice='이전 보스·회전 루트의 누락 장비를 보관함에 보완했습니다. 기본 보상만 지급하며 기존 경험·돈·카드는 유지됩니다.';g.history.push(g.lootNotice+'\n'+notes.join(' · '));}
}
