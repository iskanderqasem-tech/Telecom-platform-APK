const express = require('express');
const bcrypt = require('bcryptjs');
const pool = require('../config/database');
const auth = require('../middleware/auth');
const router = express.Router();

router.get('/', auth, async (req, res) => {
  const result = await pool.query(`SELECT * FROM devices WHERE customer_id=$1 ORDER BY created_at DESC`, [req.user.customer_id]);
  res.json({ success: true, data: result.rows });
});

router.post('/', auth, async (req, res) => {
  const { deviceLabel, deviceIdentifier, imei, msisdn, manufacturer, model, androidVersion, networkOperator } = req.body;
  if (!deviceIdentifier) return res.status(400).json({ success: false, message: 'deviceIdentifier is required' });
  const result = await pool.query(
    `INSERT INTO devices(customer_id,device_label,device_identifier,imei,msisdn,manufacturer,model,android_version,network_operator,status)
     VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9,'OFFLINE') RETURNING *`,
    [req.user.customer_id, deviceLabel, deviceIdentifier, imei, msisdn, manufacturer, model, androidVersion, networkOperator]
  );
  res.status(201).json({ success: true, data: result.rows[0] });
});

router.post('/register', async (req, res) => {
  const { customerId, deviceLabel, deviceIdentifier, deviceSecret, imei, msisdn, manufacturer, model, androidVersion, networkOperator } = req.body;
  if (!customerId || !deviceIdentifier) return res.status(400).json({ success: false, message: 'customerId and deviceIdentifier are required' });
  const hash = deviceSecret ? await bcrypt.hash(deviceSecret, 10) : null;
  const result = await pool.query(
    `INSERT INTO devices(customer_id,device_label,device_identifier,device_secret_hash,imei,msisdn,manufacturer,model,android_version,network_operator,status,last_seen)
     VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,'OFFLINE',NOW())
     ON CONFLICT(device_identifier) DO UPDATE SET device_label=EXCLUDED.device_label, imei=EXCLUDED.imei, msisdn=EXCLUDED.msisdn, manufacturer=EXCLUDED.manufacturer, model=EXCLUDED.model, android_version=EXCLUDED.android_version, network_operator=EXCLUDED.network_operator, updated_at=NOW()
     RETURNING *`,
    [customerId, deviceLabel, deviceIdentifier, hash, imei, msisdn, manufacturer, model, androidVersion, networkOperator]
  );
  res.status(201).json({ success: true, data: result.rows[0] });
});

module.exports = router;
