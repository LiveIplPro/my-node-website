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

// Mobile Menu Toggle
function toggleMobileMenu() {
  navLinks.classList.toggle('active');
  document.body.classList.toggle('no-scroll');
}

// Theme Toggle
function toggleTheme() {
  const newTheme = document.body.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
  document.body.setAttribute('data-theme', newTheme);
  const icon = themeToggle.querySelector('i');
  icon.classList.toggle('fa-moon');
  icon.classList.toggle('fa-sun');
  localStorage.setItem('theme', newTheme);
}

// Button event handlers
function handleStreamButtonClick() {
  alert('Live streaming will start soon!');
}

function handleScheduleButtonClick() {
  window.location.href = '/schedule/index.html';
}

// Fetch data from API with error handling
async function fetchData(url) {
  try {
    if (url === ENDPOINTS.LIVE_MATCHES && liveSchedule) {
      liveSchedule.innerHTML = '<div class="loading-spinner"><i class="fas fa-spinner"></i> Loading live matches...</div>';
    }
    if (url === ENDPOINTS.TEAMS && teamsGrid) {
      teamsGrid.innerHTML = '<div class="loading-spinner"><i class="fas fa-spinner"></i> Loading teams...</div>';
    }
    if (url === ENDPOINTS.NEXT_MATCH && nextMatchContainer) {
      nextMatchContainer.innerHTML = '<div class="loading-spinner"><i class="fas fa-spinner"></i> Loading next match...</div>';
    }
    if (url === ENDPOINTS.POINTS_TABLE && pointsTableContainer) {
      pointsTableContainer.innerHTML = '<div class="loading-spinner"><i class="fas fa-spinner"></i> Loading points table...</div>';
    }

    const response = await fetch(url);
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    return await response.json();
  } catch (error) {
    console.error('Error fetching data:', error);
    showError(url);
    return null;
  }
}

// Show error message
function showError(url) {
  if (url === ENDPOINTS.LIVE_MATCHES && liveSchedule) {
    liveSchedule.innerHTML = '<p class="error-message">Failed to load live matches. Please try again later.</p>';
  }
  if (url === ENDPOINTS.TEAMS && teamsGrid) {
    teamsGrid.innerHTML = '<p class="error-message">Failed to load teams. Please try again later.</p>';
  }
  if (url === ENDPOINTS.NEXT_MATCH && nextMatchContainer) {
    nextMatchContainer.innerHTML = '<p class="error-message">Failed to load next match. Please try again later.</p>';
  }
  if (url === ENDPOINTS.POINTS_TABLE && pointsTableContainer) {
    pointsTableContainer.innerHTML = '<p class="error-message">Failed to load points table. Please try again later.</p>';
  }
}

// Show no match message
function showNoMatchMessage() {
  if (nextMatchContainer) {
    nextMatchContainer.innerHTML = '<p>No upcoming matches scheduled yet.</p>';
  }
}

// Display next match
function displayNextMatch(matchData) {
  if (!nextMatchContainer) return;
  nextMatchContainer.innerHTML = `
    <div class="next-match-card glass">
      <h3>Next Match</h3>
      <div class="match-teams">
        <div class="team"><img src="${TEAM_LOGOS[matchData.teams[0]] || ''}" alt="${matchData.teams[0]}" class="team-logo"><span>${matchData.teams[0]}</span></div>
        <div class="match-vs">VS</div>
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
    liveSchedule.innerHTML = '<p>No live or upcoming matches currently.</p>';
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
    liveSchedule.innerHTML = '<p>No live or upcoming matches currently.</p>';
    return;
  }

  liveSchedule.innerHTML = filtered.map(match => `
    <div class="match-card glass">
      <div class="match-teams">
        <div class="team"><img src="${TEAM_LOGOS[match.teams[0]] || ''}" alt="${match.teams[0]}" class="team-logo"><span>${match.teams[0]}</span></div>
        <div class="match-vs">VS</div>
        <div class="team"><img src="${TEAM_LOGOS[match.teams[1]] || ''}" alt="${match.teams[1]}" class="team-logo"><span>${match.teams[1]}</span></div>
      </div>
      <div class="match-info">
        <p><i class="fas fa-calendar-alt"></i> ${new Date(match.date).toLocaleDateString()}</p>
        <p><i class="fas fa-clock"></i> ${match.time || 'TBD'}</p>
        <p><i class="fas fa-map-marker-alt"></i> ${match.venue}</p>
      </div>
      <div class="match-status" style="background: ${match.status === 'Live' ? '#ff4757' : '#2ed573'}">${match.status}</div>
    </div>
  `).join('');
}

// Fetch & render teams
async function fetchAndRenderTeams() {
  const data = await fetchData(ENDPOINTS.TEAMS);
  const teams = data?.teams || data; // support both { teams: [] } or direct []
  if (!Array.isArray(teams) || teams.length === 0) {
    teamsGrid.innerHTML = '<p>No team data available.</p>';
    return;
  }

  teamsGrid.innerHTML = teams.map(team => `
    <div class="team-profile glass" data-team="${team.name}">
      <div class="team-profile-inner">
        <img src="${TEAM_LOGOS[team.name] || team.logo}" alt="${team.name}" class="team-profile-logo">
        <div class="team-profile-content">
          <h3 class="team-profile-name">${team.name}</h3>
          <p class="team-profile-captain">Captain: ${team.captain}</p>
        </div>
      </div>
    </div>
  `).join('');

  document.querySelectorAll('.team-profile').forEach(teamCard => {
    const teamName = teamCard.getAttribute('data-team');
    const team = teams.find(t => t.name === teamName);
    teamCard.addEventListener('click', () => showTeamDetails(team));
  });
}

// Show team modal
function showTeamDetails(team) {
  if (!team || !modalContent) return;
  modalContent.innerHTML = `
    <div class="modal-header">
      <span class="close-modal">&times;</span>
      <img src="${TEAM_LOGOS[team.name] || team.logo}" alt="${team.name}" class="modal-team-logo">
      <h2>${team.name}</h2>
      <p class="modal-subtitle">Captain: ${team.captain}</p>
    </div>
    <div class="modal-body">
      <div class="stat-row"><div class="stat-label"><i class="fas fa-trophy"></i><span>Trophies</span></div><div class="stat-value">${team.trophies || 0}</div></div>
      <div class="stat-row"><div class="stat-label"><i class="fas fa-flag"></i><span>Total Matches</span></div><div class="stat-value">${team.matches || 'N/A'}</div></div>
      <div class="stat-row"><div class="stat-label"><i class="fas fa-check-circle"></i><span>Wins</span></div><div class="stat-value">${team.wins || 'N/A'}</div></div>
      <div class="stat-row"><div class="stat-label"><i class="fas fa-times-circle"></i><span>Losses</span></div><div class="stat-value">${team.losses || 'N/A'}</div></div>
      <div class="team-description"><h3>About ${team.name}</h3><p>${team.description || 'No description available.'}</p></div>
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
    pointsTableContainer.innerHTML = '<p>No points table data available.</p>';
    return;
  }

  pointsTableContainer.innerHTML = `
    <div class="points-table glass">
      <table>
        <thead>
          <tr>
            <th>Pos</th>
            <th>Team</th>
            <th>Played</th>
            <th>Won</th>
            <th>Lost</th>
            <th>Points</th>
            <th>NRR</th>
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

// Init App
async function init() {
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

  await fetchNextMatch();
  await fetchAndRenderLiveMatches();
  await fetchAndRenderTeams();
  await fetchAndRenderPointsTable();
}
document.addEventListener('DOMContentLoaded', init);
