import { useState, useEffect, useCallback } from 'react';
import { useDispatch } from 'react-redux';
import { post, get } from '../utils/apiBase';
import socketService from '../utils/socket';

interface GroupMessage {
  id: string;
  content: string;
  sender: {
    id: string;
    username: string;
    avatar?: string;
  };
  timestamp: string;
}

interface Group {
  id: string;
  name: string;
  description?: string;
  members: {
    id: string;
    username: string;
    avatar?: string;
    role: 'admin' | 'member';
  }[];
  lastMessage?: GroupMessage;
}

export const useGroupChat = (groupId?: string) => {
  const [messages, setMessages] = useState<GroupMessage[]>([]);
  const [group, setGroup] = useState<Group | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const dispatch = useDispatch();

  const fetchGroupDetails = useCallback(async () => {
    if (!groupId) return;
    try {
      setLoading(true);
      const response = await get<Group>(`/groups/${groupId}`);
      setGroup(response);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch group details');
    } finally {
      setLoading(false);
    }
  }, [groupId]);

  const fetchMessages = useCallback(async () => {
    if (!groupId) return;
    try {
      setLoading(true);
      const response = await get<GroupMessage[]>(`/groups/${groupId}/messages`);
      setMessages(response);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch messages');
    } finally {
      setLoading(false);
    }
  }, [groupId]);

  const sendMessage = useCallback(async (content: string) => {
    if (!groupId) return;
    try {
      const response = await post<GroupMessage>(`/groups/${groupId}/messages`, { content });
      setMessages((prev) => [...prev, response]);
      socketService.sendGroupMessage(groupId, content);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to send message');
    }
  }, [groupId]);

  const addMember = useCallback(async (userId: string) => {
    if (!groupId) return;
    try {
      await post(`/groups/${groupId}/members`, { userId });
      fetchGroupDetails();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to add member');
    }
  }, [groupId, fetchGroupDetails]);

  const removeMember = useCallback(async (userId: string) => {
    if (!groupId) return;
    try {
      await post(`/groups/${groupId}/members/${userId}/remove`);
      fetchGroupDetails();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to remove member');
    }
  }, [groupId, fetchGroupDetails]);

  useEffect(() => {
    if (groupId) {
      socketService.joinGroup(groupId);
      fetchGroupDetails();
      fetchMessages();

      const socket = socketService.getSocket();
      if (socket) {
        socket.on('new_group_message', (message: GroupMessage) => {
          setMessages((prev) => [...prev, message]);
        });
      }

      return () => {
        socketService.leaveGroup(groupId);
        socket?.off('new_group_message');
      };
    }
  }, [groupId, fetchGroupDetails, fetchMessages]);

  return {
    group,
    messages,
    loading,
    error,
    sendMessage,
    addMember,
    removeMember,
    fetchMessages,
    fetchGroupDetails,
  };
}; 