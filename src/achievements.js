import {mergeHiddenRecords,hiddenRecordsScreen} from './hidden-routes.js';
// Run evidence and permanent browser profile are separate; a new run never erases unlocks.
export function achievementEvidence(D,g){
 const found={};if(!g)return found;
 for(const a of D.achievements){
  if(!g.beaten?.includes(a.enemy))continue;
  const proof=g.achievementRecords?.[a.id]||g.opponents?.[a.enemy];
  const form=proof?.formId;
  if(a.form&&form!==a.form)continue;
  found[a.id]={enemy:a.enemy,formId:form||null,tick:proof?.tick??proof?.sbrBalance?.tick??null};
 }
 return found;
}
export function awardBossAchievements(D,g,id,foe){
 g.achievementRecords??={};const notes=[];
 for(const a of D.achievements)if(a.enemy===id&&foe.kind==='boss'&&(!a.form||a.form===foe.formId)&&!g.achievementRecords[a.id]){
  g.achievementRecords[a.id]={enemy:id,formId:foe.formId||null,tick:g.tick};notes.push('업적 달성 · '+a.n+' · 다음 레이스에서 '+D.achievementDecks[a.deck].n+' 덱 선택 가능');
 }
 return notes;
}
export function normalizeAchievementProfile(D,value){
 const unlocked={};for(const a of D.achievements){const p=value?.unlocked?.[a.id];if(p&&typeof p==='object'&&p.enemy===a.enemy&&(!a.form||p.formId===a.form))unlocked[a.id]={enemy:a.enemy,formId:p.formId||null,tick:Number.isInteger(p.tick)?p.tick:null};}
 return {version:1,unlocked,journeys:mergeHiddenRecords(D,value?.journeys)};
}
export function mergeAchievementProfile(D,profile,g){
 const next=normalizeAchievementProfile(D,profile);if(!g?.playback){Object.assign(next.unlocked,achievementEvidence(D,g));next.journeys=mergeHiddenRecords(D,next.journeys,g?.hiddenRoute?.records);}return next;
}
export function achievementsScreen({data,profile,starting,draft,esc,btn}){
 const known=profile.unlocked;
 return hiddenRecordsScreen(data,profile,esc)+`<p>특별한 상대를 쓰러뜨리면 다음 레이스에서 사용할 전용 덱이 열립니다. 현재 레이스의 덱은 그대로 유지됩니다.</p><p>달성 ${Object.keys(known).length} / ${data.achievements.length}</p>${starting?btn('achievement-deck:random','추첨한 기본 덱 사용',!draft?.achievementDeck?'primary':''):''}${data.achievements.map(a=>{
  if(!known[a.id])return '<div class="entry achievement-locked"><b>???</b><p>아직 발견하지 못한 업적입니다.</p></div>';
  const d=data.achievementDecks[a.deck],selected=starting&&draft?.achievementDeck===d.id;
  return `<div class="entry"><b>${esc(a.n)}</b><p>${esc(a.condition)} · 달성</p><p>해금 덱 · ${esc(d.n)} · ${d.deck.length}장<br>${esc(d.focus)}</p><p>${d.id==='tusk'?'ACT.1로 출발 · 전용 사건을 거쳐 ACT.4까지 성장':'전용 사건을 거쳐 강화 · 고급 기술은 보관함에서 편성'}</p><details><summary>출발 덱 카드 확인</summary>${d.deck.map(id=>`<p><b>${esc(data.cards[id].n)}</b><br>${esc(data.cards[id].d)}</p>`).join('')}</details>${starting?btn('achievement-deck:'+d.id,selected?'선택됨':'이 덱으로 출발 준비',selected?'primary':'',`aria-pressed="${selected}"`):'<p>새 레이스 출발 준비에서 선택할 수 있습니다.</p>'}</div>`;
 }).join('')}`;
}
