// Combat resolver tests establish required past victories before entering a gated fight.
// Route eligibility tests deliberately do not use this fixture.
export function prepareEncounter(r,id){
 const prior=id==='valentine'?'porkpie':id==='otherdiego'?'valentine':null;
 if(prior)for(const list of [r.state.beaten,r.state.ch.beaten])if(!list.includes(prior))list.push(prior);
}
