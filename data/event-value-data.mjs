// Existing shared effects and combat contexts; preparation must produce a result.
export function addEventValueData(D){
 D.rules.escapeGraceActions=3;
 const event=id=>D.events.find(e=>e.id===id);
 const intros={
  ranch:['고삐를 쥐는 힘을 바꿔 중심을 잡는다','말이 손끝의 작은 변화에 반응했다. 힘을 몰아 쓰지 않고도 중심을 지킬 수 있게 됐다.'],
  frontier:['맞바람 속에서 발 디딜 자리를 고른다','흔들리는 땅에서도 발을 옮기는 순서를 찾았다. 거친 노면을 지날 때 몸이 덜 흔들렸다.'],
  drifter:['버려진 짐으로 긴급 야영을 꾸린다','돌아갈 길과 숨을 자리를 함께 살폈다. 적은 짐으로도 몸을 지키는 요령을 익혔다.'],
  marksman:['안장 위에서 조준 자세를 바로잡는다','말의 흔들림이 잦아드는 순간을 기다렸다. 총구가 표적을 벗어나는 폭이 줄었다.'],
  medic:['흔들리는 안장에서도 붕대를 고정한다','상처를 누르는 위치와 매듭을 바꿨다. 적은 힘으로도 처치를 유지할 수 있었다.'],
  caravan:['짐의 무게를 양쪽에 다시 나눈다','안장의 무게 중심을 옮기자 말의 보폭이 고르게 이어졌다. 갑자기 멈춰도 몸이 앞으로 쏠리지 않았다.'],
  craftsman:['헐거운 연결부를 직접 손질한다','도구가 흔들리던 부분을 찾아 조였다. 손의 힘이 낭비되지 않고 끝까지 전달됐다.'],
  riverboat:['물살에 맞춰 밧줄을 당긴다','밀려드는 물살에 힘으로 맞서지 않고 당기는 간격을 바꿨다. 몸을 빼낼 틈이 보였다.'],
  miner:['암반의 약한 틈에 도구를 댄다','겉으로 단단해 보이던 바위에서 가는 균열을 찾아냈다. 힘을 집중할 곳이 분명해졌다.'],
  performer:['발소리의 박자를 바꿔 몸을 푼다','같은 동작도 간격이 달라지면 상대의 예상에서 벗어났다. 몸이 멈추는 틈을 줄였다.'],
  scout:['지워진 발자국 옆의 풀잎을 살핀다','발자국이 끊긴 뒤에도 누운 풀잎과 흩어진 흙이 다음 방향을 가리켰다. 위험한 노면을 먼저 피했다.'],
  messenger:['다음 초소까지의 길을 안장 옆에 표시한다','돌아갈 여유를 남기고 노선을 골랐다. 멈춰 서서 길을 찾는 시간이 줄었다.']
 };
 for(const o of D.starts){const first=event('origin_'+o.id+'_1'),second=event('origin_'+o.id+'_2');
  if(first&&intros[o.id]){first.c[0].l=intros[o.id][0];first.c[0].ok.t=intros[o.id][1];first.c[0].ok.fx[second.c[0].check.s]=1;}
  if(first&&o.id==='vampire'){first.c[0].l='그늘에서 몸의 회복을 끝까지 확인한다';first.c[0].ok.t='해가 기울자 굳어 있던 몸이 풀렸다. 상처가 닫히는 간격에 맞춰 무리한 움직임을 줄였다.';first.c[0].ok.fx.maxHp=2;}
  if(second&&!o.hidden&&second.c[0].check){second.c[0].ok.fx[second.c[0].check.s]=1;}
 }
 const patch=(id,i,fx,text)=>{const c=event(id).c[i];Object.assign(c.ok.fx,fx);if(text)c.ok.t=text;};
 patch('gunfire',2,{maxHp:2},'진행요원에게 부상자를 인계했다. 참가자가 나눈 식량과 남은 붕대로 자신의 몸도 돌볼 수 있었다.');
 patch('fallen_pack',1,{money:8},'짐을 찾기 쉬운 곳에 걸고 가까운 초소에 위치를 알렸다. 진행요원에게 분실물 수거 품삯을 받았다.');
 patch('delivery_1',0,{money:8},'봉인된 서류와 운송 경비 일부를 먼저 받았다. 약속한 초소의 표식을 확인했다.');
 patch('delivery_3',0,{money:37},'봉인이 온전한 서류를 인계하고 남은 운송 사례를 받았다.');
 patch('duelwork_1',0,{card:'sbr_basic_aim'},'정비공과 총열의 흔들림을 살피며 조준 자세를 익혔다. 교정 도면을 받아 다음 작업을 약속했다.');
 patch('bulwark_1',0,{money:8},'수선 재료를 옮긴 품삯과 정비공의 표식을 받았다. 완성된 외투는 다음 초소에서 받기로 했다.');
 patch('delivery_2',0,{eva:1},'겉에 찍힌 인장을 대조해 우회로를 찾았다. 노출된 길을 피하는 움직임을 익히고 정식 초소로 향했다.');
 patch('stage_story_5',0,{money:8},'기자가 이름과 체험담을 받아 적고 취재 사례 일부를 먼저 건넸다.');
 patch('press_story_1',0,{money:8},'기자가 체험담을 받아 적고 사례 일부를 먼저 건넸다. 기사가 실리면 다음 보급소에 한 부 맡기겠다고 했다.');
 for(const id of ['stage_story_7','official_route_check'])patch(id,1,{money:6},'가벼운 서류 가방과 운반 경비를 받았다. 약속한 초소의 위치를 확인했다.');
 patch('lucy_note_1',0,{money:6},'루시가 봉투와 전달에 쓸 여비를 건넸다. 봉인을 지킨 채 약속한 표식을 확인했다.');
 patch('stephen_briefing',0,{card:'sbr_basic_guard'},'진행요원이 노선의 위험 지점을 짚었다. 말에서 내려 몸을 숨기는 방어 동작까지 확인하고 출발했다.');
 patch('norisuke_photo',0,{eva:1},'서로 다른 표식을 맞춰 위험한 노면을 가려냈다. 무너지는 지반을 피하는 요령을 익혔다.');
 patch('junction_4',2,{eva:1},'허공의 물방울을 피해 발 디딜 곳을 확인했다. 그 사이로 비와 함께 움직이는 누군가의 흔적이 이어진다.');
 for(const id of ['gyro','johnny','hotpants','mountain'])patch('ally_'+id+'_1',1,{maxHp:2,hp:8},'보급을 나누고 함께 식사하며 몸을 돌봤다. 긴 여정에서 체력을 보전하는 요령이 남았다.');
 event('town_broker').c[1].actionCost=0;
 for(const e of D.events.filter(e=>!e.retired&&!e.shop))for(const c of e.c){const fx=c.ok.fx;
  if(!Object.keys(fx).length||Object.keys(fx).every(k=>k==='route')&&['declined','parted'].includes(fx.route?.result))c.actionCost=0;
 }
}
