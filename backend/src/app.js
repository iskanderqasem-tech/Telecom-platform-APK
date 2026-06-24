const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');

const authRoutes = require('./routes/auth');
const deviceRoutes = require('./routes/devices');
const testCaseRoutes = require('./routes/testcases');
const executionRoutes = require('./routes/executions');
const resultRoutes = require('./routes/results');
const reportRoutes = require('./routes/reports');

const app = express();

app.use(helmet());
app.use(cors({ origin: process.env.CORS_ORIGIN || '*', credentials: true }));
app.use(express.json({ limit: '2mb' }));
app.use(morgan('dev'));

app.get('/health', (req, res) => {
  res.json({ success: true, message: 'Telecom Test Platform API Online' });
});

app.use('/api/auth', authRoutes);
app.use('/api/devices', deviceRoutes);
app.use('/api/testcases', testCaseRoutes);
app.use('/api/executions', executionRoutes);
app.use('/api/results', resultRoutes);
app.use('/api/reports', reportRoutes);

app.use((req, res) => res.status(404).json({ success: false, message: 'Route not found' }));

module.exports = app;
