import '../scripts/prepare-reports.mjs';
import fs from 'node:fs';
import assert from 'node:assert/strict';
import {createRace} from '../src/race.js';
import {mulberry32} from '../src/engine.js';
import {playerCardGrade,visibleCardGrade,gradedPlayerCard,playerSupportBonus,initializePlayerSupport} from '../src/player-support.js';
const D=JSON.parse(fs.readFileSync('game-data.json','utf8')),R=JSON.parse(fs.readFileSync('runtime-base.json','utf8'));
const old=JSON.parse(fs.readFileSync('fixtures/player-growth-v0241.json','utf8'));
const checks=[],test=(n,f)=>{try{f();checks.push({n,ok:true});}catch(e){checks.push({n,ok:false,error:e.stack});}};
const make=(tick=0,origin='ranch',preset)=>{
 const r=createRace(D,R,{rng:mulberry32(99),unlockedDecks:Object.keys(D.achievementDecks)});
 r.start('성장 검증',{origins:origin,talents:'steady',flaws:'weak_condition',weapons:'revolver',achievementDeck:preset});
 const g=structuredClone(r.state);g.tick=tick;r.restore(g);return r;
};
const fight=(r,id='gyro')=>{r.state.mode='encounter';r.state.encounter=id;assert(r.encounter('fight'));return r.state.combat;};
const settle=(r,playback=false)=>{
 const C=r.state.combat;C.P.hp=C.P.maxHp=10000;C.P.atk=300;C.P.hand=['sbr_basic_shoot'];C.P.light=3;C.E.hp=1;C.E.eva=-300;C.ePlan=[];
 assert(r.round([0],{playback}));if(playback)r.finishPlayback();if(r.state.mode==='reward')assert(r.reward('cash'));
};

test('강화 단계 경계는 3·5·7구간이며 이전 단계와 중첩되지 않음',()=>{
 for(const [tick,tier]of [[0,0],[15,0],[16,1],[31,1],[32,2],[47,2],[48,3],[71,3],[999,3]])assert.equal(playerCardGrade(D,tick).tier,tier);
 assert.deepEqual(playerCardGrade(D,71),{from:7,n:'+3',tier:3,hit:15,b:5,dice:1});
});
test('구간 보너스와 출발 보너스는 마지막 구간에 HP88·공격22·속도10·회피20 누적',()=>{
 assert.deepEqual(playerSupportBonus(D,64),{maxHp:88,atk:22,spd:10,eva:20});
 const r=make(64);assert.equal(r.state.ch.stats.maxHp,158);assert.equal(r.state.ch.stats.atk,52);assert.equal(r.state.ch.stats.spd,16);assert.equal(r.state.ch.stats.eva,30);
});
test('강화 표시는 원본 카드 데이터·카드 ID·행동력·키워드·타수·소유권을 바꾸지 않음',()=>{
 const before=JSON.stringify(D.cards),c=D.cards.sbr_basic_shoot,g=playerCardGrade(D,64),x=gradedPlayerCard(c,g);
 assert.equal(x.hit,c.hit+15);assert.equal(x.b,c.b+5);assert.equal(x.dice,c.dice+1);
 for(const k of ['sbrId','c','n','hits','kw'])assert.deepEqual(x[k],c[k]);
 assert.equal(JSON.stringify(D.cards),before);
});
test('방어·지원 카드에는 공격용 명중·피해·주사위 강화를 적용하지 않음',()=>{
 for(const c of Object.values(D.cards).filter(c=>c.t!=='atk'))assert.equal(gradedPlayerCard(c,playerCardGrade(D,64)),c);
});
test('모든 출신 및 업적 덱은 같은 구간에서 같은 공격 카드 강화를 받음',()=>{
 for(const o of D.starts){const r=make(48,o.id),C=fight(r);assert.equal(C.P.cg.tier,3);assert.equal(C.E.cg,undefined);}
 for(const preset of Object.keys(D.achievementDecks)){const r=make(48,'ranch',preset),C=fight(r);assert.equal(C.P.cg.tier,3);assert.equal(r.state.achievementDeck,preset);}
});

