import React from 'react';
import Layout from './components/Layout';
import LeftSidebar from './components/LeftSidebar';
import Chat from './components/Chat';
import Video from './components/call/Video';

const App: React.FC = () => {
  return (
    <Layout>
      <div className="h-full bg-gradient-to-br from-blue-100 to-indigo-200 overflow-hidden">
       {/* <div className="flex">
        <LeftSidebar />
        <Chat />
       </div> */}
       <Video />
      </div>
    </Layout>
  );
};

export default App;