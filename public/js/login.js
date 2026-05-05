/* Admin Login Script */
const API_URL = '/api';

const loginForm = document.getElementById('loginForm');
const usernameInput = document.getElementById('username');
const passwordInput = document.getElementById('password');
const errorMsg = document.querySelector('.error-message');
const successMsg = document.querySelector('.success-message');
const loadingDiv = document.querySelector('.loading');

// Handle login
loginForm.addEventListener('submit', async (e) => {
  e.preventDefault();

  const username = usernameInput.value.trim();
  const password = passwordInput.value.trim();

  // Validasi
  if (!username || !password) {
    showError('Username dan password tidak boleh kosong');
    return;
  }

  // Show loading
  showLoading(true);
  errorMsg.classList.remove('show');
  successMsg.classList.remove('show');

  try {
    const response = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ username, password })
    });

    const result = await response.json();

    if (result.success) {
      // Simpan token
      localStorage.setItem('adminToken', result.token);
      localStorage.setItem('adminUser', JSON.stringify(result.user));

      showSuccess('Login berhasil! Mengarahkan ke dashboard...');
      setTimeout(() => {
        window.location.href = '/admin/dashboard';
      }, 1500);
    } else {
      showError(result.message || 'Login gagal');
    }
  } catch (error) {
    showError('Terjadi kesalahan: ' + error.message);
  } finally {
    showLoading(false);
  }
});

// Show error message
function showError(message) {
  errorMsg.textContent = '❌ ' + message;
  errorMsg.classList.add('show');
  setTimeout(() => {
    errorMsg.classList.remove('show');
  }, 5000);
}

// Show success message
function showSuccess(message) {
  successMsg.textContent = '✓ ' + message;
  successMsg.classList.add('show');
}

// Show loading
function showLoading(show) {
  if (show) {
    loadingDiv.classList.add('show');
  } else {
    loadingDiv.classList.remove('show');
  }
}

// Check jika sudah login
window.addEventListener('load', () => {
  const token = localStorage.getItem('adminToken');
  if (token) {
    // Verify token
    fetch(`${API_URL}/auth/verify`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
      .then(res => res.json())
      .then(result => {
        if (result.valid) {
          window.location.href = '/admin/dashboard';
        }
      })
      .catch(error => console.error('Error:', error));
  }
});
