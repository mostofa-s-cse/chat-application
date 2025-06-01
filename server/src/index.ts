import express from 'express';
import dotenv from 'dotenv';
import bodyParser from 'body-parser';
import cors from 'cors';
import { Server, Socket } from 'socket.io';
import { createServer } from 'http';
import userRoutes from './routes/userRoute.js';
import chatRoutes from './routes/chatRoute.js';
import messageRoutes from './routes/messageRoute.js';

interface CustomSocket extends Socket {
  userId?: string;
  currentRoom?: string;
}

interface UserData {
  id: string;
  name?: string;
  email?: string;
}

interface MessageData {
  chatId: string;
  sender: {
    id: string;
    firstName?: string;
    lastName?: string;
    profilePic?: string;
    email?: string;
  };
  content?: string;
  id?: string;
  createdAt?: string;
}

dotenv.config();

const app = express();
const httpServer = createServer(app);

const corsConfig = {
  origin: process.env.BASE_URL || 'http://localhost:3000',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization', 'my-custom-header'],
};

const PORT = process.env.PORT || 4000;

// Middleware
app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ extended: true, limit: '50mb' }));
app.use(cors(corsConfig));

// Routes
app.use('/', userRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/message', messageRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Socket.io setup
const io = new Server(httpServer, {
  cors: corsConfig,
  transports: ['websocket'],
  pingTimeout: 60000,
  pingInterval: 25000,
});

const onlineUsers = new Map<string, string>();

io.on('connection', (socket: CustomSocket) => {
  console.log('A user connected:', socket.id);

  // Setup user connection
  socket.on('setup', (userData: UserData) => {
    try {
      if (!userData?.id) {
        throw new Error('Invalid user data');
      }
      
      socket.join(userData.id);
      socket.userId = userData.id;
      onlineUsers.set(userData.id, socket.id);
      socket.emit('connected');
      console.log(`User ${userData.id} setup complete`);
      socket.broadcast.emit('user online', userData.id);
    } catch (error) {
      console.error('Setup error:', error);
      socket.emit('setup_error', 'User setup failed');
    }
  });

  // Join chat room
  socket.on('join chat', (room: string) => {
    try {
      if (!room || !socket.userId) {
        throw new Error('Invalid room or user data');
      }

      if (socket.currentRoom) {
        socket.leave(socket.currentRoom);
        console.log(`User ${socket.userId} left room: ${socket.currentRoom}`);
      }
      
      socket.join(room);
      socket.currentRoom = room;
      console.log(`User ${socket.userId} joined room: ${room}`);
    } catch (error) {
      console.error('Join chat error:', error);
      socket.emit('join_error', 'Failed to join chat room');
    }
  });

  // Handle new messages
  socket.on('new message', async (newMessageReceived: MessageData) => {
    try {
      // console.log('Received message:', newMessageReceived); 
      
      if (!newMessageReceived?.chatId) {
        throw new Error('Chat ID is required');
      }

      if (!newMessageReceived.sender?.id) {
        throw new Error('Sender information is required');
      }

      console.log(`Broadcasting message to room: ${newMessageReceived.chatId}`);
      io.to(newMessageReceived.chatId).emit('message received', newMessageReceived);
      
    } catch (error: any) {
      console.error('Message broadcast error:', error);
      socket.emit('message_error', {
        error: 'Failed to send message',
        details: error.message
      });
    }
  });

  // Handle disconnection
  socket.on('disconnect', () => {
    if (socket.userId) {
      onlineUsers.delete(socket.userId);
      socket.broadcast.emit('user offline', socket.userId);
      console.log(`User ${socket.userId} disconnected`);
    }
  });
});

httpServer.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});