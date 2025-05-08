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

// IPL Teams List
const IPL_TEAMS = [
  "Chennai Super Kings", "Delhi Capitals", "Gujarat Titans",
  "Kolkata Knight Riders", "Lucknow Super Giants", "Mumbai Indians",
  "Punjab Kings", "Rajasthan Royals", "Royal Challengers Bengaluru",
  "Sunrisers Hyderabad"
];

// Teams API
app.get('/api/teams', (req, res) => {
  const teamsData = [
    {
      name: "Chennai Super Kings",
      captain: "MS Dhoni",
      logo: "https://i.imgur.com/LsT0VWz.jpeg",
      trophies: 5,
      matches: 210,
      wins: 130,
      losses: 80,
      homeGround: "M. A. Chidambaram Stadium, Chennai",
      founded: "2008",
      description: "Chennai Super Kings is one of the most consistent and successful teams in IPL history."
    },
    {
      name: "Delhi Capitals",
      captain: "Axar Patel",
      logo: "https://i.imgur.com/B53ByLk.jpeg",
      trophies: 0,
      matches: 216,
      wins: 102,
      losses: 114,
      homeGround: "Arun Jaitley Stadium, Delhi",
      founded: "2008",
      description: "Delhi Capitals has transformed into a competitive unit with a young and fearless core."
    },
    {
      name: "Gujarat Titans",
      captain: "Shubman Gill",
      logo: "https://i.imgur.com/j2rnJko.jpeg",
      trophies: 1,
      matches: 32,
      wins: 22,
      losses: 10,
      homeGround: "Narendra Modi Stadium, Ahmedabad",
      founded: "2022",
      description: "Gujarat Titans made a dream debut in 2022 by winning the title and remain strong contenders."
    },
    {
      name: "Kolkata Knight Riders",
      captain: "Ajinkya Rahane",
      logo: "https://i.imgur.com/vh6Kf1N.jpeg",
      trophies: 2,
      matches: 224,
      wins: 115,
      losses: 109,
      homeGround: "Eden Gardens, Kolkata",
      founded: "2008",
      description: "KKR has a rich history with two titles and strong performances under pressure."
    },
    {
      name: "Lucknow Super Giants",
      captain: "Rishabh Pant",
      logo: "https://i.imgur.com/XZbFpTw.jpeg",
      trophies: 0,
      matches: 30,
      wins: 18,
      losses: 12,
      homeGround: "BRSABV Ekana Cricket Stadium, Lucknow",
      founded: "2022",
      description: "Lucknow Super Giants have impressed with their balanced squad and consistent playoff runs."
    },
    {
      name: "Mumbai Indians",
      captain: "Hardik Pandya",
      logo: "https://i.imgur.com/R1m23jr.jpeg",
      trophies: 5,
      matches: 231,
      wins: 129,
      losses: 98,
      homeGround: "Wankhede Stadium, Mumbai",
      founded: "2008",
      description: "Mumbai Indians has a legacy of dominance and is the most successful team in IPL history."
    },
    {
      name: "Punjab Kings",
      captain: "Shreyas Iyer",
      logo: "https://i.imgur.com/BwTipSE.jpeg",
      trophies: 0,
      matches: 218,
      wins: 98,
      losses: 120,
      homeGround: "IS Bindra Stadium, Mohali",
      founded: "2008",
      description: "Punjab Kings have a strong squad but are still chasing their first IPL title."
    },
    {
      name: "Rajasthan Royals",
      captain: "Sanju Samson",
      logo: "https://i.imgur.com/wiUl1x1.jpeg",
      trophies: 1,
      matches: 194,
      wins: 98,
      losses: 96,
      homeGround: "Sawai Mansingh Stadium, Jaipur",
      founded: "2008",
      description: "Winners of the inaugural IPL, RR is known for nurturing young talent and competitive spirit."
    },
    {
      name: "Royal Challengers Bengaluru",
      captain: "Rajat Patidar",
      logo: "https://i.imgur.com/e51T5so.jpeg",
      trophies: 0,
      matches: 227,
      wins: 107,
      losses: 120,
      homeGround: "M. Chinnaswamy Stadium, Bengaluru",
      founded: "2008",
      description: "RCB is known for its passionate fan base and high-profile players, always strong contenders."
    },
    {
      name: "Sunrisers Hyderabad",
      captain: "Pat Cummins",
      logo: "https://i.imgur.com/CyxeuGq.jpeg",
      trophies: 1,
      matches: 177,
      wins: 90,
      losses: 87,
      homeGround: "Rajiv Gandhi International Cricket Stadium, Hyderabad",
      founded: "2013",
      description: "Sunrisers Hyderabad won the IPL in 2016 and are known for their strong bowling attack."
    }
  ];

  res.json(teamsData);
});

