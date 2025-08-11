import { useSelector } from 'react-redux';
import { RootState } from '../store';

export const useAuth = () => {
  const { user, token, loading } = useSelector((state: RootState) => state.auth);

  const isAuthenticated = Boolean(user && token);
  const isInitialized = !loading;

  return {
    user,
    token,
    loading,
    isAuthenticated,
    isInitialized,
  };
}; 