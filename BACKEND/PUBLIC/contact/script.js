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
  
  // Form Submission
  const contactForm = document.getElementById('contact-form');
  
  if (contactForm) {
    contactForm.addEventListener('submit', async function(e) {
      e.preventDefault();
      
      const submitBtn = this.querySelector('.submit-btn');
      const originalBtnText = submitBtn.innerHTML;
      
      // Show loading state
      submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sending...';
      submitBtn.disabled = true;
      
      // Simulate API call
      try {
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        // Show success message
        showToast('Message sent successfully! We will contact you soon.', 'success');
        
        // Reset form
        this.reset();
      } catch (error) {
        showToast('Failed to send message. Please try again.', 'error');
      } finally {
        // Reset button state
        submitBtn.innerHTML = originalBtnText;
        submitBtn.disabled = false;
      }
    });
  }
  
  // Floating labels functionality
  const floatingInputs = document.querySelectorAll('.floating input, .floating textarea');
  
  floatingInputs.forEach(input => {
    // Check if input has value on page load
    if (input.value) {
      input.parentNode.querySelector('label').classList.add('active');
    }
    
    input.addEventListener('focus', function() {
      this.parentNode.querySelector('label').classList.add('active');
    });
    
    input.addEventListener('blur', function() {
      if (!this.value) {
        this.parentNode.querySelector('label').classList.remove('active');
      }
    });
  });
  
  // Show toast notification
  function showToast(message, type) {
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.innerHTML = `
      <i class="fas ${type === 'success' ? 'fa-check-circle' : 'fa-exclamation-circle'}"></i>
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
  
  // Add animation to contact card on load
  const contactCard = document.querySelector('.contact-card');
  if (contactCard) {
    setTimeout(() => {
      contactCard.style.transform = 'translateY(0)';
      contactCard.style.opacity = '1';
    }, 100);
  }
});