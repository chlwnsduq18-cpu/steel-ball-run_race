import {completeHiddenEnding} from './hidden-ending.js';
import {initializeHiddenRoute,hiddenRouteEvent,hiddenEventAllowed,discoverHiddenRoute,applyHiddenRouteFx,finishHiddenRoute,hiddenCombatPlan} from './hidden-routes.js';
import {weaponDiceProfile} from './weapon-dice.js';
import {markEventSeen,eventWeight,rememberChoice,memoryReady,memoryEnding} from './choice-memory.js';
import {restorableRaceSave} from './save-state.js';
import {companionJoinable,companionJoinCheck,companionCandidates,activeCompanionIds,initializeCompanions,prepareCompanions,syncCombatCompanions} from './companions.js';
import {attachPlayerSpeeches} from './player-quotes.js';
import {captureBattleResult,updateBattleResult} from './combat-results.js';
import {syncFollowups,followupReady,promisedFollowup} from './followups.js';
import {initializePlayerSupport,recoveryAmount,playerCardGrade,cardGradeSummary} from './player-support.js';
import {awardBossAchievements,achievementEvidence} from './achievements.js';
import {grantDedicatedCards,initializeDedicatedRewards,checkTechniqueTrial} from './dedicated.js';
import {attachEnemySpeeches} from './battle-quotes.js';
import {makeOpponent,opponentCard,opponentPlan} from './opponents.js';
import {initializeLoot,grantBossLoot} from './loot.js';
import {initializeStand,awakenStand,growStand,optionalStandCard,canAwakenStand,standDisplayName,standStageName,canAdvanceDeck,advanceDeckGrowth,validateStandIdentity} from './stand.js';
import {inferiorSaleRows,inventorySaleRows,repairFunds,isSalePrice,canSpendFunds,spendFunds,initializeEconomy,paidChoiceStatus,shopRows,rareShopRows,gearDominated,supplyStatus} from './economy.js';
import {createEngine} from './engine.js';
import {meetsCondition,activeEffects,combatEquipmentEffects,growItems,recordEquipmentUse,itemName,initializeProgression,changeEquipment} from './progression.js';
import {rollBirth,pickBirthEntry,initialCharacter} from './birth.js';
export function createRace(data,runtime,{rng=Math.random,unlockedDecks=[]}={}){
 const E=createEngine(structuredClone(runtime),{rng});let g=null;
 const unlocked=new Set(unlockedDecks.filter(id=>data.achievementDecks[id]));
 const setUnlockedDecks=ids=>{for(const id of ids)if(data.achievementDecks[id])unlocked.add(id);};
 const pick=a=>a[Math.floor(rng()*a.length)];
 const record=t=>{g.history.push(t);g.message=t;};
 const length=()=>data.rules.turnsPerStage;
 const stage=()=>Math.min(data.stages.length,Math.floor(g.tick/length())+1);
 // Legacy API name: this selects cash rewards; it no longer locks owned cards in place.
 const lockedDeck=()=>!!g.achievementDeck||data.starts.find(x=>x.id===g.origin)?.rewardPolicy==='cash';
 const enemy=(id=g.encounter)=>g?.opponents?.[id]||g?.spawned?.[id]||data.enemies[id];
 function prepareOpponent(id){g.opponents??={};if(!g.opponents[id]||g.opponents[id].sbrBalance.tick!==g.tick)g.opponents[id]=makeOpponent(data,g,id,rng);const foe=g.opponents[id];E.D.enemies[id]=foe;return foe;}
 const cardCash=()=>data.rules.cardCash;
 const syncStandNames=()=>{for(const [id,c]of Object.entries(data.cards))if(c.stand)E.D.cards[id].n=c.n;if(g?.stand?.name)for(const [id,c]of Object.entries(data.cards))if(c.stand===g.stand.type)E.D.cards[id].n=g.stand.name+(c.standSkillName?' · '+c.standSkillName:'')+(['발현','성장','진화','완성'].includes(standStageName(data,{type:c.stand,level:c.standLevel||0}))?'':' · '+standStageName(data,{type:c.stand,level:c.standLevel||0}));};
 const cardName=id=>E.D.cards[id]?.n||data.cards[id]?.n||id;
 function setStandIdentity(name,line=''){
  if(!g?.stand||!outsideCombat())return {ok:false,error:'스탠드 이름과 대사는 전투 밖에서 변경할 수 있습니다.'};
  const x=validateStandIdentity(name,line);if(!x.ok)return x;
  if(g.stand.name!==x.name||g.stand.line!==x.line){g.stand.name=x.name;g.stand.line=x.line;g.history.push('스탠드 이름 · '+standDisplayName(data,g.stand));syncStandNames();}
  return {ok:true};
 }
 const outsideCombat=()=>!g.playback&&['travel','event','omen','encounter','finish-gate'].includes(g.mode);
 function setTechniqueLine(line=''){if(!g||!outsideCombat())return {ok:false,error:'기술 대사는 전투 밖에서 변경할 수 있습니다.'};const x=validateStandIdentity('',line);if(!x.ok)return x;g.signatureLine=x.line;return {ok:true};}
 function start(name,setup=null){
  if(setup?.achievementDeck&&(!data.achievementDecks[setup.achievementDeck]||!unlocked.has(setup.achievementDeck)))return false;
  if(setup&&typeof setup==='object'&&!validateStandIdentity('',setup.techniqueLine||'').ok)return false;
  if(setup&&typeof setup==='object'&&!validateStandIdentity(setup.standName||'',setup.standLine||'').ok)return false;
  const birth=typeof setup==='string'?{...rollBirth(data,rng),origins:setup}:structuredClone(setup||rollBirth(data,rng));
  birth.version??=data.birth.version;
  const {origin:o,stats,hp,deck,side}=initialCharacter(data,birth);
  g={v:1,followups:{},dedicatedClaims:{},journeyVersion:2,deckVersion:data.deckUpgrade.version,birth,name:(name||'이름 없는 참가자').trim().slice(0,12),origin:o.id,achievementDeck:birth.achievementDeck||null,tick:0,mode:'travel',seen:[],beaten:[],allies:[],relics:[],usedEvents:[],recentEvents:[],bossVisits:{},history:[],message:'',ch:{stats,hp,money:data.rules.startMoney,year:1,gear:{},flags:{},deck,side,relics:[],beaten:[],aff:null,o:{n:o.n},mind:30,innate:null},combat:null,encounter:null,event:null,offer:null};
  initializeHiddenRoute(data,g,rng);g.signatureLine=validateStandIdentity('',birth.techniqueLine||'').line;initializePlayerSupport(data,g,{fresh:true});initializeProgression(g,data);initializeCompanions(data,g);const talent=data.birth.tables.talents.find(x=>x.id===birth.talents);if(talent?.item)g.items.push(talent.item);g.ch.money+=talent?.money||0;initializeEconomy(g);marketSchedule();initializeStand(data,g,{fresh:true});syncStandNames();initializeLoot(data,g,applyFx);g.economy.version=data.economy.version;g.ch.name=g.name;record('출발 신호가 울렸다. 길 위의 선택과 대결이 당신의 레이스를 만들어 갈 것이다.'+(g.stand?'\n스탠드 각성 상태 · '+standDisplayName(data,g.stand):''));return g;
 }
 function meets(req=[]){return meetsCondition(req,g,data);}
 const routeEvents=r=>data.events.filter(e=>r.events?.includes(e.id)||e.id.startsWith(r.id+'_'));
 const inWindow=x=>x.from<=stage()&&x.to>=stage();
 const encounterGrace=()=>Math.max(0,(g?.encounterProtectionUntil||0)-(g?.tick||0));
 const canonAllowed=id=>meets((data.hiddenBosses.find(b=>b.id===id)||data.namedEncounters.find(b=>b.id===id))?.req);
 const hasCombat=c=>!!(c.ok?.fx?.combat||c.fail?.fx?.combat);
 const eligible=()=>Object.keys(data.enemies).filter(id=>data.enemies[id].kind==='normal'&&!g.beaten.includes(id)&&inWindow(data.enemies[id]));
 const visitKey=()=>g.tick<72?stage():10+Math.floor((g.tick-72)/length());
 const retryReady=id=>g.tick>=(g.companionRetryAt?.[id]||0);
 const eligibleBosses=()=>encounterGrace()?[]:data.hiddenBosses.filter(b=>stage()>=b.from&&meets(b.req)&&retryReady(b.id)&&!g.beaten.includes(b.id)&&!g.allies.includes(b.id)&&g.bossVisits[b.id]!==visitKey()).map(b=>b.id);
 const eligibleNamed=()=>encounterGrace()?[]:data.namedEncounters.filter(b=>stage()>=b.from&&meets(b.req)&&retryReady(b.id)&&!g.beaten.includes(b.id)&&!g.allies.includes(b.id)&&g.namedVisits?.[b.id]!==visitKey()).map(b=>b.id);
 const eventTiming=e=>(inWindow(e)||g.followups?.[e.id]&&stage()>=e.from)&&followupReady(data,g,e)&&memoryReady(data,g,e)&&(e.fromTick==null||g.tick>=e.fromTick)&&(!e.after||(g.ch.flags[e.after.flag]?g.tick-(g.flagTicks[e.after.flag]??0)>=e.after.ticks:e.after.optional));
 const availableEvents=(where='road')=>{syncFollowups(data,g,meets);return data.events.filter(e=>hiddenEventAllowed(data,g,e)&&!e.hiddenRouteScene&&!e.expedition&&!e.retired&&(!encounterGrace()||!e.c.some(hasCombat))&&e.where.includes(where)&&eventTiming(e)&&(!e.repeatAfter||g.eventTicks[e.id]==null||g.tick-g.eventTicks[e.id]>=e.repeatAfter)&&meets(e.req)&&(!e.once||!g.usedEvents.includes(e.id))&&!g.recentEvents.slice(-3).includes(e.id));};
 function weighted(rows){let value=rng()*rows.reduce((n,x)=>n+eventWeight(g,x),0);for(const x of rows){value-=eventWeight(g,x);if(value<0)return x;}return rows.at(-1);}
 function openEvent(e){discoverHiddenRoute(data,g,e);markEventSeen(g,e);g.event=e.id;g.mode='event';return true;}
 function finishTick(){
  if(g.pendingHiddenEnding){g.expedition.actions++;completeHiddenEnding(data,g,g.pendingHiddenEnding);return;}
  if(g.expedition){if(data.events.find(e=>e.id===g.event)?.expedition)g.expedition.actions++;g.previousOutcome={text:g.message,check:g.lastCheck||null};g.eventPermit=null;openEvent(data.events.find(e=>e.id===g.expedition.step));return;}
  const before=stage(),oldGrade=playerCardGrade(data,g.tick);g.tick++;g.event=null;g.eventPermit=null;
  if(g.tick>=(g.finishAt||data.stages.length*length())){
   g.mode='finish-gate';
  }else{g.mode='travel';if(stage()!==before){const growth=initializePlayerSupport(data,g),hp=g.ch.hp;g.ch.hp=Math.min(g.ch.stats.maxHp,g.ch.hp+recoveryAmount(data,g,'checkpoint'));g.ch.money+=10;const t=`${data.stages[stage()-1].n} 구간에 도착했다. 체크포인트 보급: HP +${g.ch.hp-hp} · $10.${growth.length?'\n레이스 적응: '+growth.join(' · '):''}`;const grade=playerCardGrade(data,g.tick),gradeNote=(grade?.tier||0)>(oldGrade?.tier||0)?'\n카드 강화: '+cardGradeSummary(grade):'';g.history.push(t+gradeNote);g.message+='\n'+t+gradeNote;}}
  initializePlayerSupport(data,g);migrateDeck();migrateEconomy();initializeProgression(g,data);initializeStand(data,g);initializeDedicatedRewards(data,g);initializeLoot(data,g,applyFx);
  initializeCompanions(data,g);syncFollowups(data,g,meets);
  for(const r of data.routes)if(!r.id.startsWith('growth_')&&!g.routeResults[r.id]&&routeEvents(r).some(e=>g.usedEvents.includes(e.id))&&!routeEvents(r).some(e=>(e.to>=stage()||g.followups[e.id])&&!g.usedEvents.includes(e.id))){g.routeResults[r.id]='expired';g.history.push(r.n+' · 기회를 남겨 둔 채 다음 구간으로 넘어갔다.');}
 }
 function finishRace(){
  if(!g||g.playback||g.mode!=='finish-gate'||g.expedition)return false;
  delete g.battleResult;g.finishRank=finishRank();g.finishedAt=g.tick;
   g.endingKind='race';g.mode='ending';for(const r of data.routes)if(!g.routeResults[r.id]&&routeEvents(r).some(e=>g.usedEvents.includes(e.id)))g.routeResults[r.id]='expired';const bosses=g.beaten.filter(id=>enemy(id)?.kind==='boss');
   g.endingTitle=g.finishRank===1?'자신의 이름으로 거머쥔 우승':g.beaten.includes('valentine')?'레이스의 이면을 넘어':g.allies.length?'만남을 품고 결승선으로':g.ch.flags.letter_done||g.ch.flags.wagon_helped?'길 위에서 남긴 손길':g.ch.money>=200?'자신의 몫을 챙긴 완주':'끝까지 달린 참가자';
   g.endingStories=Object.entries(g.routeResults).filter(([,v])=>!['declined','parted'].includes(v)).map(([id,result])=>({n:data.routes.find(r=>r.id===id)?.n||id,result,text:result==='expired'?'끝내지 못한 이야기도 자신의 여정에 남겼다.':result==='lost'||result==='surrendered'?'맡은 일을 끝내지 못했지만 자신의 생존을 선택했다.':result==='adapted'?(data.routes.find(r=>r.id===id)?.adaptedEnding||'완성보다 자신에게 맞는 페이스를 택했다.'):data.routes.find(r=>r.id===id)?.ending||'자신의 선택으로 길 위의 이야기를 마무리했다.'}));
   finishHiddenRoute(data,g);const memoryText=memoryEnding(g);if(memoryText)g.endingStories.push({n:"길 위의 재회",result:"remembered",text:memoryText});
   record(`${g.name}은 ${g.finishRank}위로 뉴욕의 결승선에 닿았다. ${g.beaten.length}번의 승리와 ${bosses.length}번의 특별한 대결, ${g.relics.length}개의 경험이 몸에 남았다. ${g.ch.flags.wagon_helped?'누군가를 위해 멈추기도 했고, ':''}${g.ch.flags.broker_job?'대가를 위해 위험을 감수하기도 했다. ':''}출발할 때와 같은 이름이지만, 이제는 자신이 선택한 여정이 그 이름 뒤에 이어진다.`);

  return true;
 }
 function finishRank(){return 1+Math.max(0,(g?.tick||0)-data.stages.length*length());}
 function extendRace(actions){
  if(!g||g.playback||g.mode!=='finish-gate'||![1,4,8].includes(actions))return false;
  delete g.battleResult;g.finishAt=g.tick+actions;g.mode='travel';record('결승선을 향한 고삐를 늦췄다. 아직 길 위에서 마무리할 일이 남아 있었다.');return true;
 }
 function flee(){
  if(!g||g.playback||g.mode!=='combat'||!g.combat||g.combat.over||g.combat.P.hp<=0)return false;
  const id=g.encounter,name=enemy().n,context=g.combatContext,C=g.combat,foe=structuredClone(enemy()),before={money:g.ch.money,relics:g.relics.slice(),items:g.items.slice()};
  g.encounterProtectionUntil=g.tick+1+(data.rules.escapeGraceActions||3);delete g.bossVisits[id];if(g.namedVisits)delete g.namedVisits[id];delete g.pendingBoss;
  g.ch.hp=Math.min(g.ch.stats.maxHp,g.combat.P.hp);g.escapes=(g.escapes||0)+1;
  if(context?.fleeFx||context?.loseFx){const fx=structuredClone(context.fleeFx||context.loseFx);delete fx.hp;applyFx(fx);}
  g.combat=null;g.combatContext=null;g.lastRound=null;g.offer=null;g.formOffer=null;
  record('도망치는 거다!\n'+(context?.fleeText||'고삐를 꺾고 '+name+'의 사정거리에서 벗어났다. 상처는 남았지만 레이스는 계속된다.'));
  finishTick();captureBattleResult(data,g,C,foe,{...context,rewards:false},before,'escape');return true;
 }
 function migrateDeck(){
  if(g.deckVersion===data.deckUpgrade.version||g.combat||g.playback)return;
  const old=data.deckUpgrade.legacyStarts[g.origin]?.slice(),o=data.starts.find(x=>x.id===g.origin);
  if(old&&!o.hidden&&g.birth){const w=data.birth.tables.weapons.find(x=>x.id===g.birth.weapons);if(w)old[old.length-1]=w.card;}
  const counts=ids=>ids.reduce((a,id)=>(a[id]=(a[id]||0)+1,a),{}),same=(a,b)=>{const x=counts(a),y=counts(b);return Object.keys({...x,...y}).every(id=>x[id]===y[id]);};
  if(old&&!g.deckEdited&&same(g.ch.deck,old)){
   const pool=counts(g.ch.deck),next=o.deck.filter(id=>{if(!pool[id])return false;pool[id]--;return true;});
   if(!o.hidden&&g.birth){const id=data.birth.tables.weapons.find(x=>x.id===g.birth.weapons)?.card;if(pool[id]){next.push(id);pool[id]--;}}
   if(next.length>=data.rules.deckMin&&next.length<=data.rules.deckMax){const spare=Object.entries(pool).flatMap(([id,n])=>Array(n).fill(id));g.ch.deck=next;g.ch.side.push(...spare);g.deckNotice='기본 덱을 '+next.length+'장으로 정리하고 여분 '+spare.length+'장은 보관했습니다.';g.history.push(g.deckNotice);}
  }
  g.deckVersion=data.deckUpgrade.version;
 }
 function migrateEconomy(){
  if(g.economy.version===data.economy.version||g.combat||g.playback)return;
  if(lockedDeck()){
   const o=data.starts.find(x=>x.id===g.origin),pool={};for(const id of [...g.ch.deck,...g.ch.side])if(data.cards[id]&&!data.cards[id].stand)pool[id]=(pool[id]||0)+1;
   const born=data.birth.tables.weapons.find(x=>x.id===g.birth?.weapons)?.card;if(g.ch.side.includes(born)&&pool[born])pool[born]--;
   for(const id of o.deck){if(pool[id])pool[id]--;else if(data.cards[id]?.stand){const legacy=data.stands.types[data.cards[id].stand].baseCard;if(pool[legacy])pool[legacy]--;}}
   const extra=Object.values(pool).reduce((a,n)=>a+n,0),standActive=g.ch.deck.filter(id=>data.cards[id]?.stand&&!data.cards[id].fixed&&!o.deck.some(base=>data.cards[base].stand===data.cards[id].stand&&data.cards[base].standSkill===data.cards[id].standSkill)),standSide=g.ch.side.filter(id=>data.cards[id]?.stand&&!data.cards[id].fixed);g.ch.deck=o.deck.slice();g.ch.deck.push(...standActive.splice(0,Math.max(0,data.rules.deckMax-g.ch.deck.length)));g.ch.side=[...standActive,...standSide];delete g.ch.flags.free_deck;
   if(extra){g.ch.money+=extra*cardCash();g.economyNotice='전용 덱을 정리하고 잉여 카드 '+extra+'장을 $'+extra*cardCash()+'로 환전했습니다.';g.history.push(g.economyNotice);}
  }
  g.economy.version=data.economy.version;
 }
 function marketSchedule(){return g.economy.market??={nextTick:(Math.floor(g.tick/data.economy.market.every)+1)*data.economy.market.every,tick:null};}
 function canShop(){return !!g&&!g.playback&&g.mode==='event'&&[data.economy.market.event,data.economy.market.blackEvent].includes(g.event)&&g.economy.market?.tick===g.tick;}
 function canVisitTrader(){return canShop()&&g.event===data.economy.market.event&&(g.economy.market.rareStock||[]).length>0;}
 function visitTrader(){if(!canVisitTrader())return false;g.event=data.economy.market.blackEvent;return true;}
 function shop(){return !canShop()?[]:g.event===data.economy.market.blackEvent?rareShopRows(data,g,stage()):shopRows(data,g,stage());}
 function sellable(){return canShop()?inventorySaleRows(data,g):[];}
 function sellItems(ids){
  if(!canShop()||!Array.isArray(ids)||!ids.length||new Set(ids).size!==ids.length)return false;
  const available=sellable(),rows=ids.map(id=>available.find(r=>r.id===id));
  if(rows.some(r=>!r||r.reason||!isSalePrice(r.price)))return false;
  const total=rows.reduce((n,r)=>n+r.price,0);if(!Number.isSafeInteger(total)||!Number.isSafeInteger(g.ch.money+total))return false;
  const gear=new Set(rows.filter(r=>r.kind==='gear').map(r=>r.item));
  g.items=g.items.filter(id=>!gear.has(id));for(const r of rows)if(r.kind==='supply')g.economy.stock[r.item]--;
  g.ch.money+=total;g.shopMessage=(rows.length===1?rows[0].n+' 1개':rows.length+'개 물품')+' 판매 · +$'+total;
  g.history.push(g.shopMessage+(rows.length>1?' · '+rows.map(r=>r.n).join(', '):''));return true;
 }
 function sellItem(id){return sellItems([id]);}
 const inferiorSales=()=>canShop()?inferiorSaleRows(data,g):[];
 function buy(id){
  if(!canShop())return false;const row=shop().find(x=>x.id===id);if(!row||row.reason||!isSalePrice(row.price)||!canSpendFunds(g,row.price))return false;
  const current=data.events.find(e=>e.id===g.event),permitted=g.mode==='event'&&current&&meets(current.req);
  const x=g.economy,notes=[];if(!spendFunds(g,row.price))return false;
  if(row.kind==='service')notes.push(...applyFx(row.fx));
  if(row.kind==='heal')notes.push(...applyFx({hp:data.economy.clinic.hp}));
  if(row.kind==='tune'){x.tuning[row.item]=(x.tuning[row.item]||0)+1;notes.push(row.n+' +'+x.tuning[row.item]);}
  if(row.kind==='gear'){g.items.push(row.item);changeEquipment(data,g,data.items[row.item].slot,row.item);notes.push(data.items[row.item].n+' 구매·장착');}
  if(row.kind==='rare'){g.items.push(row.item);notes.push(data.items[row.item].n+' 보관 · 장비에서 직접 장착');}
  if(['gear','rare'].includes(row.kind)&&data.items[row.item].weaponCard)notes.push(grantCard(data.items[row.item].weaponCard));
  if(row.kind==='supply'){x.stock[row.item]=(x.stock[row.item]||0)+1;notes.push(data.economy.supplies[row.item].n+' 1개 보관');}
  if(permitted)g.eventPermit=current.id;
  const key=stage()+':'+id;x.buys[key]=(x.buys[key]||0)+1;g.shopMessage=row.n+' · $'+row.price+' · '+notes.join(' · ');g.history.push(g.shopMessage);return true;
 }
 function supplyInfo(id){return supplyStatus(data,g,id);}
 function useSupply(id){
  const status=supplyInfo(id);if(!status.ok)return false;const combat=g.mode==='combat',X=combat?g.combat.P:null;
  for(const[k,n]of Object.entries(status.delta))if(combat)X[k]=(X[k]||0)+n;else if(k==='hp')g.ch.hp+=n;
  if(combat){g.ch.hp=X.hp;g.economy.supplyRound=g.combat.round;}
  g.economy.stock[id]--;g.supplyMessage=data.economy.supplies[id].n+' · '+Object.entries(status.delta).map(([k,n])=>(data.keywords[k]?.n||'HP')+' '+(n>0?'+':'')+n).join(' · ');
  if(combat)g.combat.log.push({t:'kw',s:g.supplyMessage});else g.shopMessage=g.supplyMessage;g.history.push(g.supplyMessage);return true;
 }
 function choiceInfo(c){if(hasCombat(c)){for(const fx of [c.ok?.fx,c.fail?.fx])if(fx?.combat?.enemy&&!canonAllowed(fx.combat.enemy))return {ok:false,reason:'아직 상대와 마주할 수 없습니다.',benefit:''};}if(encounterGrace()&&hasCombat(c))return {ok:false,reason:'도주 후 정비 중 · '+encounterGrace()+'행동 동안 적 조우 없음',benefit:''};return paidChoiceStatus(data,g,c,lockedDeck());}
 function grantCard(id,{equip=false}={}){if(!data.cards[id])throw Error('없는 보상 카드');if(lockedDeck()){g.ch.money+=cardCash();return `전용 덱을 유지하고 카드 보상 대신 $${cardCash()}를 받았다.`;}if(equip&&g.ch.deck.length<data.rules.deckMax){g.ch.deck.push(id);return `「${data.cards[id].n}」을 덱에 넣었다.`;}g.ch.side.push(id);return `「${data.cards[id].n}」을 보관함에 넣었다. 덱 화면에서 장착할 수 있다.`;}
 function applyFx(fx={}){
  const notes=applyHiddenRouteFx(data,g,fx);
  if(fx.saintJourney){
   if(!g.expedition){g.expedition={id:'saint',startedAt:g.tick,actions:0,step:fx.saintJourney};g.history.push('레이스 기권 · 결승선 밖의 유해 여정 시작');}
   g.expedition.step=fx.saintJourney;
  }
  if(fx.hiddenEnding&&g.expedition?.id==='saint')g.pendingHiddenEnding=fx.hiddenEnding;
  if(['ride','explore','rest','town'].includes(fx.nextTravel))g.nextTravel=fx.nextTravel;
  for(const k of ['atk','spd','eva','maxHp','startBreath','startBleed'])if(fx[k]){g.ch.stats[k]=Math.max(k==='maxHp'?20:0,g.ch.stats[k]+fx[k]);if(k==='maxHp'&&fx[k]>0)g.ch.hp+=fx[k];notes.push((data.stats[k]||{maxHp:'최대 HP',startBreath:'시작 호흡',startBleed:'시작 출혈'}[k])+' '+(fx[k]>0?'+':'')+fx[k]);}
  if(fx.hp){const before=g.ch.hp;g.ch.hp=Math.max(1,Math.min(g.ch.stats.maxHp,g.ch.hp+fx.hp));notes.push('HP '+(g.ch.hp-before>=0?'+':'')+(g.ch.hp-before));}g.ch.hp=Math.min(g.ch.hp,g.ch.stats.maxHp);
  if(fx.money){g.ch.money=Math.max(0,g.ch.money+fx.money);notes.push('$'+(fx.money>0?'+':'')+fx.money);}
  for(const f of Array.isArray(fx.flag)?fx.flag:fx.flag?[fx.flag]:[]){g.ch.flags[f]=true;g.flagTicks[f]=g.tick;}
  for(const id of [...(fx.item?[fx.item]:[]),...(fx.items||[])])if(!g.items.includes(id)){const it=data.items[id];if(!it)throw Error('없는 소지품');g.items.push(id);notes.push('「'+it.n+'」 획득 · '+(it.slot?'장비에 보관':it.category==='quest'?'소지품에 보관':'경험 창에서 확인'));if(it.weaponCard)notes.push(grantCard(it.weaponCard));}
  for(const id of Array.isArray(fx.consumeItem)?fx.consumeItem:fx.consumeItem?[fx.consumeItem]:[]){g.items=g.items.filter(x=>x!==id);for(const slot of Object.keys(g.equipment))if(g.equipment[slot]===id)delete g.equipment[slot];}
  if(fx.route)g.routeResults[fx.route.id]=fx.route.result;
  for(const [k,n]of Object.entries(fx.count||{}))g.counters[k]=(g.counters[k]||0)+n;
  notes.push(...growItems(data,g));
  if(fx.awakenStand)notes.push(...awakenStand(data,g,fx.awakenStand,fx.standIdentity));
  if(fx.advanceDeck)notes.push(...advanceDeckGrowth(data,g,fx.advanceDeck));
  if(fx.dedicatedCards)notes.push(...grantDedicatedCards(data,g,fx.dedicatedCards));
  syncStandNames();
  if(fx.card)notes.push(grantCard(fx.card));
  if(fx.relic&&data.relics[fx.relic]?.sourceEnemy&&g.beaten.includes(data.relics[fx.relic].sourceEnemy)&&!g.relics.includes(fx.relic)){g.relics.push(fx.relic);notes.push(...applyFx(data.relics[fx.relic].fx),`「${data.relics[fx.relic].n}」 획득`);}
  return notes;
 }
 function travel(kind='ride'){
  if(g.mode!=='travel'||g.playback)return false;if(g.expedition)return openEvent(data.events.find(e=>e.id===g.expedition.step));const where=kind==='rest'?'camp':kind==='town'?'town':kind==='explore'||kind==='train'?'explore':'road';

  const early=availableEvents(where).find(e=>e.standAwakening&&e.guaranteed);if(early)return openEvent(early);
  const market=marketSchedule();if(g.tick>=market.nextTick){
   market.tick=g.tick;market.travel=kind;market.rareStock=[];const m=data.economy.market;
   if(stage()>=m.blackFrom&&rng()*100<m.blackChance){const pool=m.rare.filter(id=>data.items[id].from<=stage()&&!g.items.includes(id)&&!gearDominated(data,g,data.items[id]));while(pool.length&&market.rareStock.length<m.blackStock)market.rareStock.push(pool.splice(Math.floor(rng()*pool.length),1)[0]);}
   g.shopMessage='';g.event=m.event;g.mode='event';return true;
  }
  const hidden=hiddenRouteEvent(data,g);if(hidden&&(!encounterGrace()||!hidden.hiddenEnemy))return openEvent(hidden);
  const promised=promisedFollowup(data,g,availableEvents(where));if(promised)return openEvent(promised);
  if(['road','explore'].includes(where)){const ids=eligibleBosses();if(ids.length){const id=pick(ids),b=data.hiddenBosses.find(x=>x.id===id);if(rng()*100<b.chance){g.encounter=id;prepareOpponent(id);g.mode='omen';g.bossVisits[id]=visitKey();record(b.omen);return true;}}}
  if(['road','explore'].includes(where)){const ids=eligibleNamed();if(ids.length&&rng()*100<(data.encounterRules.namedChances?.filter(x=>x.from<=stage()).at(-1)?.chance??data.encounterRules.namedChance)){const id=pick(ids),b=data.namedEncounters.find(x=>x.id===id);g.encounter=id;prepareOpponent(id);g.mode='encounter';g.namedVisits??={};g.namedVisits[id]=visitKey();record(b.omen);return true;}}
  if(g.eventPoolStage[where]!==stage()){g.eventPools[where]=[];g.eventPoolStage[where]=stage();}
  const choices=availableEvents(where);if(choices.length){
   const priority=Math.max(...choices.map(e=>e.priority||0));let pool;
   if(priority>0)pool=choices.filter(e=>e.priority===priority);
   else{const bag=g.eventPools[where]??=[];pool=choices.filter(e=>bag.includes(e.id));if(!pool.length){g.eventPools[where]=choices.map(e=>e.id);pool=choices;}}
   const next=weighted(pool);g.eventPools[where]=(g.eventPools[where]||[]).filter(id=>id!==next.id);return openEvent(next);
  }
  record('낯선 흔적은 더 보이지 않았다. 호흡을 고르고 다음 길로 나아갔다.');applyFx({hp:where==='camp'?12:4});finishTick();return true;
 }
 function canChoice(c){const fx=c.ok?.fx||{};if(fx.saintJourney&&!g.expedition&&(!g.items.includes('saint_left_arm')||!g.ch.flags.saint_passed))return false;return (!fx.advanceDeck||canAdvanceDeck(data,g,fx.advanceDeck)&&g.ch.hp>-(fx.hp||0))&&(!fx.awakenStand||canAwakenStand(data,g)&&data.stands.choices.includes(fx.awakenStand))&&meets(c.req)&&canSpendFunds(g,c.cost===undefined?0:c.cost)&&choiceInfo(c).ok;}
 function successChance(c){return c.check?Math.min(100,Math.max(0,101-Math.ceil(c.check.dc-(g.ch.stats[c.check.s]||0)))):100;}
 function chooseEvent(index,{standName='',standLine=''}={}){
  if(g.mode!=='event'||g.playback)return false;const e=data.events.find(x=>x.id===g.event);if(e?.companionEvent){initializeCompanions(data,g);syncFollowups(data,g,meets);}const c=e?.c[index];if(e?.expedition&&g.expedition?.step!==e.id||g.expedition&&e?.id!==g.expedition.step)return false;if(!Number.isInteger(index)||!c||!hiddenEventAllowed(data,g,e)||e.retiredClue||g.followups?.[e.id]&&!eventTiming(e)||(e.hiddenGrowth||e.memoryKey)&&!eventTiming(e)||!meets(e.req)&&g.eventPermit!==e.id||e.once&&g.usedEvents.includes(e.id)||!canChoice(c))return false;
  if(e.shop){if(!canShop())return false;if(e.blackShop&&c.returnMarket){g.event=data.economy.market.event;return true;}const market=marketSchedule();market.nextTick=g.tick+data.economy.market.every;market.tick=null;market.rareStock=[];g.nextTravel=market.travel;delete market.travel;g.event=null;g.eventPermit=null;g.mode='travel';g.history.push('SBR 대회 보급소을 떠나 가던 길을 이어 갔다.');return true;}
  const identity=c.ok.fx.awakenStand?validateStandIdentity(standName,standLine):null;if(identity&&!identity.ok)return false;
  delete g.battleResult;
  if(g.followups?.[e.id]||e.memoryKey)g.lastFollowupTick=g.tick;
  if(!spendFunds(g,c.cost===undefined?0:c.cost))return false;g.usedEvents.push(e.id);g.recentEvents.push(e.id);g.eventTicks[e.id]=g.tick;const roll=c.check?1+Math.floor(rng()*100):null,bonus=c.check?g.ch.stats[c.check.s]||0:0,score=roll==null?null:roll+bonus,success=!c.check||score>=c.check.dc,result=success?c.ok:c.fail;
  rememberChoice(g,e,c,success);if(e.memoryKey&&g.choiceMemory[e.memoryKey])g.choiceMemory[e.memoryKey].done=true;
  const notes=applyFx(identity?{...result.fx,standIdentity:identity}:result.fx);delete g.standDraft;if(c.cost)notes.unshift(`비용 $${c.cost}`);g.lastCheck=c.check?{roll,stat:c.check.s,bonus,score,dc:c.check.dc,success}:null;record(e.t+'\n'+result.t+(notes.length?'\n'+notes.join(' · '):''));
  if(result.fx.combat){g.combatContext=typeof result.fx.combat==='object'?structuredClone(result.fx.combat):{};g.encounter=g.combatContext.enemy||spawnNormal();if(g.beaten.includes(g.encounter)){const notes=applyHiddenRouteFx(data,g,g.combatContext.winFx||{});g.combatContext=null;record('이미 끝난 대결의 결과를 이어받았다. 같은 상대와 다시 싸우지 않는다.\n'+notes.join(' · '));finishTick();return true;}return beginCombat();}if(g.expedition){finishTick();return true;}if(c.actionCost===0){g.event=null;g.eventPermit=null;g.mode='travel';}else finishTick();if(result.fx.form&&g.mode==='travel'){const next=typeof result.fx.form==='string'?result.fx.form:pickBirthEntry(data,'origins',1+Math.floor(rng()*100)).id;if(next!==g.origin){g.formOffer=next;g.mode='transition';}}return true;
 }
 function spawnNormal(){const available=eligible(),all=Object.keys(data.enemies).filter(id=>data.enemies[id].kind==='normal'&&inWindow(data.enemies[id]));const template=pick(available.length?available:all);if(!template)throw Error('일반 적 유형 없음');const id=template+'#'+(++g.serial),foe=structuredClone(data.enemies[template]);foe.template=template;foe.n=g.combatContext?.name||foe.n+' · 참가자 '+g.serial;if(g.combatContext?.story)foe.story=g.combatContext.story;if(g.combatContext?.objective?.type==='survive')foe.passive={id:'trial',rounds:g.combatContext.objective.rounds};g.spawned[id]=foe;E.D.enemies[id]=foe;return id;}
 function plan(){g.combat.ePlan=hiddenCombatPlan(data,g,g.combat,enemy(),opponentPlan(E,g.combat,enemy()),E.D.cards);}
 function beginCombat(){
  if(encounterGrace()||!enemy()||!canonAllowed(g.encounter)||g.beaten.includes(g.encounter))return false;delete g.battleResult;const foe=prepareOpponent(g.encounter);if(!g.seen.includes(g.encounter))g.seen.push(g.encounter);
  g.lastCheck=null;g.economy.supplyRound=0;g.supplyMessage=null;const C=E.mkCombat(g.ch,g.encounter,false);g.combat=C;g.mode='combat';g.lastRound=null;
  Object.assign(C.P,{...g.ch.stats,hp:g.ch.hp,maxHp:g.ch.stats.maxHp,breath:g.ch.stats.startBreath,bleed:g.ch.stats.startBleed,cg:structuredClone(playerCardGrade(data,g.tick)),shield:0,chargeLoss:0,skipTurns:0,actionBlocked:false});
  C.P.weaponDice=structuredClone(weaponDiceProfile(data,g));C.P.pdie=C.P.weaponDice?.die||6;C.P.wx=C.P.weaponDice?.min?{dice:[C.P.weaponDice.min,C.P.weaponDice.die||6]}:null;
  if(g.combatContext?.hiddenRoute&&g.hiddenRoute?.preparation){if(g.hiddenRoute.preparation==='attack')C.P.charge=Math.min(C.P.chargeCap,(C.P.charge||0)+3);else C.P.shield=10;delete g.hiddenRoute.preparation;}
  Object.assign(C.E,{shield:0,chargeLoss:0,skipTurns:0,actionBlocked:false});C.round=0;E.newRound(C);C.mindNote=[];C.rewardEquipmentVersion=1;C.uniqueEquipmentVersion=1;C.P.effects=activeEffects(data,g);C.companions=prepareCompanions(data,g,stage());C.companionVersion=2;plan();record(`${foe.n}과의 대결이 시작됐다.`);return true;
 }
 const allyCheck=(id=g?.encounter)=>companionJoinCheck(data,g,id);
 const canAlly=(id=g?.encounter)=>!!g&&companionJoinable(data,g,id,stage(),meets);
 function encounter(choice){
  if(g.playback||!['encounter','omen'].includes(g.mode))return false;const foe=enemy();if(!foe||!canonAllowed(g.encounter))return false;
  if(choice==='avoid'){delete g.battleResult;record(foe.kind==='boss'?'상대와 거리를 두고 레이스로 돌아갔다.':`${foe.n}과 거리를 두고 길을 나아갔다.`);finishTick();return true;}
  if(choice==='ally'){
   if(!canAlly())return false;delete g.battleResult;initializeCompanions(data,g);
   const id=g.encounter,companion=data.companions[id],check=allyCheck(),roll=1+Math.floor(rng()*100),score=roll+check.bonus,success=score>=check.dc,previous=activeCompanionIds(data,g)[0];
   g.lastCheck={roll,stat:check.s,bonus:check.bonus,score,dc:check.dc,success};
   if(success){
    g.allies.push(id);g.companionId=id;g.companionJoinedAt[id]=g.tick+1;delete g.companionRetryAt[id];
    const notes=applyFx(companion.joinFx);record('동행 제안 · 성공\n'+(companion.joinText||foe.n+'과 서로를 엄호하며 길을 함께하기로 했다.')+(previous?' '+data.companions[previous].n+'과는 각자의 길을 달린다.':'')+'\n'+notes.join(' · '));
   }else{
    g.companionRetryAt[id]=g.tick+1+data.rules.companion.retryActions;delete g.bossVisits[id];if(g.namedVisits)delete g.namedVisits[id];
    record('동행 제안 · 실패\n'+foe.n+'은 제안을 받아들이지 않고 자신의 길로 떠났다. 시간이 지난 뒤 길 위에서 다시 만날 수 있다.');
   }
   finishTick();return true;
  }
  if(choice!=='fight'||encounterGrace())return false;g.combatContext=null;return beginCombat();
 }
 function round(indices,{playback=false}={}){
  if(g.mode!=='combat'||g.playback)return false;const C=g.combat,unique=[...new Set(indices)];if(unique.some(i=>!Number.isInteger(i)||i<0||i>=C.P.hand.length))return false;
  const pp=unique.map(i=>E.D.cards[C.P.hand[i]]);if(pp.reduce((n,c)=>n+c.c,0)>C.P.light||C.P.actionBlocked&&pp.length)return false;syncCombatCompanions(data,g,C,stage());const ep=C.ePlan.slice();
  const entity=X=>({name:X.name,hp:X.hp,maxHp:X.maxHp,atk:X.atk,spd:X.spd,eva:X.eva,light:X.light,hand:X.hand?.slice(),cg:structuredClone(X.cg||null),weaponDice:structuredClone(X.weaponDice||null),...E.snap(C)[X.uid]});
  const resultBefore={money:g.ch.money,relics:g.relics.slice(),items:g.items.slice()},resultFoe=structuredClone(enemy()),resultContext=structuredClone(g.combatContext||{}),resultLocked=lockedDeck();
  const before=playback?{P:entity(C.P),E:entity(C.E),round:C.round,order:C.order.map(x=>({uid:x.uid})),ePlan:structuredClone(ep),tick:g.tick,relics:g.relics.slice(),items:g.items.slice(),itemLevels:{...g.itemLevels},counters:{...g.counters},itemNames:{...g.itemNames},equipment:{...g.equipment},stand:structuredClone(g.stand||null),objective:g.combatContext?.objective,historyLength:g.history.length,beaten:g.beaten.length}:null;
  E.resolveRound(C,pp,ep);checkTechniqueTrial(C,g.combatContext?.objective);attachEnemySpeeches(C,data,g.encounter,enemy().formId);attachPlayerSpeeches(C,data,g);g.counters.cards+=new Set(C.evs.filter(e=>e.card&&(e.side||e.att)==='P'&&e.step>=0).map(e=>e.step)).size;recordEquipmentUse(data,g,C.evs);const growth=[...growItems(data,g),...growStand(data,g,C.evs)];for(const note of growth){const line={t:'sys',s:note+' · 다음 행동부터 적용'};C.log.push(line);C.evs.at(-1)?.lines.push(line);}C.P.effects=combatEquipmentEffects(data,g,C);
  const summaries=C.evs.filter(e=>e.k==='atk').map(e=>`${e.att==='P'?g.name:enemy().n} · ${e.card.n} · ${e.hit?e.dmg+' 피해':'빗나감'}`);
  const supports=C.evs.filter(e=>e.k==='support').map(e=>'자동 지원 · '+e.lines.map(l=>l.s).join(' · '));
  g.lastRound={number:C.round,events:structuredClone(C.evs),lines:C.log.slice(C.logBefore||0).map(x=>x.s),summary:[...summaries.slice(supports.length?-2:-3),...supports].join('\n')||'서로의 움직임을 살피며 다음 공격을 준비했다.',enemySignature:ep.some(c=>c.sbrId===(enemy().signature||enemy().rewardCards[0]))};if(growth.length)g.lastRound.summary+='\n'+growth.join(' · ');C.logBefore=C.log.length;
  if(playback)g.playback={before,events:g.lastRound.events,cursor:0,phase:'announce'};
  if(C.over==='win')victory();else if(C.over==='lose'){if(g.combatContext?.nonlethal){g.ch.hp=Math.max(1,Math.floor(g.ch.stats.maxHp*.3));const notes=applyFx(g.combatContext.loseFx);record((g.expedition?'추격에 밀렸지만 유해의 여정은 계속된다.':g.combatContext?.objective?'시험을 마치지 못했지만 레이스는 계속된다.':'대결에서 밀려났지만 레이스는 계속된다.')+'\n'+(g.combatContext.loseText||'부족했던 움직임을 기록하고 몸을 추슬렀다.')+'\n'+notes.join(' · '));g.combat=null;g.combatContext=null;finishTick();}else{g.ch.hp=0;g.mode='retired';record('더는 말을 달릴 수 없었다. 이번 레이스는 여기에서 끝났지만, 남긴 발자취는 사라지지 않는다.');}}else{E.newRound(C);plan();}
  if(C.over)captureBattleResult(data,g,C,resultFoe,resultContext,resultBefore,C.over,{locked:resultLocked});return true;
 }
 function victory(){
  const id=g.encounter,foe=enemy();g.counters.wins++;const ctx=g.combatContext||{};g.ch.hp=Math.min(g.ch.stats.maxHp,g.combat.P.hp+recoveryAmount(data,g,'victory'));
  if(ctx.rewards===false){const notes=applyFx(ctx.winFx);record((g.expedition?'추격을 끊었다.\n':'시험을 통과했다.\n')+(ctx.winText||'익힌 동작을 실전에서 유지했다.')+'\n'+notes.join(' · '));g.combat=null;g.combatContext=null;finishTick();return;}
  if(!g.beaten.includes(id)){g.beaten.push(id);g.ch.beaten.push(id);g.ch.money+=foe.money;const notes=[...applyFx({relic:foe.kind==='boss'?foe.relic:null,flag:'beat_'+id}),...applyFx(ctx.winFx),...grantBossLoot(data,g,id,applyFx),...awardBossAchievements(data,g,id,foe)];for(const link of data.encounterLinks||[])if(link.from.includes(id)&&!g.beaten.some(x=>x!==id&&link.from.includes(x)))notes.push(link.text);setUnlockedDecks(Object.keys(g.achievementRecords||{}));g.offer=foe.rewardCards[0];record(`${foe.n}을 쓰러뜨렸다. ${ctx.winText||foe.story}\n${notes.join(' · ')} · 전투 보상 $${foe.money}`);}g.mode='reward';if(lockedDeck())completeReward('cash');
 }
 function reward(choice='card',skip=false){
  if(g.mode!=='reward'||g.playback||Number.isInteger(choice)&&data.cards[g.ch.deck[choice]]?.fixed)return false;return completeReward(choice,skip);
 }
 function completeReward(choice='card',skip=false){
  const battleMessage=g.message,resultCard=g.offer,resultChoice=lockedDeck()?'cash':skip?'skip':choice==='cash'?'cash':choice==='store'||!Number.isInteger(choice)&&g.ch.deck.length>=data.rules.deckMax?'store':'equip';
  if(g.offer&&lockedDeck()){g.ch.money+=cardCash();record('전용 덱 유지 · 카드 보상 대신 $'+cardCash()+'를 받았다.');}else if(!skip&&g.offer){if(choice==='cash'){g.ch.money+=cardCash();record(`덱은 그대로 두고 카드 보상 대신 $${cardCash()}를 받았다.`);}else if(choice==='store'||lockedDeck()){g.ch.side.push(g.offer);record(`덱은 그대로 두고 「${data.cards[g.offer].n}」을 보관함에 넣었다.`);}else if(Number.isInteger(choice)&&choice>=0&&choice<g.ch.deck.length){g.ch.side.push(g.ch.deck[choice]);g.ch.deck.splice(choice,1,g.offer);record(`「${data.cards[g.offer].n}」을 덱에 넣고 기존 카드는 보관했다.`);}else record(grantCard(g.offer,{equip:true}));}if(g.message!==battleMessage)g.message=battleMessage+'\n'+g.message;g.offer=null;g.combat=null;g.combatContext=null;finishTick();if(g.pendingLootForm){const next=g.pendingLootForm;delete g.pendingLootForm;if(g.mode==='travel'&&next!==g.origin&&!g.changed){g.formOffer=next;g.mode='transition';}}if(resultCard)updateBattleResult(g,{cardStatus:resultChoice,cardCash:resultChoice==='cash'?cardCash():0});return true;
 }
 function transform(origin){const pending=g.mode==='transition';if(g.playback||g.origin===origin||g.changed&&!pending)return false;if(!['travel','transition'].includes(g.mode)||pending&&g.formOffer!==origin||!data.starts.some(x=>x.id===origin))return false;delete g.battleResult;const next=data.starts.find(x=>x.id===origin),standOwned=[...g.ch.deck,...g.ch.side].filter(id=>data.cards[id]?.stand===g.stand?.type&&data.cards[id]?.stand);g.ch.side=g.ch.side.filter(id=>!data.cards[id]?.stand);if(next.hidden){const n=[...g.ch.deck,...g.ch.side].filter(id=>!data.cards[id]?.stand).length;g.ch.money+=n*cardCash();g.ch.side=[];g.history.push('전용 덱 전환 · 기존 카드 '+n+'장 자동 환전 $'+n*cardCash());}else g.ch.side.push(...g.ch.deck.filter(id=>!data.cards[id]?.stand));g.ch.side.push(...standOwned);g.ch.deck=next.deck.slice();delete g.ch.flags.free_deck;g.origin=origin;g.achievementDeck=null;g.deckVersion=data.deckUpgrade.version;g.deckEdited=false;delete g.deckNotice;g.formOffer=null;g.changed=true;initializeStand(data,g);initializeDedicatedRewards(data,g);syncStandNames();record('새로운 전투 방식을 받아들였다. 지금까지의 능력치와 경험을 간직한 채 다른 덱으로 달리기 시작했다.');if(pending)g.mode='travel';else finishTick();return true;}
 function declineForm(){if(g.playback||g.mode!=='transition')return false;delete g.battleResult;g.formOffer=null;g.mode='travel';record('새로운 힘을 받아들이지 않고 지금의 덱과 능력을 유지했다.');return true;}
 function transitionOffer(){if(g.mode!=='travel'||stage()<3||g.changed)return null;if(g.transitionOffer?.stage!==stage())g.transitionOffer={stage:stage(),origin:pickBirthEntry(data,'origins',1+Math.floor(rng()*100)).id};return g.transitionOffer;}
 // Old automatic draws could consume this once-only event without settling its gifts.
 function recoverSpringTrade(){
  if(g.combat||g.playback||!['travel','event','omen','encounter','finish-gate'].includes(g.mode)||!g.items.includes('spring_gifts')||g.routeResults.spring_trial||!g.usedEvents.includes('spring_barter'))return;
  g.usedEvents=g.usedEvents.filter(id=>id!=='spring_barter');g.recentEvents=g.recentEvents.filter(id=>id!=='spring_barter');
  delete g.eventTicks.spring_barter;delete g.followups?.spring_barter;
  g.history.push('지난 전투 종료로 막혔던 샘의 거래를 복구했습니다. 받은 재물은 유지되며 후속 사건에서 처분할 수 있습니다.');
 }
 function restore(saved){
  if(!restorableRaceSave(data,saved))return false;
  const previous=g,enemies={...E.D.enemies},names=Object.entries(E.D.cards).filter(([,c])=>c.stand).map(([id,c])=>[id,c.n]);
  try{return restoreUnchecked(saved);}catch{g=previous;E.D.enemies=enemies;for(const[id,n]of names)E.D.cards[id].n=n;return false;}
 }
 function restoreUnchecked(saved){
  if(!saved||saved.v!==1||!data.starts.some(x=>x.id===saved.origin))return false;g=structuredClone(saved);initializeHiddenRoute(data,g,rng,{legacy:true});repairFunds(data,g);initializeProgression(g,data);initializeCompanions(data,g);
  for(const id of data.removedEvents||[])delete g.followups?.[id];
  if(g.mode==='event'&&data.removedEvents?.includes(g.event)&&!g.combat&&!g.playback){g.event=null;g.eventPermit=null;g.mode='travel';}
  initializeEconomy(g);marketSchedule();for(const [id,foe]of Object.entries(g.spawned))E.D.enemies[id]=foe;for(const [id,foe]of Object.entries(g.opponents||{}))E.D.enemies[id]=foe;const legacy=!g.journeyVersion;g.ch.flags??={};g.ch.side??=[];g.usedEvents??=[];g.recentEvents??=[];g.bossVisits??={};g.event??=null;
  if(legacy){g.tick=Math.min(data.stages.length*length(),g.tick*2);g.journeyVersion=2;if(lockedDeck()){const o=data.starts.find(x=>x.id===g.origin),counts={};for(const id of o.deck)counts[id]=(counts[id]||0)+1;for(const id of g.ch.deck){if(counts[id])counts[id]--;else g.ch.side.push(id);}g.ch.deck=o.deck.slice();}if(g.mode==='encounter'&&data.enemies[g.encounter]?.kind==='boss'){g.mode='omen';g.ch.flags['route_'+g.encounter]=true;}}
  // A pre-update fight keeps its old deck and exact numbers until it finishes.
  if(g.combat&&!g.opponents?.[g.encounter]){const X=g.combat.E,stats=Object.fromEntries(['maxHp','atk','eva','spd','dmgB'].map(k=>[k,X[k]||0]));stats.hp=stats.maxHp;g.opponents??={};g.opponents[g.encounter]={...structuredClone(enemy()),...stats,deck:X.deck.slice(),sbrBalance:{version:0,tick:g.tick,stats}};E.D.enemies[g.encounter]=g.opponents[g.encounter];}
  if(g.combat){if(!g.playback)syncCombatCompanions(data,g,g.combat,stage());g.combat.ch=g.ch;g.combat.order=g.combat.order.map(x=>g.combat[x.uid]);for(const k of ['P','E'])g.combat[k].name=k==='P'?g.name:enemy().n;g.combat.P.effects=combatEquipmentEffects(data,g,g.combat);if(!g.combat.ePlan)plan();else g.combat.ePlan=g.combat.ePlan.map(c=>g.combatContext?.hiddenRoute?c:opponentCard(E.D.cards[c.sbrId]||Object.values(E.D.cards).find(x=>x.n===c.n)||c,enemy()));}if(g.mode==='reward'&&!g.battleResult&&g.combat?.over==='win')captureBattleResult(data,g,g.combat,enemy(),g.combatContext||{},{money:g.ch.money,relics:g.relics.slice(),items:g.items.slice()},'win');if(g.mode==='reward'&&lockedDeck()&&!g.playback)completeReward('cash');migrateDeck();migrateEconomy();initializeStand(data,g);initializeDedicatedRewards(data,g);syncStandNames();
  if(g.mode==='event'&&data.events.find(e=>e.id===g.event)?.standAwakening&&!canAwakenStand(data,g)){g.event=null;g.mode='travel';g.history.push('공용 스탠드 각성 사건을 정리하고 여정을 이어갑니다.');}
  recoverSpringTrade();syncFollowups(data,g,meets);
  if(g.expedition&&!g.combat&&!g.playback&&!['ending','retired'].includes(g.mode)&&(g.mode!=='event'||g.event!==g.expedition.step))openEvent(data.events.find(e=>e.id===g.expedition.step));
  if(g.mode==='event'&&!g.combat&&!g.playback){const e=data.events.find(e=>e.id===g.event);if(e&&(g.followups[e.id]&&!eventTiming(e)||e.companionEvent&&!meets(e.req))){g.event=null;g.eventPermit=null;g.mode='travel';g.history.push('후속 사건은 다른 여정을 거친 뒤 이어집니다.');}}
  delete g.pendingBoss;
  const oldEvent=data.events.find(e=>e.id===g.event);
  if(!g.combat&&!g.playback){
   if(g.mode==='event'&&oldEvent?.retiredClue){g.event=null;g.eventPermit=null;g.mode='travel';g.history.push('지난 단서 사건을 정리하고 레이스를 이어갑니다.');}
   const b=data.hiddenBosses.find(b=>b.id===g.encounter)||data.namedEncounters.find(b=>b.id===g.encounter);
   if(['omen','encounter'].includes(g.mode)&&b&&(!canonAllowed(b.id)||stage()<b.from||g.beaten.includes(b.id)||g.allies.includes(b.id))){g.encounter=null;g.mode='travel';g.history.push('지금 마주할 수 없는 상대의 전조를 정리했습니다.');}
  }
  const pending=data.events.find(e=>e.id===g.event);if(g.mode==='event'&&!g.combat&&!g.playback&&pending?.id==='junction_7'&&!meets(pending.req)){g.event=null;g.eventPermit=null;g.mode='travel';g.history.push('끝난 대결의 흔적을 지나 여정을 이어갑니다.');}if(g.mode==='event'&&!g.combat&&!g.playback&&pending?.hiddenGrowth&&!eventTiming(pending)){g.event=null;g.eventPermit=null;g.mode='travel';g.history.push('전용 수련은 여정을 더 이어간 뒤 다시 찾아옵니다.');}
  initializeLoot(data,g,applyFx);initializePlayerSupport(data,g);setUnlockedDecks(Object.keys(achievementEvidence(data,g)));return true;
 }
 function canEditCard(id){const c=data.cards[id];return !!g&&outsideCombat()&&!!c&&(!c.stand||c.stand===g.stand?.type);}
 function canRemoveCard(i){return !!g&&Number.isInteger(i)&&i>=0&&i<g.ch.deck.length&&g.ch.deck.length>data.rules.deckMin&&canEditCard(g.ch.deck[i]);}
 function canInsertCard(i){return !!g&&Number.isInteger(i)&&i>=0&&i<g.ch.side.length&&g.ch.deck.length<data.rules.deckMax&&canEditCard(g.ch.side[i]);}
 function canSwapCard(di,si){return !!g&&[di,si].every(Number.isInteger)&&di>=0&&di<g.ch.deck.length&&si>=0&&si<g.ch.side.length&&canEditCard(g.ch.deck[di])&&canEditCard(g.ch.side[si]);}
 function removeCard(i){if(!canRemoveCard(i))return false;g.ch.side.push(g.ch.deck.splice(i,1)[0]);g.deckEdited=true;return true;}
 function insertCard(i){if(!canInsertCard(i))return false;g.ch.deck.push(g.ch.side.splice(i,1)[0]);g.deckEdited=true;return true;}
 function swapCard(di,si){if(!canSwapCard(di,si))return false;[g.ch.deck[di],g.ch.side[si]]=[g.ch.side[si],g.ch.deck[di]];g.deckEdited=true;return true;}
 function sellCard(i){if(!outsideCombat()||!Number.isInteger(i)||i<0||i>=g.ch.side.length||data.cards[g.ch.side[i]]?.fixed||data.cards[g.ch.side[i]]?.stand)return false;g.ch.side.splice(i,1);g.ch.money+=cardCash();return true;}
 function setItemName(id,name){
  const it=data.items[id];if(!outsideCombat()||!g.items.includes(id)||!it?.customName)return {ok:false,error:'지금은 이 장비의 이름을 변경할 수 없습니다.'};
  const x=validateStandIdentity(name);if(!x.ok)return {ok:false,error:'장비 이름은 줄바꿈 없이 20자 이내로 입력하십시오.'};
  if(x.name)g.itemNames[id]=x.name;else delete g.itemNames[id];return {ok:true};
 }
 function equipItem(id){const it=data.items[id];if(!outsideCombat()||!g.items.includes(id)||!it?.slot)return false;changeEquipment(data,g,it.slot,id);record('「'+it.n+'」 장착 · 이전 장비는 소지품에 보관했다.');return true;}
 function unequipItem(id){const it=data.items[id];if(!outsideCombat()||!it?.slot||g.equipment[it.slot]!==id)return false;changeEquipment(data,g,it.slot);record('「'+it.n+'」 해제 · 소지품에서 다시 장착할 수 있습니다.');return true;}
 function finishPlayback(){if(!g?.playback)return false;delete g.playback;if(g.combat)syncCombatCompanions(data,g,g.combat,stage());recoverSpringTrade();if(g.mode==='reward'&&lockedDeck())completeReward('cash');initializePlayerSupport(data,g);migrateDeck();migrateEconomy();initializeProgression(g,data);initializeStand(data,g);initializeDedicatedRewards(data,g);initializeLoot(data,g,applyFx);return true;}
 function setCompanion(id=null){
  if(!g||!outsideCombat()||id!==null&&!companionCandidates(data,g).includes(id))return false;
  initializeCompanions(data,g);if(g.companionId===id)return false;g.companionId=id;
  const pending=data.events.find(e=>e.id===g.event);if(pending?.companionEvent&&!meets(pending.req)){g.event=null;g.eventPermit=null;g.mode='travel';}
  g.history.push(id?data.companions[id].n+'과 동행한다.':'홀로 레이스를 이어 간다.');return true;
 }
 return {allyCheck,setCompanion,canAlly,setTechniqueLine,encounterGrace,finishRace,finishRank,extendRace,flee,setUnlockedDecks,setItemName,itemName:id=>itemName(data,g,id),canVisitTrader,visitTrader,canShop,canEditCard,canRemoveCard,canInsertCard,canSwapCard,setStandIdentity,cardName,shop,buy,sellable,sellItem,sellItems,inferiorSales,supplyInfo,useSupply,choiceInfo,enemy,equipItem,unequipItem,start,stage,eligible,eligibleBosses,eligibleNamed,availableEvents,meets,canChoice,successChance,chooseEvent,travel,encounter,round,reward,finishPlayback,transform,declineForm,transitionOffer,restore,removeCard,insertCard,swapCard,sellCard,lockedDeck,cardCash,get state(){return g;},engine:E};
}
