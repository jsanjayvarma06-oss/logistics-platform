const Warehouse = require('../models/warehouse');
const Joi = require('joi');

const createSchema = Joi.object({
  name: Joi.string().required(),
  code: Joi.string().max(50).required(),
  address: Joi.string(),
  city: Joi.string(),
  state: Joi.string(),
  country: Joi.string().default('IN'),
  latitude: Joi.number().min(-90).max(90),
  longitude: Joi.number().min(-180).max(180),
  capacity: Joi.number().integer().min(0),
});

exports.list = async (req, res, next) => {
  try {
    const warehouses = await Warehouse.findAll(req.tenantId, req.query);
    res.json({ data: warehouses });
  } catch (err) { next(err); }
};

exports.get = async (req, res, next) => {
  try {
    const wh = await Warehouse.findById(req.params.id, req.tenantId);
    if (!wh) return res.status(404).json({ error: 'Warehouse not found' });
    res.json({ data: wh });
  } catch (err) { next(err); }
};

exports.create = async (req, res, next) => {
  try {
    const { error, value } = createSchema.validate(req.body);
    if (error) return res.status(400).json({ error: error.message });
    const wh = await Warehouse.create({ ...value, tenant_id: req.tenantId });
    res.status(201).json({ data: wh });
  } catch (err) { next(err); }
};

exports.update = async (req, res, next) => {
  try {
    const wh = await Warehouse.update(req.params.id, req.tenantId, req.body);
    if (!wh) return res.status(404).json({ error: 'Warehouse not found' });
    res.json({ data: wh });
  } catch (err) { next(err); }
};

exports.stockSummary = async (req, res, next) => {
  try {
    const summary = await Warehouse.getStockSummary(req.params.id, req.tenantId);
    res.json({ data: summary });
  } catch (err) { next(err); }
};
