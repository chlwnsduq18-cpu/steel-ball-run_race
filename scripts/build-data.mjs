import {expandMajorBossQuotes} from '../data/major-quote-variants-data.mjs';
import {addHiddenBossQuotes} from '../data/hidden-boss-quotes-data.mjs';
import {rebuildHiddenBosses} from '../data/hidden-boss-remake-data.mjs';
import {addRewardEquipment} from '../data/reward-equipment-data.mjs';
import {addNarrativeDepth} from '../data/narrative-depth-data.mjs';
import {addHiddenRoutes} from '../data/hidden-routes-data.mjs';
import {addChoiceMemory} from '../data/choice-memory-data.mjs';
import {addUniqueEquipment} from '../data/unique-equipment-data.mjs';
import {addCombatEquipment} from '../data/combat-equipment-data.mjs';
import {addCanonItems} from '../data/canon-items-data.mjs';
import {addCompanionData} from '../data/companions-data.mjs';
import {validateEconomyCatalog} from '../dist/src/economy.js';
import {addPlayerQuoteData} from '../data/player-quotes-data.mjs';
import {addExpandedBirthEconomy} from '../data/expanded-birth-economy-data.mjs';
import {addCorpseJourney} from '../data/corpse-journey-data.mjs';
import {addFormDecks} from '../data/form-decks-data.mjs';
import {addMajorBossDecks} from '../data/major-boss-decks-data.mjs';
import {addRepresentativeQuotes} from '../data/representative-quotes-data.mjs';
import {addFollowupData} from '../data/followup-data.mjs';
import {addCanonEncounterData} from '../data/canon-encounter-data.mjs';
import {addEventValueData} from '../data/event-value-data.mjs';
import {addQuoteExpansion} from '../data/quote-expansion-data.mjs';
import {addJourneyPacingData} from '../data/journey-pacing-data.mjs';
import {addThreatData} from '../data/threat-data.mjs';
import {addMarketData} from '../data/market-data.mjs';
import {PATCH_NOTES} from '../dist/src/patch-notes.js';
import {addPlayerSupportData} from '../data/player-support-data.mjs';
import {addAchievementData} from '../data/achievement-data.mjs';
import {addDeckGrowthData} from '../data/deck-growth-data.mjs';
import {addDedicatedDeckData} from '../data/dedicated-deck-data.mjs';
import {addEncounterData} from '../data/encounter-data.mjs';
import {addWorldData} from '../data/world-data.mjs';
import {addLootData} from '../data/loot-data.mjs';
import {addInterfaceData} from '../data/interface-data.mjs';
import fs from 'node:fs';
import {addBirthData} from '../data/birth-data.mjs';
import {addJourneyData} from '../data/journey-data.mjs';
import {addProgressionData} from '../data/progression-data.mjs';
import {addChoiceData} from '../data/choice-data.mjs';
import {addDeckData} from '../data/deck-data.mjs';
import {addEconomyData} from '../data/economy-data.mjs';
import {addStandData} from '../data/stand-data.mjs';
import {addHiddenGrowthData} from '../data/hidden-growth-data.mjs';
const root=new URL('../',import.meta.url),out=new URL('dist/',root);
const read=p=>JSON.parse(fs.readFileSync(new URL(p,root),'utf8'));
const pack=read('inputs/common-cards.json');
const rename=s=>s.replaceAll('충전','기세').replaceAll('파열','취약').replaceAll('침잠','위축');
const data={version:PATCH_NOTES[0].version,source:pack.source,stats:{atk:'공격',spd:'속도',eva:'회피'},keywords:{
 charge:{n:'기세',d:'공격 준비를 쌓는 공통 자원. 소비 카드가 가진 만큼 사용해 피해를 강화한다.'},
 bleed:{n:'출혈',d:'공격의 각 타격 직전에 수치만큼 피해를 받고 1 감소한다. 빗나가도 발동한다.'},
 breath:{n:'호흡',d:'1~3: 회피 +5. 4 이상: 치명 확률 증가. 10 이상: 확정 치명. 최대 12, 다음 턴부터 2 감소.'},
 rupture:{n:'취약',d:'적중당할 때 수치만큼 추가 피해를 받고 1 감소한다.'},
 sink:{n:'위축',d:'3당 명중 -6, 주는 피해 -1. 턴 종료 시 1 감소한다.'},
 burn:{n:'화상',d:'턴 종료 시 수치의 2배 피해를 받고 수치가 절반으로 감소한다.'},
 shield:{n:'보호막',d:'받는 피해를 수치만큼 먼저 흡수한다. 최대 150.'},
 skipTurns:{n:'행동 불가',d:'표시된 횟수만큼 다음 행동 턴을 건너뛴다. 버프와 지속 피해는 공통 턴 규칙대로 경과한다.'}
},cards:structuredClone(pack.cards),starts:pack.decks.map((d,i)=>({id:d.id,n:d.title,hidden:i>0,focus:rename(d.focus),deck:d.deck,stats:{atk:24+(i===0?4:0),spd:6+(i===8?4:0),eva:10+(i===6?4:0)}})),
 stages:[['샌디에이고','출발선 너머의 해안'],['사막 횡단','모래와 바위 사이의 발자국'],['모뉴먼트 밸리','기묘한 흔적이 남은 땅'],['록키 산맥','고도를 높이는 길'],['캔자스시티','길이 교차하는 도시'],['시카고','비와 안개 속의 추격'],['동부로 향하는 길','결승을 앞둔 선택'],['뉴저지','바다 건너 보이는 목적지'],['뉴욕','자신의 레이스를 마칠 곳']].map(([n,d],i)=>({id:i+1,n,d,turns:4})),
 enemies:{},relics:{},rules:{turnsPerStage:4,encounterChance:.52,deckMin:6,deckMax:12,scope:'원작 여정을 9구간으로 압축한 개발판. 카드 효과와 사건은 팬게임용 해석.'}};
