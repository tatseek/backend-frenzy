import { NextResponse } from 'next/server'
import { connectToDatabase } from '@/lib/mongodb'

export async function POST(request, { params }) {
  try {
    const { gameId } = params
    const { playerId, answerIndex, timeElapsed } = await request.json()
    const { db } = await connectToDatabase()
    
    const game = await db.collection('games').findOne({ id: gameId })
    
    if (!game) {
      return NextResponse.json({ error: 'Game not found' }, { status: 404 })
    }
    
    if (game.status !== 'playing') {
      return NextResponse.json({ error: 'Game not in progress' }, { status: 400 })
    }
    
    const currentQ = game.questions[game.currentQuestion]
    const isCorrect = answerIndex === currentQ.correct
    
    // calculates points (more points for faster answers)
    let points = 0
    if (isCorrect) {
      const maxTime = 15000 // 15 seconds
      const timeBonus = Math.max(0, (maxTime - timeElapsed) / maxTime)
      points = Math.round(1000 * (0.5 + 0.5 * timeBonus))
    }
    
    // updates player score
    await db.collection('games').updateOne(
      { id: gameId, 'players.id': playerId },
      { 
        $inc: { 'players.$.score': points },
        $set: { [`players.$.answer${game.currentQuestion}`]: { answerIndex, isCorrect, points, timeElapsed } }
      }
    )
    
    // Record the answer
    const answerRecord = {
      gameId,
      playerId,
      questionIndex: game.currentQuestion,
      answerIndex,
      isCorrect,
      points,
      timeElapsed,
      timestamp: new Date()
    }
    
    await db.collection('answers').insertOne(answerRecord)
    
    const updatedGame = await db.collection('games').findOne({ id: gameId })
    
    return NextResponse.json({ 
      game: updatedGame,
      result: { isCorrect, points, correctAnswer: currentQ.correct }
    })
  } catch (error) {
    console.error('Error submitting answer:', error)
    return NextResponse.json({ error: 'Failed to submit answer' }, { status: 500 })
  }
}
