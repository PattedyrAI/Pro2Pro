import { getDb } from '../../data/db';

/**
 * Game state for active games — persisted in SQLite.
 */
export interface GameState {
  puzzleId: number;
  type: 'daily' | 'custom';
  forwardPath: number[];    // [startPlayerId, ...added from start]
  backwardPath: number[];   // [endPlayerId, ...added from end]
  searchDirection: 'forward' | 'backward';
  startPlayerId: number;
  endPlayerId: number;
  difficulty?: string;      // 'easy' | 'medium' | 'hard' | 'insane' — for enforcing rules during play
}

// TTLs for auto-expiry
const DAILY_TTL = 24 * 60 * 60 * 1000;   // 24 hours
const CUSTOM_TTL = 6 * 60 * 60 * 1000;   // 6 hours

// Track give-ups: "userId:gameType:gameId" — prevents guessing after giving up
export const givenUpGames = new Set<string>();

// Track original message references so we can update them on completion/give-up
// Key: "custom:{customGameId}" or "daily:{puzzleId}"
export const originalMessages = new Map<string, { channelId: string; messageId: string }>();

// Share text temp storage (ephemeral, OK to lose on redeploy)
const shareTexts = new Map<string, string>();

export function getGameKey(type: 'daily' | 'custom', userId: string, customGameId?: number): string {
  if (type === 'custom' && customGameId !== undefined) {
    return `custom:${userId}:${customGameId}`;
  }
  return `daily:${userId}`;
}

// ── DB-backed game session functions ──

export function getActiveGame(gameKey: string): GameState | null {
  const db = getDb();
  const row = db.prepare(
    'SELECT game_state, game_type, last_activity FROM bot_game_sessions WHERE game_key = ?'
  ).get(gameKey) as any;
  if (!row) return null;

  // Check TTL
  const ttl = row.game_type === 'daily' ? DAILY_TTL : CUSTOM_TTL;
  if (Date.now() - row.last_activity > ttl) {
    db.prepare('DELETE FROM bot_game_sessions WHERE game_key = ?').run(gameKey);
    return null;
  }

  return JSON.parse(row.game_state) as GameState;
}

export function setActiveGame(gameKey: string, userId: string, game: GameState): void {
  const db = getDb();
  const now = Date.now();
  db.prepare(`
    INSERT OR REPLACE INTO bot_game_sessions (game_key, user_id, game_type, puzzle_id, game_state, last_activity, created_at)
    VALUES (?, ?, ?, ?, ?, ?, COALESCE((SELECT created_at FROM bot_game_sessions WHERE game_key = ?), ?))
  `).run(gameKey, userId, game.type, game.puzzleId, JSON.stringify(game), now, gameKey, now);
}

export function deleteActiveGame(gameKey: string): void {
  const db = getDb();
  db.prepare('DELETE FROM bot_game_sessions WHERE game_key = ?').run(gameKey);
}

/** Get all active games for a user (for /activegames command) */
export function getUserActiveGames(userId: string): { gameKey: string; game: GameState; lastActivity: number; createdAt: number }[] {
  const db = getDb();
  const rows = db.prepare(
    'SELECT game_key, game_state, game_type, last_activity, created_at FROM bot_game_sessions WHERE user_id = ? ORDER BY last_activity DESC'
  ).all(userId) as any[];

  const results: { gameKey: string; game: GameState; lastActivity: number; createdAt: number }[] = [];
  for (const row of rows) {
    const ttl = row.game_type === 'daily' ? DAILY_TTL : CUSTOM_TTL;
    if (Date.now() - row.last_activity > ttl) {
      db.prepare('DELETE FROM bot_game_sessions WHERE game_key = ?').run(row.game_key);
      continue;
    }
    results.push({
      gameKey: row.game_key,
      game: JSON.parse(row.game_state),
      lastActivity: row.last_activity,
      createdAt: row.created_at,
    });
  }
  return results;
}

// Share text storage (ephemeral)
export function setShareText(userId: string, text: string): void {
  shareTexts.set(userId, text);
}
export function getShareText(userId: string): string | undefined {
  return shareTexts.get(userId);
}

// ── Backward compat: activeGames proxy ──
// Some code still uses activeGames.get/set/delete directly.
// This proxy routes to DB functions while maintaining the Map interface.
class ActiveGamesProxy {
  get(key: string): GameState | undefined {
    // Handle share text keys
    if (key.startsWith('share:')) return undefined;
    return getActiveGame(key) ?? undefined;
  }
  set(key: string, value: any): this {
    if (key.startsWith('share:')) {
      shareTexts.set(key.slice(6), value as string);
      return this;
    }
    // Extract userId from key
    const parts = key.split(':');
    const userId = parts[1] ?? 'unknown';
    setActiveGame(key, userId, value as GameState);
    return this;
  }
  delete(key: string): boolean {
    if (key.startsWith('share:')) {
      shareTexts.delete(key.slice(6));
      return true;
    }
    deleteActiveGame(key);
    return true;
  }
  has(key: string): boolean {
    if (key.startsWith('share:')) return shareTexts.has(key.slice(6));
    return getActiveGame(key) !== null;
  }
}

export const activeGames = new ActiveGamesProxy() as any;

/** Merge forward and backward paths into a single complete path.
 *  Deduplicates the junction point when forward reaches the backward anchor
 *  (direct completion) or backward reaches the forward anchor. */
export function getFullPath(game: GameState): number[] {
  const bwdReversed = game.backwardPath.slice().reverse();
  // If forward tip == backward anchor (first of reversed), deduplicate the junction
  if (game.forwardPath.length > 0 && bwdReversed.length > 0 &&
      game.forwardPath[game.forwardPath.length - 1] === bwdReversed[0]) {
    return [...game.forwardPath, ...bwdReversed.slice(1)];
  }
  return [...game.forwardPath, ...bwdReversed];
}

/** Get step count for in-progress game (excludes the start/end which are given) */
export function getStepCount(game: GameState): number {
  return (game.forwardPath.length - 1) + (game.backwardPath.length - 1);
}

// Clean expired sessions every 30 minutes
setInterval(() => {
  try {
    const db = getDb();
    const dailyCutoff = Date.now() - DAILY_TTL;
    const customCutoff = Date.now() - CUSTOM_TTL;
    const result = db.prepare(`
      DELETE FROM bot_game_sessions WHERE
        (game_type = 'daily' AND last_activity < ?) OR
        (game_type = 'custom' AND last_activity < ?)
    `).run(dailyCutoff, customCutoff);
    if (result.changes > 0) {
      console.log(`[BotSessions] Cleaned ${result.changes} expired game sessions`);
    }
  } catch (_) {}
}, 30 * 60 * 1000);
