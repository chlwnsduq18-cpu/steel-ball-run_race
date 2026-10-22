export function initializeHiddenRoute(D,g,rng=Math.random,{legacy=false}={}){
 if(g.hiddenRoute!==undefined)return;
 const pool=Object.values(D.hiddenRoutes||{}).filter(r=>r.origin===g.origin);
 if(!pool.length||g.achievementDeck||legacy&&(g.event?.startsWith('origin_'+g.origin+'_')||g.usedEvents?.some(id=>id.startsWith('origin_'+g.origin+'_'))||['ending','retired'].includes(g.mode))){g.hiddenRoute=null;return;}
 g.runId??=globalThis.crypto?.randomUUID?.()||Date.now().toString(36)+'-'+Math.random().toString(36).slice(2);
 const r=pool.length===1?pool[0]:pool[Math.min(pool.length-1,Math.floor(rng()*pool.length))];
 g.hiddenRoute={id:r.id,origin:g.origin,roster:r.bosses.map(b=>Array.isArray(b)?b[Math.min(b.length-1,Math.floor(rng()*b.length))]:b),step:0,nextTick:Math.max(6,g.tick+2),discovered:false,completed:false,claims:{},records:{}};
}
export function hiddenRouteEvent(D,g){
 const h=g.hiddenRoute;if(!h||h.completed||h.abandoned||g.expedition||g.tick<h.nextTick)return null;
 const enemy=h.step%2?h.roster[(h.step-1)/2]:null;
 // Canonical president encounter remains in stage six or later.
 if(enemy==='valentine'&&g.tick<40)return null;
 return D.events.find(e=>e.hiddenRouteId===h.id&&e.hiddenStep===h.step&&e.hiddenEnemy===enemy)||null;
}
export function hiddenEventAllowed(D,g,e){
 if(e.hiddenRouteScene)return hiddenRouteEvent(D,g)?.id===e.id;
 return !(g.hiddenRoute&&e.id.startsWith('origin_'+g.hiddenRoute.origin+'_'));
}
export function hiddenRecord(g,kind,key){
 const h=g.hiddenRoute;if(!h)return;
 const id=kind+':'+key;h.records[id]??={kind,key,route:h.id,tick:g.tick,runId:g.runId};
}
export function discoverHiddenRoute(D,g,e){
 if(!e.hiddenRouteScene||!g.hiddenRoute)return;
 g.hiddenRoute.discovered=true;hiddenRecord(g,'discovered',g.hiddenRoute.id);
}
export function applyHiddenRouteFx(D,g,fx){
 const h=g.hiddenRoute,notes=[];if(!h)return notes;
 if(fx.hiddenPrepare)h.preparation=fx.hiddenPrepare;
 if(fx.hiddenAbandon){h.abandoned=true;notes.push('이 사건에서 물러나 레이스를 계속합니다.');return notes;}
 if(fx.hiddenDelay||fx.hiddenRetry){h.nextTick=g.tick+(fx.hiddenDelay?3:4);return notes;}
 if(fx.hiddenWin){
  const id=fx.hiddenWin;if(h.step%2!==1||h.roster[(h.step-1)/2]!==id||!g.beaten.includes(id))return notes;
  const reward=D.hiddenBossCatalog[id];
  if(!h.claims[id]){
   h.claims[id]=true;hiddenRecord(g,'boss',id);
   if(!g.items.includes(reward.reward))g.items.push(reward.reward);
   if(![...g.ch.deck,...g.ch.side].includes(reward.card))g.ch.side.push(reward.card);
   g.ch.hp=g.ch.stats.maxHp;
   notes.push('확정 보상 · '+D.items[reward.reward].n+' — '+D.items[reward.reward].d,'전용 카드 보관 · '+D.cards[reward.card].n+' — '+D.cards[reward.card].d,'보스전 정비 · HP 전부 회복 · 덱에서 보상 카드 편성 가능');
  }
  h.step++;h.nextTick=g.tick+4;
 }
 if(fx.hiddenAdvance){
  if(h.step%2!==0||h.completed)return notes;
  if(h.step===6){h.completed=true;hiddenRecord(g,'completed',h.id);notes.push('전용 여정 완료 · 레이스는 계속됩니다.');}
  else{h.step++;h.nextTick=g.tick+4;}
 }
 return notes;
}
export function finishHiddenRoute(D,g){
 const h=g.hiddenRoute;if(!h?.discovered)return;
 const r=D.hiddenRoutes[h.id],names=h.roster.filter(id=>h.claims[id]).map(id=>D.enemies[id].n);
 g.endingStories.push({n:r.n,result:h.completed?'completed':'unfinished',text:(h.completed?r.ending:'끝내지 못한 여정의 흔적도 레이스에 남았다.')+(names.length?' 이긴 상대: '+names.join(' · ')+'.':'')});
 hiddenRecord(g,'finish',h.id);
 if(h.completed)hiddenRecord(g,'combination',h.id+'|'+(g.finishRank===1?'winner':'finisher')+'|'+(g.beaten.includes('otherdiego')?'otherdiego':g.beaten.includes('valentine')?'valentine':'race'));
}
export function validHiddenRoute(D,g){
 const h=g.hiddenRoute;if(h===undefined||h===null)return true;
 const r=D.hiddenRoutes?.[h.id];return !!r&&r.origin===h.origin&&Array.isArray(h.roster)&&h.roster.length===3&&h.roster.every((id,i)=>[].concat(r.bosses[i]).includes(id))&&Number.isInteger(h.step)&&h.step>=0&&h.step<=6&&Number.isSafeInteger(h.nextTick)&&h.nextTick>=0&&typeof h.discovered==='boolean'&&typeof h.completed==='boolean'&&(!h.completed||h.step===6)&&h.claims&&typeof h.claims==='object'&&!Array.isArray(h.claims)&&Object.keys(h.claims).every(id=>h.roster.includes(id)&&g.beaten.includes(id))&&h.records&&typeof h.records==='object'&&!Array.isArray(h.records);
}
export function mergeHiddenRecords(D,...sources){
 const out={};
 for(const source of sources)for(const value of Object.values(source||{})){
  if(!value||!D.hiddenRoutes[value.route]||!['discovered','boss','completed','finish','combination'].includes(value.kind)||typeof value.runId!=='string'||typeof value.key!=='string'||!Number.isSafeInteger(value.tick)||value.tick<0)continue;
  if(value.kind==='boss'&&!D.hiddenBossCatalog[value.key])continue;
  out[value.runId+':'+value.kind+':'+value.key]={kind:value.kind,key:value.key,route:value.route,tick:value.tick,runId:value.runId};
 }
 return out;
}
export function hiddenRecordsScreen(D,profile,esc){
 const records=Object.values(profile.journeys||{});if(!records.length)return '<p>히든 출생의 여정 · 아직 남긴 기록이 없습니다.</p>';
 const labels={discovered:'루트 발견',boss:'보스 격파',completed:'루트 완료',finish:'레이스 완주',combination:'완주 조합'};
 const rows={};for(const v of records){const id=v.kind+':'+v.key;rows[id]??={...v,runs:new Set()};rows[id].runs.add(v.runId);}
 return '<section><h3>히든 출생의 누적 여정</h3><p>새 레이스를 시작해도 남습니다. 같은 회차의 같은 기록은 한 번만 셉니다. 보상은 현재 회차에만 적용됩니다.</p>'+Object.values(rows).map(v=>'<div class="entry"><b>'+esc(labels[v.kind]+' · '+(v.kind==='boss'?D.enemies[v.key]?.n:D.hiddenRoutes[v.route].n))+'</b><p>'+esc(v.kind==='combination'?(v.key.includes('|winner|')?'우승':'완주')+' · '+(v.key.endsWith('|otherdiego')?'평행세계 디에고 격파':v.key.endsWith('|valentine')?'밸런타인 격파':'레이스 결말'):'기록')+' · '+v.runs.size+'회</p></div>').join('')+'</section>';
}
export const HIDDEN_MECHANICS={
 bomb:'폭발 준비 턴에는 공격 2장 이상을 사용하면 종료 시 피해 6. 방어 카드로 해제.',
 blind:'준비 턴에는 사각이 생겨 명중 -12. 방어 카드를 쓰면 사각을 읽어 상쇄.',
 stance:'준비 턴은 방어 자세: 받는 피해 100% 감소, 공격 없음. 다음 턴에 자세가 풀림.',
 exchange:'준비 턴은 교대 방어. 다음 턴의 협공 전에 기세와 방비를 준비.',
 bind:'구속 검격이 위축을 쌓음. 방어·정화로 누적을 줄이고 검격에 대응.',
 heavy:'준비 다음 턴에 강타. 방어 카드를 사용하면 강타 피해량을 줄임.',
 freeze:'냉동 준비 턴에는 재생을 잠시 억제. 방어 카드로 신체 접촉을 피하면 해제.',
 heat:'여러 번의 타격이 화상을 쌓음. 방어와 열을 흘리는 보상으로 화상 정리.',
 wind:'자세를 잡은 뒤 집중 강타. 준비 턴에는 회피가 높고 공격 턴에는 낮아짐.',
 blade:'연속 참격으로 취약 누적. 방어 자세를 섞어 피격 시의 취약 피해를 억제.',
 counter:'반격 자세에서 공격 2장 이상을 쓰면 종료 시 반격 피해 6. 방어하면 반격을 끊음.',
 hamon:'호흡을 모아 강타. 파문 전도 턴의 화상을 정리하면서 자신의 자원 유지.',
 absorb:'준비 턴에 다중 공격 카드를 쓰면 적이 HP 8 회복. 단발 또는 준비로 대응.',
 uv:'3턴마다 자외선 장치 조사. 방어 카드를 사용하면 조사 카드의 명중 -30.',
 trap:'함정 준비 턴에 공격 2장 이상을 쓰면 종료 시 피해 6. 방어로 함정 해제.',
 learn:'직전 턴에 사용한 공격 유형을 학습: 같은 유형만 반복하면 받는 피해 35% 감소. 다른 유형 또는 방어로 해제.',
 fencer:'방어 뒤 4연격. 방어 턴에 자원을 모아 빈틈이 열리는 다음 턴을 노림.',
 meteor:'3턴마다 운석 낙하. 방어 카드를 쓰면 운석 카드의 명중 -30.',
 cold:'로즈가 위축을 쌓아 기능을 떨어뜨림. 방어와 체온 회복 보상으로 해제.',
 acceleration:'매 턴 속도 +2, 최대 +10. 행동력·행동 횟수는 증가하지 않음.',
 gravity:'준비 턴의 무중력으로 명중 -12. 방어 카드로 자세를 바로잡으면 상쇄.',
 invisible:'준비 턴에는 사체가 본체를 가려 회피 +20. 방어로 흔적을 읽으면 해당 턴 상쇄.',
 seal:'3턴마다 손패의 기술 1장 일시 봉인. 방어 카드를 함께 쓰면 회수해 사용 가능. 다음 턴 자동 해제, 영구 삭제 없음.',
 age:'노화가 매 턴 위축 +1, 최대 6. 정비 보상과 방어로 누적을 억제.',
 armor:'준비 턴 얼음 장갑: 피해 65% 감소. 공격 턴은 감소 없음. 다중 타격은 준비 턴 장갑에 불리.',
 prediction:'준비 턴에 첫 공격 카드만 예지하여 명중 -60. 약한 공격으로 유도한 뒤 후속 공격 가능.',
 sound:'준비 턴에는 소리를 감지하여 회피 +20. 방어로 움직임을 감추면 상쇄. 시간정지만으로 거리 해소 불가.',
 void:'준비 턴에는 암흑 공간: 피해 90% 감소. 돌진을 위해 노출되는 다음 턴에 공격.',
 time:'전투당 한 번의 시간정지 이후 나이프 연격. 공격에 정지를 쓸지 방비를 남길지 판단.',
 barrier:'결계 준비 턴에 공격 2장 이상을 쓰면 종료 시 피해 6. 방어로 결계 해제.',
 jotaro:'HP 절반 이하에서 한 번만 정지에 대응해 자신의 행동 봉쇄를 해제. 정밀 방어 뒤 연격.',
 tracking:'금속 풍선이 취약을 누적. 방어와 추적 회피 보상으로 후속 피해를 억제.'
};
export function hiddenCombatPlan(D,g,C,foe,normal,cardTable=D.cards){
 if(!g.combatContext?.hiddenRoute)return normal;
 const info=D.hiddenBossCatalog[g.encounter];if(!info)return normal;
 C.hiddenMechanic=info.mechanic;C.hiddenNote=HIDDEN_MECHANICS[info.mechanic];
 C.hiddenPhase=C.round%3===1?'prepare':'attack';
 C.hiddenNote='이번 턴: '+(C.hiddenPhase==='prepare'?'준비·방어':'공격')+' · '+C.hiddenNote;
 C.hiddenSeal=info.mechanic==='seal'&&C.hiddenPhase==='prepare'?C.P.hand.find(id=>D.cards[id].t!=='def'):null;
 if(C.hiddenSeal)C.hiddenNote+=' 이번 턴 봉인: '+D.cards[C.hiddenSeal].n;
 if(info.mechanic==='learn'&&C.hiddenLearn)C.hiddenNote+=' 학습 중: '+(C.hiddenLearn==='multi'?'다중 타격':'단발 공격');
 if(info.mechanic==='jotaro'&&!C.hiddenTimeAnswered&&C.E.hp<=C.E.maxHp*.5&&(C.E.actionBlocked||C.E.skipTurns>0)){C.E.actionBlocked=false;C.E.skipTurns=0;C.hiddenTimeAnswered=true;C.hiddenNote+=' 정지에 대한 1회 대응을 사용했습니다.';}
 if(C.E.actionBlocked)return [];
 const all=foe.deck.map(id=>cardTable[id]);
 const chosen=C.hiddenPhase==='prepare'?all.filter(c=>c.t!=='atk'):all.filter(c=>c.t==='atk');
 const cards=(chosen.length?chosen:all).filter(c=>!(C.E.usedOnce||[]).includes(c.sbrId));
 let budget=C.E.light;const out=[];for(const c of cards.slice(0,3))if(c.c<=budget){out.push(c);budget-=c.c;}
 return out.length?out:normal;
}
export function hiddenBeforeRound(C,pp,ep,L){
 const m=C.hiddenMechanic;if(!m)return {pp,ep};
 const P=C.P,E=C.E,prepare=C.hiddenPhase==='prepare',defended=pp.some(c=>c.t==='def'),attacks=pp.filter(c=>c.t==='atk');
 if(C.hiddenDeltas)for(const [side,key,n]of C.hiddenDeltas)C[side][key]-=n;
 C.hiddenDeltas=[];const add=(side,key,n)=>{C[side][key]=(C[side][key]||0)+n;C.hiddenDeltas.push([side,key,n]);};
 E.hiddenInvulnerable=prepare&&m==='stance'&&!E.actionBlocked;
 const say=s=>L('kw',s);
 if(m==='acceleration'){add('E','spd',Math.min(10,(C.round-1)*2));C.order=[P,E].sort((a,b)=>b.spd-a.spd);}
 if(m==='age')P.sink=Math.min(6,(P.sink||0)+1);
 if(prepare&&m==='stance'){add('E','dr',100);ep=[];}
 if(prepare&&m==='armor')add('E','dr',65);
 if(prepare&&m==='void')add('E','dr',90);
 if(prepare&&['sound','invisible','wind'].includes(m)&&!defended)add('E','eva',20);
 if(prepare&&['blind','gravity'].includes(m)&&!defended)add('P','atk',-12);
 if(m==='learn'){
  const types=attacks.map(c=>c.hits>1?'multi':'single');
  if(!defended&&types.length&&types.every(t=>t===C.hiddenLearn)){add('E','dr',35);say('アヌビス · 직전 공격 유형을 학습해 피해 35% 감소');}
  C.hiddenLearn=defended?null:types.at(-1)||null;
 }
 if(prepare&&m==='absorb'&&attacks.some(c=>c.hits>1)){E.hp=Math.min(E.maxHp,E.hp+8);say('산타나 · 다중 공격의 접촉을 흡수해 HP +8');}
 if(prepare&&m==='freeze'&&!defended){add('P','regen',-(P.regen||0));say('기화냉동법 · 이번 턴 자연 재생 억제');}
 if(prepare&&m==='prediction'){let used=false;pp=pp.map(c=>{if(c.t!=='atk'||used)return c;used=true;say('에피타프 · 첫 공격의 명중 -60');return {...c,hit:(c.hit||0)-60};});}
 if(['uv','meteor'].includes(m)&&C.round%3===0&&defended){ep=ep.map(c=>({...c,hit:(c.hit||0)-30}));say('낙하·조사 지점을 벗어났다 · 적 명중 -30');}
 if(m==='seal'&&C.hiddenSeal){if(defended)say('방어로 DISC를 회수했다 · 이번 턴 봉인 해제');else{pp=pp.filter(c=>c.sbrId!==C.hiddenSeal);say('화이트스네이크 · 기술 일시 봉인, 다음 턴 자동 해제');}}
 if(m==='jotaro'&&!C.hiddenTimeAnswered&&E.hp<=E.maxHp*.5&&(E.actionBlocked||E.skipTurns>0)){E.actionBlocked=false;E.skipTurns=0;C.hiddenTimeAnswered=true;say('스타 플래티나 · 정지된 시간에 한 번 대응했다');}
 C.hiddenTrap=prepare&&['bomb','counter','trap','barrier'].includes(m)&&!E.actionBlocked&&!defended&&attacks.length>=2;
 if(m==='heavy'&&defended&&!prepare)ep=ep.map(c=>({...c,b:(c.b||0)-4}));
 return {pp,ep};
}
export function hiddenAfterRound(C,L,push){
 if(C.hiddenTrap&&C.E.hp>0&&C.P.hp>0){const n=Math.min(6,C.P.hp);C.P.hp-=n;L('dmg','예고된 함정·반격 · HP -'+n);push({k:'buff',side:'E',card:{n:'예고된 함정·반격'}});}
}
