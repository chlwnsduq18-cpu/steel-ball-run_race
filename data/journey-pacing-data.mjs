export function addJourneyPacingData(D){
 // Retain obsolete IDs for saves and historical results, but never draw them again.
 for(const e of D.events.filter(e=>e.id.startsWith('junction_')))e.retired=true;
 const opt=(l,t,fx,extra={})=>({l,ok:{t,fx},...extra});
 const update=(id,t,x,from,to,c)=>Object.assign(D.events.find(e=>e.id===id),{t,x,from,to,fromTick:(from-1)*8+1,priority:0,weight:3,once:true,retired:false,c});
 update('junction_1','말라붙은 개울의 두 길','대회 표식은 능선으로 이어진다. 개울 바닥에는 표식 밖으로 빠져나간 마차의 바퀴 자국이 남아 있다. 뒤따라온 보급마차가 돌아가는 길을 함께 가겠느냐고 묻는다.',1,3,[
  opt('대회 표식을 따라 능선으로 간다','정해진 노선으로 말을 몰았다. 쉬운 지형에서 호흡을 골랐다.',{hp:5,nextTravel:'ride'}),
  {l:'개울 바닥의 바퀴 자국을 추적한다',check:{s:'eva',dc:35},ok:{t:'풀숲에서 떨어진 보급을 찾아 여비를 아꼈다.',fx:{money:14,flag:'route_mountain',nextTravel:'explore'}},fail:{t:'말발굽이 진흙에 빠졌다. 보급은 찾지 못하고 돌아섰다.',fx:{hp:-5,nextTravel:'ride'}}},
  opt('보급마차와 함께 돌아간다','식량값을 보태고 마차 곁에서 쉬었다. 다음 초소에서 다시 출발하기로 했다.',{hp:14,nextTravel:'town'},{cost:6})
 ]);
 update('junction_4','산길의 검문소','협곡 입구에서 대회 진행요원이 표식을 확인하고 있다. 위쪽 능선에는 말 한 마리가 지날 틈이 보이고, 계곡에서는 비가 그친 뒤에도 물방울이 허공에 남아 있다.',4,6,[
  opt('검문소의 짐을 옮기며 쉬어 간다','진행요원의 짐을 옮겨 주고 품삯을 받았다. 따뜻한 물을 마신 뒤 다시 출발했다.',{money:10,hp:5,nextTravel:'town'}),
  {l:'능선을 넘어 주행 감각을 익힌다',check:{s:'spd',dc:40},ok:{t:'말의 보폭에 맞춰 좁은 길을 통과했다.',fx:{spd:1,nextTravel:'ride'}},fail:{t:'좁은 바위 틈을 돌아 나오며 다리를 긁혔다.',fx:{hp:-6,nextTravel:'ride'}}},
  opt('계곡에 남은 물방울을 조사한다','물방울 사이를 지나는 발자국을 발견했다. 비와 함께 움직이는 누군가의 흔적이었다.',{flag:'route_blackmore',nextTravel:'explore'},{hint:'블랙모어의 특수 조우 단서 · 흔적 탐색'})
 ]);
 update('junction_7','동부행 철로의 갈림길','대회 노선과 철로가 나란히 이어진다. 진행요원은 앞쪽의 안전한 급수장을 가리킨다. 선로 옆 객차에서는 같은 옷차림의 남자들이 차례로 모습을 드러낸다.',7,9,[
  opt('급수장에서 몸을 돌본다','말에게 물을 먹이고 남은 보급을 정리했다. 굳어 있던 몸도 조금 풀렸다.',{hp:14,nextTravel:'ride'}),
  opt('위험을 감수하고 객차를 살핀다','문 안쪽으로 다가가자 여러 총구가 한꺼번에 당신을 향했다.',{combat:{enemy:'eleven',winFx:{money:25},winText:'객차를 점거한 무리를 물리치고 남은 보급을 챙겼다.'}},{req:'noflag:beat_eleven',hint:'11명의 남자와 전투 · 승리 시 추가 $25'})
 ]);
 D.events.find(e=>e.id==='junction_7').req=['noflag:beat_eleven'];
 for(const e of D.events)if(!e.once&&!e.shop&&!e.hiddenGrowth&&!e.deckGrowth)e.repeatAfter=12;
 // Remove redundant light-rest alternatives where the existing alternatives already cover them.
 const line=D.events.find(e=>e.id==='racing_line');line.c=line.c.filter(c=>c.cost!==6);
 const range=D.events.find(e=>e.id==='town_range');range.c=range.c.filter(c=>c.l!=='구경하며 배운다');
}
