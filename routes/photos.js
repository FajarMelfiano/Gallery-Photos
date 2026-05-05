const express = require('express');
const axios = require('axios');
const { HttpsProxyAgent } = require('https-proxy-agent');
const db = require('../data/supabase-db');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Konfigurasi Proxy (Gunakan environment variable untuk keamanan)
const PROXY_URL = process.env.PROXY_URL || 'http://methodgpt_3TsP-country-SG-ssid-zSF7nSIYHK:methodgpt@niceproxy.io:17522';
const agent = new HttpsProxyAgent(PROXY_URL);

// Proxy Route untuk melihat gambar Google Drive
router.get('/view/:driveId', async (req, res) => {
  try {
    const { driveId } = req.params;
    const driveUrl = `https://drive.google.com/uc?export=view&id=${driveId}`;

    const response = await axios({
      url: driveUrl,
      method: 'GET',
      responseType: 'stream',
      httpsAgent: agent,
      proxy: false, // Penting agar axios menggunakan httpsAgent
      timeout: 10000,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      }
    });

    // Set header content type sesuai dari Google
    res.setHeader('Content-Type', response.headers['content-type'] || 'image/jpeg');
    res.setHeader('Cache-Control', 'public, max-age=86400'); // Cache 24 jam

    response.data.pipe(res);
  } catch (error) {
    console.error('Proxy Error:', error.message);
    res.status(500).send('Gagal memuat gambar dari Drive');
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

    // Gunakan proxy route lokal sebagai imageUrl
    const imageUrl = `/api/photos/view/${driveId}`;

    const newPhoto = await db.addPhoto({
      title,
      description: description || '',
      driveId,
      imageUrl,
      categoryId: parseInt(categoryId)
    });

    res.status(201).json({
      success: true,
      message: 'Foto berhasil ditambahkan (via Proxy)',
      data: newPhoto
    });
  } catch (error) {
    console.error('Error Add:', error);
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

    const updates = {};
    if (title) updates.title = title;
    if (description) updates.description = description;
    if (categoryId) updates.categoryId = parseInt(categoryId);
    if (driveId) {
      updates.driveId = driveId;
      updates.imageUrl = `/api/photos/view/${driveId}`;
    }

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
