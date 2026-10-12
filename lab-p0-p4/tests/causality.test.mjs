import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {runInNewContext} from "node:vm";

const js=readFileSync(new URL("../worldState.js",import.meta.url),"utf8");
function makeGame(){
 const window={NW_ENGINE:{item:()=>({})}};
 runInNewContext(js,{window});
 const mission={phase:1,worldName:"零號月台",worldKind:"original",world:"custom",finished:false,
  quests:[],npcMemory:{},agencyEvents:[],branchConsequences:[],log:[],storyFacts:[]};
 return {W:window.NW_WORLD,s:{mission,worldLibrary:{},profile:{},loadout:{}}};
}
const report=(action)=>({action,events:[action],delta:{}});
function quest(m,objective="尋回被偷走的車票",trigger="observe"){
 m.quests.push({id:"quest-1",title:"失蹤的車票",objective,trigger,
  progress:0,required:2,status:"active",reward:35,started:0});
 return m.quests[0];
}

test("unrelated repeated observe or talk choices cannot advance a quest",()=>{
 const {W,s}=makeGame(),q=quest(s.mission);
 for(const [i,kind,label] of [[1,"observe","察看走廊燈光"],[2,"observe","反覆查看走廊燈光"],[3,"talk","向路人詢問天氣"]]){
  s.mission.phase=i;W.onAction(s,{kind,label},report(label));
 }
 assert.equal(q.progress,0);assert.equal(q.status,"active");
});

test("two different objective-grounded actions on different phases unlock completion",()=>{
 const {W,s}=makeGame(),q=quest(s.mission);
 s.mission.phase=1;W.onAction(s,{kind:"observe",label:"仔細檢查車票上的血跡"},report("仔細檢查車票上的血跡"));
 assert.equal(q.progress,1);
 s.mission.phase=2;W.onAction(s,{kind:"observe",label:"查看被偷走的車票背面名字"},report("查看被偷走的車票背面名字"));
 assert.equal(q.progress,2);assert.equal(q.status,"completed");assert.equal(q.evidence.length,2);
 assert.ok(q.evidence[0].matched.length>=2);
 assert.equal(q.reward,35);
});

test("pressing the exact same story option twice cannot farm quest evidence",()=>{
 const {W,s}=makeGame(),q=quest(s.mission);
 const choice="仔細查看車票上的字跡";
 s.mission.phase=1;W.onAction(s,{kind:"observe",label:choice},report(choice));
 s.mission.phase=2;W.onAction(s,{kind:"observe",label:choice},report(choice));
 assert.equal(q.progress,1);assert.equal(q.evidence.length,1);
});

test("specific three-character target can advance quest across action kinds",()=>{
 const {W,s}=makeGame(),q=quest(s.mission,"保護林醫生離開封鎖區","talk");
 s.mission.phase=1;W.onAction(s,{kind:"physical",label:"協助林醫生避開巡邏"},report("協助林醫生避開巡邏"));
 assert.equal(q.progress,1);
 assert.equal(q.evidence[0].matched,"林醫生");
});

test("unrelated conversation must not change the most recent NPC trust",()=>{
 const {W,s}=makeGame();
 s.mission.npcMemory={世娜:{trust:0,lastSeen:1,memory:""},夏帆:{trust:0,lastSeen:3,memory:""}};
 s.mission.phase=4;W.onAction(s,{kind:"talk",label:"向在場的人詢問發生何事"},report("向在場的人詢問發生何事"));
 assert.equal(s.mission.npcMemory.夏帆.trust,0);
 assert.equal(s.mission.npcMemory.世娜.trust,0);
 assert.equal(s.mission.branchConsequences.length,0);
});

test("named NPC receives causal trust changes and traceable action",()=>{
 const {W,s}=makeGame();
 s.mission.npcMemory={世娜:{trust:0,lastSeen:2,memory:""},夏帆:{trust:0,lastSeen:4,memory:""}};
 s.mission.phase=5;W.onAction(s,{kind:"talk",label:"向世娜說出發現的線索"},report("向世娜說出發現的線索"));
 assert.equal(s.mission.npcMemory.世娜.trust,1);
 assert.equal(s.mission.npcMemory.夏帆.trust,0);
 assert.equal(s.mission.branchConsequences[0].action,"向世娜說出發現的線索");
 assert.equal(s.mission.branchConsequences[0].change,1);
 s.mission.phase=6;W.onAction(s,{kind:"fight",label:"阻止世娜動手，與她交戰"},report("阻止世娜動手，與她交戰"));
 assert.equal(s.mission.npcMemory.世娜.trust,-1);
 assert.equal(s.mission.branchConsequences[1].change,-2);
});

test("concealment without discovery does not magically reduce trust",()=>{
 const {W,s}=makeGame();
 s.mission.npcMemory={世娜:{trust:2,lastSeen:1,memory:""}};
 s.mission.phase=2;W.onAction(s,{kind:"conceal",label:"向世娜保留一段還沒有證實的推測"},report("向世娜保留一段還沒有證實的推測"));
 assert.equal(s.mission.npcMemory.世娜.trust,2);
});

test("generic chat with a named person does not farm their trust",()=>{
 const {W,s}=makeGame();
 s.mission.npcMemory={世娜:{trust:0,lastSeen:2,memory:""}};
 s.mission.phase=2;W.onAction(s,{kind:"talk",label:"向世娜閒談"},report("向世娜閒談"));
 assert.equal(s.mission.npcMemory.世娜.trust,0);
});

test("the same supportive choice cannot repeatedly raise NPC trust",()=>{
 const {W,s}=makeGame();
 s.mission.npcMemory={世娜:{trust:0,lastSeen:1,memory:""}};
 const action={kind:"talk",label:"向世娜說出重要情報"};
 s.mission.phase=2;W.onAction(s,action,report(action.label));
 s.mission.phase=3;W.onAction(s,action,report(action.label));
 assert.equal(s.mission.npcMemory.世娜.trust,1);
 assert.equal(s.mission.branchConsequences.length,1);
});

test("NPC autonomy does not invent repeated off-screen events",()=>{
 const {W,s}=makeGame();
 s.mission.npcMemory={世娜:{trust:0,lastSeen:1,goal:"尋找失蹤的母親",memory:""}};
 s.mission.phase=2;W.onAction(s,{kind:"observe",label:"看一眼窗外"},report("看一眼窗外"));
 s.mission.phase=3;W.onAction(s,{kind:"talk",label:"和車廂裡的人交流"},report("和車廂裡的人交流"));
 assert.equal(s.mission.agencyEvents.length,0);
});

test("old saves missing evidence arrays still advance safely",()=>{
 const {W,s}=makeGame(),q=quest(s.mission);
 q.progress=1;delete q.evidence;
 s.mission.phase=5;W.onAction(s,{kind:"observe",label:"檢查失蹤的車票原本放在哪裡"},report("檢查失蹤的車票原本放在哪裡"));
 assert.equal(q.progress,1);
 assert.equal(q.evidence.length,1);
 assert.equal(q.status,"active");
});
