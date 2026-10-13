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

test("user-confirmed 2001 TV edition is pinned into the generated scene rather than overwritten by another adaptation",async()=>{
 const previous=globalThis.fetch,key=process.env.GROQ_API_KEY;
 process.env.GROQ_API_KEY="mock-not-a-real-key";
 const selected="尋秦記 (電視劇)",url="https://zh.wikipedia.org/wiki/"+encodeURIComponent(selected.replace(/ /g,"_"));
 let sourceFetched=false,modelCalled=0;
 globalThis.fetch=async (u,opt)=>{
  const target=String(u);
  if(target.includes("wikipedia.org/w/api.php")){
   sourceFetched=true;
   return new Response(JSON.stringify({query:{pages:[{title:selected,extract:"《尋秦記》是2001年無線電視拍攝的香港古裝科幻電視劇，改編自黃易同名小說。由古天樂飾演項少龍，故事講述其穿越至戰國時代，並協助當時被扣留在趙國的秦國人物，在歷史與個人命運之間展開冒險。"}]}}),{status:200});
  }
  if(target.includes("groq.com/openai/v1/chat/completions")){
   modelCalled++;
   const fixture={title:"進入戰國",blocks:[{type:"narration",text:"林燁聽見城門外傳來密集的腳步聲。他看見遠方戰旗在風中獵獵作響，對這個陌生年代的恐懼終於有了形狀。掌心裡那枚現代製造的硬幣冰涼，提醒他並不屬於此地。遠處的軍士仍在盤問行人，他知道必須先弄清此刻身處哪座城池，再決定是否尋找項少龍。"}],options:[{label:"向路人詢問現況",kind:"talk"}],resolution:{readyToConclude:false}};
   return new Response(JSON.stringify({choices:[{message:{content:JSON.stringify(fixture)}}]}),{status:200,headers:{"Content-Type":"application/json"}});
  }
  throw new Error("unexpected host:"+target);
 };
 try{
  const req=new Request("https://test.invalid/api/story",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({
   world:"尋秦記",task:"尋找回歸主神空間的線索",worldKind:"adaptation",mediaType:"劇集",mode:"custom",phase:0,protagonist:"林燁",sessionKey:"pinned-v1",verifiedSource:url,verifiedSourceTitle:selected
  })});
  const response=await api.fetch(req);
  const data=await response.json();
  assert.equal(response.status,200);
  assert.equal(data.canon.title,selected);
  assert.equal(data.canon.url,url);
  assert.equal(modelCalled,1);
  assert.equal(sourceFetched,true);
 }finally{globalThis.fetch=previous;if(key===undefined)delete process.env.GROQ_API_KEY;else process.env.GROQ_API_KEY=key}
});
