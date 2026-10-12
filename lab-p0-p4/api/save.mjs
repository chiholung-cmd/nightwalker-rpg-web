import {MongoClient} from "mongodb";
import {createHash} from "node:crypto";
// Dedicated DB. Never touch the original application's database or collections.
const DB="nightwalker_v5",COLLECTION="device_saves";
let clientPromise;
const json=(status,value)=>new Response(JSON.stringify(value),{status,headers:{"Content-Type":"application/json; charset=utf-8","Cache-Control":"no-store","X-Content-Type-Options":"nosniff"}});
async function collection(){
 if(!process.env.MONGODB_URI)throw new Error("MONGODB_NOT_CONFIGURED");
 if(!clientPromise)clientPromise=new MongoClient(process.env.MONGODB_URI,{serverSelectionTimeoutMS:6000,maxPoolSize:3}).connect();
 return (await clientPromise).db(DB).collection(COLLECTION);
}
const hash=s=>createHash("sha256").update(s).digest("hex");
export default {async fetch(request){
if(request.method==="GET")return json(200,{ready:!!process.env.MONGODB_URI,method:"device-key",note:"不需登入；妥善保存恢復代碼"});
if(request.method!=="POST")return json(405,{error:"METHOD_NOT_ALLOWED"});
try{const o=request.headers.get("origin");if(o&&new URL(o).host!==new URL(request.url).host)return json(403,{error:"BAD_ORIGIN"})}catch(_){return json(403,{error:"BAD_ORIGIN"})}
if(Number(request.headers.get("content-length")||0)>350000)return json(413,{error:"SAVE_TOO_BIG"});
let body;try{body=await request.json()}catch(_){return json(400,{error:"BAD_JSON"})}
const token=String(body?.token||"");
if(!/^[a-f0-9]{64}$/.test(token))return json(400,{error:"INVALID_RECOVERY_KEY"});
if(!["save","load"].includes(body.action))return json(400,{error:"INVALID_ACTION"});
let col;try{col=await collection()}catch(_){return json(503,{error:"STORAGE_UNAVAILABLE"})}
const id=hash(token);
try{
 if(body.action==="load"){
   const doc=await col.findOne({_id:id},{projection:{_id:0,revision:1,state:1,updatedAt:1}});
   return doc?json(200,{found:true,revision:doc.revision,updatedAt:doc.updatedAt,state:doc.state}):json(200,{found:false,revision:0});
 }
 const state=body?.state;
 if(!state||state.version!==1||!state.profile||!state.loadout||!Array.isArray(state.records))return json(400,{error:"INVALID_SAVE"});
 const len=JSON.stringify(state).length;if(len>250000)return json(413,{error:"SAVE_TOO_BIG"});
 const rev=Number(body.revision);
 if(!Number.isSafeInteger(rev)||rev<0)return json(400,{error:"INVALID_REVISION"});
 const now=new Date().toISOString();
 try{
 const up=await col.findOneAndUpdate({_id:id,revision:rev},{$set:{state,updatedAt:now},$inc:{revision:1}},{upsert:rev===0,returnDocument:"after",projection:{_id:0,state:0}});
 if(!up)return json(409,{error:"SAVE_CONFLICT",message:"另一個裝置可能已更新存檔，請先檢查雲端版本"});
 return json(200,{saved:true,revision:up.revision,updatedAt:now});
 }catch(e){if(e?.code===11000)return json(409,{error:"SAVE_CONFLICT"});throw e}
}catch(e){return json(503,{error:"STORAGE_ERROR",message:"雲端暫時不可用，本機存檔不受影響"})}
}};
