import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {runInNewContext} from "node:vm";
const read=p=>readFileSync(new URL("../"+p,import.meta.url),"utf8");
function game(){
 const context={window:{}};
 runInNewContext(read("data.js"),context);
 runInNewContext(read("engine.js"),context);
 return context.window.NW_ENGINE;
}
test("Main God alone decides solo, team and hostile missions, reproducibly from assignment seed",()=>{
 const E=game();
 for(const [seed,mode] of [[0,"solo"],[2,"solo"],[4,"team"],[7,"team"],[9,"versus"]]){
  assert.equal(E.mainGodMode(seed),mode);
  assert.equal(E.mainGodMode(seed),E.mainGodMode(seed));
 }
 const s=E.defaultState();s.profile.name="林燁";s.profile.nameCustomized=true;
 assert.equal(E.assignCustomWorld(s,"零號月台",true,{kind:"original",premise:"一座每到午夜便失去記憶的月台，乘客必須遵守三條禁忌規則。"}),null);
 assert.equal(s.assignment.mode,E.mainGodMode(s.assignment.seed,"original"));
 const assigned=s.assignment.mode;
 assert.equal(E.launch(s),null);
 assert.equal(s.mission.mode,assigned);
 assert.equal(s.mission.crew.length,assigned==="team"?2:assigned==="versus"?1:0);
});
test("RPG command hub and all original character tabs, enhancement and inventory are restored",()=>{
 const app=read("app.js"),css=read("style.css");
 for(const k of ["command-dashboard","command-shortcuts","command-vitals","主神強化","裝備配置","永久倉庫","輪迴記憶","function profile(){","總覽","能力","裝備","關係","輪迴","function loadout(){","function upgrade(){","function warehouse(){"]){
  assert.ok(app.includes(k),k);
 }
 assert.match(css,/\.command-dashboard/);
 assert.match(css,/\.command-shortcut/);
 assert.match(css,/\.codex-rpg-overview/);
});
test("player has one persistent name; world portal shows confirmed identity instead of repeating creation",()=>{
 const app=read("app.js"),E=game(),s=E.defaultState();
 assert.match(app,/const protagonistSetup=playerName\(\)&&!temporary\.editName/);
 assert.match(app,/identity-confirmed/);
 assert.match(app,/if\(cmd==="editName"\)/);
 s.profile.name="林燁";s.profile.nameCustomized=true;
 const storage={values:new Map(),getItem(key){return this.values.get(key)||null},setItem(key,value){this.values.set(key,value)},removeItem(key){this.values.delete(key)}};
 E.save(s,storage);
 const reloaded=E.load(storage);
 assert.equal(reloaded.profile.name,"林燁");
 assert.equal(reloaded.profile.nameCustomized,true);
});
test("novel interface never offers to select the team and respects an immutable Main God decree",()=>{
 const app=read("app.js"),engine=read("engine.js");
 assert.doesNotMatch(app,/data-do="entryMode:(?:solo|team)"/);
 assert.doesNotMatch(app,/if\(cmd\.startsWith\("entryMode:"\)\)/);
 assert.match(app,/main-god-decree/);
 assert.match(app,/主神指派 · 不可更改/);
 assert.match(engine,/function mainGodMode/);
 assert.match(engine,/mode:mainGodMode\(seed,kind\)/);
});
test("traditional Chinese novel generation is required and OpenCC normalizes model output",()=>{
 const api=read("api/story.mjs"),pkg=JSON.parse(read("package.json"));
 assert.equal(pkg.dependencies["opencc-js"],"1.4.2");
 assert.match(api,/所有最終文字.*必須採用繁體中文字形/);
 assert.match(api,/async function traditionalizeGeneratedScene/);
 assert.match(api,/mod\.Converter\(\{from:"cn",to:"tw"\}\)/);
 assert.match(api,/scene=await traditionalizeGeneratedScene\(scene\)/);
 assert.ok(!api.includes("現代簡體中文長篇敘述"));
});
test("all eight emotionally distinctive motion types are accessible and replayable",()=>{
 const app=read("app.js"),css=read("style.css"),fx=read("emotionFx.js");
 const effects=["fear","panic","anger","grief","revelation","shock","dread","relief"];
 for(const type of effects){
  assert.ok(app.includes('["'+type+'",'),type);
  assert.ok(fx.includes('name:"'+type+'"'),type);
  assert.ok(css.includes("emotion-"+type),type);
 }
 assert.match(app,/if\(cmd==="emotionDemoReplay"\)/);
 assert.match(app,/if\(cmd==="emotionDemoClose"\)/);
 assert.match(app,/emotionDemoMarkup\(\)/);
 assert.match(app,/emotionalBeats<8/);
 assert.match(css,/prefers-reduced-motion:reduce/);
});
