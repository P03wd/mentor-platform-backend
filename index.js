const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
require("dotenv").config();

const app = express();
const server = http.createServer(app);

const PORT = process.env.PORT || 5000;

// ✅ SESSION TRACKING
const sessions = {};

const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL || "*",
    methods: ["GET", "POST"],
  },
});

io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  // 🔗 JOIN SESSION
  socket.on("join-session", (sessionId) => {
    socket.join(sessionId);

    if (!sessions[sessionId]) {
      sessions[sessionId] = [];
    }

    // ❌ PREVENT DUPLICATES (IMPORTANT FIX)
    if (!sessions[sessionId].includes(socket.id)) {
      sessions[sessionId].push(socket.id);
    }

    console.log("Users in session:", sessions[sessionId]);

    // ✅ ASSIGN ROLE
    if (sessions[sessionId].length === 1) {
      socket.emit("role", "caller");
    } else {
      socket.emit("role", "receiver");
    }

    // ✅ ONLY TRIGGER READY WHEN EXACTLY 2 USERS
    if (sessions[sessionId].length === 2) {
      console.log("🔥 Both users joined → sending ready");

      io.to(sessionId).emit("ready");
    }

    console.log("Joined session:", sessionId);
  });

  // 💬 CHAT
  socket.on("send-message", ({ sessionId, message }) => {
    io.to(sessionId).emit("receive-message", message);
  });

  // 💻 CODE SYNC
  socket.on("code-change", ({ sessionId, code }) => {
    socket.to(sessionId).emit("receive-code", code);
  });

  // 🎥 WEBRTC SIGNALING

  // OFFER
  socket.on("offer", ({ sessionId, offer }) => {
    console.log("📤 Offer sent");
    socket.to(sessionId).emit("offer", offer);
  });

  // ANSWER
  socket.on("answer", ({ sessionId, answer }) => {
    console.log("📤 Answer sent");
    socket.to(sessionId).emit("answer", answer);
  });

  // ICE
  socket.on("ice-candidate", ({ sessionId, candidate }) => {
    socket.to(sessionId).emit("ice-candidate", candidate);
  });

  // 🔌 DISCONNECT CLEANUP
  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);

    for (let sessionId in sessions) {
      sessions[sessionId] = sessions[sessionId].filter(
        (id) => id !== socket.id
      );

      // 🧹 REMOVE EMPTY SESSION
      if (sessions[sessionId].length === 0) {
        delete sessions[sessionId];
      }
    }
  });
});

// ✅ TEST ROUTE
app.get("/", (req, res) => {
  res.send("Server running 🚀");
});

// ✅ START SERVER
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});