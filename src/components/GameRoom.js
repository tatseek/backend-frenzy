
'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { useRouter } from 'next/navigation'
import QuestionCard from './QuestionCard'
import Scoreboard from './Scoreboard'
import PlayersList from './PlayersList'

export default function GameRoom({ gameId, currentUser }) {
  const [game, setGame] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [timeRemaining, setTimeRemaining] = useState(15)
  const [hasAnswered, setHasAnswered] = useState(false)
  const [lastQuestionIndex, setLastQuestionIndex] = useState(-1)
  
  const router = useRouter()
  const timerRef = useRef(null)
  const fetchIntervalRef = useRef(null)

  const fetchGame = useCallback(async () => {
    try {
      const response = await fetch(`/api/games/${gameId}`)
      if (!response.ok) {
        throw new Error('Game not found')
      }
      const data = await response.json()
      
      // Check if question changed
      if (data.game.currentQuestion !== lastQuestionIndex) {
        console.log(`Question changed from ${lastQuestionIndex} to ${data.game.currentQuestion}`)
        setLastQuestionIndex(data.game.currentQuestion)
        setHasAnswered(false) // Reset answer state for new question
      }
      
      setGame(data.game)
      setError(null)
    } catch (err) {
      console.error('Fetch game error:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [gameId, lastQuestionIndex])

  // fetching game updates every 2 seconds
  useEffect(() => {
    fetchGame()
    fetchIntervalRef.current = setInterval(fetchGame, 2000)
    
    return () => {
      if (fetchIntervalRef.current) {
        clearInterval(fetchIntervalRef.current)
      }
    }
  }, [fetchGame])

  
  useEffect(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current)
    }

    if (game?.status === 'playing' && game?.questionStartTime) {
      console.log('Starting timer for question', game.currentQuestion)
      
      // Get server time when question started
      const serverStartTime = new Date(game.questionStartTime).getTime()
      const maxTime = 15000 // 15 seconds
      
      // calculating initial time remaining based on server time
      const now = Date.now()
      const elapsedSinceStart = now - serverStartTime
      const initialTimeRemaining = Math.max(0, Math.ceil((maxTime - elapsedSinceStart) / 1000))
      
      setTimeRemaining(initialTimeRemaining)
      console.log(`Initial time remaining: ${initialTimeRemaining}s (elapsed: ${elapsedSinceStart}ms)`)
      
      // starting countdown timer
      timerRef.current = setInterval(() => {
        const currentTime = Date.now()
        const totalElapsed = currentTime - serverStartTime
        const remaining = Math.max(0, Math.ceil((maxTime - totalElapsed) / 1000))
        
        setTimeRemaining(remaining)
        
        if (remaining === 0) {
          console.log('Timer expired for question', game.currentQuestion)
          clearInterval(timerRef.current)
          
          // auto-advance to next question after 3 seconds (only for host)
          if (currentUser.id === game.hostId) {
            setTimeout(() => {
              console.log('Host auto-advancing to next question')
              handleNextQuestion()
            }, 3000)
          }
        }
      }, 100) // updates every 100ms 
      
      return () => {
        if (timerRef.current) {
          clearInterval(timerRef.current)
        }
      }
    }
  }, [game?.questionStartTime, game?.currentQuestion, game?.status])

  const handleStartGame = async () => {
    try {
      setLoading(true)
      console.log('Starting game:', gameId)
      
      const response = await fetch(`/api/games/${gameId}/start`, {
        method: 'POST'
      })
      
      if (!response.ok) {
        throw new Error('Failed to start game')
      }
      
      await fetchGame()
    } catch (err) {
      console.error('Start game error:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleAnswer = async (answerIndex) => {
    if (!game?.questionStartTime || hasAnswered) {
      console.log('Cannot submit answer:', { hasQuestionStartTime: !!game?.questionStartTime, hasAnswered })
      return
    }
    
    const timeElapsed = Date.now() - new Date(game.questionStartTime).getTime()
    console.log(`Submitting answer ${answerIndex} for question ${game.currentQuestion}, time elapsed: ${timeElapsed}ms`)
    
    setHasAnswered(true)
    
    try {
      const response = await fetch(`/api/games/${gameId}/answer`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          playerId: currentUser.id,
          answerIndex,
          timeElapsed
        })
      })
      
      if (!response.ok) {
        throw new Error('Failed to submit answer')
      }
      
      const result = await response.json()
      console.log('Answer result:', result.result)
      
      // Show result after a short delay
      setTimeout(() => {
        if (result.result?.isCorrect) {
          alert(` Correct! +${result.result.points} points`)
        } else {
          const correctOption = game.questions[game.currentQuestion].options[result.result?.correctAnswer]
          alert(` Wrong! Correct answer was: ${correctOption}`)
        }
      }, 500)
      
      // fetching updated game state
      await fetchGame()
    } catch (err) {
      console.error('Answer submission error:', err)
      setHasAnswered(false) // Allow retry on error
    }
  }

  const handleNextQuestion = async () => {
    try {
      console.log('Moving to next question from:', game.currentQuestion)
      
      const response = await fetch(`/api/games/${gameId}/next`, { 
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      })
      
      if (!response.ok) {
        throw new Error('Failed to move to next question')
      }
      
      await fetchGame()
    } catch (err) {
      console.error('Next question error:', err)
    }
  }

  
  if (loading && !game) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading game...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-16">
        <h1 className="text-2xl font-bold text-red-600 mb-4"> Error</h1>
        <p className="text-gray-600 mb-8">{error}</p>
        <button onClick={() => router.push('/')} className="btn-primary">
          Back to Home
        </button>
      </div>
    )
  }

  if (!game) return null

  const currentPlayer = game.players.find(p => p.id === currentUser.id)
  const isHost = game.hostId === currentUser.id

  return (
    <div className="max-w-6xl mx-auto p-4">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-2">🎮 Game Room: {game.id}</h1>
        <div className="flex justify-center items-center gap-4 text-lg">
          <span className={`px-3 py-1 rounded-full font-medium ${
            game.status === 'waiting' ? 'bg-yellow-100 text-yellow-800' :
            game.status === 'playing' ? 'bg-green-100 text-green-800' :
            'bg-purple-100 text-purple-800'
          }`}>
            {game.status.toUpperCase()}
          </span>
          {game.status === 'playing' && (
            <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full font-medium">
              Question {game.currentQuestion + 1} of {game.questions.length}
            </span>
          )}
        </div>
        
        {/* Debug info for troubleshooting */}
        <div className="mt-2 text-xs text-gray-500">
          Debug: Timer={timeRemaining}s, Answered={hasAnswered.toString()}, LastQ={lastQuestionIndex}, CurrentQ={game.currentQuestion}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          {game.status === 'waiting' && (
            <div className="text-center bg-white p-8 rounded-xl shadow-lg">
              <h2 className="text-2xl font-bold mb-4"> Waiting for Players</h2>
              <p className="text-gray-600 mb-6">
                Share this Game ID: <span className="text-3xl font-bold text-blue-600 bg-blue-50 px-4 py-2 rounded-lg">{game.id}</span>
              </p>
              <PlayersList players={game.players} />
              {isHost && game.players.length >= 2 ? (
                <button
                  onClick={handleStartGame}
                  disabled={loading}
                  className="btn-primary text-lg px-8 py-3 mt-6 hover:scale-105 transform transition-all"
                >
                  {loading ? ' Starting...' : ' Start Game'}
                </button>
              ) : isHost ? (
                <p className="text-orange-600 mt-4 font-medium">Need at least 2 players to start</p>
              ) : (
                <p className="text-gray-500 mt-4">Waiting for host to start the game...</p>
              )}
            </div>
          )}

          {game.status === 'playing' && game.questions && (
            <QuestionCard
              question={game.questions[game.currentQuestion]}
              questionNumber={game.currentQuestion + 1}
              totalQuestions={game.questions.length}
              timeRemaining={timeRemaining}
              onAnswer={handleAnswer}
              disabled={timeRemaining === 0 || hasAnswered}
              currentQuestionIndex={game.currentQuestion} // Pass current question index
            />
          )}

          {game.status === 'finished' && (
            <div className="text-center bg-white p-8 rounded-xl shadow-lg">
              <h2 className="text-4xl font-bold mb-6"> Game Over!</h2>
              <div className="mb-8">
                <Scoreboard players={game.players} title="Final Results" />
              </div>
              <div className="space-x-4">
                <button
                  onClick={() => router.push('/')}
                  className="btn-primary"
                >
                   Back to Home
                </button>
                <button
                  onClick={() => window.location.reload()}
                  className="btn-secondary"
                >
                   Play Again
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="space-y-6">
          <Scoreboard players={game.players} title="Live Scores" />
          
          {game.status === 'playing' && isHost && timeRemaining === 0 && (
            <button
              onClick={handleNextQuestion}
              className="w-full btn-primary text-lg py-3 hover:scale-105 transform transition-all"
            >
               Next Question
            </button>
          )}

          {currentPlayer && (
            <div className="bg-white p-4 rounded-xl shadow-lg">
              <h4 className="font-semibold mb-2">Your Stats</h4>
              <div className="text-2xl font-bold text-blue-600">
                {currentPlayer.score || 0} points
              </div>
              <div className="text-sm text-gray-500 mt-1">
                {hasAnswered ? ' Answer submitted' : ' Waiting for your answer...'}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}




