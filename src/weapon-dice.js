export function validWeaponDice(profile){
 if(profile==null)return true;
 return typeof profile==='object'&&!Array.isArray(profile)&&Object.entries(profile).every(([k,v])=>Number.isSafeInteger(v)&&({die:v>=2&&v<=20,min:v>=0&&v<=4,add:v>=0&&v<=3})[k]);
}
export function weaponDiceProfile(D,g){return D.items[g.equipment?.weapon]?.weaponDice||null;}
export function visibleWeaponDice(D,g){
 if(g?.playback)return g.playback.before.P.weaponDice||null;
 if(g?.combat)return g.combat.P.weaponDice||null;
 return weaponDiceProfile(D,g);
}
export function weaponDiceDescription(profile){
 if(!profile)return '';
 return [profile.die?'피해 주사위 d'+profile.die:'',profile.min?'기본 주사위 최소 '+profile.min+'개':'',profile.add?'각 타격 주사위 +'+profile.add+'개':''].filter(Boolean).join(' · ');
}
export function adjustWeaponDice(card,profile,grade=null){
 if(card.t!=='atk')return card;
 const out={...card,hit:(card.hit||0)+(grade?.hit||0),b:(card.b||0)+(grade?.b||0),dice:Math.max(card.dice,card.die?0:profile?.min||0)+(grade?.dice||0)+(profile?.add||0)};
 if(!card.die&&profile?.die)out.die=profile.die;
 return out;
}
