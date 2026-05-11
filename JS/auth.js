// ===== AUTHENTICATION LOGIC =====

// Check if user is logged in
function checkAuth() {
  const currentUser = localStorage.getItem('currentUser');
  
  // If on login page, don't redirect
  if (window.location.pathname.includes('login.html') || window.location.pathname === '/' || window.location.pathname.endsWith('/')) {
    return;
  }
  
  // If not logged in, redirect to login
  if (!currentUser) {
    window.location.href = 'login.html';
  }
}

// Run auth check when page loads
document.addEventListener('DOMContentLoaded', checkAuth);

// Handle login form submission
const loginForm = document.getElementById('login-form');
if (loginForm) {
  loginForm.addEventListener('submit', function(e) {
    e.preventDefault();
    
    const userId = document.getElementById('userId').value.trim();
    const password = document.getElementById('password').value.trim();
    const errorEl = document.getElementById('login-error');
    
    // Predefined credentials
    const VALID_USER_ID = 'RAMU123';
    const VALID_PASSWORD = '2026';
    
    // Check credentials
    if (userId === VALID_USER_ID && password === VALID_PASSWORD) {
      // Store user in localStorage
      localStorage.setItem('currentUser', userId);
      localStorage.setItem('loginTime', new Date().toISOString());
      
      // Redirect to dashboard
      window.location.href = 'dashboard.html';
    } else {
      errorEl.textContent = 'Invalid User ID or Password. Use RAMU123 / 2026';
      // Clear password field for security
      document.getElementById('password').value = '';
    }
  });
}

// Logout function
function logout() {
  localStorage.removeItem('currentUser');
  localStorage.removeItem('loginTime');
  window.location.href = 'login.html';
}

// Set active nav link
function setActiveNav() {
  const currentPage = window.location.pathname.split('/').pop() || 'dashboard.html';
  const navLinks = document.querySelectorAll('.sidebar-nav .nav-link');
  
  navLinks.forEach(link => {
    link.classList.remove('active');
    if (link.getAttribute('href') === currentPage) {
      link.classList.add('active');
    }
  });
}

function setupMobileMenu() {
  const toggleBtn = document.getElementById('mobile-menu-toggle');
  const sidebar = document.getElementById('sidebar');
  const overlay = document.getElementById('mobile-overlay');

  if (!toggleBtn || !sidebar || !overlay) {
    return;
  }

  const closeMenu = () => {
    sidebar.classList.remove('open');
    toggleBtn.classList.remove('active');
    overlay.classList.remove('active');
  };

  toggleBtn.addEventListener('click', () => {
    const isOpen = sidebar.classList.toggle('open');
    toggleBtn.classList.toggle('active', isOpen);
    overlay.classList.toggle('active', isOpen);
  });

  overlay.addEventListener('click', closeMenu);

  const navLinks = document.querySelectorAll('.sidebar-nav .nav-link');
  navLinks.forEach(link => link.addEventListener('click', closeMenu));

  window.addEventListener('resize', () => {
    if (window.innerWidth > 480) {
      closeMenu();
    }
  });
}

// Initialize active nav and mobile menu when page loads
document.addEventListener('DOMContentLoaded', () => {
  setActiveNav();
  setupMobileMenu();
});
