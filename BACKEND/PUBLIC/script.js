// Function to fetch next match data from your API
async function fetchNextMatch() {
  try {
    const response = await fetch('https://my-node-website.onrender.com/api/currentMatches');
    const data = await response.json();
    
    if (data && data.data && data.data.length > 0) {
      // Find the next upcoming match
      const now = new Date();
      const upcomingMatches = data.data.filter(match => {
        const matchDate = new Date(match.date);
        return matchDate > now;
      });
      
      if (upcomingMatches.length > 0) {
        // Sort by date to get the next match
        upcomingMatches.sort((a, b) => new Date(a.date) - new Date(b.date));
        displayNextMatch(upcomingMatches[0]);
      } else {
        showNoMatchMessage();
      }
    } else {
      showNoMatchMessage();
    }
  } catch (error) {
    console.error('Error fetching next match:', error);
    showError();
  }
}

// Function to display next match data
function displayNextMatch(matchData) {
  const container = document.getElementById('nextMatchContainer');
  
  container.innerHTML = `
    <div class="next-match-card glass">
      <h3>Next Match</h3>
      <div class="match-teams">
        <div class="team">
          <i class="fas fa-tshirt team-icon" style="color: #ff0000;"></i>
          <span>${matchData.teams[0]}</span>
        </div>
        <div class="match-vs">VS</div>
        <div class="team">
          <i class="fas fa-tshirt team-icon" style="color: #0000ff;"></i>
          <span>${matchData.teams[1]}</span>
        </div>
      </div>
      <div class="match-details">
        <p><i class="fas fa-calendar-alt"></i> ${new Date(matchData.date).toLocaleDateString()}</p>
        <p><i class="fas fa-clock"></i> ${matchData.time || 'Time TBD'}</p>
        <p><i class="fas fa-map-marker-alt"></i> ${matchData.venue}</p>
      </div>
    </div>
  `;
}

// Error handling functions
function showNoMatchMessage() {
  const container = document.getElementById('nextMatchContainer');
  container.innerHTML = '<p>No upcoming matches scheduled yet.</p>';
}

function showError() {
  const container = document.getElementById('nextMatchContainer');
  container.innerHTML = '<p>Failed to load next match information. Please try again later.</p>';
}

// LIVE DATA FETCH
fetch("https://my-node-website.onrender.com/api/currentMatches") 
  .then(response => response.json())
  .then(data => {
    console.log("Live Matches:", data);
    // Optional: Display in UI
    const scheduleDiv = document.getElementById("liveSchedule");
    if (data && data.data) {
      scheduleDiv.innerHTML = data.data
        .map(match => {
          return `
            <div class="match-card">
              <h3>${match.name}</h3>
              <p><strong>Status:</strong> ${match.status}</p>
              <p><strong>Venue:</strong> ${match.venue}</p>
              <p><strong>Teams:</strong> ${match.teams.join(" vs ")}</p>
              <p><strong>Date:</strong> ${match.date}</p>
            </div>
          `;
        })
        .join("");
    } else {
      scheduleDiv.innerHTML = "⚠️ No match data found.";
    }
  })
  .catch(error => {
    console.error("❌ Error fetching data:", error);
  });

// DOM Elements
const mobileMenuBtn = document.querySelector('.mobile-menu');
const navLinks = document.querySelector('.nav-links');
const themeToggle = document.querySelector('.theme-toggle');

// Functions
function toggleMobileMenu() {
    navLinks.classList.toggle('active');
    document.body.classList.toggle('no-scroll');
}

function toggleTheme() {
    const newTheme = document.body.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
    document.body.setAttribute('data-theme', newTheme);
    
    const icon = themeToggle.querySelector('i');
    icon.classList.toggle('fa-moon');
    icon.classList.toggle('fa-sun');
    
    // Save theme preference
    localStorage.setItem('theme', newTheme);
}

// Event Listeners
if (mobileMenuBtn) {
    mobileMenuBtn.addEventListener('click', toggleMobileMenu);
}

if (themeToggle) {
    themeToggle.addEventListener('click', toggleTheme);
}

// Initialize
function init() {
    try {
        // Set theme from localStorage or prefer-color-scheme
        const savedTheme = localStorage.getItem('theme') || 
            (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
        document.body.setAttribute('data-theme', savedTheme);
        
        // Update theme toggle icon
        const icon = themeToggle?.querySelector('i');
        if (icon) {
            icon.classList.toggle('fa-moon', savedTheme === 'light');
            icon.classList.toggle('fa-sun', savedTheme === 'dark');
        }
        
        // Fetch match data
        fetchNextMatch();
    } catch (error) {
        console.error('Initialization error:', error);
        // Show user-friendly error message
        const hero = document.querySelector('.hero-content');
        if (hero) {
            const existingError = hero.querySelector('.error-message');
            if (!existingError) {
                const errorDiv = document.createElement('div');
                errorDiv.className = 'error-message';
                errorDiv.textContent = 'There was an error loading the content. Please refresh the page.';
                hero.appendChild(errorDiv);
            }
        }
    }
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', init);
