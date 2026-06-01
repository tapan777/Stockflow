const { getDb } = require('../db');

class Product {
  static schema = {
    tableName: 'products',
    fields: {
      id: 'SERIAL PRIMARY KEY',
      organization_id: 'INTEGER NOT NULL REFERENCES organizations(id)',
      name: 'TEXT NOT NULL',
      sku: 'TEXT NOT NULL',
      description: 'TEXT',
      quantity_on_hand: 'INTEGER DEFAULT 0',
      cost_price: 'NUMERIC(12,2)',
      selling_price: 'NUMERIC(12,2)',
      low_stock_threshold: 'INTEGER',
      created_at: 'TIMESTAMP DEFAULT CURRENT_TIMESTAMP',
      updated_at: 'TIMESTAMP DEFAULT CURRENT_TIMESTAMP',
    },
  };

  static sanitize(data) {
    const { name, sku, description, quantity_on_hand, cost_price, selling_price, low_stock_threshold } = data;
    return {
      name: name.trim(),
      sku: sku.trim().toUpperCase(),
      description: description || null,
      quantity_on_hand: parseInt(quantity_on_hand) || 0,
      cost_price: cost_price != null && cost_price !== '' ? parseFloat(cost_price) : null,
      selling_price: selling_price != null && selling_price !== '' ? parseFloat(selling_price) : null,
      low_stock_threshold: low_stock_threshold != null && low_stock_threshold !== '' ? parseInt(low_stock_threshold) : null,
    };
  }

  static async findAll(orgId, search) {
    const db = await getDb();
    let sql = 'SELECT * FROM products WHERE organization_id = ?';
    const params = [orgId];
    if (search) {
      sql += ' AND (LOWER(name) LIKE ? OR LOWER(sku) LIKE ?)';
      params.push(`%${search.toLowerCase()}%`, `%${search.toLowerCase()}%`);
    }
    return db.all(sql + ' ORDER BY name ASC', params);
  }

  static async findById(id, orgId) {
    const db = await getDb();
    return db.get('SELECT * FROM products WHERE id = ? AND organization_id = ?', [id, orgId]);
  }

  static async findBySku(sku, orgId, excludeId = null) {
    const db = await getDb();
    const sql = excludeId
      ? 'SELECT id FROM products WHERE sku = ? AND organization_id = ? AND id != ?'
      : 'SELECT id FROM products WHERE sku = ? AND organization_id = ?';
    const params = excludeId ? [sku, orgId, excludeId] : [sku, orgId];
    return db.get(sql, params);
  }

  static async findLowStock(orgId, defaultThreshold) {
    const db = await getDb();
    return db.all(
      `SELECT id, name, sku, quantity_on_hand, low_stock_threshold
       FROM products
       WHERE organization_id = ? AND quantity_on_hand <= COALESCE(low_stock_threshold, ?)
       ORDER BY quantity_on_hand ASC`,
      [orgId, defaultThreshold]
    );
  }

  static async getStats(orgId) {
    const db = await getDb();
    return db.get(
      `SELECT COUNT(*) AS total_products, COALESCE(SUM(quantity_on_hand), 0) AS total_units
       FROM products WHERE organization_id = ?`,
      [orgId]
    );
  }

  static async create(orgId, data) {
    const db = await getDb();
    const f = Product.sanitize(data);
    const result = await db.run(
      `INSERT INTO products
         (organization_id, name, sku, description, quantity_on_hand, cost_price, selling_price, low_stock_threshold)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)
       RETURNING id`,
      [orgId, f.name, f.sku, f.description, f.quantity_on_hand, f.cost_price, f.selling_price, f.low_stock_threshold]
    );
    return Product.findById(result.lastID, orgId);
  }

  static async update(id, orgId, data) {
    const db = await getDb();
    const existing = await Product.findById(id, orgId);
    const f = Product.sanitize({ ...existing, ...data });
    await db.run(
      `UPDATE products
       SET name=?, sku=?, description=?, quantity_on_hand=?,
           cost_price=?, selling_price=?, low_stock_threshold=?, updated_at=CURRENT_TIMESTAMP
       WHERE id=? AND organization_id=?`,
      [f.name, f.sku, f.description, f.quantity_on_hand, f.cost_price, f.selling_price, f.low_stock_threshold, id, orgId]
    );
    return Product.findById(id, orgId);
  }

  static async adjustStock(id, orgId, adjustment) {
    const db = await getDb();
    const product = await Product.findById(id, orgId);
    const newQty = Math.max(0, product.quantity_on_hand + Number(adjustment));
    await db.run(
      'UPDATE products SET quantity_on_hand=?, updated_at=CURRENT_TIMESTAMP WHERE id=? AND organization_id=?',
      [newQty, id, orgId]
    );
    return Product.findById(id, orgId);
  }

  static async delete(id, orgId) {
    const db = await getDb();
    return db.run('DELETE FROM products WHERE id = ? AND organization_id = ?', [id, orgId]);
  }
}

module.exports = Product;
