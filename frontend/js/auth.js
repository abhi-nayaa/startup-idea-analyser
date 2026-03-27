const API_BASE_URL = 'http://localhost:5000/api';

const messageBox = document.getElementById('message-box');
const loginForm = document.getElementById('login-form');
const registerForm = document.getElementById('register-form');

const showFieldError = (fieldId, message) => {
  const errorBox = document.getElementById(`${fieldId}-error`);
  if (!errorBox) {
    return;
  }

  errorBox.textContent = message;
  errorBox.classList.toggle('hidden', !message);
};

const clearFieldErrors = (fieldIds) => {
  fieldIds.forEach((fieldId) => showFieldError(fieldId, ''));
};

const showMessage = (message, type = 'error') => {
  if (!messageBox) {
    return;
  }

  messageBox.textContent = message;
  messageBox.className = `message-box ${type}`;
};

const storeSession = (data) => {
  localStorage.setItem('token', data.token);
  localStorage.setItem('role', data.user.role);
  localStorage.setItem('user', JSON.stringify(data.user));
};

const redirectUser = (role) => {
  window.location.href = role === 'admin' ? './admin-dashboard.html' : './dashboard.html';
};

const login = async (email, password) => {
  const response = await fetch(`${API_BASE_URL}/auth/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ email, password })
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'Login failed.');
  }

  return data;
};

const register = async (name, email, password) => {
  const response = await fetch(`${API_BASE_URL}/auth/register`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ name, email, password })
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'Registration failed.');
  }

  return data;
};

const validateLoginForm = () => {
  const email = document.getElementById('login-email').value.trim();
  const password = document.getElementById('login-password').value.trim();

  clearFieldErrors(['login-email', 'login-password']);

  let isValid = true;

  if (!email) {
    showFieldError('login-email', 'Email is required.');
    isValid = false;
  }

  if (!password) {
    showFieldError('login-password', 'Password is required.');
    isValid = false;
  }

  return isValid;
};

const validateRegisterForm = () => {
  const name = document.getElementById('register-name').value.trim();
  const email = document.getElementById('register-email').value.trim();
  const password = document.getElementById('register-password').value.trim();
  const confirmPassword = document.getElementById('register-confirm-password').value.trim();
  const phone = document.getElementById('register-phone').value.trim();
  const role = document.getElementById('register-role').value;

  clearFieldErrors([
    'register-name',
    'register-email',
    'register-password',
    'register-confirm-password',
    'register-phone',
    'register-role'
  ]);

  let isValid = true;

  if (!name) {
    showFieldError('register-name', 'Full name is required.');
    isValid = false;
  }

  if (!email) {
    showFieldError('register-email', 'Email is required.');
    isValid = false;
  }

  if (!password) {
    showFieldError('register-password', 'Password is required.');
    isValid = false;
  }

  if (!confirmPassword) {
    showFieldError('register-confirm-password', 'Please confirm your password.');
    isValid = false;
  } else if (password !== confirmPassword) {
    showFieldError('register-confirm-password', 'Passwords do not match.');
    isValid = false;
  }

  if (!phone) {
    showFieldError('register-phone', 'Phone number is required.');
    isValid = false;
  }

  if (!role) {
    showFieldError('register-role', 'Please choose a role.');
    isValid = false;
  }

  return isValid;
};

const initPasswordToggles = () => {
  document.querySelectorAll('.toggle-password').forEach((button) => {
    button.addEventListener('click', () => {
      const targetId = button.dataset.target;
      const input = document.getElementById(targetId);
      if (!input) {
        return;
      }

      input.type = input.type === 'password' ? 'text' : 'password';
      button.setAttribute(
        'aria-label',
        input.type === 'password' ? 'Show password' : 'Hide password'
      );
    });
  });
};

if (loginForm) {
  loginForm.addEventListener('submit', async (event) => {
    event.preventDefault();

    if (!validateLoginForm()) {
      return;
    }

    try {
      const data = await login(
        document.getElementById('login-email').value.trim(),
        document.getElementById('login-password').value.trim()
      );

      storeSession(data);
      showMessage('Login successful.', 'success');
      setTimeout(() => redirectUser(data.user.role), 500);
    } catch (error) {
      showMessage(error.message);
    }
  });
}

if (registerForm) {
  registerForm.addEventListener('submit', async (event) => {
    event.preventDefault();

    if (!validateRegisterForm()) {
      return;
    }

    try {
      const data = await register(
        document.getElementById('register-name').value.trim(),
        document.getElementById('register-email').value.trim(),
        document.getElementById('register-password').value.trim()
      );

      storeSession(data);
      showMessage('Registration successful.', 'success');
      setTimeout(() => redirectUser(data.user.role), 500);
    } catch (error) {
      showMessage(error.message);
    }
  });
}

const storedRole = localStorage.getItem('role');
const storedToken = localStorage.getItem('token');
if (storedRole && storedToken) {
  redirectUser(storedRole);
}

initPasswordToggles();
