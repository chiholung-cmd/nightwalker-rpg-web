export type StatBlock = {
  hp: number
  san: number
  sta: number
  pollution: number
  corruption: number
}

export type Choice = {
  id: string
  label: string
  cost: string
  risk: string
  nextNodeId: string
  statChanges: Partial<StatBlock>
}

export type StoryNode = {
  id: string
  location: string
  title: string
  text: string[]
  choices: Choice[]
}

export type GameState = {
  protagonist: string
  title: string
  stats: StatBlock
  status: string[]
  inventory: string[]
  companions: {
    name: string
    hp: number
    san: number
    trust: number
    status: string
  }[]
  currentNodeId: string
  history: string[]
}

export const initialGameState: GameState = {
  protagonist: '林夜',
  title: '仍然選擇活下去的人',
  stats: {
    hp: 84,
    san: 61,
    sta: 73,
    pollution: 18,
    corruption: 12,
  },
  status: ['十三號線標記', '鏡像污染：輕微'],
  inventory: ['深藍車票', '夜巡局工牌', '制靈槍：6/6', '抗污染藥劑 x1'],
  companions: [
    { name: '周成', hp: 91, san: 54, trust: 72, status: '戒備' },
    { name: '葉晴', hp: 67, san: 39, trust: 61, status: '鏡像侵蝕' },
  ],
  currentNodeId: 'mirror-room-01',
  history: [],
}

