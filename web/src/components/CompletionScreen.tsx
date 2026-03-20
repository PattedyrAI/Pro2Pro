interface PathPlayer {
  id: number;
  name: string;
  nationality?: string;
  imageUrl?: string | null;
}

interface PathTeamLink {
  fromId: number;
  toId: number;
  teams: { name: string; fullName?: string; imageUrl: string | null }[];
}

interface CompletionResult {
  pathLength: number;
  optimalLength: number;
  par: number;
  scoreToPar: number;
  rating: string;
  isOptimal: boolean;
  points?: { total: number; breakdown: { reason: string; points: number }[] } | null;
  path?: PathPlayer[];
  pathTeamLinks?: PathTeamLink[];
}

interface CompletionScreenProps {
  result: CompletionResult;
  teamLinks: { fromId: number; toId: number; teams: { name: string; imageUrl: string | null }[] }[];
  difficulty?: string;
  onPlayAgain?: () => void;
}

const RATING_STYLE: Record<string, { badge: string; glow: string; text: string }> = {
  Perfect:    { badge: 'bg-emerald-500/15 border-emerald-500/40 text-emerald-300', glow: 'shadow-emerald-500/15', text: 'text-emerald-400' },
  Great:      { badge: 'bg-green-500/15 border-green-500/40 text-green-300',       glow: 'shadow-green-500/15',   text: 'text-green-400' },
  Good:       { badge: 'bg-orange-500/15 border-orange-500/40 text-orange-300',     glow: 'shadow-orange-500/15',  text: 'text-orange-400' },
  Okay:       { badge: 'bg-yellow-500/15 border-yellow-500/40 text-yellow-300',     glow: 'shadow-yellow-500/15',  text: 'text-yellow-400' },
  'Nice Try': { badge: 'bg-amber-500/15 border-amber-500/40 text-amber-300',        glow: 'shadow-amber-500/15',   text: 'text-amber-400' },
  Overcooked: { badge: 'bg-red-500/15 border-red-500/40 text-red-300',              glow: 'shadow-red-500/15',     text: 'text-red-400' },
};

function scoreToPar(n: number): string {
  if (n === 0) return 'E';
  return n > 0 ? `+${n}` : `${n}`;
}

function pickBestTeam(teams: { name: string; fullName?: string; imageUrl: string | null }[]) {
  return teams.find(t => t.imageUrl) ?? teams[0] ?? null;
}

