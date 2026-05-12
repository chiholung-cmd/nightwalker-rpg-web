import { Choice, GameState, StatBlock } from './gameData'

export function clamp(value: number, min = 0, max = 100) {
  return Math.max(min, Math.min(max, value))
}

export function applyStatChanges(
  state: GameState,
  changes: Partial<StatBlock>,
): GameState {
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

export function getDangerLevel(state: GameState) {
  if (state.stats.hp <= 20) return '瀕死'
  if (state.stats.san <= 25) return '精神崩潰邊緣'
  if (state.stats.pollution >= 70) return '高度污染'
  if (state.stats.corruption >= 70) return '異常侵蝕嚴重'
  return '可行動'
}

export function getSystemWarnings(state: GameState): string[] {
  const warnings: string[] = []

  if (state.stats.hp <= 30) warnings.push('生命值過低：受擊可能導致重傷或死亡。')
  if (state.stats.san <= 35) warnings.push('理智值過低：可能出現幻聽、幻覺或錯誤選項。')
  if (state.stats.sta <= 25) warnings.push('體力不足：高消耗行動可能失敗。')
  if (state.stats.pollution >= 50) warnings.push('污染加深：異常更容易注意到你。')
  if (state.stats.corruption >= 50) warnings.push('異常侵蝕上升：身體與認知可能改變。')

  return warnings
}

export function resolveChoice(
  state: GameState,
  nodeTitle: string,
  choice: Choice,
): GameState {
  const next = applyStatChanges(state, choice.statChanges)

  return {
    ...next,
    currentNodeId: choice.nextNodeId,
    history: [
      ...state.history,
      `${nodeTitle} → ${choice.id}｜${choice.label}`,
    ].slice(-20),
  }
}
