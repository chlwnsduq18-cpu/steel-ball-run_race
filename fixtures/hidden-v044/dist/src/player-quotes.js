// Persist player speech on actual execution, just like enemy speech.
export function attachPlayerSpeeches(C,D,g){
 C.playerQuoteUses??={};const seen=new Set(),started=new Set();
 for(const e of C.evs){
  if((e.att||e.side)!=='P'||!e.card||!['turnStart','atk','buff','def'].includes(e.k))continue;
  const c=e.card,id=c.sbrId||Object.keys(D.cards).find(id=>D.cards[id].n===c.n),family=c.dedicatedFamily||id;
  const ownStand=!!c.stand&&c.stand===g.stand?.type,ownOrigin=!g.achievementDeck&&c.dedicatedDeck===g.origin;
  const custom=ownStand?g.stand.line:ownOrigin?g.signatureLine:'';
  const record=D.playerQuotes?.families[id]||D.playerQuotes?.families[family];
  if(!custom&&!record)continue;
  const key=e.k==='turnStart'?'start:'+id:e.step+':'+id;if(seen.has(key)||e.k!=='turnStart'&&started.has(id))continue;
  seen.add(key);if(e.k==='turnStart')started.add(id);
  const used=C.playerQuoteUses[id]||0,rows=record?.lines||[];
  if(custom)e.playerSpeech={text:custom,custom:true,card:id};
  else if(rows.length)e.playerSpeech={...rows[used%rows.length],custom:false,card:id};
  if(e.playerSpeech)C.playerQuoteUses[id]=used+1;
 }
}
