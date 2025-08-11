import { io, Socket } from 'socket.io-client';

const SOCKET_URL = process.env.REACT_APP_SOCKET_URL || 'http://localhost:4000';

class SocketService {
  private socket: Socket | null = null;
  private static instance: SocketService;

  private constructor() {}

  public static getInstance(): SocketService {
    if (!SocketService.instance) {
      SocketService.instance = new SocketService();
    }
    return SocketService.instance;
  }

  public connect(userId: string): Socket {
    if (!this.socket) {
      this.socket = io(SOCKET_URL, {
        transports: ['websocket'],
        autoConnect: true,
      });

      this.socket.on('connect', () => {
        console.log('Socket connected');
        this.setupUser(userId);
      });

      this.socket.on('disconnect', () => {
        console.log('Socket disconnected');
      });

      this.socket.on('error', (error) => {
        console.error('Socket error:', error);
      });
    }
    return this.socket;
  }

  private setupUser(userId: string) {
    if (this.socket) {
      this.socket.emit('setup', { id: userId });
    }
  }

  public joinChat(chatId: string) {
    if (this.socket) {
      this.socket.emit('join chat', chatId);
    }
  }

  public sendMessage(message: any) {
    if (this.socket) {
      this.socket.emit('new message', message);
    }
  }

  public onMessageReceived(callback: (message: any) => void) {
    if (this.socket) {
      this.socket.on('message received', callback);
    }
  }

  public onUserOnline(callback: (userId: string) => void) {
    if (this.socket) {
      this.socket.on('user online', callback);
    }
  }

  public onUserOffline(callback: (userId: string) => void) {
    if (this.socket) {
      this.socket.on('user offline', callback);
    }
  }

  public disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }
}

export const socketService = SocketService.getInstance(); 