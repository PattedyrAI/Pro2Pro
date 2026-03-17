import Database from 'better-sqlite3';
import path from 'path';
import { config } from '../config';

let db: Database.Database;

export function getDb(): Database.Database {
  if (!db) {
    const dbPath = path.resolve(config.dbPath);
    db = new Database(dbPath);
    db.pragma('journal_mode = WAL');
    db.pragma('foreign_keys = ON');
    runMigrations(db);
  }
  return db;
}

function runMigrations(db: Database.Database): void {
  db.exec(`
    CREATE TABLE IF NOT EXISTS players (
      id INTEGER PRIMARY KEY,
      name TEXT NOT NULL,
      full_name TEXT,
      nationality TEXT,
      image_url TEXT,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS teams (
      id INTEGER PRIMARY KEY,
      name TEXT NOT NULL,
      acronym TEXT,
      image_url TEXT,
      is_notable INTEGER DEFAULT 0,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS rosters (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      player_id INTEGER REFERENCES players(id),
      team_id INTEGER REFERENCES teams(id),
      tournament_id INTEGER DEFAULT NULL,
      UNIQUE(player_id, team_id, tournament_id)
    );

    CREATE TABLE IF NOT EXISTS daily_puzzles (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      puzzle_number INTEGER UNIQUE,
      date TEXT UNIQUE,
      start_player_id INTEGER REFERENCES players(id),
      end_player_id INTEGER REFERENCES players(id),
      optimal_path_length INTEGER,
      num_valid_paths INTEGER,
      difficulty TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS user_attempts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      puzzle_id INTEGER REFERENCES daily_puzzles(id),
      discord_user_id TEXT NOT NULL,
      guild_id TEXT,
      path TEXT,
      path_length INTEGER,
      is_valid BOOLEAN,
      is_optimal BOOLEAN,
      completed_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(puzzle_id, discord_user_id)
    );

    CREATE TABLE IF NOT EXISTS user_stats (
      discord_user_id TEXT PRIMARY KEY,
      games_played INTEGER DEFAULT 0,
      games_won INTEGER DEFAULT 0,
      current_streak INTEGER DEFAULT 0,
      max_streak INTEGER DEFAULT 0,
      avg_path_length REAL DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS custom_games (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      discord_user_id TEXT NOT NULL,
      guild_id TEXT NOT NULL,
      channel_id TEXT NOT NULL,
      start_player_id INTEGER REFERENCES players(id),
      end_player_id INTEGER REFERENCES players(id),
      optimal_path_length INTEGER,
      num_valid_paths INTEGER,
      is_feasible BOOLEAN,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS custom_game_attempts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      custom_game_id INTEGER REFERENCES custom_games(id),
      discord_user_id TEXT NOT NULL,
      path TEXT,
      path_length INTEGER,
      is_valid BOOLEAN,
      is_optimal BOOLEAN,
      completed_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE INDEX IF NOT EXISTS idx_rosters_player ON rosters(player_id);
    CREATE INDEX IF NOT EXISTS idx_rosters_team ON rosters(team_id);
    CREATE INDEX IF NOT EXISTS idx_daily_puzzles_date ON daily_puzzles(date);
    CREATE INDEX IF NOT EXISTS idx_user_attempts_puzzle ON user_attempts(puzzle_id);
    CREATE INDEX IF NOT EXISTS idx_user_attempts_user ON user_attempts(discord_user_id);
    CREATE INDEX IF NOT EXISTS idx_players_name ON players(name COLLATE NOCASE);
  `);

  // ── Migrations ──
  // Add tournament_tier column to teams (fails silently if already exists)
  try {
    db.exec(`ALTER TABLE teams ADD COLUMN tournament_tier TEXT DEFAULT NULL`);
  } catch (_) {
    // Column already exists
  }

  // Migrate rosters table: the old schema had UNIQUE(player_id, team_id) which
  // blocks tournament-based inserts. SQLite can't DROP CONSTRAINT, so we must
  // recreate the table. Check if migration is needed by looking for tournament_id column.
  const rostersInfo = db.prepare(`PRAGMA table_info(rosters)`).all() as any[];
  const hasTournamentId = rostersInfo.some((col: any) => col.name === 'tournament_id');
  if (!hasTournamentId) {
    db.exec(`
      CREATE TABLE rosters_new (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        player_id INTEGER REFERENCES players(id),
        team_id INTEGER REFERENCES teams(id),
        tournament_id INTEGER DEFAULT NULL,
        UNIQUE(player_id, team_id, tournament_id)
      );
      INSERT INTO rosters_new (id, player_id, team_id)
        SELECT id, player_id, team_id FROM rosters;
      DROP TABLE rosters;
      ALTER TABLE rosters_new RENAME TO rosters;
    `);
  }

  // Create player_tournament_counts table
  db.exec(`
    CREATE TABLE IF NOT EXISTS player_tournament_counts (
      player_id INTEGER PRIMARY KEY,
      a_plus_count INTEGER DEFAULT 0,
      b_plus_count INTEGER DEFAULT 0,
      cct_count INTEGER DEFAULT 0
    );
  `);

  // Migration: add a_plus_count column if missing
  try {
    db.exec(`ALTER TABLE player_tournament_counts ADD COLUMN a_plus_count INTEGER DEFAULT 0`);
  } catch (_) {
    // Column already exists
  }

  // Create index on rosters(tournament_id)
  db.exec(`
    CREATE INDEX IF NOT EXISTS idx_rosters_tournament ON rosters(tournament_id);
  `);

  // Migration: add game_mode column to custom_games
  try {
    db.exec(`ALTER TABLE custom_games ADD COLUMN game_mode TEXT DEFAULT 'custom'`);
  } catch (_) {
    // Column already exists
  }

  // Create user_player_picks table
  db.exec(`
    CREATE TABLE IF NOT EXISTS user_player_picks (
      discord_user_id TEXT NOT NULL,
      player_id INTEGER NOT NULL,
      pick_count INTEGER DEFAULT 0,
      PRIMARY KEY (discord_user_id, player_id)
    );
    CREATE INDEX IF NOT EXISTS idx_user_player_picks_user ON user_player_picks(discord_user_id);
  `);

  // Create user_all_stats table
  db.exec(`
    CREATE TABLE IF NOT EXISTS user_all_stats (
      discord_user_id TEXT PRIMARY KEY,
      daily_played INTEGER DEFAULT 0,
      daily_won INTEGER DEFAULT 0,
      custom_played INTEGER DEFAULT 0,
      custom_won INTEGER DEFAULT 0,
      random_played INTEGER DEFAULT 0,
      random_won INTEGER DEFAULT 0,
      current_streak INTEGER DEFAULT 0,
      max_streak INTEGER DEFAULT 0,
      avg_path_length REAL DEFAULT 0
    );
  `);

  // Backfill user_all_stats from existing user_stats
  db.exec(`
    INSERT OR IGNORE INTO user_all_stats (discord_user_id, daily_played, daily_won, current_streak, max_streak, avg_path_length)
    SELECT discord_user_id, games_played, games_won, current_streak, max_streak, avg_path_length FROM user_stats
  `);

  // Web sessions
  db.exec(`
    CREATE TABLE IF NOT EXISTS web_sessions (
      id TEXT PRIMARY KEY,
      discord_user_id TEXT NOT NULL,
      discord_username TEXT NOT NULL,
      discord_avatar TEXT,
      access_token TEXT NOT NULL,
      refresh_token TEXT,
      expires_at DATETIME NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS user_guilds (
      discord_user_id TEXT NOT NULL,
      guild_id TEXT NOT NULL,
      guild_name TEXT NOT NULL,
      guild_icon TEXT,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      PRIMARY KEY (discord_user_id, guild_id)
    );

    CREATE TABLE IF NOT EXISTS user_points (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      discord_user_id TEXT NOT NULL,
      guild_id TEXT,
      points INTEGER NOT NULL,
      reason TEXT NOT NULL,
      source TEXT NOT NULL,
      puzzle_id INTEGER,
      custom_game_id INTEGER,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE INDEX IF NOT EXISTS idx_user_points_user ON user_points(discord_user_id);
    CREATE INDEX IF NOT EXISTS idx_user_points_guild ON user_points(guild_id);
    CREATE INDEX IF NOT EXISTS idx_web_sessions_user ON web_sessions(discord_user_id);
  `);

  // Add source column to user_attempts
  try { db.exec(`ALTER TABLE user_attempts ADD COLUMN source TEXT DEFAULT 'bot'`); } catch (_) {}
  // Add source column to custom_game_attempts
  try { db.exec(`ALTER TABLE custom_game_attempts ADD COLUMN source TEXT DEFAULT 'bot'`); } catch (_) {}
  // Add total_points to user_stats
  try { db.exec(`ALTER TABLE user_stats ADD COLUMN total_points INTEGER DEFAULT 0`); } catch (_) {}

  // Add total_links and games_given_up to user_all_stats
  try { db.exec(`ALTER TABLE user_all_stats ADD COLUMN total_links INTEGER DEFAULT 0`); } catch (_) {}
  try { db.exec(`ALTER TABLE user_all_stats ADD COLUMN games_given_up INTEGER DEFAULT 0`); } catch (_) {}

  // Add is_female flag to players table (set during sync when player appears on a female team)
  try { db.exec(`ALTER TABLE players ADD COLUMN is_female INTEGER DEFAULT 0`); } catch (_) {}
}

export function closeDb(): void {
  if (db) {
    db.close();
  }
}
