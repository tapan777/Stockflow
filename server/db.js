const { Pool, types } = require('pg');

// Parse BIGINT (COUNT/SUM results) and NUMERIC (prices) as JS numbers
types.setTypeParser(20, (val) => parseInt(val, 10));   // int8
types.setTypeParser(1700, (val) => parseFloat(val));   // numeric

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

pool.on('error', (err) => {
  console.error('Unexpected PostgreSQL client error:', err);
});

// Convert SQLite ? placeholders to PostgreSQL $1, $2, ...
function toPostgres(sql) {
  let i = 0;
  return sql.replace(/\?/g, () => `$${++i}`);
}

function makeDb(client) {
  return {
    get: async (sql, params = []) => {
      const { rows } = await client.query(toPostgres(sql), params);
      return rows[0] ?? null;
    },
    all: async (sql, params = []) => {
      const { rows } = await client.query(toPostgres(sql), params);
      return rows;
    },
    // For INSERT, include RETURNING id in the SQL to get lastID
    run: async (sql, params = []) => {
      const result = await client.query(toPostgres(sql), params);
      return { lastID: result.rows[0]?.id ?? null, changes: result.rowCount };
    },
    exec: async (sql) => {
      await client.query(sql);
    },
  };
}

// Shared pool-level db (for non-transactional queries)
const db = makeDb(pool);

async function getDb() {
  return db;
}

// Run a callback inside a transaction using a dedicated connection
async function withTransaction(callback) {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const result = await callback(makeDb(client));
    await client.query('COMMIT');
    return result;
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}

async function initDb() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS organizations (
      id SERIAL PRIMARY KEY,
      name TEXT NOT NULL,
      default_low_stock_threshold INTEGER DEFAULT 5,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      organization_id INTEGER NOT NULL REFERENCES organizations(id),
      email TEXT NOT NULL UNIQUE,
      password_hash TEXT NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS products (
      id SERIAL PRIMARY KEY,
      organization_id INTEGER NOT NULL REFERENCES organizations(id),
      name TEXT NOT NULL,
      sku TEXT NOT NULL,
      description TEXT,
      quantity_on_hand INTEGER DEFAULT 0,
      cost_price NUMERIC(12,2),
      selling_price NUMERIC(12,2),
      low_stock_threshold INTEGER,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(organization_id, sku)
    );
  `);
  console.log('PostgreSQL database initialized');
}

module.exports = { getDb, withTransaction, initDb };
