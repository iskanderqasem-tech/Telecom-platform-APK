const registry = require('./deviceRegistry');

function sendCommand(deviceIdentifier, command) {
  const socket = registry.getDevice(deviceIdentifier);
  if (!socket || socket.readyState !== 1) return false;
  socket.send(JSON.stringify(command));
  return true;
}

module.exports = { sendCommand };
