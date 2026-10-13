import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {runInNewContext} from "node:vm";
import api from "../api/story.mjs";
const code=p=>readFileSync(new URL("../"+p,import.meta.url),"utf8");
test("three thousand character player draft persists across reload and is never cleared on rerender",()=>{
 const storage=new Map(),make=()=>{
  const w={localStorage:{getItem:k=>storage.get(k)||null,setItem:(k,v)=>storage.set(k,v),removeItem:k=>storage.delete(k)}};
  runInNewContext(code("drafts.js"),{window:w});return w.NW_DRAFTS;
 };
 const d1=make(),long="我决定先询问这里的幸存者，并同时观察窗外的动静。".repeat(110);
 const saved=d1.save("free","seed1:custom:0",long);
 assert.equal(saved.length,Math.min(3000,long.length));
 assert.equal(make().get("free","seed1:custom:0"),saved);
 assert.equal(make().get("free","seed1:custom:1"),"");
 assert.equal(make().get("free","seed1:custom:0"),saved);
 d1.clear("free","seed1:custom:0");
 assert.equal(make().get("free","seed1:custom:0"),"");
});
test("work name typo gives non-fictional correction even if remote encyclopedia is unreachable",async()=>{
 const prior=globalThis.fetch;
 globalThis.fetch=async()=>{throw Error("encyclopedia offline")};
 try{
  const url="https://example.invalid/api/story?resolveWorld="+encodeURIComponent("尋泰記")+"&mediaType="+encodeURIComponent("劇集");
  const res=await api.fetch(new Request(url));
  const json=await res.json();
  assert.equal(res.status,200);
  assert.equal(json.status,"needs_confirmation");
  assert.equal(json.matches[0].title,"尋秦記");
  assert.equal(json.matches[0].sourceUrl,"");
  assert.equal(json.matches[0].source,"title_suggestion");
 }finally{globalThis.fetch=prior}
});
test("verified work suggestions show source-grounded synopsis, never fabricate long plot",async()=>{
 const prev=globalThis.fetch;
 globalThis.fetch=async()=>new Response(JSON.stringify({query:{pages:[{
  title:"尋秦記 (電視劇)",extract:"《尋秦記》是香港電視劇，原著由黃易創作，故事講述來自現代的項少龍穿越到古代戰國時期，在秦、趙等諸侯國間面對政治風險與生存挑戰，人物經歷逐步改變了時代局勢。"
 }]}}),{status:200});
 try{
  const res=await api.fetch(new Request("https://example.invalid/api/story?resolveWorld="+encodeURIComponent("尋泰記")+"&mediaType="+encodeURIComponent("劇集")));
  const json=await res.json();
  assert.equal(res.status,200);
  assert.equal(json.matches[0].title,"尋秦記");
  assert.ok(json.matches[0].sourceUrl.includes("wikipedia.org"));
  assert.ok(json.matches[0].summary.includes("項少龍"));
 }finally{globalThis.fetch=prev}
});
test("pre-entry screen has sourced introduction and lets player stage a companion-led prologue",()=>{
 const app=code("app.js"),engine=code("engine.js"),html=code("index.html"),css=code("style.css");
 for(const token of ["WORLD INTRODUCTION / 世界簡介","worldSummary","verifiedSource","opening-intent","entryMode:team","entryMode:solo","original-world-premise","world-suggestion","worldPick:","sourceUrl","請按「核對作品名稱」"])assert.ok(app.includes(token),token);
 assert.ok(engine.includes("openingIntent:"));
 assert.ok(engine.includes("worldSummary:"));
 assert.ok(engine.includes('s.assignment.mode==="team"'));
 assert.ok(html.includes('drafts.js')&&html.includes('codex.js'));
 assert.ok(html.indexOf("drafts.js")<html.indexOf("app.js"));
 assert.match(css,/\.entry-world-intro/);
});
test("player weapons learned skills NPCs remain playable novel actions",()=>{
 const app=code("app.js"),story=code("story.js"),codex=code("codex.js"),apiCode=code("api/story.mjs");
 for(const action of ["codexArm:","codexCarry:","insert:","codexTab:","codexOpen","codexClose"])assert.ok(app.includes(action),action);
 for(const tab of ["人物","技能","武器與道具","NPC"])assert.ok(codex.includes(tab),tab);
 assert.match(story,/pendingAction=/);
 assert.match(story,/playerAgency/);
 assert.match(apiCode,/recentAction 是玩家上一幕真实指令/);
 assert.match(apiCode,/经典中文无限流类型/);
 assert.match(app,/description:skill\(id\)\?\.desc/);
 assert.match(app,/personality:x\.temper/);
});
