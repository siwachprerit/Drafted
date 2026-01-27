// socket.js - Socket.IO client configuration
import { io } from 'socket.io-client';

const SOCKET_URL = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000';

let socket = null;

export const initSocket = (userId) => {
    if (socket) return socket;

    socket = io(SOCKET_URL, {
        withCredentials: true,
        autoConnect: true
    });

    socket.on('connect', () => {
        console.log('[Socket.IO] Connected:', socket.id);
        if (userId) {
            socket.emit('join', userId);
        }
    });

    // If socket was already created but re-initialized (or reused), ensure we join
    if (socket.connected && userId) {
        socket.emit('join', userId);
    }

    socket.on('disconnect', () => {
        console.log('[Socket.IO] Disconnected');
    });

    return socket;
};

export const getSocket = () => socket;

export const disconnectSocket = () => {
    if (socket) {
        socket.disconnect();
        socket = null;
    }
};
