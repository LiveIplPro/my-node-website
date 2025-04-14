require('dotenv').config();
const express = require("express");
const cors = require("cors");
const fetch = require("node-fetch");
const NodeCache = require("node-cache");
const rateLimit = require("express-rate-limit");

const app = express();
const path = require('path');
const PORT = process.env.PORT || 3000;

// Serve static files from PUBLIC folder
app.use(express.static(path.join(__dirname, 'PUBLIC')));

// For any other route, serve index.html (for SPA or direct URL access)
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'PUBLIC', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

// Middleware
app.use(cors());
app.use(express.json());

// Cache setup (5 minutes TTL)
const matchCache = new NodeCache({ stdTTL: 300, checkperiod: 60 });

// Rate limiting to protect API keys
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: "Too many requests, please try again later."
});

// API key rotation setup
const apiKeys = process.env.API_KEYS?.split(",") || [];
let currentKeyIndex = 0;
let keyStatus = apiKeys.map(key => ({ key, available: true, lastUsed: null }));

// Log loaded keys (for debugging)
console.log("Loaded API Keys:", apiKeys.length > 0 ? "*****" + apiKeys[0].slice(-4) + "..." : "None");

if (apiKeys.length === 0) {
  console.error("❌ No API keys found. Please check your .env file.");
  process.exit(1);
}

// API Key rotation with status tracking
async function fetchWithRotation(urlGenerator, endpoint) {
  let attempts = 0;
  const maxAttempts = apiKeys.length * 2; // Try each key twice before failing

  while (attempts < maxAttempts) {
    const currentKeyData = keyStatus[currentKeyIndex];
    const apiKey = currentKeyData.key;
    const url = urlGenerator(apiKey);

    // Check cache first
    const cacheKey = `${endpoint}_${apiKey}`;
    const cachedData = matchCache.get(cacheKey);
    if (cachedData) {
      return cachedData;
    }

    try {
      console.log(`Using API key ending with: ${apiKey.slice(-4)}`);
      const response = await fetch(url);
      const data = await response.json();

      if (!response.ok || (data && data.status === "error")) {
        // Handle API errors
        if (data.message?.toLowerCase().includes("limit")) {
          console.warn(`Key limit exceeded: ${apiKey.slice(-4)}`);
          keyStatus[currentKeyIndex].available = false;
        }
        throw new Error(data.message || "API request failed");
      }

      // Cache successful response
      matchCache.set(cacheKey, data);
      keyStatus[currentKeyIndex].lastUsed = new Date();
      return data;
    } catch (err) {
      console.error(`Attempt ${attempts + 1} failed with key ${apiKey.slice(-4)}:`, err.message);
      currentKeyIndex = (currentKeyIndex + 1) % apiKeys.length;
      attempts++;
      
      // If all keys tried once, check if any became available again
      if (attempts % apiKeys.length === 0) {
        keyStatus.forEach(key => {
          if (!key.available && key.lastUsed && (new Date() - key.lastUsed) > 3600000) {
            key.available = true; // Make key available again after 1 hour
          }
        });
      }
      
      // Small delay between attempts
      await new Promise(resolve => setTimeout(resolve, 500));
    }
  }

  throw new Error("All API keys exhausted or failed after multiple attempts");
}

// API Endpoints
app.get("/api/currentMatches", apiLimiter, async (req, res) => {
  try {
    const data = await fetchWithRotation(
      (key) => `https://api.cricapi.com/v1/currentMatches?apikey=${key}&offset=0`,
      "currentMatches"
    );
    res.json(data);
  } catch (error) {
    res.status(500).json({ status: "error", message: error.message });
  }
});

app.get("/api/matchStats/:matchId", apiLimiter, async (req, res) => {
  try {
    const { matchId } = req.params;
    const data = await fetchWithRotation(
      (key) => `https://api.cricapi.com/v1/match_info?apikey=${key}&id=${matchId}`,
      `matchStats_${matchId}`
    );
    res.json(data);
  } catch (error) {
    res.status(500).json({ status: "error", message: error.message });
  }
});

app.get("/api/playerStats/:playerId", apiLimiter, async (req, res) => {
  try {
    const { playerId } = req.params;
    const data = await fetchWithRotation(
      (key) => `https://api.cricapi.com/v1/players_info?apikey=${key}&id=${playerId}`,
      `playerStats_${playerId}`
    );
    res.json(data);
  } catch (error) {
    res.status(500).json({ status: "error", message: error.message });
  }
});

// Prediction endpoint (basic example)
app.post("/api/predict", apiLimiter, async (req, res) => {
  try {
    // In a real app, you'd use a proper prediction model
    const { team1, team2 } = req.body;
    const prediction = Math.random() > 0.5 ? team1 : team2;
    res.json({ 
      prediction,
      confidence: Math.random().toFixed(2)
    });
  } catch (error) {
    res.status(500).json({ status: "error", message: error.message });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`✅ Server running at http://localhost:${PORT}`);
});
