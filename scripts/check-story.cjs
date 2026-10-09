/* Nightwalker trilogy: story links, gating, rewards, progression and playthrough regression. */
const assert=require('node:assert/strict')
const fs=require('node:fs')
const path=require('node:path')
const ts=require('typescript')
const cache=new Map()
function load(file){
  const p=path.resolve(file)
  if(cache.has(p))return cache.get(p).exports
  const module={exports:{}}
  cache.set(p,module)
  const code=ts.transpileModule(fs.readFileSync(p,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020}}).outputText
  new Function('require','module','exports',code)(spec=>spec.startsWith('.')?load(path.resolve(path.dirname(p),spec)+'.ts'):require(spec),module,module.exports)
  return module.exports
}
const {SCENES,INITIAL,availableChoices,applyEffect}=load('lib/infiniteStory.ts')
const {spendTalent,talentRank,maxHp,awardXp}=load('lib/progression.ts')
const {FILM_MISSIONS,unlockedFilm}=load('lib/movieMissions.ts')
let choices=0
const moods=new Set(['neutral','fear','sad','joy','anger','mystery','resolve'])
for(const [key,s] of Object.entries(SCENES)){
  assert.equal(key,s.id,'Scene ID mismatch: '+key)
  assert(s.lines.length>0,'Empty scene: '+key)
  for(const m of s.moods||[])assert(moods.has(m),'Unknown mood '+m+' at '+key)
  for(const choice of s.choices){
    choices++
    if(choice.to)assert(SCENES[choice.to],'Broken choice link: '+key+' to '+choice.to)
  }
}
assert(Object.keys(SCENES).length>100,'Main and archived worlds must remain available')
assert.deepEqual(FILM_MISSIONS.map(m=>m.clear),['生化危機2002','VanHelsing2004','風雲1998'])
assert(availableChoices(SCENES.movie_portals,INITIAL).some(c=>c.to==='re_arrival'))
assert(!availableChoices(SCENES.movie_portals,INITIAL).some(c=>c.to==='vh_arrival'||c.to==='fy_arrival'))
assert(!Object.values(SCENES).some(s=>s.choices.some(c=>c.action==='battle')),'Narrative should not require combat screen')
const take=(state,where,to)=>{
  const list=availableChoices(SCENES[where],state)
  const c=list.find(x=>x.to===to)
  assert(c,'No reachable choice: '+where+' -> '+to+' under saved flags')
  const updated=applyEffect(state,c.effect)
  assert(updated.hp>0&&updated.sp>0,'Main path must be survivable '+where)
  return updated
}
let s=INITIAL
const bio=['re_arrival','re_terminal','re_queen','re_infected','re_lab','re_train','re_ending','re_clear','movie_after_first']
for(let i=0;i<bio.length-1;i++)s=take(s,bio[i],bio[i+1])
assert(s.cleared.includes('生化危機2002'))
assert(unlockedFilm(FILM_MISSIONS[1],s),'Second world should unlock after first')
assert.equal(s.mastery.tech,1)
const vh=['movie_after_first','vh_arrival','vh_helsing','vh_village','vh_velkan','vh_frankenstein','vh_ball','vh_crypt','vh_last_choice','vh_ending','vh_clear','movie_after_second']
for(let i=0;i<vh.length-1;i++)s=take(s,vh[i],vh[i+1])
assert(s.cleared.includes('VanHelsing2004'))
assert(s.mastery.occult===1)
assert(unlockedFilm(FILM_MISSIONS[2],s),'Storm Riders must unlock')
const fy=['movie_after_second','fy_arrival','fy_prophecy','fy_kongchi','fy_cloud','fy_wedding','fy_after_wedding','fy_final_preparation','fy_climax','fy_ending','fy_clear','movie_trilogy_epilogue']
for(let i=0;i<fy.length-1;i++)s=take(s,fy[i],fy[i+1])
assert(s.cleared.includes('風雲1998'))
assert(s.mastery.martial===1)
assert(availableChoices(SCENES.movie_portals,s).some(c=>c.to==='movie_trilogy_epilogue'))
assert(!availableChoices(SCENES.movie_portals,s).some(c=>c.to==='re_arrival'||c.to==='vh_arrival'||c.to==='fy_arrival'))
const r1=applyEffect(INITIAL,{branch:'D',points:40,mastery:'tech'})
assert.equal(r1.branches.D,1)
assert.equal(r1.mastery.tech,1)
assert(availableChoices(SCENES.vh_carl,r1).some(c=>c.requiresMastery?.key==='tech'),'Technology must have a second-world narrative use')
assert(availableChoices(SCENES.fy_prophecy,applyEffect(r1,{mastery:'occult'})).some(c=>c.requiresMastery?.key==='occult'),'Occult mastery must have a third-world narrative use')
const kong=availableChoices(SCENES.fy_ending,{...INITIAL,flags:[...INITIAL.flags,'fy_kongchi_saved']})
assert(!kong.some(c=>c.effect?.branch==='C'),'C-rank ending cannot unlock on rescue alone')
assert(availableChoices(SCENES.fy_ending,{...INITIAL,flags:[...INITIAL.flags,'fy_kongchi_saved','fy_joint_victory']}).some(c=>c.effect?.branch==='C'))
let talent=awardXp(INITIAL,75)
assert.equal(talent.level,2)
const spent=spendTalent(talent,'vitality')
assert.equal(talentRank(spent,'vitality'),1)
assert(maxHp(spent)>maxHp(talent))
console.log('PASS '+Object.keys(SCENES).length+' scenes; '+choices+' choices; 3 film playthroughs; gating, branching, mastery, reward safety and talents')
