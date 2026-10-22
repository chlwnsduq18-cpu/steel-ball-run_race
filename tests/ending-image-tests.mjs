import assert from 'node:assert/strict';
import {endingImageBlocks,wrapEndingText,createEndingPng,exportEndingImage} from '../src/ending-image.js';
const el=(tag,text='',classes=[],children=[])=>({tagName:tag.toUpperCase(),textContent:text,children,classList:{contains:x=>classes.includes(x)}});
const section=el('section','',[],[el('h1','엔딩'),el('p','결말 본문'),el('details','',[],[el('summary','마지막 덱'),el('div','',['ending-card'],[el('b','손톱탄'),el('span','효과')])])]);
const blocks=endingImageBlocks(section);assert(blocks.some(x=>x.text.includes('손톱탄')));assert(blocks.some(x=>x.text==='결말 본문'));
let drawn=[],canvas,clicks=0,status={textContent:''},buttons=[{disabled:false},{disabled:false}];
const ctx={measureText:t=>({width:Array.from(t).length*25}),scale(){},fillRect(){},fillText:(t,x,y)=>drawn.push({t,x,y}),font:'',fillStyle:''};
const doc={fonts:{ready:Promise.resolve()},body:{append(){}},querySelector:()=>status,querySelectorAll:()=>buttons,createElement:tag=>tag==='canvas'?(canvas={getContext:()=>ctx,toBlob:cb=>cb(new Blob(['png'],{type:'image/png'}))}):{style:{},click(){clicks++;},remove(){}}};
assert.deepEqual(wrapEndingText(ctx,'가나다라마바사',75),['가나다','라마바','사']);
await createEndingPng([...blocks,{type:'body',text:'긴한글기록'.repeat(1000)}],doc);assert(canvas.height>1000);assert(drawn.every(r=>r.y<canvas.height));
let item,notices=[];class Item{constructor(x){this.data=x;item=this;}}
await exportEndingImage('copy',{section,doc,Item,nav:{clipboard:{write:async items=>assert.equal((await items[0].data['image/png']).type,'image/png')}},notify:x=>notices.push(x)});assert(notices.at(-1).includes('복사했습니다'));assert(buttons.every(b=>!b.disabled));
await exportEndingImage('copy',{section,doc,Item,nav:{},notify:x=>notices.push(x)});assert(notices.at(-1).includes('지원하지'));
await exportEndingImage('copy',{section,doc,Item,nav:{clipboard:{write:async()=>{throw Error('denied')}}},notify:x=>notices.push(x)});assert(notices.at(-1).includes('다운로드'));assert(buttons.every(b=>!b.disabled));
const timer=globalThis.setTimeout;globalThis.setTimeout=f=>{f();return 0;};
await exportEndingImage('download',{section,name:'이름/테스트',doc,nav:{},notify:x=>notices.push(x)});globalThis.setTimeout=timer;assert.equal(clicks,1);assert(notices.at(-1).includes('다운로드'));
console.log('PASS: collapsed records, Korean wrapping, long image, PNG, clipboard success/unsupported/denied, download, button recovery');
