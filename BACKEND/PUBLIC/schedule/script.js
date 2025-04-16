// IPL 2025 Schedule Data
const iplSchedule2025 = [
    { matchNo: 1, date: "22-Mar-25", day: "Sat", time: "7:30 PM", home: "Kolkata Knight Riders", away: "Royal Challengers Bengaluru", venue: "Kolkata" },
    { matchNo: 2, date: "23-Mar-25", day: "Sun", time: "3:30 PM", home: "Sunrisers Hyderabad", away: "Rajasthan Royals", venue: "Hyderabad" },
    { matchNo: 3, date: "23-Mar-25", day: "Sun", time: "7:30 PM", home: "Chennai Super Kings", away: "Mumbai Indians", venue: "Chennai" },
    { matchNo: 4, date: "24-Mar-25", day: "Mon", time: "7:30 PM", home: "Delhi Capitals", away: "Lucknow Super Giants", venue: "Visakhapatnam" },
    { matchNo: 5, date: "25-Mar-25", day: "Tue", time: "7:30 PM", home: "Gujarat Titans", away: "Punjab Kings", venue: "Ahmedabad" },
    { matchNo: 6, date: "26-Mar-25", day: "Wed", time: "7:30 PM", home: "Rajasthan Royals", away: "Delhi Capitals", venue: "Guwahati" },
    { matchNo: 7, date: "27-Mar-25", day: "Thu", time: "7:30 PM", home: "Sunrisers Hyderabad", away: "Lucknow Super Giants", venue: "Hyderabad" },
    { matchNo: 8, date: "28-Mar-25", day: "Fri", time: "7:30 PM", home: "Chennai Super Kings", away: "Royal Challengers Bengaluru", venue: "Chennai" },
    { matchNo: 9, date: "29-Mar-25", day: "Sat", time: "7:30 PM", home: "Gujarat Titans", away: "Mumbai Indians", venue: "Ahmedabad" },
    { matchNo: 10, date: "30-Mar-25", day: "Sun", time: "3:30 PM", home: "Delhi Capitals", away: "Sunrisers Hyderabad", venue: "Visakhapatnam" },
    { matchNo: 11, date: "30-Mar-25", day: "Sun", time: "7:30 PM", home: "Rajasthan Royals", away: "Chennai Super Kings", venue: "Guwahati" },
    { matchNo: 12, date: "31-Mar-25", day: "Mon", time: "7:30 PM", home: "Mumbai Indians", away: "Royal Challengers Bengaluru", venue: "Mumbai" },
    { matchNo: 13, date: "01-Apr-25", day: "Tue", time: "7:30 PM", home: "Lucknow Super Giants", away: "Punjab Kings", venue: "Lucknow" },
    { matchNo: 14, date: "02-Apr-25", day: "Wed", time: "7:30 PM", home: "Royal Challengers Bengaluru", away: "Kolkata Knight Riders", venue: "Bengaluru" },
    { matchNo: 15, date: "03-Apr-25", day: "Thu", time: "7:30 PM", home: "Kolkata Knight Riders", away: "Sunrisers Hyderabad", venue: "Kolkata" },
    { matchNo: 16, date: "04-Apr-25", day: "Fri", time: "7:30 PM", home: "Mumbai Indians", away: "Delhi Capitals", venue: "Mumbai" },
    { matchNo: 17, date: "05-Apr-25", day: "Sat", time: "3:30 PM", home: "Chennai Super Kings", away: "Lucknow Super Giants", venue: "Chennai" },
    { matchNo: 18, date: "05-Apr-25", day: "Sat", time: "7:30 PM", home: "Kolkata Knight Riders", away: "Gujarat Titans", venue: "Kolkata" },
    { matchNo: 19, date: "06-Apr-25", day: "Sun", time: "3:30 PM", home: "Sunrisers Hyderabad", away: "Mumbai Indians", venue: "Hyderabad" },
    { matchNo: 20, date: "06-Apr-25", day: "Sun", time: "7:30 PM", home: "Punjab Kings", away: "Royal Challengers Bengaluru", venue: "New Chandigarh" },
    { matchNo: 21, date: "07-Apr-25", day: "Mon", time: "7:30 PM", home: "Gujarat Titans", away: "Lucknow Super Giants", venue: "Ahmedabad" },
    { matchNo: 22, date: "08-Apr-25", day: "Tue", time: "7:30 PM", home: "Rajasthan Royals", away: "Kolkata Knight Riders", venue: "Guwahati" },
    { matchNo: 23, date: "09-Apr-25", day: "Wed", time: "7:30 PM", home: "Mumbai Indians", away: "Punjab Kings", venue: "Mumbai" },
    { matchNo: 24, date: "10-Apr-25", day: "Thu", time: "7:30 PM", home: "Sunrisers Hyderabad", away: "Chennai Super Kings", venue: "Hyderabad" },
    { matchNo: 25, date: "11-Apr-25", day: "Fri", time: "7:30 PM", home: "Delhi Capitals", away: "Royal Challengers Bengaluru", venue: "Visakhapatnam" },
    { matchNo: 26, date: "12-Apr-25", day: "Sat", time: "3:30 PM", home: "Punjab Kings", away: "Kolkata Knight Riders", venue: "New Chandigarh" },
    { matchNo: 27, date: "12-Apr-25", day: "Sat", time: "7:30 PM", home: "Rajasthan Royals", away: "Gujarat Titans", venue: "Guwahati" },
    { matchNo: 28, date: "13-Apr-25", day: "Sun", time: "3:30 PM", home: "Chennai Super Kings", away: "Delhi Capitals", venue: "Chennai" },
    { matchNo: 29, date: "13-Apr-25", day: "Sun", time: "7:30 PM", home: "Lucknow Super Giants", away: "Mumbai Indians", venue: "Lucknow" },
    { matchNo: 30, date: "14-Apr-25", day: "Mon", time: "7:30 PM", home: "Gujarat Titans", away: "Delhi Capitals", venue: "Ahmedabad" },
    { matchNo: 31, date: "15-Apr-25", day: "Tue", time: "7:30 PM", home: "Sunrisers Hyderabad", away: "Punjab Kings", venue: "Hyderabad" },
    { matchNo: 32, date: "16-Apr-25", day: "Wed", time: "7:30 PM", home: "Chennai Super Kings", away: "Rajasthan Royals", venue: "Chennai" },
    { matchNo: 33, date: "17-Apr-25", day: "Thu", time: "7:30 PM", home: "Mumbai Indians", away: "Kolkata Knight Riders", venue: "Mumbai" },
    { matchNo: 34, date: "18-Apr-25", day: "Fri", time: "7:30 PM", home: "Royal Challengers Bengaluru", away: "Lucknow Super Giants", venue: "Bengaluru" },
    { matchNo: 35, date: "19-Apr-25", day: "Sat", time: "3:30 PM", home: "Punjab Kings", away: "Delhi Capitals", venue: "New Chandigarh" },
    { matchNo: 36, date: "19-Apr-25", day: "Sat", time: "7:30 PM", home: "Rajasthan Royals", away: "Sunrisers Hyderabad", venue: "Jaipur" },
    { matchNo: 37, date: "20-Apr-25", day: "Sun", time: "3:30 PM", home: "Kolkata Knight Riders", away: "Chennai Super Kings", venue: "Kolkata" },
    { matchNo: 38, date: "20-Apr-25", day: "Sun", time: "7:30 PM", home: "Delhi Capitals", away: "Mumbai Indians", venue: "Delhi" },
    { matchNo: 39, date: "21-Apr-25", day: "Mon", time: "7:30 PM", home: "Lucknow Super Giants", away: "Rajasthan Royals", venue: "Lucknow" },
    { matchNo: 40, date: "22-Apr-25", day: "Tue", time: "7:30 PM", home: "Royal Challengers Bengaluru", away: "Gujarat Titans", venue: "Bengaluru" },
    { matchNo: 41, date: "23-Apr-25", day: "Wed", time: "7:30 PM", home: "Delhi Capitals", away: "Rajasthan Royals", venue: "Delhi" },
    { matchNo: 42, date: "24-Apr-25", day: "Thu", time: "7:30 PM", home: "Sunrisers Hyderabad", away: "Royal Challengers Bengaluru", venue: "Hyderabad" },
    { matchNo: 43, date: "25-Apr-25", day: "Fri", time: "7:30 PM", home: "Mumbai Indians", away: "Gujarat Titans", venue: "Mumbai" },
    { matchNo: 44, date: "26-Apr-25", day: "Sat", time: "3:30 PM", home: "Lucknow Super Giants", away: "Kolkata Knight Riders", venue: "Lucknow" },
    { matchNo: 45, date: "26-Apr-25", day: "Sat", time: "7:30 PM", home: "Punjab Kings", away: "Chennai Super Kings", venue: "New Chandigarh" },
    { matchNo: 46, date: "27-Apr-25", day: "Sun", time: "3:30 PM", home: "Gujarat Titans", away: "Sunrisers Hyderabad", venue: "Ahmedabad" },
    { matchNo: 47, date: "27-Apr-25", day: "Sun", time: "7:30 PM", home: "Royal Challengers Bengaluru", away: "Delhi Capitals", venue: "Bengaluru" },
    { matchNo: 48, date: "28-Apr-25", day: "Mon", time: "7:30 PM", home: "Rajasthan Royals", away: "Mumbai Indians", venue: "Jaipur" },
    { matchNo: 49, date: "29-Apr-25", day: "Tue", time: "7:30 PM", home: "Kolkata Knight Riders", away: "Chennai Super Kings", venue: "Kolkata" },
    { matchNo: 50, date: "30-Apr-25", day: "Wed", time: "7:30 PM", home: "Sunrisers Hyderabad", away: "Delhi Capitals", venue: "Hyderabad" },
    { matchNo: 51, date: "01-May-25", day: "Thu", time: "7:30 PM", home: "Lucknow Super Giants", away: "Punjab Kings", venue: "Lucknow" },
    { matchNo: 52, date: "02-May-25", day: "Fri", time: "7:30 PM", home: "Chennai Super Kings", away: "Gujarat Titans", venue: "Chennai" },
    { matchNo: 53, date: "03-May-25", day: "Sat", time: "3:30 PM", home: "Delhi Capitals", away: "Kolkata Knight Riders", venue: "Delhi" },
    { matchNo: 54, date: "03-May-25", day: "Sat", time: "7:30 PM", home: "Punjab Kings", away: "Rajasthan Royals", venue: "New Chandigarh" },
    { matchNo: 55, date: "04-May-25", day: "Sun", time: "3:30 PM", home: "Mumbai Indians", away: "Sunrisers Hyderabad", venue: "Mumbai" },
    { matchNo: 56, date: "04-May-25", day: "Sun", time: "7:30 PM", home: "Royal Challengers Bengaluru", away: "Chennai Super Kings", venue: "Bengaluru" },
    { matchNo: 57, date: "05-May-25", day: "Mon", time: "7:30 PM", home: "Gujarat Titans", away: "Rajasthan Royals", venue: "Ahmedabad" },
    { matchNo: 58, date: "06-May-25", day: "Tue", time: "7:30 PM", home: "Delhi Capitals", away: "Lucknow Super Giants", venue: "Delhi" },
    { matchNo: 59, date: "07-May-25", day: "Wed", time: "7:30 PM", home: "Sunrisers Hyderabad", away: "Kolkata Knight Riders", venue: "Hyderabad" },
    { matchNo: 60, date: "08-May-25", day: "Thu", time: "7:30 PM", home: "Punjab Kings", away: "Mumbai Indians", venue: "New Chandigarh" },
    { matchNo: 61, date: "09-May-25", day: "Fri", time: "7:30 PM", home: "Chennai Super Kings", away: "Delhi Capitals", venue: "Chennai" },
    { matchNo: 62, date: "10-May-25", day: "Sat", time: "3:30 PM", home: "Rajasthan Royals", away: "Royal Challengers Bengaluru", venue: "Jaipur" },
    { matchNo: 63, date: "10-May-25", day: "Sat", time: "7:30 PM", home: "Mumbai Indians", away: "Lucknow Super Giants", venue: "Mumbai" },
    { matchNo: 64, date: "11-May-25", day: "Sun", time: "3:30 PM", home: "Kolkata Knight Riders", away: "Punjab Kings", venue: "Kolkata" },
    { matchNo: 65, date: "11-May-25", day: "Sun", time: "7:30 PM", home: "Royal Challengers Bengaluru", away: "Gujarat Titans", venue: "Bengaluru" },
    { matchNo: 66, date: "12-May-25", day: "Mon", time: "7:30 PM", home: "Sunrisers Hyderabad", away: "Delhi Capitals", venue: "Hyderabad" },
    { matchNo: 67, date: "13-May-25", day: "Tue", time: "7:30 PM", home: "Lucknow Super Giants", away: "Rajasthan Royals", venue: "Lucknow" },
    { matchNo: 68, date: "14-May-25", day: "Wed", time: "7:30 PM", home: "Punjab Kings", away: "Sunrisers Hyderabad", venue: "New Chandigarh" },
    { matchNo: 69, date: "15-May-25", day: "Thu", time: "7:30 PM", home: "Delhi Capitals", away: "Mumbai Indians", venue: "Delhi" },
    { matchNo: 70, date: "16-May-25", day: "Fri", time: "7:30 PM", home: "Gujarat Titans", away: "Kolkata Knight Riders", venue: "Ahmedabad" },
    { matchNo: 71, date: "17-May-25", day: "Sat", time: "7:30 PM", home: "TBD", away: "TBD", venue: "Ahmedabad", note: "Qualifier 1" },
    { matchNo: 72, date: "18-May-25", day: "Sun", time: "7:30 PM", home: "TBD", away: "TBD", venue: "Chennai", note: "Eliminator" },
    { matchNo: 73, date: "20-May-25", day: "Tue", time: "7:30 PM", home: "TBD", away: "TBD", venue: "Chennai", note: "Qualifier 2" },
    { matchNo: 74, date: "24-May-25", day: "Sat", time: "7:30 PM", home: "TBD", away: "TBD", venue: "Chennai", note: "Final" }
  ];
  
  // Team logos mapping
  const teamLogos = {
      "Kolkata Knight Riders": "https://i.imgur.com/LsT0VWz.jpeg",
      "Royal Challengers Bengaluru": "https://i.imgur.com/e51T5so.jpeg",
      "Sunrisers Hyderabad": "https://i.imgur.com/CyxeuGq.jpeg ",
      "Rajasthan Royals": "https://i.imgur.com/wiUl1x1.jpeg",
      "Chennai Super Kings": "https://i.imgur.com/LsT0VWz.jpeg",
      "Mumbai Indians": "https://i.imgur.com/R1m23jr.jpeg",
      "Delhi Capitals": "https://i.imgur.com/B53ByLk.jpeg",
      "Lucknow Super Giants": "https://i.imgur.com/XZbFpTw.jpeg",
      "Gujarat Titans": "https://i.imgur.com/j2rnJko.jpeg",
      "Punjab Kings": "https://i.imgur.com/BwTipSE.jpeg",
      "TBD": "https://i.imgur.com/fIpGMb2.png"
  };
  
  // Team class mapping for colors
  const teamClasses = {
      "Kolkata Knight Riders": "kkr",
      "Royal Challengers Bengaluru": "rcb",
      "Sunrisers Hyderabad": "srh",
      "Rajasthan Royals": "rr",
      "Chennai Super Kings": "csk",
      "Mumbai Indians": "mi",
      "Delhi Capitals": "dc",
      "Lucknow Super Giants": "lsg",
      "Gujarat Titans": "gt",
      "Punjab Kings": "pbks",
      "TBD": "tbd"
  };
  
  // DOM Elements
  const scheduleContainer = document.getElementById('scheduleContainer');
  const searchInput = document.getElementById('searchInput');
  const filterButtons = document.querySelectorAll('.filter-btn');
  const noResults = document.getElementById('noResults');
  const totalMatches = document.getElementById('totalMatches');
  const upcomingCount = document.getElementById('upcomingCount');
  const completedCount = document.getElementById('completedCount');
  const resetBtn = document.querySelector('.reset-btn');
  
  // Current date and time for live match detection
  const currentDate = new Date();
  let currentHour = currentDate.getHours();
  const currentMinute = currentDate.getMinutes();
  // Convert to 12-hour format for comparison
  const currentTimeString = `${currentHour > 12 ? currentHour - 12 : currentHour}:${currentMinute < 10 ? '0' + currentMinute : currentMinute} ${currentHour >= 12 ? 'PM' : 'AM'}`;
  
  // Display all matches initially
  displayMatches(iplSchedule2025);
  updateMatchCounts();
  
  // Set total matches count
  totalMatches.textContent = iplSchedule2025.length;
  
  // Search functionality
  searchInput.addEventListener('input', function() {
      const searchTerm = this.value.toLowerCase();
      const filteredMatches = iplSchedule2025.filter(match => {
          return (
              match.home.toLowerCase().includes(searchTerm) ||
              match.away.toLowerCase().includes(searchTerm) ||
              match.venue.toLowerCase().includes(searchTerm) ||
              (match.note && match.note.toLowerCase().includes(searchTerm))
          );
      });
      displayMatches(filteredMatches);
  });
  
  // Filter functionality
  filterButtons.forEach(button => {
      button.addEventListener('click', function() {
          // Remove active class from all buttons
          filterButtons.forEach(btn => btn.classList.remove('active'));
          // Add active class to clicked button
          this.classList.add('active');
          
          const filter = this.dataset.filter;
          let filteredMatches = [];
          
          if (filter === 'all') {
              filteredMatches = iplSchedule2025;
          } else if (filter === 'upcoming') {
              filteredMatches = iplSchedule2025.filter(match => {
                  const matchDate = new Date(match.date);
                  return matchDate >= currentDate || 
                        (matchDate.toDateString() === currentDate.toDateString() && 
                         isTimeAfter(match.time, currentTimeString));
              });
          } else if (filter === 'completed') {
              filteredMatches = iplSchedule2025.filter(match => {
                  const matchDate = new Date(match.date);
                  return matchDate < currentDate || 
                        (matchDate.toDateString() === currentDate.toDateString() && 
                         !isTimeAfter(match.time, currentTimeString));
              });
          }
          
          displayMatches(filteredMatches);
      });
  });
  
  // Reset filters
  resetBtn.addEventListener('click', function() {
      searchInput.value = '';
      filterButtons.forEach(btn => btn.classList.remove('active'));
      document.querySelector('.filter-btn[data-filter="all"]').classList.add('active');
      displayMatches(iplSchedule2025);
  });
  
  // Function to check if time1 is after time2
  function isTimeAfter(time1, time2) {
      const [timePart1, period1] = time1.split(' ');
      const [hours1, minutes1] = timePart1.split(':').map(Number);
      const totalMinutes1 = (period1 === 'PM' && hours1 !== 12 ? hours1 + 12 : hours1) * 60 + minutes1;
  
      const [timePart2, period2] = time2.split(' ');
      const [hours2, minutes2] = timePart2.split(':').map(Number);
      const totalMinutes2 = (period2 === 'PM' && hours2 !== 12 ? hours2 + 12 : hours2) * 60 + minutes2;
  
      return totalMinutes1 > totalMinutes2;
  }
  
  // Format date to "22 Mar 2025" format
  function formatDate(dateStr) {
      const months = {
          'Jan': 'Jan', 'Feb': 'Feb', 'Mar': 'Mar', 'Apr': 'Apr',
          'May': 'May', 'Jun': 'Jun', 'Jul': 'Jul', 'Aug': 'Aug',
          'Sep': 'Sep', 'Oct': 'Oct', 'Nov': 'Nov', 'Dec': 'Dec'
      };
      const [day, month, year] = dateStr.split('-');
      return `${day} ${months[month]} 20${year}`;
  }
  
  // Function to get day/night icon based on time
  function getTimeIcon(timeStr) {
      const [timePart, period] = timeStr.split(' ');
      const hours = parseInt(timePart.split(':')[0]);
      
      if (period === 'PM' && hours >= 6) {
          return '<i class="fas fa-moon night-icon"></i>';
      } else if (period === 'AM' && hours < 6) {
          return '<i class="fas fa-moon night-icon"></i>';
      } else {
          return '<i class="fas fa-sun day-icon"></i>';
      }
  }
  
  // Function to calculate countdown
  function getCountdown(dateStr, timeStr) {
      const [day, month, year] = dateStr.split('-');
      const [time, period] = timeStr.split(' ');
      let [hours, minutes] = time.split(':').map(Number);
      
      // Convert to 24-hour format
      if (period === 'PM' && hours !== 12) hours += 12;
      if (period === 'AM' && hours === 12) hours = 0;
      
      const months = {
          'Jan': 0, 'Feb': 1, 'Mar': 2, 'Apr': 3,
          'May': 4, 'Jun': 5, 'Jul': 6, 'Aug': 7,
          'Sep': 8, 'Oct': 9, 'Nov': 10, 'Dec': 11
      };
      
      const matchDate = new Date(2000 + parseInt(year), months[month], parseInt(day), hours, minutes);
      const now = new Date();
      const diff = matchDate - now;
      
      if (diff <= 0) return null;
      
      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hoursLeft = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutesLeft = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      
      if (days > 0) {
          return `${days}d ${hoursLeft}h ${minutesLeft}m`;
      } else if (hoursLeft > 0) {
          return `${hoursLeft}h ${minutesLeft}m`;
      } else {
          return `${minutesLeft}m`;
      }
  }
  
  // Function to update match counts
  function updateMatchCounts() {
      const upcoming = iplSchedule2025.filter(match => {
          const matchDate = new Date(match.date);
          return matchDate >= currentDate || 
                (matchDate.toDateString() === currentDate.toDateString() && 
                 isTimeAfter(match.time, currentTimeString));
      }).length;
      
      const completed = iplSchedule2025.length - upcoming;
      
      upcomingCount.textContent = upcoming;
      completedCount.textContent = completed;
  }
  
  // Function to display matches
  function displayMatches(matches) {
      scheduleContainer.innerHTML = '';
      
      if (matches.length === 0) {
          noResults.style.display = 'flex';
          return;
      } else {
          noResults.style.display = 'none';
      }
      
      // Sort matches by date and time
      matches.sort((a, b) => {
          const dateA = new Date(a.date);
          const dateB = new Date(b.date);
          if (dateA - dateB !== 0) return dateA - dateB;
          
          // If same date, sort by time
          return convertTimeToMinutes(a.time) - convertTimeToMinutes(b.time);
      });
      
      matches.forEach((match, index) => {
          // Determine match status
          const matchDate = new Date(match.date);
          let status = 'upcoming';
          let statusText = 'Upcoming';
          let countdown = null;
          
          // Check if match is completed
          if (matchDate < currentDate || 
             (matchDate.toDateString() === currentDate.toDateString() && 
              !isTimeAfter(match.time, currentTimeString))) {
              status = 'completed';
              statusText = 'Completed';
          }
          // Check if match is live (within 3 hours of current time)
          else if (matchDate.toDateString() === currentDate.toDateString()) {
              const matchTime = convertTimeToMinutes(match.time);
              const currentTime = convertTimeToMinutes(currentTimeString);
              
              if (Math.abs(matchTime - currentTime) <= 180) { // 3 hours window
                  status = 'live';
                  statusText = 'LIVE';
              } else {
                  countdown = getCountdown(match.date, match.time);
              }
          } else {
              countdown = getCountdown(match.date, match.time);
          }
          
          // For playoff matches
          if (match.note) {
              statusText = match.note;
          }
          
          const matchCard = document.createElement('div');
          matchCard.className = `match-card ${teamClasses[match.home]}`;
          if (match.note) matchCard.classList.add('playoff');
          matchCard.style.animationDelay = `${index * 0.05}s`;
          
          matchCard.innerHTML = `
              <div class="match-date-time">
                  <div class="date-day">
                      <span class="match-full-date">${formatDate(match.date)}</span>
                      <span class="match-day">${match.day}</span>
                  </div>
                  <div class="time-with-icon">
                      ${getTimeIcon(match.time)}
                      <span class="match-time">${match.time}</span>
                  </div>
              </div>
              <div class="match-content">
                  <div class="match-number">Match ${match.matchNo}</div>
                  <div class="teams">
                      <div class="team">
                          <img src="${teamLogos[match.home]}" alt="${match.home}" class="team-logo">
                          <span class="team-name">${match.home}</span>
                      </div>
                      <div class="vs">VS</div>
                      <div class="team">
                          <img src="${teamLogos[match.away]}" alt="${match.away}" class="team-logo">
                          <span class="team-name">${match.away}</span>
                      </div>
                  </div>
                  ${countdown ? `<div class="countdown ${status === 'live' ? 'live' : ''}">Starts in ${countdown}</div>` : ''}
                  <div class="match-venue">
                      <i class="fas fa-map-marker-alt"></i>
                      <span>${match.venue}</span>
                  </div>
              </div>
              <div class="match-status ${status}">${statusText}</div>
          `;
          
          scheduleContainer.appendChild(matchCard);
      });
  }
  
  // Helper function to convert time to minutes
  function convertTimeToMinutes(timeStr) {
      const [timePart, period] = timeStr.split(' ');
      const [hours, minutes] = timePart.split(':').map(Number);
      return (period === 'PM' && hours !== 12 ? hours + 12 : hours) * 60 + minutes;
  }
  
  // Update countdowns every minute
  setInterval(() => {
      const upcomingCards = document.querySelectorAll('.match-card:not(.completed)');
      upcomingCards.forEach(card => {
          const matchDate = card.querySelector('.match-full-date').textContent;
          const matchTime = card.querySelector('.match-time').textContent;
          const countdownElement = card.querySelector('.countdown');
          
          if (countdownElement) {
              const countdown = getCountdown(parseDateForCountdown(matchDate), matchTime);
              if (countdown) {
                  countdownElement.textContent = `Starts in ${countdown}`;
              } else {
                  countdownElement.textContent = 'Match starting soon!';
                  countdownElement.classList.add('live');
              }
          }
      });
  }, 60000);
  
  // Helper function to parse date for countdown
  function parseDateForCountdown(dateStr) {
      const [day, month, year] = dateStr.split(' ');
      const months = {
          'Jan': 'Jan', 'Feb': 'Feb', 'Mar': 'Mar', 'Apr': 'Apr',
          'May': 'May', 'Jun': 'Jun', 'Jul': 'Jul', 'Aug': 'Aug',
          'Sep': 'Sep', 'Oct': 'Oct', 'Nov': 'Nov', 'Dec': 'Dec'
      };
      const monthShort = Object.keys(months).find(key => months[key] === month);
      return `${day}-${monthShort}-${year.slice(2)}`;
  }
  
  // Simulate live updates for live matches
  setInterval(() => {
      const liveCards = document.querySelectorAll('.match-status.live');
      liveCards.forEach(card => {
          // Randomly change the LIVE indicator to make it dynamic
          if (Math.random() > 0.8) {
              card.textContent = ['LIVE', '• LIVE •', 'LIVE NOW'][Math.floor(Math.random() * 3)];
          }
      });
  }, 3000);