import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

const DISCORD_CLIENT_ID = import.meta.env.VITE_DISCORD_CLIENT_ID;
const REDIRECT_URI = `${window.location.origin}/callback`;
const loginUrl = `https://discord.com/api/oauth2/authorize?client_id=${DISCORD_CLIENT_ID}&redirect_uri=${encodeURIComponent(REDIRECT_URI)}&response_type=code&scope=identify+guilds`;

const NAV_LINKS = [
  { to: '/daily', label: 'Daily' },
  { to: '/random', label: 'Random' },
  { to: '/custom', label: 'Custom' },
  { to: '/archive', label: 'Archive' },
  { to: '/leaderboard', label: 'Leaderboard' },
];

function DiscordIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03z" />
    </svg>
  );
}

export function Navbar() {
  const { user, loggedIn, logout, totalPoints } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();

  const isActive = (to: string) => location.pathname === to;

  return (
    <nav className="fixed top-0 w-full z-50 border-b border-white/[0.06] bg-[#08090f]/85 backdrop-blur-xl">
      <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between gap-8">

        {/* Logo */}
        <Link to="/" className="flex-shrink-0 flex items-baseline gap-1">
          <span className="text-xl font-bold text-white" style={{ fontFamily: 'Rajdhani, sans-serif', letterSpacing: '0.02em' }}>
            Pro<span className="text-orange-500">2</span>Pro
          </span>
        </Link>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-1 flex-1">
          {NAV_LINKS.map(({ to, label }) => (
            <Link
              key={to}
              to={to}
              className={`px-3 py-1.5 rounded-lg text-sm transition-all duration-150 ${
                isActive(to)
                  ? 'text-white bg-white/[0.07] font-medium'
                  : 'text-slate-400 hover:text-white hover:bg-white/[0.04]'
              }`}
            >
              {label}
            </Link>
          ))}
        </div>

        {/* Desktop auth */}
        <div className="hidden md:flex items-center gap-3">
          {loggedIn ? (
            <>
              <span className="text-xs text-orange-400 font-bold" style={{ fontFamily: 'Space Mono, monospace' }}>
                {totalPoints} pts
              </span>
              <Link
                to="/profile"
                className="flex items-center gap-2 group"
              >
                {user?.avatar ? (
                  <img
                    src={`https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.png?size=32`}
                    alt=""
                    className="w-7 h-7 rounded-full ring-1 ring-white/10 group-hover:ring-orange-500/50 transition-all"
                  />
                ) : (
                  <div className="w-7 h-7 rounded-full bg-orange-500/20 ring-1 ring-orange-500/30 flex items-center justify-center text-[10px] font-bold text-orange-400">
                    {user?.username?.[0]?.toUpperCase()}
                  </div>
                )}
                <span className="text-sm text-slate-300 group-hover:text-white transition-colors">{user?.username}</span>
              </Link>
              <button
                onClick={logout}
                className="text-xs text-slate-600 hover:text-red-400 transition-colors"
              >
                Out
              </button>
            </>
          ) : (
            <a
              href={loginUrl}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-white/10 bg-white/[0.04] hover:bg-white/[0.07] text-slate-300 hover:text-white text-sm transition-all duration-150"
            >
              <DiscordIcon className="w-4 h-4 text-indigo-400" />
              <span>Sign in</span>
            </a>
          )}
        </div>

        {/* Mobile hamburger */}
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="md:hidden flex flex-col gap-1.5 p-1.5"
          aria-label="Toggle menu"
        >
          <span className={`block w-5 h-[1.5px] bg-slate-300 transition-all origin-center ${menuOpen ? 'rotate-45 translate-y-[7px]' : ''}`} />
          <span className={`block w-5 h-[1.5px] bg-slate-300 transition-all ${menuOpen ? 'opacity-0 scale-x-0' : ''}`} />
          <span className={`block w-5 h-[1.5px] bg-slate-300 transition-all origin-center ${menuOpen ? '-rotate-45 -translate-y-[7px]' : ''}`} />
        </button>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden border-t border-white/[0.06] bg-[#08090f]/95 backdrop-blur-xl px-4 pb-5 pt-3 space-y-0.5">
          {NAV_LINKS.map(({ to, label }) => (
            <Link
              key={to}
              to={to}
              onClick={() => setMenuOpen(false)}
              className={`block px-3 py-2.5 rounded-lg text-sm transition-all ${
                isActive(to)
                  ? 'text-white bg-white/[0.07] font-medium'
                  : 'text-slate-400 hover:text-white hover:bg-white/[0.04]'
              }`}
            >
              {label}
            </Link>
          ))}

          <div className="border-t border-white/[0.06] pt-3 mt-2">
            {loggedIn ? (
              <div className="flex items-center justify-between px-3">
                <div className="flex items-center gap-2.5">
                  {user?.avatar && (
                    <img
                      src={`https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.png?size=32`}
                      alt=""
                      className="w-7 h-7 rounded-full ring-1 ring-orange-500/30"
                    />
                  )}
                  <div>
                    <div className="text-sm text-white font-medium">{user?.username}</div>
                    <div className="text-xs text-orange-400 font-bold" style={{ fontFamily: 'Space Mono, monospace' }}>{totalPoints} pts</div>
                  </div>
                </div>
                <button
                  onClick={() => { logout(); setMenuOpen(false); }}
                  className="text-xs text-slate-500 hover:text-red-400 transition-colors"
                >
                  Sign out
                </button>
              </div>
            ) : (
              <a
                href={loginUrl}
                className="flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm text-slate-400 hover:text-white hover:bg-white/[0.04] transition-all"
              >
                <DiscordIcon className="w-4 h-4 text-indigo-400" />
                <span>Sign in with Discord</span>
              </a>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
