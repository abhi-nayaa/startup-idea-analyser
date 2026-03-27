const API_BASE_URL = 'http://localhost:5000/api';

window.checkAuth && window.checkAuth('user');

const token = localStorage.getItem('token');
const logoutButton = document.getElementById('logout-button');
const ideasList = document.getElementById('ideas-list');
const detailsCard = document.getElementById('idea-details-card');

const showMessage = (id, message, type = 'error') => {
  const box = document.getElementById(id);
  if (!box) {
    return;
  }

  box.textContent = message;
  box.className = `message-box ${type}`;
};

const bestSuggestedIdea = (idea) =>
  `${idea.title} refined around stronger value messaging, a sharper target user, and a clearer path to traction.`;

const fetchUserIdeas = async () => {
  const response = await fetch(`${API_BASE_URL}/ideas`, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'Failed to fetch ideas.');
  }

  return data;
};

const renderIdeas = (ideas) => {
  if (!ideasList) {
    return;
  }

  if (!ideas.length) {
    ideasList.innerHTML = '<div class="empty-state">No ideas found yet.</div>';
    return;
  }

  ideasList.innerHTML = ideas
    .map(
      (idea) => `
        <article class="idea-card">
          <h3>${idea.title}</h3>
          <p class="idea-text">${idea.description.slice(0, 140)}${idea.description.length > 140 ? '...' : ''}</p>
          <a class="button-link" href="./idea-details.html?id=${idea._id}">View Details</a>
        </article>
      `
    )
    .join('');
};

const showIdeaDetails = async () => {
  if (!detailsCard) {
    return;
  }

  try {
    const ideaId = new URLSearchParams(window.location.search).get('id');
    const ideas = await fetchUserIdeas();
    const idea = ideas.find((item) => item._id === ideaId);

    if (!idea) {
      showMessage('details-message', 'Idea not found.');
      return;
    }

    detailsCard.innerHTML = `
      <h2>${idea.title}</h2>
      <p class="idea-text">${idea.description}</p>
      <div class="analysis-box">
        <p><strong>Matched idea:</strong> ${idea.analysisResult?.matchedIdea || 'No close match found'}</p>
        <p><strong>Similarity score:</strong> ${idea.analysisResult?.score ?? 0}%</p>
        <p><strong>Suggestion:</strong> ${idea.analysisResult?.suggestion || 'No suggestion available.'}</p>
      </div>
      <div class="best-idea-box">
        <p><strong>Best suggested idea:</strong></p>
        <p>${bestSuggestedIdea(idea)}</p>
      </div>
    `;
  } catch (error) {
    showMessage('details-message', error.message);
  }
};

if (logoutButton) {
  logoutButton.addEventListener('click', () => window.logout && window.logout());
}

if (ideasList) {
  fetchUserIdeas()
    .then(renderIdeas)
    .catch((error) => showMessage('ideas-message', error.message));
}

if (detailsCard) {
  showIdeaDetails();
}
