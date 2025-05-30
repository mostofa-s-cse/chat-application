import { useState, useEffect, useCallback } from 'react';
import { post, get } from '../utils/apiBase';
import socketService from '../utils/socket';
import { Message, User } from '../types';

interface UseChatReturn {
  messages: Message[];
  loading: boolean;
  error: string | null;
  sendMessage: (content: string) => Promise<void>;
  fetchMessages: () => Promise<void>;
  otherParticipant: User | null;
}

export const useChat = (chatId: string | undefined): UseChatReturn => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [otherParticipant, setOtherParticipant] = useState<User | null>(null);

  const fetchMessages = useCallback(async () => {
    if (!chatId) return;
    try {
      setLoading(true);
      const response = await get<{ messages: Message[]; otherParticipant: User }>(`/chats/${chatId}`);
      setMessages(response.messages);
      setOtherParticipant(response.otherParticipant);
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
      if (socket) {
        socket.on('new_message', (message: Message) => {
          setMessages((prev) => [...prev, message]);
        });
      }

      return () => {
        socketService.leaveChat(chatId);
        socket?.off('new_message');
      };
    }
  }, [chatId, fetchMessages]);

  return {
    messages,
    loading,
    error,
    sendMessage,
    fetchMessages,
    otherParticipant,
  };
}; 