const { query } = require('../config/database');

const Warehouse = {
  async findAll(tenantId, { limit = 50, offset = 0 } = {}) {
    const res = await query(
      'SELECT * FROM warehouses WHERE tenant_id = $1 AND is_active = true ORDER BY name LIMIT $2 OFFSET $3',
      [tenantId, limit, offset]
    );
    return res.rows;
  },

  async findById(id, tenantId) {
    const res = await query('SELECT * FROM warehouses WHERE id = $1 AND tenant_id = $2', [id, tenantId]);
    return res.rows[0];
  },

  async create(data) {
    const res = await query(
      `INSERT INTO warehouses (name, code, address, city, state, country, latitude, longitude, capacity, tenant_id)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING *`,
      [data.name, data.code, data.address, data.city, data.state, data.country, data.latitude, data.longitude, data.capacity, data.tenant_id]
    );
    return res.rows[0];
  },

  async update(id, tenantId, data) {
    const fields = [];
    const values = [];
    let idx = 1;

    for (const [key, value] of Object.entries(data)) {
      if (['name', 'address', 'city', 'state', 'country', 'latitude', 'longitude', 'capacity', 'is_active'].includes(key)) {
        fields.push(`${key} = $${idx}`);
        values.push(value);
        idx++;
      }
    }
    if (!fields.length) return null;

    fields.push(`updated_at = NOW()`);
    values.push(id, tenantId);

    const res = await query(
      `UPDATE warehouses SET ${fields.join(', ')} WHERE id = $${idx} AND tenant_id = $${idx + 1} RETURNING *`,
      values
    );
    return res.rows[0];
  },

  async getStockSummary(warehouseId, tenantId) {
    const res = await query(
      `SELECT p.sku, p.name, s.quantity, s.reserved_quantity, (s.quantity - s.reserved_quantity) as available
       FROM stock s JOIN products p ON s.product_id = p.id
       WHERE s.warehouse_id = $1 AND s.tenant_id = $2 AND s.quantity > 0
       ORDER BY p.name`,
      [warehouseId, tenantId]
    );
    return res.rows;
  },
};

module.exports = Warehouse;
