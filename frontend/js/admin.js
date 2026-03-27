const API_BASE_URL = 'http://localhost:5000/api';

window.checkAuth && window.checkAuth('admin');

const token = localStorage.getItem('token');
const user = JSON.parse(localStorage.getItem('user') || 'null');
const welcomeTitle = document.getElementById('admin-welcome-title');
const messageBox = document.getElementById('admin-message');
const adminIdeaForm = document.getElementById('admin-idea-form');
const adminIdeasList = document.getElementById('admin-ideas-list');
const allUserIdeasList = document.getElementById('all-user-ideas-list');
const rerunAnalysisButton = document.getElementById('rerun-analysis-button');
const logoutButton = document.getElementById('admin-logout-button');

const showMessage = (message, type = 'error') => {
  messageBox.textContent = message;
  messageBox.className = `message-box ${type}`;
};

const request = async (path, options = {}) => {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
      ...(options.headers || {})
    }
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'Request failed.');
  }

  return data;
};

const addAdminIdea = async (title, description, keywords) =>
  request('/admin/ideas', {
    method: 'POST',
    body: JSON.stringify({ title, description, keywords })
  });

const fetchAllUserIdeas = async () => request('/admin/user-ideas');
const fetchAdminIdeas = async () => request('/admin/ideas');

const renderAdminIdeas = (ideas) => {
  if (!ideas.length) {
    adminIdeasList.innerHTML = '<div class="empty-state">No admin ideas added yet.</div>';
    return;
  }

  adminIdeasList.innerHTML = ideas
    .map(
      (idea) => `
        <article class="idea-card">
          <h3>${idea.title}</h3>
          <p class="idea-text">${idea.description}</p>
          <p class="idea-meta"><strong>Keywords:</strong> ${idea.keywords?.join(', ') || 'None'}</p>
        </article>
      `
    )
    .join('');
};

const renderAllIdeas = (ideas) => {
  if (!ideas.length) {
    allUserIdeasList.innerHTML = '<div class="empty-state">No user ideas found yet.</div>';
    return;
  }

  allUserIdeasList.innerHTML = ideas
    .map(
      (idea) => `
        <article class="idea-card">
          <h3>${idea.title}</h3>
          <p class="idea-meta"><strong>User:</strong> ${idea.userId?.name || 'Unknown'} (${idea.userId?.email || 'n/a'})</p>
          <p class="idea-text">${idea.description}</p>
          <div class="analysis-box">
            <p><strong>Matched idea:</strong> ${idea.analysisResult?.matchedIdea || 'No close match found'}</p>
            <p><strong>Similarity score:</strong> ${idea.analysisResult?.score ?? 0}%</p>
            <p><strong>Suggestion:</strong> ${idea.analysisResult?.suggestion || 'No suggestion available.'}</p>
          </div>
        </article>
      `
    )
    .join('');
};

const loadAdminData = async () => {
  try {
    const [adminIdeas, userIdeas] = await Promise.all([fetchAdminIdeas(), fetchAllUserIdeas()]);
    if (user) {
      welcomeTitle.textContent = `Welcome, ${user.name}`;
    }
    renderAdminIdeas(adminIdeas);
    renderAllIdeas(userIdeas);
  } catch (error) {
    showMessage(error.message);
  }
};

adminIdeaForm.addEventListener('submit', async (event) => {
  event.preventDefault();

  try {
    const keywords = document
      .getElementById('admin-idea-keywords')
      .value.split(',')
      .map((keyword) => keyword.trim())
      .filter(Boolean);

    const data = await addAdminIdea(
      document.getElementById('admin-idea-title').value.trim(),
      document.getElementById('admin-idea-description').value.trim(),
      keywords
    );

    showMessage(data.message || 'Admin idea saved.', 'success');
    adminIdeaForm.reset();
    await loadAdminData();
  } catch (error) {
    showMessage(error.message);
  }
});

rerunAnalysisButton.addEventListener('click', async () => {
  try {
    const data = await request('/admin/analyse', {
      method: 'POST',
      body: JSON.stringify({})
    });

    showMessage(`${data.message} Updated ${data.updatedCount} idea(s).`, 'success');
    await loadAdminData();
  } catch (error) {
    showMessage(error.message);
  }
});

logoutButton.addEventListener('click', () => window.logout && window.logout());

loadAdminData();
