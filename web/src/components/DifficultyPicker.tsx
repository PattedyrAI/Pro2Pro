interface DifficultyPickerProps {
  onSelect: (difficulty: 'easy' | 'medium' | 'hard') => void;
  disabled?: boolean;
}

const difficulties = [
  { key: 'easy' as const, label: 'Easy', emoji: '\uD83D\uDFE2', color: 'green', desc: 'Famous players, many paths' },
  { key: 'medium' as const, label: 'Medium', emoji: '\uD83D\uDFE1', color: 'yellow', desc: 'Notable players, moderate paths' },
  { key: 'hard' as const, label: 'Hard', emoji: '\uD83D\uDD34', color: 'red', desc: 'All players, fewer paths' },
];

const colorMap: Record<string, string> = {
  green: 'border-green-500/40 hover:border-green-400 hover:bg-green-500/10 text-green-400 shadow-green-500/10',
  yellow: 'border-yellow-500/40 hover:border-yellow-400 hover:bg-yellow-500/10 text-yellow-400 shadow-yellow-500/10',
  red: 'border-red-500/40 hover:border-red-400 hover:bg-red-500/10 text-red-400 shadow-red-500/10',
};

export function DifficultyPicker({ onSelect, disabled }: DifficultyPickerProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-2xl mx-auto">
      {difficulties.map(d => (
        <button
          key={d.key}
          onClick={() => onSelect(d.key)}
          disabled={disabled}
          className={`p-6 rounded-xl border bg-gray-900/50 backdrop-blur-sm transition-all hover:shadow-lg cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed ${colorMap[d.color]}`}
        >
          <div className="text-3xl mb-2">{d.emoji}</div>
          <div className="text-lg font-bold mb-1">{d.label}</div>
          <div className="text-xs text-gray-400">{d.desc}</div>
        </button>
      ))}
    </div>
  );
}
