const router = require('express').Router();
const mongoose = require('mongoose');

router.get('/', (_req, res) => {
  const dbState = mongoose.connection.readyState === 1 ? 'connected' : 'disconnected';
  const status = dbState === 'connected' ? 'healthy' : 'unhealthy';
  res.status(status === 'healthy' ? 200 : 503).json({ status, service: 'dispatch-service', db: dbState, timestamp: new Date().toISOString() });
});

module.exports = router;
