const mongoose = require('mongoose');

const shipmentSchema = new mongoose.Schema({
  shipmentNumber: { type: String, unique: true, required: true },
  tenantId: { type: String, required: true, index: true },
  status: {
    type: String,
    enum: ['planning', 'assigned', 'picked_up', 'in_transit', 'out_for_delivery', 'delivered', 'failed', 'returned'],
    default: 'planning',
  },
  orderIds: [String],
  driverId: String,
  vehicleType: { type: String, enum: ['bike', 'van', 'truck', 'container'], default: 'van' },
  warehouseId: String,
  route: {
    totalDistanceKm: Number,
    estimatedDurationMin: Number,
    stops: [{
      orderId: String,
      address: mongoose.Schema.Types.Mixed,
      sequence: Number,
      status: { type: String, enum: ['pending', 'arrived', 'completed', 'skipped'], default: 'pending' },
      arrivedAt: Date,
      completedAt: Date,
    }],
  },
  dispatchedAt: Date,
  completedAt: Date,
  notes: String,
}, { timestamps: true });

shipmentSchema.index({ tenantId: 1, status: 1 });
shipmentSchema.index({ driverId: 1, status: 1 });

module.exports = mongoose.model('Shipment', shipmentSchema);
