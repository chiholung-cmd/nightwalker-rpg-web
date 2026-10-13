import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {runInNewContext} from "node:vm";
const read=path=>readFileSync(new URL("../"+path,import.meta.url),"utf8");
function setup(){
 const calls=[],audios=[];
 class Audio{
  constructor(src){this.src=src;this.dataset={};this.volume=0;this.loop=false;this.preload="";this.paused=true;audios.push(this)}
  play(){calls.push(["play",this.src]);this.paused=false;return Promise.resolve()}
  pause(){calls.push(["pause",this.src]);this.paused=true}
  removeAttribute(){}
  load(){}
 }
 const listeners={};
 const window={Audio,performance:{now:()=>1000},
  requestAnimationFrame:()=>999,cancelAnimationFrame:()=>{},
  document:{hidden:false,addEventListener:(key,cb)=>{listeners[key]=cb}}
 };
 runInNewContext(read("music.js"),{window});
 return {player:window.NW_MUSIC,calls,audios,listeners,window};
}
test("music stays silent until user explicitly enables it",()=>{
 const {player,calls}=setup();
 assert.equal(player.status().enabled,false);
 player.sync({mood:"suspense",volume:.16});
 assert.equal(calls.length,0);
 assert.equal(player.getTrack("system").license,"CC0");
 assert.equal(player.getTrack("suspense").title,"Sector");
 assert.equal(player.getTrack("eerie").title,"Airy");
 assert.equal(player.getTrack("grief").title,"Sadness");
 assert.equal(player.getTrack("shock").title,"Urgent");
 assert.equal(player.getTrack("resolve").title,"Transmission");
});
test("user gesture enables looped CC0 score and subsequent scenario crossfade",async()=>{
 const {player,calls,audios}=setup();
 player.start({mood:"suspense",volume:.24});
 assert.equal(calls.length,1);
 assert.equal(audios[0].loop,true);
 assert.equal(audios[0].preload,"auto");
 assert.ok(audios[0].src.endsWith("/sector_0.mp3"));
 await Promise.resolve();await Promise.resolve();
 assert.equal(player.status().enabled,true);
 player.sync({mood:"grief",volume:.13});
 assert.equal(calls.length,2);
 assert.ok(audios[1].src.endsWith("/Sadness_0.ogg"));
 await Promise.resolve();await Promise.resolve();
 assert.equal(player.status().mood,"grief");
 player.setVolume(.9);
 assert.equal(player.status().volume,.9); // API clamps [0,1]; slider limits [0,.45]
 player.stop();
 assert.equal(player.status().enabled,false);
 assert.equal(audios[0].paused,true);
 assert.equal(audios[1].paused,true);
});
test("repeat render of the same pending soundtrack does not issue duplicate HTTP loads",()=>{
 const {player,calls}=setup();
 player.start({mood:"system",volume:.22});
 player.sync({mood:"system"});
 player.sync({mood:"system"});
 assert.equal(calls.length,1);
});
test("failed soundtrack host does not loop new play calls every render",async()=>{
 const calls=[];
 class BrokenAudio{
  constructor(src){this.src=src;this.dataset={};this.volume=0}
  play(){calls.push(this.src);return Promise.reject(new Error("blocked"))}
  pause(){}
  removeAttribute(){}
  load(){}
 }
 const win={Audio:BrokenAudio,document:{addEventListener:()=>{}},requestAnimationFrame:()=>1,cancelAnimationFrame:()=>{}};
 runInNewContext(read("music.js"),{window:win});
 const p=win.NW_MUSIC;
 p.start({mood:"eerie"});
 await Promise.resolve();await Promise.resolve();
 p.sync({mood:"eerie"});
 assert.equal(calls.length,1);
 assert.match(p.status().error,/暫時無法載入/);
});
test("reader wires music controls, scene moods, settings volume and license links",()=>{
 const app=read("app.js"),html=read("index.html"),engine=read("engine.js"),music=read("music.js");
 assert.match(app,/function soundtrackMood\(\)/);
 assert.match(app,/if\(cmd==="musicToggle"\)/);
 assert.match(app,/window\.NW_MUSIC\?\.start/);
 assert.match(app,/window\.NW_MUSIC\?\.sync/);
 assert.match(app,/id="bgm-volume"/);
 assert.match(app,/window\.NW_MUSIC\?\.setVolume/);
 assert.match(app,/musicControlText\(\)/);
 assert.match(engine,/musicEnabled:false/);
 assert.match(html,/music\.js/);
 assert.match(music,/open(gameart)?/i);
});
