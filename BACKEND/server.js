
require('dotenv').config();
const express = require("express");
const cors = require("cors");
const fetch = require("node-fetch");
const NodeCache = require("node-cache");
const rateLimit = require("express-rate-limit");
const path = require("path");

// Initialize express app
const app = express();
const PORT = process.env.PORT || 3000;
const RETRY_DELAY = parseInt(process.env.RETRY_DELAY_MS) || 500;

// Basic logging middleware (replacing morgan)
app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  next();
});

const publicRoot = path.join(__dirname, 'public');
app.use(express.static(publicRoot));

const fs = require('fs');
const publicFolderPath = path.join(__dirname, 'public');

if (fs.existsSync(publicFolderPath)) {
  app.use(express.static(publicFolderPath));
  console.log(`✅ Serving static files from: ${publicFolderPath}`);
} else {
  console.warn(`⚠️ PUBLIC folder not found at: ${publicFolderPath}`);
}



// Ye line add karo:
app.use('/ads.txt', express.static(path.join(__dirname, 'ads.txt')));

// Middleware
app.use(cors());
app.use(express.json());

// Rate Limiting
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: "Too many requests, please try again later."
});

// Cache
const matchCache = new NodeCache({ stdTTL: 300, checkperiod: 60 });

// Load API Keys
const apiKeys = process.env.API_KEYS?.split(",").map(key => key.trim()).filter(Boolean) || [];
if (apiKeys.length === 0) {
  console.error("❌ No API keys found. Please add API_KEYS in your .env file.");
  process.exit(1);
}

let currentKeyIndex = 0;
let keyStatus = apiKeys.map(key => ({
  key,
  available: true,
  lastUsed: null
}));

console.log("✅ Loaded API Keys:", apiKeys.map(k => `****${k.slice(-4)}`).join(", "));

// API Key Rotation with Cache
async function fetchWithRotation(urlGenerator, cacheTag) {
  let attempts = 0;
  const maxAttempts = apiKeys.length * 2;

  while (attempts < maxAttempts) {
    const { key: apiKey } = keyStatus[currentKeyIndex];
    const url = urlGenerator(apiKey);
    const cacheKey = `${cacheTag}_${apiKey}`;
    const cached = matchCache.get(cacheKey);

    if (cached) return cached;

    try {
      console.log(`🔑 Trying API key: ****${apiKey.slice(-4)}`);
      const response = await fetch(url);
      const data = await response.json();

      if (!response.ok || data.status === "error") {
        if (data.message?.toLowerCase().includes("limit")) {
          keyStatus[currentKeyIndex].available = false;
          keyStatus[currentKeyIndex].lastUsed = new Date();
          throw new Error(`Limit exceeded for key ****${apiKey.slice(-4)}`);
        }
        throw new Error(data.message || "API Error");
      }

      matchCache.set(cacheKey, data);
      keyStatus[currentKeyIndex].lastUsed = new Date();
      return data;
    } catch (err) {
      console.warn(`⚠️ Key ****${apiKey.slice(-4)} failed: ${err.message}`);
      currentKeyIndex = (currentKeyIndex + 1) % apiKeys.length;
      attempts++;

      if (attempts % apiKeys.length === 0) {
        const now = new Date();
        keyStatus.forEach(status => {
          if (!status.available && now - new Date(status.lastUsed) > 3600000) {
            status.available = true;
          }
        });
      }

      await new Promise(res => setTimeout(res, RETRY_DELAY));
    }
  }

  throw new Error("All API keys failed or exhausted.");
}

// API Routes
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

app.post("/api/predict", apiLimiter, async (req, res) => {
  try {
    const { team1, team2 } = req.body;
    const prediction = Math.random() > 0.5 ? team1 : team2;
    const confidence = Math.random().toFixed(2);
    res.json({ prediction, confidence });
  } catch (error) {
    res.status(500).json({ status: "error", message: error.message });
  }
});

// Health Check
app.get("/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// Serve static files - UPDATED PATH TO MATCH YOUR STRUCTURE
const publicRoot = path.join(__dirname, 'PUBLIC'); // Changed from 'public' to 'PUBLIC'
console.log(`Serving static files from: ${publicRoot}`); // Debug log

app.use(express.static(publicRoot));

// SPA routes - UPDATED TO MATCH YOUR STRUCTURE
app.get(['/', '/live', '/schedule', '/predictions'], (req, res) => {
  const filePath = path.join(publicRoot, 'index.html');
  console.log(`Attempting to send file: ${filePath}`); // Debug log
  res.sendFile(filePath, (err) => {
    if (err) {
      console.error('Error sending file:', err);
      res.status(500).send('Error loading page');
    }
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`Static files being served from: ${publicRoot}`);
});
