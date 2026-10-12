// Optional distributed Groq cooldown. Storage failures never block local saves or model calls.
const DB="nightwalker_v5",COLL="groq_model_cooldowns";
let clientPromise=null;
let retryConnectionAt=0;
const local=new Map();
const now=()=>Date.now();
const safe=x=>typeof x==="string"?x.slice(0,110):"";
function modelId(model){return "groq:"+safe(model)}
async function collection(){
 if(!process.env.MONGODB_URI||now()<retryConnectionAt)return null;
 try{
  if(!clientPromise)clientPromise=import("mongodb").then(({MongoClient})=>new MongoClient(process.env.MONGODB_URI,{serverSelectionTimeoutMS:1250,connectTimeoutMS:1250,maxPoolSize:2}).connect());
  return (await clientPromise).db(DB).collection(COLL);
 }catch(_){clientPromise=null;retryConnectionAt=now()+30000;return null}
}
export async function getSharedCooldown(model){
 const id=modelId(model),cached=local.get(id)||0;
 if(cached>now())return cached;
 const col=await collection();
 if(!col)return Math.max(0,cached);
 try{
  const doc=await col.findOne({_id:id},{projection:{until:1},maxTimeMS:1000});
  const until=Number(doc?.until)||0;
  if(until>now())local.set(id,until);
  else local.delete(id);
  return until;
 }catch(_){return cached}
}
export async function putSharedCooldown(model,until){
 const id=modelId(model),t=Math.min(now()+25*3600000,Math.max(now(),Number(until)||0));
 if(t<=now())return false;
 local.set(id,Math.max(local.get(id)||0,t));
 const col=await collection();
 if(!col)return false;
 try{
  await col.updateOne({_id:id},{$max:{until:t},$set:{updatedAt:new Date()}},{upsert:true});
  return true;
 }catch(_){return false}
}
export const memoryCooldown=model=>Math.max(0,local.get(modelId(model))||0);
