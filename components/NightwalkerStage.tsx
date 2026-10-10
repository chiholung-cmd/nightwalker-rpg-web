'use client'
import {useEffect,useMemo,useState} from 'react'
import type {Entry} from '../lib/nightwalkerGame'

type Beat={kind:'narration'|'dialogue'|'system'|'impact';text:string;speaker?:string}
type Props={
 entries:Entry[];turn:number;worldName:string;location:string;genre:string;
 reduced:boolean;large:boolean;characters:string[];onPlaybackChange:(finished:boolean)=>void
}
const parts=(text:string)=>text.replace(/\r\n/g,'\n').split(/\n\s*\n|\n/).map(x=>x.trim()).filter(Boolean)

// Keep dialogue inside the narrative, but stage the voice as its own dramatic beat.
// Unlike the old dialogue array, extracted quotes are never printed twice.
export function sceneBeats(entries:Entry[],characters:string[]):Beat[]{
 const output:Beat[]=[]
 function narration(text:string,kind:Beat['kind']='narration'){
  const sentences=text.match(/[^。！？!?]+[。！？!?]+[」』]?|[^。！？!?]+$/g)||[text]
  let line=''
  for(const part of sentences){
   const sentence=part.trim()
   if(line&&line.length+sentence.length>82){output.push({kind,text:line});line=sentence}
   else line+=sentence
  }
  if(line.trim())output.push({kind,text:line.trim()})
 }
 for(const entry of entries){
  if(entry.kind==='dialogue'){
   output.push({kind:'dialogue',speaker:entry.speaker||'人物對話',text:entry.text.replace(/^[「“]|[」”]$/g,'').trim()})
   continue
  }
  const kind=entry.kind==='combat'?'impact':'narration'
  for(const paragraph of parts(entry.text)){
   if(/^【(?:主神|系統|警告|任務|提示)/.test(paragraph)){output.push({kind:'system',text:paragraph});continue}
   const tokens=paragraph.split(/(「[^」]{2,160}」)/g).filter(Boolean)
   let prefix=''
   for(const token of tokens){
    if(token.startsWith('「')&&token.endsWith('」')){
     const known=[...characters].sort((a,b)=>b.length-a.length).find(name=>name&&prefix.includes(name))
     const named=prefix.match(/([\u3400-\u9fff]{2,6})(?:低聲|輕聲|忽然|冷冷|沉聲)?(?:說|問|喊|答道|開口|提醒|叫道|低語)[^。！？]{0,18}[：:]?\s*$/)
     output.push({kind:'dialogue',speaker:known||named?.[1]||'人物對話',text:token.slice(1,-1)})
     prefix=''
    }else{
     narration(token,kind)
     prefix+=token
    }
   }
  }
 }
 return output.slice(0,22)
}
export default function NightwalkerStage({entries,turn,worldName,location,genre,reduced,large,characters,onPlaybackChange}:Props){
 const newest=entries.findLastIndex(x=>x.kind==='narration'||x.kind==='combat')
 const scene=entries.slice(Math.max(0,newest))
 const sceneId=String(turn)+'-'+scene.map(x=>String(x.id)+':'+x.text.length).join('-')
 const characterKey=characters.join('|')
 const beats=useMemo(()=>sceneBeats(scene,characters),[sceneId,characterKey])
 const [index,setIndex]=useState(0)
 const [visible,setVisible]=useState(0)
 const current=beats[Math.min(index,Math.max(0,beats.length-1))]
 const finished=Boolean(beats.length&&index===beats.length-1&&visible>=current.text.length)
 const typing=Boolean(current&&visible<current.text.length)
 useEffect(()=>{setIndex(0);setVisible(0)},[sceneId])
 useEffect(()=>{
  if(!current)return
  if(reduced){setVisible(current.text.length);return}
  if(visible>=current.text.length)return
  const timer=window.setTimeout(()=>setVisible(n=>Math.min(current.text.length,n+1)),19)
  return ()=>window.clearTimeout(timer)
 },[visible,index,sceneId,current?.text,reduced])
 useEffect(()=>{onPlaybackChange(finished)},[finished,onPlaybackChange])
 const advance=()=>{
  if(!current)return
  if(typing){setVisible(current.text.length);return}
  if(index<beats.length-1){setIndex(n=>n+1);setVisible(0)}
 }
 const skip=()=>{if(beats.length){setIndex(beats.length-1);setVisible(beats[beats.length-1].text.length)}}
 const latestAction=entries.slice(Math.max(0,newest-1),newest).find(x=>x.kind==='choice'&&!x.text.startsWith('【')))
 return <div className={'nw-cinema genre-'+genre+(large?' is-large':'')} aria-label="互動劇情演出">
  <div className="nw-cinema-atmos" aria-hidden="true"><span className="nw-cinema-ring"/><span className="nw-cinema-glow"/><span className="nw-cinema-grain"/></div>
  <div className="nw-cinema-bar"><span><i className="nw-cinema-live"/>輪迴場景 · {String(turn).padStart(2,'0')}</span><button type="button" onClick={skip} disabled={finished||beats.length<2}>跳過演出 <span aria-hidden="true">»</span></button></div>
  <div className="nw-cinema-location"><span>目前場景</span><strong>{location||worldName}</strong></div>
  {latestAction&&<p className="nw-cinema-last"><small>你的行動</small>{latestAction.text.length>62?latestAction.text.slice(0,62)+'…':latestAction.text}</p>}
  <div className="nw-cinema-focus">
   {current&&<div className={'nw-cinema-panel '+current.kind} key={sceneId+'-'+index}>
    <div className="nw-cinema-kind">{current.kind==='system'?'主神訊息':current.kind==='dialogue'?'角色對話':current.kind==='impact'?'危機時刻':'故事進行中'}<span>{String(index+1).padStart(2,'0')} / {String(beats.length).padStart(2,'0')}</span></div>
    {current.kind==='dialogue'&&<div className="nw-cinema-speaker"><span aria-hidden="true">◈</span>{current.speaker||'人物對話'}</div>}
    <p aria-label={current.text} className="nw-cinema-line">{current.kind==='dialogue'?'「':''}{current.text.slice(0,visible)}{current.kind==='dialogue'&&!typing?'」':''}{typing&&<span className="nw-cinema-caret" aria-hidden="true"/>}</p>
   </div>}
  </div>
  <button className={'nw-cinema-advance'+(finished?' complete':'')} type="button" onClick={advance} disabled={finished||!current}>
   <span>{typing?'點擊顯示完整文字':finished?'這一幕結束 · 請決定下一步':'點擊繼續劇情'}</span>
   <span aria-hidden="true">{finished?'◇':typing?'…':'⌄'}</span>
  </button>
  <div className="nw-cinema-progress" aria-hidden="true"><span style={{width:(beats.length?(100*(index+(typing?visible/Math.max(1,current.text.length):1))/beats.length):0)+'%'}}/></div>
 </div>
}
