import { io, Socket } from 'socket.io-client';

class SocketService {
  private socket: Socket | null = null;

  connect() {
    if (!this.socket) {
      const token = localStorage.getItem('accessToken');
      this.socket = io(process.env.REACT_APP_SOCKET_URL || 'http://localhost:4000', {
        auth: { token },
      });

      this.socket.on('connect', () => console.log('Socket connected'));
      this.socket.on('disconnect', () => console.log('Socket disconnected'));
      this.socket.on('error', (error) => console.error('Socket error:', error));
    }
    return this.socket;
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  getSocket() {
    return this.socket;
  }

  joinChat(chatId: string) {
    this.socket?.emit('join_chat', { chatId });
  }

  leaveChat(chatId: string) {
    this.socket?.emit('leave_chat', { chatId });
  }

  sendMessage(chatId: string, content: string) {
    this.socket?.emit('send_message', { chatId, content });
  }

  joinGroup(groupId: string) {
    this.socket?.emit('join_group', { groupId });
  }

  leaveGroup(groupId: string) {
    this.socket?.emit('leave_group', { groupId });
  }

  sendGroupMessage(groupId: string, content: string) {
    this.socket?.emit('send_group_message', { groupId, content });
  }
}

const socketService = new SocketService();
export default socketService; 