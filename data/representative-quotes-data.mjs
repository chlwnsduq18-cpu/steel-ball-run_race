// Short Korean excerpts, selected by the character's role and actual card use.
// Wiki wording is retained; this is not an independent check against a print edition.
export function addRepresentativeQuotes(D){
 const wiki=name=>'https://namu.moe/w/'+name.split('/').map(encodeURIComponent).join('/');
 const johnny=wiki('죠니 죠스타'),gyro=wiki('자이로 체펠리'),president=wiki('퍼니 밸런타인');
 const game=name=>wiki(name+'/죠죠의 기묘한 모험 올 스타 배틀 R');
 const line=(text,source,context)=>({text,source,context});
 const j={
  zero:line('난 아직 「마이너스」야! 「제로」로 가고 싶어!',game('죠니 죠스타'),'공식 게임의 한국어 범용 등장 대사 표'),
  resolve:line('그러나, 더 이상은 망설이지 않아.',johnny,'발포를 망설이지 않겠다는 결심 부분 발췌'),
  lesson:line('Lesson 5는 이걸 위해...!',johnny,'ACT.4 각성 장면의 짧은 발췌'),
  thanks:line('고마워... 고마워. 자이로.',johnny,'ACT.4 장면의 감사 인사 부분 발췌'),
  rush:line('오라오라오라오라오라오라오라오라오라오라오라!!!!',johnny,'ACT.4 러시'),
  nail:line('이제부터는 「터스크」라 부르겠어!',game('죠니 죠스타'),'손톱탄 기술의 한국어 게임 표기'),
  hole:line('회전은 「구멍」이 되고도 죽지 않아!',game('죠니 죠스타'),'탄흔 추적 기술의 한국어 게임 표기'),
  aim:line('방금 알았다. 쏴야만 할 장소를...!',johnny,'사격 대사')
 };
 const g={
  detour:line('가장 가까운 길은 멀리 돌아가는 길이었어.',gyro,'레슨 5의 핵심 문장 발췌'),
  infinite:line('회전은 무한의 힘이다. 그걸 믿어라.',gyro,'레슨 3'),
  respect:line('경의를 표해라.',gyro,'레슨 4의 첫 문장 발췌'),
  conviction:line('그 무엇보다도 「납득」이 먼저야!!',gyro,'납득에 관한 원작 어록의 문장 발췌')
 };
 const v={
  justice:line('나의 마음과 행동에는 단 한 점의 거리낌도 없다...! 모든 것이 『정의』다.',game('퍼니 밸런타인'),'원작의 정의 선언과 게임 소개 인용문'),
  napkin:line('최초에 냅킨을 잡은 것이 가능한 인간이 된다.',president,'냅킨과 질서에 관한 연설의 문장 발췌'),
  trial:line("'시련'은 '강적'일수록 좋다...",president,'최종전에서 시련을 말하는 문장 발췌'),
  selves:line('데리고 돌아왔다! 전부 나다!',game('퍼니 밸런타인'),'평행세계의 협공 기술'),
  country:line('모든 것은 내 나라를 위해...!',game('퍼니 밸런타인'),'조국을 위한 행동이라는 선언')
 };
 const update=(id,primary,cardLines)=>{
  const q=D.quotes[id];delete q.lines;
  Object.assign(q,{text:primary.text,source:primary.source,cards:Object.keys(cardLines),cardLines,checked:'2026-10-20',verification:'한국어 위키의 원작 어록 및 게임 대사 표 대조. 정발본 직접 대조는 하지 않음.'});
 };
 update('johnny',j.zero,{
  sbr_basic_shoot:[j.zero,j.resolve],sbr_basic_aim:[j.zero],
  sbr_enemy_johnny:[j.aim,j.resolve],sbr_johnny_nail:[j.zero,j.nail],
  sbr_johnny_hole:[j.hole,j.aim],sbr_johnny_hide:[j.resolve],
  sbr_johnny_infinite:[j.lesson,j.thanks,j.rush]
 });
 update('gyro',g.detour,{
  sbr_enemy_gyro:[g.conviction,g.infinite],sbr_gyro_throw:[g.infinite,g.conviction],
  sbr_gyro_scan:[g.respect,g.conviction],sbr_gyro_ballbreaker:[g.detour,g.infinite]
 });
 update('valentine',v.justice,{
  sbr_enemy_valentine:[v.selves,v.trial],sbr_valentine_flag:[v.napkin,v.trial,v.country],
  sbr_valentine_love:[v.justice]
 });
 D.representativeQuotes={johnny:Object.values(j),gyro:Object.values(g),valentine:Object.values(v)};
}
