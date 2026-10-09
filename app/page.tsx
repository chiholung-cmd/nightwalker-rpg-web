'use client'

import { useEffect, useRef, useState } from 'react'
import {
  INITIAL, availableChoices, applyEffect, effectiveLines, sceneFor,
  type Choice, type SaveState, type WorldTheme
} from '../lib/infiniteStory'
import './story.css'

const SAVE_KEY = 'nightwalker-multiverse-story-v1'
type Overlay = 'bag' | 'journal' | 'shop' | 'menu' | 'map' | null
type CombatKind = 'clerk' | 'echo'
type Fight = {
  enemy: CombatKind
  hp: number
  turn: number
  weak: boolean
  mirrorUsed: boolean
  busy: boolean
  message: string
  animation: string
  returnScene: string
}
const enemyName = (kind: CombatKind) => kind === 'clerk' ? '失物管理員' : '裂隙守門者'
const maxEnemyHP = (kind: CombatKind) => kind === 'clerk' ? 95 : 135
const clamp = (n: number, max = 100) => Math.max(0, Math.min(max, n))
const miniStat = (value: number) => String(Math.round(value)).padStart(2, '0')

function WorldBackdrop({ theme, battle, count }: { theme: WorldTheme; battle: boolean; count: number }) {
  return (
    <svg className="iw-world-svg" viewBox="0 0 390 450" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
      <defs>
        <linearGradient id="iw-sky" x2="0" y2="1"><stop stopColor="#152343"/><stop offset="1" stopColor="#090e1d"/></linearGradient>
        <linearGradient id="iw-gold" x2="0" y2="1"><stop stopColor="#e6d4a5"/><stop offset="1" stopColor="#6b526d"/></linearGradient>
        <radialGradient id="iw-portal-light"><stop stopColor="#92d6ec" stopOpacity=".7"/><stop offset="1" stopColor="#344f91" stopOpacity="0"/></radialGradient>
        <radialGradient id="iw-redlight"><stop stopColor="#fd5f86" stopOpacity=".62"/><stop offset="1" stopColor="#651d53" stopOpacity="0"/></radialGradient>
      </defs>
      <rect width="390" height="450" fill="url(#iw-sky)"/>
      <g opacity=".25" stroke="#7787b4" strokeWidth="1"><path d="M0 80H390M0 160H390M0 240H390M0 320H390M30 0V450M150 0V450M260 0V450M360 0V450"/></g>
      {theme==='nexus' && <>
        <ellipse cx="194" cy="233" rx="188" ry="158" fill="url(#iw-portal-light)" opacity=".7"/>
        <path d="M0 354L195 240L390 354V450H0Z" fill="#101c36" stroke="#687aa7" strokeWidth="2"/>
        <path d="M15 365L195 271L372 365M67 398L195 322L318 398M120 430L195 385L269 430" stroke="#59729c" strokeWidth="1" opacity=".5" fill="none"/>
        {[67,168,300].map((x,i)=><g key={i}>
          <path d={'M'+(x-33)+' 210Q'+x+' 131 '+(x+33)+' 210V335H'+(x-33)+'Z'} fill={i===0?'#1c2a4b':i===1?'#242142':'#28253e'} stroke={i===0?'#8bcae3':i===1?'#d2a0b3':'#a5a9e4'} strokeWidth="3"/>
          <path d={'M'+(x-23)+' 212Q'+x+' 161 '+(x+23)+' 212V324H'+(x-23)+'Z'} fill={i===0?'#457da4':i===1?'#933e68':'#6962a3'} opacity=".8"/>
          <path d={'M'+(x-13)+' 215Q'+x+' 185 '+(x+13)+' 215V320H'+(x-13)+'Z'} fill="#c2d6ff" opacity=".17"/>
        </g>)}
        <path d="M190 61L209 30L220 56L249 68L220 76L207 102L192 76L166 68Z" fill="#e4d9ed" opacity=".8"/>
        <circle cx="207" cy="67" r="54" fill="none" stroke="#b6b3e9" strokeWidth="1.5" strokeDasharray="3 8" opacity=".6"/>
      </>}
      {theme==='archive' && <>
        <circle cx="275" cy="103" r="106" fill="url(#iw-portal-light)" opacity=".6"/>
        {[0,1,2,3].map(i=><g key={i} transform={'translate('+(i*111-19)+' 80)'}>
          <rect width="102" height="304" fill="#101827" stroke="#54637b" strokeWidth="4"/>
          {[0,1,2,3].map(j=><g key={j}><path d={'M3 '+(64+j*59)+'H99'} stroke="#64728d" strokeWidth="3"/>
            <rect x="10" y={10+j*59} width="24" height="45" fill="#3d475f"/>
            <rect x="40" y={18+j*59} width="25" height="37" fill="#5f4d66"/>
            <rect x="73" y={11+j*59} width="21" height="44" fill="#594858"/></g>)}
        </g>)}
        <path d="M0 388H390V450H0Z" fill="#111925"/>
        <ellipse cx="196" cy="407" rx="150" ry="29" fill="#637a8b" opacity=".15"/>
        <circle cx="194" cy="153" r="41" fill="#1c2239" stroke="#cfb79d" strokeWidth="6"/>
        <path d="M194 122V153L220 163" stroke="#ffe2aa" strokeWidth="4" fill="none"/>
        <text x="194" y="211" fill="#c2b2bd" fontSize="10" textAnchor="middle" letterSpacing="3">LOST &amp; FOUND</text>
      </>}
      {theme==='apartment' && <>
        <circle cx="301" cy="107" r="86" fill="url(#iw-redlight)"/>
        <circle cx="301" cy="107" r="51" fill="#f08b91" opacity=".55"/>
        <path d="M0 365L0 55L114 55L114 365M133 365L133 5L267 5L267 365M288 365L288 81H390V365" fill="#0b1122" stroke="#67435f" strokeWidth="3"/>
        {[30,80,165,215,313,360].map((x,i)=>[111,175,240,310].map((y,j)=><rect key={x+'-'+y} x={x} y={y} width="26" height="38" fill={(i+j)%3===0?'#b94d69':'#48344f'} opacity=".69" stroke="#b4778a" strokeWidth=".9"/>))}
        <path d="M0 370L390 335V450H0Z" fill="#151325"/>
        <path d="M10 372Q105 300 175 367T390 354" stroke="#bd4768" strokeWidth="4" fill="none"/>
        <text x="192" y="47" fontSize="17" letterSpacing="8" fill="#e7aeb9">13 F</text>
      </>}
      {theme==='hospital' && <>
        <path d="M65 30L195 148L325 30V395H65Z" fill="#18283b" stroke="#689da6" strokeWidth="2"/>
        <path d="M195 148V395" stroke="#72b6bd" strokeWidth="3" opacity=".55"/>
        <path d="M0 385L195 303L390 385V450H0Z" fill="#162f36"/>
        {[35,75,115,155].map((v,i)=><path key={i} d={'M0 '+(380+i*18)+'L195 '+(307+i*36)+'L390 '+(380+i*18)} stroke="#569b9e" strokeWidth="1.3" opacity=".45" fill="none"/>)}
        {[80,265].map(x=><g key={x}><rect x={x} y="178" width="45" height="130" fill="#0b1c2b" stroke="#71a9ac" strokeWidth="3"/><path d={'M'+(x+23)+' 179V309'} stroke="#5e9ea3" strokeWidth="1.5"/></g>)}
        <rect x="155" y="152" width="80" height="27" fill="#acddd4" opacity=".63"/>
        <path d="M190 158V172M183 165H197" stroke="#195d65" strokeWidth="4"/>
        <circle cx="195" cy="132" r="69" fill="url(#iw-portal-light)" opacity=".8"/>
      </>}
      {theme==='rift' && <>
        <ellipse cx="195" cy="182" rx="155" ry="175" fill="url(#iw-portal-light)"/>
        {[0,1,2,3,4,5].map(i=><path key={i} d={'M'+(i*73-20)+' 450L'+(195+(i-3)*14)+' 80'} stroke="#8997cb" opacity=".5" strokeWidth="2"/> )}
        <path d="M195 38L255 131L339 164L260 234L225 340L167 249L82 202L153 143Z" fill="#1c2247" stroke="#a9bdfa" strokeWidth="4"/>
        <path d="M195 83L239 163L286 184L225 229L208 290L169 229L120 201L170 159Z" fill="#6478bb" opacity=".63"/>
        <circle cx="195" cy="174" r="69" fill="none" stroke="#c0d4ff" strokeWidth="2" strokeDasharray="5 12"/>
        <text x="195" y="408" fontSize="12" fill="#b4cbfc" textAnchor="middle">RIFT {String(count+1).padStart(3,'0')}</text>
      </>}
      {battle && <g><circle cx="286" cy="265" r="125" fill="url(#iw-redlight)" opacity=".7"/><path d="M269 331L254 255L270 204L301 205L329 252L325 335Z" fill="#171627" stroke="#bc668c" strokeWidth="3"/><circle cx="295" cy="207" r="37" fill="#392139" stroke="#dea1a3" strokeWidth="6"/><circle cx="295" cy="207" r="26" fill="#1d1b32" stroke="#bc728c" strokeWidth="3"/><path d="M295 181V208L309 222" stroke="#ffc6c0" strokeWidth="4" fill="none"/><path d="M254 265L216 284M328 265L362 277" stroke="#5d415f" strokeWidth="13" strokeLinecap="round"/><path d="M130 340L136 271L174 255L194 278L201 341Z" fill="#14243d" stroke="#7eb3d5" strokeWidth="2"/><circle cx="166" cy="239" r="29" fill="#c7d7e6"/><path d="M141 241L140 220L156 226L167 199L179 218L193 212L193 236" fill="#e2effa" stroke="#9fbde1" strokeWidth="2"/><path d="M197 280L262 218" stroke="#b5eeff" strokeWidth="6"/><path d="M205 282L265 226" stroke="#60beed" strokeWidth="2"/></g>}
    </svg>
  )
}

