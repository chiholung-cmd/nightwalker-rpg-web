'use client'
import {useEffect,useMemo,useState} from 'react'
import type {Entry,EmotionMood} from '../lib/nightwalkerGame'

export type Beat={kind:'narration'|'dialogue'|'system'|'impact';text:string;speaker?:string;mood:EmotionMood;prelude?:string}
type Props={
 entries:Entry[];turn:number;worldName:string;location:string;genre:string;
 reduced:boolean;large:boolean;characters:string[];onPlaybackChange:(finished:boolean)=>void
}
const MOOD_LABELS:Record<EmotionMood,string>={
 calm:'平靜探索',suspense:'懸疑',shock:'驚嚇',grief:'悲傷',
 anger:'憤怒',eerie:'詭異',resolve:'決意',system:'主神系統'
}
const MOOD_CODES:Record<EmotionMood,string>={
 calm:'NATURAL REVEAL',suspense:'DELAYED DISCLOSURE',shock:'SILENCE / IMPACT',
 grief:'SLOW DISSOLVE',anger:'ERASE / REWRITE',eerie:'MEMORY REWRITE',
 resolve:'DETERMINED REVEAL',system:'TERMINAL SCAN'
}
const validMoods:EmotionMood[]=['calm','suspense','shock','grief','anger','eerie','resolve','system']
const moodFor=(value:unknown,fallback:EmotionMood='calm'):EmotionMood=>
 validMoods.includes(value as EmotionMood)?value as EmotionMood:fallback
const parts=(text:string)=>text.replace(/\r\n/g,'\n').split(/\n\s*\n|\n/).map(x=>x.trim()).filter(Boolean)

/** Previously saved narrative is split into staged dialogue once, without duplicating the quote. */
export function sceneBeats(entries:Entry[],characters:string[]):Beat[]{
 const output:Beat[]=[]
 function narration(text:string,kind:Beat['kind']='narration',mood:EmotionMood='calm'){
  const sentences=text.match(/[^。！？!?]+[。！？!?]+[」』]?|[^。！？!?]+$/g)||[text]
  let line=''
  for(const part of sentences){
   const sentence=part.trim()
   if(line&&line.length+sentence.length>90){output.push({kind,text:line,mood});line=sentence}
   else line+=sentence
  }
  if(line.trim())output.push({kind,text:line.trim(),mood})
 }
 for(const entry of entries){
  if(entry.kind==='choice')continue
  const kind=entry.kind==='combat'?'impact':entry.kind==='system'?'system':entry.kind==='dialogue'?'dialogue':'narration'
  const mood=moodFor(entry.mood,kind==='system'?'system':kind==='impact'?'shock':'calm')
  if(kind==='dialogue'){
   output.push({kind:'dialogue',speaker:entry.speaker||'人物對話',
    text:entry.text.replace(/^[「“]|[」”]$/g,'').trim(),mood,prelude:entry.prelude})
   continue
  }
  if(kind==='system'){
   for(const text of parts(entry.text))output.push({kind,text,mood:'system'})
   continue
  }
  // An explicit emotional rewrite is one indivisible beat: never split its false/true text.
  if(entry.prelude&&(mood==='eerie'||mood==='anger')){
   output.push({kind,text:entry.text,mood,prelude:entry.prelude})
   continue
  }
  for(const paragraph of parts(entry.text)){
   if(/^【(?:主神|系統|警告|任務|提示)/.test(paragraph)){
    output.push({kind:'system',text:paragraph,mood:'system'})
    continue
   }
   const tokens=paragraph.split(/(「[^」]{2,160}」)/g).filter(Boolean)
   let prefix=''
   for(const token of tokens){
    if(token.startsWith('「')&&token.endsWith('」')){
     const known=[...characters].sort((a,b)=>b.length-a.length).find(name=>name&&prefix.includes(name))
     const named=prefix.match(/([\u3400-\u9fff]{2,6})(?:低聲|輕聲|忽然|冷冷|沉聲)?(?:說|問|喊|答道|開口|提醒|叫道|低語)[^。！？]{0,18}[：:]?\s*$/)
     output.push({kind:'dialogue',speaker:known||named?.[1]||'人物對話',text:token.slice(1,-1),mood})
     prefix=''
    }else{
     narration(token,kind,mood)
     prefix+=token
    }
   }
  }
 }
 return output.filter(beat=>beat.text.length>0).slice(0,30)
}

