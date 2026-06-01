const { getDb } = require('../db');

class Organization {
  static schema = {
    tableName: 'organizations',
    fields: {
      id: 'SERIAL PRIMARY KEY',
      name: 'TEXT NOT NULL',
      default_low_stock_threshold: 'INTEGER DEFAULT 5',
      created_at: 'TIMESTAMP DEFAULT CURRENT_TIMESTAMP',
    },
  };

  static async create(name) {
    const db = await getDb();
    return db.run('INSERT INTO organizations (name) VALUES (?) RETURNING id', [name.trim()]);
  }

  static async findById(id) {
    const db = await getDb();
    return db.get('SELECT * FROM organizations WHERE id = ?', [id]);
  }

  static async updateThreshold(id, threshold) {
    const db = await getDb();
    await db.run(
      'UPDATE organizations SET default_low_stock_threshold = ? WHERE id = ?',
      [threshold, id]
    );
    return Organization.findById(id);
  }
}

module.exports = Organization;
