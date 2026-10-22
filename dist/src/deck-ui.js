import {visibleWeaponDice} from './weapon-dice.js';
import {gradedPlayerCard,cardGradeSummary} from './player-support.js';
export function deckScreen({data,race,esc,btn,swapIndex,cardText,grade}){
 const g=race.state,min=data.rules.deckMin,max=data.rules.deckMax,outside=!g.playback&&['travel','event','omen','encounter'].includes(g.mode),full=g.ch.deck.length>=max,pending=outside&&Number.isInteger(swapIndex)&&!!g.ch.side[swapIndex];
 const title=c=>race.cardName(c.sbrId)+(c.t==='atk'&&grade?.tier?' '+grade.n:'');
 const rows=(ids,equipped)=>ids.map((id,i)=>{
  const c=data.cards[id],action=equipped?(pending?'swap-with:':'remove:')+i:(full?'swap-pick:':'insert:')+i,label=equipped?(pending?'교체':'해제'):(full?'교체':'추가'),enabled=equipped?(pending?race.canSwapCard(i,swapIndex):race.canRemoveCard(i)):(full?race.canEditCard(id):race.canInsertCard(i));
  const swap=!equipped&&!full?btn('swap-pick:'+i,'교체','text-action',race.canEditCard(id)?'':'disabled'):'';
  const sell=!equipped&&!c.fixed&&!c.stand?btn('sell:'+i,'환전 $'+race.cardCash(),'text-action',outside&&!pending?'':'disabled'):'';
  return `<article class="deck-card ${equipped&&pending&&race.canSwapCard(i,swapIndex)?'swap-target':''}" data-card-id="${id}" data-card-index="${i}"><div class="deck-card-copy"><div class="deck-card-heading"><b>${esc(title(c))}</b><span>${{atk:'공격',def:'방어',buff:'지원'}[c.t]} · 행동력 ${c.c}</span></div><p>${esc(c.t==='atk'&&(grade?.tier||visibleWeaponDice(data,g))&&cardText?cardText(gradedPlayerCard(c,grade,visibleWeaponDice(data,g))):c.d)}</p>${swap||sell?`<div class="deck-card-tools">${swap}${sell}</div>`:''}</div>${btn(action,label,'card-move',`${enabled?'':'disabled'} aria-label="${esc(title(c))} ${label}"`)}</article>`;
 }).join('');
 return `<div class="deck-editor"><div class="deck-summary"><b>장착 ${g.ch.deck.length}장 <span>/ 최대 ${max}장</span></b><p>${pending?'교체할 장착 카드를 선택하십시오.':`${min}~${max}장으로 편성합니다.`}${!outside?' 전투 중에는 확인만 가능합니다.':''}</p>${grade?.tier?'<p class="card-grade-summary">'+esc(cardGradeSummary(grade))+'</p>':''}${pending?btn('swap-cancel','교체 취소','quiet'):''}</div><section class="deck-pane"><h3>장착</h3><div class="deck-list" id="deck-equipped">${rows(g.ch.deck,true)}</div></section><section class="deck-pane"><h3>보관 ${g.ch.side.length}장</h3><div class="deck-list" id="deck-storage">${rows(g.ch.side,false)||'<p class="deck-empty">보관한 카드가 없습니다.</p>'}</div></section></div>`;
}
