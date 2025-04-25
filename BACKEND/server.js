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

// Middleware
app.use(cors());
app.use(express.json());

// Basic logging middleware (replacing morgan)
app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  next();
});

// Static files serving
const publicRoot = path.join(__dirname, 'PUBLIC');
console.log(`Serving static files from: ${publicRoot}`);
app.use(express.static(publicRoot));
app.use('/ads.txt', express.static(path.join(__dirname, 'ads.txt')));
app.use('/robots.txt', express.static(path.join(__dirname, 'robots.txt')));
app.use('/sitemap.xml', express.static(path.join(__dirname, 'sitemap.xml')));

// Rate Limiting
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: "Too many requests, please try again later."
});

// Points Table Data
const pointsTable = [
  {
    name: "Mumbai Indians",
    logo: "https://i.imgur.com/R1m23jr.jpeg",
    matches: 7,
    won: 5,
    lost: 2,
    tied: 0,
    noResult: 0,
    points: 10,
    nrr: "+0.785"
  },
  {
    name: "Chennai Super Kings",
    logo: "https://i.imgur.com/a1y2CwB.jpeg",
    matches: 7,
    won: 4,
    lost: 3,
    tied: 0,
    noResult: 0,
    points: 8,
    nrr: "+0.123"
  }
];

// API Endpoint for Points Table
app.get('/api/pointsTable', (req, res) => {
  res.json(pointsTable);
});

// Teams डेटा के लिए API रूट
app.get('/api/teams', (req, res) => {
  const teamsData = [
    {
      name: "Chennai Super Kings",
      captain: "Ruturaj Gaikwad",
      logo: "https://i.imgur.com/LsT0VWz.jpeg",
      trophies: 5,
      matches: 210,
      wins: 130,
      losses: 80,
      description: "Chennai Super Kings is one of the most successful teams in IPL history."
    },
    {
      name: "Mumbai Indians",
      captain: "Hardik Pandya",
      logo: "https://i.imgur.com/R1m23jr.jpeg",
      trophies: 5,
      matches: 231,
      wins: 129,
      losses: 98,
      description: "Mumbai Indians is the most successful team in IPL history."
    }
  ];
  res.json(teamsData);
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

// SPA routes - should come after static files serving
app.get(['/', '/live', '/schedule', '/predictions'], (req, res) => {
  res.sendFile(path.join(publicRoot, 'index.html'), (err) => {
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

