import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {runInNewContext} from "node:vm";

const source=readFileSync(new URL("../story.js",import.meta.url),"utf8");
function game(){
 const window={
  NW_ENGINE:{item:()=>({id:"ironrod",dmg:4,def:0}),end:s=>{s.mission.finished=true}},
  NW_DATA:{},NW_WORLD:{ability:()=>{},onAction:()=>{}}
 };
 runInNewContext(source,{window});
 const s={
  profile:{hp:100,sta:100,mp:60,san:100,attrs:{str:7},bloodline:null},
  loadout:{weapon:"ironrod",armor:"jacket",accessory:"charm",passive:[]},
  mission:{seed:11,world:"custom",worldName:"零號月台",director:true,phase:2,
   aiOptions:{2:[{label:"詢問",kind:"talk"}]},finished:false,mode:"solo",flags:[],progress:0,required:3,
   history:[],log:[],roundEvents:[],cooldowns:{},crew:[],rival:null,hidden:false,
   enemy:{hp:100,intent:0},storyState:null,bag:{},npcMemory:{}}
 };
 return {N:window.NW_STORY,s};
}

test("negated attack + positive talk is only a free conversation",()=>{
 const {N}=game();
 const r=N.parseFreeIntent("唔想攻擊，先同世娜傾偈");
 assert.equal(r.kind,"talk");assert.equal(r.cost,0);
});

test("negated attack alone never becomes a fight",()=>{
 const {N,s}=game();
 const r=N.analyzeFree(s,"我不想攻擊");
 assert.ok(r.error);assert.equal(s.profile.sta,100);
});

test("stop attacking and inspect is an observation",()=>{
 const {N}=game();
 assert.equal(N.parseFreeIntent("不要攻擊，先觀察車窗外").kind,"observe");
});

test("two different immediate actions are refused, rather than mischarging",()=>{
 const {N}=game();
 assert.ok(N.parseFreeIntent("先問世娜，然後攻擊感染者").error);
 assert.ok(N.parseFreeIntent("偷偷查看地上的血跡").error);
});

test("quoted orders in direct speech are not interpreted as player attack",()=>{
 const {N}=game();
 const r=N.parseFreeIntent("我向世娜說「不要攻擊！」");
 assert.equal(r.kind,"talk");assert.equal(r.cost,0);
});

test("positive attack is still recognized as high-cost combat",()=>{
 const {N}=game();
 const r=N.parseFreeIntent("我打算攻擊感染者");
 assert.equal(r.kind,"fight");assert.equal(r.cost,15);
});

test("blocking an enemy attack does not mean attacking the enemy",()=>{
 const {N}=game();
 const r=N.parseFreeIntent("阻止敵人攻擊");
 assert.equal(r.kind,"physical");
});

test("questions and hypotheticals cannot consume game resources",()=>{
 const {N,s}=game(),before=JSON.stringify(s);
 assert.ok(N.analyzeFree(s,"我想研究能不能攻擊？").error);
 assert.equal(JSON.stringify(s),before);
});

test("preview and mismatched confirmation never mutate HP or stamina",()=>{
 const {N,s}=game(),before=JSON.stringify(s);
 const review=N.analyzeFree(s,"我想攻擊門口的感染者");
 assert.equal(review.kind,"fight");assert.equal(review.effects[0],"STA −15");
 assert.equal(JSON.stringify(s),before);
 const r=N.free(s,"我想攻擊門口的感染者","talk");
 assert.ok(r.error);
 assert.equal(JSON.stringify(s),before);
});

test("unconfirmed free action has no irreversible effect",()=>{
 const {N,s}=game(),before=JSON.stringify(s);
 assert.ok(N.free(s,"攻擊前方的感染者").error);
 assert.equal(JSON.stringify(s),before);
});

test("confirmed conversation advances exactly one scene without spending stamina",()=>{
 const {N,s}=game();
 const review=N.analyzeFree(s,"向世娜說出剛才看到的情報");
 assert.equal(review.kind,"talk");assert.equal(review.cost,0);
 const res=N.free(s,"向世娜說出剛才看到的情報","talk");
 assert.equal(res.error,null);assert.equal(s.profile.sta,100);
 assert.equal(s.mission.phase,3);assert.equal(s.mission.history.length,1);
});

test("confirmed combat consumes shown stamina and is tracked once",()=>{
 const {N,s}=game();
 const review=N.analyzeFree(s,"攻擊前方的感染者");
 assert.equal(review.cost,15);
 const result=N.free(s,"攻擊前方的感染者",review.kind);
 assert.equal(result.error,null);
 assert.equal(s.profile.sta,85);assert.equal(s.mission.phase,3);
 assert.equal(s.mission.history.length,1);
});

test("review cannot bypass AI scene availability or remaining stamina",()=>{
 const {N,s}=game();
 s.profile.sta=3;
 assert.ok(N.analyzeFree(s,"攻擊敵人").error);
 assert.equal(s.profile.sta,3);
 s.profile.sta=100;delete s.mission.aiOptions[2];
 assert.ok(N.analyzeFree(s,"與世娜交談").error);
 assert.equal(s.mission.phase,2);
});
