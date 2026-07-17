const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
  productId: { type: String, required: true },
  sku: String,
  name: String,
  quantity: { type: Number, required: true, min: 1 },
  warehouseId: String,
});

const addressSchema = new mongoose.Schema({
  line1: { type: String, required: true },
  line2: String,
  city: { type: String, required: true },
  state: String,
  postalCode: String,
  country: { type: String, default: 'IN' },
  latitude: Number,
  longitude: Number,
});

const orderSchema = new mongoose.Schema({
  orderNumber: { type: String, unique: true, required: true },
  tenantId: { type: String, required: true, index: true },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'picking', 'packed', 'dispatched', 'in_transit', 'delivered', 'cancelled', 'returned'],
    default: 'pending',
  },
  priority: { type: String, enum: ['low', 'normal', 'high', 'urgent'], default: 'normal' },
  items: [orderItemSchema],
  shippingAddress: addressSchema,
  customerName: String,
  customerPhone: String,
  customerEmail: String,
  estimatedDelivery: Date,
  actualDelivery: Date,
  shipmentId: String,
  notes: String,
  metadata: mongoose.Schema.Types.Mixed,
}, { timestamps: true });

orderSchema.index({ tenantId: 1, status: 1 });
orderSchema.index({ tenantId: 1, createdAt: -1 });

module.exports = mongoose.model('Order', orderSchema);
