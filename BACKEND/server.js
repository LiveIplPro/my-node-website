require('dotenv').config();
const express = require("express");
const cors = require("cors");
const fetch = require("node-fetch");
const NodeCache = require("node-cache");
const rateLimit = require("express-rate-limit");
const path = require("path");
const axios = require("axios");

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

// Rate Limiting
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 50, // Reduced from 100 to prevent abuse
  message: "Too many requests, please try again later."
});

// IPL Teams List
const IPL_TEAMS = [
  "Chennai Super Kings", "Delhi Capitals", "Gujarat Titans",
  "Kolkata Knight Riders", "Lucknow Super Giants", "Mumbai Indians",
  "Punjab Kings", "Rajasthan Royals", "Royal Challengers Bengaluru",
  "Sunrisers Hyderabad"
];

// API key rotation + caching
const matchCache = new NodeCache({ 
  stdTTL: 300,
  checkperiod: 60
});

const apiKeys = process.env.API_KEYS?.split(",").map(k => k.trim()).filter(Boolean) || [];
if (apiKeys.length === 0) {
  console.error("❌ No API keys found. Please add API_KEYS in your .env file.");
  process.exit(1);
}

let currentKeyIndex = 0;
let keyStatus = apiKeys.map(key => ({ key, available: true, lastUsed: null }));

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