function damageCase(tick,die,playback=false){
 const copy=structuredClone(D),runtime=structuredClone(R);
 const c={sbrId:'grade_probe',n:'강화 수치 확인',t:'atk',c:1,hits:2,dice:2,die,b:1,hit:0,kw:[],d:'검사'};
 copy.cards.grade_probe=c;runtime.cards.grade_probe=c;
 const r=createRace(copy,runtime,{rng:mulberry32(71)});r.start('실제 판정',{origins:'ranch',talents:'steady',flaws:'weak_condition',weapons:'revolver'});
 const saved=structuredClone(r.state);saved.tick=tick;r.restore(saved);const C=fight(r);
 Object.assign(C.P,{atk:300,hp:10000,maxHp:10000,spd:0,breath:0,dmgB:0,extraD2:0,effects:[],wx:null,hand:['grade_probe'],light:3});
 Object.assign(C.E,{hp:10000,maxHp:10000,eva:-300,spd:0,dr:0,shield:0,rupture:0,actionBlocked:true,effects:[]});C.ePlan=[];
 assert(r.round([0],{playback}));
 return {r,C,events:C.evs.filter(e=>e.k==='atk'&&e.att==='P')};
}
test('실제 판정은 단계별 피해 가산을 타격마다 정확히 한번 적용',()=>{
 for(const tick of [0,16,32,48]){const {events}=damageCase(tick,8),g=playerCardGrade(D,tick);assert.equal(events.length,2);
  for(const e of events){assert(e.hit);assert.equal(e.rolls.length,2+g.dice);assert.equal(e.b,1+g.b);assert.equal(e.dmg,e.rolls.reduce((a,b)=>a+b,0)+e.b);}
 }
});
test('명시된 d8 주사위와 기본 d6 주사위가 모두 추가 주사위를 받음',()=>{
 for(const die of [undefined,8]){const {events}=damageCase(48,die);for(const e of events){assert.equal(e.rolls.length,3);assert(e.rolls.every(n=>n>=1&&n<=(die||6)));}}
});
test('연출과 즉시 판정의 최종 전투·성장·로그 수치는 같음',()=>{
 const a=damageCase(48,8,false),b=damageCase(48,8,true);assert(b.r.state.playback);b.r.finishPlayback();assert.deepEqual(a.r.state,b.r.state);
});
test('장비·사건으로 얻은 카드와 늦게 보관한 카드에도 현재 단계만 적용',()=>{
 const r=make(64),g=r.state,ids=g.ch.deck.slice();g.ch.side.push('sbr_basic_shoot');const base={...D.cards.sbr_basic_shoot};
 assert.equal(gradedPlayerCard(D.cards[g.ch.side.at(-1)],visibleCardGrade(D,g)).b,base.b+5);
 assert(r.insertCard(g.ch.side.length-1));const C=fight(r);assert.equal(C.P.cg.tier,3);assert.deepEqual(g.ch.deck.slice(0,ids.length),ids);assert.equal(D.cards.sbr_basic_shoot.b,base.b);
});
test('0.24.1 비전투 저장은 차이만 보완하며 카드·장비·돈·행동을 보존',()=>{
 const r=make();assert(r.restore(old.outside));const g=r.state,target=playerSupportBonus(D,old.outside.tick);
 for(const k of ['maxHp','atk','spd','eva'])assert.equal(g.ch.stats[k],old.outside.ch.stats[k]+target[k]-old.outside.playerSupport.bonus[k]);
 for(const k of ['deck','side','money'])assert.deepEqual(g.ch[k],old.outside.ch[k]);
 for(const k of ['tick','items','equipment','usedEvents','beaten'])assert.deepEqual(g[k],old.outside[k]);
 assert.equal(g.playerSupport.version,2);
 const initial=structuredClone(g);for(let i=0;i<5;i++){r.restore(r.state);assert.deepEqual(r.state.ch,initial.ch);assert.deepEqual(r.state.playerSupport,initial.playerSupport);}
});
test('0.24.1 진행 중 전투는 양쪽 수치·카드 단계·적 계획을 그대로 유지',()=>{
 const r=make();assert(r.restore(old.combat));
 for(const k of ['P','E','ePlan'])assert.deepEqual(r.state.combat[k],old.combat.combat[k]);
 assert.deepEqual(r.state.ch.stats,old.combat.ch.stats);assert.equal(r.state.playerSupport.version,1);assert.equal(visibleCardGrade(D,r.state),null);
});
test('0.24.1 연출 저장은 스냅샷을 보존하고 표시 단계도 소급 변경하지 않음',()=>{
 const r=make();assert(r.restore(old.playback));assert.deepEqual(r.state.playback,old.playback.playback);assert.equal(visibleCardGrade(D,r.state),null);
 r.finishPlayback();assert.equal(r.state.playerSupport.version,1);assert.equal(r.state.combat.P.cg,null);
});
test('이전 전투 종료 후 미뤄 둔 능력치 보완·다음 전투는 새 카드 강화 적용',()=>{
 const r=make();r.restore(old.combat);settle(r);assert.equal(r.state.playerSupport.version,2);assert.deepEqual(r.state.playerSupport.bonus,playerSupportBonus(D,r.state.tick));
 assert.equal(fight(r,'blackmore').P.cg.tier,2);
});
test('새 강화 전투를 저장·복원해도 카드 단계·판정이 중첩되거나 사라지지 않음',()=>{
 const {r}=damageCase(48,8,true),saved=structuredClone(r.state),copy=make();assert(copy.restore(saved));assert.deepEqual(copy.state.playback,saved.playback);assert.equal(visibleCardGrade(D,copy.state).tier,3);assert.equal(copy.state.combat.P.cg.b,5);
});
test('구간 경계에서 단계 상승 안내와 능력치 지급은 한 번이며 카드를 교체하지 않음',()=>{
 const r=make(15),g=r.state,deck=g.ch.deck.slice();g.mode='event';g.event='junction_2';assert(r.chooseEvent(0));
 assert.equal(g.tick,16);assert(g.message.includes('카드 강화: 공격 카드 +1'));assert.deepEqual(g.ch.deck,deck);
 const stats={...g.ch.stats};assert.deepEqual(initializePlayerSupport(D,g),[]);assert.deepEqual(g.ch.stats,stats);
});
test('은퇴·완주 저장은 확대 성장으로 수정하거나 부활시키지 않음',()=>{
 for(const mode of ['retired','ending']){const save=structuredClone(old.outside);save.mode=mode;save.ch.hp=mode==='retired'?0:10;const r=make();r.restore(save);assert.deepEqual(r.state.ch,save.ch);assert.deepEqual(r.state.playerSupport,save.playerSupport);}
});

fs.writeFileSync('reports/generated/card-growth-checks.json',JSON.stringify({checks},null,2));
console.log(JSON.stringify({cardGrowthChecks:checks.length,passed:checks.filter(x=>x.ok).length,failures:checks.filter(x=>!x.ok)},null,2));
if(checks.some(x=>!x.ok))process.exitCode=1;
