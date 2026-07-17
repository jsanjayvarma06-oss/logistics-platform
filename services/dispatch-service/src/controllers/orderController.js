const Order = require('../models/order');
const Shipment = require('../models/shipment');
const Driver = require('../models/driver');
const { publishEvent } = require('../config/kafka');
const { v4: uuidv4 } = require('uuid');
const Joi = require('joi');

const createSchema = Joi.object({
  items: Joi.array().items(Joi.object({
    productId: Joi.string().required(),
    sku: Joi.string(),
    name: Joi.string(),
    quantity: Joi.number().integer().min(1).required(),
    warehouseId: Joi.string(),
  })).min(1).required(),
  shippingAddress: Joi.object({
    line1: Joi.string().required(),
    line2: Joi.string().allow(''),
    city: Joi.string().required(),
    state: Joi.string(),
    postalCode: Joi.string(),
    country: Joi.string().default('IN'),
    latitude: Joi.number(),
    longitude: Joi.number(),
  }).required(),
  customerName: Joi.string().required(),
  customerPhone: Joi.string(),
  customerEmail: Joi.string().email(),
  priority: Joi.string().valid('low', 'normal', 'high', 'urgent'),
  notes: Joi.string(),
});

exports.list = async (req, res, next) => {
  try {
    const { status, limit = 50, offset = 0 } = req.query;
    const filter = { tenantId: req.tenantId };
    if (status) filter.status = status;
    const orders = await Order.find(filter).sort({ createdAt: -1 }).skip(Number(offset)).limit(Number(limit));
    const total = await Order.countDocuments(filter);
    res.json({ data: orders, total });
  } catch (err) { next(err); }
};

exports.get = async (req, res, next) => {
  try {
    const order = await Order.findOne({ _id: req.params.id, tenantId: req.tenantId });
    if (!order) return res.status(404).json({ error: 'Order not found' });
    res.json({ data: order });
  } catch (err) { next(err); }
};

exports.create = async (req, res, next) => {
  try {
    const { error, value } = createSchema.validate(req.body);
    if (error) return res.status(400).json({ error: error.message });

    const order = await Order.create({
      ...value,
      orderNumber: `ORD-${Date.now()}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`,
      tenantId: req.tenantId,
    });

    await publishEvent('dispatch.order.created', {
      orderId: order._id, orderNumber: order.orderNumber,
      items: order.items, tenantId: req.tenantId,
    });

    res.status(201).json({ data: order });
  } catch (err) { next(err); }
};

exports.updateStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    const order = await Order.findOneAndUpdate(
      { _id: req.params.id, tenantId: req.tenantId },
      { status, ...(status === 'delivered' ? { actualDelivery: new Date() } : {}) },
      { new: true }
    );
    if (!order) return res.status(404).json({ error: 'Order not found' });

    await publishEvent(`dispatch.order.${status}`, {
      orderId: order._id, orderNumber: order.orderNumber, tenantId: req.tenantId,
    });

    res.json({ data: order });
  } catch (err) { next(err); }
};

// Auto-plan: group pending orders by area, assign drivers
exports.autoPlan = async (req, res, next) => {
  try {
    const pendingOrders = await Order.find({ tenantId: req.tenantId, status: 'confirmed' }).limit(100);
    if (!pendingOrders.length) return res.json({ data: [], message: 'No confirmed orders to plan' });

    const availableDrivers = await Driver.find({ tenantId: req.tenantId, status: 'available' });
    if (!availableDrivers.length) return res.status(400).json({ error: 'No available drivers' });

    // Simple round-robin assignment (replace with geo-clustering in production)
    const shipments = [];
    const batchSize = Math.ceil(pendingOrders.length / availableDrivers.length);

    for (let i = 0; i < availableDrivers.length && i * batchSize < pendingOrders.length; i++) {
      const batch = pendingOrders.slice(i * batchSize, (i + 1) * batchSize);
      const driver = availableDrivers[i];

      const shipment = await Shipment.create({
        shipmentNumber: `SHP-${Date.now()}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`,
        tenantId: req.tenantId,
        orderIds: batch.map(o => o._id.toString()),
        driverId: driver._id.toString(),
        vehicleType: driver.vehicleType,
        status: 'assigned',
        route: {
          stops: batch.map((o, idx) => ({
            orderId: o._id.toString(),
            address: o.shippingAddress,
            sequence: idx + 1,
          })),
        },
      });

      // Update orders
      await Order.updateMany(
        { _id: { $in: batch.map(o => o._id) } },
        { status: 'dispatched', shipmentId: shipment._id.toString() }
      );

      // Update driver
      await Driver.findByIdAndUpdate(driver._id, { status: 'on_delivery' });

      // Notify inventory to deduct stock
      const allItems = batch.flatMap(o => o.items.map(item => ({
        productId: item.productId,
        warehouseId: item.warehouseId,
        quantity: item.quantity,
      })));

      await publishEvent('dispatch.shipment.confirmed', {
        shipmentId: shipment._id.toString(),
        items: allItems,
        tenantId: req.tenantId,
      });

      shipments.push(shipment);
    }

    res.json({ data: shipments, planned: shipments.length });
  } catch (err) { next(err); }
};

exports.dashboard = async (req, res, next) => {
  try {
    const t = req.tenantId;
    const [pending, confirmed, dispatched, delivered, totalOrders, activeDrivers] = await Promise.all([
      Order.countDocuments({ tenantId: t, status: 'pending' }),
      Order.countDocuments({ tenantId: t, status: 'confirmed' }),
      Order.countDocuments({ tenantId: t, status: 'dispatched' }),
      Order.countDocuments({ tenantId: t, status: 'delivered' }),
      Order.countDocuments({ tenantId: t }),
      Driver.countDocuments({ tenantId: t, status: { $in: ['available', 'on_delivery'] } }),
    ]);
    res.json({ data: { pending, confirmed, dispatched, delivered, totalOrders, activeDrivers } });
  } catch (err) { next(err); }
};
