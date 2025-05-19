require('dotenv').config();
const express = require('express');
const axios = require('axios');
const cors = require('cors');
const path = require('path');
const { currentMatches, cricScore, matchesList, teams, rotateKey } = require('./cricapiConfig');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Rate Limiter
const rateLimit = require('express-rate-limit');
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later'
});
app.use(limiter);

// Enhanced Error Handling Middleware
app.use((err, req, res, next) => {
  console.error('Server Error:', err);
  res.status(500).json({ 
    success: false,
    message: 'Internal server error',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// API Response Helper
const handleApiResponse = (res, data, cacheControl = 'no-cache') => {
  if (!data) {
    return res.status(404).json({ 
      success: false,
      message: 'No data found'
    });
  }
  
  res.set('Cache-Control', cacheControl);
  res.json({ 
    success: true,
    data 
  });
};

// API Request Helper with Retry Logic
const fetchApiData = async (url) => {
  try {
    const response = await axios.get(url, { timeout: 5000 });
    return response.data;
  } catch (error) {
    if (error.response && error.response.status === 429) {
      console.log('Rate limit reached, rotating API key...');
      rotateKey();
      throw new Error('Rate limit exceeded');
    }
    
    if (error.code === 'ECONNABORTED') {
      throw new Error('Request timeout');
    }
    
    if (error.response) {
      throw new Error(`API error: ${error.response.status} ${error.response.statusText}`);
    } else {
      throw new Error('Network error');
    }
  }
};

// API Endpoints

/**
 * @route GET /api/live-matches
 * @desc Get current live matches
 * @access Public
 */
app.get('/api/live-matches', async (req, res) => {
  try {
    const data = await fetchApiData(currentMatches());
    if (!data.data) throw new Error('No match data available');
    handleApiResponse(res, data.data);
  } catch (error) {
    console.error('Live matches error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch live matches',
      error: error.message
    });
  }
});

/**
 * @route GET /api/live-scores
 * @desc Get live cricket scores
 * @access Public
 */
app.get('/api/live-scores', async (req, res) => {
  try {
    const data = await fetchApiData(cricScore());
    if (!data.data) throw new Error('No score data available');
    handleApiResponse(res, data.data);
  } catch (error) {
    console.error('Live scores error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch live scores',
      error: error.message
    });
  }
});

/**
 * @route GET /api/schedule
 * @desc Get cricket match schedule
 * @access Public
 */
app.get('/api/schedule', async (req, res) => {
  try {
    const data = await fetchApiData(matchesList());
    if (!data.data) throw new Error('No schedule data available');
    handleApiResponse(res, data.data, 'public, max-age=3600');
  } catch (error) {
    console.error('Schedule error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch schedule',
      error: error.message
    });
  }
});

/**
 * @route GET /api/teams
 * @desc Get cricket teams information
 * @access Public
 */
app.get('/api/teams', async (req, res) => {
  try {
    const data = await fetchApiData(teams());
    if (!data.data) throw new Error('No team data available');
    handleApiResponse(res, data.data, 'public, max-age=86400');
  } catch (error) {
    console.error('Teams error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch teams',
      error: error.message
    });
  }
});

/**
 * @route GET /api/match/:id
 * @desc Get specific match details
 * @access Public
 */
app.get('/api/match/:id', async (req, res) => {
  try {
    const { id } = req.params;
    if (!id) throw new Error('Match ID is required');
    
    const data = await fetchApiData(`https://api.cricapi.com/v1/match_info?apikey=${getApiKey()}&id=${id}`);
    if (!data.data) throw new Error('No match details available');
    handleApiResponse(res, data.data);
  } catch (error) {
    console.error('Match details error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch match details',
      error: error.message
    });
  }
});

// Serve frontend
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Start Server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`API Keys available: ${process.env.API_KEYS.split(',').length}`);
});

// Handle unhandled rejections
process.on('unhandledRejection', (err) => {
  console.error('Unhandled Rejection:', err);
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
});
