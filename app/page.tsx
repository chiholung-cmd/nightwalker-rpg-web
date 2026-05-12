'use client'

import { useEffect, useMemo, useState } from 'react'
import { GameState, initialGameState, storyNodes } from '../lib/gameData'

const SAVE_KEY = 'nightwalker-save-v1'

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
    }
  }, [gameState, loaded])

  const currentNode = useMemo(() => {
    return storyNodes[gameState.currentNodeId] ?? storyNodes['mirror-room-01']
  }, [gameState.currentNodeId])

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
        ].slice(-20),
      }
    })
  }

  function resetGame() {
    localStorage.removeItem(SAVE_KEY)
    setGameState(initialGameState)
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
      ].slice(-20),
      currentNodeId: 'free-action-placeholder',
    }))
    setFreeAction('')
  }

  return (
    <main className="page-shell">
      <section className="game-frame">
        <header className="title-card">
          <div className="eyebrow">NIGHT PATROL TERMINAL</div>
          <h1>夜行者</h1>
          <p>手機版驚悚文字 RPG Prototype</p>
        </header>

        <section className="status-card">
          <div className="section-title">【{gameState.protagonist}】</div>
          <div className="title-line">稱號：{gameState.title}</div>

          <StatBar label="HP" value={gameState.stats.hp} tone="red" />
          <StatBar label="SAN" value={gameState.stats.san} tone="blue" />
          <StatBar label="STA" value={gameState.stats.sta} tone="green" />

          <div className="stat-grid">
            <div>污染值：{gameState.stats.pollution}%</div>
            <div>異常侵蝕：{gameState.stats.corruption}%</div>
          </div>

          <div className="tag-row">
            {gameState.status.map((item) => (
              <span className="tag" key={item}>{item}</span>
            ))}
          </div>
        </section>

        <section className="story-card">
          <div className="location-line">{currentNode.location}</div>
          <h2>{currentNode.title}</h2>
          {currentNode.text.map((paragraph, index) => (
            <p key={`${currentNode.id}-${index}`}>{paragraph}</p>
          ))}
        </section>

        <section className="choice-list">
          {currentNode.choices.map((choice) => (
            <button key={choice.id} className="choice-button" onClick={() => choose(choice.id)}>
              <strong>{choice.id}｜{choice.label}</strong>
              <span>消耗：{choice.cost}</span>
              <span>風險：{choice.risk}</span>
            </button>
          ))}
        </section>

        <section className="free-card">
          <div className="section-title">自由行動</div>
          <textarea
            value={freeAction}
            onChange={(event) => setFreeAction(event.target.value)}
            placeholder="輸入你想做的行動。例如：我叫周成砸掉天花板上的鏡子，同時把抗污染藥劑交給葉晴。"
          />
          <button className="primary-button" onClick={submitFreeAction}>提交自由行動</button>
        </section>

        <section className="info-grid">
          <Panel title="背包">
            {gameState.inventory.map((item) => <div key={item}>・{item}</div>)}
          </Panel>

          <Panel title="隊友狀態">
            {gameState.companions.map((npc) => (
              <div className="npc-row" key={npc.name}>
                <strong>{npc.name}</strong>
                <span>HP {npc.hp}｜SAN {npc.san}｜信任 {npc.trust}</span>
                <em>{npc.status}</em>
              </div>
            ))}
          </Panel>
        </section>

        <section className="history-card">
          <div className="section-title">行動紀錄</div>
          {gameState.history.length === 0 ? (
            <p>尚未開始行動。</p>
          ) : (
            gameState.history.map((item, index) => <p key={`${item}-${index}`}>#{index + 1} {item}</p>)
          )}
        </section>

        <button className="reset-button" onClick={resetGame}>重置存檔</button>
      </section>
    </main>
  )
}

function StatBar({ label, value, tone }: { label: string; value: number; tone: 'red' | 'blue' | 'green' }) {
  return (
    <div className="stat-bar-wrap">
      <div className="stat-bar-head">
        <span>{label}</span>
        <span>{value}/100</span>
      </div>
      <div className="stat-bar-bg">
        <div className={`stat-bar-fill ${tone}`} style={{ width: `${value}%` }} />
      </div>
    </div>
  )
}

function Panel({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mini-panel">
      <div className="section-title">{title}</div>
      {children}
    </section>
  )
}
