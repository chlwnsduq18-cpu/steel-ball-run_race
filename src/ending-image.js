// Render only the ending record; no page screenshot or external upload.
export function endingImageBlocks(section){
 const blocks=[];
 function walk(el){
  const tag=el.tagName?.toLowerCase();
  if(tag==='h1'||tag==='h2'||tag==='p'||tag==='summary'||el.classList?.contains('eyebrow')){
   const text=el.textContent.trim();if(text)blocks.push({text,type:tag==='h1'?'title':tag==='h2'||tag==='summary'?'heading':el.classList?.contains('eyebrow')?'label':'body'});return;
  }
  if(el.classList?.contains('stats')||el.classList?.contains('finish-rank')||el.classList?.contains('ending-card')){
   const text=[...el.children].map(c=>c.textContent.trim()).join('  ·  ');if(text)blocks.push({text,type:'body'});return;
  }
  if(tag==='b'){blocks.push({text:el.textContent.trim(),type:'heading'});return;}
  for(const child of el.children||[])walk(child);
 }
 walk(section);return blocks;
}
export function wrapEndingText(ctx,text,width){
 const lines=[];for(const para of String(text).split(/\r?\n/)){let row='';for(const ch of Array.from(para)){if(row&&ctx.measureText(row+ch).width>width){lines.push(row);row=ch;}else row+=ch;}lines.push(row);}return lines;
}
export async function createEndingPng(blocks,doc=document){
 await doc.fonts?.ready;
 const canvas=doc.createElement('canvas'),ctx=canvas.getContext('2d');
 if(!ctx)throw Error('canvas');
 const width=1080,pad=72,rows=[];let y=80;
 const styles={label:[20,30,'#a9844c'],title:[44,60,'#29251f'],heading:[27,40,'#72562f'],body:[25,39,'#363029']};
 for(const b of [{type:'label',text:'STEEL BALL RUN · 나의 레이스'},...blocks]){
  const [size,line,color]=styles[b.type]||styles.body;
  ctx.font=(b.type==='body'?'400 ':'700 ')+size+'px "Malgun Gothic", "Apple SD Gothic Neo", sans-serif';
  y+=b.type==='heading'?18:10;
  for(const text of wrapEndingText(ctx,b.text,width-pad*2)){rows.push({text,y,size,line,color,type:b.type});y+=line;}y+=10;
 }
 y+=54;
 // Keep the complete record within widely supported canvas dimensions.
 const scale=Math.min(1,16000/y);canvas.width=Math.round(width*scale);canvas.height=Math.ceil(y*scale);
 ctx.scale(scale,scale);ctx.fillStyle='#f4eddf';ctx.fillRect(0,0,width,y);
 ctx.fillStyle='#80603a';ctx.fillRect(pad,42,width-pad*2,3);
 ctx.textBaseline='top';
 for(const row of rows){ctx.font=(row.type==='body'?'400 ':'700 ')+row.size+'px "Malgun Gothic", "Apple SD Gothic Neo", sans-serif';ctx.fillStyle=row.color;ctx.fillText(row.text,pad,row.y);}
 ctx.fillStyle='#80603a';ctx.fillRect(pad,y-42,width-pad*2,2);
 return new Promise((resolve,reject)=>canvas.toBlob(b=>b?resolve(b):reject(Error('PNG 생성 실패')),'image/png'));
}
export function downloadEndingPng(blob,name,doc=document,urlAPI=URL){
 const url=urlAPI.createObjectURL(blob),a=doc.createElement('a');
 a.href=url;a.download=name;a.style.display='none';doc.body.append(a);a.click();a.remove();
 setTimeout(()=>urlAPI.revokeObjectURL(url),60000);
}
let endingExportBusy=false;
export async function exportEndingImage(mode,{section,name='나의 레이스',notify,doc=document,nav=navigator,Item=globalThis.ClipboardItem}){
 if(endingExportBusy||!section)return;
 const buttons=doc.querySelectorAll('[data-action^="ending-image:"]');
 const status=doc.querySelector('#ending-image-status');
 const say=text=>{if(status)status.textContent=text;notify?.(text);};
 if(mode==='copy'&&(!nav.clipboard?.write||!Item)){say('이 환경에서는 이미지 복사를 지원하지 않습니다. 이미지 다운로드를 이용해 주세요.');return;}
 endingExportBusy=true;buttons.forEach(b=>b.disabled=true);say('엔딩 이미지를 만들고 있습니다…');
 try{
  const pending=createEndingPng(endingImageBlocks(section),doc);
  if(mode==='copy'){
   // Start clipboard.write during the click gesture, before image generation awaits fonts.
   pending.catch(()=>{});
   await nav.clipboard.write([new Item({'image/png':pending})]);
   say('이미지를 복사했습니다. 대화창에 붙여넣어 전달하세요.');
  }else{
   const blob=await pending;
   const safe=String(name).replace(/[<>:"/\\|?*\u0000-\u001f]/g,'_').slice(0,60)||'나의 레이스';
   downloadEndingPng(blob,'스틸볼런-'+safe+'-엔딩.png',doc);
   say('PNG 이미지 다운로드를 요청했습니다.');
  }
 }catch(err){say(mode==='copy'?'이미지를 복사하지 못했습니다. 이미지 다운로드를 이용해 주세요.':'이미지를 만들지 못했습니다. 다시 시도해 주세요.');}
 finally{endingExportBusy=false;buttons.forEach(b=>b.disabled=false);}
}
