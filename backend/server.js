const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const { errorHandler } = require('./middleware/errorMiddleware');

dotenv.config();

const http = require('http');
const { Server } = require('socket.io');

const app = express();
const PORT = process.env.PORT || 5000;

// Create HTTP server
const server = http.createServer(app);

// Initialize Socket.io
const io = new Server(server, {
    cors: {
        origin: "*", // Allow all origins for development, restrict in production
        methods: ["GET", "POST", "PUT", "DELETE"]
    }
});

// Make io accessible in routes
app.set('socketio', io);

io.on('connection', (socket) => {
    console.log(`New client connected: ${socket.id}`);

    socket.on('join_room', (userId) => {
        if (userId) {
            socket.join(userId);
            console.log(`Socket ${socket.id} joined room ${userId}`);
            socket.emit('room_joined_ack', userId);
        }
    });

    socket.on('disconnect', () => {
        console.log('Client disconnected');
    });
});

//  SECURITY MIDDLEWARE
app.use(helmet({
    crossOriginResourcePolicy: false,
}));
app.use(morgan('dev'));

//  RATE LIMITING
const limiter = rateLimit({
    windowMs: 10 * 60 * 1000, // 10 minutes
    max: 1000, // Limit each IP to 1000 requests per 10 mins
    standardHeaders: true,
    legacyHeaders: false,
});
app.use(limiter);

//  MIDDLEWARE 
app.use(cors());
app.use(express.json());

// DATABASE CONNECTION 
mongoose.connect(
    process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/feedback_app'
)
    .then(() => console.log('MongoDB Connected Successfully'))
    .catch(err => {
        console.error('MongoDB Connection Error:', err.message);
        console.log('Make sure MongoDB is installed and running!');
    });

//  ROUTES 
app.use('/api/auth', require('./routes/auth'));
app.use('/api/users', require('./routes/users'));
app.use('/api/feedbacks', require('./routes/feedback'));
app.use('/api/notifications', require('./routes/notification'));
app.use('/api/notifications', require('./routes/notification'));

//  DEFAULT ROUTE 
app.get('/', (req, res) => {
    res.send('Feedback API is running');
});

//  ERROR HANDLER
app.use(errorHandler);

server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
