/* Nightwalker RPG authority. AI writes prose; this module alone mutates items, stats, combat and upgrades. */
export type Attribute='力量'|'敏捷'|'體魄'|'感知'|'意志'
export type ItemId='plain_clothes'|'old_phone'|'first_aid'|'rusty_knife'|'iron_pipe'|'pistol'|'ammo'|'ward'|'ancient_note'|'beast_tooth'
export type SkillId='unarmed'|'sword'|'first_aid_skill'|'stealth'|'focus'|'shooting'|'warding'
export type BloodlineId='none'|'wolf'|'spirit'|'dragon'
export type PetId='none'|'hound'|'owl'|'sprite'
export type MemoryEvent={id:number;world:string;turn:number;type:'choice'|'combat'|'loot'|'relationship'|'discovery'|'upgrade'|'world';text:string;important:boolean}
export type NpcMemory={name:string;trust:number;status:'正常'|'受傷'|'失蹤'|'死亡';facts:string[]}
export type Equipment={weapon:ItemId|null;armor:ItemId|null}
export type Enemy={id:string;name:string;hp:number;maxHp:number;attack:number;defense:number;round:number;intent:string}
export type EmotionMood='calm'|'suspense'|'shock'|'grief'|'anger'|'eerie'|'resolve'|'system'
export const EMOTION_MOODS:readonly EmotionMood[]=['calm','suspense','shock','grief','anger','eerie','resolve','system']
export type StoryBeat={text:string;mood:EmotionMood;kind?:'narration'|'dialogue'|'system';speaker?:string;prelude?:string}
export type Entry={id:number;kind:'narration'|'dialogue'|'system'|'combat'|'choice';speaker?:string;text:string;mood?:EmotionMood;prelude?:string}
export type Game={
 version:2;heroId:string;world:number;stage:'hub'|'explore'|'combat'|'down';genre:string;worldName:string;location:string;
 turn:number;hp:number;sp:number;points:number;xp:number;attributes:Record<Attribute,number>;
 skills:Partial<Record<SkillId,number>>;bloodline:BloodlineId;pets:PetId[];items:Partial<Record<ItemId,number>>;equipment:Equipment;
 enemy:Enemy|null;flags:string[];npcs:Record<string,NpcMemory>;memory:MemoryEvent[];summary:string;logs:Entry[];
 suggestions:string[];lootAvailable:ItemId[];worldTurns:number;lastResult:string;
}
export type CatalogEntry={id:string;name:string;price:number;description:string;category:'body'|'skills'|'bloodlines'|'pets'|'equipment'|'healing';max?:number;requires?:string}
export const ITEM_INFO:Record<ItemId,{name:string;slot:'weapon'|'armor'|'supply'|'quest';attack?:number;defense?:number;heal?:number;skill?:SkillId}>={
 plain_clothes:{name:'普通衣物',slot:'armor',defense:1},
 old_phone:{name:'舊式手機',slot:'quest'},
 first_aid:{name:'急救包',slot:'supply',heal:30},
 rusty_knife:{name:'生鏽短刀',slot:'weapon',attack:7,skill:'sword'},
 iron_pipe:{name:'鐵棍',slot:'weapon',attack:9,skill:'unarmed'},
 pistol:{name:'半自動手槍',slot:'weapon',attack:17,skill:'shooting'},
 ammo:{name:'手槍彈藥',slot:'supply'},
 ward:{name:'護身符',slot:'supply'},
 ancient_note:{name:'泛黃手記',slot:'quest'},
 beast_tooth:{name:'野獸牙齒',slot:'quest'}
}
export const SKILL_INFO:Record<SkillId,{name:string;description:string}>={
 unarmed:{name:'基礎格鬥',description:'徒手同鈍器攻擊'},
 sword:{name:'刀劍基礎',description:'提高刀劍命中同威力'},
 first_aid_skill:{name:'急救知識',description:'提升急救包效果'},
 stealth:{name:'隱匿潛行',description:'協助隱蔽、迴避與撤退'},
 focus:{name:'精神集中',description:'提高意志及對異常現象嘅抵抗'},
 shooting:{name:'射擊訓練',description:'使用槍械必備技能'},
 warding:{name:'符文防禦',description:'護身符支援'}
}
export const BLOODLINE_INFO:Record<BloodlineId,{name:string;description:string}>={
 none:{name:'人類',description:'冇特殊血脈'},
 wolf:{name:'夜狼血脈',description:'強化體魄同近身攻擊，但容易引起 NPC 戒心'},
 spirit:{name:'靈視血脈',description:'提升異常感知'},
 dragon:{name:'古龍血脈',description:'強大但需要更高等級，當前只可喺後期獲取'}
}
export const PET_INFO:Record<PetId,{name:string;description:string}>={
 none:{name:'無',description:''},hound:{name:'偵查犬',description:'提供警戒同少量戰鬥支援'},owl:{name:'夜梟',description:'協助探索同辨識風險'},sprite:{name:'微光精靈',description:'提供精神支援，部分世界會有排斥'}
}
export const SHOP:CatalogEntry[]=[
 ...(['力量','敏捷','體魄','感知','意志'] as const).map(name=>({id:'attr:'+name,name:name+'強化 +1',price:80,description:'永久增加一點'+name,max:18,category:'body' as const})),
 {id:'skill:unarmed',name:'基礎格鬥',price:110,description:'徒手同鈍器戰鬥能力',category:'skills',max:3},
 {id:'skill:sword',name:'刀劍基礎',price:160,description:'刀劍使用同格擋',category:'skills',max:3},
 {id:'skill:stealth',name:'隱匿潛行',price:130,description:'降低被發現機會',category:'skills',max:3},
 {id:'skill:first_aid_skill',name:'急救知識',price:120,description:'提升急救效果',category:'skills',max:3},
 {id:'skill:focus',name:'精神集中',price:150,description:'抵抗精神干擾',category:'skills',max:3},
 {id:'skill:shooting',name:'射擊訓練',price:240,description:'手槍及其他槍械使用',category:'skills',max:3},
 {id:'skill:warding',name:'符文防禦',price:260,description:'配合護身符使用',category:'skills',max:3},
 {id:'bloodline:wolf',name:'夜狼血脈',price:900,description:'需要 LV.3；力量、體魄有被動加成',category:'bloodlines',requires:'LV.3'},
 {id:'bloodline:spirit',name:'靈視血脈',price:950,description:'需要 LV.3；提高感知',category:'bloodlines',requires:'LV.3'},
 {id:'bloodline:dragon',name:'古龍血脈',price:3500,description:'需要 LV.10；後期解鎖',category:'bloodlines',requires:'LV.10'},
 {id:'pet:hound',name:'偵查犬',price:420,description:'探查威脅／戰鬥少量支援',category:'pets'},
 {id:'pet:owl',name:'夜梟',price:380,description:'探索、偵測隱藏線索',category:'pets'},
 {id:'pet:sprite',name:'微光精靈',price:650,description:'精神支援',category:'pets'},
 {id:'item:first_aid',name:'急救包',price:85,description:'恢復生命；只可以使用已持有數量',category:'equipment'},
 {id:'item:rusty_knife',name:'生鏽短刀',price:170,description:'近戰武器，可裝備',category:'equipment'},
 {id:'item:iron_pipe',name:'鐵棍',price:140,description:'鈍器，可裝備',category:'equipment'},
 {id:'item:pistol',name:'半自動手槍',price:800,description:'需要射擊訓練，子彈另外購買',category:'equipment',requires:'射擊訓練'},
 {id:'item:ammo',name:'手槍彈藥 × 6',price:95,description:'手槍每次攻擊消耗 1 發',category:'equipment'},
 {id:'item:ward',name:'護身符',price:220,description:'一次性防護消耗品',category:'equipment'},
 {id:'rest',name:'主神治療',price:35,description:'主神空間恢復 HP/SP',category:'healing'}
]
export const GENRES=[
 {id:'horror',name:'恐怖',worlds:['封閉療養院','霧雨港灣','無聲地下站'],foe:'失控影獸'},
 {id:'scifi',name:'科幻',worlds:['零號軌道城','冷光實驗站','深海休眠艙'],foe:'失控守衛機'},
 {id:'wuxia',name:'武俠',worlds:['蒼山古道','斷劍小鎮','雪峰客棧'],foe:'黑衣殺手'},
 {id:'fantasy',name:'奇幻',worlds:['星墜森林','被遺忘的王庭','龍眠古堡'],foe:'腐化獵獸'},
 {id:'historical',name:'歷史',worlds:['戰火邊城','舊朝驛站','江畔古城'],foe:'追兵'}
] as const
export const owned=(s:Game,id:ItemId)=>Math.max(0,s.items[id]||0)
export const level=(s:Game)=>1+Math.floor(s.xp/300)
const between=(n:unknown,lo:number,hi:number,fallback=lo)=>typeof n==='number'&&Number.isFinite(n)?Math.max(lo,Math.min(hi,Math.trunc(n))):fallback
const str=(x:unknown,n:number)=>typeof x==='string'?x.slice(0,n):''
const ids=<T extends string>(values:unknown,valid:readonly T[],max:number):T[]=>Array.isArray(values)?Array.from(new Set(values.filter((x):x is T=>typeof x==='string'&&valid.includes(x as T)))).slice(0,max):[]
const pick=(seed:number,list:readonly string[])=>list[Math.abs(seed)%list.length]
const attrs:Attribute[]=['力量','敏捷','體魄','感知','意志']
const itemIds=Object.keys(ITEM_INFO) as ItemId[]
const skillIds=Object.keys(SKILL_INFO) as SkillId[]
const petIds=Object.keys(PET_INFO) as PetId[]
const validBloods=Object.keys(BLOODLINE_INFO) as BloodlineId[]
const defaultAttrs=():Record<Attribute,number>=>({力量:5,敏捷:5,體魄:5,感知:5,意志:5})
export const NEW_GAME:Game={
 version:2,heroId:'',world:0,stage:'hub',genre:'horror',worldName:'主神空間',location:'輪迴者私人區域',turn:0,hp:100,sp:100,points:500,xp:0,attributes:defaultAttrs(),skills:{},bloodline:'none',pets:[],items:{plain_clothes:1,old_phone:1,first_aid:1},equipment:{weapon:null,armor:'plain_clothes'},enemy:null,flags:[],npcs:{},memory:[],summary:'你係初次進入主神空間嘅輪迴者；未學過任何技能，未獲得血脈或寵物。',logs:[],suggestions:[],lootAvailable:[],worldTurns:0,lastResult:''
}
export const freshGame=(heroId:string):Game=>({...NEW_GAME,heroId:str(heroId,100),attributes:defaultAttrs(),skills:{},pets:[],items:{...NEW_GAME.items},equipment:{...NEW_GAME.equipment},flags:[],npcs:{},memory:[],logs:[],lootAvailable:[]})
export function normalizeGame(input:unknown):Game{
 const p=(input&&typeof input==='object'&&!Array.isArray(input)?input:{}) as Record<string,unknown>,s=freshGame(str(p.heroId,100));
 const rawItems=p.items&&typeof p.items==='object'&&!Array.isArray(p.items)?p.items as Record<string,unknown>:{};
 const items:Game['items']={};
 for(const k of itemIds)if(k in rawItems)items[k]=between(rawItems[k],0,999,0);
 const rawSkills=p.skills&&typeof p.skills==='object'&&!Array.isArray(p.skills)?p.skills as Record<string,unknown>:{};
 const skills:Game['skills']={};for(const k of skillIds)if(k in rawSkills)skills[k]=between(rawSkills[k],0,3,0);
 const rawAttrs=p.attributes&&typeof p.attributes==='object'&&!Array.isArray(p.attributes)?p.attributes as Record<string,unknown>:{};
 const attributes=defaultAttrs();for(const k of attrs)attributes[k]=between(rawAttrs[k],1,18,5);
 const stage=['hub','explore','combat','down'].includes(String(p.stage))?p.stage as Game['stage']:'hub';
 const memory:MemoryEvent[]=Array.isArray(p.memory)?p.memory.slice(-250).map((x:unknown,i:number)=>{
  const m=(x&&typeof x==='object'?x:{}) as Record<string,unknown>;
  const type=['choice','combat','loot','relationship','discovery','upgrade','world'].includes(String(m.type))?m.type as MemoryEvent['type']:'choice';
  return {id:between(m.id,0,999999,i),world:str(m.world,80),turn:between(m.turn,0,999999),type,text:str(m.text,230),important:m.important===true}
 }):[];
 const npcs:Game['npcs']={};const r=p.npcs&&typeof p.npcs==='object'&&!Array.isArray(p.npcs)?p.npcs as Record<string,unknown>:{};
 for(const [k,v] of Object.entries(r).slice(0,60)){
  const x=(v&&typeof v==='object'?v:{}) as Record<string,unknown>;const status=['正常','受傷','失蹤','死亡'].includes(String(x.status))?x.status as NpcMemory['status']:'正常';
  npcs[k.slice(0,45)]={name:k.slice(0,45),trust:between(x.trust,-5,5,0),status,facts:Array.isArray(x.facts)?x.facts.filter(y=>typeof y==='string').slice(0,12).map(y=>y.slice(0,140)):[]}
 }
 const equipment=(p.equipment&&typeof p.equipment==='object'?p.equipment:{}) as Record<string,unknown>;
 let weapon=itemIds.includes(equipment.weapon as ItemId)?equipment.weapon as ItemId:null;
 let armor=itemIds.includes(equipment.armor as ItemId)?equipment.armor as ItemId:null;
 if(!weapon||ITEM_INFO[weapon].slot!=='weapon'||!items[weapon])weapon=null;
 if(!armor||ITEM_INFO[armor].slot!=='armor'||!items[armor])armor=null;
 const logs:Entry[]=Array.isArray(p.logs)?p.logs.slice(-90).map((x:unknown,i:number)=>{
  const m=(x&&typeof x==='object'?x:{}) as Record<string,unknown>;return {id:between(m.id,0,999999,i),kind:['narration','dialogue','system','combat','choice'].includes(String(m.kind))?m.kind as Entry['kind']:'narration',speaker:str(m.speaker,60),text:str(m.text,1400),mood:EMOTION_MOODS.includes(m.mood as EmotionMood)?m.mood as EmotionMood:'calm',prelude:str(m.prelude,400)}
 }):[];
 let enemy:Enemy|null=null;
 if(p.enemy&&typeof p.enemy==='object'){
  const e=p.enemy as Record<string,unknown>;
  enemy={id:str(e.id,40),name:str(e.name,70),hp:between(e.hp,0,1000),maxHp:between(e.maxHp,1,1000,50),attack:between(e.attack,1,300,8),defense:between(e.defense,0,100),round:between(e.round,0,100),intent:str(e.intent,160)}
 }
 return {...s,world:between(p.world,0,10000),stage,genre:str(p.genre,30)||s.genre,worldName:str(p.worldName,80)||s.worldName,location:str(p.location,100)||s.location,turn:between(p.turn,0,999999),worldTurns:between(p.worldTurns,0,999999),hp:between(p.hp,0,100,100),sp:between(p.sp,0,100,100),points:between(p.points,0,9999999,500),xp:between(p.xp,0,9999999),attributes,skills,bloodline:validBloods.includes(p.bloodline as BloodlineId)?p.bloodline as BloodlineId:'none',pets:ids(p.pets,petIds,3).filter(x=>x!=='none'),items,equipment:{weapon,armor},enemy:stage==='combat'?enemy:null,flags:Array.isArray(p.flags)?p.flags.filter(x=>typeof x==='string').map(x=>x.slice(0,90)).slice(-80):[],npcs,memory,summary:str(p.summary,2500)||s.summary,logs,suggestions:Array.isArray(p.suggestions)?p.suggestions.filter(x=>typeof x==='string').map(x=>x.slice(0,130)).slice(0,3):[],lootAvailable:ids(p.lootAvailable,itemIds,5),lastResult:str(p.lastResult,400),heroId:str(p.heroId,100)}
}
export const remember=(s:Game,type:MemoryEvent['type'],text:string,important=false):Game=>({...s,memory:[...s.memory,{id:s.turn+Math.floor(Date.now()%100000),world:s.worldName,turn:s.turn,type,text:text.slice(0,230),important}].slice(-250)})
export function enterWorld(state:Game):Game{
 const s=normalizeGame(state);if(s.stage!=='hub')throw Error('必須先返回主神空間')
 const genre=GENRES[s.world%GENRES.length],worldName=pick(s.world,genre.worlds)+' · 輪迴 '+String(s.world+1).padStart(2,'0')
 let next:Game={...s,stage:'explore',world:s.world+1,genre:genre.id,worldName,location:'未知入口',worldTurns:0,lootAvailable:[],enemy:null,
 logs:[...s.logs,{id:s.turn+1,kind:'system' as const,text:'【主神】傳送完成。世界：'+worldName+'。請注意：你只能使用已獲得嘅物品同技能。'}].slice(-90),
 suggestions:['仔細觀察四周嘅環境','向附近人物詢問情報','先檢查隨身裝備'],lastResult:'已進入新世界'}
 next=remember(next,'world','進入世界：'+worldName,true);return next
}
export function returnHub(state:Game):Game{
 const s=normalizeGame(state);if(s.stage!=='explore'||s.worldTurns<4||!s.flags.includes('boss_cleared_'+s.world))throw Error('世界目標尚未完成；需要完成關鍵遭遇，才能領取通關獎勵')
 const points=100+Math.min(300,10*s.worldTurns);let next:Game={...s,stage:'hub',enemy:null,points:s.points+points,xp:s.xp+120,worldName:'主神空間',location:'輪迴者私人區域',lootAvailable:[],
 logs:[...s.logs,{id:s.turn+1,kind:'system' as const,text:'【主神】世界任務結算：+'+points+' PT，+120 XP。所有裝備及記憶已帶回。'}].slice(-90),
 lastResult:'返回主神空間'}
 next=remember(next,'world','成功由第 '+s.world+' 個輪迴世界回到主神空間',true);return next
}
export function purchase(state:Game,entryId:string):Game{
 const s=normalizeGame(state);if(s.stage!=='hub')throw Error('主神兌換只能喺主神空間進行')
 const offer=SHOP.find(x=>x.id===entryId);if(!offer)throw Error('兌換項目不存在')
 if(s.points<offer.price)throw Error('積分不足')
 const n:Game={...s,points:s.points-offer.price,attributes:{...s.attributes},items:{...s.items},skills:{...s.skills},pets:[...s.pets]};
 if(entryId.startsWith('attr:')){
  const k=entryId.slice(5) as Attribute;if(!attrs.includes(k)||s.attributes[k]>=18)throw Error('已達強化上限')
  n.attributes[k]++
 }else if(entryId.startsWith('skill:')){
  const k=entryId.slice(6) as SkillId;if(!skillIds.includes(k)||(s.skills[k]||0)>=3)throw Error('技能已達上限')
  n.skills[k]=(s.skills[k]||0)+1
 }else if(entryId.startsWith('bloodline:')){
  const k=entryId.slice(10) as BloodlineId;if(s.bloodline!=='none')throw Error('已擁有血脈，不可以任意覆蓋')
  const need=k==='dragon'?10:3;if(level(s)<need)throw Error('血脈需要 LV.'+need)
  n.bloodline=k
 }else if(entryId.startsWith('pet:')){
  const k=entryId.slice(4) as PetId;if(s.pets.includes(k)||s.pets.length>=2)throw Error('寵物已擁有或數量已滿')
  n.pets.push(k)
 }else if(entryId.startsWith('item:')){
  const k=entryId.slice(5) as ItemId;if(!itemIds.includes(k))throw Error('物品不存在')
  if(k==='pistol'&&!(s.skills.shooting||0))throw Error('必須先學習射擊訓練')
  n.items[k]=(n.items[k]||0)+(k==='ammo'?6:1)
 }else if(entryId==='rest'){n.hp=100;n.sp=100}
 else throw Error('兌換項目不支援')
 n.lastResult='主神兌換：'+offer.name+'（-'+offer.price+' PT）';return remember(n,'upgrade',n.lastResult,true)
}
export function equip(state:Game,id:ItemId):Game{
 const s=normalizeGame(state);const info=ITEM_INFO[id];if(!info||!owned(s,id)||!['weapon','armor'].includes(info.slot))throw Error('必須先真正擁有呢件裝備')
 if(id==='pistol'&&!s.skills.shooting)throw Error('尚未學習射擊訓練')
 const next={...s,equipment:{...s.equipment,[info.slot]:id},lastResult:'已裝備 '+info.name};return remember(next,'upgrade',next.lastResult)
}
export function useItem(state:Game,id:ItemId):Game{
 const s=normalizeGame(state);if(!owned(s,id))throw Error('冇呢件物品')
 const info=ITEM_INFO[id];if(!info||!info.heal)throw Error('呢件物品唔可以直接使用')
 if(s.hp>=100)throw Error('生命已滿')
 const newHp=Math.min(100,s.hp+info.heal+5*(s.skills.first_aid_skill||0))
 const next={...s,hp:newHp,items:{...s.items,[id]:owned(s,id)-1},lastResult:'使用 '+info.name+'，HP '+s.hp+' → '+newHp}
 return remember(next,'choice',next.lastResult)
}
export function worldLoot(state:Game,id:ItemId):Game{
 const s=normalizeGame(state);if(s.stage!=='explore'||!s.lootAvailable.includes(id))throw Error('呢件物品未曾出現喺當前世界嘅可拾取物品')
 const next={...s,items:{...s.items,[id]:owned(s,id)+1},lootAvailable:s.lootAvailable.filter(x=>x!==id),lastResult:'獲得 '+ITEM_INFO[id].name}
 return remember(next,'loot',next.lastResult,true)
}
export function spawnEncounter(state:Game):Game{
 const s=normalizeGame(state);if(s.stage!=='explore'||s.worldTurns<1)throw Error('現時冇有效戰鬥遭遇')
 const genre=GENRES.find(x=>x.id===s.genre)||GENRES[0];const hp=32+8*Math.min(s.world,15)
 return {...s,stage:'combat',enemy:{id:'foe-'+s.world,name:genre.foe,hp,maxHp:hp,attack:7+Math.floor(s.world*1.3),defense:3+Math.floor(s.world/3),round:0,intent:'向你逼近'},lastResult:'進入戰鬥，敵人：'+genre.foe}
}
export type BattleAction='attack'|'defend'|'flee'|'pet'|'skill'
export function resolveCombat(state:Game,action:BattleAction):Game{
 const s=normalizeGame(state);if(s.stage!=='combat'||!s.enemy)throw Error('當前冇戰鬥')
 const enemy={...s.enemy},items={...s.items};let hp=s.hp,sp=s.sp,damage=0,taken=0,succeeded=false,detail=''
 const weapon=s.equipment.weapon,info=weapon?ITEM_INFO[weapon]:null
 const skill=info?.skill?s.skills[info.skill]||0:s.skills.unarmed||0
 const usableWeapon=!!(weapon&&owned(s,weapon)&&info?.slot==='weapon'&&(weapon!=='pistol'||(s.skills.shooting||0)>0))
 if(action==='attack'){
  if(weapon==='pistol'&&usableWeapon){
   if(!owned(s,'ammo'))throw Error('冇子彈，唔可以開槍')
   items.ammo=owned(s,'ammo')-1
  }
  let atk=s.attributes.力量+(usableWeapon?(info?.attack||0):2)+skill*3+(s.bloodline==='wolf'?4:0)
  damage=Math.max(1,atk-enemy.defense+(s.attributes.敏捷>8?2:0));enemy.hp=Math.max(0,enemy.hp-damage)
  detail='你使用'+(usableWeapon?ITEM_INFO[weapon!].name:'徒手')+'攻擊，造成 '+damage+' 傷害。'
 }else if(action==='defend')detail='你採取防禦姿勢，減少敵方攻擊傷害。'
 else if(action==='flee'){
  const chance=25+s.attributes.敏捷*6+8*(s.skills.stealth||0)
  const roll=(s.turn*17+enemy.round*31+s.world*13)%100
  succeeded=roll<chance;detail=succeeded?'你成功撤離戰鬥。':'你嘗試撤退，但被敵人攔截。'
 }else if(action==='pet'){
  if(!s.pets.length)throw Error('尚未有寵物，唔可以召喚')
  damage=s.pets.includes('hound')?8:3;enemy.hp=Math.max(0,enemy.hp-damage)
  detail=PET_INFO[s.pets[0]].name+'提供支援，造成 '+damage+' 傷害。'
 }else if(action==='skill'){
  if(!(s.skills.focus||s.skills.unarmed||s.skills.sword||s.skills.warding))throw Error('尚未學習可以喺戰鬥中使用嘅技能')
  if(sp<12)throw Error('精神值不足（需要 12 SP）')
  sp-=12;damage=Math.max(4,5+3*((s.skills.unarmed||0)+(s.skills.sword||0)+(s.skills.warding||0)))
  enemy.hp=Math.max(0,enemy.hp-damage);detail='你運用已習得嘅戰技，消耗 12 SP，造成 '+damage+' 傷害。'
 }
 let stage:Game['stage']='combat',points=s.points,xp=s.xp;let flags=[...s.flags];let lootAvailable=[...s.lootAvailable];
 if(succeeded){stage='explore'}
 else if(enemy.hp<=0){stage='explore';points+=25;xp+=24;flags=Array.from(new Set([...flags,'boss_cleared_'+s.world]));const prize:ItemId=s.genre==='scifi'?'ammo':s.genre==='wuxia'||s.genre==='historical'?'ancient_note':'beast_tooth';lootAvailable=Array.from(new Set([...lootAvailable,prize]));detail+=' 敵人倒下，獲得 25 PT、24 XP；現場留下 '+ITEM_INFO[prize].name+'，尚未拾取。'}
 else{
  const base=enemy.attack+(enemy.round%3)*2
  taken=Math.max(1,base-(s.equipment.armor&&owned(s,s.equipment.armor)?ITEM_INFO[s.equipment.armor].defense||0:0)-(action==='defend'?6:0)-(s.attributes.體魄>8?2:0))
  hp=Math.max(0,hp-taken);detail+=' 敵人反擊，造成 '+taken+' 傷害。'
  if(hp===0){stage='down';detail+=' 你失去行動能力。'}
 }
 const weaponName=usableWeapon&&weapon?ITEM_INFO[weapon].name:'雙手'
 let narrative=''
 if(action==='attack'){
  narrative='你攥緊'+weaponName+'，沒有再等下去。看準對方露出的空隙，你猛地迎了上去。'+(weapon==='pistol'&&usableWeapon?'槍聲劃破空氣，硝煙味短暫掩過四周的氣息。':'一聲悶響，攻擊結結實實落在了'+enemy.name+'身上。')
 }else if(action==='defend'){
  narrative='你沒有急著還手，而是壓低身體重心，將注意力牢牢鎖在'+enemy.name+'的動作上。對方的攻勢逼近，你咬緊牙關，竭力擋下這一擊。'
 }else if(action==='flee'){
  narrative=succeeded?'趁著對方一瞬間的停頓，你轉身衝了出去。急促的腳步聲在身後漸漸拉遠，直到你終於確定自己脫離了眼前的險境。':'你朝著出口猛地退去，卻被'+enemy.name+'攔住了去路。退路被封死，你只能重新面對眼前的威脅。'
 }else if(action==='skill'){
  narrative='你讓呼吸慢了下來，集中精神，運用先前學過的戰技抓住對方的破綻。這一次，你的動作比剛才更加果斷。'
 }else if(action==='pet'){
  narrative='陪伴你的'+PET_INFO[s.pets[0]].name+'察覺到危險，立刻從旁牽制'+enemy.name+'。你終於找到了一絲喘息的機會。'
 }
 if(!succeeded&&enemy.hp<=0)narrative+='終於，'+enemy.name+'再也支撐不住，重重倒下。短暫的寂靜重新籠罩四周，但這個世界的故事還沒有結束。'
 else if(!succeeded&&hp===0)narrative+='痛楚驟然襲來，視野中的光一點點暗下去。你想要站穩，身體卻已經不聽使喚。'
 else if(!succeeded)narrative+='然而，'+enemy.name+'並未退去。它的反擊緊隨而至，你不得不再次調整腳步。'
 const next:Game={...s,turn:s.turn+1,stage,hp,sp,points,xp,items,flags,lootAvailable,enemy:stage==='combat'?{...enemy,round:enemy.round+1}:null,lastResult:detail,
 logs:[...s.logs,{id:s.turn+1,kind:'combat' as const,text:narrative,mood:stage==='down'?'grief' as const:enemy.hp<=0?'resolve' as const:taken>0?'shock' as const:'suspense' as const}].slice(-90)}
 return remember(next,'combat',detail,stage!=='combat')
}
export function recentContext(state:Game,action:string){
 const s=normalizeGame(state);const important=s.memory.filter(x=>x.important).slice(-30),recent=s.memory.slice(-12)
 const vocab=new Set(action.toLowerCase().match(/[\u3400-\u9fff]{2,}|[a-z0-9]{3,}/g)||[])
 const related=s.memory.filter(x=>Array.from(vocab).some(w=>x.text.toLowerCase().includes(w))).slice(-8)
 const selected=Array.from(new Map([...important,...related,...recent].map(x=>[x.id+'-'+x.text,x])).values()).slice(-35)
 return {world:s.worldName,worldTurn:s.worldTurns,location:s.location,attributes:s.attributes,skills:Object.fromEntries(Object.entries(s.skills).map(([k,n])=>[SKILL_INFO[k as SkillId].name,n])),bloodline:BLOODLINE_INFO[s.bloodline].name,pets:s.pets.map(x=>PET_INFO[x].name),
 items:itemIds.filter(x=>owned(s,x)>0).map(x=>({id:x,name:ITEM_INFO[x].name,count:owned(s,x)})),
 equipment:{weapon:s.equipment.weapon?ITEM_INFO[s.equipment.weapon].name:'徒手',armor:s.equipment.armor?ITEM_INFO[s.equipment.armor].name:'無'},
 npc:s.npcs,importantFacts:s.flags.slice(-40),longSummary:s.summary,memories:selected.map(x=>({world:x.world,text:x.text,type:x.type})),
 lastActions:s.logs.slice(-8).map(x=>x.kind+':'+x.text.slice(0,180)),availableLoot:s.lootAvailable.map(x=>ITEM_INFO[x].name),action}
}
export function storyBeat(state:Game,action:string,turn:{story:string;dialogue?:{speaker:string;text:string}[];location?:string;choices?:string[];summary?:string;discovery?:string;encounter?:boolean;npc?:{name:string;trust?:number;status?:string};beats?:StoryBeat[]}):Game{
 const s=normalizeGame(state);if(s.stage!=='explore')throw Error('唔喺自由探索狀態')
 const story=str(turn.story,1500);if(!story)throw Error('AI 未產生有效劇情')
 const taboo=Object.entries(ITEM_INFO).filter(([id,v])=>v.slot==='weapon'&&!owned(s,id as ItemId)).map(([,v])=>v.name)
 const playerClaims=new RegExp('(?:你|玩家|主角)(?:立即|突然|竟然|已經|手中|從背包|掏出|拔出|拿起|揮動|握著|用)[^。！？\\n]{0,18}(?:'+taboo.join('|')+')')
 if(taboo.length&&playerClaims.test(story))throw Error('AI 描述咗玩家未擁有嘅武器，已攔截')
 const choices=Array.isArray(turn.choices)?turn.choices.filter(x=>typeof x==='string').slice(0,3).map(x=>x.slice(0,120)):[]
 const log:Entry[]=[{id:s.turn+1,kind:'choice',text:action.slice(0,500)}]
 // Persist the exact dramatic beats, so their intended emotional timing survives reload.
 // Older saves with one narration entry remain fully supported.
 if(Array.isArray(turn.beats)&&turn.beats.length){
  turn.beats.slice(0,10).forEach((beat,i)=>{
   const text=str(beat.text,450)
   if(!text)continue
   const mood=EMOTION_MOODS.includes(beat.mood)?beat.mood:'calm'
   const kind:Entry['kind']=beat.kind==='dialogue'?'dialogue':beat.kind==='system'?'system':'narration'
   log.push({id:s.turn+2+i,kind,text,mood,
    speaker:kind==='dialogue'?str(beat.speaker,50):undefined,
    prelude:(mood==='eerie'||mood==='anger')?str(beat.prelude,400):undefined})
  })
 }
 if(log.length===1){
  log.push({id:s.turn+2,kind:'narration',text:story,mood:'calm'})
  for(const d of Array.isArray(turn.dialogue)?turn.dialogue.slice(0,3):[]){
   if(typeof d.text==='string'&&typeof d.speaker==='string')log.push({id:s.turn+2,kind:'dialogue',speaker:d.speaker.slice(0,45),text:d.text.slice(0,250),mood:'calm'})
  }
 }
 const npcs={...s.npcs}
 if(turn.npc&&typeof turn.npc.name==='string'){
  const name=turn.npc.name.slice(0,40),before=npcs[name]||{name,trust:0,status:'正常' as const,facts:[]}
  const status=['正常','受傷','失蹤','死亡'].includes(String(turn.npc.status))?turn.npc.status as NpcMemory['status']:before.status
  // Don't let a model revive dead NPCs.
  npcs[name]={...before,trust:Math.max(-5,Math.min(5,before.trust+Math.max(-1,Math.min(1,between(turn.npc.trust,-5,5,before.trust)-before.trust)))),status:before.status==='死亡'?'死亡':status}
 }
 let next:Game={...s,turn:s.turn+1,worldTurns:s.worldTurns+1,location:str(turn.location,100)||s.location,
 logs:[...s.logs,...log].slice(-90),suggestions:choices.length===3?choices:[
  /聲音|腳步|敲擊|低語|回音/.test(story)?'停下來辨認聲音傳來的方向，再尋找相關痕跡':'留意眼前細節，找出其他人忽略的線索',
  /同伴|老人|女子|男人|人影|守衛/.test(story)?'詢問附近人物剛才發生了甚麼，觀察對方的神情':'沿著目前通道緩慢前進，留意每個可能的出口',
  '暫時不冒險，先確認撤退方向與周圍的安全情況'
 ],
 summary:str(turn.summary,2500)||s.summary,npcs,lastResult:'劇情已推進'}
 if(turn.discovery&&typeof turn.discovery==='string')next=remember(next,'discovery',turn.discovery.slice(0,220),true)
 next=remember(next,'choice','你選擇：'+action.slice(0,170))
 if(/泛黃手記|舊手記|破舊筆記/.test(story)&&!next.lootAvailable.includes('ancient_note'))next.lootAvailable=[...next.lootAvailable,'ancient_note']
 if(!next.flags.includes('boss_cleared_'+next.world)&&next.worldTurns>=4&&turn.encounter===true)next=spawnEncounter(next)
 return next
}
export function containsUnauthorizedAction(state:Game,action:string):string|null{
 const s=normalizeGame(state)
 const forbidden=[
  {pattern:/(?:用|揮|拔|拿|掏出|發射|開槍|使用).{0,15}(?:手槍|槍械|槍)/,id:'pistol' as ItemId,msg:'你未擁有手槍，或者未符合射擊條件。'},
  {pattern:/(?:用|揮|拔|拿|掏出|使用).{0,15}(?:短刀|匕首|刀)/,id:'rusty_knife' as ItemId,msg:'你未擁有刀劍裝備。'},
  {pattern:/(?:用|揮|拿|掏出|使用).{0,15}(?:鐵棍|棍棒)/,id:'iron_pipe' as ItemId,msg:'你未擁有鐵棍。'}
 ]
 for(const x of forbidden)if(x.pattern.test(action)&&!owned(s,x.id))return x.msg
 if(/(?:召喚|命令|派出).{0,15}(?:寵物|偵查犬|夜梟|精靈)/.test(action)&&!s.pets.length)return '你未擁有任何寵物。'
 if(/(?:變身|發動).{0,12}(?:狼人|夜狼|靈視|古龍|龍族血脈)/.test(action)&&s.bloodline==='none')return '你未獲得任何特殊血脈。'
 if(/(?:施展|使用|發動).{0,12}(?:劍法|槍術|射擊技能|符文|法術)/.test(action)&&Object.values(s.skills).every(x=>!x))return '你未學過對應技能，唔可以憑空施展。'
 return null
}