function Avatar({ face }: { face?: string }) {
  const glyph = face === 'guide' ? '霧' : face === 'girl' ? '✿' : face === 'clerk' ? '✂' : face === 'nurse' ? '✚' : face === 'neighbor' ? '月' : '∞'
  return <span className={'iw-avatar iw-avatar-'+(face||'system')} aria-hidden="true">{glyph}</span>
}
function Stat({ label, value, type }: { label:string; value:number; type:'hp'|'sp' }) {
  return <div className="iw-stat"><div className="iw-stat-label"><span>{label}</span><strong>{miniStat(value)}</strong></div><div className="iw-stat-track"><i className={'iw-fill-'+type} style={{width:value+'%'}}/></div></div>
}
const shopItems = [
  { key:'med', name:'急救針劑', icon:'✚', cost:30, note:'回復 35 HP' },
  { key:'calm', name:'鎮魂藥劑', icon:'◇', cost:25, note:'回復 25 理智' },
  { key:'mirror', name:'鏡界護符', icon:'✧', cost:50, note:'背包永久收藏，可作為世界線索' }
]
const battleMoves: {key:string;label:string;info:string;icon:string}[] = [
  {key:'attack',label:'斬擊',info:'普通傷害',icon:'⚔'},
  {key:'inspect',label:'偵查',info:'破防+傷害',icon:'◎'},
  {key:'guard',label:'防禦',info:'減傷/回 SP',icon:'◇'},
  {key:'seal',label:'遺忘印記',info:'消耗 18 SP',icon:'✧'},
  {key:'mirror',label:'鏡像斬',info:'每場一次・打斷',icon:'✦'}
]

