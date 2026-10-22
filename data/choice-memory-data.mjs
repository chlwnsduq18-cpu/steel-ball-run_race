export function addChoiceMemory(D){
 const mark=(id,i,key,value,ledger,failed=null)=>{const c=D.events.find(e=>e.id===id)?.c[i];if(!c)throw Error('Memory source missing: '+id);c.memory={key,value,ledger};if(failed)c.failMemory={key,value:failed,ledger:'resolve'};};
 mark('gunfire',2,'rider','help','help');mark('gunfire',1,'rider','pass','pass');
 mark('fallen_pack',0,'pack','keep','resolve');mark('fallen_pack',2,'pack','repair','help');
 mark('town_thief',0,'thief','caught','resolve','lost');mark('town_thief',2,'thief','guard','help');
 mark('rockslide',2,'passage','cleared','help','tried');
 const choice=(l,t,fx,check=null,fail=null)=>({l,ok:{t,fx},...(check?{check,fail}: {})});
 const add=(id,key,value,title,text,choices)=>D.events.push({id:'reunion_'+id,t:title,x:text,from:1,to:9,where:['road','explore','camp','town'],weight:5,once:true,memoryKey:key,req:['memory:'+key+'='+value,'memoryAge:'+key+'>=4'],c:[...choices,{l:'짧게 인사하고 레이스를 이어 간다',ok:{t:'상대와 길을 나누고 각자의 레이스로 돌아갔다.',fx:{}},actionCost:0}]});
 add('rider_aid','rider','help','다시 말에 오른 참가자','총성이 울리던 곳에서 옮겨 주었던 참가자가 먼저 손을 든다. 상처는 아물었고, 이번에는 그가 보급과 길 정보를 갖고 있다.',[
  choice('서로의 보급을 나누고 함께 쉰다','그가 남겨 둔 물과 붕대를 받았다. 이번에는 당신도 편히 눈을 붙였다.',{hp:22,money:10}),
  choice('그가 살펴 둔 주행선을 배운다','그는 바퀴 자국과 위험한 모래의 경계를 짚어 주었다.',{spd:1,eva:1})]);
 add('rider_pass','rider','pass','서로 기억하는 총성','총성을 피해 지나갔던 날의 참가자를 다시 만났다. 그는 다른 기수의 도움으로 살아남았다. 경계는 있지만 말을 끊지는 않는다.',[
  choice('이번에는 망가진 안장을 함께 손본다','말없이 손을 보태자 상대도 공구를 내주었다. 떠날 때는 서로 길을 알려 주었다.',{hp:10,eva:1}),
  choice('그날의 사정을 설명한다','서로 위험을 감수할 수 없었던 이유를 이야기했다. 남은 보급을 조금 교환했다.',{money:12,hp:6})]);
 add('pack_keep','pack','keep','짐표를 알아본 주인','꾸러미에서 챙겼던 물건의 짐표를 알아본 사람이 다가왔다. 그가 찾는 것은 잃어버린 수리 도구다.',[
  {...choice('도구 값을 갚고 사정을 설명한다','일을 매듭짓고 서로 장비를 손봤다. 주인은 남은 부품을 나누어 주었다.',{hp:18,maxHp:2}),cost:10},
  choice('수리 일을 도와 정산한다','역참에서 함께 짐을 묶으며 도구 값을 대신했다. 손을 쓰는 요령이 남았다.',{atk:1,hp:5})]);
 add('pack_repair','pack','repair','끊어진 끈의 새 매듭','전에 손질해 챙긴 끈을 본 수리공이 손짓한다. 같은 짐 꾸러미의 주인이었다. 매듭을 보고 남은 부품을 함께 쓰자고 한다.',[
  choice('서로의 장비를 손본다','그가 잡아 준 길이에 맞춰 끈을 당겼다. 장비가 덜 흔들린다.',{eva:1,maxHp:2}),
  choice('남은 끈으로 그의 짐도 묶어 준다','두 사람의 짐을 정리하고 품삯과 식사를 받았다.',{money:18,hp:10})]);
 add('thief_caught','thief','caught','시장 끝의 같은 얼굴','쫓아가 지갑을 되찾았던 도둑이 이번에는 가판의 짐을 옮기고 있다. 그는 당신을 알아보고 훔친 물건이 아니라 정식 일거리를 가리킨다.',[
  choice('짐 옮기는 일을 함께한다','일을 마친 뒤 상인이 두 사람의 품삯을 나누어 주었다.',{money:24,hp:5}),
  choice('시장 뒤편의 안전한 길을 묻는다','그는 경비가 서 있는 골목을 짚어 주었다. 이번에는 믿을 만한 설명이었다.',{spd:1,hp:12})]);
 add('thief_lost','thief','lost','다시 잡은 지갑의 행방','놓쳤던 소매치기의 물건이 역참 경비에게 맡겨져 있다. 이름과 당시 경로를 대조하면 잃은 돈 일부를 돌려받을 수 있다.',[
  choice('경비에게 당시 경로를 설명한다','진술이 맞아 잃었던 돈을 일부 되찾았다. 사건은 여기서 마무리됐다.',{money:15,hp:6}),
  choice('다른 피해자들의 짐부터 분류한다','짐표를 정리해 주자 경비가 품삯과 식사를 마련했다.',{money:10,hp:14})]);
 add('thief_guard','thief','guard','경비가 기억한 신고','지갑을 잃었을 때 도움을 청했던 시장 경비와 길에서 마주쳤다. 그는 순찰 중 발견한 보급 지점과 일거리를 알려 준다.',[
  choice('알려 준 보급 지점에서 쉰다','사람들이 지키는 그늘에서 물을 채우고 상처를 돌봤다.',{hp:24}),
  choice('역참에 전달할 물자를 함께 나른다','같은 방향으로 가는 물자만 맡아 옮기고 운송료를 받았다.',{money:22,hp:4})]);
 add('passage_open','passage','cleared','당신이 열었던 통로','낙석을 치웠던 길로 마차들이 지나왔다. 뒤따라온 상인이 길을 열어 준 사람을 찾고 있다.',[
  choice('마차에서 함께 쉬어 간다','상인은 말과 장비를 살펴 주고 따뜻한 음식을 건넸다.',{hp:20,maxHp:2}),
  choice('통로 관리에 쓸 장비를 함께 정리한다','길을 지키는 이들에게 물자를 나누고 품삯을 받았다.',{money:25})]);
 add('passage_tried','passage','tried','함께 치운 낙석','혼자 힘으로는 치우지 못했던 바위를 다른 참가자들이 마저 옮겼다. 당신이 먼저 남긴 작업 흔적 덕에 통로를 찾았다고 한다.',[
  choice('통로를 넓히는 마무리를 돕는다','이번에는 무게를 나누어 들었다. 손에 힘을 주는 순서를 배웠다.',{atk:1,hp:12}),
  choice('새 길을 확인하고 보급을 나눈다','도움을 받았던 이들과 지도를 맞춰 보고 식사를 나누었다.',{hp:18,money:8})]);
}
