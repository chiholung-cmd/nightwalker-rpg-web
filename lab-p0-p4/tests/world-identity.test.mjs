import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {runInNewContext} from "node:vm";
import api from "../api/story.mjs";

test("a one-character typo suggests the known work, never invents a title",async()=>{
 const prev=globalThis.fetch;
 let calls=0;
 globalThis.fetch=async url=>{
  calls++;
  if(!String(url).includes("wikipedia.org/w/api.php"))throw new Error("unexpected network access");
  return new Response(JSON.stringify({query:{pages:[{
   title:"尋秦記 (電視劇)",extract:"《尋秦記》是2001年香港電視劇，改編自黃易小說；角色項少龍穿越戰國時期的傳奇故事。"
  }]} }),{status:200,headers:{"Content-Type":"application/json"}});
 };
 try{
  const request=new Request("https://test.invalid/api/story?resolveWorld="+encodeURIComponent("尋泰記")+"&mediaType="+encodeURIComponent("劇集"));
  const response=await api.fetch(request);
  const body=await response.json();
  assert.equal(response.status,200);
  assert.equal(body.status,"needs_confirmation");
  assert.equal(body.matches[0].title,"尋秦記");
  assert.equal(body.matches[0].confidence,"suggestion");
  assert.equal(body.matches[0].mediaType,"劇集");
  assert.ok(body.matches[0].sourceUrl.includes("wikipedia.org"));
  assert.ok(calls<=2);
 }finally{globalThis.fetch=prev}
});

test("unverified media title never silently becomes an original AI story",async()=>{
 const previous=globalThis.fetch, key=process.env.GROQ_API_KEY;
 process.env.GROQ_API_KEY="mock-not-a-real-key";
 let modelCalls=0;
 globalThis.fetch=async url=>{
  if(String(url).includes("wikipedia.org"))return new Response(JSON.stringify({query:{pages:[]}}),{status:200,headers:{"Content-Type":"application/json"}});
  modelCalls++;throw new Error("model must never be called for unverified canon");
 };
 try{
  const req=new Request("https://test.invalid/api/story",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({
   world:"查無此作000","task":"入場前核對資料",phase:0,worldKind:"adaptation",mediaType:"劇集",mode:"custom",protagonist:"林燁"
  })});
  const response=await api.fetch(req);
  const body=await response.json();
  assert.equal(response.status,422);
  assert.equal(body.error,"CANON_UNVERIFIED");
  assert.equal(modelCalls,0);
 }finally{globalThis.fetch=previous;if(key===undefined)delete process.env.GROQ_API_KEY;else process.env.GROQ_API_KEY=key}
});

test("unknown work returns no fabricated title suggestions",async()=>{
 const previous=globalThis.fetch;
 globalThis.fetch=async()=>new Response(JSON.stringify({query:{pages:[]}}),{status:200});
 try{
  const req=new Request("https://test.invalid/api/story?resolveWorld="+encodeURIComponent("完全不存在作品啊")+" &mediaType=劇集".replace(" ",""));
  const response=await api.fetch(req);
  const body=await response.json();
  assert.equal(response.status,200);
  assert.equal(body.status,"unverified");
  assert.equal(body.matches.length,0);
 }finally{globalThis.fetch=previous}
});

test("legacy Nightwalker default protagonist is migrated safely, without wiping records",()=>{
 const src=readFileSync(new URL("../engine.js",import.meta.url),"utf8");
 assert.ok(src.includes('a.profile.name==="夜行者"'));
 assert.ok(src.includes('a.profile.name=""'));
 assert.ok(src.includes('nameCustomized:false'));
 assert.ok(src.includes('function save(s,storage)'));
});
