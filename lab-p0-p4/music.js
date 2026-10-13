(function(global){
"use strict";
// Nightwalker Audio V1: CC0 tracks, user-initiated playback, no paid API.
// Prototype streams from original OpenGameArt file URLs. Self-host downloaded
// copies in ./music/ before production to avoid third-party availability risk.
const CATALOG={
 system:{label:"主神空間",title:"Pulse",artist:"SRG774",license:"CC0",source:"https://opengameart.org/content/dark-sci-fi-audio-pack",url:"https://opengameart.org/sites/default/files/pulse_0.mp3"},
 calm:{label:"平靜／探索",title:"Airy",artist:"SRG774",license:"CC0",source:"https://opengameart.org/content/dark-sci-fi-audio-pack",url:"https://opengameart.org/sites/default/files/airy_0.mp3"},
 suspense:{label:"懸疑調查",title:"Sector",artist:"SRG774",license:"CC0",source:"https://opengameart.org/content/dark-sci-fi-audio-pack",url:"https://opengameart.org/sites/default/files/sector_0.mp3"},
 eerie:{label:"恐怖／詭異",title:"Airy",artist:"SRG774",license:"CC0",source:"https://opengameart.org/content/dark-sci-fi-audio-pack",url:"https://opengameart.org/sites/default/files/airy_0.mp3"},
 chase:{label:"追逐／危機",title:"Urgent",artist:"SRG774",license:"CC0",source:"https://opengameart.org/content/dark-sci-fi-audio-pack",url:"https://opengameart.org/sites/default/files/urgent_0.mp3"},
 anger:{label:"憤怒／對抗",title:"Urgent",artist:"SRG774",license:"CC0",source:"https://opengameart.org/content/dark-sci-fi-audio-pack",url:"https://opengameart.org/sites/default/files/urgent_0.mp3"},
 shock:{label:"衝突／震驚",title:"Urgent",artist:"SRG774",license:"CC0",source:"https://opengameart.org/content/dark-sci-fi-audio-pack",url:"https://opengameart.org/sites/default/files/urgent_0.mp3"},
 grief:{label:"悲傷／失去",title:"Sadness",artist:"Kistol",license:"CC0",source:"https://opengameart.org/content/sadness",url:"https://opengameart.org/sites/default/files/Sadness_0.ogg"},
 resolve:{label:"結局／釋然",title:"Transmission",artist:"SRG774",license:"CC0",source:"https://opengameart.org/content/dark-sci-fi-audio-pack",url:"https://opengameart.org/sites/default/files/transmission_1.mp3"}
};
const MOODS={calm:"calm",suspense:"suspense",eerie:"eerie",shock:"shock",anger:"anger",grief:"grief",resolve:"resolve",system:"system",
  fear:"eerie",panic:"chase",chase:"chase",dread:"eerie",revelation:"resolve",relief:"resolve",danger:"chase",horror:"eerie"};
const state={enabled:false,volume:.22,mood:null,track:null,error:"",tracks:[null,null],slot:0,transition:0,frame:null,pendingUrl:"",failedUrl:"",failedUntil:0,unlocking:false};
const clamp=v=>Math.min(1,Math.max(0,Number(v)||0));
const now=()=>global.performance?.now?.()??Date.now();
const raf=cb=>typeof global.requestAnimationFrame==="function"?global.requestAnimationFrame(cb):global.setTimeout(()=>cb(now()),16);
const caf=id=>typeof global.cancelAnimationFrame==="function"?global.cancelAnimationFrame(id):global.clearTimeout(id);
function cleanAudio(a){
 if(!a)return;
 try{a.pause();a.removeAttribute?.("src");a.load?.()}catch(_){}
}
function stop(){
 state.transition++;
 if(state.frame!=null)caf(state.frame);
 state.frame=null;
 for(let i=0;i<2;i++){cleanAudio(state.tracks[i]);state.tracks[i]=null}
 state.enabled=false;state.mood=null;state.track=null;state.pendingUrl="";state.unlocking=false;
}
function getTrack(mood){return CATALOG[MOODS[String(mood||"").toLowerCase()]||"system"]||CATALOG.system}
function setVolume(value){
 state.volume=clamp(value);
 if(state.track)state.track.volume=state.volume;
 return state.volume;
}
function blend(prev,next,target,token){
 const started=now(),duration=1400;
 function step(time){
  if(token!==state.transition)return;
  const p=Math.min(1,Math.max(0,(time-started)/duration));
  if(next)next.volume=target*p;
  if(prev)prev.volume=target*(1-p);
  if(p<1)state.frame=raf(step);
  else{
   state.frame=null;
   cleanAudio(prev);
   for(let i=0;i<state.tracks.length;i++)if(state.tracks[i]===prev)state.tracks[i]=null;
  }
 }
 state.frame=raf(step);
}
function setMood(mood){
 const nextMood=MOODS[String(mood||"").toLowerCase()]||"system";
 const config=getTrack(nextMood);
 state.mood=nextMood;
 if(!state.enabled)return false;
 if(state.track?.dataset?.musicUrl===config.url||state.pendingUrl===config.url)return true;
 if(state.failedUrl===config.url&&Date.now()<state.failedUntil)return false;
 const previous=state.track;
 const nextIndex=1-state.slot;
 const stale=state.tracks[nextIndex];
 if(stale&&stale!==previous)cleanAudio(stale);
 const audio=new global.Audio(config.url);
 audio.preload="auto";audio.loop=true;audio.volume=0;
 audio.dataset.musicUrl=config.url;
 state.tracks[nextIndex]=audio;
 state.pendingUrl=config.url;
 state.transition++;
 const token=state.transition;
 if(state.frame!=null)caf(state.frame);
 // start synchronously from the user's click when applicable (autoplay rules).
 let start;
 try{start=audio.play()}catch(error){state.pendingUrl="";state.failedUrl=config.url;state.failedUntil=Date.now()+20000;state.error="音樂暫時無法播放";cleanAudio(audio);state.tracks[nextIndex]=null;return false}
 Promise.resolve(start).then(()=>{
  if(token!==state.transition||!state.enabled){cleanAudio(audio);return}
  state.pendingUrl="";state.failedUrl="";state.failedUntil=0;
  state.error="";
  state.track=audio;state.slot=nextIndex;
  blend(previous,audio,state.volume,token);
 }).catch(()=>{
  if(token!==state.transition)return;
  state.pendingUrl="";state.failedUrl=config.url;state.failedUntil=Date.now()+20000;
  state.error="免費曲庫音源暫時無法載入，可稍後重試或保持靜音";
  cleanAudio(audio);
  state.tracks[nextIndex]=null;
  if(!previous)state.enabled=false;
 });
 return true;
}
function start({mood="system",volume=.22}={}){
 state.volume=clamp(volume);
 state.error="";state.enabled=true;
 return setMood(mood);
}
function toggle({mood="system",volume=.22}={}){
 if(state.enabled){stop();return false}
 return start({mood,volume});
}
function sync({mood="system",volume=state.volume}={}){
 setVolume(volume);
 if(state.enabled)setMood(mood);
}
function suspendOnHide(){
 if(!state.enabled)return;
 if(global.document?.hidden){for(const a of state.tracks)try{a?.pause()}catch(_){}}
 else for(const a of state.tracks)if(a&&a===state.track)a.play().catch(()=>{state.error="需要點擊音樂按鈕重新播放"});
}
global.document?.addEventListener?.("visibilitychange",suspendOnHide);
global.NW_MUSIC={start,stop,toggle,sync,setVolume,getTrack,status:()=>({enabled:state.enabled,volume:state.volume,mood:state.mood,error:state.error}),catalog:CATALOG};
})(window);
