const express = require('express');
const multer = require('multer');
const path = require('path');
const db = require('../data/supabase-db');
const supabase = require('../config/supabase'); // Client backend untuk upload storage
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Konfigurasi Multer (simpan di memory sementara)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, // Limit 5MB
  fileFilter: (req, file, cb) => {
    const filetypes = /jpeg|jpg|png|webp/;
    const mimetype = filetypes.test(file.mimetype);
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    if (mimetype && extname) return cb(null, true);
    cb(new Error('Hanya file gambar (jpg, png, webp) yang diizinkan!'));
  }
});

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

// POST tambah foto (admin only - WITH UPLOAD)
router.post('/', authenticateToken, upload.single('image'), async (req, res) => {
  try {
    const { title, description, categoryId } = req.body;
    const file = req.file;

    // Validasi input
    if (!title || !categoryId) {
      return res.status(400).json({
        success: false,
        message: 'Title dan categoryId diperlukan'
      });
    }

    if (!file) {
      return res.status(400).json({
        success: false,
        message: 'File gambar harus diunggah'
      });
    }

    // 1. Upload ke Supabase Storage
    const fileName = `${Date.now()}-${file.originalname.replace(/\s+/g, '_')}`;
    const { data: uploadData, error: uploadError } = await supabase
      .storage
      .from('photos')
      .upload(fileName, file.buffer, {
        contentType: file.mimetype,
        upsert: false
      });

    if (uploadError) {
      throw new Error(`Upload gagal: ${uploadError.message}`);
    }

    // 2. Dapatkan Public URL
    const { data: { publicUrl } } = supabase
      .storage
      .from('photos')
      .getPublicUrl(fileName);

    // 3. Simpan ke Database
    const newPhoto = await db.addPhoto({
      title,
      description: description || '',
      driveId: fileName, // Kita simpan fileName di driveId sebagai referensi
      imageUrl: publicUrl,
      categoryId: parseInt(categoryId)
    });

    res.status(201).json({
      success: true,
      message: 'Foto berhasil diunggah dan disimpan',
      data: newPhoto
    });
  } catch (error) {
    console.error('Error Upload:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// PUT update foto (admin only)
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const { title, description, categoryId } = req.body;

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

    const updatedPhoto = await db.updatePhoto(parseInt(req.params.id), updates);

    res.status(200).json({
      success: true,
      message: 'Foto berhasil diperbarui',
      data: updatedPhoto
    });
  } catch (error) {
    console.error('Error Update:', error);
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

    // 1. Hapus file dari Supabase Storage jika ada
    if (photo.driveId) {
      await supabase
        .storage
        .from('photos')
        .remove([photo.driveId]);
    }

    // 2. Hapus dari database
    await db.deletePhoto(parseInt(req.params.id));

    res.status(200).json({
      success: true,
      message: 'Foto berhasil dihapus'
    });
  } catch (error) {
    console.error('Error Delete:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
