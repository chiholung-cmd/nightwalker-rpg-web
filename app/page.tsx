'use client'

import { useEffect, useMemo, useState } from 'react'
import { INITIAL, SCENES, applyEffect, availableChoices, effectiveLines, sceneFor, type Choice, type SaveState, type WorldTheme } from '../lib/infiniteStory'
import { maxHp, maxSp, TALENTS, spendTalent, talentRank, withProgress, xpToNext, type TalentId } from '../lib/progression'
import { nightwalkerAtlas } from '../lib/characterPortraitAtlas'
import { nightwalkerCast } from '../lib/characterCast'
import { FILM_MISSIONS,currentFilmMission,unlockedFilm,completedFilm,completedOptional,trainingSummary } from '../lib/movieMissions'
import './story.css'

const SAVE_KEY = 'nightwalker-multiverse-story-v1'
const SESSION_KEY = 'nightwalker-multiverse-session-v2'
const SETTINGS_KEY = 'nightwalker-reader-settings'
type Sheet = 'worlds'|'missions'|'journal'|'character'|'bag'|'shop'|'settings'|null
type ReaderSettings = { images:boolean; largeText:boolean; typing:boolean }
const DEFAULT_SETTINGS: ReaderSettings = {images:true,largeText:false,typing:true}
const clamp = (v:number,max:number) => Math.max(0,Math.min(max,v))
const WORLD_ART: Partial<Record<WorldTheme,string>> = {
  // High-resolution photographs only. Never enlarge the old 70-180px portrait atlas.
  nexus:'https://images.unsplash.com/photo-1649316956806-0f91196bf29c?auto=format&fit=crop&w=1800&q=83',
  archive:'https://images.unsplash.com/photo-1617721930761-42fe8e5efad0?auto=format&fit=crop&w=1800&q=83',
  gothic: 'https://images.unsplash.com/photo-1767779670933-9df4ea401954?auto=format&fit=crop&w=1600&q=82',
  arctic: 'https://images.unsplash.com/photo-1742458499886-1e953d2be323?auto=format&fit=crop&w=1600&q=82',
  cinema: 'https://images.unsplash.com/photo-1760170437237-a3654545ab4c?auto=format&fit=crop&w=1600&q=82',
  apartment:'https://images.unsplash.com/photo-1649316956806-0f91196bf29c?auto=format&fit=crop&w=1800&q=83',
  hospital:'https://images.unsplash.com/photo-1617721930761-42fe8e5efad0?auto=format&fit=crop&w=1800&q=83',
  rift:'https://images.unsplash.com/photo-1649316956806-0f91196bf29c?auto=format&fit=crop&w=1800&q=83'
}
const SPECIAL_ART:Record<string,string> = {
  '午夜放映廳':'https://images.unsplash.com/photo-1768381937064-0cff674a09ca?auto=format&fit=crop&w=1800&q=83',
  '深海零號艙':'https://images.unsplash.com/photo-1760170437237-a3654545ab4c?auto=format&fit=crop&w=1800&q=83',
  '倒數七日':'https://images.unsplash.com/photo-1649316956806-0f91196bf29c?auto=format&fit=crop&w=1800&q=83',
  '逆時學園':'https://images.unsplash.com/photo-1617721930761-42fe8e5efad0?auto=format&fit=crop&w=1800&q=83',
  '霧中第七章':'https://images.unsplash.com/photo-1508107536691-b1449928187d?auto=format&fit=crop&w=1800&q=83',
  '生化危機（2002）':'https://images.unsplash.com/photo-1617721930761-42fe8e5efad0?auto=format&fit=crop&w=1800&q=83',
  'Van Helsing（2004）':'https://images.unsplash.com/photo-1767779670933-9df4ea401954?auto=format&fit=crop&w=1800&q=83',
  '風雲雄霸天下（1998）':'https://images.unsplash.com/photo-1649316956806-0f91196bf29c?auto=format&fit=crop&w=1800&q=83'
}
const WORLD_LABEL:Record<WorldTheme,string> = {
  nexus:'主神空間', archive:'規則怪談', apartment:'劇集・懸疑',hospital:'動漫・超自然',
  rift:'世界裂隙',gothic:'哥德文學',arctic:'科幻文學',cinema:'電影世界'
}
const WORLD_GLYPH:Record<WorldTheme,string> = {
  nexus:'∞',archive:'▤',apartment:'▥',hospital:'✚',rift:'✧',gothic:'♜',arctic:'❄',cinema:'▣'
}
const WORLD_LIST=[
  {name:'生化危機 (2002)',category:'電影 01 · 現代科幻恐怖',start:'re_arrival',clear:'生化危機2002',theme:'archive' as WorldTheme},
  {name:'Van Helsing (2004)',category:'電影 02 · 哥德奇幻',start:'vh_arrival',clear:'VanHelsing2004',theme:'gothic' as WorldTheme},
  {name:'風雲雄霸天下 (1998)',category:'電影 03 · 香港武俠',start:'fy_arrival',clear:'風雲1998',theme:'rift' as WorldTheme}
]
const ENTER_SCENES = new Set(['hub_arrival','hub_portals','lost_arrival','blood_arrival','hospital_arrival','gothic_start','arctic_start','cinema_start','fourth_threshold','rift_arrival','film_arrival','film_final_frame','novel_arrival','novel_rewrite','re_arrival','vh_arrival','fy_arrival','movie_brief','movie_trilogy_epilogue'])
const EMOTIONS:Record<string,string>={calm:'平靜',worried:'憂慮',afraid:'驚恐',angry:'憤怒',sad:'悲傷',hopeful:'期待',mysterious:'難以捉摸'}
const LINE_MOODS:Record<string,string>={neutral:'平靜',fear:'驚恐',sad:'悲傷',joy:'欣喜',anger:'憤怒',mystery:'疑惑',resolve:'堅定'}
const expressionFor=(face:string|undefined,world:string,sceneId:string,bond:number)=>{
  if(face==='guide')return sceneId==='fourth_good'||bond>=3?'期待':sceneId.includes('question')||sceneId.includes('inner')?'憂慮':'神秘'
  if(face==='girl')return sceneId.includes('ending')?'期待':'不安'
  if(face==='neighbor')return world.includes('公寓')?'焦急':'警戒'
  if(face==='clerk')return world.includes('科學怪人')?'悲傷':'冷漠'
  if(face==='nurse')return '平靜'
  return ''
}
const isHub=(world:string)=>world==='主神中轉站'

