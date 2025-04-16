require('dotenv').config();
const express = require("express");
const cors = require("cors");
const fetch = require("node-fetch");
const NodeCache = require("node-cache");
const rateLimit = require("express-rate-limit");
const morgan = require("morgan");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;
const RETRY_DELAY = parseInt(process.env.RETRY_DELAY_MS) || 500;

// Validate essential environment variables
if (!process.env.API_KEYS) {
  console.error("❌ Error: API_KEYS environment variable is required");
  process.exit(1);
}

// Middleware
app.use(cors());
app.use(express.json());
app.use(morgan("dev"));

// Rate Limiting
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  message: "Too many requests, please try again later.",
  standardHeaders: true,
  legacyHeaders: false
});

// Cache configuration
const matchCache = new NodeCache({ 
  stdTTL: 300, // 5 minutes cache
  checkperiod: 60,
  useClones: false
});

// Load and validate API Keys
const apiKeys = process.env.API_KEYS.split(",")
  .map(key => key.trim())
  .filter(key => {
    if (!key) return false;
    if (key.length < 20) {
      console.warn(`⚠️ Warning: API key '****${key.slice(-4)}' seems too short`);
    }
    return true;
  });

if (apiKeys.length === 0) {
  console.error("❌ Error: No valid API keys found in API_KEYS environment variable");
  process.exit(1);
}

console.log("✅ Loaded API Keys:", apiKeys.length, "keys available");

let currentKeyIndex = 0;
const keyStatus = apiKeys.map(key => ({
  key,
  available: true,
  lastUsed: null,
  failures: 0
}));

// API Key Rotation with Retry and Cache
async function fetchWithRotation(urlGenerator, cacheTag, maxRetries = apiKeys.length * 2) {
  let attempts = 0;
  let lastError = null;

  while (attempts < maxRetries) {
    const currentKey = keyStatus[currentKeyIndex];
    
    // Skip unavailable keys (unless they've had time to recover)
    if (!currentKey.available) {
      const now = new Date();
      const hoursSinceLastUse = (now - new Date(currentKey.lastUsed)) / (1000 * 60 * 60);
      
      if (hoursSinceLastUse < 1) { // 1 hour cooldown
        currentKeyIndex = (currentKeyIndex + 1) % apiKeys.length;
        attempts++;
        continue;
      } else {
        currentKey.available = true;
        currentKey.failures = 0;
      }
    }

    const { key: apiKey } = currentKey;
    const url = urlGenerator(apiKey);
    const cacheKey = `${cacheTag}_${apiKey}`;
    
    // Check cache first
    const cachedData = matchCache.get(cacheKey);
    if (cachedData) {
      return cachedData;
    }

    try {
      console.log(`🔑 Using API key: ****${apiKey.slice(-4)} (Attempt ${attempts + 1}/${maxRetries})`);
      
      const response = await fetch(url, {
        timeout: 5000 // 5 second timeout
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status} ${response.statusText}`);
      }

      const data = await response.json();

      if (data.status === "error") {
        if (data.message?.toLowerCase().includes("limit")) {
          throw new Error(`Rate limit exceeded for key ****${apiKey.slice(-4)}`);
        }
        throw new Error(data.message || "API returned error status");
      }

      // Cache successful response
      matchCache.set(cacheKey, data);
      currentKey.lastUsed = new Date();
      currentKey.failures = 0;
      
      return data;
    } catch (error) {
      lastError = error;
      console.warn(`⚠️ Request failed with key ****${apiKey.slice(-4)}: ${error.message}`);
      
      // Mark key as unavailable if it's a rate limit error
      if (error.message.includes("limit")) {
        currentKey.available = false;
        currentKey.failures += 1;
      }
      
      currentKey.lastUsed = new Date();
      currentKeyIndex = (currentKeyIndex + 1) % apiKeys.length;
      attempts++;
      
      // Add delay between retries
      if (attempts < maxRetries) {
        await new Promise(resolve => setTimeout(resolve, RETRY_DELAY));
      }
    }
  }

  throw new Error(`All API keys failed after ${maxRetries} attempts. Last error: ${lastError?.message}`);
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
    console.error("Error in /api/currentMatches:", error);
    res.status(500).json({ 
      status: "error", 
      message: error.message,
      details: "Failed to fetch current matches"
    });
  }
});

app.get("/api/matchStats/:matchId", apiLimiter, async (req, res) => {
  try {
    const { matchId } = req.params;
    if (!matchId || matchId.length < 10) {
      return res.status(400).json({ 
        status: "error", 
        message: "Invalid match ID" 
      });
    }

    const data = await fetchWithRotation(
      (key) => `https://api.cricapi.com/v1/match_info?apikey=${key}&id=${matchId}`,
      `matchStats_${matchId}`
    );
    res.json(data);
  } catch (error) {
    console.error(`Error in /api/matchStats/${req.params.matchId}:`, error);
    res.status(500).json({ 
      status: "error", 
      message: error.message,
      details: "Failed to fetch match statistics"
    });
  }
});

app.get("/api/playerStats/:playerId", apiLimiter, async (req, res) => {
  try {
    const { playerId } = req.params;
    if (!playerId || playerId.length < 10) {
      return res.status(400).json({ 
        status: "error", 
        message: "Invalid player ID" 
      });
    }

    const data = await fetchWithRotation(
      (key) => `https://api.cricapi.com/v1/players_info?apikey=${key}&id=${playerId}`,
      `playerStats_${playerId}`
    );
    res.json(data);
  } catch (error) {
    console.error(`Error in /api/playerStats/${req.params.playerId}:`, error);
    res.status(500).json({ 
      status: "error", 
      message: error.message,
      details: "Failed to fetch player statistics"
    });
  }
});

app.post("/api/predict", apiLimiter, async (req, res) => {
  try {
    const { team1, team2 } = req.body;
    
    if (!team1 || !team2) {
      return res.status(400).json({ 
        status: "error", 
        message: "Both team1 and team2 are required" 
      });
    }

    // Simple prediction logic (replace with actual model if available)
    const prediction = Math.random() > 0.5 ? team1 : team2;
    const confidence = (Math.random() * 0.5 + 0.5).toFixed(2); // 0.50-1.00
    
    res.json({ 
      prediction, 
      confidence,
      details: "This is a mock prediction. For real predictions, implement a proper model."
    });
  } catch (error) {
    console.error("Error in /api/predict:", error);
    res.status(500).json({ 
      status: "error", 
      message: error.message,
      details: "Prediction failed"
    });
  }
});

// Health Check Endpoint
app.get("/health", (req, res) => {
  const healthStatus = {
    status: "ok",
    timestamp: new Date().toISOString(),
    apiKeys: {
      total: apiKeys.length,
      available: keyStatus.filter(k => k.available).length
    },
    memoryUsage: process.memoryUsage(),
    uptime: process.uptime()
  };
  
  res.json(healthStatus);
});

// Serve static files from the 'public' directory
const publicRoot = path.join(__dirname, 'public');
app.use(express.static(publicRoot));

// SPA fallback routes
app.get(['/', '/live', '/schedule', '/predictions'], (req, res) => {
  res.sendFile(path.join(publicRoot, 'index.html'));
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({
    status: "error",
    message: "Internal server error",
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// Start the server
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`🌐 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🔑 API Keys available: ${keyStatus.filter(k => k.available).length}/${apiKeys.length}`);
});
