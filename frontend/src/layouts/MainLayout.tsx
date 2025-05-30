import React from 'react';
import { Outlet} from 'react-router-dom';
import LeftSidebar from './LeftSidebar';


const MainLayout: React.FC = () => {
  return (
    <div className="h-screen overflow-hidden flex items-center justify-center" style={{background: '#edf2f7'}}>
      <div className="relative flex w-full h-screen overflow-hidden antialiased bg-gray-200">
        {/* left */}
        <LeftSidebar />
        {/* main content */}
          <Outlet />
      </div>
    </div>
  );
};

export default MainLayout; 