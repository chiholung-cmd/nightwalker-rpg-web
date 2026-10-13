import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {runInNewContext} from "node:vm";
const src=file=>readFileSync(new URL("../"+file,import.meta.url),"utf8");

function mountEffects(){
 let observer=null;
 const window={
  matchMedia:()=>({matches:false}),
  IntersectionObserver:class{
   constructor(callback,options){this.callback=callback;this.options=options;this.watching=[];observer=this}
   observe(el){this.watching.push(el)}
   unobserve(el){this.watching=this.watching.filter(e=>e!==el)}
   disconnect(){this.watching=[]}
  }
 };
 runInNewContext(src("effects.js"),{window});
 const makeBeat=()=>{
  const list=new Set();
  return {classList:{add:k=>list.add(k),remove:k=>list.delete(k),contains:k=>list.has(k)},
   querySelector:()=>null};
 };
 const first=makeBeat(),second=makeBeat(),beats=[first,second];
 const panel={querySelectorAll:()=>beats,
  classList:{add(k){panel.mode=k}}};
 const skipButton={hidden:false};
 const root={querySelector(sel){return sel===".scene-prose"?panel:sel==='[data-do="skipFx"]'?skipButton:null}};
 return {fx:window.NW_EFFECTS,first,second,panel,root,skipButton,getObserver:()=>observer};
}

test("length quality metadata stays internal, no reader-facing numeric chapter warning",()=>{
 const app=src("app.js");
 assert.ok(!app.includes("本章正文只有"));
 assert.ok(!app.includes("未達小說篇幅目標"));
 assert.ok(!app.includes('class="chapter-quality"'));
 assert.match(app,/data-do="toggleChoices"/);
 assert.match(app,/rewriteOpen/);
});
test("motion defaults back on, with existing saves migrated without resetting their stories",()=>{
 const context={window:{}};
 runInNewContext(src("data.js"),context);
 runInNewContext(src("engine.js"),context);
 const E=context.window.NW_ENGINE;
 const base=E.defaultState();
 assert.equal(base.settings.eplusMode,"standard");
 assert.equal(base.settings.reducedMotion,false);
 base.settings={novelMode:true,novelSize:"normal",reducedMotion:true};
 base.profile.name="林燁";base.profile.nameCustomized=true;
 base.mission={phase:2,history:[{action:"留低紙條"}],worldName:"零號月台"};
 const storage={
   getItem(k){return k===E.KEY?JSON.stringify(base):"1"},
   setItem(){},removeItem(){}
 };
 const restored=E.load(storage);
 assert.equal(restored.settings.eplusMode,"standard");
 assert.equal(restored.settings.reducedMotion,false);
 assert.equal(restored.mission.worldName,"零號月台");
 assert.equal(restored.mission.history[0].action,"留低紙條");
});
test("scroll-aware effects reveal only text paragraphs entering the reader viewport",()=>{
 const {fx,first,second,root,getObserver}=mountEffects();
 fx.play(root,{mode:"standard"});
 const obs=getObserver();
 assert.ok(obs);
 assert.equal(obs.options.root,root.querySelector(".scene-prose"));
 assert.equal(first.classList.contains("fx-revealed"),false);
 obs.callback([{isIntersecting:true,target:first},{isIntersecting:false,target:second}]);
 assert.equal(first.classList.contains("fx-revealed"),true);
 assert.equal(second.classList.contains("fx-revealed"),false);
 fx.cancel();
 assert.equal(obs.watching.length,0);
});
test("skip presentation restores static reading instantly",()=>{
 const {fx,first,panel,root,skipButton,getObserver}=mountEffects();
 fx.play(root,{mode:"standard"});
 getObserver().callback([{isIntersecting:true,target:first}]);
 fx.skip();
 assert.equal(panel.mode,"fx-static");
 assert.equal(skipButton.hidden,true);
});
test("per-paragraph reveal and dramatic moment styling are wired to user controls",()=>{
 const app=src("app.js"),css=src("style.css"),html=src("index.html");
 assert.match(app,/let beatIndex=0, emotionalBeats=0/);
 assert.match(app,/const renderBeat=/);
 assert.match(app,/fx-alert/);
 assert.match(app,/fx-reveal/);
 assert.match(app,/fx-death/);
 assert.match(app,/演出：柔和/);
 assert.match(app,/演出：強/);
 assert.match(css,/nwNovelSoft/);
 assert.match(css,/nwNovelAlert/);
 assert.match(css,/nwNovelClue/);
 assert.match(css,/prefers-reduced-motion:reduce/);
 assert.match(html,/effects\.js/);
});
