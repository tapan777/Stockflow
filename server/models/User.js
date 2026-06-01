const { getDb } = require('../db');

class User {
  static schema = {
    tableName: 'users',
    fields: {
      id: 'SERIAL PRIMARY KEY',
      organization_id: 'INTEGER NOT NULL REFERENCES organizations(id)',
      email: 'TEXT NOT NULL UNIQUE',
      password_hash: 'TEXT NOT NULL',
      created_at: 'TIMESTAMP DEFAULT CURRENT_TIMESTAMP',
    },
  };

  static async create(orgId, email, passwordHash) {
    const db = await getDb();
    return db.run(
      'INSERT INTO users (organization_id, email, password_hash) VALUES (?, ?, ?) RETURNING id',
      [orgId, email.toLowerCase(), passwordHash]
    );
  }

  static async findByEmail(email) {
    const db = await getDb();
    return db.get('SELECT id FROM users WHERE email = ?', [email.toLowerCase()]);
  }

  static async findByEmailWithOrg(email) {
    const db = await getDb();
    return db.get(
      `SELECT u.id, u.email, u.password_hash, u.organization_id, o.name AS org_name
       FROM users u JOIN organizations o ON u.organization_id = o.id
       WHERE u.email = ?`,
      [email.toLowerCase()]
    );
  }

  static async findByIdWithOrg(id) {
    const db = await getDb();
    return db.get(
      `SELECT u.id, u.email, u.organization_id, o.name AS org_name
       FROM users u JOIN organizations o ON u.organization_id = o.id
       WHERE u.id = ?`,
      [id]
    );
  }
}

module.exports = User;
