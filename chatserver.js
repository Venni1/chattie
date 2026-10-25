import WebSocket, { WebSocketServer } from 'ws';

const websocket = new WebSocketServer({
  port: 8001,
  perMessageDeflate: {
    zlibDeflateOptions: {
      chunkSize: 1024,
      memLevel: 7,
      level: 3
    },
    zlibInflateOptions: {
      chunkSize: 10 * 1024
    },
    clientNoContextTakeover: true,
    serverNoContextTakeover: true,
    serverMaxWindowBits: 10,
    concurrencyLimit: 10,
    threshold: 1024
  }
});

websocket.getUniqueID = function () {
    function s4() {
        return Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1);
    }
    return s4() + s4() + '-' + s4();
};

websocket.on('connection', (ws, req) => {
    ws.id = websocket.getUniqueID();

    websocket.clients.forEach(function each(client) {
        console.log('Client.ID: ' + client.id);
    });
});
websocket.on("message", (ws, message) => {
    try {
        var obj = JSON.parse(message)
        switch (message) {
            case "connect":
                username = message.name
                ws.username = username
                websocket.send('{"message": "message_down", data: {"name": "Server", "message": "' + toString(username) + ' just joined! Say hi!", "special": "true" }}')
                break;

            case "message_up":
                websocket.send('{"message": "message_down", data: {"name": "' + ws.username + '", "message": "' + toString(username) + '", "special": "false" }}')

        
            default:
                break;
        }
    } catch (error) {
        
    }
})