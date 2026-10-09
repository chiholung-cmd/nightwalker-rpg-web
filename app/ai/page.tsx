'use client'
import { useEffect, useRef, useState } from 'react'
import { AiSave, NEW_GAME, MOVIES, normalizeSave, type AiTurn } from '../../lib/aiAdventure'
import './ai.css'

const KEY='nightwalker-ai-adventure-save-v1'
type Panel='memory'|'status'|'settings'|null

export default function AdventurePage(){
 const [game,setGame]=useState<AiSave>(NEW_GAME)
 const [loaded,setLoaded]=useState(false)
 const [ready,setReady]=useState<boolean|null>(null)
 const [input,setInput]=useState('')
 const [pending,setPending]=useState('')
 const [busy,setBusy]=useState(false)
 const [error,setError]=useState('')
 const [panel,setPanel]=useState<Panel>(null)
 const [large,setLarge]=useState(false)
 const [code,setCode]=useState('')
 const [confirmReset,setConfirmReset]=useState(false)
 const [lastNote,setLastNote]=useState('')
 const viewport=useRef<HTMLDivElement>(null)
 const textbox=useRef<HTMLTextAreaElement>(null)

 useEffect(()=>{
  try{const data=localStorage.getItem(KEY);if(data)setGame(normalizeSave(JSON.parse(data)))}catch{}
  try{setCode(sessionStorage.getItem('nw-ai-code')||'')}catch{}
  fetch('/api/ai-adventure').then(r=>r.json()).then(r=>setReady(Boolean(r.configured))).catch(()=>setReady(false))
  setLoaded(true)
 },[])
 useEffect(()=>{if(loaded)localStorage.setItem(KEY,JSON.stringify(game))},[game,loaded])
 useEffect(()=>{const e=viewport.current;if(e)e.scrollTop=e.scrollHeight},[game.logs.length,busy,panel])
 const world=MOVIES[game.world]

 const send=async(action?:string)=>{
  const message=(action||input).trim()
  if(!message||busy||game.stage!=='playing')return
  setBusy(true);setPending(message);setError('');setLastNote('');setInput('')
  try{
   const res=await fetch('/api/ai-adventure',{
    method:'POST',
    headers:{'content-type':'application/json','x-adventure-access-code':code},
    body:JSON.stringify({state:game,action:message})
   })
   const body=await res.json()
   if(!res.ok)throw new Error(body.error||'生成失敗')
   setGame(normalizeSave(body.state))
   const answer=body.turn as AiTurn
   if(answer?.consequence)setLastNote(answer.consequence)
  }catch(e){
   setError(e instanceof Error?e.message:'連線失敗')
   setInput(message)
  }finally{setBusy(false);setPending('')}
 }
 const next=async()=>{
  if(busy||game.stage!=='hub')return
  setBusy(true);setError('')
  try{
   const res=await fetch('/api/ai-adventure',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({operation:'next',state:game})})
   const data=await res.json();if(!res.ok)throw new Error(data.error||'未能解鎖')
   setGame(normalizeSave(data.state));setLastNote('主神已進行有限度治療。')
  }catch(e){setError(e instanceof Error?e.message:'轉移失敗')}finally{setBusy(false)}
 }
 const exportSave=()=>{
  const blob=new Blob([JSON.stringify(game,null,2)],{type:'application/json'})
  const url=URL.createObjectURL(blob);const a=document.createElement('a');a.href=url;a.download='nightwalker-ai-save.json';a.click();URL.revokeObjectURL(url)
 }
 const importSave=(file:File)=>{
  file.text().then(text=>{try{
    const value=JSON.parse(text)
    if(value?.v!==1||!Array.isArray(value?.logs)||!Array.isArray(value?.items))throw new Error()
    setGame(normalizeSave(value));setError('');setPanel(null)
  }catch{setError('存檔格式唔符合 Nightwalker AI Adventure。')}})
 }
 const reset=()=>{
  if(!confirmReset){setConfirmReset(true);return}
  setGame(NEW_GAME);setLastNote('');setInput('');setPanel(null);setConfirmReset(false);setError('')
 }
 const filled=game.hp>0&&game.sp>0

 return <main className={'nw-ai'+(large?' nw-ai-large':'')}>
  <header className="nw-ai-head">
    <a href="/" className="nw-ai-mark" aria-label="返回原本遊戲">N<span>∞</span></a>
    <div className="nw-ai-brand"><strong>NIGHTWALKER</strong><small>AI 無限流 · 自由文字冒險</small></div>
    <button className="nw-ai-icon" onClick={()=>setPanel('settings')} aria-label="遊戲設定">☰</button>
  </header>
  <div className="nw-ai-progress">
   <div><span className="nw-ai-pin"/>世界 {String(game.world+1).padStart(2,'0')} / 03 · <strong>{world.name}（{world.year}）</strong></div>
   <small>{game.stage==='hub'?'主神空間':game.stage==='complete'?'輪迴三部曲完成':'第 '+(game.worldTurns+1)+' 回合'}</small>
  </div>
  <div className="nw-ai-stats">
    <span>♥ <b>{game.hp}</b><small> 生命</small></span>
    <span>◈ <b>{game.sp}</b><small> 理智</small></span>
    <span>✦ <b>{game.points}</b><small> 積分</small></span>
    <span className="nw-ai-time">⌛ {game.minutes}m</span>
  </div>
  <section className="nw-ai-reader" ref={viewport} aria-live="polite">
    {game.logs.length===0&&<article className="nw-ai-intro">
      <small>世界 01 · 進入電影</small>
      <h1>{game.title}</h1>
      <p>一陣眩暈之後，你睜開眼睛。主神空間嘅白光已經消失，四周變成陌生但又似曾相識嘅電影場景。</p>
      <p>{world.entry}</p>
      <p>電影原本嘅事件即將發生。但今次，你唔係觀眾，而係其中一個可能改寫命運嘅人。</p>
      <div className="nw-ai-rule">【主任務】{world.goal}</div>
      <p className="nw-ai-intro-hint">你可以自由描述任何行動、說話、計劃或調查方向；AI 會判斷成敗及後果。</p>
    </article>}
    {game.logs.map((entry,i)=><div key={entry.turn+'-'+i} className="nw-ai-exchange">
      <div className="nw-ai-human"><span>你的行動</span><p>{entry.action}</p></div>
      <article className="nw-ai-narration">
        <div className="nw-ai-chapter"><span>{entry.world}</span><small>第 {entry.turn} 回合 · {entry.outcome}</small></div>
        {entry.story.split(/\n+/).filter(Boolean).map((paragraph,j)=><p key={j}>{paragraph}</p>)}
        {entry.dialogue.map((d,j)=><div className="nw-ai-quote" key={j}><div><strong>{d.speaker}</strong><small>{d.emotion}</small></div><p>「{d.text}」</p></div>)}
      </article>
    </div>)}
    {pending&&<div className="nw-ai-human nw-ai-pending"><span>你的行動</span><p>{pending}</p></div>}
    {busy&&<div className="nw-ai-thinking"><span className="nw-ai-pulse"/>AI 正按照電影設定、角色記憶同你嘅行動編寫下一幕……</div>}
    {lastNote&&!busy&&<div className="nw-ai-note">{lastNote}</div>}
    {game.stage!=='playing'&&<div className="nw-ai-clear">
      <span>✦ 主神結算</span>
      <h2>{game.stage==='complete'?'首三個電影世界已完成':'世界任務完成'}</h2>
      <p>{game.stage==='complete'?'你已完成《生化危機》、《Van Helsing》、《風雲雄霸天下》，之前做過嘅選擇會保留喺存檔。':'你已完成呢一部電影嘅核心任務，並攜帶所得獎勵返回主神空間。'}</p>
      {game.stage==='hub'&&<button onClick={next} disabled={busy}>進入下一個電影世界 →</button>}
    </div>}
  </section>
  <footer className="nw-ai-bottom">
   {error&&<div className="nw-ai-error"><span>{error}</span><button onClick={()=>setError('')} aria-label="關閉">✕</button></div>}
   {ready===false&&<div className="nw-ai-unconfigured">模型尚未連接：需要喺 Vercel 設定 GROQ_API_KEY 或 OPENAI_API_KEY，先可以真正由 AI 生成劇情。</div>}
   {game.stage==='playing'&&<>
     <div className="nw-ai-suggestion-label"><span>建議行動</span><small>亦可以自由輸入</small></div>
     <div className="nw-ai-suggestions">{game.suggestions.slice(0,3).map((a,i)=><button key={i} disabled={busy||!filled} onClick={()=>send(a)}>{i+1}. {a}</button>)}</div>
     <div className="nw-ai-compose">
       <textarea ref={textbox} value={input} onChange={e=>setInput(e.target.value)} maxLength={550} placeholder="輸入任何行動、對話或計劃……&#10;例如：我唔跟佢哋入去，我想先調查出口。" disabled={busy||!filled}
         onKeyDown={e=>{if(e.key==='Enter'&&(e.ctrlKey||e.metaKey)){e.preventDefault();send()}}} rows={2}/>
       <button onClick={()=>send()} disabled={!input.trim()||busy||!filled} aria-label="執行行動">➤</button>
     </div>
     {!filled&&<div className="nw-ai-unconfigured">生命或理智已歸零。你可以喺設定匯出存檔，或者重新開始新遊戲。</div>}
   </>}
   <nav className="nw-ai-nav">
     <button onClick={()=>setPanel('memory')}>▤ <span>故事記憶</span></button>
     <button onClick={()=>setPanel('status')}>◈ <span>角色狀態</span></button>
     <button onClick={()=>setPanel('settings')}>☰ <span>存檔設定</span></button>
   </nav>
  </footer>

  {panel&&<div className="nw-ai-overlay" onClick={()=>setPanel(null)}><section className="nw-ai-drawer" onClick={e=>e.stopPropagation()}>
   <header><h2>{panel==='memory'?'故事記憶':panel==='status'?'角色狀態':'遊戲設定'}</h2><button onClick={()=>setPanel(null)}>✕</button></header>
   <div className="nw-ai-panel-scroll">
    {panel==='memory'&&<><h3>長期劇情摘要</h3><p>{game.summary}</p><h3>重要因果</h3>{game.memories.length?game.memories.map((m,i)=><div className="nw-ai-memory" key={i}>{m}</div>):<p>暫未有重大劇情變動。</p>}<h3>已完成世界</h3><p>{game.cleared.length?game.cleared.map(x=>MOVIES.find(m=>m.id===x)?.name||x).join(' → '):'尚未通關'}</p></>}
    {panel==='status'&&<><div className="nw-ai-panel-grid"><span>生命 <b>{game.hp}</b></span><span>理智 <b>{game.sp}</b></span><span>積分 <b>{game.points}</b></span><span>XP <b>{game.xp}</b></span></div>
      <h3>主神任務</h3><p>{world.goal}</p><h3>隨身物品</h3>{game.items.map((x,i)=><div className="nw-ai-memory" key={i}>▣　{x}</div>)}
      <h3>已認識角色</h3>{Object.entries(game.people).length?Object.entries(game.people).map(([n,x])=><div className="nw-ai-memory" key={n}>{n} · 信任 {x.trust} · {x.condition}</div>):<p>暫未建立人物關係。</p>}</>}
    {panel==='settings'&&<>
      <p>Nightwalker AI 模式係真正動態文字敘事，需要伺服器模型金鑰。全部劇情存檔保存在目前瀏覽器；圖片及戰鬥演出唔係主要玩法。</p>
      <label className="nw-ai-setting">大字閱讀 <input type="checkbox" checked={large} onChange={e=>setLarge(e.target.checked)}/></label>
      <label className="nw-ai-setting">私人遊戲存取碼（如已設定）<input type="password" value={code} placeholder="Access code" onChange={e=>{setCode(e.target.value);sessionStorage.setItem('nw-ai-code',e.target.value)}}/></label>
      <button className="nw-ai-action" onClick={exportSave}>匯出目前存檔 JSON</button>
      <label className="nw-ai-action nw-ai-import">匯入 Nightwalker AI 存檔<input type="file" accept=".json,application/json" onChange={e=>{const f=e.target.files?.[0];if(f)importSave(f)}}/></label>
      <button className="nw-ai-danger" onClick={reset}>{confirmReset?'確認清除 AI 模式進度':'重新開始 AI 模式'}</button>
      <a className="nw-ai-legacy" href="/">返回舊版固定劇情模式</a>
    </>}
   </div>
  </section></div>}
 </main>
}
