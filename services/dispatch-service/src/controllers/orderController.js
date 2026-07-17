const Order = require('../models/order');
const Shipment = require('../models/shipment');
const Driver = require('../models/driver');
const { publishEvent } = require('../config/kafka');
const Joi = require('joi');

const createSchema = Joi.object({
  items: Joi.array().items(Joi.object({
    productId: Joi.string().required(),
    sku: Joi.string().allow(''),
    name: Joi.string().allow(''),
    quantity: Joi.number().integer().min(1).required(),
    warehouseId: Joi.string().allow(''),
  })).min(1).required(),
  shippingAddress: Joi.object({
    line1: Joi.string().required(),
    line2: Joi.string().allow(''),
    city: Joi.string().required(),
    state: Joi.string().allow(''),
    postalCode: Joi.string().allow(''),
    country: Joi.string().default('IN'),
    latitude: Joi.number().allow(null),
    longitude: Joi.number().allow(null),
  }).required(),
  customerName: Joi.string().required(),
  customerPhone: Joi.string().allow(''),
  customerEmail: Joi.string().email().allow(''),
  priority: Joi.string().valid('low', 'normal', 'high', 'urgent').default('normal'),
  notes: Joi.string().allow(''),
});

exports.list = async (req, res, next) => {
  try {
    const { status, limit = 200, offset = 0 } = req.query;
    const filter = { tenantId: req.tenantId };
    if (status && status !== 'all') filter.status = status;
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

// Public tracking — no auth, only exposes safe fields
exports.getPublic = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id).select(
      'orderNumber status customerName shippingAddress items estimatedDelivery actualDelivery createdAt'
    );
    if (!order) return res.status(404).json({ error: 'Order not found' });
    res.json({ data: order });
  } catch (err) { next(err); }
};

exports.create = async (req, res, next) => {
  try {
    const { error, value } = createSchema.validate(req.body);
    if (error) return res.status(400).json({ error: error.message });

    // Estimate delivery: 2 days from now
    const estimatedDelivery = new Date();
    estimatedDelivery.setDate(estimatedDelivery.getDate() + 2);

    const order = await Order.create({
      ...value,
      orderNumber: `ORD-${Date.now()}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`,
      tenantId: req.tenantId,
      estimatedDelivery,
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
    const update = { status };
    if (status === 'delivered') update.actualDelivery = new Date();

    const order = await Order.findOneAndUpdate(
      { _id: req.params.id, tenantId: req.tenantId },
      update, { new: true }
    );
    if (!order) return res.status(404).json({ error: 'Order not found' });

    if (status === 'returned') {
      await publishEvent('dispatch.return.received', {
        orderId: order._id, items: order.items, tenantId: req.tenantId,
        returnId: `RET-${Date.now()}`,
      });
    }

    res.json({ data: order });
  } catch (err) { next(err); }
};

// Route optimization — sort stops by geo proximity (nearest neighbor)
exports.routeOptimize = async (req, res, next) => {
  try {
    const { orderIds, startLat = 17.385, startLng = 78.486 } = req.body;
    const orders = await Order.find({ _id: { $in: orderIds }, tenantId: req.tenantId });

    const ordersWithCoords = orders.map(o => ({
      id: o._id,
      orderNumber: o.orderNumber,
      customerName: o.customerName,
      lat: o.shippingAddress?.latitude || (17.35 + Math.random() * 0.1),
      lng: o.shippingAddress?.longitude || (78.45 + Math.random() * 0.1),
      address: o.shippingAddress,
    }));

    // Nearest neighbor algorithm
    let current = { lat: startLat, lng: startLng };
    const remaining = [...ordersWithCoords];
    const route = [];

    while (remaining.length > 0) {
      let nearest = null;
      let minDist = Infinity;
      let nearestIdx = -1;

      remaining.forEach((o, i) => {
        const dist = Math.sqrt(
          Math.pow(o.lat - current.lat, 2) + Math.pow(o.lng - current.lng, 2)
        );
        if (dist < minDist) { minDist = dist; nearest = o; nearestIdx = i; }
      });

      route.push({ ...nearest, sequence: route.length + 1, distanceKm: (minDist * 111).toFixed(1) });
      current = { lat: nearest.lat, lng: nearest.lng };
      remaining.splice(nearestIdx, 1);
    }

    const totalKm = route.reduce((sum, r) => sum + parseFloat(r.distanceKm), 0).toFixed(1);
    const estimatedMinutes = Math.round(totalKm * 2.5 + route.length * 5);

    res.json({ data: { route, totalKm, estimatedMinutes } });
  } catch (err) { next(err); }
};

exports.autoPlan = async (req, res, next) => {
  try {
    const pendingOrders = await Order.find({ tenantId: req.tenantId, status: 'confirmed' }).limit(100);
    if (!pendingOrders.length) return res.json({ data: [], message: 'No confirmed orders to plan', planned: 0 });

    const availableDrivers = await Driver.find({ tenantId: req.tenantId, status: 'available' });
    if (!availableDrivers.length) return res.status(400).json({ error: 'No available drivers' });

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

      await Order.updateMany(
        { _id: { $in: batch.map(o => o._id) } },
        { status: 'dispatched', shipmentId: shipment._id.toString() }
      );

      await Driver.findByIdAndUpdate(driver._id, { status: 'on_delivery' });

      const allItems = batch.flatMap(o => o.items.map(item => ({
        productId: item.productId, warehouseId: item.warehouseId, quantity: item.quantity,
      })));

      await publishEvent('dispatch.shipment.confirmed', {
        shipmentId: shipment._id.toString(), items: allItems, tenantId: req.tenantId,
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
      Order.countDocuments({ tenantId: t, status: { $in: ['dispatched', 'in_transit'] } }),
      Order.countDocuments({ tenantId: t, status: 'delivered' }),
      Order.countDocuments({ tenantId: t }),
      Driver.countDocuments({ tenantId: t, status: { $in: ['available', 'on_delivery'] } }),
    ]);
    res.json({ data: { pending, confirmed, dispatched, delivered, totalOrders, activeDrivers } });
  } catch (err) { next(err); }
};
