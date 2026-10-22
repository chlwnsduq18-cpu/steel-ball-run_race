export function addCompanionData(D){
 D.removedEvents=D.hiddenBosses.map(b=>'memory_'+b.id);
 D.rules.companion={retryActions:3,defaultCheck:{s:'atk',dc:65}};
 const support=(id,skill,on,chance,cooldown,fx,extra={})=>({id,skill,on,chance,cooldown,fx,...extra});
 D.companions={
  gyro:{n:D.enemies.gyro.n,joinFrom:1,joinReq:[],joinFx:{eva:1,hp:8},supports:[
   support('rotation','철구의 회전',['afterHit'],75,2,{self:{charge:2},opponent:{rupture:2}},{damage:6,quoteCard:'sbr_gyro_throw'})]},
  johnny:{n:D.enemies.johnny.n,joinFrom:1,joinReq:[],joinFx:{eva:1,hp:8},supports:[
   support('cover','말 위의 엄호 사격',['roundStart'],75,2,{opponent:{sink:1}},{damage:5,quoteCard:'sbr_basic_shoot',variants:[
    {from:2,skill:'터스크 ACT.1 · 손톱탄',damage:6,fx:{opponent:{bleed:1}},quoteCard:'sbr_johnny_nail'},
    {from:5,skill:'터스크 ACT.2 · 탄흔의 추적',damage:8,fx:{opponent:{rupture:2}},quoteCard:'sbr_johnny_hole'},
    {from:7,skill:'터스크 ACT.3 · 구멍을 통한 엄호',damage:8,fx:{self:{shield:6},opponent:{rupture:2}},quoteCard:'sbr_johnny_hide'},
    {from:8,skill:'터스크 ACT.4 · 회전의 지원',damage:10,fx:{opponent:{rupture:3}},quoteCard:'sbr_johnny_infinite'}]})]},
  hotpants:{n:D.enemies.hotpants.n,joinFrom:1,joinReq:[],joinFx:{eva:1,hp:8},supports:[
   support('cream','크림 스타터 · 응급 처치',['roundStart','hurt'],90,2,{self:{hp:12,bleed:-2,burn:-2}},{when:{hpBelow:.6}})]},
  mountain:{n:D.enemies.mountain.n,joinFrom:1,joinReq:[],joinFx:{eva:1,hp:8},supports:[
   support('rope','오! 론섬 미 · 밧줄 엄호',['roundStart','hurt'],80,2,{self:{shield:10,breath:1}})]},
  wekapipo:{n:D.enemies.wekapipo.n,joinFrom:6,joinReq:{any:['ally:gyro','beat:magenta']},joinFx:{hp:8},joinText:'대통령 측과 맞설 이유를 확인한 웨카피포와 서로를 엄호하기로 했다.',supports:[
   support('wrecking','렉킹 볼 · 작은 철구의 협공',['afterHit'],75,2,{opponent:{sink:3,rupture:2}},{damage:4})]}
 };
 const checks={gyro:{s:'atk',dc:65},johnny:{s:'eva',dc:50},hotpants:{s:'eva',dc:55},mountain:{s:'spd',dc:50},wekapipo:{s:'atk',dc:95}};
 for(const e of D.events.filter(e=>/^ally_.*_1$/.test(e.id))){const id=e.id.slice(5,-2);e.companionEvent=id;e.req.push('companion:'+id);}
 for(const [id,c]of Object.entries(D.companions)){
  c.joinCheck=checks[id];for(const s of c.supports)s.firstGuaranteed=true;
  for(const s of c.supports)for(const row of [s,...(s.variants||[])]){
   if(row.quoteCard){const q=D.quotes[id];row.lines=q?.cardLines?.[row.quoteCard]||[];}
  }
 }
 validateCompanionData(D);
}
export function validateCompanionData(D){
 const need=(ok,label)=>{if(!ok)throw Error('Invalid companion: '+label);};
 for(const [id,c]of Object.entries(D.companions||{})){
  need(D.enemies[id]&&c.n&&c.supports?.length,id);if(c.joinCheck)need(D.stats[c.joinCheck.s]&&Number.isSafeInteger(c.joinCheck.dc),id+' check');need(Number.isInteger(c.joinFrom)&&c.joinFrom>=1&&c.joinFrom<=9,id+' join');
  const ids=new Set();for(const s of c.supports){need(s.id&&!ids.has(s.id),id+' support id');ids.add(s.id);
   need(s.on?.length&&s.on.every(x=>['roundStart','afterHit','hurt'].includes(x)),id+' timing');
   if(s.when?.hpBelow!==undefined)need(Number.isFinite(s.when.hpBelow)&&s.when.hpBelow>0&&s.when.hpBelow<=1,id+' HP condition');
   need(Number.isInteger(s.chance)&&s.chance>0&&s.chance<=100&&Number.isInteger(s.cooldown)&&s.cooldown>=1,id+' frequency');
   for(const row of [s,...(s.variants||[])]){
    need(row.skill&&(!row.quoteCard||D.cards[row.quoteCard]),id+' skill');
    if(row.damage!==undefined)need(Number.isSafeInteger(row.damage)&&row.damage>=0,id+' damage');
    for(const [side,fx]of Object.entries(row.fx||{})){need(['self','opponent'].includes(side),id+' target');for(const[k,v]of Object.entries(fx))need((k==='hp'||D.keywords[k])&&Number.isSafeInteger(v),id+' effect '+k);}
   }
  }
 }
 return true;
}
