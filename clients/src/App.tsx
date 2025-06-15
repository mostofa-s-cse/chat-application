import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate, useParams } from 'react-router-dom';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import ForgotPassword from './pages/auth/ForgotPassword';
import ResetPassword from './pages/auth/ResetPassword';
import Chat from './components/Chat';
import Home from './pages/Home';
import CommunityChat from './components/CommunityChat';
import CommunitySidebar from './components/CommunitySidebar';

const CommunityRoute = () => {
  const navigate = useNavigate();
  return <CommunitySidebar onBack={() => navigate('/')} />;
};

const CommunityChatRoute = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  // In a real app, you would fetch the community data based on the id
  return (
    <CommunityChat
      onBack={() => navigate('/community')}
      type="group"
      name="Sample Group"
      members={10}
      avatar="https://storage.googleapis.com/a1aa/image/31130072-5ee0-4273-1569-5e0b5e24910f.jpg"
    />
  );
};

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
        <Route
          path="/community"
          element={isAuthenticated ? <CommunityRoute /> : <Navigate to="/login" />}
        />
        <Route
          path="/community/:id"
          element={isAuthenticated ? <CommunityChatRoute /> : <Navigate to="/login" />}
        />
        
        {/* 404 fallback */}
        <Route path="*" element={<div>404 Not Found</div>} />
      </Routes>
    </Router>
  );
};

export default App;