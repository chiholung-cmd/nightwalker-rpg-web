'use client'
import {useCallback,useEffect,useRef,useState} from 'react'
import {freshGame,normalizeGame,SHOP,ITEM_INFO,SKILL_INFO,BLOODLINE_INFO,PET_INFO,level,owned,type Game,type ItemId,type BattleAction} from '../../lib/nightwalkerGame'
import NightwalkerStage from '../../components/NightwalkerStage'
import './play.css'
type Panel='character'|'bag'|'missions'|'exchange'|'pets'|'memory'|'history'|'settings'|null
type Group='body'|'skills'|'bloodlines'|'pets'|'equipment'|'healing'
type Status={configured:boolean;cloudSaveConfigured:boolean}
const SAVE='nightwalker-cinematic-rpg-v2'
const PLAYER='nightwalker-player-id-v2'
const TOKEN='nightwalker-save-token-v2'
const GRP:{id:Group;label:string;desc:string}[]=[
 {id:'body',label:'身體特質',desc:'力量、敏捷、體魄、感知、意志'},
 {id:'skills',label:'學習技能',desc:'格鬥、刀劍、射擊、急救、精神'},
 {id:'bloodlines',label:'特殊血脈',desc:'夜狼、靈視、古龍'},
 {id:'pets',label:'寵物／夥伴',desc:'偵查犬、夜梟、微光精靈'},
 {id:'equipment',label:'裝備／物品',desc:'武器、消耗品、護身符'},
 {id:'healing',label:'治療／恢復',desc:'主神治療'}
]
const idFor=()=>{
 try{let id=localStorage.getItem(PLAYER);if(id)return id;id=crypto.randomUUID();localStorage.setItem(PLAYER,id);return id}catch{return 'offline-solo-player-'+Date.now()}}
const tokenFor=()=>{
 try{let token=localStorage.getItem(TOKEN);if(token)return token;const bytes=crypto.getRandomValues(new Uint8Array(32));token=Array.from(bytes).map(v=>v.toString(16).padStart(2,'0')).join('');localStorage.setItem(TOKEN,token);return token}catch{return ''}}
