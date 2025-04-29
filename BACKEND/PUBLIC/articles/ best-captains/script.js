

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
  
  // Animate sections on scroll
  const ruleSections = document.querySelectorAll('.rule-section');
  
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('slide-in');
      }
    });
  }, { threshold: 0.1 });
  
  ruleSections.forEach(section => {
    observer.observe(section);
  });
  
  // Poll functionality
  const pollBtns = document.querySelectorAll('.poll-btn');
  
  pollBtns.forEach(btn => {
    btn.addEventListener('click', function() {
      // Remove active class from all buttons
      pollBtns.forEach(b => b.classList.remove('active'));
      
      // Add active class to clicked button
      this.classList.add('active');
      
      // Show thank you message
      showToast('Thanks for your vote!', 'success');
    });
  });
  
  // Comment submission
  const commentBtn = document.querySelector('.submit-comment');
  
  if (commentBtn) {
    commentBtn.addEventListener('click', function() {
      const commentText = document.querySelector('.comments textarea').value;
      
      if (commentText.trim() === '') {
        showToast('Please enter your comment', 'error');
        return;
      }
      
      // In a real app, you would send this to a server
      console.log('Comment submitted:', commentText);
      
      // Show success message
      showToast('Comment submitted successfully!', 'success');
      
      // Clear textarea
      document.querySelector('.comments textarea').value = '';
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
  
  // Add animation to header on load
  const ruleHeader = document.querySelector('.rule-header');
  if (ruleHeader) {
    setTimeout(() => {
      ruleHeader.style.transform = 'translateY(0)';
      ruleHeader.style.opacity = '1';
    }, 100);
  }
});

