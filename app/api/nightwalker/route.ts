import {NextRequest,NextResponse} from 'next/server'
import OpenCC from 'opencc-js'
import {freshGame,normalizeGame,enterWorld,returnHub,purchase,equip,useItem,worldLoot,resolveCombat,storyBeat,containsUnauthorizedAction,recentContext,type Game,type ItemId,type BattleAction} from '../../../lib/nightwalkerGame'
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
   '【對話演出】NPC有話要說時，直接寫入 story，使用「」引號。對話需像角色在現場說話，言簡意賅且有目的；前一句可用角色名字和動作交代說話者，例如：林霧按住門把，示意你停下。「先別開。你聽，門後的腳步不是兩個人。」dialogue 必須是空陣列 []，不能重複。',
   '【主角是玩家】固定第二人稱「你」。只能描寫玩家已明確採取的行動造成的客觀結果，或玩家被動感知；不可替玩家擅自選擇、發言、承諾、逃走、殺人、使用道具、學會技能。',
   '【遊戲權限】只有程式能修改 HP、SP、積分、XP、裝備、拾取、技能、血脈、寵物、戰鬥傷害、敵人死亡和通關。你不可用文筆偷加玩家沒有的物件或能力；場景中看到物品不等於擁有。',
   '【連續性】要尊重現有 NPC 生死、關係、場所、回合、事件和先前對話。NPC先前說過的重要話必須記得，說謊需要合理動機而非模型失憶。',
   '【互動選擇】choices 正好三條，彼此策略不同（例如調查／交涉／冒險），具體對準眼前局面，每條約10至24個中文字。不得附劇情解釋、抽象價值口號，不得預先替玩家決定結果。玩家亦可自己輸入行動。',
   '【戰鬥】可把危機逐步升級；只在真正逼近遭遇、符合故事因果時給 encounter:true，由規則引擎處理戰鬥。不要每回合生敵人。',
   '【示例語感，勿照抄】走廊盡頭的日光燈閃了兩下。玻璃窗內，值班護士正背對著你整理病歷；她動作很慢，像是在等誰先開口。\\n\\n「你的名字，」她沒有回頭，「為甚麼已經被劃掉了？」\\n\\n你低頭看向腕帶。姓名欄原本空白的位置，正滲出一小片新鮮墨跡。',
   '【資料格式】只輸出 JSON：story（3至5個以 \\n\\n 分隔的故事節拍，對話嵌於其中），dialogue:[]，location（實際位置），choices（三條具體行動），summary（更新後摘要，保留舊記憶），discovery（重要線索或空字串），encounter（布林），npc（可選 name/trust/status）。不得生成 inventory 或 stat。',
   opening?'【開場】從一件清楚的環境特徵切入，最後讓玩家面對可選擇的現場事件；不要直接寫成完整的一章或通關結局。':'【續幕】接住玩家上一個選擇的後果開始；不要重新從「你睜開眼」介紹世界。',
   '權威遊戲資料：'+JSON.stringify(context)
  ].join('\n')
  const response=await fetch(cfg.endpoint,{
   method:'POST',headers:{authorization:'Bearer '+cfg.key,'content-type':'application/json'},
   body:JSON.stringify({model:cfg.model,temperature:0.76,max_tokens:2300,reasoning_effort:cfg.model.startsWith('openai/gpt-oss-')?'low':undefined,response_format:{type:'json_object'},
    messages:[{role:'system',content:system},{role:'user',content:'當前玩家行動：'+action+'\n\n請按互動文字遊戲的節奏給出完整且有因果的一幕：開場180–270字，一般120–210字，分3–5個短節拍，對話使用「」並寫在 story 中，絕不使用簡體字、粵語口語或小說章節式長篇鋪陳。最後提供正好3個不同策略的具體行動。請輸出以下 JSON 格式：'+JSON.stringify({story:'第一個短節拍。\\n\\n第二個短節拍，含必要人物對話。\\n\\n第三個短節拍，停在需要玩家選擇的局面。',dialogue:[],location:'具體位置',choices:['調查眼前的具體線索','向當前人物提出關鍵問題','採取另一種有代價的行動'],summary:'已有記憶加上本幕更新',discovery:'',encounter:false})}]}),
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
   const next=storyBeat(state,action,{
    story:hant(answer.story,1500),
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

