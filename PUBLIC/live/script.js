document.addEventListener('DOMContentLoaded', function() {
    // Set current year in footer
    document.getElementById('current-year').textContent = new Date().getFullYear();

    // YouTube Live Stream Embed
    const youtubeStream = document.getElementById('youtube-stream');
    const loader = document.querySelector('.loader');
    
    // Replace with your YouTube live stream ID or channel ID
    const youtubeStreamId = 'YOUR_YOUTUBE_STREAM_ID'; // Example: '5qap5aO4i9A'
    
    // YouTube embed URL with parameters
    const embedUrl = `https://www.youtube.com/embed/${youtubeStreamId}?autoplay=1&mute=0&enablejsapi=1`;
    
    youtubeStream.src = embedUrl;
    
    // When the iframe is loaded
    youtubeStream.addEventListener('load', function() {
        setTimeout(() => {
            youtubeStream.classList.add('loaded');
            loader.style.opacity = '0';
            setTimeout(() => {
                loader.style.display = 'none';
            }, 500);
        }, 1500);
    });

    // Simulate live match data updates
    function updateMatchData() {
        // Randomly update score
        const scoreElement = document.querySelector('.score .runs');
        const oversElement = document.querySelector('.score .overs');
        const statusElement = document.querySelector('.match-status');
        
        if (scoreElement && oversElement && statusElement) {
            const currentRuns = scoreElement.textContent.split('/');
            let runs = parseInt(currentRuns[0]);
            let wickets = parseInt(currentRuns[1]);
            
            // Randomly add runs (0-6)
            const runAddition = Math.floor(Math.random() * 7);
            runs += runAddition;
            
            // Occasionally add wicket (10% chance)
            if (Math.random() < 0.1 && wickets < 10) {
                wickets += 1;
            }
            
            // Update overs (0.1 to 0.6)
            const currentOver = oversElement.textContent.match(/\((\d+)\.(\d+)/);
            if (currentOver) {
                let overs = parseInt(currentOver[1]);
                let balls = parseInt(currentOver[2]);
                
                balls += 1;
                if (balls > 5) {
                    balls = 0;
                    overs += 1;
                }
                
                oversElement.textContent = `(${overs}.${balls} overs)`;
            }
            
            scoreElement.textContent = `${runs}/${wickets}`;
            
            // Update match status
            const statusMessages = [
                "Partnership building nicely",
                "Bowlers applying pressure",
                "Batting team on top",
                "Game in balance",
                "Exciting phase of play",
                "Bowlers fighting back",
                "Batsmen dominating"
            ];
            statusElement.textContent = `⚡ ${statusMessages[Math.floor(Math.random() * statusMessages.length)]}`;
        }
        
        // Update batsman stats
        const batsmanRuns = document.querySelector('.batsman .player-stats span:first-child');
        const batsmanSR = document.querySelector('.batsman .sr');
        if (batsmanRuns && batsmanSR) {
            const current = batsmanRuns.textContent.match(/(\d+)\*/);
            if (current) {
                const runs = parseInt(current[1]) + Math.floor(Math.random() * 3);
                const balls = Math.floor(runs / 0.7); // Approximate balls faced
                const sr = ((runs / balls) * 100).toFixed(2);
                batsmanRuns.textContent = `${runs}* (${balls})`;
                batsmanSR.textContent = `SR: ${sr}`;
            }
        }
        
        // Update bowler stats
        const bowlerStats = document.querySelector('.bowler .player-stats span:first-child');
        const bowlerEcon = document.querySelector('.bowler .economy');
        if (bowlerStats && bowlerEcon) {
            const current = bowlerStats.textContent.match(/(\d+)\/(\d+)/);
            if (current) {
                const wickets = parseInt(current[1]);
                let runs = parseInt(current[2]);
                runs += Math.floor(Math.random() * 3);
                const overs = 8;
                const econ = (runs / overs).toFixed(2);
                bowlerStats.textContent = `${wickets}/${runs} (${overs})`;
                bowlerEcon.textContent = `Econ: ${econ}`;
            }
        }
    }

    // Update match data every 10 seconds
    setInterval(updateMatchData, 10000);

    // Add new commentary items
    function addCommentary() {
        const commentaryFeed = document.querySelector('.commentary-feed');
        if (commentaryFeed) {
            const commentaries = [
                "Excellent line and length from the bowler",
                "Edged but falls short of the slips!",
                "Crisp cover drive for FOUR!",
                "Defended solidly back to the bowler",
                "SIX! That's gone miles into the stands!",
                "Appeal for LBW! Not out says the umpire",
                "Quick single taken, good running between wickets",
                "BEATEN! Beautiful delivery just misses the edge",
                "DROPPED! That was a sitter at mid-wicket",
                "Perfect yorker, dug out at the last moment"
            ];
            
            const newCommentary = document.createElement('div');
            newCommentary.className = 'commentary-item new';
            
            const over = Math.floor(Math.random() * 50);
            const ball = Math.floor(Math.random() * 6) + 1;
            
            newCommentary.innerHTML = `
                <div class="commentary-time">${over}.${ball}</div>
                <div class="commentary-text">${commentaries[Math.floor(Math.random() * commentaries.length)]}</div>
            `;
            
            // Add to top
            commentaryFeed.insertBefore(newCommentary, commentaryFeed.firstChild);
            
            // Remove old items if more than 10
            if (commentaryFeed.children.length > 10) {
                commentaryFeed.removeChild(commentaryFeed.lastChild);
            }
            
            // Remove 'new' class after 5 seconds
            setTimeout(() => {
                newCommentary.classList.remove('new');
            }, 5000);
        }
    }

    // Add commentary every 5-15 seconds
    setInterval(addCommentary, 5000 + Math.random() * 10000);

    // Refresh commentary button
    const refreshBtn = document.querySelector('.refresh-btn');
    if (refreshBtn) {
        refreshBtn.addEventListener('click', function() {
            this.innerHTML = '<i class="fas fa-sync-alt fa-spin"></i> Refreshing...';
            setTimeout(() => {
                this.innerHTML = '<i class="fas fa-sync-alt"></i> Refresh Commentary';
                addCommentary();
                addCommentary();
            }, 1000);
        });
    }

    // Live chat button
    const liveChatBtn = document.querySelector('.live-chat-btn');
    if (liveChatBtn) {
        liveChatBtn.addEventListener('click', function() {
            this.innerHTML = '<i class="fas fa-comment-dots"></i> Coming Soon!';
            setTimeout(() => {
                this.innerHTML = '<i class="fas fa-comment-dots"></i> Live Chat';
            }, 2000);
        });
    }

    // Team click effect
    const teams = document.querySelectorAll('.team');
    teams.forEach(team => {
        team.addEventListener('click', function() {
            document.querySelector('.team.active')?.classList.remove('active');
            this.classList.add('active');
        });
    });
});