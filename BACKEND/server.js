require('dotenv').config({ path: process.env.NODE_ENV === 'production' ? '.env.production' : '.env' });
const express = require("express");
const cors = require("cors");
const fetch = require("node-fetch");
const NodeCache = require("node-cache");
const rateLimit = require("express-rate-limit");
const path = require("path");
const axios = require("axios");
const helmet = require("helmet");

const app = express();
const PORT = process.env.PORT || 3000;
const RETRY_DELAY = parseInt(process.env.RETRY_DELAY_MS) || 500;
const isProduction = process.env.NODE_ENV === 'production';

// Enhanced Middleware
app.use(helmet()); // Security headers
app.use(cors({
  origin: isProduction ? process.env.FRONTEND_URL : '*',
  optionsSuccessStatus: 200
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Improved logging middleware
app.use((req, res, next) => {
  console.log(`${req.method} ${req.url} - ${req.ip}`);
  next();
});

// Serve static files with cache control
const publicRoot = path.join(__dirname, 'public');
app.use(express.static(publicRoot, {
  maxAge: isProduction ? '1d' : '0',
  etag: true
}));

// Rate Limiting - stricter in production
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: isProduction ? 100 : 200,
  message: "Too many requests, please try again later.",
  standardHeaders: true,
  legacyHeaders: false
});

// IPL Teams List
const IPL_TEAMS = [
  "Chennai Super Kings", "Delhi Capitals", "Gujarat Titans",
  "Kolkata Knight Riders", "Lucknow Super Giants", "Mumbai Indians",
  "Punjab Kings", "Rajasthan Royals", "Royal Challengers Bengaluru",
  "Sunrisers Hyderabad"
];

// Enhanced API key rotation + caching
const matchCache = new NodeCache({ 
  stdTTL: 300,
  checkperiod: 60,
  useClones: false
});

const apiKeys = process.env.API_KEYS?.split(",").map(k => k.trim()).filter(Boolean) || [];
if (apiKeys.length === 0 && isProduction) {
  console.error("❌ No API keys found in production!");
  process.exit(1);
}

let currentKeyIndex = 0;
let keyStatus = apiKeys.map(key => ({ key, available: true, lastUsed: null }));

async function fetchWithRotation(urlGenerator, cacheTag) {
  let attempts = 0;
  const maxAttempts = apiKeys.length > 0 ? apiKeys.length * 2 : 1;

  while (attempts < maxAttempts) {
    const apiKey = apiKeys.length > 0 ? keyStatus[currentKeyIndex].key : 'dummy';
    const url = urlGenerator(apiKey);
    const cacheKey = `${cacheTag}_${apiKey}`;
    const cached = matchCache.get(cacheKey);

    if (cached) {
      console.log(`📦 Using cached data for ${cacheTag}`);
      return cached;
    }

    try {
      if (apiKeys.length > 0) {
        console.log(`🔑 Trying API key: ****${apiKey.slice(-4)}`);
      }
      
      const response = await fetch(url, {
        timeout: 5000 // 5 second timeout
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (data.status === "error") {
        if (data.message?.toLowerCase().includes("limit")) {
          console.warn(`⚠️ Rate limit exceeded for key ****${apiKey.slice(-4)}`);
          keyStatus[currentKeyIndex].available = false;
          keyStatus[currentKeyIndex].lastUsed = new Date();
          throw new Error(`Limit exceeded for key ****${apiKey.slice(-4)}`);
        }
        throw new Error(data.message || "API Error");
      }

      matchCache.set(cacheKey, data);
      if (apiKeys.length > 0) {
        keyStatus[currentKeyIndex].lastUsed = new Date();
        console.log(`✅ Success with key ****${apiKey.slice(-4)}`);
      }
      return data;
    } catch (err) {
      console.warn(`⚠️ Request failed: ${err.message}`);
      
      if (apiKeys.length > 0) {
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
      } else {
        attempts++;
      }

      await new Promise(res => setTimeout(res, RETRY_DELAY));
    }
  }

  console.error("❌ All API attempts failed");
  throw new Error(apiKeys.length > 0 ? "All API keys failed or exhausted." : "API request failed");
}

// Current Matches API - updated with better error handling
app.get("/api/currentMatches", apiLimiter, async (req, res, next) => {
  try {
    let apiMatches = [];
    let upcomingIPLMatches = [];

    if (apiKeys.length > 0) {
      try {
        const data = await fetchWithRotation(
          (key) => `https://api.cricapi.com/v1/currentMatches?apikey=${key}&offset=0`,
          "currentMatches"
        );
        apiMatches = data.data || [];
      } catch (error) {
        console.log("API error, using fallback matches:", error.message);
      }

      try {
        const upcomingRes = await axios.get(`https://api.cricapi.com/v1/matches?apikey=${apiKeys[0]}`, {
          timeout: 5000
        });
        upcomingIPLMatches = (upcomingRes.data.data || []).filter(match =>
          match.status === "Not Started" &&
          (match.matchType === "IPL" || (match.name && match.name.includes("Indian Premier League")))
          .map((match, index) => ({
            id: match.id || `ipl${index + 1}`,
            teams: [match.teamInfo[0]?.name || "TBD", match.teamInfo[1]?.name || "TBD"],
            date: new Date(match.date).toISOString(),
            time: match.dateTimeGMT
              ? new Date(match.dateTimeGMT).toLocaleTimeString("en-IN", {
                  timeZone: "Asia/Kolkata",
                  hour: '2-digit',
                  minute: '2-digit'
                })
              : "TBD",
            venue: match.venue || "TBD",
            status: match.status,
            matchType: match.matchType || "IPL"
          }));
      } catch (error) {
        console.error("Error fetching upcoming matches:", error.message);
      }
    }

    // Filter IPL matches with null checks
    const iplMatchesFromApi = apiMatches.filter(match => 
      match && 
      (match.matchType === "IPL" || 
      match.matchType === "Indian Premier League" || 
      (match.name && match.name.includes("IPL")) ||
      (match.t1 && IPL_TEAMS.includes(match.t1)) || 
      (match.t2 && IPL_TEAMS.includes(match.t2)))
    );

    // Combine both with fallback if empty
    const allMatches = [...iplMatchesFromApi, ...upcomingIPLMatches];
    if (allMatches.length === 0) {
      allMatches.push({
        id: "fallback1",
        teams: ["Team A", "Team B"],
        date: new Date().toISOString(),
        time: "19:30",
        venue: "Wankhede Stadium",
        status: "Match starting soon",
        matchType: "IPL"
      });
    }

    allMatches.sort((a, b) => new Date(a.date) - new Date(b.date));

    res.json({
      status: "success",
      data: allMatches
    });
  } catch (error) {
    next(error);
  }
});

// [Include all your other API endpoints with similar error handling improvements]

// Enhanced error handling middleware
app.use((err, req, res, next) => {
  console.error(`[${new Date().toISOString()}] Error: ${err.message}`);
  console.error(err.stack);

  const statusCode = err.statusCode || 500;
  res.status(statusCode).json({
    status: "error",
    message: isProduction ? "An error occurred" : err.message,
    ...(!isProduction && { stack: err.stack })
  });
});

// 404 Handler
app.use((req, res) => {
  res.status(404).json({
    status: "error",
    message: "Endpoint not found"
  });
});

// Start server with better logging
const server = app.listen(PORT, () => {
  console.log(`🚀 Server running in ${process.env.NODE_ENV || 'development'} mode`);
  console.log(`🔗 http://localhost:${PORT}`);
  console.log(`Static files from: ${publicRoot}`);
  if (apiKeys.length > 0) {
    console.log(`Using ${apiKeys.length} API keys`);
  } else {
    console.warn('⚠️ No API keys configured - using fallback data');
  }
});

// Handle server shutdown gracefully
process.on('SIGTERM', () => {
  console.log('SIGTERM received. Shutting down gracefully');
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('SIGINT received. Shutting down gracefully');
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});

module.exports = app; // For testing
