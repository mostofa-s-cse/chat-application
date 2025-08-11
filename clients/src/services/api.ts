import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:4000';

console.log('API URL:', API_URL);

// Create axios instance
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      console.log('Adding auth header:', config.headers.Authorization);
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Handle unauthorized access
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
}

export interface AuthResponse {
  token: string;
  user: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    profilePic?: string;
  };
}

export const authService = {
  login: async (credentials: LoginCredentials): Promise<AuthResponse> => {
    try {
      console.log('Attempting login with:', credentials.email);
      const response = await api.post<{ token: string; user: any; status: number }>('/auth/login', credentials);
      console.log('Login response:', response.data);
      
      if (response.data.token) {
        localStorage.setItem('token', response.data.token);
      }
      
      // Return the data in the expected format
      return {
        token: response.data.token,
        user: response.data.user
      };
    } catch (error: any) {
      console.error('Login error:', error.response?.data || error.message);
      throw error;
    }
  },

  register: async (data: RegisterData): Promise<AuthResponse> => {
    const response = await api.post<AuthResponse>('/auth/register', data);
    if (response.data.token) {
      localStorage.setItem('token', response.data.token);
    }
    return response.data;
  },

  logout: () => {
    localStorage.removeItem('token');
  },

  getCurrentUser: async (): Promise<AuthResponse['user']> => {
    const response = await api.get<AuthResponse>('/auth/valid');
    return response.data.user;
  },
};

export const chatService = {
  // Get all chats for the current user
  fetchChats: async () => {
    try {
      const response = await api.get('/api/chat');
      return response.data;
    } catch (error) {
      console.error('Error fetching chats:', error);
      throw error;
    }
  },

  // Get chats formatted specifically for the sidebar
  fetchSidebarChats: async () => {
    try {
      const response = await api.get('/api/chat/sidebar');
      return response.data;
    } catch (error) {
      console.error('Error fetching sidebar chats:', error);
      throw error;
    }
  },

  // Get a specific chat by ID
  fetchChatById: async (chatId: string) => {
    try {
      const response = await api.get(`/api/chat/${chatId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching chat by ID:', error);
      throw error;
    }
  },

  // Access or create a chat with a specific user
  accessChat: async (userId: string) => {
    try {
      const response = await api.post('/api/chat', { userId });
      return response.data;
    } catch (error) {
      console.error('Error accessing chat:', error);
      throw error;
    }
  },

  searchUsers: async (searchQuery: string) => {
    const response = await api.get(`/api/user?search=${encodeURIComponent(searchQuery)}`);
    return response.data;
  },

  getMessages: async (chatId: string) => {
    const response = await api.get(`/api/message/${chatId}`);
    return response.data;
  },

  sendMessage: async (data: { chatId: string; message: string; type?: string; replyToId?: string; attachment?: any }) => {
    // Transform the data to match server expectations
    const serverData = {
      chatId: data.chatId,
      content: data.message, // Server expects 'content', not 'message'
      type: data.type,
      replyToId: data.replyToId,
      attachment: data.attachment
    };
    const response = await api.post('/api/message', serverData);
    return response.data;
  },

  addReaction: async (messageId: string, emoji: string) => {
    const response = await api.post(`/api/message/${messageId}/reaction`, { emoji });
    return response.data;
  },

  uploadFile: async (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    const response = await api.post('/api/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  createGroupChat: async (chatName: string, users: string[]) => {
    const response = await api.post('/api/chat/group', { 
      chatName, 
      users: JSON.stringify(users) 
    });
    return response.data;
  },

  renameGroup: async (chatId: string, chatName: string) => {
    const response = await api.patch('/api/chat/rename', { chatId, chatName });
    return response.data;
  },

  addToGroup: async (userId: string, chatId: string) => {
    const response = await api.patch('/api/chat/groupadd', { userId, chatId });
    return response.data;
  },

  removeFromGroup: async (userId: string, chatId: string) => {
    const response = await api.patch('/api/chat/groupremove', { userId, chatId });
    return response.data;
  },
};

export default api; 