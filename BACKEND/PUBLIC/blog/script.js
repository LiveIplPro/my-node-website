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

  // Sample blog data (replace with your actual articles)
  const blogArticles = [
    {
      id: 1,
      title: "The Evolution of Cricket Bats",
      excerpt: "What is the Impact Player Rule in IPL? Explained Simply.",
      image: "https://images.unsplash.com/photo-1455390582262-044cdead277a?q=80&w=1973&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
      date: "May 15, 2023",
      readTime: "5 min read",
      path: "article/best-captains/index.html"
    },
    {
      id: 2,
      title: "T20 Cricket: Changing the Game",
      excerpt: "Top 5 Young Talents to Watch Out for in IPL 2025.",
      image: "https://images.unsplash.com/photo-1455390582262-044cdead277a?q=80&w=1973&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
      date: "June 2, 2023",
      readTime: "7 min read",
      path: "article/young-talents/index.html"
    },
    // {
    //   id: 3,
    //   title: "Greatest Cricket Rivalries",
    //   excerpt: "A look at the most intense rivalries in cricket history that have defined the sport.",
    //   image: "https://images.unsplash.com/photo-1531415074968-036ba1b575da?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80",
    //   date: "June 18, 2023",
    //   readTime: "8 min read",
    //   path: "articles/article3/index.html"
    // },
    // {
    //   id: 4,
    //   title: "The Art of Spin Bowling",
    //   excerpt: "Mastering the techniques and variations that make spin bowling so effective in cricket.",
    //   image: "https://images.unsplash.com/photo-1517649763962-0c623066013b?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80",
    //   date: "July 5, 2023",
    //   readTime: "6 min read",
    //   path: "articles/article4/index.html"
    // },
    // {
    //   id: 5,
    //   title: "Cricket World Cup Moments",
    //   excerpt: "Relive the most unforgettable moments from Cricket World Cup history.",
    //   image: "https://images.unsplash.com/photo-1543351611-58f69d7c1781?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80",
    //   date: "July 22, 2023",
    //   readTime: "10 min read",
    //   path: "articles/article5/index.html"
    // },
    // {
    //   id: 6,
    //   title: "The Science of Swing Bowling",
    //   excerpt: "Understanding the physics behind swing bowling and how bowlers manipulate the ball.",
    //   image: "https://images.unsplash.com/photo-1543357486-c250b47a20ad?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80",
    //   date: "August 8, 2023",
    //   readTime: "7 min read",
    //   path: "articles/article6/index.html"
    // },
    // {
    //   id: 7,
    //   title: "Women's Cricket Revolution",
    //   excerpt: "How women's cricket has grown in popularity and skill level in recent years.",
    //   image: "https://images.unsplash.com/photo-1574629810360-7efbbe195018?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80",
    //   date: "August 25, 2023",
    //   readTime: "6 min read",
    //   path: "articles/article7/index.html"
    // },
    // {
    //   id: 8,
    //   title: "Cricket in the Olympics",
    //   excerpt: "The history and future prospects of cricket as an Olympic sport.",
    //   image: "https://images.unsplash.com/photo-1461896836934-ffe607ba8211?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80",
    //   date: "September 12, 2023",
    //   readTime: "5 min read",
    //   path: "articles/article8/index.html"
    // },
    // {
    //   id: 9,
    //   title: "The Mental Game of Cricket",
    //   excerpt: "How top players use psychology to gain an edge in high-pressure situations.",
    //   image: "https://images.unsplash.com/photo-1517649763962-0c623066013b?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80",
    //   date: "September 28, 2023",
    //   readTime: "8 min read",
    //   path: "articles/article9/index.html"
    // },
    // {
    //   id: 10,
    //   title: "Future of Cricket Technology",
    //   excerpt: "Emerging technologies that are changing how cricket is played and watched.",
    //   image: "https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80",
    //   date: "October 15, 2023",
    //   readTime: "7 min read",
    //   path: "articles/article10/index.html"
    // }
  ];

  // DOM Elements
  const blogGrid = document.getElementById('blogGrid');
  const searchInput = document.getElementById('searchInput');
  const searchBtn = document.getElementById('searchBtn');
  const pagination = document.getElementById('pagination');

  // Pagination variables
  let currentPage = 1;
  const articlesPerPage = 6;
  let filteredArticles = [...blogArticles];

  // Display articles
  function displayArticles(articles, page = 1) {
    blogGrid.innerHTML = '';
    const startIndex = (page - 1) * articlesPerPage;
    const endIndex = startIndex + articlesPerPage;
    const paginatedArticles = articles.slice(startIndex, endIndex);

    if (paginatedArticles.length === 0) {
      blogGrid.innerHTML = '<div class="no-results">No articles found matching your search.</div>';
      return;
    }

    paginatedArticles.forEach((article, index) => {
      const blogCard = document.createElement('div');
      blogCard.className = 'blog-card';
      blogCard.style.animationDelay = `${index * 0.1}s`;
      blogCard.innerHTML = `
        <div class="blog-image" style="background-image: url('${article.image}')"></div>
        <div class="blog-content">
          <h2>${article.title}</h2>
          <p>${article.excerpt}</p>
          <div class="blog-meta">
            <span><i class="far fa-calendar-alt"></i> ${article.date}</span>
            <span><i class="far fa-clock"></i> ${article.readTime}</span>
          </div>
          <a href="${article.path}" class="read-btn">Read Article</a>
        </div>
      `;
      blogGrid.appendChild(blogCard);

      // Add animation when card comes into view
      setTimeout(() => {
        blogCard.classList.add('visible');
      }, 50);
    });

    // Update pagination
    updatePagination(articles.length);
  }

  // Update pagination
  function updatePagination(totalArticles) {
    pagination.innerHTML = '';
    const totalPages = Math.ceil(totalArticles / articlesPerPage);

    if (totalPages <= 1) return;

    // Previous button
    if (currentPage > 1) {
      const prevBtn = document.createElement('button');
      prevBtn.className = 'page-btn';
      prevBtn.innerHTML = '<i class="fas fa-chevron-left"></i>';
      prevBtn.addEventListener('click', () => {
        currentPage--;
        displayArticles(filteredArticles, currentPage);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      });
      pagination.appendChild(prevBtn);
    }

    // Page numbers
    for (let i = 1; i <= totalPages; i++) {
      const pageBtn = document.createElement('button');
      pageBtn.className = `page-btn ${i === currentPage ? 'active' : ''}`;
      pageBtn.textContent = i;
      pageBtn.addEventListener('click', () => {
        currentPage = i;
        displayArticles(filteredArticles, currentPage);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      });
      pagination.appendChild(pageBtn);
    }

    // Next button
    if (currentPage < totalPages) {
      const nextBtn = document.createElement('button');
      nextBtn.className = 'page-btn';
      nextBtn.innerHTML = '<i class="fas fa-chevron-right"></i>';
      nextBtn.addEventListener('click', () => {
        currentPage++;
        displayArticles(filteredArticles, currentPage);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      });
      pagination.appendChild(nextBtn);
    }
  }

  // Search functionality
  function searchArticles() {
    const searchTerm = searchInput.value.toLowerCase();
    filteredArticles = blogArticles.filter(article => 
      article.title.toLowerCase().includes(searchTerm) || 
      article.excerpt.toLowerCase().includes(searchTerm)
    );
    currentPage = 1;
    displayArticles(filteredArticles);
  }

  // Event listeners
  searchBtn.addEventListener('click', searchArticles);
  searchInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') searchArticles();
  });

  // Initial display
  displayArticles(blogArticles);

  // Show toast notification when clicking read buttons
  document.addEventListener('click', function(e) {
    if (e.target.classList.contains('read-btn')) {
      e.preventDefault();
      showToast('Redirecting to article...', 'info');
      setTimeout(() => {
        window.location.href = e.target.getAttribute('href');
      }, 1000);
    }
  });

  // Toast notification function
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
