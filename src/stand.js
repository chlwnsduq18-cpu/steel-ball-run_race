import {grantDedicatedCards} from './dedicated.js';
export function birthStand(D,birth){
 const preset=D.achievementDecks[birth?.achievementDeck];if(preset)return preset.stand;
 const o=D.starts.find(x=>x.id===birth?.origins);if(o?.stand)return o.stand;
 if(!D.birth.tables.talents.find(x=>x.id===birth?.talents)?.stand)return null;
 return ['frontier','marksman','craftsman','scout','medic','caravan','miner'].includes(o?.id)?'special':['drifter','riverboat','performer','messenger'].includes(o?.id)?'rapid':'force';
}
export function canAwakenStand(D,g){const o=D?.starts.find(o=>o.id===g?.origin);return !!o&&!g.stand&&!o.stand;}
export function standDisplayName(D,s){return s?.name||D.stands.types[s?.type]?.n||'이름 없는 스탠드';}
export function standStageName(D,s){return D.stands.types[s.type]?.stageNames?.[s.level]||D.stands.tiers[s.level];}
export function deckGrowthInfo(D,g){return Object.values(D.deckGrowth||{}).find(x=>[x.type,x.legacyType].includes(g?.stand?.type));}
export function initializeDeckGrowth(D,g){
 const h=deckGrowthInfo(D,g);if(!h){delete g.deckGrowth;return;}
 const legacy=g.stand.type===h.legacyType;
 if(g.deckGrowth?.deck!==h.id)g.deckGrowth={deck:h.id,stage:legacy?0:g.stand.level,legacy};
 g.deckGrowth.legacy=legacy;
 if(g.deckGrowth.stage>0){if(!g.items.includes(h.item))g.items.push(h.item);g.itemLevels[h.item]=g.deckGrowth.stage;}
}
export function canAdvanceDeck(D,g,advance){
 const h=deckGrowthInfo(D,g),p=g?.deckGrowth;if(!h||!p||h.id!==advance?.deck||advance.stage!==p.stage+1||advance.stage>3)return false;
 const at=advance.stage-1,stage=Math.floor(g.tick/D.rules.turnsPerStage)+1;
 return !g.combat&&!g.playback&&stage>=h.from[at]&&(g.stand.uses||0)>=h.uses[at];
}
export function advanceDeckGrowth(D,g,advance){
 if(!canAdvanceDeck(D,g,advance))return [];
 const h=deckGrowthInfo(D,g),p=g.deckGrowth;p.stage=advance.stage;
 if(!p.legacy)setStandLevel(D,g,p.stage);
 if(!g.items.includes(h.item))g.items.push(h.item);g.itemLevels[h.item]=p.stage;
 if(p.stage===3)g.routeResults['growth_'+h.id]='mastered';
 return ['전용 성장 · '+standDisplayName(D,g.stand)+' · '+(p.legacy?'전용 숙련 '+p.stage+'단계':h.stages[p.stage]),'전용 성장 효과 누적 · 카드 편성 유지',...grantDedicatedCards(D,g,'achievement:'+h.id+':'+p.stage)];
}
export function validateStandIdentity(name='',line=''){
 if(typeof name!=='string'||typeof line!=='string')return {ok:false,error:'이름과 대사는 글자로 입력하십시오.'};
 if(/[\u0000-\u001f\u007f]/u.test(name+line))return {ok:false,error:'이름과 대사는 줄바꿈 없이 입력하십시오.'};
 const n=name.trim().replace(/\s+/gu,' '),l=line.trim().replace(/\s+/gu,' ');
 if([...n].length>20||[...l].length>60)return {ok:false,error:'스탠드 이름은 20자, 결정 대사는 60자 이내로 입력하십시오.'};
 return {ok:true,name:n,line:l};
}
export function standCard(D,g){return g.stand?D.stands.types[g.stand.type].cards[g.stand.level]:null;}
export function standPack(D,s){const t=D.stands.types[s.type];return t.bundles?.[s.level]||[t.cards[s.level]];}
export function optionalStandCard(D,g,id){return g?.stand?.deckMode==='optional'&&D.cards[id]?.stand===g.stand.type&&!D.cards[id].fixed;}
export function syncStandDeck(D,g){
 if(!g.stand||g.combat||g.playback)return;
 const s=g.stand,t=D.stands.types[s.type],id=standCard(D,g);s.deckMode??=D.cards[t.cards[0]].fixed?'native':'optional';
 const current=standPack(D,s),normalize=cid=>{const c=D.cards[cid];if(c?.stand===s.type)return current[c.standSkill||0]||id;if(c?.stand&&D.stands.types[c.stand].baseCard)return c.standBase||D.stands.types[c.stand].baseCard;return cid;};
 g.ch.deck=g.ch.deck.map(normalize);g.ch.side=g.ch.side.map(normalize);
 if(s.deckMode==='optional'){
  if(!s.packGranted){if(!t.unlockByEvent)for(const cid of current)if(![...g.ch.deck,...g.ch.side].includes(cid))g.ch.side.push(cid);s.packGranted=true;}
  return;
 }
 // Native signatures can be stored too. Initialization never re-equips a removed card.
 if(!s.packGranted&&!g.ch.deck.includes(id)&&!g.ch.side.includes(id)){
  const at=g.ch.deck.indexOf(t.baseCard);if(at>=0)g.ch.deck.splice(at,1,id);
  else if(![...g.ch.deck,...g.ch.side].includes(id))g.ch.side.push(id);
 }
 s.packGranted=true;
}
export function awakenStand(D,g,type,{initial=false,name='',line=''}={}){
 if(g.stand||!D.stands.types[type]||!initial&&(!canAwakenStand(D,g)||!D.stands.choices.includes(type)))return [];
 const identity=validateStandIdentity(name,line);if(!identity.ok)return [];
 g.stand={type,level:0,uses:0,name:identity.name,line:identity.line};g.ch.flags.stand_awakened=true;const item=D.stands.types[type].item;
 if(!g.items.includes(item))g.items.push(item);g.itemLevels[item]=0;syncStandDeck(D,g);
 return ['스탠드 각성 · '+standDisplayName(D,g.stand)+' · '+D.stands.types[type].form,initial&&g.stand.deckMode==='native'?'기존 전용 덱으로 출발':'각성 카드 '+standPack(D,g.stand).length+'장 보관 · 덱에서 직접 편성'];
}
export function initializeStand(D,g,{fresh=false}={}){
 const native=D.starts.find(x=>x.id===g.origin)?.stand;
 if(!g.combat&&!g.playback&&g.changed&&!g.achievementDeck&&native&&g.stand&&g.stand.type!==native){
  const old=g.stand,oldItem=D.stands.types[old.type].item;
  g.items=g.items.filter(id=>id!==oldItem);delete g.itemLevels[oldItem];
  g.stand={type:native,level:0,uses:0,name:old.name||'',line:old.line||'',deckMode:'native',packGranted:true};
  const pack=standPack(D,g.stand),type=D.stands.types[native],base=new Map(pack.map(id=>{const c=D.cards[id];return [c.standBase||c.dedicatedFamily||type.baseCard,id];}));
  const normalize=id=>{const c=D.cards[id];return c?.stand===old.type?pack[Math.min(c.standSkill||0,pack.length-1)]:base.get(id)||id;};
  g.ch.deck=g.ch.deck.map(normalize);g.ch.side=g.ch.side.map(normalize);delete g.deckGrowth;
  g.history.push('전용 덱에 맞춰 스탠드를 '+D.stands.types[native].n+'의 형태로 연결했습니다. 이름·대사와 카드 편성 위치는 유지하며 새 형태는 발현 단계에서 성장합니다.');
 }
 if(!g.stand){const type=fresh?birthStand(D,g.birth):D.starts.find(x=>x.id===g.origin)?.stand;if(type)awakenStand(D,g,type,{initial:true,name:fresh?g.birth?.standName||'':'',line:fresh?g.birth?.standLine||'':''});}
 if(g.stand){g.ch.flags.stand_awakened=true;const id=D.stands.types[g.stand.type].item;if(!g.items.includes(id))g.items.push(id);g.itemLevels[id]=g.stand.level;syncStandDeck(D,g);}
 initializeDeckGrowth(D,g);
}
function setStandLevel(D,g,level){
 const s=g.stand,old=standPack(D,s);
 s.level=level;const next=standPack(D,s),item=D.stands.types[s.type].item;g.itemLevels[item]=level;
 for(const key of ['deck','side'])g.ch[key]=g.ch[key].map(id=>old.includes(id)?next[old.indexOf(id)]:id);
 // The current action and replay keep their original cards; the next hand uses the evolved card.
 if(g.combat){
  const C=g.combat;C.P.deck=g.ch.deck.slice();
  const families=new Set([...(C.onceUsed||[]),...(C.P.usedOnce||[])].map(id=>D.cards[id]?.onceFamily).filter(Boolean));
  if(families.size){const siblings=Object.keys(D.cards).filter(id=>families.has(D.cards[id].onceFamily));C.onceUsed=[...new Set([...(C.onceUsed||[]),...siblings])];C.P.usedOnce=[...new Set([...(C.P.usedOnce||[]),...siblings])];}
 }
}
export function growStand(D,g,events){
 if(!g.stand)return [];
 const s=g.stand,eventGrowth=!!deckGrowthInfo(D,g),steps=new Set(events.filter(e=>(e.k==='atk'||!eventGrowth&&['buff','def'].includes(e.k))&&(e.att||e.side)==='P'&&(e.card?.stand===s.type||e.card?.dedicatedDeck===s.type)).map(e=>e.step));
 s.uses+=steps.size;
 if(eventGrowth)return [];
 const level=D.stands.need.filter(n=>s.uses>=n).length-1;if(level<=s.level)return [];
 setStandLevel(D,g,level);
 const note='스탠드 진화 · '+standDisplayName(D,s)+' · '+standStageName(D,s)+' · 전용기 '+s.uses+'회';
 g.history.push(note);return [note];
}