// Players API
app.get('/api/playersList', (req, res) => {
  const playersData = [
    {
      id: "player1",
      name: "Virat Kohli",
      team: "Royal Challengers Bengaluru",
      role: "Batsman",
      age: 35,
      country: "India",
      battingStyle: "Right-handed",
      bowlingStyle: "Right-arm medium",
      matches: 237,
      runs: 7263,
      battingAvg: 37.25,
      highestScore: 113,
      fifties: 50,
      centuries: 7,
      wickets: 4,
      bowlingAvg: 130.25,
      bestBowling: "1/7",
      image: "https://i.imgur.com/xyz1234.jpeg"
    },
    {
      id: "player2",
      name: "Jasprit Bumrah",
      team: "Mumbai Indians",
      role: "Bowler",
      age: 30,
      country: "India",
      battingStyle: "Right-handed",
      bowlingStyle: "Right-arm fast",
      matches: 120,
      runs: 189,
      battingAvg: 7.56,
      highestScore: 23,
      fifties: 0,
      centuries: 0,
      wickets: 145,
      bowlingAvg: 23.31,
      bestBowling: "5/10",
      image: "https://i.imgur.com/abcd5678.jpeg"
    },
    // Add more players as needed
  ];

  res.json(playersData);
});

// Upcoming IPL matches data
const upcomingIPLMatches = [
  {
    id: "ipl1",
    teams: ["Chennai Super Kings", "Mumbai Indians"],
    date: new Date(Date.now() + 86400000 * 2).toISOString(), // 2 days from now
    time: "19:30",
    venue: "Wankhede Stadium, Mumbai",
    status: "Upcoming",
    matchType: "IPL"
  },
  {
    id: "ipl2",
    teams: ["Royal Challengers Bengaluru", "Kolkata Knight Riders"],
    date: new Date(Date.now() + 86400000 * 3).toISOString(), // 3 days from now
    time: "15:30",
    venue: "M. Chinnaswamy Stadium, Bengaluru",
    status: "Upcoming",
    matchType: "IPL"
  },
  {
    id: "ipl3",
    teams: ["Delhi Capitals", "Punjab Kings"],
    date: new Date(Date.now() + 86400000 * 4).toISOString(), // 4 days from now
    time: "19:30",
    venue: "Arun Jaitley Stadium, Delhi",
    status: "Upcoming",
    matchType: "IPL"
  },
  {
    id: "ipl4",
    teams: ["Gujarat Titans", "Sunrisers Hyderabad"],
    date: new Date(Date.now() + 86400000 * 5).toISOString(), // 5 days from now
    time: "15:30",
    venue: "Narendra Modi Stadium, Ahmedabad",
    status: "Upcoming",
    matchType: "IPL"
  },
  {
    id: "ipl5",
    teams: ["Rajasthan Royals", "Lucknow Super Giants"],
    date: new Date(Date.now() + 86400000 * 6).toISOString(), // 6 days from now
    time: "19:30",
    venue: "Sawai Mansingh Stadium, Jaipur",
    status: "Upcoming",
    matchType: "IPL"
  }
];

