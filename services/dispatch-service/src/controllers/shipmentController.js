const Shipment = require('../models/shipment');
const Order = require('../models/order');
const Driver = require('../models/driver');
const { publishEvent } = require('../config/kafka');

exports.list = async (req, res, next) => {
  try {
    const { status, driverId, limit = 50, offset = 0 } = req.query;
    const filter = { tenantId: req.tenantId };
    if (status) filter.status = status;
    if (driverId) filter.driverId = driverId;
    const shipments = await Shipment.find(filter).sort({ createdAt: -1 }).skip(Number(offset)).limit(Number(limit));
    res.json({ data: shipments });
  } catch (err) { next(err); }
};

exports.get = async (req, res, next) => {
  try {
    const shipment = await Shipment.findOne({ _id: req.params.id, tenantId: req.tenantId });
    if (!shipment) return res.status(404).json({ error: 'Shipment not found' });
    res.json({ data: shipment });
  } catch (err) { next(err); }
};

exports.updateStopStatus = async (req, res, next) => {
  try {
    const { stopIndex, status } = req.body;
    const shipment = await Shipment.findOne({ _id: req.params.id, tenantId: req.tenantId });
    if (!shipment) return res.status(404).json({ error: 'Shipment not found' });

    shipment.route.stops[stopIndex].status = status;
    if (status === 'arrived') shipment.route.stops[stopIndex].arrivedAt = new Date();
    if (status === 'completed') shipment.route.stops[stopIndex].completedAt = new Date();

    // Check if all stops completed
    const allDone = shipment.route.stops.every(s => s.status === 'completed' || s.status === 'skipped');
    if (allDone) {
      shipment.status = 'delivered';
      shipment.completedAt = new Date();
      // Free up the driver
      await Driver.findByIdAndUpdate(shipment.driverId, { status: 'available' });
      // Update all orders
      await Order.updateMany({ _id: { $in: shipment.orderIds } }, { status: 'delivered', actualDelivery: new Date() });
    }

    await shipment.save();
    res.json({ data: shipment });
  } catch (err) { next(err); }
};
