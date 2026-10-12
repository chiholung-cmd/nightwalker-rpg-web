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
   m.quests.push({id,title,objective,trigger,progress:0,required:2,status:"active",reward:35,started:phase,evidence:[]});
   m.log.push("主神支線已發現："+title);
 }
}
// A sidequest is a concrete goal, not a counter for unrelated action kinds.
const genericPhrases=/主神|任務|支線|目標|完成|成功|獲得|取得|嘗試|設法|努力|需要|必須|想辦法|一個|一名|一些|周圍|附近|的|地|了|把|將|跟|與|對|去|中|在/g;
const genericMatches=new Set(["行動","事件","現場","人物","世界","時間","這個","事情","進行","知道","線索","一切","情況","選擇","現在","其他","調查","尋找","發現","主角"]);
const normalize=x=>simple(x).replace(/[^\p{Script=Han}a-zA-Z0-9]/gu,"").replace(genericPhrases,"").toLowerCase();
function questEvidence(objective,choice){
 const target=normalize(objective),action=normalize(choice);
 if(target.length<2||action.length<2)return "";
 for(let size=Math.min(7,target.length);size>=2;size--){
  for(let i=0;i<=target.length-size;i++){
   const term=target.slice(i,i+size);
   if(!genericMatches.has(term)&&action.includes(term))return term;
  }
 }
 return "";
}
function npcTarget(m,action,report){
 const text=simple([action.label,action.hint,report.action].filter(Boolean).join(" ")).toLowerCase();
 const entries=Object.keys(m.npcMemory||{}).filter(name=>name.length>=2&&text.includes(name.toLowerCase()));
 // Only the specifically referenced person may be affected. Never mutate "last seen NPC" blindly.
 return entries.sort((a,b)=>b.length-a.length)[0]||"";
}
function onAction(s,action,report){
 const m=s.mission;if(!m||!report)return;
 m.quests||=[];m.branchConsequences||=[];m.agencyEvents||=[];
 const kind=action.kind,phase=m.phase;
 const actionText=simple(report.action||action.label||action.hint),source=[actionText,action.hint||""].join(" ");
 for(const q of m.quests){
  if(q.status!=="active")continue;
  const matched=questEvidence(q.objective+" "+q.title,source);
  // Two-character evidence needs to match the suggested action type; specific names/terms can cross categories.
  if(!matched||(matched.length<3&&q.trigger!==kind))continue;
  q.evidence ||= [];
  if(q.evidence.some(e=>e.phase===phase||e.action===actionText))continue;
  q.evidence.push({phase,action:actionText,kind,matched});
  q.evidence=q.evidence.slice(-8);
  q.progress=clamp(Math.max(Number(q.progress)||0,q.evidence.length),0,q.required||2);
  m.log.push("支線線索「"+q.title+"」："+actionText+"（"+q.progress+"/"+q.required+"）");
  if(q.progress>=(q.required||2)){
   q.status="completed";q.completedAt=phase;
   m.log.push("支線任務「"+q.title+"」完成，結算時額外獲得 "+q.reward+" 積分。");
  }
 }
 const name=npcTarget(m,action,report);
 if(name){
  const p=m.npcMemory[name],word=actionText+String(action.hint||"");
  const delta=kind==="talk"?1:kind==="fight"?-2:kind==="risk"&&/救|護|保護|協助|援/ .test(word)?1:kind==="conceal"&&/騙|欺|誤導|陷害/.test(word)?-1:0;
  if(delta){
   const old=Number(p.trust)||0;
   p.trust=clamp(old+delta,-10,10);
   p.memory=simple((p.memory||"")+"；第"+phase+"章，主角採取「"+actionText+"」");
   p.lastDecision=actionText;
   m.branchConsequences.push({phase,npc:name,kind,action:actionText,change:p.trust-old,trust:p.trust});
   m.log.push(name+"的關係有所變化（"+(delta>0?"+":"")+delta+" 信任）。");
  }
 }
 m.branchConsequences=m.branchConsequences.slice(-35);
 // Autonomous NPC events must come from actual generated world events, not repeat the same goal each turn.
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