for(const c of Object.values(data.cards))c.d=rename(c.d);
data.starts.find(x=>x.id==='time').focus='기세 · 상대 턴 건너뛰기';
const add=(id,n,c,t,x,d)=>{data.cards[id]={n,c,t,...(t==='atk'?{hits:1,dice:1,b:0,hit:5}:{}),...x,d};return id;};
add('sbr_time_stop','시간정지',3,'buff',{skipTurns:2,once:true},'상대의 다음 2턴 행동 불가. 전투당 한 번.');
data.starts.find(x=>x.id==='time').deck.splice(0,1,'sbr_time_stop');
const special=[
 ['gyro','자이로 체펠리','철구의 회전',0,1,9,{hits:2,dice:1,spend:3,fixPer:3,kw:[['rupture',1,'t']]},'기세 최대 3 소비 · 소비당 각 적중 피해 +3 · 취약 +1씩','회전 대처 경험',{eva:2},'회전을 읽어 공격을 흘리는 법을 익혔다.'],
 ['johnny','죠니 죠스타','손톱탄의 궤도',0,1,9,{hits:3,dice:1,kw:[['rupture',1,'t']]},'3회 공격 · 적중마다 취약 +1','궤도 대처 경험',{atk:2},'멀리서 날아오는 공격의 궤도를 좇았다.'],
 ['diego','디에고 브란도','공룡의 발톱',0,1,9,{hits:2,dice:1,kw:[['bleed',2,'t']]},'2회 공격 · 적중마다 출혈 +2','맹습 대처 경험',{spd:2},'빠른 습격 속에서도 움직임을 잃지 않았다.'],
 ['hotpants','핫 팬츠','크림 스타터의 응급처치',1,2,9,{heal:12,cleanseRand:3},'HP +12 · 지속 피해 상태 하나를 3 감소','회복전 대처 경험',{maxHp:8},'상처를 추스르며 싸움을 이어가는 법을 배웠다.'],
 ['mountain','마운틴 팀','로프의 포위',0,1,6,{hits:1,dice:2,kw:[['rupture',3,'t']]},'2d6 공격 · 취약 +3','포위 대처 경험',{eva:2},'좁혀 오는 공격 사이의 틈을 찾았다.'],
 ['oye','오예코모바','폭발하는 접촉',0,2,6,{hits:2,dice:1,kw:[['burn',2,'t']]},'2회 공격 · 적중마다 화상 +2','폭발 대처 경험',{maxHp:8},'예고 없이 터지는 공격을 견뎠다.'],
 ['ringo','링고 로드어게인','다시 잡은 조준',1,3,8,{heal:8,passNext:15,cleanseRand:2},'HP +8 · 다음 턴 명중 +15 · 지속 피해 상태 하나를 2 감소','결투 경험',{atk:2},'한 번의 결투를 끝까지 마주했다.'],
 ['sandman','샌드맨','다가오는 소리',0,3,9,{hits:3,dice:1,kw:[['sink',1,'t']]},'3회 공격 · 적중마다 위축 +1','소리 공격 대처 경험',{spd:2},'보이지 않는 공격의 징후를 감지했다.'],
 ['blackmore','블랙모어','빗방울의 사각',0,4,9,{hits:2,dice:1,hit:20,kw:[['bleed',1,'t']]},'2회 공격 · 명중 +20 · 적중마다 출혈 +1','우중 전투 경험',{eva:2},'비가 가리는 시야 속에서 살아남았다.'],
 ['wekapipo','웨카피포','렉킹 볼의 사각',0,4,9,{hits:1,dice:2,kw:[['sink',6,'t']]},'2d6 공격 · 위축 +6','사각 대처 경험',{atk:2},'감각을 흐리는 공격에 대응했다.'],
 ['magenta','마젠트 마젠트','끝까지 버티는 자세',1,4,9,{shield:18},'보호막 +18','인내의 경험',{maxHp:10},'공격을 견뎌야 할 순간을 배웠다.'],
 ['valentine','퍼니 밸런타인','평행세계의 협공',0,6,9,{hits:3,dice:2,hit:10},'3회 × 2d6 공격 · 명중 +10','협공 대처 경험',{atk:3},'여러 방향의 위협 속에서 자신의 길을 지켰다.'],
 ['otherdiego','평행세계의 디에고','멈춘 시간',1,7,9,{skipTurns:1,once:true},'상대의 다음 1턴 행동 불가. 전투당 한 번.','정지 대처 경험',{spd:3},'행동할 수 없는 순간을 겪고도 앞으로 나아갔다.']
];
for(const [i,s]of special.entries()){
 const [id,n,cn,type,from,to,fx,desc,rn,rfx,story]=s,cid='sbr_enemy_'+id;
 const reward=add(cid,cn,3,type?'buff':'atk',fx,desc);
 const base=data.starts[{gyro:0,johnny:0,diego:3,hotpants:7,mountain:6,oye:4,ringo:5,sandman:1,blackmore:8,wekapipo:1,magenta:4,valentine:8,otherdiego:9}[id]].deck;
 const attacks=[...new Set(base)].filter(id=>data.cards[id].t==='atk');
 const support=[...new Set(base)].find(id=>data.cards[id].t!=='atk'&&!data.cards[id].skipTurns);
 data.enemies[id]={n,ability:cn,hp:34+from*5,atk:16+from*2,eva:5+from,spd:5+from,evadeDie:75,deck:[reward,...attacks,...attacks,...(support?[support]:[])],rewardCards:[reward],relic:id,from,to,story};
 data.relics[id]={n:rn,fx:rfx,d:Object.entries(rfx).map(([k,v])=>(data.stats[k]||'최대 HP')+' +'+v).join(' · ')};
}
data.quotes={}; // Verified Korean excerpts are authored in encounter-data.mjs.
addBirthData(data);
addJourneyData(data);
addProgressionData(data);
addChoiceData(data);
addDeckData(data);
addEconomyData(data);
addStandData(data);
addHiddenGrowthData(data);
addLootData(data);
addWorldData(data);
addEncounterData(data);
addAchievementData(data);
addDeckGrowthData(data);
addDedicatedDeckData(data);
for(const [id,c]of Object.entries(data.cards))c.sbrId=id;
addInterfaceData(data);
addMarketData(data);addThreatData(data);addJourneyPacingData(data);
addPlayerSupportData(data);addQuoteExpansion(data);addEventValueData(data);addCanonEncounterData(data);addFollowupData(data);addRepresentativeQuotes(data);addMajorBossDecks(data);addFormDecks(data);addExpandedBirthEconomy(data);addCorpseJourney(data);addPlayerQuoteData(data);addCompanionData(data);addCanonItems(data);addCombatEquipment(data);addRewardEquipment(data);addUniqueEquipment(data);addChoiceMemory(data);addNarrativeDepth(data);validateEconomyCatalog(data);
// Adapter retains the upstream resolver. SBR uses common labels, tuning, turn skips,
// data-driven effects, and suppression of unrelated Project Moon mental transformations.
let engine="import {equipmentCondition} from './effect-conditions.js';\n"+fs.readFileSync(new URL('inputs/engine.js',root),'utf8').replace(/\r\n/g,'\n');
const replace=(a,b)=>{if(!engine.includes(a))throw Error('missing hook: '+a.slice(0,70));engine=engine.replace(a,b);};
replace('function loseMind(ch,n,out){','function loseMind(ch,n,out){\n    if(ch.sbr)return;');
replace('const f=X=>({hunger:', 'const f=X=>({evaB:X.evaB||0,passHit:X.passHit||0,charge:X.charge||0,sink:X.sink||0,skipTurns:X.skipTurns||0,actionBlocked:!!X.actionBlocked,hunger:');
replace("C.step=-1;push({k:'head'});", "for(const X of [P,E])if(X.actionBlocked)L('sys',`${X.name} · 행동 불가 · 이번 턴 행동을 건너뛴다`);\n    C.step=-1;push({k:'head'});");
replace("else if(E.passive&&E.passive.id==='trial'&&C.round>=E.passive.rounds)C.over='win';", "else if(E.passive&&E.passive.id==='trial'&&C.round>=E.passive.rounds)C.over='win';\n    push({k:'end'});");
replace('function act(C,A,c,L,push){',`function trigger(C,side,on,L,card=null){
 const A=C[side];if(!A||A.hp<=0)return;C.effectUses??={};
 for(const [i,p]of (A.effects||[]).entries()){
  if(p.on!==on||!equipmentCondition(C,A,p,card))continue;const identity=p.id||i,key=C.round+':'+side+':'+identity,battleKey='battle:'+side+':'+identity;if((C.effectUses[key]||0)>=(p.limit||1)||p.battleLimit&&(C.effectUses[battleKey]||0)>=p.battleLimit)continue;
  const B=C[p.to==='opponent'?(side==='P'?'E':'P'):side];if(B.hp<=0)continue;C.effectUses[key]=(C.effectUses[key]||0)+1;if(p.battleLimit)C.effectUses[battleKey]=(C.effectUses[battleKey]||0)+1;
  if(p.label)L('kw',p.source+' · '+p.label);
  for(const [k,v]of Object.entries(p.consume||{})){A[k]-=v;L('kw',A.name+' · '+(D.keywords[k]?.n||k)+' −'+v+' (남은 '+A[k]+')');}
  for(const [k,v]of Object.entries(p.fx)){const before=B[k]||0;
   if(k==='hp')B.hp=Math.min(B.maxHp,B.hp+v);else if(['charge','breath','shield','bleed','burn','rupture','sink'].includes(k))B[k]=Math.min(k==='breath'?CFG.breath.cap:k==='shield'?CFG.shieldCap:k==='charge'?B.chargeCap:k==='burn'?CFG.burn.max:k==='rupture'?CFG.rupture.max:CFG.stackCap,before+v);else continue;
   L('kw',p.source+' · '+B.name+' · '+(D.keywords[k]?.n||'HP')+' +'+(B[k]-before));
  }
 }
}
function act(C,A,c,L,push){`);
replace('C.step=-1;push({k:\'head\'});',"if(C.round===1)trigger(C,'P','battleStart',L);trigger(C,'P','roundStart',L);C.step=-1;push({k:'head'});");
replace("push({k:'def',side:A.uid,card:c});","trigger(C,A.uid,'defense',L);push({k:'def',side:A.uid,card:c});");
replace('push(Object.assign(base,{hit:true,rolls,',"trigger(C,A.uid,'hit',L,c);if(dmg>0)trigger(C,B.uid,'hurt',L);push(Object.assign(base,{hit:true,rolls,");
replace('return {D,d,reseed','return {trigger,D,d,reseed');
replace('function act(C,A,c,L,push){','function act(C,A,c,L,push){\n    if(c.once){const id=Object.keys(D.cards).find(k=>D.cards[k]===c);A.usedOnce=A.usedOnce||[];if(A.usedOnce.includes(id))return;A.usedOnce.push(id);}');
replace('C.round++;','C.round++;\n    for(const X of [C.P,C.E]){X.actionBlocked=(X.skipTurns||0)>0;if(X.actionBlocked)X.skipTurns--;}');
replace('const {P,E}=C;\n    C.cur=[];C.evs=[];','const {P,E}=C;\n    if(P.actionBlocked)pp=[];if(E.actionBlocked)ep=[];\n    C.cur=[];C.evs=[];');
replace('X.guarding=plays.length===0&&!X.stunned;','X.guarding=plays.length===0&&!X.stunned&&!X.actionBlocked;');
replace("if(c.t==='buff'){if(c.serum)","if(c.t==='buff'){if(c.skipTurns){B.skipTurns=Math.min(9,(B.skipTurns||0)+c.skipTurns);L('kw',`${B.name} · 다음 ${c.skipTurns}턴 행동 불가`)}if(c.serum)");
// Whole-turn bonuses are committed before the head snapshot, without moving attacks.
replace("C.step=-1;push({k:'head'});",`P.evaB=E.evaB=0;C.step=-1;const turnOnce=new Set();
    for(const X of C.order)for(const c of (X.uid==='P'?pp:ep)){
      if(!c.turnStart||X.hp<=0||X.actionBlocked)continue;
      const id=Object.keys(D.cards).find(k=>D.cards[k]===c);if(c.once){const key=X.uid+':'+id;if((X.usedOnce||[]).includes(id)||turnOnce.has(key))continue;turnOnce.add(key);}
      const ev=(c.turnStart.eva||0)+(c.t==='def'?(X.defUp||0)+(X.prescPlus||0):0),hit=c.turnStart.hit||0;
      X.evaB+=ev;X.passHit+=hit;
      L('kw',X.name+' · '+c.n+' · 턴 시작 효과'+(ev?' · 이번 턴 회피 +'+ev:'')+(hit?' · 이번 턴 명중 +'+hit:''));
      push({k:'turnStart',side:X.uid,card:c});
    }
    push({k:'head'});`);
