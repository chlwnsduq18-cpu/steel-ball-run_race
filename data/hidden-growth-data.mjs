export function addHiddenGrowthData(D){
 const self=(on,fx)=>({on,fx,to:'self',limit:1}),foe=(on,fx)=>({on,fx,to:'opponent',limit:1});
 const rows={
  steel:['철구의 회전을 끊지 않고 세 공방을 잇는다',[self('roundStart',{charge:1}),self('defense',{charge:1})]],
  satellite:['위성 철구의 사각을 유지하며 세 공방을 버틴다',[foe('hit',{sink:1}),self('defense',{charge:1})]],
  hamon:['호흡을 잇는 파문으로 세 공방을 버틴다',[self('roundStart',{breath:1}),foe('hit',{burn:1})]],
  vampire:['상처를 회복하며 세 공방의 거리를 유지한다',[self('hit',{hp:2}),self('hurt',{shield:1})]],
  pillar:['몸의 형태를 바꾸며 세 공방을 견딘다',[self('hurt',{shield:2}),self('roundStart',{hp:1})]],
  sword:['읽어 낸 칼의 궤도로 세 공방을 잇는다',[self('roundStart',{breath:2}),foe('hit',{rupture:2}),self('defense',{charge:2})]],
  thread:['실의 장력을 유지하며 세 공방을 버틴다',[self('defense',{shield:5}),foe('hit',{rupture:2}),self('roundStart',{breath:1})]],
  colony:['군체를 회수하며 세 공방을 버틴다',[self('hit',{hp:4}),self('hurt',{shield:3}),self('battleStart',{charge:3})]],
  pistols:['탄환의 다음 궤도를 준비하며 세 공방을 잇는다',[self('hit',{charge:2}),self('roundStart',{breath:2}),foe('hit',{rupture:1})]],
  time:['시간정지 뒤의 자세까지 세 공방을 잇는다',[self('roundStart',{charge:2,breath:2}),self('battleStart',{shield:8})]]
 };
 const insights={sword:self('battleStart',{breath:3}),thread:self('battleStart',{shield:6}),colony:self('roundStart',{hp:1}),pistols:self('battleStart',{charge:3}),time:self('battleStart',{breath:3})};
 const timing={battleStart:'전투 시작',roundStart:'턴 시작',hit:'적중',hurt:'피격',defense:'방어 카드 사용'};
 D.hiddenGrowth={};
 for(const o of D.starts.filter(x=>x.hidden)){
  const [trial,effects]=rows[o.id],ids=[1,2,3].map(n=>'origin_'+o.id+'_'+n),events=ids.map(id=>D.events.find(e=>e.id===id)),item=D.items['lesson_'+o.id];
  if(events.some(e=>!e)||!item)throw Error('히든 성장 루트 누락 '+o.id);
  item.effects=effects;item.d=effects.map(e=>timing[e.on]+': '+(e.to==='opponent'?'상대 ':'')+Object.entries(e.fx).map(([k,v])=>(D.keywords[k]?.n||'HP')+' +'+v).join(' · ')+(e.on==='battleStart'?' (전투당 1회)':' (턴당 1회)')).join(' / ');
  events.forEach((e,i)=>{
   e.hiddenGrowth=o.id;e.from=[2,4,7][i];e.to=[5,7,9][i];
   // Each chapter must follow actual race progress, including late starts.
   if(i)e.after={flag:'story_'+o.id+'_'+i,ticks:D.rules.turnsPerStage+1};
   if(i&&!e.req.includes('origin:'+o.id))e.req.push('origin:'+o.id);
  });events[1].c[0].l=trial;
  const reward=events[2].c.find(c=>c.ok.fx.item===item.id);reward.l='전용 기술을 완성한다';reward.hint=item.d;reward.ok.t=events[2].x+' 전용 기술의 기록을 남겼다.';
  o.standAwakening=o.stand?'native':'allowed';
  const insight=insights[o.id];if(insight){
   const id='insight_'+o.id,n=events[0].t+'의 깨달음',d=timing[insight.on]+': '+Object.entries(insight.fx).map(([k,v])=>(D.keywords[k]?.n||'HP')+' +'+v).join(' · ')+(insight.on==='battleStart'?' (전투당 1회)':' (턴당 1회)');
   D.items[id]={id,n,d,effects:[insight]};
   for(const c of events[1].c){const fx=c.ok.fx;if(fx.combat){fx.combat.winFx.item=id;c.hint='실전 통과: '+d;}else if((Array.isArray(fx.flag)?fx.flag:[fx.flag]).includes('story_'+o.id+'_master'))fx.item=id;}
   events[0].weight=6;events[0].priority=3;
  }
  D.hiddenGrowth[o.id]={title:events[0].t,events:ids,item:item.id,benefit:item.d,...(insight?{insight:'insight_'+o.id}: {})};
 }
}
