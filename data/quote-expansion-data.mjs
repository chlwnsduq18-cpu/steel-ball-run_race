// Short excerpts from Korean wiki/game dialogue tables; no generated translations.
export function addQuoteExpansion(D){
 const wiki=name=>'https://namu.moe/w/'+name.split('/').map(encodeURIComponent).join('/'),asbr=name=>wiki(name+'/죠죠의 기묘한 모험 올 스타 배틀 R');
 const add=(id,source,texts,cards)=>{const q=D.quotes[id]||{};D.quotes[id]={...q,text:texts[0],source,cards:cards||D.enemies[id].deck.slice(),lines:texts.map(text=>({text,source})),verification:'한국어 위키의 대사·게임 기술표에서 확인한 짧은 발췌',checked:'2026-10-19'};};
 add('gyro',asbr('자이로 체펠리'),['그 무엇보다도 『납득』이 먼저야!!','내 철구를 받아라!','한 방 더어어어어어어어!','『황금의 회전』!'],['sbr_enemy_gyro','sbr_gyro_throw','sbr_gyro_scan','sbr_gyro_ballbreaker']);
 add('diego',asbr('디에고 브란도'),['『도려내주마』!','각오는 됐겠지─!','헛수고다 헛수고오오오']);
 add('valentine',asbr('퍼니 밸런타인'),['영광으로 생각하도록!','데리고 돌아왔다! 전부 나다!','모든 것은 내 나라를 위해...!'],['sbr_enemy_valentine','sbr_valentine_flag','sbr_valentine_love']);
 add('otherdiego',asbr('디에고 브란도(평행세계)'),['『THE WORLD』, 나만의 시간이다!','재미는 지금부터야...','꿰뚫어주마','와이어를 쳐뒀어!!'],['sbr_enemy_otherdiego','sbr_otherdiego_knife','sbr_otherdiego_wire']);
 add('ringo',wiki('링고 로드어게인'),['나를 죽이면 이 숲에서 나가게 해 주지.','그래서 대응자라는 거다!',"'빛의 길'을 봐라…"],['sbr_enemy_ringo','sbr_ringo_duel']);
 add('wekapipo',wiki('웨카피포'),['좌반신실조.','우리는 그보다 한 수 위에 있다!']);
 add('mountain','https://seore.org/w/'+encodeURIComponent('마운틴 팀'),['어이쿠, 대화가 성립하지 않는 멍청이가 하나 등장~','질문에 질문으로 대답하면 시험 빵점인거 알고는 있나?']);
 add('hotpants',wiki('핫 팬츠(죠죠의 기묘한 모험)'),['안녕하신가. 인사는 이 정도로 하고 용건을 말하지.',"지금부터 너희를 나무에 '매달겠다'."]);
 add('magenta','https://seore.org/w/'+encodeURIComponent('마젠트 마젠트'),['비행기가 발명되기만 했다면 이런 일은 없었을 텐데'],['sbr_enemy_magenta']);
 add('robinson',wiki('미세스 로빈슨(죠죠의 기묘한 모험)'),["그 '벌레들'을 너희 주변에 풀어 놨다!",'누구에게도 지지 않게 몸 안에 벌레를 키움으로써 말이야...']);
 add('stroheim',wiki('프리츠 폰 슈트로하임'),['철구의 회전..... 그 회전으로 물질을 깎아내거나 인체의 근육을 지배할 수도 있지.','자신의 피부를 단단하게 해서 탄환을 튕기는 것도 가능한 건가...']);
 D.quotes.ringo.lines[0].source='https://seore.org/w/'+encodeURIComponent('링고 로드어게인');
 // Existing, verified short lines now accompany both the signature and ordinary ability cards.
 D.quotes.boomboom.cards=D.enemies.boomboom.deck.slice();D.quotes.disco.cards=D.enemies.disco.deck.slice();
}