replace('    P.evaB=E.evaB=0;\n    if(C.escort)', '    if(C.escort)');
replace('if(c.selfHit)A.passHit+=c.selfHit;const ev=(c.eva||CFG.defBonus)+A.defUp+(A.prescPlus||0);A.evaB+=ev;', 'if(!c.turnStart&&c.selfHit)A.passHit+=c.selfHit;const ev=(c.eva||CFG.defBonus)+A.defUp+(A.prescPlus||0);if(!c.turnStart)A.evaB+=ev;');
replace("L('sys',`${A.name} · ${c.n} · 이번 라운드 회피 +${ev}","L('sys',`${A.name} · ${c.n} · ${c.turnStart?'턴 시작 효과 적용됨':'이번 라운드 회피 +'+ev}");
replace('C.round++;\n', 'C.round++;\n    C.P.evaB=C.E.evaB=0;\n');
// Keep the upstream entity/resolver; adapt its progress scale to a 72-action race.
replace('    /* 무한 모드에서도 적의 명중·회피는 enemyMax에서 멈춘다 */', '    if(e.sbrBalance)Object.assign(E,e.sbrBalance.stats);\n    /* 무한 모드에서도 적의 명중·회피는 enemyMax에서 멈춘다 */');
// Automatic race card grades apply to explicit die sizes as well.
replace('(gr&&!c.die?gr.dice:0)','(gr?gr.dice:0)');
replace('b:c.b,guard:B.guarding','b:c.b+(gr?gr.b:0),guard:B.guarding');
// Companion actions are separate resolver events, outside both card queues.
replace("push({k:'head'});", "push({k:'head'});resolveCompanionSupport(C,'roundStart',L,push,()=>d(100),D);");
replace("push(Object.assign(base,{hit:true,rolls,rolls2:spR,ally2:spR?C.ally.name:null,dmg,note}));", "push(Object.assign(base,{hit:true,rolls,rolls2:spR,ally2:spR?C.ally.name:null,dmg,note}));if(A.uid==='P')resolveCompanionSupport(C,'afterHit',L,push,()=>d(100),D);if(B.uid==='P'&&dmg>0)resolveCompanionSupport(C,'hurt',L,push,()=>d(100),D);");
replace('C.step=i;const A=C[st.side],c=st.card;', 'C.step=i;const A=C[st.side],c=st.card;if(P.hp<=0||E.hp<=0)return;');
// Bounded suppression: every application path shares the same cap and decay.
engine=engine.replaceAll("k==='rupture'?CFG.rupture.max:","k==='rupture'?CFG.rupture.max:k==='sink'?CFG.sink.cap:");
replace("for(const k of ['prescript','warp','shock','chain','web','sink'])if(X[k]>0)X[k]--", "for(const k of ['prescript','warp','shock','chain','web'])if(X[k]>0)X[k]--;if(X.sink>0)X.sink=Math.floor(Math.min(CFG.sink.cap,X.sink)*CFG.sink.keep)");
replace("const {P,E}=C;\n    if(P.actionBlocked)pp=[];", "const {P,E}=C;\n    for(const X of [P,E])X.sink=Math.min(CFG.sink.cap,Math.max(0,X.sink||0));\n    if(P.actionBlocked)pp=[];");
// Preserve upstream weapon die/minimum behavior; extra dice also use explicit card faces.
replace('const n=Math.max(wd[0],c.dice)+(gr?gr.dice:0);','const n=Math.max(wd[0],c.dice)+(gr?gr.dice:0)+(A.weaponDice?.add||0);');
replace('for(let i=0;i<c.dice+ex+(c.fsDice&&fsb?c.fsDice:0)+(gr?gr.dice:0);i++)','for(let i=0;i<c.dice+ex+(c.fsDice&&fsb?c.fsDice:0)+(gr?gr.dice:0)+(A.weaponDice?.add||0);i++)');
engine="import {resolveCompanionSupport} from './companions.js';\n"+engine;
engine=rename(engine).replaceAll('빛','행동력').replaceAll('골단 · 호흡','호흡');
let config=fs.readFileSync(new URL('inputs/config.js',root),'utf8');
config+='\n// SBR common tuning: no player/enemy asymmetry for burn.\nCFG.burn.dmg=CFG.burn.dmgMe=2;CFG.burn.foe=1;\n';
config+='\nObject.assign(CFG.sink,'+JSON.stringify(data.combatTuning.sink)+');\n';
const runtime=read('inputs/original-runtime.json');Object.assign(runtime.cards,data.cards);Object.assign(runtime.enemies,data.enemies);
for(const [k,v]of Object.entries(data.keywords))runtime.keywords[k]={n:v.n};
addHiddenRoutes(data);
rebuildHiddenBosses(data);
addHiddenBossQuotes(data);expandMajorBossQuotes(data);
Object.assign(runtime.cards,data.cards);Object.assign(runtime.enemies,data.enemies);
engine=engine.replace('before+v);else continue;', 'Math.max(0,before+v));else continue;');
engine="import {hiddenBeforeRound,hiddenAfterRound} from './hidden-routes.js';\n"+engine;
engine=engine.replace("L('head',`— ${C.round}라운드 · ${C.order[0].name} 선공 —`);", "({pp,ep}=hiddenBeforeRound(C,pp,ep,L));L('head',`— ${C.round}라운드 · ${C.order[0].name} 선공 —`);");
engine=engine.replace('    /* 인연의 추가 공격 */', '    hiddenAfterRound(C,L,push);\n    /* 인연의 추가 공격 */');
engine=engine.replace('function hpLoss(C,X,x,L){','function hpLoss(C,X,x,L){\n if(X.hiddenInvulnerable)return;');
engine=engine.replace('      /* 방어 자세: 막아도 피해 guardHit는 받는다 (키워드는 붙지 않음) */', "      if(B.hiddenInvulnerable){L('kw',B.name+' · 방어 자세로 공격 무효');push(Object.assign(base,{hit:false,blocked:true,rolls:[],dmg:0,note:'방어 자세'}));continue;}\n      /* 방어 자세: 막아도 피해 guardHit는 받는다 (키워드는 붙지 않음) */");
engine=engine.replaceAll("const id=Object.keys(D.cards).find(k=>D.cards[k]===c);","const id=c.sbrId||Object.keys(D.cards).find(k=>D.cards[k]===c);");
fs.writeFileSync(new URL('game-data.json',out),JSON.stringify(data,null,2));
fs.writeFileSync(new URL('runtime-base.json',out),JSON.stringify(runtime));
fs.writeFileSync(new URL('src/engine.js',out),engine);fs.writeFileSync(new URL('src/config.js',out),config);
console.log(JSON.stringify({cards:Object.keys(data.cards).length,starts:data.starts.length,enemies:Object.keys(data.enemies).length,sharedKeywords:Object.values(data.keywords).map(x=>x.n)}));