// Current Matches API - Modified to include upcoming IPL matches
app.get("/api/currentMatches", apiLimiter, async (req, res) => {
  try {
    // First try to get real matches from the API
    let apiMatches = [];
    try {
      const data = await fetchWithRotation(
        (key) => `https://api.cricapi.com/v1/currentMatches?apikey=${key}&offset=0`,
        "currentMatches"
      );
      apiMatches = data.data || [];
    } catch (error) {
      console.log("Using fallback matches due to API error:", error.message);
    }

    // Filter only IPL matches from API
    const iplMatchesFromApi = apiMatches.filter(match => 
      match.matchType === "ipl" || match.matchType === "IPL" || 
      (match.name && match.name.includes("IPL")) ||
      (IPL_TEAMS.includes(match.t1) || IPL_TEAMS.includes(match.t2))
    );

    // Combine with our upcoming IPL matches
    const allMatches = [...iplMatchesFromApi, ...upcomingIPLMatches];

    // Sort by date (soonest first)
    allMatches.sort((a, b) => new Date(a.date) - new Date(b.date));

    res.json({
      status: "success",
      data: allMatches
    });
  } catch (error) {
    console.error("Error in /api/currentMatches:", error.message);
    // Fallback to just our upcoming IPL matches if API fails completely
    res.json({
      status: "success",
      data: upcomingIPLMatches
    });
  }
});

// API key rotation + caching
const matchCache = new NodeCache({ 
  stdTTL: 300, // 5 minutes cache
  checkperiod: 60 // check every minute for expired items
});
const apiKeys = process.env.API_KEYS?.split(",").map(k => k.trim()).filter(Boolean) || [];

if (apiKeys.length === 0) {
  console.error("❌ No API keys found. Please add API_KEYS in your .env file.");
  process.exit(1);
}

let currentKeyIndex = 0;
let keyStatus = apiKeys.map(key => ({ key, available: true, lastUsed: null }));

console.log("✅ Loaded API Keys:", apiKeys.map(k => `****${k.slice(-4)}`).join(", "));

