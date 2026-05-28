import { NextResponse } from 'next/server'
import { connectToDatabase } from '@/lib/mongodb'

export async function POST(request, { params }) {
  try {
    const { gameId } = params
    const { playerId, playerName } = await request.json()
    const { db } = await connectToDatabase()
    
    const game = await db.collection('games').findOne({ id: gameId })
    
    if (!game) {
      return NextResponse.json({ error: 'Game not found' }, { status: 404 })
    }
    
    if (game.status !== 'waiting') {
      return NextResponse.json({ error: 'Game already started' }, { status: 400 })
    }
    
    if (game.players.length >= 6) {
      return NextResponse.json({ error: 'Game is full' }, { status: 400 })
    }
    
    // checks if player already joined
    const existingPlayer = game.players.find(p => p.id === playerId)
    if (existingPlayer) {
      return NextResponse.json({ game, player: existingPlayer })
    }
    
    const newPlayer = {
      id: playerId,
      name: playerName || 'Anonymous',
      score: 0,
      ready: false,
      joinedAt: new Date()
    }
    
    await db.collection('games').updateOne(
      { id: gameId },
      { $push: { players: newPlayer } }
    )
    
    const updatedGame = await db.collection('games').findOne({ id: gameId })
    
    return NextResponse.json({ game: updatedGame, player: newPlayer })
  } catch (error) {
    console.error('Error joining game:', error)
    return NextResponse.json({ error: 'Failed to join game' }, { status: 500 })
  }
}
