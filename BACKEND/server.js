require('dotenv').config();
const express = require("express");
const cors = require("cors");
const fetch = require("node-fetch");
const NodeCache = require("node-cache");
const rateLimit = require("express-rate-limit");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;
const RETRY_DELAY = parseInt(process.env.RETRY_DELAY_MS) || 500;

// Middleware
app.use(cors());
app.use(express.json());

// Logging middleware
app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  next();
});

// Serve static files
const publicRoot = path.join(__dirname, 'PUBLIC');
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

// Teams API
app.get('/api/teams', (req, res) => {
  const teamsData = [
    // ... (keep your existing teams data)
  ];
  res.json(teamsData);
});

// API key rotation + caching
const matchCache = new NodeCache({ 
  stdTTL: 300, // 5 minutes cache
  checkperiod: 60 // check every minute for expired items
});

// Multiple API endpoints configuration
const API_ENDPOINTS = [
  {
    name: "currentMatches",
    url: (key) => `https://api.cricapi.com/v1/currentMatches?apikey=${key}&offset=0`
  },
  {
    name: "cricScore",
    url: (key) => `https://api.cricapi.com/v1/cricScore?apikey=${key}`
  },
  {
    name: "series",
    url: (key) => `https://api.cricapi.com/v1/series?apikey=${key}&offset=0`
  },
  {
    name: "matches",
    url: (key) => `https://api.cricapi.com/v1/matches?apikey=${key}&offset=0`
  },
  {
    name: "players",
    url: (key) => `https://api.cricapi.com/v1/players?apikey=${key}&offset=0`
  }
];

const apiKeys = process.env.API_KEYS?.split(",").map(k => k.trim()).filter(Boolean) || [];

if (apiKeys.length === 0) {
  console.error("❌ No API keys found. Please add API_KEYS in your .env file.");
  process.exit(1);
}

let currentKeyIndex = 0;
let keyStatus = apiKeys.map(key => ({ key, available: true, lastUsed: null, callCount: 0 }));

console.log("✅ Loaded API Keys:", apiKeys.map(k => `****${k.slice(-4)}`).join(", "));

async function fetchWithRotation(endpointName, cacheTag) {
  let attempts = 0;
  const maxAttempts = apiKeys.length * 2;
  const endpoint = API_ENDPOINTS.find(e => e.name === endpointName);

  while (attempts < maxAttempts) {
    const { key: apiKey } = keyStatus[currentKeyIndex];
    const url = endpoint.url(apiKey);
    const cacheKey = `${cacheTag}_${apiKey}`;
    const cached = matchCache.get(cacheKey);

    if (cached) {
      console.log(`📦 Using cached data for ${cacheTag}`);
      return cached;
    }

    try {
      console.log(`🔑 Trying API key: ****${apiKey.slice(-4)} for ${endpointName}`);
      const response = await fetch(url);
      const data = await response.json();

      if (!response.ok || data.status === "error") {
        if (data.message?.toLowerCase().includes("limit")) {
          console.warn(`⚠️ Rate limit exceeded for key ****${apiKey.slice(-4)}`);
          keyStatus[currentKeyIndex].available = false;
          keyStatus[currentKeyIndex].lastUsed = new Date();
          throw new Error(`Limit exceeded for key ****${apiKey.slice(-4)}`);
        }
        throw new Error(data.message || "API Error");
      }

      // Increment call count and rotate if needed
      keyStatus[currentKeyIndex].callCount++;
      if (keyStatus[currentKeyIndex].callCount >= 100) {
        console.log(`🔄 Rotating API key after 100 calls: ****${apiKey.slice(-4)}`);
        keyStatus[currentKeyIndex].callCount = 0;
        currentKeyIndex = (currentKeyIndex + 1) % apiKeys.length;
      }

      matchCache.set(cacheKey, data);
      keyStatus[currentKeyIndex].lastUsed = new Date();
      console.log(`✅ Success with key ****${apiKey.slice(-4)}`);
      return data;
    } catch (err) {
      console.warn(`⚠️ Key ****${apiKey.slice(-4)} failed: ${err.message}`);
      currentKeyIndex = (currentKeyIndex + 1) % apiKeys.length;
      attempts++;

      // Reset keys if they've been unavailable for more than 1 hour
      if (attempts % apiKeys.length === 0) {
        const now = new Date();
        keyStatus.forEach(status => {
          if (!status.available && now - new Date(status.lastUsed) > 3600000) {
            status.available = true;
            console.log(`♻️ Resetting key ****${status.key.slice(-4)}`);
          }
        });
      }

      await new Promise(res => setTimeout(res, RETRY_DELAY));
    }
  }

  console.error("❌ All API keys failed or exhausted");
  throw new Error("All API keys failed or exhausted.");
}

// API Routes
app.get("/api/liveScores", apiLimiter, async (req, res) => {
  try {
    const data = await fetchWithRotation("cricScore", "liveScores");
    res.json(data);
  } catch (error) {
    console.error("Error in /api/liveScores:", error.message);
    res.status(500).json({ status: "error", message: error.message });
  }
});

app.get("/api/currentMatches", apiLimiter, async (req, res) => {
  try {
    const data = await fetchWithRotation("currentMatches", "currentMatches");
    res.json(data);
  } catch (error) {
    console.error("Error in /api/currentMatches:", error.message);
    res.status(500).json({ status: "error", message: error.message });
  }
});

// ... (keep your other existing routes)

// Health Check
app.get("/health", (req, res) => {
  res.json({ 
    status: "ok", 
    timestamp: new Date().toISOString(),
    apiKeys: keyStatus.map(k => ({
      key: `****${k.key.slice(-4)}`,
      available: k.available,
      callCount: k.callCount
    }))
  });
});

// SPA Routes
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
