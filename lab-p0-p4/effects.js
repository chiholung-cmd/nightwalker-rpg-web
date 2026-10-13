(function(global){
"use strict";
// E+ novel effects: animate only paragraphs as they enter the reader's viewport.
// The complete text always remains in the DOM, and animations never change saved story data.
let active=null;
const reducedMotion=()=>{
 try{return global.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches===true}catch(_){return false}
};
const raf=fn=>typeof global.requestAnimationFrame==="function"?global.requestAnimationFrame(fn):global.setTimeout(()=>fn(Date.now()),16);
const caf=id=>typeof global.cancelAnimationFrame==="function"?global.cancelAnimationFrame(id):global.clearTimeout(id);
function cancel(){
 const run=active;if(!run)return;
 run.cancelled=true;
 run.observer?.disconnect?.();
 for(const id of run.frames)caf(id);
 for(const el of run.items){
   if(el.element.isConnected!==false){
     el.element.textContent=el.text;
     el.element.classList?.remove("eplus-typing");
     if(el.element.style)el.element.style.minHeight="";
   }
 }
 active=null;
}
function typeSystem(el,run){
 if(!el||run.cancelled||run.mode!=="strong")return;
 const full=String(el.textContent||"");
 if(full.length<4||Array.from(full).length>100)return;
 const chars=Array.from(full);
 if(el.style&&typeof el.getBoundingClientRect==="function")el.style.minHeight=Math.ceil(el.getBoundingClientRect().height)+"px";
 const item={element:el,text:full};
 run.items.push(item);
 el.textContent="";
 el.classList?.add("eplus-typing");
 const duration=Math.min(850,Math.max(350,chars.length*12));
 const start=global.performance?.now?.()??Date.now();
 function tick(now){
  if(run.cancelled)return;
  const fraction=Math.min(1,Math.max(0,(now-start)/duration));
  el.textContent=chars.slice(0,Math.ceil(chars.length*fraction)).join("");
  if(fraction<1)run.frames.push(raf(tick));
  else{
   el.textContent=full;
   el.classList?.remove("eplus-typing");
   if(el.style)el.style.minHeight="";
  }
 }
 run.frames.push(raf(tick));
}
function play(root,{mode="standard"}={}){
 cancel();
 if(mode==="off"||reducedMotion()||!root?.querySelector)return;
 const pane=root.querySelector(".scene-prose");
 if(!pane?.querySelectorAll)return;
 const beats=Array.from(pane.querySelectorAll(".novel-beat"));
 if(!beats.length)return;
 const run={root,pane,mode,observer:null,frames:[],items:[],cancelled:false};
 active=run;
 const reveal=el=>{
  if(run.cancelled||!el||el.classList?.contains("fx-revealed"))return;
  el.classList?.add("fx-revealed");
  if(mode==="strong")typeSystem(el.querySelector?.(".novel-system"),run);
 };
 if(typeof global.IntersectionObserver==="function"){
  const observer=new global.IntersectionObserver(entries=>{
   for(const entry of entries){
    if(entry.isIntersecting){
     reveal(entry.target);
     observer.unobserve(entry.target);
    }
   }
  },{root:pane,rootMargin:"0px 0px -6% 0px",threshold:0.02});
  run.observer=observer;
  for(const el of beats)observer.observe(el);
 }else{
  // Older browsers keep every paragraph readable, with best-effort presentation.
  for(const el of beats)reveal(el);
 }
}
function skip(){
 const run=active;
 if(!run)return;
 const root=run.root;
 cancel();
 const pane=root?.querySelector?.(".scene-prose");
 pane?.classList?.add("fx-static");
 const skipButton=root?.querySelector?.('[data-do="skipFx"]');
 if(skipButton)skipButton.hidden=true;
}
global.NW_EFFECTS={play,skip,cancel,reducedMotion};
})(window);
