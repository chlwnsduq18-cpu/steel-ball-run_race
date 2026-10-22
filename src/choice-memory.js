// Saved run history, independent of encounter RNG and presentation replay.
export function initializeChoiceMemory(g){
 if(!g.eventSeen){g.eventSeen={};for(const id of g.usedEvents||[])g.eventSeen[id]=(g.eventSeen[id]||0)+1;}
 g.choiceMemory??={};g.choiceLedger??={help:0,resolve:0,pass:0};
}
export function markEventSeen(g,e){initializeChoiceMemory(g);if(!e.shop)g.eventSeen[e.id]=(g.eventSeen[e.id]||0)+1;}
export function eventWeight(g,e){return Math.max(0.01,e.weight||1)/(1+2*(g.eventSeen?.[e.id]||0));}
export function rememberChoice(g,e,c,success){
 const m=(success?c.memory:c.failMemory);if(!m||g.choiceMemory[m.key])return;
 g.choiceMemory[m.key]={value:m.value,tick:g.tick+1,source:e.id,done:false};
 if(m.ledger)g.choiceLedger[m.ledger]=(g.choiceLedger[m.ledger]||0)+1;
}
export function memoryCondition(g,kind,id){
 if(kind==='memory'){const [key,value]=id.split('=');const m=g.choiceMemory?.[key];return !!m&&!m.done&&m.value===value;}
 if(kind==='memoryAge'){const [key,n]=id.split('>=');const m=g.choiceMemory?.[key];return !!m&&g.tick-m.tick>=Number(n);}
 return false;
}
export function memoryReady(D,g,e){return !e.memoryKey||g.tick-(g.lastFollowupTick??-Infinity)>=D.rules.followup.gap;}
export function memoryEnding(g){
 const done=Object.values(g.choiceMemory||{}).filter(m=>m.done).length;
 if(!done)return '';
 return '길 위에서 했던 선택이 '+done+'번의 재회로 돌아왔다. '+((g.choiceLedger?.help||0)>0?'누군가는 그가 내밀었던 손을 기억했다.':'다시 만난 얼굴들과 자신의 방식으로 관계를 정리했다.');
}
