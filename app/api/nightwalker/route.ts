import {NextRequest,NextResponse} from 'next/server'
import OpenCC from 'opencc-js'
import {freshGame,normalizeGame,enterWorld,returnHub,purchase,equip,useItem,worldLoot,resolveCombat,storyBeat,containsUnauthorizedAction,recentContext,type Game,type ItemId,type BattleAction,type StoryBeat,type EmotionMood} from '../../../lib/nightwalkerGame'
export const runtime='nodejs'
export const dynamic='force-dynamic'
export const maxDuration=60
const rate=new Map<string,number[]>()
// Deterministically convert every AI output to Traditional Chinese on the server.
const traditional=OpenCC.Converter({from:'cn',to:'tw'})
const hant=(value:unknown,max=550)=>traditional(str(value,max))
const config=()=>{
 const key=process.env.AI_API_KEY||process.env.GROQ_API_KEY||process.env.OPENAI_API_KEY
 if(!key)return null
 const groq=Boolean(process.env.GROQ_API_KEY&&!process.env.AI_API_KEY)
 const base=(process.env.AI_BASE_URL||(groq?'https://api.groq.com/openai/v1':'https://api.openai.com/v1')).replace(/\/+$/,'')
 return {key,endpoint:base+'/chat/completions',model:process.env.AI_MODEL||(groq?'openai/gpt-oss-120b':'gpt-4.1-mini')}
}
const result=(state:Game)=>NextResponse.json({state})
export async function GET(){
 return NextResponse.json({configured:Boolean(config()),cloudSaveConfigured:Boolean(process.env.MONGODB_URI),engine:'nightwalker-v2'})
}
const parse=(v:unknown):Record<string,unknown>=>v&&typeof v==='object'&&!Array.isArray(v)?v as Record<string,unknown>:{}
const str=(v:unknown,n=550)=>typeof v==='string'?v.trim().slice(0,n):''
export async function POST(req:NextRequest){
 try{
  const length=Number(req.headers.get('content-length')||0)
  if(length>650000)return NextResponse.json({error:'存檔大小超過限制'}, {status:413})
  const input=parse(await req.json()),op=str(input.operation,20)||'turn'
  if(op==='new')return result(freshGame(str(input.heroId,100)||'solo-player'))
  let state=normalizeGame(input.state)
  try{
   if(op==='enter')state=enterWorld(state)
   if(op==='return')return result(returnHub(state))
   if(op==='purchase')return result(purchase(state,str(input.id,70)))
   if(op==='equip')return result(equip(state,str(input.id,40) as ItemId))
   if(op==='use')return result(useItem(state,str(input.id,40) as ItemId))
   if(op==='loot')return result(worldLoot(state,str(input.id,40) as ItemId))
   if(op==='combat')return result(resolveCombat(state,str(input.action,30) as BattleAction))
  }catch(e){
   return NextResponse.json({error:e instanceof Error?e.message:'動作無法執行',code:'RULE_BLOCKED'}, {status:400})
  }
  const opening=op==='enter'||op==='opening'
  if(op!=='turn'&&!opening)return NextResponse.json({error:'未知操作'}, {status:400})
  if(state.stage!=='explore')return NextResponse.json({error:'請先進入一個世界，戰鬥中不能直接探索'}, {status:400})
  if(op==='opening'&&(state.worldTurns>0||state.logs.some(e=>e.kind==='narration')))
   return NextResponse.json({error:'小說第一章已經開始，唔可以重新領取開篇'}, {status:400})
  const action=opening?'【首幕登場】你剛抵達'+state.worldName+'。先用一個可感知的聲響或細節建立場景，再由一個人物動作或異常徵兆引出實際危機。角色只能看到、聽到和被動經歷場景；不得擅自作重大選擇、獲得裝備或立即進入戰鬥。':str(input.action,550)
  if(!action)return NextResponse.json({error:'請輸入行動'}, {status:400})
  if(!opening){
   const block=containsUnauthorizedAction(state,action)
   if(block)return NextResponse.json({error:block,code:'NOT_OWNED'}, {status:400})
  }
  const cfg=config()
  if(!cfg)return NextResponse.json({error:'AI 劇情尚未接通：請喺 Vercel 設定 GROQ_API_KEY 或 OPENAI_API_KEY。其他 RPG 規則功能可以獨立使用。',code:'MODEL_NOT_CONFIGURED'}, {status:503})
  const required=process.env.ADVENTURE_ACCESS_CODE
  if(required&&req.headers.get('x-adventure-access-code')!==required)
    return NextResponse.json({error:'私人遊戲存取碼無效',code:'ACCESS_REQUIRED'}, {status:401})
  const ip=(req.headers.get('x-forwarded-for')||'local').split(',')[0].slice(0,75)
  const now=Date.now(),recent=(rate.get(ip)||[]).filter(t=>now-t<60000)
  if(recent.length>=12)return NextResponse.json({error:'AI 請求太頻密，請稍後重試'}, {status:429})
  recent.push(now);rate.set(ip,recent);if(rate.size>250)rate.clear()
  const context=recentContext(state,action)
  const system=[
   '你是 Nightwalker 無限流互動文字遊戲的劇情導演。玩家親身生活在故事中；你負責一幕接一幕地演出事件，而不是撰寫長篇小說。',
   '【語言硬規則】所有可見故事、NPC對話、選項、地點、摘要，必須使用繁體中文字形（正體字）；句法是自然的現代書面中文，偏向成熟懸疑／無限流網文，不用廣東話口語，不用簡體字，也不要刻意使用台灣方言或遊戲攻略口吻。',
   '【一回合＝一幕】一般場景 story 約120至210個中文字，開篇約180至270字。分成3至5個自然短節拍，每節約25至65字，以兩個換行隔開。每個節拍都應能單獨逐字演出：動作、反應、對話、發現，節奏須有停頓。',
   '【不要寫長篇】不需鋪陳數百字背景，不重講世界設定，不報流水帳，不為湊篇幅加入無效形容詞。畫面一次只出現一個短節拍，請按互動文字冒險的節奏寫，不要讓玩家連續看五段敘述才有事發生。',
   '【文筆】每幕只選一兩個真正有辨識度的感官細節；用可見的細小動作、人物選擇與環境改變表達情緒，不要直接講解「你感到恐懼／震驚」；人物應有目的、顧慮和獨特說話方式。',
   '【明確因果】第一個節拍回應玩家這次所做的事，並交代可驗證的結果；下一節拍讓一個人物或環境作出合理反應；最後停在值得選擇的具體局面。不能憑空插入無關驚嚇或每回合重置謎團。',
   '【克制濫用】避免「突然、竟然、不由得、就在這時、彷彿、詭異、冰冷、死寂、毛骨悚然、倒吸一口涼氣」連續重複，也不要每幕都出現神秘黑影、陌生耳語、詭異笑容。讓懸念來自已有線索。',
   '【對話演出】NPC需要說話時，在 beats 內獨立給一個 kind:dialogue、speaker:角色姓名、text:不帶「」引號的台詞。敘事的 kind:narration 只負責動作及現場變化；絕不可把同一句台詞放在 narration 和 dialogue 兩處。無人說話時不必強加對話。',
   '【主角是玩家】固定第二人稱「你」。只能描寫玩家已明確採取的行動造成的客觀結果，或玩家被動感知；不可替玩家擅自選擇、發言、承諾、逃走、殺人、使用道具、學會技能。',
   '【遊戲權限】只有程式能修改 HP、SP、積分、XP、裝備、拾取、技能、血脈、寵物、戰鬥傷害、敵人死亡和通關。你不可用文筆偷加玩家沒有的物件或能力；場景中看到物品不等於擁有。',
   '【連續性】要尊重現有 NPC 生死、關係、場所、回合、事件和先前對話。NPC先前說過的重要話必須記得，說謊需要合理動機而非模型失憶。',
   '【互動選擇】choices 正好三條，彼此策略不同（例如調查／交涉／冒險），具體對準眼前局面，每條約10至24個中文字。不得附劇情解釋、抽象價值口號，不得預先替玩家決定結果。玩家亦可自己輸入行動。',
   '【戰鬥】可把危機逐步升級；只在真正逼近遭遇、符合故事因果時給 encounter:true，由規則引擎處理戰鬥。不要每回合生敵人。',
   '【示例語感，勿照抄】走廊盡頭的日光燈閃了兩下。玻璃窗內，值班護士正背對著你整理病歷；她動作很慢，像是在等誰先開口。\\n\\n「你的名字，」她沒有回頭，「為甚麼已經被劃掉了？」\\n\\n你低頭看向腕帶。姓名欄原本空白的位置，正滲出一小片新鮮墨跡。',
   '【情緒導演】每個 beats 元素由 AI 配 mood，僅能用 calm、suspense、shock、grief、anger、eerie、resolve、system 八種。calm 適合正常探索；suspense 緩慢揭露關鍵情報；shock 僅用於真有突發衝擊；grief 留白；anger 話語擦除重寫；eerie 表面文字被真正改寫；resolve 果斷逐句加強；system 主神通知終端掃描。大部分情節應為 calm，不要濫用特效。',
   '【文字改寫】若 mood=eerie 或 anger 且故事內確實合理，可另外提供 prelude（先顯示的舊訊息／被否認的話）及 text（最終真正內容），兩者必須有明確因果。prelude 只作演出，不是最終歷史，不能違反玩家物品或能力規則；其他情緒不需 prelude。',
   '【資料格式】只輸出 JSON。beats: 3–7 個 {kind:"narration"|"dialogue"|"system", speaker?:角色名, mood:"calm"|"suspense"|"shock"|"grief"|"anger"|"eerie"|"resolve"|"system", text:"每個節拍的正文", prelude?: "改寫前暫時文字"}。不要同時重複輸出 story 或 dialogue；beats 是唯一演出文字，程式會自動拼接長期摘要。其他欄位：location、choices（三個不同策略的行動）、summary（承接舊記憶）、discovery（重要情報或空字串）、encounter（布林）、npc（可選 name/trust/status），絕不生成 inventory/stat。',
   opening?'【開場】從一件清楚的環境特徵切入，最後讓玩家面對可選擇的現場事件；不要直接寫成完整的一章或通關結局。':'【續幕】接住玩家上一個選擇的後果開始；不要重新從「你睜開眼」介紹世界。',
   '權威遊戲資料：'+JSON.stringify(context)
  ].join('\n')
  const response=await fetch(cfg.endpoint,{
   method:'POST',headers:{authorization:'Bearer '+cfg.key,'content-type':'application/json'},
   body:JSON.stringify({model:cfg.model,temperature:0.76,max_tokens:2300,reasoning_effort:cfg.model.startsWith('openai/gpt-oss-')?'low':undefined,response_format:{type:'json_object'},
    messages:[{role:'system',content:system},{role:'user',content:'當前玩家行動：'+action+'\n\n請生成真正能逐幕演出的互動文字 RPG。開場約 180–270 字，一般 120–210 字，整幕分為 3–7 個有事件因果的 beats。務必為每個 beats 指定 mood；人物對白獨立 kind:dialogue，主神通知獨立 kind:system；story/dialogue 不必回傳。3 個具體行動選項留給玩家。使用繁體中文書面語。嚴格回傳 JSON 結構：'+JSON.stringify({beats:[{kind:'narration',mood:'calm',text:'場景動作和環境反應。'},{kind:'dialogue',speaker:'角色姓名',mood:'suspense',text:'有目的的短句對話。'},{kind:'system',mood:'system',text:'【主神】簡潔的系統通知。'},{kind:'narration',mood:'eerie',prelude:'暫時顯示的文字。',text:'最終被改寫的真相。'}],location:'具體位置',choices:['具體的調查行動','具體的交涉行動','具體的風險行動'],summary:'保留長期記憶的新摘要',discovery:'',encounter:false})}]}),
   signal:AbortSignal.timeout(54000),cache:'no-store'
  })
  if(!response.ok){
   console.error('Nightwalker upstream status',response.status)
   const errorHint=response.status===400||response.status===404?'Groq 模型名稱或請求格式不被支援':response.status===401||response.status===403?'Groq API Key 驗證失敗或存取受限':response.status===429?'Groq 免費用量／速率限制': 'Groq 模型服務暫時出錯'
   return NextResponse.json({error:errorHint,code:'UPSTREAM_ERROR',providerStatus:response.status}, {status:502})
  }
  const data=await response.json() as {choices?:{message?:{content?:string}}[]}
  const raw=data.choices?.[0]?.message?.content
  if(!raw)return NextResponse.json({error:'AI 模型未輸出劇情'}, {status:502})
  const answer=parse(JSON.parse(raw.trim().replace(/^\x60{3}(?:json)?\s*/i,'').replace(/\x60{3}\s*$/,'')))
  try{
   const n=parse(answer.npc)
   const validMoods=['calm','suspense','shock','grief','anger','eerie','resolve','system']
   const beats:StoryBeat[]=Array.isArray(answer.beats)?answer.beats.slice(0,10).map(raw=>{
    const beat=parse(raw),m=hant(beat.mood,20),kind=hant(beat.kind,20)
    return {text:hant(beat.text,400),mood:(validMoods.includes(m)?m:'calm') as EmotionMood,
     kind:kind==='dialogue'?'dialogue':kind==='system'?'system':'narration',
     speaker:hant(beat.speaker,50),prelude:hant(beat.prelude,350)}
   }).filter(beat=>Boolean(beat.text)):[]
   const story=beats.length
    ?beats.map(beat=>beat.kind==='dialogue'?(beat.speaker||'？？？')+'：「'+beat.text+'」':beat.text).join('\n\n').slice(0,1500)
    :hant(answer.story,1500)
   const next=storyBeat(state,action,{
    story,beats,
    dialogue:Array.isArray(answer.dialogue)?answer.dialogue.map(x=>parse(x)).map(x=>({speaker:hant(x.speaker,45),text:hant(x.text,250)})):[],
    location:hant(answer.location,100),
    choices:Array.isArray(answer.choices)?answer.choices.filter(x=>typeof x==='string').map(x=>hant(x,120)):[],
    summary:hant(answer.summary,2500),
    discovery:hant(answer.discovery,220),
    encounter:!opening&&answer.encounter===true,
    npc:answer.npc&&typeof answer.npc==='object'?{name:hant(n.name,40),trust:Number(n.trust),status:hant(n.status,20)}:undefined
   })
   return result(next)
  }catch(e){
   console.error('Nightwalker consistency check:',e instanceof Error?e.message:'unknown')
   return NextResponse.json({error:'AI 生成了與現有裝備或遊戲狀態衝突的劇情，已拒絕套用，存檔不變。',code:'STORY_CONFLICT'}, {status:422})
  }
 }catch(e){
  console.error('Nightwalker request failed',e instanceof Error?e.message.slice(0,180):'unknown')
  return NextResponse.json({error:'劇情處理失敗，已保留原有進度。'}, {status:500})
 }
}

