import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface Message {
  id: string;
  content: string;
  senderId: string;
  receiverId: string;
  createdAt: string;
  type: 'text' | 'image' | 'file';
}

interface User {
  id: string;
  username: string;
  fullName?: string;
  avatar?: string;
  status?: 'online' | 'offline';
}

interface ChatState {
  messages: Message[];
  selectedUser: User | null;
  users: User[];
}

const initialState: ChatState = {
  messages: [],
  selectedUser: null,
  users: [],
};

const chatSlice = createSlice({
  name: 'chat',
  initialState,
  reducers: {
    setMessages: (state, action: PayloadAction<Message[]>) => {
      state.messages = action.payload;
    },
    addMessage: (state, action: PayloadAction<Message>) => {
      state.messages.push(action.payload);
    },
    setSelectedUser: (state, action: PayloadAction<User | null>) => {
      state.selectedUser = action.payload;
    },
    setUsers: (state, action: PayloadAction<User[]>) => {
      state.users = action.payload;
    },
  },
});

export const { setMessages, addMessage, setSelectedUser, setUsers } = chatSlice.actions;
export default chatSlice.reducer; 