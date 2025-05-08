require("dotenv").config();

const apiKeys = process.env.API_KEYS.split(",");
let currentKeyIndex = 0;

// Current key ko return karega
function getApiKey() {
  return apiKeys[currentKeyIndex];
}

// Jab bhi key expire ho jaye ya rate limit aaye, next key pe jump karega
function rotateKey() {
  currentKeyIndex = (currentKeyIndex + 1) % apiKeys.length;
  console.log(`🔁 Rotated to API key index: ${currentKeyIndex}`);
}

module.exports = {
  // API URLs as functions (har baar latest key milegi)
  currentMatches: () => `https://api.cricapi.com/v1/currentMatches?apikey=${getApiKey()}&offset=0`,
  cricScore: () => `https://api.cricapi.com/v1/cricScore?apikey=${getApiKey()}`,
  seriesList: () => `https://api.cricapi.com/v1/series?apikey=${getApiKey()}`,
  matchesList: () => `https://api.cricapi.com/v1/matches?apikey=${getApiKey()}`,
  matchInfo: (id) => `https://api.cricapi.com/v1/match_info?apikey=${getApiKey()}&id=${id}`,
  playersList: () => `https://api.cricapi.com/v1/players?apikey=${getApiKey()}`,
  playerInfo: (id) => `https://api.cricapi.com/v1/players_info?apikey=${getApiKey()}&id=${id}`,
  teams: () => `https://api.cricapi.com/v1/teams?apikey=${getApiKey()}`,
  rotateKey, // export kiya so that backend use kar sake
};
