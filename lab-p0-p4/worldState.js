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
const genericMatches=new Set(["行動","事件","現場","人物","世界","時間","這個","事情","進行","知道","線索","一切","情況","選擇","現在","其他","調查","尋找","發現","主角","敵人","所有","任何","隊友"]);
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
  const matched=questEvidence(q.objective||q.title,source);
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
  const hostile=/騙|欺|威脅|強迫|誤導|陷害|出賣|羞辱/.test(word);
  const supportive=/告知|分享|說出|坦白|安慰|合作|幫|救|支持|承諾|解釋|道歉|保護|求助|協助/.test(word);
  const repeated=m.branchConsequences.some(e=>e.npc===name&&e.kind===kind&&e.action===actionText);
  const delta=repeated?0:kind==="fight"?-2:hostile?-1:(kind==="talk"||kind==="risk")&&supportive?1:0;
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

// Long-form story spine: a bounded, evidence-backed journal rather than a fake fixed sequence.
// The existing save object owns this state; there is no migration or save-key reset.
const STORY_ACTS=[
 {id:"opening",name:"異常與代價",from:0,to:4,goal:"以具體事件立起核心疑問、危險和主角的即時目標，避免過早解決",minimum:"場面與謎團必須形成可供回訪的線索"},
 {id:"relations",name:"人心與盟約",from:5,to:9,goal:"讓角色憑自身目的採取行動，令之前的選擇引出合作、衝突或背叛",minimum:"至少一段關係因先前決定而實際改變"},
 {id:"reversal",name:"代價與反轉",from:10,to:15,goal:"以前面已有的人物動機與可核對的線索帶出反轉，禁止空降幕後黑手",minimum:"轉折須有此前埋下的證據"},
 {id:"consequences",name:"困局與抉擇",from:16,to:22,goal:"回收早期疑問；讓錯誤、幫助與背叛造成無法輕易抹除的現實後果",minimum:"最少一個舊選擇在當前場景造成具體變化"},
 {id:"resolution",name:"高潮與餘韻",from:23,to:27,goal:"收束主線與主要伏筆、交代主要角色去向，按真實行動安排得失；第28章必須寫完完整結局",minimum:"不能以一行成功或任務評分取代小說結局"}
];
function actFor(phase){return STORY_ACTS.find(x=>phase>=x.from&&phase<=x.to)||STORY_ACTS.at(-1)}
function ensureDirector(s){
 const m=s?.mission;if(!m)return null;
 if(!m.directorPlan||m.directorPlan.version!==1)m.directorPlan={version:1,chapters:[],threads:[],decisions:[],finale:null};
 const p=m.directorPlan;
 p.chapters||=[];p.threads||=[];p.decisions||=[];
 return p;
}
function directorContext(s){
 const m=s?.mission;if(!m)return null;
 const p=ensureDirector(s),act=actFor(m.phase),remaining=28-m.phase;
 const threads=p.threads.filter(t=>t.status==="open").slice(-3).map(t=>({id:t.id,setup:simple(t.setup).slice(0,90),chapter:t.chapter+1}));
 const callbacks=p.threads.filter(t=>t.status==="paid").slice(-2).map(t=>({id:t.id,payoff:simple(t.payoff).slice(0,70)}));
 return {chapter:m.phase+1,maxChapters:28,act:act.id,actName:act.name,actObjective:act.goal,
  sceneObligation:act.minimum,chaptersRemaining:remaining,mustClose:m.phase>=27,
  openThreads:threads,previousPayoffs:callbacks,
  decisions:p.decisions.slice(-3).map(x=>({chapter:x.phase+1,action:simple(x.action).slice(0,95),kind:x.kind,consequence:simple(x.consequence).slice(0,110)})),
  previousChapter:p.chapters.at(-1)?{title:p.chapters.at(-1).title,summary:p.chapters.at(-1).summary}:null};
}
function recordChapter(s,scene,phase){
 const m=s?.mission;if(!m||m.phase!==phase||!scene)return;
 const p=ensureDirector(s);
 // Only record real prose: never invent an incident or an NPC reaction.
 const blocks=Array.isArray(scene.blocks)?scene.blocks:[];
 const prose=blocks.filter(b=>b?.type==="narration").map(b=>simple(b.text).trim()).filter(Boolean);
 const summary=simple(prose.join(" ")).slice(0,150);
 const title=simple(scene.title||"").slice(0,45);
 if(!summary)return;
 const row={phase,title,summary,act:actFor(phase).id};
 const existing=p.chapters.findIndex(x=>x.phase===phase);
 if(existing>=0)p.chapters[existing]=row;else p.chapters.push(row);
 p.chapters=p.chapters.slice(-28);
 if(!p.threads.some(t=>t.chapter===phase)&&[0,5,10,16].includes(phase)){
  const candidate=(Array.isArray(scene.facts)?scene.facts:[]).find(x=>typeof x==="string"&&x.length>=10)||
   (Array.isArray(scene.sideQuests)?scene.sideQuests:[]).find(q=>q?.objective?.length>=10)?.objective;
  if(candidate&&p.threads.length<5)p.threads.push({id:"thread-"+phase,chapter:phase,setup:simple(candidate).slice(0,115),status:"open",payoff:""});
 }
 // A claimed payoff is accepted only if earlier thread, objective and result are visible in this chapter's prose.
 for(const c of (Array.isArray(scene.callbacks)?scene.callbacks:[]).slice(0,2)){
  const t=p.threads.find(x=>x.id===c?.threadId&&x.status==="open"&&x.chapter<phase);
  const outcome=simple(c?.outcome).trim();
  const sameNarrative=outcome.length>=8&&prose.join(" ").includes(outcome.slice(0,6));
  if(t&&sameNarrative){t.status="paid";t.payoff=outcome.slice(0,115);t.paidAt=phase}
 }
 if(phase===27)p.finale={chapter:28,title,prose:summary,declaredResolved:!!scene.resolution?.readyToConclude};
}
function recordDirectorAction(s,action,report){
 const m=s?.mission;if(!m||!m.director||!report)return;
 const p=ensureDirector(s);
 const phase=Math.max(0,m.phase-1);
 const entry={phase,action:simple(report.action||action.label).slice(0,130),kind:action.kind,
  consequence:simple((report.events||[]).find(x=>typeof x==="string"&&x&&!/^\s*STA/.test(x))||"").slice(0,150)};
 const pos=p.decisions.findIndex(x=>x.phase===phase);
 if(pos>=0)p.decisions[pos]=entry;else p.decisions.push(entry);
 p.decisions=p.decisions.slice(-28);
}
function allowDirectorEnding(s){
 const m=s?.mission;if(!m?.director)return false;
 if(m.phase>=28)return true;
 if(m.phase<23)return false;
 const current=m.aiScenes?.[m.phase-1]?.resolution;
 if(!current?.readyToConclude)return false;
 // Do not stop at the first requested ending while meaningful unresolved setup remains.
 const p=ensureDirector(s),pending=p.threads.filter(t=>t.status==="open").length;
 return pending===0||m.phase>=27;
}

