import { useEffect, useCallback } from 'react';
import { socketService } from '../utils/socket';

interface UseSocketProps {
  userId: string;
  onMessageReceived?: (message: any) => void;
  onUserOnline?: (userId: string) => void;
  onUserOffline?: (userId: string) => void;
}

export const useSocket = ({
  userId,
  onMessageReceived,
  onUserOnline,
  onUserOffline,
}: UseSocketProps) => {
  useEffect(() => {
    // Connect to socket when component mounts
    const socket = socketService.connect(userId);

    // Set up event listeners
    if (onMessageReceived) {
      socketService.onMessageReceived(onMessageReceived);
    }

    if (onUserOnline) {
      socketService.onUserOnline(onUserOnline);
    }

    if (onUserOffline) {
      socketService.onUserOffline(onUserOffline);
    }

    // Cleanup on unmount
    return () => {
      socketService.disconnect();
    };
  }, [userId, onMessageReceived, onUserOnline, onUserOffline]);

  const joinChat = useCallback((chatId: string) => {
    socketService.joinChat(chatId);
  }, []);

  const sendMessage = useCallback((message: any) => {
    socketService.sendMessage(message);
  }, []);

  return {
    joinChat,
    sendMessage,
  };
}; 