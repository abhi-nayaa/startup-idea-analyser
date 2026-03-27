const API_BASE_URL = 'http://localhost:5000/api';

window.checkAuth && window.checkAuth('user');

const token = localStorage.getItem('token');
const ideaId = localStorage.getItem('ideaId');
const logoutButton = document.getElementById('logout-button');

const showMessage = (message, type = 'error') => {
  const box = document.getElementById('swot-message');
  box.textContent = message;
  box.className = `message-box ${type}`;
};

const fetchSWOT = async () => {
  if (!ideaId) {
    throw new Error('No idea selected for SWOT analysis.');
  }

  const response = await fetch(`${API_BASE_URL}/ideas/${ideaId}/swot`, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'Failed to fetch SWOT analysis.');
  }

  return data;
};

const renderList = (id, items) => {
  const element = document.getElementById(id);
  element.innerHTML = items.map((item) => `<li>${item}</li>`).join('');
};

const renderSimilarStartups = (items) => {
  const container = document.getElementById('similar-startups');
  container.innerHTML = '';

  if (!items.length) {
    container.innerHTML = '<div class="empty-state">No similar startup ideas found.</div>';
    return;
  }

  items.forEach((startup, index) => {
    const div = document.createElement('div');
    div.className = `idea-card ${index === 0 ? 'top-match' : ''}`;
    div.innerHTML = `
      <h3>${startup.title}</h3>
      <p class="idea-text">${startup.description}</p>
      <p class="idea-meta">Similarity: ${startup.score}%</p>
      <div class="progress-track">
        <div class="progress-bar" style="width:${startup.score}%; background:${index === 0 ? '#1f6c58' : '#cd5c22'}"></div>
      </div>
    `;

    container.appendChild(div);
  });
};

const renderSaturation = (saturationLevel) => {
  const badge = document.getElementById('saturation-badge');
  badge.classList.remove('saturation-high', 'saturation-moderate', 'saturation-low');

  if (saturationLevel === 'High Competition') {
    badge.textContent = 'High Competition';
    badge.classList.add('saturation-high');
    return;
  }

  if (saturationLevel === 'Moderate Competition') {
    badge.textContent = 'Moderate Competition';
    badge.classList.add('saturation-moderate');
    return;
  }

  badge.textContent = 'Low Competition';
  badge.classList.add('saturation-low');
};

const renderSWOTPage = ({ idea, similarStartups, saturationLevel, smartFeedback, swot }) => {
  document.getElementById('swot-idea-title').textContent = idea.title;
  document.getElementById('swot-idea-description').textContent = idea.description;
  document.getElementById('smart-feedback').textContent = smartFeedback || '';

  renderSimilarStartups(similarStartups);
  renderSaturation(saturationLevel || 'Low Competition');
  renderList('swot-strengths', swot.strengths);
  renderList('swot-weaknesses', swot.weaknesses);
  renderList('swot-opportunities', swot.opportunities);
  renderList('swot-threats', swot.threats);
};

fetchSWOT()
  .then(renderSWOTPage)
  .catch((error) => showMessage(error.message));

logoutButton.addEventListener('click', () => window.logout && window.logout());
