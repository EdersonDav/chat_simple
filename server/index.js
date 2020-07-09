import express from "express";
import socketIO from "socket.io";
import path from "path";
const app = express();

// const messages = [];
const messages = { room1: [], room2: [] };

// app.use("/", express.static(path.resolve(__dirname, "..", "public")));
app.use("/room1", express.static(path.resolve(__dirname, "..", "public")));
app.use("/room2", express.static(path.resolve(__dirname, "..", "public")));

const server = app.listen(5000, () => {
  console.log("server running port 5000");
});

const io = socketIO(server);

const room1 = io.of("/room1").on("connection", (socket) => {
  console.log("new_connection");
  socket.emit("update_messages", messages.room1);
  socket.on("new_connection", (data) => {
    messages.room1.push(data);

    room1.emit("update_messages", messages.room1);
  });
});

const room2 = io.of("/room2").on("connection", (socket) => {
  console.log("new_connection");
  socket.emit("update_messages", messages.room2);
  socket.on("new_connection", (data) => {
    messages.room2.push(data);

    room2.emit("update_messages", messages.room2);
  });
});

// io.on("connection", (socket) => {
//   console.log("new_connection");
//   socket.emit("update_messages", messages);
//   socket.on("new_connection", (data) => {
//     messages.push(data);

//     io.emit("update_messages", messages);
//   });
// });
