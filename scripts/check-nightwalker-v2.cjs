const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),ts=require('typescript');
const cache=new Map();
function load(f){const id=path.resolve(f);if(cache.has(id))return cache.get(id).exports;const m={exports:{}};cache.set(id,m);const js=ts.transpileModule(fs.readFileSync(id,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020}}).outputText;new Function('require','module','exports',js)((name)=>name.startsWith('.')?load(path.resolve(path.dirname(id),name)+'.ts'):require(name),m,m.exports);return m.exports}
const E=load('lib/nightwalkerGame.ts');
const fresh=()=>E.freshGame('uuid-1-2-3');
let s=fresh();
assert.equal(s.items.first_aid,1);
assert.equal(E.containsUnauthorizedAction(s,'我拔出手槍向敵人開槍')!==null,true,'no phantom pistol');
assert.equal(E.containsUnauthorizedAction(s,'召喚偵查犬')!==null,true,'no phantom pet');
assert.equal(E.containsUnauthorizedAction(s,'使用劍法攻擊')!==null,true,'no phantom skills');
assert.throws(()=>E.equip(s,'pistol'));
assert.throws(()=>E.purchase(s,'bloodline:dragon'));
assert.throws(()=>E.purchase(s,'item:pistol'));
assert.throws(()=>E.purchase({...s,points:0},'skill:sword'));
const shopBefore=s.points;s=E.purchase(s,'skill:shooting');assert.equal(s.points,shopBefore-240);assert.equal(s.skills.shooting,1);
s=E.purchase(s,'item:ammo');assert.equal(s.items.ammo,6);
assert.throws(()=>E.purchase(s,'item:pistol'),'remaining points too few');
s=E.purchase({...s,points:1000},'item:pistol');s=E.equip(s,'pistol');assert.equal(s.equipment.weapon,'pistol');
let batt={...E.enterWorld(s),worldTurns:4};
assert.throws(()=>E.returnHub(batt),'cannot get free rewards before boss');
batt=E.spawnEncounter(batt);assert.equal(batt.stage,'combat');
let count=0;while(batt.stage==='combat'&&count++<100)batt=E.resolveCombat(batt,'attack');
assert.equal(batt.stage,'explore');assert.ok(batt.flags.includes('boss_cleared_1'));assert.equal(batt.items.ammo,6-count);assert.equal(batt.equipment.weapon,'pistol');
assert.ok(batt.lootAvailable.includes('beast_tooth'));
const picked=E.worldLoot(batt,'beast_tooth');assert.equal(picked.items.beast_tooth,1);
assert.throws(()=>E.worldLoot(picked,'beast_tooth'),'cannot duplicate loot');
const hub=E.returnHub(picked);assert.equal(hub.stage,'hub');
assert.equal(hub.items.pistol,1);assert.equal(hub.items.ammo,6-count);
assert.ok(hub.memory.some(x=>x.type==='combat'));assert.ok(hub.memory.some(x=>x.type==='world'));
assert.equal(E.normalizeGame(JSON.parse(JSON.stringify(hub))).equipment.weapon,'pistol');
let safe=E.enterWorld(fresh());
assert.throws(()=>E.storyBeat(safe,'我用神劍',{
 story:'你拔出生鏽短刀，揮動刀劍將敵人消滅。',
 choices:['調查','前進','撤退']
}),/未擁有/);
safe=E.storyBeat(safe,'環顧四周',{story:'前面係一片空曠地帶，你發現一封遺失嘅信。',dialogue:[{speaker:'阿霧',text:'小心啲。'}],choices:['問路','等待','翻查線索'],discovery:'你發現遺失嘅信'});
assert.equal(safe.worldTurns,1);assert.ok(safe.memory.some(m=>m.type==='discovery'));
assert.equal(safe.items.ancient_note||0,0,'story cannot grant item automatically');
safe=E.storyBeat(safe,'尋找手記',{story:'你留意到書架上有一本舊手記。'});
assert.ok(safe.lootAvailable.includes('ancient_note'));
safe=E.worldLoot(safe,'ancient_note');assert.equal(safe.items.ancient_note,1);
const memory=E.recentContext(safe,'手記');
assert(memory.memories.some(m=>m.text.includes('信')));
assert(memory.items.some(x=>x.id==='ancient_note'));
const hostile=E.normalizeGame({...fresh(),equipment:{weapon:'pistol',armor:'plain_clothes'},items:{plain_clothes:1,old_phone:1},skills:{}});
assert.equal(hostile.equipment.weapon,null,'no ghost equipped weapon');
console.log('PASS: 25+ assertions — equipment ownership, ammo consumption, purchase gates, loot, boss gating, memory, AI anti-hallucination');

