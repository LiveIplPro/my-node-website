// DOM Elements
const mobileMenuBtn = document.querySelector('.mobile-menu');
const navLinks = document.querySelector('.nav-links');
const themeToggle = document.querySelector('.theme-toggle');
const nextMatchContainer = document.getElementById('nextMatchContainer');
const liveSchedule = document.getElementById('liveSchedule');
const teamsGrid = document.getElementById('teamsGrid');
const pointsTableContainer = document.getElementById('pointsTableContainer');
const modal = document.getElementById('teamModal');
const modalContent = document.querySelector('.modal-content') || modal;
const streamBtn = document.getElementById('streamBtn');
const scheduleBtn = document.getElementById('scheduleBtn');
const loader = document.getElementById('loader');
const liveMatchesLastUpdated = document.getElementById('liveMatchesLastUpdated');
const teamsLastUpdated = document.getElementById('teamsLastUpdated');
const externalLiveScore = document.getElementById('externalLiveScore');
const refreshBtn = document.querySelector('.refresh-btn');

// API Configuration
const API_BASE_URL = 'https://my-node-website.onrender.com';
const ENDPOINTS = {
  LIVE_MATCHES: `${API_BASE_URL}/api/currentMatches`,
  TEAMS: `${API_BASE_URL}/api/teams`,
  NEXT_MATCH: `${API_BASE_URL}/api/nextMatch`,
  POINTS_TABLE: `${API_BASE_URL}/api/pointsTable`
};

// Team logos mapping
const TEAM_LOGOS = {
  "Chennai Super Kings": "https://i.imgur.com/LsT0VWz.jpeg",
  "Delhi Capitals": "https://i.imgur.com/B53ByLk.jpeg",
  "Gujarat Titans": "https://i.imgur.com/j2rnJko.jpeg",
  "Kolkata Knight Riders": "https://i.imgur.com/vh6Kf1N.jpeg",
  "Lucknow Super Giants": "https://i.imgur.com/XZbFpTw.jpeg",
  "Mumbai Indians": "https://i.imgur.com/R1m23jr.jpeg",
  "Punjab Kings": "https://i.imgur.com/BwTipSE.jpeg",
  "Rajasthan Royals": "https://i.imgur.com/wiUl1x1.jpeg",
  "Royal Challengers Bengaluru": "https://i.imgur.com/e51T5so.jpeg",
  "Sunrisers Hyderabad": "https://i.imgur.com/CyxeuGq.jpeg"
};

// Show loader
function showLoader() {
  loader.style.display = 'flex';
}

// Hide loader
function hideLoader() {
  loader.style.display = 'none';
}

// Update last updated time
function updateLastUpdated(element) {
  const now = new Date();
  element.textContent = `Last updated: ${now.toLocaleTimeString()}`;
}

// Font Awesome Load Check
function checkFontAwesomeLoaded() {
  if (!document.fonts || !document.fonts.check('1em "Font Awesome 6 Free"')) {
    console.log('Font Awesome not loaded, applying fallback');
    const fallbackLink = document.createElement('link');
    fallbackLink.href = 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css';
    fallbackLink.rel = 'stylesheet';
    fallbackLink.integrity = 'sha512-Avb2QiuDEEvB4bZJYdft2mNjVShBftLdPG8FJ0V7irTLQ8Uo0qcPxh4Plq7G5tGm0rU+1SPhVotteLpBERwTkw==';
    fallbackLink.crossOrigin = 'anonymous';
    fallbackLink.referrerPolicy = 'no-referrer';
    document.head.appendChild(fallbackLink);
  }
}

// Mobile Menu Toggle
function toggleMobileMenu() {
  navLinks.classList.toggle('active');
  document.body.classList.toggle('no-scroll');
}

// Theme Toggle
function toggleTheme() {
  const savedTheme = localStorage.getItem('theme') || 'light';
  const newTheme = document.body.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
  document.body.setAttribute('data-theme', newTheme);
  const icon = themeToggle.querySelector('i');
  icon.classList.toggle('fa-moon', savedTheme === 'light');
  icon.classList.toggle('fa-sun', savedTheme === 'dark');
  localStorage.setItem('theme', newTheme);
}

