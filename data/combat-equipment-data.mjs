export function addCombatEquipment(D){
 D.combatTuning={sink:{cap:6,per:3,hit:4,dmg:1,keep:0.5}};
 D.keywords.sink.d='3당 명중 -4·주는 피해 -1. 최대 6중첩. 턴 종료 시 절반으로 감소하며 소수점은 버린다.';
 const profiles={
  market_desert_carbine:{die:8},market_winchester:{die:8},market_sabre:{add:1},market_duel_revolver:{add:1},market_light_lance:{die:8},market_eastern_pistol:{die:8,add:1},
  rare_carbine:{die:10},rare_duel_blade:{die:8,add:1},weapon_family_ball:{die:8},weapon_wrecking_ball:{add:1},weapon_clacker:{add:1},weapon_pluck:{die:8},
  trophy_gyro_ball:{die:8,min:3},trophy_ringo:{die:10,add:1},trophy_ringo_sight:{die:10,add:1},trophy_mountain:{add:1},trophy_oye:{die:8,min:3},trophy_otherdiego:{die:10,add:1},
  route_ironball:{die:8,min:3},route_duelgun:{die:10,add:1},sbr_spare_rifle:{die:8,add:1},commission_ball:{die:8,min:2},merchant_sabre:{die:8,add:1}
 };
 for(const[id,profile]of Object.entries(profiles)){const it=D.items[id];if(!it||it.slot!=='weapon')throw Error('Invalid weapon dice: '+id);it.weaponDice=profile;}
 // Growth is shown in the status panel, not repeated in every generic card name.
 for(const c of Object.values(D.cards))if(c.stand)c.n=c.n.replace(/ · (발현|성장|진화|완성)$/u,'');
 D.weaponDiceRules={fixedDie:'카드에 면 수가 지정되어 있으면 그 면 수를 유지합니다. 추가 주사위는 그 면 수로 굴립니다.',minimum:'무기 최소 개수와 카드 기본 개수 중 큰 값에 카드 강화·추가 주사위를 더합니다. 카드에 면 수가 지정된 공격에는 무기 최소 개수를 적용하지 않습니다.'};
}
