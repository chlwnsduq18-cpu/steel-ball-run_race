// Presentation records the settlement once. Reading it never grants a reward.
export function captureBattleResult(D,g,C,foe,context,before,outcome,{locked=false}={}){
 const victory=outcome==='win',rewards=victory&&context.rewards!==false,q=D.quotes[g.encounter];
 const story=outcome==='escape'?(context.fleeText||context.loseText||g.message.split('\n').slice(1).join('\n')||'상대의 사정거리에서 벗어나 레이스로 돌아갔다.'):victory?(context.winText||foe.story||''):context.loseText||g.message;
 const speech=rewards&&q?.trigger==='defeated'&&q.defeatedText?{text:q.defeatedText,source:q.defeatedSource||q.source}:null;
 g.battleResult={version:1,pending:true,enemy:g.encounter,name:foe.n,form:foe.formId?foe.ability:null,outcome,
  rounds:C.round,moneyBefore:before.money,money:0,hp:g.ch.hp,maxHp:g.ch.stats.maxHp,
  relics:g.relics.filter(id=>!before.relics.includes(id)),items:g.items.filter(id=>!before.items.includes(id)),
  card:rewards?{id:foe.rewardCards[0],status:locked?'cash':'pending',cash:locked?D.rules.cardCash:0}:null,
  speech,lead:context.rewards===false?g.message.split('\n')[0]:'',story,text:g.message,tick:g.tick};
 updateBattleResult(g);
 if(speech)g.history.push(foe.n+' · 대결의 마지막 말\n'+speech.text);
}
export function updateBattleResult(g,{cardStatus,cardCash=0}={}){
 const r=g.battleResult;if(!r)return;
 r.money=g.ch.money-r.moneyBefore;r.hp=g.ch.hp;r.maxHp=g.ch.stats.maxHp;r.text=g.message;r.tick=g.tick;
 if(r.card&&cardStatus){r.card.status=cardStatus;r.card.cash=cardCash;}
}
export function visibleBattleResult(g){return !!g?.battleResult?.pending&&!g.playback&&g.mode!=='combat';}
export function battleResultScreen({data,race,esc,btn,full=false}){
 const g=race.state;if(!visibleBattleResult(g))return '';const r=g.battleResult;
 const title={win:'승리',lose:'패배',draw:'무승부',escape:'도주'}[r.outcome]||'대결 종료';
 const card=r.card,cardLabel=card?{pending:'카드 보상 선택 대기',cash:'카드 환전 $'+card.cash,store:'카드 보관',equip:'카드 장착',skip:'카드 보상 포기'}[card.status]:'';
 const gains=[r.money?'정산 자금 '+(r.money>0?'+':'−')+'$'+Math.abs(r.money):'',...r.relics.map(id=>'경험 · '+(data.relics[id]?.n||id)),...r.items.map(id=>'획득 · '+(data.items[id]?.n||id)),cardLabel].filter(Boolean);
 return `<aside class="battle-result" aria-label="전투 결과" role="status"><div class="outcome-heading"><span class="eyebrow">전투 결과 · ${esc(title)}</span>${full?'':btn('battle-result','전체 보기','outcome-open','aria-label="전투 결과 전체 보기"')}</div><h3>${esc(r.name)}${r.form?`<small>${esc(r.form)}</small>`:''}</h3>${r.speech?`<div class="speech"><small>${esc(r.name)}</small>${esc(r.speech.text)}</div>`:''}${r.lead?`<p class="battle-result-lead">${esc(r.lead)}</p>`:''}<p class="battle-result-story">${esc(r.story)}</p><p class="battle-result-gains">${esc(gains.join(' · ')||'승리 보상 없음')}</p><small class="muted">${r.rounds}턴 · HP ${r.hp} / ${r.maxHp}</small>${full?`<p class="outcome-full">${esc(r.text)}</p>`:''}</aside>`;
}
