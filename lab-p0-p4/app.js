(function(){
"use strict";
const D=window.NW_DATA,E=window.NW_ENGINE,N=window.NW_STORY,R=document.getElementById("app");
if(!D||!E){R.textContent="主神資料讀取失敗：請重新整理。";return}
let s=E.load();if(s.mission&&!s.mission.finished)s.mission.narrativeMode=true;let temporary={panel:"",notice:"",noticeTimer:0,filter:"all",warehouseMode:"storage",profileTab:"overview",gearSlot:"",activePage:0,skillPage:"all",memoryTab:"timeline",showItems:false,showLog:false,showSkills:false,showStatus:false,showTask:false,upgradeCategory:"",upgradeSub:"",aiConfigured:false,aiChecked:false,aiChecking:false,aiStatus:"unchecked",aiPending:false,aiError:"",aiRetryTimer:0,aiRetryKey:"",aiAutoAttempts:0,aiDelayUntil:0,aiUsage:null,aiRewriteAttempts:{},rewriteDialog:false,rewriteNote:"",codexOpen:false,codexTab:"character",draftScope:"",openingDraft:"",leaveDialog:false,freeDraft:"",freeReview:null,choicesOpen:false,worldMatches:[],worldLookupQuery:"",worldLookupMedia:"",worldLookupPending:false,worldLookupError:"",worldInput:"",worldType:"adaptation",worldMedia:"電影",mediaWorldDraft:"",originalWorldDraft:"",originalPremiseDraft:"",fxSeen:"",fxSkippedFor:"",fxPerform:"static",fxSceneKey:""};
temporary.originalPremiseDraft=window.NW_DRAFTS?.get?.("premise","new-world")||temporary.originalPremiseDraft;
temporary.openingDraft=window.NW_DRAFTS?.get?.("opening","next-world")||"";
temporary.rewriteNote=window.NW_DRAFTS?.get?.("rewrite","chapter")||"";
const esc=v=>String(v??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const q=v=>"'"+esc(v)+"'";
const num=n=>Number(n||0).toLocaleString("en-US");
const tag=(txt,type="")=>'<span class="chip '+type+'">'+esc(txt)+'</span>';
const a=(label,cmd,cls="",props="")=>'<button class="btn '+cls+'" data-do="'+esc(cmd)+'" '+props+'>'+label+'</button>';
const objId=id=>D.items.find(x=>x.id===id);
const skill=id=>D.skills.find(x=>x.id===id);
const world=id=>D.worlds.find(x=>x.id===id);
const task=id=>D.tasks.find(x=>x.id===id);
const playerName=()=>String(s.profile?.name||"").trim()&&String(s.profile.name).trim()!=="夜行者"&&(s.profile.nameCustomized||!Object.prototype.hasOwnProperty.call(s.profile,"nameCustomized"))?String(s.profile.name).trim():(s.profile?.nameCustomized?String(s.profile.name||"").trim():"");
const literaryName=()=>playerName()||"主角";
const icon={hub:"◎",profile:"◈",warehouse:"▥",loadout:"⚒",upgrade:"✧",portal:"◌",memory:"▤",settings:"⚙"};
function aiSceneKey(m){return m?.seed+"-"+m?.world+"-"+m?.phase}
function aiStatusText(){
 if(temporary.aiChecking)return "正在檢查";
 if(!temporary.aiChecked)return "等待檢查";
 if(temporary.aiConfigured)return "API 已認證";
 return temporary.aiStatus==="provider_rate_limit"?"Groq 免費額度暫時限速，可稍後重試":temporary.aiStatus==="network_or_timeout"?"網絡逾時，可重新檢查":temporary.aiStatus==="unauthorized"?"API Key 驗證失敗":temporary.aiStatus==="model_not_found"?"AI 模型不可用":"暫未連接，可重新檢查";
}
async function checkAiStatus(force=false){
 if(temporary.aiChecking)return false;
 if(temporary.aiChecked&&!force)return temporary.aiConfigured;
 temporary.aiChecking=true;render();
 try{
  const res=await fetch("/api/story?probe=1",{cache:"no-store"});
  const info=await res.json();
  temporary.aiStatus=String(info.status||"unknown");
  temporary.aiConfigured=!!(res.ok&&info.ok&&info.configured);
  temporary.groqStatus=(info.message||info.status||"Groq 回應未知")+(info.model?"（模型："+info.model+"）":"")+(info.cached?" · 快取結果":"");
 }catch(e){
  temporary.aiConfigured=false;temporary.aiStatus="network_or_timeout";
  temporary.groqStatus="無法連接 Nightwalker AI 接口，請稍後重新檢查";
 }finally{
  temporary.aiChecked=true;temporary.aiChecking=false;
  if(temporary.aiConfigured){
   temporary.aiFailedKey="";
   if(s.mission&&!s.mission.finished)s.mission.director=true;
  }
  render();
 }
 return temporary.aiConfigured;
}
async function generateAiScene(force){
const m=s.mission;if(!m||m.finished||!temporary.aiConfigured)return;
const phase=m.phase,key=aiSceneKey(m);
if(temporary.aiRetryKey!==key){clearTimeout(temporary.aiRetryTimer);temporary.aiRetryTimer=0;temporary.aiRetryKey=key;temporary.aiAutoAttempts=0;temporary.aiDelayUntil=0}
if(temporary.aiDelayUntil>Date.now())return;
if(!force&&m.aiScenes?.[phase])return;
const rewritingExisting=!!m.aiScenes?.[phase];
if(temporary.aiPending)return;
if(!force&&temporary.aiFailedKey===key)return;
temporary.aiPending=true;temporary.aiKey=key;temporary.aiError="";render();
const known=window.NW_NOVEL?.scene(s);
const scene=N.get(s);const directorBrief=window.NW_WORLD?.directorContext?.(s)||null;
const storyBible=window.NW_BIBLE?.context?.(s)||null;
const endingAudit=m.phase>=19?(window.NW_BIBLE?.endingAudit?.(s)||null):null;
const narrativeCapabilities={skills:(s.learned||[]).slice(0,20).map(id=>({id,name:skill(id)?.name||id})),
 items:Array.from(new Set([...(s.loadout?.backpack||[]),...(s.loadout?.weapon?[s.loadout.weapon]:[]),...(s.loadout?.accessory?[s.loadout.accessory]:[])])).slice(0,15).map(id=>({id,name:objId(id)?.name||id})),
 bloodline:s.profile?.bloodline||""};
m.narrativeCapabilities=narrativeCapabilities;
const body={openingIntent:m.openingIntent||"",recentAction:String(m.pendingAction?.text||"").slice(0,1500),narrativeCapabilities,rewriteFeedback:temporary.aiRewriteAttempts[key]?String(temporary.rewriteNote||"").slice(0,240):"",rewriteAttempt:Number(temporary.aiRewriteAttempts[key]||0),directorBrief,storyBible,endingAudit,verifiedSource:m.verifiedSource||"",verifiedSourceTitle:m.verifiedSourceTitle||"",canonTimeline:(m.canonTimeline||[]).slice(0,6),protagonist:literaryName().slice(0,30),sessionKey:String(m.seed||""),directorStage:phase<5?"調查":phase<10?"人際":phase<16?"危機":phase<23?"決戰":"結局",npcMemory:m.npcMemory||{},worldFacts:m.storyFacts||[],worldHistory:(m.worldHistory||[]).slice(-2),priorArc:m.missionArc||[],sideQuests:m.quests||[],npcAgency:(m.agencyEvents||[]).slice(-4),branchConsequences:(m.branchConsequences||[]).slice(-4),returnVisit:!!m.returnVisit,canonCache:m.canon?{...m.canon,extract:String(m.canon.extract||"").slice(0,phase===0?1250:650)}:null,mode:m.world==="custom"?"custom":"known",worldKind:m.worldKind||"adaptation",mediaType:m.mediaType||"",premise:m.premise||"",world:m.worldName,task:m.title,objective:m.objective,phase,cast:[...(m.crew||[]).map(x=>x.name),...(m.rival?[m.rival.name]:[])],flags:(m.flags||[]).slice(-16),history:(m.history||[]).slice(-4).map(x=>String(x.action||"").slice(0,350)+" → "+String(x.events?.[0]||"").slice(0,65)),previousScenes:Object.keys(m.aiScenes||{}).map(Number).filter(i=>i<phase).sort((x,y)=>x-y).slice(-1).flatMap(i=>(m.aiScenes[i]?.blocks||[]).slice(-2).map(b=>({type:b.type,speaker:b.speaker||"",text:String(b.text||"").slice(0,220)}))),base:(phase===0?(known?.blocks||[]).slice(0,2):[]).map(b=>({type:b.type,speaker:b.speaker||"",text:String(b.text||"").slice(0,170)})),choices:(scene?.actions||[]).slice(0,3).map(x=>({label:x.label,kind:x.kind})),state:{mode:"story",noNumericStats:true}};
try{
 const res=await fetch("/api/story",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(body)});
 const obj=await res.json();if(!res.ok){const error=new Error(obj.message||obj.error||"AI 劇情暫時無法載入");error.code=obj.error||"";error.httpStatus=res.status;error.retryAfter=Number(obj.retryAfter)||0;throw error}
 if(!Array.isArray(obj.blocks)||obj.blocks.filter(b=>b?.type==="narration").reduce((n,b)=>n+String(b.text||"").replace(/\s/g,"").length,0)<100)throw Error("AI 劇情正文不完整");
 if(s.mission===m&&m.phase===phase&&!m.finished){
 temporary.aiDelayUntil=0;clearTimeout(temporary.aiRetryTimer);temporary.aiRetryTimer=0;temporary.aiUsage={model:obj.model||"",...(obj.usage||{}),remainingTokens:obj.quota?.remainingTokens??null};s.aiLastUsage={...temporary.aiUsage,at:Date.now()};
 m.aiScenes ||= {};m.aiOptions ||= {};
 m.aiScenes[phase]={title:obj.title,mood:obj.mood,blocks:obj.blocks,mode:({solo:"獨行篇",team:"同行篇",versus:"對峙篇"}[m.mode]||"輪迴篇"),resolution:obj.resolution||{readyToConclude:false},quality:obj.quality||null};if(Array.isArray(obj.options)&&obj.options.length===3)m.aiOptions[phase]=obj.options;if(Array.isArray(obj.missionArc)&&obj.missionArc.length>=3&&!m.missionArc?.length)m.missionArc=obj.missionArc.slice(0,4);
if(rewritingExisting){temporary.fxSeen="";temporary.fxSkippedFor="";}
if(!rewritingExisting){
window.NW_WORLD?.ingest?.(s,obj,phase);
window.NW_WORLD?.recordChapter?.(s,obj,phase);
window.NW_BIBLE?.ingest?.(s,obj,phase);
window.NW_WORLD?.mergeNpcUpdates?.(s,obj.npcUpdates,phase);
m.storyFacts=Array.from(new Set([...(m.storyFacts||[]),...(obj.facts||[]).filter(t=>typeof t==="string"&&t.length<170)])).slice(-70);
if(obj.canon?.url&&obj.canon.confidence!=="unverified")m.canon=obj.canon;
if(Array.isArray(obj.canonTimeline)&&obj.canonTimeline.length)m.canonTimeline=obj.canonTimeline.slice(0,6);
s.worldLibrary ||= {};
const wkey=window.NW_WORLD?.key?.(m)||(m.worldKind==="original"?"original:":"adaptation:")+(m.worldName||m.world);
const saved=s.worldLibrary[wkey]||{name:m.worldName,worldKind:m.worldKind||"catalog",visits:0,npcs:{},facts:[],chapters:[],source:null};
saved.npcs={...saved.npcs,...m.npcMemory};saved.facts=Array.from(new Set([...(saved.facts||[]),...(m.storyFacts||[])])).slice(-90);
if(m.canon)saved.source=m.canon;
s.worldLibrary[wkey]=saved;
}
 temporary.aiError="";temporary.aiFailedKey="";persist();
 }
}catch(e){if(s.mission===m&&m.phase===phase){
 const limited=e.httpStatus===429||e.code==="GROQ_RATE_LIMIT";
 const incomplete=["SCENE_INCOMPLETE","INVALID_AI_JSON","CHOICES_INCOMPLETE"].includes(e.code);
 const delay=limited?Math.max(3,Math.ceil(e.retryAfter||30)):incomplete?9:e.code==="AI_TIMEOUT"?6:0;
 temporary.aiDelayUntil=delay?Date.now()+delay*1000:0;
 temporary.aiError=String(e.message||e).slice(0,135)+(delay?"（"+delay+"秒後可再試）":"");
 temporary.aiFailedKey=key;
 if(delay&&delay<=120&&temporary.aiAutoAttempts<(incomplete?1:2)){
  temporary.aiAutoAttempts++;
  clearTimeout(temporary.aiRetryTimer);
  temporary.aiRetryTimer=setTimeout(()=>{
   temporary.aiRetryTimer=0;
   if(s.mission===m&&m.phase===phase&&!m.finished&&!m.aiScenes?.[phase]){
    temporary.aiFailedKey="";
    temporary.aiDelayUntil=0;
    generateAiScene(true);
   }
  },delay*1000+800);
 }
}}
finally{temporary.aiPending=false;temporary.aiKey="";render()}
}
function scheduleAiScene(){
const m=s.mission;if(!m||m.finished||!temporary.aiChecked||!temporary.aiConfigured)return;
if(m.aiScenes?.[m.phase])return;
const key=aiSceneKey(m);
if(temporary.aiPending||temporary.aiFailedKey===key)return;
Promise.resolve().then(()=>generateAiScene(false))
}
function persist(){E.save(s);window.NW_CLOUD?.schedule?.(()=>s)}
function notice(text){temporary.notice=text;render();clearTimeout(temporary.noticeTimer);temporary.noticeTimer=setTimeout(()=>{temporary.notice="";render()},3300)}
function go(screen){s.screen=screen;temporary.panel="";temporary.showItems=false;persist();render()}
function bar(label,value,max,color){let pct=Math.max(0,Math.min(100,100*(value||0)/max));return '<div class="gauge"><div class="gauge-meta"><span>'+label+'</span><b>'+Math.round(value||0)+'<em> / '+max+'</em></b></div><div class="gauge-track"><span style="width:'+pct+'%;background:'+color+'"></span></div></div>'}
function section(kicker,title,text=""){return '<div class="headings"><div class="eyebrow">'+esc(kicker)+'</div><h1>'+title+'</h1>'+(text?'<p>'+text+'</p>':"")+'</div>'}
function piece(title,desc="",right=""){return '<div class="piece"><div><b>'+title+'</b>'+(desc?'<small>'+desc+'</small>':"")+'</div>'+right+'</div>'}
function divLine(){return '<div class="rule"></div>'}
function header(){
 return '<header class="mast library-mast"><button class="wordmark" data-do="nav:hub"><span>NIGHTWALKER</span><em>∞</em><small>故事書架 / STORY LIBRARY</small></button>'+
 '<div class="mast-user literary-mast-user"><strong>'+esc(playerName()||"尚未命名主角")+'</strong><small>每個故事，都是另一段命運</small></div></header>'
}
function foot(){const nav=[["hub","書架"],["portal","新故事"],["memory","經歷"],["settings","設定"]];return '<nav class="bottom-nav book-nav">'+nav.map(([id,name])=>'<button class="'+(s.screen===id?"on":"")+'" data-do="nav:'+id+'"><span>'+icon[id]+'</span><small>'+name+'</small></button>').join("")+'</nav>'}
function pillRow(){let p=s.profile;return '<div class="vitals">'+bar("HP",p.hp,100,"#d8a2aa")+bar("STA",p.sta,100,"#dec993")+bar("MP",p.mp,60,"#93bbd9")+bar("SAN",p.san,100,"#b8a3d7")+'</div>'}
function hub(){
 const saved=s.mission&&!s.mission.finished;
 const recent=s.abandonedStories?.[0];
 return '<section class="library-home"><div class="library-kicker">NIGHTWALKER · 無限流小說</div><h1>命運，<br>由下一個決定開始。</h1><p class="library-desc">不是一場計分的冒險，而是一段會記住人物、選擇和代價的故事。</p><div class="library-hero-action">'+
 (saved?a("繼續閱讀《"+esc(s.mission.worldName)+"》","nav:mission","block main")+a("放下這個故事 · 開始新故事","leaveStory","block ghost"):a("開始一個新故事","nav:portal","block main"))+
 '</div><div class="library-shelf"><h2>你的經歷</h2><p>'+(recent?'上次離開《'+esc(recent.worldName||"未知世界")+'》 · 第 '+esc(recent.chapter)+' 章':'故事尚未開始。你可以揀一部作品進入其中，或者建立自己的世界。')+'</p>'+a("打開故事紀錄","nav:memory","small ghost")+'</div></section>'
}
function profile(){
 const m=s.mission||{phase:0,history:[],crew:[],npcMemory:{},storyBible:{characters:{}}};
 return section("CHARACTER DOSSIER","人物與世界","主角、已學技能、武器、物品與 NPC 都會留在故事之中，直接影響可用行動。")+
 '<div class="scroll-content story-codex-page">'+(window.NW_CODEX?.render?.(s,m,temporary.codexTab,{page:true})||"")+
 a(s.mission?"返回故事":"返回主神空間",s.mission?"nav:mission":"nav:portal","block ghost")+'</div>'
}
function statCard(title,value){return '<div class="card little"><div class="eyebrow">'+esc(title)+'</div><strong class="big-number">'+value+'</strong></div>'}
function card(title,body,cl=""){return '<div class="card '+cl+'"><div class="card-heading">'+title+'</div><div class="card-body">'+body+'</div></div>'}
function warehouse(){const mode=temporary.warehouseMode,filter=temporary.filter;const tabs=[["storage","永久倉庫"],["shop","主神商店"]];let catalog=mode==="storage"?D.items.filter(x=>(s.warehouse[x.id]||0)>0):D.shop.map(([id,price])=>({...objId(id),price})),items=catalog.filter(x=>filter==="all"||x.type===filter);
let listing=items.length?items.map(it=>{const stock=s.warehouse[it.id]||0;
let actions=mode==="shop"?a("兌換 "+it.price+" 積分","buy:"+it.id,"small prime"):it.type==="consumable"||it.type==="tool"?a("放入行囊","pack:"+it.id,"small",""):(["weapon","armor","accessory"].includes(it.type)?a("配置裝備","nav:loadout","small"):"");
return '<div class="inventory-row"><div class="item-symbol">'+({weapon:"⚔",armor:"◈",accessory:"◇",consumable:"✚",tool:"▧"}[it.type]||"■")+'</div><div class="inventory-details"><b>'+esc(it.name)+'</b><small>'+esc(it.grade)+' · '+it.weight+' 負重 · '+(mode==="shop"?"商店：":"倉庫：")+num(mode==="shop"?it.price:stock)+'</small><p>'+esc(it.desc)+'</p></div><div>'+actions+'</div></div>'}).join(""):'<p class="empty">此分類沒有物品。</p>';
return section("MAIN GOD WAREHOUSE","主神倉庫","倉庫永久保存戰利品；進入世界前必須決定要帶走甚麼。")+'<div class="tabbar">'+tabs.map(x=>'<button class="'+(mode===x[0]?"on":"")+'" data-do="warehouse:'+x[0]+'">'+x[1]+'</button>').join("")+'</div><div class="filters">'+[["all","全部"],["weapon","武器"],["armor","防具"],["accessory","飾品"],["consumable","補給"],["tool","道具"]].map(x=>'<button class="'+(filter===x[0]?"on":"")+'" data-do="filter:'+x[0]+'">'+x[1]+'</button>').join("")+'</div><div class="stock-overview"><b>已儲存 '+Object.values(s.warehouse).reduce((a,b)=>a+b,0)+' 件物資</b><span>戰前負重 '+E.weight(s)+' / '+E.capacity(s)+'</span></div><div class="scroll-content">'+listing+'</div>'}
function loadout(){let load=s.loadout,p=s.profile,gear=[["weapon","主武器"],["offhand","副武器"],["armor","防具"],["accessory","飾品"]];let slotChoices="";
if(temporary.gearSlot){let slot=temporary.gearSlot,kind=slot==="offhand"?"weapon":slot;slotChoices='<div class="card highlighted"><div class="card-heading">選擇'+gear.find(x=>x[0]===slot)[1]+'</div>'+a("卸下此欄","equip:"+slot+":none","small ghost")+'<div class="option-list">'+D.items.filter(x=>x.type===kind&&(s.warehouse[x.id]||0)>0).map(x=>'<button data-do="equip:'+slot+":"+x.id+'"><b>'+esc(x.name)+'</b><small>'+esc(x.desc)+'</small><small>'+E.tierOK(s,x).join(" · ")+'</small></button>').join("")+'</div></div>'}
let weap=gear.map(([slot,label])=>'<button class="equip-slot" data-do="slot:'+slot+'"><span>'+label+'</span><b>'+esc(objId(load[slot])?.name||"空")+'</b><small>'+ (load[slot]?"更換 ›":"選擇 ›")+'</small></button>').join("");
let currentSkills=load.active.map((id,i)=>'<div class="skill-slot"><div><strong>0'+(i+1)+'　'+esc(skill(id)?.name||id)+'</strong><small>STA '+(skill(id)?.sta||0)+' · MP '+(skill(id)?.mp||0)+' · CD '+(skill(id)?.cooldown||0)+'</small></div>'+a("卸下","skill:"+id,"small ghost")+'</div>').join("");
let available=D.skills.filter(sk=>s.learned.includes(sk.id)&&sk.active&&!load.active.includes(sk.id));
let passive=load.passive.map(id=>tag(skill(id)?.name||id,"gold")).join(" ");
let passiveMore=D.skills.filter(sk=>s.learned.includes(sk.id)&&!sk.active).map(sk=>'<button class="button-row" data-do="skill:'+sk.id+'">'+esc(sk.name)+'<span>'+(load.passive.includes(sk.id)?"卸下 −":"配置 +")+'</span></button>').join("");
let options=available.length?available.map(sk=>'<button class="button-row" data-do="skill:'+sk.id+'">'+esc(sk.name)+'<span>加入招式欄 +</span></button>').join(""):"所有已習得的主動技能都已配置。";
let bag=load.backpack.map((id,i)=>'<div class="bag-entry"><span>'+esc(objId(id)?.name||id)+'</span>'+a("移除","unpack:"+i,"small ghost")+'</div>').join("");
return section("DEPLOYMENT LOADOUT","輪迴戰前配置","只有此處選定嘅武器、技能及物品，可以攜帶進入輪迴世界。")+'<div class="scroll-content column-gap">'+card("出戰限制",'<div class="load-limits"><div><b>'+E.weight(s)+' / '+E.capacity(s)+'</b><small>負重上限</small></div><div><b>'+load.backpack.length+' / '+E.maxBag(s)+'</b><small>背包格數</small></div><div><b>'+load.active.length+' / 6</b><small>主動技能欄</small></div></div>')+
card("裝備欄",'<div class="gear-grid">'+weap+'</div>')+slotChoices+
card("主動招式（最多 6）",'<div class="skill-slots">'+currentSkills+'</div><div class="card-subhead">可加入的技能</div>'+options)+
card("被動能力（最多 3）",(passive||"未配置被動技能")+'<div class="card-subhead">可用被動技能</div>'+passiveMore)+card("已攜帶行囊",'<div class="bag-list">'+(bag||'<div class="empty">背包尚未放入任何物品。</div>')+'</div>'+a("到倉庫添加物品","nav:warehouse","small"))+
a("確認配置／進入輪迴準備","nav:portal","block main")+'</div>'}
const UPGRADE_CATEGORIES=[
{id:"attr",title:"身體特質",subtitle:"五維屬性與衍生強化",branches:[["力量","strength"],["敏捷","agility"],["體魄","body"],["感知","sense"],["意志","will"]]},
{id:"skill",title:"技能學習",subtitle:"戰鬥、偵查、輔助、術式及被動技能",branches:[["近戰戰鬥","近戰"],["遠程戰鬥","遠程"],["身法與潛行","身法"],["生存與探索","探索"],["情報與交涉","調查"],["醫療支援","醫療"],["防護與抗性","防護"],["精神與術式","術式"],["呼吸與武學","呼吸法"],["常駐被動","被動"]]},
{id:"blood",title:"血脈覺醒",subtitle:"獸系、靈異、元素、禁忌",branches:[["獸系血脈","獸系"],["靈異血脈","靈異系"],["元素血脈","元素系"],["禁忌血脈","禁忌系"]]},
{id:"power",title:"異能／精神",subtitle:"感知、控制、防護、干涉",branches:[["超感知","感知系"],["意念控制","控制系"],["精神防護","防護系"],["因果干涉","干涉系"]]},
{id:"equipment",title:"裝備強化",subtitle:"武器、防具、飾品、消耗品與材料",branches:[["近戰武器","weapon"],["遠程武器","ranged"],["防具","armor"],["飾品","accessory"],["消耗品","consumable"],["特殊道具","tool"]]},
{id:"companion",title:"夥伴契約",subtitle:"偵查、戰鬥、輔助、精神類",branches:[["偵查型","scout"],["戰鬥型","fighter"],["輔助型","support"],["精神型","spirit"]]},
{id:"healing",title:"治療恢復",subtitle:"生命、體力、靈力、污染與血脈穩定",branches:[["身體傷勢","hp"],["體力恢復","sta"],["靈力恢復","mp"],["精神污染","san"],["血脈穩定","blood"]]}
];
const UPGRADE_ATTR={strength:"str",agility:"agi",body:"con",sense:"per",will:"wil"};
const BLOODLINE_GROUP={wolf:"獸系",sight:"靈異系",ember:"元素系",blank:"禁忌系"};
function upgrade(){
const c=UPGRADE_CATEGORIES.find(x=>x.id===temporary.upgradeCategory),sub=temporary.upgradeSub,p=s.profile;
const head=section("REINFORCEMENT NETWORK","主神強化","大類 → 子類 → 具體強化。只有真正已實裝的能力可兌換，其餘僅作流派規劃，不扣積分。");
if(!c)return head+'<div class="scroll-content column-gap">'+UPGRADE_CATEGORIES.map(x=>'<button class="upgrade-category" data-do="upcat:'+x.id+'"><div><b>'+esc(x.title)+'</b><small>'+esc(x.subtitle)+'</small></div><span>›</span></button>').join("")+'</div>';
const menu='<div class="upgrade-breadcrumb">'+a("全部強化","upback:root","tiny ghost")+'<span> / '+esc(c.title)+(sub?" / "+esc(c.branches.find(x=>x[1]===sub)?.[0]||sub):"")+'</span></div>';
if(!sub)return head+menu+'<div class="scroll-content column-gap">'+c.branches.map(([title,id])=>'<button class="upgrade-category" data-do="upsub:'+id+'"><div><b>'+esc(title)+'</b><small>'+esc(c.subtitle)+'</small></div><span>›</span></button>').join("")+'</div>';
let content="",label=c.branches.find(x=>x[1]===sub)?.[0]||sub;
if(c.id==="attr"){const id=UPGRADE_ATTR[sub],name=D.attributes.find(x=>x[0]===id)?.[1];if(id){const cost=80+(p.attrs[id]-6)*30;content=card(name,piece("當前 "+p.attrs[id]+" → "+(p.attrs[id]+1),"提升能力，可能解鎖更多武器與招式",a("+1　"+cost+" 積分","boost:"+id,"small prime")));}}
if(c.id==="skill"){const found=D.skills.filter(x=>x.school===sub);content=found.length?found.map(sk=>{const learned=s.learned.includes(sk.id),price=D.skillPrices[sk.id]||0,locks=E.tierOK(s,sk);return card(esc(sk.name),'<p>'+esc(sk.desc)+'</p><div class="minor-meta">Lv.'+sk.tier+' · '+(sk.active?"主動技能":"被動技能")+' · STA '+(sk.sta||0)+' / MP '+(sk.mp||0)+' · CD '+(sk.cooldown||0)+'</div>'+(learned?tag("已習得","gold"):price?a(locks.length?"條件未達："+esc(locks.join("、")):"兌換 "+price+" 積分","learn:"+sk.id,"small "+(locks.length?"ghost":"prime"),locks.length?"disabled":""):tag("初始技能")))}).join(""):card(label,"流派分類已建立；尚未加入具實際效果的技能，暫時不能兌換");}
if(c.id==="blood"){const found=D.bloodlines.filter(x=>BLOODLINE_GROUP[x.id]===sub);content=found.length?found.map(b=>{const locks=[];if(p.level<b.tier)locks.push("Lv."+b.tier);if(p.missions<b.missions)locks.push("輪迴 "+b.missions+" 次");for(const k in b.requires)if((p.attrs[k]||0)<b.requires[k])locks.push(k+"≥"+b.requires[k]);let owned=p.bloodline===b.id,unavailable=!!p.bloodline||locks.length;return card(esc(b.name),'<p>'+esc(b.effect)+'</p><p class="negative-note">代價：'+esc(b.drawback)+'</p><div class="minor-meta">'+(locks.join(" / ")||"基礎條件符合")+'</div>'+a(owned?"已覺醒":unavailable?"尚未解鎖":"覺醒 "+b.cost+" 積分","blood:"+b.id,"small "+(unavailable?"ghost":"prime"),unavailable?"disabled":""))}).join(""):card(label,"尚未開放");}
if(c.id==="equipment"){const goods=D.shop.map(([id,cost])=>({...objId(id),cost})).filter(x=>sub==="ranged"?(x.tags||[]).includes("遠程"):sub==="weapon"?x.type==="weapon"&&!(x.tags||[]).includes("遠程"):x.type===sub);content=goods.length?goods.map(x=>card(esc(x.name),'<p>'+esc(x.desc)+'</p><p>主神積分：'+x.cost+'</p>'+a("前往商店","nav:warehouse","small prime"))).join(""):card(label,"暫未上架此類道具");}
if(c.id==="healing")content=card(label,sub==="hp"||sub==="sta"||sub==="mp"||sub==="san"?"輪迴結算後會免費回滿四項資源；世界內可以通過消耗品或技能恢復。":"血脈穩定專項仍在設計中；目前無可購買的效果。")+a("前往倉庫補給","nav:warehouse","block ghost");
if(c.id==="power"||c.id==="companion")content=card(label,"此系統已細分好類別，尚未有可驗證、可兌換的能力。後續加入時會遵守技能門檻、消耗、冷卻及作用效果。");
return head+menu+'<div class="scroll-content column-gap">'+content+'</div>'
}
function missionBoard(){if(s.mission)return missionUI();
let banner=s.assignment?(()=>{let t=s.assignment.world==="custom"?{name:s.assignment.worldKind==="original"?"自創世界·主神試煉":"作品世界·主神試煉",mode:"solo",goal:"探索「"+s.assignment.worldTitle+"」並完成主神委派的目標",desc:s.assignment.worldKind==="original"?"原創世界構築":"AI 作品世界"}:task(s.assignment.task),w=s.assignment.world==="custom"?{name:s.assignment.worldTitle,tone:"AI 創作世界"}:world(t.world);return '<div class="assigned"><div class="eyebrow">MAIN GOD / ASSIGNED SCENARIO</div><span class="mode-label">'+({solo:"單人任務",team:"團隊任務",versus:"對抗任務"}[t.mode])+'</span><h2>'+esc(t.name)+'</h2><p>《'+w.name+'》 · '+esc(w.tone)+'</p><div class="rule"></div><h3>主線目標</h3><p>'+esc(t.goal)+'</p><div class="assigned-desc">'+esc(t.desc)+'</div><small>隱藏任務：尚未公開。世界及模式已鎖定，無法免費重抽。</small></div>'})():'<div class="unassigned"><div class="main-god-eye">◌</div><div class="eyebrow">DESTINY LOCKED / UNKNOWN</div><h2>主神尚未公布你的下一個世界</h2><p>可能進入電影、動畫或劇集世界。每次任務可為單人、合作小隊或對抗任務，主神將決定你的入場位置與身份。</p></div>';
const protagonistSetup='<div class="identity-entry"><label for="protagonist-name">主角姓名 · 自由設定</label><div class="identity-entry-row"><input id="protagonist-name" maxlength="20" placeholder="由你命名，唔再叫夜行者" value="'+esc(temporary.nameDraft??playerName())+'">'+a("保存姓名","saveName","small main")+'</div><small>Nightwalker 只係遊戲名稱；已有劇情同存檔會繼續保留。</small></div>';
let stages=s.assignment?card("主神空間 · 進入世界之前",
 '<h2>《'+esc(s.assignment.worldTitle||world(s.assignment.world)?.name||"未知作品")+'》</h2>'+
 '<p class="minor-meta">主角會帶住已學技能、武器同已有經歷進入世界；新故事會由主神空間同入場前嘅人物互動慢慢展開，而唔係一開始就結束事件。</p>'+
 '<div class="world-mode-choice"><p>進入世界嘅方式</p>'+
 '<button data-do="entryMode:solo" class="'+(s.assignment.mode==="team"?"":"chosen")+'">單獨進入</button>'+
 '<button data-do="entryMode:team" class="'+(s.assignment.mode==="team"?"chosen":"")+'">與輪迴者同行</button></div>'+
 '<label class="world-input-label" for="opening-intent">入場前主角想做甚麼？（可選，會自動儲存）</label>'+
 '<textarea id="opening-intent" class="world-premise-input" rows="4" maxlength="1200" placeholder="例如：先同林霧討論任務，再檢查加固鐵棍；傳送時盡量觀察隊友有冇可疑舉動……">'+esc(temporary.openingDraft||"")+'</textarea>'+
 a("檢查角色、技能與武器","nav:profile","block ghost")+
 a("確認準備，進入序章","launch","block main")+a("取消呢個世界","leaveStory","block ghost")):
 a("由主神安排未知世界","assign","block ghost");
let customCard="";
if(!s.assignment){
 const original=temporary.worldType==="original";
 const media=["電影","劇集","動畫","小說","遊戲","其他作品"];
 const types='<div class="world-kind-tabs"><button class="'+(!original?"selected":"")+'" data-do="worldType:adaptation">作品世界<small>電影／劇集／動畫等</small></button><button class="'+(original?"selected":"")+'" data-do="worldType:original">自創世界<small>建立原創世界觀</small></button></div>';
 const status='<p class="minor-meta">AI 創作狀態：'+aiStatusText()+'。原作會先核對，再由你確認。</p>';
 const mediaVerify=temporary.worldLookupPending?'<div class="world-verify">正在核對原作資料，未扣積分……</div>':temporary.worldLookupError?'<div class="world-verify problem">'+esc(temporary.worldLookupError)+'</div>':temporary.worldMatches.length?'<div class="world-verify"><b>請確認正確作品及版本</b><p>發現可能嘅作品；唔會自行當成新世界生成。</p>'+temporary.worldMatches.map((x,i)=>'<button class="world-candidate" data-do="worldPick:'+i+'"><strong>《'+esc(x.title)+'》 · '+esc(x.mediaType)+'</strong><small>核對來源：'+esc(x.sourceTitle)+' · '+(x.confidence==="exact"?"作品名吻合":"可能係輸入錯字")+'</small><span>確認使用此作品 →</span></button>').join("")+'</div>':"";
 const mediaForm='<p>選擇現有電影、劇集、動畫、小說或遊戲嘅世界，由你親自加入故事。主神仍會發佈任務，唔會直接重演原作劇情。</p><div class="world-mediums">'+media.map(x=>'<button class="'+(temporary.worldMedia===x?"selected":"")+'" data-do="worldMedia:'+x+'">'+x+'</button>').join("")+'</div><label for="media-world-name" class="world-input-label">作品名稱</label><input id="media-world-name" class="custom-world-input" value="'+esc(temporary.mediaWorldDraft)+'" maxlength="50" placeholder="例如：死亡筆記、進擊的巨人" aria-label="作品世界名稱"><p class="minor-meta">作品名稱會先核對，確認作品及媒介版本後才開始。原作人物與設定會盡量維持，但衍生劇情並非官方內容。</p>';
 const originalForm='<p>完全由你構思世界。可以係規則怪談、末日、仙俠、懸疑或者任何原創背景；AI 會根據你嘅規則設計人物、危機同故事。</p><label for="original-world-name" class="world-input-label">原創世界名稱</label><input id="original-world-name" class="custom-world-input" value="'+esc(temporary.originalWorldDraft)+'" maxlength="50" placeholder="例如：零號月台、深海第七城" aria-label="原創世界名稱"><label for="original-world-premise" class="world-input-label">世界背景與核心規則</label><textarea id="original-world-premise" class="world-premise-input" maxlength="2000" rows="7" placeholder="例如：每晚十二點，失蹤者會收到一張沒有終點站的車票。車上有三條禁忌規則，每個人都在隱瞞自己的目的……" aria-label="原創世界背景與規則">'+esc(temporary.originalPremiseDraft)+'</textarea><p class="minor-meta">背景最少 12 字。AI 會以你提供嘅規則建立世界；開場唔理想亦可以退出重新開始。</p>';
 customCard=card("額外權限 · 自選世界",types+'<div class="world-form">'+(original?originalForm:mediaForm)+(!original?mediaVerify:"")+a(original?"建立原創故事":"核對作品名稱","customWorld","block main")+status+'</div>');
}
let returnLinks=false&&s.discovered.length?card("定向返回已去過的世界",s.discovered.map(id=>{let w=world(id),unlocked=s.coord[id];return '<div class="return-row"><div><b>'+esc(w?.name||id)+'</b><small>'+(unlocked?"座標已解鎖":"須先付費解鎖座標")+'</small></div>'+a("查看代價","coord:"+id,"small ghost")+'</div>'}).join("")):"";
return section("MAIN GOD / WORLD TRANSFER","主神空間","選擇世界、保留人物能力和過往關係；每次傳送都由你決定如何準備。")+'<div class="scroll-content column-gap">'+protagonistSetup+banner+stages+customCard+returnLinks+'</div>'}
function mood(i,worldId){if(worldId==="deathnote"&&i===5)return "grief";if(worldId==="alice"&&i===2)return "anger";if(worldId==="demon"&&i===0)return "system";return ["calm","suspense","eerie","dialogue","shock","resolve"][i%6]}

function missionStory(){return N.excerpt(s)}
function soundtrackMood(){
 if(s.screen!=="mission"||!s.mission||s.mission.finished)return "system";
 const m=s.mission;
 const scene=m.aiScenes?.[m.phase]||(m.director?null:window.NW_NOVEL?.scene?.(s));
 return scene?.mood||"suspense";
}
function musicControlText(){
 const live=window.NW_MUSIC?.status?.();
 return live?.enabled?"♫ 配樂：播放中":"♫ 開啟配樂";
}

function eplusMode(){
 if(s.settings?.reducedMotion||window.NW_EFFECTS?.reducedMotion?.())return "off";
 const mode=s.settings?.eplusMode;
 return mode==="standard"||mode==="off"||mode==="strong"?mode:"standard"
}
// Render archived AI scenes and authored offline scenes with the same third-person voice.
function literaryProse(value){
 const name=literaryName().slice(0,30);
 return String(value||"").split(/(「[^」]*」|“[^”]*”|《[^》]*》|『[^』]*』)/g)
  .map((part,i)=>i%2?part:part.replace(/你們的/g,name+"一行人的").replace(/你們/g,name+"一行人").replace(/你的/g,name+"的").replace(/你/g,name)).join("");
}
function prettyEffects(action){const parts=N.preview(action);return parts.length?'<div class="story-costs">'+parts.map(x=>'<span>'+esc(x)+'</span>').join("")+'</div>':""}

function missionUI(){
 const m=s.mission;
 if(m.finished)return resultUI();
 if(temporary.lastChoiceScene!==aiSceneKey(m)){temporary.lastChoiceScene=aiSceneKey(m);temporary.choicesOpen=false;}
 const currentScope=window.NW_DRAFTS?.storyKey?.(m)||aiSceneKey(m);
 if(temporary.draftScope!==currentScope){temporary.draftScope=currentScope;temporary.freeDraft=window.NW_DRAFTS?.get?.("free",currentScope)||"";}
 const scene=N.get(s),novel=m.aiScenes?.[m.phase]||(m.director?null:window.NW_NOVEL?.scene(s))||{title:"世界構築中",mood:"system",blocks:[{type:"system",text:"主神正在續寫輪迴世界。本幕尚未生成，請等待或重試……"}]},w=m.world==="custom"?{name:m.worldName}:world(m.world);
 const choices=scene.actions.map((o,i)=>({o,i})).filter(x=>x.o.usable).map(({o,i})=>'<button class="narrative-choice" data-do="act:'+i+'"><span class="choice-main"><b>'+esc(o.label)+'</b>'+(o.hint?'<small>'+esc(o.hint)+'</small>':"")+'</span><span class="choice-arrow">→</span></button>').join("");
 const blocks=novel?.blocks||[];
 let beatIndex=0, emotionalBeats=0;
 const renderBeat=(text,kind="narration",consequence=false,hint="")=>{
   const raw=String(text||"").trim();if(!raw)return "";
   const index=beatIndex++;
   const allowed=emotionalBeats<4||kind==="system";
   const emotion=allowed?window.NW_EMOTION?.classify?.(raw,{
     mood:novel?.mood||"suspense",
     hint,
     type:kind,
     allowMood:kind==="narration"&&emotionalBeats===0&&index===0
   }):null;
   if(emotion&&kind!=="system")emotionalBeats++;
   const name=emotion?.name||"";
   const legacyClass=["panic","anger","shock"].includes(name)?"fx-alert":
     name==="grief"?"fx-death":name==="revelation"?"fx-reveal":"";
   const cls=kind==="dialogue"?"novel-dialogue-prose":kind==="system"?"novel-system":"";
   const classNames=[cls,consequence?"novel-choice-consequence":""].filter(Boolean).join(" ");
   const token=emotion?.token||"";
   const at=token?raw.indexOf(token):-1;
   const formatted=at<0?esc(raw):esc(raw.slice(0,at))+
     '<span class="emotion-focus">'+esc(token)+'</span>'+esc(raw.slice(at+token.length));
   const inner=kind==="system"?'<div class="'+classNames+'">'+formatted+'</div>':
     '<p'+(classNames?' class="'+classNames+'"':"")+'>'+formatted+'</p>';
   return '<div class="novel-beat '+legacyClass+(name?' emotion-'+name:"")+
     '" data-beat="'+index+'"'+(name?' data-emotion="'+name+'"':"")+'>'+inner+'</div>';
 };
 const prose=blocks.map(b=>{
   if(b.type==="system")return renderBeat(b.text,"system",false,b.emotion);
   if(b.type==="dialogue")return renderBeat(b.text,"dialogue",false,b.emotion);
   return literaryProse(b.text||"").split(/\n\s*\n/).filter(Boolean)
     .map(p=>renderBeat(p,"narration",!!b.consequence,b.emotion)).join("");
 }).join("");
 const notice="";
 const bar='<div class="story-top literary-top"><span>'+esc(w.name)+' <small>· 第 '+(m.phase+1)+' 章</small></span><button class="story-leave" data-do="leaveStory" aria-label="退出當前故事並開始新故事">退出 · 新故事</button></div>';
 const toolbox='<div class="story-toolbar literary-toolbar"><span>《'+esc(m.worldName)+'》 · '+esc(novel?.title||"本章")+'</span><div>'+a("人物・技能","codexOpen","tiny ghost")+a(musicControlText(),"musicToggle","tiny ghost")+a(eplusMode()==="strong"?"演出：強":eplusMode()==="standard"?"演出：柔和":"演出：關","toggleMotion","tiny ghost")+a("重寫","rewriteOpen","tiny ghost")+a("線索","taskinfo","tiny ghost")+'</div></div>';
  const popups=[];
 if(temporary.codexOpen)popups.push(window.NW_CODEX?.render?.(s,m,temporary.codexTab)||"");
 if(temporary.showStatus)popups.push('<div class="mission-popup"><div class="card-heading">輪迴者狀態</div><div class="narrative-stat-grid">'+["hp","sta","mp","san"].map((k,i)=>'<div><span>'+D.stats[i].name+'</span><b>'+Math.round(s.profile[k])+' / '+D.stats[i].max+'</b></div>').join("")+'</div><p class="popup-note">只有發生體力消耗、施展術式或受到傷害時，才需要特別注意數值。</p>'+a("關閉","status","small ghost")+'</div>');
 if(temporary.showItems)popups.push('<div class="mission-popup"><div class="card-heading">本次攜帶的物品</div>'+Object.entries(m.bag).filter(([id,n])=>n>0).map(([id,n])=>'<button class="button-row" data-do="use:'+id+'">'+esc(objId(id)?.name)+' ×'+n+' <span>使用 ›</span></button>').join("")+a("關閉","items","small ghost")+'</div>');
 if(temporary.showSkills)popups.push('<div class="mission-popup"><div class="card-heading">已配置的招式與技能</div><p class="popup-note">招式不會自動取代劇情選項；招式可以在合適的劇情節點使用。</p>'+N.skills(s).map(x=>'<button class="button-row story-skill" data-do="cast:'+x.id+'" '+(x.ok?"":"disabled")+'><div><b>'+esc(x.name)+'</b><small>'+esc(x.desc)+'</small><small>'+(x.sta?"STA −"+x.sta+" ":"")+(x.mp?"MP −"+x.mp:"")+(x.reasons.length?" · "+esc(x.reasons.join("、")):"")+'</small></div><span>使用 ›</span></button>').join("")+a("關閉","skills","small ghost")+'</div>');
 if(temporary.showLog)popups.push('<div class="mission-popup"><div class="card-heading">輪迴經歷</div><div class="log-lines">'+m.log.slice(-12).map(x=>'<p>'+esc(x)+'</p>').join("")+'</div>'+a("關閉","logs","small ghost")+'</div>');
 if(temporary.showTask)popups.push('<div class="mission-popup literary-info"><div class="card-heading">這個世界的秘密</div><p class="popup-note">'+esc(m.objective||"")+'</p>'+
 (m.directorPlan?.threads||[]).filter(t=>t.status==="open").slice(-4).map(t=>'<p class="popup-note">未解線索：'+esc(t.setup)+'</p>').join("")+
 (m.canon?.url?'<p class="popup-note">原作資料：<a href="'+esc(m.canon.url)+'" target="_blank" rel="noopener noreferrer">'+esc(m.canon.title)+' ↗</a></p>':"")+
 a("返回故事","taskinfo","small ghost")+'</div>');
 const freeReview=temporary.freeReview;
 if(freeReview&&freeReview.key===aiSceneKey(m)&&freeReview.phase===m.phase){
  popups.push('<div class="mission-popup literary-dialog" role="dialog" aria-label="確認主角行動"><div class="card-heading">主角下一步</div><p class="popup-note">'+esc(freeReview.value)+'</p><p class="popup-note">你嘅決定會改變後續情節；唔會扣除任何數值。</p><div class="free-confirm-actions">'+a("確認，繼續故事","freeConfirm","small main")+a("修改","freeCancel","small ghost")+'</div></div>');
 }
 return '<div class="mission-stage narrative-stage novel-first-stage reading-focused">'+bar+
 '<div class="scene-prose '+(eplusMode()==="off"?"motion-off ":"")+'fx-'+temporary.fxPerform+'" data-mood="'+(novel?.mood||"calm")+'" data-eplus="'+eplusMode()+'">'+(temporary.fxPerform!=="static"&&eplusMode()!=="off"?'<button class="eplus-skip" data-do="skipFx">跳過演出 ›</button>':"")+'<div class="scene-eyebrow">'+esc(novel?.title||"輪迴世界")+'　·　'+({solo:"獨行篇",team:"同行篇",versus:"對峙篇"}[novel?.mode]||novel?.mode||"輪迴篇")+'</div>'+prose+'<div class="read-end"><button data-do="toggleChoices">'+(temporary.choicesOpen?"收起行動，繼續閱讀":"已讀完本章 · 選擇下一步")+'</button></div></div>'+((temporary.aiPending&&temporary.aiKey===aiSceneKey(m))?'<div class="ai-state">AI 正在續寫……</div>':temporary.aiError?'<div class="ai-state">'+esc(temporary.aiError)+'　'+a("重試","aiRetry","tiny ghost")+a("檢查 AI","nav:settings","tiny ghost")+(m.world==="custom"?a("取消並退款","cancelCustom","tiny ghost"):"")+'</div>':"")+
 toolbox+
 (temporary.choicesOpen?'<div class="fixed-choices story-choice-panel expanded">'+notice+choices+
 '<div class="free-row literary-free-row"><textarea id="free-action" maxlength="3000" rows="4" placeholder="寫下主角想做嘅事，亦可以用武器、技能或者同 NPC 交流……（自動儲存草稿）" aria-label="自訂行動" '+((m.world==="custom"||m.director)&&!scene.actions.length?"disabled":"")+'>'+esc(temporary.freeDraft)+'</textarea>'+a("預覽行動","free","tiny main",m.world==="custom"&&!scene.actions.length?"disabled":"")+'</div></div>':
 '<div class="fixed-choices story-choice-panel collapsed"><button class="story-unfold" data-do="toggleChoices">讀完先揀 · 展開本章選擇 ↓</button></div>')+
  '<div class="story-footer literary-footer"><button data-do="nav:memory">過往經歷</button><span>每個抉擇，都會留下痕跡</span><button data-do="leaveStory">新故事</button></div>'+popups.join("")+'</div>'
}
function resultUI(){
 const m=s.mission,chapters=(m.directorPlan?.chapters||[]);
 const recent=chapters.at(-1);
 return '<section class="story-ending"><div class="library-kicker">THE END · 一個世界的終點</div>'+
 '<h1>這段故事，<br>終於有了自己的結尾。</h1>'+
 '<p>《'+esc(m.worldName)+'》</p>'+
 (recent?'<blockquote class="ending-recall">'+esc(recent.summary||"")+'</blockquote>':"")+
 '<p class="ending-note">曾經作出的選擇會留喺故事記憶之中。唔需要結算戰鬥分數，亦唔需要升級先可以再開始。</p>'+
 a("保存經歷，返回故事書架","claim","block main")+
 a("立即開始另一段故事","claimNew","block ghost")+'</section>'
}
function memory(){
 const tabs=[["timeline","已完成"],["unfinished","曾離開"],["worlds","世界與人物"]];
 const mode=tabs.some(x=>x[0]===temporary.memoryTab)?temporary.memoryTab:"timeline";
 let body="";
 if(mode==="timeline")body=s.records.length?s.records.map(r=>
  card("《"+esc(r.worldName||r.world||"未知世界")+"》",
    '<div class="archive-story-meta">'+esc(new Date(r.date).toLocaleDateString("zh-HK"))+'</div>'+
    (r.choices||[]).slice(-9).map(choice=>'<p class="archive-choice">「'+esc(choice)+'」</p>').join("")+
    (r.directorPlan?.finale?.prose?'<p class="archive-excerpt">'+esc(r.directorPlan.finale.prose)+'</p>':"")
  )).join(""):card("尚未完結的書頁","故事完結後，你作出過的選擇會記錄喺呢度。");
 if(mode==="unfinished")body=(s.abandonedStories||[]).length?s.abandonedStories.map(r=>card("《"+esc(r.worldName||"未知世界")+"》",
  '<p class="archive-story-meta">閱讀至第 '+esc(r.chapter)+' 章 · '+esc(new Date(r.at).toLocaleDateString("zh-HK"))+'</p>'+
  (r.snapshots||[]).slice(-3).map(c=>'<p class="archive-excerpt"><b>'+esc(c.title||"")+'</b>　'+esc(c.excerpt||"")+'</p>').join("")+
  (r.choices||[]).slice(-3).map(c=>'<p class="archive-choice">「'+esc(c)+'」</p>').join("")
 )).join(""):card("尚未有離開過的故事","如果你決定退出，之前嘅主要章節同選擇會保留喺呢度。");
 if(mode==="worlds"){
  const library=Object.values(s.worldLibrary||{});
  body=library.length?library.map(r=>card("《"+esc(r.name||"未知世界")+"》",
   (r.source?.url?'<p class="archive-excerpt">原作來源：<a href="'+esc(r.source.url)+'" target="_blank" rel="noopener noreferrer">'+esc(r.source.title)+' ↗</a></p>':"")+
   (r.facts||[]).slice(-6).map(x=>'<p class="archive-excerpt">'+esc(x)+'</p>').join("")+
   Object.entries(r.npcs||{}).slice(0,6).map(([name,npc])=>'<p class="archive-excerpt"><b>'+esc(name)+'</b> · '+esc(npc.memory||"尚未記錄人物經歷")+'</p>').join("")
  )).join(""):card("尚未建立世界記憶","隨故事推進，人物與線索會逐漸留下痕跡。");
 }
 return section("LIBRARY / REMEMBRANCE","故事與記憶","不再用等級、裝備或戰鬥數值衡量經歷。")+
 '<div class="tabbar archive-tabs">'+tabs.map(([id,label])=>'<button class="'+(mode===id?"on":"")+'" data-do="tab:memory:'+id+'">'+label+'</button>').join("")+'</div>'+
 '<div class="scroll-content column-gap story-archive">'+body+'</div>';
}
function settings(){
 const mode=eplusMode(),cloud=window.NW_CLOUD?.status?.()||{enabled:false,key:"",revision:0};
 const lastUsage=s.aiLastUsage;
 const musicStatus=window.NW_MUSIC?.status?.()||{enabled:false,error:""};
 const track=window.NW_MUSIC?.getTrack?.(soundtrackMood());
 const volume=Math.round(100*Number(s.settings?.musicVolume??.22));
 const musicCard=card("劇情背景音樂 · Adaptive BGM",
  '<p class="minor-meta">按照章節情緒自動轉換配樂，約 1.4 秒淡入淡出。首次播放需要你按一下按鈕；預設靜音，不會自行播歌。</p>'+
  a(musicStatus.enabled?"暫停背景音樂":"♫ 開啟背景音樂","musicToggle","block main")+
  '<label class="world-input-label" for="bgm-volume">背景音量 · <output id="bgm-volume-value">'+volume+'%</output></label>'+
  '<input id="bgm-volume" class="bgm-volume" type="range" min="0" max="45" step="1" value="'+volume+'" aria-label="背景音樂音量">'+
  '<p class="minor-meta">目前場景：'+esc(track?.label||"主神空間")+' · 配樂：'+esc(track?.title||"")+' · CC0</p>'+
  (musicStatus.error?'<p class="negative-note">'+esc(musicStatus.error)+'</p>':"")+
  '<p class="minor-meta"><a href="https://opengameart.org/content/dark-sci-fi-audio-pack" target="_blank" rel="noopener noreferrer">SRG774 配樂授權與來源 ↗</a>　·　<a href="https://opengameart.org/content/sadness" target="_blank" rel="noopener noreferrer">Sadness by Kistol ↗</a></p>');

 const groqCard=card("AI 劇情健康檢查",'<p class="minor-meta">檢查 API 金鑰與可用模型，不會生成小說或浪費文字 Token。每幕真正剩餘額度取決於 Groq 實時回應。</p>'+a("檢查 Groq API 與模型","groqProbe","block main")+(temporary.groqStatus?'<p class="minor-meta">'+esc(temporary.groqStatus)+'</p>':""));
 const usageCard=card("AI Token 用量",lastUsage?
 piece("最近使用模型",esc(lastUsage.model||"未確認"))+
 piece("本幕實際 Token",num(lastUsage.totalTokens)+"（輸入 "+num(lastUsage.promptTokens)+" ／ 輸出 "+num(lastUsage.completionTokens)+"）")+
 piece("模型最近剩餘 TPM",lastUsage.remainingTokens===null?"供應商未提供":num(lastUsage.remainingTokens)+" Token"): 
 '<p class="minor-meta">尚未生成 AI 劇情。此數值來自上一幕 Groq API 回報，並非全帳戶即時餘額。</p>') ;
 const cloudCard=card("Nightwalker · 雲端存檔",'<p class="minor-meta">本機存檔永遠保留。你可以建立私密恢復代碼，日後喺其他裝置取回存檔。啟用後會喺劇情更新時自動備份；如果雲端有衝突，唔會覆蓋較新版本。</p>'+a(cloud.enabled?"立即雲端備份":"建立恢復代碼並啟用備份","cloudBackup","block main")+
 (cloud.key?'<p class="minor-meta">雲端已關聯 · 版本 '+cloud.revision+'</p>'+a("顯示／隱藏恢復代碼","cloudShow","block ghost"):"")+
 (temporary.cloudShow&&cloud.key?'<div class="cloud-recovery-key">'+esc(cloud.key)+'</div><p class="minor-meta">請將代碼保存喺安全地方；知道代碼的人可以讀取及取代雲端存檔。</p>':"")+
 '<label class="world-input-label" for="cloud-recovery">在其他裝置輸入恢復代碼</label><textarea id="cloud-recovery" class="world-premise-input" rows="2" maxlength="64" placeholder="64 位私密恢復代碼" aria-label="恢復代碼"></textarea>'+
 a("從雲端恢復（取代當前遊戲）","cloudRestore","block ghost")+
 (temporary.cloudError?'<p class="negative-note">'+esc(temporary.cloudError)+'</p>':""));
 return section("TERMINAL SETTINGS","系統設定","閱讀效果及本機、雲端輪迴存檔。")+'<div class="scroll-content column-gap">'+
 card("閱讀",piece("E+ 文字演出強度",mode==="strong"?"強烈（情緒轉折、線索、主神文字）":mode==="standard"?"柔和（閱讀時段落自然浮現）":"關閉（靜態閱讀）",a("切換模式","toggleMotion","small")))+
 musicCard+groqCard+usageCard+cloudCard+card("本機存檔",piece("已完成輪迴",s.records.length+" 次")+a("匯出角色存檔 JSON","export","block ghost"))+'</div>'
}
function screen(){return s.screen==="hub"?hub():s.screen==="profile"?profile():s.screen==="warehouse"?warehouse():s.screen==="loadout"?loadout():s.screen==="upgrade"?upgrade():s.screen==="portal"?missionBoard():s.screen==="mission"?missionUI():s.screen==="memory"?memory():settings()}
function render(){
 const inGame=!!(s.mission&&s.screen==="mission");
 const m=inGame?s.mission:null;
 const fxKey=m&&!m.finished?[m.seed||0,m.world,m.phase,m.aiScenes?.[m.phase]?"ai":"authored"].join(":"):"";
 const mode=eplusMode();
 const reduced=window.NW_EFFECTS?.reducedMotion?.()===true;
 const same=!!fxKey&&fxKey===temporary.fxSceneKey;
 const scroller=R.querySelector?.(".scene-prose");
 const oldY=same&&typeof scroller?.scrollTop==="number"?scroller.scrollTop:0;
 const fresh=!!fxKey&&fxKey!==temporary.fxSeen&&temporary.fxSkippedFor!==fxKey&&mode!=="off"&&!reduced;
 temporary.fxSceneKey=fxKey;
 temporary.fxPerform=fresh?mode:"static";
 const rewriteOverlay=temporary.rewriteDialog?'<div class="story-exit-overlay" role="dialog" aria-modal="true" aria-label="改善本章文筆"><div class="story-exit-card"><h2>重新寫呢一章</h2><p>話俾 AI 知要改進嘅地方，例如節奏、對白、描寫或者人物性格。需要再用一次免費 AI 生成額度。</p><textarea class="rewrite-notes" id="rewrite-note" maxlength="700" rows="4" placeholder="例如：少啲空泛比喻，角色對話自然啲，唔好每三句就停……">'+esc(temporary.rewriteNote)+'</textarea><div class="story-exit-actions">'+a("保留原文","cancelRewrite","block ghost")+a("按意見重新寫","rewriteChapter","block main")+'</div></div></div>':"";
 const leaveOverlay=temporary.leaveDialog?'<div class="story-exit-overlay" role="dialog" aria-modal="true" aria-label="退出故事"><div class="story-exit-card"><h2>離開呢個故事？</h2><p>你可以隨時開始新故事。之前嘅章節與選擇會保留喺經歷紀錄；主角姓名同其他存檔唔會被刪除。</p><div class="story-exit-actions">'+a("繼續閱讀","cancelLeave","block ghost")+a("退出並選新故事","confirmLeave","block main")+'</div></div></div>':"";
 R.innerHTML='<div class="app-shell '+(inGame?"in-game":"")+'">'+(inGame?"":header())+'<main class="app-main">'+screen()+'</main>'+(inGame?"":foot())+(temporary.notice?'<div class="toast">'+esc(temporary.notice)+'</div>':"")+leaveOverlay+rewriteOverlay+'</div>';
 if(same&&oldY>0){const pane=R.querySelector?.(".scene-prose");if(pane)pane.scrollTop=oldY}
 window.NW_MUSIC?.sync?.({mood:soundtrackMood(),volume:Number(s.settings?.musicVolume??.22)});
 window.NW_EFFECTS?.cancel?.();
 if(fresh){temporary.fxSeen=fxKey;window.NW_EFFECTS?.play?.(R,{mode})}
 persist();if(inGame)scheduleAiScene()
}
function handle(cmd){if(!cmd)return;
if(cmd.startsWith("entryMode:")){
 const mode=cmd.slice("entryMode:".length);
 if(s.assignment&&["solo","team"].includes(mode)){s.assignment.mode=mode;render()}return
}
if(cmd==="codexOpen"){temporary.codexOpen=true;temporary.codexTab="character";render();return}
if(cmd==="codexClose"){temporary.codexOpen=false;render();return}
if(cmd.startsWith("codexTab:")){const tab=cmd.slice(9);if(["character","skills","gear","npcs"].includes(tab))temporary.codexTab=tab;render();return}
if(cmd.startsWith("codexArm:")){
 const id=decodeURIComponent(cmd.slice(9));
 const obj=objId(id);
 if(!obj||obj.type!=="weapon"||!((s.warehouse||{})[id]>0||Object.values(s.loadout||{}).includes(id)))return notice("未擁有呢件武器");
 s.loadout.weapon=id;render();return
}
if(cmd.startsWith("codexCarry:")){
 const id=decodeURIComponent(cmd.slice(11)),obj=objId(id);
 if(!obj||!(s.warehouse?.[id]>0))return notice("暫時未擁有呢件物品");
 s.loadout.backpack ||= [];
 if(!s.loadout.backpack.includes(id))s.loadout.backpack.push(id);
 render();return
}
if(cmd.startsWith("insert:")){
 const [kind,...args]=cmd.slice(7).split(":"),id=decodeURIComponent(args.join(":"));
 const item=kind==="skill"?skill(id):kind==="item"?objId(id):null;
 if(kind==="skill"&&(!(s.learned||[]).includes(id)||!item))return notice("呢項技能未學會");
 if(kind==="item"&&(!item||![...(s.loadout?.backpack||[]),s.loadout?.weapon,s.loadout?.offhand,s.loadout?.accessory].includes(id)))return notice("呢件物品未隨身帶住");
 const knownNpc=kind==="npc"&&!!(s.mission?.npcMemory?.[id]||(s.mission?.crew||[]).some(x=>x.name===id)||s.mission?.storyBible?.characters?.[id]);
 if(kind==="npc"&&!knownNpc)return notice("尚未喺故事中接觸過呢位人物");
 const addition=kind==="skill"?"嘗試運用「"+item.name+"」，":
  kind==="item"?"拿出「"+item.name+"」，":"走向「"+id+"」，";
 if(!addition)return;
 if(!s.mission){
  temporary.openingDraft=window.NW_DRAFTS?.save?.("opening","next-world",
   (temporary.openingDraft.trim()?temporary.openingDraft.trim()+"\n":"")+addition)||addition;
  go("portal");return
 }
 const scope=temporary.draftScope||window.NW_DRAFTS?.storyKey?.(s.mission)||"new-story";
 temporary.freeDraft=window.NW_DRAFTS?.save?.("free",scope,(temporary.freeDraft.trim()?temporary.freeDraft.trim()+"\n":"")+addition)||addition;
 temporary.codexOpen=false;temporary.choicesOpen=true;render();
 R.querySelector("#free-action")?.focus?.();return
}
if(cmd==="rewriteOpen"){temporary.rewriteDialog=true;render();return}
if(cmd==="cancelRewrite"){temporary.rewriteDialog=false;render();return}
if(cmd==="leaveStory"){temporary.rewriteDialog=false;temporary.leaveDialog=true;render();return}
if(cmd==="cancelLeave"){temporary.leaveDialog=false;render();return}
if(cmd==="confirmLeave"){
 temporary.leaveDialog=false;temporary.codexOpen=false;
 const err=E.abandonStory(s);if(err)return notice(err);
 clearTimeout(temporary.aiRetryTimer);temporary.aiRetryTimer=0;
 temporary.aiError="";temporary.aiFailedKey="";temporary.freeDraft="";
 temporary.freeReview=null;temporary.choicesOpen=false;temporary.showTask=false;
 temporary.worldMatches=[];go("portal");return
}
if(cmd.startsWith("nav:")){let dest=cmd.slice(4);go(dest==="portal"&&s.mission?"mission":dest);return}
if(cmd.startsWith("tab:profile:")){temporary.profileTab=cmd.slice(12);render();return}
if(cmd.startsWith("tab:memory:")){temporary.memoryTab=cmd.slice(11);render();return}
if(cmd.startsWith("warehouse:")){temporary.warehouseMode=cmd.slice(10);render();return}
if(cmd.startsWith("filter:")){temporary.filter=cmd.slice(7);render();return}
if(cmd.startsWith("slot:")){temporary.gearSlot=temporary.gearSlot===cmd.slice(5)?"":cmd.slice(5);render();return}
if(cmd.startsWith("equip:")){let x=cmd.split(":"),err=E.setEquipment(s,x[1],x[2]==="none"?null:x[2]);if(err)return notice(err);temporary.gearSlot="";render();return}
if(cmd.startsWith("pack:")){let err=E.addBag(s,cmd.slice(5));if(err)return notice(err);notice("已加入行囊，戰前負重已更新。");return}
if(cmd.startsWith("unpack:")){let err=E.removeBag(s,Number(cmd.slice(7)));if(err)return notice(err);render();return}
if(cmd.startsWith("skill:")){const id=cmd.slice(6),err=E.toggleSkill(s,id,!skill(id)?.active);if(err)return notice(err);render();return}
if(cmd.startsWith("buy:")){let err=E.buy(s,cmd.slice(4));if(err)return notice(err);notice("已購入道具並存入主神倉庫。");return}
if(cmd.startsWith("learn:")){let err=E.learn(s,cmd.slice(6));if(err)return notice(err);notice("技能已習得，請到戰前配置裝入招式欄。");return}
if(cmd.startsWith("upcat:")){temporary.upgradeCategory=cmd.slice(6);temporary.upgradeSub="";render();return}
if(cmd.startsWith("upsub:")){temporary.upgradeSub=cmd.slice(6);render();return}
if(cmd==="upback:root"){temporary.upgradeCategory="";temporary.upgradeSub="";render();return}
if(cmd.startsWith("blood:")){let err=E.buyBloodline(s,cmd.slice(6));if(err)return notice(err);notice("血脈覺醒成功，能力和副作用已生效。");return}
if(cmd.startsWith("boost:")){let err=E.boost(s,cmd.slice(6));if(err)return notice(err);render();return}
if(cmd==="rewriteChapter"){
 temporary.rewriteDialog=false;
 const m=s.mission;if(!m||m.finished)return;
 if(temporary.aiPending)return notice("AI 正在寫作，請勿重複提交");
 if(temporary.aiDelayUntil>Date.now())return notice("免費模型冷卻中，請稍後再試");
 if(!temporary.aiConfigured)return notice("AI 未連線，保留現有章節，未進行重寫");
 const key=aiSceneKey(m);
 temporary.aiRewriteAttempts[key]=Math.min(5,(temporary.aiRewriteAttempts[key]||0)+1);
 temporary.aiFailedKey="";generateAiScene(true);return
}
if(cmd==="aiRetry"){
 if(temporary.aiDelayUntil>Date.now())return notice("AI 模型冷卻中，約 "+Math.ceil((temporary.aiDelayUntil-Date.now())/1000)+" 秒後再試；不會扣積分");
 clearTimeout(temporary.aiRetryTimer);temporary.aiRetryTimer=0;temporary.aiFailedKey="";
 if(!temporary.aiConfigured){checkAiStatus(true).then(ok=>{if(ok)generateAiScene(true);else notice(aiStatusText()+"，本幕進度不會丟失")});return}
 generateAiScene(true);return
}
if(cmd==="cancelCustom"){let err=E.cancelCustomWorld(s);if(err)return notice(err);temporary.aiError="";go("hub");return}
if(cmd.startsWith("worldType:")){temporary.worldType=cmd.slice("worldType:".length)==="original"?"original":"adaptation";temporary.worldMatches=[];temporary.worldLookupError="";render();return}
if(cmd.startsWith("worldMedia:")){temporary.worldMedia=cmd.slice("worldMedia:".length);temporary.worldMatches=[];temporary.worldLookupError="";render();return}
if(cmd==="saveName"){
 const name=(R.querySelector("#protagonist-name")?.value??temporary.nameDraft??"").trim();
 if(name.length<2||name.length>20)return notice("主角姓名需要 2 至 20 字");
 s.profile.name=name;s.profile.nameCustomized=true;temporary.nameDraft=name;render();return
}
if(cmd==="customWorld"){
 const original=temporary.worldType==="original";
 const title=(R.querySelector(original?"#original-world-name":"#media-world-name")?.value||"").trim();
 if(!playerName())return notice("請先保存主角姓名");
 if(original){
  const premise=R.querySelector("#original-world-premise")?.value||temporary.originalPremiseDraft||"";
  const commit=()=>{const err=E.assignCustomWorld(s,title,temporary.aiConfigured,{kind:"original",premise});if(err)return notice(err);render()};
  if(!temporary.aiConfigured){checkAiStatus(true).then(ok=>ok?commit():notice("AI 未連線，未扣積分"));return}commit();return
 }
 if(title.length<2)return notice("請輸入完整作品名稱");
 temporary.worldLookupQuery=title;temporary.worldLookupMedia=temporary.worldMedia;
 temporary.worldMatches=[];temporary.worldLookupError="";temporary.worldLookupPending=true;render();
 fetch("/api/story?resolveWorld="+encodeURIComponent(title)+"&mediaType="+encodeURIComponent(temporary.worldMedia),{cache:"no-store"})
  .then(async response=>{if(!response.ok)throw Error("作品核對失敗");return response.json()})
  .then(info=>{if(temporary.worldLookupQuery!==title||temporary.worldLookupMedia!==temporary.worldMedia)return;
   temporary.worldMatches=Array.isArray(info.matches)?info.matches.slice(0,3):[];
   temporary.worldLookupError=temporary.worldMatches.length?"":info.message||"作品名稱未能核實，不會作全新原作";
  }).catch(()=>{temporary.worldLookupError="核對原作資料失敗；不會扣分，亦唔會亂作原作故事"})
  .finally(()=>{temporary.worldLookupPending=false;render()});return
}
if(cmd.startsWith("worldPick:")){
 const i=Number(cmd.slice(10)),choice=temporary.worldMatches[i];
 if(!choice||!choice.sourceUrl||temporary.worldType!=="adaptation"||temporary.worldMedia!==temporary.worldLookupMedia||temporary.mediaWorldDraft.trim()!==temporary.worldLookupQuery){
  temporary.worldMatches=[];return notice("作品名稱或版本已變更，請重新核對");
 }
 const commit=()=>{
  const err=E.assignCustomWorld(s,choice.title,temporary.aiConfigured,{kind:"adaptation",mediaType:choice.mediaType,verifiedTitle:choice.title,verifiedSource:choice.sourceUrl,verifiedSourceTitle:choice.sourceTitle});
  if(err)return notice(err);temporary.worldMatches=[];render()
 };
 if(!temporary.aiConfigured){checkAiStatus(true).then(ok=>ok?commit():notice("AI 無法連線，未扣積分"));return}commit();return
}
if(cmd==="assign"){let err=E.mainGodAssign(s);if(err)return notice(err);render();return}
if(cmd.startsWith("coord:")){let err=E.assignReturn(s,cmd.slice(6));if(err)return notice(err);render();return}
if(cmd==="launch"){
 if(!playerName())return notice("開始故事之前先設定主角姓名");
 const opening=R.querySelector("#opening-intent")?.value??temporary.openingDraft??"";
 temporary.openingDraft=window.NW_DRAFTS?.save?.("opening","next-world",opening)||opening;
 if(s.assignment)s.assignment.openingIntent=String(opening).slice(0,1200);
 const startNovel=()=>{
  if(!temporary.aiConfigured)return notice("目前 AI 未連線。為避免誤入六幕短篇，請先在設定頁檢查 AI 連線。");
  const err=E.launch(s);if(err)return notice(err);
  s.mission.director=true;
  window.NW_DRAFTS?.clear?.("opening","next-world");temporary.openingDraft="";
  temporary.showItems=false;temporary.showLog=false;temporary.showSkills=false;temporary.showStatus=false;render()
 };
 if(!temporary.aiConfigured){checkAiStatus(true).then(startNovel);return}
 startNovel();return
}
if(cmd==="cycleSkill"){E.changeSkill(s,(s.mission?.chosenSkill||0)+1);render();return}
if(cmd.startsWith("act:")){let out=N.choose(s,Number(cmd.slice(4)));if(out.error)return notice(out.error);temporary.freeReview=null;render();return}
if(cmd==="toggleChoices"){temporary.choicesOpen=!temporary.choicesOpen;render();return}
if(cmd==="free"){
 const value=R.querySelector("#free-action")?.value??temporary.freeDraft;
 temporary.freeDraft=value;
 window.NW_DRAFTS?.save?.("free",temporary.draftScope,value);
 const out=N.analyzeFree(s,value);
 if(out.error){temporary.freeReview=null;return notice(out.error)}
 temporary.freeReview={value,kind:out.kind,label:out.label,effects:out.effects,phase:out.phase,key:aiSceneKey(s.mission)};
 render();return
}
if(cmd==="freeCancel"){temporary.freeReview=null;render();return}
if(cmd==="freeConfirm"){
 const review=temporary.freeReview,m=s.mission;
 if(!review||!m||review.key!==aiSceneKey(m)||review.phase!==m.phase||review.value!==temporary.freeDraft){
  temporary.freeReview=null;return notice("劇情或行動內容已改變，請重新預覽，未扣除任何資源。");
 }
 const out=N.free(s,review.value,review.kind);
 if(out.error){temporary.freeReview=null;return notice(out.error)}
 window.NW_DRAFTS?.clear?.("free",temporary.draftScope);
 temporary.freeReview=null;temporary.freeDraft="";temporary.draftScope="";render();return
}
if(cmd==="items"){temporary.showItems=!temporary.showItems;temporary.showLog=false;temporary.showSkills=false;temporary.showStatus=false;render();return}
if(cmd==="logs"){temporary.showLog=!temporary.showLog;temporary.showItems=false;temporary.showSkills=false;temporary.showStatus=false;render();return}
if(cmd==="taskinfo"){temporary.showTask=!temporary.showTask;temporary.showStatus=false;temporary.showItems=false;temporary.showSkills=false;temporary.showLog=false;render();return}
if(cmd==="status"){temporary.showStatus=!temporary.showStatus;temporary.showItems=false;temporary.showSkills=false;temporary.showLog=false;render();return}
if(cmd==="skills"){temporary.showSkills=!temporary.showSkills;temporary.showItems=false;temporary.showStatus=false;temporary.showLog=false;render();return}
if(cmd.startsWith("cast:")){const out=N.useSkill(s,cmd.slice(5));if(out.error)return notice(out.error);temporary.showSkills=false;render();return}
if(cmd.startsWith("use:")){let err=N.useItem(s,cmd.slice(4));if(err)return notice(err);temporary.showItems=false;notice("道具已使用，效果已套用。");return}
if(cmd==="claimNew"){
 const err=E.finish(s);if(err)return notice(err);
 go("portal");return
}
if(cmd==="claim"){let err=E.finish(s);if(err)return notice(err);go("hub");return}
if(cmd==="rest"){let err=E.rest(s);if(err)return notice(err);notice("主神治療完成。");return}
if(cmd==="groqProbe"){checkAiStatus(true);return}
if(cmd==="cloudShow"){temporary.cloudShow=!temporary.cloudShow;render();return}
if(cmd==="cloudBackup"){
 if(!window.NW_CLOUD)return notice("雲端存檔模組未載入");
 window.NW_CLOUD.backup(s).then(()=>{temporary.cloudError="";temporary.cloudShow=true;render();notice("雲端備份成功。請安全保存恢復代碼。")}).catch(e=>{temporary.cloudError=String(e.message||e);render()});return
}
if(cmd==="cloudRestore"){
 const code=R.querySelector("#cloud-recovery")?.value||"";
 if(!window.NW_CLOUD)return notice("雲端存檔模組未載入");
 window.NW_CLOUD.load(code).then(r=>{
 try{localStorage.setItem("nightwalker_pre_cloud_restore_backup",JSON.stringify(s))}catch(_){}
 window.NW_CLOUD.accept(r.key,r.revision);
 s=r.state;s.screen="hub";E.save(s);temporary.cloudError="";temporary.cloudShow=false;render();
 notice("已恢復雲端輪迴進度。原本本機存檔已另存備份。")
 }).catch(e=>{temporary.cloudError=String(e.message||e);render()});return
}
if(cmd==="musicToggle"){
 const currently=window.NW_MUSIC?.status?.().enabled;
 if(currently){
  window.NW_MUSIC?.stop?.();
  s.settings.musicEnabled=false;
 }else{
  const started=window.NW_MUSIC?.start?.({mood:soundtrackMood(),volume:Number(s.settings?.musicVolume??.22)});
  s.settings.musicEnabled=!!started;
 }
 render();return
}
if(cmd==="toggleMotion"){const next=eplusMode()==="standard"?"strong":eplusMode()==="strong"?"off":"standard";s.settings.eplusMode=next;s.settings.reducedMotion=next==="off";temporary.fxSeen="";temporary.fxSkippedFor="";render();return}
if(cmd==="skipFx"){temporary.fxSkippedFor=temporary.fxSceneKey;window.NW_EFFECTS?.skip?.();const pane=R.querySelector?.(".scene-prose");pane?.classList?.add("fx-static");pane?.classList?.remove("fx-strong","fx-standard");const skip=R.querySelector?.(".eplus-skip");if(skip)skip.hidden=true;return}
if(cmd==="export"){try{const blob=new Blob([JSON.stringify(s,null,2)],{type:"application/json"}),url=URL.createObjectURL(blob),a=document.createElement("a");a.href=url;a.download="nightwalker-save.json";document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),2000)}catch(_){notice("此瀏覽器暫不支援匯出。")}return}
}
R.addEventListener("input",ev=>{const el=ev.target;
if(el.id==="bgm-volume"){
 const value=Math.max(0,Math.min(45,Number(el.value)||0));
 s.settings.musicVolume=value/100;
 window.NW_MUSIC?.setVolume?.(s.settings.musicVolume);
 const label=R.querySelector("#bgm-volume-value");if(label)label.textContent=value+"%";
 E.save(s);return
}if(el.id==="free-action"){temporary.freeDraft=el.value.slice(0,3000);window.NW_DRAFTS?.save?.("free",temporary.draftScope,temporary.freeDraft)}if(el.id==="media-world-name"){temporary.mediaWorldDraft=el.value.slice(0,50);temporary.worldMatches=[];temporary.worldLookupError="";}if(el.id==="protagonist-name")temporary.nameDraft=el.value.slice(0,20);if(el.id==="opening-intent")temporary.openingDraft=window.NW_DRAFTS?.save?.("opening","next-world",el.value.slice(0,1200))||el.value.slice(0,1200);
if(el.id==="rewrite-note")temporary.rewriteNote=window.NW_DRAFTS?.save?.("rewrite","chapter",el.value.slice(0,700))||el.value.slice(0,700);if(el.id==="original-world-name")temporary.originalWorldDraft=el.value.slice(0,50);if(el.id==="original-world-premise")temporary.originalPremiseDraft=window.NW_DRAFTS?.save?.("premise","new-world",el.value.slice(0,2000))||el.value.slice(0,2000)});
R.addEventListener("click",ev=>{let t=ev.target.closest("[data-do]");if(!t||t.disabled)return;handle(t.dataset.do)});
render();
checkAiStatus();
})();
