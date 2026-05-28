import { NextResponse } from 'next/server'
import { connectToDatabase } from '@/lib/mongodb'

export async function GET(request, { params }) {
  try {
    const { gameId } = params
    const { db } = await connectToDatabase()
    
    const game = await db.collection('games').findOne({ id: gameId })
    
    if (!game) {
      return NextResponse.json({ error: 'Game not found' }, { status: 404 })
    }
    
    return NextResponse.json({ game })
  } catch (error) {
    console.error('Error fetching game:', error)
    return NextResponse.json({ error: 'Failed to fetch game' }, { status: 500 })
  }
}

export async function PATCH(request, { params }) {
  try {
    const { gameId } = params
    const updates = await request.json()
    const { db } = await connectToDatabase()
    
    const result = await db.collection('games').updateOne(
      { id: gameId },
      { $set: updates }
    )
    
    if (result.matchedCount === 0) {
      return NextResponse.json({ error: 'Game not found' }, { status: 404 })
    }
    
    const game = await db.collection('games').findOne({ id: gameId })
    return NextResponse.json({ game })
  } catch (error) {
    console.error('Error updating game:', error)
    return NextResponse.json({ error: 'Failed to update game' }, { status: 500 })
  }
}
