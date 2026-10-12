(function(global){
"use strict";
// NIGHTWALKER E+ v2 — animation only. Never changes story, choices, HP or save data.
let active=null;
const raf=fn=>typeof global.requestAnimationFrame==="function"?global.requestAnimationFrame(fn):global.setTimeout(()=>fn(Date.now()),16);
const caf=id=>typeof global.cancelAnimationFrame==="function"?global.cancelAnimationFrame(id):global.clearTimeout(id);
const reduce=()=>{try{return global.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches===true}catch(_){return false}};
function cancel(){
 if(!active)return;
 active.cancelled=true;
 if(active.frame!=null)caf(active.frame);
 for(const id of active.timers)global.clearTimeout(id);
 for(const item of active.items)if(item.element.isConnected!==false)item.element.textContent=item.full;
 active=null;
}
function skip(){
 if(!active)return;
 const running=active;
 cancel();
 running.root?.querySelector?.(".scene-prose")?.classList?.add("fx-static");
 const skipButton=running.root?.querySelector?.('[data-do="skipFx"]');
 if(skipButton)skipButton.hidden=true;
}
function play(root,settings={}){
 cancel();
 const intensity=settings.mode||"strong";
 if(intensity==="off"||reduce()||!root?.querySelectorAll)return;
 const elems=[...root.querySelectorAll(".scene-prose .novel-dialogue p, .scene-prose .novel-system")];
 if(!elems.length)return;
 const run={root,items:[],timers:[],frame:null,cancelled:false};
 active=run;
 for(const [i,el] of elems.entries()){
   const full=el.textContent||"";
   if(!full||full.length<3)continue;
   const chars=Array.from(full);
   const isSystem=!!el.closest?.(".novel-system");
   // Larger emotional differences come from CSS; typing stays short enough to read comfortably.
   const duration=Math.min(intensity==="strong"?2150:1050,chars.length*(isSystem?21:intensity==="strong"?31:15));
   const delay=(isSystem?90:240)+i*(intensity==="strong"?260:120);
   const item={element:el,full,chars,duration,delay,started:null};
   run.items.push(item);
   el.textContent="";
   el.classList?.add("eplus-typing");
 }
 const started=global.performance?.now?.()??Date.now();
 const step=t=>{
   if(run.cancelled)return;
   let allDone=true;
   for(const item of run.items){
     const elapsed=Math.max(0,t-started-item.delay);
     const fraction=Math.min(1,elapsed/item.duration);
     const count=Math.floor(item.chars.length*fraction);
     if(count!==item.lastCount){item.element.textContent=item.chars.slice(0,count).join("");item.lastCount=count}
     if(fraction<1)allDone=false;
     else item.element.classList?.remove("eplus-typing");
   }
   if(!allDone)run.frame=raf(step);
   else {active=null;const skipButton=root.querySelector?.('[data-do="skipFx"]');if(skipButton)skipButton.hidden=true;}
 };
 run.frame=raf(step);
}
global.NW_EFFECTS={play,skip,cancel,reducedMotion:reduce};
})(window);
