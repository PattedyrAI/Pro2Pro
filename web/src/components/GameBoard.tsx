import { useState } from 'react';
import { PlayerSearch } from './PlayerSearch';
import { PathDisplay } from './PathDisplay';

interface Player {
  id: number;
  name: string;
  nationality?: string;
}

interface GameBoardProps {
  forwardPath: Player[];
  backwardPath: Player[];
  complete: boolean;
  givenUp: boolean;
  result: any | null;
  solutions: any[] | null;
  error: string | null;
  loading: boolean;
  onGuess: (playerId: number, direction: 'forward' | 'backward') => void;
  onGiveUp: () => void;
  optimalLength?: number;
  difficulty?: string;
}

export function GameBoard({
  forwardPath,
  backwardPath,
  complete,
  givenUp,
  result,
  solutions,
  error,
  loading,
  onGuess,
  onGiveUp,
  optimalLength,
  difficulty,
}: GameBoardProps) {
  const [direction, setDirection] = useState<'forward' | 'backward'>('forward');

  if (complete && result) {
    return (
      <div className="text-center space-y-6">
        <div className="text-6xl mb-4">{result.isOptimal ? '\uD83C\uDFC6' : '\uD83C\uDF89'}</div>
        <h2 className="text-2xl font-bold text-cyan-400">
          {result.isOptimal ? 'Optimal!' : 'Completed!'}
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-lg mx-auto">
          <div className="bg-gray-900/50 border border-cyan-500/20 rounded-xl p-4">
            <div className="text-2xl font-mono font-bold text-white">{result.pathLength}</div>
            <div className="text-xs text-gray-400">Steps</div>
          </div>
          <div className="bg-gray-900/50 border border-cyan-500/20 rounded-xl p-4">
            <div className="text-2xl font-mono font-bold text-white">{result.optimalLength}</div>
            <div className="text-xs text-gray-400">Optimal</div>
          </div>
          <div className="bg-gray-900/50 border border-cyan-500/20 rounded-xl p-4">
            <div className="text-2xl font-mono font-bold text-cyan-400">{result.points?.total ?? 0}</div>
            <div className="text-xs text-gray-400">Points</div>
          </div>
          {difficulty && (
            <div className="bg-gray-900/50 border border-cyan-500/20 rounded-xl p-4">
              <div className="text-2xl font-mono font-bold text-white capitalize">{difficulty}</div>
              <div className="text-xs text-gray-400">Difficulty</div>
            </div>
          )}
        </div>
        {result.points?.breakdown && (
          <div className="max-w-xs mx-auto space-y-1">
            {result.points.breakdown.map((b: any, i: number) => (
              <div key={i} className="flex justify-between text-sm">
                <span className="text-gray-400 capitalize">{b.reason}</span>
                <span className="text-cyan-400 font-mono">+{b.points}</span>
              </div>
            ))}
          </div>
        )}
        <PathDisplay forwardPath={result.path ?? forwardPath} backwardPath={[]} complete={true} />
      </div>
    );
  }

  if (givenUp && solutions) {
    return (
      <div className="text-center space-y-6">
        <div className="text-6xl mb-4">{'\uD83D\uDE14'}</div>
        <h2 className="text-2xl font-bold text-red-400">Given Up</h2>
        <div className="space-y-4">
          <h3 className="text-sm text-gray-400">Solution{solutions.length > 1 ? 's' : ''}:</h3>
          {solutions.map((path, idx) => (
            <div key={idx} className="bg-gray-900/50 border border-gray-700 rounded-xl p-4">
              <div className="flex items-center justify-center gap-2 flex-wrap">
                {path.map((p: any, i: number) => (
                  <span key={p.id} className="flex items-center gap-1">
                    <span className="text-sm text-white">{p.name}</span>
                    {i < path.length - 1 && <span className="text-gray-500 mx-1">{'\u2192'}</span>}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Path visualization */}
      <PathDisplay forwardPath={forwardPath} backwardPath={backwardPath} />

      {/* Direction toggle */}
      <div className="flex justify-center gap-2">
        <button
          onClick={() => setDirection('forward')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
            direction === 'forward'
              ? 'bg-cyan-500/20 border border-cyan-500/50 text-cyan-400'
              : 'bg-gray-900/50 border border-gray-700 text-gray-400 hover:text-white'
          }`}
        >
          Add from Start {'\u2192'}
        </button>
        <button
          onClick={() => setDirection('backward')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
            direction === 'backward'
              ? 'bg-purple-500/20 border border-purple-500/50 text-purple-400'
              : 'bg-gray-900/50 border border-gray-700 text-gray-400 hover:text-white'
          }`}
        >
          {'\u2190'} Add from End
        </button>
      </div>

      {/* Search */}
      <div className="flex justify-center">
        <PlayerSearch
          onSelect={(player) => onGuess(player.id, direction)}
          placeholder={`Search player to add ${direction === 'forward' ? 'after start' : 'before end'}...`}
          disabled={loading}
        />
      </div>

      {/* Error */}
      {error && (
        <div className="text-center text-red-400 text-sm bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3 max-w-md mx-auto">
          {error}
        </div>
      )}

      {/* Info bar */}
      <div className="flex justify-center items-center gap-6 text-sm text-gray-400">
        {optimalLength && <span>Optimal: <span className="text-cyan-400 font-mono">{optimalLength}</span> steps</span>}
        <button
          onClick={onGiveUp}
          disabled={loading}
          className="text-red-400/60 hover:text-red-400 transition-colors text-xs"
        >
          Give Up
        </button>
      </div>
    </div>
  );
}
