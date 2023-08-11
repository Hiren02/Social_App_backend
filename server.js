"use strict";
console.log(
  "//************************* Social Internal**************************//"
);
var res = require("dotenv").config();
//Import Config
const config = require("./lib/config");
config.mongoDBConfig(config.defaultMongoDBConfig, (err) => {
  if (err) {
    console.log({ err });
    return;
  }
  const express = require("express");
  // init express app
  const app = express();
  const socket = require("socket.io");
  //app.use(express.static('img'))
  // config express
  config.expressConfig(app);
  if (err) return res.json(err);
  // attach the routes to the app
  require("./lib/routes")(app);
  // start server
  const server = app.listen(process.env.PORT || 6000, () => {
    console.log(`Express server listening on ${process.env.PORT}`);
  });

  const io = socket(server, {
    cors: {
      origin: ["http://localhost:3000", "http://localhost:3001"],
    },
  });

  global.onlineUsers = new Map();
  io.on("connection", (socket) => {
    global.chatSocket = socket;
    socket.on("add-user", (userId) => {
      console.log("connection established");
      onlineUsers.set(userId, socket.id);
    });

    socket.on("send-msg", (data) => {
      const sendUserSocket = onlineUsers.get(data.to);
      if (sendUserSocket) {
        // console.log("data-in send msg", data);
        socket.to(sendUserSocket).emit("msg-recieve", data);
      }
    });
  });
});
