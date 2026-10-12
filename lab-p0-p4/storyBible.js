(function(global){
"use strict";
const short=(x,n=160)=>String(x??"").trim().slice(0,n);
const unique=(a,n)=>Array.from(new Set(a.filter(Boolean))).slice(-n);
function ensure(s){
 const m=s?.mission;if(!m)return null;
 if(!m.storyBible||m.storyBible.version!==1)m.storyBible={version:1,chapters:[],rules:[],characters:{},location:"",characterFates:{},canonAnchors:[]};
 const b=m.storyBible;b.chapters||=[];b.rules||=[];b.characters||={};b.characterFates||={};b.canonAnchors||=[];
 return b;
}
function hasText(prose,assertion,min=5){
 const t=short(assertion,130);
 if(t.length<min)return false;
 return prose.includes(t.slice(0,Math.min(12,t.length)));
}
function ingest(s,scene,phase){
 const m=s?.mission;if(!m||m.phase!==phase||!scene)return;
 const b=ensure(s);
 const blocks=Array.isArray(scene.blocks)?scene.blocks:[];
 const prose=blocks.map(x=>short(x?.text,1500)).join(" ");
 const narration=blocks.filter(x=>x?.type==="narration").map(x=>short(x.text,1500)).join(" ");
 if(narration.length<70)return;
 const summary=short(narration,200),title=short(scene.title,50);
 const item={phase,title,summary,act:m.directorPlan?.chapters?.find(x=>x.phase===phase)?.act||""};
 const i=b.chapters.findIndex(x=>x.phase===phase);
 if(i>=0)b.chapters[i]=item;else b.chapters.push(item);
 b.chapters=b.chapters.slice(-28);
 const continuity=scene.continuity||{};
 const location=short(continuity.location,55);
 if(location.length>=2&&prose.includes(location))b.location=location;
 for(const raw of (Array.isArray(continuity.rules)?continuity.rules:[]).slice(0,3)){
  const text=short(raw,135);
  if(hasText(prose,text,10)&&!b.rules.some(r=>r.text===text))b.rules.push({text,firstSeen:phase,source:"on-page"});
 }
 b.rules=b.rules.slice(-12);
 for(const x of (Array.isArray(continuity.characters)?continuity.characters:[]).slice(0,5)){
  const name=short(x?.name,40),where=short(x?.location,55),state=short(x?.condition,95),injury=short(x?.injury,80);
  if(!name||!prose.includes(name))continue;
  const prev=b.characters[name]||{name,firstSeen:phase};
  const patch={...prev,lastSeen:phase};
  if(where&&prose.includes(where))patch.location=where;
  if(state&&hasText(prose,state,3))patch.condition=state;
  if(injury&&hasText(prose,injury,3))patch.injury=injury;
  b.characters[name]=patch;
 }
 for(const evt of (Array.isArray(scene.npcEvents)?scene.npcEvents:[]).slice(0,2)){
  const name=short(evt?.name,40);
  if(!name||!prose.includes(name))continue;
  b.characters[name]={...(b.characters[name]||{firstSeen:phase}),name,lastSeen:phase,agency:short(evt.event,120)};
 }
 for(const f of (Array.isArray(continuity.characterFates)?continuity.characterFates:[]).slice(0,8)){
  const name=short(f?.name,40),outcome=short(f?.outcome,125);
  if(phase<23||!name||!prose.includes(name)||!hasText(prose,outcome,5))continue;
  b.characterFates[name]={outcome,phase,source:"on-page"};
 }
 if(Array.isArray(scene.canonTimeline)&&!b.canonAnchors.length){
  b.canonAnchors=scene.canonTimeline.slice(0,6).map(x=>({text:short(x?.text,120),source:short(x?.source,12),order:Number(x?.order)||0,chronologyVerified:!!x?.chronologyVerified})).filter(x=>x.text.length>=15);
 }
}
function recordAction(s,report){
 const m=s?.mission;if(!m?.director||!report)return;
 const b=ensure(s),last=b.chapters.at(-1);
 if(last&&last.phase===m.phase-1)last.lastPlayerAction=short(report.action,130);
}
function context(s){
 const m=s?.mission;if(!m)return null;
 const b=ensure(s);
 const npcs=Object.entries(m.npcMemory||{}).slice(-6).map(([name,p])=>({
  name:short(name,35),goal:short(p.goal,85),memory:short(p.memory,85),
  injury:short(p.injury,65),trust:Number(p.trust)||0,
  lastSeen:p.lastSeen??p.updated??null,
  location:short(b.characters[name]?.location,50),condition:short(b.characters[name]?.condition,65)
 }));
 return {location:short(b.location,50),worldRules:b.rules.slice(-6).map(r=>r.text),
  characters:npcs,priorChapters:b.chapters.slice(-5).map(c=>({chapter:c.phase+1,title:c.title,summary:short(c.summary,120),lastPlayerAction:short(c.lastPlayerAction,80)})),
  canonAnchors:b.canonAnchors.slice(0,5),previousFates:Object.entries(b.characterFates).slice(-5).map(([name,f])=>({name,outcome:f.outcome}))};
}
function endingAudit(s){
 const m=s?.mission;if(!m)return {openThreads:[],unclearCharacters:[],closed:true};
 const b=ensure(s);
 const openThreads=(m.directorPlan?.threads||[]).filter(t=>t.status==="open").slice(-5).map(t=>short(t.setup,95));
 const known=unique([...Object.keys(m.npcMemory||{}),...Object.keys(b.characters||{})],12);
 const unclearCharacters=known.filter(name=>!b.characterFates[name]).slice(0,6);
 return {openThreads,unclearCharacters,closed:openThreads.length===0&&unclearCharacters.length===0,
  finales:b.characterFates};
}
global.NW_BIBLE={ensure,ingest,recordAction,context,endingAudit};
})(window);
