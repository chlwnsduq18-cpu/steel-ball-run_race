export function addInterfaceData(D){
 for(const it of Object.values(D.items))it.category=it.stand?'stand':it.slot?'gear':(it.effects?.length||it.levels?.some(x=>x.length))?'experience':'quest';
 // Former weapon-use counters must not remain as paid or empty rewards.
 for(const e of D.events)for(const c of e.c)for(const r of [c.ok,c.fail].filter(Boolean))if(r.fx.count?.cards){
  delete r.fx.count.cards;if(!Object.keys(r.fx.count).length)delete r.fx.count;
  if(e.id==='camp_practice'){r.fx.eva=1;r.fx.hp=6;}
  else if(e.id==='camp_gear')r.fx.atk=1;
  else if(e.id==='wagon_reply'){r.fx.maxHp=2;r.t='장비가 몸에 맞게 정리되어 오랜 주행의 부담이 줄었다.';}
  else if(e.id==='weapon_tune'){r.fx.atk=1;r.fx.eva=1;r.fx.flag='weapon_refit_done';}
 }
 const refit=D.events.find(e=>e.id==='weapon_tune');Object.assign(refit,{t:'초소의 무기 교습',x:'초소의 교관이 무기를 쥐는 자세와 거리를 함께 살펴준다. 비용을 내면 자신의 동작을 교정받을 수 있다.',req:['noflag:weapon_refit_done'],once:true});refit.c[0].l='무기를 다루는 자세를 교정받는다';refit.c[0].ok.t='힘이 새는 자세와 불필요하게 가까웠던 거리를 바로잡았다.';refit.c[1].l='교습은 받지 않고 떠난다';refit.c[1].ok.t='기본 자세를 눈으로 살핀 뒤 다시 길을 나섰다.';
 const option=(l,t,nextTravel,fx={})=>({l,ok:{t,fx:{...fx,nextTravel}}});
 for(let stage=1;stage<=9;stage++)D.events.push({
  id:'junction_'+stage,t:'이정표 앞의 갈림길',x:'레이스 노선은 앞으로 이어진다. 옆길에는 낯선 흔적이 남아 있고, 가까운 곳에서 야영지의 불빛과 마을의 간판이 보인다.',where:['road','explore','camp','town'],from:stage,to:stage,fromTick:(stage-1)*8+1,priority:1,weight:1,once:true,
  c:[option('레이스 노선을 따라 달린다','고삐를 고쳐 쥐고 이정표가 가리키는 길로 나아갔다.','ride',{hp:3}),option('길옆의 흔적을 살핀다','바퀴 자국과 발자국이 갈라지는 쪽으로 말을 돌렸다.','explore'),option('야영지에서 몸을 쉰다','불가에 앉아 굳은 몸을 풀고 야영지의 이야기에 귀를 기울였다.','rest',{hp:6}),option('마을에서 필요한 것을 찾는다','마을로 들어가 사람들의 이야기와 쓸 만한 물건을 살폈다.','town')]
 });
}
