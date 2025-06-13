import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import ForgotPassword from './pages/auth/ForgotPassword';
import ResetPassword from './pages/auth/ResetPassword';
import Chat from './components/Chat';
import Home from './pages/Home';

const App = () => {
  // You can use Redux or Context to check if the user is authenticated
  const isAuthenticated = true; // Replace with your auth logic

  return (
    <Router>
      <Routes>
        {/* Auth routes - only accessible when NOT authenticated */}
        <Route 
          path="/login" 
          element={!isAuthenticated ? <Login /> : <Navigate to="/" />} 
        />
        <Route 
          path="/register" 
          element={!isAuthenticated ? <Register /> : <Navigate to="/" />} 
        />
        <Route 
          path="/forgot-password" 
          element={!isAuthenticated ? <ForgotPassword /> : <Navigate to="/" />} 
        />
        <Route 
          path="/reset-password" 
          element={!isAuthenticated ? <ResetPassword /> : <Navigate to="/" />} 
        />

        {/* Protected routes - only accessible when authenticated */}
        <Route
          path="/"
          element={isAuthenticated ? <Home /> : <Navigate to="/login" />}
        />
        <Route
          path="/chat"
          element={isAuthenticated ? <Chat /> : <Navigate to="/login" />}
        />
        <Route
          path="/chat/:id"
          element={isAuthenticated ? <Chat /> : <Navigate to="/login" />}
        />
        
        {/* 404 fallback */}
        <Route path="*" element={<div>404 Not Found</div>} />
      </Routes>
    </Router>
  );
};

export default App;