// Composition is specified per deck: copies shape the draw, events add techniques.
export function addDedicatedDeckData(D){
 D.dedicatedDecks={};D.dedicatedRewards={};
 const clone=(id,base,n,fx,d)=>{const c=structuredClone(D.cards[base]);for(const k of ['heal','shield','cleanseRand','passNext','turnStart','eva','kw','once','onceFamily'])delete c[k];D.cards[id]={...c,n,t:'atk',hits:1,dice:1,b:0,hit:5,...fx,d};return id;};
 const shell=clone('sbr_growth_pillar_shell','sbr_pillar_rest','외피를 뻗는 일격',{c:2,dice:2,hitHeal:2,hitShield:3},'1회 × 2d6 · 명중 +5 · 적중 시 HP +2 · 보호막 +3');
 const read=clone('sbr_growth_sword_read','sbr_sword_hold','흔들림 없는 검격',{c:2,dice:2,hit:15,rr:1},'1회 × 2d6 · 명중 +15 · 피해 재굴림');
 const mend=clone('sbr_growth_colony_mend','sbr_colony_mend','봉합하며 쏘다',{c:1,hitHeal:3},'1회 × 1d6 · 명중 +5 · 적중 시 HP +3');
 function nativeCard(type,base){
  const t=D.stands.types[type];t.bundles??=t.cards.map(id=>[id]);
  const skill=t.bundles[0].length,ids=[];
  for(let lv=0;lv<4;lv++){
   const id='sbr_dedicated_'+type+'_'+skill+'_'+lv,c=structuredClone(D.cards[base]);
   Object.assign(c,{stand:type,standSkill:skill,standLevel:lv,standBase:base,dedicatedFamily:base,dedicatedDeck:type,fixed:false,standSkillName:c.n,n:c.n+' · '+D.stands.tiers[lv]});
   if(c.t==='atk'){c.b=(c.b||0)+lv*2;if(lv)c.d+=' · 각 타격 피해 +'+c.b;}
   if(c.once)c.onceFamily=type+'_'+base;
   if(base==='sbr_time_stop'){c.c=lv>=2?2:3;c.d='상대 다음 2턴 행동 불가 · 전투당 한 번';}
   D.cards[id]=c;t.bundles[lv].push(id);ids.push(id);
  }
  return ids[0];
 }
 const stop=nativeCard('time','sbr_time_stop');
 const rows=[
  ['steel',[["sbr_steel_prepare",2],["sbr_steel_throw",3],["sbr_steel_guard",1],["sbr_steel_joint",1]],['sbr_steel_recall','sbr_steel_focus'],'기본 투척을 반복해 취약을 만들고 기세를 모아 강타',['sbr_steel_throw','sbr_steel_joint'],2],
  ['satellite',[["sbr_sat_ready",3],["sbr_sat_shot",3],["sbr_sat_flank",1],["sbr_sat_wave",1]],['sbr_sat_combo','sbr_sat_finish'],'위축을 누적하는 기본 사격과 드문 마무리',['sbr_sat_shot','sbr_sat_wave'],2],
  ['hamon',[["sbr_ham_breathe",2],["sbr_ham_punch",3],["sbr_ham_flow",1]],['sbr_ham_heal','sbr_ham_overdrive'],'짧은 타격으로 호흡을 유지한 뒤 회복·연타를 습득',['sbr_ham_breathe','sbr_ham_punch'],2],
  ['vampire',[["sbr_vamp_bite",4],["sbr_vamp_claw",3],["sbr_vamp_regen",1],["sbr_vamp_brace",1]],[null,'sbr_vamp_feast'],'흡혈을 자주 뽑아 회복과 출혈을 누적',['sbr_vamp_bite','sbr_vamp_claw'],3],
  ['pillar',[["sbr_pillar_shift",3],["sbr_pillar_strike",3],["sbr_pillar_slide",1],["sbr_pillar_combo",1]],[shell,'sbr_pillar_crush'],'반복 타격과 보호막으로 버티며 외피·강타를 습득',['sbr_pillar_shift','sbr_pillar_combo'],2],
  ['sword',[["sbr_sword_slash",3],["sbr_sword_observe",2],["sbr_sword_guard",1],["sbr_sword_yield",1]],[read,'sbr_sword_finish'],'하나의 참격 계열을 중복 편성해 학습·재굴림을 강화',['sbr_sword_slash','sbr_sword_yield'],2],
  ['thread',[["sbr_thread_unravel",2],["sbr_thread_bind",2],["sbr_thread_evade",1],["sbr_thread_join",1]],['sbr_thread_pull','sbr_thread_rush'],'취약과 보호막을 엮은 뒤 당기기·러시를 습득',['sbr_thread_bind','sbr_thread_unravel'],2],
  ['colony',[["sbr_colony_water",3],["sbr_colony_shot",3],["sbr_colony_split",1],["sbr_colony_restore",1]],[mend,'sbr_colony_barrage'],'수분 탈취와 생체탄을 반복하고 봉합·연사를 습득',['sbr_colony_water','sbr_colony_shot'],2],
  ['pistols',[["sbr_pistol_position",2],["sbr_pistol_shoot",3],["sbr_pistol_reload",2]],['sbr_pistol_bounce','sbr_pistol_volley'],'단발 유도 사격·재장전에서 도탄·집중 포화로 발전',['sbr_pistol_shoot','sbr_pistol_position'],2],
  ['time',[[stop,1],["sbr_time_prepare",2],["sbr_time_strike",2],["sbr_time_place",1]],['sbr_time_focus','sbr_time_finish'],'일회성 시간정지 뒤에도 다섯 장 이상에서 공격을 추첨',['sbr_time_stop'],1]
 ];
 for(const [id,entries,bases,purpose,trialCards,uses]of rows){
  const o=D.starts.find(o=>o.id===id),native=o.stand,baseType=native&&D.stands.types[native];
  const resolve=cid=>baseType&&cid===baseType.baseCard?baseType.cards[0]:cid;
  const start=entries.flatMap(([cid,n])=>Array(n).fill(resolve(cid)));
  for(const cid of new Set([...entries.map(x=>x[0]),...bases.filter(Boolean)])){
   D.cards[cid].dedicatedDeck=id;D.cards[cid].dedicatedFamily??=cid;
  }
  if(native)for(const cid of baseType.cards){D.cards[cid].dedicatedDeck=id;D.cards[cid].dedicatedFamily=baseType.baseCard;}
  const rewards=bases.map(cid=>cid?(native?nativeCard(native,cid):cid):null),h=D.hiddenGrowth[id],events=h.events.map(eid=>D.events.find(e=>e.id===eid));
  o.deck=start;
  D.dedicatedDecks[id]={id,n:o.n,purpose,start:start.slice(),rewards:[],family:'origin',finalSize:start.length+rewards.filter(Boolean).length};
  for(const [i,cid]of rewards.entries())if(cid){
   const stage=i?3:1,key='origin:'+id+':'+stage;
   D.dedicatedRewards[key]={id:key,deck:id,family:'origin',stage,cards:[cid]};D.dedicatedDecks[id].rewards.push(key);
   for(const c of events[stage-1].c)if(stage===1?!!c.ok.fx.flag:c.ok.fx.item===h.item)c.ok.fx.dedicatedCards=key;
  }
  // A common objective evaluator checks actual resolved actions, not survival alone.
  const trial=events[1],ctx=trial.c[0].ok.fx.combat;
  ctx.objective={type:'technique',rounds:5,goal:{cards:trialCards,uses,hit:id!=='time',label:(id==='time'?'시간정지 사용':trialCards.map(cid=>D.cards[cid].n).join(' / ')+' 적중')+' '+uses+'회'}};
  ctx.loseFx={flag:'story_'+id+'_retry',hp:-4};ctx.loseText='동작을 끝까지 잇지 못했다. 다른 공방에서 자세를 가다듬으면 다시 시도할 수 있다.';
  trial.once=false;trial.c[0].l=id==='time'?'멈춘 시간에 자신의 동작을 맞춘다':D.cards[trialCards[0]].n+'을 실전에서 이어 간다';
  trial.c[0].hint='실전 목표: '+ctx.objective.goal.label+' · 5턴 안에 목표 달성 또는 상대 격파';
  if(ctx.winFx.item)trial.c[0].hint+=' · 실전 통과: '+D.items[ctx.winFx.item].d;
  for(const e of events){e.guideTitle='전용 수련 안내';e.guide='전용 기술은 보관함으로 받아 직접 편성합니다. 기존 덱과 장착 순서는 유지됩니다. 실전에서는 안내된 기술을 사용하거나 상대를 쓰러뜨리십시오. 실패하면 이후 다시 도전할 수 있습니다.';}
 }
 // Achievement presets have their own copy ratios and locked advanced techniques.
 const extras={
  tusk:[['구멍에서 잇는 손톱탄',{c:2,hits:2,dice:1,hit:15,turnStart:{eva:8},kw:[['rupture',1,'t']]},'턴 시작 회피 +8 · 2회 공격 · 명중 +15 · 적중마다 취약 +1'],['무한 회전의 추격',{c:3,hits:2,dice:2,hit:15,spend:2,fixPer:2,kw:[['rupture',2,'t']]},'2회 × 2d6 · 명중 +15 · 기세 최대 2 소비·소비당 피해 +2 · 적중마다 취약 +2']],
  world:[['기름을 묻힌 사격',{c:2,hits:2,dice:1,hit:10,kw:[['burn',2,'t']]},'2회 공격 · 명중 +10 · 적중마다 화상 +2'],['정지 직후의 연속 타격',{c:3,hits:4,dice:1,hit:10,spend:3,fixPer:1},'4회 공격 · 명중 +10 · 기세 최대 3 소비·소비당 피해 +1']],
  d4c:[['차원의 틈을 잇는 총격',{c:2,hits:2,dice:1,hit:10,kw:[['rupture',1,'t']]},'2회 공격 · 명중 +10 · 적중마다 취약 +1'],['빛의 경계에서 반격',{c:2,hits:1,dice:3,hit:10,hitShield:5},'1회 × 3d6 · 명중 +10 · 적중 시 보호막 +5']]
 };
 for(const [id,rows]of Object.entries(extras)){
  const h=D.deckGrowth[id],t=D.stands.types[h.type],old=D.stands.types[h.legacyType];
  for(const [offset,[n,fx,desc]]of rows.entries())for(const type of [t,old])for(let lv=0;lv<4;lv++){
   const skill=5+offset,cid='sbr_'+type.id+'_'+skill+'_'+lv;
   D.cards[cid]={n:n+' · '+(type.stageNames?.[lv]||D.stands.tiers[lv]),c:2,t:'atk',hits:1,dice:1,b:lv,hit:5,...structuredClone(fx),stand:type.id,standSkill:skill,standSkillName:n,standLevel:lv,fixed:false,d:desc+(lv?' · 각 타격 피해 +'+lv:'')};type.bundles[lv].push(cid);
  }
  const layout=id==='tusk'?[[0,3],[1,1],[2,1],[4,1]]:id==='world'?[[0,2],[1,1],[2,2],[4,2]]:[[0,3],[2,1],[3,1],[4,2]];
  const start=layout.flatMap(([skill,n])=>Array(n).fill(t.bundles[0][skill]));
  D.achievementDecks[id].deck=start;t.unlockByEvent=true;
  const skills=id==='tusk'?[3,5,6]:id==='world'?[3,5,6]:[5,1,6];
  D.dedicatedDecks['achievement_'+id]={id,n:D.achievementDecks[id].n,purpose:D.achievementDecks[id].focus,start:start.slice(),family:'achievement',rewards:[],finalSize:start.length+3};
  skills.forEach((skill,i)=>{const key='achievement:'+id+':'+(i+1);D.dedicatedRewards[key]={id:key,deck:id,family:'achievement',stage:i+1,cards:[t.bundles[i+1][skill]]};D.dedicatedDecks['achievement_'+id].rewards.push(key);});
  for(const eid of h.events){const e=D.events.find(e=>e.id===eid);e.guide+=' 강화 단계에 맞는 전용 기술도 보관함으로 받습니다.';}
 }
}
