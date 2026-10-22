// Persist promised event eligibility separately from random encounters.
export function syncFollowups(D,g,meets){
 if(g.combat||g.playback)return;
 g.followups??={};const gap=D.rules.followup.gap;
 for(const e of D.events.filter(e=>e.followup)){
  const active=meets(e.req)&&(!e.once||!g.usedEvents.includes(e.id))&&(e.deckGrowth&&g.deckGrowth?.stage>0||e.followup.triggers.some(meets));
  if(!active){delete g.followups[e.id];continue;}
  const stamps=e.followup.triggers.filter(meets).flatMap(req=>{
   const at=req.indexOf(':'),kind=req.slice(0,at),ids=req.slice(at+1).split('|');
   return ids.map(id=>kind==='flag'?g.flagTicks[id]:kind==='ally'?g.companionJoinedAt?.[id]:['beat','relic'].includes(kind)?g.flagTicks['beat_'+id]:null).filter(Number.isFinite);
  });
  const openedAt=stamps.length?Math.max(...stamps):g.tick;
  const after=e.after&&!e.after.optional?g.flagTicks[e.after.flag]:null;
  const readyAt=Math.max(openedAt+gap,(e.from-1)*D.rules.turnsPerStage,e.fromTick||0,Number.isFinite(after)?after+e.after.ticks:0);
  if(g.followups[e.id]){if(e.companionEvent)g.followups[e.id].readyAt=Math.max(g.followups[e.id].readyAt,readyAt);continue;}
  g.followups[e.id]={openedAt,readyAt};
 }
}
export function followupReady(D,g,e){
 const q=g.followups?.[e.id];return !q||g.tick>=q.readyAt&&g.tick-(g.lastFollowupTick??-Infinity)>=D.rules.followup.gap;
}
export function promisedFollowup(D,g,candidates){
 const due=e=>g.followups[e.id].readyAt+D.rules.followup.grace;
 return candidates.filter(e=>g.followups[e.id]&&g.tick>=due(e)).sort((a,b)=>due(a)-due(b)||g.followups[a.id].openedAt-g.followups[b.id].openedAt||a.id.localeCompare(b.id))[0];
}
