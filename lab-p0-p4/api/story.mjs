const MODEL=process.env.GROQ_MODEL||"openai/gpt-oss-20b";
const reply=(status,data)=>new Response(JSON.stringify(data),{status,headers:{"Content-Type":"application/json; charset=utf-8","Cache-Control":"no-store","X-Content-Type-Options":"nosniff"}});
const clean=(s,n=150)=>String(s??"").trim().slice(0,n);
const kinds=new Set(["talk","observe","conceal","sneak","run","hide","physical","risk","fight","rest"]);
const attempts=new Map(); // best-effort per-instance abuse guard; not global authentication
const system=[
"你是高水平無限流網文作者、互動小說劇情導演。全文繁體中文，使用內地網文書面語，絕不使用廣東話。",
"寫350至550中文字的一幕小說，要像真正可玩的內地無限流網文：事件、具體細節、人物動作、懸念、自然穿插人物對白。",
"角色有自己的動機與記憶，依照歷史選擇與事實續寫，不能通用套話，不能每一段都提示玩家選擇。",
"不修改角色數值、任務目標、技能裝備、戰利品和通關結果。玩家行動只能根據傳入歷史與世界設定描述。",
"世界 NPC 不會無故知道主神。不要代替玩家做選擇。不要寫遊戲攻略或數值 HUD。",
"僅輸出單個 JSON 物件，不要 markdown；格式 title:string,mood:calm|suspense|eerie|shock|anger|grief|resolve|system,blocks:至少5項，每項 type:narration|dialogue,text:string,dialogue需speaker:string。",
"至少三項 narration 和一項 dialogue，對白要融入敘事節奏。",
"當 mode=known：只生成小說段落，原有三個選項由程式決定，options可以是空陣列。",
"當 mode=custom：另外生成 options 恰好三項，每項 label,hint,kind,cost,progress；kind只能是 talk/observe/conceal/sneak/run/hide/physical/risk/fight/rest，非體力動作cost必須是0，體力動作扣除不多於20點。"
].join("\n");
function context(v){
let limited=a=>Array.isArray(a)?a.slice(-8):[];
return {mode:v?.mode==="custom"?"custom":"known",world:clean(v?.world,65),task:clean(v?.task,120),objective:clean(v?.objective,220),phase:Math.max(0,Math.min(20,Number(v?.phase)||0)),cast:limited(v?.cast).map(x=>clean(x,45)),flags:limited(v?.flags).map(x=>clean(x,45)),history:limited(v?.history).map(x=>clean(x,180)),base:limited(v?.base).map(x=>({type:clean(x?.type,15),speaker:clean(x?.speaker,35),text:clean(x?.text,600)})),choices:limited(v?.choices).map(x=>({label:clean(x?.label,40),kind:clean(x?.kind,16)})),state:v?.state||{}};
}
export default {
async fetch(request){
if(request.method==="GET")return reply(200,{service:"Nightwalker AI",configured:!!process.env.GROQ_API_KEY,model:MODEL});
if(request.method!=="POST")return reply(405,{error:"METHOD_NOT_ALLOWED"});
if(!process.env.GROQ_API_KEY)return reply(503,{error:"AI_NOT_CONFIGURED",message:"請在 Vercel Nightwalker 專案設定 GROQ_API_KEY。未扣任何點數。"});
try{const origin=request.headers.get("origin");if(origin&&new URL(origin).host!==new URL(request.url).host)return reply(403,{error:"CROSS_ORIGIN_BLOCKED"})}catch(e){return reply(403,{error:"BAD_ORIGIN"})}
const client=String(request.headers.get("x-forwarded-for")||"unknown").split(",")[0].slice(0,80);
const bucket=Math.floor(Date.now()/60000),id=client+":"+bucket,count=attempts.get(id)||0;
if(count>=8)return reply(429,{error:"LOCAL_RATE_LIMIT",message:"請稍後再試，避免耗盡免費 AI 額度"});
attempts.set(id,count+1);if(attempts.size>750){for(const k of attempts.keys()){attempts.delete(k);if(attempts.size<350)break}}

if(Number(request.headers.get("content-length")||0)>14000)return reply(413,{error:"INPUT_TOO_LARGE"});
let body;try{body=await request.json()}catch(e){return reply(400,{error:"INVALID_JSON"})}
const input=context(body);if(input.world.length<2||input.task.length<2)return reply(400,{error:"MISSING_CONTEXT"});
const ctl=new AbortController();const timeout=setTimeout(()=>ctl.abort(),20000);
let result;
try{result=await fetch("https://api.groq.com/openai/v1/chat/completions",{method:"POST",signal:ctl.signal,headers:{"Authorization":"Bearer "+process.env.GROQ_API_KEY,"Content-Type":"application/json"},body:JSON.stringify({model:MODEL,temperature:0.75,max_completion_tokens:1800,stream:false,messages:[{role:"system",content:system},{role:"user",content:JSON.stringify(input)}]})});}catch(e){return reply(504,{error:"AI_TIMEOUT",message:"AI 暫時未能生成，請稍後重試"})}finally{clearTimeout(timeout)}
if(!result.ok)return reply(result.status===429?429:502,{error:result.status===429?"AI_RATE_LIMIT":"AI_PROVIDER_ERROR",message:"免費 AI 額度或連線暫時不可用"});
let data;try{data=await result.json()}catch(e){return reply(502,{error:"INVALID_PROVIDER_RESPONSE"})}
let raw=clean(data?.choices?.[0]?.message?.content,12000);const ticks=String.fromCharCode(96).repeat(3);if(raw.startsWith(ticks)){raw=raw.slice(raw.indexOf("\n")+1);if(raw.endsWith(ticks))raw=raw.slice(0,-3)}
let scene;try{scene=JSON.parse(raw.trim())}catch(e){return reply(502,{error:"INVALID_AI_JSON"})}
const blocks=(Array.isArray(scene.blocks)?scene.blocks:[]).slice(0,12).map(x=>({type:x.type==="dialogue"?"dialogue":"narration",speaker:clean(x.speaker,40),text:clean(x.text,1300)}));
if(blocks.length<5||blocks.filter(x=>x.type==="narration").length<3||!blocks.some(x=>x.type==="dialogue")||blocks.some(x=>x.text.length<4))return reply(502,{error:"SCENE_INCOMPLETE"});
const opts=(Array.isArray(scene.options)?scene.options:[]).slice(0,3).map((x,i)=>{const k=kinds.has(x.kind)?x.kind:"observe";return {id:"ai-"+i,label:clean(x.label,50),hint:clean(x.hint,60),kind:k,cost:["run","sneak","physical","risk","fight"].includes(k)?Math.max(0,Math.min(20,Number(x.cost)||8)):0,progress:Math.max(0,Math.min(2,Number(x.progress)||1)),flag:"ai-"+i}});
if(input.mode==="custom"&&(opts.length!==3||opts.some(x=>x.label.length<4)))return reply(502,{error:"CHOICES_INCOMPLETE"});
return reply(200,{title:clean(scene.title,30)||"無名之幕",mood:["calm","suspense","eerie","shock","anger","grief","resolve","system"].includes(scene.mood)?scene.mood:"suspense",blocks,options:input.mode==="custom"?opts:[],model:MODEL});
}
};