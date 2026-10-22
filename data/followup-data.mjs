export function addFollowupData(D){
 const triggers=req=>Array.isArray(req)?req.flatMap(triggers):typeof req==='object'&&req?triggers(req.all||req.any||[]):typeof req==='string'&&/^(flag|item|ally):/.test(req)?[req]:[];
 D.rules.followup={gap:3,grace:2};
 for(const e of D.events.filter(e=>!e.retired&&!e.shop)){
  const prerequisites=triggers(e.req);
  if(prerequisites.length||e.deckGrowth)e.followup={triggers:prerequisites};
 }
 // A promised reply can find the player along the race, rather than require a menu detour.
 for(const id of ['wagon_reply','letter_delivered','river_again','honesty_return','broker_shadow','warning_saved'])D.events.find(e=>e.id===id).where=['road','explore','camp','town'];
}
