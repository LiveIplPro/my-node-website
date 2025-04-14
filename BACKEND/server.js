require('dotenv').config();
const express = require("express");
const cors = require("cors");
const fetch = require("node-fetch");
const NodeCache = require("node-cache");
const rateLimit = require("express-rate-limit");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Static files served from PUBLIC folder (adjusted for Render deployment)
app.use(express.static(path.join(__dirname, '..', 'PUBLIC')));

// Cache setup (5 mins TTL)
const matchCache = new NodeCache({ stdTTL: 300, checkperiod: 60 });

// Rate limiting middleware
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: "Too many requests, please try again later."
});

// API key rotation setup
const apiKeys = process.env.API_KEYS?.split(",") || [];
let currentKeyIndex = 0;
let keyStatus = apiKeys.map(key => ({ key, available: true, lastUsed: null }));

if (apiKeys.length === 0) {
  console.error("❌ No API keys found. Please check your .env file.");
  process.exit(1);
}

console.log("✅ Loaded API keys:", apiKeys.map(k => "****" + k.slice(-4)).join(", "));

// Rotating fetch function with cache
async function fetchWithRotation(urlGenerator, endpoint) {
  let attempts = 0;
  const maxAttempts = apiKeys.length * 2;

  while (attempts < maxAttempts) {
    const currentKey = keyStatus[currentKeyIndex];
    const apiKey = currentKey.key;
    const url = urlGenerator(apiKey);
    const cacheKey = `${endpoint}_${apiKey}`;
    const cachedData = matchCache.get(cacheKey);

    if (cachedData) return cachedData;

    try {
      console.log(`🔑 Using API key ending with: ${apiKey.slice(-4)}`);
      const response = await fetch(url);
      const data = await response.json();

      if (!response.ok || (data && data.status === "error")) {
        if (data.message?.toLowerCase().includes("limit")) {
          console.warn(`⚠️ API key limit exceeded: ${apiKey.slice(-4)}`);
          keyStatus[currentKeyIndex].available = false;
        }
        throw new Error(data.message || "API request failed");
      }

      matchCache.set(cacheKey, data);
      keyStatus[currentKeyIndex].lastUsed = new Date();
      return data;
    } catch (err) {
      console.error(`❌ Attempt ${attempts + 1} failed: ${err.message}`);
      currentKeyIndex = (currentKeyIndex + 1) % apiKeys.length;
      attempts++;

      if (attempts % apiKeys.length === 0) {
        keyStatus.forEach(k => {
          if (!k.available && k.lastUsed && (new Date() - k.lastUsed) > 3600000) {
            k.available = true;
          }
        });
      }

      await new Promise(resolve => setTimeout(resolve, 500));
    }
  }

  throw new Error("All API keys failed or exhausted.");
}

// API endpoints
app.get("/api/currentMatches", apiLimiter, async (req, res) => {
  try {
    const data = await fetchWithRotation(
      key => `https://api.cricapi.com/v1/currentMatches?apikey=${key}&offset=0`,
      "currentMatches"
    );
    res.json(data);
  } catch (err) {
    res.status(500).json({ status: "error", message: err.message });
  }
});

app.get("/api/matchStats/:matchId", apiLimiter, async (req, res) => {
  try {
    const { matchId } = req.params;
    const data = await fetchWithRotation(
      key => `https://api.cricapi.com/v1/match_info?apikey=${key}&id=${matchId}`,
      `matchStats_${matchId}`
    );
    res.json(data);
  } catch (err) {
    res.status(500).json({ status: "error", message: err.message });
  }
});

app.get("/api/playerStats/:playerId", apiLimiter, async (req, res) => {
  try {
    const { playerId } = req.params;
    const data = await fetchWithRotation(
      key => `https://api.cricapi.com/v1/players_info?apikey=${key}&id=${playerId}`,
      `playerStats_${playerId}`
    );
    res.json(data);
  } catch (err) {
    res.status(500).json({ status: "error", message: err.message });
  }
});

// Prediction Endpoint
app.post("/api/predict", apiLimiter, (req, res) => {
  try {
    const { team1, team2 } = req.body;
    const prediction = Math.random() > 0.5 ? team1 : team2;
    res.json({ prediction, confidence: Math.random().toFixed(2) });
  } catch (err) {
    res.status(500).json({ status: "error", message: err.message });
  }
});

// Wildcard route for SPA support
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'PUBLIC', 'index.html'));
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server started on http://localhost:${PORT}`);
});
