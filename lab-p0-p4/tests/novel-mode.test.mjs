import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {runInNewContext} from "node:vm";
const code=name=>readFileSync(new URL("../"+name,import.meta.url),"utf8");
function game(){
 const window={};
 runInNewContext(code("data.js"),{window});
 runInNewContext(code("engine.js"),{window});
 window.NW_WORLD={onAction:()=>{},recordDirectorAction:()=>{},allowDirectorEnding:()=>false};
 window.NW_BIBLE={recordAction:()=>{}};
 runInNewContext(code("story.js"),{window});
 return {E:window.NW_ENGINE,N:window.NW_STORY,window};
}
function mission(){
 return {
  seed:1,world:"custom",worldName:"零號月台",director:true,narrativeMode:true,phase:0,turn:0,progress:0,
  flags:[],history:[],log:[],roundEvents:[],cooldowns:{},storyFacts:[],crew:[],rival:null,finished:false,
  aiOptions:{0:[
   {label:"向世娜問清楚來龍去脈",kind:"talk",cost:0,progress:1},
   {label:"用觀察專長識破假線索",kind:"observe",cost:9,progress:1,requires:"skill:observe"},
   {label:"使用不存在的魔法",kind:"fight",cost:20,requires:"skill:magic"}
  ],1:[{label:"繼續討論",kind:"talk"}]},
  aiScenes:{},enemy:{hp:100},bag:{ironrod:1},mode:"solo",required:3,
  narrativeCapabilities:{skills:[{id:"observe",name:"觀察"}],items:[],bloodline:""}
 };
}
test("new saves default to literature rather than RPG progression",()=>{
 const {E}=game(),s=E.defaultState();
 assert.equal(s.settings.novelMode,true);
 assert.equal(s.profile.name,"");
});
test("novel choices can be used at zero stamina and never change numerical stats",()=>{
 const {E,N}=game(),s=E.defaultState();
 s.profile.sta=0;s.profile.hp=4;s.profile.mp=2;s.profile.san=8;s.mission=mission();
 const before={hp:s.profile.hp,sta:s.profile.sta,mp:s.profile.mp,san:s.profile.san};
 const choices=N.get(s).actions;
 assert.equal(choices[1].usable,true);
 assert.equal(choices[1].cost,0);
 assert.equal(choices[2].usable,false);
 const denied=N.choose(s,2);assert.ok(denied.error);
 assert.equal(s.mission.phase,0);
 const out=N.choose(s,1);assert.equal(out.error,null);
 assert.equal(s.mission.phase,1);
 for(const key of Object.keys(before))assert.equal(s.profile[key],before[key]);
 assert.equal(s.mission.history.length,1);
 assert.equal(s.mission.history[0].action,"用觀察專長識破假線索");
 assert.ok(!s.mission.log.some(x=>/STA|HP|造成.*傷害/.test(x)));
});
test("free narrative decisions accept a descriptive action that keyword-only RPG rejected",()=>{
 const {E,N}=game(),s=E.defaultState();s.mission=mission();
 const text="先將月台旁邊的車票藏起來，再不動聲色地等候神秘乘客走近";
 const preview=N.analyzeFree(s,text);assert.equal(preview.error,undefined);
 assert.equal(preview.cost,0);
 assert.equal(preview.effects.length,0);
 const out=N.free(s,text,preview.kind);
 assert.equal(out.error,null);
 assert.equal(s.mission.phase,1);
 assert.equal(s.mission.history.at(-1).action,text);
});
test("exit archives a mid-story narrative without duplicate inventory, new story possible",()=>{
 const {E}=game(),s=E.defaultState();s.mission=mission();
 s.assignment={world:"custom",paidCost:0};
 s.screen="mission";s.warehouse.ironrod=2;
 s.mission.aiScenes[0]={title:"紙車票",blocks:[{type:"narration",text:"最後一班車停靠在零號月台。"}]};
 s.mission.history.push({action:"向世娜表明身份"});
 const oldWarehouse=s.warehouse.ironrod,oldCredits=s.profile.credits;
 const answer=E.abandonStory(s);
 assert.equal(answer,null);assert.equal(s.mission,null);assert.equal(s.assignment,null);
 assert.equal(s.screen,"portal");
 assert.equal(s.warehouse.ironrod,oldWarehouse);
 assert.equal(s.profile.credits,oldCredits);
 assert.equal(s.abandonedStories.length,1);
 assert.equal(s.abandonedStories[0].snapshots[0].title,"紙車票");
 assert.equal(E.abandonStory(s)!==null,true);
});
test("legacy RPG mission exit returns only genuinely withdrawn inventory, does not delete old records",()=>{
 const {E}=game(),s=E.defaultState();
 s.mission={...mission(),narrativeMode:false,paidCost:0};
 s.warehouse.ironrod=0;s.records=[{worldName:"旧世界"}];
 E.abandonStory(s);
 assert.equal(s.warehouse.ironrod,1);
 assert.equal(s.records[0].worldName,"旧世界");
});
test("novel-ending path has no XP or credits payout",()=>{
 const {E}=game(),s=E.defaultState();s.mission=mission();s.mission.phase=28;
 E.end(s);
 assert.equal(s.mission.finished,true);
 assert.equal(s.mission.reward.credits,0);
 assert.equal(s.mission.reward.xp,0);
});
test("novel UI has an accessible leave-story button and no loadout/stats in chapter controls",()=>{
 const app=code("app.js"),css=code("style.css"),html=code("index.html");
 assert.match(app,/data-do="leaveStory"/);
 assert.match(app,/if\(cmd==="confirmLeave"\)/);
 assert.match(app,/E\.abandonStory\(s\)/);
 assert.match(app,/story-exit-overlay/);
 assert.match(app,/library-home/);
 assert.match(css,/\.story-exit-overlay/);
 assert.match(css,/\.literary-top/);
 assert.match(html,/app\.js/);
});