const readerLabel=(k:string)=>k==='narration'?'旁白':k==='dialogue'?'對話':k==='combat'?'戰鬥':'系統'
const human=(s:string)=>s.split(/\n+/).map(v=>v.trim()).filter(Boolean)
/** Read old compact AI turns as chapters, even when they contain no paragraph breaks. */
const novelParagraphs=(content:string)=>{
 const blocks=content.replace(/\r\n/g,'\n').split(/\n\s*\n|\n/).map(v=>v.trim()).filter(Boolean)
 const result:string[]=[]
 for(const block of blocks){
  if(block.length<=95){result.push(block);continue}
  // Prefer natural sentence breaks, while keeping quotations and terminal punctuation intact.
  const sentences=block.match(/[^。！？!?]+[。！？!?]+[」』”’）]?|[^。！？!?]+$/g)||[block]
  let para=''
  for(const sentence of sentences){
   const next=sentence.trim()
   if(para&&para.length+next.length>90){result.push(para);para=next}
   else para+=next
  }
  if(para)result.push(para)
 }
 return result
}
const isSpoken=(text:string)=>/^[「“『]/.test(text.trim()) || /^.{1,12}[：:][「“]/.test(text.trim())
export default function Play(){
 const [game,setGame]=useState<Game>(freshGame('solo'))
 const [hydrated,setHydrated]=useState(false)
 const [busy,setBusy]=useState(false)
 const [model,setModel]=useState<Status|null>(null)
 const [screen,setScreen]=useState<'hub'|'story'>('hub')
 const [panel,setPanel]=useState<Panel>(null)
 const [category,setCategory]=useState<Group>('body')
 const [action,setAction]=useState('')
 const [error,setError]=useState('')
 const [notice,setNotice]=useState('')
 const [accessCode,setAccessCode]=useState('')
 const [fontSize,setFontSize]=useState(false)
 const [reduced,setReduced]=useState(false)
 const [revision,setRevision]=useState<number|null>(null)
 const [autoCloud,setAutoCloud]=useState(true)
 const cloudRevision=useRef<number|null>(null)
 const cloudInFlight=useRef(false)
 const cloudPending=useRef<Game|null>(null)
 const cloudBlocked=useRef(false)
 const syncedPayload=useRef('')
 const [cloudInfo,setCloudInfo]=useState('')
 const [confirmReset,setConfirmReset]=useState(false)
 const [expanded,setExpanded]=useState(false)
 const [busyChoice,setBusyChoice]=useState<string|null>(null)
 const [playbackDone,setPlaybackDone]=useState(false)
 const reportPlayback=useCallback((done:boolean)=>setPlaybackDone(done),[])
 const file=useRef<HTMLInputElement>(null)
 const needsOpening=game.stage==='explore'&&game.worldTurns===0
 const chapterNumber=(game.worldTurns||1)
 const chineseCount=['零','一','二','三','四','五','六','七','八','九','十']
 const displayChapter=chapterNumber<=10?chineseCount[chapterNumber]:String(chapterNumber)
 const readingReady=game.stage==='explore'&&model?.configured&&!needsOpening
 useEffect(()=>{
  const id=idFor();tokenFor()
  try{const val=localStorage.getItem(SAVE);if(val){setGame(normalizeGame({...JSON.parse(val),heroId:id}));setScreen('story')}
   else setGame(freshGame(id))}catch{setGame(freshGame(id))}
  try{setAccessCode(sessionStorage.getItem('nightwalker-access-v2')||'')}catch{}
  try{const rev=localStorage.getItem('nightwalker-cloud-revision-v2');if(rev){setRevision(Number(rev));cloudRevision.current=Number(rev)}}catch{}
  fetch('/api/nightwalker').then(r=>r.json()).then(x=>setModel({configured:!!x.configured,cloudSaveConfigured:!!x.cloudSaveConfigured})).catch(()=>setModel({configured:false,cloudSaveConfigured:false}))
  setHydrated(true)
 },[])
 useEffect(()=>{if(hydrated){try{localStorage.setItem(SAVE,JSON.stringify(game))}catch{setCloudInfo('本地儲存容量不足，建議匯出備份')}}},[game,hydrated])
 const update=useCallback(async(operation:string,payload:Record<string,unknown>={})=>{
  if(busy)return false
  setBusy(true);setBusyChoice(operation);setError('');setNotice('')
  try{
   const r=await fetch('/api/nightwalker',{method:'POST',headers:{'content-type':'application/json','x-adventure-access-code':accessCode},body:JSON.stringify({operation,state:game,...payload})})
   const body=await r.json()
   if(!r.ok)throw new Error(body.error||'操作未完成')
   setPlaybackDone(false);setGame(normalizeGame(body.state));setScreen(body.state.stage==='hub'?'hub':'story')
   if(body.state.lastResult&&!['turn','enter','opening','combat'].includes(operation))setNotice(body.state.lastResult)
   return true
  }catch(e){setError(e instanceof Error?e.message:'無法連接伺服器');return false}
  finally{setBusy(false);setBusyChoice(null)}
 },[game,busy,accessCode])
 const send=async(value?:string)=>{
  const text=(value||action).trim()
  if(!text||busy)return
  const okay=await update('turn',{action:text})
  if(okay)setAction('')
 }
 const changePanel=(p:Panel)=>{setPanel(p);setError('')}
 const openHome=()=>{setScreen('hub');setPanel(null)}
 const openStory=()=>{setScreen('story');setPanel(null)}
 const saveFile=()=>{
  const blob=new Blob([JSON.stringify(game,null,2)],{type:'application/json'})
  const url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download='nightwalker-v2-'+Date.now()+'.json';a.click();URL.revokeObjectURL(url)
 }
 const loadFile=async(f?:File)=>{
  if(!f)return
  try{const data=JSON.parse(await f.text());if(data?.version!==2||!Array.isArray(data.logs))throw Error()
   setGame(normalizeGame({...data,heroId:idFor()}));setPanel(null);setScreen('hub');setError('');setNotice('匯入成功')
  }catch{setError('存檔格式錯誤，未作任何更改。')}
 }
 const reset=()=>{if(!confirmReset){setConfirmReset(true);return};cloudPending.current=null;setGame(freshGame(idFor()));setNotice('新遊戲已建立；開始遊玩後，雲端自動備份會更新進度');setPanel(null);setScreen('hub');setConfirmReset(false)}
 const authHeaders=()=>({'content-type':'application/json','x-nightwalker-player':idFor(),'x-nightwalker-save-token':tokenFor()})

 // Serialize cloud writes so revision numbers are never reused by overlapping saves.
 // A 409 halts autosave; only an explicit restore may resolve the conflict.
 const persistCloud=async(snapshot:Game,manual=false):Promise<void>=>{
  if(!model?.cloudSaveConfigured){
   if(manual)setCloudInfo('雲端資料庫未設定；本機自動存檔仍然有效。')
   return
  }
  if(cloudBlocked.current){
   if(manual)setCloudInfo('雲端存檔版本衝突：自動備份已暫停。請先按「由雲端恢復」檢查最新進度。')
   return
  }
  if(cloudInFlight.current){
   cloudPending.current=snapshot
   if(manual)setCloudInfo('雲端正在保存上一節；最新進度已排隊。')
   return
  }
  const payload=JSON.stringify(snapshot)
  if(!manual&&payload===syncedPayload.current)return
  cloudInFlight.current=true
  try{
   const r=await fetch('/api/nightwalker/save',{
    method:'POST',headers:authHeaders(),
    body:JSON.stringify({state:snapshot,revision:cloudRevision.current})
   })
   const data=await r.json()
   if(!r.ok){
    if(data.code==='REVISION_CONFLICT')cloudBlocked.current=true
    throw Error(data.error||'雲端備份失敗')
   }
   cloudRevision.current=Number(data.revision)
   setRevision(cloudRevision.current)
   syncedPayload.current=payload
   try{localStorage.setItem('nightwalker-cloud-revision-v2',String(data.revision))}catch{}
   if(manual)setCloudInfo('雲端存檔已更新，第 '+data.revision+' 版')
  }catch(e){
   setCloudInfo((e instanceof Error?e.message:'雲端儲存失敗')+(cloudBlocked.current?'；已暫停自動備份，避免覆蓋新進度':'；本機進度不受影響'))
  }finally{
   cloudInFlight.current=false
   const pending=cloudPending.current
   cloudPending.current=null
   if(pending&&!cloudBlocked.current&&JSON.stringify(pending)!==syncedPayload.current){
    void persistCloud(pending,false)
   }
  }
 }
 const cloudSave=()=>persistCloud(game,true)
 const cloudLoad=async()=>{
  if(!model?.cloudSaveConfigured){setCloudInfo('未有雲端資料庫。');return}
  if(cloudInFlight.current){setCloudInfo('請等待正在進行的雲端備份完成，再讀取存檔。');return}
  try{
   const r=await fetch('/api/nightwalker/save',{headers:authHeaders()})
   const data=await r.json()
   if(!r.ok)throw Error(data.error||'雲端讀取失敗')
   const restored=normalizeGame(data.state)
   cloudRevision.current=Number(data.revision)
   setRevision(cloudRevision.current)
   syncedPayload.current=JSON.stringify(restored)
   cloudBlocked.current=false
   cloudPending.current=null
   try{localStorage.setItem('nightwalker-cloud-revision-v2',String(data.revision))}catch{}
   setGame(restored);setScreen('hub');setPanel(null)
   setCloudInfo('雲端存檔已讀取，第 '+data.revision+' 版')
  }catch(e){setCloudInfo(e instanceof Error?e.message:'雲端讀取失敗')}
 }
 useEffect(()=>{
  if(!hydrated||!autoCloud||!model?.cloudSaveConfigured||cloudBlocked.current)return
  // Do not upload a blank new game on mount and overwrite an existing save.
  if(game.stage==='hub'&&game.worldTurns===0&&game.logs.length===0)return
  const t=setTimeout(()=>{void persistCloud(game,false)},1700)
  return ()=>clearTimeout(t)
 },[game,hydrated,autoCloud,model?.cloudSaveConfigured])
 const items=Object.entries(game.items).filter(([,v])=>v&&v>0) as [ItemId,number][]
 const actionBar=game.stage==='combat'
 const storyReady=game.stage==='explore'&&model?.configured
 
 return <div lang="zh-Hant" className={'nw-v2'+(screen==='story'?' reading':'')+(fontSize?' larger':'')+(reduced?' no-motion':'')}>
  <header className="nw-head"><button className="nw-brand" onClick={openHome}><strong>NIGHTWALKER ∞</strong><small>你的選擇，會成為故事的一部分</small></button><div className="nw-headright"><span>{screen==='story'?'正在演出':game.stage==='hub'?'主神空間':'輪迴世界'}</span><button onClick={()=>changePanel('settings')}>設定</button></div></header>
  <main className="nw-main">
  {screen==='hub'?<section className="nw-home">
   <div className="nw-nexus"><small>THE MAIN GOD · STATUS ONLINE</small><div className="orb">◯</div><h1>主神空間</h1><p>{game.stage==='hub'?'「輪迴者，請作好下一次生存準備。」':'「時間不會等待任何一個輪迴者。」'}</p></div>
   <div className="nw-statstrip"><div><small>REINCARNATOR / LV.{level(game)}</small><strong>無名生還者</strong></div><div className="nw-meters"><span>HP　{game.hp}/100</span><span>SP　{game.sp}/100</span></div><button onClick={()=>changePanel('exchange')}><strong>{game.points}</strong><small>PT</small></button></div>
   <button className="nw-gate" disabled={busy||game.stage==='combat'||game.stage==='down'} onClick={()=>game.stage==='hub'?update('enter'):openStory()}><span><small>WORLD GATE · {game.stage==='hub'?'READY':'IN PROGRESS'}</small><strong>{game.stage==='hub'?'開啟下一卷故事':'繼續未完的篇章'}</strong><em>{game.stage==='hub'?'前路未明，但你的一切選擇都將延續':game.worldName}</em></span><b>→</b></button>
   <div className="nw-grid">
    <button onClick={()=>changePanel('character')}><small>01 / STATUS</small><strong>角色檔案</strong><span>能力、狀態</span></button>
    <button onClick={()=>changePanel('bag')}><small>02 / ITEMS</small><strong>背包裝備</strong><span>擁有、裝備</span></button>
    <button onClick={()=>changePanel('missions')}><small>03 / QUEST</small><strong>輪迴任務</strong><span>世界、進度</span></button>
    <button onClick={()=>{setCategory('body');changePanel('exchange')}}><small>04 / EXCHANGE</small><strong>主神強化</strong><span>血脈、技能、裝備</span></button>
    <button onClick={()=>changePanel('pets')}><small>05 / ALLIES</small><strong>寵物與同伴</strong><span>關係、支援</span></button>
    <button onClick={()=>changePanel('memory')}><small>06 / MEMORY</small><strong>記憶回廊</strong><span>事件、因果</span></button>
   </div>
   <div className="nw-homehint">【主神】所有兌換同能力變化都由規則引擎確認。</div>
  </section>:
  <section className={'nw-story genre-'+game.genre}>
   <div className="nw-story-head nw-novel-head"><button className="nw-back" onClick={openHome} aria-label="返回主神空間">〈 返回</button><div><small>NIGHTWALKER · 互動敘事</small><strong>{game.worldName.split(' · ')[0]}</strong></div><button className="nw-back" onClick={()=>changePanel('history')}>紀錄</button><button className="nw-back" onClick={()=>changePanel('bag')}>行囊</button></div>
   <div className="nw-story-meta nw-novel-meta"><span>世界 {String(game.world).padStart(2,'0')} · 第 {Math.max(1,game.worldTurns)} 幕</span><span>你將決定接下來的故事</span></div>

   <div className="nw-story-stage">
    {needsOpening?<div className="nw-cinematic-opening">
     <div className="nw-cinematic-seal">◉</div>
     <small>WORLD ENTRY / 世界載入</small>
     <h2>{game.worldName.split(' · ')[0]}</h2>
     <p>光線消失後，你將成為故事裡的人。<br/>下一步，由你決定。</p>
     <button disabled={busy||!model?.configured} onClick={()=>update('opening')}>進入第一幕　→</button>
    </div>:<NightwalkerStage entries={game.logs.slice(-26)} turn={game.turn} worldName={game.worldName} location={game.location} genre={game.genre} reduced={reduced} large={fontSize} characters={Object.keys(game.npcs)} onPlaybackChange={reportPlayback}/>}
    {game.lootAvailable.length>0&&game.stage==='explore'&&playbackDone&&<div className="nw-stage-loot"><span>可拾取物品</span>{game.lootAvailable.map(id=><button disabled={busy} key={id} onClick={()=>update('loot',{id})}>拾取 {ITEM_INFO[id].name} →</button>)}</div>}
    {game.stage==='down'&&<div className="nw-stage-overlay">你失去了行動能力，這次輪迴就此中斷。</div>}
    {error&&<div className="nw-stage-error" role="alert">{error}</div>}
    {notice&&<div className="nw-stage-notice">{notice}</div>}
    {busy&&<div className="nw-stage-loading"><span className="nw-cinema-spinner"/>命運正在回應你的選擇……</div>}
   </div>
   <div className={'nw-actions nw-novel-actions'+(needsOpening||!playbackDone?' nw-no-choices':'')}>
    {game.stage==='combat'&&!playbackDone?<div className="nw-cinema-hold">危機仍在眼前。看完演出，再選擇應對方式。</div>:game.stage==='combat'?<>
     <div className="nw-choice-title">此刻，你打算如何應對？</div>
     <div className="nw-choices">
      <button disabled={busy} onClick={()=>update('combat',{action:'attack'})}><b>一</b><span>握緊手中的武器，尋找機會還擊</span></button>
      <button disabled={busy} onClick={()=>update('combat',{action:'defend'})}><b>二</b><span>護住要害，穩住腳步觀察敵人的動作</span></button>
      <button disabled={busy} onClick={()=>update('combat',{action:'flee'})}><b>三</b><span>趁對方不備，試著脫離眼前的險境</span></button>
     </div>
     <div className="nw-novel-secondary"><button disabled={busy} onClick={()=>update('combat',{action:'skill'})}>施展已學技能</button><button disabled={busy} onClick={()=>update('combat',{action:'pet'})}>同伴協助</button><button disabled={busy} onClick={()=>changePanel('bag')}>查看行囊</button></div>
    </>:game.stage==='down'?<button className="nw-full" onClick={()=>changePanel('settings')}>查看保存的篇章</button>:game.stage==='hub'?<button className="nw-full" disabled={busy} onClick={()=>update('enter')}>進入下一個世界　→</button>:needsOpening?null:!playbackDone?<div className="nw-cinema-hold">繼續上方演出，看看事情如何發展。</div>:<>
     <div className="nw-choice-title"><span>接下來，你決定——</span><button onClick={()=>changePanel('memory')}>回顧前情</button></div>
     <div className="nw-choices">{game.suggestions.slice(0,3).map((choice,i)=><button key={i} disabled={busy||!readingReady} onClick={()=>send(choice)}><b>{['一','二','三'][i]}</b><span>{choice}</span></button>)}</div>
     <form className="nw-compose" onSubmit={e=>{e.preventDefault();send()}}><input value={action} maxLength={550} placeholder="又或者，寫下你想做的事……" onChange={e=>setAction(e.target.value)} disabled={busy}/><button disabled={busy||!readingReady||!action.trim()}>繼續</button></form>
     {game.flags.includes('boss_cleared_'+game.world)&&game.worldTurns>=4&&<div className="nw-novel-secondary"><button disabled={busy} onClick={()=>update('return')}>結束本卷，返回主神空間</button></div>}
     {!model?.configured&&<div className="nw-setup">尚未連接小說生成模型。</div>}
    </>}
   </div>
  </section>}
  </main>
  <nav className="nw-nav"><button className={screen==='hub'?'current':''} onClick={openHome}>主神空間</button><button className={screen==='story'?'current':''} onClick={openStory}>文字冒險</button><button onClick={()=>changePanel('memory')}>記憶</button><button onClick={()=>changePanel('settings')}>設定</button></nav>
  {panel&&<div className="nw-overlay" onClick={()=>changePanel(null)}><section className="nw-sheet" onClick={e=>e.stopPropagation()}>
   <header><div><small>NIGHTWALKER / MAIN GOD</small><h2>{panel==='character'?'角色檔案':panel==='bag'?'背包與裝備':panel==='missions'?'輪迴任務':panel==='exchange'?'主神強化':panel==='pets'?'寵物與同伴':panel==='memory'?'記憶回廊':panel==='history'?'劇情回顧':'系統與存檔'}</h2></div><button onClick={()=>changePanel(null)}>關閉</button></header>
   <div className="nw-sheetbody">
    {panel==='character'&&<><p>輪迴者等級 LV.{level(game)}｜經驗 {game.xp} XP</p><div className="nw-stats">{Object.entries(game.attributes).map(([name,val])=><div key={name}><span>{name}</span><b>{val}</b></div>)}</div><h3>已學習技能</h3>{Object.entries(game.skills).filter(([,n])=>n).length?Object.entries(game.skills).filter(([,n])=>n).map(([id,n])=><div className="nw-row" key={id}>{SKILL_INFO[id as keyof typeof SKILL_INFO].name}<span>LV.{n}</span></div>):<p>未學習技能</p>}<h3>血脈</h3><div className="nw-row">{BLOODLINE_INFO[game.bloodline].name}<span>{BLOODLINE_INFO[game.bloodline].description}</span></div></>}
    {panel==='bag'&&<><p>只有實際擁有嘅裝備同消耗品先可以使用。裝備數量同狀態會影響戰鬥。</p>{items.map(([id,n])=><div className="nw-item" key={id}><div><strong>{ITEM_INFO[id].name} × {n}</strong><small>{ITEM_INFO[id].slot==='weapon'?'武器':ITEM_INFO[id].slot==='armor'?'護具':ITEM_INFO[id].slot==='supply'?'消耗品':'任務物品'}</small></div>{ITEM_INFO[id].slot==='weapon'||ITEM_INFO[id].slot==='armor'?<button disabled={busy||game.equipment.weapon===id||game.equipment.armor===id} onClick={()=>update('equip',{id})}>{game.equipment.weapon===id||game.equipment.armor===id?'使用中':'裝備'}</button>:ITEM_INFO[id].heal?<button disabled={busy||game.hp>=100} onClick={()=>update('use',{id})}>使用</button>:null}</div>)}<div className="nw-section-note">目前武器：{game.equipment.weapon?ITEM_INFO[game.equipment.weapon].name:'徒手'}　|　護甲：{game.equipment.armor?ITEM_INFO[game.equipment.armor].name:'無'}</div></>}
    {panel==='missions'&&<><h3>目前世界</h3><p>{game.worldName}｜{game.location}</p><div className="nw-row">進度<span>{game.worldTurns} 回合</span></div><div className="nw-row">世界狀態<span>{game.stage==='hub'?'主神空間':game.stage==='combat'?'戰鬥中':'探索中'}</span></div><p>劇情由 AI 生成；主神會保留跨世界事件同角色狀態。返回主神需要探索條件成立，唔接受單句「我通關」作為通關證明。</p></>}
    {panel==='exchange'&&<><p>兌換只喺主神空間進行。點數由程式核對，升級同寵物唔會由 AI 憑空送出。</p><div className="nw-pt">目前持有 <strong>{game.points} PT</strong> · LV.{level(game)}</div><div className="nw-categories">{GRP.map(x=><button key={x.id} onClick={()=>setCategory(x.id)} className={category===x.id?'active':''}>{x.label}</button>)}</div><div className="nw-section-note">{GRP.find(x=>x.id===category)?.desc}</div>{SHOP.filter(x=>x.category===category).map(offer=><div className="nw-item" key={offer.id}><div><strong>{offer.name}</strong><small>{offer.description}</small>{offer.requires&&<small>解鎖：{offer.requires}</small>}</div><button disabled={busy||game.stage!=='hub'||game.points<offer.price} onClick={()=>update('purchase',{id:offer.id})}>{offer.price} PT</button></div>)}</>}
    {panel==='pets'&&<><p>寵物有獨立擁有狀態；冇召喚契約，就唔可以喺戰鬥中突然叫出寵物。</p>{game.pets.length?game.pets.map(id=><div className="nw-row" key={id}>{PET_INFO[id].name}<span>{PET_INFO[id].description}</span></div>):<p>未擁有寵物。可以喺「主神強化 → 寵物／夥伴」兌換。</p>}<h3>已認識 NPC</h3>{Object.entries(game.npcs).length?Object.entries(game.npcs).map(([name,n])=><div className="nw-row" key={name}>{name}<span>信任 {n.trust} · {n.status}</span></div>):<p>未有同伴記錄</p>}</>}
    {panel==='history'&&<><p>這裡保留已經發生的劇情。演出模式只顯示當前一幕，不會重複播放整篇小說。</p>{game.logs.filter(x=>x.kind==='choice'||x.kind==='narration'||x.kind==='dialogue'||x.kind==='combat').slice(-42).map((entry,i)=><article className="nw-stage-history" key={String(entry.id)+'-'+String(i)}><small>{entry.kind==='choice'?'你的選擇':entry.kind==='dialogue'?entry.speaker||'角色對話':entry.kind==='combat'?'戰鬥':'劇情'}</small>{entry.text.split(/\n\s*\n|\n/).filter(Boolean).map((p,j)=><p key={j}>{p}</p>)}</article>)}</>}
    {panel==='memory'&&<><p>長期記憶分成：跨世界重要事件、近期行動、人物關係、物品裝備以及最新劇情摘要。</p><h3>長期摘要</h3><p>{game.summary}</p><h3>重要事件</h3>{game.memory.filter(x=>x.important).slice(-15).reverse().map((e,i)=><div className="nw-memory" key={i}><small>{e.world} · {e.type}</small><p>{e.text}</p></div>)}<h3>最近行動</h3>{game.memory.slice(-8).reverse().map((e,i)=><div className="nw-memory" key={i}><small>回合 {e.turn}</small><p>{e.text}</p></div>)}</>}
    {panel==='settings'&&<><p>Nightwalker v2：AI 生成故事，遊戲引擎確認裝備、升級及戰鬥；本機自動存檔。</p><div className="nw-row">AI 模型<span>{model?.configured?'已設定':'未設定 API Key'}</span></div><div className="nw-row">雲端存檔<span>{model?.cloudSaveConfigured?'已設定':'未接資料庫'}</span></div><label className="nw-field">私人遊戲存取碼（如有）<input type="password" value={accessCode} onChange={e=>{setAccessCode(e.target.value);try{sessionStorage.setItem('nightwalker-access-v2',e.target.value)}catch{}}}/></label><label className="nw-switch">大字模式 <input type="checkbox" checked={fontSize} onChange={e=>setFontSize(e.target.checked)}/></label><label className="nw-switch">減少動畫 <input type="checkbox" checked={reduced} onChange={e=>setReduced(e.target.checked)}/></label><button className="nw-wide" onClick={saveFile}>匯出完整存檔 JSON</button><button className="nw-wide" onClick={()=>file.current?.click()}>匯入存檔 JSON</button><input ref={file} hidden type="file" accept=".json" onChange={e=>loadFile(e.target.files?.[0])}/><label className="nw-switch">自動備份至 MongoDB <input type="checkbox" checked={autoCloud} onChange={e=>setAutoCloud(e.target.checked)}/></label><div className="nw-row">雲端備份版本<span>{revision===null?'尚未備份':'第 '+revision+' 版'}</span></div><button className="nw-wide" onClick={cloudSave}>立即備份到雲端</button><button className="nw-wide" onClick={cloudLoad}>由雲端恢復</button>{cloudInfo&&<p>{cloudInfo}</p>}<button className="nw-wide critical" onClick={reset}>{confirmReset?'再次點擊確認重開':'開始新遊戲（重置進度）'}</button><div className="nw-section-note">正式雲端功能需要獨立 MONGODB_URI。唔會將其他專案資料庫混用。</div></>}
    {error&&<p className="nw-error" role="alert">{error}</p>}
    {notice&&<p className="nw-notice">{notice}</p>}
   </div>
  </section></div>}
 </div>
}

