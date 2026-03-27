window.logout = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('role');
  localStorage.removeItem('user');
  window.location.href = './index.html';
};

window.checkAuth = (requiredRole) => {
  const token = localStorage.getItem('token');
  const role = localStorage.getItem('role');

  if (!token || !role) {
    window.location.href = './login.html';
    return false;
  }

  if (requiredRole && role !== requiredRole) {
    window.location.href = role === 'admin' ? './admin-dashboard.html' : './dashboard.html';
    return false;
  }

  return true;
};

window.initRevealAnimations = () => {
  const sections = document.querySelectorAll('.reveal-section');

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
        }
      });
    },
    {
      threshold: 0.2
    }
  );

  sections.forEach((section) => observer.observe(section));
};
