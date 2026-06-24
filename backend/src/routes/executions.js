const express = require('express');
const pool = require('../config/database');
const auth = require('../middleware/auth');
const { sendCommand } = require('../services/websocket/commandDispatcher');
const router = express.Router();

router.get('/', auth, async (req, res) => {
  const result = await pool.query(
    `SELECT e.*, tc.test_name, tc.test_type FROM executions e LEFT JOIN test_cases tc ON tc.id=e.test_case_id WHERE e.customer_id=$1 ORDER BY e.created_at DESC`,
    [req.user.customer_id]
  );
  res.json({ success: true, data: result.rows });
});

router.post('/', auth, async (req, res) => {
  const { testCaseId, deviceIds = [] } = req.body;
  if (!testCaseId) return res.status(400).json({ success: false, message: 'testCaseId is required' });

  const tcResult = await pool.query(`SELECT * FROM test_cases WHERE id=$1 AND customer_id=$2`, [testCaseId, req.user.customer_id]);
  const testCase = tcResult.rows[0];
  if (!testCase) return res.status(404).json({ success: false, message: 'Test case not found' });

  const execution = await pool.query(
    `INSERT INTO executions(customer_id,test_case_id,started_by,execution_status,start_time) VALUES($1,$2,$3,'RUNNING',NOW()) RETURNING *`,
    [req.user.customer_id, testCaseId, req.user.id]
  );
  const executionId = execution.rows[0].id;

  let commandSent = false;
  for (const deviceId of deviceIds) {
    const device = await pool.query(`SELECT * FROM devices WHERE id=$1 AND customer_id=$2`, [deviceId, req.user.customer_id]);
    if (device.rows[0]) {
      await pool.query(`INSERT INTO execution_devices(execution_id,device_id,role) VALUES($1,$2,'A_PARTY')`, [executionId, deviceId]);
      commandSent = sendCommand(device.rows[0].device_identifier, {
        type: 'RUN_TEST',
        executionId,
        testType: testCase.test_type,
        configuration: testCase.configuration,
        expectedResult: testCase.expected_result
      }) || commandSent;
    }
  }

  if (!commandSent) {
    await pool.query(
      `INSERT INTO results(customer_id,execution_id,result_status,actual_result,expected_result,execution_log,metrics)
       VALUES($1,$2,'PASS','Simulated MVP execution completed. Connect Android Agent for real device run.',$3,'No online Android Agent was connected, so backend generated MVP simulated result.',$4)`,
      [req.user.customer_id, executionId, testCase.expected_result || '', JSON.stringify({ mode: 'SIMULATED', testType: testCase.test_type })]
    );
    await pool.query(`UPDATE executions SET execution_status='COMPLETED', end_time=NOW(), duration_seconds=1, updated_at=NOW() WHERE id=$1`, [executionId]);
  }

  res.status(201).json({ success: true, data: { executionId, commandSent } });
});

module.exports = router;
