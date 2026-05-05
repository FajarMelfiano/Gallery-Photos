const express = require('express');
const jwt = require('jsonwebtoken');
const config = require('../config');

const router = express.Router();

// Login endpoint
router.post('/login', (req, res) => {
  const { username, password } = req.body;

  // Validasi input
  if (!username || !password) {
    return res.status(400).json({ message: 'Username dan password diperlukan' });
  }

  // Cek credentials (dalam production, harus di-hash!)
  if (username === config.adminUsername && password === config.adminPassword) {
    // Buat JWT token
    const token = jwt.sign(
      { username: config.adminUsername, role: 'admin' },
      config.jwtSecret,
      { expiresIn: config.jwtExpire }
    );

    return res.status(200).json({
      success: true,
      message: 'Login berhasil',
      token: token,
      user: {
        username: config.adminUsername,
        role: 'admin'
      }
    });
  }

  // Credentials salah
  res.status(401).json({
    success: false,
    message: 'Username atau password salah'
  });
});

// Verify token endpoint
router.post('/verify', (req, res) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ valid: false, message: 'Token tidak ditemukan' });
  }

  jwt.verify(token, config.jwtSecret, (err, user) => {
    if (err) {
      return res.status(403).json({ valid: false, message: 'Token tidak valid' });
    }
    res.status(200).json({ valid: true, user });
  });
});

module.exports = router;
