const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
require("dotenv").config();

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "*",
  },
});

io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  socket.on("join-session", (sessionId) => {
    socket.join(sessionId);
    console.log("Joined session:", sessionId);
  });

  socket.on("send-message", ({ sessionId, message }) => {
    io.to(sessionId).emit("receive-message", message);
  });
socket.on("code-change", ({ sessionId, code }) => {
  socket.to(sessionId).emit("receive-code", code);
});
// WebRTC signaling
socket.on("offer", ({ sessionId, offer }) => {
  socket.to(sessionId).emit("offer", offer);
});

socket.on("answer", ({ sessionId, answer }) => {
  socket.to(sessionId).emit("answer", answer);
});

socket.on("ice-candidate", ({ sessionId, candidate }) => {
  socket.to(sessionId).emit("ice-candidate", candidate);
});
  socket.on("disconnect", () => {
    console.log("User disconnected");
  });
});

app.get("/", (req, res) => {
  res.send("Server running");
});

server.listen(5000, () => {
  console.log("Server running on port 5000");
});