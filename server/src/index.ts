import express from 'express';
import dotenv from 'dotenv';
import bodyParser from 'body-parser';
import cors from 'cors';
import { Server, Socket } from 'socket.io';
import { createServer } from 'http';
import userRoutes from './routes/userRoute.js';
import chatRoutes from './routes/chatRoute.js';
import messageRoutes from './routes/messageRoute.js';
import jwt from 'jsonwebtoken';

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
  type?: string;
  replyToId?: string;
  attachments?: any[];
}

dotenv.config();

// Debug environment variables
console.log('🔧 Environment Configuration:');
console.log('  - PORT:', process.env.PORT || 4000);
console.log('  - BASE_URL:', process.env.BASE_URL || 'http://localhost:3000');
console.log('  - SECRET:', process.env.SECRET ? 'Set' : 'Not set');
console.log('  - CLIENT_ID:', process.env.CLIENT_ID ? 'Set' : 'Not set');

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

// Test endpoint
app.get('/test', (req, res) => {
  res.status(200).json({ message: 'Server is running', timestamp: new Date().toISOString() });
});

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
  socket.on('join chat', (data: { chatId: string } | string) => {
    try {
      const chatId = typeof data === 'string' ? data : data.chatId;
      
      if (!chatId || !socket.userId) {
        throw new Error('Invalid room or user data');
      }

      if (socket.currentRoom) {
        socket.leave(socket.currentRoom);
        console.log(`User ${socket.userId} left room: ${socket.currentRoom}`);
      }
      
      socket.join(chatId);
      socket.currentRoom = chatId;
      console.log(`User ${socket.userId} joined room: ${chatId}`);
    } catch (error) {
      console.error('Join chat error:', error);
      socket.emit('join_error', 'Failed to join chat room');
    }
  });

  // Leave chat room
  socket.on('leave chat', (data: { chatId: string } | string) => {
    try {
      const chatId = typeof data === 'string' ? data : data.chatId;
      
      if (socket.currentRoom === chatId) {
        socket.leave(chatId);
        socket.currentRoom = undefined;
        console.log(`User ${socket.userId} left room: ${chatId}`);
      }
    } catch (error) {
      console.error('Leave chat error:', error);
    }
  });

  // Handle new messages
  socket.on('send message', async (newMessageReceived: MessageData) => {
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

  // Fallback for old message event (backward compatibility)
  socket.on('new message', async (newMessageReceived: MessageData) => {
    try {
      if (!newMessageReceived?.chatId) {
        throw new Error('Chat ID is required');
      }

      if (!newMessageReceived.sender?.id) {
        throw new Error('Sender information is required');
      }

      console.log(`Broadcasting message to room: ${newMessageReceived.chatId} (legacy event)`);
      io.to(newMessageReceived.chatId).emit('message received', newMessageReceived);
      
    } catch (error: any) {
      console.error('Message broadcast error:', error);
      socket.emit('message_error', {
        error: 'Failed to send message',
        details: error.message
      });
    }
  });

  // Handle typing indicators
  socket.on('typing', (data: { chatId: string; userId: string; isTyping: boolean }) => {
    try {
      if (!data.chatId || !data.userId) {
        throw new Error('Chat ID and user ID are required');
      }

      if (data.isTyping) {
        socket.to(data.chatId).emit('typing start', { userId: data.userId, chatId: data.chatId });
      } else {
        socket.to(data.chatId).emit('typing stop', { userId: data.userId, chatId: data.chatId });
      }
    } catch (error) {
      console.error('Typing indicator error:', error);
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