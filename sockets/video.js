module.exports = (io) => {
  io.on("connection", (socket) => {

    socket.on("offer", (data) => {
      socket.to(data.to).emit("offer", data);
    });

    socket.on("answer", (data) => {
      socket.to(data.to).emit("answer", data);
    });

    socket.on("ice-candidate", (data) => {
      socket.to(data.to).emit("ice-candidate", data);
    });

  });
};