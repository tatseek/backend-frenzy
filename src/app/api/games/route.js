import { NextResponse } from 'next/server'
import { connectToDatabase } from '@/lib/mongodb'

// CORS HEADERS
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
}

// HANDLE PREFLIGHT REQUESTS
export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders })
}

export async function GET() {
  try {
    const { db } = await connectToDatabase()

    const games = await db
      .collection('games')
      .find({ status: 'waiting' })
      .toArray()

    return NextResponse.json(
      { games },
      { headers: corsHeaders }
    )
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch games' },
      {
        status: 500,
        headers: corsHeaders,
      }
    )
  }
}

export async function POST(request) {
  try {
    const { hostId, hostName } = await request.json()

    const { db } = await connectToDatabase()

    const gameId = Math.random()
      .toString(36)
      .substring(2, 8)
      .toUpperCase()

    const game = {
      id: gameId,
      hostId,
      hostName: hostName || 'Anonymous',
      status: 'waiting',
      players: [
        {
          id: hostId,
          name: hostName || 'Host',
          score: 0,
          ready: false,
        },
      ],
      currentQuestion: 0,
      questions: [],
      createdAt: new Date(),
      startedAt: null,
      finishedAt: null,
    }

    await db.collection('games').insertOne(game)

    return NextResponse.json(
      { gameId, game },
      { headers: corsHeaders }
    )
  } catch (error) {
    console.error('Error creating game:', error)

    return NextResponse.json(
      { error: 'Failed to create game' },
      {
        status: 500,
        headers: corsHeaders,
      }
    )
  }
}
