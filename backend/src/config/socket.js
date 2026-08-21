let ioInstance = null;

const initSocket = (io) => {
  ioInstance = io;

  io.on('connection', (socket) => {
    console.log(`Socket client connected: ${socket.id}`);

    socket.on('join_event', (eventId) => {
      if (eventId) {
        socket.join(`event:${eventId}`);
        console.log(`Socket ${socket.id} joined room event:${eventId}`);
      }
    });

    socket.on('leave_event', (eventId) => {
      if (eventId) {
        socket.leave(`event:${eventId}`);
        console.log(`Socket ${socket.id} left room event:${eventId}`);
      }
    });

    socket.on('disconnect', () => {
      console.log(`Socket client disconnected: ${socket.id}`);
    });
  });

  return io;
};

const getIO = () => {
  return ioInstance;
};

const emitSeatUpdate = (eventId, payload) => {
  if (ioInstance) {
    ioInstance.to(`event:${eventId}`).emit('seat_status_updated', payload);
  }
};

module.exports = { initSocket, getIO, emitSeatUpdate };
