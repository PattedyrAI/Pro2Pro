import { useState } from 'react';
import { PlayerSearch } from './PlayerSearch';
import { PlayerNode } from './PlayerNode';
import { ConnectionGraph } from './ConnectionGraph';
import { CompletionScreen } from './CompletionScreen';
import { GiveUpScreen } from './GiveUpScreen';
import type { TeamLink } from '../hooks/useGame';

interface Player {
  id: number;
  name: string;
  nationality?: string;
  imageUrl?: string;
}

interface GameBoardProps {
  forwardPath: Player[];
  backwardPath: Player[];
  teamLinks: TeamLink[];
  complete: boolean;
  givenUp: boolean;
  result: any | null;
  solutions: any[] | null;
  error: string | null;
  loading: boolean;
  onGuess: (playerId: number, direction: 'forward' | 'backward') => void;
  onGiveUp: () => void;
  onPlayAgain?: () => void;
  optimalLength?: number;
  difficulty?: string;
}

export function GameBoard({
  forwardPath, backwardPath, teamLinks,
  complete, givenUp, result, solutions,
  error, loading, onGuess, onGiveUp, onPlayAgain,
  optimalLength, difficulty,
}: GameBoardProps) {
  const [direction, setDirection] = useState<'forward' | 'backward'>('forward');

  if (complete && result) {
    return <CompletionScreen result={result} teamLinks={teamLinks} difficulty={difficulty} onPlayAgain={onPlayAgain} />;
  }
  if (givenUp && solutions) {
    return <GiveUpScreen solutions={solutions} onPlayAgain={onPlayAgain} />;
  }

  const startPlayer = forwardPath[0];
  const endPlayer = backwardPath[0];
  const par = optimalLength ? optimalLength + 2 : undefined;
  const totalSteps = (forwardPath.length - 1) + (backwardPath.length - 1);

  return (
    <div className="space-y-8">
      {/* Difficulty badge */}
      {difficulty && (
        <div className="flex justify-center">
          <span className="text-[11px] font-bold tracking-widest uppercase px-3 py-1 rounded-full border border-white/10 bg-white/[0.04] text-slate-400">
            {difficulty}
          </span>
        </div>
      )}

      {/* Goalposts */}
      <div className="flex items-start justify-center gap-12 sm:gap-20">
        <div className="flex flex-col items-center gap-2">
          <PlayerNode name={startPlayer?.name ?? '?'} imageUrl={startPlayer?.imageUrl} nationality={startPlayer?.nationality} variant="start" size="lg" />
          <span className="text-[10px] font-semibold text-green-500/70 uppercase tracking-widest">Start</span>
        </div>

        <div className="flex items-center pt-6 gap-1.5 opacity-25">
          <div className="w-2 h-2 rounded-full bg-slate-500" />
          <div className="w-2 h-2 rounded-full bg-slate-500" />
          <div className="w-2 h-2 rounded-full bg-slate-500" />
        </div>

        <div className="flex flex-col items-center gap-2">
          <PlayerNode name={endPlayer?.name ?? '?'} imageUrl={endPlayer?.imageUrl} nationality={endPlayer?.nationality} variant="end" size="lg" />
          <span className="text-[10px] font-semibold text-red-500/70 uppercase tracking-widest">End</span>
        </div>
      </div>

      {/* Connection graph */}
      {(forwardPath.length > 1 || backwardPath.length > 1) && (
        <ConnectionGraph forwardPath={forwardPath} backwardPath={backwardPath} teamLinks={teamLinks} complete={false} />
      )}

      {/* Direction pill toggle */}
      <div className="flex justify-center">
        <div className="inline-flex p-1 rounded-xl bg-white/[0.04] border border-white/[0.08]">
          <button
            onClick={() => setDirection('forward')}
            className={`px-5 py-2 rounded-lg text-sm font-medium transition-all duration-150 ${
              direction === 'forward'
                ? 'bg-orange-500 text-white shadow-sm shadow-orange-500/30'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            From Start →
          </button>
          <button
            onClick={() => setDirection('backward')}
            className={`px-5 py-2 rounded-lg text-sm font-medium transition-all duration-150 ${
              direction === 'backward'
                ? 'bg-orange-500 text-white shadow-sm shadow-orange-500/30'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            ← From End
          </button>
        </div>
      </div>

      {/* Search */}
      <div className="flex justify-center">
        <PlayerSearch
          onSelect={(player) => onGuess(player.id, direction)}
          placeholder={direction === 'forward' ? 'Add to start chain…' : 'Add to end chain…'}
          disabled={loading}
        />
      </div>

      {/* Error */}
      {error && (
        <div className="text-center text-red-400 text-sm bg-red-500/8 border border-red-500/20 rounded-xl px-4 py-3 max-w-md mx-auto">
          {error}
        </div>
      )}

      {/* Stats row */}
      <div className="flex justify-center items-center gap-6 text-sm">
        {par != null && (
          <div className="text-center">
            <div className="text-xs text-slate-500 uppercase tracking-widest mb-0.5">Par</div>
            <div className="text-orange-400 font-bold" style={{ fontFamily: 'Space Mono, monospace' }}>{par}</div>
          </div>
        )}
        {optimalLength != null && (
          <div className="text-center">
            <div className="text-xs text-slate-500 uppercase tracking-widest mb-0.5">Shortest</div>
            <div className="text-orange-400 font-bold" style={{ fontFamily: 'Space Mono, monospace' }}>{optimalLength}</div>
          </div>
        )}
        {totalSteps > 0 && (
          <div className="text-center">
            <div className="text-xs text-slate-500 uppercase tracking-widest mb-0.5">Steps</div>
            <div className="text-white font-bold" style={{ fontFamily: 'Space Mono, monospace' }}>{totalSteps}</div>
          </div>
        )}
        <div className="h-8 w-px bg-white/[0.08]" />
        <button
          onClick={onGiveUp}
          disabled={loading}
          className="text-xs text-slate-600 hover:text-red-400 transition-colors disabled:opacity-40"
        >
          Give up
        </button>
      </div>
    </div>
  );
}
