import {exportEndingImage} from './ending-image.js';
import {visibleWeaponDice} from './weapon-dice.js';
import {activeCompanionIds,companionsScreen} from './companions.js';
import {checkpointFunds} from './economy.js';
import {battleResultScreen} from './combat-results.js';
import {UI_THEMES,normalizePreferences,applyTheme} from './preferences.js';
import {visibleCardGrade,gradedPlayerCard} from './player-support.js';
import {patchNotesScreen} from './patch-notes.js';
import {normalizeAchievementProfile,mergeAchievementProfile,achievementsScreen} from './achievements.js';
import {equipmentScreen,experienceScreen} from './inventory-ui.js';
import {standIdentityFields} from './stand-ui.js';
import {standDisplayName,standStageName,deckGrowthInfo,validateStandIdentity} from './stand.js';
import {journeyScreen,outcomeScreen} from './journey-ui.js';
import {deckScreen} from './deck-ui.js';
import {shopScreen,supplyButtons} from './shop-ui.js';
import {rollBirth,initialCharacter,birthEntry} from './birth.js';
import {birthScreen,birthRatesScreen} from './birth-ui.js';
import {createRace} from './race.js';
import {replayFrame,advanceReplay,replayDelay,replayPanel} from './playback.js';
const app=document.querySelector('#app'),sheet=document.querySelector('#sheet'),sheetBody=document.querySelector('#sheet-body');
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
let equipmentTab=null,saleSelection=[];
let data,race,selection=[],draft=null,playerName='',saveAvailable=false,toastTimer;
const KEY='sbr-race-v04';
const SETTINGS_KEY='sbr-race-settings';
const ACHIEVEMENTS_KEY='sbr-race-achievements-v1';let achievementProfile={version:1,unlocked:{}};
let playbackSpeed='normal',theme='dusk',replayTimer,deckSwapIndex=null,lastSceneKey=null,shopTab='supplies',shopVisitKey=null;
try{const s=normalizePreferences(JSON.parse(localStorage.getItem(SETTINGS_KEY)));playbackSpeed=s.combat;theme=s.theme;}catch{}
applyTheme(document,theme);
function savePreferences(){try{localStorage.setItem(SETTINGS_KEY,JSON.stringify({combat:playbackSpeed,theme}));}catch{toast('설정을 저장할 수 없습니다. 현재 접속 중에는 적용됩니다.');}}
const btn=(action,label,cls='',extra='')=>`<button data-action="${action}" class="${cls}" ${extra}>${label}</button>`;
const statName={atk:'공격',spd:'속도',eva:'회피',maxHp:'최대 HP'};
const titleOf=()=>data.achievementDecks[race.state?.achievementDeck||(!race.state&&draft?.achievementDeck)]||data.starts.find(x=>x.id===(race.state?.origin||draft?.origins||data.starts[0].id));
function toast(text){const t=document.querySelector('#toast');t.textContent=text;t.classList.add('show');clearTimeout(toastTimer);toastTimer=setTimeout(()=>t.classList.remove('show'),2400);}
function save(){if(!race.state)return;checkpointFunds(race.state);try{localStorage.setItem(KEY,JSON.stringify(race.state));saveAvailable=true;}catch{toast('자동 저장을 사용할 수 없습니다. 현재 화면에서는 계속 플레이할 수 있습니다.');}}
function showSheet(title,body){clearTimeout(replayTimer);document.querySelector('#sheet-title').textContent=title;sheetBody.innerHTML=body;sheet.classList.toggle('shop-dialog',['SBR 대회 보급소','천막 뒤편의 거래상'].includes(title));if(!sheet.open)sheet.showModal();}
document.querySelector('#close-sheet').onclick=()=>sheet.close();
sheet.addEventListener('click',e=>{if(e.target===sheet)sheet.close();});
function header(){return `<header><div class="brand"><small>STEEL BALL RUN</small>나의 레이스</div><div class="header-controls">${btn('patch-notes','패치 내역','quiet','aria-haspopup="dialog" aria-controls="sheet"')}${btn('menu','메뉴','quiet','aria-haspopup="dialog" aria-controls="sheet"')}</div></header>`;}
function menuSheet(){showSheet('메뉴',`<nav class="menu-options" aria-label="게임 메뉴">${(race.state?[['companions','동행'],['history','기록']]:[]).concat([['achievements','업적'],['settings','설정'],['help','도움'],['about','제작 정보']]).map(([a,n])=>btn(a,n,'quiet')).join('')}</nav>`);sheet.scrollTop=0;}
function patchesSheet(){showSheet('패치 내역',patchNotesScreen({version:data.version,esc,btn}));sheet.scrollTop=0;}
function settingsSheet(){showSheet('설정',`<section class="settings-section"><h3>화면 테마</h3><div class="theme-options">${UI_THEMES.map(t=>btn('theme:'+t.id,`<span class="theme-swatch ${t.id}" aria-hidden="true"></span><b>${t.n}</b><small>${t.d}</small>`,theme===t.id?'selected':'',`aria-pressed="${theme===t.id}"`)).join('')}</div></section><section class="settings-section"><h3>전투 연출</h3><div class="speed-options">${[['normal','보통'],['fast','빠르게'],['off','생략']].map(([v,n])=>btn('speed:'+v,n,playbackSpeed===v?'primary':'',`aria-pressed="${playbackSpeed===v}"`)).join('')}</div><p>기본 설정에서는 행동과 판정을 순서대로 재생합니다. 생략을 선택하면 계산 결과를 즉시 표시합니다. 설정은 다음 접속에도 유지됩니다.</p></section>`);}
function combatView(){return race.state.playback?replayFrame(race.state.playback):race.state.combat;}
function entityMotion(side){const r=race.state?.playback;if(!r)return '';const e=r.events[r.cursor],actor=e.att||e.side;if(r.phase!=='result')return actor===side?'acting':'';if(e.k==='atk'&&e.def===side)return e.hit?'impact':e.blocked?'guarding':'dodging';if(e.k==='bleed'&&e.side===side)return 'impact';return actor===side&&['def','buff'].includes(e.k)?'guarding':'';}
function advanceJourney(){
 const g=race.state;if(!g||g.playback||g.mode!=='travel')return;
 g.previousOutcome={text:g.message,check:g.lastCheck||null};
 for(let i=0;i<72&&g.mode==='travel';i++){const next=g.nextTravel||'ride';g.nextTravel='ride';race.travel(next);}
}
function schedulePlayback(){
 clearTimeout(replayTimer);const replay=race.state?.playback;if(!replay)return;
 if(playbackSpeed==='off'){race.finishPlayback();render();return;}
 if(sheet.open||document.hidden)return;
 replayTimer=setTimeout(()=>{if(race.state?.playback!==replay)return;if(!advanceReplay(replay))race.finishPlayback();render();},replayDelay(replay,playbackSpeed));
}
sheet.addEventListener('close',()=>{if(race.state?.playback)render();});
document.addEventListener('visibilitychange',()=>{if(race.state?.playback)render();});
function playbackScreen(){
 const g=race.state,C=combatView(),r=g.playback,e=race.enemy(),ev=r.events[r.cursor],actor=ev.att||ev.side,target=ev.def||(ev.k==='bleed'?ev.side:null),result=r.phase==='result';
 const queue=r.events.map((x,i)=>x.k!=='turnStart'&&x.card&&!r.events.slice(0,i).some(y=>y.card&&y.step===x.step&&(y.att||y.side)===(x.att||x.side)&&y.card.n===x.card.n)?{i,x}:null).filter(Boolean);
 return `<section class="scene combat replay">${replayPanel({replay:r,data,enemy:g.encounter,esc,speech})}</section><div class="action-order" aria-label="이번 턴 행동 순서">${queue.map(({i,x})=>`<span class="${x.step===ev.step&&x.step>=0?'current':i<r.cursor?'done':''}">${x.side==='P'||x.att==='P'?'나':'적'} · ${esc(x.card.n)}</span>`).join('')||'<span>지속 효과를 확인한다</span>'}</div><div class="turnbar"><span>${r.before.round}턴 · 연출 재생 중${r.before.objective?' · '+(r.before.objective.goal?.label||r.before.objective.rounds+'턴 생존'):''}</span><span>속도: ${playbackSpeed==='fast'?'빠르게':'보통'}</span></div><div class="actions">${btn('resolve','행동과 판정을 확인하는 중','primary','disabled')}</div>`;
}
function progress(){const g=race.state;if(g.expedition)return `<section class="route"><span class="eyebrow">BEYOND THE RACE</span><p>레이스 기권 · 유해의 여정 · ${g.expedition.actions}번의 선택</p></section>`;const tick=g.playback?.before.tick??g.tick,stage=Math.min(9,Math.floor(tick/data.rules.turnsPerStage)+1);return `<section class="route"><div class="row"><span class="eyebrow">STAGE ${stage} / 9</span><span class="muted">${esc(data.stages[stage-1].n)} · ${tick>=72?'추가 여정 '+(tick-72)+'행동 · 예상 '+race.finishRank()+'위':(tick%data.rules.turnsPerStage+1)+'/'+data.rules.turnsPerStage}</span></div><div class="route-line" aria-label="전체 9구간 중 ${stage}구간">${data.stages.map((x,i)=>`<span class="${i<stage-1?'done':i===stage-1?'current':''}"></span>`).join('')}</div>${!['ending','retired'].includes(g.mode)&&race.encounterGrace()?`<small class="muted">도주 후 정비 · 남은 ${race.encounterGrace()}행동 동안 적 조우 없음</small>`:''}</section>`;}
function pills(entity){return `<div class="pills">${Object.entries(data.keywords).filter(([k])=>(entity[k]||0)>0||(k==='skipTurns'&&entity.actionBlocked)).map(([k,x])=>btn('keyword:'+k,`${esc(x.n)} ${k==='skipTurns'?(entity.skipTurns||0)+(entity.actionBlocked?1:0):entity[k]}`,'pill '+(['bleed','rupture','sink','burn','skipTurns'].includes(k)?'bad':''),`title="${esc(x.d)}"`)).join('')}</div>`;}
function player(){const g=race.state,fighting=!!g.playback||g.mode==='combat',X=fighting?combatView().P:g.ch.stats,hp=fighting?X.hp:g.ch.hp,companionCount=activeCompanionIds(data,g).length;return `<section class="player ${entityMotion('P')}" aria-label="플레이어 상태"><div class="row"><b>${esc(g.name)}</b><span class="muted">HP ${hp} / ${X.maxHp}</span></div><div class="hp"><i style="width:${Math.max(0,100*hp/X.maxHp)}%"></i></div><div class="stats">${['atk','spd','eva'].map(k=>`<span>${data.stats[k]}<b>${X[k]}</b></span>`).join('')}</div>${fighting?pills(X):`<div class="row muted"><span>${esc(titleOf().n)}</span><span>자금 $${g.ch.money}</span></div>`}${!fighting?standSummary(g.stand):''}${companionCount?'<p class="companion-summary">'+btn('companions','동행 '+companionCount+'명 · 자동 지원','text-action')+'</p>':''}</section>`;}
function combatStatus(){
 const g=race.state,C=combatView();
 const card=(side,name)=>{const X=C[side],own=side==='P';return `<div class="combatant ${own?'player-side':'enemy-side'} ${entityMotion(side)}" role="group" aria-label="${own?'나의':'적의'} 전투 상태"><span class="combatant-label">${own?'나':'적'}</span><b class="combatant-name" title="${esc(name)}">${esc(name)}</b><span class="combatant-hp">HP ${X.hp} / ${X.maxHp}</span><div class="hp"><i style="width:${Math.max(0,Math.min(100,100*X.hp/X.maxHp))}%"></i></div><div class="stats">${['atk','spd','eva'].map(k=>`<span>${data.stats[k]}<b>${X[k]}</b>${k==='eva'&&X.evaB?`<small class="turn-bonus">+${X.evaB} 이번 턴</small>`:''}</span>`).join('')}</div>${pills(X)}</div>`;};
 return `<section class="combat-matchup" aria-label="전투 상태 비교"><div class="combatants">${card('P',g.name)}<span class="combat-vs" aria-hidden="true">VS</span>${card('E',race.enemy().n)}</div>${g.playback?'':`<div class="enemy-intent"><span>적의 행동${race.enemy().canonical?' · '+esc(race.enemy().ability):''}</span>${g.combatContext?.objective?'목표: '+(g.combatContext.objective.goal?.label||g.combatContext.objective.rounds+'턴 생존')+' · ':''}${C.E.actionBlocked?'행동 불가 · 이번 턴 행동하지 않음':C.ePlan.map(c=>esc(c.n)).join(' · ')||'방어 자세'}</div>`}</section>`;
}
function footer(){return '<footer class="direct-dock">'+btn('deck','덱 '+race.state.ch.deck.length,'quiet')+btn('equipment','장비','quiet')+btn('relics','경험','quiet')+'</footer>';}
function speech(id,trigger,line,kind){const q=data.quotes[id];return q&&(q.trigger===trigger||q.cards?.includes(trigger)||typeof line==='string')?`<div class="speech"><small>${esc(data.enemies[id].n)}${kind==='technique-call'?' · 기술 발동':''}</small>${esc(trigger==='defeated'?(line||q.defeatedText||q.text):(line||q.text))}</div>`:'';}
function shortCard(c){
 const parts=[];if(c.t==='atk')parts.push(`${c.hits}타 × ${c.dice}d${c.die||6}${c.b?' +'+c.b:''} · 명중 +${c.hit}`);if(c.eva)parts.push(`이번 턴 회피 +${c.eva}`);
 for(const[k,n,to]of c.kw||[])parts.push(`${to==='s'?'자신':'상대'} ${data.keywords[k].n} +${n}${c.t==='atk'?' / 적중':''}`);
 if(c.turnStart&&c.t!=='def')for(const[k,n]of Object.entries(c.turnStart))parts.push(`턴 시작 ${k==='eva'?'회피':'명중'} +${n}`);
 if(c.charge)parts.push(`기세 +${c.charge}`);if(c.spend)parts.push(`기세 ${c.spend===99?'전부':'최대 '+c.spend} 소비 · 소비당 적중 피해 +${c.fixPer}`);
 for(const[k,label]of [['heal','HP'],['hitHeal','적중마다 HP'],['shield','보호막'],['hitShield','적중마다 보호막'],['passNext','다음 턴 명중'],['selfHit','이번 턴 명중']])if(c[k])parts.push(`${label} +${c[k]}`);
 if(c.debuffHit)parts.push(`상대 다음 명중 ${c.debuffHit}`);if(c.cleanseRand)parts.push(`무작위 지속 피해 상태 -${c.cleanseRand}`);if(c.bleedDmg)parts.push(`상대 출혈당 피해 +${c.bleedDmg}`);if(c.sinkDmg)parts.push(`상대 위축 3당 피해 +${c.sinkDmg}`);
 if(c.adv)parts.push('명중 2회 중 높은 값');if(c.rr)parts.push('피해 재굴림');if(c.spdDice)parts.push(`속도 ${c.spdDice[0]}+: 주사위당 +${c.spdDice[1]}`);if(c.hpCost)parts.push(`HP 비용 ${c.hpCost}`);if(c.skipTurns)parts.push(`상대 다음 ${c.skipTurns}턴 행동 불가`);if(c.once)parts.push('전투당 1회');return parts.join(' · ');
}
function startScreen(){if(!draft)draft=rollBirth(data);const preview=initialCharacter(data,draft);app.innerHTML=birthScreen({data,draft,playerName,canContinue:saveAvailable,esc,btn,header,preview});}
const journeyView=type=>journeyScreen(type,{data,race,esc,btn,speech});
function travelScreen(){return journeyView('travel');}
function eventScreen(){return journeyView('event');}
function encounterScreen(){return journeyView(race.state.mode);}
function combatScreen(){const g=race.state,C=g.combat,e=race.enemy(),spent=selection.reduce((s,i)=>s+data.cards[C.P.hand[i]].c,0),id=g.encounter,q=data.quotes[id],showQuote=C.round===1&&q?.trigger==='encounter';return `<section class="scene combat">${showQuote?speech(id,'encounter'):''}<div class="battle-log" aria-live="polite">${g.supplyMessage?esc(g.supplyMessage)+'\n':''}${g.lastRound?btn('round-log','전투 기록','quiet log-button'):''}${esc(g.lastRound?.summary||'상대의 움직임을 보고 카드를 선택하십시오. 방어 카드는 먼저 적용됩니다.')}</div>${C.companions?.length?'<p class="companion-summary">동행 · '+esc(C.companions[0].n)+' · '+(C.lastCompanionSupport?esc(C.lastCompanionSupport.round+'턴 '+C.lastCompanionSupport.skill+' 지원'):'자동 지원 대기')+'</p>':''}</section>${supplyButtons({data,race,esc,btn})}<div class="turnbar"><span>${C.round}턴 · ${C.order[0].uid==='P'?'당신':'상대'} 선공${C.P.actionBlocked?' · 행동 불가':''}</span><span>행동력 ${C.P.light-spent} / ${C.P.light}</span></div><div class="hand">${C.P.hand.map((id,i)=>{const original=race.engine.D.cards[id],grade=visibleCardGrade(data,g),c=gradedPlayerCard(original,grade,visibleWeaponDice(data,g)),suffix=c.t==='atk'&&grade?.tier?' '+grade.n:'';return `<button class="card ${selection.includes(i)?'selected':''}" data-action="select:${i}" aria-pressed="${selection.includes(i)}" title="${esc(shortCard(c))}" ${C.P.actionBlocked||!selection.includes(i)&&spent+c.c>C.P.light?'disabled':''}><span class="cost">${c.c}</span><span class="name">${esc(c.n+suffix)}</span><span class="desc">${esc(shortCard(c))}</span></button>`;}).join('')}</div><div class="actions">${btn('resolve',C.P.actionBlocked?'행동 불가 · 다음 턴으로':selection.length?`선택한 ${selection.length}장으로 행동한다`:'방어하며 넘긴다','primary')}${btn('flee','도주한다 · 1행동','quiet','title="현재 HP 유지 · 승리 보상 없음"')}</div>`;}
function rewardScreen(){return journeyView('reward');}
function finishGateScreen(){const g=race.state,rank=race.finishRank();return `<section class="scene finish-gate"><span class="eyebrow">NEW YORK · FINAL STAGE</span><h1>결승선 앞에서.</h1>${g.message?`<aside class="previous-outcome" aria-label="직전 결과"><span class="eyebrow">직전 결과</span><p class="outcome-story">${esc(g.message)}</p></aside>`:''}<p class="narrative">멀리 결승의 깃발이 보인다. 지금 고삐를 당겨 레이스를 마칠 수도, 길 위에 남겨 둔 일을 돌아볼 수도 있다.</p><div class="finish-rank"><span>지금 완주하면</span><strong>${rank}위</strong><small>총 ${g.tick}행동 · 추가 여정 ${Math.max(0,g.tick-72)}행동</small></div><p class="system-note">추가로 1행동을 보낼 때마다 최종 순위가 한 계단 내려갑니다. 연장 횟수에는 제한이 없습니다.</p><div class="actions">${btn('finish-race','지금 완주한다','primary')}${[1,4,8].map(n=>btn('extend-race:'+n,n+'행동 더 여행한다','quiet')).join('')}</div></section>`;}
function endingScreen(){const g=race.state;return `<section id="ending-image-record" class="scene travel"><span class="eyebrow">${g.endingKind==='hidden'?'HIDDEN ENDING · 결승선 밖의 여정':g.mode==='ending'?'FINISH · NEW YORK':'RETIRE'}</span><h1>${g.mode==='ending'?esc(g.endingTitle||'나의 레이스, 그 마지막 장.'):'길 위에 남긴 이야기.'}</h1><p class="narrative">${esc(g.message)}</p>${g.endingKind==='hidden'?'<div class="finish-rank"><span>레이스 기록</span><strong>기권</strong><small>순위 없는 별도의 결말</small></div>':g.mode==='ending'?`<div class="finish-rank"><span>최종 순위</span><strong>${g.finishRank?g.finishRank+'위':'순위 기록 없음'}</strong><small>${g.finishedAt??g.tick}행동 · 추가 여정 ${Math.max(0,(g.finishedAt??g.tick)-72)}행동</small></div>`:''}<div class="stats"><span>격파<b>${g.beaten.length}</b></span><span>동행<b>${g.allies.length}</b></span><span>경험<b>${g.relics.length}</b></span></div>${(g.endingStories||[]).map(s=>`<div class="entry"><b>${esc(s.n)}</b><p>${esc(s.text)} · ${esc({mastered:'전투 방식 완성',adapted:'자신의 페이스 유지',expired:g.endingKind==='hidden'?'끝맺지 못한 이야기':'기회를 남기고 완주',delivered:'전달 완료',guided:'길 안내',integrated:'기술 통합',rotation:'회전 선택',observed:'관찰 기록',connected:'도움의 연결',prepared:'보급 준비',shared:'도움 나눔',helped:'협력 완료',sheltered:'피난처 제공',rested:'안전한 휴식',surrendered:'위험을 피함',lost:'서류 분실',published:'기사 게재',equipped:'장비 수령',entrusted:'안전하게 양도',released:'유해를 놓아줌',guarded:'유해를 지킴',bartered:'거래로 시련 완료',declined:'거절',parted:'각자의 길'}[s.result]||s.result)}</p></div>`).join('')}${endingRecord(g)}</section><section class="ending-image-actions" aria-label="엔딩 이미지 저장"><div class="actions">${btn('ending-image:download','이미지 다운로드','primary')}${btn('ending-image:copy','이미지 복사','quiet')}</div><p id="ending-image-status" role="status" aria-live="polite">엔딩과 마지막 기록을 PNG 이미지로 저장합니다.</p></section><div class="actions">${btn('history','나의 여정을 읽는다','primary')}${btn('new-run','새 레이스를 준비한다','quiet')}</div>`;}
function endingRecord(g){const o=data.starts.find(x=>x.id===g.origin),named=g.beaten.filter(id=>['named','boss'].includes(race.enemy(id)?.kind));return `<section class="ending-record"><h2>길 위에 남긴 이름</h2><p>${esc(o?.n||g.origin)}의 길에서 출발한 ${esc(g.name)}. ${g.stand?'자신의 힘에 「'+esc(standDisplayName(data,g.stand))+'」이라는 이름을 붙였다.':g.endingKind==='hidden'?'결승선 대신 자신이 지킬 것을 선택했다.':g.mode==='ending'?'자신이 익힌 전투 방식으로 대륙을 건넜다.':'자신이 익힌 전투 방식으로 길 위에서 버텼다.'} ${g.escapes?'때로는 물러나며 '+g.escapes+'번의 대결에서 생존을 택했다.':''}</p>${named.length?'<p><b>기억에 남은 대결</b><br>'+named.map(id=>esc(race.enemy(id)?.n||id)).join(' · ')+'</p>':''}<div class="stats">${['atk','spd','eva'].map(k=>'<span>'+data.stats[k]+'<b>'+g.ch.stats[k]+'</b></span>').join('')}</div><details><summary>마지막 덱 · ${g.ch.deck.length}장</summary>${g.ch.deck.map(id=>'<div class="ending-card"><b>'+esc(race.cardName(id))+'</b><span>'+esc(shortCard(gradedPlayerCard(data.cards[id],visibleCardGrade(data,g))))+'</span></div>').join('')}</details><details><summary>마지막 장비와 경험</summary><p>${Object.values(g.equipment).filter(Boolean).map(id=>esc(race.itemName(id))).join(' · ')||'장착 장비 없음'}</p><p>${g.relics.map(id=>esc(data.relics[id]?.n||id)).join(' · ')||'특별한 대결의 경험 없음'}</p></details></section>`;}
// A new scene starts at its result/header on short, page-scrolling screens.
// Card selection and individual playback frames keep the reader's position.
function resetSceneScroll(contentScroll=0){
 const g=race.state,key=g?[g.tick,g.mode,g.event,g.encounter,!!g.playback,g.combat?.round].join(':'):'birth';
 if(lastSceneKey!==null&&key!==lastSceneKey)document.scrollingElement?.scrollTo?.({top:0,left:0,behavior:'instant'});
 else {const content=app.querySelector?.('.journey-body,.battle-controls');if(content)content.scrollTop=contentScroll;}
 lastSceneKey=key;
}
function render(){const contentScroll=app.querySelector?.('.journey-body,.battle-controls')?.scrollTop||0;syncAchievementProfile();advanceJourney();app.classList.toggle('birth-view',!race.state);app.classList.toggle('battle',!!race.state?.playback||race.state?.mode==='combat');app.classList.toggle('journey',!!race.state&&!race.state.playback&&race.state.mode!=='combat');if(!race.state){startScreen();resetSceneScroll(contentScroll);return;}const g=race.state;const body=(g.playback?playbackScreen():({travel:travelScreen,event:eventScreen,transition:()=>journeyView('transition'),omen:encounterScreen,encounter:encounterScreen,combat:combatScreen,reward:rewardScreen,'finish-gate':finishGateScreen,ending:endingScreen,retired:endingScreen}[g.mode])());app.innerHTML=header()+progress()+(g.mode==='combat'&&!g.playback&&g.combat?.hiddenNote?'<aside class="funds-notice"><p>'+esc(g.combat.hiddenNote)+'</p></aside>':'')+(g.fundsNotice?'<aside class="funds-notice" role="status"><p>'+esc(g.fundsNotice)+'</p>'+btn('funds-notice','확인','quiet')+'</aside>':'')+(g.playback||g.mode==='combat'?'<div class="battle-layout"><div class="battle-overview">'+combatStatus()+'</div><div class="battle-controls">'+body+'</div></div>':'<div class="race-layout"><div class="race-sidebar">'+player()+outcomeScreen({data,race,esc,btn})+'</div><div class="journey-body">'+body+'</div></div>')+footer();resetSceneScroll(contentScroll);save();schedulePlayback();}
function shopSheet(tab){if(!race.canShop())return toast('SBR 대회 보급소를 만났을 때 이용할 수 있습니다.');const title=race.state.event===data.economy.market.blackEvent?'천막 뒤편의 거래상':'SBR 대회 보급소';const key=race.state.tick+':'+race.state.event;if(key!==shopVisitKey){shopVisitKey=key;shopTab='supplies';saleSelection=[];}if(['supplies','gear','service','sell'].includes(tab))shopTab=tab;const validSales=new Set(race.sellable().filter(r=>!r.reason).map(r=>r.id));saleSelection=saleSelection.filter(id=>validSales.has(id));const scroll=!tab&&sheet.open&&document.querySelector('#sheet-title').textContent===title?sheet.scrollTop||0:0;showSheet(title,shopScreen({data,race,esc,btn,tab:shopTab,saleSelection}));sheet.scrollTop=scroll;}

