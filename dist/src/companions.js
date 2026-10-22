import {CFG} from './config.js';
export function companionJoinable(D,g,id,stage,meets){
 const c=D.companions?.[id];return !!c&&stage>=c.joinFrom&&meets(c.joinReq)&&!g.beaten.includes(id)&&!g.allies.includes(id)&&g.tick>=(g.companionRetryAt?.[id]||0);
}
export function companionJoinCheck(D,g,id){
 const check=D.companions[id]?.joinCheck||D.rules.companion.defaultCheck,bonus=g.ch.stats[check.s]||0;
 return {...check,bonus,chance:Math.min(100,Math.max(0,101-Math.ceil(check.dc-bonus)))};
}
export function companionProfile(D,id,stage){
 const c=D.companions?.[id];if(!c)return null;
 return {id,n:c.n,supports:c.supports.map(s=>{const variant=(s.variants||[]).filter(x=>x.from<=stage).at(-1);const row={...s,...variant};delete row.variants;return structuredClone(row);})};
}
export function companionCandidates(D,g){return [...new Set(g.allies||[])].filter(id=>D.companions?.[id]&&!g.beaten.includes(id)&&g.routeResults?.['ally_'+id]!=='parted');}
export function activeCompanionIds(D,g){
 const candidates=companionCandidates(D,g),id=Object.hasOwn(g,'companionId')?g.companionId:candidates[0];
 return candidates.includes(id)?[id]:[];
}
export function initializeCompanions(D,g){
 g.companionId=activeCompanionIds(D,g)[0]||null;g.companionJoinedAt??={};g.companionRetryAt??={};
 for(const id of g.allies)if(D.companions[id]&&!Number.isFinite(g.companionJoinedAt[id]))g.companionJoinedAt[id]=g.tick;
}
export function prepareCompanions(D,g,stage){
 return activeCompanionIds(D,g).filter(id=>id!==g.encounter).map(id=>companionProfile(D,id,stage)).filter(Boolean);
}
export function syncCombatCompanions(D,g,C,stage){
 const active=activeCompanionIds(D,g).filter(id=>id!==g.encounter);
 if(C.companionVersion!==2||!Array.isArray(C.companions)){C.companions=prepareCompanions(D,g,stage);C.companionVersion=2;}
 else C.companions=(C.companions||[]).filter(c=>active.includes(c.id)).slice(0,1);
}
const companionCap=(k,X)=>k==='hp'?X.maxHp:k==='charge'?X.chargeCap||40:k==='breath'?CFG.breath.cap:k==='shield'?CFG.shieldCap:k==='burn'?CFG.burn.max:k==='rupture'?CFG.rupture.max:k==='skipTurns'?9:k==='sink'?CFG.sink.cap:CFG.stackCap;
// Runs only in the real resolver. Events carry resolved effects for read-only replay.
export function resolveCompanionSupport(C,on,L,push,roll,D){
 if(C.P.hp<=0||C.E.hp<=0)return;
 C.companionUses??={};
 for(const ally of (C.companions||[]).slice(0,1))for(const s of ally.supports){
  if(C.P.hp<=0||C.E.hp<=0)return;
  if(!s.on.includes(on)||s.when?.hpBelow!=null&&C.P.hp/C.P.maxHp>s.when.hpBelow)continue;
  const key=ally.id+':'+s.id,state=C.companionUses[key]||{uses:0};
  if(state.attemptRound===C.round||state.lastRound!=null&&C.round-state.lastRound<s.cooldown)continue;
  const delta=[];
  for(const [side,fx]of Object.entries(s.fx||{})){const X=side==='self'?C.P:C.E;for(const[k,v]of Object.entries(fx)){
   const before=X[k]||0,next=Math.max(0,Math.min(companionCap(k,X),before+v));if(next!==before)delta.push({side,k,before,next});
  }}
  const floor=C.E.passive?.id==='lockledger'?1:0,raw=C.E.hiddenInvulnerable?0:s.damage||0,shield=Math.min(C.E.shield||0,raw),damage=Math.min(Math.max(0,C.E.hp-floor),raw-shield);
  if(!delta.length&&!damage&&!shield)continue;
  state.attemptRound=C.round;C.companionUses[key]=state;
  if(!(s.firstGuaranteed&&!state.uses)&&roll()>s.chance)continue;
  state.lastRound=C.round;state.uses++;
  const notes=[];if(raw){C.E.shield=Math.max(0,(C.E.shield||0)-shield);C.E.hp-=damage;notes.push('지원 피해 '+damage+(shield?' · 보호막 흡수 '+shield:''));}
  for(const x of delta){const X=x.side==='self'?C.P:C.E;X[x.k]=x.next;notes.push((x.side==='self'?'아군 ':'상대 ')+(D.keywords[x.k]?.n||'HP')+' '+(x.next>x.before?'+':'')+(x.next-x.before));}
  const text=ally.n+' · '+s.skill+' · '+notes.join(' · ');L('support',text);C.lastCompanionSupport={round:C.round,id:ally.id,skill:s.skill,text};
  const lines=s.lines||[],speech=lines.length?structuredClone(lines[(state.uses-1)%lines.length]):null;
  push({k:'support',companion:{id:ally.id,n:ally.n,skill:s.skill,speech},supportEffects:delta,damage,absorbed:shield});
 }
}
export function companionDescription(D,s){
 const timing=s.on.map(x=>({roundStart:'턴 시작',afterHit:'내 공격 적중 후',hurt:'내가 피해를 받은 뒤'}[x])).join(' / ');
 const parts=s.damage?['지원 피해 '+s.damage+' (보호막 적용)']:[];
 for(const[side,fx]of Object.entries(s.fx||{}))for(const[k,v]of Object.entries(fx))parts.push((side==='self'?'아군 ':'상대 ')+(D.keywords[k]?.n||'HP')+' '+(v>0?'+':'')+v);
 return timing+(s.when?.hpBelow!=null?' · 내 HP '+Math.round(s.when.hpBelow*100)+'% 이하':'')+' · '+(s.firstGuaranteed?'첫 조건 충족 시 확정, 이후 ':'')+s.chance+'% · 발동 후 '+s.cooldown+'턴 간격 · '+parts.join(' · ');
}
export function companionsScreen({data:D,race,esc,btn}){
 const g=race.state,active=activeCompanionIds(D,g),roster=(g?.allies||[]).map(id=>companionProfile(D,id,race.stage())).filter(Boolean);
 const editable=!g.playback&&['travel','event','omen','encounter','finish-gate'].includes(g.mode),candidates=companionCandidates(D,g);
 return '<p class="muted">한 번에 1명과 동행합니다. 동행 인물은 조건에 맞으면 자동으로 지원합니다. 내 카드·행동력·행동 순서를 사용하지 않으며 직접 지시할 수 없습니다.</p>'+roster.map(c=>'<article class="experience-row"><b>'+esc(c.n)+(active.includes(c.id)?' · 동행 중':'')+'</b>'+(active.includes(c.id)?c.supports.map(s=>'<p><b>'+esc(s.skill)+'</b><br>'+esc(companionDescription(D,s))+'</p>').join(''):'<p class="muted">각자의 길 · 자동 지원 종료</p>')+(editable&&btn&&candidates.includes(c.id)?btn('companion:'+(active.includes(c.id)?'none':c.id),active.includes(c.id)?'홀로 달린다':'이 인물과 동행한다','quiet'):'')+'</article>').join('')+(roster.length?'':'<p>현재 함께하는 인물이 없습니다.</p>');
}
