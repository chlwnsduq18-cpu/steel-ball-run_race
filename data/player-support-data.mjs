export function addPlayerSupportData(D){
 D.playerSupport={
  version:2,
  start:{maxHp:24,atk:6,spd:2,eva:4},
  checkpoint:{maxHp:8,atk:2,eva:2},
  speedEvery:1,
  recovery:{victory:{minimum:18,ratio:.2},checkpoint:{minimum:24,ratio:.25}}
 };
 // Full bonuses for each tier, not cumulative additions to previous tiers.
 D.playerCardGrades=[
  {from:1,n:'',tier:0,hit:0,b:0,dice:0},
  {from:3,n:'+1',tier:1,hit:5,b:2,dice:0},
  {from:5,n:'+2',tier:2,hit:10,b:3,dice:1},
  {from:7,n:'+3',tier:3,hit:15,b:5,dice:1}
 ];
}
