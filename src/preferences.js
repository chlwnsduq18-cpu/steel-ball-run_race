export const UI_THEMES=[
 {id:'dusk',n:'황야',d:'따뜻한 어두운 화면'},
 {id:'paper',n:'기록지',d:'밝은 종이와 짙은 글씨'},
 {id:'ink',n:'흑백',d:'차분한 흑백 화면'}
];
export function normalizePreferences(value){
 return {combat:['normal','fast','off'].includes(value?.combat)?value.combat:'normal',theme:UI_THEMES.some(t=>t.id===value?.theme)?value.theme:'dusk'};
}
export function applyTheme(doc,theme){
 const chosen=normalizePreferences({theme}).theme;
 if(doc.documentElement?.dataset)doc.documentElement.dataset.theme=chosen;
 return chosen;
}