export function CompletionScreen({ result, teamLinks, difficulty, onPlayAgain }: CompletionScreenProps) {
  const style = RATING_STYLE[result.rating] ?? RATING_STYLE.Good;
  const path = result.path ?? [];
  const links = result.pathTeamLinks ?? teamLinks;

  function findTeam(fromId: number, toId: number) {
    const link = links.find(l =>
      (l.fromId === fromId && l.toId === toId) || (l.fromId === toId && l.toId === fromId)
    );
    return link ? pickBestTeam(link.teams) : null;
  }

  const par = result.par;
  const blocks = Array.from({ length: result.pathLength }, (_, i) => {
    if (i < par - 1) return '🟩';
    if (i < par + 1) return '🟨';
    return '🟥';
  });

  return (
    <div className="space-y-8 page-enter">
      {/* Rating */}
      <div className={`text-center py-8 px-6 rounded-2xl border shadow-2xl ${style.badge} ${style.glow}`}>
        <div className="text-5xl sm:text-6xl font-bold tracking-tight mb-2" style={{ fontFamily: 'Rajdhani, sans-serif' }}>
          {result.rating}
        </div>
        <div className="flex items-center justify-center gap-3 text-sm opacity-80">
          <span>{result.isOptimal ? '🎯 Shortest path!' : `${scoreToPar(result.scoreToPar)} to par`}</span>
          {difficulty && <><span>·</span><span className="capitalize">{difficulty}</span></>}
        </div>
        {/* Wordle-style blocks */}
        <div className="mt-4 text-xl tracking-wider">{blocks.join('')}</div>
      </div>

      {/* Path visualization */}
      {path.length > 0 && (
        <div>
          <div className="text-center text-[10px] font-bold uppercase tracking-widest text-slate-600 mb-4">Your Path</div>

          {/* Desktop horizontal */}
          <div className="hidden sm:flex items-center justify-center gap-1 overflow-x-auto py-3 px-4 flex-wrap">
            {path.map((player, i) => {
              const isStart = i === 0;
              const isEnd = i === path.length - 1;
              const team = path[i + 1] ? findTeam(player.id, path[i + 1].id) : null;
              const ring = isStart ? 'ring-green-500' : isEnd ? 'ring-red-500' : 'ring-orange-500/60';
              const label = isStart ? 'bg-green-500/10 text-green-400' : isEnd ? 'bg-red-500/10 text-red-400' : 'bg-orange-500/10 text-orange-400';

              return (
                <div key={player.id} className="flex items-center">
                  <div className="flex flex-col items-center gap-1.5">
                    <div className={`w-14 h-14 rounded-full ring-2 ${ring} overflow-hidden bg-surface flex-shrink-0`}>
                      {player.imageUrl
                        ? <img src={player.imageUrl} alt={player.name} className="w-full h-full object-cover" />
                        : <div className="w-full h-full flex items-center justify-center text-sm font-bold text-slate-500">{player.name.slice(0, 2).toUpperCase()}</div>
                      }
                    </div>
                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full max-w-[5.5rem] truncate ${label}`}>{player.name}</span>
                  </div>
                  {path[i + 1] && (
                    <div className="flex flex-col items-center mx-1 mb-4">
                      {team?.imageUrl
                        ? <img src={team.imageUrl} alt={team.name} title={team.fullName ?? team.name} className="w-7 h-7 rounded-md object-contain bg-white/5 p-0.5" />
                        : team
                          ? <span className="text-[9px] font-bold text-orange-400 bg-orange-500/10 border border-orange-500/20 px-1.5 py-0.5 rounded whitespace-nowrap">{team.name}</span>
                          : null
                      }
                      <div className="w-6 h-px bg-slate-700 mt-1" />
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Mobile stacked */}
          <div className="sm:hidden space-y-1.5 px-1">
            {path.map((player, i) => {
              const isStart = i === 0;
              const isEnd = i === path.length - 1;
              const team = path[i + 1] ? findTeam(player.id, path[i + 1].id) : null;
              const accent = isStart ? 'border-l-green-500' : isEnd ? 'border-l-red-500' : 'border-l-orange-500/60';

              return (
                <div key={player.id}>
                  <div className={`flex items-center gap-3 bg-white/[0.03] border border-white/[0.06] border-l-2 ${accent} rounded-xl px-3 py-2.5`}>
                    <div className="w-9 h-9 rounded-full overflow-hidden bg-surface flex-shrink-0">
                      {player.imageUrl
                        ? <img src={player.imageUrl} alt="" className="w-full h-full object-cover" />
                        : <div className="w-full h-full flex items-center justify-center text-xs font-bold text-slate-500">{player.name.slice(0, 2).toUpperCase()}</div>
                      }
                    </div>
                    <span className="flex-1 text-sm font-semibold text-white truncate">{player.name}</span>
                    {team && (
                      team.imageUrl
                        ? <img src={team.imageUrl} alt={team.name} className="w-6 h-6 rounded object-contain bg-white/5 flex-shrink-0" />
                        : <span className="text-[10px] font-bold text-orange-400 bg-orange-500/10 px-1.5 py-0.5 rounded flex-shrink-0">{team.name}</span>
                    )}
                    {path[i + 1] && <span className="text-slate-700 text-xs">↓</span>}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Stats grid */}
      <div className="grid grid-cols-4 gap-2 max-w-sm mx-auto">
        {[
          { label: 'Steps', value: result.pathLength },
          { label: 'Shortest', value: result.optimalLength },
          { label: 'Par', value: result.par },
          { label: 'Points', value: result.points?.total ?? 0, accent: true },
        ].map(stat => (
          <div key={stat.label} className="text-center bg-white/[0.03] border border-white/[0.06] rounded-xl py-3.5">
            <div className={`text-xl font-bold ${stat.accent ? 'text-orange-400' : 'text-white'}`} style={{ fontFamily: 'Space Mono, monospace' }}>
              {stat.value}
            </div>
            <div className="text-[9px] uppercase tracking-wider text-slate-600 mt-0.5">{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Points breakdown */}
      {result.points?.breakdown && result.points.breakdown.length > 0 && (
        <div className="max-w-xs mx-auto bg-white/[0.02] border border-white/[0.05] rounded-xl p-4 space-y-2">
          {result.points.breakdown.map((b, i) => (
            <div key={i} className="flex justify-between items-center text-sm">
              <span className="text-slate-400 capitalize">{b.reason}</span>
              <span className="text-orange-400 font-bold text-xs" style={{ fontFamily: 'Space Mono, monospace' }}>+{b.points}</span>
            </div>
          ))}
        </div>
      )}

      {/* Play again */}
      {onPlayAgain && (
        <div className="flex justify-center">
          <button
            onClick={onPlayAgain}
            className="px-8 py-3 rounded-xl bg-orange-500 hover:bg-orange-400 text-white font-semibold transition-all duration-150 shadow-lg shadow-orange-500/20 hover:shadow-orange-500/30 hover:-translate-y-0.5"
          >
            Play Again
          </button>
        </div>
      )}
    </div>
  );
}
