const WebSocket = require('ws');
const pool = require('../../config/database');
const registry = require('./deviceRegistry');

module.exports = function initWebSocket(server) {
  const wss = new WebSocket.Server({ server, path: '/ws' });

  wss.on('connection', (socket) => {
    console.log('WebSocket connected');

    socket.on('message', async (message) => {
      try {
        const data = JSON.parse(message.toString());

        if (data.type === 'REGISTER') {
          const deviceIdentifier = data.deviceIdentifier || data.deviceId;
          registry.registerDevice(deviceIdentifier, socket);
          socket.deviceIdentifier = deviceIdentifier;
          await pool.query(
            `UPDATE devices SET status='ONLINE', last_seen=NOW(), battery_level=COALESCE($2,battery_level), signal_strength=COALESCE($3,signal_strength), network_type=COALESCE($4,network_type), updated_at=NOW() WHERE device_identifier=$1`,
            [deviceIdentifier, data.batteryLevel, data.signalStrength, data.networkType]
          );
          socket.send(JSON.stringify({ type: 'REGISTERED', deviceIdentifier }));
        }

        if (data.type === 'HEARTBEAT') {
          const deviceIdentifier = data.deviceIdentifier || socket.deviceIdentifier;
          const device = await pool.query('SELECT id, customer_id FROM devices WHERE device_identifier=$1', [deviceIdentifier]);
          if (device.rows.length) {
            await pool.query(
              `UPDATE devices SET status='ONLINE', last_seen=NOW(), battery_level=$2, signal_strength=$3, network_type=$4, ip_address=$5, updated_at=NOW() WHERE id=$1`,
              [device.rows[0].id, data.batteryLevel || null, data.signalStrength || null, data.networkType || null, data.ipAddress || null]
            );
            await pool.query(
              `INSERT INTO agent_heartbeats(customer_id,device_id,battery_level,signal_strength,network_type,ip_address) VALUES($1,$2,$3,$4,$5,$6)`,
              [device.rows[0].customer_id, device.rows[0].id, data.batteryLevel || null, data.signalStrength || null, data.networkType || null, data.ipAddress || null]
            );
          }
        }

        if (data.type === 'RESULT') {
          await pool.query(
            `INSERT INTO results(customer_id,execution_id,device_id,result_status,actual_result,expected_result,execution_log,metrics)
             SELECT e.customer_id, e.id, d.id, $3, $4, $5, $6, $7::jsonb
             FROM executions e
             LEFT JOIN devices d ON d.device_identifier=$2
             WHERE e.id=$1`,
            [data.executionId, data.deviceIdentifier, data.status || 'PASS', data.actualResult || 'Agent result uploaded', data.expectedResult || '', data.executionLog || '', JSON.stringify(data.metrics || {})]
          );
          await pool.query(`UPDATE executions SET execution_status='COMPLETED', end_time=NOW(), updated_at=NOW() WHERE id=$1`, [data.executionId]);
        }
      } catch (err) {
        console.error('WebSocket error:', err.message);
      }
    });

    socket.on('close', async () => {
      if (socket.deviceIdentifier) {
        registry.unregisterDevice(socket.deviceIdentifier);
        await pool.query(`UPDATE devices SET status='OFFLINE', updated_at=NOW() WHERE device_identifier=$1`, [socket.deviceIdentifier]).catch(() => {});
      }
    });
  });
};
