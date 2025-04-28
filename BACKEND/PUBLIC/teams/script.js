document.addEventListener('DOMContentLoaded', function() {
  // Mobile Menu Toggle
  const hamburger = document.querySelector('.hamburger');
  const navLinks = document.querySelector('.nav-links');

  if (hamburger) {
    hamburger.addEventListener('click', function() {
      this.classList.toggle('active');
      navLinks.classList.toggle('active');
    });
  }

  // Team Filter Functionality
  const filterBtns = document.querySelectorAll('.filter-btn');
  const teamsGrid = document.querySelector('.teams-grid');

  // Complete IPL 2025 Teams Data
  const teamsData = [
    { id: 1, name: "Chennai Super Kings", shortName: "CSK", logo: "🦁", captain: "Ruturaj Gaikwad", region: "south", matches: 14, wins: 9, losses: 5, banner: "https://i.imgur.com/5PFzOlv.jpeg", founded: 2008, championships: 5 },
    { id: 2, name: "Mumbai Indians", shortName: "MI", logo: "🌀", captain: "Hardik Pandya", region: "west", matches: 14, wins: 8, losses: 6, banner: "https://i.imgur.com/XhvQwzf.jpeg", founded: 2008, championships: 5 },
    { id: 3, name: "Royal Challengers Bengaluru", shortName: "RCB", logo: "👑", captain: "Faf du Plessis", region: "south", matches: 14, wins: 7, losses: 7, banner: "https://i.imgur.com/aDO0mB4.jpeg", founded: 2008, championships: 0 },
    { id: 4, name: "Kolkata Knight Riders", shortName: "KKR", logo: "♟️", captain: "Shreyas Iyer", region: "east", matches: 14, wins: 10, losses: 4, banner: "https://images.unsplash.com/photo-1583417319070-4a69db38a482?ixlib=rb-1.2.1&auto=format&fit=crop", founded: 2008, championships: 2 },
    { id: 5, name: "Delhi Capitals", shortName: "DC", logo: "🏙️", captain: "Rishabh Pant", region: "north", matches: 14, wins: 7, losses: 7, banner: "https://i.imgur.com/MvaWp8f.jpeg", founded: 2008, championships: 0 },
    { id: 6, name: "Punjab Kings", shortName: "PBKS", logo: "🦁", captain: "Shikhar Dhawan", region: "north", matches: 14, wins: 6, losses: 8, banner: "https://i.imgur.com/KnMODcM.jpeg", founded: 2008, championships: 0 },
    { id: 7, name: "Rajasthan Royals", shortName: "RR", logo: "👑", captain: "Sanju Samson", region: "west", matches: 14, wins: 8, losses: 6, banner: "https://i.imgur.com/neFuuGZ.jpeg", founded: 2008, championships: 1 },
    { id: 8, name: "Sunrisers Hyderabad", shortName: "SRH", logo: "☀️", captain: "Pat Cummins", region: "south", matches: 14, wins: 5, losses: 9, banner: "https://images.unsplash.com/photo-1587474260584-136574528ed5?ixlib=rb-1.2.1&auto=format&fit=crop", founded: 2012, championships: 1 },
    { id: 9, name: "Lucknow Super Giants", shortName: "LSG", logo: "🦸", captain: "KL Rahul", region: "north", matches: 14, wins: 9, losses: 5, banner: "https://i.imgur.com/OPFHGqV.jpeg", founded: 2021, championships: 0 },
    { id: 10, name: "Gujarat Titans", shortName: "GT", logo: "⚔️", captain: "Shubman Gill", region: "west", matches: 14, wins: 10, losses: 4, banner: "https://images.unsplash.com/photo-1605559424843-9e4c228bf1c2?ixlib=rb-1.2.1&auto=format&fit=crop", founded: 2021, championships: 1 }
  ];

  // Render all teams initially
  renderTeams(teamsData);

  // Filter button click handlers
  filterBtns.forEach(btn => {
    btn.addEventListener('click', function() {
      filterBtns.forEach(b => b.classList.remove('active'));
      this.classList.add('active');

      const filter = this.dataset.filter;
      if (filter === 'all') {
        renderTeams(teamsData);
      } else {
        const filteredTeams = teamsData.filter(team => team.region === filter);
        renderTeams(filteredTeams);
      }
    });
  });

  // Render teams function
  function renderTeams(teams) {
    if (teams.length === 0) {
      teamsGrid.innerHTML = `
        <div class="empty-state">
          <i class="fas fa-users-slash"></i>
          <h3>No teams found</h3>
          <p>Try selecting a different region filter</p>
        </div>
      `;
      return;
    }

    let teamsHTML = '';
    teams.forEach(team => {
      const optimizedBanner = team.banner.includes('unsplash.com') 
        ? `${team.banner}&w=400&q=50`
        : team.banner;

      teamsHTML += `
        <div class="team-card" data-region="${team.region}">
          <div class="team-banner">
            <img src="${optimizedBanner}" alt="${team.name} Banner" loading="lazy" />
            <span class="team-region region-${team.region}">${team.region.toUpperCase()}</span>
          </div>
          <div class="team-logo">${team.logo}</div>
          <div class="team-info">
            <h3 class="team-name">${team.shortName}</h3>
            <p class="team-captain">${team.name}</p>
            <p><i class="fas fa-user-tie"></i> ${team.captain}</p>
            <div class="team-stats">
              <div class="stat">
                <div class="stat-value">${team.matches}</div>
                <div class="stat-label">Matches</div>
              </div>
              <div class="stat">
                <div class="stat-value">${team.wins}</div>
                <div class="stat-label">Wins</div>
              </div>
              <div class="stat">
                <div class="stat-value">${team.losses}</div>
                <div class="stat-label">Losses</div>
              </div>
            </div>
            <div class="team-meta">
              <span><i class="fas fa-calendar"></i> ${team.founded}</span>
              <span><i class="fas fa-trophy"></i> ${team.championships}</span>
            </div>
          </div>
        </div>
      `;
    });

    teamsGrid.innerHTML = teamsHTML;

    // Add click event to team cards
    document.querySelectorAll('.team-card').forEach(card => {
      card.addEventListener('click', function() {
        const teamName = this.querySelector('.team-name').textContent;
        showToast(`Showing details for ${teamName}`, 'info');
      });
    });
  }

  // Show toast notification
  function showToast(message, type) {
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.innerHTML = `
      <i class="fas ${type === 'success' ? 'fa-check-circle' : 
                      type === 'error' ? 'fa-exclamation-circle' : 
                      'fa-info-circle'}"></i>
      <span>${message}</span>
    `;

    document.body.appendChild(toast);

    // Show toast
    setTimeout(() => {
      toast.classList.add('show');
    }, 10);

    // Hide after 3 seconds
    setTimeout(() => {
      toast.classList.remove('show');
      setTimeout(() => {
        toast.remove();
      }, 300);
    }, 3000);
  }
});
