const Stock = require('../models/stock');
const Joi = require('joi');

const addSchema = Joi.object({
  product_id: Joi.string().uuid().required(),
  warehouse_id: Joi.string().uuid().required(),
  quantity: Joi.number().integer().min(1).required(),
  batch_number: Joi.string(),
  expiry_date: Joi.date(),
  reference_id: Joi.string(),
  notes: Joi.string(),
});

const removeSchema = Joi.object({
  product_id: Joi.string().uuid().required(),
  warehouse_id: Joi.string().uuid().required(),
  quantity: Joi.number().integer().min(1).required(),
  reference_id: Joi.string(),
  notes: Joi.string(),
  movement_type: Joi.string().valid('outbound', 'adjustment', 'transfer'),
});

exports.byProduct = async (req, res, next) => {
  try {
    const stock = await Stock.getByProduct(req.params.productId, req.tenantId);
    res.json({ data: stock });
  } catch (err) { next(err); }
};

exports.byWarehouse = async (req, res, next) => {
  try {
    const stock = await Stock.getByWarehouse(req.params.warehouseId, req.tenantId);
    res.json({ data: stock });
  } catch (err) { next(err); }
};

exports.add = async (req, res, next) => {
  try {
    const { error, value } = addSchema.validate(req.body);
    if (error) return res.status(400).json({ error: error.message });
    const result = await Stock.addStock({
      productId: value.product_id, warehouseId: value.warehouse_id,
      quantity: value.quantity, batchNumber: value.batch_number,
      expiryDate: value.expiry_date, tenantId: req.tenantId,
      referenceId: value.reference_id, notes: value.notes,
    });
    res.status(201).json({ data: result });
  } catch (err) { next(err); }
};

exports.remove = async (req, res, next) => {
  try {
    const { error, value } = removeSchema.validate(req.body);
    if (error) return res.status(400).json({ error: error.message });
    const result = await Stock.removeStock({
      productId: value.product_id, warehouseId: value.warehouse_id,
      quantity: value.quantity, tenantId: req.tenantId,
      referenceId: value.reference_id, notes: value.notes,
      movementType: value.movement_type,
    });
    res.json({ data: result });
  } catch (err) { next(err); }
};

exports.reserve = async (req, res, next) => {
  try {
    const { product_id, warehouse_id, quantity, reference_id } = req.body;
    const result = await Stock.reserveStock({
      productId: product_id, warehouseId: warehouse_id,
      quantity, tenantId: req.tenantId, referenceId: reference_id,
    });
    res.json({ data: result });
  } catch (err) { next(err); }
};

exports.movements = async (req, res, next) => {
  try {
    const movements = await Stock.getMovements(req.tenantId, req.query);
    res.json({ data: movements });
  } catch (err) { next(err); }
};
