const assert=require('node:assert/strict')
const fs=require('node:fs')
const path=require('node:path')
const ts=require('typescript')
const cache=new Map()
function load(file){
 const id=path.resolve(file)
 if(cache.has(id))return cache.get(id).exports
 const module={exports:{}};cache.set(id,module)
 const compiled=ts.transpileModule(fs.readFileSync(id,'utf8'),{
  compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020}
 }).outputText
 new Function('require','module','exports',compiled)((name)=>name.startsWith('.')?load(path.resolve(path.dirname(id),name)+'.ts'):require(name),module,module.exports)
 return module.exports
}
const {MOVIES,NEW_GAME,normalizeSave,parseTurn,applyTurn,advanceWorld,makePrompt}=load('lib/aiAdventure.ts')
assert.equal(MOVIES.length,3)
assert.deepEqual(MOVIES.map(w=>w.year),[2002,2004,1998])
function turn(overrides={}){
 return parseTurn({title:'電影世界・新事件',location:'蜂巢電梯附近',
  story:'你嘗試與 Alice 一齊檢查機關。警示燈突然轉紅，走廊傳來鐵門撞擊聲。隊友要求你先確認有冇安全出口，並問你點樣認識呢度嘅設備。',
  dialogue:[{speaker:'Alice',emotion:'疑惑',text:'你到底係邊個？'}],
  outcome:'部分成功',consequence:'Alice 注意到你知道太多內情。',
  effects:{hp:-3,sp:-1,time:5,points:0,xp:2,gain:['通行卡'],lose:[],flags:['發現危險'],trust:[{name:'Alice',delta:1}]},
  suggestions:['調查通道','與 Alice 交談'],memory:'Alice對玩家產生疑惑',
  summary:'主神將玩家送到蜂巢，Alice知道玩家可能有秘密。',
  missionComplete:false,missionProof:'',...overrides})
}
let s=normalizeSave(NEW_GAME)
const proof='已經實際成功離開蜂巢，完成撤離任務並且確認隊伍從地下列車到達地面安全封鎖線，所有成員均已檢查。'
let response=turn({missionComplete:true,missionProof:proof})
s=applyTurn(s,'我宣布自己通關了',response)
assert.equal(s.stage,'playing','Cannot instantly finish film by saying it')
assert.equal(s.people.Alice.trust,1)
assert(s.memories.length===1)
assert(s.items.includes('通行卡'))
assert.throws(()=>advanceWorld(s))
for(let i=1;i<7;i++)s=applyTurn(s,'繼續探索',turn({effects:{hp:0,sp:0,time:2,points:0,xp:0,gain:[],lose:[],flags:[],trust:[]}}))
assert.equal(s.stage,'playing')
s=applyTurn(s,'實際撤離完成',response)
assert.equal(s.stage,'hub')
assert(s.cleared.includes('re2002'))
assert(s.points>=120)
const t=advanceWorld(s)
assert.equal(t.world,1)
assert.equal(t.stage,'playing')
assert(t.hp>=80&&t.sp>=75)
assert(t.items.includes('通行卡'))
assert.equal(t.people.Alice.trust,2)
const malicious=turn({effects:{hp:-900,sp:9999,time:9999,points:999999,xp:5000,gain:['王者神劍'],lose:[],flags:[],trust:[{name:'Dracula',delta:9999}]}})
const p=parseTurn({title:malicious.title,location:malicious.location,story:malicious.story,dialogue:malicious.dialogue,
 outcome:malicious.outcome,consequence:malicious.consequence,suggestions:malicious.suggestions,effects:{
 hp:-900,sp:9999,time:9999,points:999999,xp:5000,gain:['王者神劍'],lose:[],flags:[],trust:[{name:'Dracula',delta:9999}]
 },memory:'',summary:'',missionComplete:false,missionProof:''})
const capped=applyTurn(t,'試圖威脅所有人',p)
assert.equal(p.effects.hp,-30)
assert.equal(p.effects.sp,15)
assert.equal(p.effects.points,10)
assert.equal(p.effects.xp,12)
assert.equal(p.effects.time,25)
assert.equal(capped.people.Dracula.trust,1)
const system=makePrompt(t,'我想同 Anna 傾偈')
assert(system.system.includes('2004')&&system.system.includes('Anna'))
assert(system.user.includes('通行卡'))
assert.equal(normalizeSave({...t,world:999}).world,2)
console.log('PASS AI adventure: open actions, saves, NPC trust, effect clamping, world gating, memory and canon prompts')
