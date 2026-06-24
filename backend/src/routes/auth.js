const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('../config/database');
const jwtConfig = require('../config/jwt');
const auth = require('../middleware/auth');

const router = express.Router();

router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ success: false, message: 'Email and password are required' });

  const result = await pool.query(
    `SELECT u.*, c.name AS customer_name FROM users u JOIN customers c ON c.id=u.customer_id WHERE u.email=$1 AND u.is_active=true`,
    [email]
  );
  const user = result.rows[0];
  if (!user) return res.status(401).json({ success: false, message: 'Invalid credentials' });

  const ok = await bcrypt.compare(password, user.password_hash);
  if (!ok) return res.status(401).json({ success: false, message: 'Invalid credentials' });

  const token = jwt.sign({ id: user.id, customer_id: user.customer_id, email: user.email, role: user.role }, jwtConfig.secret, { expiresIn: jwtConfig.expiresIn });
  res.json({
    success: true,
    token,
    user: { id: user.id, email: user.email, firstName: user.first_name, lastName: user.last_name, role: user.role, customerId: user.customer_id, customerName: user.customer_name }
  });
});

router.get('/me', auth, async (req, res) => {
  const result = await pool.query(`SELECT id,email,first_name,last_name,role,customer_id FROM users WHERE id=$1`, [req.user.id]);
  res.json({ success: true, user: result.rows[0] });
});

module.exports = router;
