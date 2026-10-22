export function equipmentCondition(C,A,p,card){
 const w=p.when;if(!w)return true;const B=C[A.uid==='P'?'E':'P'];
 if(w.singleHit&&(!card||card.t!=='atk'||card.hits!==1))return false;
 if(w.defended&&A.defRound!==C.round)return false;
 if(w.hpBelow!=null&&A.hp>A.maxHp*w.hpBelow)return false;
 for(const[k,v]of Object.entries(w.self||{}))if((A[k]||0)<v)return false;
 for(const[k,v]of Object.entries(w.opponent||{}))if((B[k]||0)<v)return false;
 for(const[k,v]of Object.entries(p.consume||{}))if((A[k]||0)<v)return false;
 return true;
}
