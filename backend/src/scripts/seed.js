const bcrypt = require('bcryptjs');
const pool = require('../config/database');

async function run() {
  const email = 'admin@example.com';
  const existing = await pool.query('SELECT id FROM users WHERE email=$1', [email]);
  if (existing.rows.length) {
    console.log('Seed user already exists');
    await pool.end();
    return;
  }
  const customer = await pool.query(
    `INSERT INTO customers(name, contact_email, subscription_plan)
     VALUES($1,$2,$3) RETURNING id`,
    ['Demo Telecom Customer', email, 'MVP']
  );
  const passwordHash = await bcrypt.hash('Admin123!', 10);
  await pool.query(
    `INSERT INTO users(customer_id,email,password_hash,first_name,last_name,role)
     VALUES($1,$2,$3,$4,$5,$6)`,
    [customer.rows[0].id, email, passwordHash, 'Demo', 'Admin', 'CUSTOMER_ADMIN']
  );

  await pool.query(
    `INSERT INTO devices(customer_id, device_label, device_identifier, imei, msisdn, manufacturer, model, android_version, network_operator, status, battery_level, signal_strength, network_type, last_seen)
     VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,NOW())`,
    [customer.rows[0].id, 'Demo Android Agent A', 'demo-agent-a', '000000000000001', '+64210000001', 'Samsung', 'S24', '15', '2degrees', 'ONLINE', 92, -82, 'LTE']
  );

  await pool.query(
    `INSERT INTO test_cases(customer_id,test_name,test_type,description,configuration,expected_result,created_by)
     SELECT $1,$2,$3,$4,$5,$6,id FROM users WHERE email=$7`,
    [customer.rows[0].id, 'MO Voice Call Smoke Test', 'VOICE_CALL', 'Dial B-party and validate call duration.', JSON.stringify({targetNumber:'+64210000002', durationSeconds:10}), 'Call placed and duration validated', email]
  );

  console.log('Seed complete: admin@example.com / Admin123!');
  await pool.end();
}
run().catch(err => { console.error(err); process.exit(1); });
