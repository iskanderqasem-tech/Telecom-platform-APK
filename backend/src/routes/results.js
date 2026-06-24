const express = require('express');
const pool = require('../config/database');
const auth = require('../middleware/auth');
const router = express.Router();

router.get('/', auth, async (req, res) => {
  const result = await pool.query(
    `SELECT r.*, e.execution_status, tc.test_name, tc.test_type, d.device_label
     FROM results r
     LEFT JOIN executions e ON e.id=r.execution_id
     LEFT JOIN test_cases tc ON tc.id=e.test_case_id
     LEFT JOIN devices d ON d.id=r.device_id
     WHERE r.customer_id=$1
     ORDER BY r.created_at DESC`,
    [req.user.customer_id]
  );
  res.json({ success: true, data: result.rows });
});

router.post('/upload', async (req, res) => {
  const { executionId, deviceIdentifier, status, actualResult, expectedResult, executionLog, metrics } = req.body;
  const device = await pool.query(`SELECT id, customer_id FROM devices WHERE device_identifier=$1`, [deviceIdentifier]);
  if (!device.rows[0]) return res.status(404).json({ success: false, message: 'Device not found' });
  await pool.query(
    `INSERT INTO results(customer_id,execution_id,device_id,result_status,actual_result,expected_result,execution_log,metrics)
     VALUES($1,$2,$3,$4,$5,$6,$7,$8)`,
    [device.rows[0].customer_id, executionId, device.rows[0].id, status || 'PASS', actualResult || '', expectedResult || '', executionLog || '', JSON.stringify(metrics || {})]
  );
  await pool.query(`UPDATE executions SET execution_status='COMPLETED', end_time=NOW(), updated_at=NOW() WHERE id=$1`, [executionId]);
  res.json({ success: true });
});

module.exports = router;
