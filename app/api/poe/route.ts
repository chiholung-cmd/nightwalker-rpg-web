import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()

    const apiKey = process.env.POE_API_KEY
    const model = process.env.MODEL_NAME || 'gpt-5.2-instant'

    if (!apiKey) {
      return NextResponse.json({
        success: false,
        message: 'POE_API_KEY not configured.',
      })
    }

    const response = await fetch('https://api.poe.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model,
        messages: [
          {
            role: 'system',
            content:
              '你是夜行者 AI 劇情引擎。你必須生成沉浸式中文驚悚 RPG 劇情。輸出 JSON 格式，包括 story、hp_change、san_change、sta_change、choices。',
          },
          {
            role: 'user',
            content: JSON.stringify(body),
          },
        ],
      }),
    })

    const data = await response.json()

    return NextResponse.json({
      success: true,
      model,
      data,
    })
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: 'Poe generation failed.',
    })
  }
}
