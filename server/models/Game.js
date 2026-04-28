import mongoose from 'mongoose';

const gameSchema = new mongoose.Schema({
  gameId: {
    type: Number,
    required: true,
    unique: true
  },
  player1: {
    type: String,
    required: true,
    lowercase: true
  },
  player2: {
    type: String,
    default: null,
    lowercase: true
  },
  wager: {
    type: Number,
    required: true
  },
  status: {
    type: String,
    enum: ['Empty', 'Active', 'Player1Won', 'Player2Won', 'Draw'],
    default: 'Empty'
  },
  board: {
    type: [Number],
    default: [0, 0, 0, 0, 0, 0, 0, 0, 0]
  },
  currentTurn: {
    type: Number,
    enum: [0, 1, 2], // 0: None, 1: Player1, 2: Player2
    default: 1
  },
  lastMoveTime: {
    type: Date,
    default: Date.now
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  endedAt: {
    type: Date,
    default: null
  },
  winner: {
    type: String,
    default: null,
    lowercase: true
  },
  moves: [{
    player: String,
    position: Number,
    timestamp: Date
  }]
});

// Index for faster queries
gameSchema.index({ player1: 1 });
gameSchema.index({ player2: 1 });
gameSchema.index({ status: 1 });
gameSchema.index({ createdAt: -1 });

const Game = mongoose.model('Game', gameSchema);

export default Game;
