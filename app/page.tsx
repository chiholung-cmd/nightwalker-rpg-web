'use client'

import { useEffect, useRef, useState } from 'react'

type Phase = 'fight' | 'enemy' | 'won' | 'shop' | 'finished' | 'lost'
type Action = 'attack' | 'guard' | 'inspect' | 'seal' | 'mirror' | 'phone' | 'ticket'
type Game = {
  hp: number; sp: number; points: number; level: number; wave: number; turn: number
  enemyHp: number; weak: boolean; marks: number; mirrorUsed: boolean
  phoneUsed: boolean; ticketUsed: boolean; weapon: boolean; phase: Phase
  message: string; speaker: string
}
const SAVE = 'nightwalker-infinite-combat-v1'
const fresh = (): Game => ({
  hp: 100, sp: 74, points: 105, level: 1, wave: 1, turn: 1, enemyHp: 100,
  weak: false, marks: 0, mirrorUsed: false, phoneUsed: false, ticketUsed: false,
  weapon: false, phase: 'fight', speaker: '主神系統',
  message: '「所有冇名字嘅人，都係需要回收嘅失物。」失物管理員舉起巨剪。'
})
const limit = (n: number) => Math.max(0, Math.min(100, n))
const enemyName = (g: Game) => g.wave === 1 ? '失物管理員' : '夜班裁定官'
const enemyMax = (g: Game) => g.wave === 1 ? 100 : 145
const intents = [
  ['姓名核對', '剪刀突刺', '證物查驗', '影子回收'],
  ['午夜鐘聲', '逆時針斬', '命運核對', '無光回響']
]

