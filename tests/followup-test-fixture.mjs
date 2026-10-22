// Existing reward tests wait for the production scheduler before forcing their scene.
export function waitForFollowup(r,id){
 r.availableEvents();const q=r.state.followups?.[id];
 if(q)r.state.tick=Math.max(r.state.tick,q.readyAt,(r.state.lastFollowupTick??-Infinity)+3);
}