/** A new AI turn starts at its latest choice marker; a combat roll starts at the combat marker.
 *  This prevents replaying the previous turn when the AI returns several emotion-tagged beats. */
export function currentScene(entries:Entry[]):Entry[]{
 const lastChoice=entries.findLastIndex(e=>e.kind==='choice')
 const lastCombat=entries.findLastIndex(e=>e.kind==='combat')
 const marker=Math.max(lastChoice,lastCombat)
 if(marker>=0)return entries.slice(marker)
 const latestNarration=entries.findLastIndex(e=>e.kind==='narration'||e.kind==='dialogue'||e.kind==='system')
 return entries.slice(Math.max(0,latestNarration))
}

export default function NightwalkerStage({entries,turn,worldName,location,genre,reduced,large,characters,onPlaybackChange}:Props){
 const scene=currentScene(entries)
 const sceneId=String(turn)+'-'+scene.map(x=>String(x.id)+':'+x.kind+':'+x.text).join('|')
 const characterKey=characters.join('|')
 const beats=useMemo(()=>sceneBeats(scene,characters),[sceneId,characterKey])
 const [index,setIndex]=useState(0)
 const [visible,setVisible]=useState(0)
 const [phase,setPhase]=useState<'pause'|'prelude'|'typing'|'rewrite'|'complete'>('typing')
 const [skipped,setSkipped]=useState(false)
 const current=beats[Math.min(index,Math.max(0,beats.length-1))]
 const letters=Array.from(current?.text||'')
 const preview=Array.from(current?.prelude||'')
 const textComplete=Boolean(current&&visible>=letters.length)
 const finished=Boolean(beats.length&&index===beats.length-1&&phase==='complete')
 const typing=Boolean(current&&phase!=='complete')
 const speaker=current?.speaker||'人物對話'
 useEffect(()=>{setIndex(0);setVisible(0);setPhase('typing');setSkipped(false)},[sceneId])
 useEffect(()=>{
  if(!current)return
  if(reduced||skipped){setVisible(letters.length);setPhase('complete');return}
  setVisible(0)
  setPhase(current.mood==='shock'||current.mood==='grief'?'pause':
   (current.prelude&&(current.mood==='eerie'||current.mood==='anger'))?'prelude':'typing')
 // eslint-disable-next-line react-hooks/exhaustive-deps
 },[sceneId,index,current?.mood,current?.prelude,reduced,skipped])
 useEffect(()=>{
  if(!current||reduced||phase==='complete')return
  if(phase==='pause'){
   const t=window.setTimeout(()=>{
    setVisible(current.mood==='shock'||current.mood==='grief'?letters.length:0)
    setPhase(current.mood==='shock'||current.mood==='grief'?'complete':'typing')
   },current.mood==='shock'?950:1250)
   return ()=>window.clearTimeout(t)
  }
  if(phase==='prelude'){
   const t=window.setTimeout(()=>{setVisible(0);setPhase('rewrite')},current.mood==='anger'?1150:1650)
   return ()=>window.clearTimeout(t)
  }
  if(visible>=letters.length){
   const t=window.setTimeout(()=>setPhase('complete'),current.mood==='grief'?1150:200)
   return ()=>window.clearTimeout(t)
  }
  const speed=current.mood==='suspense'?52:current.mood==='resolve'?27:
   current.mood==='system'?16:phase==='rewrite'?29:24
  const prev=letters[visible-1]
  const stop=current.mood==='suspense'&&/[。！？……，、]/.test(prev||'')?310:0
  const t=window.setTimeout(()=>setVisible(v=>Math.min(letters.length,v+(current.mood==='resolve'?2:1))),speed+stop)
  return ()=>window.clearTimeout(t)
 },[sceneId,index,phase,visible,current?.text,current?.mood,reduced])
 useEffect(()=>{onPlaybackChange(finished)},[finished,onPlaybackChange])
 const advance=()=>{
  if(!current)return
  if(phase!=='complete'){setVisible(letters.length);setPhase('complete');return}
  if(index<beats.length-1){setIndex(i=>i+1);setVisible(0)}
 }
 const skip=()=>{
  if(!beats.length)return
  setSkipped(true);setIndex(beats.length-1);setVisible(Array.from(beats[beats.length-1].text).length);setPhase('complete')
 }
 const newestChoice=scene.find(x=>x.kind==='choice'&&!x.text.startsWith('【'))
 const mode=current?.mood||'calm'
 const hasRewrite=Boolean(current?.prelude&&(mode==='anger'||mode==='eerie'))
 const showOld=hasRewrite&&(phase==='prelude'||phase==='rewrite')
 const showReal=!hasRewrite||phase==='rewrite'||phase==='complete'
 const revealed=phase==='complete'||textComplete
 return <div className={'nw-cinema genre-'+genre+(large?' is-large':'')+' nw-emotion-'+mode} aria-label="互動劇情演出">
  <div className="nw-cinema-atmos" aria-hidden="true"><span className="nw-cinema-ring"/><span className="nw-cinema-glow"/><span className="nw-cinema-grain"/></div>
  <div className="nw-cinema-bar"><span><i className="nw-cinema-live"/>輪迴場景 · {String(turn).padStart(2,'0')}</span>
   <button type="button" onClick={skip} disabled={finished||beats.length<2}>跳過演出 <span aria-hidden="true">»</span></button></div>
  <div className="nw-cinema-location"><span>目前場景</span><strong>{location||worldName}</strong></div>
  {newestChoice&&<p className="nw-cinema-last"><small>你的行動</small>{newestChoice.text.length>62?newestChoice.text.slice(0,62)+'…':newestChoice.text}</p>}
  <div className="nw-cinema-focus">
   {current&&<div className={'nw-cinema-panel '+current.kind+' emotion-'+mode+' phase-'+phase} key={sceneId+'-'+index}>
    <div className="nw-cinema-kind">{current.kind==='system'?'主神訊息':current.kind==='dialogue'?'角色對話':current.kind==='impact'?'危機時刻':'故事進行中'}
     <span>{String(index+1).padStart(2,'0')} / {String(beats.length).padStart(2,'0')}</span></div>
    <div className="nw-cinema-mood"><span className="nw-cinema-mood-signal" aria-hidden="true"/>{MOOD_LABELS[mode]}<span>{MOOD_CODES[mode]}</span></div>
    {current.kind==='dialogue'&&<div className="nw-cinema-speaker"><span aria-hidden="true">◈</span>{speaker}</div>}
    {mode==='system'&&<div className="nw-emotion-scan" aria-hidden="true"/>}
    <div className="nw-cinema-lines" aria-live={phase==='complete'?'polite':'off'}>
     {showOld&&<p className={'nw-cinema-line nw-emotion-old'+(phase==='rewrite'?' fading':'')}>
      {current.kind==='dialogue'?'「':''}{preview.join('')}{current.kind==='dialogue'?'」':''}</p>}
     {showReal&&<p className={'nw-cinema-line nw-emotion-line'+(revealed?' revealed':'')+(mode==='shock'&&revealed?' impacted':'')}>
      {current.kind==='dialogue'?'「':''}{(phase==='pause'&&!reduced?'':letters.slice(0,visible).join(''))}
      {current.kind==='dialogue'&&revealed?'」':''}
      {typing&&phase!=='pause'&&phase!=='prelude'&&phase!=='complete'&&<span className="nw-cinema-caret" aria-hidden="true"/>}
     </p>}
    </div>
   </div>}
  </div>
  <button className={'nw-cinema-advance'+(finished?' complete':'')} type="button" onClick={advance} disabled={finished||!current}>
   <span>{typing?'點擊顯示完整文字':finished?'這一幕結束 · 請決定下一步':'點擊繼續劇情'}</span>
   <span aria-hidden="true">{finished?'◇':typing?'…':'⌄'}</span>
  </button>
  <div className="nw-cinema-progress" aria-hidden="true"><span style={{width:(beats.length?(100*(index+(phase==='complete'?1:visible/Math.max(1,letters.length)))/beats.length):0)+'%'}}/></div>
 </div>
}
