/* Gallery Script */
const API_URL = '/api';

// Fetch semua foto
async function loadPhotos() {
  try {
    const response = await fetch(`${API_URL}/photos`);
    const result = await response.json();

    if (result.success) {
      displayPhotos(result.data);
      displayCategories(result.data);
    }
  } catch (error) {
    console.error('Error loading photos:', error);
  }
}

// Load categories untuk filter
async function loadCategories() {
  try {
    const response = await fetch(`${API_URL}/categories`);
    const result = await response.json();

    if (result.success) {
      const filterSection = document.querySelector('.filter-section');
      filterSection.innerHTML = `<button class="filter-btn active" data-category="all">Semua</button>`;

      result.data.forEach(category => {
        const btn = document.createElement('button');
        btn.className = 'filter-btn';
        btn.setAttribute('data-category', category.id);
        btn.textContent = `${category.icon} ${category.name}`;
        btn.addEventListener('click', () => filterPhotos(category.id, btn));
        filterSection.appendChild(btn);
      });
    }
  } catch (error) {
    console.error('Error loading categories:', error);
  }
}

// Display photos di gallery
function displayPhotos(photos) {
  const gallery = document.querySelector('.gallery');
  gallery.innerHTML = '';

  if (!photos || photos.length === 0) {
    gallery.innerHTML = `
      <div class="empty-state" style="grid-column: 1/-1;">
        <div style="font-size: 3rem;">📷</div>
        <h3>Belum ada foto</h3>
        <p>Silakan tambahkan foto dari admin panel</p>
      </div>
    `;
    return;
  }

  photos.forEach(photo => {
    const item = document.createElement('div');
    const imageUrl = photo.imageUrl || photo.image_url || '';
    const categoryName = photo.categoryName || photo.category_name || 'Uncategorized';
    
    item.className = 'gallery-item';
    item.innerHTML = `
      <img src="${imageUrl}" alt="${photo.title}" loading="lazy" onerror="console.error('Gallery image load fail:', '${imageUrl}')">
      <div class="gallery-info">
        <h3 class="gallery-title">${photo.title}</h3>
        <span class="gallery-category">${categoryName}</span>
      </div>
    `;
    item.addEventListener('click', () => openModal(photo));
    gallery.appendChild(item);
  });
}

// Display categories
function displayCategories(photos) {
  const categories = new Set(photos.map(p => p.categoryId || p.category_id));
  console.log('Categories loaded');
}

// Filter photos
function filterPhotos(categoryId, btn) {
  document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');

  fetch(`${API_URL}/photos`)
    .then(res => res.json())
    .then(result => {
      if (result.success) {
        const filtered =
          categoryId === 'all'
            ? result.data
            : result.data.filter(photo => (photo.categoryId || photo.category_id) === categoryId);
        displayPhotos(filtered);
      }
    })
    .catch(error => console.error('Error filtering:', error));
}

// Open modal
function openModal(photo) {
  const modal = document.getElementById('photoModal');
  const imageUrl = photo.imageUrl || photo.image_url || '';
  const categoryName = photo.categoryName || photo.category_name || 'Uncategorized';
  
  document.getElementById('modalImage').src = imageUrl;
  document.getElementById('modalTitle').textContent = photo.title || 'Tanpa Judul';
  document.getElementById('modalDescription').textContent = photo.description || 'Tidak ada deskripsi';
  document.getElementById('modalCategory').textContent = categoryName;
  modal.classList.add('active');
}

// Close modal
function closeModal() {
  document.getElementById('photoModal').classList.remove('active');
}

// Event listeners
document.getElementById('modalClose').addEventListener('click', closeModal);
document.getElementById('photoModal').addEventListener('click', (e) => {
  if (e.target.id === 'photoModal') closeModal();
});

// Keyboard navigation
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') closeModal();
});

// Admin button
document.querySelector('.admin-btn').addEventListener('click', () => {
  window.location.href = '/admin';
});

// Load on page load
document.addEventListener('DOMContentLoaded', () => {
  loadPhotos();
  loadCategories();
});
