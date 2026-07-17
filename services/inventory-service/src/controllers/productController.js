const Product = require('../models/product');
const Joi = require('joi');

const createSchema = Joi.object({
  sku: Joi.string().required(),
  name: Joi.string().required(),
  description: Joi.string().allow(''),
  category: Joi.string(),
  unit: Joi.string().default('piece'),
  weight_kg: Joi.number().min(0),
  dimensions_cm: Joi.object({ length: Joi.number(), width: Joi.number(), height: Joi.number() }),
  min_stock_level: Joi.number().integer().min(0).default(0),
});

exports.list = async (req, res, next) => {
  try {
    const products = await Product.findAll(req.tenantId, req.query);
    res.json({ data: products });
  } catch (err) { next(err); }
};

exports.get = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id, req.tenantId);
    if (!product) return res.status(404).json({ error: 'Product not found' });
    res.json({ data: product });
  } catch (err) { next(err); }
};

exports.create = async (req, res, next) => {
  try {
    const { error, value } = createSchema.validate(req.body);
    if (error) return res.status(400).json({ error: error.message });
    const product = await Product.create({ ...value, tenant_id: req.tenantId });
    res.status(201).json({ data: product });
  } catch (err) { next(err); }
};

exports.update = async (req, res, next) => {
  try {
    const product = await Product.update(req.params.id, req.tenantId, req.body);
    if (!product) return res.status(404).json({ error: 'Product not found' });
    res.json({ data: product });
  } catch (err) { next(err); }
};

exports.lowStock = async (req, res, next) => {
  try {
    const products = await Product.getLowStock(req.tenantId);
    res.json({ data: products });
  } catch (err) { next(err); }
};
