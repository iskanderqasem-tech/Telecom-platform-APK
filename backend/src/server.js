require('dotenv').config();
const http = require('http');
const app = require('./app');
const initWebSocket = require('./services/websocket/websocketManager');

const PORT = process.env.PORT || 4000;
const server = http.createServer(app);
initWebSocket(server);

server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
