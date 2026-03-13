import { Router } from 'express';
import { getDb } from '../data/db';
import { getTodayPuzzle, getPuzzleByNumber } from '../data/models/puzzle';
import { playerGraph } from '../game/graph';
import { authRequired, authOptional } from './middleware';

const router = Router();

function formatPuzzleResponse(puzzle: any, userId?: string) {
  const startPlayer = playerGraph.getPlayer(puzzle.start_player_id);
  const endPlayer = playerGraph.getPlayer(puzzle.end_player_id);
  const startTeams = playerGraph.getPlayerFullTeamNames(puzzle.start_player_id, 2);
  const endTeams = playerGraph.getPlayerFullTeamNames(puzzle.end_player_id, 2);

  const response: any = {
    id: puzzle.id,
    puzzleNumber: puzzle.puzzle_number,
    date: puzzle.date,
    difficulty: puzzle.difficulty,
    optimalPathLength: puzzle.optimal_path_length,
    numValidPaths: puzzle.num_valid_paths,
    startPlayer: {
      id: puzzle.start_player_id,
      name: startPlayer?.name ?? '???',
      nationality: startPlayer?.nationality,
      imageUrl: startPlayer?.imageUrl,
      teams: startTeams,
    },
    endPlayer: {
      id: puzzle.end_player_id,
      name: endPlayer?.name ?? '???',
      nationality: endPlayer?.nationality,
      imageUrl: endPlayer?.imageUrl,
      teams: endTeams,
    },
  };

  // If user provided, add their attempt status
  if (userId) {
    const db = getDb();
    const attempt = db.prepare(
      'SELECT path_length, is_optimal, completed_at FROM user_attempts WHERE puzzle_id = ? AND discord_user_id = ?'
    ).get(puzzle.id, userId) as any;

    response.userAttempt = attempt ? {
      pathLength: attempt.path_length,
      isOptimal: !!attempt.is_optimal,
      completedAt: attempt.completed_at,
    } : null;
  }

  return response;
}

// GET /puzzles/daily — today's puzzle
router.get('/daily', authOptional, (req, res) => {
  const puzzle = getTodayPuzzle();
  if (!puzzle) {
    res.status(404).json({ error: 'No daily puzzle today' });
    return;
  }
  res.json(formatPuzzleResponse(puzzle, req.user?.userId));
});

// GET /puzzles/daily/:number — specific daily by number
router.get('/daily/:number', authOptional, (req, res) => {
  const num = parseInt(req.params.number as string);
  if (isNaN(num)) {
    res.status(400).json({ error: 'Invalid puzzle number' });
    return;
  }

  const puzzle = getPuzzleByNumber(num);
  if (!puzzle) {
    res.status(404).json({ error: 'Puzzle not found' });
    return;
  }

  res.json(formatPuzzleResponse(puzzle, req.user?.userId));
});

// GET /puzzles/archive — all dailies with completion status
router.get('/archive', authRequired, (req, res) => {
  const db = getDb();
  const puzzles = db.prepare('SELECT * FROM daily_puzzles ORDER BY puzzle_number DESC').all() as any[];

  const result = puzzles.map(p => {
    const attempt = db.prepare(
      'SELECT path_length, is_optimal FROM user_attempts WHERE puzzle_id = ? AND discord_user_id = ?'
    ).get(p.id, req.user!.userId) as any;

    return {
      puzzleNumber: p.puzzle_number,
      date: p.date,
      difficulty: p.difficulty,
      optimalPathLength: p.optimal_path_length,
      status: attempt ? (attempt.is_optimal ? 'optimal' : 'completed') : 'available',
    };
  });

  res.json({ puzzles: result });
});

export default router;
