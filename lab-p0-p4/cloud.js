(function(global){
"use strict";
const TOK="nightwalker_cloud_recovery_v1",REV="nightwalker_cloud_revision_v1",AUTO="nightwalker_cloud_auto_v1";
const store=()=>global.localStorage;
const get=(key)=>{try{return store()?.getItem(key)||""}catch(_){return""}};
const set=(key,val)=>{try{store()?.setItem(key,String(val))}catch(_){}};
let updating=null,timer=null,enabled=get(AUTO)==="1",rev=Number(get(REV))||0;
function token(){return get(TOK)}
function create(){const bytes=new Uint8Array(32);global.crypto.getRandomValues(bytes);return Array.from(bytes,x=>x.toString(16).padStart(2,"0")).join("")}
async function request(action,key,state,revision){
const res=await global.fetch("/api/save",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({action,token:key,state,revision})});
const data=await res.json();if(!res.ok)throw new Error(data.message||data.error||"雲端暫時無法使用");return data
}
async function backup(state){
if(updating)return updating;
const first=!token();const key=token()||create();
updating=(async()=>{
let r=await request("save",key,state,rev);
if(first)set(TOK,key);rev=r.revision;set(REV,rev);enabled=true;set(AUTO,"1");return{...r,key};
})();
try{return await updating}finally{updating=null}
}
function schedule(state){
if(!enabled||!token()||updating)return;
if(timer)global.clearTimeout(timer);
timer=global.setTimeout(async()=>{timer=null;try{await backup(state())}catch(e){enabled=false;set(AUTO,"0")}},9000);
}
async function load(key){
const id=String(key||token()).trim();
if(!/^[a-f0-9]{64}$/.test(id))throw new Error("恢復代碼必須係64位字符");
const data=await request("load",id);
if(!data.found)throw new Error("雲端找不到呢個恢復代碼的存檔");
if(data.state?.version!==1||!data.state?.profile||!data.state?.loadout)throw new Error("雲端存檔格式不支援");
return {...data,key:id}
}
function accept(key,revision){set(TOK,key);rev=revision;set(REV,rev);enabled=true;set(AUTO,"1")}
function status(){return {enabled,key:token(),revision:rev}}
global.NW_CLOUD={backup,schedule,load,accept,status};
})(window);