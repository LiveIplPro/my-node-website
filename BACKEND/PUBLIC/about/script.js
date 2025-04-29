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
  
  // Animate about cards on scroll
  const aboutCards = document.querySelectorAll('.about-card');
  
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('slide-in');
      }
    });
  }, { threshold: 0.1 });
  
  aboutCards.forEach(card => {
    observer.observe(card);
  });
  
  // Animate stats counting
  const statValues = document.querySelectorAll('.stat-value');
  
  const statsObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const target = +entry.target.getAttribute('data-count');
        const count = +entry.target.innerText;
        const increment = target / 50;
        
        if (count < target) {
          entry.target.innerText = Math.ceil(count + increment);
          setTimeout(() => {
            statsObserver.observe(entry.target);
          }, 20);
        } else {
          entry.target.innerText = target;
        }
      }
    });
  }, { threshold: 0.5 });
  
  statValues.forEach(value => {
    statsObserver.observe(value);
  });
  
  // Smooth scroll for anchor links
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
      e.preventDefault();
      
      document.querySelector(this.getAttribute('href')).scrollIntoView({
        behavior: 'smooth'
      });
    });
  });
  
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
  
  // Example of using toast (can be triggered by various actions)
  document.querySelector('.cta-btn.primary').addEventListener('click', function(e) {
    e.preventDefault();
    showToast('Redirecting to registration page...', 'info');
    setTimeout(() => {
      window.location.href = '/register';
    }, 1000);
  });
});