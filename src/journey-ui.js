import {activeCompanionIds} from './companions.js';
import {battleResultScreen,visibleBattleResult} from './combat-results.js';
import {standIdentityFields} from './stand-ui.js';
export function eventChoiceHint(data,race,c){
 const fx=c.ok.fx,g=race.state,out=[];
 if(c.actionCost===0)out.push('행동 소모 없음');
 if(c.check)out.push(`${data.stats[c.check.s]||'운'} · 목표 ${c.check.dc} · 성공 ${race.successChance(c)}%`);
 if(c.cost)out.push(`비용 $${c.cost}`);
 if(fx.dedicatedCards)out.push('전용 기술 보관 · '+data.dedicatedRewards[fx.dedicatedCards].cards.map(id=>data.cards[id].standSkillName||data.cards[id].n).join(' · '));
 if(c.hint)out.push(c.hint);else{
  if(fx.combat)out.push(typeof fx.combat==='object'&&fx.combat.objective?'실전 시험':'전투 발생');
  for(const k of ['atk','spd','eva','maxHp'])if(fx[k])out.push((data.stats[k]||'최대 HP')+' '+(fx[k]>0?'+':'')+fx[k]);
  if(fx.hp)out.push(fx.hp>0?'HP +'+Math.max(0,Math.min(fx.hp,g.ch.stats.maxHp-g.ch.hp))+(g.ch.hp>=g.ch.stats.maxHp?' (최대 체력)':''):'HP '+fx.hp);
  if(fx.money)out.push('$'+(fx.money>0?'+':'')+fx.money);
  if(fx.startBreath)out.push('시작 호흡 +'+fx.startBreath);
  if(fx.card)out.push(race.lockedDeck()?'카드 보상 대신 $'+race.cardCash():'카드 보관 · '+race.cardName(fx.card));
  for(const id of [...(fx.item?[fx.item]:[]),...(fx.items||[])])out.push((data.items[id]?.slot?'장비 보관 · ':'획득 · ')+data.items[id].n);
  if(fx.form)out.push('전투 방식 전환 제안');
  if(fx.awakenStand)out.push('스탠드 각성 · 카드 3장 보관');
  if(fx.advanceDeck){const h=data.deckGrowth[fx.advanceDeck.deck];out.push(g.deckGrowth?.legacy?'전용 숙련 '+fx.advanceDeck.stage+'단계':h.n+' · '+h.stages[fx.advanceDeck.stage]);out.push('기존 카드·성장 효과 강화');if(g.ch.hp<=-(fx.hp||0))out.push('체력이 부족합니다.');}
  const flags=Array.isArray(fx.flag)?fx.flag:fx.flag?[fx.flag]:[];
  if(flags.some(f=>data.events.some(e=>!e.retired&&JSON.stringify(e.req||'').includes('flag:'+f))))out.push('후속 사건의 단서');
  if(fx.route)out.push('이 이야기 마무리');
 }
 if(c.check&&c.fail?.fx.combat)out.push('실패 시 전투');else if(c.check&&c.fail?.fx.hp<0)out.push('실패 시 HP '+c.fail.fx.hp);
 const status=race.choiceInfo(c);if(!status.ok&&status.reason)out.push(status.reason);
 return out.join(' · ')||'추가 보상 없이 진행';
}
export function outcomeScreen({data,race,esc,btn,full=false}){
 const g=race.state,prev=g?.previousOutcome;
 if(g?.mode!=='reward'&&visibleBattleResult(g))return battleResultScreen({data,race,esc,btn,full});
 if(!prev?.text||g.tick<1||g.playback||!['event','omen','encounter','transition'].includes(g.mode))return '';
 const lines=prev.text.split('\n').filter(x=>x.trim()),title=lines.length>1?lines[0]:'직전 선택의 결과',story=lines.length>1?lines[1]:lines[0],effects=lines.slice(2).join('\n'),check=prev.check;
 const verdict=check?`${check.success?'성공':'실패'} · ${check.roll} + ${data.stats[check.stat]} ${check.bonus} = ${check.score} / 목표 ${check.dc}`:'';
 if(full)return `<p class="outcome-full">${esc(prev.text)}</p>${verdict?`<p class="outcome-verdict">${esc(verdict)}</p>`:''}`;
 return `<aside class="previous-outcome" aria-label="사건 결과" aria-live="polite" aria-atomic="true"><div class="outcome-heading"><span class="eyebrow">직전 결과 · ${esc(title)}</span>${btn('outcome','전체 보기','outcome-open','aria-label="직전 선택의 결과 전체 보기"')}</div><p class="outcome-story">${esc(story)}</p>${effects?`<p class="outcome-effects">${esc(effects)}</p>`:''}${verdict?`<small class="outcome-verdict">${esc(verdict)}</small>`:''}</aside>`;
}
export function journeyScreen(type,{data,race,esc,btn,speech}){
 const g=race.state,remaining=data.rules.turnsPerStage-g.tick%data.rules.turnsPerStage;
 if(type==='event'){
  const e=data.events.find(x=>x.id===g.event),choices=e.c.map((c,i)=>({c,i})).filter(({c})=>race.meets(c.req));
  const actor=data.world?.characters[e.actor];
  return `<section class="scene travel current-event" aria-label="현재 사건"><div class="event-heading"><span class="eyebrow">${e.priority>1?'이어지는 사건':'길 위의 사건'}</span><h2>${esc(e.t)}</h2>${actor?`<small class="event-actor">${esc(actor.n)} · ${esc(actor.role)}</small>`:''}</div><p class="narrative">${esc(e.x)}</p></section>${e.guide?`<details class="system-guide" aria-label="진행 안내"><summary>${esc(e.guideTitle||'진행 안내')}</summary><p>${esc(e.guide)}</p></details>`:''}${e.standAwakening?'<details class="identity-edit"><summary>스탠드 이름·대사 지정 (선택)</summary>'+standIdentityFields({esc,prefix:'awakening',name:g.standDraft?.event===e.id?g.standDraft.name:'',line:g.standDraft?.event===e.id?g.standDraft.line:''})+'</details>':''}<div class="actions event-choices" data-count="${choices.length+(e.shop?1:0)+(race.canVisitTrader()?1:0)}" role="group" aria-label="사건 선택지">${e.shop?btn('shop',`<b>${e.blackShop?'거래상의 진열품을 살핀다':'보급소의 물건과 서비스를 살핀다'}</b><small>${e.blackShop?'이번 방문의 희귀 장비':'장비 · 소모품 · 치료 · 무기 정비'}</small>`):''}${race.canVisitTrader()?btn('trader','<b>보급소 뒤편의 천막으로 간다</b><small>출처를 밝히지 않는 거래상</small>'):''}${choices.map(({c,i})=>btn('event:'+i,`<b>${esc(c.l)}</b><small>${esc(eventChoiceHint(data,race,c))}</small>`,'',`${race.canChoice(c)?'':'disabled'} ${c.check?`title="1d100 + ${data.stats[c.check.s]} ${g.ch.stats[c.check.s]} ≥ ${c.check.dc}"`:''}`)).join('')}</div><p class="event-cost muted">${e.shop?'방문·거래·출발 시 행동 소모 없음':e.c.some(c=>c.actionCost===0)?'일반 선택 1행동 · 행동 소모 없는 선택은 별도 표시':'선택 시 1행동 소모'}</p>`;
 }
 if(type==='omen'||type==='encounter'){
  const e=race.enemy(),b=data.hiddenBosses.find(x=>x.id===g.encounter),special=e.kind==='boss',ally=race.canAlly()?race.allyCheck():null,current=data.companions[activeCompanionIds(data,g)[0]];
  return `<section class="scene travel"><span class="eyebrow">${special?'길 위의 특별한 조우':e.kind==='named'?'강한 참가자의 위협':'길 위의 위협'}</span><h2>${esc(e.n)}</h2><p class="narrative">${esc(g.message)}</p><p class="muted">${special?'원작 캐릭터와 이어지는 특수 조우입니다. 도전하거나 물러날 수 있습니다.':e.kind==='named'?'일반 습격자보다 강한 상대입니다. 맞서거나 거리를 둘 수 있습니다.':'이름 없는 상대가 길을 막고 있습니다.'}</p></section><div class="actions">${btn('encounter:fight','상대에게 맞선다','')}${ally?btn('encounter:ally',`<b>${current?'동행 교체를 제안한다':'동행을 제안한다'}</b><small>${data.stats[ally.s]} · 목표 ${ally.dc} · 성공 ${ally.chance}%${current?' · 성공 시 '+esc(current.n)+'과 교대':''}</small>`,'',`title="1d100 + ${data.stats[ally.s]} ${ally.bonus} ≥ ${ally.dc} · 실패 후 재조우 가능"`):''}${btn('encounter:avoid','이번에는 물러난다','')}</div>`;
 }
 if(type==='transition'){const o=data.starts.find(x=>x.id===g.formOffer);return `<section class="scene travel"><span class="eyebrow">낯선 힘의 감각</span><h2>전투 방식을 변경하시겠습니까?</h2><p class="narrative">${esc(o.n)}<br>${esc(o.focus)}</p><p class="muted">수락 시 현재 덱 전체가 새 전용 덱으로 바뀝니다. 능력치와 영구 경험은 유지됩니다. 새 방식이 히든 전용 덱이면 기존 카드는 자동 환전되며, 이후 일반 카드 보상도 돈으로 바뀝니다. 일반 덱으로 바꾸면 기존 카드는 보관합니다.</p></section><div class="actions">${btn('transform:'+o.id,'새로운 전투 방식을 받아들인다','')}${btn('decline-form','지금의 덱을 유지한다','')}</div>`; }
 if(type==='reward'){
  const e=race.enemy(),r=data.relics[e.relic],c=data.cards[g.offer],locked=race.lockedDeck(),full=g.ch.deck.length>=data.rules.deckMax;
  const loot=g.lastLoot?.enemy===g.encounter?g.lastLoot.items:[];
  const actions=locked?'':(full?'':btn('take-card','덱에 장착한다'))+btn('store-card','덱 유지 · 보관한다')+btn('cash-card',`카드 대신 $${race.cardCash()}로 받는다`);
  return `<section class="scene travel"><span class="eyebrow">대결 뒤에 남은 것</span><h2>${esc(e.n)} 격파</h2>${speech(g.encounter,'defeated',g.battleResult?.enemy===g.encounter?g.battleResult.speech?.text:undefined)}<p class="narrative">${esc(e.story)}</p><div class="entry"><b class="gold">${r?esc(r.n):'전투 보상'}</b>${r?`<p>${esc(r.d)} · 이번 레이스 동안 영구 적용</p>`:''}<p>전투 보상 $${e.money}</p></div>${loot.length?`<div class="entry loot-rewards"><b>전리품 장비 · 보관 완료</b>${loot.map(id=>`<p><b>${esc(data.items[id].n)}</b><br>${esc(data.items[id].d)}</p>`).join('')}<p class="muted">보상 선택 후 장비에서 직접 장착할 수 있습니다. 기존 장비는 유지됩니다.</p></div>`:''}<div class="rewardcard"><b>${esc(c.n)}</b><p>${esc(c.d)}</p></div><p class="muted">${locked?'히든 전용 덱은 유지되며 보상 카드는 자동 환전됩니다.':full?'덱이 가득 찼습니다. 보관한 뒤 덱 화면에서 교체하거나 돈으로 받을 수 있습니다.':'덱은 최대 12장입니다. 보상 카드는 장착·보관·현금 중 선택할 수 있습니다.'}</p></section><div class="actions">${actions}</div>`;
 }
 return '';
}
