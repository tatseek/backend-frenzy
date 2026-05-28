'use client'

export default function PlayersList({ players = [], maxPlayers = 6 }) {
  return (
    <div className="bg-white rounded-lg p-4 border border-gray-200">
      <h4 className="text-lg font-semibold mb-4 text-center">
        Players ({players.length}/{maxPlayers})
      </h4>
      
      <div className="space-y-3">
        {players.map((player, index) => (
          <div
            key={player.id}
            className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
          >
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-blue-500 text-white rounded-full flex items-center justify-center font-bold">
                {(player.name || `Player ${index + 1}`).charAt(0).toUpperCase()}
              </div>
              <div>
                <div className="font-medium text-gray-900">
                  {player.name || `Player ${index + 1}`}
                </div>
                {index === 0 && (
                  <div className="text-sm text-blue-600">Host</div>
                )}
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              {player.ready ? (
                <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-sm">Ready</span>
              ) : (
                <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded text-sm">Waiting</span>
              )}
            </div>
          </div>
        ))}
        
        {/* Empty slots */}
        {Array.from({ length: maxPlayers - players.length }).map((_, index) => (
          <div
            key={`empty-${index}`}
            className="flex items-center justify-center p-3 bg-gray-100 rounded-lg border-2 border-dashed border-gray-300"
          >
            <span className="text-gray-500">Waiting for player...</span>
          </div>
        ))}
      </div>
    </div>
  )
}
