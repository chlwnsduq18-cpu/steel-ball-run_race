// Exclusive technique rewards bypass generic-card cash conversion. Never auto-equip.
export function dedicatedCardId(D,g,cid){
 const c=D.cards[cid];if(!c?.stand)return cid;
 if(c.stand===g.stand?.type)return D.stands.types[c.stand].bundles?.[g.stand.level]?.[c.standSkill||0]||cid;
 const h=Object.values(D.deckGrowth||{}).find(h=>[h.type,h.legacyType].includes(c.stand)&&[h.type,h.legacyType].includes(g.stand?.type));
 if(h)return D.stands.types[g.stand.type].bundles[g.stand.level][c.standSkill];
 return c.standBase||cid;
}
export function grantDedicatedCards(D,g,key){
 const reward=D.dedicatedRewards[key];if(!reward)return [];
 g.dedicatedClaims??={};if(g.dedicatedClaims[key])return [];
 const allowed=reward.family==='origin'?!g.achievementDeck&&g.origin===reward.deck&&(reward.stage===1?g.ch.flags['story_'+reward.deck+'_1']||g.routeResults['origin_'+reward.deck]==='mastered':g.routeResults['origin_'+reward.deck]==='mastered'):g.deckGrowth?.deck===reward.deck&&g.deckGrowth.stage>=reward.stage;
 if(!allowed)return [];
 g.dedicatedClaims[key]=true;const notes=[];
 for(const raw of reward.cards){
  const id=dedicatedCardId(D,g,raw),c=D.cards[id];
  const same=cid=>{const other=D.cards[cid];return other?.stand&&c.stand?other.stand===c.stand&&other.standSkill===c.standSkill:(other?.dedicatedFamily||cid)===(c.dedicatedFamily||id);};
  if([...g.ch.deck,...g.ch.side].some(same))continue;
  g.ch.side.push(id);notes.push('전용 기술 보관 · '+c.n+' · 덱에서 직접 편성');
 }
 return notes;
}
export function initializeDedicatedRewards(D,g){
 if(g.combat||g.playback)return [];
 g.dedicatedClaims??={};const notes=[];
 for(const r of Object.values(D.dedicatedRewards||{})){
  const earned=r.family==='origin'&&!g.achievementDeck&&r.deck===g.origin&&(r.stage===1?g.ch.flags['story_'+r.deck+'_1']||g.routeResults['origin_'+r.deck]==='mastered':g.routeResults['origin_'+r.deck]==='mastered')||r.family==='achievement'&&g.deckGrowth?.deck===r.deck&&g.deckGrowth.stage>=r.stage;
  if(earned)notes.push(...grantDedicatedCards(D,g,r.id));
 }
 if(notes.length)g.history.push('전용 수련 보상 보완 · '+notes.join(' · '));return notes;
}
export function checkTechniqueTrial(C,objective){
 if(objective?.type!=='technique')return;
 const goal=objective.goal;C.techniqueProgress??=0;
 const actions=C.evs.filter(e=>e.card&&(e.att||e.side)==='P'&&goal.cards.includes(e.card.dedicatedFamily||e.card.sbrId));
 C.techniqueProgress+=goal.hit?actions.filter(e=>e.k==='atk'&&e.hit).length:new Set(actions.filter(e=>['buff','atk','def'].includes(e.k)).map(e=>e.step)).size;
 if(C.over!=='lose'&&C.techniqueProgress>=goal.uses)C.over='win';
 else if(!C.over&&C.round>=objective.rounds)C.over='lose';
}
