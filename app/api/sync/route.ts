import { NextResponse } from 'next/server'

export async function POST() {
  return NextResponse.json({
    success: true,
    message: 'Google Sheet sync scaffold ready.',
    todo: [
      'Connect Google Service Account',
      'Read world state',
      'Write player summary',
      'Sync NPC status',
    ],
  })
}
