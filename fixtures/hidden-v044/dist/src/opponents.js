// Adaptation of upstream mkCombat / CFG.enemyScale: elapsed progress + class profile.
// Partial, bounded player growth matching keeps upgrades useful. Wounds never scale foes.
export function opponentGrowth(g,D){
 const s={...g.ch.stats},base={atk:28,eva:10,spd:6,maxHp:80,dmgB:0,dr:0,regen:0};
 for(const [k,n]of Object.entries(g.playerSupport?.bonus||{}))s[k]-=n;
 const weights={atk:.5,eva:.4,spd:.8,maxHp:.125,dmgB:2,dr:2,regen:1};
 return Math.min(D.encounterRules.growthCap,Object.entries(weights).reduce((n,[k,w])=>n+Math.max(0,(s[k]||0)-base[k])*w,0)+(g.stand?.level||0)*2);
}
export function makeOpponent(D,g,id,rng){
 const base=g.spawned?.[id]||D.enemies[id];if(!base)throw Error('알 수 없는 적: '+id);
 const stage=Math.min(9,1+Math.floor(g.tick/D.rules.turnsPerStage)),form=base.forms?.filter(f=>f.from<=stage).at(-1),r=D.encounterRules;
 const foe={...structuredClone(base),...(form?structuredClone(form):{})};
 // Form label is descriptive; the canonical character ID remains the reward/defeat key.
 foe.formId=form?.id||null;foe.ability=form?.n||base.ability;foe.n=base.n;
 if(form?.signature&&D.cards[form.signature].t==='atk')foe.rewardCards=[form.signature];
 const raceTick=Math.min(g.tick,D.stages.length*D.rules.turnsPerStage-1),elapsed=Math.floor(raceTick/r.actionsPerStep),growth=opponentGrowth(g,D),spread=1-r.variance+rng()*r.variance*2,power=form?.power||1;
 const tier=foe.kind==='boss'?(id==='johnny'&&foe.formId==='act4'?'apex':D.bossTiers?.[id]||'standard'):foe.kind,baseBonus=D.opponentTiers?.[tier]?.filter(x=>x.from<=stage).at(-1),override=D.opponentOverrides?.[id],bonus=baseBonus?{...baseBonus,...(override?.dice!=null?{dice:override.dice}:{}),...(override?.b!=null?{b:Math.min(baseBonus.b,override.b)}:{}),...(override?.cost!=null?{cost:Math.min(baseBonus.cost,override.cost)}:{}),...(override?.supportMax?{support:Math.min(baseBonus.support,override.supportMax)}:{}),...(override?.hpMax?{hp:Math.min(baseBonus.hp,override.hpMax)}:{})}:null;
 const profile=[override?.mid,override?.late].filter(x=>x&&stage>=x.from).at(-1);if(bonus&&profile)Object.assign(bonus,profile);
 const hp=Math.round(foe.hp*(1+r.hpPerStep*elapsed)*power*spread+growth*.8);
 const stats={hp,maxHp:hp,atk:Math.round(foe.atk+Math.floor(elapsed/r.atkEvery)+growth*r.growthShare+(power-1)*10+(spread-1)*12),eva:Math.round(foe.eva+elapsed*.15+growth*.12),spd:Math.round(foe.spd+Math.floor(stage/3)+growth*.08),dmgB:Math.floor(raceTick/20)+(foe.kind==='boss'?1:0)};
 if(bonus){stats.hp=stats.maxHp=Math.round(stats.hp*bonus.hp);stats.atk+=bonus.atk;stats.eva+=bonus.eva;if(foe.kind==='normal')stats.dmgB+=bonus.b;else foe.cardGrade=structuredClone(bonus);}
 foe.sbrBalance={version:2,tick:g.tick,stage,growth,spread,tier,stats};Object.assign(foe,stats);
 delete foe.forms;return foe;
}

// Keep shared reward cards and once-per-battle identities unchanged.
export function opponentCard(c,foe){
 const q=foe?.cardGrade;if(!q||c.once)return c;const x={...c},notes=[];
 if(c.t==='atk'){x.hit=(c.hit||0)+(q.hit||0);x.b=(c.b||0)+(q.b||0);x.dice=c.dice+(q.dice||0);if(q.hit)notes.push('명중 +'+q.hit);if(q.b)notes.push('타격 피해 +'+q.b);if(q.dice)notes.push('주사위 +'+q.dice+'개');}
 else if(c.t==='buff'){
  if(c.heal){x.heal=Math.round(c.heal*q.support);if(x.heal!==c.heal)notes.push('회복 '+x.heal);}
  if(c.shield){x.shield=Math.round(c.shield*q.support);if(x.shield!==c.shield)notes.push('보호막 '+x.shield);}
  if(q.cost&&(c.heal||c.shield)){x.c=Math.max(1,c.c-q.cost);notes.push('행동력 '+x.c);}
 }
 if(!notes.length)return c;x.d=c.d+' · 적 강화: '+notes.join(' · ');return x;
}
export function opponentPlan(engine,C,foe){
 if(C.E.actionBlocked)return [];
 const available=foe.deck.filter(id=>!(C.E.usedOnce||[]).includes(id));
 const useful=c=>!c.heal||C.E.hp<C.E.maxHp*.9||c.passNext||c.skipTurns||c.kw?.length||c.cleanseRand&&C.E.bleed+C.E.burn+C.E.rupture+C.E.sink>0;
 const choose=(ids,budget)=>{const out=[];for(const id of engine.sample(ids,ids.length)){const c=opponentCard(engine.D.cards[id],foe);if(c.c<=budget&&(foe.kind==='normal'||useful(c))){out.push(c);budget-=c.c;}}return out;};
 const signature=foe.signature||foe.rewardCards[0],sig=opponentCard(engine.D.cards[signature],foe);
 if(['boss','named'].includes(foe.kind)&&available.includes(signature)&&sig.c<=C.E.light&&useful(sig)&&C.round%(foe.signatureEvery||3)===0)return [sig,...choose(engine.sample(available.filter(id=>id!==signature),2),C.E.light-sig.c)];
 return choose(engine.sample(available,4),C.E.light);
}
