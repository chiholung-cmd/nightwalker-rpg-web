import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {runInNewContext} from "node:vm";

function world(){
 const ctx={window:{NW_ENGINE:{item:()=>({})}}};
 runInNewContext(readFileSync(new URL("../worldState.js",import.meta.url),"utf8"),ctx);
 const mission={worldKind:"original",worldName:"原創世界",world:"custom",phase:2,finished:false,npcMemory:{
  世娜:{trust:1,goal:"找到失蹤的弟弟",lastSeen:1,injury:"左臂骨折",attitude:"戒備",memory:"在月台失散"}
 },storyFacts:[],quests:[],branchConsequences:[],agencyEvents:[],log:[]};
 return {s:{mission,profile:{},loadout:{},worldLibrary:{}},W:ctx.window.NW_WORLD};
}
function bible(){
 const ctx={window:{}};
 runInNewContext(readFileSync(new URL("../storyBible.js",import.meta.url),"utf8"),ctx);
 return ctx.window.NW_BIBLE;
}
test("NPC patch preserves original goal, injury and last seen phase",()=>{
 const {s,W}=world();
 W.mergeNpcUpdates(s,[{name:"世娜",memory:"向主角說出城門口的暗號",trustChange:1,attitude:"謹慎合作"}],2);
 const p=s.mission.npcMemory.世娜;
 assert.equal(p.goal,"找到失蹤的弟弟");
 assert.equal(p.injury,"左臂骨折");
 assert.equal(p.lastSeen,1);
 assert.equal(p.trust,2);assert.equal(p.attitude,"謹慎合作");assert.equal(p.updated,2);
});
test("NPC patch is ignored if it belongs to a stale scene",()=>{
 const {s,W}=world(),before=JSON.stringify(s.mission.npcMemory);
 W.mergeNpcUpdates(s,[{name:"世娜",memory:"謊稱改變"}],1);
 assert.equal(JSON.stringify(s.mission.npcMemory),before);
});
test("story bible stores only character states supported by written prose",()=>{
 const {s}=world(),B=bible();
 const scene={title:"錯位",blocks:[{type:"narration",text:"世娜站在醫院的走廊盡頭。她手中的紙條早已被汗水浸透。這次她沒有退後，反而走向那道打開的門，望著門後的男人遲遲不肯出聲。"}],
  continuity:{location:"醫院",characters:[{name:"世娜",location:"醫院",condition:"恢復正常",injury:"傷口已痊癒"}],rules:["主角突然獲得不死能力"]}};
 B.ingest(s,scene,2);
 const out=B.context(s);
 assert.equal(out.location,"醫院");
 assert.equal(out.characters[0].location,"醫院");
 assert.equal(out.characters[0].injury,"左臂骨折");
 assert.deepEqual(Array.from(out.worldRules),[]);
});
test("ending audit checks fate of known characters before finale",()=>{
 const {s}=world(),B=bible();
 assert.deepEqual(Array.from(B.endingAudit(s).unclearCharacters),["世娜"]);
 s.mission.phase=26;
 const text="世娜終於離開車站，回到故鄉。這件事在三天前還是不可能的，她最終選擇將真相告訴僅存的親人，並為自己的選擇承擔所有後果。";
 B.ingest(s,{title:"終章",blocks:[{type:"narration",text}],continuity:{characterFates:[{name:"世娜",outcome:"世娜終於離開車站，回到故鄉"}]}},26);
 assert.equal(B.endingAudit(s).unclearCharacters.length,0);
});
test("novel UI actually imports Story Bible and shows choices only after reading",()=>{
 const html=readFileSync(new URL("../index.html",import.meta.url),"utf8");
 const app=readFileSync(new URL("../app.js",import.meta.url),"utf8");
 const css=readFileSync(new URL("../style.css",import.meta.url),"utf8");
 assert.match(html,/storyBible\.js/);
 assert.match(app,/worldMatches/);
 assert.match(app,/resolveWorld=/);
 assert.match(app,/worldPick:/);
 assert.match(app,/story-choice-panel collapsed/);
 assert.match(app,/story-choice-panel expanded/);
 assert.match(css,/reading-focused .scene-prose/);
 assert.match(css,/read-end/);
});
