import { Server, Socket } from 'socket.io';
import { logCall } from './services/callService';

export function setupSocket(io: Server) {
  io.on('connection', (socket: Socket) => {
    console.log('A user connected:', socket.id);

    // Join private chat room
    socket.on('join_private', ({ userId }) => {
      socket.join(`private_${userId}`);
      console.log(`User ${userId} joined private room`);
    });

    // Join group chat room
    socket.on('join_group', ({ groupId }) => {
      socket.join(`group_${groupId}`);
      console.log(`User joined group room ${groupId}`);
    });

    // Handle sending private message
    socket.on('private_message', ({ toUserId, message }) => {
      io.to(`private_${toUserId}`).emit('private_message', message);
    });

    // Handle sending group message
    socket.on('group_message', ({ groupId, message }) => {
      io.to(`group_${groupId}`).emit('group_message', message);
    });

    // WebRTC Call Signaling
    socket.on('call_user', async ({ userToCall, signalData, from, name }) => {
      io.to(`private_${userToCall}`).emit('call_user', {
        signal: signalData,
        from,
        name
      });
    });

    socket.on('answer_call', ({ to, signal }) => {
      io.to(`private_${to}`).emit('call_accepted', signal);
    });

    socket.on('call_ended', async ({ callerId, receiverId, duration, type }) => {
      try {
        // Log the call in database
        await logCall(callerId, receiverId, duration, type);
        // Notify the other user
        io.to(`private_${receiverId}`).emit('call_ended');
      } catch (error) {
        console.error('Error logging call:', error);
      }
    });

    socket.on('disconnect', () => {
      console.log('A user disconnected:', socket.id);
    });
  });
} 