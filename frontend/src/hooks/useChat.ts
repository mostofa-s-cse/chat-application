import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../store';
import { setMessages, addMessage, setSelectedUser, setUsers } from '../store/slices/chatSlice';
import api from '../api/axios';

export const useChat = () => {
  const dispatch = useDispatch();
  const { messages, selectedUser, users } = useSelector((state: RootState) => state.chat);

  const getMessages = async (userId: string) => {
    try {
      const { data } = await api.get(`/messages/${userId}`);
      dispatch(setMessages(data));
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  };

  const sendMessage = async (message: { content: string; receiverId: string; type: 'text' | 'image' | 'file' }) => {
    try {
      const { data } = await api.post('/messages', message);
      dispatch(addMessage(data));
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  const selectUser = (user: any) => {
    dispatch(setSelectedUser(user));
  };

  const fetchUsers = async () => {
    try {
      const { data } = await api.get('/users');
      dispatch(setUsers(data));
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  return {
    messages,
    selectedUser,
    users,
    getMessages,
    sendMessage,
    selectUser,
    fetchUsers,
  };
}; 