export default function HomePage() {
  const [game,setGame] = useState<SaveState>(INITIAL)
  const [hydrated,setHydrated] = useState(false)
  const [mode,setMode] = useState<'story'|'battle'|'lost'>('story')
  const [fight,setFight] = useState<Fight|null>(null)
  const [overlay,setOverlay] = useState<Overlay>(null)
  const [fx,setFx] = useState('')
  const block = useRef(false)
  const activeTimer=useRef<ReturnType<typeof setTimeout>|null>(null)

  useEffect(()=>{
    try {
      const raw=localStorage.getItem(SAVE_KEY)
      if(raw){
        const parsed=JSON.parse(raw) as SaveState
        if(parsed && typeof parsed.scene==='string' && Array.isArray(parsed.flags) && Array.isArray(parsed.items) && sceneFor(parsed.scene).id===parsed.scene){
          setGame({...INITIAL,...parsed})
          if(parsed.hp<=0 || parsed.sp<=0)setMode('lost')
        }
      }
    }catch{/* Invalid save starts from inherited zero-station state */}
    setHydrated(true)
    return ()=>{if(activeTimer.current)clearTimeout(activeTimer.current)}
  },[])
  useEffect(()=>{if(hydrated)localStorage.setItem(SAVE_KEY,JSON.stringify(game))},[game,hydrated])

  const scene=sceneFor(game.scene)
  const lines=effectiveLines(scene,game)
  const currentLine=Math.min(game.line,lines.length-1)
  const atChoices=currentLine===lines.length-1
  const choices=availableChoices(scene,game)
  const choose=(choice:Choice)=>{
    if(block.current||mode!=='story')return
    if(choice.action==='shop'){setOverlay('shop');return}
    if(choice.action==='combat-practice'){window.location.href='/combat';return}
    const next=applyEffect(game,choice.effect)
    const enteringBattle=choice.action==='battle'
    const node=enteringBattle?game.scene:(choice.to||game.scene)
    const record=(scene.title+' → '+choice.label)
    const updated:SaveState={...next,scene:node,line:enteringBattle?game.line:0,path:[record,...next.path].slice(0,40)}
    setGame(updated)
    if(updated.hp===0||updated.sp===0){setMode('lost');return}
    if(choice.action==='battle'){
      setFight({enemy:choice.enemy||'clerk',hp:maxEnemyHP(choice.enemy||'clerk'),turn:1,weak:false,mirrorUsed:false,
        busy:false,message:'前面嘅怪物擋住去路。你拔出鏡面碎片，決定正面迎戰。',animation:'',returnScene:choice.to||'lost_after_battle'})
      setMode('battle')
    }
  }
  const advance=()=>{
    if(mode!=='story'||overlay)return
    if(game.line<lines.length-1)setGame({...game,line:game.line+1})
  }
  const buy=(key:string)=>{
    const item=shopItems.find(x=>x.key===key)
    if(!item||game.points<item.cost)return
    if(key==='med'&&game.hp===100||key==='calm'&&game.sp===100||key==='mirror'&&game.items.includes('鏡界護符'))return
    setGame({...game,points:game.points-item.cost,
      hp:key==='med'?clamp(game.hp+35):game.hp,
      sp:key==='calm'?clamp(game.sp+25):game.sp,
      items:key==='mirror'?[...game.items,'鏡界護符']:game.items,
      journal:key==='mirror'?['購入鏡界護符，可感應其他世界的鏡面。',...game.journal]:game.journal})
  }
  const restart=()=>{
    if(activeTimer.current)clearTimeout(activeTimer.current)
    block.current=false;setGame(INITIAL);setFight(null);setMode('story');setOverlay(null);setFx('')
  }
  const returnHub=()=>{
    if(activeTimer.current)clearTimeout(activeTimer.current)
    block.current=false;setGame(prev=>({...prev,scene:'hub_return',line:0}));setFight(null);setMode('story');setOverlay(null)
  }
  const actionBattle=(type:string)=>{
    if(!fight||fight.busy||block.current||mode!=='battle')return
    if(type==='seal'&&game.sp<18||type==='mirror'&&fight.mirrorUsed)return
    block.current=true
    const next:Fight={...fight,busy:true,animation:type}
    let hp=game.hp,sp=game.sp,points=game.points,damage=0,stunned=false,defend=false
    const bonus=fight.weak?9:0
    if(type==='attack'){damage=19+bonus;next.message='劍光直擊敵人，造成 '+damage+' 傷害！'}
    if(type==='inspect'){next.weak=true;next.message='你發現敵人心臟有一道裂縫！之後攻擊傷害提升。'}
    if(type==='guard'){defend=true;sp=clamp(sp+7);next.message='你降低身體重心進入防禦姿態，理智回復 7。'}
    if(type==='seal'){sp-=18;damage=35+bonus;next.message='【遺忘者印記】被刪除嘅名字化成紫光，造成 '+damage+' 傷害！'}
    if(type==='mirror'){damage=29+bonus;next.mirrorUsed=true;stunned=true;next.message='你嘅鏡像同時出刀！敵人行動被打斷，傷害 '+damage+'。'}
    next.hp=Math.max(0,next.hp-damage)
    setFx(type)
    if(next.hp<=0){
      points+=fight.enemy==='clerk'?65:45
      setGame({...game,points,sp,hp,flags:Array.from(new Set([...game.flags,'battle_'+fight.enemy+'_won'])),journal:['成功擊敗 '+enemyName(fight.enemy)+'，獲得 '+(fight.enemy==='clerk'?65:45)+' 積分。',...game.journal]})
      setFight({...next,busy:false,message:'敵人終於倒下。你成功取得離開嘅機會。'})
      block.current=false
      return
    }
    setGame(prev=>({...prev,hp,sp}))
    setFight(next)
    activeTimer.current=setTimeout(()=>{
      let enemyHP=0,enemySP=0
      const intent=(fight.turn-1)%3
      if(intent===0){enemySP=fight.enemy==='clerk'?10:14}
      if(intent===1){enemyHP=fight.enemy==='clerk'?24:29}
      if(intent===2){enemyHP=fight.enemy==='clerk'?12:16;enemySP=7}
      if(stunned){enemyHP=0;enemySP=0}
      else if(defend){enemyHP=Math.ceil(enemyHP*.25);enemySP=Math.ceil(enemySP*.25)}
      const afterHP=clamp(hp-enemyHP),afterSP=clamp(sp-enemySP)
      setGame(prev=>({...prev,hp:afterHP,sp:afterSP}))
      setFight(prev=>prev?{...prev,turn:prev.turn+1,busy:false,animation:stunned?'mirror':'hurt',
        message:stunned?'敵人被鏡面困住，冇辦法反擊。':enemyName(fight.enemy)+'發動'+['身份核對','猛烈突刺','影子回收'][intent]+'！生命 −'+enemyHP+'，理智 −'+enemySP}:prev)
      if(afterHP===0||afterSP===0)setMode('lost')
      setFx(stunned?'mirror':'hurt')
      block.current=false
    },580)
  }
  const battleWinReturn=()=>{
    if(!fight||fight.hp>0)return
    setGame(prev=>({...prev,scene:fight.returnScene,line:0}))
    block.current=false
    setFight(null);setFx('');setMode('story')
  }
  const revive=()=>{
    if(!fight){setGame(prev=>({...prev,hp:60,sp:50,points:Math.max(0,prev.points-25),scene:'hub_return',line:0}));setMode('story');return}
    block.current=false
    setGame(prev=>({...prev,hp:70,sp:50,points:Math.max(0,prev.points-25),journal:['死而復活令你失去 25 積分。',...prev.journal]}))
    setFight({...fight,hp:maxEnemyHP(fight.enemy),turn:1,weak:false,mirrorUsed:false,busy:false,animation:'',message:'【復活協議】你回到戰鬥開始時。'})
    setMode('battle')
  }
  const isBattle=mode==='battle'||mode==='lost'&&Boolean(fight)
  const theme: WorldTheme = isBattle ? (fight?.enemy==='echo'?'rift':'archive') : scene.theme

  return <main className="iw-app">
    <header className="iw-top">
      <div className="iw-mark" aria-label="Nightwalker">◈</div>
      <div className="iw-brand"><strong>NIGHTWALKER <em>∞</em></strong><small>無限流・多重世界</small></div>
      <div className="iw-world-id"><span>WORLD {String(game.cleared.length+game.riftCount).padStart(2,'0')}</span><small>{isBattle?'戰鬥遭遇':scene.world}</small></div>
      <button className="iw-top-button" aria-label="選單" onClick={()=>setOverlay('menu')}>☷</button>
    </header>

    <section className={'iw-stage iw-theme-'+theme+(isBattle?' iw-battle-active iw-fx-'+fx:'')}>
      <WorldBackdrop theme={theme} battle={isBattle} count={game.riftCount}/>
      <div className="iw-vignette"/>
      <div className="iw-stage-head">
        <div><span className="iw-stage-tag">{isBattle?'⚔ COMBAT': 'STORY MODE'}</span><strong>{isBattle?'規則異常・交戰中':scene.title}</strong></div>
        {isBattle?<span className="iw-scene-counter">回合 {fight?.turn||1}</span>:<span className="iw-scene-counter">{game.cleared.length} 個世界通關</span>}
      </div>
      <div className="iw-stage-bottom">
        {isBattle?<div className="iw-foe"><small>ANOMALY ENCOUNTER</small><strong>{fight?enemyName(fight.enemy):'未知'}</strong><div className="iw-foe-bar"><i style={{width:((fight?.hp||0)/maxEnemyHP(fight?.enemy||'clerk')*100)+'%'}}/></div></div>:
          <div className="iw-scene-quote"><span>✧</span> 你的選擇，將會留低痕跡。</div>}
      </div>
      {isBattle&&<div className="iw-battle-fx"><i/><b>✦</b></div>}
    </section>

    <section className="iw-status" aria-label="角色狀態">
      <div className="iw-player-identity"><span className="iw-player-avatar">✧</span><div><strong>無名生還者</strong><small>身份：遺忘者</small></div></div>
      <Stat label="HP" value={game.hp} type="hp"/>
      <Stat label="SP" value={game.sp} type="sp"/>
      <div className="iw-points"><strong>✦ {game.points}</strong><small>積分</small></div>
    </section>

    <section className="iw-dialogue">
      <div className="iw-dialogue-head"><Avatar face={isBattle?'clerk':scene.face}/><div><strong>{isBattle?(fight?enemyName(fight.enemy):'戰鬥') : scene.speaker}</strong><small>{isBattle?'戰鬥情報・敵方攻擊可預判':scene.world+' ・ '+(currentLine+1)+'/'+lines.length}</small></div><span className="iw-type-indicator">{isBattle?'⚔':'●'}</span></div>
      <p>{isBattle ? (fight?.message||'') : lines[currentLine]}</p>
    </section>

    {mode==='story'?<section className="iw-actions" aria-label="故事選擇">
      {!atChoices?<button className="iw-next" onClick={advance}><span>繼續閱讀故事</span><strong>下一句 →</strong></button>:
        <div className="iw-choices">{choices.map((choice,i)=><button className="iw-choice" key={i} onClick={()=>choose(choice)}><span className="iw-choice-count">{String(i+1).padStart(2,'0')}</span><span className="iw-choice-text"><strong>{choice.label}</strong>{choice.hint&&<small>{choice.hint}</small>}</span><span className="iw-choice-arrow">›</span></button>)}
          {choices.length===0&&<button className="iw-choice" onClick={returnHub}>返回主神空間 →</button>}
        </div>}
    </section>:
    mode==='battle'?<section className="iw-actions iw-combat-panel" aria-label="戰鬥指令">
      {fight?.hp===0?<button className="iw-next" onClick={battleWinReturn}><span>勝利・戰利品已記錄</span><strong>繼續劇情 →</strong></button>:
        <div className="iw-battle-grid">{battleMoves.map(m=><button key={m.key} className={'iw-battle-command iw-skill-'+m.key} disabled={fight?.busy||m.key==='mirror'&&fight?.mirrorUsed||m.key==='seal'&&game.sp<18} onClick={()=>actionBattle(m.key)}><span>{m.icon}</span><strong>{m.label}</strong><small>{m.info}</small></button>)}</div>}
    </section>:<section className="iw-actions"><div className="iw-death"><strong>◈ 意識中斷</strong><p>你的生命或理智已耗盡。主神准許你支付 25 積分，重置今次危機。</p><button onClick={revive}>支付積分・重返輪迴</button></div></section>}

    <nav className="iw-bottom-nav" aria-label="遊戲功能">
      <button onClick={()=>setOverlay('map')}><span>◇</span><small>世界</small></button>
      <button onClick={()=>setOverlay('journal')}><span>▤</span><small>劇情</small></button>
      <button onClick={()=>setOverlay('bag')}><span>▣</span><small>背包</small></button>
      <button onClick={()=>setOverlay('shop')}><span>✦</span><small>商店</small></button>
      <button onClick={()=>setOverlay('menu')}><span>☰</span><small>選單</small></button>
    </nav>

    {overlay&&<div className="iw-overlay" onClick={()=>setOverlay(null)}>
      <div className="iw-sheet" onClick={e=>e.stopPropagation()}>
        <div className="iw-sheet-handle"/>
        <div className="iw-sheet-header"><strong>{overlay==='bag'?'背包與裝備':overlay==='journal'?'因果與劇情紀錄':overlay==='shop'?'主神商店':overlay==='map'?'多重世界地圖':'遊戲設定'}</strong><button onClick={()=>setOverlay(null)}>✕</button></div>
        {overlay==='bag'&&<div className="iw-sheet-scroll"><p className="iw-note">物品會跨世界保留；有啲線索喺其他世界會解鎖特別選項。</p>
          {game.items.map((item,i)=><div className="iw-sheet-line" key={i}><span>◇</span><strong>{item}</strong><small>已持有</small></div>)}
          <div className="iw-bond">阿霧信任：{game.bond>=2?'盟友':game.bond>=1?'熟識':'陌生'}（{game.bond}）</div>
        </div>}
        {overlay==='journal'&&<div className="iw-sheet-scroll"><p className="iw-note">你做過嘅重要決定會永久記錄。故事不是每次都能重來。</p>
          <h3>重大發現</h3>{game.journal.map((item,i)=><div className="iw-journal-line" key={i}>{item}</div>)}
          <h3>最近選擇</h3>{game.path.slice(0,15).map((item,i)=><div className="iw-path-line" key={i}>{item}</div>)}
        </div>}
        {overlay==='map'&&<div className="iw-sheet-scroll"><p className="iw-note">完成世界：{game.cleared.length} ・ 裂隙輪迴：{game.riftCount}</p>
          {['零號月台','失物管理處','血月公寓','鏡城病院','未知裂隙'].map(world=><div className="iw-map-line" key={world}><span>✧</span><strong>{world}</strong><small>{game.cleared.includes(world)?'✓ 已完成':world==='未知裂隙'?'每次重新組合':'未通關'}</small></div>)}
          <button className="iw-modal-action" onClick={()=>{setOverlay(null);if(mode==='story' && scene.world==='主神中轉站'){setGame(prev=>({...prev,scene:'hub_portals',line:0}))}}} disabled={mode!=='story'||scene.world!=='主神中轉站'}>返回世界傳送門</button>
        </div>}
        {overlay==='shop'&&<div className="iw-sheet-scroll"><p className="iw-note">可用積分：{game.points}。購買後會即時更新，跨世界保留。</p>{shopItems.map(item=><div className="iw-shop-row" key={item.key}><span>{item.icon}</span><div><strong>{item.name}</strong><small>{item.note}</small></div><button onClick={()=>buy(item.key)} disabled={game.points<item.cost||item.key==='med'&&game.hp===100||item.key==='calm'&&game.sp===100||item.key==='mirror'&&game.items.includes('鏡界護符')}>{item.cost} ✦</button></div>)}</div>}
        {overlay==='menu'&&<div className="iw-sheet-scroll"><p className="iw-note">手機直向優先 ・ 自動儲存於目前瀏覽器</p>
          <div className="iw-menu-card"><strong>多世界存檔</strong><small>生命 {game.hp}/100 ・ 理智 {game.sp}/100 ・ 已通關 {game.cleared.length} 世界</small></div>
          <a className="iw-modal-action" href="/combat">⚔ 開啟經典戰鬥訓練場</a>
          <button className="iw-modal-action" onClick={()=>setOverlay(null)}>返回故事</button>
          <button className="iw-danger-action" onClick={()=>{if(window.confirm('確定刪除本機故事進度，由零號月台結算後重新開始？'))restart()}}>刪除存檔並重新開始</button>
        </div>}
      </div>
    </div>}
  </main>
}