// Actual raster sprite sheets are used for expressions; this is NOT a text-only label.
function CharacterArt({face,speaker,mood}:{face?:string;speaker:string;mood:string}){
  const isSystem=face==='system'||!face
  const guide=face==='guide'||speaker==='阿霧'
  const female=guide||face==='girl'||face==='nurse'
  const fear=/驚|不安|害怕|憂慮|恐/.test(mood)
  const angry=/怒|憤|氣/.test(mood)
  const sad=/悲|傷|失落/.test(mood)
  const happy=/欣|喜|笑|期待|希望/.test(mood)
  const hero=isSystem
  const variant=hero?'hero':fear?'fear':angry?'angry':sad?'sad':happy?'happy':'neutral'
  const pos=variant==='hero'?'0% 0%':variant==='fear'?'100% 0%':variant==='neutral'?'50% 0%':
    variant==='angry'?'20% 100%':variant==='sad'?'40% 100%':'60% 100%'
  const sheetSize=['angry','sad','happy'].includes(variant)?'600% 287.5%':'300% 153.33%'
  const avatarPos=face==='neighbor'?'75% 50%':face==='clerk'?'50% 50%':face==='nurse'?'25% 50%':guide?'0% 50%':'100% 50%'
  return <div className={'reader-actor '+(hero?'actor-hero':female?'actor-female':'actor-male')+' actor-'+variant} aria-label={speaker+'角色圖片'}>
    <div className="reader-actor-paint" style={{backgroundImage:`url("${hero||female?nightwalkerAtlas:nightwalkerCast}")`,
      backgroundPosition:hero||female?pos:avatarPos,backgroundSize:hero||female?sheetSize:'500% 100%'}}/>
  </div>
}
function safeLoad():SaveState {
  try{
    const current=localStorage.getItem(SESSION_KEY)
    const session=current?JSON.parse(current):null
    const data=session?.game||JSON.parse(localStorage.getItem(SAVE_KEY)||'null')
    if(data&&typeof data.scene==='string'&&SCENES[data.scene]&&Array.isArray(data.items)&&Array.isArray(data.flags))return withProgress({...INITIAL,...data})
  }catch{/* Reset corrupted local save only */}
  return INITIAL
}
function StatStrip({game}:{game:SaveState}){
  return <div className="reader-stats">
    <span><i className="heart">♥</i> {game.hp}<small>/{maxHp(game)}</small></span>
    <span><i className="mind">◈</i> {game.sp}<small>/{maxSp(game)}</small></span>
    <span className="points">✦ {game.points}<small> 積分</small></span>
    <span className="level">Lv.{game.level}</span>
  </div>
}
export default function HomePage(){
  const [g,setG]=useState<SaveState>(INITIAL)
  const [ready,setReady]=useState(false)
  const [sheet,setSheet]=useState<Sheet>(null)
  const [settings,setSettings]=useState<ReaderSettings>(DEFAULT_SETTINGS)
  const [visible,setVisible]=useState(0)
  const [skipTyping,setSkipTyping]=useState(false)
  const [choicePage,setChoicePage]=useState(0)
  const [feedback,setFeedback]=useState('')
  const [imageFailed,setImageFailed]=useState(false)
  const [confirmation,setConfirmation]=useState(false)
  const [blocked,setBlocked]=useState(false)
  useEffect(()=>{
    const saved=safeLoad()
    setG(saved)
    try{setSettings({...DEFAULT_SETTINGS,...JSON.parse(localStorage.getItem(SETTINGS_KEY)||'{}')})}catch{}
    setReady(true)
  },[])
  useEffect(()=>{
    if(!ready)return
    localStorage.setItem(SAVE_KEY,JSON.stringify(g))
    localStorage.setItem(SESSION_KEY,JSON.stringify({game:g,mode:'story',fight:null}))
  },[g,ready])
  useEffect(()=>{if(ready)localStorage.setItem(SETTINGS_KEY,JSON.stringify(settings))},[settings,ready])
  const scene=sceneFor(g.scene)
  const activeMission=currentFilmMission(scene.world)
  const lines=effectiveLines(scene,g)
  const idx=Math.max(0,Math.min(lines.length-1,g.line))
  const line=lines[idx]||''
  const showChoices=idx===lines.length-1
  const choiceList=availableChoices(scene,g)
  const pages=Math.max(1,Math.ceil(choiceList.length/3))
  const shown=choiceList.slice(Math.min(choicePage,pages-1)*3,(Math.min(choicePage,pages-1)+1)*3)
  const canProceed= !blocked && g.hp>0 && g.sp>0
  const worldKey=scene.theme
  const image= SPECIAL_ART[scene.world] || WORLD_ART[worldKey]
  const showWorldImage=settings.images&&!!image&&!imageFailed
  const expression=scene.moods?.[idx]?LINE_MOODS[scene.moods[idx]]:(scene.emotion?EMOTIONS[scene.emotion]:expressionFor(scene.face,scene.world,scene.id,g.bond))
  useEffect(()=>{
    setChoicePage(0);setVisible(0);setSkipTyping(false);setImageFailed(false)
  },[g.scene,g.line])
  useEffect(()=>{
    if(!settings.typing||skipTyping){setVisible(line.length);return}
    if(visible>=line.length)return
    const t=setTimeout(()=>setVisible(v=>Math.min(line.length,v+3)),14)
    return ()=>clearTimeout(t)
  },[line,visible,skipTyping,settings.typing])
  const onNext=()=>{
    if(!canProceed||sheet)return
    if(visible<line.length){setSkipTyping(true);setVisible(line.length);return}
    if(idx<lines.length-1)setG(s=>({...s,line:idx+1}))
  }
  const choose=(c:Choice)=>{
    if(!canProceed||sheet)return
    if(c.action==='shop'){setSheet('shop');return}
    // The battle system remains accessible only through the separate legacy /combat page.
    // Story decisions resolve in narrative text and permanently record their consequences.
    if(c.action==='battle'||c.action==='combat-practice')return
    const from=g
    const affected=applyEffect(from,c.effect)
    const destination=c.to||g.scene
    const after:SaveState={...affected,scene:destination,line:0,path:[scene.title+' → '+c.label,...affected.path].slice(0,40)}
    const e=c.effect
    const changes:string[]=[]
    if(e?.hp)changes.push('生命 '+(e.hp>0?'+':'')+e.hp)
    if(e?.sp)changes.push('理智 '+(e.sp>0?'+':'')+e.sp)
    if(e?.points)changes.push('積分 '+(e.points>0?'+':'')+e.points)
    if(e?.items?.length)changes.push('道具：'+e.items.join('、'))
    if(e?.clearWorld)changes.push('世界通關：'+e.clearWorld)
    if(e?.bond)changes.push('角色關係 '+(e.bond>0?'+':'')+e.bond)
    if(e?.branch)changes.push(e.branch+' 級支線憑證 +1')
    if(e?.mastery)changes.push(({tech:'科技',occult:'秘術',martial:'武學'} as const)[e.mastery]+'熟練度 +1')
    setFeedback(changes.slice(0,2).join(' · '))
    setG(after)
    if(after.hp<=0||after.sp<=0)setBlocked(true)
  }
  const revive=()=>{
    setBlocked(false)
    setG(s=>({...s,scene:'hub_return',line:0,hp:Math.max(55,Math.round(maxHp(s)*.6)),sp:Math.max(45,Math.round(maxSp(s)*.5)),points:Math.max(0,s.points-25),
      journal:['【復歸協議】喺 '+scene.world+' 意識中斷。主神收取25積分，保留部分線索。',...s.journal]}))
  }
  const buy=(kind:'med'|'calm'|'talisman')=>{
    const costs={med:25,calm:25,talisman:50}
    if(g.points<costs[kind])return
    if(kind==='med'&&g.hp>=maxHp(g)||kind==='calm'&&g.sp>=maxSp(g)||kind==='talisman'&&g.items.includes('鏡界護符'))return
    setG(s=>({...s,points:s.points-costs[kind],hp:kind==='med'?clamp(s.hp+30,maxHp(s)):s.hp,sp:kind==='calm'?clamp(s.sp+25,maxSp(s)):s.sp,items:kind==='talisman'?[...s.items,'鏡界護符']:s.items}))
  }
  const goToHub=()=>{if(!isHub(scene.world))return;setG(s=>({...s,scene:'hub_portals',line:0}));setSheet(null)}
  const reset=()=>{
    if(!confirmation){setConfirmation(true);return}
    setG(INITIAL);setSheet(null);setBlocked(false);setFeedback('');setConfirmation(false)
    localStorage.removeItem(SESSION_KEY)
  }
  const sceneNumber=useMemo(()=>Object.keys(SCENES).indexOf(scene.id)+1,[scene.id])
  return <main className={'reader-root theme-'+worldKey+(settings.largeText?' reader-large':'')}>
    <header className="reader-header">
      <div className="reader-logo">N<span>∞</span></div>
      <div className="reader-brand"><strong>NIGHTWALKER</strong><span>文字無限流 · 單人劇情冒險</span></div>
      <button className="reader-menu" aria-label="選單" onClick={()=>setSheet('settings')}>☰</button>
    </header>

    <div className="reader-meta"><span className="reader-world-kind">{WORLD_GLYPH[worldKey]} {activeMission ? '電影 '+(FILM_MISSIONS.indexOf(activeMission)+1)+' / 3 · '+activeMission.category : WORLD_LABEL[worldKey]}</span><span className="reader-scene-num">劇情片段 {String(sceneNumber).padStart(2,'0')}</span></div>

    <div className={'reader-atmosphere'+(showWorldImage?' reader-illustrated':'')}>
      {showWorldImage?<img src={image} alt={scene.world+'場景背景'} onError={()=>setImageFailed(true)}/>:<div className="reader-symbol">{WORLD_GLYPH[worldKey]}</div>}
      {settings.images&&<CharacterArt key={scene.id+'-'+expression} face={scene.face} speaker={scene.speaker} mood={expression}/>}
      <div className="reader-atmosphere-shade"/>
      <div className="reader-atmosphere-inner"><small>{scene.world}</small><h1>{scene.title}</h1>{showWorldImage&&<span className="reader-illustration-mark">WORLD ARRIVAL</span>}</div>
    </div>

    <StatStrip game={g}/>

    <section className="reader-story" aria-live="polite">
      <div className="reader-speaking">
        <div className="reader-speaking-avatar" aria-hidden="true" style={{backgroundImage:`url(${nightwalkerCast})`,backgroundPosition:scene.face==='guide'?'0% 50%':scene.face==='girl'?'25% 50%':scene.face==='clerk'?'50% 50%':scene.face==='neighbor'?'75% 50%':'100% 50%'}}/>
        <div className="reader-speaker-name"><span>{scene.speaker}</span>{expression&&<em>{expression}</em>}</div>
        <div className="reader-progression"><span>{idx+1} / {lines.length}</span><span>{settings.typing?'點擊對話可顯示全文':'閱讀模式'}</span></div>
      </div>
      <div className="reader-body" onClick={()=>{setSkipTyping(true);setVisible(line.length)}}>
        {settings.typing?line.slice(0,visible):line}
        {settings.typing&&visible<line.length&&<span className="reader-caret">▍</span>}
      </div>
      {feedback&&idx===0&&<div className="reader-result" aria-label="上次選擇後果">✦ {feedback}</div>}
    </section>

    <section className="reader-decisions" aria-label="劇情決定">
      {!canProceed?<div className="reader-death"><strong>意識中斷</strong><p>生命或理智耗盡。回到中轉站會保留部分因果，扣除 25 積分。</p><button onClick={revive}>啟動復歸協議</button></div>:
        !showChoices||visible<line.length?
          <button className="reader-next" onClick={onNext}><span>{visible<line.length?'顯示完整對話':'繼續閱讀'}</span><strong>{visible<line.length?'展開全文':'下一段 →'}</strong></button>:
          <div className="reader-choice-list">
            {shown.map((c,i)=><button className="reader-choice" key={choicePage*3+i} onClick={()=>choose(c)}>
              <span className="reader-choice-index">{String(choicePage*3+i+1).padStart(2,'0')}</span>
              <span className="reader-choice-text"><strong>{c.label}</strong>{c.hint&&<small>{c.hint}</small>}</span><span className="reader-choice-arrow">›</span>
            </button>)}
            {choiceList.length===0&&<button className="reader-choice" onClick={()=>{setG(s=>({...s,scene:'hub_return',line:0}))}}>返回主神中轉站 →</button>}
            {pages>1&&<div className="reader-pagination"><button onClick={()=>setChoicePage(n=>Math.max(0,n-1))} disabled={choicePage===0}>‹ 上一組</button><span>{choicePage+1} / {pages}</span><button onClick={()=>setChoicePage(n=>Math.min(pages-1,n+1))} disabled={choicePage===pages-1}>下一組 ›</button></div>}
          </div>
      }
    </section>

    <nav className="reader-nav">
      <button onClick={()=>setSheet('worlds')}><span>◇</span>世界</button>
      <button onClick={()=>setSheet('missions')}><span>◈</span>任務</button>
      <button onClick={()=>setSheet('journal')}><span>▤</span>因果</button>
      <button onClick={()=>setSheet('character')}><span>✧</span>角色{g.talentPoints>0&&<i className="reader-dot"/>}</button>
      <button onClick={()=>setSheet('bag')}><span>▣</span>物品</button>
      <button onClick={()=>setSheet('shop')}><span>✦</span>商店</button>
    </nav>

    {sheet&&<div className="reader-overlay" onClick={()=>setSheet(null)}><section className="reader-sheet" onClick={e=>e.stopPropagation()}>
      <header className="reader-sheet-head"><h2>{sheet==='worlds'?'電影輪迴序列':sheet==='missions'?'主神任務':sheet==='journal'?'因果紀錄':sheet==='character'?'無名生還者':sheet==='bag'?'隨身物品':sheet==='shop'?'積分商店':'遊戲設定'}</h2><button onClick={()=>setSheet(null)}>✕</button></header>
      <div className="reader-sheet-content">
        {sheet==='worlds'&&<>
          <p className="reader-note">正式主線依次穿越三套真實電影。完成上一世界後先開放下一關；舊世界劇情只保留存檔，不會阻住新主線。</p>
          {FILM_MISSIONS.map((m,i)=><div className="reader-world-item" key={m.id}>
            <div className="reader-world-symbol" style={{backgroundImage:`linear-gradient(90deg,#070d19aa,#18233f69),url(${SPECIAL_ART[i===0?'生化危機（2002）':i===1?'Van Helsing（2004）':'風雲雄霸天下（1998）']})`}}><span>{i+1}</span></div>
            <div><strong>{String(i+1).padStart(2,'0')} · {m.title}（{m.year}）</strong><small>{completedFilm(m,g)?'✓ 通關完成':unlockedFilm(m,g)?'解鎖 · 可以進入':'🔒 上一部電影尚未完成'} · {m.category}</small></div>
          </div>)}
          <button className="reader-action" onClick={goToHub} disabled={!isHub(scene.world)}>進入主神傳送門</button>
          <p className="reader-note">提示：已經通關嘅世界不會再獲得首次通關獎勵。你可以喺因果紀錄查看所有選擇。</p>
        </>}
        {sheet==='missions'&&<>
          <p className="reader-note">任務係玩家喺電影世界需要完成嘅主要目標。隱藏支線獎勵需要達成特定條件，完成後會保存成永久因果。</p>
          {(activeMission?[activeMission]:FILM_MISSIONS).map(m=><div key={m.id} className="reader-mission-card">
            <div className="reader-mission-title"><strong>{m.title}（{m.year}）</strong><span>{completedFilm(m,g)?'已通關':unlockedFilm(m,g)?'任務可用':'尚未解鎖'}</span></div>
            <p>【主線】{m.main}</p><small>{m.description}</small>
            <div className="reader-reward">✦ 基礎 {m.basePoints} 積分 · {m.baseXp} XP · 通關後永久保留成長</div>
            <h3>電影 NPC</h3><p>{m.npcs.join('、')}</p>
            <h3>隱藏支線（{completedOptional(m,g)}/{m.side.length}）</h3>
            {m.side.map(t=><div className="reader-mission-side" key={t.flag}>
              <span>{g.flags.includes(t.flag)?'✓':'◇'}</span><div><strong>{t.label}</strong><small>{t.reward}</small></div>
            </div>)}
          </div>)}
        </>}
        {sheet==='journal'&&<>
          <p className="reader-note">你做過嘅抉擇會寫入因果紀錄。有啲選項即使當下無後果，都可能喺幾個世界之後改變故事。</p>
          <h3>重大情報</h3>{g.journal.map((text,i)=><p className="reader-record" key={i}>{text}</p>)}
          <h3>選擇歷史</h3>{g.path.slice(0,25).map((text,i)=><p className="reader-path" key={i}>{text}</p>)}
        </>}
        {sheet==='character'&&<>
          <div className="reader-char-card"><span>✧</span><div><strong>無名生還者 · Lv.{g.level}</strong><small>阿霧信任 {g.bond} · 天賦點 {g.talentPoints}</small><div className="reader-xp"><i style={{width:(100*g.xp/xpToNext(g.level))+'%'}}/></div><small>EXP {g.xp}/{xpToNext(g.level)}</small></div></div>
          <div className="reader-growth"><strong>跨世界傳承</strong>{trainingSummary(g).map(a=><div key={a.key}><span>{a.name} · Lv.{a.rank}</span><small>{a.description}</small></div>)}<p>D 級支線：{g.branches?.D||0}　C 級支線：{g.branches?.C||0}　B 級支線：{g.branches?.B||0}</p></div>
          {TALENTS.map(t=><div className="reader-talent" key={t.id}><span>{t.icon}</span><div><strong>{t.title}　Lv.{talentRank(g,t.id)}/{t.max}</strong><small>{t.description}</small></div><button disabled={g.talentPoints<1||talentRank(g,t.id)>=t.max} onClick={()=>setG(s=>spendTalent(s,t.id))}>升級</button></div>)}
        </>}
        {sheet==='bag'&&<><p className="reader-note">線索同道具可以跨世界保留，部分會解鎖特定角色嘅對話選項。</p>{g.items.map((item,i)=><div className="reader-item" key={i}><span>▣</span><strong>{item}</strong></div>)}</>}
        {sheet==='shop'&&<><p className="reader-note">可用積分：{g.points}。單機存檔，本地自動保存。</p>
          <div className="reader-store-line"><div><strong>急救針劑</strong><small>恢復 30 生命</small></div><button disabled={g.points<25||g.hp>=maxHp(g)} onClick={()=>buy('med')}>25 ✦</button></div>
          <div className="reader-store-line"><div><strong>鎮魂藥劑</strong><small>恢復 25 理智</small></div><button disabled={g.points<25||g.sp>=maxSp(g)} onClick={()=>buy('calm')}>25 ✦</button></div>
          <div className="reader-store-line"><div><strong>鏡界護符</strong><small>永久道具・未來世界線索</small></div><button disabled={g.points<50||g.items.includes('鏡界護符')} onClick={()=>buy('talisman')}>50 ✦</button></div>
        </>}
        {sheet==='settings'&&<>
          <p className="reader-note">遊戲完全單機操作，劇情進度保存在目前瀏覽器。已暫停戰鬥系統開發，集中改善敘事及跨世界因果。</p>
          <label className="reader-setting"><span>開啟場景及人物圖片 <small>場景背景與角色表情隨劇情切換</small></span><input type="checkbox" checked={settings.images} onChange={e=>setSettings(s=>({...s,images:e.target.checked}))}/></label>
          <label className="reader-setting"><span>大字閱讀模式</span><input type="checkbox" checked={settings.largeText} onChange={e=>setSettings(s=>({...s,largeText:e.target.checked}))}/></label>
          <label className="reader-setting"><span>對話逐字演出</span><input type="checkbox" checked={settings.typing} onChange={e=>setSettings(s=>({...s,typing:e.target.checked}))}/></label>
          <button className="reader-action" onClick={()=>{navigator.clipboard?.writeText(JSON.stringify(g)).then(()=>setFeedback('存檔資料已複製')).catch(()=>setFeedback('瀏覽器未授權複製'))}}>複製存檔資料</button>
          <button className="reader-danger" onClick={reset}>{confirmation?'確認清除所有劇情進度':'清除本機進度並重玩'}</button>
          <div className="reader-credits"><strong>圖片來源</strong><small>Unsplash License · Zoshua Colah、Lawrence Krowdeed、Peter Herrmann、Annie Spratt、Quentin Baret、y i。場景圖按世界進入或重要事件載入；低解析人物圖不再使用。</small></div>
        </>}
      </div>
    </section></div>}
  </main>
}
