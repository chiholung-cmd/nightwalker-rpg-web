'use client'
import {useCallback,useEffect,useRef,useState} from 'react'
import {freshGame,normalizeGame,SHOP,ITEM_INFO,SKILL_INFO,BLOODLINE_INFO,PET_INFO,level,owned,type Game,type ItemId,type BattleAction} from '../../lib/nightwalkerGame'
import './play.css'
type Panel='character'|'bag'|'missions'|'exchange'|'pets'|'memory'|'settings'|null
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
const human=(s:string)=>s.split('\n').filter(Boolean)
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
 const [cloudInfo,setCloudInfo]=useState('')
 const [confirmReset,setConfirmReset]=useState(false)
 const [expanded,setExpanded]=useState(false)
 const [busyChoice,setBusyChoice]=useState<string|null>(null)
 const reader=useRef<HTMLDivElement>(null)
 const file=useRef<HTMLInputElement>(null)
 const latest=game.logs.slice(-15)
 useEffect(()=>{
  const id=idFor();tokenFor()
  try{const val=localStorage.getItem(SAVE);if(val){setGame(normalizeGame({...JSON.parse(val),heroId:id}));setScreen('story')}
   else setGame(freshGame(id))}catch{setGame(freshGame(id))}
  try{setAccessCode(sessionStorage.getItem('nightwalker-access-v2')||'')}catch{}
  try{const rev=localStorage.getItem('nightwalker-cloud-revision-v2');if(rev)setRevision(Number(rev))}catch{}
  fetch('/api/nightwalker').then(r=>r.json()).then(x=>setModel({configured:!!x.configured,cloudSaveConfigured:!!x.cloudSaveConfigured})).catch(()=>setModel({configured:false,cloudSaveConfigured:false}))
  setHydrated(true)
 },[])
 useEffect(()=>{if(hydrated){try{localStorage.setItem(SAVE,JSON.stringify(game))}catch{setCloudInfo('本地儲存容量不足，建議匯出備份')}}},[game,hydrated])
 useEffect(()=>{if(reader.current)reader.current.scrollTop=reader.current.scrollHeight},[game.logs.length,screen,notice,expanded])
 const update=useCallback(async(operation:string,payload:Record<string,unknown>={})=>{
  if(busy)return false
  setBusy(true);setBusyChoice(operation);setError('');setNotice('')
  try{
   const r=await fetch('/api/nightwalker',{method:'POST',headers:{'content-type':'application/json','x-adventure-access-code':accessCode},body:JSON.stringify({operation,state:game,...payload})})
   const body=await r.json()
   if(!r.ok)throw new Error(body.error||'操作未完成')
   setGame(normalizeGame(body.state));setScreen(body.state.stage==='hub'?'hub':'story')
   if(body.state.lastResult)setNotice(body.state.lastResult)
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
 const reset=()=>{if(!confirmReset){setConfirmReset(true);return};setGame(freshGame(idFor()));setRevision(null);try{localStorage.removeItem('nightwalker-cloud-revision-v2')}catch{}setNotice('新遊戲已建立');setPanel(null);setScreen('hub');setConfirmReset(false)}
 const authHeaders=()=>({'content-type':'application/json','x-nightwalker-player':idFor(),'x-nightwalker-save-token':tokenFor()})
 const cloudSave=async()=>{
  if(!model?.cloudSaveConfigured){setCloudInfo('未有雲端資料庫，請先設定 MONGODB_URI；本機自動存檔正常。');return}
  try{
   const r=await fetch('/api/nightwalker/save',{method:'POST',headers:authHeaders(),body:JSON.stringify({state:game,revision})})
   const data=await r.json();if(!r.ok)throw Error(data.error)
   setRevision(data.revision);try{localStorage.setItem('nightwalker-cloud-revision-v2',String(data.revision))}catch{}setCloudInfo('雲端存檔已更新，第 '+data.revision+' 版')
  }catch(e){setCloudInfo(e instanceof Error?e.message:'雲端儲存失敗')}
 }
 const cloudLoad=async()=>{
  if(!model?.cloudSaveConfigured){setCloudInfo('未有雲端資料庫。');return}
  try{const r=await fetch('/api/nightwalker/save',{headers:authHeaders()});const data=await r.json()
   if(!r.ok)throw Error(data.error);setGame(normalizeGame(data.state));setRevision(data.revision);try{localStorage.setItem('nightwalker-cloud-revision-v2',String(data.revision))}catch{}setScreen('hub');setPanel(null)
   setCloudInfo('雲端存檔已讀取')
  }catch(e){setCloudInfo(e instanceof Error?e.message:'雲端讀取失敗')}
 }
 const items=Object.entries(game.items).filter(([,v])=>v&&v>0) as [ItemId,number][]
 const actionBar=game.stage==='combat'
 const storyReady=game.stage==='explore'&&model?.configured
 
 return <div className={'nw-v2'+(fontSize?' larger':'')+(reduced?' no-motion':'')}>
  <header className="nw-head"><button className="nw-brand" onClick={openHome}><strong>NIGHTWALKER ∞</strong><small>THE INTERWORLD · AI RPG</small></button><div className="nw-headright"><span>{game.stage==='hub'?'MAIN GOD':game.stage==='combat'?'BATTLE':game.stage==='down'?'CRITICAL':'WORLD '+String(game.world).padStart(2,'0')}</span><button onClick={()=>changePanel('settings')}>系統</button></div></header>
  <main className="nw-main">
  {screen==='hub'?<section className="nw-home">
   <div className="nw-nexus"><small>THE MAIN GOD · STATUS ONLINE</small><div className="orb">◯</div><h1>主神空間</h1><p>{game.stage==='hub'?'「輪迴者，請作好下一次生存準備。」':'「時間不會等待任何一個輪迴者。」'}</p></div>
   <div className="nw-statstrip"><div><small>REINCARNATOR / LV.{level(game)}</small><strong>無名生還者</strong></div><div className="nw-meters"><span>HP　{game.hp}/100</span><span>SP　{game.sp}/100</span></div><button onClick={()=>changePanel('exchange')}><strong>{game.points}</strong><small>PT</small></button></div>
   <button className="nw-gate" disabled={busy||game.stage==='combat'||game.stage==='down'} onClick={()=>game.stage==='hub'?update('enter'):openStory()}><span><small>WORLD GATE · {game.stage==='hub'?'READY':'IN PROGRESS'}</small><strong>{game.stage==='hub'?'進入下一場輪迴':'返回目前世界'}</strong><em>{game.stage==='hub'?'未知世界 · 記憶與裝備將延續':game.worldName}</em></span><b>→</b></button>
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
   <div className="nw-story-head"><span>{String(game.world).padStart(2,'0')}</span><div><small>{game.stage==='combat'?'BATTLE ENCOUNTER':'CINEMATIC TEXT / AI STORY'}</small><strong>{game.worldName}</strong></div><button onClick={()=>changePanel('memory')}>記憶</button></div>
   <div className="nw-story-meta"><span>{game.location}</span><span>{game.stage==='combat'?'危險 · 戰鬥中':game.stage==='down'?'你已經失去行動能力':'第 '+game.worldTurns+' 回合'}</span></div>
   <div className="nw-story-reader" ref={reader}>
    {game.logs.length===0&&<article className="nw-paragraph"><small>主神系統</small><p>歡迎來到 Nightwalker。進入輪迴世界，你嘅身份、背包、裝備、能力、寵物同此前所有選擇都會延續。</p></article>}
    {latest.map((entry,i)=><article key={entry.id+'-'+i} className={'nw-entry '+entry.kind+(i===latest.length-1?' current':'')}>
      <small>{entry.speaker||readerLabel(entry.kind)}</small>
      {human(entry.text).map((p,j)=><p key={j}>{p}</p>)}
     </article>)}
    {game.lootAvailable.length>0&&game.stage==='explore'&&<div className="nw-loot"><small>SCENE / 可拾取物品</small>{game.lootAvailable.map(id=><button disabled={busy} key={id} onClick={()=>update('loot',{id})}>拾取 {ITEM_INFO[id].name} →</button>)}</div>}
    {game.stage==='combat'&&game.enemy&&<section className="nw-foebox"><small>ENCOUNTER / 敵人</small><strong>{game.enemy.name}</strong><span>HP {game.enemy.hp}/{game.enemy.maxHp}</span><p>你手上武器：{game.equipment.weapon?ITEM_INFO[game.equipment.weapon].name:'徒手'} · {game.equipment.weapon==='pistol'?'剩餘子彈 '+owned(game,'ammo')+' 發':'可以進行戰鬥'}</p></section>}
    {game.stage==='down'&&<section className="nw-foebox"><strong>你已失去行動能力。</strong><p>生命值歸零。請讀取較早存檔或開始新遊戲；唔會自動復活。</p></section>}
    {error&&<div className="nw-error" role="alert">{error}</div>}
    {notice&&<div className="nw-notice">{notice}</div>}
    {busy&&<div className="nw-wait">主神正在確認你嘅行動與現有物品、記憶及世界狀態……</div>}
   </div>
   <div className="nw-actions">
    {actionBar?<><div className="nw-choice-title">戰鬥行動 · 傷害由規則引擎計算</div><div className="nw-combat">
      <button disabled={busy} onClick={()=>update('combat',{action:'attack'})}>攻擊</button>
      <button disabled={busy} onClick={()=>update('combat',{action:'defend'})}>防禦</button>
      <button disabled={busy} onClick={()=>update('combat',{action:'skill'})}>戰技</button>
      <button disabled={busy} onClick={()=>update('combat',{action:'pet'})}>寵物</button>
      <button disabled={busy} onClick={()=>update('combat',{action:'flee'})}>撤退</button>
      <button disabled={busy} onClick={()=>changePanel('bag')}>使用物品</button>
    </div></>:
    game.stage==='down'?<button className="nw-full" onClick={()=>changePanel('settings')}>開啟存檔設定</button>:game.stage==='hub'?<button className="nw-full" disabled={busy} onClick={()=>update('enter')}>開始下一場輪迴 →</button>:
    <><div className="nw-choice-title"><span>{model?.configured?'你要點做？':'劇情生成尚未啟用'}</span><button onClick={()=>changePanel('bag')}>檢查背包</button></div>
     <div className="nw-choices">{game.suggestions.slice(0,3).map((s,i)=><button key={i} disabled={busy||!storyReady} onClick={()=>send(s)}><b>{String(i+1).padStart(2,'0')}</b><span>{s}</span></button>)}</div>
     <form className="nw-compose" onSubmit={e=>{e.preventDefault();send()}}><input value={action} maxLength={550} placeholder="自由輸入行動、對話或探索……" onChange={e=>setAction(e.target.value)} disabled={busy}/><button disabled={busy||!storyReady||!action.trim()}>執行</button></form>
     {!model?.configured&&<div className="nw-setup">AI API Key 未配置：你可以先試主神強化及物品系統，正式劇情需要接入模型。</div>}
     <div className="nw-story-shortcuts"><button disabled={busy||game.worldTurns<4} onClick={()=>update('return')}>完成探索・返回主神</button><button disabled={busy} onClick={()=>changePanel('missions')}>查看任務</button></div>
    </>}
   </div>
  </section>}
  </main>
  <nav className="nw-nav"><button className={screen==='hub'?'current':''} onClick={openHome}>主神空間</button><button className={screen==='story'?'current':''} onClick={openStory}>文字冒險</button><button onClick={()=>changePanel('memory')}>記憶</button><button onClick={()=>changePanel('settings')}>設定</button></nav>
  {panel&&<div className="nw-overlay" onClick={()=>changePanel(null)}><section className="nw-sheet" onClick={e=>e.stopPropagation()}>
   <header><div><small>NIGHTWALKER / MAIN GOD</small><h2>{panel==='character'?'角色檔案':panel==='bag'?'背包與裝備':panel==='missions'?'輪迴任務':panel==='exchange'?'主神強化':panel==='pets'?'寵物與同伴':panel==='memory'?'記憶回廊':'系統與存檔'}</h2></div><button onClick={()=>changePanel(null)}>關閉</button></header>
   <div className="nw-sheetbody">
    {panel==='character'&&<><p>輪迴者等級 LV.{level(game)}｜經驗 {game.xp} XP</p><div className="nw-stats">{Object.entries(game.attributes).map(([name,val])=><div key={name}><span>{name}</span><b>{val}</b></div>)}</div><h3>已學習技能</h3>{Object.entries(game.skills).filter(([,n])=>n).length?Object.entries(game.skills).filter(([,n])=>n).map(([id,n])=><div className="nw-row" key={id}>{SKILL_INFO[id as keyof typeof SKILL_INFO].name}<span>LV.{n}</span></div>):<p>未學習技能</p>}<h3>血脈</h3><div className="nw-row">{BLOODLINE_INFO[game.bloodline].name}<span>{BLOODLINE_INFO[game.bloodline].description}</span></div></>}
    {panel==='bag'&&<><p>只有實際擁有嘅裝備同消耗品先可以使用。裝備數量同狀態會影響戰鬥。</p>{items.map(([id,n])=><div className="nw-item" key={id}><div><strong>{ITEM_INFO[id].name} × {n}</strong><small>{ITEM_INFO[id].slot==='weapon'?'武器':ITEM_INFO[id].slot==='armor'?'護具':ITEM_INFO[id].slot==='supply'?'消耗品':'任務物品'}</small></div>{ITEM_INFO[id].slot==='weapon'||ITEM_INFO[id].slot==='armor'?<button disabled={busy||game.equipment.weapon===id||game.equipment.armor===id} onClick={()=>update('equip',{id})}>{game.equipment.weapon===id||game.equipment.armor===id?'使用中':'裝備'}</button>:ITEM_INFO[id].heal?<button disabled={busy||game.hp>=100} onClick={()=>update('use',{id})}>使用</button>:null}</div>)}<div className="nw-section-note">目前武器：{game.equipment.weapon?ITEM_INFO[game.equipment.weapon].name:'徒手'}　|　護甲：{game.equipment.armor?ITEM_INFO[game.equipment.armor].name:'無'}</div></>}
    {panel==='missions'&&<><h3>目前世界</h3><p>{game.worldName}｜{game.location}</p><div className="nw-row">進度<span>{game.worldTurns} 回合</span></div><div className="nw-row">世界狀態<span>{game.stage==='hub'?'主神空間':game.stage==='combat'?'戰鬥中':'探索中'}</span></div><p>劇情由 AI 生成；主神會保留跨世界事件同角色狀態。返回主神需要探索條件成立，唔接受單句「我通關」作為通關證明。</p></>}
    {panel==='exchange'&&<><p>兌換只喺主神空間進行。點數由程式核對，升級同寵物唔會由 AI 憑空送出。</p><div className="nw-pt">目前持有 <strong>{game.points} PT</strong> · LV.{level(game)}</div><div className="nw-categories">{GRP.map(x=><button key={x.id} onClick={()=>setCategory(x.id)} className={category===x.id?'active':''}>{x.label}</button>)}</div><div className="nw-section-note">{GRP.find(x=>x.id===category)?.desc}</div>{SHOP.filter(x=>x.category===category).map(offer=><div className="nw-item" key={offer.id}><div><strong>{offer.name}</strong><small>{offer.description}</small>{offer.requires&&<small>解鎖：{offer.requires}</small>}</div><button disabled={busy||game.stage!=='hub'||game.points<offer.price} onClick={()=>update('purchase',{id:offer.id})}>{offer.price} PT</button></div>)}</>}
    {panel==='pets'&&<><p>寵物有獨立擁有狀態；冇召喚契約，就唔可以喺戰鬥中突然叫出寵物。</p>{game.pets.length?game.pets.map(id=><div className="nw-row" key={id}>{PET_INFO[id].name}<span>{PET_INFO[id].description}</span></div>):<p>未擁有寵物。可以喺「主神強化 → 寵物／夥伴」兌換。</p>}<h3>已認識 NPC</h3>{Object.entries(game.npcs).length?Object.entries(game.npcs).map(([name,n])=><div className="nw-row" key={name}>{name}<span>信任 {n.trust} · {n.status}</span></div>):<p>未有同伴記錄</p>}</>}
    {panel==='memory'&&<><p>長期記憶分成：跨世界重要事件、近期行動、人物關係、物品裝備以及最新劇情摘要。</p><h3>長期摘要</h3><p>{game.summary}</p><h3>重要事件</h3>{game.memory.filter(x=>x.important).slice(-15).reverse().map((e,i)=><div className="nw-memory" key={i}><small>{e.world} · {e.type}</small><p>{e.text}</p></div>)}<h3>最近行動</h3>{game.memory.slice(-8).reverse().map((e,i)=><div className="nw-memory" key={i}><small>回合 {e.turn}</small><p>{e.text}</p></div>)}</>}
    {panel==='settings'&&<><p>Nightwalker v2：AI 生成故事，遊戲引擎確認裝備、升級及戰鬥；本機自動存檔。</p><div className="nw-row">AI 模型<span>{model?.configured?'已設定':'未設定 API Key'}</span></div><div className="nw-row">雲端存檔<span>{model?.cloudSaveConfigured?'已設定':'未接資料庫'}</span></div><label className="nw-field">私人遊戲存取碼（如有）<input type="password" value={accessCode} onChange={e=>{setAccessCode(e.target.value);try{sessionStorage.setItem('nightwalker-access-v2',e.target.value)}catch{}}}/></label><label className="nw-switch">大字模式 <input type="checkbox" checked={fontSize} onChange={e=>setFontSize(e.target.checked)}/></label><label className="nw-switch">減少動畫 <input type="checkbox" checked={reduced} onChange={e=>setReduced(e.target.checked)}/></label><button className="nw-wide" onClick={saveFile}>匯出完整存檔 JSON</button><button className="nw-wide" onClick={()=>file.current?.click()}>匯入存檔 JSON</button><input ref={file} hidden type="file" accept=".json" onChange={e=>loadFile(e.target.files?.[0])}/><button className="nw-wide" onClick={cloudSave}>備份到雲端</button><button className="nw-wide" onClick={cloudLoad}>由雲端恢復</button>{cloudInfo&&<p>{cloudInfo}</p>}<button className="nw-wide critical" onClick={reset}>{confirmReset?'再次點擊確認重開':'開始新遊戲（重置進度）'}</button><div className="nw-section-note">正式雲端功能需要獨立 MONGODB_URI。唔會將其他專案資料庫混用。</div></>}
    {error&&<p className="nw-error" role="alert">{error}</p>}
    {notice&&<p className="nw-notice">{notice}</p>}
   </div>
  </section></div>}
 </div>
}

