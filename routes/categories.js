const express = require('express');
const db = require('../data/supabase-db');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// GET semua kategori (public)
router.get('/', async (req, res) => {
  try {
    const categories = await db.getCategories();
    const photos = await db.getPhotos();

    // Hitung jumlah foto per kategori
    const categoriesWithCount = categories.map(category => {
      const count = photos.filter(photo => photo.categoryId === category.id).length;
      return { ...category, photoCount: count };
    });

    res.status(200).json({
      success: true,
      data: categoriesWithCount
    });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET kategori by ID (public)
router.get('/:id', async (req, res) => {
  try {
    const category = await db.getCategoryById(parseInt(req.params.id));
    if (!category) {
      return res.status(404).json({ success: false, message: 'Kategori tidak ditemukan' });
    }

    const allPhotos = await db.getPhotos();
    const photos = allPhotos.filter(photo => photo.categoryId === parseInt(req.params.id));

    res.status(200).json({
      success: true,
      data: { ...category, photos }
    });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// POST tambah kategori (admin only)
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { name, icon } = req.body;

    if (!name) {
      return res.status(400).json({
        success: false,
        message: 'Nama kategori diperlukan'
      });
    }

    const newCategory = await db.addCategory({
      name,
      icon: icon || '📁'
    });

    res.status(201).json({
      success: true,
      message: 'Kategori berhasil ditambahkan',
      data: newCategory
    });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// PUT update kategori (admin only)
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const { name, icon } = req.body;

    const category = await db.getCategoryById(parseInt(req.params.id));
    if (!category) {
      return res.status(404).json({ success: false, message: 'Kategori tidak ditemukan' });
    }

    const updates = {};
    if (name) updates.name = name;
    if (icon) updates.icon = icon;

    const updatedCategory = await db.updateCategory(parseInt(req.params.id), updates);

    res.status(200).json({
      success: true,
      message: 'Kategori berhasil diperbarui',
      data: updatedCategory
    });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// DELETE kategori (admin only)
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const category = await db.getCategoryById(parseInt(req.params.id));
    if (!category) {
      return res.status(404).json({ success: false, message: 'Kategori tidak ditemukan' });
    }

    await db.deleteCategory(parseInt(req.params.id));

    res.status(200).json({
      success: true,
      message: 'Kategori berhasil dihapus'
    });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
