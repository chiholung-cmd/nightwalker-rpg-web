'use client'

import { useEffect, useMemo, useState } from 'react'
import { GameState, initialGameState, storyNodes } from '../lib/gameData'

const SAVE_KEY = 'nightwalker-save-v2'

function clamp(value: number, min = 0, max = 100) {
  return Math.max(min, Math.min(max, value))
}

function applyStatChanges(state: GameState, changes: Partial<GameState['stats']>): GameState {
  return {
    ...state,
    stats: {
      hp: clamp(state.stats.hp + (changes.hp ?? 0)),
      san: clamp(state.stats.san + (changes.san ?? 0)),
      sta: clamp(state.stats.sta + (changes.sta ?? 0)),
      pollution: clamp(state.stats.pollution + (changes.pollution ?? 0)),
      corruption: clamp(state.stats.corruption + (changes.corruption ?? 0)),
    },
  }
}

export default function HomePage() {
  const [gameState, setGameState] = useState<GameState>(initialGameState)
  const [freeAction, setFreeAction] = useState('')
  const [loaded, setLoaded] = useState(false)
  const [dialogueIndex, setDialogueIndex] = useState(0)
  const [seedStatus, setSeedStatus] = useState('')

  useEffect(() => {
    const saved = localStorage.getItem(SAVE_KEY)
    if (saved) {
      try {
        setGameState(JSON.parse(saved))
      } catch {
        setGameState(initialGameState)
      }
    }
    setLoaded(true)
  }, [])

  useEffect(() => {
    if (loaded) {
      localStorage.setItem(SAVE_KEY, JSON.stringify(gameState))
      fetch('/api/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(gameState),
      }).catch(() => undefined)
    }
  }, [gameState, loaded])

  const currentNode = useMemo(() => {
    return storyNodes[gameState.currentNodeId] ?? storyNodes['mirror-room-01']
  }, [gameState.currentNodeId])

  const activeText = currentNode.text[Math.min(dialogueIndex, currentNode.text.length - 1)]
  const canAdvance = dialogueIndex < currentNode.text.length - 1
  const isDanger = gameState.stats.san <= 45 || gameState.stats.pollution >= 45

  function advanceDialogue() {
    if (canAdvance) setDialogueIndex((value) => value + 1)
  }

  function choose(choiceId: string) {
    const choice = currentNode.choices.find((item) => item.id === choiceId)
    if (!choice) return

    setGameState((prev) => {
      const next = applyStatChanges(prev, choice.statChanges)
      return {
        ...next,
        currentNodeId: choice.nextNodeId,
        history: [
          ...prev.history,
          `${currentNode.title} → ${choice.id}｜${choice.label}`,
        ].slice(-30),
      }
    })
    setDialogueIndex(0)
  }

  function resetGame() {
    localStorage.removeItem(SAVE_KEY)
    setGameState(initialGameState)
    setDialogueIndex(0)
  }

  function submitFreeAction() {
    if (!freeAction.trim()) return

    setGameState((prev) => ({
      ...prev,
      stats: {
        ...prev.stats,
        san: clamp(prev.stats.san - 2),
        sta: clamp(prev.stats.sta - 3),
      },
      history: [
        ...prev.history,
        `自由行動｜${freeAction.trim()}`,
      ].slice(-30),
      currentNodeId: 'free-action-placeholder',
    }))
    setDialogueIndex(0)
    setFreeAction('')
  }

  async function seedDatabase() {
    setSeedStatus('同步中...')
    try {
      const response = await fetch('/api/seed', { method: 'POST' })
      const data = await response.json()
      setSeedStatus(data.success ? 'MongoDB 已寫入夜行者世界資料' : '同步失敗')
    } catch {
      setSeedStatus('同步失敗')
    }
  }

  return (
    <main className={`rpg-screen ${isDanger ? 'san-danger' : ''}`}>
      <div className="scene-bg">
        <div className="scene-fog" />
        <div className="scene-grid" />
      </div>

      <header className="top-hud">
        <div>
          <div className="hud-kicker">NIGHTWALKER OS</div>
          <div className="hud-title">鏡中人事件</div>
        </div>
        <div className="hud-status">{currentNode.location}</div>
      </header>

      <section className="cinema-stage">
        <div className="character-card left">
          <div className="portrait-fake linye">林夜</div>
          <div className="char-name">林夜</div>
          <div className="char-role">半死人 / 共鳴者</div>
        </div>

        <div className="battle-center">
          <div className="boss-card">
            <div className="boss-label">異常威脅</div>
            <div className="boss-name">鏡中人</div>
            <div className="boss-phase">Phase 1｜鏡手增殖</div>
            <div className="boss-bar"><span style={{ width: `${Math.min(100, gameState.stats.pollution + gameState.stats.corruption + 35)}%` }} /></div>
          </div>
        </div>

        <div className="character-card right">
          <div className="portrait-fake yeqing">葉晴</div>
          <div className="char-name">葉晴</div>
          <div className="char-role">靈視觀測者 / 鏡像侵蝕</div>
        </div>
      </section>

      <section className="player-hud">
        <StatPill label="HP" value={gameState.stats.hp} />
        <StatPill label="SAN" value={gameState.stats.san} />
        <StatPill label="STA" value={gameState.stats.sta} />
        <StatPill label="污染" value={gameState.stats.pollution} suffix="%" />
      </section>

      <section className="vn-panel" onClick={advanceDialogue}>
        <div className="speaker-row">
          <div>
            <div className="speaker-name">{currentNode.title}</div>
            <div className="speaker-sub">點擊對話框繼續文字</div>
          </div>
          {isDanger && <div className="risk-badge">SAN WARNING</div>}
        </div>
        <p className="dialogue-text">{activeText}</p>
        {canAdvance && <div className="continue-mark">▼</div>}
      </section>

      {!canAdvance && (
        <section className="choice-deck">
          {currentNode.choices.map((choice) => (
            <button key={choice.id} className="rpg-choice" onClick={() => choose(choice.id)}>
              <div className="choice-id">{choice.id}</div>
              <div className="choice-main">
                <strong>{choice.label}</strong>
                <span>消耗：{choice.cost}</span>
                <span>風險：{choice.risk}</span>
              </div>
            </button>
          ))}
        </section>
      )}

      <section className="bottom-panels">
        <div className="mini-rpg-panel">
          <b>隊友</b>
          {gameState.companions.map((npc) => (
            <span key={npc.name}>{npc.name}｜HP {npc.hp}｜SAN {npc.san}｜{npc.status}</span>
          ))}
        </div>
        <div className="mini-rpg-panel">
          <b>背包</b>
          <span>{gameState.inventory.join(' / ')}</span>
        </div>
      </section>

      <section className="free-action-dock">
        <textarea
          value={freeAction}
          onChange={(event) => setFreeAction(event.target.value)}
          placeholder="自由行動：例如『我打碎輸液瓶反射鏡面，叫周成掩護葉晴撤離』"
        />
        <button onClick={submitFreeAction}>提交行動</button>
      </section>

      <section className="dev-dock">
        <button onClick={seedDatabase}>同步過往世界資料到 MongoDB</button>
        <button onClick={resetGame}>重置</button>
        {seedStatus && <span>{seedStatus}</span>}
      </section>
    </main>
  )
}

function StatPill({ label, value, suffix = '' }: { label: string; value: number; suffix?: string }) {
  return (
    <div className="stat-pill">
      <span>{label}</span>
      <b>{value}{suffix}</b>
    </div>
  )
}
