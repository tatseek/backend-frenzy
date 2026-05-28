'use client'

export default function Scoreboard({ players = [], title = "Leaderboard" }) {
  const sortedPlayers = [...players].sort((a, b) => (b.score || 0) - (a.score || 0))

  const getRankBadge = (rank) => {
    const baseClass = "inline-flex items-center justify-center w-8 h-8 rounded-full font-bold text-sm "
    
    switch(rank) {
      case 1: return baseClass + "bg-yellow-500 text-white"
      case 2: return baseClass + "bg-gray-400 text-white"  
      case 3: return baseClass + "bg-orange-600 text-white"
      default: return baseClass + "bg-gray-200 text-gray-700"
    }
  }

  const getRankIcon = (rank) => {
    switch(rank) {
      case 1: return "1st"
      case 2: return "2nd"
      case 3: return "3rd"
      default: return ""
    }
  }

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <h3 className="text-xl font-bold text-gray-900 mb-6 text-center">{title}</h3>
      
      {sortedPlayers.length === 0 ? (
        <p className="text-gray-500 text-center">No players yet</p>
      ) : (
        <div className="space-y-4">
          {sortedPlayers.map((player, index) => {
            const rank = index + 1
            return (
              <div
                key={player.id}
                className={`flex items-center justify-between p-4 rounded-lg border transition-all ${
                  rank === 1 ? 'bg-yellow-50 border-yellow-200' :
                  rank === 2 ? 'bg-gray-50 border-gray-200' :
                  rank === 3 ? 'bg-orange-50 border-orange-200' :
                  'bg-white border-gray-200'
                }`}
              >
                <div className="flex items-center space-x-4">
                  <div className={getRankBadge(rank)}>
                    {rank}
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900 flex items-center">
                      {getRankIcon(rank)} {player.name || `Player ${player.id.slice(0, 6)}`}
                    </div>
                    {rank === 1 && sortedPlayers.length > 1 && (
                      <div className="text-sm text-yellow-600 font-medium">Leading!</div>
                    )}
                  </div>
                </div>
                
                <div className="text-right">
                  <div className="text-2xl font-bold text-gray-900">
                    {player.score || 0}
                  </div>
                  <div className="text-sm text-gray-500">points</div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Score Statistics */}
      {sortedPlayers.length > 0 && (
        <div className="mt-6 pt-4 border-t border-gray-200">
          <div className="grid grid-cols-2 gap-4 text-center">
            <div>
              <div className="text-lg font-bold text-gray-900">
                {Math.max(...sortedPlayers.map(p => p.score || 0))}
              </div>
              <div className="text-sm text-gray-500">Highest Score</div>
            </div>
            <div>
              <div className="text-lg font-bold text-gray-900">
                {Math.round(sortedPlayers.reduce((sum, p) => sum + (p.score || 0), 0) / sortedPlayers.length)}
              </div>
              <div className="text-sm text-gray-500">Average</div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
