const devices = new Map();

function registerDevice(deviceId, socket) {
  devices.set(deviceId, socket);
}
function getDevice(deviceId) {
  return devices.get(deviceId);
}
function unregisterDevice(deviceId) {
  devices.delete(deviceId);
}
function listOnlineDeviceIds() {
  return [...devices.keys()];
}

module.exports = { registerDevice, getDevice, unregisterDevice, listOnlineDeviceIds };
