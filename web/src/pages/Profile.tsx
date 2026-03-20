import { useAuth } from '../hooks/useAuth';

export function Profile() {
  const { user, stats, totalPoints } = useAuth();

  if (!user) return null;

  const winRate = stats?.games_played > 0
    ? Math.round((stats.games_won / stats.games_played) * 100)
    : 0;

  const statCards = [
    { label: 'Points',       value: totalPoints,                             unit: 'pts',   color: 'text-orange-400', accent: 'border-orange-500/20 bg-orange-500/5' },
    { label: 'Played',       value: stats?.games_played ?? 0,                unit: 'games', color: 'text-white',       accent: 'border-white/[0.08] bg-white/[0.02]' },
    { label: 'Optimal',      value: stats?.games_won ?? 0,                   unit: 'wins',  color: 'text-green-400',   accent: 'border-green-500/20 bg-green-500/5' },
    { label: 'Streak',       value: stats?.current_streak ?? 0,              unit: 'days',  color: 'text-yellow-400',  accent: 'border-yellow-500/20 bg-yellow-500/5' },
    { label: 'Best Streak',  value: stats?.max_streak ?? 0,                  unit: 'days',  color: 'text-orange-400',  accent: 'border-orange-500/20 bg-orange-500/5' },
    { label: 'Avg Path',     value: (stats?.avg_path_length ?? 0).toFixed(1), unit: 'steps', color: 'text-sky-400',    accent: 'border-sky-500/20 bg-sky-500/5' },
  ];

  return (
    <div className="space-y-10 page-enter max-w-xl mx-auto">
      {/* Header */}
      <div className="text-center space-y-4 pt-4">
        <div className="relative inline-block">
          {user.avatar ? (
            <img
              src={`https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.png?size=128`}
              alt=""
              className="w-24 h-24 rounded-full mx-auto ring-2 ring-orange-500/40 ring-offset-2 ring-offset-[#08090f]"
            />
          ) : (
            <div className="w-24 h-24 rounded-full mx-auto bg-orange-500/20 ring-2 ring-orange-500/40 ring-offset-2 ring-offset-[#08090f] flex items-center justify-center text-3xl font-bold text-orange-400" style={{ fontFamily: 'Rajdhani, sans-serif' }}>
              {user.username?.[0]?.toUpperCase()}
            </div>
          )}
        </div>
        <div>
          <h1 className="text-3xl font-bold text-white" style={{ fontFamily: 'Rajdhani, sans-serif' }}>{user.username}</h1>
          <div className="text-orange-400 font-bold mt-1" style={{ fontFamily: 'Space Mono, monospace' }}>{totalPoints} points</div>
        </div>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-3 gap-3">
        {statCards.map(card => (
          <div key={card.label} className={`rounded-2xl border ${card.accent} p-4 text-center`}>
            <div className={`text-2xl font-bold ${card.color}`} style={{ fontFamily: 'Space Mono, monospace' }}>
              {card.value}
            </div>
            <div className="text-[9px] uppercase tracking-widest text-slate-600 mt-1">{card.label}</div>
          </div>
        ))}
      </div>

      {/* Win rate */}
      <div className="bg-white/[0.02] border border-white/[0.07] rounded-2xl p-6">
        <div className="flex items-end justify-between mb-3">
          <div>
            <div className="text-xs text-slate-500 uppercase tracking-widest mb-1">Optimal solve rate</div>
            <div className="text-4xl font-bold text-green-400" style={{ fontFamily: 'Rajdhani, sans-serif' }}>{winRate}%</div>
          </div>
          <div className="text-right text-sm text-slate-500">
            <div>{stats?.games_won ?? 0} optimal</div>
            <div>{stats?.games_played ?? 0} total</div>
          </div>
        </div>
        <div className="w-full bg-white/[0.05] rounded-full h-1.5 overflow-hidden">
          <div
            className="bg-gradient-to-r from-green-500 to-orange-500 h-full rounded-full transition-all duration-700"
            style={{ width: `${winRate}%` }}
          />
        </div>
      </div>
    </div>
  );
}
