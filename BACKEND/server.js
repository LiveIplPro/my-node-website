const express = require('express');
const cors = require('cors');
const axios = require('axios');
const path = require('path');
const {
  currentMatches,
  cricScore,
  seriesList,
  matchesList,
  matchInfo,
  playersList,
  playerInfo,
  teams,
  rotateKey
} = require('./cricapiConfig');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Serve static files (for frontend)
app.use(express.static(path.join(__dirname, 'public')));

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

// Helper function to make API calls with key rotation
async function makeApiCall(url) {
  try {
    const response = await axios.get(url);
    return response.data;
  } catch (error) {
    if (
      error.response &&
      (error.response.status === 403 || error.response.status === 429)
    ) {
      console.log('API key limit reached or expired, rotating key...');
      rotateKey();
      const newUrl = url.replace(
        /apikey=[^&]*/,
        `apikey=${process.env.API_KEYS.split(',')[0]}`
      );
      return makeApiCall(newUrl);
    }
    throw error;
  }
}

// API Routes
app.get('/api/current-matches', async (req, res) => {
  try {
    const data = await makeApiCall(currentMatches());
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch current matches' });
  }
});

app.get('/api/live-scores', async (req, res) => {
  try {
    const data = await makeApiCall(cricScore());
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch live scores' });
  }
});

app.get('/api/schedule', async (req, res) => {
  try {
    const data = await makeApiCall(matchesList());
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch schedule' });
  }
});

app.get('/api/teams', async (req, res) => {
  try {
    const data = await makeApiCall(teams());
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch teams' });
  }
});

app.get('/api/players', async (req, res) => {
  try {
    const data = await makeApiCall(playersList());
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch players' });
  }
});

app.get('/api/player/:id', async (req, res) => {
  try {
    const data = await makeApiCall(playerInfo(req.params.id));
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch player info' });
  }
});

app.get('/api/match/:id', async (req, res) => {
  try {
    const data = await makeApiCall(matchInfo(req.params.id));
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch match info' });
  }
});

// Catch-all for frontend routing (optional)
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