async function fetchWithRotation(urlGenerator, cacheTag) {
  let attempts = 0;
  const maxAttempts = apiKeys.length * 2;

  while (attempts < maxAttempts) {
    const { key: apiKey } = keyStatus[currentKeyIndex];
    const url = urlGenerator(apiKey);
    const cacheKey = `${cacheTag}_${apiKey}`;
    const cached = matchCache.get(cacheKey);

    if (cached) {
      console.log(`📦 Using cached data for ${cacheTag}`);
      return cached;
    }

    try {
      console.log(`🔑 Trying API key: ****${apiKey.slice(-4)}`);
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

// Updated Live Scores API - Only shows IPL matches and recent completed matches
app.get("/api/liveScores", apiLimiter, async (req, res) => {
  try {
    const data = await fetchWithRotation(
      (key) => `https://api.cricapi.com/v1/cricScore?apikey=${key}`,
      "liveScores"
    );

    if (!data || !data.data) {
      return res.json({ status: "success", data: [] });
    }

    // Filter matches to include only IPL team matches
    const iplMatches = data.data.filter(match => {
      return IPL_TEAMS.includes(match.t1) || IPL_TEAMS.includes(match.t2);
    });

    // If no live matches, find the most recent completed match
    if (iplMatches.length === 0) {
      const completedMatches = data.data
        .filter(match => match.status === "Completed" && 
               (IPL_TEAMS.includes(match.t1) || IPL_TEAMS.includes(match.t2)))
        .sort((a, b) => new Date(b.dateTimeGMT) - new Date(a.dateTimeGMT));

      if (completedMatches.length > 0) {
        return res.json({ 
          status: "success", 
          data: [completedMatches[0]] 
        });
      }
    }

    res.json({ status: "success", data: iplMatches });
  } catch (error) {
    console.error("Error in /api/liveScores:", error.message);
    res.status(500).json({ status: "error", message: error.message });
  }
});

// Match Info API
app.get("/api/matchInfo/:matchId", apiLimiter, async (req, res) => {
  try {
    const { matchId } = req.params;
    
    // First try to get from external API
    try {
      const data = await fetchWithRotation(
        (key) => `https://api.cricapi.com/v1/match_info?apikey=${key}&id=${matchId}`,
        `matchInfo_${matchId}`
      );
      
      if (data && data.data) {
        return res.json(data);
      }
    } catch (error) {
      console.log("Falling back to local match data:", error.message);
    }
    
    // Fallback to our local data if API fails
    const match = upcomingIPLMatches.find(m => m.id === matchId);
    if (match) {
      return res.json({
        status: "success",
        data: {
          ...match,
          tossWinner: match.teams[Math.floor(Math.random() * 2)],
          tossDecision: Math.random() > 0.5 ? "Batting" : "Fielding",
          result: "Match yet to begin",
          playerOfMatch: null,
          teams: match.teams.map(team => ({
            name: team,
            players: Array(11).fill().map((_, i) => `Player ${i+1}`)
          }))
        }
      });
    }
    
    res.status(404).json({ status: "error", message: "Match not found" });
  } catch (error) {
    console.error(`Error in /api/matchInfo/${req.params.matchId}:`, error.message);
    res.status(500).json({ status: "error", message: error.message });
  }
});

// Player Info API
app.get("/api/playerInfo/:playerId", apiLimiter, async (req, res) => {
  try {
    const { playerId } = req.params;
    
    // First try to get from external API
    try {
      const data = await fetchWithRotation(
        (key) => `https://api.cricapi.com/v1/players_info?apikey=${key}&id=${playerId}`,
        `playerInfo_${playerId}`
      );
      
      if (data && data.data) {
        return res.json(data);
      }
    } catch (error) {
      console.log("Falling back to local player data:", error.message);
    }
    
    // Fallback to our local data if API fails
    res.json({
      status: "success",
      data: {
        id: playerId,
        name: "Sample Player",
        team: "Sample Team",
        role: "Batsman",
        age: 28,
        country: "India",
        battingStyle: "Right-handed",
        bowlingStyle: "Right-arm medium",
        matches: 100,
        runs: 2500,
        battingAvg: 35.71,
        highestScore: 120,
        fifties: 15,
        centuries: 2,
        wickets: 5,
        bowlingAvg: 45.00,
        bestBowling: "1/15",
        image: "https://i.imgur.com/mVMNx6m.jpeg"
      }
    });
  } catch (error) {
    console.error(`Error in /api/playerInfo/${req.params.playerId}:`, error.message);
    res.status(500).json({ status: "error", message: error.message });
  }
});

// Points Table API
app.get("/api/pointsTable", (req, res) => {
  const pointsTable = [
    {
      name: "Gujarat Titans",
      played: 14,
      won: 10,
      lost: 4,
      nrr: "+0.809",
      points: 20
    },
    {
      name: "Chennai Super Kings",
      played: 14,
      won: 9,
      lost: 5,
      nrr: "+0.652",
      points: 18
    },
    {
      name: "Mumbai Indians",
      played: 14,
      won: 9,
      lost: 5,
      nrr: "+0.501",
      points: 18
    },
    {
      name: "Royal Challengers Bengaluru",
      played: 14,
      won: 8,
      lost: 6,
      nrr: "+0.180",
      points: 16
    },
    {
      name: "Lucknow Super Giants",
      played: 14,
      won: 8,
      lost: 6,
      nrr: "+0.123",
      points: 16
    },
    {
      name: "Rajasthan Royals",
      played: 14,
      won: 7,
      lost: 7,
      nrr: "+0.148",
      points: 14
    },
    {
      name: "Kolkata Knight Riders",
      played: 14,
      won: 6,
      lost: 8,
      nrr: "-0.239",
      points: 12
    },
    {
      name: "Punjab Kings",
      played: 14,
      won: 6,
      lost: 8,
      nrr: "-0.304",
      points: 12
    },
    {
      name: "Delhi Capitals",
      played: 14,
      won: 5,
      lost: 9,
      nrr: "-0.808",
      points: 10
    },
    {
      name: "Sunrisers Hyderabad",
      played: 14,
      won: 4,
      lost: 10,
      nrr: "-0.590",
      points: 8
    }
  ];

  res.json(pointsTable);
});

// Health Check
app.get("/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
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
