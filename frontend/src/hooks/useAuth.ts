import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../store';
import { setCredentials, logout, setError, setLoading } from '../store/slices/authSlice';
import api from '../api/axios';

export const useAuth = () => {
  const dispatch = useDispatch();
  const { user, token, isAuthenticated, status, error } = useSelector((state: RootState) => state.auth);

  const login = async (credentials: { email: string; password: string }) => {
    try {
      dispatch(setLoading());
      const { data } = await api.post('/auth/login', credentials);
      dispatch(setCredentials(data));
    } catch (error) {
      dispatch(setError(error instanceof Error ? error.message : 'Login failed'));
    }
  };

  const register = async (userData: { email: string; username: string; password: string; fullName: string }) => {
    try {
      dispatch(setLoading());
      const { data } = await api.post('/auth/register', userData);
      dispatch(setCredentials(data));
    } catch (error) {
      dispatch(setError(error instanceof Error ? error.message : 'Registration failed'));
    }
  };

  const logoutUser = () => {
    dispatch(logout());
  };

  return {
    user,
    token,
    isAuthenticated,
    status,
    error,
    login,
    register,
    logout: logoutUser,
  };
}; 