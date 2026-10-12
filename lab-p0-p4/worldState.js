(function(global){
"use strict";
// Long-lived world simulator: deterministic game consequences are not delegated to AI.
const clamp=(v,a,b)=>Math.max(a,Math.min(b,Number(v)||0));
const simple=x=>String(x||"").slice(0,180);
function key(m){return (m.worldKind==="original"?"original":"adaptation")+":"+(m.worldName||m.world)}
function record(s){s.worldLibrary ||= {};return s.worldLibrary[key(s.mission)]||null}
function enter(s){
 const m=s.mission;if(!m)return;
 const old=record(s)||s.worldLibrary?.["catalog:"+(m.worldName||m.world)]||null;m.npcMemory={...(old?.npcs||{}),...(m.npcMemory||{})};
 m.storyFacts=Array.from(new Set([...(old?.facts||[]),...(m.storyFacts||[])])).slice(-80);
 m.quests||=[];m.agencyEvents||=[];m.branchConsequences||=[];
 m.returnVisit=!!(old?.visits>0);
 m.worldHistory=old?.chapters?.slice(0,2)||[];
 m.masteryLog ||= [];
}
const labels={talk:"交涉",observe:"調查",conceal:"隱瞞",run:"逃離",sneak:"潛行",risk:"冒險",physical:"行動",fight:"戰鬥",hide:"藏匿",rest:"整備"};
function ingest(s,scene,phase){
 const m=s.mission;if(!m||m.finished||m.phase!==phase)return;
 m.quests||=[];m.agencyEvents||=[];
 // Autonomous NPC events are independent of player choices. They influence subsequent turns.
 for(const x of (scene.npcEvents||[]).slice(0,2)){
   const name=simple(x.name).slice(0,45),event=simple(x.event),intent=simple(x.intent);
   if(!name||!event)continue;
   if(m.agencyEvents.some(e=>e.phase===phase&&e.name===name))continue;
   m.agencyEvents.push({phase,name,event,intent});
   m.log.push(name+"：" + event);
   const p=m.npcMemory?.[name]||{trust:0,attitude:"未知",memory:""};
   m.npcMemory[name]={...p,lastAction:event,goal:intent||p.goal||"",lastSeen:phase};
 }
 m.agencyEvents=m.agencyEvents.slice(-30);
 for(const x of (scene.sideQuests||[]).slice(0,2)){
   let title=simple(x.title).slice(0,65),objective=simple(x.objective).slice(0,120);
   let trigger=String(x.trigger||"observe");
   if(!labels[trigger]||!title||!objective)continue;
   if(m.quests.some(q=>q.title===title)||m.quests.length>=5)continue;
   const id="quest-"+(m.quests.length+1)+"-"+phase;
   m.quests.push({id,title,objective,trigger,progress:0,required:2,status:"active",reward:35,started:phase});
   m.log.push("主神支線已發現："+title);
 }
}
function onAction(s,action,report){
 const m=s.mission;if(!m||!report)return;
 m.quests||=[];m.branchConsequences||=[];
 const kind=action.kind,phase=m.phase;
 for(const q of m.quests){
   if(q.status!=="active"||q.trigger!==kind)continue;
   q.progress=clamp(q.progress+1,0,q.required);
   if(q.progress>=q.required){q.status="completed";q.completedAt=phase;m.log.push("支線任務「"+q.title+"」達成；結算時額外取得 "+q.reward+" 積分。");}
 }
 if(kind==="talk"||kind==="conceal"||kind==="fight"||kind==="risk"){
   const npc=Object.entries(m.npcMemory||{}).sort((a,b)=>(b[1].lastSeen||0)-(a[1].lastSeen||0))[0];
   if(npc){const [name,p]=npc;const change=kind==="talk"?1:kind==="conceal"?-1:kind==="fight"?-2:-1;
    p.trust=clamp((p.trust||0)+change,-10,10);
    p.memory=simple((p.memory||"")+"；第"+phase+"幕你採取"+labels[kind]+"行動");
    m.branchConsequences.push({phase,npc:name,kind,trust:p.trust});
   }
 }
 m.branchConsequences=m.branchConsequences.slice(-35);
for(const [name,npc] of Object.entries(m.npcMemory||{}).slice(0,8)){if(!npc.goal||npc.lastSeen===phase)continue;const evt={phase,name,event:"正依照自己的目的繼續採取行動："+simple(npc.goal).slice(0,75),intent:simple(npc.goal)};if(!(m.agencyEvents||[]).some(e=>e.phase===phase&&e.name===name)){m.agencyEvents||=[];m.agencyEvents.push(evt)}}
m.agencyEvents=m.agencyEvents.slice(-30);
}
function ability(s,action,events){
 const m=s.mission,p=s.profile;if(!m)return;
 m.bonusUsed ||= {};
 const weapon=global.NW_ENGINE.item(s.loadout.weapon);
 const accessory=global.NW_ENGINE.item(s.loadout.accessory);
 if(action.kind==="observe"&&s.loadout.passive.includes("focus")&&!m.bonusUsed.focus){
   m.progress++;m.bonusUsed.focus=true;m.flags.push("focus-insight");events.push("專注本能讓你捕捉到容易錯過的關鍵資訊。");
 }
 if(action.kind==="sneak"&&weapon?.id==="shortblade"&&!m.bonusUsed.shortblade){
   p.sta=Math.min(100,p.sta+3);m.bonusUsed.shortblade=true;events.push("短刀方便隱藏，減少了潛行時的體力消耗。");
 }
 if(["risk","fight"].includes(action.kind)&&accessory?.id==="charm"&&!m.bonusUsed.charm){
   p.san=Math.min(100,p.san+4);m.bonusUsed.charm=true;events.push("殘缺護符短暫壓下了異常的精神波動。");
 }
 if(action.kind==="observe"&&s.profile.bloodline==="blank"&&!m.bonusUsed.blank){
   m.storyFacts ||= [];m.storyFacts.push("空白者血脈察覺到世界規則存在被隱藏的部分");
   m.bonusUsed.blank=true;events.push("空白者的本能提醒你：某條世界規則並不完整。");
 }
}
function skillUse(s,skillId){
 s.mastery||={};s.mastery[skillId]=Math.min(999,(s.mastery[skillId]||0)+1);
 const level=Math.min(4,Math.floor(s.mastery[skillId]/8));
 if(s.mission&&level){s.profile.sta=Math.min(100,s.profile.sta+Math.min(6,2*level));if(skillId==="observe"||skillId==="negotiation")s.mission.progress+=1}
 if(s.mission){s.mission.masteryLog ||= [];s.mission.masteryLog.push({skillId,uses:s.mastery[skillId],level,phase:s.mission.phase})}
 return {uses:s.mastery[skillId],level};
}
function snapshot(s){
 const m=s.mission;if(!m)return null;
 return {quests:m.quests||[],agencyEvents:(m.agencyEvents||[]).slice(-8),branchConsequences:(m.branchConsequences||[]).slice(-8),returnVisit:m.returnVisit||false,mastery:s.mastery||{}};
}
global.NW_WORLD={enter,ingest,onAction,ability,skillUse,snapshot,key};
})(window);