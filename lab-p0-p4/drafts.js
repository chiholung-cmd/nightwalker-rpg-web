(function(global){
"use strict";
// Protect long prose input from redraws, reloads and accidental navigation.
// Drafts are device-local; only deliberate confirmation can clear them.
const PREFIX="nw_story_draft_v1:";
const MAX={free:3000,premise:2000,opening:1200,rewrite:700,world:90};
const memory=new Map();
const key=(kind,scope="global")=>PREFIX+String(kind).slice(0,18)+":"+String(scope||"global").slice(0,90);
function save(kind,scope,text){
 const value=String(text??"").slice(0,MAX[kind]||3000),id=key(kind,scope);
 memory.set(id,value);
 try{global.localStorage?.setItem?.(id,JSON.stringify({text:value,at:Date.now()}))}catch(_){}
 return value;
}
function get(kind,scope){
 const id=key(kind,scope);
 if(memory.has(id))return memory.get(id);
 try{
  const raw=global.localStorage?.getItem?.(id);
  if(!raw)return "";
  const v=JSON.parse(raw);
  const value=String(v?.text||"").slice(0,MAX[kind]||3000);
  memory.set(id,value);return value;
 }catch(_){return ""}
}
function clear(kind,scope){
 const id=key(kind,scope);memory.delete(id);
 try{global.localStorage?.removeItem?.(id)}catch(_){}
}
function storyKey(m){return m?String(m.seed||"unseeded")+":"+String(m.world||"world")+":"+Number(m.phase||0):"new-story"}
global.NW_DRAFTS={save,get,clear,storyKey};
})(window);
