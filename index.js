const http = require("http");
const express = require("express");
const fs = require("node:fs");
const { join } = require("node:path");
const { WebSocket, WebSocketServer } = require("ws");
var app = express();
const server = http.createServer(app);
// Static files
app.use("/static", express.static(join(__dirname, "public")));
// HTML
app.use("/", express.static(join(__dirname, "static")));

// The port the application runs. If you get an error, change the port.
// Default: 80
var port = 80;

// WebSocket setup

const websocket = new WebSocketServer({ server });
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


var getContents = (file, subfolder) => {
    let contents = fs.readFileSync(join(subfolder, file), (e) => {
        if (typeof e !== null) {
            console.log(e);
        }
    });
    return contents;
}
app.get("/", (req, res) => {
    res.type('html')
    res.send(getContents("index.html", "static"))
});
app.get("/chat", (req, res) => {
    res.type('html')
    res.send(getContents("chat.html", "static"))
});
server.listen(port, "0.0.0.0", () => {
    console.log(`Server listening on port ${port}`);
});