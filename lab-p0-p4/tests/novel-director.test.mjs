import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {runInNewContext} from "node:vm";

const source=readFileSync(new URL("../worldState.js",import.meta.url),"utf8");
function setup(){
 const window={NW_ENGINE:{item:()=>({})}};
 runInNewContext(source,{window});
 const m={seed:77,worldKind:"original",worldName:"零號月台",world:"custom",director:true,
  phase:0,finished:false,title:"末班車",objective:"在天亮前找到離開月台的真實出口",
  log:[],aiScenes:{},storyFacts:[],npcMemory:{},quests:[],agencyEvents:[],branchConsequences:[]};
 return {W:window.NW_WORLD,s:{mission:m,worldLibrary:{},profile:{},loadout:{}}};
}
const sample=(title,opts={})=>({title,blocks:[
 {type:"narration",text:"列車穿過黑暗，車門的血手印逐漸變得清晰。林燁看見那道不屬於自己的倒影，握緊了手中唯一的車票。"},
 {type:"dialogue",speaker:"世娜",text:"「事情不對勁，車廂裡還有第二個人。」"}
],options:[],...opts});
function record(W,s,p,scene){
 s.mission.phase=p;W.recordChapter(s,scene,p);
}
test("the novel spine has five stable stages, not an early six-scene conclusion",()=>{
 const {W,s}=setup();
 for(const [phase,id] of [[0,"opening"],[4,"opening"],[5,"relations"],[9,"relations"],
 [10,"reversal"],[15,"reversal"],[16,"consequences"],[22,"consequences"],
 [23,"resolution"],[27,"resolution"]]){
  s.mission.phase=phase;
  const brief=W.directorContext(s);
  assert.equal(brief.act,id);
  assert.equal(brief.chapter,phase+1);
  assert.equal(brief.maxChapters,28);
 }
 assert.equal(W.directorContext(s).mustClose,true);
});

test("chapter record must come from actual generated scene, never fabricate a paragraph",()=>{
 const {W,s}=setup();
 W.recordChapter(s,{title:"沒有正文",blocks:[],facts:["根本不存在的情節"]},0);
 assert.equal(s.mission.directorPlan.chapters.length,0);
 record(W,s,0,sample("失蹤的回聲"));
 assert.equal(s.mission.directorPlan.chapters.length,1);
 assert.ok(s.mission.directorPlan.chapters[0].summary.includes("車票"));
 assert.equal(s.mission.directorPlan.threads.length,0);
});

test("a genuine early clue survives scene progression and remains in the AI brief",()=>{
 const {W,s}=setup();
 const scene=sample("九號車廂",{facts:["列車廣播在每次鐘聲後提前說出一位乘客的真名"]});
 record(W,s,0,scene);
 s.mission.phase=1;
 const brief=W.directorContext(s);
 assert.equal(brief.openThreads.length,1);
 assert.equal(brief.openThreads[0].id,"thread-0");
 assert.ok(brief.openThreads[0].setup.includes("廣播"));
 assert.equal(brief.previousChapter.title,"九號車廂");
});

test("the director rejects false payoff declarations without on-page narrative evidence",()=>{
 const {W,s}=setup();
 record(W,s,0,sample("前夜",{facts:["廣播在午夜十二點會說出一位失蹤乘客的姓名"]}));
 const fake=sample("謊言",{callbacks:[{threadId:"thread-0",outcome:"廣播其實是由神秘組織控制的"}]});
 record(W,s,5,fake);
 assert.equal(s.mission.directorPlan.threads[0].status,"open");
 s.mission.phase=6;
 assert.equal(W.directorContext(s).openThreads.length,1);
});

