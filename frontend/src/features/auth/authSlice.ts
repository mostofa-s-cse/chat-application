import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import { RootState } from '../../store';

interface User {
  id: string;
  email: string;
  username: string;
  fullName: string;
  avatar: string;
  status: string;
}

interface AuthState {
  user: User | null;
  token: string | null;
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
}

const initialState: AuthState = {
  user: null,
  token: localStorage.getItem('token'),
  status: 'idle',
  error: null,
};

export const login = createAsyncThunk(
  'auth/login',
  async (credentials: { email: string; password: string }) => {
    const response = await axios.post('http://localhost:5000/api/users/login', credentials);
    const { token, data } = response.data;
    localStorage.setItem('token', token);
    return { token, user: data.user };
  }
);

export const register = createAsyncThunk(
  'auth/register',
  async (userData: { email: string; username: string; password: string; fullName: string }) => {
    const response = await axios.post('http://localhost:5000/api/users/register', userData);
    const { token, data } = response.data;
    localStorage.setItem('token', token);
    return { token, user: data.user };
  }
);

export const getMe = createAsyncThunk('auth/getMe', async (_, { getState }) => {
  const { token } = (getState() as RootState).auth;
  const response = await axios.get('http://localhost:5000/api/users/me', {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data.data.user;
});

export const logout = createAsyncThunk('auth/logout', async (_, { getState }) => {
  const { token } = (getState() as RootState).auth;
  await axios.post(
    'http://localhost:5000/api/users/logout',
    {},
    {
      headers: { Authorization: `Bearer ${token}` },
    }
  );
  localStorage.removeItem('token');
});

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Login
      .addCase(login.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.user = action.payload.user;
        state.token = action.payload.token;
      })
      .addCase(login.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message || 'Login failed';
      })
      // Register
      .addCase(register.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(register.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.user = action.payload.user;
        state.token = action.payload.token;
      })
      .addCase(register.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message || 'Registration failed';
      })
      // Get Me
      .addCase(getMe.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(getMe.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.user = action.payload;
      })
      .addCase(getMe.rejected, (state) => {
        state.status = 'failed';
        state.user = null;
        state.token = null;
        localStorage.removeItem('token');
      })
      // Logout
      .addCase(logout.fulfilled, (state) => {
        state.user = null;
        state.token = null;
        state.status = 'idle';
      });
  },
});

export const { clearError } = authSlice.actions;
export default authSlice.reducer; 