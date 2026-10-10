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
