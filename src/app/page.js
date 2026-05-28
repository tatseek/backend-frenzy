'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function HomePage() {
  const [loading, setLoading] = useState(false)
  const [playerName, setPlayerName] = useState('')
  const router = useRouter()

  useEffect(() => {
    // loading saved player name
    const saved = localStorage.getItem('playerName')
    if (saved) {
      setPlayerName(saved)
    }
  }, [])

  const handleCreateGame = async () => {
    if (!playerName.trim()) {
      const name = prompt('Enter your name:')
      if (!name) return
      setPlayerName(name)
      localStorage.setItem('playerName', name)
    }

    try {
      setLoading(true)
      const hostId = 'host_' + Math.random().toString(36).substr(2, 9)
      
      const response = await fetch('/api/games', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          hostId,
          hostName: playerName.trim() 
        })
      })
      
      if (!response.ok) {
        throw new Error('Failed to create game')
      }
      
      const { gameId } = await response.json()
      
      // storing player info
      localStorage.setItem('currentPlayer', JSON.stringify({
        id: hostId,
        name: playerName.trim()
      }))
      
      router.push(`/game/${gameId}`)
      
    } catch (error) {
      console.error('Error creating game:', error)
      alert(' Failed to create game. Make sure MongoDB is running!')
    } finally {
      setLoading(false)
    }
  }

  const handleJoinGame = () => {
    router.push('/lobby')
  }

  const handleViewHistory = () => {
    router.push('/history')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 -m-6 -mt-6 pt-24 pb-12">
      <div className="text-center px-4">
        <h1 className="text-6xl font-bold text-gray-900 mb-4">
           Flashcard Frenzy
        </h1>
        <p className="text-2xl text-gray-600 mb-12 max-w-3xl mx-auto">
          Challenge your friends in real-time trivia battles. Be the first to answer correctly and climb the leaderboard!
        </p>
        
        // player inputs name  
        <div className="max-w-md mx-auto mb-8">
          <input
            type="text"
            value={playerName}
            onChange={(e) => {
              setPlayerName(e.target.value)
              localStorage.setItem('playerName', e.target.value)
            }}
            placeholder="Enter your name"
            className="w-full px-4 py-3 text-lg border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 mb-4"
            maxLength={20}
          />
        </div>
        
        <div className="flex flex-col sm:flex-row gap-6 justify-center items-center mb-16">
          <button 
            onClick={handleCreateGame}
            disabled={loading}
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xl px-12 py-4 rounded-xl disabled:opacity-50 hover:scale-105 transform transition-all duration-200 shadow-lg min-w-48"
          >
            {loading ? (
              <span className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Creating...
              </span>
            ) : ' Create New Game'}
          </button>
          
          <button 
            onClick={handleJoinGame}
            className="bg-green-600 hover:bg-green-700 text-white font-bold text-xl px-12 py-4 rounded-xl hover:scale-105 transform transition-all duration-200 shadow-lg min-w-48">
             Join Game
          </button>
          
          <button 
            onClick={handleViewHistory}
            className="bg-purple-600 hover:bg-purple-700 text-white font-bold text-xl px-12 py-4 rounded-xl hover:scale-105 transform transition-all duration-200 shadow-lg min-w-48"
          >
             Match History
          </button>
        </div>

        {/* Feature cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto mb-16">
          <div className="bg-white p-8 rounded-2xl shadow-xl hover:shadow-2xl transition-shadow">
            <div className="text-5xl mb-6">\_/</div>
            <h3 className="text-2xl font-semibold mb-4 text-gray-900">Real-time Battles</h3>
            <p className="text-gray-600 text-lg">Compete simultaneously with up to 6 friends in live trivia matches with instant scoring updates</p>
          </div>
          
          <div className="bg-white p-8 rounded-2xl shadow-xl hover:shadow-2xl transition-shadow">
            <div className="text-5xl mb-6">UwU</div>
            <h3 className="text-2xl font-semibold mb-4 text-gray-900">Smart Scoring</h3>
            <p className="text-gray-600 text-lg">First correct answer wins points. Faster answers earn bonus points. Strategy meets speed!</p>
          </div>
          
          <div className="bg-white p-8 rounded-2xl shadow-xl hover:shadow-2xl transition-shadow">
            <div className="text-5xl mb-6">_/</div>
            <h3 className="text-2xl font-semibold mb-4 text-gray-900">Track Progress</h3>
            <p className="text-gray-600 text-lg">View detailed match history, statistics, and see your improvement over time</p>
          </div>
        </div>

        {/* How to Play */}
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-4xl mx-auto">
          <h3 className="text-3xl font-bold mb-8 text-gray-900">How to Play</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="bg-blue-100 text-blue-800 rounded-full w-16 h-16 flex items-center justify-center text-2xl font-bold mx-auto mb-4">1</div>
              <h4 className="font-semibold text-lg mb-2">Create or Join</h4>
              <p className="text-gray-600">Start a new game or join with a room code</p>
            </div>
            <div className="text-center">
              <div className="bg-green-100 text-green-800 rounded-full w-16 h-16 flex items-center justify-center text-2xl font-bold mx-auto mb-4">2</div>
              <h4 className="font-semibold text-lg mb-2">Wait for Players</h4>
              <p className="text-gray-600">Invite friends and wait for everyone to join</p>
            </div>
            <div className="text-center">
              <div className="bg-yellow-100 text-yellow-800 rounded-full w-16 h-16 flex items-center justify-center text-2xl font-bold mx-auto mb-4">3</div>
              <h4 className="font-semibold text-lg mb-2">Answer Fast</h4>
              <p className="text-gray-600">Be the first to answer correctly to earn maximum points</p>
            </div>
            <div className="text-center">
              <div className="bg-purple-100 text-purple-800 rounded-full w-16 h-16 flex items-center justify-center text-2xl font-bold mx-auto mb-4">4</div>
              <h4 className="font-semibold text-lg mb-2">Win the Match</h4>
              <p className="text-gray-600">Player with the most points after all questions wins!</p>
            </div>
          </div>
        </div>

        {/* Tech Stack Info */}
        <div className="mt-16 text-center">
          <p className="text-gray-500 text-sm">
            Built with Next.js, MongoDB, and Supabase • Real-time multiplayer gaming
          </p>
        </div>
      </div>
    </div>
  )
}
