import {standDisplayName} from './stand.js';
// Presentation reads the resolver's real events; it never rolls dice or awards rewards.
export function replayFrame(replay){
 const {before,events,cursor,phase}=replay;
 const snap=(phase==='result'?events[cursor]:events[cursor-1])?.snap;
 return {...before,P:{...before.P,...snap?.P},E:{...before.E,...snap?.E}};
}
export function advanceReplay(replay){
 if(replay.phase==='announce')replay.phase=replay.events[replay.cursor].k==='atk'?'roll':'result';
 else if(replay.phase==='roll')replay.phase='result';
 else{replay.cursor++;replay.phase='announce';}
 return replay.cursor<replay.events.length;
}
export function replayDelay(replay,speed){
 const e=replay.events[replay.cursor],base=replay.phase==='result'?e.k==='atk'?1000:750:replay.phase==='roll'?650:e.k==='atk'?550:350;
 return Math.round(base*(speed==='fast'?.4:1));
}
export function replayPanel({replay,data,enemy,esc,speech}){
 const e=replay.events[replay.cursor],side=e.att||e.side,name=side?replay.before[side].name:'',done=replay.phase==='result',rolling=replay.phase==='roll';
 const label=e.k==='support'?`${e.companion.n} · ${e.companion.skill} · 자동 지원`:e.k==='turnStart'?`${name} · 턴 시작 효과 · ${e.card.n}`:e.k==='head'?`${replay.before.round}턴 · ${replay.before[replay.before.order[0].uid].name} 선공`:e.k==='end'?'턴 종료 · 지속 효과 정산':e.k==='bleed'?`${name} · 출혈`:`${name} · ${e.card?.n||'행동'}`;
 const stored=e.playerSpeech;
 const actionHasSpeech=replay.events.some(x=>x.playerSpeech&&x.card&&(x.card.sbrId===e.card?.sbrId||!x.card.sbrId&&x.card.n===e.card?.n)&&(x.k==='turnStart'||x.step===e.step));
 const custom=stored?`<div class="speech player-speech"><small>${esc(name)}</small>${esc(stored.text)}</div>`:!actionHasSpeech&&side==='P'&&e.k==='atk'&&replay.before.stand&&e.card?.stand===replay.before.stand.type&&replay.before.stand.line&&!replay.events.slice(0,replay.cursor).some(x=>x.k==='atk'&&x.att==='P'&&x.step===e.step)?`<div class="speech"><small>${esc(name)} · ${esc(standDisplayName(data,replay.before.stand))}</small>${esc(replay.before.stand.line)}</div>`:'';
 const quoteId=enemyCardQuote(replay,data,enemy);const quote=quoteId?speech(enemy,quoteId,e.speech?.text||data.quotes[enemy].cardLines?.[quoteId]?.[0]?.text,e.speech?.kind):'';
 const signed=n=>n>=0?' + '+n:' − '+Math.abs(n);
 const dice=e.k==='atk'?`<div class="combat-dice ${rolling?'rolling':''}"><div><small>${esc(name)} · 명중 d100</small><b>${done?e.ra:'?'}</b><span>${done?`${e.ra}${signed(e.am)} = ${e.sa}`:'판정 중'}</span>${done&&e.ra2!=null?`<small>2회 중 선택 · 다른 눈 ${e.ra2}</small>`:''}</div><div><small>${esc(replay.before[e.def].name)} · ${e.guard?'방어':'회피'} d${e.rdMax||100}</small><b>${done?e.rd:'?'}</b><span>${done?`${e.rd}${signed(e.dm)} = ${e.sd}`:'판정 중'}</span></div></div>`:'';
 const verdict=done?(e.k==='atk'?`${e.hit?'명중':e.blocked?'방어':'회피'}${e.hit||e.blocked?' · 피해 '+e.dmg:''}`:e.k==='support'?(e.damage?'자동 지원 · 피해 '+e.damage:'자동 지원 효과 적용'):e.k==='bleed'?'출혈 피해 '+e.dmg:e.k==='end'?'턴 정산 완료':'효과 적용'):rolling?'명중과 회피를 판정한다':'행동 준비';
 const details=done?(e.lines||[]).map(x=>x.s).join('\n'):'';
 const damage=done&&e.k==='atk'&&e.rolls?.length?`<p class="damage-dice">피해 주사위 ${esc(e.rolls.join(' + '))}${e.b?signed(e.b):''}${e.note?' · '+esc(e.note):''}</p>`:'';
 const companionSpeech=e.companion?.speech?`<div class="speech companion-speech"><small>${esc(e.companion.n)}</small>${esc(e.companion.speech.text)}</div>`:'';
 return `<div class="playback-stage ${done?'resolved':''}" aria-live="polite"><div class="row"><span class="eyebrow">${replay.cursor+1} / ${replay.events.length}</span><span class="muted">${replay.phase==='announce'?'행동':rolling?'판정':'결과'}</span></div><h3>${esc(label)}</h3>${quote}${custom}${companionSpeech}${dice}<strong class="verdict">${esc(verdict)}</strong>${damage}<p class="combat-detail">${esc(details)}</p></div>`;
}

// Say a line on actual card execution, once per card action (not once per hit).
export function enemyCardQuote(replay,data,enemy){
 const e=replay.events[replay.cursor];if((e.att||e.side)!=='E'||!e.card||!['atk','buff','def','turnStart'].includes(e.k))return null;
 const id=e.card.sbrId||Object.keys(data.cards).find(id=>data.cards[id].n===e.card.n),q=data.quotes[enemy];
 if(!id||!q?.cards?.includes(id)&&!q?.legacyCardLines?.[id]&&!(e.speech?.text&&e.speech.card===id))return null;
 if(replay.events.slice(0,replay.cursor).some(x=>(x.att||x.side)==='E'&&x.card&&(x.card.sbrId===id||!x.card.sbrId&&x.card.n===e.card.n)&&(x.k==='turnStart'||x.step===e.step)&&['atk','buff','def','turnStart'].includes(x.k)))return null;
 return id;
}
