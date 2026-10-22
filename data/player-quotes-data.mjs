// Short excerpts retained in their checked Korean wording; never machine-translated.
export function addPlayerQuoteData(D){
 const wiki=name=>'https://namu.moe/w/'+name.split('/').map(encodeURIComponent).join('/');
 const line=(text,source,motif)=>({text,source,motif});
 const copy=(who,cid)=>D.quotes[who].cardLines?.[cid]||D.quotes[who].lines||[{text:D.quotes[who].text,source:D.quotes[who].source}];
 const rows={
  steel:{families:['sbr_steel_joint','sbr_steel_focus'],lines:copy('gyro','sbr_enemy_gyro')},
  satellite:{families:['sbr_sat_wave','sbr_sat_finish'],lines:[line('좌반신실조.',D.quotes.wekapipo.source,'웨카피포')]},
  hamon:{families:['sbr_ham_overdrive'],lines:[line('떨려온다 하-트!',wiki('죠나단 죠스타/스타일리시 죠죠 액션 시리즈'),'죠나단 죠스타'),line('선라이트 옐로 오버드라이브!!',wiki('죠나단 죠스타/스타일리시 죠죠 액션 시리즈'),'죠나단 죠스타')]},
  vampire:{families:['sbr_vamp_feast'],lines:[line('가장 잔혹한 죽음을 선사하마!',wiki('디오 브란도'),'디오 브란도')]},
  pillar:{families:['sbr_pillar_combo','sbr_pillar_crush'],lines:[line('무슨 수를 쓰든… 마지막에… 이기면 그만이란 말이다아아아아아!!',wiki('카즈(죠죠의 기묘한 모험)'),'카즈')]},
  sword:{families:['sbr_sword_finish','sbr_growth_sword_read'],lines:[line('이미 싸워봤던 놈한테는! 절~~~대로 지지 않는다!!!',wiki('아누비스신'),'아누비스신')]},
  thread:{families:['sbr_thread_pull','sbr_thread_rush'],lines:[line('망설이지 마, 일단 패고 봐',wiki('쿠죠 죠린'),'쿠죠 죠린'),line('재기불능이 돼줘야겠어',wiki('쿠죠 죠린'),'쿠죠 죠린')]},
  colony:{families:['sbr_colony_barrage'],lines:[line('지성이라면 너희들보다 뛰어나다!',wiki('푸 파이터즈(죠죠의 기묘한 모험)'),'푸 파이터즈')]},
  pistols:{families:['sbr_pistol_bounce','sbr_pistol_volley'],lines:[line('다들 준비──! 겨냥 똑바로 해!',wiki('귀도 미스타'),'귀도 미스타'),line('진정한 「각오」는 지금부터야!',wiki('귀도 미스타'),'귀도 미스타')]},
  time:{families:['sbr_time_stop','sbr_time_finish'],lines:copy('otherdiego','sbr_enemy_otherdiego')}
 };
 for(const [id,r]of Object.entries(rows))r.lines=r.lines.map(l=>({...l,motif:l.motif||({steel:'자이로 체펠리',time:'평행세계 디에고'}[id]||D.starts.find(o=>o.id===id).n)}));
 D.playerQuotes={version:1,families:{},checked:'2026-10-20'};
 for(const [id,r]of Object.entries(rows))for(const family of r.families)D.playerQuotes.families[family]={origin:id,lines:structuredClone(r.lines)};
 // Select time stop and rush lines independently rather than say time stop on a punch.
 D.playerQuotes.families.sbr_time_finish.lines=copy('otherdiego','sbr_otherdiego_rush');
 for(const [type,who]of [['route_tusk','johnny'],['route_world','otherdiego'],['route_d4c','valentine']]){
  const r=D.stands.types[type],h=Object.values(D.deckGrowth).find(h=>h.type===type);
  for(const bundle of r.bundles)for(const cid of bundle){const c=D.cards[cid];if(c.c<2&&!c.skipTurns)continue;
   const key=c.dedicatedFamily||cid;const from=who==='johnny'?c.standLevel===3?'sbr_johnny_infinite':c.standLevel===2?'sbr_johnny_hide':c.standLevel===1?'sbr_johnny_hole':'sbr_johnny_nail':who==='otherdiego'?c.skipTurns?'sbr_enemy_otherdiego':'sbr_otherdiego_rush':c.t==='buff'?'sbr_valentine_love':'sbr_enemy_valentine';
   // Families include the evolution level in these IDs; keep each ACT's list distinct.
   D.playerQuotes.families[cid]={stand:type,lines:structuredClone(copy(who,from)),motif:who};
  }
  for(const bundle of D.stands.types[h.legacyType]?.bundles||[])for(const cid of bundle){const c=D.cards[cid],key=c.dedicatedFamily||cid;if(c.c>=2)D.playerQuotes.families[cid]={stand:h.legacyType,lines:structuredClone(copy(who,who==='johnny'?'sbr_johnny_infinite':who==='otherdiego'?'sbr_enemy_otherdiego':'sbr_enemy_valentine'))};}
 }
}
