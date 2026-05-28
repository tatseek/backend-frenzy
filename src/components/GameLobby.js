'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function GameLobby() {
  const [gameId, setGameId] = useState('')
  const [playerName, setPlayerName] = useState('')
  const [loading, setLoading] = useState(false)
  const [availableGames, setAvailableGames] = useState([])
  const router = useRouter()

  useEffect(() => {
    fetchAvailableGames()
    const interval = setInterval(fetchAvailableGames, 5000)
    return () => clearInterval(interval)
  }, [])

  const fetchAvailableGames = async () => {
    try {
      const response = await fetch('/api/games')
      const data = await response.json()
      setAvailableGames(data.games || [])
    } catch (error) {
      console.error('Error fetching games:', error)
    }
  }

  const handleJoinGame = async (targetGameId) => {
    if (!playerName.trim()) {
      alert('Please enter your name first!')
      return
    }

    try {
      setLoading(true)
      const playerId = 'player_' + Math.random().toString(36).substr(2, 9)
      
      const response = await fetch(`/api/games/${targetGameId}/join`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          playerId,
          playerName: playerName.trim()
        })
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to join game')
      }

      // Store player info in localStorage for the game session
      localStorage.setItem('currentPlayer', JSON.stringify({
        id: playerId,
        name: playerName.trim()
      }))

      router.push(`/game/${targetGameId}`)
    } catch (error) {
      alert(error.message)
    } finally {
      setLoading(false)
    }
  }

  const handleJoinById = () => {
    if (!gameId.trim()) {
      alert('Please enter a Game ID!')
      return
    }
    handleJoinGame(gameId.trim().toUpperCase())
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Join a Game</h1>
        <p className="text-gray-600">Enter your name and join an existing game</p>
      </div>

      {/* Player Name Input */}
      <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Your Name
        </label>
        <input
          type="text"
          value={playerName}
          onChange={(e) => setPlayerName(e.target.value)}
          placeholder="Enter your name"
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          maxLength={20}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Join by Game ID */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Join by Game ID</h2>
          <div className="space-y-4">
            <input
              type="text"
              value={gameId}
              onChange={(e) => setGameId(e.target.value.toUpperCase())}
              placeholder="Enter Game ID (e.g., ABC123)"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              maxLength={6}
            />
            <button
              onClick={handleJoinById}
              disabled={loading || !gameId.trim() || !playerName.trim()}
              className="w-full btn-primary disabled:opacity-50"
            >
              {loading ? 'Joining...' : 'Join Game'}
            </button>
          </div>
        </div>

        {/* Available Games */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Available Games</h2>
          <div className="space-y-3 max-h-64 overflow-y-auto">
            {availableGames.length === 0 ? (
              <p className="text-gray-500 text-center py-8">No games available</p>
            ) : (
              availableGames.map((game) => (
                <div
                  key={game.id}
                  className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <div className="font-semibold text-lg">Game {game.id}</div>
                      <div className="text-sm text-gray-600">
                        Host: {game.hostName} • Players: {game.players.length}/6
                      </div>
                      <div className="text-xs text-gray-500">
                        Created {new Date(game.createdAt).toLocaleTimeString()}
                      </div>
                    </div>
                    <button
                      onClick={() => handleJoinGame(game.id)}
                      disabled={loading || game.players.length >= 6 || !playerName.trim()}
                      className="btn-primary text-sm px-4 py-2 disabled:opacity-50"
                    >
                      {game.players.length >= 6 ? 'Full' : 'Join'}
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
          
          {availableGames.length > 0 && (
            <button
              onClick={fetchAvailableGames}
              className="w-full mt-4 btn-secondary text-sm"
            >
              Refresh Games
            </button>
          )}
        </div>
      </div>

      <div className="text-center mt-8">
        <button
          onClick={() => router.push('/')}
          className="text-blue-600 hover:underline"
        >
          ← Back to Home
        </button>
      </div>
    </div>
  )
}
