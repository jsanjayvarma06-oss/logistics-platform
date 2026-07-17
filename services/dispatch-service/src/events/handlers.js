const Order = require('../models/order');

const handlers = {
  'inventory.stock.reserved': async (event) => {
    console.log(`Stock reserved for product ${event.productId}, ref: ${event.referenceId}`);
  },

  'inventory.stock.removed': async (event) => {
    console.log(`Stock removed: ${event.quantity} of product ${event.productId}`);
  },
};

exports.handle = async (topic, event) => {
  const handler = handlers[topic];
  if (handler) {
    try { await handler(event); }
    catch (err) { console.error(`Event handler error [${topic}]:`, err.message); }
  }
};
