// Short checked excerpts. Technique labels are explicitly distinguished from quotations.
export function addHiddenBossQuotes(D){
 const wiki=n=>'https://namu.moe/w/'+n.split('/').map(encodeURIComponent).join('/');
 const game=n=>n+'/죠죠의 기묘한 모험 올 스타 배틀 R';
 const rows={
 bruford:['브루포드',{strike:['네 놈의 모든 것을 다해 이 브루포드와 싸워라아아아!'],combo:['댄스 머카브 헤어',true]}],
 tarkus:['타커스',{strike:['헬 헤븐 스네이킬',true]}],
 dio1:['디오 브란도',{strike:['가장 잔혹한 죽음을 선사하마!'],art:['가장 잔혹한 죽음을 선사하마!']}],
 esidisi:['에시디시',{strike:['이거나 먹고 죽어라, 『괴염왕』의 유법!'],combo:['이거나 먹고 죽어라']}],
 wamuu:[game('와무우'),{strike:['신사폭풍!',true],support:['바람만을 느껴 사물을 보겠다!']}],
 kars:['카즈(죠죠의 기묘한 모험)',{strike:['내겐 휘채활도가 있다'],combo:['무슨 수를 쓰든… 마지막에… 이기면 그만이란 말이다아아아아아!!']}],
 dire:['다이어(죠죠의 기묘한 모험)',{strike:['걸렸구나, 바보자식!'],art:['파문을 담은 장미',true]}],
 will:['윌 A. 체펠리/스타일리시 죠죠 액션 시리즈',{strike:['용기란 대체 무엇인가! 태양의 파문!'],support:['파문의 흐름을 알려주지.']}],
 jonathan:['죠나단 죠스타/스타일리시 죠죠 액션 시리즈',{strike:['선라이트 옐로 오버드라이브!!'],finish:['떨려온다 하-트!']}],
 santana:['산타나(죠죠의 기묘한 모험)',{strike:['귀찮다. 이 원시인아.'],combo:['귀찮다. 이 원시인아.']}],
 rudol:['루돌 폰 슈트로하임',{strike:['우리 독일의 과학력으으으으으은 세계 제일!!'],support:['자외선 조사 장치',true]}],
 joseph2:['죠셉 죠스타/미디어믹스에서의 모습',{strike:['파문 오버드라이브의 비트! 박살을 내주겠어!'],art:['다시 한 번 저질러 드렸습니다용~']}],
 chaka:['아누비스신',{strike:['이미 싸워봤던 놈한테는! 절~~~대로 지지 않는다!!!'],finish:['이미 싸워봤던 놈한테는! 절~~~대로 지지 않는다!!!']}],
 khan:['아누비스신',{strike:['이미 싸워봤던 놈한테는! 절~~~대로 지지 않는다!!!'],combo:['이미 싸워봤던 놈한테는! 절~~~대로 지지 않는다!!!']}],
 polnareff:[game('장 피에르 폴나레프'),{strike:['내 스탠드는 전차를 상징하는 「실버 채리엇」!'],art:['내 본래 스피드를 보여주지!']}],
 westwood:['비비아노 웨스트우드',{strike:['이 자식들, 어디 한 번 덤벼봐라!!!'],support:['난 네녀석들이 구역질나게 짜증난단 말이다!!']}],
 rikiel:['리키엘',{strike:['나는 아폴로 11호란 말이다!!'],combo:['나는 아폴로 11호란 말이다!!']}],
 pucci_mih:['엔리코 푸치',{strike:['무너져 내리는 자신의 연약함을 깨달아라!'],extra:['무너져 내리는 자신의 연약함을 깨달아라!']}],
 lang:['랭 랭글러',{strike:['「점핑 잭 플래시」, 최고로구만.'],combo:['이 몸의 미래는 무적의 장밋빛이다.']}],
 sports:['스포츠 맥스',{strike:['림프 비즈킷',true]}],
 pucci_ws:[game('엔리코 푸치'),{strike:['이것이 내 『화이트스네이크』의 능력!'],art:['이것이 내 『화이트스네이크』의 능력!']}],
 prosciutto:['프로슈토(죠죠의 기묘한 모험)',{strike:["'죽인다'… 그런 말은 할 필요가 없어."],combo:["'죽인다'… 그런 말은 할 필요가 없어."]}],
 ghiaccio:['기아초',{strike:['화이트 앨범!',true],support:['화이트 앨범 젠틀리 위프스!']}],
 diavolo:['디아볼로/미디어 믹스',{strike:['제왕은 나 디아볼로다!'],support:['이것은 「시련」이다.'],extra:['운명은 나를 『정점』으로 선택해주었다!']}],
 ndoul:['은두르',{strike:['주저할 필요가 없군!'],art:['흥... 어딨는지 다 보인다! 마무리다!']}],
 vanilla:['바닐라 아이스(죠죠의 기묘한 모험)',{strike:['하나하나, 차례차례, 나 바닐라 아이스의 암흑공간에서 해체해주마.']}],
 dio3:['DIO/미디어 믹스',{strike:['체크메이트다!'],support:['시간이여 멈춰라!'],art:['무다무다!',true],combo:['로드롤러다!',true]}],
 kakyoin:[game('카쿄인 노리아키'),{strike:['에메랄드 스플래시!'],art:['에메랄드 스플래시!']}],
 joseph3:['죠셉 죠스타/스타더스트 크루세이더즈',{strike:['태양의 에너지 「파문」!'],probe:['잡았다고']}],
 jotaro:['쿠죠 죠타로',{strike:['네놈은 나, 쿠죠 죠타로가 직접 박살내 주마.'],finish:['내가 시간을 멈추었다…'],art:['스타 핑거!',true]}],
 mike:['마이크 O',{strike:['용서받을 세계가 아니야…'],art:['용서받을 세계가 아니야…']}]
 };
 for(const[k,[page,lines]]of Object.entries(rows)){
  const id='hr_'+k,cardLines={};for(const[suffix,[text,call]]of Object.entries(lines)){const cid=id+'_'+suffix;if(!D.cards[cid])throw Error(cid);cardLines[cid]=[{text,source:wiki(page),kind:call?'technique-call':'excerpt',context:call?'원작 기술명의 발동 연출. 원문 대사 인용으로 분류하지 않음.':'한국어 위키의 원작·게임 대사 짧은 발췌'}];}
  const first=Object.values(cardLines)[0][0];D.quotes[id]={text:first.text,source:first.source,cards:Object.keys(cardLines),cardLines,checked:'2026-10-20',verification:'한국어 공개 자료 대조. 기술명 연출과 대사 발췌 구분; 정발본 직접 대조 아님.'};
 }
 D.quotes.oye={text:'죽어줘야겠어.',source:wiki('오예코모바'),cards:[D.enemies.oye.signature||D.enemies.oye.rewardCards[0]],checked:'2026-10-20',verification:'한국어 원작 대사 발췌'};
 D.quotes.hr_bruford.trigger='defeated';D.quotes.hr_bruford.defeatedText='이제 세상에 대한 원한은 없다...';
 D.quotes.hr_ndoul.trigger='defeated';D.quotes.hr_ndoul.defeatedText='악에는 악의 구세주가 필요한 법';
}
