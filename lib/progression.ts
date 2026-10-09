import type { SaveState } from './infiniteStory'

export type TalentId = 'vitality' | 'composure' | 'insight' | 'mirror'
export const TALENTS: { id: TalentId; title: string; icon: string; description: string; max: number }[] = [
  { id:'vitality', title:'生命錨點', icon:'✚', description:'每級最大生命 +15，並立即回復 15 HP', max:3 },
  { id:'composure', title:'精神屏障', icon:'◇', description:'每級最大理智 +12，並立即回復 12 SP', max:3 },
  { id:'insight', title:'真相視界', icon:'◎', description:'每級調查/戰鬥偵查額外增傷 5；Lv.1 解鎖特殊對話', max:3 },
  { id:'mirror', title:'鏡域共鳴', icon:'✧', description:'每級鏡像斬額外 +8 傷害；Lv.1 解鎖鏡域對話', max:3 }
]
export type Progress = { level: number; xp: number; talentPoints: number; talents: Record<TalentId, number> }
export const DEFAULT_PROGRESS: Progress = {
  level:1, xp:0, talentPoints:0,
  talents:{ vitality:0, composure:0, insight:0, mirror:0 }
}
export function withProgress<T extends SaveState>(state:T):T {
  const raw = (state as T & Partial<Progress>)
  const talents = {...DEFAULT_PROGRESS.talents,...(raw.talents || {})}
  return {...raw,level:raw.level ?? 1,xp:raw.xp ?? 0,talentPoints:raw.talentPoints ?? 0,talents} as T
}
export const xpToNext=(level:number)=>50+level*25
export const maxHp=(state:SaveState)=>100 + (state.talents?.vitality || 0)*15
export const maxSp=(state:SaveState)=>100 + (state.talents?.composure || 0)*12
export const talentRank=(state:SaveState, id:TalentId)=>state.talents?.[id] || 0
export function awardXp<T extends SaveState>(state:T, amount:number):T {
  const p=withProgress(state)
  if(amount<=0)return p
  let xp=p.xp+amount,level=p.level,points=p.talentPoints
  while(xp>=xpToNext(level)&&level<30){
    xp-=xpToNext(level); level+=1; points+=1
  }
  return {...p,xp,level,talentPoints:points} as T
}
export function spendTalent<T extends SaveState>(state:T, id:TalentId):T {
  const p=withProgress(state),rank=p.talents[id],max=TALENTS.find(t=>t.id===id)?.max||0
  if(p.talentPoints<1||rank>=max)return p
  const talents={...p.talents,[id]:rank+1}
  return {...p,talentPoints:p.talentPoints-1,talents,
    hp: id==='vitality' ? p.hp+15:p.hp,
    sp: id==='composure'?p.sp+12:p.sp,
    journal:['已解鎖天賦：「'+TALENTS.find(t=>t.id===id)?.title+'」Lv.'+(rank+1),...p.journal].slice(0,30)
  } as T
}
export function combatDamage(state:SaveState,move:'attack'|'seal'|'mirror',weak:boolean){
  const base=move==='attack'?19:move==='seal'?35:29
  return base + (weak?9+talentRank(state,'insight')*5:0) +
    (move==='mirror'?talentRank(state,'mirror')*8:0) +
    (state.items.includes('時裂長刃')?6:0)
}
