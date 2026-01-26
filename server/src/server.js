// server.js - Server startup logic with Socket.IO
import 'dotenv/config';
import { createServer } from 'http';
import app from './app.js';
import connectDB from './config/db.js';
import { initializeSocket } from './config/socketio.js';

const PORT = process.env.PORT || 5000;

// Connect to database and start server
connectDB().then(() => {
    const server = createServer(app);

    // Initialize Socket.IO
    initializeSocket(server);

    server.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
    });
});
