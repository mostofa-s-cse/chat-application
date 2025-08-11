import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { chatService } from '../../services/api';

export interface ChatUser {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  profilePic: string;
  isOnline?: boolean;
  lastSeen?: string;
}

export interface ChatMessage {
  id: string;
  type: 'timestamp' | 'incoming' | 'outgoing' | 'file';
  content: string;
  time: string;
  createdAt?: string; // Optional field for socket messages
  images?: string[];
  fileName?: string;
  fileSize?: string;
  fileType?: string;
}

export interface Chat {
  id: string;
  photo: string;
  chatName?: string;
  isGroup: boolean;
  users: ChatUser[];
  messages: ChatMessage[];
  latestMessage?: ChatMessage;
  groupAdmin?: ChatUser;
  unreadCount: number;
  isArchived: boolean;
  isPinned: boolean;
  createdAt: string;
  updatedAt: string;
}

interface SidebarChat {
  id: string;
  name: string;
  avatar: string;
  message: string;
  time: string;
  unread: number;
  read: boolean;
  online: boolean;
}

interface ChatState {
  chats: Chat[];
  currentChat: Chat | null;
  sidebarChats: SidebarChat[]; // For the sidebar format
  loading: boolean;
  error: string | null;
}

const initialState: ChatState = {
  chats: [],
  currentChat: null,
  sidebarChats: [],
  loading: false,
  error: null,
};

// Async thunks
export const fetchChats = createAsyncThunk(
  'chat/fetchChats',
  async (_, { rejectWithValue }) => {
    try {
      const response = await chatService.fetchChats();
      return response;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch chats');
    }
  }
);

export const fetchSidebarChats = createAsyncThunk(
  'chat/fetchSidebarChats',
  async (_, { rejectWithValue }) => {
    try {
      const response = await chatService.fetchSidebarChats();
      return response.data; // Extract the data from the response
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch sidebar chats');
    }
  }
);

export const accessChat = createAsyncThunk(
  'chat/accessChat',
  async (userId: string, { rejectWithValue }) => {
    try {
      const response = await chatService.accessChat(userId);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to access chat');
    }
  }
);

export const createGroupChat = createAsyncThunk(
  'chat/createGroupChat',
  async ({ chatName, users }: { chatName: string; users: string[] }, { rejectWithValue }) => {
    try {
      const response = await chatService.createGroupChat(chatName, users);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to create group chat');
    }
  }
);

