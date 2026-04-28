import express from 'express';
import cors from 'cors';
import { MONGODB_URL, PORT } from './config/serverConfig.js';
import { connectDB } from './db/connect.js';
import authenticationRoute from './routes/authenticationRoute.js';
import gameRoute from './routes/gameRoute.js';
import { startEventListener, syncExistingGames } from './controllers/webhookController.js';

const app = express();

app.use(cors());
app.use(express.json());

app.use('/api', authenticationRoute);
app.use('/api/game', gameRoute);

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'OK', service: 'TicTacToe Arena Backend' });
});

// Manual sync endpoint
app.post('/api/sync-games', async (req, res) => {
  try {
    await syncExistingGames();
    res.json({ message: 'Game sync completed successfully' });
  } catch (error) {
    console.error('Error during manual sync:', error);
    res.status(500).json({ error: 'Failed to sync games' });
  }
});

async function serverStart() {
  try {
    await connectDB(MONGODB_URL);
    console.log('Connected to database');
    
    // Start event listeners for contract events
    startEventListener();
    
    // Sync existing games on startup (with delay to ensure connection is stable)
    setTimeout(async () => {
      try {
        await syncExistingGames();
      } catch (error) {
        console.error('Initial sync failed:', error);
      }
    }, 5000);
    
    app.listen(PORT, () => {
      console.log(`TicTacToe Arena server is running on port ${PORT}`);
    });
  } catch (error) {
    console.log(error);
  }
}

serverStart();