function deckSheet(){
 const scroll=sheet.open&&document.querySelector('#sheet-title').textContent==='나의 덱'?sheet.scrollTop||0:0;
 showSheet('나의 덱',deckScreen({data,race,esc,btn,swapIndex:deckSwapIndex,cardText:shortCard,grade:visibleCardGrade(data,race.state)}));sheet.scrollTop=scroll;
}
function standSummary(s){if(!s)return '';const t=data.stands.types[s.type],next=data.stands.need[s.level+1],eventGrowth=deckGrowthInfo(data,{stand:s});return '<p class="stand-summary"><b>'+esc(standDisplayName(data,s))+(s.name?' · '+esc(t.form):'')+' · '+esc(standStageName(data,s))+'</b><span>'+(eventGrowth?'전용 사건으로 성장 · 전용기 '+s.uses+'회':'전용기 '+s.uses+(next!=null?' / '+next+'회':'회 · 완성'))+'</span></p>';}
function hiddenGrowthSummary(g){if(g.hiddenRoute?.discovered){const h=g.hiddenRoute,r=data.hiddenRoutes[h.id];return '<div class="entry"><b>히든 출생의 여정 · '+esc(r.n)+'</b><p>'+(h.abandoned?'사건에서 물러남':h.completed?'전용 여정 완료 · 레이스 계속':Object.keys(h.claims).length+' / 3명 격파')+'</p><p>'+h.roster.filter(id=>h.claims[id]).map(id=>esc(data.enemies[id].n)).join(' · ')+'</p></div>';}if(g.achievementDeck)return '';const h=data.hiddenGrowth[g.origin];if(!h)return '';const count=h.events.filter(id=>g.usedEvents.includes(id)).length,status=g.routeResults['origin_'+g.origin];if(!count&&!status)return '';return '<div class="entry"><b>히든 전용 성장 · '+esc(h.title)+'</b><p>'+(status==='mastered'?'전용 기술 완성':status==='declined'?'수련을 시작하지 않음':status==='adapted'?'안정된 동작 선택':status==='expired'?'구간 내 수련 미완료':count+' / 3단계')+'</p><p>'+esc(h.benefit)+'</p></div>';}
function equipmentSheet(){const scroll=sheet.open&&document.querySelector('#sheet-title').textContent==='장비'?sheet.scrollTop||0:0;showSheet('장비',equipmentScreen({data,race,esc,btn,tab:equipmentTab}));sheet.scrollTop=scroll;}
function relicsSheet(){showSheet('경험',experienceScreen({data,race,esc,btn,standSummary,hiddenGrowthSummary,standIdentityFields}));}
function historySheet(){const g=race.state,p=g.playback?.before,history=g.history.slice(0,p?.historyLength??g.history.length);showSheet('나의 여정',`<p>지나온 ${p?.tick??g.tick}행동 · ${p?.beaten??g.beaten.length}명 격파</p>${history.slice().reverse().map((t,i)=>`<div class="entry"><span class="eyebrow">기록 ${history.length-i}</span><p>${esc(t)}</p></div>`).join('')}`);}
function about(){showSheet('제작 정보',`<p>비공식 · 비영리 팬게임 개발판 v${data.version}. 캐릭터 이름과 원작 설정은 「죠죠의 기묘한 모험」을 바탕으로 합니다. 카드명·사건·능력의 수치 표현은 팬게임용 각색입니다.</p><p>전투와 카드 기본 구조: <a href="https://github.com/cityyear-fanmade/city-year" target="_blank" rel="noopener">도시의 한 해</a>. 원본 엔진에 공통 턴 건너뛰기와 새로운 진행·데이터·화면을 연결했습니다.</p><p>일반 덱은 보상 카드를 얻고 전용 덱 히든은 해당 카드 대신 돈을 받습니다. 경험은 특별한 상대와 겨룬 뒤 획득합니다. 기본 무기의 성능은 고정이며 길에서 만나는 SBR 대회 보급소에서 유료 정비할 수 있습니다. SBR 대회 보급소은 4행동 간격으로 나타납니다.</p><p>시간 되돌리기·차원 이동 등은 공통 카드 효과로 각색했습니다. 원작 능력을 모두 구현한 완성판은 아닙니다.</p><p><a href="sbr-race.html" download>단일 HTML 실행 파일</a></p><p><a href="game-data.json" download>카드·덱·적·보상 데이터 JSON</a></p>`);}
function syncAchievementProfile(saved=race.state){
  let disk={version:1,unlocked:{}};try{disk=normalizeAchievementProfile(data,JSON.parse(localStorage.getItem(ACHIEVEMENTS_KEY)));}catch{}
  const merged={version:1,unlocked:{...disk.unlocked,...achievementProfile.unlocked},journeys:{...disk.journeys,...achievementProfile.journeys}},next=mergeAchievementProfile(data,merged,saved);
  const newly=Object.keys(next.unlocked).filter(id=>!achievementProfile.unlocked[id]);achievementProfile=next;race.setUnlockedDecks(Object.keys(next.unlocked));
  if(JSON.stringify(next)!==JSON.stringify(disk))try{localStorage.setItem(ACHIEVEMENTS_KEY,JSON.stringify(next));}catch{toast('업적을 저장하지 못했습니다. 현재 접속 중에는 해금 덱을 사용할 수 있습니다.');}
  if(newly.length&&race.state&&!race.state.playback)toast('업적 달성 · '+newly.map(id=>data.achievementDecks[id].n+' 덱 해금').join(' · '));
}
function achievementSheet(){syncAchievementProfile();showSheet('업적 · 해금 덱',achievementsScreen({data,profile:achievementProfile,starting:!race.state,draft,esc,btn}));}
function action(a){const [key,arg]=a.split(':');
 if(key==='ending-image'){if(!['ending','retired'].includes(race.state?.mode))return;return exportEndingImage(arg,{section:document.querySelector('#ending-image-record'),name:race.state.name,notify:toast});}
 if(key==='companions')return showSheet('동행 · 자동 지원',companionsScreen({data,race,esc,btn}));
 if(key==='companion'){if(race.setCompanion(arg==='none'?null:arg)){render();showSheet('동행 · 자동 지원',companionsScreen({data,race,esc,btn}));}return;}
 if(key==='funds-notice'){if(race.state)delete race.state.fundsNotice;render();return;}
 if(key==='finish-race'){if(race.finishRace())render();return;}
 if(key==='extend-race'){if(race.extendRace(Number(arg)))render();return;}
 if(key==='flee'){if(race.flee()){selection=[];render();}return;}
 if(key==='patch-notes')return patchesSheet();
 if(key==='menu')return menuSheet();
 if(key==='settings')return settingsSheet();
 if(key==='theme'){if(!UI_THEMES.some(t=>t.id===arg))return;theme=applyTheme(document,arg);savePreferences();return settingsSheet();}
 if(key==='achievements')return achievementSheet();
 if(key==='achievement-deck'){if(race.state)return;if(arg!=='random'&&!achievementProfile.unlocked[arg])return;if(!draft)draft=rollBirth(data);if(draft.achievementDeck!==arg){delete draft.standName;delete draft.standLine;}if(arg==='random')delete draft.achievementDeck;else draft.achievementDeck=arg;sheet.close();return render();}
 if(key==='battle-result'){const content=battleResultScreen({data,race,esc,btn,full:true});if(content){showSheet('전투 결과',content);sheet.scrollTop=0;}return;}
 if(key==='round-log')return showSheet('전투 기록',race.state?.lastRound?`<p>${race.state.lastRound.number}턴</p><p class="combat-detail">${esc(race.state.lastRound.lines.join('\n'))}</p>`:'<p>아직 진행한 턴이 없습니다.</p>');
 if(key==='speed'){if(!['normal','fast','off'].includes(arg))return;playbackSpeed=arg;savePreferences();settingsSheet();if(arg==='off')race.finishPlayback();render();return;}
 if(race.state?.playback&&!['menu','help','about','keywords','keyword','birth-record','history','deck','relics','equipment'].includes(key))return;
 if(key==='help')return showSheet('도움','<p>72행동부터 완주하거나 여정을 연장할 수 있습니다. 최종 순위는 추가 행동 수를 기준으로 계산하는 이 게임의 규칙입니다. 추가 1행동마다 1위씩 내려갑니다. 전투에서 도주하면 현재 HP를 유지하고 1행동이 지나며 승리 보상은 받지 못합니다. 이후 여정 3행동 동안 모든 적 조우를 막습니다. 무료 선택·상점 이용은 이 기간을 줄이지 않습니다.</p>'+ Object.values(data.keywords).map(x=>'<div class="entry"><b>'+esc(x.n)+'</b><p>'+esc(x.d)+'</p></div>').join('')+'<p>원작 캐릭터는 길 위에서 무작위로 조우합니다. 일부 후반 인물은 관련 인물의 격파 등 선행 조건이 필요합니다. 일반 전투는 무명 참가자나 습격자와 벌어집니다. 선택한 카드의 이번 턴 회피·명중 효과는 첫 행동 전에 적용됩니다. 적중 효과와 다음 턴 효과는 카드의 원래 시점에 적용됩니다. 공격 카드는 3·5·7구간에서 자동 강화됩니다. 덱에서 현재 강화 수치를 확인할 수 있습니다. 사건 판정은 1d100 + 해당 능력치가 목표치 이상이면 성공합니다.</p>'+btn('birth-record','출발 설정')+btn('about','제작 정보')+(race.state?btn('new-run','새 레이스 준비'):''));if(key==='about')return about();if(key==='keywords')return showSheet('공통 효과',Object.entries(data.keywords).map(([k,x])=>`<div class="entry"><b>${esc(x.n)}</b><p>${esc(x.d)}</p></div>`).join(''));
 if(key==='keyword')return showSheet(data.keywords[arg].n,`<p>${esc(data.keywords[arg].d)}</p>`);
 if(key==='roll-birth'){playerName=document.querySelector('#name')?.value||playerName;const preset=draft?.achievementDeck;draft=rollBirth(data);if(preset)draft.achievementDeck=preset;return render();}
 if(key==='start'){const technique=document.querySelector('#birth-technique-line')?.value||draft.techniqueLine||'';if(technique||draft.techniqueLine!==undefined)draft.techniqueLine=technique;if(initialCharacter(data,draft).stand){draft.standName=document.querySelector('#birth-stand-name')?.value||'';draft.standLine=document.querySelector('#birth-stand-line')?.value||'';const valid=validateStandIdentity(draft.standName,draft.standLine);if(!valid.ok)return toast(valid.error);}playerName=document.querySelector('#name')?.value||playerName;if(!race.start(playerName,draft))return toast('해금한 업적 덱인지 확인하십시오.');selection=[];return render();}
 if(key==='continue'){try{if(!race.restore(JSON.parse(localStorage.getItem(KEY))))return toast('저장 기록을 읽지 못했습니다. 기존 저장 기록은 유지됩니다.');}catch{return toast('저장 기록을 읽지 못했습니다. 기존 저장 기록은 유지됩니다.');}selection=[];return render();}
 if(key==='birth-record'){const birth=race.state?.birth;if(!birth)return showSheet('출발 설정','<p>이전 버전의 저장 기록에는 출발 설정 정보가 없습니다. 기존 능력치와 덱은 유지됩니다.</p>');return showSheet('출발 설정',['origins','talents','flaws','weapons'].map((field,i)=>{const x=birthEntry(data,birth,field);return '<div class="entry"><span class="eyebrow">'+['출신','재능','결점','무기'][i]+'</span><h3>'+esc(x.n)+'</h3><p>'+esc(x.e||data.starts.find(o=>o.id===x.id)?.focus||'')+'</p></div>';}).join(''));}
 if(key==='birth-detail'){const setup=race.state?.birth||draft;if(!setup)return;const x=birthEntry(data,setup,arg),o=arg==='origins'?data.starts.find(o=>o.id===x.id):null;return showSheet(x.n,`<p>${esc(x.t||o?.form||'')}</p><p>${esc(o?.focus||x.e)}</p>${x.e&&o?'<p>'+esc(x.e)+'</p>':''}${x.card?'<p>무기 카드: '+esc(data.cards[x.card].n)+' · '+esc(data.cards[x.card].d)+(o?.hidden?' · 전용 덱에는 무기 카드 미지급':'')+'</p>':''}<p>${x.hidden?'히든 결과 · 확률 비공개':'뽑힐 확률 '+x.weight+'%'}${Number.isInteger(setup.rolls?.[arg])?' · 주사위 '+setup.rolls[arg]+' / 100':' · 주사위 기록 없음'}</p>`);}
 if(key==='birth-rates')return showSheet('출생 확률',birthRatesScreen({data,esc}));
 if(key==='new-run'){sheet.close();if(!race.state){return render();}showSheet('새 레이스 준비',`<p>새 레이스를 시작하면 현재 레이스 기록이 바뀝니다. 해금한 업적 덱은 유지됩니다. 지금은 출발 준비 화면으로 돌아갑니다.</p>${btn('reset','출발 준비 화면으로','primary')}`);return;}
 if(key==='reset'){clearTimeout(replayTimer);sheet.close();race=createRace(data,race.engine.D,{unlockedDecks:Object.keys(achievementProfile.unlocked)});selection=[];draft=null;return render();}
 if(!race.state)return;
 if(key==='unequip'){if(!race.unequipItem(arg))return toast('지금은 해제할 수 없습니다.');render();return equipmentSheet();}
 if(key==='equip'){if(!race.equipItem(arg))return toast('지금은 장착할 수 없습니다.');render();return equipmentSheet();}
 if(key==='item-save'){const result=race.setItemName(arg,document.querySelector('#item-name-'+arg)?.value||'');if(!result.ok)return toast(result.error);render();equipmentSheet();toast('장비 이름을 저장했습니다.');return;}
 if(key==='equipment')return equipmentSheet();
 if(key==='outcome'){const content=outcomeScreen({data,race,esc,btn,full:true});if(content){showSheet('직전 선택의 결과',content);sheet.scrollTop=0;}return;}
 if(key==='trader'){if(!race.visitTrader())return toast('지금은 거래상을 찾을 수 없습니다.');return render();}
 if(key==='shop')return shopSheet();
 if(key==='equipment-tab'){if(!data.equipmentSlots[arg])return;equipmentTab=arg;return equipmentSheet();}
 if(key==='inventory-sell'){if(!race.sellItem(arg))return toast('보급소 방문 여부와 판매 조건을 확인하십시오.');render();equipmentSheet();return toast(race.state.shopMessage);}
 if(key==='sale-select'){const row=race.sellable().find(r=>r.id===arg&&!r.reason);if(!row)return;saleSelection=saleSelection.includes(arg)?saleSelection.filter(id=>id!==arg):[...saleSelection,arg];return shopSheet();}
 if(key==='sale-inferior'){saleSelection=race.inferiorSales().map(r=>r.id);return shopSheet();}
 if(key==='sale-clear'){saleSelection=[];return shopSheet();}
 if(key==='sale-confirm'){if(!race.sellItems(saleSelection))return toast('선택한 물품과 판매 조건을 확인하십시오.');saleSelection=[];render();return shopSheet('sell');}
 if(key==='shop-tab')return shopSheet(arg);
 if(key==='sell-item'){if(!race.sellItem(arg))return toast('판매할 물품과 장착 상태를 확인하십시오.');render();return shopSheet('sell');}
 if(key==='buy'){if(!race.buy(arg))return toast('자금과 구입 조건을 확인하십시오.');render();return shopSheet();}
 if(key==='supply'){if(!race.useSupply(arg))return toast(race.supplyInfo(arg).reason);const title=sheet.open?document.querySelector('#sheet-title').textContent:'';render();if(title==='SBR 대회 보급소')return shopSheet();if(title==='장비')equipmentSheet();toast(race.state.supplyMessage);return;}
 if(key==='history')return historySheet();if(key==='deck'){deckSwapIndex=null;return deckSheet();}
 if(key==='swap-pick'){const i=Number(arg);if(!Number.isInteger(i)||!race.state.ch.side[i]||!race.canEditCard(race.state.ch.side[i]))return;deckSwapIndex=i;return deckSheet();}
 if(key==='swap-cancel'){deckSwapIndex=null;return deckSheet();}
 if(key==='swap-with'){if(!race.swapCard(Number(arg),deckSwapIndex))return toast('지금은 카드를 교체할 수 없습니다.');deckSwapIndex=null;render();return deckSheet();}
 if(key==='relics')return relicsSheet();
 if(key==='technique-save'){const result=race.setTechniqueLine(document.querySelector('#edit-technique-line')?.value||'');if(!result.ok)return toast(result.error);render();relicsSheet();toast('기술 대사를 저장했습니다.');return;}
 if(key==='stand-save'){const result=race.setStandIdentity(document.querySelector('#edit-stand-name')?.value||'',document.querySelector('#edit-stand-line')?.value||'');if(!result.ok)return toast(result.error);render();relicsSheet();toast('스탠드 이름과 결정 대사를 저장했습니다.');return;}
 if(key==='remove'){if(!race.removeCard(Number(arg)))return toast('덱에는 최소 4장이 필요합니다. 전투 밖에서 편집하십시오.');deckSwapIndex=null;render();return deckSheet();}if(key==='insert'){if(!race.insertCard(Number(arg)))return toast('덱의 최대 장수와 편집 조건을 확인하십시오.');deckSwapIndex=null;render();return deckSheet();}
 if(key==='change-event'){const g=race.state;const offer=race.transitionOffer();if(!offer)return;save();const next=data.starts.find(x=>x.id===offer.origin);if(next.id===g.origin)return showSheet('낯익은 흔적','<p>지금의 능력과 같은 흔적이다. 이 구간에서는 새로운 전투 방식을 찾지 못했다.</p>');return showSheet('낯선 힘의 흔적',`<p>길 위에서 새로운 전투 방식을 마주했다. 받아들이면 덱 전체가 「${esc(next.n)}」의 전용 덱으로 바뀐다. 기존 능력치와 영구 경험은 유지된다.</p><p>${esc(next.focus)}</p>${btn('transform:'+next.id,'새로운 힘을 받아들인다','primary')}`);}
 if(key==='decline-form')race.declineForm();
 if(key==='transform'){race.transform(arg);race.state.changed=true;sheet.close();}
 if(key==='event'){if(data.events.find(e=>e.id===race.state.event)?.c[Number(arg)]?.ok.fx.awakenStand){const valid=validateStandIdentity(document.querySelector('#awakening-stand-name')?.value||'',document.querySelector('#awakening-stand-line')?.value||'');if(!valid.ok)return toast(valid.error);}if(!race.chooseEvent(Number(arg),{standName:document.querySelector('#awakening-stand-name')?.value||'',standLine:document.querySelector('#awakening-stand-line')?.value||''}))return toast('선택 조건과 자금을 확인하십시오.');selection=[];}
 if(key==='travel')race.travel(arg);if(key==='encounter'){race.encounter(arg);selection=[];race.state.lastRound=null;}
 if(key==='select'){const i=Number(arg);selection=selection.includes(i)?selection.filter(x=>x!==i):[...selection,i];}
 if(key==='resolve'){if(!race.round(selection,{playback:playbackSpeed!=='off'}))return toast('행동력과 선택한 카드를 확인하십시오.');selection=[];}
 if(key==='skip-card')race.reward(null,true);
 if(key==='cash-card')race.reward('cash');
 if(key==='take-card')race.reward('card');
 if(key==='store-card')race.reward('store');
 if(key==='sell'){if(!race.sellCard(Number(arg)))return;deckSwapIndex=null;render();return deckSheet();}
 if(key==='replace'){race.reward(Number(arg));sheet.close();}
 render();
}
document.addEventListener('click',e=>{const b=e.target.closest('[data-action]');if(b&&!b.disabled)try{action(b.dataset.action);}catch(err){console.error(err);toast('진행 중 오류가 발생했습니다. 새로고침하면 마지막 저장 기록에서 이어갈 수 있습니다.');}});
document.addEventListener('input',e=>{const id=e.target.id;if(id==='birth-technique-line'&&draft)draft.techniqueLine=e.target.value;if(id==='birth-stand-name'||id==='birth-stand-line'){if(draft)draft[id.endsWith('name')?'standName':'standLine']=e.target.value;}if((id==='awakening-stand-name'||id==='awakening-stand-line')&&race.state?.mode==='event'){const g=race.state;if(g.standDraft?.event!==g.event)g.standDraft={event:g.event,name:'',line:''};g.standDraft[id.endsWith('name')?'name':'line']=e.target.value;save();}});
try{[data]=await Promise.all([fetch('game-data.json').then(r=>{if(!r.ok)throw Error('data');return r.json();})]);const runtime=await fetch('runtime-base.json').then(r=>r.json());race=createRace(data,runtime);try{const saved=JSON.parse(localStorage.getItem(KEY));saveAvailable=!!saved;syncAchievementProfile(saved);}catch{}render();}catch(err){console.error(err);app.innerHTML='<p class="loading">데이터를 불러오지 못했습니다. 인터넷 연결을 확인한 뒤 새로고침하십시오.</p>';}
