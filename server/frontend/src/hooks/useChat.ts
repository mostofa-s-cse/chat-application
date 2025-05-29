import { useState, useEffect, useCallback } from 'react';
import { useDispatch } from 'react-redux';
import { post, get } from '../utils/api';
import socketService from '../utils/socket';

interface Message {
  id: string;
  content: string;
  sender: {
    id: string;
    username: string;
    avatar?: string;
  };
  timestamp: string;
}

interface Chat {
  id: string;
  participants: {
    id: string;
    username: string;
    avatar?: string;
  }[];
  lastMessage?: Message;
}

export const useChat = (chatId?: string) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const dispatch = useDispatch();

  const fetchMessages = useCallback(async () => {
    if (!chatId) return;
    try {
      setLoading(true);
      const response = await get<Message[]>(`/chats/${chatId}/messages`);
      setMessages(response);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch messages');
    } finally {
      setLoading(false);
    }
  }, [chatId]);

  const sendMessage = useCallback(async (content: string) => {
    if (!chatId) return;
    try {
      const response = await post<Message>(`/chats/${chatId}/messages`, { content });
      setMessages((prev) => [...prev, response]);
      socketService.sendMessage(chatId, content);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to send message');
    }
  }, [chatId]);

  useEffect(() => {
    if (chatId) {
      socketService.joinChat(chatId);
      fetchMessages();

      const socket = socketService.getSocket();
      socket.on('new_message', (message: Message) => {
        setMessages((prev) => [...prev, message]);
      });

      return () => {
        socketService.leaveChat(chatId);
        socket.off('new_message');
      };
    }
  }, [chatId, fetchMessages]);

  return {
    messages,
    loading,
    error,
    sendMessage,
    fetchMessages,
  };
}; 