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
      console.log('🔌 Creating new socket connection to:', SOCKET_URL);
      this.socket = io(SOCKET_URL, {
        transports: ['websocket'],
        autoConnect: true,
      });

      this.socket.on('connect', () => {
        console.log('✅ Socket connected successfully');
        this.setupUser(userId);
      });

      this.socket.on('disconnect', () => {
        console.log('🔌 Socket disconnected');
      });

      this.socket.on('error', (error) => {
        console.error('❌ Socket error:', error);
      });

      this.socket.on('connected', () => {
        console.log('✅ User setup complete');
      });

      this.socket.on('setup_error', (error: string) => {
        console.error('❌ Setup error:', error);
      });
    }
    return this.socket;
  }

  private setupUser(userId: string) {
    if (this.socket) {
      console.log('👤 Setting up user:', userId);
      this.socket.emit('setup', { id: userId });
    } else {
      console.error('❌ Cannot setup user: Socket not available');
    }
  }

  public joinChat(chatId: string) {
    if (this.socket) {
      console.log('🏠 Joining chat room:', chatId);
      this.socket.emit('join chat', { chatId });
    } else {
      console.error('❌ Cannot join chat: Socket not available');
    }
  }

  public leaveChat(chatId: string) {
    if (this.socket) {
      this.socket.emit('leave chat', { chatId });
    }
  }

  public sendMessage(message: any) {
    if (this.socket) {
      console.log('📤 Sending message via socket service:', message);
      this.socket.emit('send message', message);
    } else {
      console.error('❌ Cannot send message: Socket not available');
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

  public onTypingStart(callback: (data: { userId: string; chatId: string }) => void) {
    if (this.socket) {
      this.socket.on('typing start', callback);
    }
  }

  public onTypingStop(callback: (data: { userId: string; chatId: string }) => void) {
    if (this.socket) {
      this.socket.on('typing stop', callback);
    }
  }

  public disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  // Get the socket instance for direct access
  public getSocket(): Socket | null {
    return this.socket;
  }

  // Check if socket is connected
  public isConnected(): boolean {
    return this.socket?.connected || false;
  }
}

export const socketService = SocketService.getInstance(); 