const chatSlice = createSlice({
  name: 'chat',
  initialState,
  reducers: {
    setCurrentChat: (state, action: PayloadAction<Chat>) => {
      const chat = {
        ...action.payload,
        messages: action.payload.messages || []
      };
      state.currentChat = chat;
    },
    addNewMessage: (state, action: PayloadAction<ChatMessage>) => {
      try {
        // Validate and normalize the message
        const message = { ...action.payload };
        
        // Ensure the message has the required fields in the correct format
        if (!message.time && message.createdAt) {
          // Convert createdAt to time format if needed
          try {
            const date = new Date(message.createdAt);
            if (!isNaN(date.getTime())) {
              message.time = date.toLocaleTimeString('en-US', { 
                hour: 'numeric', 
                minute: '2-digit',
                hour12: true 
              });
            } else {
              message.time = new Date().toLocaleTimeString('en-US', { 
                hour: 'numeric', 
                minute: '2-digit',
                hour12: true 
              });
            }
          } catch (error) {
            console.error('Error converting createdAt to time:', error);
            message.time = new Date().toLocaleTimeString('en-US', { 
              hour: 'numeric', 
              minute: '2-digit',
              hour12: true 
            });
          }
        } else if (!message.time) {
          // No time field, use current time
          message.time = new Date().toLocaleTimeString('en-US', { 
            hour: 'numeric', 
            minute: '2-digit',
            hour12: true 
          });
        }
        
        // Add message to current chat if it exists
        if (state.currentChat) {
          // Ensure messages array exists
          if (!state.currentChat.messages) {
            state.currentChat.messages = [];
          }
          // Add message to current chat
          state.currentChat.messages.push(message);
          // Update latest message
          state.currentChat.latestMessage = message;
          
          // Also update the chat in the chats array
          const chatIndex = state.chats.findIndex(chat => chat.id === state.currentChat!.id);
          if (chatIndex !== -1) {
            // Ensure messages array exists
            if (!state.chats[chatIndex].messages) {
              state.chats[chatIndex].messages = [];
            }
            // Add message to chat
            state.chats[chatIndex].messages.push(message);
            // Update latest message
            state.chats[chatIndex].latestMessage = message;
            
            // Move chat to top
            const chat = state.chats.splice(chatIndex, 1)[0];
            state.chats.unshift(chat);
          }
        }
      } catch (error) {
        console.error('Error in addNewMessage:', error);
        // Try to add a minimal message to prevent crashes
        try {
          const fallbackMessage: ChatMessage = {
            id: action.payload.id || `fallback-${Date.now()}`,
            type: action.payload.type || 'outgoing',
            content: action.payload.content || 'Message received',
            time: new Date().toLocaleTimeString('en-US', { 
              hour: 'numeric', 
              minute: '2-digit',
              hour12: true 
            })
          };
          
          if (state.currentChat) {
            if (!state.currentChat.messages) {
              state.currentChat.messages = [];
            }
            state.currentChat.messages.push(fallbackMessage);
            state.currentChat.latestMessage = fallbackMessage;
          }
        } catch (fallbackError) {
          console.error('Fallback message creation also failed:', fallbackError);
        }
      }
    },
    updateChatLatestMessage: (state, action: PayloadAction<{ chatId: string; message: ChatMessage }>) => {
      const { chatId, message } = action.payload;
      const chatIndex = state.chats.findIndex(chat => chat.id === chatId);
      
      if (chatIndex !== -1) {
        // Ensure messages array exists
        if (!state.chats[chatIndex].messages) {
          state.chats[chatIndex].messages = [];
        }
        state.chats[chatIndex].latestMessage = message;
      }
      
      if (state.currentChat?.id === chatId) {
        // Ensure messages array exists
        if (!state.currentChat.messages) {
          state.currentChat.messages = [];
        }
        state.currentChat.latestMessage = message;
      }
    },
    updateSidebarChat: (state, action: PayloadAction<{ chatId: string; message: string; time: string; unread: number }>) => {
      const { chatId, message, time, unread } = action.payload;
      const sidebarChatIndex = state.sidebarChats.findIndex((chat: SidebarChat) => chat.id === chatId);
      
      if (sidebarChatIndex !== -1) {
        state.sidebarChats[sidebarChatIndex].message = message;
        state.sidebarChats[sidebarChatIndex].time = time;
        state.sidebarChats[sidebarChatIndex].unread = unread;
      }
    },
    clearChats: (state) => {
      state.chats = [];
      state.currentChat = null;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchChats.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchChats.fulfilled, (state, action) => {
        state.loading = false;
        // Ensure all chats have messages array
        state.chats = action.payload.map((chat: any) => ({
          ...chat,
          messages: chat.messages || []
        }));
      })
      .addCase(fetchChats.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(accessChat.fulfilled, (state, action) => {
        const newChat = {
          ...action.payload,
          messages: action.payload.messages || []
        };
        const existingIndex = state.chats.findIndex(chat => chat.id === newChat.id);
        
        if (existingIndex !== -1) {
          // Update existing chat
          state.chats[existingIndex] = newChat;
        } else {
          // Add new chat to the beginning
          state.chats.unshift(newChat);
        }
        
        state.currentChat = newChat;
      })
      .addCase(createGroupChat.fulfilled, (state, action) => {
        const newChat = {
          ...action.payload,
          messages: action.payload.messages || []
        };
        state.chats.unshift(newChat);
        state.currentChat = newChat;
      })
      // Handle sidebar chats
      .addCase(fetchSidebarChats.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchSidebarChats.fulfilled, (state, action: PayloadAction<SidebarChat[]>) => {
        state.loading = false;
        state.sidebarChats = action.payload;
        state.error = null;
      })
      .addCase(fetchSidebarChats.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { 
  setCurrentChat, 
  addNewMessage, 
  updateChatLatestMessage,
  updateSidebarChat,
  clearChats, 
  clearError 
} = chatSlice.actions;

export default chatSlice.reducer;
