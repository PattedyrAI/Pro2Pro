interface PathPlayer {
  id: number;
  name: string;
  nationality?: string;
}

interface PathDisplayProps {
  forwardPath: PathPlayer[];
  backwardPath: PathPlayer[];
  complete?: boolean;
}

export function PathDisplay({ forwardPath, backwardPath, complete }: PathDisplayProps) {
  return (
    <div className="flex flex-col items-center gap-1 py-4">
      {/* Forward path */}
      {forwardPath.map((player, i) => (
        <div key={`fwd-${player.id}`} className="flex flex-col items-center">
          {i > 0 && (
            <div className="w-px h-6 bg-gradient-to-b from-cyan-500/50 to-cyan-500/20" />
          )}
          <div className={`px-4 py-2 rounded-lg border text-sm font-medium transition-all ${
            i === 0
              ? 'bg-green-500/10 border-green-500/40 text-green-400 shadow-lg shadow-green-500/10'
              : 'bg-cyan-500/10 border-cyan-500/30 text-cyan-300'
          }`}>
            {player.name || '???'}
          </div>
        </div>
      ))}

      {/* Gap between paths */}
      {!complete && forwardPath.length > 0 && backwardPath.length > 0 && (
        <div className="flex flex-col items-center">
          <div className="w-px h-6 bg-gradient-to-b from-cyan-500/20 to-transparent" />
          <div className="text-gray-500 text-xs py-1">???</div>
          <div className="w-px h-6 bg-gradient-to-b from-transparent to-purple-500/20" />
        </div>
      )}

      {/* Backward path (reversed for display) */}
      {[...backwardPath].reverse().map((player, i) => (
        <div key={`bwd-${player.id}`} className="flex flex-col items-center">
          {(i > 0 || !complete) && (
            <div className="w-px h-6 bg-gradient-to-b from-purple-500/20 to-purple-500/50" />
          )}
          <div className={`px-4 py-2 rounded-lg border text-sm font-medium transition-all ${
            i === backwardPath.length - 1
              ? 'bg-red-500/10 border-red-500/40 text-red-400 shadow-lg shadow-red-500/10'
              : 'bg-purple-500/10 border-purple-500/30 text-purple-300'
          }`}>
            {player.name || '???'}
          </div>
        </div>
      ))}
    </div>
  );
}
