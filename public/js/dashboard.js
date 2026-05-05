/* Admin Dashboard Script */
const API_URL = '/api';
let token = localStorage.getItem('adminToken');

// Redirect jika tidak ada token
if (!token) {
  window.location.href = '/admin';
}

// Verify token saat load
window.addEventListener('load', () => {
  verifyToken();
  loadPhotos();
  loadCategories();
});

// Verify token
async function verifyToken() {
  try {
    const response = await fetch(`${API_URL}/auth/verify`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    const result = await response.json();
    if (!result.valid) {
      localStorage.removeItem('adminToken');
      window.location.href = '/admin';
    }
  } catch (error) {
    console.error('Token verification error:', error);
  }
}

// Load photos
async function loadPhotos() {
  try {
    const response = await fetch(`${API_URL}/photos`);
    const result = await response.json();

    if (result.success) {
      displayPhotosTable(result.data);
    }
  } catch (error) {
    console.error('Error loading photos:', error);
  }
}

// Load categories
async function loadCategories() {
  try {
    const response = await fetch(`${API_URL}/categories`);
    const result = await response.json();

    if (result.success) {
      displayCategoriesTable(result.data);

      // Populate category dropdown
      const categorySelect = document.getElementById('categoryId');
      categorySelect.innerHTML = '<option value="">Pilih Kategori</option>';
      result.data.forEach(cat => {
        const option = document.createElement('option');
        option.value = cat.id;
        option.textContent = `${cat.icon} ${cat.name}`;
        categorySelect.appendChild(option);
      });
    }
  } catch (error) {
    console.error('Error loading categories:', error);
  }
}

// Display photos table
function displayPhotosTable(photos) {
  const tbody = document.querySelector('#photosTable tbody');
  tbody.innerHTML = '';

  if (photos.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="5" style="text-align: center; padding: 2rem; color: var(--text-tertiary);">
          Belum ada foto
        </td>
      </tr>
    `;
    return;
  }

  photos.forEach(photo => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>
        <img src="${photo.imageUrl}" alt="${photo.title}" style="width: 50px; height: 50px; border-radius: 0.5rem; object-fit: cover;">
      </td>
      <td>${photo.title}</td>
      <td>${photo.categoryName}</td>
      <td>
        <button class="action-btn edit" data-id="${photo.id}" onclick="editPhoto(${photo.id})">✏️ Edit</button>
        <button class="action-btn delete" data-id="${photo.id}" onclick="deletePhoto(${photo.id})">🗑️ Hapus</button>
      </td>
    `;
    tbody.appendChild(tr);
  });
}

// Display categories table
function displayCategoriesTable(categories) {
  const tbody = document.querySelector('#categoriesTable tbody');
  tbody.innerHTML = '';

  if (categories.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="4" style="text-align: center; padding: 2rem; color: var(--text-tertiary);">
          Belum ada kategori
        </td>
      </tr>
    `;
    return;
  }

  categories.forEach(cat => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${cat.icon}</td>
      <td>${cat.name}</td>
      <td>${cat.photoCount || 0} foto</td>
      <td>
        <button class="action-btn edit" onclick="editCategory(${cat.id})">✏️ Edit</button>
        <button class="action-btn delete" onclick="deleteCategory(${cat.id})">🗑️ Hapus</button>
      </td>
    `;
    tbody.appendChild(tr);
  });
}

// Add photo
document.getElementById('addPhotoForm').addEventListener('submit', async (e) => {
  e.preventDefault();

  const title = document.getElementById('photoTitle').value;
  const description = document.getElementById('photoDescription').value;
  const photoFile = document.getElementById('photoFile').files[0];
  const categoryId = document.getElementById('categoryId').value;

  if (!title || !photoFile || !categoryId) {
    alert('Semua field harus diisi');
    return;
  }

  const formData = new FormData();
  formData.append('title', title);
  formData.append('description', description);
  formData.append('image', photoFile);
  formData.append('categoryId', categoryId);

  try {
    const response = await fetch(`${API_URL}/photos`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
        // Note: Jangan set Content-Type untuk FormData, biar browser yang handle boundary nya
      },
      body: formData
    });

    const result = await response.json();

    if (result.success) {
      alert('Foto berhasil diunggah!');
      document.getElementById('addPhotoForm').reset();
      loadPhotos();
    } else {
      alert('Error: ' + result.message);
    }
  } catch (error) {
    alert('Error: ' + error.message);
  }
});

// Edit photo
async function editPhoto(id) {
  const title = prompt('Masukkan judul baru:');
  if (!title) return;

  try {
    const response = await fetch(`${API_URL}/photos/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ title })
    });

    const result = await response.json();

    if (result.success) {
      alert('Foto berhasil diperbarui');
      loadPhotos();
    } else {
      alert('Error: ' + result.message);
    }
  } catch (error) {
    alert('Error: ' + error.message);
  }
}

// Delete photo
async function deletePhoto(id) {
  if (!confirm('Yakin ingin menghapus foto ini?')) return;

  try {
    const response = await fetch(`${API_URL}/photos/${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    const result = await response.json();

    if (result.success) {
      alert('Foto berhasil dihapus');
      loadPhotos();
    } else {
      alert('Error: ' + result.message);
    }
  } catch (error) {
    alert('Error: ' + error.message);
  }
}

// Add category
document.getElementById('addCategoryForm').addEventListener('submit', async (e) => {
  e.preventDefault();

  const name = document.getElementById('categoryName').value;
  const icon = document.getElementById('categoryIcon').value || '📁';

  if (!name) {
    alert('Nama kategori harus diisi');
    return;
  }

  try {
    const response = await fetch(`${API_URL}/categories`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ name, icon })
    });

    const result = await response.json();

    if (result.success) {
      alert('Kategori berhasil ditambahkan');
      document.getElementById('addCategoryForm').reset();
      loadCategories();
      loadPhotos(); // Reload photos untuk update category list
    } else {
      alert('Error: ' + result.message);
    }
  } catch (error) {
    alert('Error: ' + error.message);
  }
});

// Edit category
async function editCategory(id) {
  const name = prompt('Masukkan nama kategori baru:');
  if (!name) return;

  try {
    const response = await fetch(`${API_URL}/categories/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ name })
    });

    const result = await response.json();

    if (result.success) {
      alert('Kategori berhasil diperbarui');
      loadCategories();
      loadPhotos();
    } else {
      alert('Error: ' + result.message);
    }
  } catch (error) {
    alert('Error: ' + error.message);
  }
}

// Delete category
async function deleteCategory(id) {
  if (!confirm('Yakin ingin menghapus kategori ini? Semua foto di kategori ini akan ikut terhapus.')) return;

  try {
    const response = await fetch(`${API_URL}/categories/${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    const result = await response.json();

    if (result.success) {
      alert('Kategori berhasil dihapus');
      loadCategories();
      loadPhotos();
    } else {
      alert('Error: ' + result.message);
    }
  } catch (error) {
    alert('Error: ' + error.message);
  }
}

// Tab switching
const tabBtns = document.querySelectorAll('.tab-btn');
tabBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    const tabName = btn.getAttribute('data-tab');

    // Remove active class dari semua tab
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
    document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));

    // Add active class ke tab yang diklik
    btn.classList.add('active');
    document.getElementById(`${tabName}-tab`).classList.add('active');
  });
});

// Logout
document.getElementById('logoutBtn').addEventListener('click', () => {
  if (confirm('Yakin ingin logout?')) {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminUser');
    window.location.href = '/admin';
  }
});

// Back to gallery
document.getElementById('backBtn').addEventListener('click', () => {
  window.location.href = '/';
});
