import fs from 'node:fs';import assert from 'node:assert/strict';
const html=fs.readFileSync('sbr-race.html','utf8'),js=html.match(/<script type="module">([\s\S]*?)<\/script>/)[1];
export function boot(storage=new Map()){
 const elements=new Map(),listeners=new Map(),timers=new Map(),scrolls=[];let timerId=0;
 const document={documentElement:{dataset:{}},hidden:false,scrollingElement:{scrollTo(options){scrolls.push(options);}},querySelector(s){if(!elements.has(s)){const handlers=new Map();elements.set(s,{innerHTML:'',textContent:'',value:s==='#name'?'나의 참가자':'',open:false,classList:{toggle(){},add(){},remove(){}},addEventListener(k,f){handlers.set(k,f);},showModal(){this.open=true;},close(){this.open=false;handlers.get('close')?.();}});}return elements.get(s);},addEventListener(k,f){listeners.set(k,f);}};
 let seed=12345;const math=Object.create(Math);math.random=()=>((seed=(Math.imul(seed,1664525)+1013904223)>>>0)/4294967296);
 const localStorage={getItem:k=>storage.get(k)||null,setItem:(k,v)=>storage.set(k,v)};
 const ui=new Function('document','localStorage','setTimeout','clearTimeout','console','Math',js+';return {action,render,get race(){return race},get data(){return data},get draft(){return draft}};')(document,localStorage,(fn,ms)=>{const id=++timerId;timers.set(id,{fn,ms});return id;},id=>timers.delete(id),console,math);
 ui.draft.origins='ranch';ui.draft.talents='steady';return {ui,storage,document,elements,timers,scrolls,text:()=>elements.get('#app').innerHTML,close:()=>elements.get('#sheet').close(),step(){const pair=timers.entries().next().value;assert(pair,'scheduled playback');timers.delete(pair[0]);pair[1].fn();},input(id,value){document.querySelector('#'+id).value=value;listeners.get('input')({target:{id,value}});},changeRoute(value){listeners.get('change')({target:{id:'next-route',value}});}};
}
