import test from "node:test";
import assert from "node:assert/strict";

const oldKey=process.env.GROQ_API_KEY;
const originalFetch=globalThis.fetch;
process.env.GROQ_API_KEY="mock-test-only-not-a-real-key";

const sample={
 title:"夜車入口",mood:"suspense",
 blocks:[
  {type:"narration",text:"最後一班列車停在異常漆黑的站台。"},
  {type:"narration",text:"所有乘客同時轉身，將目光投向你的方向。"},
  {type:"dialogue",speaker:"站長",text:"「千萬不要打開第三道門。」"},
  {type:"narration",text:"門外有一隻手，正在沿著玻璃向下滑動。"},
  {type:"narration",text:"你注意到地上的腳印，全都朝著列車內部。"}
 ],
 options:[
  {label:"先詢問站長有關第三道門的秘密",hint:"爭取信任",kind:"talk",cost:0,progress:1},
  {label:"觀察地上的腳印及門框",hint:"尋找證據",kind:"observe",cost:0,progress:1},
  {label:"帶乘客向最遠的車廂撤退",hint:"避免風險",kind:"run",cost:8,progress:1}
 ],
 missionArc:["調查","建立關係","危機","結局"],
 npcUpdates:[],facts:[],npcEvents:[],sideQuests:[],
 resolution:{readyToConclude:false}
};
const base=(premise="一個不斷重複午夜的荒廢車站，乘客不能對鏡子說話。",sessionKey="test-session")=>new Request("https://nightwalker.test/api/story",{
 method:"POST",headers:{"Content-Type":"application/json"},
 body:JSON.stringify({world:"零號月台",task:"尋找活著的乘客",mode:"custom",
 worldKind:"original",premise,sessionKey,phase:1})
});
const json=(value,status=200,headers={})=>new Response(JSON.stringify(value),{
 status,headers:{"Content-Type":"application/json",...headers}
});
const models=["openai/gpt-oss-20b","openai/gpt-oss-120b","qwen/qwen3.8-27b"];
let sequence=0;
async function sandbox(statusMap={}){
 const calls=[];
 globalThis.fetch=async (url,options)=>{
  if(String(url).endsWith("/models"))return json({data:models.map(id=>({id}))});
  const body=JSON.parse(options.body);
  calls.push({model:body.model,prompt:body.messages[0].content});
  const status=statusMap[body.model]||200;
  if(status==="daily")return json({error:{message:"RPD exhausted"}},429,{"x-ratelimit-remaining-requests":"0","x-ratelimit-reset-requests":"20h5m"});
  if(status===429)return json({error:{message:"TPM exhausted"}},429,{
    "retry-after":"18","x-ratelimit-remaining-tokens":"0","x-ratelimit-reset-tokens":"18s"});
  return json({choices:[{message:{content:JSON.stringify(sample)}}],usage:{
    prompt_tokens:1250,completion_tokens:850,total_tokens:2100}},status,{
    "x-ratelimit-remaining-tokens":"5200","x-ratelimit-reset-tokens":"22s"});
 };
 const module=await import("../api/story.mjs?ai-quota-test="+(++sequence));
 return {api:module.default,calls};
}

test("startup health probe checks model directory without a generation request",async()=>{
 const {api,calls}=await sandbox();
 const res=await api.fetch(new Request("https://nightwalker.test/api/story?probe=1"));
 const result=await res.json();
 assert.equal(res.status,200);
 assert.equal(result.quotaCheck,false);
 assert.equal(result.models.length,3);
 assert.equal(calls.length,0);
});

test("automatically uses 120B after 20B hits TPM",async()=>{
 const {api,calls}=await sandbox({"openai/gpt-oss-20b":429});
 const res=await api.fetch(base());
 const result=await res.json();
 assert.equal(res.status,200);
 assert.equal(result.model,"openai/gpt-oss-120b");
 assert.deepEqual(calls.map(c=>c.model),models.slice(0,2));
 assert.equal(result.options.length,3);
 assert.equal(result.usage.totalTokens,2100);
});

test("switches to a third currently listed free model",async()=>{
 const {api,calls}=await sandbox({"openai/gpt-oss-20b":429,"openai/gpt-oss-120b":429});
 const res=await api.fetch(base());
 assert.equal(res.status,200);
 assert.equal((await res.json()).model,"qwen/qwen3.8-27b");
 assert.deepEqual(calls.map(c=>c.model),models);
});

test("three exhausted models return one cooldown, not blind indefinite retries",async()=>{
 const {api,calls}=await sandbox(Object.fromEntries(models.map(m=>[m,429])));
 const res=await api.fetch(base());
 const err=await res.json();
 assert.equal(res.status,429);
 assert.equal(err.error,"GROQ_RATE_LIMIT");
 assert.ok(err.retryAfter>=1&&err.retryAfter<=20);
 assert.equal(calls.length,3);
});

test("duplicate scene served from cache without a second text completion",async()=>{
 const {api,calls}=await sandbox();
 const one=await api.fetch(base());
 const two=await api.fetch(base());
 assert.equal(one.status,200);
 assert.equal(two.status,200);
 assert.equal((await two.json()).cached,true);
 assert.equal(calls.length,1);
});

test("different original premises and mission IDs do not share a cached scene",async()=>{
 const {api,calls}=await sandbox();
 assert.equal((await api.fetch(base())).status,200);
 assert.equal((await api.fetch(base("地鐵世界中的乘客只會回答反問題，其他記憶全都失效。","another-session"))).status,200);
 assert.equal(calls.length,2);
});

test("RPD exhaustion respects provider daily reset and avoids request hammering",async()=>{
 const {api,calls}=await sandbox(Object.fromEntries(models.map(m=>[m,"daily"])));
 const res=await api.fetch(base());
 const error=await res.json();
 assert.equal(res.status,429);
 assert.equal(error.limitType,"daily");
 assert.ok(error.retryAfter>=3600);
 assert.equal(calls.length,3);
 const second=await api.fetch(base());
 assert.equal(second.status,429);
 assert.equal(calls.length,3);
});

test.after(()=>{
 globalThis.fetch=originalFetch;
 if(oldKey===undefined)delete process.env.GROQ_API_KEY;
 else process.env.GROQ_API_KEY=oldKey;
});