// Current Matches API
app.get("/api/currentMatches", apiLimiter, async (req, res) => {
  try {
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

    // Filter IPL matches
    const iplMatchesFromApi = apiMatches.filter(match => 
      match.matchType === "IPL" || 
      match.matchType === "Indian Premier League" || 
      (match.name && match.name.includes("IPL")) ||
      (IPL_TEAMS.includes(match.t1) || IPL_TEAMS.includes(match.t2))
    );

    // Fetch upcoming matches
    let upcomingIPLMatches = [];
    try {
      const upcomingRes = await axios.get(`https://api.cricapi.com/v1/matches?apikey=${apiKeys[0]}`);
      upcomingIPLMatches = (upcomingRes.data.data || []).filter(match =>
        match.status === "Not Started" &&
        (match.matchType === "IPL" || match.name.includes("Indian Premier League"))
      ).map((match, index) => ({
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

    // Combine both
    const allMatches = [...iplMatchesFromApi, ...upcomingIPLMatches];
    allMatches.sort((a, b) => new Date(a.date) - new Date(b.date));

    res.json({
      status: "success",
      data: allMatches
    });
  } catch (error) {
    console.error("Error in /api/currentMatches:", error.message);
    res.status(500).json({
      status: "error",
      message: "Failed to fetch current matches."
    });
  }
});

// Live Scores API
app.get("/api/liveScores", apiLimiter, async (req, res) => {
  try {
    const data = await fetchWithRotation(
      (key) => `https://api.cricapi.com/v1/cricScore?apikey=${key}`,
      "liveScores"
    );

    if (!data || !data.data) {
      return res.json({ status: "success", data: [] });
    }

    // Filter IPL matches
    const iplMatches = data.data.filter(match => 
      IPL_TEAMS.includes(match.t1) || IPL_TEAMS.includes(match.t2)
    );

    // If no live matches, find most recent completed match
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

// Teams API
app.get('/api/teams', async (req, res) => {
  try {
    // Fallback data if API fails
    const fallbackTeams = IPL_TEAMS.map(team => ({
      name: team,
      captain: "TBD",
      wins: 0,
      losses: 0,
      homeGround: "TBD",
      founded: "2008",
      description: `${team} is a competitive IPL team.`
    }));

    try {
      const response = await axios.get(`https://api.cricapi.com/v1/teams?apikey=${apiKeys[0]}`);
      const apiTeams = response.data.data || [];
      
      // Merge API teams with our IPL teams list
      const teamsData = IPL_TEAMS.map(teamName => {
        const apiTeam = apiTeams.find(t => t.name.includes(teamName));
        return apiTeam ? {
          name: teamName,
          captain: apiTeam.captain || "TBD",
          wins: apiTeam.wins || 0,
          losses: apiTeam.losses || 0,
          homeGround: apiTeam.homeGround || "TBD",
          founded: apiTeam.founded || "2008",
          description: apiTeam.description || `${teamName} is a competitive IPL team.`
        } : fallbackTeams.find(t => t.name === teamName);
      });

      res.json(teamsData);
    } catch (error) {
      console.error("Error fetching teams, using fallback:", error.message);
      res.json(fallbackTeams);
    }
  } catch (error) {
    console.error("Error in /api/teams:", error.message);
    res.status(500).json({ error: "Failed to fetch team data." });
  }
});

// Players API
app.get('/api/playersList', async (req, res) => {
  try {
    // Fallback data
    const fallbackPlayers = [
      {
        id: "1",
        name: "Virat Kohli",
        team: "Royal Challengers Bengaluru",
        role: "Batsman",
        age: 34,
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
        bowlingAvg: 115.25,
        bestBowling: "1/7",
        image: "https://i.imgur.com/mVMNx6m.jpeg"
      }
    ];

    try {
      const response = await axios.get(`https://api.cricapi.com/v1/players?apikey=${apiKeys[0]}`);
      const players = response.data.data || [];

      // Filter top IPL players
      const iplPlayers = players
        .filter(player => player.name && (
          player.name.includes("Kohli") ||
          player.name.includes("Rohit") ||
          player.name.includes("Dhoni") ||
          player.name.includes("Pant") ||
          player.name.includes("Bumrah") ||
          player.name.includes("Jadeja")
        ))
        .slice(0, 10)
        .map(player => ({
          id: player.id,
          name: player.name,
          team: player.currentTeams?.join(", ") || "TBD",
          role: player.role || "Player",
          age: player.age || 25,
          country: player.country || "India",
          battingStyle: player.battingStyle || "Right-handed",
          bowlingStyle: player.bowlingStyle || "Does not bowl",
          matches: Math.floor(Math.random() * 200) + 50,
          runs: Math.floor(Math.random() * 5000) + 1000,
          battingAvg: (Math.random() * 40 + 20).toFixed(2),
          highestScore: Math.floor(Math.random() * 120) + 50,
          fifties: Math.floor(Math.random() * 30) + 10,
          centuries: Math.floor(Math.random() * 10) + 1,
          wickets: Math.floor(Math.random() * 100) + 10,
          bowlingAvg: (Math.random() * 30 + 20).toFixed(2),
          bestBowling: `${Math.floor(Math.random() * 5) + 1}/${Math.floor(Math.random() * 30) + 10}`,
          image: player.image || "https://i.imgur.com/mVMNx6m.jpeg"
        }));

      res.json(iplPlayers.length > 0 ? iplPlayers : fallbackPlayers);
    } catch (error) {
      console.error("Error fetching players, using fallback:", error.message);
      res.json(fallbackPlayers);
    }
  } catch (error) {
    console.error("Error in /api/playersList:", error.message);
    res.status(500).json({ error: "Failed to fetch player data." });
  }
});

// Points Table API
app.get("/api/pointsTable", async (req, res) => {
  try {
    // Fallback data
    const fallbackTable = IPL_TEAMS.map((team, index) => ({
      name: team,
      played: 14,
      won: Math.floor(Math.random() * 10) + 4,
      lost: Math.floor(Math.random() * 10) + 1,
      nrr: (Math.random() * 2 - 1).toFixed(2),
      points: Math.floor(Math.random() * 20) + 10
    })).sort((a, b) => b.points - a.points);

    try {
      const response = await axios.get(`https://api.cricapi.com/v1/pointsTable?apikey=${apiKeys[0]}`);
      const pointsTable = response.data.data || [];

      // Filter IPL points table
      const iplTable = pointsTable
        .filter(team => IPL_TEAMS.some(iplTeam => team.teamName.includes(iplTeam)))
        .map(team => ({
          name: team.teamName.replace("(IPL)", "").trim(),
          played: team.matchesPlayed || 0,
          won: team.matchesWon || 0,
          lost: team.matchesLost || 0,
          nrr: team.netRunRate || "0.00",
          points: team.points || 0
        }));

      res.json(iplTable.length > 0 ? iplTable : fallbackTable);
    } catch (error) {
      console.error("Error fetching points table, using fallback:", error.message);
      res.json(fallbackTable);
    }
  } catch (error) {
    console.error("Error in /api/pointsTable:", error.message);
    res.status(500).json({ message: "Failed to fetch points table data" });
  }
});

// Match Info API
app.get("/api/matchInfo/:matchId", apiLimiter, async (req, res) => {
  try {
    const { matchId } = req.params;
    
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
    
    // Fallback data
    res.json({
      status: "success",
      data: {
        id: matchId,
        teams: ["Team A", "Team B"],
        date: new Date().toISOString(),
        time: "19:30",
        venue: "Wankhede Stadium",
        status: "Upcoming",
        tossWinner: "Team A",
        tossDecision: "Batting",
        players: {
          "Team A": Array(11).fill().map((_, i) => `Player ${i+1}A`),
          "Team B": Array(11).fill().map((_, i) => `Player ${i+1}B`)
        }
      }
    });
  } catch (error) {
    console.error(`Error in /api/matchInfo/${req.params.matchId}:`, error.message);
    res.status(500).json({ status: "error", message: error.message });
  }
});

// Player Info API
app.get("/api/playerInfo/:playerId", apiLimiter, async (req, res) => {
  try {
    const { playerId } = req.params;
    
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
    
    // Fallback data
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

// Health Check
app.get("/health", (req, res) => {
  res.json({ 
    status: "ok", 
    timestamp: new Date().toISOString(),
    apiKeys: apiKeys.map(k => `****${k.slice(-4)}`),
    cacheStats: matchCache.getStats()
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`Static files being served from: ${publicRoot}`);
});
