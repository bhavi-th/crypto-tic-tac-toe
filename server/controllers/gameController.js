import Game from '../models/Game.js';

// Get game statistics for a player
export const getGameStats = async (req, res) => {
  try {
    const { address } = req.params;
    
    const games = await Game.find({
      $or: [{ player1: address }, { player2: address }]
    });

    const stats = {
      totalGames: games.length,
      wins: games.filter(game => 
        (game.status === 'Player1Won' && game.player1 === address) ||
        (game.status === 'Player2Won' && game.player2 === address)
      ).length,
      losses: games.filter(game => 
        (game.status === 'Player1Won' && game.player2 === address) ||
        (game.status === 'Player2Won' && game.player1 === address)
      ).length,
      draws: games.filter(game => game.status === 'Draw').length,
      totalWagered: games.reduce((sum, game) => sum + parseFloat(game.wager), 0),
      totalWon: games.filter(game => 
        (game.status === 'Player1Won' && game.player1 === address) ||
        (game.status === 'Player2Won' && game.player2 === address)
      ).reduce((sum, game) => sum + parseFloat(game.wager) * 2, 0),
      winRate: 0
    };

    if (stats.totalGames > 0) {
      stats.winRate = ((stats.wins / stats.totalGames) * 100).toFixed(1);
    }

    res.json(stats);
  } catch (error) {
    console.error('Error getting game stats:', error);
    res.status(500).json({ error: 'Failed to get game stats' });
  }
};

// Get all games for a player
export const getPlayerGames = async (req, res) => {
  try {
    const { address } = req.params;
    const { page = 1, limit = 10 } = req.query;
    
    const skip = (page - 1) * limit;
    
    const games = await Game.find({
      $or: [{ player1: address }, { player2: address }]
    })
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(parseInt(limit));

    const total = await Game.countDocuments({
      $or: [{ player1: address }, { player2: address }]
    });

    res.json({
      games,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error getting player games:', error);
    res.status(500).json({ error: 'Failed to get player games' });
  }
};

// Get global leaderboard
export const getLeaderboard = async (req, res) => {
  try {
    const { limit = 10 } = req.query;
    
    const pipeline = [
      {
        $group: {
          _id: '$player1',
          totalGames: { $sum: 1 },
          wins: {
            $sum: {
              $cond: [{ $eq: ['$status', 'Player1Won'] }, 1, 0]
            }
          },
          losses: {
            $sum: {
              $cond: [{ $eq: ['$status', 'Player2Won'] }, 1, 0]
            }
          },
          draws: {
            $sum: {
              $cond: [{ $eq: ['$status', 'Draw'] }, 1, 0]
            }
          },
          totalWagered: { $sum: '$wager' },
          totalWon: {
            $sum: {
              $cond: [
                { $eq: ['$status', 'Player1Won'] },
                { $multiply: ['$wager', 2] },
                0
              ]
            }
          }
        }
      },
      {
        $unionWith: {
          coll: 'games',
          pipeline: [
            {
              $group: {
                _id: '$player2',
                totalGames: { $sum: 1 },
                wins: {
                  $sum: {
                    $cond: [{ $eq: ['$status', 'Player2Won'] }, 1, 0]
                  }
                },
                losses: {
                  $sum: {
                    $cond: [{ $eq: ['$status', 'Player1Won'] }, 1, 0]
                  }
                },
                draws: {
                  $sum: {
                    $cond: [{ $eq: ['$status', 'Draw'] }, 1, 0]
                  }
                },
                totalWagered: { $sum: '$wager' },
                totalWon: {
                  $sum: {
                    $cond: [
                      { $eq: ['$status', 'Player2Won'] },
                      { $multiply: ['$wager', 2] },
                      0
                    ]
                  }
                }
              }
            }
          ]
        }
      },
      {
        $group: {
          _id: '$_id',
          totalGames: { $sum: '$totalGames' },
          wins: { $sum: '$wins' },
          losses: { $sum: '$losses' },
          draws: { $sum: '$draws' },
          totalWagered: { $sum: '$totalWagered' },
          totalWon: { $sum: '$totalWon' }
        }
      },
      {
        $addFields: {
          winRate: {
            $cond: [
              { $eq: ['$totalGames', 0] },
              0,
              { $multiply: [{ $divide: ['$wins', '$totalGames'] }, 100] }
            ]
          }
        }
      },
      { $sort: { wins: -1, winRate: -1 } },
      { $limit: parseInt(limit) },
      {
        $project: {
          _id: 0,
          address: '$_id',
          totalGames: 1,
          wins: 1,
          losses: 1,
          draws: 1,
          winRate: { $round: ['$winRate', 1] },
          totalWagered: 1,
          totalWon: 1
        }
      }
    ];

    const leaderboard = await Game.aggregate(pipeline);
    
    res.json(leaderboard);
  } catch (error) {
    console.error('Error getting leaderboard:', error);
    res.status(500).json({ error: 'Failed to get leaderboard' });
  }
};
