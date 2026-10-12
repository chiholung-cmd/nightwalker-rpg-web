(function(global){
"use strict";
const D=global.NW_DATA,KEY="nightwalker_new_start_20261012_v2",OLD="nightwalker-v5-main-god-novel-20261011";
const RESET_MARK="nightwalker_reset_applied_20261012";
const by=(arr,id)=>arr.find(x=>x.id===id);
const clamp=(n,min,max)=>Math.max(min,Math.min(max,n));
const copy=x=>JSON.parse(JSON.stringify(x));
const defaultState=()=>({
version:1,screen:"hub",tab:"overview",
profile:{name:"夜行者",level:1,xp:0,credits:1000,attrs:{str:7,agi:7,con:8,per:9,wil:7},hp:100,sta:100,mp:60,san:100,title:"記憶殘缺的歸還者",missions:0,bloodline:null},
warehouse:{ironrod:1,shortblade:1,jacket:1,charm:1,medkit:3,energy:2,ether:1,sanity:2,flare:1,recorder:1},
learned:["strike","guard","observe","focus"],
loadout:{weapon:"ironrod",armor:"jacket",accessory:"charm",offhand:null,backpack:["medkit","medkit","energy","sanity","recorder"],active:["strike","guard","observe"],passive:["focus"]},
assignment:null,mission:null,records:[],memory:[],bonds:{linwu:0,shenyuan:0,chuling:0,weixun:0},discovered:[],coord:{},perk:[],ui:{selectedSkill:2,filter:"all",category:"weapon",alert:"",page:0},
settings:{reducedMotion:false,novelSize:"normal"},lastReward:null
});
function load(storage){const st=storage||global.localStorage;
try{if(st.getItem(RESET_MARK)!=="1"){
  // One-time versioned reset; only Nightwalker save keys, never other apps.
  ["nightwalker_p0p4_integrated_v1",OLD,"nightwalker_p0p4_fresh_v2_20261012"].forEach(k=>{if(st.removeItem)st.removeItem(k)});
  st.setItem(RESET_MARK,"1");
}}catch(_){}
let raw;try{raw=st.getItem(KEY)}catch(_){}if(raw){try{let a=JSON.parse(raw);if(a&&a.version===1&&a.profile&&a.loadout){if(!a.mission)restoreAllResources(a);return a}}catch(_){}}let s=defaultState();
if(!s.mission)restoreAllResources(s);return s}
function save(s,storage){try{(storage||global.localStorage).setItem(KEY,JSON.stringify(s))}catch(_){}}
function restoreAllResources(s){
if(!s||!s.profile)return;
for(const stat of D.stats)if(["hp","sta","mp","san"].includes(stat.id))s.profile[stat.id]=stat.max;
}
const item=id=>by(D.items,id),skill=id=>by(D.skills,id),world=id=>by(D.worlds,id),task=id=>by(D.tasks,id);
function tierOK(s,thing){const req=thing.requires||{};let reasons=[];for(let k in req)if((s.profile.attrs[k]||0)<req[k])reasons.push(D.attributes.find(x=>x[0]===k)?.[1]+"至少 "+req[k]);if(thing.tier&&s.profile.level<thing.tier)reasons.push("等級至少 Lv."+thing.tier);if(thing.unlock&&s.profile.level<thing.unlock)reasons.push("裝備要求 Lv."+thing.unlock);return reasons}
function weight(s){return s.loadout.backpack.reduce((n,id)=>n+(item(id)?.weight||0),0)+["weapon","offhand","armor","accessory"].reduce((n,id)=>n+(item(s.loadout[id])?.weight||0),0)}
function capacity(s){return 11+(s.profile.attrs.con||8)*2}
function maxBag(s){return 8+Math.max(0,Math.floor((s.profile.level-3)/5))}
function bagReserved(s,id){return s.loadout.backpack.filter(x=>x===id).length}
function canPack(s,id){const it=item(id);if(!it)return "物品不存在";if(!["consumable","tool"].includes(it.type))return "此物品不能放進行囊";if(bagReserved(s,id)>=(s.warehouse[id]||0))return "倉庫可用數量不足";if(s.loadout.backpack.length>=maxBag(s))return "行囊格數不足";if(weight(s)+it.weight>capacity(s))return "負重已達上限";return null}
function addBag(s,id){let reason=canPack(s,id);if(reason)return reason;s.loadout.backpack.push(id);return null}
function removeBag(s,i){if(i<0||i>=s.loadout.backpack.length)return "行囊索引無效";s.loadout.backpack.splice(i,1);return null}
function setEquipment(s,slot,id){if(s.mission)return "輪迴途中無法從主神倉庫更換裝備";if(!["weapon","offhand","armor","accessory"].includes(slot))return "裝備欄無效";if(id===null){s.loadout[slot]=null;return null}let it=item(id);if(!it||(s.warehouse[id]||0)<=0)return "倉庫沒有此裝備";if(it.type!==(slot==="offhand"?"weapon":slot))return "裝備類型不符合";let used=["weapon","offhand","armor","accessory"].filter(x=>x!==slot&&s.loadout[x]===id).length;if(used>=s.warehouse[id])return "這件裝備已被其他欄位使用";let extra=it.weight-(item(s.loadout[slot])?.weight||0);if(weight(s)+extra>capacity(s))return "超過負重上限";let gate=tierOK(s,it);if(gate.length)return gate.join("、");s.loadout[slot]=id;return null}
function toggleSkill(s,id,passive){if(s.mission)return "輪迴途中無法改變技能配置";let sk=skill(id);if(!sk||!s.learned.includes(id))return "尚未習得此技能";if(passive===sk.active)return "技能類型不符合";let list=passive?s.loadout.passive:s.loadout.active,limit=passive?3:6,pos=list.indexOf(id);if(pos>=0){list.splice(pos,1);return null}if(list.length>=limit)return "技能欄已滿";let gate=tierOK(s,sk);if(gate.length)return gate.join("、");list.push(id);return null}
function buy(s,id){if(s.mission)return "輪迴途中不能前往主神商店";const row=D.shop.find(x=>x[0]===id);if(!row)return "主神商店沒有這項物品";const it=item(id);if(s.profile.credits<row[1])return "主神積分不足";const gate=tierOK(s,it);if(gate.length)return gate.join("、");s.profile.credits-=row[1];s.warehouse[id]=(s.warehouse[id]||0)+1;return null}
function learn(s,id){if(s.mission)return "輪迴途中不可進行主神強化";if(s.learned.includes(id))return "已經學會";let sk=skill(id),price=D.skillPrices[id];if(!sk||!price)return "此技能不可兌換";let gate=tierOK(s,sk);if(gate.length)return gate.join("、");if(s.profile.credits<price)return "積分不足";s.profile.credits-=price;s.learned.push(id);return null}
function buyBloodline(s,id){
if(s.mission)return "輪迴途中不能覺醒血脈";
const b=D.bloodlines.find(x=>x.id===id);
if(!b)return "主神未收錄此血脈";
if(s.profile.bloodline)return "目前已有血脈；更換血脈需要後續轉化系統";
if(s.profile.level<b.tier)return "需要 Lv."+b.tier;
if(s.profile.missions<b.missions)return "需要完成 "+b.missions+" 次輪迴";
for(const k in b.requires)if((s.profile.attrs[k]||0)<b.requires[k])return "基礎屬性未達要求："+k+" ≥ "+b.requires[k];
if(s.profile.credits<b.cost)return "主神積分不足";
s.profile.credits-=b.cost;s.profile.bloodline=id;return null}
function boost(s,attr){if(s.mission)return "輪迴途中不可強化";if(!Object.keys(s.profile.attrs).includes(attr))return "無效屬性";const price=80+(s.profile.attrs[attr]-6)*30;if(s.profile.credits<price)return "積分不足";s.profile.credits-=price;s.profile.attrs[attr]++;return null}
function mainGodAssign(s,random=Math.random){if(s.mission)return "現有世界尚未結算";restoreAllResources(s);if(s.assignment)return "主神已封存本次指派，不允許免費重抽";let pool=D.tasks.filter(t=>!s.records.length||t.world!==s.records.at(-1).world);if(!pool.length)pool=D.tasks;let r=clamp(Number(random())||0,0,.999999999),selected=pool[Math.floor(r*pool.length)];s.assignment={task:selected.id,world:selected.world,mode:selected.mode,seed:Math.floor(r*1e8),assignedAt:Date.now(),targeted:false};return null}
function assignReturn(s,worldId){if(s.mission)return "輪迴途中不可定向";if(s.assignment)return "已有主神指派，無法更改";if(!s.discovered.includes(worldId))return "必須先到訪此世界";const w=world(worldId);if(!w)return "無效世界";const cost={busan:220,demon:650,alice:550,deathnote:380}[worldId],fee={busan:60,demon:160,alice:150,deathnote:100}[worldId],level={busan:4,demon:6,alice:6,deathnote:5}[worldId];if(s.profile.level<level)return "需要 Lv."+level;if(!s.coord[worldId]){if(s.profile.credits<cost)return "座標解鎖需要 "+cost+" 積分";s.profile.credits-=cost;s.coord[worldId]=true;return "座標已解鎖，請再次確認指定傳送"}if(s.profile.credits<fee)return "定向費需要 "+fee+" 積分";s.profile.credits-=fee;const tasks=D.tasks.filter(t=>t.world===worldId);const t=tasks[0];s.assignment={task:t.id,world:worldId,mode:t.mode,seed:Date.now()%999999,assignedAt:Date.now(),targeted:true};return null}

function customWorldCost(name){return 300+Math.max(0,String(name||"").trim().length-8)*10}
function assignCustomWorld(s,name,aiReady,details={}){
if(s.mission)return "請先完成目前輪迴";
if(s.assignment)return "已有主神指派，請先完成該次傳送";
const title=String(name||"").trim();
if(title.length<2||title.length>50)return "世界名稱需要 2 至 50 字";
const kind=details.kind==="original"?"original":"adaptation";
const types=["電影","劇集","動畫","小說","遊戲","其他作品"];
const mediaType=types.includes(details.mediaType)?details.mediaType:"電影";
const premise=String(details.premise||"").trim();
if(kind==="original"&&(premise.length<12||premise.length>450))return "自創世界請提供 12 至 450 字的背景、規則或故事構思";
if(kind==="adaptation"){
 const known=D.worlds.find(w=>w.name===title||w.id===title);
 if(known){
   const tasks=D.tasks.filter(t=>t.world===known.id);
   if(!tasks.length)return "此世界暫未配置任務";
   const cost=220;
   if(s.profile.credits<cost)return "需支付 "+cost+" 主神積分";
   s.profile.credits-=cost;
   const t=tasks[Math.floor(Math.random()*tasks.length)];
   s.assignment={task:t.id,world:t.world,mode:t.mode,targeted:true,customRequested:title,worldKind:kind,mediaType,paidCost:cost,seed:Date.now()%100000000,assignedAt:Date.now()};
   return null
 }
}
if(!aiReady)return "AI 劇情暫不可用，不能進入未收錄的世界；並未扣除積分";
const cost=customWorldCost(title);
if(s.profile.credits<cost)return "需要 "+cost+" 主神積分";
s.profile.credits-=cost;
s.assignment={task:"custom_generated",world:"custom",worldTitle:title,worldKind:kind,mediaType:kind==="adaptation"?mediaType:null,premise:kind==="original"?premise:"",mode:"solo",paidCost:cost,targeted:true,customRequested:title,seed:Date.now()%100000000,assignedAt:Date.now()};
return null
}
function cancelCustomWorld(s){
const m=s.mission,a=s.assignment;
if(m){
 if(m.world!=="custom"||m.phase!==0||m.history.length)return "輪迴已開始，無法取消並退款";
 for(const id in m.bag)s.warehouse[id]=(s.warehouse[id]||0)+m.bag[id];
 s.profile.credits+=Number(m.paidCost||0);
 s.mission=null;s.assignment=null;s.screen="hub";
 restoreAllResources(s);return null;
}
if(a?.world!=="custom")return "沒有可取消的自訂世界";
s.profile.credits+=Number(a.paidCost||0);s.assignment=null;s.screen="hub";return null
}
function validateLoadout(s){let errors=[];if(!s.loadout.weapon)errors.push("必須裝備主武器");if(weight(s)>capacity(s))errors.push("負重超過限制");let needs=[...s.loadout.active,...s.loadout.passive].filter(x=>!s.learned.includes(x)||tierOK(s,skill(x)).length);if(needs.length)errors.push("有技能未學習或無法使用");let ids=["weapon","offhand","armor","accessory"];for(let k of ids){let id=s.loadout[k];if(id&&tierOK(s,item(id)).length)errors.push(item(id).name+"未符合裝備要求")}return errors}
function launch(s){if(!s.assignment)return "尚未獲得主神任務";if(s.mission)return "任務已在進行";let errors=validateLoadout(s);if(errors.length)return errors.join("、");let bag={};for(const id of s.loadout.backpack){bag[id]=(bag[id]||0)+1}for(const id in bag)if((s.warehouse[id]||0)<bag[id])return "倉庫物資不足："+item(id)?.name;
for(const id in bag)s.warehouse[id]-=bag[id];
restoreAllResources(s);
const taskObj=s.assignment.world==="custom"?{id:"custom_generated",name:"自選世界·主神試煉",mode:"solo",goal:"探索「"+s.assignment.worldTitle+"」，完成主神委派的調查與生存目標",required:3,desc:s.assignment.worldKind==="original"?"主神已按照你的設定構築原創世界":"主神已定位指定作品世界"}:task(s.assignment.task),
w=s.assignment.world==="custom"?{id:"custom",name:s.assignment.worldTitle,enemy:"未知威脅",foeHp:100,dmg:12,intents:["試探","逼近","擾亂"],tone:"未知劇情"}:world(s.assignment.world);
if(s.profile.bloodline==="wolf")s.profile.sta=clamp(s.profile.sta+15,0,100);
if(s.profile.bloodline==="blank")s.profile.san=clamp(s.profile.san-10,0,100);let seed=s.assignment.seed;
let actors=taskObj.mode==="team"?[D.companions[seed%4],D.companions[(seed+1)%4]]:taskObj.mode==="versus"?[D.companions[(seed+1)%4]]:[],opponent=taskObj.mode==="versus"?D.rivals[seed%3]:null;
s.mission={...copy(s.assignment),title:taskObj.name,aiScenes:{},aiOptions:{},director:false,npcMemory:{},storyFacts:[],missionArc:[],phase:0,turn:0,progress:0,required:taskObj.required,flags:[],evidence:[],outcomes:[],log:[],history:[],bag,crew:actors.map(x=>({...x,bond:s.bonds[x.id]||0})),rival:opponent?{...opponent,progress:0}:null,enemy:{name:taskObj.mode==="versus"?opponent.name:w.enemy,hp:taskObj.mode==="versus"?opponent.hp:w.foeHp,max:taskObj.mode==="versus"?opponent.hp:w.foeHp,intent:0,bleed:0,stunned:0},status:{guard:0,barrier:0,bonus:0,poison:0},cooldowns:{},chosenSkill:0,weaponCondition:100,hidden:false,finished:false,roundEvents:[],mode:taskObj.mode,objective:taskObj.goal,worldName:w.name};
s.assignment=null;s.screen="mission";global.NW_WORLD?.enter?.(s);return null}
function availability(s,skillId){let sk=skill(skillId),m=s.mission;if(!sk)return {ok:false,reasons:["技能不存在"]};let r=[];if(!s.loadout.active.includes(skillId))r.push("未裝入出戰招式欄");if(!s.learned.includes(skillId))r.push("尚未習得");r.push(...tierOK(s,sk));if(s.profile.sta<(sk.sta||0))r.push("STA 不足");if(s.profile.mp<(sk.mp||0))r.push("MP 不足");if(m&&(m.cooldowns[skillId]||0)>0)r.push("冷卻 "+m.cooldowns[skillId]+" 回合");if(skillId==="sunbreath"&&!(item(s.loadout.weapon)?.tags||[]).includes("日光"))r.push("必須使用日光武器");return {ok:!r.length,reasons:r}}
function derived(s){let m=s.mission;if(!m)return null;let w=world(m.world),t=task(m.task),active=s.loadout.active,selected=active[m.chosenSkill%Math.max(1,active.length)]||"observe",isFight=m.world==="demon"||m.mode==="versus"||(m.world==="busan"&&m.phase>=2);
let weapon=item(s.loadout.weapon),phys=(weapon?.dmg||3)+Math.floor((s.profile.attrs.str-5)*1.7),spirit=(weapon?.tags||[]).includes("靈力"),enemyIntent=w.intents[(m.phase+m.enemy.intent)%w.intents.length];
if(m.mode==="versus")enemyIntent="敵對輪迴者正在爭奪目標";
let actions=[
isFight?{id:"attack",name:"使用"+(weapon?.name||"拳頭")+"攻擊",desc:"造成物理傷害，可能遭敵人反擊",sta:8,mp:weapon?.mpCost||0,damage:phys,progress:0}:{id:"investigate",name:m.phase%2?"尋找周圍的關鍵線索":"仔細觀察並分析現場",desc:"提升任務進度，記錄重要情報",sta:6,mp:0,progress:1,damage:0},
isFight?{id:"guard",name:"防守、調息並尋找破綻",desc:"STA 恢復16；降低本回合承傷",sta:-16,mp:0,damage:0,progress:0}:{id:"coordinate",name:m.mode==="solo"?"謹慎行動並恢復精神":m.mode==="team"?"與輪迴小隊協同行動":"干擾敵隊對任務的掌控",desc:"消耗少量體力，改善隊伍／任務狀態",sta:3,mp:0,damage:0,progress:1},
{...((()=>{let sk=skill(selected)||skill("observe");return {id:"skill:"+sk.id,name:"施展「"+sk.name+"」",desc:sk.desc,sta:sk.sta||0,mp:sk.mp||0,damage:sk.power||0,progress:sk.effect==="reveal"||sk.effect==="persuade"?1:0,skill:sk.id}})())}
];
for(let a of actions){a.reasons=[];if(a.id.startsWith("skill:"))a.reasons=availability(s,a.skill).reasons;if(a.id!=="guard"&&s.profile.sta<(a.sta||0))a.reasons.push("體力不足");if(s.profile.mp<(a.mp||0))a.reasons.push("靈力不足");if(a.id==="attack"&&weapon&&tierOK(s,weapon).length)a.reasons.push("力量／裝備要求未達標");a.usable=!a.reasons.length;a.costPreview={hp:0,sta:a.sta,mp:a.mp,san:0};if(a.id==="guard")a.costPreview.sta=-16;
if(a.damage>0){let base=a.damage;if(m.world==="demon"&&a.id!=="skill:spiritcut"&&a.id!=="skill:sunbreath"&&!(weapon?.tags||[]).includes("日光"))base=Math.floor(base*.55);a.damagePreview=[Math.max(1,base-4),Math.max(1,base+4)]}
a.sanPreview=(m.world==="alice"||m.world==="deathnote")?(s.loadout.passive.includes("focus")?3:4):0;
a.bondPreview=a.id==="coordinate"&&m.crew.length>0?1:0;
if(isFight&&m.enemy.hp>0&&!m.enemy.stunned){
let guard=a.id==="guard"?18:a.id==="skill:guard"?18:a.id==="skill:veil"?26:a.id==="skill:sidestep"?16:0;
let minDamage=Math.max(0,(w.dmg||12)-guard-(item(s.loadout.armor)?.def||0)-6);
let maxDamage=Math.max(0,(w.dmg||12)+5-guard-(item(s.loadout.armor)?.def||0)-1);
if(s.profile.bloodline==="wolf"){minDamage=Math.max(0,minDamage-4);maxDamage=Math.max(0,maxDamage-4)}
a.hpRisk=[minDamage,maxDamage];
}
}
return {w,t,m,actions,isFight,enemyIntent,selectedSkill:selected}}
function changeSkill(s,index){const n=s.loadout.active.length;if(!s.mission||!n)return;s.mission.chosenSkill=((index%n)+n)%n}
function useItem(s,id){const m=s.mission,it=item(id);if(!m)return "不在任務中";if(!it||(m.bag[id]||0)<1)return "身上沒有這個道具";if(it.type!=="consumable"&&it.type!=="tool")return "物品無法直接使用";
m.bag[id]--;const before={hp:s.profile.hp,sta:s.profile.sta,mp:s.profile.mp,san:s.profile.san};s.profile.hp=clamp(s.profile.hp+(it.heal||0),0,100);s.profile.sta=clamp(s.profile.sta+(it.restoreSta||0),0,100);s.profile.mp=clamp(s.profile.mp+(it.restoreMp||0),0,60);s.profile.san=clamp(s.profile.san+(it.restoreSan||0),0,100);
if(it.stun)m.enemy.stunned=1;if(id==="recorder"){m.progress++;m.flags.push("recorded");m.evidence.push("記錄器保存了現場聲音")}if(id==="badge"){m.flags.push("identity");m.progress++}
const result=item(id).name+"已使用：HP "+(s.profile.hp-before.hp)+"、STA "+(s.profile.sta-before.sta)+"、MP "+(s.profile.mp-before.mp)+"、SAN "+(s.profile.san-before.san);
m.log.push(result);m.roundEvents=[result];
m.turn++;m.phase++;
if(m.world==="demon"||m.mode==="versus"||(m.world==="busan"&&m.phase>=3)){if(m.enemy.hp>0&&m.enemy.stunned===0){let harm=Math.max(0,Math.round(world(m.world).dmg*.55)-(item(s.loadout.armor)?.def||0));s.profile.hp=clamp(s.profile.hp-harm,0,100);if(harm>0){m.log.push("使用物品期間受到敵人反擊，HP −"+harm);m.roundEvents.push("敵人反擊造成 "+harm+" 點生命損失。")}}}
if(m.phase>=6||s.profile.hp<=0)end(s);
return null}
function act(s,index,random=Math.random){const m=s.mission;if(!m||m.finished)return {error:"沒有進行中的任務"};const q=derived(s),a=q.actions[index];if(!a)return {error:"行動無效"};if(!a.usable)return {error:a.reasons.join("、")};
let events=[],foe=m.enemy,sk=a.skill?skill(a.skill):null,guard=0,stun=0,before={hp:s.profile.hp,sta:s.profile.sta,mp:s.profile.mp,san:s.profile.san,enemy:foe.hp,progress:m.progress};
s.profile.sta=clamp(s.profile.sta-a.sta,0,100);s.profile.mp=clamp(s.profile.mp-a.mp,0,60);
const weapon=item(s.loadout.weapon);
if(a.id==="guard"){guard=14+Math.floor(s.profile.attrs.con/2);s.profile.san=clamp(s.profile.san+4,0,100);events.push("你收緊呼吸，架起防禦姿態，為下一次行動保存體力。")}
else if(a.id==="investigate"){m.progress+=1;if(s.profile.bloodline==="sight"&&!m.flags.includes("bloodsight")){m.progress++;m.flags.push("bloodsight");events.push("靈視血脈額外發現一條隱藏線索。")}m.evidence.push("第"+(m.phase+1)+"階段關鍵觀察");m.flags.push("intel");events.push("你仔細對照環境細節，從不起眼的痕跡中找到新的突破口。")}
else if(a.id==="coordinate"){m.progress+=1;if(m.crew.length){const p=m.crew[(m.turn)%m.crew.length];p.bond++;s.bonds[p.id]=(s.bonds[p.id]||0)+1;events.push(p.name+"理解了你的判斷，開始與你配合。")}else if(m.mode==="versus"){m.rival.progress=Math.max(0,m.rival.progress-1);events.push("你成功干擾敵對輪迴者的步調，讓對方暫時失去優勢。")}else{events.push("你降低動作幅度，穩定呼吸，避免因恐懼而犯錯。");s.profile.san=clamp(s.profile.san+5,0,100)}}
let damage=0;if(a.id==="attack"||a.id.startsWith("skill:")){
let power=a.damage||0;
if(sk){if(sk.effect==="guard"){guard=18;s.profile.sta=clamp(s.profile.sta+12,0,100)}
else if(sk.effect==="evade"){guard=16;m.status.bonus+=8;events.push("你利用敏捷的步伐避開了敵人最危險的攻擊角度。")}
else if(sk.effect==="reveal"){m.flags.push("intel","weakness");m.progress+=1;m.evidence.push(q.w.weakness+"：已判定");events.push("你的感知捕捉到敵人規律，情報檔案新增了關鍵弱點。")}
else if(sk.effect==="heal"){s.profile.hp=clamp(s.profile.hp+22,0,100);m.status.poison=0;events.push("你迅速完成傷口處理，止住了流血。")}
else if(sk.effect==="shield"){guard=26;s.profile.san=clamp(s.profile.san+8,0,100);events.push("半透明靈力屏障在你身前凝結。")}
else if(sk.effect==="persuade"){m.progress+=2;m.flags.push("negotiated");events.push("你抓住對方言語中的破綻，以恰當的措辭換來了新的線索。")}
else if(sk.effect==="ambush"){guard=10;m.status.bonus+=6}
if(sk.cooldown)m.cooldowns[sk.id]=sk.cooldown+1;
}
if(power>0){
let multiplier=(m.world==="demon"&&sk?.effect!=="spirit"&&sk?.effect!=="sun"&&!(weapon?.tags||[]).includes("日光"))?.52:1;
if(m.world==="demon"&&(sk?.effect==="sun"||(weapon?.tags||[]).includes("日光")))multiplier=1.55;
if(s.profile.bloodline==="ember"&&m.world==="demon")power+=8;
if(sk?.effect==="spirit")multiplier=1.2;
damage=Math.max(1,Math.round((power+Math.floor(s.profile.attrs.str/2)+m.status.bonus)*multiplier*(m.weaponCondition<=0?.5:1)));
foe.hp=Math.max(0,foe.hp-damage);m.status.bonus=0;
events.push("你對"+foe.name+"發動攻擊，造成 "+damage+" 點傷害。");if(m.world==="demon"&&multiplier<1)events.push("普通武器的傷口正逐漸再生，必須利用日光、靈力或環境。");
}}
if(s.profile.bloodline==="ember"&&q.isFight){s.profile.sta=Math.max(0,s.profile.sta-4);events.push("灰燼血脈額外消耗4點體力。")}
if((m.flags.includes("intel")||m.flags.includes("weakness"))&&a.id==="attack"){m.progress+=1;events.push("你利用此前發現的情報打開了前進路線。")}
if(m.world==="demon"&&foe.hp>0&&(a.id==="attack"||a.damage>0))m.progress+=1;
if((a.id==="attack"||a.damage>0)&&m.weaponCondition>0){m.weaponCondition=Math.max(0,m.weaponCondition-2);if(m.weaponCondition===0)events.push("武器耐久耗盡，下一次攻擊將大幅減弱。")}
if(m.progress>=2&&m.flags.includes("intel")&&!m.hidden){m.hidden=true;events.push("【主神隱藏任務】"+q.t.hidden+"，已被你發現。")}
if(a.id.startsWith("skill:")&&sk?.effect==="reveal")m.flags.push("weakness");
m.turn++;
for(const id in m.cooldowns)m.cooldowns[id]=Math.max(0,m.cooldowns[id]-1);
const isBattle=q.isFight;let enemyDmg=0;
if(isBattle&&foe.hp>0){let intent=q.enemyIntent;let base=(q.w.dmg||12)+((m.turn%3===0)?5:0);if(m.mode==="versus")base+=3;if(foe.stunned>0){foe.stunned--;events.push("敵人受到控制，本回合失去攻擊機會。")}
else{enemyDmg=Math.max(0,base-guard-(item(s.loadout.armor)?.def||0)-Math.floor(s.profile.attrs.con/5));if(s.profile.hp<40&&s.loadout.passive.includes("endure"))enemyDmg=Math.floor(enemyDmg*.65);if(s.profile.bloodline==="wolf")enemyDmg=Math.max(0,enemyDmg-4);s.profile.hp=clamp(s.profile.hp-enemyDmg,0,100);
events.push("敵人使出「"+intent+"」，你受到 "+enemyDmg+" 點傷害。")}}
if(m.world==="demon"&&foe.hp>0&&!m.flags.includes("sunsealed")){let regen=(weapon?.tags||[]).includes("日光")?1:5;foe.hp=Math.min(foe.max,foe.hp+regen);events.push("食人鬼再生回復 "+regen+" 點生命。")}
if(m.crew.length){for(let p of m.crew){if(p.style==="healer"&&s.profile.hp<75){s.profile.hp=clamp(s.profile.hp+10,0,100);events.push(p.name+"施展急救，恢復你10點生命。")}
else if(p.style==="fighter"&&foe.hp>0){foe.hp=Math.max(0,foe.hp-9);events.push(p.name+"掩護攻擊，令敵人受傷。")}
else if(p.style==="mage"&&foe.hp>0){foe.hp=Math.max(0,foe.hp-8);events.push(p.name+"以靈術干擾敵人。")}
else{m.progress=Math.min(m.required+2,m.progress+1);events.push(p.name+"協助探查，任務進度增加。")}}
}
if(m.rival&&m.turn%2===0){m.rival.progress++;events.push("敵對輪迴者「"+m.rival.name+"」推進了自己的任務目標。")}
if(s.loadout.passive.includes("channel")&&m.turn===1){s.profile.mp=clamp(s.profile.mp+8,0,60);events.push("靈力導流：回復8點靈力。")}
if(m.world==="alice"||m.world==="deathnote"){const drain=Math.max(0,(a.id==="guard"?1:4)-(s.loadout.passive.includes("focus")?1:0)-(item(s.loadout.accessory)?.ward?1:0)+(s.profile.bloodline==="sight"?1:0)-(s.profile.bloodline==="blank"?2:0));s.profile.san=clamp(s.profile.san-drain,0,100);events.push("心理壓力造成 SAN −"+drain+"。")}
if(s.profile.san<=15){s.profile.hp=Math.max(0,s.profile.hp-4);events.push("精神接近崩潰，產生額外生命損耗。")}
if(s.profile.hp<=0&&s.loadout.accessory==="watch"&&!m.flags.includes("watchsaved")){s.profile.hp=1;m.flags.push("watchsaved");events.push("逆位懷錶逆轉了瀕死結局，生命保留1點。")}
m.phase++;m.enemy.intent++;let report={action:a.name,events,delta:{hp:s.profile.hp-before.hp,sta:s.profile.sta-before.sta,mp:s.profile.mp-before.mp,san:s.profile.san-before.san,enemy:foe.hp-before.enemy,progress:m.progress-before.progress}};m.history.push(report);m.log.push(...events);m.roundEvents=events;
let finish=m.phase>=6||s.profile.hp<=0||(foe.hp<=0&&m.world==="demon");if(finish)end(s);
return {error:null,report,finished:!!m.finished}}
function freeAction(s,text,random=Math.random){let n=(text||"").trim();if(n.length<2)return {error:"請描述至少兩個字的行動"};if(/治療|急救包|包紮|補血/.test(n)&&s.mission?.bag.medkit>0){let err=useItem(s,"medkit");return {error:err,report:{events:["使用急救包，恢復生命。"]}}}if(/靈液|回復靈力/.test(n)&&s.mission?.bag.ether>0){let err=useItem(s,"ether");return {error:err,report:{events:["使用靈液，恢復靈力。"]}}}
const q=derived(s);if(!q)return {error:"尚未進入任務"};let matched=/格擋|防守|休息|調息|恢復體力|閃避/.test(n)?1:/技能|法術|靈刃|影步|術式|治療術/.test(n)?2:/調查|觀察|線索|推理|交換|交談|說服|保護|合作/.test(n)?q.isFight?2:0:/攻擊|擊打|斬|砍|武器|戰鬥|衝/.test(n)?0:-1;
if(matched<0)return {error:"自由行動尚未接入生成式 AI。可以描述觀察、交涉、防守、攻擊或已裝備的技能。"};let r=act(s,matched,random);if(!r.error&&s.mission){s.mission.history.at(-1).freeText=n;s.mission.log.push("自由行動描述："+n)}return r}
function end(s){let m=s.mission;if(!m||m.finished)return;let success=m.progress>=m.required,defeat=s.profile.hp<=0,rivalWin=m.rival&&m.progress<=m.rival.progress;let foeDown=m.enemy.hp<=0;let result=defeat?"D":(m.world==="demon"?(foeDown||m.progress>=3?"A":m.enemy.hp<=75?"B":"D"):rivalWin?"D":success?"A":m.progress>=2?"B":"D");
m.finished=true;m.result=result;m.reward=copy({A:{credits:370,xp:220},B:{credits:190,xp:110},D:{credits:40,xp:35}}[result]);m.reward.credits+=(m.quests||[]).filter(q=>q.status==="completed").reduce((v,q)=>v+(q.reward||0),0);
if(m.hidden&&result!=="D"){m.reward.credits+=80;m.log.push("隱藏任務完成獎勵：+80 主神積分。")}
m.loot=result==="A"?{demon:"sunsteel",busan:"flare",alice:"badge",deathnote:"recorder"}[m.world]:result==="B"?"medkit":null;
if(m.loot)m.log.push("獲得戰利品："+item(m.loot).name);m.log.push(result==="A"?"主神確認：任務主要目標已完成。":result==="B"?"主神確認：部分完成，仍有遺漏。":"主神確認：任務失敗。");m.phase=Math.min(m.phase,m.director?28:6)}
function finish(s){const m=s.mission;if(!m||!m.finished)return "任務仍未結束";if(m.claimed)return "結算已經領取";m.claimed=true;
s.profile.credits+=m.reward.credits;s.profile.xp+=m.reward.xp;while(s.profile.xp>=220){s.profile.xp-=220;s.profile.level++}
s.profile.missions++;if(m.world!=="custom"&&!s.discovered.includes(m.world))s.discovered.push(m.world);
for(const id in m.bag)s.warehouse[id]=(s.warehouse[id]||0)+m.bag[id];
if(m.loot)s.warehouse[m.loot]=(s.warehouse[m.loot]||0)+1;
const summary={date:new Date().toISOString(),task:m.task,world:m.world,worldName:m.worldName,npcMemory:m.npcMemory||{},sideQuests:m.quests||[],agencyEvents:m.agencyEvents||[],missionArc:m.missionArc||[],directorPlan:m.directorPlan?{chapters:(m.directorPlan.chapters||[]).slice(-28),decisions:(m.directorPlan.decisions||[]).slice(-28),threads:(m.directorPlan.threads||[]).slice(-5),finale:m.directorPlan.finale||null}:null,worldFacts:m.storyFacts||[],worldKind:m.worldKind||null,mediaType:m.mediaType||null,worldPremise:m.worldKind==="original"?m.premise||"":null,mode:m.mode,result:m.result,loot:m.loot,hidden:m.hidden,choices:m.history.map(x=>x.action),events:m.log.slice(-12),points:m.reward.credits,crew:m.crew.map(x=>x.name),rival:m.rival?.name||null};s.records.unshift(summary);s.records=s.records.slice(0,100);
s.memory.unshift({world:m.world,text:"在《"+m.worldName+"》完成「"+m.title+"」，評價 "+m.result+"；"+(m.evidence.at(-1)||m.log.at(-2)||"未留下特殊線索"),tag:m.result,at:Date.now()});s.memory=s.memory.slice(0,80);
// Keep meaningful world and character history for later reincarnations.
s.worldLibrary ||= {};
const libraryKey=global.NW_WORLD?.key?.(m)||(m.worldKind==="original"?"original:":"adaptation:")+(m.worldName||m.world);
const previous=s.worldLibrary[libraryKey]||{name:m.worldName,worldKind:m.worldKind||"catalog",visits:0,npcs:{},facts:[],chapters:[],source:m.canon||null};
previous.visits++;
previous.lastVisited=summary.date;
previous.npcs={...previous.npcs,...(m.npcMemory||{})};
previous.facts=Array.from(new Set([...(previous.facts||[]),...(m.storyFacts||[])] )).slice(-100);
previous.chapters.unshift({date:summary.date,result:summary.result,choices:summary.choices.slice(-16),events:summary.events});
previous.chapters=previous.chapters.slice(0,20);
if(m.canon)previous.source=m.canon;
s.worldLibrary[libraryKey]=previous;
restoreAllResources(s);
s.lastReward=summary;s.mission=null;s.assignment=null;s.screen="hub";return null}
function rest(s){if(s.mission)return "輪迴途中不可使用主神的免費恢復";restoreAllResources(s);return null}
global.NW_ENGINE={KEY,RESET_MARK,defaultState,load,save,restoreAllResources,customWorldCost,assignCustomWorld,cancelCustomWorld,item,skill,world,task,weight,capacity,maxBag,bagReserved,canPack,addBag,removeBag,setEquipment,toggleSkill,buy,learn,buyBloodline,boost,tierOK,mainGodAssign,assignReturn,validateLoadout,launch,availability,derived,changeSkill,useItem,act,freeAction,end,finish,rest};
})(window);
