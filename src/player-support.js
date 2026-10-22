import {adjustWeaponDice} from './weapon-dice.js';
// Player-only headroom. The ledger prevents these additions from scaling enemies.
export function playerSupportBonus(D,tick=0){
 const p=D.playerSupport;if(!p)return {};
 const checkpoints=Math.max(0,Math.min(D.stages.length-1,Math.floor(tick/D.rules.turnsPerStage)));
 const bonus={...p.start};
 for(const [k,n]of Object.entries(p.checkpoint))bonus[k]=(bonus[k]||0)+n*checkpoints;
 bonus.spd=(bonus.spd||0)+Math.floor(checkpoints/p.speedEvery);
 return bonus;
}
export function initializePlayerSupport(D,g,{fresh=false}={}){
 if(!D.playerSupport||!g||(g.playback&&g.playerSupport?.version!==D.playerSupport.version)||g.combat||['retired','ending'].includes(g.mode)||g.ch.hp<=0)return [];
 if(fresh)g.playerSupport={version:D.playerSupport.version,bonus:{...D.playerSupport.start}};
 const current=g.playerSupport?.bonus||{},target=playerSupportBonus(D,g.tick),notes=[];
 for(const [k,n]of Object.entries(target)){
  const delta=n-(current[k]||0);if(!delta)continue;
  g.ch.stats[k]=(g.ch.stats[k]||0)+delta;
  if(k==='maxHp')g.ch.hp=Math.min(g.ch.stats.maxHp,g.ch.hp+delta);
  notes.push((D.stats[k]||'최대 HP')+' '+(delta>0?'+':'')+delta);
 }
 g.playerSupport={version:D.playerSupport.version,bonus:target};
 return notes;
}
export function recoveryAmount(D,g,kind){
 const p=D.playerSupport?.recovery[kind];
 return p?Math.max(p.minimum,Math.ceil(g.ch.stats.maxHp*p.ratio)):kind==='victory'?12:6;
}

export function playerCardGrade(D,tick=0){
 const stage=Math.max(1,Math.min(D.stages.length,1+Math.floor(tick/D.rules.turnsPerStage)));
 return D.playerCardGrades?.filter(x=>x.from<=stage).at(-1)||null;
}
// Ongoing legacy combats/replays keep the tier captured when they began.
export function visibleCardGrade(D,g){
 if(g?.playback)return g.playback.before.P.cg||null;
 if(g?.combat)return g.combat.P.cg||null;
 return playerCardGrade(D,g?.tick||0);
}
export function gradedPlayerCard(c,grade,weapon=null){
 if(weapon)return adjustWeaponDice(c,weapon,grade);
 if(c.t!=='atk'||!grade)return c;
 return {...c,hit:(c.hit||0)+grade.hit,b:(c.b||0)+grade.b,dice:c.dice+grade.dice};
}
export function cardGradeSummary(grade){
 return grade?.tier?`공격 카드 ${grade.n} · 명중 +${grade.hit} · 적중 피해 +${grade.b}${grade.dice?' · 피해 주사위 +'+grade.dice+'개':''}`:'';
}
