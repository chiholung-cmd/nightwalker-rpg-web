import { NextRequest, NextResponse } from 'next/server'
import { advanceWorld, applyTurn, makePrompt, NEW_GAME, normalizeSave, parseTurn } from '../../../lib/aiAdventure'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
export const maxDuration = 60

const config = () => {
  const key = process.env.AI_API_KEY || process.env.GROQ_API_KEY || process.env.OPENAI_API_KEY
  if (!key) return null
  const groq = Boolean(process.env.GROQ_API_KEY && !process.env.AI_API_KEY)
  return {
    key,
    url: (process.env.AI_BASE_URL || (groq ? 'https://api.groq.com/openai/v1' : 'https://api.openai.com/v1')).replace(/\/+$/, '') + '/chat/completions',
    model: process.env.AI_MODEL || (groq ? 'openai/gpt-oss-120b' : 'gpt-4.1-mini')
  }
}
const rate = new Map<string, number[]>()

export async function GET() {
  return NextResponse.json({ configured: Boolean(config()), worlds: 3 })
}
export async function POST(req: NextRequest) {
  try {
    const body = await req.json() as Record<string, unknown>
    if (body.operation === 'new') return NextResponse.json({ state: NEW_GAME })
    const state = normalizeSave(body.state)
    if (body.operation === 'next') {
      try { return NextResponse.json({ state: advanceWorld(state) }) }
      catch { return NextResponse.json({ error: '下一個電影世界尚未解鎖。' }, { status: 400 }) }
    }
    if (state.stage !== 'playing') return NextResponse.json({ error: '請先進入電影世界。' }, { status: 400 })
    const action = typeof body.action === 'string' ? body.action.trim().slice(0, 550) : ''
    if (!action) return NextResponse.json({ error: '請輸入你想做嘅行動。' }, { status: 400 })
    if (state.hp <= 0 || state.sp <= 0) return NextResponse.json({error:'目前已失去行動能力。'}, {status:400})
    const cfg = config()
    if (!cfg) return NextResponse.json({
      error: 'AI 故事模型未連接。需要喺 Vercel 設定 GROQ_API_KEY（或 OPENAI_API_KEY）。',
      code: 'MODEL_NOT_CONFIGURED'
    }, { status: 503 })
    const required = process.env.ADVENTURE_ACCESS_CODE
    if (required && req.headers.get('x-adventure-access-code') !== required)
      return NextResponse.json({error:'請輸入私人遊戲存取碼。',code:'ACCESS_REQUIRED'}, {status:401})

    const ip = (req.headers.get('x-forwarded-for') || 'local').split(',')[0]
    const now = Date.now()
    const recent = (rate.get(ip) || []).filter(x => now - x < 60000)
    if (recent.length >= 15) return NextResponse.json({error:'請求太頻密，稍後再試。'}, {status:429})
    recent.push(now)
    rate.set(ip, recent)
    if (rate.size > 300) rate.clear()

    const prompt = makePrompt(state, action)
    const res = await fetch(cfg.url, {
      method:'POST',
      headers:{authorization:'Bearer ' + cfg.key,'content-type':'application/json'},
      body:JSON.stringify({
        model:cfg.model,
        temperature:0.85,
        max_tokens:1800,
        response_format:{type:'json_object'},
        messages:[{role:'system',content:prompt.system},{role:'user',content:prompt.user}]
      }),
      cache:'no-store',
      signal:AbortSignal.timeout(55000)
    })
    if (!res.ok) {
      console.error('Nightwalker upstream status',res.status)
      return NextResponse.json({error:res.status===429?'模型用量受限，請稍後重試。':'AI 模型暫時未能回覆，請檢查設定或稍後重試。'}, {status:502})
    }
    const data = await res.json() as { choices?: { message?: { content?: string } }[] }
    const raw = data.choices?.[0]?.message?.content
    if (!raw) throw new Error('Model output empty')
    const cleaned = raw.trim().replace(/^```(?:json)?/i, '').replace(/```$/,'').trim()
    const turn = parseTurn(JSON.parse(cleaned))
    return NextResponse.json({state:applyTurn(state, action, turn),turn})
  } catch (err) {
    console.error('Nightwalker AI turn failed',err instanceof Error ? err.message.slice(0,180) : '')
    return NextResponse.json({error:'AI 故事暫時生成失敗，請重試。存檔未有更改。'}, {status:500})
  }
}
