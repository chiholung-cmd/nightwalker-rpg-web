/* Checks story graph and effects without a test framework; run: node scripts/validate-story.cjs */
const fs = require('node:fs');
const path = require('node:path');
const ts = require('typescript');

// The narrative world imports progression and other TypeScript modules.
// Resolve them relative to their actual source file, not this test script.
const moduleCache = new Map();
function load(file) {
 const filename=path.resolve(file);
 if(moduleCache.has(filename))return moduleCache.get(filename).exports;
 const mod={exports:{}};
 moduleCache.set(filename,mod);
 const source=fs.readFileSync(filename,'utf8');
 const compiled=ts.transpileModule(source,{compilerOptions:{target:ts.ScriptTarget.ES2020,module:ts.ModuleKind.CommonJS},reportDiagnostics:true});
 const errors=(compiled.diagnostics||[]).filter(x=>x.category===ts.DiagnosticCategory.Error);
 if(errors.length)throw new Error('TypeScript syntax: '+errors.map(x=>ts.flattenDiagnosticMessageText(x.messageText,' ')).join(' | '));
 const localRequire=(name)=>name.startsWith('.')
  ?load(path.resolve(path.dirname(filename),name)+'.ts')
  :require(name);
 new Function('require','module','exports',compiled.outputText)(localRequire,mod,mod.exports);
 return mod.exports;
}
const {SCENES,INITIAL,availableChoices,applyEffect,sceneFor,effectiveLines}=load(path.join(__dirname,'../lib/infiniteStory.ts'));
let checks=0;
function assert(test,message){if(!test)throw new Error(message);checks++}
assert(Object.keys(SCENES).length>=30,'Expected a real multi-world branching story');
assert(INITIAL.hp===100&&INITIAL.sp===74&&INITIAL.points===105,'Zero-station stats not retained');
assert(INITIAL.items.includes('鏡面碎片')&&INITIAL.flags.includes('no_name'),'Legacy items or identity missing');
const destinations=new Set(['hub_arrival']);
const pending=['hub_arrival'];
while(pending.length) {
  const key=pending.shift();const scene=SCENES[key];
  assert(Boolean(scene),'Missing scene '+key);
  assert(scene.id===key,'Scene id mismatch '+key);
  assert(scene.lines.length>0,'Empty dialogue '+key);
  assert(scene.choices.length>0,'Scene without actions '+key);
  for(const c of scene.choices){
    assert(Boolean(c.to)||c.action==='shop'||c.action==='combat-practice','Action without scene destination in '+key);
    if(c.to){
      assert(Boolean(SCENES[c.to]),'Choice '+c.label+' from '+key+' has invalid target '+c.to);
      if(!destinations.has(c.to)){destinations.add(c.to);pending.push(c.to)}
    }
  }
}
// All scenes must have valid edges, even archived chapters intentionally absent
// from the new movie-first hub's mainline reachability traversal.
for(const [key,scene] of Object.entries(SCENES)){
 assert(scene.id===key,'Archived scene id mismatch '+key);
 assert(scene.lines.length>0,'Empty scene '+key);
 for(const choice of scene.choices){
  assert(Boolean(choice.to)||choice.action==='shop'||choice.action==='combat-practice','Unresolved action in '+key);
  if(choice.to)assert(Boolean(SCENES[choice.to]),'Broken archived target '+key+' -> '+choice.to);
 }
}
assert(destinations.size>40,'Too few reachable scenes in current hub');
for(const id of ['lost_arrival','blood_arrival','hospital_arrival']){
 assert(destinations.has(id),'Archived world lost its entry: '+id);
}
const portal=SCENES.hub_portals;
const archived=SCENES.screen_old_archives;
assert(availableChoices(portal,INITIAL).some(x=>x.to==='movie_portals'),'Movie-first hub route must exist');
assert(availableChoices(portal,INITIAL).some(x=>x.to==='screen_old_archives'),'Archived worlds must be accessible');
assert(availableChoices(archived,INITIAL).some(x=>x.to==='lost_arrival'),'Lost archive must be available');
assert(availableChoices(archived,INITIAL).some(x=>x.to==='hospital_arrival'),'Hospital archive must be available');
let progressed=applyEffect(INITIAL,{clearWorld:'失物管理處',flags:['archive_truth'],items:['玩家0000檔案'],sp:-6,journal:'truth'});
progressed=applyEffect(progressed,{clearWorld:'血月公寓'});
progressed=applyEffect(progressed,{clearWorld:'鏡城病院'});
assert(!availableChoices(archived,progressed).some(x=>x.to==='lost_arrival'),'Cleared archive must not remain farmable');
assert(progressed.items.includes('玩家0000檔案')&&progressed.flags.includes('archive_truth'),'Cross-world information lost');
assert(progressed.journal.includes('truth'),'Consequences not persisted');
const spent=applyEffect(progressed,{points:-99999,hp:-500,sp:900,removeItems:['半張染血車票'],riftAdvance:true});
assert(spent.points===0&&spent.hp===0&&spent.sp===100,'Stats limits not enforced');
assert(!spent.items.includes('半張染血車票'),'Consumable should be removed');
assert(spent.riftCount===1,'Next iteration must advance');
assert(effectiveLines(SCENES.rift_arrival,spent)[0].includes('002'),'Procedural loop counter must change narrative');
const negotiated=availableChoices(SCENES.lost_clerk,progressed);
assert(negotiated.some(x=>x.label.includes('展示檔案')),'Truth route should unlock a non-combat exit');
const noEvidence=availableChoices(SCENES.lost_clerk,INITIAL);
assert(!noEvidence.some(x=>x.label.includes('展示檔案')),'Players without evidence must not bypass clues');
assert(sceneFor('something-invalid').id==='hub_arrival','Invalid saved scene needs safe fallback');
console.log('PASS: '+checks+' narrative assertions; '+Object.keys(SCENES).length+' main-hub scenes reached, world locks, effects, choices and rift verified.');
