(function(global){
"use strict";
// E+ emotions: identify evidence in actual prose, never insert or modify story words.
// Canonical names intentionally avoid device/browser dependent emoji or CSS animations.
const patterns=[
 {name:"panic",rx:/快跑|逃命|来不及|來不及|救命|不要过来|不要過來|别过来|別過來|不许动|不許動|呼吸急促|喘不过气|喘不過氣|心跳失控|心脏狂跳|心臟狂跳|慌乱|慌亂|惊慌|驚慌|大叫|尖叫/g},
 {name:"anger",rx:/怒吼|暴怒|愤怒|憤怒|咆哮|吼道|怒道|滚出去|滾出去|滚开|滾開|怒火|青筋暴起|一拳砸|狠狠砸/g},
 {name:"fear",rx:/恐惧|恐懼|害怕|惊恐|驚恐|发抖|發抖|颤抖|顫抖|哆嗦|不敢回头|不敢回頭|不要回头|不要回頭|毛骨悚然|脊背发凉|脊背發涼|浑身冰冷|渾身冰冷/g},
 {name:"grief",rx:/死了|死去|死亡|失去呼吸|停止呼吸|断气|斷氣|再也醒不过来|再也醒不過來|眼泪|眼淚|泪水|淚水|悲痛|哭泣|哽咽|葬礼|葬禮|遗体|遺體/g},
 {name:"revelation",rx:/真相|谜底|謎底|原来如此|原來如此|终于明白|終於明白|突然明白|恍然大悟|关键线索|關鍵線索|这意味着|這意味著|竟然是|居然是|答案就在/g},
 {name:"shock",rx:/轰然|轟然|爆炸|枪声|槍聲|惊雷|驚雷|猛然炸开|猛然炸開|砰的一声|砰的一聲|血光|袭击|襲擊|警报|警報|警告|危机|危機|警笛/g},
 {name:"dread",rx:/低语|低語|耳边响起|耳邊響起|黑暗深处|黑暗深處|身后传来|身後傳來|诡异|詭異|不祥|死寂|寂静得|寂靜得|空无一人|空無一人|阴影|陰影/g},
 {name:"relief",rx:/终于安全|終於安全|松了口气|鬆了口氣|得救了|活下来了|活下來了|终于见到|終於見到|露出笑容|終於笑了/g}
];
const moods={shock:"shock",anger:"anger",grief:"grief",eerie:"dread",suspense:"dread",resolve:"relief"};
const known=new Set([...patterns.map(x=>x.name),"system"]);
function classify(raw,{mood="",hint="",type="narration",allowMood=false}={}){
 const text=String(raw||"");
 if(!text.trim())return null;
 // Short emphatic dialogue may carry a tagged emotion; ordinary dialog stays normal.
 const explicit=String(hint||"").trim().toLowerCase();
 if(known.has(explicit)&&explicit!=="system"){
   const matching=patterns.find(x=>x.name===explicit);
   const token=matching?.rx.exec(text)?.[0]||"";
   matching?.rx.lastIndex&&(matching.rx.lastIndex=0);
   return {name:explicit,token,source:"on-page-tag"};
 }
 if(type==="system")return {name:"system",token:"",source:"system"};
 for(const item of patterns){
   item.rx.lastIndex=0;
   const match=item.rx.exec(text);
   item.rx.lastIndex=0;
   if(match)return {name:item.name,token:match[0],source:"on-page"};
 }
 if(allowMood&&moods[mood]&&text.replace(/\s/g,"").length>=26)return {name:moods[mood],token:"",source:"scene-mood"};
 return null;
}
global.NW_EMOTION={classify};
})(window);
