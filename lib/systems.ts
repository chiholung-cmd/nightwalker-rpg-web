import { GameState } from './gameData'

export type Skill = {
  id: string
  name: string
  type: '戰鬥' | '精神' | '異常' | '生存' | '特殊'
  level: number
  description: string
}

export type Equipment = {
  id: string
  name: string
  slot: '武器' | '防具' | '異常道具' | '消耗品'
  description: string
  quantity?: number
}

export type Bloodline = {
  id: string
  name: string
  stage: number
  description: string
  risk: string
}

export type BattlePhase = {
  phase: number
  name: string
  bossHp: number
  rule: string
}

export const skills: Skill[] = [
  { id: 'talk', name: '異常對話', type: '精神', level: 2, description: '以語言干擾異常邏輯，對人格型異常特別有效。' },
  { id: 'rule-scan', name: '規則觀測', type: '精神', level: 1, description: '觀察鬼域規則，但會消耗SAN。' },
  { id: 'spirit-gun', name: '制靈槍術', type: '戰鬥', level: 1, description: '使用夜巡局制式武器壓制低至中階異常。' },
  { id: 'reject-fate', name: '拒絕命運', type: '特殊', level: 1, description: '面對高位同化時，保留自我意志。' },
]

export const equipment: Equipment[] = [
  { id: 'gun', name: '制靈槍', slot: '武器', description: '夜巡局外勤制式武器，目前彈數6/6。' },
  { id: 'ticket', name: '深藍車票', slot: '異常道具', description: '十三號線留下的車票，會在凌晨更新站名。' },
  { id: 'medicine', name: '抗污染藥劑', slot: '消耗品', quantity: 1, description: '短暫降低精神污染，但副作用未知。' },
]

export const bloodlines: Bloodline[] = [
  { id: 'human', name: '人類', stage: 1, description: '仍以人類身份行動。', risk: '力量有限，但心智較穩定。' },
  { id: 'resonator', name: '異常共鳴者', stage: 1, description: '能感受異常邏輯與執念。', risk: '更容易被高位存在注意。' },
]

export const mirrorBattlePhases: BattlePhase[] = [
  { phase: 1, name: '鏡手增殖', bossHp: 100, rule: '鏡中人不能直接殺死本體，只能迫使本體放棄。' },
  { phase: 2, name: '人格替代', bossHp: 70, rule: '葉晴SAN低於30時，替代進度加速。' },
  { phase: 3, name: '鏡界展開', bossHp: 40, rule: '所有反射物都可能成為入口。' },
]

export function getDerivedState(state: GameState) {
  const critical = state.stats.hp <= 25 || state.stats.san <= 30
  const distorted = state.stats.san <= 40 || state.stats.pollution >= 50
  const corrupted = state.stats.corruption >= 45

  return {
    danger: critical ? '極危' : distorted ? '不穩定' : '可行動',
    distorted,
    corrupted,
    mirrorThreat: Math.min(100, state.stats.pollution + state.stats.corruption),
  }
}
