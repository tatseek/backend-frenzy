
import { NextResponse } from 'next/server'
import { connectToDatabase } from '@/lib/mongodb'

export async function POST(request, { params }) {
  try {
    const { gameId } = params
    const { db } = await connectToDatabase()
    
    const game = await db.collection('games').findOne({ id: gameId })
    
    if (!game) {
      return NextResponse.json({ error: 'Game not found' }, { status: 404 })
    }
    
    const nextQuestion = game.currentQuestion + 1
    const isFinished = nextQuestion >= game.questions.length
    
    console.log(`Game ${gameId}: Moving from question ${game.currentQuestion} to ${nextQuestion}, finished: ${isFinished}`)
    
    const updates = {
      currentQuestion: nextQuestion,
      questionStartTime: new Date(), 
      lastQuestionEndTime: new Date() 
    }
    
    if (isFinished) {
      updates.status = 'finished'
      updates.finishedAt = new Date()
      delete updates.questionStartTime 
    }
    
    await db.collection('games').updateOne(
      { id: gameId },
      { $set: updates }
    )
    
    const updatedGame = await db.collection('games').findOne({ id: gameId })
    
    console.log(`Game ${gameId}: Updated to question ${updatedGame.currentQuestion}, status: ${updatedGame.status}`)
    
    return NextResponse.json({ 
      game: updatedGame, 
      finished: isFinished,
      serverTime: new Date().toISOString() // sending server timer for sync
    })
  } catch (error) {
    console.error('Error moving to next question:', error)
    return NextResponse.json({ error: 'Failed to move to next question' }, { status: 500 })
  }
}
