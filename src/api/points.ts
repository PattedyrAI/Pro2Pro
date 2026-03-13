import { getDb } from '../data/db';

interface PointsEvent {
  userId: string;
  guildId?: string | null;
  puzzleId?: number;
  customGameId?: number;
  source: 'bot' | 'web';
}

interface PointsResult {
  total: number;
  breakdown: { reason: string; points: number }[];
}

export function awardCompletionPoints(
  event: PointsEvent & { isOptimal: boolean; difficulty?: string; currentStreak: number }
): PointsResult {
  const breakdown: { reason: string; points: number }[] = [];
  const db = getDb();

  // Base completion
  breakdown.push({ reason: 'completion', points: 100 });

  // Optimal bonus
  if (event.isOptimal) {
    breakdown.push({ reason: 'optimal', points: 50 });
  }

  // Difficulty bonus
  if (event.difficulty === 'medium' || event.difficulty === 'hard') {
    const diffPoints = event.difficulty === 'hard' ? 50 : 25;
    breakdown.push({ reason: 'difficulty', points: diffPoints });
  }

  // Streak bonus (10 per consecutive day, cap 100)
  if (event.currentStreak > 0) {
    const streakPoints = Math.min(event.currentStreak * 10, 100);
    breakdown.push({ reason: 'streak', points: streakPoints });
  }

  const total = breakdown.reduce((sum, b) => sum + b.points, 0);

  // Write to ledger
  const insert = db.prepare(`
    INSERT INTO user_points (discord_user_id, guild_id, points, reason, source, puzzle_id, custom_game_id)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `);

  for (const b of breakdown) {
    insert.run(event.userId, event.guildId ?? null, b.points, b.reason, event.source, event.puzzleId ?? null, event.customGameId ?? null);
  }

  // Update total in user_stats
  db.prepare('UPDATE user_stats SET total_points = total_points + ? WHERE discord_user_id = ?').run(total, event.userId);

  return { total, breakdown };
}

export function getUserTotalPoints(userId: string): number {
  const db = getDb();
  const row = db.prepare('SELECT COALESCE(SUM(points), 0) as total FROM user_points WHERE discord_user_id = ?').get(userId) as any;
  return row?.total ?? 0;
}

export function getGuildLeaderboardPoints(guildId: string, limit = 20): { discord_user_id: string; total_points: number; rank: number }[] {
  const db = getDb();
  const rows = db.prepare(`
    SELECT discord_user_id, COALESCE(SUM(points), 0) as total_points
    FROM user_points WHERE guild_id = ?
    GROUP BY discord_user_id
    ORDER BY total_points DESC
    LIMIT ?
  `).all(guildId, limit) as any[];

  return rows.map((r: any, i: number) => ({ ...r, rank: i + 1 }));
}
