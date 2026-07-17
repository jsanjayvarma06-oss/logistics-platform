const router = require('express').Router();
const handlers = require('../events/handlers');

router.post('/:topic', async (req, res) => {
  const topic = req.params.topic;
  try {
    await handlers.handle(topic, req.body);
    res.json({ received: true });
  } catch (err) {
    console.error(`Event handler error [${topic}]:`, err.message);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
