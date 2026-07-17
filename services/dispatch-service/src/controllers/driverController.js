const Driver = require('../models/driver');
const Joi = require('joi');

const createSchema = Joi.object({
  name: Joi.string().required(),
  phone: Joi.string().required(),
  email: Joi.string().email(),
  licenseNumber: Joi.string(),
  vehicleType: Joi.string().valid('bike', 'van', 'truck', 'container'),
  vehicleNumber: Joi.string(),
});

exports.list = async (req, res, next) => {
  try {
    const { status } = req.query;
    const filter = { tenantId: req.tenantId, isActive: true };
    if (status) filter.status = status;
    const drivers = await Driver.find(filter).sort({ name: 1 });
    res.json({ data: drivers });
  } catch (err) { next(err); }
};

exports.get = async (req, res, next) => {
  try {
    const driver = await Driver.findOne({ _id: req.params.id, tenantId: req.tenantId });
    if (!driver) return res.status(404).json({ error: 'Driver not found' });
    res.json({ data: driver });
  } catch (err) { next(err); }
};

exports.create = async (req, res, next) => {
  try {
    const { error, value } = createSchema.validate(req.body);
    if (error) return res.status(400).json({ error: error.message });
    const driver = await Driver.create({ ...value, tenantId: req.tenantId });
    res.status(201).json({ data: driver });
  } catch (err) { next(err); }
};

exports.updateStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    const driver = await Driver.findOneAndUpdate(
      { _id: req.params.id, tenantId: req.tenantId },
      { status },
      { new: true }
    );
    if (!driver) return res.status(404).json({ error: 'Driver not found' });
    res.json({ data: driver });
  } catch (err) { next(err); }
};

exports.updateLocation = async (req, res, next) => {
  try {
    const { latitude, longitude } = req.body;
    const driver = await Driver.findOneAndUpdate(
      { _id: req.params.id, tenantId: req.tenantId },
      { currentLocation: { latitude, longitude, updatedAt: new Date() } },
      { new: true }
    );
    if (!driver) return res.status(404).json({ error: 'Driver not found' });
    res.json({ data: driver });
  } catch (err) { next(err); }
};
