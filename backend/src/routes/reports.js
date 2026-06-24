const express = require('express');
const pool = require('../config/database');
const auth = require('../middleware/auth');
const router = express.Router();

router.get('/summary', auth, async (req, res) => {
  const devices = await pool.query(`SELECT status, COUNT(*)::int count FROM devices WHERE customer_id=$1 GROUP BY status`, [req.user.customer_id]);
  const executions = await pool.query(`SELECT execution_status, COUNT(*)::int count FROM executions WHERE customer_id=$1 GROUP BY execution_status`, [req.user.customer_id]);
  const results = await pool.query(`SELECT result_status, COUNT(*)::int count FROM results WHERE customer_id=$1 GROUP BY result_status`, [req.user.customer_id]);
  res.json({ success: true, data: { devices: devices.rows, executions: executions.rows, results: results.rows } });
});

module.exports = router;
