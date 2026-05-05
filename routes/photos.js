const express = require('express');
const db = require('../data/supabase-db');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// GET semua foto (public)
router.get('/', async (req, res) => {
  try {
    const photos = await db.getPhotos();
    const categories = await db.getCategories();

    // Gabungkan dengan nama kategori
    const photosWithCategory = photos.map(photo => {
      const category = categories.find(cat => cat.id === photo.categoryId);
      return {
        ...photo,
        categoryName: category?.name || 'Uncategorized'
      };
    });

    res.status(200).json({
      success: true,
      data: photosWithCategory
    });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET foto by ID (public)
router.get('/:id', async (req, res) => {
  try {
    const photo = await db.getPhotoById(parseInt(req.params.id));
    if (!photo) {
      return res.status(404).json({ success: false, message: 'Foto tidak ditemukan' });
    }
    res.status(200).json({ success: true, data: photo });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// POST tambah foto (admin only)
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { title, description, driveId, categoryId } = req.body;

    // Validasi input
    if (!title || !driveId || !categoryId) {
      return res.status(400).json({
        success: false,
        message: 'Title, driveId, dan categoryId diperlukan'
      });
    }

    // Validasi categoryId
    const category = await db.getCategoryById(parseInt(categoryId));
    if (!category) {
      return res.status(400).json({
        success: false,
        message: 'Kategori tidak ditemukan'
      });
    }

    // Buat image URL dari driveId
    const imageUrl = `https://drive.google.com/uc?export=view&id=${driveId}`;

    const newPhoto = await db.addPhoto({
      title,
      description: description || '',
      driveId,
      imageUrl,
      categoryId: parseInt(categoryId)
    });

    res.status(201).json({
      success: true,
      message: 'Foto berhasil ditambahkan',
      data: newPhoto
    });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// PUT update foto (admin only)
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const { title, description, driveId, categoryId } = req.body;

    const photo = await db.getPhotoById(parseInt(req.params.id));
    if (!photo) {
      return res.status(404).json({ success: false, message: 'Foto tidak ditemukan' });
    }

    // Validasi categoryId jika diubah
    if (categoryId && categoryId !== photo.categoryId) {
      const category = await db.getCategoryById(parseInt(categoryId));
      if (!category) {
        return res.status(400).json({
          success: false,
          message: 'Kategori tidak ditemukan'
        });
      }
    }

    const updates = {};
    if (title) updates.title = title;
    if (description) updates.description = description;
    if (categoryId) updates.categoryId = parseInt(categoryId);
    if (driveId) {
      updates.driveId = driveId;
      updates.imageUrl = `https://drive.google.com/uc?export=view&id=${driveId}`;
    }

    const updatedPhoto = await db.updatePhoto(parseInt(req.params.id), updates);

    res.status(200).json({
      success: true,
      message: 'Foto berhasil diperbarui',
      data: updatedPhoto
    });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// DELETE foto (admin only)
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const photo = await db.getPhotoById(parseInt(req.params.id));
    if (!photo) {
      return res.status(404).json({ success: false, message: 'Foto tidak ditemukan' });
    }

    await db.deletePhoto(parseInt(req.params.id));

    res.status(200).json({
      success: true,
      message: 'Foto berhasil dihapus'
    });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
