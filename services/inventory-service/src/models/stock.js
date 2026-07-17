const { query, pool } = require('../config/database');
const { publishEvent } = require('../config/kafka');

const Stock = {
  async getByProduct(productId, tenantId) {
    const res = await query(
      `SELECT s.*, w.name as warehouse_name, w.code as warehouse_code
       FROM stock s JOIN warehouses w ON s.warehouse_id = w.id
       WHERE s.product_id = $1 AND s.tenant_id = $2 AND s.quantity > 0`,
      [productId, tenantId]
    );
    return res.rows;
  },

  async getByWarehouse(warehouseId, tenantId) {
    const res = await query(
      `SELECT s.*, p.sku, p.name as product_name, p.category
       FROM stock s JOIN products p ON s.product_id = p.id
       WHERE s.warehouse_id = $1 AND s.tenant_id = $2 AND s.quantity > 0`,
      [warehouseId, tenantId]
    );
    return res.rows;
  },

  async addStock({ productId, warehouseId, quantity, batchNumber, expiryDate, tenantId, referenceId, notes }) {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      // Upsert stock
      const stockRes = await client.query(
        `INSERT INTO stock (product_id, warehouse_id, quantity, batch_number, expiry_date, tenant_id)
         VALUES ($1, $2, $3, $4, $5, $6)
         ON CONFLICT (product_id, warehouse_id, batch_number, tenant_id)
         DO UPDATE SET quantity = stock.quantity + $3, updated_at = NOW()
         RETURNING *`,
        [productId, warehouseId, quantity, batchNumber || 'default', expiryDate, tenantId]
      );

      // Record movement
      await client.query(
        `INSERT INTO stock_movements (product_id, warehouse_id, movement_type, quantity, reference_id, reference_type, notes, tenant_id)
         VALUES ($1, $2, 'inbound', $3, $4, 'manual', $5, $6)`,
        [productId, warehouseId, quantity, referenceId, notes, tenantId]
      );

      await client.query('COMMIT');

      await publishEvent('inventory.stock.added', {
        productId, warehouseId, quantity, tenantId,
        newTotal: stockRes.rows[0].quantity,
      });

      return stockRes.rows[0];
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  },

  async removeStock({ productId, warehouseId, quantity, tenantId, referenceId, notes, movementType = 'outbound' }) {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      // Check availability
      const current = await client.query(
        `SELECT * FROM stock WHERE product_id = $1 AND warehouse_id = $2 AND tenant_id = $3 FOR UPDATE`,
        [productId, warehouseId, tenantId]
      );

      if (!current.rows.length) throw new Error('Stock record not found');

      const available = current.rows.reduce((sum, r) => sum + r.quantity - r.reserved_quantity, 0);
      if (available < quantity) throw new Error(`Insufficient stock. Available: ${available}, Requested: ${quantity}`);

      // Deduct from first available batch (FIFO)
      let remaining = quantity;
      for (const row of current.rows) {
        if (remaining <= 0) break;
        const avail = row.quantity - row.reserved_quantity;
        const deduct = Math.min(avail, remaining);

        await client.query(
          'UPDATE stock SET quantity = quantity - $1, updated_at = NOW() WHERE id = $2',
          [deduct, row.id]
        );
        remaining -= deduct;
      }

      await client.query(
        `INSERT INTO stock_movements (product_id, warehouse_id, movement_type, quantity, reference_id, reference_type, notes, tenant_id)
         VALUES ($1, $2, $3, $4, $5, 'dispatch', $6, $7)`,
        [productId, warehouseId, movementType, quantity, referenceId, notes, tenantId]
      );

      await client.query('COMMIT');

      await publishEvent('inventory.stock.removed', {
        productId, warehouseId, quantity, movementType, tenantId,
      });

      return { success: true, deducted: quantity };
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  },

  async reserveStock({ productId, warehouseId, quantity, tenantId, referenceId }) {
    const res = await query(
      `UPDATE stock SET reserved_quantity = reserved_quantity + $1, updated_at = NOW()
       WHERE product_id = $2 AND warehouse_id = $3 AND tenant_id = $4
         AND (quantity - reserved_quantity) >= $1
       RETURNING *`,
      [quantity, productId, warehouseId, tenantId]
    );

    if (!res.rows.length) throw new Error('Insufficient stock to reserve');

    await publishEvent('inventory.stock.reserved', {
      productId, warehouseId, quantity, referenceId, tenantId,
    });

    return res.rows[0];
  },

  async getMovements(tenantId, { productId, warehouseId, limit = 50, offset = 0 } = {}) {
    let sql = `SELECT sm.*, p.sku, p.name as product_name, w.name as warehouse_name
               FROM stock_movements sm
               JOIN products p ON sm.product_id = p.id
               JOIN warehouses w ON sm.warehouse_id = w.id
               WHERE sm.tenant_id = $1`;
    const params = [tenantId];

    if (productId) { params.push(productId); sql += ` AND sm.product_id = $${params.length}`; }
    if (warehouseId) { params.push(warehouseId); sql += ` AND sm.warehouse_id = $${params.length}`; }

    params.push(limit, offset);
    sql += ` ORDER BY sm.created_at DESC LIMIT $${params.length - 1} OFFSET $${params.length}`;

    const res = await query(sql, params);
    return res.rows;
  },
};

module.exports = Stock;
