import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()

    const apiKey = process.env.POE_API_KEY

    if (!apiKey) {
      return NextResponse.json({
        success: false,
        message: 'POE_API_KEY not configured yet.',
      })
    }

    return NextResponse.json({
      success: true,
      placeholder: true,
      message: 'Poe API route scaffold created.',
      received: body,
    })
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: 'Invalid request',
    })
  }
}
