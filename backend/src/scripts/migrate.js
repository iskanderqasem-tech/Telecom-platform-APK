const fs = require('fs');
const path = require('path');
const pool = require('../config/database');

async function run() {
  const schemaPath = path.join(__dirname, '../../../database/schema.sql');
  const sql = fs.readFileSync(schemaPath, 'utf8');
  await pool.query(sql);
  console.log('Database migration complete');
  await pool.end();
}
run().catch(err => { console.error(err); process.exit(1); });
