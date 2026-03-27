const API_BASE_URL = 'http://localhost:5000/api';

window.checkAuth && window.checkAuth('user');

const token = localStorage.getItem('token');
const user = JSON.parse(localStorage.getItem('user') || 'null');
const welcomeTitle = document.getElementById('welcome-title');
const messageBox = document.getElementById('dashboard-message');
const ideaForm = document.getElementById('idea-form');
const analysisResult = document.getElementById('analysis-result');
const logoutButton = document.getElementById('logout-button');

const showMessage = (message, type = 'error') => {
  messageBox.textContent = message;
  messageBox.className = `message-box ${type}`;
};

const buildBestImprovedIdea = (idea) =>
  `Improved direction: ${idea.title} focused more clearly on customer pain, distinct value, and execution detail.`;

const displayAnalysisResult = (idea) => {
  analysisResult.innerHTML = `
    <div class="analysis-box">
      <p><strong>Matched idea:</strong> ${idea.analysisResult?.matchedIdea || 'No close match found'}</p>
      <p><strong>Similarity score:</strong> ${idea.analysisResult?.similarityScore ?? 0}%</p>
      <p><strong>Idea evaluation score:</strong> ${idea.analysisResult?.totalScore ?? 0}/100</p>
      <p><strong>Success probability:</strong> ${idea.analysisResult?.successProbability ?? 0}%</p>
      <p><strong>Suggestion:</strong> ${idea.analysisResult?.suggestion || 'No suggestion available.'}</p>
    </div>
    <div class="best-idea-box">
      <p><strong>Best improved idea:</strong></p>
      <p>${buildBestImprovedIdea(idea)}</p>
    </div>
  `;
};

const submitIdea = async (title, description) => {
  const response = await fetch(`${API_BASE_URL}/ideas`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify({ title, description })
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'Failed to submit idea.');
  }

  return data.idea;
};

if (user) {
  welcomeTitle.textContent = `Welcome, ${user.name}`;
}

ideaForm.addEventListener('submit', async (event) => {
  event.preventDefault();

  try {
    const title = document.getElementById('idea-title').value.trim();
    const description = document.getElementById('idea-description').value.trim();

    if (description.length < 50) {
      showMessage('Please describe your idea in at least 50 characters for better analysis.');
      return;
    }

    const createdIdea = await submitIdea(
      title,
      description
    );

    localStorage.setItem('ideaId', createdIdea._id);
    showMessage('Idea submitted successfully.', 'success');
    displayAnalysisResult(createdIdea);
    ideaForm.reset();
    setTimeout(() => {
      window.location.href = './analysis.html';
    }, 500);
  } catch (error) {
    showMessage(error.message);
  }
});

logoutButton.addEventListener('click', () => window.logout && window.logout());
