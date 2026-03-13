import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

const DISCORD_CLIENT_ID = import.meta.env.VITE_DISCORD_CLIENT_ID || '1480857828091625534';
const REDIRECT_URI = `${window.location.origin}/Pro2Pro/callback`;
const DISCORD_AUTH_URL = `https://discord.com/oauth2/authorize?client_id=${DISCORD_CLIENT_ID}&redirect_uri=${encodeURIComponent(REDIRECT_URI)}&response_type=code&scope=identify+guilds`;

const gameModes = [
  {
    title: 'Daily Puzzle',
    desc: 'A new challenge every day. Build your streak!',
    icon: '\uD83D\uDCC5',
    path: '/daily',
    color: 'cyan',
  },
  {
    title: 'Random',
    desc: 'Pick your difficulty and get a random pair.',
    icon: '\uD83C\uDFB2',
    path: '/random',
    color: 'purple',
  },
  {
    title: 'Custom',
    desc: 'Choose any two players and find the connection.',
    icon: '\uD83C\uDFAF',
    path: '/custom',
    color: 'pink',
  },
];

const colorStyles: Record<string, string> = {
  cyan: 'border-cyan-500/30 hover:border-cyan-400 hover:shadow-cyan-500/20 group-hover:text-cyan-400',
  purple: 'border-purple-500/30 hover:border-purple-400 hover:shadow-purple-500/20 group-hover:text-purple-400',
  pink: 'border-pink-500/30 hover:border-pink-400 hover:shadow-pink-500/20 group-hover:text-pink-400',
};

export function Landing() {
  const { loggedIn } = useAuth();

  return (
    <div className="space-y-20">
      {/* Hero */}
      <section className="text-center pt-16 pb-8">
        <h1 className="text-5xl sm:text-7xl font-black tracking-tight">
          <span className="bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600 bg-clip-text text-transparent">
            Pro2Pro
          </span>
        </h1>
        <p className="mt-4 text-lg sm:text-xl text-gray-400 max-w-xl mx-auto">
          Connect CS2 pros through shared teams. How many steps can you find?
        </p>

        <div className="mt-8 flex justify-center gap-4">
          {loggedIn ? (
            <Link
              to="/daily"
              className="px-8 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-bold hover:from-cyan-400 hover:to-blue-500 transition-all shadow-lg shadow-cyan-500/25"
            >
              Play Today's Puzzle
            </Link>
          ) : (
            <a
              href={DISCORD_AUTH_URL}
              className="px-8 py-3 rounded-xl bg-[#5865F2] hover:bg-[#4752C4] text-white font-bold transition-colors shadow-lg shadow-indigo-500/25 flex items-center gap-2"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M20.317 4.492c-1.53-.69-3.17-1.2-4.885-1.49a.075.075 0 0 0-.079.036c-.21.369-.444.85-.608 1.23a18.566 18.566 0 0 0-5.487 0 12.36 12.36 0 0 0-.617-1.23A.077.077 0 0 0 8.562 3c-1.714.29-3.354.8-4.885 1.491a.07.07 0 0 0-.032.027C.533 9.093-.32 13.555.099 17.961a.08.08 0 0 0 .031.055 20.03 20.03 0 0 0 5.993 2.98.078.078 0 0 0 .084-.026 13.83 13.83 0 0 0 1.226-1.963.074.074 0 0 0-.041-.104 13.175 13.175 0 0 1-1.872-.878.075.075 0 0 1-.008-.125c.126-.093.252-.19.372-.287a.075.075 0 0 1 .078-.01c3.927 1.764 8.18 1.764 12.061 0a.075.075 0 0 1 .079.009c.12.098.245.195.372.288a.075.075 0 0 1-.006.125c-.598.344-1.22.635-1.873.877a.075.075 0 0 0-.041.105c.36.687.772 1.341 1.225 1.962a.077.077 0 0 0 .084.028 19.963 19.963 0 0 0 6.002-2.981.076.076 0 0 0 .032-.054c.5-5.094-.838-9.52-3.549-13.442a.06.06 0 0 0-.031-.028zM8.02 15.278c-1.182 0-2.157-1.069-2.157-2.38 0-1.312.956-2.38 2.157-2.38 1.21 0 2.176 1.077 2.157 2.38 0 1.312-.956 2.38-2.157 2.38zm7.975 0c-1.183 0-2.157-1.069-2.157-2.38 0-1.312.955-2.38 2.157-2.38 1.21 0 2.176 1.077 2.157 2.38 0 1.312-.946 2.38-2.157 2.38z" />
              </svg>
              Sign in with Discord
            </a>
          )}
        </div>
      </section>

      {/* Game Modes */}
      <section>
        <h2 className="text-center text-2xl font-bold text-white mb-8">Game Modes</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-4xl mx-auto">
          {gameModes.map(mode => (
            <Link
              key={mode.path}
              to={loggedIn ? mode.path : '#'}
              onClick={e => !loggedIn && e.preventDefault()}
              className={`group block p-6 rounded-2xl bg-gray-900/50 border backdrop-blur-sm transition-all hover:shadow-lg ${colorStyles[mode.color]}`}
            >
              <div className="text-4xl mb-3">{mode.icon}</div>
              <h3 className="text-lg font-bold text-white mb-1">{mode.title}</h3>
              <p className="text-sm text-gray-400">{mode.desc}</p>
            </Link>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="max-w-2xl mx-auto text-center space-y-6">
        <h2 className="text-2xl font-bold text-white">How It Works</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {[
            { step: '1', title: 'Get Two Players', desc: 'You get a start and end CS2 pro' },
            { step: '2', title: 'Build the Chain', desc: 'Find players who shared a team with the next' },
            { step: '3', title: 'Complete the Path', desc: 'Connect start to end in fewest steps' },
          ].map(s => (
            <div key={s.step} className="space-y-2">
              <div className="w-10 h-10 rounded-full bg-cyan-500/20 border border-cyan-500/30 flex items-center justify-center text-cyan-400 font-bold mx-auto">
                {s.step}
              </div>
              <h3 className="font-bold text-white">{s.title}</h3>
              <p className="text-sm text-gray-400">{s.desc}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
