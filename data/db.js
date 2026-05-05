const fs = require('fs');
const path = require('path');

const dbPath = path.join(__dirname, 'db.json');

// Inisialisasi database jika belum ada
const initializeDB = () => {
  if (!fs.existsSync(dbPath)) {
    const initialData = {
      categories: [
        { id: 1, name: 'Nature', icon: '🌿' },
        { id: 2, name: 'Friends', icon: '👥' },
        { id: 3, name: 'Travel', icon: '✈️' }
      ],
      photos: [
        {
          id: 1,
          title: 'Beautiful Sunset',
          description: 'A stunning sunset over the mountains',
          driveId: '1example_id_1',
          imageUrl: 'https://drive.google.com/uc?export=view&id=1example_id_1',
          categoryId: 1,
          createdAt: new Date().toISOString()
        }
      ]
    };
    fs.writeFileSync(dbPath, JSON.stringify(initialData, null, 2));
  }
};

// Baca database
const readDB = () => {
  initializeDB();
  const data = fs.readFileSync(dbPath, 'utf-8');
  return JSON.parse(data);
};

// Tulis database
const writeDB = (data) => {
  fs.writeFileSync(dbPath, JSON.stringify(data, null, 2));
};

// Get all photos
const getPhotos = () => {
  const db = readDB();
  return db.photos;
};

// Get photo by ID
const getPhotoById = (id) => {
  const db = readDB();
  return db.photos.find(photo => photo.id === parseInt(id));
};

// Add photo
const addPhoto = (photo) => {
  const db = readDB();
  const newPhoto = {
    id: Math.max(...db.photos.map(p => p.id), 0) + 1,
    ...photo,
    createdAt: new Date().toISOString()
  };
  db.photos.push(newPhoto);
  writeDB(db);
  return newPhoto;
};

// Update photo
const updatePhoto = (id, updates) => {
  const db = readDB();
  const photoIndex = db.photos.findIndex(photo => photo.id === parseInt(id));
  if (photoIndex !== -1) {
    db.photos[photoIndex] = { ...db.photos[photoIndex], ...updates };
    writeDB(db);
    return db.photos[photoIndex];
  }
  return null;
};

// Delete photo
const deletePhoto = (id) => {
  const db = readDB();
  const photoIndex = db.photos.findIndex(photo => photo.id === parseInt(id));
  if (photoIndex !== -1) {
    db.photos.splice(photoIndex, 1);
    writeDB(db);
    return true;
  }
  return false;
};

// Get all categories
const getCategories = () => {
  const db = readDB();
  return db.categories;
};

// Get category by ID
const getCategoryById = (id) => {
  const db = readDB();
  return db.categories.find(cat => cat.id === parseInt(id));
};

// Add category
const addCategory = (category) => {
  const db = readDB();
  const newCategory = {
    id: Math.max(...db.categories.map(c => c.id), 0) + 1,
    ...category
  };
  db.categories.push(newCategory);
  writeDB(db);
  return newCategory;
};

// Update category
const updateCategory = (id, updates) => {
  const db = readDB();
  const catIndex = db.categories.findIndex(cat => cat.id === parseInt(id));
  if (catIndex !== -1) {
    db.categories[catIndex] = { ...db.categories[catIndex], ...updates };
    writeDB(db);
    return db.categories[catIndex];
  }
  return null;
};

// Delete category
const deleteCategory = (id) => {
  const db = readDB();
  const catIndex = db.categories.findIndex(cat => cat.id === parseInt(id));
  if (catIndex !== -1) {
    db.categories.splice(catIndex, 1);
    // Hapus semua foto di kategori ini
    db.photos = db.photos.filter(photo => photo.categoryId !== parseInt(id));
    writeDB(db);
    return true;
  }
  return false;
};

module.exports = {
  getPhotos,
  getPhotoById,
  addPhoto,
  updatePhoto,
  deletePhoto,
  getCategories,
  getCategoryById,
  addCategory,
  updateCategory,
  deleteCategory
};