function CharacterArt({ boss }: { boss: boolean }) {
  return (
    <svg className="nw-scene" viewBox="0 0 600 350" preserveAspectRatio="xMidYMid slice" role="img" aria-label="銀髮持劍者迎戰地鐵失物管理員">
      <defs>
        <linearGradient id="nw-wall" x2="1" y2="1"><stop stopColor="#25344a" /><stop offset="1" stopColor="#080d18" /></linearGradient>
        <linearGradient id="nw-coat"><stop stopColor="#091324"/><stop offset=".55" stopColor="#344664"/><stop offset="1" stopColor="#13182c"/></linearGradient>
        <linearGradient id="nw-blade"><stop stopColor="#fff"/><stop offset=".55" stopColor="#86e9ff"/><stop offset="1" stopColor="#289bff"/></linearGradient>
        <radialGradient id="nw-aura"><stop stopColor="#c95596" stopOpacity=".55"/><stop offset="1" stopColor="#8143b6" stopOpacity="0"/></radialGradient>
        <radialGradient id="nw-moon"><stop stopColor="#f0f5fd" stopOpacity=".7"/><stop offset="1" stopColor="#9eb2db" stopOpacity="0"/></radialGradient>
        <linearGradient id="nw-clockmetal" x1="0" x2="1" y2="1"><stop stopColor="#e2cba4"/><stop offset=".44" stopColor="#6e5874"/><stop offset="1" stopColor="#241e39"/></linearGradient>
        <linearGradient id="nw-clockrobe" x1="0" x2="1" y2="1"><stop stopColor="#38243b"/><stop offset=".55" stopColor="#121626"/><stop offset="1" stopColor="#402236"/></linearGradient>
        <filter id="nw-rune-glow" x="-60%" y="-60%" width="220%" height="220%"><feGaussianBlur stdDeviation="4" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
      </defs>
      <rect width="600" height="350" fill="url(#nw-wall)" />
      <g stroke="#4f6581" strokeWidth="1" opacity=".28"><path d="M0 28H600M0 118H600M0 216H600M72 0V260M205 0V260M393 0V260M536 0V260" /></g>
      <rect x="210" y="10" width="178" height="217" fill="#091324" stroke="#536784" strokeWidth="7"/>
      <rect x="220" y="22" width="158" height="196" fill="#1e3048"/>
      <circle cx="300" cy="102" r="56" fill="#dee0dc" opacity=".22" />
      <path d="M220 202L256 141L278 167L313 102L349 176L378 132V218H220Z" fill="#0e1a2b"/>
      <path d="M301 22V218M220 116H378" stroke="#52677e" strokeWidth="5"/>
      <g fill="#0d1828" stroke="#3e5068" strokeWidth="4"><rect x="4" y="69" width="124" height="190"/><rect x="480" y="75" width="116" height="184"/></g>
      <g fill="#58657e" opacity=".65"><rect x="15" y="81" width="28" height="40"/><rect x="50" y="89" width="42" height="32"/><rect x="16" y="144" width="48" height="40"/><rect x="73" y="148" width="43" height="36"/><rect x="491" y="88" width="38" height="42"/><rect x="539" y="90" width="44" height="40"/><rect x="491" y="154" width="88" height="48"/></g>
      <path d="M0 271H600V350H0Z" fill="#121c30"/>
      <path d="M0 278H600M0 316H600M113 271L36 350M497 271L564 350" stroke="#53617a" opacity=".55" />
      <ellipse cx="170" cy="294" rx="64" ry="11" fill="#5ccff0" opacity=".2"/>
      <ellipse cx="440" cy="294" rx="74" ry="13" fill="#d9487b" opacity=".22"/>
      <circle className={boss ? 'nw-boss-aura active' : 'nw-boss-aura'} cx="441" cy="158" r="129" fill="url(#nw-aura)"/>
      <g className="nw-dust" opacity=".75" fill="#b6b0e3">
        {[[80,56],[144,74],[248,51],[355,92],[393,39],[540,58],[563,147],[277,207],[72,242],[511,253],[321,258],[212,112]].map(([x,y],i) =>
          <circle key={i} cx={x} cy={y} r={i % 3 === 0 ? 1.9 : 1.2} style={{animationDelay: (i * .27) + 's'}}/>
        )}
      </g>
      <g className="nw-hero-art">
        <path d="M149 233L143 288H169L181 237M188 234L190 288H215L204 230" fill="#0a1829" stroke="#647c9a" strokeWidth="3"/>
        <path d="M140 284H170V298H133ZM190 284H216L223 297H190Z" fill="#101929" stroke="#3d597d" strokeWidth="2"/>
        <path d="M161 137L139 155L118 281L174 252L221 278L200 157L184 138Z" fill="url(#nw-coat)" stroke="#6583a6" strokeWidth="3"/>
        <path d="M160 142L176 177L184 144L194 246L166 261L153 244Z" fill="#213049" stroke="#a5c3de" strokeWidth="2"/>
        <path d="M141 162L119 204L143 218L166 174M198 162L235 193L221 213L190 180" fill="#1a2d49" stroke="#668ba9" strokeWidth="3"/>
        <path d="M157 115V144L179 153L193 139L187 113Z" fill="#b9c8d9"/>
        <path d="M148 99Q146 72 175 74Q200 75 200 101L185 130L159 130Z" fill="#c3cbd6" stroke="#798da4" strokeWidth="2"/>
        <path d="M139 106L147 78L135 87L154 59L163 70L177 54L186 67L201 61L209 86L200 101L191 91L176 95L164 83Z" fill="#d6ebf8" stroke="#9bb4cf" strokeWidth="2"/>
        <path d="M150 106L173 115L200 105L194 129L165 134L154 126Z" fill="#142338" stroke="#8fb0cc" strokeWidth="2"/>
        <path d="M158 113L170 117M181 117L191 113" stroke="#6cf0ff" strokeWidth="3.5"/>
        <path d="M142 161L163 169M175 193L195 195" stroke="#8ddff5" strokeWidth="3"/>
        <path d="M224 200L265 131" stroke="#2a4057" strokeWidth="8" strokeLinecap="round"/>
        <path d="M257 135L269 144" stroke="#d7ecf9" strokeWidth="5"/>
        <path d="M261 133L339 28L326 58L253 138Z" fill="url(#nw-blade)" stroke="#def8ff" strokeWidth="2"/>
        <path d="M264 132L334 33" stroke="#fff" strokeWidth="2.5"/>
        <circle cx="226" cy="202" r="10" fill="#c1cedd"/>
      </g>
      {!boss && <g className="nw-enemy-art">
        <path d="M423 236L409 289H434L447 243M457 234L462 289H486L474 230" fill="#1e1626" stroke="#824f6c" strokeWidth="3"/>
        <path d="M418 147L393 169L370 283L429 267L483 292L493 189L462 149Z" fill="#1c1926" stroke="#80556e" strokeWidth="3"/>
        <path d="M419 158L436 181L454 235L467 158M398 190L389 266M467 179L483 265" stroke="#a75f7e" strokeWidth="3" fill="none"/>
        <path d="M422 130L419 155L462 158L457 132" fill="#bdaab6"/>
        <path d="M408 104Q410 78 438 74Q469 77 473 112L462 141Q434 162 413 138Z" fill="#dacbd2" stroke="#6e5a6a" strokeWidth="2"/>
        <path d="M406 111L411 91L407 79L425 62L440 76L462 68L477 99L473 114" fill="#292332" stroke="#915872" strokeWidth="2"/>
        <path d="M419 119L432 117L432 129L417 130ZM445 118L465 119L461 131L445 129Z" fill="#4c1a35"/>
        <path d="M420 124L431 121M447 123L459 123" stroke="#ff648c" strokeWidth="4"/>
        <path d="M430 141L448 141" stroke="#8b4d67" strokeWidth="3"/>
        <path d="M409 172L380 197L360 227M469 177L492 199L500 238" stroke="#342534" strokeWidth="17" strokeLinecap="round" fill="none"/>
        <circle cx="360" cy="228" r="11" fill="#b5a7b2"/><circle cx="501" cy="238" r="11" fill="#b5a7b2"/>
        <path d="M359 231L334 177L353 197L372 218L347 266L353 228L331 249Z" fill="#b5c0cc" stroke="#e9e2e7" strokeWidth="2"/>
        <circle cx="361" cy="230" r="6" fill="#6a3f57"/>
        <rect x="436" y="171" width="31" height="40" rx="3" fill="#c6b9c3" stroke="#7b6575" strokeWidth="2" transform="rotate(12 451 189)"/>
        <text x="450" y="191" textAnchor="middle" fontSize="10" fill="#8b3758" transform="rotate(12 451 189)">NO.</text>
      </g>}
      {boss && <g className="nw-clockboss-art">
        {/* Boss 2 is a completely different silhouette: a suspended clock-headed judge, not a recolour. */}
        <g className="nw-time-rings" fill="none" stroke="#d0a3ab">
          <circle cx="446" cy="137" r="91" opacity=".45" strokeWidth="1.7" strokeDasharray="6 13"/>
          <circle cx="446" cy="137" r="106" opacity=".25" strokeWidth="1.8"/>
          {Array.from({length:12},(_,i)=>(
            <path key={i} d="M446 33V43" strokeWidth="3" transform={`rotate(${i*30} 446 137)`}/>
          ))}
        </g>
        <path d="M441 46L427 10L446 31L467 10L453 48" fill="#8e6e83" stroke="#c6a5a6" strokeWidth="2"/>
        <path d="M421 185L385 203L361 291L416 277L448 289L502 279L487 209L462 188Z" fill="url(#nw-clockrobe)" stroke="#a16c83" strokeWidth="3"/>
        <path d="M402 203Q388 246 384 288M482 212Q495 248 497 280" stroke="#d29c83" strokeWidth="3" opacity=".6"/>
        <path d="M420 190L444 215L463 189L459 261L444 282L432 260Z" fill="#30213b" stroke="#8b7897" strokeWidth="2.5"/>
        <path d="M439 220V276" stroke="#dbbb89" strokeWidth="4"/>
        <path d="M397 205L366 215L345 252M482 208L515 218L538 254" stroke="#3c283f" strokeWidth="18" fill="none" strokeLinecap="round"/>
        <path d="M396 204L368 215L346 250M482 208L516 220L537 255" stroke="#a06c82" strokeWidth="2.5" fill="none"/>
        <path d="M342 253L325 276L345 264L354 284L358 259" stroke="#c1a3a9" strokeWidth="7" strokeLinecap="round" fill="none"/>
        <path d="M537 252L528 285L543 270L553 281L545 254" stroke="#c1a3a9" strokeWidth="7" strokeLinecap="round" fill="none"/>
        <path d="M440 179V204L451 213L462 201L457 176" fill="#63536a" stroke="#bfa1ab" strokeWidth="2"/>
        <path d="M400 82L410 58L439 49L474 61L490 92L483 158L462 183L423 181L398 156Z" fill="#261d35" stroke="#ca9d85" strokeWidth="5"/>
        <circle cx="445" cy="118" r="65" fill="#221d31" stroke="#a4898c" strokeWidth="9"/>
        <circle cx="445" cy="118" r="57" fill="url(#nw-clockmetal)" stroke="#ead3a9" strokeWidth="3"/>
        <circle cx="445" cy="118" r="44" fill="#1e2135" stroke="#d7b895" strokeWidth="2"/>
        <circle cx="445" cy="118" r="37" fill="#161625" stroke="#815a76" strokeWidth="1.5"/>
        {Array.from({length:12},(_,i)=>(
          <path key={i} d="M445 67V80" stroke={i%3===0?"#fae8c0":"#8b7080"} strokeWidth={i%3===0?3:2} transform={`rotate(${i*30} 445 118)`}/>
        ))}
        <path className="nw-clock-hand-fast" d="M445 118L481 91" stroke="#ff8aaf" strokeWidth="5" strokeLinecap="round" filter="url(#nw-rune-glow)"/>
        <path className="nw-clock-hand-slow" d="M445 118L427 86" stroke="#ecdbc0" strokeWidth="6" strokeLinecap="round"/>
        <circle cx="445" cy="118" r="8" fill="#f5d4be" stroke="#a55383" strokeWidth="3"/>
        <path d="M407 188L384 162L379 181L363 163M478 187L500 159L507 178L520 162" stroke="#d6aa94" strokeWidth="4" fill="none"/>
        <path d="M418 185L406 197L422 226L444 205L462 225L481 198L468 185" fill="none" stroke="#ceae89" strokeWidth="3"/>
        <g className="nw-rune" stroke="#f9a3c4" strokeWidth="2" fill="none" filter="url(#nw-rune-glow)">
          <path d="M343 88L354 70L364 89L354 108Z M534 93L546 72L557 92L546 111Z"/>
          <circle cx="353" cy="89" r="5"/><circle cx="546" cy="92" r="5"/>
        </g>
      </g>}
      <text x="300" y="14" fill="#9aa8ba" textAnchor="middle" letterSpacing="3" fontSize="10">LOST &amp; FOUND • 04:44</text>
    </svg>
  )
}

