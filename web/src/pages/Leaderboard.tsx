import { useState, useEffect } from 'react';
import { api } from '../api/client';

interface Guild { guild_id: string; guild_name: string; guild_icon: string | null; }
interface LeaderboardEntry {
  rank: number; userId: string; username: string;
  totalPoints: number; gamesPlayed: number; gamesWon: number;
  currentStreak: number; maxStreak: number; avgPathLength: number;
}

const MEDALS = ['🥇', '🥈', '🥉'];

export function Leaderboard() {
  const [guilds, setGuilds] = useState<Guild[]>([]);
  const [selectedGuild, setSelectedGuild] = useState('');
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingBoard, setLoadingBoard] = useState(false);

  useEffect(() => {
    api.guilds()
      .then(data => {
        setGuilds(data.guilds);
        if (data.guilds.length > 0) setSelectedGuild(data.guilds[0].guild_id);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!selectedGuild) return;
    setLoadingBoard(true);
    api.leaderboard(selectedGuild)
      .then(data => setLeaderboard(data.leaderboard))
      .catch(() => setLeaderboard([]))
      .finally(() => setLoadingBoard(false));
  }, [selectedGuild]);

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-7 h-7 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  if (guilds.length === 0) return (
    <div className="text-center py-24 max-w-sm mx-auto">
      <div className="text-4xl mb-4">🏆</div>
      <h2 className="text-xl font-bold text-white mb-2" style={{ fontFamily: 'Rajdhani, sans-serif' }}>No Servers Found</h2>
      <p className="text-slate-500 text-sm">You and the Pro2Pro bot must share at least one Discord server.</p>
    </div>
  );

  return (
    <div className="space-y-8 page-enter max-w-3xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-4xl font-bold text-white" style={{ fontFamily: 'Rajdhani, sans-serif' }}>Leaderboard</h1>

        <select
          value={selectedGuild}
          onChange={e => setSelectedGuild(e.target.value)}
          className="px-4 py-2 rounded-xl bg-surface border border-white/[0.08] text-white text-sm focus:outline-none focus:border-orange-500/40 transition-colors appearance-none cursor-pointer"
        >
          {guilds.map(g => <option key={g.guild_id} value={g.guild_id}>{g.guild_name}</option>)}
        </select>
      </div>

      {loadingBoard ? (
        <div className="flex justify-center py-16">
          <div className="w-7 h-7 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : leaderboard.length === 0 ? (
        <div className="text-center py-16 text-slate-500">
          <p>No games played in this server yet.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {leaderboard.map((entry, i) => (
            <div
              key={entry.userId}
              className={`flex items-center gap-4 px-5 py-4 rounded-2xl border transition-colors ${
                i === 0 ? 'bg-amber-500/5 border-amber-500/20' :
                i === 1 ? 'bg-slate-500/5 border-slate-500/15' :
                i === 2 ? 'bg-orange-700/5 border-orange-700/15' :
                'bg-white/[0.02] border-white/[0.06] hover:bg-white/[0.04]'
              }`}
            >
              {/* Rank */}
              <div className="w-8 text-center flex-shrink-0">
                {i < 3
                  ? <span className="text-xl">{MEDALS[i]}</span>
                  : <span className="text-sm font-bold text-slate-600" style={{ fontFamily: 'Space Mono, monospace' }}>{entry.rank}</span>
                }
              </div>

              {/* Username */}
              <div className="flex-1 min-w-0">
                <div className={`font-semibold truncate ${i < 3 ? 'text-white' : 'text-slate-200'}`}>{entry.username}</div>
                <div className="text-xs text-slate-500 mt-0.5 hidden sm:block">
                  {entry.gamesPlayed} games · {entry.gamesWon} optimal · {entry.currentStreak > 0 ? `🔥 ${entry.currentStreak}` : 'no streak'}
                </div>
              </div>

              {/* Avg steps */}
              <div className="hidden md:block text-center">
                <div className="text-sm font-bold text-slate-300" style={{ fontFamily: 'Space Mono, monospace' }}>
                  {entry.avgPathLength > 0 ? entry.avgPathLength.toFixed(1) : '—'}
                </div>
                <div className="text-[9px] text-slate-600 uppercase tracking-widest mt-0.5">Avg steps</div>
              </div>

              {/* Points */}
              <div className="text-right flex-shrink-0">
                <div className={`text-lg font-bold ${i === 0 ? 'text-amber-400' : 'text-orange-400'}`} style={{ fontFamily: 'Space Mono, monospace' }}>
                  {entry.totalPoints}
                </div>
                <div className="text-[9px] text-slate-600 uppercase tracking-widest">pts</div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
