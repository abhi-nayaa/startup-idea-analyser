const API_BASE_URL = 'http://localhost:5000/api';

window.checkAuth && window.checkAuth('user');

const token = localStorage.getItem('token');
const ideaId = localStorage.getItem('ideaId');
const logoutButton = document.getElementById('logout-button');
const viewSwotButton = document.getElementById('view-swot-button');

const showMessage = (message, type = 'error') => {
  const box = document.getElementById('analysis-message');
  box.textContent = message;
  box.className = `message-box ${type}`;
};

const getProgressColor = (score) => {
  if (score >= 18) {
    return '#1f6c58';
  }

  if (score >= 10) {
    return '#d39b2a';
  }

  return '#b33a3a';
};

const setScoreBar = (prefix, score, maxScore) => {
  const valueElement = document.getElementById(`${prefix}-score-value`);
  const barElement = document.getElementById(`${prefix}-score-bar`);
  const percentage = Math.max(0, Math.min(100, Math.round((score / maxScore) * 100)));

  valueElement.textContent = `${score}/${maxScore}`;
  barElement.style.width = `${percentage}%`;
  barElement.style.background = getProgressColor(score);
};

const buildBestImprovedIdea = (idea) =>
  `${idea.title} can be improved by clarifying customer demand, reducing execution risk, and strengthening its unique value proposition.`;

const fetchIdea = async () => {
  if (!ideaId) {
    throw new Error('No idea selected for analysis.');
  }

  const response = await fetch(`${API_BASE_URL}/ideas/${ideaId}`, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'Failed to fetch analysis data.');
  }

  return data;
};

const renderIdeaAnalysis = (idea) => {
  localStorage.setItem('ideaId', idea._id);
  document.getElementById('analysis-idea-title').textContent = idea.title;
  document.getElementById('analysis-idea-description').textContent = idea.description;

  setScoreBar('market', idea.analysisResult?.marketScore ?? 0, 25);
  setScoreBar('competition', idea.analysisResult?.competitionScore ?? 0, 25);
  setScoreBar('feasibility', idea.analysisResult?.feasibilityScore ?? 0, 25);
  setScoreBar('innovation', idea.analysisResult?.innovationScore ?? 0, 25);

  document.getElementById('total-score-value').textContent = `${idea.analysisResult?.totalScore ?? 0}/100`;
  document.getElementById('success-probability-value').textContent = `${idea.analysisResult?.successProbability ?? 0}%`;
  document.getElementById('matched-idea-value').textContent =
    idea.analysisResult?.matchedIdea || 'No reference idea available';
  document.getElementById('suggestion-value').textContent =
    `Similarity score: ${idea.analysisResult?.similarityScore ?? 0}% | ${
      idea.analysisResult?.suggestion || 'No suggestion available.'
    }`;
  document.getElementById('best-improved-idea-value').textContent = buildBestImprovedIdea(idea);
};

fetchIdea()
  .then(renderIdeaAnalysis)
  .catch((error) => showMessage(error.message));

logoutButton.addEventListener('click', () => window.logout && window.logout());
viewSwotButton.addEventListener('click', () => {
  window.location.href = './swot.html';
});
