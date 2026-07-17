const Stock = require('../models/stock');

const handlers = {
  'dispatch.shipment.confirmed': async (event) => {
    // When dispatch confirms a shipment, deduct stock
    const { items, tenantId, shipmentId } = event;
    for (const item of items) {
      await Stock.removeStock({
        productId: item.productId,
        warehouseId: item.warehouseId,
        quantity: item.quantity,
        tenantId,
        referenceId: shipmentId,
        notes: `Auto-deducted for shipment ${shipmentId}`,
        movementType: 'outbound',
      });
    }
    console.log(`Stock deducted for shipment ${shipmentId}`);
  },

  'dispatch.return.received': async (event) => {
    // When a return is received, add stock back
    const { items, tenantId, returnId } = event;
    for (const item of items) {
      await Stock.addStock({
        productId: item.productId,
        warehouseId: item.warehouseId,
        quantity: item.quantity,
        tenantId,
        referenceId: returnId,
        notes: `Return received ${returnId}`,
      });
    }
    console.log(`Stock restored for return ${returnId}`);
  },
};

exports.handle = async (topic, event) => {
  const handler = handlers[topic];
  if (handler) {
    try {
      await handler(event);
    } catch (err) {
      console.error(`Event handler error [${topic}]:`, err.message);
    }
  }
};
