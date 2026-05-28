import { useEffect, useState, useCallback } from 'react'
import {realtime} from '@/lib/supabase'

export function useGameRealtime(gameId) {
  const [gameState, setGameState] = useState(null)
  const [connected, setConnected] = useState(false)

  useEffect(() => {
    if (!gameId) return
          console.log('Subscribing to game', gameId)

    const subscription = realtime.subscribeToGame(gameId, (payload) => {
            console.log('Game update received:', payload)
      setGameState(payload.payload)
    })

    subscription.on('postgres_changes', { event: '*', schema: 'realtime' }, (payload) => {
      console.log('Realtime update:', payload)
    })

    setConnected(true)
console.log('Connected to game:', gameId)

    return () => {
      subscription.unsubscribe()
      setConnected(false)
            console.log('Unsubscribed from game:', gameId)
    }
  }, [gameId])

  const broadcastUpdate = useCallback((data) => {
  console.log('Broadcasting update:', data)
          if (gameId) {
      realtime.broadcastGameUpdate(gameId, data)
    }
  }, [gameId])
 return {
    gameState,
    connected,
    broadcastUpdate
  }
}

export function useScoreRealtime(gameId) {
  const [scores, setScores] = useState([])

  useEffect(() => {
    if (!gameId) return

    const subscription = realtime.subscribeToScores(gameId, (payload) => {
      setScores(payload.payload)
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [gameId])

  const broadcastScoreUpdate = useCallback((scoreData) => {
    if (gameId) {
      realtime.broadcastScoreUpdate(gameId, scoreData)
    }
  }, [gameId])

  return {
    scores,
    broadcastScoreUpdate
  }
}

