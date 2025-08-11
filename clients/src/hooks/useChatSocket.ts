import { useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Socket } from 'socket.io-client';
import { socketService } from '../utils/socket';
import { RootState } from '../store';
import { addNewMessage } from '../store/slices/chatSlice';

export const useChatSocket = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((state: RootState) => state.auth);
  const { currentChat } = useSelector((state: RootState) => state.chat);
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    if (user?.id) {
      // Connect to socket and get the socket instance
      socketRef.current = socketService.connect(user.id);
    }

    return () => {
      if (socketRef.current) {
        socketService.disconnect();
        socketRef.current = null;
      }
    };
  }, [user?.id]);

  useEffect(() => {
    if (!socketRef.current || !user?.id) return;

    const socket = socketRef.current;

    // Listen for new messages
    socket.on('message received', (message: any) => {
      console.log('📨 Message received via socket:', message);
      
      // Validate message before processing
      try {
        // Ensure message has required fields
        if (!message || typeof message !== 'object') {
          console.error('Invalid message received:', message);
          return;
        }
        
        // Validate createdAt field
        if (message.createdAt) {
          // Check if it's a valid date string
          const date = new Date(message.createdAt);
          if (isNaN(date.getTime())) {
            console.warn('Invalid createdAt in message, using current time:', message.createdAt);
            message.createdAt = new Date().toISOString();
          }
        } else {
          // Add createdAt if missing
          message.createdAt = new Date().toISOString();
        }
        
        dispatch(addNewMessage(message));
        
        // Dispatch custom event for sidebar updates
        window.dispatchEvent(new CustomEvent('message-received', { detail: message }));
      } catch (error) {
        console.error('Error processing received message:', error);
        // Try to dispatch with minimal data
        try {
          const safeMessage = {
            ...message,
            createdAt: new Date().toISOString(),
            content: message?.content || 'New message'
          };
          dispatch(addNewMessage(safeMessage));
          window.dispatchEvent(new CustomEvent('message-received', { detail: safeMessage }));
        } catch (fallbackError) {
          console.error('Fallback message processing also failed:', fallbackError);
        }
      }
    });

    // Listen for user online/offline status
    socket.on('user online', (userId: string) => {
      console.log('User online:', userId);
    });

    socket.on('user offline', (userId: string) => {
      console.log('User offline:', userId);
    });

    // Listen for typing indicators
    socket.on('typing start', (data: { userId: string; chatId: string }) => {
      console.log('User typing:', data);
      // You can emit a custom event here to update typing state
      window.dispatchEvent(new CustomEvent('typing-start', { detail: data }));
    });

    socket.on('typing stop', (data: { userId: string; chatId: string }) => {
      console.log('User stopped typing:', data);
      // You can emit a custom event here to update typing state
      window.dispatchEvent(new CustomEvent('typing-stop', { detail: data }));
    });

    return () => {
      socket.off('message received');
      socket.off('user online');
      socket.off('user offline');
      socket.off('typing start');
      socket.off('typing stop');
    };
  }, [dispatch, user?.id]);

  useEffect(() => {
    if (currentChat?.id && socketRef.current) {
      // Leave previous chat room if any
      socketRef.current.emit('leave chat', { chatId: currentChat.id });
      
      // Join new chat room
      socketRef.current.emit('join chat', { chatId: currentChat.id });
    }
  }, [currentChat?.id]);

  const joinChat = (chatId: string) => {
    if (socketRef.current) {
      socketRef.current.emit('join chat', { chatId });
    }
  };

  const leaveChat = (chatId: string) => {
    if (socketRef.current) {
      socketRef.current.emit('leave chat', { chatId });
    }
  };

  const sendMessage = (message: any) => {
    if (socketRef.current && currentChat?.id) {
      console.log('📤 Sending message via useChatSocket:', message);
      socketRef.current.emit('send message', message);
    } else {
      console.error('❌ Cannot send message: Socket or chat not available');
    }
  };

  const sendTypingIndicator = (isTyping: boolean) => {
    if (socketRef.current && currentChat?.id && user?.id) {
      socketRef.current.emit('typing', {
        chatId: currentChat.id,
        userId: user.id,
        isTyping
      });
    }
  };

  return {
    sendMessage,
    joinChat,
    leaveChat,
    sendTypingIndicator
  };
};
