import { Router } from 'express';
import { getDb } from '../data/db';
import { authRequired } from './middleware';
import { getGuildLeaderboardPoints } from './points';

const router = Router();

// GET /leaderboard/:guildId — server leaderboard by points
router.get('/:guildId', authRequired, (req, res) => {
  const guildId = req.params.guildId as string;

  // Verify user belongs to this guild
  const db = getDb();
  const membership = db.prepare(
    'SELECT 1 FROM user_guilds WHERE discord_user_id = ? AND guild_id = ?'
  ).get(req.user!.userId, guildId);

  if (!membership) {
    res.status(403).json({ error: 'Not a member of this server' });
    return;
  }

  const pointsLeaderboard = getGuildLeaderboardPoints(guildId, 50);

  // Enrich with stats
  const enriched = pointsLeaderboard.map(entry => {
    const stats = db.prepare('SELECT * FROM user_stats WHERE discord_user_id = ?').get(entry.discord_user_id) as any;
    const session = db.prepare('SELECT discord_username FROM web_sessions WHERE discord_user_id = ? ORDER BY created_at DESC LIMIT 1').get(entry.discord_user_id) as any;

    return {
      rank: entry.rank,
      userId: entry.discord_user_id,
      username: session?.discord_username ?? 'Unknown',
      totalPoints: entry.total_points,
      gamesPlayed: stats?.games_played ?? 0,
      gamesWon: stats?.games_won ?? 0,
      currentStreak: stats?.current_streak ?? 0,
      maxStreak: stats?.max_streak ?? 0,
      avgPathLength: stats?.avg_path_length ?? 0,
    };
  });

  res.json({ leaderboard: enriched });
});

// GET /leaderboard/:guildId/puzzle/:puzzleId — per-puzzle (spoiler protected)
router.get('/:guildId/puzzle/:puzzleId', authRequired, (req, res) => {
  const guildId = req.params.guildId as string;
  const puzzleId = req.params.puzzleId as string;
  const userId = req.user!.userId;
  const db = getDb();

  // Check if user has completed this puzzle
  const userAttempt = db.prepare(
    'SELECT * FROM user_attempts WHERE puzzle_id = ? AND discord_user_id = ?'
  ).get(parseInt(puzzleId), userId) as any;

  if (!userAttempt) {
    res.json({ spoilerProtected: true, message: "Complete this puzzle first to see others' results" });
    return;
  }

  // Get all attempts for this puzzle in this guild
  const attempts = db.prepare(`
    SELECT ua.discord_user_id, ua.path_length, ua.is_optimal, ua.completed_at,
           ws.discord_username
    FROM user_attempts ua
    LEFT JOIN web_sessions ws ON ws.discord_user_id = ua.discord_user_id
    WHERE ua.puzzle_id = ? AND ua.guild_id = ?
    ORDER BY ua.is_optimal DESC, ua.path_length ASC, ua.completed_at ASC
  `).all(parseInt(puzzleId), guildId) as any[];

  res.json({
    spoilerProtected: false,
    userAttempt: {
      pathLength: userAttempt.path_length,
      isOptimal: !!userAttempt.is_optimal,
    },
    attempts: attempts.map((a: any, i: number) => ({
      rank: i + 1,
      userId: a.discord_user_id,
      username: a.discord_username ?? 'Unknown',
      pathLength: a.path_length,
      isOptimal: !!a.is_optimal,
      completedAt: a.completed_at,
    })),
  });
});

export default router;
