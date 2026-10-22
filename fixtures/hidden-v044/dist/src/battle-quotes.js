// Choose on actual execution and persist the selected line in the resolved event.
// Reading/replaying never consumes randomness or advances the sequence.
export function attachEnemySpeeches(C,D,enemy,form=null){
 const q=D.quotes[enemy];if(!q)return;C.quoteUses??={};const seen=new Set(),started=new Set();
 for(const e of C.evs){
  if((e.att||e.side)!=='E'||!e.card||!['turnStart','atk','buff','def'].includes(e.k))continue;
  const id=e.card.sbrId||Object.keys(D.cards).find(id=>D.cards[id].n===e.card.n);if(!q.cards.includes(id)&&!q.legacyCardLines?.[id])continue;
  const key=e.k==='turnStart'?'start:'+id:e.step+':'+id;if(seen.has(key)||e.k!=='turnStart'&&started.has(id))continue;
  seen.add(key);if(e.k==='turnStart')started.add(id);
  const lines=q.formCardLines?.[form]?.[id]||q.cardLines?.[id]||q.legacyCardLines?.[id]||q.lines||[{text:q.text,source:q.source}],uses=q.lines?(C.quoteSequence||0):(C.quoteUses[id]||0);
  e.speech={...lines[uses%lines.length],card:id};C.quoteUses[id]=(C.quoteUses[id]||0)+1;if(q.lines)C.quoteSequence=uses+1;
 }
}
