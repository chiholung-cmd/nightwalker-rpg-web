(function(){
"use strict";
const D=window.NW_DATA,E=window.NW_ENGINE,R=document.getElementById("app");
if(!D||!E){R.textContent="主神資料讀取失敗：請重新整理。";return}
let s=E.load(),temporary={panel:"",notice:"",noticeTimer:0,filter:"all",warehouseMode:"storage",profileTab:"overview",gearSlot:"",activePage:0,skillPage:"all",memoryTab:"timeline",showItems:false,showLog:false};
const esc=v=>String(v??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const q=v=>"'"+esc(v)+"'";
const num=n=>Number(n||0).toLocaleString("en-US");
const tag=(txt,type="")=>'<span class="chip '+type+'">'+esc(txt)+'</span>';
const a=(label,cmd,cls="",props="")=>'<button class="btn '+cls+'" data-do="'+esc(cmd)+'" '+props+'>'+label+'</button>';
const objId=id=>D.items.find(x=>x.id===id);
const skill=id=>D.skills.find(x=>x.id===id);
const world=id=>D.worlds.find(x=>x.id===id);
const task=id=>D.tasks.find(x=>x.id===id);
const icon={hub:"◎",profile:"◈",warehouse:"▥",loadout:"⚒",upgrade:"✧",portal:"◌",memory:"▤",settings:"⚙"};
function persist(){E.save(s)}
function notice(text){temporary.notice=text;render();clearTimeout(temporary.noticeTimer);temporary.noticeTimer=setTimeout(()=>{temporary.notice="";render()},3300)}
function go(screen){s.screen=screen;temporary.panel="";temporary.showItems=false;persist();render()}
function bar(label,value,max,color){let pct=Math.max(0,Math.min(100,100*(value||0)/max));return '<div class="gauge"><div class="gauge-meta"><span>'+label+'</span><b>'+Math.round(value||0)+'<em> / '+max+'</em></b></div><div class="gauge-track"><span style="width:'+pct+'%;background:'+color+'"></span></div></div>'}
function section(kicker,title,text=""){return '<div class="headings"><div class="eyebrow">'+esc(kicker)+'</div><h1>'+title+'</h1>'+(text?'<p>'+text+'</p>':"")+'</div>'}
function piece(title,desc="",right=""){return '<div class="piece"><div><b>'+title+'</b>'+(desc?'<small>'+desc+'</small>':"")+'</div>'+right+'</div>'}
function divLine(){return '<div class="rule"></div>'}
function header(){const p=s.profile;return '<header class="mast"><button class="wordmark" data-do="nav:hub"><span>NIGHTWALKER</span><em>∞</em><small>主神序列 / 0000</small></button><div class="mast-user"><strong>輪迴者 · LV.'+p.level+'</strong><small>積分 <span>'+num(p.credits)+'</span></small></div></header>'}
function foot(){const nav=[["hub","主神"],["profile","角色"],["warehouse","倉庫"],["loadout","配裝"],["upgrade","強化"]];return '<nav class="bottom-nav">'+nav.map(([id,name])=>'<button class="'+(s.screen===id?"on":"")+'" data-do="nav:'+id+'"><span>'+icon[id]+'</span><small>'+name+'</small></button>').join("")+'</nav>'}
function pillRow(){let p=s.profile;return '<div class="vitals">'+bar("HP",p.hp,100,"#d8a2aa")+bar("STA",p.sta,100,"#dec993")+bar("MP",p.mp,60,"#93bbd9")+bar("SAN",p.san,100,"#b8a3d7")+'</div>'}
function hub(){const recent=s.memory[0]?.text||"輪迴者身份已驗證。主神已注意到你殘缺的記憶。";return '<div class="hub-hero"><div class="orbit orbit-outer"></div><div class="orbit orbit-inner"></div><div class="infinity">∞</div><div class="hero-message"><span class="eyebrow">MAIN GOD / RETURN CHAMBER</span><h1>歡迎歸還，<br>輪迴者。</h1><p>「命運並非獎賞。每一次歸來，都是一次重新開始的機會。」</p><small>主神監察狀態：正常　/　記憶同步：異常</small></div></div><div class="home-content"><div class="identity-strip"><div><small>輪迴者 0000</small><b>夜行者 · LV.'+s.profile.level+'</b></div><div style="text-align:right"><small>主神積分</small><b class="gold">'+num(s.profile.credits)+'</b></div></div>'+
'<div class="hub-grid">'+[
["profile","◈","輪迴者檔案","身份・能力・關係"],
["warehouse","▥","主神倉庫","永久戰利品儲存"],
["loadout","⚒","戰前配裝","武器・招式・物品"],
["upgrade","✧","主神強化","屬性・技能・血脈"]
].map(x=>'<button class="hub-tile" data-do="nav:'+x[0]+'"><span class="tile-icon">'+x[1]+'</span><b>'+x[2]+'</b><small>'+x[3]+'</small></button>').join("")+'</div>'+
'<button class="portal-button" data-do="nav:portal"><span class="portal-glyph">◌</span><span><b>'+(s.mission?"返回正在進行的輪迴":s.assignment?"主神已指派輪迴世界":"接受下一次主神指派")+'</b><small>'+(s.mission?"任務："+s.mission.title:s.assignment?"任務資料已封存，等待你的戰前準備":"世界、任務類型與隊伍均由主神決定")+'</small></span><span class="chev">›</span></button>'+
'<div class="hub-record"><div class="eyebrow">最近記憶／主神日誌</div><p>'+esc(recent)+'</p><button data-do="nav:memory">查看輪迴記錄　›</button></div>'+
'</div>'}
function profile(){const p=s.profile,t=temporary.profileTab;let tabs=[["overview","總覽"],["attributes","能力"],["gear","裝備"],["relations","關係"],["records","輪迴"]];let content="";
if(t==="overview")content='<div class="profile-art"><div class="profile-seal"><span>∞</span></div><div><div class="eyebrow">REINCARNATOR · NO.0000</div><h2>夜行者</h2><p>'+esc(p.title)+'</p><span class="chip warm">LV.'+p.level+' · 生存觀察者</span></div></div>'+pillRow()+'<div class="two-cols">'+statCard("基礎強度",p.attrs.str+p.attrs.agi+p.attrs.con)+statCard("精神感知",p.attrs.per+p.attrs.wil)+'</div>'+card('主神判定','已完成輪迴：'+p.missions+' 次。'+(s.records.length?"最近世界《"+world(s.records[0].world)?.name+"》。":"尚未取得完整輪迴紀錄。"))+card("血脈／異能",s.profile.bloodline?esc(D.bloodlines.find(x=>x.id===s.profile.bloodline)?.name||"未知血脈"):"未覺醒（主神強化 Lv.5 起可解鎖）")+card("命運標籤","觀察者 · 未歸之人 · 記憶重置疑雲");
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
function upgrade(){const p=s.profile;let attrs=D.attributes.map(([id,name])=>{let cost=80+(p.attrs[id]-6)*30;return '<div class="upgrade-row"><div><b>'+name+'</b><small>當前 '+p.attrs[id]+' · 下一級 '+(p.attrs[id]+1)+'</small></div>'+a("+1　"+cost+" 積分","boost:"+id,"small prime")+'</div>'}).join("");
let skills=D.skills.filter(x=>!["strike","guard","observe","focus"].includes(x.id)).map(sk=>{const learned=s.learned.includes(sk.id),price=D.skillPrices[sk.id]||0,locks=E.tierOK(s,sk);return '<div class="upgrade-row"><div><b>'+esc(sk.name)+'</b><small>'+esc(sk.desc)+'</small><div class="minor-meta">Lv.'+sk.tier+' · '+(sk.active?"主動":"被動")+' · STA '+(sk.sta||0)+' / MP '+(sk.mp||0)+' · CD '+(sk.cooldown||0)+'</div></div>'+a(learned?"已習得":locks.length?"需 LV."+sk.tier:price+" 積分","learn:"+sk.id,"small "+(learned||locks.length?"ghost":"prime"),learned||locks.length?'disabled':"")+'</div>'}).join("");
return section("REINFORCEMENT NETWORK","主神強化","屬性門檻、已習得技能及出戰配置分開管理；購買後仍要裝入招式欄。")+'<div class="scroll-content column-gap">'+card("基礎身體與精神屬性",attrs)+card("技能學習與進化",skills)+card("血脈覺醒（排他路線）",D.bloodlines.map(b=>{const reasons=[];if(p.level<b.tier)reasons.push("Lv."+b.tier);if(p.missions<b.missions)reasons.push("輪迴 "+b.missions+" 次");for(const id in b.requires)if((p.attrs[id]||0)<b.requires[id])reasons.push(id+" ≥ "+b.requires[id]);return '<div class="upgrade-row"><div><b>'+esc(b.name)+'</b><small>'+esc(b.effect)+'</small><small style="color:#f0bbc4">副作用：'+esc(b.drawback)+'</small><div class="minor-meta">'+(reasons.join(" / ")||"符合條件")+'</div></div>'+a(p.bloodline===b.id?"已覺醒":p.bloodline?"已有血脈":reasons.length?"未解鎖":b.cost+" 積分","blood:"+b.id,"small "+(p.bloodline||reasons.length?"ghost":"prime"),(p.bloodline||reasons.length)?"disabled":"")+'</div>'}).join(""))+a("前往技能配置","nav:loadout","block main")+'</div>'}
function missionBoard(){if(s.mission)return missionUI();
let banner=s.assignment?(()=>{let t=task(s.assignment.task),w=world(t.world);return '<div class="assigned"><div class="eyebrow">MAIN GOD / ASSIGNED SCENARIO</div><span class="mode-label">'+({solo:"單人任務",team:"團隊任務",versus:"對抗任務"}[t.mode])+'</span><h2>'+esc(t.name)+'</h2><p>《'+w.name+'》 · '+esc(w.tone)+'</p><div class="rule"></div><h3>主線目標</h3><p>'+esc(t.goal)+'</p><div class="assigned-desc">'+esc(t.desc)+'</div><small>隱藏任務：尚未公開。世界及模式已鎖定，無法免費重抽。</small></div>'})():'<div class="unassigned"><div class="main-god-eye">◌</div><div class="eyebrow">DESTINY LOCKED / UNKNOWN</div><h2>主神尚未公布你的下一個世界</h2><p>可能進入電影、動畫或劇集世界。每次任務可為單人、合作小隊或對抗任務，主神將決定你的入場位置與身份。</p></div>';
let stages=s.assignment?card("傳送前最後確認",'<div class="summary-lines">'+piece("主武器",objId(s.loadout.weapon)?.name||"無")+piece("防具",objId(s.loadout.armor)?.name||"無")+piece("主動技能",s.loadout.active.map(x=>skill(x)?.name).join("、"))+piece("行囊",s.loadout.backpack.length+" 件 · "+E.weight(s)+"/"+E.capacity(s)+" 負重")+'</div>'+a("重新配置裝備","nav:loadout","block ghost")+a("確認 Loadout，正式進入世界","launch","block main")):a("接受主神隨機指派","assign","block main");
let returnLinks=s.discovered.length?card("定向返回已去過的世界",s.discovered.map(id=>{let w=world(id),unlocked=s.coord[id];return '<div class="return-row"><div><b>'+esc(w?.name||id)+'</b><small>'+(unlocked?"座標已解鎖":"須先付費解鎖座標")+'</small></div>'+a("查看代價","coord:"+id,"small ghost")+'</div>'}).join("")):"";
return section("MAIN GOD / WORLD TRANSFER","輪迴傳送終端","主神發佈任務與目標；成功完成後將記錄本次世界與所有重大抉擇。")+'<div class="scroll-content column-gap">'+banner+stages+returnLinks+'</div>'}
function mood(i,worldId){if(worldId==="deathnote"&&i===5)return "grief";if(worldId==="alice"&&i===2)return "anger";if(worldId==="demon"&&i===0)return "system";return ["calm","suspense","eerie","dialogue","shock","resolve"][i%6]}
function missionStory(){let m=s.mission,w=world(m.world),t=task(m.task),p=m.phase;let title=p===0?"初入世界":p===5?"最後一幕":"第 "+(p+1)+" 幕";let opening=p===0?w.intro:p<=4?w.beats[Math.min(3,p-1)]:"距離這次輪迴的結束已經不遠。你握緊手中的裝備，重新檢查剩餘的體力與靈力。主神沒有改變任務要求，卻也沒有承諾所有人都能活著離開。";
let teammate=m.crew[(p||0)%Math.max(1,m.crew.length)];
let char=teammate?teammate.name:(p%2===0?w.npc:m.mode==="versus"?"敵隊輪迴者":w.npc);
let speak=teammate?"「不要急著作出結論。」"+teammate.name+"留意著你的動作，「我會負責"+teammate.skill+"，你只需要按照我們的計畫行動。」":p===0?w.talk: (m.mode==="versus"&&m.rival?"「想完成主神任務，就先證明你有資格。」"+m.rival.name+"隱約露出笑意，卻始終沒有放鬆警戒。":"「主神的規則已經說得很清楚。」"+w.npc+"望向你，「但我們能否活著出去，還要看接下來的選擇。」");
let mode=m.mode==="solo"?"這一次，主神只派遣你一名輪迴者。周圍的世界人物並不知道你真正的來歷。":m.mode==="team"?"腕上的印記傳來第二道訊息：【小隊協同任務。】你的同伴並非固定跟班，他們各自擁有能力、判斷與目的。":"主神在你的視野中標出一道紅色符號：【敵對輪迴者已進入同一區域。】你們將爭奪相同的任務資源，但未必需要互相殺死才能分出勝負。";
let last=m.roundEvents.length?"<p class='consequence'>"+esc(m.roundEvents.slice(-3).join("　"))+"</p>":"";
let dynamic=m.phase>0?"你回想起剛才的抉擇，"+esc(m.history.at(-1)?.action||"") +"。這件事已經寫入主神的行動記錄，甚至可能影響你與其他輪迴者日後再會時的態度。":"";
let objective="<p class='system-line'>【主神主線】"+esc(t.goal)+"<br>【目前進度】"+m.progress+" / "+m.required+(m.hidden?"<br>【隱藏任務】"+esc(t.hidden):"")+"　【對抗類型】"+({solo:"單人",team:"小隊",versus:"敵對輪迴"}[m.mode])+"</p>";
return {title,opening,mode,speak,char,last,dynamic,objective,ending:"你聽見自己的心跳逐漸加快，卻依然清楚地看見眼前每一條可選的道路。此刻最重要的，不是猜測主神希望你作出甚麼決定，而是利用你真正擁有的裝備與能力，找到能夠承受後果的行動。"}}
function costChip(x){let n=x>0?"−"+x:"+"+Math.abs(x);return tag(n, x>0?"negative":"positive")}
function preview(a){let p=[];if(a.sta!==undefined)p.push('<span class="effect '+(a.sta>0?"bad":"good")+'">STA '+(a.sta>0?"−"+a.sta:"+"+(-a.sta))+'</span>');if(a.mp>0)p.push('<span class="effect bad">MP −'+a.mp+'</span>');if(a.damagePreview)p.push('<span class="effect good">敵 HP 約 −'+a.damagePreview.join("～")+'</span>');if(a.progress)p.push('<span class="effect good">任務進度 +'+a.progress+'</span>');
if(a.hpRisk&&a.hpRisk[1]>0)p.push('<span class="effect bad">HP 估計 −'+a.hpRisk[0]+'～'+a.hpRisk[1]+'</span>');
if(a.sanPreview)p.push('<span class="effect bad">SAN 約 −'+a.sanPreview+'</span>');
if(a.bondPreview)p.push('<span class="effect good">隊友信任 +'+a.bondPreview+'</span>');if(a.id==="guard")p.push('<span class="effect good">減傷／SAN 恢復</span>');return p.join("")}
function missionUI(){const d=E.derived(s),m=s.mission,story=missionStory(),w=d.w;
if(m.finished)return resultUI();
let primary=w.id==="demon"?"鬼物動向":"主神監察",foe=d.isFight?'<span class="foe-stat">'+esc(m.enemy.name)+'　'+m.enemy.hp+'/'+m.enemy.max+' HP</span>':"";
let choices=d.actions.map((o,i)=>'<button class="narrative-choice" data-do="act:'+i+'" '+(o.usable?"":"disabled")+'><span class="choice-no">0'+(i+1)+'</span><span class="choice-main"><b>'+esc(o.name)+'</b><small>'+esc(o.desc)+'</small><span class="effects">'+preview(o)+'</span>'+(o.reasons.length?'<small class="blocked">未解鎖：'+esc(o.reasons.join("、"))+'</small>':"")+'</span></button>').join("");
let party=m.crew.map(x=>x.name+"（"+x.role+"）").join("、")||"單人行動";
let menu=temporary.showItems?'<div class="mission-popup"><div class="card-heading">本次隨身行囊</div>'+Object.entries(m.bag).filter(([id,n])=>n>0).map(([id,n])=>'<button class="button-row" data-do="use:'+id+'">'+esc(objId(id)?.name)+' ×'+n+'　<span>使用（消耗一回合） ›</span></button>').join("")+a("關閉","items","small ghost")+'</div>':"";
let log=temporary.showLog?'<div class="mission-popup log-popup"><div class="card-heading">主神即時記錄</div><div class="log-lines">'+m.log.slice(-10).map(x=>'<p>'+esc(x)+'</p>').join("")+'</div>'+a("關閉","logs","small ghost")+'</div>':"";
return '<div class="mission-stage" id="mission-stage"><div class="mission-top"><div class="mission-world">'+esc(w.name)+' <small>· '+esc(m.title)+'</small></div><div class="mission-bars">'+["hp","sta","mp","san"].map((k,i)=>'<div><span>'+D.stats[i].short+'</span><b>'+Math.round(s.profile[k])+'</b></div>').join("")+'</div><div class="mission-foe">'+foe+'<span>進度 '+m.progress+'/'+m.required+'</span><span>'+esc(d.enemyIntent)+'</span></div></div>'+
'<div class="scene-prose '+(s.settings.reducedMotion?"motion-off":"")+'" data-mood="'+mood(m.phase,m.world)+'"><div class="scene-eyebrow">SCENARIO '+(m.phase+1)+' / 6 · '+story.title+' · '+primary+'</div>'+story.last+'<p>'+esc(story.opening)+'</p><p class="scene-mode">'+esc(story.mode)+'</p><div class="novel-dialogue"><b>'+esc(story.char)+'</b><p>'+esc(story.speak)+'</p></div>'+(story.dynamic?'<p>'+story.dynamic+'</p>':"")+'<p>'+esc(story.ending)+'</p>'+story.objective+'</div>'+
'<div class="mission-toolbar"><span>技能槽 03：'+esc(skill(d.selectedSkill)?.name||"無")+'</span><div>'+a("切換招式","cycleSkill","tiny")+a("背包","items","tiny")+a("記錄","logs","tiny")+'</div></div>'+
'<div class="fixed-choices">'+choices+'<div class="free-row"><input id="free-action" maxlength="180" placeholder="第四個行動：自己輸入……" aria-label="自訂行動">'+a("執行 ›","free","tiny main")+'</div></div><div class="mission-footer">'+a("主神檔案","nav:profile","tiny ghost")+'<span>'+esc(party)+'</span>'+a("任務詳情","nav:memory","tiny ghost")+'</div>'+menu+log+'</div>'}
function resultUI(){let m=s.mission,g=m.result,report=m.reward;
return '<div class="mission-result"><div class="eyebrow">MAIN GOD / WORLD EVALUATION</div><div class="rank">'+g+'</div><h1>'+ (g==="A"?"主神任務完成":g==="B"?"存活，部分目標達成":"任務失敗")+'</h1><p>《'+esc(m.worldName)+'》· '+esc(m.title)+'</p><div class="result-panel">'+piece("任務類型",({solo:"單人",team:"團隊合作",versus:"對抗"}[m.mode]))+piece("主線進度",m.progress+" / "+m.required)+piece("主神積分","+"+report.credits)+piece("角色經驗","+"+report.xp)+piece("最終生命",s.profile.hp+" / 100")+(m.loot?piece("世界戰利品",esc(objId(m.loot)?.name||m.loot)):"")+(m.hidden?piece("隱藏任務","已發現 · 額外獎勵"):"")+'</div><div class="result-quote">'+esc(m.log.slice(-3).join("　"))+'</div>'+a("領取獎勵，返回主神空間","claim","block main")+'</div>'}
function memory(){const mode=temporary.memoryTab, tabs=[["timeline","輪迴記錄"],["worlds","世界情報"],["relations","隊友關係"],["system","主神備忘"]];let body="";
if(mode==="timeline")body=s.records.length?s.records.map(r=>card("《"+esc(world(r.world)?.name)+"》 · "+r.result,esc(task(r.task)?.name||r.task)+" · "+({solo:"單人",team:"團隊",versus:"對抗"}[r.mode])+'<div class="rule"></div>'+r.choices.map(x=>'<p class="record-choice">'+esc(x)+'</p>').join("")+'<div class="minor-meta">'+new Date(r.date).toLocaleString("zh-HK")+'</div>')).join(""):card("尚未有輪迴記錄","正式完成第一個世界後，所有重大選擇會留在這裡。");
if(mode==="worlds")body=s.discovered.length?s.discovered.map(id=>card(esc(world(id)?.name),esc(world(id)?.intro||""))).join(""):card("未知世界","主神尚未允許你查看其他世界的完整資料。");
if(mode==="relations")body=D.companions.map(c=>card(esc(c.name)+" · "+esc(c.role),esc(c.bio)+'<div class="minor-meta">關係值 '+(s.bonds[c.id]||0)+'</div>')).join("");
if(mode==="system")body=card("主神規則說明","世界與任務由主神決定；定向返回需要先到訪，再支付座標解鎖及定向傳送代價。") +card("劇情記憶","歷史抉擇、線索、戰利品、隊友關係在本裝置持久保存。") +card("真人多人連線","目前團隊與對抗採用 AI 輪迴者的確定性規則模擬；尚未啟用伺服器同步、真人配對及即時 PvP。");
return section("MAIN GOD ARCHIVE","輪迴記錄","主神會保存重大抉擇與線索；世界居民亦應根據合理身份和記憶作出反應。")+'<div class="tabbar">'+tabs.map(x=>'<button class="'+(mode===x[0]?"on":"")+'" data-do="tab:memory:'+x[0]+'">'+x[1]+'</button>').join("")+'</div><div class="scroll-content column-gap">'+body+'</div>'}
function settings(){return section("TERMINAL SETTINGS","系統設定","本機測試資料與閱讀介面。")+'<div class="scroll-content column-gap">'+card("閱讀",piece("減少情緒演出動畫",s.settings.reducedMotion?"已開啟":"已關閉",a("切換","toggleMotion","small")))+card("存檔",piece("已完成輪迴",s.records.length+" 次")+a("匯出角色存檔 JSON","export","block ghost"))+card("開發版本","P0–P4 整合測試 · 已接通本地規則引擎、主神任務與 AI 隊伍。即時 AI 對話與真人多人未連接。")+'</div>'}
function screen(){return s.screen==="hub"?hub():s.screen==="profile"?profile():s.screen==="warehouse"?warehouse():s.screen==="loadout"?loadout():s.screen==="upgrade"?upgrade():s.screen==="portal"?missionBoard():s.screen==="mission"?missionUI():s.screen==="memory"?memory():settings()}
function render(){const inGame=!!(s.mission&&s.screen==="mission");R.innerHTML='<div class="app-shell '+(inGame?"in-game":"")+'">'+(inGame?"":header())+'<main class="app-main">'+screen()+'</main>'+(inGame?"":foot())+(temporary.notice?'<div class="toast">'+esc(temporary.notice)+'</div>':"")+'</div>';persist()}
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
if(cmd.startsWith("blood:")){let err=E.buyBloodline(s,cmd.slice(6));if(err)return notice(err);notice("血脈覺醒成功，能力和副作用已生效。");return}
if(cmd.startsWith("boost:")){let err=E.boost(s,cmd.slice(6));if(err)return notice(err);render();return}
if(cmd==="assign"){let err=E.mainGodAssign(s);if(err)return notice(err);render();return}
if(cmd.startsWith("coord:")){let err=E.assignReturn(s,cmd.slice(6));if(err)return notice(err);render();return}
if(cmd==="launch"){let err=E.launch(s);if(err)return notice(err);temporary.showItems=false;temporary.showLog=false;render();return}
if(cmd==="cycleSkill"){E.changeSkill(s,(s.mission?.chosenSkill||0)+1);render();return}
if(cmd.startsWith("act:")){let out=E.act(s,Number(cmd.slice(4)));if(out.error)return notice(out.error);render();return}
if(cmd==="free"){let v=R.querySelector("#free-action")?.value||"";let out=E.freeAction(s,v);if(out.error)return notice(out.error);render();return}
if(cmd==="items"){temporary.showItems=!temporary.showItems;temporary.showLog=false;render();return}
if(cmd==="logs"){temporary.showLog=!temporary.showLog;temporary.showItems=false;render();return}
if(cmd.startsWith("use:")){let err=E.useItem(s,cmd.slice(4));if(err)return notice(err);temporary.showItems=false;notice("道具已使用，效果已套用。");return}
if(cmd==="claim"){let err=E.finish(s);if(err)return notice(err);go("hub");return}
if(cmd==="rest"){let err=E.rest(s);if(err)return notice(err);notice("主神治療完成。");return}
if(cmd==="toggleMotion"){s.settings.reducedMotion=!s.settings.reducedMotion;render();return}
if(cmd==="export"){try{const blob=new Blob([JSON.stringify(s,null,2)],{type:"application/json"}),url=URL.createObjectURL(blob),a=document.createElement("a");a.href=url;a.download="nightwalker-save.json";document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),2000)}catch(_){notice("此瀏覽器暫不支援匯出。")}return}
}
R.addEventListener("click",ev=>{let t=ev.target.closest("[data-do]");if(!t||t.disabled)return;handle(t.dataset.do)});
render();
})();
