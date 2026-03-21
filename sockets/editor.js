module.exports = (io) => {
  io.on("connection", (socket) => {

    socket.on("join-session", (sessionId) => {
      socket.join(sessionId);
    });

    socket.on("code-change", ({ sessionId, code }) => {
      socket.to(sessionId).emit("code-update", code);
    });

  });
};