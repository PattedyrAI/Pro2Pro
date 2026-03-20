import { Link } from 'react-router-dom';

const MODES = [
  {
    icon: '⛳',
    label: 'DAILY',
    title: 'Daily Puzzle',
    desc: 'A new challenge every day at 08:00 CET. Build your streak.',
    path: '/daily',
    cta: 'Play today →',
    border: 'hover:border-orange-500/40',
    glow: 'hover:shadow-orange-500/10',
    ctaColor: 'text-orange-400',
    accent: 'from-orange-500/8',
  },
  {
    icon: '🎲',
    label: 'RANDOM',
    title: 'Random Game',
    desc: 'Pick your difficulty — Easy through Insane. Instant match.',
    path: '/random',
    cta: 'Roll →',
    border: 'hover:border-sky-500/40',
    glow: 'hover:shadow-sky-500/10',
    ctaColor: 'text-sky-400',
    accent: 'from-sky-500/8',
  },
  {
    icon: '🎯',
    label: 'CUSTOM',
    title: 'Custom',
    desc: 'Pick any two pros yourself. Challenge a friend to beat your path.',
    path: '/custom',
    cta: 'Set it up →',
    border: 'hover:border-violet-500/40',
    glow: 'hover:shadow-violet-500/10',
    ctaColor: 'text-violet-400',
    accent: 'from-violet-500/8',
  },
];

const STEPS = [
  { n: '01', title: 'Get Two Pros', desc: 'You\'re given a starting and ending CS2 professional player.' },
  { n: '02', title: 'Build the Chain', desc: 'Find players who shared a team roster to connect them.' },
  { n: '03', title: 'Score Like Golf', desc: 'Fewer steps = better score. Hit par or go under.' },
];

