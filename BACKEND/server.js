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
  const teamsData =[
  {
    "name": "Chennai Super Kings",
    "captain": "Ruturaj Gaikwad",
    "logo": "https://i.imgur.com/LsT0VWz.jpeg",
    "trophies": 5,
    "matches": 210,
    "wins": 130,
    "losses": 80,
    "description": "Chennai Super Kings is one of the most consistent and successful teams in IPL history."
  },
  {
    "name": "Mumbai Indians",
    "captain": "Hardik Pandya",
    "logo": "https://i.imgur.com/R1m23jr.jpeg",
    "trophies": 5,
    "matches": 231,
    "wins": 129,
    "losses": 98,
    "description": "Mumbai Indians has a legacy of dominance and is the most successful team in IPL history."
  },
  {
    "name": "Royal Challengers Bangalore",
    "captain": "Faf du Plessis",
    "logo": "https://i.imgur.com/1nlzE1Z.jpeg",
    "trophies": 0,
    "matches": 227,
    "wins": 107,
    "losses": 120,
    "description": "RCB is known for its passionate fan base and high-profile players, always strong contenders."
  },
  {
    "name": "Kolkata Knight Riders",
    "captain": "Shreyas Iyer",
    "logo": "https://i.imgur.com/V1FJkB1.jpeg",
    "trophies": 2,
    "matches": 224,
    "wins": 115,
    "losses": 109,
    "description": "KKR has a rich history with two titles and strong performances under pressure."
  },
  {
    "name": "Rajasthan Royals",
    "captain": "Sanju Samson",
    "logo": "https://i.imgur.com/RJv7z0O.jpeg",
    "trophies": 1,
    "matches": 194,
    "wins": 98,
    "losses": 96,
    "description": "Winners of the inaugural IPL, RR is known for nurturing young talent and competitive spirit."
  },
  {
    "name": "Delhi Capitals",
    "captain": "Rishabh Pant",
    "logo": "https://i.imgur.com/yQgM2Pt.jpeg",
    "trophies": 0,
    "matches": 216,
    "wins": 102,
    "losses": 114,
    "description": "Delhi Capitals has transformed into a competitive unit with a young and fearless core."
  },
  {
    "name": "Sunrisers Hyderabad",
    "captain": "Pat Cummins",
    "logo": "https://i.imgur.com/UCtEVkS.jpeg",
    "trophies": 1,
    "matches": 177,
    "wins": 90,
    "losses": 87,
    "description": "Sunrisers Hyderabad won the IPL in 2016 and are known for their strong bowling attack."
  },
  {
    "name": "Punjab Kings",
    "captain": "Shikhar Dhawan",
    "logo": "https://i.imgur.com/G9daVlQ.jpeg",
    "trophies": 0,
    "matches": 218,
    "wins": 98,
    "losses": 120,
    "description": "Punjab Kings have a strong squad but are still chasing their first IPL title."
  },
  {
    "name": "Gujarat Titans",
    "captain": "Shubman Gill",
    "logo": "https://i.imgur.com/BpqFi7Y.jpeg",
    "trophies": 1,
    "matches": 32,
    "wins": 22,
    "losses": 10,
    "description": "Gujarat Titans made a dream debut in 2022 by winning the title and remain strong contenders."
  },
  {
    "name": "Lucknow Super Giants",
    "captain": "KL Rahul",
    "logo": "https://i.imgur.com/OwSCsrg.jpeg",
    "trophies": 0,
    "matches": 30,
    "wins": 18,
    "losses": 12,
    "description": "Lucknow Super Giants have impressed with their balanced squad and consistent playoff runs."
  }
]

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

