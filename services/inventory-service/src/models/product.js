const { query } = require('../config/database');

const Product = {
  async findAll(tenantId, { limit = 50, offset = 0, category } = {}) {
    let sql = 'SELECT * FROM products WHERE tenant_id = $1 AND is_active = true';
    const params = [tenantId];

    if (category) {
      params.push(category);
      sql += ` AND category = $${params.length}`;
    }
    params.push(limit, offset);
    sql += ` ORDER BY name LIMIT $${params.length - 1} OFFSET $${params.length}`;

    const res = await query(sql, params);
    return res.rows;
  },

  async findById(id, tenantId) {
    const res = await query('SELECT * FROM products WHERE id = $1 AND tenant_id = $2', [id, tenantId]);
    return res.rows[0];
  },

  async findBySku(sku, tenantId) {
    const res = await query('SELECT * FROM products WHERE sku = $1 AND tenant_id = $2', [sku, tenantId]);
    return res.rows[0];
  },

  async create(data) {
    const res = await query(
      `INSERT INTO products (sku, name, description, category, unit, weight_kg, dimensions_cm, min_stock_level, tenant_id)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *`,
      [data.sku, data.name, data.description, data.category, data.unit, data.weight_kg, data.dimensions_cm, data.min_stock_level, data.tenant_id]
    );
    return res.rows[0];
  },

  async update(id, tenantId, data) {
    const allowed = ['name', 'description', 'category', 'unit', 'weight_kg', 'dimensions_cm', 'min_stock_level', 'is_active'];
    const fields = [];
    const values = [];
    let idx = 1;

    for (const [key, value] of Object.entries(data)) {
      if (allowed.includes(key)) {
        fields.push(`${key} = $${idx}`);
        values.push(key === 'dimensions_cm' ? JSON.stringify(value) : value);
        idx++;
      }
    }
    if (!fields.length) return null;

    fields.push('updated_at = NOW()');
    values.push(id, tenantId);

    const res = await query(
      `UPDATE products SET ${fields.join(', ')} WHERE id = $${idx} AND tenant_id = $${idx + 1} RETURNING *`,
      values
    );
    return res.rows[0];
  },

  async getLowStock(tenantId) {
    const res = await query(
      `SELECT p.*, COALESCE(SUM(s.quantity - s.reserved_quantity), 0) as total_available
       FROM products p LEFT JOIN stock s ON p.id = s.product_id
       WHERE p.tenant_id = $1 AND p.is_active = true
       GROUP BY p.id
       HAVING COALESCE(SUM(s.quantity - s.reserved_quantity), 0) <= p.min_stock_level`,
      [tenantId]
    );
    return res.rows;
  },
};

module.exports = Product;
