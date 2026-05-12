import { NextRequest, NextResponse } from 'next/server'
import { getMongoClient } from '../../../lib/mongodb'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()

    const client = await getMongoClient()
    const db = client.db('nightwalker')

    await db.collection('saves').updateOne(
      {
        playerId: 'local-player',
      },
      {
        $set: {
          updatedAt: new Date(),
          gameState: body,
        },
      },
      {
        upsert: true,
      },
    )

    return NextResponse.json({
      success: true,
      message: 'Cloud save updated.',
    })
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: 'Save failed.',
    })
  }
}

export async function GET() {
  try {
    const client = await getMongoClient()
    const db = client.db('nightwalker')

    const save = await db.collection('saves').findOne({
      playerId: 'local-player',
    })

    return NextResponse.json({
      success: true,
      save,
    })
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: 'Load failed.',
    })
  }
}
