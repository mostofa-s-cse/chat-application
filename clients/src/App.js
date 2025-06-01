import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { SocketProvider } from './context/SocketContext';
import Login from './pages/Login';
import Register from './pages/Regsiter';
import Home from './pages/Home';
import Chat from './pages/Chat';
import Start from './components/Start';

function App() {
  return (
    <GoogleOAuthProvider clientId={process.env.REACT_APP_CLIENT_ID}>
      <SocketProvider>
        <Router>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/chats" element={<Chat />} />
            <Route exact path="/" element={<Start />} />
          </Routes>
        </Router>
      </SocketProvider>
    </GoogleOAuthProvider>
  );
}

export default App;