export function Landing() {
  return (
    <div className="page-enter">
      {/* ── Hero ──────────────────────────────────────────── */}
      <section className="relative flex flex-col items-center justify-center min-h-[88vh] text-center px-4 overflow-hidden">
        {/* Background layers */}
        <div className="absolute inset-0 dot-grid" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_70%_60%_at_50%_-10%,rgba(249,115,22,0.1),transparent)]" />
        <div className="absolute bottom-0 inset-x-0 h-40 bg-gradient-to-t from-[#08090f] to-transparent" />

        <div className="relative z-10 max-w-2xl mx-auto space-y-10">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-orange-500/20 bg-orange-500/5 text-orange-400 text-[11px] font-semibold tracking-widest uppercase">
            <span className="w-1.5 h-1.5 rounded-full bg-orange-400 animate-pulse" />
            CS2 Connection Game
          </div>

          {/* Title */}
          <div>
            <h1 className="text-[5.5rem] sm:text-[8rem] font-bold leading-none tracking-tight text-white" style={{ fontFamily: 'Rajdhani, sans-serif' }}>
              Pro<span className="text-orange-500">2</span>Pro
            </h1>
            <p className="mt-5 text-lg sm:text-xl text-slate-400 max-w-md mx-auto leading-relaxed">
              Connect two CS2 pros through shared team rosters. Find the shortest path.
            </p>
          </div>

          {/* Example chain */}
          <div className="flex items-center justify-center gap-2 sm:gap-3 flex-wrap opacity-70">
            {[
              { type: 'player', name: 's1mple', color: 'border-green-500/80 text-green-400 bg-green-500/8' },
              { type: 'team', name: 'NaVi' },
              { type: 'player', name: 'electronic', color: 'border-orange-500/80 text-orange-400 bg-orange-500/8' },
              { type: 'team', name: 'MOUZ' },
              { type: 'player', name: 'karrigan', color: 'border-red-500/80 text-red-400 bg-red-500/8' },
            ].map((item, i) =>
              item.type === 'player' ? (
                <div key={i} className="flex flex-col items-center gap-1.5">
                  <div className={`w-10 h-10 rounded-full border-2 ${item.color} bg-surface flex items-center justify-center text-[10px] font-bold`}>
                    {item.name.slice(0, 2).toUpperCase()}
                  </div>
                  <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${item.color}`}>{item.name}</span>
                </div>
              ) : (
                <div key={i} className="flex items-center gap-1.5 pb-4">
                  <div className="w-4 h-px bg-slate-700" />
                  <span className="text-[10px] font-mono text-slate-500 px-2 py-0.5 border border-slate-700/60 rounded bg-surface">{item.name}</span>
                  <div className="w-4 h-px bg-slate-700" />
                </div>
              )
            )}
          </div>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              to="/daily"
              className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-orange-500 hover:bg-orange-400 text-white font-semibold text-base transition-all duration-200 shadow-lg shadow-orange-500/25 hover:shadow-orange-500/40 hover:-translate-y-0.5"
            >
              Play Today's Puzzle
            </Link>
            <Link
              to="/random"
              className="w-full sm:w-auto px-8 py-3.5 rounded-xl border border-white/10 bg-white/[0.03] hover:bg-white/[0.06] text-slate-300 hover:text-white font-medium text-base transition-all duration-200 hover:-translate-y-0.5"
            >
              Quick Random Game
            </Link>
          </div>
        </div>
      </section>

      {/* ── Game Modes ────────────────────────────────────── */}
      <section className="px-4 py-24 max-w-5xl mx-auto">
        <div className="text-center mb-14">
          <h2 className="text-4xl sm:text-5xl font-bold text-white" style={{ fontFamily: 'Rajdhani, sans-serif' }}>Choose Your Mode</h2>
          <p className="text-slate-500 mt-2 text-sm">Three ways to play, one obsession.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {MODES.map((mode) => (
            <Link
              key={mode.path}
              to={mode.path}
              className={`group relative block p-7 rounded-2xl bg-gradient-to-b ${mode.accent} to-transparent border border-white/[0.07] ${mode.border} hover:shadow-xl ${mode.glow} transition-all duration-300 hover:-translate-y-1 overflow-hidden`}
            >
              <div className="text-3xl mb-5">{mode.icon}</div>
              <div className="text-[10px] font-bold tracking-widest text-slate-500 mb-1.5">{mode.label}</div>
              <h3 className="text-xl font-bold text-white mb-2.5" style={{ fontFamily: 'Rajdhani, sans-serif' }}>{mode.title}</h3>
              <p className="text-sm text-slate-400 leading-relaxed mb-6">{mode.desc}</p>
              <span className={`text-sm font-semibold ${mode.ctaColor} group-hover:underline underline-offset-4`}>{mode.cta}</span>
            </Link>
          ))}
        </div>
      </section>

      {/* ── How It Works ──────────────────────────────────── */}
      <section className="px-4 py-20 max-w-4xl mx-auto">
        <div className="text-center mb-14">
          <h2 className="text-4xl sm:text-5xl font-bold text-white" style={{ fontFamily: 'Rajdhani, sans-serif' }}>How It Works</h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-10">
          {STEPS.map((step, i) => (
            <div key={step.n} className="relative text-center space-y-4">
              {i < STEPS.length - 1 && (
                <div className="hidden sm:block absolute top-5 left-[60%] right-[-40%] h-px bg-gradient-to-r from-orange-500/20 to-transparent" />
              )}
              <div className="w-12 h-12 rounded-xl bg-orange-500/10 border border-orange-500/25 flex items-center justify-center mx-auto relative z-10">
                <span className="text-orange-400 font-bold text-sm" style={{ fontFamily: 'Space Mono, monospace' }}>{step.n}</span>
              </div>
              <h3 className="text-lg font-bold text-white" style={{ fontFamily: 'Rajdhani, sans-serif' }}>{step.title}</h3>
              <p className="text-sm text-slate-400 leading-relaxed">{step.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Footer spacer ─────────────────────────────────── */}
      <div className="h-16" />
    </div>
  );
}
