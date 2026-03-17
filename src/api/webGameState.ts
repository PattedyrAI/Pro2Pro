import { GameState } from '../bot/interactions/gameState';
import { getDb } from '../data/db';

const SESSION_TTL = 60 * 60 * 1000; // 1 hour

export function createWebSession(sessionId: string, userId: string, game: GameState): void {
  const db = getDb();
  const now = Date.now();
  db.prepare(`
    INSERT OR REPLACE INTO web_game_sessions (id, user_id, game_state, last_activity, created_at)
    VALUES (?, ?, ?, ?, ?)
  `).run(sessionId, userId, JSON.stringify(game), now, now);
}

export function getWebSession(sessionId: string, userId: string): GameState | null {
  const db = getDb();
  const row = db.prepare(
    'SELECT game_state, last_activity FROM web_game_sessions WHERE id = ? AND user_id = ?'
  ).get(sessionId, userId) as any;

  if (!row) return null;

  if (Date.now() - row.last_activity > SESSION_TTL) {
    db.prepare('DELETE FROM web_game_sessions WHERE id = ?').run(sessionId);
    return null;
  }

  // Touch last_activity
  db.prepare('UPDATE web_game_sessions SET last_activity = ? WHERE id = ?').run(Date.now(), sessionId);

  return JSON.parse(row.game_state) as GameState;
}

export function updateWebSession(sessionId: string, game: GameState): void {
  const db = getDb();
  db.prepare(
    'UPDATE web_game_sessions SET game_state = ?, last_activity = ? WHERE id = ?'
  ).run(JSON.stringify(game), Date.now(), sessionId);
}

export function deleteWebSession(sessionId: string): void {
  const db = getDb();
  db.prepare('DELETE FROM web_game_sessions WHERE id = ?').run(sessionId);
}

// Clean expired sessions every 10 minutes
setInterval(() => {
  try {
    const db = getDb();
    const cutoff = Date.now() - SESSION_TTL;
    const result = db.prepare('DELETE FROM web_game_sessions WHERE last_activity < ?').run(cutoff);
    if (result.changes > 0) {
      console.log(`[WebSessions] Cleaned ${result.changes} expired game sessions`);
    }
  } catch (_) {
    // DB may not be ready yet
  }
}, 10 * 60 * 1000);
