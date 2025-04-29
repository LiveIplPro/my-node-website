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
  
  // Animate player cards on scroll
  const playerCards = document.querySelectorAll('.player-card');
  
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('slide-in');
      }
    });
  }, { threshold: 0.1 });
  
  playerCards.forEach(card => {
    observer.observe(card);
  });
  
  // Vote button functionality
  const voteBtn = document.getElementById('vote-btn');
  if (voteBtn) {
    voteBtn.addEventListener('click', function() {
      showModal();
    });
  }
  
  // Share button functionality
  const shareBtn = document.getElementById('share-btn');
  if (shareBtn) {
    shareBtn.addEventListener('click', function() {
      if (navigator.share) {
        navigator.share({
          title: 'Top 5 Young Talents in IPL 2025',
          text: 'Check out these emerging stars in IPL 2025!',
          url: window.location.href
        })
        .then(() => showToast('Shared successfully!', 'success'))
        .catch(err => showToast('Error sharing: ' + err, 'error'));
      } else {
        // Fallback for browsers that don't support Web Share API
        const shareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent('Check out these top 5 young talents in IPL 2025!')}&url=${encodeURIComponent(window.location.href)}`;
        window.open(shareUrl, '_blank');
        showToast('Share window opened', 'info');
      }
    });
  }
  
  // Show modal for voting
  function showModal() {
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.innerHTML = `
      <div class="modal-content glass">
        <h3><i class="fas fa-vote-yea"></i> Vote for Your Favorite Player</h3>
        <div class="players-list">
          <div class="player-option">
            <input type="radio" id="player1" name="fav-player" value="Yashasvi Jaiswal">
            <label for="player1">Yashasvi Jaiswal (RR)</label>
          </div>
          <div class="player-option">
            <input type="radio" id="player2" name="fav-player" value="Dewald Brevis">
            <label for="player2">Dewald Brevis (MI)</label>
          </div>
          <div class="player-option">
            <input type="radio" id="player3" name="fav-player" value="Ayush Badoni">
            <label for="player3">Ayush Badoni (LSG)</label>
          </div>
          <div class="player-option">
            <input type="radio" id="player4" name="fav-player" value="Tilak Varma">
            <label for="player4">Tilak Varma (MI)</label>
          </div>
          <div class="player-option">
            <input type="radio" id="player5" name="fav-player" value="Noor Ahmad">
            <label for="player5">Noor Ahmad (GT)</label>
          </div>
        </div>
        <div class="modal-actions">
          <button class="modal-btn cancel">Cancel</button>
          <button class="modal-btn submit">Submit Vote</button>
        </div>
      </div>
    `;
    
    document.body.appendChild(modal);
    
    // Show modal
    setTimeout(() => {
      modal.classList.add('show');
    }, 10);
    
    // Handle cancel button
    modal.querySelector('.cancel').addEventListener('click', () => {
      modal.classList.remove('show');
      setTimeout(() => {
        modal.remove();
      }, 300);
    });
    
    // Handle submit button
    modal.querySelector('.submit').addEventListener('click', () => {
      const selectedPlayer = document.querySelector('input[name="fav-player"]:checked');
      if (selectedPlayer) {
        showToast(`Voted for ${selectedPlayer.value}!`, 'success');
        modal.classList.remove('show');
        setTimeout(() => {
          modal.remove();
        }, 300);
      } else {
        showToast('Please select a player', 'error');
      }
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

// Modal styles (added via JavaScript to keep CSS clean)
const style = document.createElement('style');
style.textContent = `
.modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  opacity: 0;
  pointer-events: none;
  transition: opacity 0.3s ease;
}
.modal.show {
  opacity: 1;
  pointer-events: all;
}
.modal-content {
  width: 90%;
  max-width: 500px;
  padding: 2rem;
  transform: translateY(20px);
  transition: transform 0.3s ease;
}
.modal.show .modal-content {
  transform: translateY(0);
}
.modal h3 {
  margin-bottom: 1.5rem;
  display: flex;
  align-items: center;
  gap: 0.8rem;
}
.players-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin-bottom: 2rem;
}
.player-option {
  display: flex;
  align-items: center;
  gap: 0.8rem;
}
.player-option input {
  width: 18px;
  height: 18px;
}
.player-option label {
  cursor: pointer;
}
.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
}
.modal-btn {
  padding: 0.6rem 1.2rem;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.3s ease;
}
.modal-btn.cancel {
  background: transparent;
  border: 1px solid var(--text-light);
  color: var(--text-light);
}
.modal-btn.submit {
  background: var(--primary);
  color: white;
  border: none;
}
.modal-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 3px 10px rgba(0, 0, 0, 0.2);
}
.toast {
  position: fixed;
  bottom: 20px;
  right: 20px;
  padding: 1rem 1.5rem;
  background: var(--bg-light);
  border-left: 4px solid var(--primary);
  border-radius: 4px;
  display: flex;
  align-items: center;
  gap: 0.8rem;
  z-index: 1000;
  transform: translateX(150%);
  transition: transform 0.3s ease;
}
.toast.show {
  transform: translateX(0);
}
.toast i {
  font-size: 1.2rem;
}
.toast-success {
  border-left-color: #2ecc71;
}
.toast-error {
  border-left-color: #e74c3c;
}
.toast-info {
  border-left-color: #3498db;
}
`;
document.head.appendChild(style);
