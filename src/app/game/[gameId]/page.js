'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import GameRoom from '@/components/GameRoom'

export default function GamePage({ params }) {
  const [currentUser, setCurrentUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const { gameId } = params

  useEffect(() => {
    const storedPlayer = localStorage.getItem('currentPlayer')
    
    if (storedPlayer) {
      setCurrentUser(JSON.parse(storedPlayer))
    } else {
      const anonymousUser = {
        id: 'anon_' + Math.random().toString(36).substr(2, 9),
        name: 'Anonymous Player'
      }
      setCurrentUser(anonymousUser)
      localStorage.setItem('currentPlayer', JSON.stringify(anonymousUser))
    }
    
    setLoading(false)
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!currentUser) {
    return (
      <div className="text-center py-16">
        <h1 className="text-2xl font-bold text-red-600 mb-4">Error</h1>
        <p className="text-gray-600 mb-8">Unable to identify player</p>
        <button onClick={() => router.push('/')} className="btn-primary">
          Back to Home
        </button>
      </div>
    )
  }

  return <GameRoom gameId={gameId.toUpperCase()} currentUser={currentUser} />
}
