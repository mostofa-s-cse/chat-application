import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import { RootState } from '../../store';

interface Message {
  id: string;
  content: string;
  type: string;
  fileUrl?: string;
  createdAt: string;
  senderId: string;
  receiverId: string;
  sender: {
    id: string;
    username: string;
    fullName: string;
    avatar: string;
  };
}

interface ChatState {
  messages: Message[];
  selectedUser: {
    id: string;
    username: string;
    fullName: string;
    avatar: string;
    status: string;
  } | null;
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
}

const initialState: ChatState = {
  messages: [],
  selectedUser: null,
  status: 'idle',
  error: null,
};

export const getMessages = createAsyncThunk(
  'chat/getMessages',
  async (userId: string, { getState }) => {
    const { token } = (getState() as RootState).auth;
    const response = await axios.get(`http://localhost:5000/api/messages/${userId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data.data.messages;
  }
);

export const sendMessage = createAsyncThunk(
  'chat/sendMessage',
  async (messageData: { content: string; receiverId: string; type?: string; fileUrl?: string }, { getState }) => {
    const { token } = (getState() as RootState).auth;
    const response = await axios.post(
      'http://localhost:5000/api/messages',
      messageData,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );
    return response.data.data.message;
  }
);

const chatSlice = createSlice({
  name: 'chat',
  initialState,
  reducers: {
    setSelectedUser: (state, action) => {
      state.selectedUser = action.payload;
    },
    addMessage: (state, action) => {
      state.messages.push(action.payload);
    },
    clearMessages: (state) => {
      state.messages = [];
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(getMessages.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(getMessages.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.messages = action.payload;
      })
      .addCase(getMessages.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message || 'Failed to fetch messages';
      })
      .addCase(sendMessage.fulfilled, (state, action) => {
        state.messages.push(action.payload);
      });
  },
});

export const { setSelectedUser, addMessage, clearMessages } = chatSlice.actions;
export default chatSlice.reducer; 