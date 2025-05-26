import { Server } from 'socket.io';
import { Server as HttpServer } from 'http';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

interface SocketUser {
  userId: string;
  socketId: string;
}

const connectedUsers: SocketUser[] = [];

export const initializeSocket = (io: Server) => {
  // Authentication middleware
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token;
      if (!token) {
        return next(new Error('Authentication error'));
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key') as { userId: string };
      const user = await prisma.user.findUnique({
        where: { id: decoded.userId },
      });

      if (!user) {
        return next(new Error('User not found'));
      }

      socket.data.user = user;
      next();
    } catch (error) {
      next(new Error('Authentication error'));
    }
  });

  io.on('connection', (socket) => {
    const userId = socket.data.user.id;

    // Add user to connected users
    connectedUsers.push({ userId, socketId: socket.id });

    // Update user's last seen
    prisma.user.update({
      where: { id: userId },
      data: { lastSeen: new Date() },
    });

    // Join user's room for direct messages
    socket.join(userId);

    // Handle private messages
    socket.on('privateMessage', async ({ receiverId, content }) => {
      try {
        const message = await prisma.message.create({
          data: {
            content,
            senderId: userId,
            receiverId,
          },
          include: {
            sender: {
              select: {
                id: true,
                username: true,
              },
            },
          },
        });

        // Send message to receiver if online
        const receiver = connectedUsers.find((user) => user.userId === receiverId);
        if (receiver) {
          io.to(receiver.socketId).emit('newMessage', message);
        }

        // Send confirmation to sender
        socket.emit('messageSent', message);
      } catch (error) {
        socket.emit('error', 'Failed to send message');
      }
    });

    // Handle typing status
    socket.on('typing', ({ receiverId }) => {
      const receiver = connectedUsers.find((user) => user.userId === receiverId);
      if (receiver) {
        io.to(receiver.socketId).emit('userTyping', userId);
      }
    });

    // Handle stop typing
    socket.on('stopTyping', ({ receiverId }) => {
      const receiver = connectedUsers.find((user) => user.userId === receiverId);
      if (receiver) {
        io.to(receiver.socketId).emit('userStoppedTyping', userId);
      }
    });

    // Handle online status
    socket.on('setOnline', async () => {
      await prisma.user.update({
        where: { id: userId },
        data: { status: 'ONLINE' },
      });

      // Notify all connected users
      io.emit('userStatusChanged', { userId, status: 'ONLINE' });
    });

    // Handle offline status
    socket.on('setOffline', async () => {
      await prisma.user.update({
        where: { id: userId },
        data: { status: 'OFFLINE', lastSeen: new Date() },
      });

      // Notify all connected users
      io.emit('userStatusChanged', { userId, status: 'OFFLINE' });
    });

    // Handle disconnection
    socket.on('disconnect', async () => {
      // Remove user from connected users
      const index = connectedUsers.findIndex((user) => user.userId === userId);
      if (index !== -1) {
        connectedUsers.splice(index, 1);
      }

      // Update user's status
      await prisma.user.update({
        where: { id: userId },
        data: { status: 'OFFLINE', lastSeen: new Date() },
      });

      // Notify all connected users
      io.emit('userStatusChanged', { userId, status: 'OFFLINE' });
    });
  });

  return io;
}; 