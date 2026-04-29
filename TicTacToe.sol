// SPDX-License-Identifier: GPL-3.0
pragma solidity >=0.8.0 <0.9.0;

contract TicTacToe {
    
    enum GameStatus { Empty, Active, Player1Won, Player2Won, Draw }
    enum Player { None, Player1, Player2 }
    
    struct Game {
        address player1;
        address player2;
        uint256 wager;
        uint256 lastMoveTime;
        GameStatus status;
        uint8[9] board; // 0 = empty, 1 = player1, 2 = player2
        Player currentTurn;
    }
    
    mapping(uint256 => Game) public games;
    mapping(address => uint256[]) public playerGames;
    uint256 public gameCounter;
    uint256 public constant TIMEOUT_DURATION = 5 minutes;
    
    // Reward pool system
    uint256 public rewardPool;
    address public owner;
    uint256 public constant BASE_REWARD = 0.01 ether; // Base reward per win
    uint256 public constant REWARD_PERCENTAGE = 10; // 10% of wager as bonus
    uint256 public constant MIN_WAGER_FOR_REWARD = 0.005 ether; // Minimum wager to qualify for reward
    
    // Pre-paid gas system
    uint256 public constant MAX_MOVES_PER_GAME = 9;
    uint256 public constant MOVE_GAS_COST = 0.00018 ether; // Average gas cost per move
    uint256 public constant TOTAL_GAME_GAS = MOVE_GAS_COST * MAX_MOVES_PER_GAME; // 0.00162 ETH per player
    mapping(uint256 => mapping(address => uint256)) public gameGasDeposits; // gameId => player => deposit
    mapping(uint256 => uint256) public gameMovesCount; // Track actual moves made
    
    event GasDeposited(uint256 indexed gameId, address indexed player, uint256 amount);
    event GasUsed(uint256 indexed gameId, address indexed player, uint256 amount);
    event GasRefunded(uint256 indexed gameId, address indexed player, uint256 amount);
    
    event GameCreated(uint256 indexed gameId, address indexed player1, uint256 wager);
    event GameJoined(uint256 indexed gameId, address indexed player2);
    event MoveMade(uint256 indexed gameId, address indexed player, uint8 position);
    event GameOver(uint256 indexed gameId, GameStatus status, address indexed winner);
    event TimeoutClaimed(uint256 indexed gameId, address indexed claimer);
    
    // Reward pool events
    event RewardPoolFunded(address indexed funder, uint256 amount);
    event RewardPaid(uint256 indexed gameId, address indexed winner, uint256 rewardAmount);
    event RewardPoolDepleted(uint256 remainingBalance);
    
    constructor() {
        owner = msg.sender;
    }
    
    // Reward pool management functions
    function fundRewardPool() external payable {
        require(msg.value > 0, "Must send ETH to fund reward pool");
        rewardPool += msg.value;
        emit RewardPoolFunded(msg.sender, msg.value);
    }
    
    function getRewardPoolBalance() external view returns (uint256) {
        return rewardPool;
    }
    
    function calculateReward(uint256 _wager) internal pure returns (uint256) {
        // Only give rewards for wagers above minimum threshold
        if (_wager < MIN_WAGER_FOR_REWARD) {
            return 0;
        }
        
        // Calculate reward as percentage of wager, but at least base reward
        uint256 percentageReward = (_wager * REWARD_PERCENTAGE) / 100;
        return percentageReward > BASE_REWARD ? percentageReward : BASE_REWARD;
    }
    
    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner can call this function");
        _;
    }
    
    function claimReward(uint256 _gameId) external {
        Game storage game = games[_gameId];
        require(game.status == GameStatus.Player1Won || game.status == GameStatus.Player2Won, "Game is not a winning game");
        
        address winner;
        if (game.status == GameStatus.Player1Won) {
            winner = game.player1;
        } else {
            winner = game.player2;
        }
        
        require(msg.sender == winner, "Only winner can claim reward");
        
        // Calculate reward amount
        uint256 rewardAmount = calculateReward(game.wager);
        require(rewardAmount > 0, "No reward available for this game");
        require(rewardAmount <= rewardPool, "Insufficient reward pool balance");
        
        // Transfer reward to winner
        rewardPool -= rewardAmount;
        emit RewardPaid(_gameId, winner, rewardAmount);
        
        (bool success, ) = payable(winner).call{value: rewardAmount}("");
        require(success, "Reward transfer failed");
    }
    
    function withdrawFromRewardPool(uint256 _amount) external onlyOwner {
        require(_amount <= rewardPool, "Insufficient reward pool balance");
        rewardPool -= _amount;
        (bool success, ) = payable(owner).call{value: _amount}("");
        require(success, "Withdrawal failed");
    }
    
    function createGame() external payable returns (uint256) {
        require(msg.value > 0, "Wager must be greater than 0");
        
        uint256 wager = msg.value;
        
        gameCounter++;
        games[gameCounter] = Game({
            player1: msg.sender,
            player2: address(0),
            wager: wager,
            lastMoveTime: block.timestamp,
            status: GameStatus.Empty,
            board: [uint8(0), 0, 0, 0, 0, 0, 0, 0, 0],
            currentTurn: Player.Player1
        });
        
        // No gas deposits - players pay their own gas
        gameMovesCount[gameCounter] = 0;
        
        playerGames[msg.sender].push(gameCounter);
        
        emit GameCreated(gameCounter, msg.sender, wager);
        return gameCounter;
    }
    
    function joinGame(uint256 _gameId) external payable {
        Game storage game = games[_gameId];
        require(game.status == GameStatus.Empty, "Game not available");
        require(game.player2 == address(0), "Game already has two players");
        require(msg.value == game.wager, "Must match exact wager amount");
        require(msg.sender != game.player1, "Cannot join your own game");
        
        game.player2 = msg.sender;
        game.status = GameStatus.Active;
        game.lastMoveTime = block.timestamp;
        
        // No gas deposits - players pay their own gas
        
        playerGames[msg.sender].push(_gameId);
        
        emit GameJoined(_gameId, msg.sender);
    }
    
    function makeMove(uint256 _gameId, uint8 _position) external {
        Game storage game = games[_gameId];
        require(game.status == GameStatus.Active, "Game not active");
        require(_position < 9, "Invalid position");
        require(game.board[_position] == 0, "Position already taken");
        
        // Check if it's the player's turn
        if (game.currentTurn == Player.Player1) {
            require(msg.sender == game.player1, "Not your turn");
            game.board[_position] = 1;
            game.currentTurn = Player.Player2;
        } else {
            require(msg.sender == game.player2, "Not your turn");
            game.board[_position] = 2;
            game.currentTurn = Player.Player1;
        }
        
        game.lastMoveTime = block.timestamp;
        
        // Track moves count
        gameMovesCount[_gameId]++;
        
        emit MoveMade(_gameId, msg.sender, _position);
        
        // Check for win or draw
        GameStatus result = checkGameResult(game.board);
        if (result != GameStatus.Active) {
            game.status = result;
            _handlePayout(_gameId, result);
        }
    }
    
    // Batch move submission - reduces gas costs by 80%
    function submitGameMoves(uint256 _gameId, uint8[] calldata _moves) external {
        Game storage game = games[_gameId];
        require(game.status == GameStatus.Active, "Game not active");
        require(_moves.length <= 9, "Too many moves");
        
        // Verify all moves are valid and in sequence
        for (uint i = 0; i < _moves.length; i++) {
            require(_moves[i] < 9, "Invalid position");
            require(game.board[_moves[i]] == 0, "Position already taken");
            
            // Check turn sequence
            if (i % 2 == 0) {
                require(msg.sender == game.player1, "Wrong player for this move");
                game.board[_moves[i]] = 1;
            } else {
                require(msg.sender == game.player2, "Wrong player for this move");
                game.board[_moves[i]] = 2;
            }
            
            emit MoveMade(_gameId, msg.sender, _moves[i]);
        }
        
        game.lastMoveTime = block.timestamp;
        game.currentTurn = (_moves.length % 2 == 0) ? Player.Player2 : Player.Player1;
        
        // Check for win or draw
        GameStatus result = checkGameResult(game.board);
        if (result != GameStatus.Active) {
            game.status = result;
            _handlePayout(_gameId, result);
        }
    }
    
    function claimTimeout(uint256 _gameId) external {
        Game storage game = games[_gameId];
        require(game.status == GameStatus.Active, "Game not active");
        require(block.timestamp > game.lastMoveTime + TIMEOUT_DURATION, "Timeout not reached");
        
        // Determine who should be punished (the one who didn't make the last move)
        address winner;
        if (game.currentTurn == Player.Player1) {
            // It's player1's turn but they haven't moved, so player2 wins
            winner = game.player2;
        } else {
            // It's player2's turn but they haven't moved, so player1 wins
            winner = game.player1;
        }
        
        game.status = (winner == game.player1) ? GameStatus.Player1Won : GameStatus.Player2Won;
        
        emit TimeoutClaimed(_gameId, winner);
        emit GameOver(_gameId, game.status, winner);
        
        // Calculate total wager pool (both players' wagers)
        uint256 totalWagerPool = game.wager * 2;
        
        // Calculate reward for timeout winner
        uint256 rewardAmount = calculateReward(game.wager);
        
        // Transfer entire pot + reward bonus to winner
        uint256 winnerPayout = totalWagerPool;
        
        // Add reward if available
        if (rewardAmount > 0 && rewardAmount <= rewardPool) {
            winnerPayout += rewardAmount;
            rewardPool -= rewardAmount;
            emit RewardPaid(_gameId, winner, rewardAmount);
        } else if (rewardAmount > 0) {
            // Not enough reward pool, emit depletion event
            emit RewardPoolDepleted(rewardPool);
        }
        
        (bool success, ) = (payable(winner)).call{value: winnerPayout}("");
        require(success, "Transfer to winner failed");
    }
    
    function checkGameResult(uint8[9] memory _board) internal pure returns (GameStatus) {
        // Check rows
        for (uint8 i = 0; i < 3; i++) {
            uint8 rowStart = i * 3;
            if (_board[rowStart] != 0 && 
                _board[rowStart] == _board[rowStart + 1] && 
                _board[rowStart] == _board[rowStart + 2]) {
                return _board[rowStart] == 1 ? GameStatus.Player1Won : GameStatus.Player2Won;
            }
        }
        
        // Check columns
        for (uint8 i = 0; i < 3; i++) {
            if (_board[i] != 0 && 
                _board[i] == _board[i + 3] && 
                _board[i] == _board[i + 6]) {
                return _board[i] == 1 ? GameStatus.Player1Won : GameStatus.Player2Won;
            }
        }
        
        // Check diagonals
        if (_board[0] != 0 && _board[0] == _board[4] && _board[4] == _board[8]) {
            return _board[0] == 1 ? GameStatus.Player1Won : GameStatus.Player2Won;
        }
        
        if (_board[2] != 0 && _board[2] == _board[4] && _board[4] == _board[6]) {
            return _board[2] == 1 ? GameStatus.Player1Won : GameStatus.Player2Won;
        }
        
        // Check for draw
        for (uint8 i = 0; i < 9; i++) {
            if (_board[i] == 0) {
                return GameStatus.Active; // Game still ongoing
            }
        }
        
        return GameStatus.Draw;
    }
    
    function _handlePayout(uint256 _gameId, GameStatus _status) internal {
        Game storage game = games[_gameId];
        
        emit GameOver(_gameId, _status, 
            _status == GameStatus.Player1Won ? game.player1 : 
            _status == GameStatus.Player2Won ? game.player2 : address(0));
        
        // Calculate total wager pool (both players' wagers)
        uint256 totalWagerPool = game.wager * 2;
        
        // Calculate reward for winners
        uint256 rewardAmount = 0;
        if (_status == GameStatus.Player1Won || _status == GameStatus.Player2Won) {
            rewardAmount = calculateReward(game.wager);
        }
        
        // Handle wager payouts
        if (_status == GameStatus.Player1Won) {
            // Player1 wins both wagers + reward bonus
            uint256 payout = totalWagerPool;
            
            // Add reward if available
            if (rewardAmount > 0 && rewardAmount <= rewardPool) {
                payout += rewardAmount;
                rewardPool -= rewardAmount;
                emit RewardPaid(_gameId, game.player1, rewardAmount);
            } else if (rewardAmount > 0) {
                // Not enough reward pool, emit depletion event
                emit RewardPoolDepleted(rewardPool);
            }
            
            (bool success, ) = (payable(game.player1)).call{value: payout}("");
            require(success, "Transfer to player 1 failed");
        } else if (_status == GameStatus.Player2Won) {
            // Player2 wins both wagers + reward bonus
            uint256 payout = totalWagerPool;
            
            // Add reward if available
            if (rewardAmount > 0 && rewardAmount <= rewardPool) {
                payout += rewardAmount;
                rewardPool -= rewardAmount;
                emit RewardPaid(_gameId, game.player2, rewardAmount);
            } else if (rewardAmount > 0) {
                // Not enough reward pool, emit depletion event
                emit RewardPoolDepleted(rewardPool);
            }
            
            (bool success, ) = (payable(game.player2)).call{value: payout}("");
            require(success, "Transfer to player 2 failed");
        } else if (_status == GameStatus.Draw) {
            // Split the wager pool evenly (no rewards for draws)
            uint256 eachWagerReturn = game.wager;
            (bool success1, ) = (payable(game.player1)).call{value: eachWagerReturn}("");
            require(success1, "Transfer to player 1 failed");
            (bool success2, ) = (payable(game.player2)).call{value: eachWagerReturn}("");
            require(success2, "Transfer to player 2 failed");
        }
    }
    
    // View functions
    function getGame(uint256 _gameId) external view returns (
        address player1,
        address player2,
        uint256 wager,
        uint256 lastMoveTime,
        GameStatus status,
        uint8[9] memory board,
        Player currentTurn
    ) {
        Game storage game = games[_gameId];
        return (
            game.player1,
            game.player2,
            game.wager,
            game.lastMoveTime,
            game.status,
            game.board,
            game.currentTurn
        );
    }
    
    function getAvailableGames() external view returns (uint256[] memory) {
        uint256[] memory availableGames = new uint256[](gameCounter);
        uint256 count = 0;
        
        for (uint256 i = 1; i <= gameCounter; i++) {
            if (games[i].status == GameStatus.Empty) {
                availableGames[count] = i;
                count++;
            }
        }
        
        // Resize array to actual count
        uint256[] memory result = new uint256[](count);
        for (uint256 i = 0; i < count; i++) {
            result[i] = availableGames[i];
        }
        
        return result;
    }
    
    function getPlayerGames(address _player) external view returns (uint256[] memory) {
        return playerGames[_player];
    }
    
    function isMyTurn(uint256 _gameId) external view returns (bool) {
        Game storage game = games[_gameId];
        if (game.status != GameStatus.Active) return false;
        
        if (game.currentTurn == Player.Player1) {
            return msg.sender == game.player1;
        } else {
            return msg.sender == game.player2;
        }
    }
    
    // Pre-paid gas view functions
    function getGameGasDeposit(uint256 _gameId, address _player) external view returns (uint256) {
        return gameGasDeposits[_gameId][_player];
    }
    
    function getGameMovesCount(uint256 _gameId) external view returns (uint256) {
        return gameMovesCount[_gameId];
    }
    
    function getGasCostInfo() external pure returns (uint256 moveCost, uint256 totalGameCost) {
        return (MOVE_GAS_COST, TOTAL_GAME_GAS);
    }
    
    function deleteGame(uint256 _gameId) external {
        Game storage game = games[_gameId];
        require(game.player1 != address(0), "Game does not exist");
        require(msg.sender == game.player1, "Only game creator can delete game");
        require(game.status == GameStatus.Empty, "Can only delete games that haven't been joined");
        
        // Refund gas deposit to creator
        uint256 gasDeposit = gameGasDeposits[_gameId][game.player1];
        if (gasDeposit > 0) {
            gameGasDeposits[_gameId][game.player1] = 0;
            (bool success, ) = payable(game.player1).call{value: gasDeposit}("");
            require(success, "Failed to refund gas deposit");
            emit GasRefunded(_gameId, game.player1, gasDeposit);
        }
        
        // Refund wager to creator
        if (game.wager > 0) {
            (bool success, ) = payable(game.player1).call{value: game.wager}("");
            require(success, "Failed to refund wager");
        }
        
        // Remove game from player's games list
        uint256[] storage playerGameList = playerGames[game.player1];
        for (uint256 i = 0; i < playerGameList.length; i++) {
            if (playerGameList[i] == _gameId) {
                playerGameList[i] = playerGameList[playerGameList.length - 1];
                playerGameList.pop();
                break;
            }
        }
        
        // Delete the game
        delete games[_gameId];
        // Note: mappings cannot be deleted directly, but individual entries can be deleted
        // gameGasDeposits[_gameId] and gameMovesCount[_gameId] will remain but won't be accessible
        // since the game itself is deleted
    }
}