// Button event handlers
function handleStreamButtonClick() {
  window.location.href = '/live/index.html';
}

function handleScheduleButtonClick() {
  window.location.href = '/schedule/index.html';
}

// Fetch data from API with error handling
async function fetchData(url) {
  try {
    showLoader();
    
    if (url === ENDPOINTS.LIVE_MATCHES && liveSchedule) {
      liveSchedule.innerHTML = '<div class="loading-spinner"><i class="fas fa-spinner fa-spin"></i> Loading live matches...</div>';
    }
    if (url === ENDPOINTS.TEAMS && teamsGrid) {
      teamsGrid.innerHTML = '<div class="loading-spinner"><i class="fas fa-spinner fa-spin"></i> Loading teams...</div>';
    }
    if (url === ENDPOINTS.NEXT_MATCH && nextMatchContainer) {
      nextMatchContainer.innerHTML = '<div class="loading-spinner"><i class="fas fa-spinner fa-spin"></i> Loading next match...</div>';
    }
    if (url === ENDPOINTS.POINTS_TABLE && pointsTableContainer) {
      pointsTableContainer.innerHTML = '<div class="loading-spinner"><i class="fas fa-spinner fa-spin"></i> Loading points table...</div>';
    }

    const response = await fetch(url);
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    const data = await response.json();
    
    return data;
  } catch (error) {
    console.error('Error fetching data:', error);
    showError(url);
    return null;
  } finally {
    hideLoader();
  }
}

// Show error message
function showError(url) {
  if (url === ENDPOINTS.LIVE_MATCHES && liveSchedule) {
    liveSchedule.innerHTML = '<p class="error-message"><i class="fas fa-exclamation-triangle"></i> Failed to load live matches. Please try again later.</p>';
  }
  if (url === ENDPOINTS.TEAMS && teamsGrid) {
    teamsGrid.innerHTML = '<p class="error-message"><i class="fas fa-exclamation-triangle"></i> Failed to load teams. Please try again later.</p>';
  }
  if (url === ENDPOINTS.NEXT_MATCH && nextMatchContainer) {
    nextMatchContainer.innerHTML = '<p class="error-message"><i class="fas fa-exclamation-triangle"></i> Failed to load next match. Please try again later.</p>';
  }
  if (url === ENDPOINTS.POINTS_TABLE && pointsTableContainer) {
    pointsTableContainer.innerHTML = '<p class="error-message"><i class="fas fa-exclamation-triangle"></i> Failed to load points table. Please try again later.</p>';
  }
}

// Show no match message
function showNoMatchMessage() {
  if (nextMatchContainer) {
    nextMatchContainer.innerHTML = '<p><i class="far fa-calendar-times"></i> No upcoming matches scheduled yet.</p>';
  }
}

// Display next match
function displayNextMatch(matchData) {
  if (!nextMatchContainer) return;
  nextMatchContainer.innerHTML = `
    <div class="next-match-card glass">
      <h3><i class="fas fa-arrow-right"></i> Next Match</h3>
      <div class="match-teams">
        <div class="team"><img src="${TEAM_LOGOS[matchData.teams[0]] || ''}" alt="${matchData.teams[0]}" class="team-logo"><span>${matchData.teams[0]}</span></div>
        <div class="match-vs"><i class="fas fa-vs"></i></div>
        <div class="team"><img src="${TEAM_LOGOS[matchData.teams[1]] || ''}" alt="${matchData.teams[1]}" class="team-logo"><span>${matchData.teams[1]}</span></div>
      </div>
      <div class="match-details">
        <p><i class="fas fa-calendar-alt"></i> ${new Date(matchData.date).toLocaleDateString()}</p>
        <p><i class="fas fa-clock"></i> ${matchData.time || 'Time TBD'}</p>
        <p><i class="fas fa-map-marker-alt"></i> ${matchData.venue}</p>
      </div>
    </div>
  `;
}

