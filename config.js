module.exports = {
  jwtSecret: process.env.JWT_SECRET || 'your_super_secret_jwt_key',
  adminUsername: process.env.ADMIN_USERNAME || 'admin',
  adminPassword: process.env.ADMIN_PASSWORD || 'admin123',
  jwtExpire: '24h'
};
