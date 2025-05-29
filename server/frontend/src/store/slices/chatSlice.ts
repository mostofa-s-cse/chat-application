import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

interface Message {
  id: string;
  content: string;
  senderId: string;
  receiverId: string;
  timestamp: string;
  type: 'text' | 'file' | 'image';
  status: 'sent' | 'delivered' | 'read';
}

interface ChatState {
  messages: Message[];
  activeChat: string | null;
  loading: boolean;
  error: string | null;
}

const initialState: ChatState = {
  messages: [],
  activeChat: null,
  loading: false,
  error: null,
};

// Async thunks
export const fetchMessages = createAsyncThunk(
  'chat/fetchMessages',
  async (userId: string) => {
    const response = await axios.get(`/api/v1/chat/messages/${userId}`);
    return response.data;
  }
);

export const sendMessage = createAsyncThunk(
  'chat/sendMessage',
  async ({ content, receiverId }: { content: string; receiverId: string }) => {
    const response = await axios.post('/api/v1/chat/messages', {
      content,
      receiverId,
    });
    return response.data;
  }
);

const chatSlice = createSlice({
  name: 'chat',
  initialState,
  reducers: {
    setActiveChat: (state, action) => {
      state.activeChat = action.payload;
    },
    addMessage: (state, action) => {
      state.messages.push(action.payload);
    },
    updateMessageStatus: (state, action) => {
      const { messageId, status } = action.payload;
      const message = state.messages.find((msg) => msg.id === messageId);
      if (message) {
        message.status = status;
      }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchMessages.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchMessages.fulfilled, (state, action) => {
        state.loading = false;
        state.messages = action.payload;
      })
      .addCase(fetchMessages.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch messages';
      })
      .addCase(sendMessage.fulfilled, (state, action) => {
        state.messages.push(action.payload);
      });
  },
});

export const { setActiveChat, addMessage, updateMessageStatus } = chatSlice.actions;
export default chatSlice.reducer; 