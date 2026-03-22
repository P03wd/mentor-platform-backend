const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
require("dotenv").config();

const app = express();
const server = http.createServer(app);

// ✅ USE ENV PORT
const PORT = process.env.PORT || 5000;

// ✅ SESSION TRACKING (IMPORTANT)
const sessions = {};

const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL || "*",
    methods: ["GET", "POST"],
  },
});

io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  // JOIN SESSION
  socket.on("join-session", (sessionId) => {
    socket.join(sessionId);

    if (!sessions[sessionId]) {
      sessions[sessionId] = [];
    }

    sessions[sessionId].push(socket.id);

    // ✅ ASSIGN ROLE
    if (sessions[sessionId].length === 1) {
      socket.emit("role", "caller");
    } else {
      socket.emit("role", "receiver");
    }

    console.log("Joined session:", sessionId);
  });

  // 💬 CHAT
  socket.on("send-message", ({ sessionId, message }) => {
    io.to(sessionId).emit("receive-message", message);
  });

  // 💻 CODE
  socket.on("code-change", ({ sessionId, code }) => {
    socket.to(sessionId).emit("receive-code", code);
  });

  // 🎥 WEBRTC SIGNALING
  socket.on("offer", ({ sessionId, offer }) => {
    socket.to(sessionId).emit("offer", offer);
  });

  socket.on("answer", ({ sessionId, answer }) => {
    socket.to(sessionId).emit("answer", answer);
  });

  socket.on("ice-candidate", ({ sessionId, candidate }) => {
    socket.to(sessionId).emit("ice-candidate", candidate);
  });

  // 🔌 DISCONNECT
  socket.on("disconnect", () => {
    console.log("User disconnected");

    for (let sessionId in sessions) {
      sessions[sessionId] = sessions[sessionId].filter(
        (id) => id !== socket.id
      );
    }
  });
});

// TEST ROUTE
app.get("/", (req, res) => {
  res.send("Server running 🚀");
});

// ✅ USE ENV PORT
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});