export default function HomePage() {
  const [g, setG] = useState<Game>(fresh)
  const [ready, setReady] = useState(false)
  const [anim, setAnim] = useState('')
  const [hit, setHit] = useState<{ id: number; amount: number; side: 'hero' | 'enemy'; label: string } | null>(null)
  const hitCounter = useRef(0)
  const [popup, setPopup] = useState<'bag' | 'info' | null>(null)
  const [muted, setMuted] = useState(true)
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const introTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const lock = useRef(false)

  useEffect(() => {
    try {
      const raw = localStorage.getItem(SAVE)
      if (raw) {
        const data = JSON.parse(raw) as Game
        if ([1, 2].includes(data.wave) && typeof data.hp === 'number' && typeof data.phase === 'string') {
          setG({ ...fresh(), ...data, phase: data.phase === 'enemy' ? 'fight' : data.phase })
        }
      }
    } catch { /* corrupted local save: start fresh */ }
    setReady(true)
    return () => {
      if (timer.current) clearTimeout(timer.current)
      if (introTimer.current) clearTimeout(introTimer.current)
    }
  }, [])

  useEffect(() => { if (ready) localStorage.setItem(SAVE, JSON.stringify(g)) }, [g, ready])

  const audio = (pitch = 420) => {
    if (muted || typeof window === 'undefined') return
    try {
      const Ctor = window.AudioContext
      const ctx = new Ctor()
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.type = 'triangle'
      osc.frequency.setValueAtTime(pitch, ctx.currentTime)
      osc.frequency.exponentialRampToValueAtTime(Math.max(50, pitch / 2), ctx.currentTime + .18)
      gain.gain.setValueAtTime(.085, ctx.currentTime)
      gain.gain.exponentialRampToValueAtTime(.001, ctx.currentTime + .2)
      osc.connect(gain); gain.connect(ctx.destination); osc.start(); osc.stop(ctx.currentTime + .21)
      osc.onended = () => { void ctx.close() }
    } catch { /* browser does not support audio */ }
  }
  const showHit = (amount: number, side: 'hero' | 'enemy', label = '') => {
    if (amount > 0) setHit({ id: ++hitCounter.current, amount, side, label })
  }
  const fx = (name: string) => {
    setAnim('')
    requestAnimationFrame(() => setAnim(name))
    timer.current = setTimeout(() => setAnim(''), name === 'intro' ? 1950 : 580)
  }
  const reset = () => {
    if (timer.current) clearTimeout(timer.current)
    if (introTimer.current) clearTimeout(introTimer.current)
    lock.current = false; setAnim(''); setHit(null); setPopup(null); setG(fresh())
  }

  const act = (type: Action) => {
    if (lock.current || g.phase !== 'fight') return
    if (type === 'mirror' && g.mirrorUsed || type === 'phone' && g.phoneUsed ||
        type === 'ticket' && g.ticketUsed || type === 'seal' && g.sp < 18) return
    lock.current = true
    const s: Game = { ...g, phase: 'enemy', speaker: '無名生還者' }
    let dmg = 0, skip = false, guard = false
    const base = (s.weak ? 11 : 0) + (s.weapon ? 6 : 0)
    if (type === 'attack') {
      dmg = 17 + base; s.message = '你揮動蒼藍長劍，寒光劃破黑暗！'; fx('attack'); audio()
    } else if (type === 'inspect') {
      s.weak = true; s.message = '你睇穿敵人胸口嘅檔案鎖鏈！之後攻擊永久 +11。'; fx('inspect'); audio(520)
    } else if (type === 'guard') {
      guard = true; s.sp = limit(s.sp + 7); s.message = '你打開精神護盾。受到嘅傷害大幅減少，理智 +7。'; fx('guard'); audio(300)
    } else if (type === 'seal') {
      s.sp -= 18; s.marks = 0; dmg = 32 + base + (s.level - 1) * 7
      s.message = '【遺忘者印記】紫色咒紋吞噬敵人，身上嘅身份印記被消除！'; fx('seal'); audio(720)
    } else if (type === 'mirror') {
      s.mirrorUsed = true; dmg = 28 + base; skip = true
      s.message = '鏡面碎片召喚出另一個你，同時斬擊！敵人被短暫禁錮。'; fx('mirror'); audio(620)
    } else if (type === 'phone') {
      s.phoneUsed = true; dmg = 10 + (s.weak ? 6 : 0)
      skip = [0, 2].includes((s.turn - 1) % 4)
      s.message = '舊式手機閃過蒼白光芒。' + (skip ? '敵人嘅程序被打斷！' : '敵人勉強擋住閃光。')
      fx('mirror'); audio(650)
    } else {
      s.ticketUsed = true; dmg = 13 + (s.weak ? 7 : 0)
      skip = [0, 2].includes((s.turn - 1) % 4)
      s.message = '半張染血車票燃燒起嚟。' + (skip ? '敵方身份核對失敗！' : '怪物被火焰灼傷。')
      fx('seal'); audio(580)
    }
    s.enemyHp = Math.max(0, s.enemyHp - dmg)
    showHit(dmg, 'enemy')
    if (dmg) s.message += ' 造成 ' + dmg + ' 傷害。'
    if (s.enemyHp === 0) {
      s.phase = 'won'; s.points += s.wave === 1 ? 75 : 140; s.level++
      s.message += ' 敵人倒下，戰鬥勝利！'; lock.current = false
    } else if (skip) {
      s.phase = 'fight'; s.turn++; lock.current = false
    }
    setG(s)
    if (s.phase !== 'enemy') return

    timer.current = setTimeout(() => {
      const next: Game = { ...s, speaker: enemyName(s), phase: 'fight' }
      const move = (s.turn - 1) % 4
      let hp = 0, sp = 0
      if (move === 0) {
        hp = s.wave === 1 ? 0 : 7; sp = s.wave === 1 ? 9 : 17
        next.message = '姓名核對！你嘅無名身份幫你抵擋部分精神侵蝕。'
      } else if (move === 1) {
        hp = s.wave === 1 ? 25 : 32; next.message = '敵人舉起巨刃猛烈突刺！'
      } else if (move === 2) {
        if (s.ticketUsed) { next.message = '染血車票嘅餘燼令身份檢查失效！' }
        else { hp = s.wave === 1 ? 11 : 17; sp = 10; next.marks++; next.message = '身份核對失敗！你被蓋上「待回收」標記。' }
      } else {
        hp = s.wave === 1 ? 18 : 25; sp = s.wave === 1 ? 10 : 14
        next.message = '黑暗影子包圍你，奪走生命同理智！'
      }
      if (hp) hp += next.marks * 3
      if (guard) { hp = Math.ceil(hp / 4); sp = Math.ceil(sp / 4); next.message = '防禦成功！' + next.message }
      next.hp = limit(next.hp - hp); next.sp = limit(next.sp - sp)
      showHit(hp || sp, 'hero', hp ? 'HP' : 'SP')
      next.message += ' HP −' + hp + '，SP −' + sp
      if (next.hp <= 0 || next.sp <= 0) { next.phase = 'lost'; next.message += ' 你失去意識。' }
      next.turn++
      if (hp || sp) fx('hurt')
      setG(next)
      lock.current = false
    }, 680)
  }

  const shop = (item: 'heal' | 'calm' | 'weapon') => {
    if (g.phase !== 'shop') return
    const price = item === 'weapon' ? 45 : 25
    if (g.points < price || item === 'weapon' && g.weapon) return
    if (item === 'heal' && g.hp >= 100 || item === 'calm' && g.sp >= 100) return
    setG({ ...g, points: g.points - price, hp: item === 'heal' ? limit(g.hp + 30) : g.hp,
      sp: item === 'calm' ? limit(g.sp + 25) : g.sp, weapon: item === 'weapon' ? true : g.weapon,
      message: item === 'heal' ? '已回復生命 +30。' : item === 'calm' ? '已回復理智 +25。' : '劍刃獲得永久強化，攻擊 +6。', speaker: '神秘商人' })
  }
  const nextWave = () => {
    if (g.phase !== 'shop' || lock.current) return
    lock.current = true
    setHit(null)
    fx('intro')
    setG({ ...g, phase: 'enemy', wave: 2, turn: 1, enemyHp: 145, weak: false,
      marks: 0, mirrorUsed: false, phoneUsed: false, speaker: '夜班裁定官',
      message: '「你根本唔應該通過第一關。」時鐘嘅指針開始倒轉。' })
    introTimer.current = setTimeout(() => {
      lock.current = false
      setG(prev => prev.wave === 2 && prev.phase === 'enemy' ? { ...prev, phase: 'fight' } : prev)
    }, 1900)
  }
  const full = () => {
    if (!document.fullscreenElement) document.documentElement.requestFullscreen?.().catch(() => {})
    else document.exitFullscreen?.().catch(() => {})
  }
  const actionDisabled = (type: Action) => !ready || lock.current || g.phase !== 'fight' ||
    type === 'seal' && g.sp < 18 || type === 'mirror' && g.mirrorUsed ||
    type === 'phone' && g.phoneUsed || type === 'ticket' && g.ticketUsed

  return (
    <main className="nw-game">
      <header className="nw-top">
        <div className="nw-brand"><b>∞</b> NIGHTWALKER <small>/ 無限流</small></div>
        <div className="nw-head-actions">
          <span>回合 {String(g.turn).padStart(2, '0')}</span>
          <button onClick={() => setMuted(!muted)} aria-label="音效開關">{muted ? '♪ OFF' : '♪ ON'}</button>
          <button onClick={full} aria-label="全螢幕">⛶</button>
        </div>
      </header>
      <section className={'nw-arena nw-' + anim + (g.wave === 2 ? ' nw-boss-stage' : '') + (g.phase === 'won' ? ' nw-victorious' : '')}>
        <CharacterArt boss={g.wave === 2} />
        <div className="nw-hud nw-left">
          <div className="nw-hudname"><b>無名生還者</b><small>Lv.{g.level}</small></div>
          <div className="nw-hudrow"><span>HP</span><span>{g.hp}/100</span></div>
          <div className="nw-meter"><i className="nw-life" style={{ width: g.hp + '%' }} /></div>
          <div className="nw-hudrow"><span>理智 SP</span><span>{g.sp}/100</span></div>
          <div className="nw-meter"><i className="nw-sp" style={{ width: g.sp + '%' }} /></div>
        </div>
        <div className="nw-hud nw-right">
          <div className="nw-hudname"><b>{enemyName(g)}</b><small>ELITE</small></div>
          <div className="nw-hudrow"><span>HP</span><span>{g.enemyHp}/{enemyMax(g)}</span></div>
          <div className="nw-meter"><i className="nw-enemyhp" style={{ width: 100 * g.enemyHp / enemyMax(g) + '%' }} /></div>
          <div className="nw-hudrow"><span>{g.weak ? '弱點暴露' : '弱點未知'}</span><span>印記 {g.marks}</span></div>
        </div>
        <div className="nw-vfx"><i className="nw-slash"/><i className="nw-sigil">✧</i><i className="nw-shield"/><i className="nw-beam"/><i className="nw-hit"/>
          <i className="nw-spark nw-spark-one"/><i className="nw-spark nw-spark-two"/><i className="nw-spark nw-spark-three"/>
          <div className="nw-ultimate-title">遺忘者印記 <span>FORGOTTEN SEAL</span></div>
          <div className="nw-boss-intro"><span>WARNING · CLASS D ANOMALY</span><strong>夜班裁定官</strong><small>THE MIDNIGHT ARBITER</small></div>
          {hit && <div key={hit.id} className={'nw-damage nw-damage-' + hit.side} aria-hidden="true"><small>{hit.label}</small>−{hit.amount}</div>}
        </div>
        <div className="nw-arena-bottom">
          <span>{g.wave === 1 ? 'STAGE 02 · LOST & FOUND' : 'BOSS · THE ARBITER'}</span><span className="nw-intent">⚠ {intents[g.wave - 1][(g.turn - 1) % 4]}</span>
        </div>
      </section>
      <div className="nw-credits"><strong>✦ {g.points} 積分</strong><span>遺忘者印記 Lv.{g.level}</span></div>
      <section className="nw-dialogue">
        <div className="nw-speaker-icon">◇</div><div className="nw-dialogue-content"><b>{g.speaker}</b><p>{g.message}</p></div>
      </section>
      <section className="nw-controls">
        <div className="nw-control-head"><span>▣ COMBAT COMMAND</span><span>{g.weak ? '◉ 弱點已識破 +11' : '◎ 敵方弱點：未知'}</span></div>
        <div className="nw-action-grid">
          <button disabled={actionDisabled('attack')} onClick={() => act('attack')}><b>⚔ 斬擊</b><small>{17 + (g.weak ? 11 : 0) + (g.weapon ? 6 : 0)} 傷害</small></button>
          <button disabled={actionDisabled('guard')} onClick={() => act('guard')}><b>◈ 防禦</b><small>減傷 75%</small></button>
          <button disabled={actionDisabled('inspect')} onClick={() => act('inspect')}><b>◎ 偵查</b><small>識破弱點</small></button>
          <button className="nw-ultimate" disabled={actionDisabled('seal')} onClick={() => act('seal')}><b>✧ 遺忘印記</b><small>SP −18</small></button>
          <button disabled={actionDisabled('mirror')} onClick={() => act('mirror')}><b>◇ 鏡像斬</b><small>{g.mirrorUsed ? '本場已用' : '打斷攻擊'}</small></button>
          <button onClick={() => setPopup('bag')} disabled={g.phase === 'enemy'}><b>▣ 背包</b><small>特殊道具</small></button>
        </div>
      </section>
      <footer className="nw-footer"><span>ONE SCREEN · AUTO SAVE</span><button onClick={() => setPopup('info')}>☰ 遊戲資料</button></footer>

      {(popup || ['won', 'shop', 'finished', 'lost'].includes(g.phase)) && <div className="nw-overlay">
        <div className="nw-modal">
          {popup === 'info' ? <>
            <h2>角色及系統</h2><p>永久身份：無名生還者。零號月台路線：車票 → 鏡面 → 放棄名字。</p>
            <p>生命 {g.hp}/100 · 理智 {g.sp}/100 · 積分 {g.points} · 等級 {g.level}</p>
            <p>自動存檔儲存在本機瀏覽器，清除網站資料會失去進度。</p>
            <button className="nw-secondary" onClick={reset}>重頭挑戰</button>
            <button className="nw-primary" onClick={() => setPopup(null)}>繼續遊戲</button>
          </> : popup === 'bag' ? <>
            <h2>▣ 特殊道具</h2><p>你繼承咗零號月台嘅異常物品。特殊物品有使用限制。</p>
            <div className="nw-item"><div><b>◇ 舊式手機</b><small>閃光攻擊，有機會打斷敵人</small></div><button disabled={actionDisabled('phone')} onClick={() => {setPopup(null); act('phone')}}>{g.phoneUsed ? '已用' : '使用'}</button></div>
            <div className="nw-item"><div><b>▤ 染血車票</b><small>一次性道具；反制身份核對</small></div><button disabled={actionDisabled('ticket')} onClick={() => {setPopup(null); act('ticket')}}>{g.ticketUsed ? '已用' : '使用'}</button></div>
            <div className="nw-item"><div><b>✧ 遺忘者印記</b><small>永久被動身份 · 裝備中</small></div><button disabled>已裝備</button></div>
            <button className="nw-primary" onClick={() => setPopup(null)}>返回戰鬥</button>
          </> : g.phase === 'won' ? <>
            <h2>✦ 戰鬥勝利</h2>
            <p>{g.wave === 1 ? '失物管理員崩裂成灰燼，你獲得「鏽蝕檔案鑰匙」。' : '夜班裁定官嘅時鐘停咗。你終於成功逃離收容所。'}</p>
            <p>獲得 {g.wave === 1 ? 75 : 140} 積分，永久技能已升級至 Lv.{g.level}！</p>
            <button className="nw-primary" onClick={() => {if (g.wave === 1) setG({ ...g, phase: 'shop' }); else setG({ ...g, phase: 'finished' })}}>{g.wave === 1 ? '開啟主神積分商店 →' : '查看副本結算 →'}</button>
          </> : g.phase === 'shop' ? <>
            <h2>⚒ 主神商店</h2><p>可用積分：{g.points}。第二場 Boss 前最後一次補給機會。</p>
            <div className="nw-item"><div><b>✚ 急救針劑</b><small>HP +30</small></div><button disabled={g.points < 25 || g.hp === 100} onClick={() => shop('heal')}>25 ✦</button></div>
            <div className="nw-item"><div><b>✧ 鎮魂藥劑</b><small>理智 +25</small></div><button disabled={g.points < 25 || g.sp === 100} onClick={() => shop('calm')}>25 ✦</button></div>
            <div className="nw-item"><div><b>⚔ 劍刃銘刻</b><small>攻擊永久 +6</small></div><button disabled={g.points < 45 || g.weapon} onClick={() => shop('weapon')}>{g.weapon ? '已購買' : '45 ✦'}</button></div>
            <button className="nw-primary" onClick={nextWave}>進入夜班裁定官 Boss 戰 →</button>
          </> : g.phase === 'lost' ? <>
            <h2>☠ 挑戰失敗</h2><p>{g.hp === 0 ? '生命值歸零，你成為下一份失物紀錄。' : '理智被吞噬，你再分唔清自己同倒影。'}</p>
            <button className="nw-primary" onClick={reset}>重新挑戰</button>
          </> : <>
            <h2>✦ 副本通關</h2><p>兩場戰鬥已完成。等級 {g.level}，HP {g.hp}，理智 {g.sp}，剩餘積分 {g.points}。</p>
            <p>下一個隨機副本會延續「無名生還者」嘅身份與裝備。</p>
            <button className="nw-primary" onClick={reset}>再次挑戰</button>
          </>}
        </div>
      </div>}
    </main>
  )
}
