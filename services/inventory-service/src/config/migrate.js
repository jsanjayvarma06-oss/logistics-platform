const { query } = require('./database');

async function runMigrations() {
  await query(`
    CREATE TABLE IF NOT EXISTS warehouses (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      name VARCHAR(255) NOT NULL,
      code VARCHAR(50) UNIQUE NOT NULL,
      address TEXT,
      city VARCHAR(100),
      state VARCHAR(100),
      country VARCHAR(100) DEFAULT 'IN',
      latitude DECIMAL(10, 8),
      longitude DECIMAL(11, 8),
      capacity INTEGER DEFAULT 0,
      is_active BOOLEAN DEFAULT true,
      tenant_id VARCHAR(100) NOT NULL,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS products (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      sku VARCHAR(100) NOT NULL,
      name VARCHAR(255) NOT NULL,
      description TEXT,
      category VARCHAR(100),
      unit VARCHAR(50) DEFAULT 'piece',
      weight_kg DECIMAL(10, 3),
      dimensions_cm JSONB,
      min_stock_level INTEGER DEFAULT 0,
      is_active BOOLEAN DEFAULT true,
      tenant_id VARCHAR(100) NOT NULL,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW(),
      UNIQUE(sku, tenant_id)
    );

    CREATE TABLE IF NOT EXISTS stock (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      product_id UUID REFERENCES products(id),
      warehouse_id UUID REFERENCES warehouses(id),
      quantity INTEGER NOT NULL DEFAULT 0,
      reserved_quantity INTEGER NOT NULL DEFAULT 0,
      batch_number VARCHAR(100),
      expiry_date DATE,
      tenant_id VARCHAR(100) NOT NULL,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW(),
      UNIQUE(product_id, warehouse_id, batch_number, tenant_id)
    );

    CREATE TABLE IF NOT EXISTS stock_movements (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      product_id UUID REFERENCES products(id),
      warehouse_id UUID REFERENCES warehouses(id),
      movement_type VARCHAR(20) NOT NULL CHECK (movement_type IN ('inbound', 'outbound', 'transfer', 'adjustment', 'return')),
      quantity INTEGER NOT NULL,
      reference_id VARCHAR(255),
      reference_type VARCHAR(50),
      notes TEXT,
      tenant_id VARCHAR(100) NOT NULL,
      created_at TIMESTAMPTZ DEFAULT NOW()
    );

    CREATE INDEX IF NOT EXISTS idx_stock_product ON stock(product_id);
    CREATE INDEX IF NOT EXISTS idx_stock_warehouse ON stock(warehouse_id);
    CREATE INDEX IF NOT EXISTS idx_stock_tenant ON stock(tenant_id);
    CREATE INDEX IF NOT EXISTS idx_movements_product ON stock_movements(product_id);
    CREATE INDEX IF NOT EXISTS idx_movements_tenant ON stock_movements(tenant_id);
    CREATE INDEX IF NOT EXISTS idx_products_tenant ON products(tenant_id);
    CREATE INDEX IF NOT EXISTS idx_warehouses_tenant ON warehouses(tenant_id);
  `);
}

module.exports = { runMigrations };
