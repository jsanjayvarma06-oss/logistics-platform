const mongoose = require('mongoose');

const driverSchema = new mongoose.Schema({
  tenantId: { type: String, required: true, index: true },
  name: { type: String, required: true },
  phone: { type: String, required: true },
  email: String,
  licenseNumber: String,
  vehicleType: { type: String, enum: ['bike', 'van', 'truck', 'container'], default: 'van' },
  vehicleNumber: String,
  status: { type: String, enum: ['available', 'on_delivery', 'offline', 'on_break'], default: 'offline' },
  currentLocation: { latitude: Number, longitude: Number, updatedAt: Date },
  isActive: { type: Boolean, default: true },
  rating: { type: Number, default: 5.0, min: 0, max: 5 },
  totalDeliveries: { type: Number, default: 0 },
}, { timestamps: true });

driverSchema.index({ tenantId: 1, status: 1 });

module.exports = mongoose.model('Driver', driverSchema);