// NPC AI deltas are patches, never replacements for established character goals or injuries.
function mergeNpcUpdates(s,updates,phase){
 const m=s?.mission;if(!m||m.finished||m.phase!==phase)return 0;
 m.npcMemory ||= {};
 let count=0;
 for(const x of (Array.isArray(updates)?updates:[]).slice(0,3)){
  const name=simple(x?.name).trim().slice(0,40);
  if(!name||!simple(x?.memory).trim())continue;
  const prev=m.npcMemory[name]||{trust:0,attitude:"未知",memory:""};
  const trustChange=clamp(x.trustChange,-2,2);
  const prevTrust=Number(prev.trust)||0;
  m.npcMemory[name]={...prev,trust:clamp(prevTrust+trustChange,-10,10),
   attitude:simple(x.attitude).trim()||prev.attitude||"未知",
   memory:simple(x.memory).trim(),updated:phase};
  count++;
 }
 return count;
}
function snapshot(s){
 const m=s.mission;if(!m)return null;
 return {quests:m.quests||[],agencyEvents:(m.agencyEvents||[]).slice(-8),branchConsequences:(m.branchConsequences||[]).slice(-8),returnVisit:m.returnVisit||false,mastery:s.mastery||{}};
}
global.NW_WORLD={enter,ingest,onAction,ability,skillUse,snapshot,mergeNpcUpdates,key,ensureDirector,directorContext,recordChapter,recordDirectorAction,allowDirectorEnding};
})(window);