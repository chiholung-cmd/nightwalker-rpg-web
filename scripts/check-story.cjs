/* Automated sanity checks for the branching story graph and permanent progression. */
const assert = require('node:assert/strict')
const fs = require('node:fs')
const path = require('node:path')
const ts = require('typescript')
const cache = new Map()
function loadTypeScript(filename) {
  const p = path.resolve(filename)
  if(cache.has(p))return cache.get(p).exports
  const module = {exports:{}}
  cache.set(p,module)
  const raw=fs.readFileSync(p,'utf8')
  const output=ts.transpileModule(raw,{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020}}).outputText
  const localRequire=(specifier)=>{
    if(specifier.startsWith('.'))return loadTypeScript(path.resolve(path.dirname(p),specifier)+'.ts')
    return require(specifier)
  }
  new Function('require','module','exports',output)(localRequire,module,module.exports)
  return module.exports
}
const {SCENES,INITIAL,availableChoices,applyEffect}=loadTypeScript('lib/infiniteStory.ts')
const {spendTalent,talentRank,maxHp,awardXp}=loadTypeScript('lib/progression.ts')
let choices=0,missing=[]
for(const [id,scene] of Object.entries(SCENES)){
  assert.equal(id,scene.id,'Scene ID mismatch: '+id)
  assert(scene.lines.length>0,'Missing dialogue at '+id)
  for(const choice of scene.choices){
    choices++
    if(choice.to&&!SCENES[choice.to])missing.push(id+' => '+choice.to)
  }
}
assert.deepEqual(missing,[],'Dangling story links')
assert(Object.keys(SCENES).length>=80,'Expected film, TV, anime and archived worlds')
for(const [world,route] of [['德古拉','gothic_start'],['科學怪人','arctic_start'],['第十三號放映室','cinema_start']]) {
  assert(availableChoices(SCENES.screen_literature,INITIAL).some(c=>c.to===route),'Missing portal: '+world)
  assert(!availableChoices(SCENES.screen_literature,applyEffect(INITIAL,{clearWorld:world})).some(c=>c.to===route),'Cleared world should not reward repeated visits: '+world)
}
assert(!Object.values(SCENES).flatMap(x=>x.choices).some(c=>c.action==='battle'),'Story scenes still trigger the on-hold combat system')
assert(availableChoices(SCENES.gothic_castle,INITIAL).some(c=>c.to==='gothic_tower'),'Castle must be escapable without prerequisite items')
assert(availableChoices(SCENES.cinema_set,{...INITIAL,items:[...INITIAL.items,'改寫場景剪刀']}).some(c=>c.requiresItem==='改寫場景剪刀'),'Cinema film editing path not available')

assert(Object.keys(SCENES).length>=80,'Expected branching film, television and anime worlds')
for(const [label,start,world] of [
  ['cinema','film_arrival','午夜放映廳'],
  ['literary','novel_arrival','霧中第七章'],
  ['classic gothic','gothic_start','德古拉'],
  ['classic arctic','arctic_start','科學怪人'],
  ['film','film_sub_arrival','深海零號艙'],
  ['series','tv_week_arrival','倒數七日'],
  ['anime','anime_school_arrival','逆時學園']]){
  assert(SCENES[start],label+' missing start scene')
  assert(availableChoices(SCENES[['film_arrival','cinema_start'].includes(start)?'screen_cinema_archives':['film_sub_arrival','tv_week_arrival','anime_school_arrival'].includes(start)?'screen_hub':'screen_literature'],INITIAL).some(c=>c.to===start),label+' should unlock at the hub')
  const ending=Object.values(SCENES).some(s=>s.world===world&&s.choices.some(c=>c.effect?.clearWorld===world))
  assert(ending,label+' missing an ending with a world clear')
}
assert(Object.values(SCENES).every(s=>s.choices.every(c=>c.action!=='battle')),'Story-first mode must have no combat-only branch')
assert.deepEqual(SCENES.film_actress.moods,['sad','fear','resolve'])
assert(SCENES.novel_heroine.choices.some(c=>c.effect?.flags?.includes('novel_heard_her')),'NPC agency route missing')

assert(availableChoices(SCENES.hub_portals,INITIAL).some(c=>c.to==='screen_hub'),'Main screen worlds entry missing')
assert(availableChoices(SCENES.screen_hub,INITIAL).some(c=>c.to==='anime_school_arrival'),'Anime route missing')
assert(!availableChoices(SCENES.hub_portals,INITIAL).some(c=>c.to==='fourth_threshold'),'Fourth door opened too early')
let s=INITIAL
for(const name of ['失物管理處','血月公寓','鏡城病院'])s=applyEffect(s,{clearWorld:name,points:20})
assert(s.level>1&&s.talentPoints>0,'No talent XP on world clears')
assert(availableChoices(SCENES.hub_portals,s).some(c=>c.to==='fourth_threshold'),'Fourth door not unlocked after three clears')
const before=s.talentPoints
s=spendTalent(s,'insight')
assert.equal(talentRank(s,'insight'),1,'Talent did not unlock')
assert.equal(s.talentPoints,before-1,'Talent point did not consume')
assert(availableChoices(SCENES.guide_first,s).length>=3)
const health=spendTalent(s,'vitality')
assert(maxHp(health)>=maxHp(s),'HP talent did not work')
const xp=awardXp(INITIAL,75)
assert.equal(xp.level,2)
const full=applyEffect(s,{clearWorld:'第四道門'})
assert(full.cleared.includes('第四道門'))
assert(!availableChoices(SCENES.hub_portals,full).some(c=>c.to==='fourth_threshold'),'Cleared fourth door should close')
console.log('PASS: '+Object.keys(SCENES).length+' scenes, '+choices+' choices; graph, world gates, leveling, talent spending, end states')
