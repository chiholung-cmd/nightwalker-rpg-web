/* Regression checks for cinematic interactive fiction beats. */
const assert=require('node:assert/strict')
const fs=require('node:fs')
const ts=require('typescript')
const raw=fs.readFileSync('components/NightwalkerStage.tsx','utf8')
const compiled=ts.transpileModule(raw,{compilerOptions:{
  target:ts.ScriptTarget.ES2020,
  module:ts.ModuleKind.CommonJS,
  jsx:ts.JsxEmit.ReactJSX
}}).outputText
const mod={exports:{}}
new Function('require','module','exports',compiled)(require,mod,mod.exports)
const parse=mod.exports.sceneBeats
assert.equal(typeof parse,'function','Cinematic beat parser must exist')
const entries=[{id:1,kind:'narration',text:
 '走廊深處傳來腳步聲。林霧停在門邊，壓低聲音說：「先別開。門後的人一直在等你。」\n\n【主神提示】任務線索已更新。'
}]
const beats=parse(entries,['林霧'])
assert(beats.length>=3,'Long narration must become multiple short beats')
const dlg=beats.filter(b=>b.kind==='dialogue')
assert.equal(dlg.length,1,'One quote should produce one dialogue beat')
assert.equal(dlg[0].speaker,'林霧','NPC identity must be preserved')
assert.equal(dlg[0].text,'先別開。門後的人一直在等你。')
assert(beats.some(b=>b.kind==='system'),'Main God warnings must have system staging')
const merged=beats.map(b=>b.text).join('')
assert.equal(merged.split('先別開').length-1,1,'Dialogue must not be duplicated')
const classic=parse([{id:2,kind:'combat',text:'你閃到門邊。金屬聲從背後逼近。'}],[])
assert(classic.some(b=>b.kind==='impact'),'Combat scenes must get impact styling')
assert(classic.every(b=>b.text.length>0),'Empty beats must not be rendered')
console.log('PASS: cinematic beat parsing, speaker identity, system staging and combat emphasis.')


// E+ regression: all eight styles are first-class, persisted and staged without replaying prior turns.
const gameRaw=fs.readFileSync('lib/nightwalkerGame.ts','utf8')
const compiledGame=ts.transpileModule(gameRaw,{compilerOptions:{target:ts.ScriptTarget.ES2020,module:ts.ModuleKind.CommonJS}}).outputText
const gameModule={exports:{}}
new Function('require','module','exports',compiledGame)(require,gameModule,gameModule.exports)
const engine=gameModule.exports
const moods=['calm','suspense','shock','grief','anger','eerie','resolve','system']
assert.deepEqual([...engine.EMOTION_MOODS],moods)
const staged=moods.map((mood,i)=>({id:10+i,kind:i===7?'system':'narration',
 text:'第 '+i+' 種情緒的演出。',mood,
 prelude:mood==='anger'||mood==='eerie'?'先前看見的假訊息。':undefined}))
const prepared=parse(staged,[])
assert.equal(prepared.length,moods.length)
assert.deepEqual(prepared.map(b=>b.mood),moods)
assert.equal(prepared[4].prelude,'先前看見的假訊息。')
assert.equal(prepared[5].prelude,'先前看見的假訊息。')
assert.equal(prepared[7].kind,'system')
const now=mod.exports.currentScene
assert.equal(typeof now,'function')
const rolling=[
 {id:1,kind:'choice',text:'向林霧詢問'},{id:2,kind:'narration',text:'先前的敘事。'},
 {id:3,kind:'choice',text:'檢查識別牌'},
 {id:4,kind:'narration',mood:'suspense',text:'指尖碰到了一道刻痕。'},
 {id:5,kind:'dialogue',speaker:'林霧',mood:'grief',text:'你真的不記得了？'}]
const selected=now(rolling)
assert.deepEqual(selected.map(e=>e.id),[3,4,5], 'The whole latest scene, not just the last narration')
const combat=now([...rolling,{id:6,kind:'combat',mood:'shock',text:'金屬櫃門突然撞開。'}])
assert.deepEqual(combat.map(e=>e.id),[6],'Combat must not replay previous narrative')
const roundtrip=engine.normalizeGame({...engine.freshGame('test-player'),logs:staged})
assert.deepEqual(roundtrip.logs.map(x=>x.mood),moods)
assert.equal(roundtrip.logs[4].prelude,'先前看見的假訊息。')
const entered=engine.enterWorld(engine.freshGame('test-player'))
const beatState=engine.storyBeat(entered,'回頭觀察',{story:'門後傳來撞擊聲。林霧說：「別進去。」',beats:[
 {kind:'narration',mood:'suspense',text:'門後傳來撞擊聲。'},
 {kind:'dialogue',mood:'grief',speaker:'林霧',text:'別進去。'}
],choices:['留下來觀察','向林霧詢問','撤離']})
assert.equal(beatState.worldTurns,1)
assert.equal(beatState.logs.filter(e=>e.kind==='choice').length,1)
assert.equal(beatState.logs.filter(e=>e.kind==='dialogue').length,1)
assert.equal(beatState.logs.find(e=>e.kind==='dialogue').mood,'grief')
assert.equal(beatState.logs.filter(e=>e.kind==='narration').length,1,'Avoid duplicate novel paragraphs')
const css=fs.readFileSync('app/play/play.css','utf8')
for(const mood of moods)assert(css.includes('nw-emotion-'+mood),'Mood CSS missing '+mood)
console.log('PASS: eight emotion modes, mutable text preludes, storage roundtrip, turn grouping, combat separation, RPG authority.')
