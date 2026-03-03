import { io, Socket } from 'socket.io-client';

let socket: Socket | null = null;

export const initSocketConnection = (userId?: string) => {
  if (!socket) {
    const socketUrl = import.meta.env.VITE_API_BASE_URL?.replace('/api', '') || 'http://localhost:5000';
    socket = io(socketUrl, { transports: ['websocket', 'polling'] });
    socket.on('connect', () => {
      if (userId) {
        socket?.emit('user-connected', { userId });
      }
    });
  } else if (userId && socket.connected) {
    socket.emit('user-connected', { userId });
  }
  return socket;
};

export const getSocket = () => {
  if (!socket) {
    throw new Error('Socket not initialized');
  }
  return socket;
};
