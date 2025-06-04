import React from 'react';
import Layout from './components/Layout';
import LeftSidebar from './components/LeftSidebar';
import Chat from './components/Chat';
import Video from './components/call/Video';
import Audio from './components/call/Audio';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import ForgotPassword from './pages/auth/ForgotPassword';
import ResetPassword from './pages/auth/ResetPassword';

const App: React.FC = () => {
  return (
    <Layout>
      <div className="h-full bg-gradient-to-br from-blue-100 to-indigo-200 overflow-hidden">
       {/* <div className="flex">
        <LeftSidebar />
        <Chat />
       </div> */}
       {/* <Video /> */}
       {/* <Audio /> */}
       {/* <Login /> */}
       {/* <Register /> */}
       {/* <ForgotPassword /> */}
       <ResetPassword />
      </div>
    </Layout>
  );
};

export default App;