export function standIdentityFields({esc,prefix,name='',line=''}){
 return `<div class="stand-identity-fields"><label>스탠드 이름<input id="${prefix}-stand-name" maxlength="20" autocomplete="off" value="${esc(name)}" placeholder="직접 입력 · 20자 이내"></label><label>결정 대사 <small>선택</small><input id="${prefix}-stand-line" maxlength="60" autocomplete="off" value="${esc(line)}" placeholder="전용기 연출에 표시 · 60자 이내"></label></div>`;
}
