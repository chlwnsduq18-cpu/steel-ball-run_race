export function addDeckData(D){
 D.deckUpgrade={version:1,legacyStarts:Object.fromEntries(D.starts.map(o=>[o.id,o.deck.slice()]))};
 D.rules.deckMin=4;D.rules.deckMax=12;
 // Existing attack keywords / hit healing / hit shielding do the work. No new combat field.
 const attack=(id,fx,d)=>{const c=D.cards[id];for(const k of ['heal','shield','passNext','debuffHit','cleanseRand','eva','selfHit','charge'])delete c[k];Object.assign(c,{t:'atk',hits:1,dice:1,b:0,hit:5},fx,{d});};
 attack('sbr_steel_prepare',{n:'회전을 싣다',kw:[['charge',2,'s']]},'1회 × 1d6 · 명중 +5 · 적중 시 기세 +2');
 attack('sbr_steel_recall',{n:'귀환 궤도',hit:10,kw:[['charge',2,'s']]},'1회 × 1d6 · 명중 +10 · 적중 시 기세 +2');
 attack('sbr_sat_ready',{n:'궤도를 잡는 사격',hit:10,kw:[['sink',1,'t']]},'1회 × 1d6 · 명중 +10 · 적중 시 위축 +1');
 attack('sbr_sat_wave',{dice:2,kw:[['sink',3,'t']]},'1회 × 2d6 · 명중 +5 · 적중 시 위축 +3');
 attack('sbr_ham_breathe',{n:'호흡을 잇는 타격',kw:[['breath',2,'s']]},'1회 × 1d6 · 명중 +5 · 적중 시 호흡 +2');
 attack('sbr_ham_heal',{dice:2,hitHeal:4,kw:[['breath',1,'s']]},'1회 × 2d6 · 명중 +5 · 적중 시 HP +4 · 호흡 +1');
 attack('sbr_vamp_brace',{n:'재생 강습',dice:2,hitShield:4},'1회 × 2d6 · 명중 +5 · 적중 시 보호막 +4');
 attack('sbr_pillar_shift',{n:'변형 견제',hitShield:3},'1회 × 1d6 · 명중 +5 · 적중 시 보호막 +3');
 attack('sbr_sword_observe',{n:'검끝으로 읽다',kw:[['breath',2,'s']]},'1회 × 1d6 · 명중 +5 · 적중 시 호흡 +2');
 attack('sbr_sword_yield',{dice:2,kw:[['breath',1,'s']]},'1회 × 2d6 · 명중 +5 · 적중 시 호흡 +1');
 attack('sbr_thread_unravel',{n:'실을 펼쳐 치다',hitShield:3},'1회 × 1d6 · 명중 +5 · 적중 시 보호막 +3');
 attack('sbr_thread_join',{n:'꿰매며 반격하다',hitHeal:2,kw:[['charge',1,'s']]},'1회 × 1d6 · 명중 +5 · 적중 시 HP +2 · 기세 +1');
 attack('sbr_colony_water',{n:'수분을 빼앗는 탄환',hitHeal:1,kw:[['charge',2,'s']]},'1회 × 1d6 · 명중 +5 · 적중 시 HP +1 · 기세 +2');
 attack('sbr_colony_restore',{n:'군체 회수 사격',dice:2,hitHeal:2,hitShield:4},'1회 × 2d6 · 명중 +5 · 적중 시 HP +2 · 보호막 +4');
 attack('sbr_pistol_position',{n:'유도 견제',hit:15,kw:[['charge',1,'s']]},'1회 × 1d6 · 명중 +15 · 적중 시 기세 +1');
 attack('sbr_pistol_reload',{n:'재장전 사격',kw:[['charge',2,'s']]},'1회 × 1d6 · 명중 +5 · 적중 시 기세 +2');
 attack('sbr_time_focus',{n:'찰나를 붙잡는 타격',kw:[['charge',2,'s']]},'1회 × 1d6 · 명중 +5 · 적중 시 기세 +2');
 attack('sbr_time_prepare',{n:'순간을 여는 타격',hit:10,kw:[['charge',2,'s']]},'1회 × 1d6 · 명중 +10 · 적중 시 기세 +2');
 const normal={
  ranch:['strike','pressure','guard'],frontier:['shoot','cut','step'],drifter:['rush','feint','cut'],
  marksman:['shoot','aim','burst'],medic:['strike','cut','guard'],caravan:['strike','pressure','brace'],
  craftsman:['shoot','pressure','aim'],riverboat:['rush','cut','step'],miner:['strike','burst','brace'],
  performer:['rush','feint','cut'],scout:['shoot','cut','step'],messenger:['rush','pressure','strike']
 };
 // Compatibility seed for Stand registration. Final recipes are in dedicated-deck-data.mjs.
 const hidden={
  steel:['prepare','throw','guard','recall','joint'],satellite:['ready','shot','wave','flank','finish'],
  hamon:['breathe','punch','flow','heal','overdrive'],vampire:['bite','claw','regen','brace','feast','bite'],
  pillar:['shift','strike','slide','combo','crush'],sword:['observe','slash','slash','guard','finish'],
  thread:['unravel','bind','evade','join','rush'],colony:['water','shot','split','restore','barrage','shot'],
  pistols:['position','shoot','bounce','reload','volley'],time:['stop','prepare','strike','place','finish']
 };
 const prefix={satellite:'sat',hamon:'ham',vampire:'vamp',pistols:'pistol'};
 for(const o of D.starts){o.deck=o.hidden?hidden[o.id].map(k=>'sbr_'+(prefix[o.id]||o.id)+'_'+k):normal[o.id].map(k=>'sbr_basic_'+k);if(o.deck.some(id=>!D.cards[id]))throw Error('Unknown starter card '+o.id);}
}
