import WebSocket, { WebSocketServer } from "ws";

const websocket = new WebSocketServer({
  port: 8001,
  perMessageDeflate: {
    zlibDeflateOptions: {
      chunkSize: 1024,
      memLevel: 7,
      level: 3,
    },
    zlibInflateOptions: {
      chunkSize: 10 * 1024,
    },
    clientNoContextTakeover: true,
    serverNoContextTakeover: true,
    serverMaxWindowBits: 10,
    concurrencyLimit: 10,
    threshold: 1024,
  },
});
function broadcast(data) {
  const message = JSON.stringify(data);

  for (const client of websocket.clients) {
    if (client.readyState === WebSocket.OPEN) {
      client.send(message);
    }
  }
}

websocket.getUniqueID = function () {
  function s4() {
    return Math.floor((1 + Math.random()) * 0x10000)
      .toString(16)
      .substring(1);
  }
  return s4() + s4() + "-" + s4();
};

websocket.on("connection", (ws) => {
  console.log("Client connected");

  ws.on("message", (message) => {
    try {
      const obj = JSON.parse(message.toString());
      console.log("Received:", obj);

      switch (obj.message) {
        case "connect": {
          ws.username = obj.name;

          broadcast({
            message: "message_down",
            data: {
              name: "Server",
              message: `${ws.username} just joined! Say hi!`,
              special: true
            }
          });
          break;
        }

        case "message_up": {
          if (!ws.username) {
            ws.send(JSON.stringify({
              message: "error",
              data: "Connect with a username first."
            }));
            break;
          }

          broadcast({
            message: "message_down",
            data: {
              name: ws.username,
              message: obj.data,
              special: false
            }
          });
          break;
        }

        default:
          console.log("Unknown message type:", obj.message);
          break;
      }
    } catch (error) {
      console.error("Invalid incoming message:", error);
    }
  });
});
