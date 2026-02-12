// socketio.js - Socket.IO configuration
import { Server } from 'socket.io';

let io;

export const initializeSocket = (server) => {
    io = new Server(server, {
        cors: {
            origin: [process.env.CLIENT_URL, 'http://localhost:5173', 'http://localhost:3000'],
            methods: ['GET', 'POST'],
            credentials: true
        }
    });

    // Store user socket mappings
    const userSockets = new Map();

    io.on('connection', (socket) => {
        console.log('[Socket.IO] Client connected:', socket.id);

        // User joins with their ID
        socket.on('join', (userId) => {
            if (userId) {
                userSockets.set(userId, socket.id);
                socket.userId = userId;
                console.log(`[Socket.IO] User ${userId} joined with socket ${socket.id}`);
            }
        });

        socket.on('disconnect', () => {
            if (socket.userId) {
                userSockets.delete(socket.userId);
                console.log(`[Socket.IO] User ${socket.userId} disconnected`);
            }
        });
    });

    // Attach userSockets to io for use elsewhere
    io.userSockets = userSockets;

    return io;
};

export const getIO = () => {
    if (!io) {
        throw new Error('Socket.IO not initialized');
    }
    return io;
};

// Helper to emit notification to a specific user
export const emitToUser = (userId, event, data) => {
    const io = getIO();
    const socketId = io.userSockets.get(userId.toString());
    if (socketId) {
        io.to(socketId).emit(event, data);
        console.log(`[Socket.IO] Emitted ${event} to user ${userId}`);
    }
};
