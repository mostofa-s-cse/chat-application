import React from 'react';
import { createBrowserRouter, RouterProvider, Navigate, Route } from 'react-router-dom';
import { Provider, useSelector } from 'react-redux';
import { store, RootState } from './store';
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
import Chats from './pages/chat/Chats';
import NewChat from './pages/chat/NewChat';

// Protected Route Component
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const token = useSelector((state: RootState) => state.auth.token);
  return token ? <>{children}</> : <Navigate to="/login" />;
};

const router = createBrowserRouter([
  {
    element: <AuthLayout />,
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
      { path: '/chat/:chatId', element: <Chat /> },
      { path: '/group/:groupId', element: <GroupChat /> },
      { path: '/profile', element: <Profile /> },
      { path: '/settings', element: <Settings /> },
      { path: '/new-chat', element: <NewChat /> },
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
      <div className="min-h-screen bg-gray-50">
        <RouterProvider router={router} />
        <ToastContainer position="top-right" aria-label="notification" />
      </div>
    </Provider>
  );
}

export default App; 