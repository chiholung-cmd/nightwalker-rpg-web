import { NextResponse } from 'next/server'
import { getMongoClient } from '../../../lib/mongodb'
import { initialGameState } from '../../../lib/gameData'

export async function POST() {
  try {
    const client = await getMongoClient()
    const db = client.db('nightwalker')

    await db.collection('world').updateOne(
      { id: 'main-world' },
      {
        $set: {
          id: 'main-world',
          title: '夜行者',
          organization: '夜巡局',
          currentArc: '鏡中人事件',
          abnormalThreat: '十三號線殘響',
          updatedAt: new Date(),
        },
      },
      { upsert: true },
    )

    await db.collection('characters').deleteMany({})

    await db.collection('characters').insertMany([
      {
        name: '林夜',
        role: '主角 / 半死人',
        san: 61,
        hp: 84,
      },
      {
        name: '周成',
        role: '夜巡局第三行動組',
        san: 54,
        hp: 91,
      },
      {
        name: '葉晴',
        role: '靈視觀測者',
        san: 39,
        hp: 67,
      },
    ])

    await db.collection('saves').updateOne(
      { playerId: 'local-player' },
      {
        $set: {
          updatedAt: new Date(),
          gameState: initialGameState,
        },
      },
      { upsert: true },
    )

    return NextResponse.json({
      success: true,
      message: 'Nightwalker world seeded successfully.',
    })
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: 'Seed failed.',
    })
  }
}
