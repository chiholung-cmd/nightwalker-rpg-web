import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {runInNewContext} from "node:vm";
const read=path=>readFileSync(new URL("../"+path,import.meta.url),"utf8");
function engine(){
 const context={window:{}};
 runInNewContext(read("emotionFx.js"),context);
 return context.window.NW_EMOTION;
}
test("actual emotional Chinese prose receives distinct expressive typography",()=>{
 const fx=engine();
 const samples=[
  ["害怕得浑身发抖，他几乎不敢回头。","fear"],
  ["别过来！快跑！已经来不及了！","panic"],
  ["他愤怒地咆哮：滚出去！","anger"],
  ["眼泪掉了下来。他知道她死了。","grief"],
  ["终于明白，原来如此，这一切都是骗局。","revelation"],
  ["砰的一声，远处突然传来枪声。","shock"],
  ["黑暗深处传来低语，走廊里空无一人。","dread"],
  ["她终于安全了，松了口气。","relief"]
 ];
 for(const [prose,want] of samples){
  const result=fx.classify(prose);
  assert.equal(result?.name,want,prose);
  assert.ok(prose.includes(result.token),prose);
 }
});
test("ordinary prose does not get decorative fake drama",()=>{
 const fx=engine();
 assert.equal(fx.classify("桌上放著半碗飯。少年拿起鑰匙，走向門口。"),null);
 assert.equal(fx.classify(""),null);
 const opt=fx.classify("房间里传来风声。",{mood:"eerie",allowMood:true});
 assert.equal(opt,null); // short normal sentences aren't tagged only for their mood
});
test("scene mood and model emotion labels work for on-page story only",()=>{
 const fx=engine();
 const mood=fx.classify("長長的走廊裡並沒有任何人回答他，盡頭那扇門卻又慢慢打開了。",{mood:"eerie",allowMood:true});
 assert.equal(mood?.name,"dread");
 assert.equal(mood?.source,"scene-mood");
 const tag=fx.classify("「我絕不會答應。」",{type:"dialogue",hint:"anger"});
 assert.equal(tag?.name,"anger");
 assert.equal(tag?.source,"on-page-tag");
 assert.equal(fx.classify("同意。",{hint:"not-validated"}),null);
});
test("emotion is presentation only; never changes prose, stage or save text",()=>{
 const app=read("app.js"),fx=read("emotionFx.js");
 assert.match(app,/window\.NW_EMOTION\?\.classify/);
 assert.match(app,/class="emotion-focus"/);
 assert.match(app,/esc\(raw\.slice\(0,at\)\)/);
 assert.match(app,/esc\(raw\.slice\(at\+token\.length\)\)/);
 assert.match(app,/emotionalBeats<8/);
 assert.doesNotMatch(fx,/\.innerHTML\s*=/);
 assert.doesNotMatch(fx,/\.mission\s*=/);
});
test("strong mode restores emotional motion beyond generic paragraph fading",()=>{
 const css=read("style.css"),html=read("index.html"),api=read("api/story.mjs");
 for(const [cls,keyframe] of [
   ["emotion-fear","nwEmotionFear"],
   ["emotion-panic","nwEmotionPanic"],
   ["emotion-anger","nwEmotionRage"],
   ["emotion-grief","nwEmotionGrief"],
   ["emotion-revelation","nwEmotionTruth"],
   ["emotion-shock","nwEmotionShock"],
   ["emotion-dread","nwEmotionDread"],
   ["emotion-relief","nwEmotionRelease"]
 ]){
   assert.ok(css.includes(".fx-revealed."+cls),cls);
   assert.ok(css.includes("@keyframes "+keyframe),keyframe);
 }
 assert.match(css,/nwEmotionWordTremble/);
 assert.match(css,/nwEmotionWordDissolve/);
 assert.match(css,/nwEmotionWordIlluminate/);
 assert.match(css,/prefers-reduced-motion:reduce/);
 assert.ok(html.indexOf("emotionFx.js")<html.indexOf("app.js"));
 assert.match(api,/emotion:\["fear"/);
});
