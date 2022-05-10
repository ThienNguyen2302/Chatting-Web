const express = require("express");
const app = express()
const server = require("http").createServer(app)
const WebSocketServer  = require("ws")
const wss = new WebSocketServer.Server({server: server})

app.get("/", (req,res) => {
    res.send("OK")
})

// wss.on('connection', function connection(ws) {
//     console.log("A new client connected")
//     ws.send("Welcome new client")
//     ws.on('message', function message(data) {
//         console.log('received: %s', data);
//         ws.send("Your mesage: " + data)
//     });

//     ws.send('something');
// });

wss.on('connection', function connection(ws) {
    ws.on('message', function incoming(data) {
      wss.clients.forEach(function each(client) {
        if (client !== ws && client.readyState === WebSocketServer.OPEN) {
          client.send(data);
        }
      })
    })
  })
  
const port = 8080
server.listen(port, () => {
    console.log("http://localhost:" + port)
})