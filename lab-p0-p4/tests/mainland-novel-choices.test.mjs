import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {runInNewContext} from "node:vm";
import api from "../api/story.mjs";
const code=p=>readFileSync(new URL("../"+p,import.meta.url),"utf8");
function library(){const window={};runInNewContext(code("mainlandNovels.js"),{window});return window.NW_CN_NOVELS}
test("Chinese webnovels are a real visible and browsable choice, not just an AI prompt",()=>{
 const lib=library(),app=code("app.js"),html=code("index.html"),style=code("style.css");
 assert.equal(lib.books.length,14);
 assert.equal(lib.genres.length,6);
 assert.deepEqual([...new Set(lib.books.map(x=>x.id))].length,14);
 for(const g of ["無限流","懸疑驚悚","仙俠玄幻","科幻末日","遊戲競技"])assert.ok(lib.filter(g).length>0,g);
 for(const t of ["無限恐怖","輪迴樂園","驚悚樂園","十日終焉","詭秘之主","凡人修仙傳","斗破蒼穹","三體"]){
  assert.ok(lib.books.some(x=>x.title===t),t)
 }
 assert.equal(lib.filter("全部","轮回乐园")[0].id,"reincarnation-paradise");
 assert.equal(lib.filter("全部","zhttty")[0].id,"infinite-terror");
 assert.equal(lib.filter("全部","克蘇魯")[0]?.id,"lord-mysteries");
 assert.match(app,/data-do="worldType:mainland"/);
 assert.match(app,/novelPick:/);
 assert.match(app,/cn-novel-card/);
 assert.match(app,/novelGenre:/);
 assert.match(app,/id="cn-novel-search"/);
 assert.match(html,/mainlandNovels\.js/);
 assert.match(style,/\.cn-novel-grid/);
});
test("catalog original-novel choice opens a prepared story, not a TV adaptation",()=>{
 const window={};runInNewContext(code("data.js"),{window});runInNewContext(code("engine.js"),{window});
 const E=window.NW_ENGINE,entry=library().find("infinite-terror"),s=E.defaultState();
 s.profile.name="林燁";s.profile.nameCustomized=true;
 assert.equal(E.assignCustomWorld(s,entry.title,true,{kind:"adaptation",mediaType:entry.mediaType,
  verifiedTitle:entry.title,verifiedSource:entry.sourceUrl,verifiedSourceTitle:entry.sourceTitle,summary:entry.summary}),null);
 s.assignment.curatedNovelId=entry.id;
 assert.equal(s.assignment.mediaType,"小說");
 assert.equal(s.assignment.curatedNovelId,"infinite-terror");
 assert.ok(s.assignment.worldSummary.includes("主神空間"));
 assert.equal(E.launch(s),null);
 assert.equal(s.mission.curatedNovelId,entry.id);
 assert.equal(s.mission.narrativeMode,true);
});
test("API grounds a curated Chinese original without a live Wikipedia call",async()=>{
 const oldFetch=globalThis.fetch,oldKey=process.env.GROQ_API_KEY;
 process.env.GROQ_API_KEY="test_novels_key";
 let calls=0;
 const novel="林燁在主神空間醒過來，玻璃桌面上放着一張標有隊員姓名的紙。林霧將武器遞給他，壓低聲線說，這一次要先弄清楚任務的真正條件。林燁沒有立即答應。他望向房間另一邊，發現有人早已將出口堵住。任何人都可以選擇走近那扇門，但選擇之後會發生什麼，仍然沒有人敢確定。";
 globalThis.fetch=async url=>{
  calls++;
  if(!String(url).includes("api.groq.com"))throw Error("unexpected Wikipedia lookup: "+url);
  return new Response(JSON.stringify({choices:[{message:{content:JSON.stringify({
   title:"入場之前",mood:"suspense",blocks:[{type:"narration",text:novel.repeat(4)}],
   options:[{label:"詢問林霧",kind:"talk"},{label:"調查出口",kind:"observe"},{label:"檢查手中武器",kind:"physical"}]
  })}}],usage:{prompt_tokens:210,completion_tokens:740}}),{status:200,headers:{"Content-Type":"application/json"}});
 };
 try{
  const res=await api.fetch(new Request("https://example.invalid/api/story",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({
   mode:"custom",worldKind:"adaptation",mediaType:"小說",curatedNovelId:"infinite-terror",
   world:"無限恐怖",task:"主神試煉",objective:"尋找同伴並完成首場生存任務",protagonist:"林燁",phase:0,sessionKey:"curated-test"
  })}));
  const result=await res.json();
  assert.equal(res.status,200,JSON.stringify(result));
  assert.equal(result.canon?.confidence,"curated");
  assert.equal(result.canon?.source,"Curated primary/bibliographic source");
  assert.ok(result.canon?.url.includes("wikipedia.org"));
  assert.ok(calls>=1);
 }finally{globalThis.fetch=oldFetch;if(oldKey===undefined)delete process.env.GROQ_API_KEY;else process.env.GROQ_API_KEY=oldKey}
});
test("curated catalog id cannot be reused to invent another official work",async()=>{
 const oldFetch=globalThis.fetch,oldKey=process.env.GROQ_API_KEY;
 process.env.GROQ_API_KEY="test_novels_key";globalThis.fetch=async()=>{throw Error("offline")};
 try{
 const res=await api.fetch(new Request("https://example.invalid/api/story",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({
  mode:"custom",worldKind:"adaptation",mediaType:"小說",world:"完全虛構的作品",task:"進場",
  curatedNovelId:"infinite-terror",phase:0
 })}));
 const result=await res.json();assert.equal(res.status,422,JSON.stringify(result));assert.equal(result.error,"CANON_UNVERIFIED")
 }finally{globalThis.fetch=oldFetch;if(oldKey===undefined)delete process.env.GROQ_API_KEY;else process.env.GROQ_API_KEY=oldKey}
});
