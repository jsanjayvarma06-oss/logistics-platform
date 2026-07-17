const router = require('express').Router();
const { query } = require('../config/database');

router.get('/', async (_req, res) => {
  try {
    await query('SELECT 1');
    res.json({ status: 'healthy', service: 'inventory-service', timestamp: new Date().toISOString() });
  } catch {
    res.status(503).json({ status: 'unhealthy' });
  }
});

module.exports = router;
