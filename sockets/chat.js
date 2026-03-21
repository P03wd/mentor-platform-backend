module.exports = (io) => {
  io.on("connection", (socket) => {

    socket.on("send-message", ({ sessionId, message }) => {
      io.to(sessionId).emit("receive-message", message);
    });

  });
};