test("an actual later reveal in prose can close exactly the matching earlier plot hook",()=>{
 const {W,s}=setup();
 record(W,s,0,sample("前夜",{facts:["廣播在午夜十二點會說出一位失蹤乘客的姓名"]}));
 const real=sample("真相",{blocks:[{type:"narration",text:"廣播其實是由站長通過控制室播放的。直到此刻，林燁才明白那扇控制室的門為何一直鎖著。"}],callbacks:[{threadId:"thread-0",outcome:"廣播其實是由站長通過控制室播放的"}]});
 record(W,s,10,real);
 assert.equal(s.mission.directorPlan.threads[0].status,"paid");
 s.mission.phase=11;
 assert.equal(W.directorContext(s).openThreads.length,0);
 assert.equal(W.directorContext(s).previousPayoffs.length,1);
});

test("player decisions are stored once and reflected in subsequent director briefs",()=>{
 const {W,s}=setup();
 s.mission.phase=3;
 W.recordDirectorAction(s,{kind:"talk",label:"向世娜坦白真相"},{action:"向世娜坦白真相",events:["世娜選擇協助主角調查"]});
 W.recordDirectorAction(s,{kind:"talk",label:"向世娜坦白真相"},{action:"向世娜坦白真相",events:["世娜選擇協助主角調查"]});
 assert.equal(s.mission.directorPlan.decisions.length,1);
 assert.equal(s.mission.directorPlan.decisions[0].phase,2);
 assert.ok(W.directorContext(s).decisions[0].consequence.includes("世娜"));
});

test("the director refuses model ending flags before final act and with unreturned hooks",()=>{
 const {W,s}=setup();
 record(W,s,0,sample("伏筆",{facts:["站台牆壁的血字每夜會改變排列次序"]}));
 s.mission.phase=18;s.mission.aiScenes[17]={resolution:{readyToConclude:true}};
 assert.equal(W.allowDirectorEnding(s),false);
 s.mission.phase=23;s.mission.aiScenes[22]={resolution:{readyToConclude:true}};
 assert.equal(W.allowDirectorEnding(s),false);
 s.mission.phase=26;s.mission.aiScenes[25]={resolution:{readyToConclude:true}};
 assert.equal(W.allowDirectorEnding(s),false);
 s.mission.phase=27;s.mission.aiScenes[26]={resolution:{readyToConclude:true}};
 assert.equal(W.allowDirectorEnding(s),true);
});

test("a fully closed plot can end after chapter 23, never prematurely",()=>{
 const {W,s}=setup();
 s.mission.phase=22;s.mission.aiScenes[21]={resolution:{readyToConclude:true}};
 assert.equal(W.allowDirectorEnding(s),false);
 s.mission.phase=23;s.mission.aiScenes[22]={resolution:{readyToConclude:true}};
 assert.equal(W.allowDirectorEnding(s),true);
});

test("save roundtrip and existing saves without a director plan remain valid",()=>{
 const {W,s}=setup();
 record(W,s,0,sample("伏筆",{facts:["站台牆壁的血字每夜會改變排列次序"]}));
 const saved=JSON.parse(JSON.stringify(s));
 s.mission=saved.mission;
 s.mission.phase=5;
 assert.equal(W.directorContext(s).openThreads.length,1);
 delete s.mission.directorPlan;
 assert.equal(W.directorContext(s).openThreads.length,0);
 assert.equal(W.directorContext(s).act,"relations");
});

test("28-chapter journal stays bounded even with repeated regeneration",()=>{
 const {W,s}=setup();
 for(let phase=0;phase<28;phase++){
  record(W,s,phase,sample("第"+(phase+1)+"章"));
  record(W,s,phase,sample("重寫第"+(phase+1)+"章"));
 }
 assert.equal(s.mission.directorPlan.chapters.length,28);
 assert.equal(s.mission.directorPlan.chapters[0].title,"重寫第1章");
 assert.equal(s.mission.directorPlan.chapters[27].title,"重寫第28章");
 assert.equal(s.mission.directorPlan.finale.chapter,28);
 assert.equal(s.mission.directorPlan.finale.declaredResolved,false);
});
