const express = require('express');
const pool = require('../config/database');
const auth = require('../middleware/auth');
const router = express.Router();

router.get('/', auth, async (req, res) => {
  const result = await pool.query(`SELECT * FROM test_cases WHERE customer_id=$1 ORDER BY created_at DESC`, [req.user.customer_id]);
  res.json({ success: true, data: result.rows });
});

router.post('/', auth, async (req, res) => {
  const { testName, testType, description, configuration, expectedResult } = req.body;
  if (!testName || !testType) return res.status(400).json({ success: false, message: 'testName and testType are required' });
  const result = await pool.query(
    `INSERT INTO test_cases(customer_id,test_name,test_type,description,configuration,expected_result,created_by)
     VALUES($1,$2,$3,$4,$5,$6,$7) RETURNING *`,
    [req.user.customer_id, testName, testType, description, JSON.stringify(configuration || {}), expectedResult, req.user.id]
  );
  res.status(201).json({ success: true, data: result.rows[0] });
});

module.exports = router;
