import express from 'express';
import { getGameStats, getPlayerGames, getLeaderboard } from '../controllers/gameController.js';

const router = express.Router();

// Get game statistics for a player
router.get('/stats/:address', getGameStats);

// Get all games for a player
router.get('/games/:address', getPlayerGames);

// Get global leaderboard
router.get('/leaderboard', getLeaderboard);

export default router;