export const storyNodes: Record<string, StoryNode> = {
  'mirror-room-01': {
    id: 'mirror-room-01',
    location: '夜巡局醫療層｜02:14',
    title: '鏡中人：病房封鎖',
    text: [
      '病房內所有鏡子正在滲血。',
      '葉晴站在病床旁，身後的鏡子裡，另一個「她」正慢慢露出笑容。',
      '周成握緊制靈刀，刀身上的紅色紋路像血管一樣跳動。',
      '你發現病房的門不知道甚麼時候已經消失，只剩一面巨大的黑色鏡子。',
      '鏡中的葉晴輕聲說：「讓我出來，她就不用再痛苦了。」',
    ],
    choices: [
      {
        id: 'A',
        label: '衝向葉晴，把她從鏡前拉開',
        cost: 'STA -15',
        risk: 'HP風險：高｜可能被鏡手刺傷',
        nextNodeId: 'mirror-room-save',
        statChanges: { sta: -15, hp: -8, pollution: 4 },
      },
      {
        id: 'B',
        label: '觀察鏡中規則，尋找真正本體',
        cost: 'SAN -8',
        risk: '污染風險：中｜可能看見不該看的畫面',
        nextNodeId: 'mirror-room-observe',
        statChanges: { san: -8, pollution: 6 },
      },
      {
        id: 'C',
        label: '拔出制靈槍，壓制最近的鏡面',
        cost: '制靈彈 -1｜STA -8',
        risk: '命中失敗會激怒鏡中人',
        nextNodeId: 'mirror-room-shot',
        statChanges: { sta: -8, san: -3 },
      },
      {
        id: 'D',
        label: '自由輸入行動',
        cost: 'AI判定',
        risk: '根據行動動態計算',
        nextNodeId: 'free-action-placeholder',
        statChanges: {},
      },
    ],
  },
  'mirror-room-save': {
    id: 'mirror-room-save',
    location: '夜巡局醫療層｜鏡中人事件',
    title: '鏡手穿刺',
    text: [
      '你衝向葉晴，在鏡手碰到她之前將她推開。',
      '下一秒，一隻冰冷蒼白的手臂刺入你的肩膀。劇痛像鐵釘般貫穿神經。',
      '葉晴抬頭看著你，眼神第一次出現明顯動搖。',
      '周成怒吼一聲，制靈刀斬碎三面鏡子，黑色血水濺滿牆壁。',
      '鏡中葉晴的笑容消失了。她似乎沒有預料到你會選擇直接受傷。',
    ],
    choices: [
      {
        id: 'A',
        label: '忍痛拔出鏡手，反手抓住它',
        cost: 'HP -6｜STA -12',
        risk: '可鎖定鏡中人本體，但有重傷風險',
        nextNodeId: 'mirror-room-01',
        statChanges: { hp: -6, sta: -12, pollution: 3 },
      },
      {
        id: 'B',
        label: '命令周成斬斷鏡手',
        cost: '周成STA -10｜信任 +2',
        risk: '鏡中人可能轉向攻擊周成',
        nextNodeId: 'mirror-room-01',
        statChanges: { san: -2 },
      },
      {
        id: 'C',
        label: '把抗污染藥劑交給葉晴',
        cost: '抗污染藥劑 -1',
        risk: '你自己將失去短期保命道具',
        nextNodeId: 'mirror-room-01',
        statChanges: { san: 4 },
      },
      {
        id: 'D',
        label: '自由輸入行動',
        cost: 'AI判定',
        risk: '根據行動動態計算',
        nextNodeId: 'free-action-placeholder',
        statChanges: {},
      },
    ],
  },
  'mirror-room-observe': {
    id: 'mirror-room-observe',
    location: '夜巡局醫療層｜鏡中人事件',
    title: '規則觀測',
    text: [
      '你強迫自己看向每一面鏡子。',
      '鏡中不只是葉晴，還有很多被替代過的人。',
      '你看見一條規則：鏡中人不能直接殺死本體，只能讓本體主動放棄。',
      '這不是單純殺戮異常，而是人格替代型異常。',
      '葉晴真正危險的地方，不在鏡子，而在她自己開始相信鏡中的自己比較值得活下去。',
    ],
    choices: [
      {
        id: 'A',
        label: '把觀測結果告訴葉晴',
        cost: 'SAN -3',
        risk: '可能刺激她的創傷',
        nextNodeId: 'mirror-room-01',
        statChanges: { san: -3 },
      },
      {
        id: 'B',
        label: '要求周成停止攻擊鏡子',
        cost: '無',
        risk: '鏡手數量會增加',
        nextNodeId: 'mirror-room-01',
        statChanges: { pollution: 2 },
      },
      {
        id: 'C',
        label: '嘗試與鏡中葉晴談判',
        cost: 'SAN -6｜污染 +5',
        risk: '高危心理對話',
        nextNodeId: 'mirror-room-01',
        statChanges: { san: -6, pollution: 5 },
      },
      {
        id: 'D',
        label: '自由輸入行動',
        cost: 'AI判定',
        risk: '根據行動動態計算',
        nextNodeId: 'free-action-placeholder',
        statChanges: {},
      },
    ],
  },
  'mirror-room-shot': {
    id: 'mirror-room-shot',
    location: '夜巡局醫療層｜鏡中人事件',
    title: '制靈槍響',
    text: [
      '你拔出制靈槍，槍口對準最近的鏡面。',
      '砰的一聲，紅色符紋彈打穿鏡子。',
      '鏡面沒有碎裂，而是像皮膚一樣凹陷，裡面傳出尖叫。',
      '病房牆壁開始流出黑水，鏡中葉晴轉頭望向你。',
      '「你真的以為，暴力能救她嗎？」',
    ],
    choices: [
      {
        id: 'A',
        label: '連續射擊，強行壓制',
        cost: '制靈彈 -2｜STA -12',
        risk: '可能導致病房崩塌',
        nextNodeId: 'mirror-room-01',
        statChanges: { sta: -12, san: -4 },
      },
      {
        id: 'B',
        label: '停止射擊，改為保護葉晴',
        cost: 'STA -8',
        risk: '鏡中人會趁機接近',
        nextNodeId: 'mirror-room-01',
        statChanges: { sta: -8 },
      },
      {
        id: 'C',
        label: '讓周成補刀，形成交叉壓制',
        cost: '周成STA -15',
        risk: '周成受傷機率上升',
        nextNodeId: 'mirror-room-01',
        statChanges: { pollution: 2 },
      },
      {
        id: 'D',
        label: '自由輸入行動',
        cost: 'AI判定',
        risk: '根據行動動態計算',
        nextNodeId: 'free-action-placeholder',
        statChanges: {},
      },
    ],
  },
  'free-action-placeholder': {
    id: 'free-action-placeholder',
    location: '系統提示',
    title: '自由行動尚未接入AI',
    text: [
      '自由輸入行動會在接入 Poe API 後啟用。',
      '目前版本先以固定選項測試 RPG UI、數值變化與存檔系統。',
    ],
    choices: [
      {
        id: 'A',
        label: '返回上一個危機節點',
        cost: '無',
        risk: '無',
        nextNodeId: 'mirror-room-01',
        statChanges: {},
      },
    ],
  },
}