// Fetch & display next match
async function fetchNextMatch() {
  const data = await fetchData(ENDPOINTS.NEXT_MATCH);
  if (!data?.data?.length) {
    showNoMatchMessage();
    return;
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const upcomingMatches = data.data.filter(match => {
    const matchDate = new Date(match.date);
    matchDate.setHours(0, 0, 0, 0);
    return matchDate >= today && !['Completed', 'Finished'].includes(match.status);
  });

  if (upcomingMatches.length > 0) {
    upcomingMatches.sort((a, b) => new Date(a.date) - new Date(b.date));
    displayNextMatch(upcomingMatches[0]);
  } else {
    showNoMatchMessage();
  }
}

// Fetch & render live matches
async function fetchAndRenderLiveMatches() {
  const data = await fetchData(ENDPOINTS.LIVE_MATCHES);
  if (!data?.data?.length) {
    liveSchedule.innerHTML = '<p><i class="far fa-calendar-times"></i> No live or upcoming matches currently.</p>';
    return;
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const filtered = data.data.filter(match => {
    const matchDate = new Date(match.date);
    matchDate.setHours(0, 0, 0, 0);
    return matchDate >= today && !['Completed', 'Finished'].includes(match.status);
  });

  if (filtered.length === 0) {
    liveSchedule.innerHTML = '<p><i class="far fa-calendar-times"></i> No live or upcoming matches currently.</p>';
    return;
  }

  liveSchedule.innerHTML = filtered.map(match => `
    <div class="match-card glass">
      <div class="match-teams">
        <div class="team"><span>${match.teams[0]}</span></div>
        <div class="match-vs"><i class="fas fa-vs"></i></div>
        <div class="team"><span>${match.teams[1]}</span></div>
      </div>
      <div class="match-info">
        <p><i class="fas fa-calendar-alt"></i> ${new Date(match.date).toLocaleDateString()}</p>
        <p><i class="fas fa-clock"></i> ${match.time || 'TBD'}</p>
        <p><i class="fas fa-map-marker-alt"></i> ${match.venue}</p>
      </div>
      <div class="match-status" style="background: ${match.status === 'Live' ? '#ff4757' : '#2ed573'}">
        <i class="fas fa-${match.status === 'Live' ? 'play-circle' : 'clock'}"></i> ${match.status}
      </div>
    </div>
  `).join('');

  updateLastUpdated(liveMatchesLastUpdated);
}

// Fetch & render teams
async function fetchAndRenderTeams() {
  const data = await fetchData(ENDPOINTS.TEAMS);
  const teams = data?.teams || data; // support both { teams: [] } or direct []
  if (!Array.isArray(teams) || teams.length === 0) {
    teamsGrid.innerHTML = '<p><i class="fas fa-exclamation-triangle"></i> No team data available.</p>';
    return;
  }

  teamsGrid.innerHTML = teams.map(team => `
    <div class="team-profile glass" data-team="${team.name}">
      <div class="team-profile-inner">
        <img src="${TEAM_LOGOS[team.name] || team.logo}" alt="${team.name}" class="team-profile-logo">
        <div class="team-profile-content">
          <h3 class="team-profile-name">${team.name}</h3>
          <p class="team-profile-captain"><i class="fas fa-user-tie"></i> Captain: ${team.captain}</p>
        </div>
      </div>
    </div>
  `).join('');

  document.querySelectorAll('.team-profile').forEach(teamCard => {
    const teamName = teamCard.getAttribute('data-team');
    const team = teams.find(t => t.name === teamName);
    teamCard.addEventListener('click', () => showTeamDetails(team));
  });

  updateLastUpdated(teamsLastUpdated);
}

// Show team modal
function showTeamDetails(team) {
  if (!team || !modalContent) return;
  modalContent.innerHTML = `
    <div class="modal-header">
      <span class="close-modal"><i class="fas fa-times"></i></span>
      <img src="${TEAM_LOGOS[team.name] || team.logo}" alt="${team.name}" class="modal-team-logo">
      <h2>${team.name}</h2>
      <p class="modal-subtitle"><i class="fas fa-user-tie"></i> Captain: ${team.captain}</p>
    </div>
    <div class="modal-body">
      <div class="stat-row"><div class="stat-label"><i class="fas fa-trophy"></i><span>Trophies</span></div><div class="stat-value">${team.trophies || 0}</div></div>
      <div class="stat-row"><div class="stat-label"><i class="fas fa-flag"></i><span>Total Matches</span></div><div class="stat-value">${team.matches || 'N/A'}</div></div>
      <div class="stat-row"><div class="stat-label"><i class="fas fa-check-circle"></i><span>Wins</span></div><div class="stat-value">${team.wins || 'N/A'}</div></div>
      <div class="stat-row"><div class="stat-label"><i class="fas fa-times-circle"></i><span>Losses</span></div><div class="stat-value">${team.losses || 'N/A'}</div></div>
      <div class="team-description"><h3><i class="fas fa-info-circle"></i> About ${team.name}</h3><p>${team.description || 'No description available.'}</p></div>
    </div>
  `;
  modalContent.querySelector('.close-modal').addEventListener('click', closeModal);
  openModal();
}

// Modal Functions
function openModal() {
  modal.style.display = 'block';
  document.body.classList.add('no-scroll');
}
function closeModal() {
  modal.style.display = 'none';
  document.body.classList.remove('no-scroll');
}
if (modal) {
  modal.addEventListener('click', e => {
    if (e.target === modal) closeModal();
  });
}
document.addEventListener('keydown', e => {
  if (e.key === 'Escape' && modal.style.display === 'block') {
    closeModal();
  }
});

// Fetch & render points table
async function fetchAndRenderPointsTable() {
  const data = await fetchData(ENDPOINTS.POINTS_TABLE);
  const points = data?.pointsTable || data;

  if (!Array.isArray(points) || points.length === 0) {
    pointsTableContainer.innerHTML = '<p><i class="fas fa-exclamation-triangle"></i> No points table data available.</p>';
    return;
  }

  pointsTableContainer.innerHTML = `
    <div class="points-table glass">
      <table>
        <thead>
          <tr>
            <th><i class="fas fa-trophy"></i> Pos</th>
            <th><i class="fas fa-users"></i> Team</th>
            <th><i class="fas fa-gamepad"></i> Played</th>
            <th><i class="fas fa-check-circle"></i> Won</th>
            <th><i class="fas fa-times-circle"></i> Lost</th>
            <th><i class="fas fa-star"></i> Points</th>
            <th><i class="fas fa-chart-line"></i> NRR</th>
          </tr>
        </thead>
        <tbody>
          ${points.map((team, index) => `
            <tr>
              <td>${index + 1}</td>
              <td><img src="${TEAM_LOGOS[team.name] || team.logo}" alt="${team.name}" class="team-logo-small"> ${team.name}</td>
              <td>${team.played}</td>
              <td>${team.won}</td>
              <td>${team.lost}</td>
              <td>${team.points}</td>
              <td>${team.nrr}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    </div>
  `;
}

// Fetch external live score
async function fetchExternalLiveScore() {
  try {
    showLoader();
    const response = await fetch('https://api.cricapi.com/v1/cricScore?apikey=68adc291-7369-43b4-b3a3-b2b4b0b946b6');
    const data = await response.json();
    
    if (data && data.data && data.data.length > 0) {
      const liveMatch = data.data.find(match => match.status === 'Live') || data.data[0];
      
      const team1 = liveMatch.t1 || 'Team 1';
      const team2 = liveMatch.t2 || 'Team 2';
      const score1 = liveMatch.t1s || '0/0';
      const score2 = liveMatch.t2s || '0/0';
      const status = liveMatch.status || 'Match about to start';
      
      externalLiveScore.innerHTML = `
        <div class="live-score-header">
          <i class="fas fa-star pulsate"></i>
          <h3>Live Match Updates</h3>
          <i class="fas fa-star pulsate"></i>
        </div>
        <div class="live-score-content">
          <div class="live-score-teams">
            <div class="live-score-team">
              <div class="team-logo-placeholder">
                <img src="${TEAM_LOGOS[team1] || 'https://i.imgur.com/mVMNx6m.jpeg'}" alt="${team1}">
              </div>
              <span class="team-name">${team1}</span>
            </div>
            <div class="live-score-vs">VS</div>
            <div class="live-score-team">
              <div class="team-logo-placeholder">
                <img src="${TEAM_LOGOS[team2] || 'https://i.imgur.com/mVMNx6m.jpeg'}" alt="${team2}">
              </div>
              <span class="team-name">${team2}</span>
            </div>
          </div>
          <div class="live-score-details">
            <div class="score-line">
              <i class="fas fa-running"></i>
              <span class="score-text">${team1}: ${score1} | ${team2}: ${score2}</span>
            </div>
            <div class="match-status">
              <span class="status-badge ${liveMatch.status === 'Live' ? 'live' : 'upcoming'}">
                ${liveMatch.status === 'Live' ? 'LIVE' : 'UPCOMING'}
              </span>
              <span class="match-time"><i class="fas fa-clock"></i> ${status}</span>
            </div>
          </div>
        </div>
        <div class="live-score-footer">
          <button class="refresh-btn">
            <i class="fas fa-sync-alt"></i> Refresh
          </button>
        </div>
      `;
      
      // Add event listener to the new refresh button
      document.querySelector('.refresh-btn').addEventListener('click', fetchExternalLiveScore);
    } else {
      externalLiveScore.innerHTML = `
        <div class="error-message">
          <i class="fas fa-exclamation-triangle"></i> No live matches available at the moment.
        </div>
      `;
    }
  } catch (error) {
    console.error('Error fetching live score:', error);
    externalLiveScore.innerHTML = `
      <div class="error-message">
        <i class="fas fa-exclamation-triangle"></i> Failed to load live score. Please try again later.
      </div>
    `;
  } finally {
    hideLoader();
  }
}

// Initialize footer animations and interactions
function initFooter() {
  // Update copyright year
  document.getElementById('current-year').textContent = new Date().getFullYear();
  
  // Add animation classes
  const footerSections = document.querySelectorAll('.footer-brand, .footer-section');
  footerSections.forEach((section, index) => {
    section.classList.add('animate-footer', `delay-${index}`);
  });
  
  // Interactive checkboxes
  const checkboxes = document.querySelectorAll('.checkbox');
  checkboxes.forEach(box => {
    box.addEventListener('click', () => {
      box.textContent = box.textContent === '[ ]' ? '[x]' : '[ ]';
    });
  });
  
  // Smooth scroll to top
  const topLink = document.querySelector('.top-link');
  if (topLink) {
    topLink.addEventListener('click', (e) => {
      e.preventDefault();
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    });
  }
  
  // Add hover effect to logo
  const logo = document.querySelector('.logo-circle');
  if (logo) {
    logo.addEventListener('mouseenter', () => {
      logo.style.boxShadow = '0 5px 15px rgba(0,0,0,0.2)';
    });
    logo.addEventListener('mouseleave', () => {
      logo.style.boxShadow = 'none';
    });
  }
  
  // Parallax effect for background
  window.addEventListener('scroll', () => {
    const footer = document.querySelector('.minimal-footer');
    const scrollPosition = window.pageYOffset;
    footer.style.backgroundPositionY = scrollPosition * 0.5 + 'px';
  });
}

// Init App
async function init() {
  // Check Font Awesome first
  checkFontAwesomeLoaded();

  const savedTheme = localStorage.getItem('theme') || 'light';
  document.body.setAttribute('data-theme', savedTheme);

  if (themeToggle) {
    const icon = themeToggle.querySelector('i');
    icon.classList.toggle('fa-moon', savedTheme === 'light');
    icon.classList.toggle('fa-sun', savedTheme === 'dark');
  }
  
  if (mobileMenuBtn) mobileMenuBtn.addEventListener('click', toggleMobileMenu);
  if (themeToggle) themeToggle.addEventListener('click', toggleTheme);
  if (streamBtn) streamBtn.addEventListener('click', handleStreamButtonClick);
  if (scheduleBtn) scheduleBtn.addEventListener('click', handleScheduleButtonClick);
  if (refreshBtn) refreshBtn.addEventListener('click', fetchExternalLiveScore);

  await fetchNextMatch();
  await fetchAndRenderLiveMatches();
  await fetchAndRenderTeams();
  await fetchAndRenderPointsTable();
  await fetchExternalLiveScore();
  fetchExternalLiveScore(); 
  
  initFooter();
}

document.addEventListener('DOMContentLoaded', init);
