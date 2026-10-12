(function(){
"use strict";
const D=window.NW_DATA,E=window.NW_ENGINE,N=window.NW_STORY,R=document.getElementById("app");
if(!D||!E){R.textContent="主神資料讀取失敗：請重新整理。";return}
let s=E.load(),temporary={panel:"",notice:"",noticeTimer:0,filter:"all",warehouseMode:"storage",profileTab:"overview",gearSlot:"",activePage:0,skillPage:"all",memoryTab:"timeline",showItems:false,showLog:false,showSkills:false,showStatus:false,showTask:false,upgradeCategory:"",upgradeSub:"",aiConfigured:false,aiChecked:false,aiChecking:false,aiStatus:"unchecked",aiPending:false,aiError:"",aiRetryTimer:0,aiRetryKey:"",aiAutoAttempts:0,aiDelayUntil:0,aiUsage:null,freeDraft:"",freeReview:null,choicesOpen:false,worldMatches:[],worldLookupQuery:"",worldLookupMedia:"",worldLookupPending:false,worldLookupError:"",worldInput:"",worldType:"adaptation",worldMedia:"電影",mediaWorldDraft:"",originalWorldDraft:"",originalPremiseDraft:"",fxSeen:"",fxSkippedFor:"",fxPerform:"static",fxSceneKey:""};
const esc=v=>String(v??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const q=v=>"'"+esc(v)+"'";
const num=n=>Number(n||0).toLocaleString("en-US");
const tag=(txt,type="")=>'<span class="chip '+type+'">'+esc(txt)+'</span>';
const a=(label,cmd,cls="",props="")=>'<button class="btn '+cls+'" data-do="'+esc(cmd)+'" '+props+'>'+label+'</button>';
const objId=id=>D.items.find(x=>x.id===id);
const skill=id=>D.skills.find(x=>x.id===id);
const world=id=>D.worlds.find(x=>x.id===id);
const task=id=>D.tasks.find(x=>x.id===id);
const playerName=()=>s.profile?.nameCustomized&&String(s.profile.name||"").trim()?String(s.profile.name).trim():"";
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
if(temporary.aiPending)return;
if(!force&&temporary.aiFailedKey===key)return;
temporary.aiPending=true;temporary.aiKey=key;temporary.aiError="";render();
const known=window.NW_NOVEL?.scene(s);
const scene=N.get(s);const directorBrief=window.NW_WORLD?.directorContext?.(s)||null;
const storyBible=window.NW_BIBLE?.context?.(s)||null;
const endingAudit=m.phase>=19?(window.NW_BIBLE?.endingAudit?.(s)||null):null;
const body={directorBrief,storyBible,endingAudit,canonTimeline:(m.canonTimeline||[]).slice(0,6),protagonist:literaryName().slice(0,30),sessionKey:String(m.seed||""),directorStage:phase<5?"調查":phase<10?"人際":phase<16?"危機":phase<23?"決戰":"結局",npcMemory:m.npcMemory||{},worldFacts:m.storyFacts||[],worldHistory:(m.worldHistory||[]).slice(-2),priorArc:m.missionArc||[],sideQuests:m.quests||[],npcAgency:(m.agencyEvents||[]).slice(-4),branchConsequences:(m.branchConsequences||[]).slice(-4),returnVisit:!!m.returnVisit,canonCache:m.canon?{...m.canon,extract:String(m.canon.extract||"").slice(0,phase===0?1250:650)}:null,mode:m.world==="custom"?"custom":"known",worldKind:m.worldKind||"adaptation",mediaType:m.mediaType||"",premise:m.premise||"",world:m.worldName,task:m.title,objective:m.objective,phase,cast:[...(m.crew||[]).map(x=>x.name),...(m.rival?[m.rival.name]:[])],flags:(m.flags||[]).slice(-16),history:(m.history||[]).slice(-4).map(x=>String(x.action||"").slice(0,90)+" → "+String(x.events?.[0]||"").slice(0,65)),previousScenes:Object.keys(m.aiScenes||{}).map(Number).filter(i=>i<phase).sort((x,y)=>x-y).slice(-1).flatMap(i=>(m.aiScenes[i]?.blocks||[]).slice(-2).map(b=>({type:b.type,speaker:b.speaker||"",text:String(b.text||"").slice(0,220)}))),base:(phase===0?(known?.blocks||[]).slice(0,2):[]).map(b=>({type:b.type,speaker:b.speaker||"",text:String(b.text||"").slice(0,170)})),choices:(scene?.actions||[]).slice(0,3).map(x=>({label:x.label,kind:x.kind})),state:{hp:s.profile.hp,sta:s.profile.sta,mp:s.profile.mp,san:s.profile.san}};
try{
 const res=await fetch("/api/story",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(body)});
 const obj=await res.json();if(!res.ok){const error=new Error(obj.message||obj.error||"AI 劇情暫時無法載入");error.code=obj.error||"";error.httpStatus=res.status;error.retryAfter=Number(obj.retryAfter)||0;throw error}
 if(!Array.isArray(obj.blocks)||obj.blocks.filter(b=>b?.type==="narration").reduce((n,b)=>n+String(b.text||"").replace(/\s/g,"").length,0)<100)throw Error("AI 劇情正文不完整");
 if(s.mission===m&&m.phase===phase&&!m.finished){
 temporary.aiDelayUntil=0;clearTimeout(temporary.aiRetryTimer);temporary.aiRetryTimer=0;temporary.aiUsage={model:obj.model||"",...(obj.usage||{}),remainingTokens:obj.quota?.remainingTokens??null};s.aiLastUsage={...temporary.aiUsage,at:Date.now()};
 m.aiScenes ||= {};m.aiOptions ||= {};
 m.aiScenes[phase]={title:obj.title,mood:obj.mood,blocks:obj.blocks,mode:({solo:"獨行篇",team:"同行篇",versus:"對峙篇"}[m.mode]||"輪迴篇"),resolution:obj.resolution||{readyToConclude:false}};if(Array.isArray(obj.options)&&obj.options.length===3)m.aiOptions[phase]=obj.options;if(Array.isArray(obj.missionArc)&&obj.missionArc.length>=3&&!m.missionArc?.length)m.missionArc=obj.missionArc.slice(0,4);
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
function header(){const p=s.profile;return '<header class="mast"><button class="wordmark" data-do="nav:hub"><span>NIGHTWALKER</span><em>∞</em><small>主神序列 / 0000</small></button><div class="mast-user"><strong>輪迴者 · LV.'+p.level+'</strong><small>積分 <span>'+num(p.credits)+'</span></small></div></header>'}
function foot(){const nav=[["hub","主神"],["profile","角色"],["warehouse","倉庫"],["loadout","配裝"],["upgrade","強化"]];return '<nav class="bottom-nav">'+nav.map(([id,name])=>'<button class="'+(s.screen===id?"on":"")+'" data-do="nav:'+id+'"><span>'+icon[id]+'</span><small>'+name+'</small></button>').join("")+'</nav>'}
function pillRow(){let p=s.profile;return '<div class="vitals">'+bar("HP",p.hp,100,"#d8a2aa")+bar("STA",p.sta,100,"#dec993")+bar("MP",p.mp,60,"#93bbd9")+bar("SAN",p.san,100,"#b8a3d7")+'</div>'}
function hub(){const recent=s.memory[0]?.text||"輪迴者身份已驗證。主神已注意到你殘缺的記憶。";return '<div class="hub-hero"><div class="orbit orbit-outer"></div><div class="orbit orbit-inner"></div><div class="infinity">∞</div><div class="hero-message"><span class="eyebrow">MAIN GOD / RETURN CHAMBER</span><h1>歡迎歸還，<br>輪迴者。</h1><p>「命運並非獎賞。每一次歸來，都是一次重新開始的機會。」</p><small>主神監察狀態：正常　/　AI 劇情：'+aiStatusText()+'</small></div></div><div class="home-content"><div class="identity-strip"><div><small>輪迴者 0000</small><b>'+esc(playerName()||'未命名輪迴者')+' · LV.'+s.profile.level+'</b></div><div style="text-align:right"><small>主神積分</small><b class="gold">'+num(s.profile.credits)+'</b></div></div>'+
'<div class="hub-grid">'+[
["profile","◈","輪迴者檔案","身份・能力・關係"],
["warehouse","▥","主神倉庫","永久戰利品儲存"],
["loadout","⚒","戰前配裝","武器・招式・物品"],
["upgrade","✧","主神強化","屬性・技能・血脈"]
].map(x=>'<button class="hub-tile" data-do="nav:'+x[0]+'"><span class="tile-icon">'+x[1]+'</span><b>'+x[2]+'</b><small>'+x[3]+'</small></button>').join("")+'</div>'+
'<button class="portal-button" data-do="nav:portal"><span class="portal-glyph">◌</span><span><b>'+(s.mission?"返回正在進行的輪迴":s.assignment?"主神已指派輪迴世界":"接受下一次主神指派")+'</b><small>'+(s.mission?"任務："+s.mission.title:s.assignment?"任務資料已封存，等待你的戰前準備":"世界由主神決定 · 下一輪入場前四項資源全滿")+'</small></span><span class="chev">›</span></button>'+
'<div class="hub-record"><div class="eyebrow">最近記憶／主神日誌</div><p>'+esc(recent)+'</p><button data-do="nav:memory">查看輪迴記錄　›</button><button data-do="nav:settings">系統設定 · AI 連線診斷　›</button></div>'+
'</div>'}
function profile(){const p=s.profile,t=temporary.profileTab;let tabs=[["overview","總覽"],["attributes","能力"],["gear","裝備"],["relations","關係"],["records","輪迴"]];let content="";
if(t==="overview")content='<div class="profile-art"><div class="profile-seal"><span>∞</span></div><div><div class="eyebrow">REINCARNATOR · NO.0000</div><h2>'+esc(playerName()||"尚未設定主角姓名")+'</h2><p>'+esc(p.title)+'</p><span class="chip warm">LV.'+p.level+' · 生存觀察者</span></div></div>'+pillRow()+'<div class="two-cols">'+statCard("基礎強度",p.attrs.str+p.attrs.agi+p.attrs.con)+statCard("精神感知",p.attrs.per+p.attrs.wil)+'</div>'+card('主神判定','已完成輪迴：'+p.missions+' 次。'+(s.records.length?"最近世界《"+world(s.records[0].world)?.name+"》。":"尚未取得完整輪迴紀錄。"))+card("血脈／異能",s.profile.bloodline?esc(D.bloodlines.find(x=>x.id===s.profile.bloodline)?.name||"未知血脈"):"未覺醒（主神強化 Lv.5 起可解鎖）")+card("命運標籤","觀察者 · 未歸之人 · 記憶重置疑雲");
if(t==="attributes")content=card("五維基礎屬性",D.attributes.map(([id,name])=>piece(name,"影響技能判定與可用裝備",'<b class="num">'+p.attrs[id]+'</b>')).join(""))+card("衍生能力","行囊負重上限 "+E.capacity(s)+"，目前 "+E.weight(s)+"；已學習技能 "+s.learned.length+" 項。");
if(t==="gear")content=card("當前攜帶裝備",["weapon","offhand","armor","accessory"].map(x=>piece({weapon:"主武器",offhand:"副武器",armor:"防具",accessory:"飾品"}[x],objId(s.loadout[x])?.name||"未裝備")).join(""))+card("戰技配置",s.loadout.active.map(id=>piece(skill(id)?.name||id,skill(id)?.desc||"")).join(""))+a("前往戰前配置","nav:loadout","main block");
if(t==="relations")content=card("輪迴者關係網",D.companions.map(c=>piece(c.name,c.role+" · "+c.temper,tag("關係 "+(s.bonds[c.id]||0),(s.bonds[c.id]||0)>=2?"gold":""))).join(""))+card("故事規則","隊友只有被分派到同一任務時才會登場；單人輪迴不會固定攜帶林霧。");
if(t==="records")content=card("已完成的世界",s.discovered.length?s.discovered.map(id=>piece(world(id)?.name||id,"可用積分解鎖定向座標")).join(""):"尚未完成正式輪迴。")+card("主神檔案",s.memory.length?s.memory.slice(0,5).map(x=>piece(x.text,new Date(x.at).toLocaleDateString("zh-HK"))).join(""):"仍未恢復失落的記憶。");
return section("個人登錄資料","輪迴者檔案","所有裝備、技能、傷勢與關係都屬於同一名角色。")+'<div class="tabbar">'+tabs.map(x=>'<button class="'+(t===x[0]?"on":"")+'" data-do="tab:profile:'+x[0]+'">'+x[1]+'</button>').join("")+'</div><div class="scroll-content column-gap">'+content+'</div>'}
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
let stages=s.assignment?card("傳送前最後確認",'<div class="summary-lines">'+piece("主武器",objId(s.loadout.weapon)?.name||"無")+piece("防具",objId(s.loadout.armor)?.name||"無")+piece("主動技能",s.loadout.active.map(x=>skill(x)?.name).join("、"))+piece("行囊",s.loadout.backpack.length+" 件 · "+E.weight(s)+"/"+E.capacity(s)+" 負重")+'</div>'+a("重新配置裝備","nav:loadout","block ghost")+a("確認 Loadout，正式進入世界","launch","block main")+(s.assignment.world==="custom"?a("取消自訂世界並退還積分","cancelCustom","block ghost"):"")):a("接受主神隨機指派","assign","block main");
let customCard="";
if(!s.assignment){
 const original=temporary.worldType==="original";
 const media=["電影","劇集","動畫","小說","遊戲","其他作品"];
 const types='<div class="world-kind-tabs"><button class="'+(!original?"selected":"")+'" data-do="worldType:adaptation">作品世界<small>電影／劇集／動畫等</small></button><button class="'+(original?"selected":"")+'" data-do="worldType:original">自創世界<small>建立原創世界觀</small></button></div>';
 const status='<p class="minor-meta">AI 劇情：'+aiStatusText()+'。未能傳送時不會扣除積分。</p>';
 const mediaVerify=temporary.worldLookupPending?'<div class="world-verify">正在核對原作資料，未扣積分……</div>':temporary.worldLookupError?'<div class="world-verify problem">'+esc(temporary.worldLookupError)+'</div>':temporary.worldMatches.length?'<div class="world-verify"><b>請確認正確作品及版本</b><p>發現可能嘅作品；唔會自行當成新世界生成。</p>'+temporary.worldMatches.map((x,i)=>'<button class="world-candidate" data-do="worldPick:'+i+'"><strong>《'+esc(x.title)+'》 · '+esc(x.mediaType)+'</strong><small>核對來源：'+esc(x.sourceTitle)+' · '+(x.confidence==="exact"?"作品名吻合":"可能係輸入錯字")+'</small><span>確認使用此作品 →</span></button>').join("")+'</div>':"";
 const mediaForm='<p>選擇現有電影、劇集、動畫、小說或遊戲嘅世界，由你親自加入故事。主神仍會發佈任務，唔會直接重演原作劇情。</p><div class="world-mediums">'+media.map(x=>'<button class="'+(temporary.worldMedia===x?"selected":"")+'" data-do="worldMedia:'+x+'">'+x+'</button>').join("")+'</div><label for="media-world-name" class="world-input-label">作品名稱</label><input id="media-world-name" class="custom-world-input" value="'+esc(temporary.mediaWorldDraft)+'" maxlength="50" placeholder="例如：死亡筆記、進擊的巨人" aria-label="作品世界名稱"><p class="minor-meta">已收錄世界：220 積分；其他作品：300 積分起，需 AI 生成。原作人物與設定會盡量保留，但生成內容並非官方劇情。</p>';
 const originalForm='<p>完全由你構思世界。可以係規則怪談、末日、仙俠、懸疑或者任何原創背景；AI 會根據你嘅規則設計人物、危機同故事。</p><label for="original-world-name" class="world-input-label">原創世界名稱</label><input id="original-world-name" class="custom-world-input" value="'+esc(temporary.originalWorldDraft)+'" maxlength="50" placeholder="例如：零號月台、深海第七城" aria-label="原創世界名稱"><label for="original-world-premise" class="world-input-label">世界背景與核心規則</label><textarea id="original-world-premise" class="world-premise-input" maxlength="450" rows="4" placeholder="例如：每晚十二點，失蹤者會收到一張沒有終點站的車票。車上有三條禁忌規則，每個人都在隱瞞自己的目的……" aria-label="原創世界背景與規則">'+esc(temporary.originalPremiseDraft)+'</textarea><p class="minor-meta">背景需最少 12 字。入場費 300 積分起，由 AI 擴展你提供嘅設定；無法生成時，首次行動前可取消並退款。</p>';
 customCard=card("額外權限 · 自選世界",types+'<div class="world-form">'+(original?originalForm:mediaForm)+(!original?mediaVerify:"")+a(original?"付費構築自創世界":"先核對作品名稱 · 不扣積分","customWorld","block main")+status+'</div>');
}
let returnLinks=s.discovered.length?card("定向返回已去過的世界",s.discovered.map(id=>{let w=world(id),unlocked=s.coord[id];return '<div class="return-row"><div><b>'+esc(w?.name||id)+'</b><small>'+(unlocked?"座標已解鎖":"須先付費解鎖座標")+'</small></div>'+a("查看代價","coord:"+id,"small ghost")+'</div>'}).join("")):"";
return section("MAIN GOD / WORLD TRANSFER","輪迴傳送終端","主神發佈任務與目標；返回主神空間後 HP、STA、MP、SAN 全部免費恢復，再進入下一個世界。")+'<div class="scroll-content column-gap">'+protagonistSetup+banner+stages+customCard+returnLinks+'</div>'}
function mood(i,worldId){if(worldId==="deathnote"&&i===5)return "grief";if(worldId==="alice"&&i===2)return "anger";if(worldId==="demon"&&i===0)return "system";return ["calm","suspense","eerie","dialogue","shock","resolve"][i%6]}

function missionStory(){return N.excerpt(s)}
function eplusMode(){
if(s.settings.reducedMotion)return "off";
const mode=s.settings.eplusMode;
return mode==="standard"||mode==="off"||mode==="strong"?mode:"strong"
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
 const scene=N.get(s),novel=m.aiScenes?.[m.phase]||(m.director?null:window.NW_NOVEL?.scene(s))||{title:"世界構築中",mood:"system",blocks:[{type:"system",text:"主神正在續寫輪迴世界。本幕尚未生成，請等待或重試……"}]},w=m.world==="custom"?{name:m.worldName}:world(m.world);
 const choices=scene.actions.map((o,i)=>'<button class="narrative-choice" data-do="act:'+i+'" '+(o.usable?"":"disabled")+'><span class="choice-no">0'+(i+1)+'</span><span class="choice-main"><b>'+esc(o.label)+'</b>'+(o.hint?'<small>'+esc(o.hint)+'</small>':"")+prettyEffects(o)+(o.reasons.length?'<small class="blocked">'+esc(o.reasons.join("、"))+'</small>':"")+'</span></button>').join("");
 const blocks=novel?.blocks||[];
 const prose=blocks.map((b,i)=>{
  const effect=i<8&&/（警告|警告|危險|主神提示|任務更新|警報）/.test(b.text||"")?"fx-alert":i<8&&/（死亡|斷氣|死了|失去呼吸|倒在血泊）/.test(b.text||"")?"fx-death":i<8&&/（真相|終於明白|我明白了|關鍵線索|原來如此）/.test(b.text||"")?"fx-reveal":"";
  const begin='<div class="novel-beat '+effect+'" style="--beat:'+Math.min(i,10)+'" data-beat="'+i+'">';
  if(b.type==="dialogue")return begin+'<div class="novel-dialogue" data-voice="'+i+'"><b>'+esc(b.speaker)+'</b><p>'+esc(b.text)+'</p></div></div>';
  if(b.type==="system")return begin+'<div class="novel-system">'+esc(b.text)+'</div></div>';
  return begin+literaryProse(b.text||"").split(/\n\n/).filter(Boolean).map(p=>'<p class="'+(b.consequence?"novel-choice-consequence":"")+'">'+esc(p)+'</p>').join("")+'</div>';
 }).join("");
 const notice=scene.exertion?'<span class="narrative-condition">持續'+(scene.exertion==="run"?"奔跑":"潛行")+'中</span>':"";
 const bar='<div class="story-top"><span>'+esc(w.name)+' <small>· '+esc(m.title)+'</small></span><button data-do="status">狀態 ◈</button></div>';
 const toolbox='<div class="story-toolbar"><span>第 '+(m.phase+1)+(m.director?' 章 · 輪迴長篇':' / 6 章 · 離線篇')+'　·　'+esc(novel?.title||"輪迴世界")+'</span><div>'+a("任務","taskinfo","tiny ghost")+a("技能","skills","tiny ghost")+a("行囊","items","tiny ghost")+a("記錄","logs","tiny ghost")+a(eplusMode()==="strong"?"E+強":eplusMode()==="standard"?"E+標":"E+關","toggleMotion","tiny ghost")+'</div></div>';
 const popups=[];
 if(temporary.showStatus)popups.push('<div class="mission-popup"><div class="card-heading">輪迴者狀態</div><div class="narrative-stat-grid">'+["hp","sta","mp","san"].map((k,i)=>'<div><span>'+D.stats[i].name+'</span><b>'+Math.round(s.profile[k])+' / '+D.stats[i].max+'</b></div>').join("")+'</div><p class="popup-note">只有發生體力消耗、施展術式或受到傷害時，才需要特別注意數值。</p>'+a("關閉","status","small ghost")+'</div>');
 if(temporary.showItems)popups.push('<div class="mission-popup"><div class="card-heading">本次攜帶的物品</div>'+Object.entries(m.bag).filter(([id,n])=>n>0).map(([id,n])=>'<button class="button-row" data-do="use:'+id+'">'+esc(objId(id)?.name)+' ×'+n+' <span>使用 ›</span></button>').join("")+a("關閉","items","small ghost")+'</div>');
 if(temporary.showSkills)popups.push('<div class="mission-popup"><div class="card-heading">已配置的招式與技能</div><p class="popup-note">招式不會自動取代劇情選項；招式可以在合適的劇情節點使用。</p>'+N.skills(s).map(x=>'<button class="button-row story-skill" data-do="cast:'+x.id+'" '+(x.ok?"":"disabled")+'><div><b>'+esc(x.name)+'</b><small>'+esc(x.desc)+'</small><small>'+(x.sta?"STA −"+x.sta+" ":"")+(x.mp?"MP −"+x.mp:"")+(x.reasons.length?" · "+esc(x.reasons.join("、")):"")+'</small></div><span>使用 ›</span></button>').join("")+a("關閉","skills","small ghost")+'</div>');
 if(temporary.showLog)popups.push('<div class="mission-popup"><div class="card-heading">輪迴經歷</div><div class="log-lines">'+m.log.slice(-12).map(x=>'<p>'+esc(x)+'</p>').join("")+'</div>'+a("關閉","logs","small ghost")+'</div>');
 if(temporary.showTask)popups.push('<div class="mission-popup"><div class="card-heading">主神任務</div><p class="popup-note">'+esc(m.title)+' · '+esc(m.worldName)+'</p><p class="popup-note">'+esc(m.objective)+'</p>'+
(m.director?'<p class="popup-note">長篇輪迴 · 第 '+(m.phase+1)+' 幕 · '+esc(m.phase<5?"調查":m.phase<10?"人物關係":m.phase<16?"危機升級":m.phase<23?"決戰":"結局")+'</p>'+
(m.missionArc||[]).map((q,i)=>'<p class="popup-note">階段 '+(i+1)+'：'+esc(q)+'</p>').join(""):'<p class="popup-note">當前進度：'+m.progress+' / '+m.required+'</p>')+
(m.directorPlan?.threads||[]).filter(t=>t.status==="open").slice(-3).map(t=>'<p class="popup-note"><b>未解伏筆：</b>'+esc(t.setup)+' · 第'+(t.chapter+1)+'章埋下</p>').join("")+
(m.director&&m.phase>=19?'<p class="popup-note"><b>結局一致性檢查：</b>未交代人物 '+esc((window.NW_BIBLE?.endingAudit?.(s)?.unclearCharacters||[]).join("、")||"無")+'</p>':"")+
(m.quests||[]).map(q=>'<p class="popup-note"><b>支線：</b>'+esc(q.title)+' · '+(q.status==="completed"?"已完成":q.progress+"/"+q.required)+' · '+esc(q.objective)+(q.evidence?.length?' · 有效線索：'+esc(q.evidence.at(-1).action):'')+'</p>').join("")+
(m.canon?.url?'<p class="popup-note">公開原作資料：<a href="'+esc(m.canon.url)+'" target="_blank" rel="noopener noreferrer">'+esc(m.canon.title)+' ↗</a></p>':"")+
(m.hidden?'<p class="popup-note">已發現隱藏任務線索</p>':"")+a("關閉","taskinfo","small ghost")+'</div>');
 const freeReview=temporary.freeReview;
 if(freeReview&&freeReview.key===aiSceneKey(m)&&freeReview.phase===m.phase){
  const effects=freeReview.effects?.length?freeReview.effects.join(" · "):"無即時體力消耗";
  popups.push('<div class="mission-popup" role="dialog" aria-label="確認自由文字行動"><div class="card-heading">確認小說情節行動</div><p class="popup-note">主角將會：'+esc(freeReview.value)+'</p><p class="popup-note">判定：'+esc(freeReview.label)+' · '+esc(effects)+'</p><p class="popup-note">確認後，劇情同角色資源才會改變。</p><div class="free-confirm-actions">'+a("確認執行","freeConfirm","small main")+a("修改文字","freeCancel","small ghost")+'</div></div>');
 }
 return '<div class="mission-stage narrative-stage novel-first-stage">'+bar+
 '<div class="scene-prose '+(eplusMode()==="off"?"motion-off ":"")+'fx-'+temporary.fxPerform+'" data-mood="'+(novel?.mood||"calm")+'" data-eplus="'+eplusMode()+'">'+(temporary.fxPerform!=="static"&&eplusMode()!=="off"?'<button class="eplus-skip" data-do="skipFx">跳過演出 ›</button>':"")+'<div class="scene-eyebrow">'+esc(novel?.title||"輪迴世界")+'　·　'+({solo:"獨行篇",team:"同行篇",versus:"對峙篇"}[novel?.mode]||novel?.mode||"輪迴篇")+'</div>'+prose+'</div>'+((temporary.aiPending&&temporary.aiKey===aiSceneKey(m))?'<div class="ai-state">AI 正在續寫……</div>':temporary.aiError?'<div class="ai-state">'+esc(temporary.aiError)+'　'+a("重試","aiRetry","tiny ghost")+a("檢查 AI","nav:settings","tiny ghost")+(m.world==="custom"?a("取消並退款","cancelCustom","tiny ghost"):"")+'</div>':"")+
 toolbox+'<div class="fixed-choices story-choice-panel">'+notice+choices+
 '<div class="free-row"><input id="free-action" maxlength="180" placeholder="亦可自行決定下一步情節……" value="'+esc(temporary.freeDraft)+'" aria-label="自訂行動" '+((m.world==="custom"||m.director)&&!scene.actions.length?"disabled":"")+'>'+a("預覽行動","free","tiny main",m.world==="custom"&&!scene.actions.length?"disabled":"")+'</div></div>'+
 '<div class="story-footer"><button data-do="nav:profile">角色檔案</button><span>'+(m.mode==="solo"?"單人輪迴":m.mode==="team"?"協同任務":"敵對輪迴者在場")+'</span><button data-do="nav:memory">輪迴紀錄</button></div>'+popups.join("")+'</div>'
}
function resultUI(){
const m=s.mission,g=m.result,report=m.reward;
const ranking=g==="A"?"主神任務完成":g==="B"?"存活，部分目標達成":"任務失敗";
const rows=piece("任務類型",({solo:"單人",team:"團隊合作",versus:"對抗"}[m.mode]))+
piece("主線進度",m.progress+" / "+m.required)+
piece("主神積分","+"+report.credits)+
piece("角色經驗","+"+report.xp)+
piece("最終生命",s.profile.hp+" / 100")+
(m.loot?piece("世界戰利品",esc(objId(m.loot)?.name||m.loot)):"")+
(m.hidden?piece("隱藏任務","已發現 · 額外獎勵"):"");
return '<div class="mission-result-screen">'+
'<div class="mission-result-scroll" role="region" aria-label="任務結算詳情" tabindex="0">'+
'<div class="mission-result-content">'+
'<div class="eyebrow">MAIN GOD / WORLD EVALUATION</div>'+
'<div class="rank">'+g+'</div><h1>'+ranking+'</h1>'+
'<p>《'+esc(m.worldName)+'》· '+esc(m.title)+'</p>'+
'<div class="result-panel">'+rows+'</div>'+
'<div class="result-quote">'+esc(m.log.slice(-3).join("　"))+'</div>'+
card("主神恢復協議","返回主神空間後，生命 HP、體力 STA、靈力 MP、精神 SAN 均自動回滿，不消耗主神積分。")+
'</div></div>'+
'<div class="mission-result-actions">'+
'<p>獎勵已計算 · 確認後保存輪迴紀錄</p>'+
a("領取獎勵並返回主神空間　›","claim","block main")+
'</div></div>'
}
function memory(){const mode=temporary.memoryTab, tabs=[["timeline","輪迴記錄"],["worlds","世界情報"],["relations","隊友關係"],["system","主神備忘"]];let body="";
if(mode==="timeline")body=s.records.length?s.records.map(r=>card("《"+esc(r.worldName||world(r.world)?.name||r.world)+"》 · "+r.result,esc(task(r.task)?.name||r.task)+" · "+({solo:"單人",team:"團隊",versus:"對抗"}[r.mode])+'<div class="rule"></div>'+r.choices.map(x=>'<p class="record-choice">'+esc(x)+'</p>').join("")+'<div class="minor-meta">'+new Date(r.date).toLocaleString("zh-HK")+'</div>')).join(""):card("尚未有輪迴記錄","正式完成第一個世界後，所有重大選擇會留在這裡。");
if(mode==="worlds"){
const library=Object.values(s.worldLibrary||{});
body=library.length?library.map(r=>card(esc(r.name),
'<p class="minor-meta">已訪問 '+(r.visits||0)+' 次 · 已發現 '+(r.facts||[]).length+' 條線索</p>'+
(r.source?.url?'<p class="minor-meta"><a href="'+esc(r.source.url)+'" target="_blank" rel="noopener noreferrer">原作公開資料：'+esc(r.source.title)+' ↗</a></p>':"")+
(r.facts||[]).slice(-8).map(x=>'<p>◈ '+esc(x)+'</p>').join("")+
Object.entries(r.npcs||{}).slice(0,10).map(([name,v])=>'<p><b>'+esc(name)+'</b> · 信任 '+(v.trust||0)+' · '+esc(v.memory||"")+'</p>').join(""))).join(""):card("未知世界","輪迴後會永久收錄原作、人物、線索同你作出嘅選擇。")
}
if(mode==="relations")body=D.companions.map(c=>card(esc(c.name)+" · "+esc(c.role),esc(c.bio)+'<div class="minor-meta">關係值 '+(s.bonds[c.id]||0)+'</div>')).join("");
if(mode==="system")body=card("主神規則說明","世界與任務由主神決定；定向返回需要先到訪，再支付座標解鎖及定向傳送代價。") +card("劇情記憶","歷史抉擇、線索、戰利品、隊友關係在本裝置持久保存。") +card("真人多人連線","目前團隊與對抗採用 AI 輪迴者的確定性規則模擬；尚未啟用伺服器同步、真人配對及即時 PvP。");
return section("MAIN GOD ARCHIVE","輪迴記錄","主神會保存重大抉擇與線索；世界居民亦應根據合理身份和記憶作出反應。")+'<div class="tabbar">'+tabs.map(x=>'<button class="'+(mode===x[0]?"on":"")+'" data-do="tab:memory:'+x[0]+'">'+x[1]+'</button>').join("")+'</div><div class="scroll-content column-gap">'+body+'</div>'}
function settings(){
 const mode=eplusMode(),cloud=window.NW_CLOUD?.status?.()||{enabled:false,key:"",revision:0};
 const lastUsage=s.aiLastUsage;
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
 card("閱讀",piece("E+ 文字演出強度",mode==="strong"?"強烈（逐字對白＋情緒場景）":mode==="standard"?"標準（輕量演出）":"關閉（靜態閱讀）",a("切換模式","toggleMotion","small")))+
 groqCard+usageCard+cloudCard+card("本機存檔",piece("已完成輪迴",s.records.length+" 次")+a("匯出角色存檔 JSON","export","block ghost"))+'</div>'
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
 R.innerHTML='<div class="app-shell '+(inGame?"in-game":"")+'">'+(inGame?"":header())+'<main class="app-main">'+screen()+'</main>'+(inGame?"":foot())+(temporary.notice?'<div class="toast">'+esc(temporary.notice)+'</div>':"")+'</div>';
 if(same&&oldY>0){const pane=R.querySelector?.(".scene-prose");if(pane)pane.scrollTop=oldY}
 window.NW_EFFECTS?.cancel?.();
 if(fresh){temporary.fxSeen=fxKey;window.NW_EFFECTS?.play?.(R,{mode})}
 persist();if(inGame)scheduleAiScene()
}
function handle(cmd){if(!cmd)return;
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
  const premise=R.querySelector("#original-world-premise")?.value||"";
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
  const err=E.assignCustomWorld(s,choice.title,temporary.aiConfigured,{kind:"adaptation",mediaType:choice.mediaType,verifiedTitle:choice.title,verifiedSource:choice.sourceUrl});
  if(err)return notice(err);temporary.worldMatches=[];render()
 };
 if(!temporary.aiConfigured){checkAiStatus(true).then(ok=>ok?commit():notice("AI 無法連線，未扣積分"));return}commit();return
}
if(cmd==="assign"){let err=E.mainGodAssign(s);if(err)return notice(err);render();return}
if(cmd.startsWith("coord:")){let err=E.assignReturn(s,cmd.slice(6));if(err)return notice(err);render();return}
if(cmd==="launch"){
 if(!playerName())return notice("開始故事之前先設定主角姓名");
 const startNovel=()=>{
  if(!temporary.aiConfigured)return notice("目前 AI 未連線。為避免誤入六幕短篇，請先在設定頁檢查 AI 連線。");
  const err=E.launch(s);if(err)return notice(err);
  s.mission.director=true;
  temporary.showItems=false;temporary.showLog=false;temporary.showSkills=false;temporary.showStatus=false;render()
 };
 if(!temporary.aiConfigured){checkAiStatus(true).then(startNovel);return}
 startNovel();return
}
if(cmd==="cycleSkill"){E.changeSkill(s,(s.mission?.chosenSkill||0)+1);render();return}
if(cmd.startsWith("act:")){let out=N.choose(s,Number(cmd.slice(4)));if(out.error)return notice(out.error);temporary.freeReview=null;temporary.freeDraft="";render();return}
if(cmd==="free"){
 const value=R.querySelector("#free-action")?.value??temporary.freeDraft;
 temporary.freeDraft=value;
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
 temporary.freeReview=null;temporary.freeDraft="";render();return
}
if(cmd==="items"){temporary.showItems=!temporary.showItems;temporary.showLog=false;temporary.showSkills=false;temporary.showStatus=false;render();return}
if(cmd==="logs"){temporary.showLog=!temporary.showLog;temporary.showItems=false;temporary.showSkills=false;temporary.showStatus=false;render();return}
if(cmd==="taskinfo"){temporary.showTask=!temporary.showTask;temporary.showStatus=false;temporary.showItems=false;temporary.showSkills=false;temporary.showLog=false;render();return}
if(cmd==="status"){temporary.showStatus=!temporary.showStatus;temporary.showItems=false;temporary.showSkills=false;temporary.showLog=false;render();return}
if(cmd==="skills"){temporary.showSkills=!temporary.showSkills;temporary.showItems=false;temporary.showStatus=false;temporary.showLog=false;render();return}
if(cmd.startsWith("cast:")){const out=N.useSkill(s,cmd.slice(5));if(out.error)return notice(out.error);temporary.showSkills=false;render();return}
if(cmd.startsWith("use:")){let err=N.useItem(s,cmd.slice(4));if(err)return notice(err);temporary.showItems=false;notice("道具已使用，效果已套用。");return}
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
if(cmd==="toggleMotion"){const next=eplusMode()==="strong"?"standard":eplusMode()==="standard"?"off":"strong";s.settings.eplusMode=next;s.settings.reducedMotion=next==="off";temporary.fxSeen="";temporary.fxSkippedFor="";render();return}
if(cmd==="skipFx"){temporary.fxSkippedFor=temporary.fxSceneKey;window.NW_EFFECTS?.skip?.();const pane=R.querySelector?.(".scene-prose");pane?.classList?.add("fx-static");pane?.classList?.remove("fx-strong","fx-standard");const skip=R.querySelector?.(".eplus-skip");if(skip)skip.hidden=true;return}
if(cmd==="export"){try{const blob=new Blob([JSON.stringify(s,null,2)],{type:"application/json"}),url=URL.createObjectURL(blob),a=document.createElement("a");a.href=url;a.download="nightwalker-save.json";document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),2000)}catch(_){notice("此瀏覽器暫不支援匯出。")}return}
}
R.addEventListener("input",ev=>{const el=ev.target;if(el.id==="free-action")temporary.freeDraft=el.value.slice(0,180);if(el.id==="media-world-name"){temporary.mediaWorldDraft=el.value.slice(0,50);temporary.worldMatches=[];temporary.worldLookupError="";}if(el.id==="protagonist-name")temporary.nameDraft=el.value.slice(0,20);if(el.id==="original-world-name")temporary.originalWorldDraft=el.value.slice(0,50);if(el.id==="original-world-premise")temporary.originalPremiseDraft=el.value.slice(0,450)});
R.addEventListener("click",ev=>{let t=ev.target.closest("[data-do]");if(!t||t.disabled)return;handle(t.dataset.do)});
render();
checkAiStatus();
})();
