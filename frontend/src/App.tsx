import React from 'react';
import { createBrowserRouter, RouterProvider, Navigate } from 'react-router-dom';
import { Provider, useSelector } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { store, persistor, RootState } from './store';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Layouts
import MainLayout from './layouts/MainLayout';
import AuthLayout from './layouts/AuthLayout';

// Pages
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import ForgotPassword from './pages/auth/ForgotPassword';
import ResetPassword from './pages/auth/ResetPassword';
import VerifyEmail from './pages/auth/VerifyEmail';
import Chat from './pages/chat/Chat';
import GroupChat from './pages/chat/GroupChat';
import Profile from './pages/profile/Profile';
import Settings from './pages/settings/Settings';

// Protected Route Component
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const isAuthenticated = useSelector((state: RootState) => state.auth.isAuthenticated);
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" />;
};

// Public Route Component (for auth pages)
const PublicRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const isAuthenticated = useSelector((state: RootState) => state.auth.isAuthenticated);
  return !isAuthenticated ? <>{children}</> : <Navigate to="/" />;
};

const router = createBrowserRouter([
  {
    element: <PublicRoute><AuthLayout /></PublicRoute>,
    children: [
      { path: '/login', element: <Login /> },
      { path: '/register', element: <Register /> },
      { path: '/forgot-password', element: <ForgotPassword /> },
      { path: '/reset-password/:email', element: <ResetPassword /> },
    ],
  },
  {
    element: <ProtectedRoute><MainLayout /></ProtectedRoute>,
    children: [
      { path: '/', element: <Chat /> },
      { path: '/chat/:chatId', element: <Chat /> },
      { path: '/group/:groupId', element: <GroupChat /> },
      { path: '/profile', element: <Profile /> },
      { path: '/settings', element: <Settings /> },
      { path: '/new-group', element: <GroupChat /> },
    ],
  },
  {
    path: '/verify-email/:email',
    element: <VerifyEmail />,
  },
]);

function App() {
  return (
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <div className="min-h-screen bg-gray-50">
          <RouterProvider router={router} />
          <ToastContainer position="top-right" aria-label="notification" />
        </div>
      </PersistGate>
    </Provider>
  );
}

export default App; 