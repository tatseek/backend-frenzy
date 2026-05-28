'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function HistoryPage() {
  const [matches, setMatches] = useState([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    // For now, show sample data. In a real app, you'd fetch from API
    const sampleMatches = [
      {
        id: 1,
        gameId: 'ABC123',
        date: new Date().toISOString(),
        players: 4,
        yourScore: 2850,
        maxScore: 3200,
        rank: 2,
        status: 'completed'
      },
      {
        id: 2,
        gameId: 'XYZ789',
        date: new Date(Date.now() - 86400000).toISOString(),
        players: 3,
        yourScore: 3100,
        maxScore: 3100,
        rank: 1,
        status: 'completed'
      }
    ]
    
    setTimeout(() => {
      setMatches(sampleMatches)
      setLoading(false)
    }, 1000)
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4"> Match History</h1>
        <p className="text-gray-600">Your recent game performance</p>
      </div>

      {matches.length === 0 ? (
        <div className="text-center py-16">
          <div className="text-6xl mb-4">🎮</div>
          <h2 className="text-2xl font-bold text-gray-700 mb-4">No matches yet!</h2>
          <p className="text-gray-500 mb-8">Play some games to see your history here</p>
          <button
            onClick={() => router.push('/')}
            className="btn-primary"
          >
            Start Playing
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {matches.map((match) => (
            <div key={match.id} className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex justify-between items-start">
                <div>
                  <div className="flex items-center space-x-3">
                    <h3 className="text-xl font-bold">Game {match.gameId}</h3>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                      match.rank === 1 ? 'bg-yellow-100 text-yellow-800' :
                      match.rank === 2 ? 'bg-gray-100 text-gray-800' :
                      match.rank === 3 ? 'bg-orange-100 text-orange-800' :
                      'bg-blue-100 text-blue-800'
                    }`}>
                      {match.rank === 1 ? ' Winner!' : `#${match.rank} Place`}
                    </span>
                  </div>
                  <p className="text-gray-600 mt-2">
                    {match.players} players • {new Date(match.date).toLocaleDateString()}
                  </p>
                </div>
                
                <div className="text-right">
                  <div className="text-3xl font-bold text-gray-900">
                    {match.yourScore}
                  </div>
                  <div className="text-sm text-gray-500">
                    Max: {match.maxScore}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

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
