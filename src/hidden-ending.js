import {memoryEnding} from './choice-memory.js';

export function completeHiddenEnding(D,g,id){
 const ending=D.hiddenEndings[id];if(!ending||g.expedition?.id!=='saint')return false;
 g.mode='ending';g.endingKind='hidden';g.hiddenEnding=id;g.endingTitle=ending.title;
 g.finishedAt=g.tick;delete g.finishRank;delete g.pendingHiddenEnding;
 g.event=null;g.eventPermit=null;g.combat=null;g.combatContext=null;g.offer=null;
 g.routeResults.saint_path=id;
 g.endingStories=Object.entries(g.routeResults).filter(([key,value])=>key!=='saint_path'&&!['declined','parted'].includes(value)).map(([key,result])=>{
  const r=D.routes.find(x=>x.id===key);return {n:r?.n||key,result,text:result==='adapted'?r?.adaptedEnding||'자신에게 맞는 방식을 남겼다.':r?.ending||'길 위에서 내린 결정을 기억했다.'};
 });
 const memory=memoryEnding(g);if(memory)g.endingStories.push({n:'길 위의 재회',result:'remembered',text:memory});
 if(g.ch.flags.saint_decoy)g.endingStories.push({n:'미끼가 된 운반자',result:'sheltered',text:'유해는 숨겼지만 자신은 추격에서 벗어나지 못했다. 안전한 귀환을 포기한 대가로 안식처를 지켰다.'});
 g.message=g.name+'의 레이스 기록은 기권으로 끝났다.\n'+ending.text;
 g.history.push(g.endingTitle+'\n'+g.message);return true;
}
