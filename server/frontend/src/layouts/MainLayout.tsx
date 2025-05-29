import React, { useState } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '../store';
import { logout } from '../store/slices/authSlice';
import { FaBars, FaComments, FaUsers, FaUser, FaCog, FaSignOutAlt } from 'react-icons/fa';

const MainLayout: React.FC = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const user = useSelector((state: RootState) => state.auth.user);

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  const menuItems = [
    { text: 'Chats', icon: <FaComments />, path: '/' },
    { text: 'Groups', icon: <FaUsers />, path: '/groups' },
    { text: 'Profile', icon: <FaUser />, path: '/profile' },
    { text: 'Settings', icon: <FaCog />, path: '/settings' },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile menu */}
      <div className="lg:hidden">
        <div className="fixed inset-0 z-40 flex">
          {mobileMenuOpen && (
            <div className="fixed inset-0 bg-gray-600 bg-opacity-75" onClick={() => setMobileMenuOpen(false)} />
          )}
          <div className={`fixed inset-y-0 left-0 flex flex-col w-64 bg-white transform ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'} transition-transform duration-300 ease-in-out`}>
            <div className="flex items-center justify-between h-16 px-4 bg-primary-600">
              <h1 className="text-xl font-bold text-white">Telegram Clone</h1>
              <button onClick={() => setMobileMenuOpen(false)} className="text-white">
                <FaBars />
              </button>
            </div>
            <nav className="flex-1 px-2 py-4 space-y-1">
              {menuItems.map((item) => (
                <button
                  key={item.text}
                  onClick={() => {
                    navigate(item.path);
                    setMobileMenuOpen(false);
                  }}
                  className="flex items-center w-full px-2 py-2 text-gray-600 rounded-md hover:bg-gray-100"
                >
                  <span className="mr-3">{item.icon}</span>
                  {item.text}
                </button>
              ))}
            </nav>
          </div>
        </div>
      </div>

      {/* Desktop sidebar */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-64 lg:flex-col">
        <div className="flex flex-col flex-1 min-h-0 bg-white border-r border-gray-200">
          <div className="flex items-center h-16 px-4 bg-primary-600">
            <h1 className="text-xl font-bold text-white">Telegram Clone</h1>
          </div>
          <nav className="flex-1 px-2 py-4 space-y-1">
            {menuItems.map((item) => (
              <button
                key={item.text}
                onClick={() => navigate(item.path)}
                className="flex items-center w-full px-2 py-2 text-gray-600 rounded-md hover:bg-gray-100"
              >
                <span className="mr-3">{item.icon}</span>
                {item.text}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Main content */}
      <div className="lg:pl-64">
        <div className="sticky top-0 z-10 flex items-center h-16 px-4 bg-white border-b border-gray-200">
          <button
            onClick={() => setMobileMenuOpen(true)}
            className="lg:hidden px-2 py-2 text-gray-500 rounded-md hover:bg-gray-100"
          >
            <FaBars />
          </button>
          <div className="flex-1" />
          <div className="relative">
            <button
              onClick={() => setUserMenuOpen(!userMenuOpen)}
              className="flex items-center text-gray-500 hover:text-gray-700"
            >
              <div className="w-8 h-8 rounded-full bg-primary-600 flex items-center justify-center text-white">
                {user?.firstName?.[0] || 'U'}
              </div>
            </button>
            {userMenuOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1">
                <button
                  onClick={() => {
                    navigate('/profile');
                    setUserMenuOpen(false);
                  }}
                  className="flex items-center w-full px-4 py-2 text-gray-700 hover:bg-gray-100"
                >
                  <FaUser className="mr-3" />
                  Profile
                </button>
                <button
                  onClick={() => {
                    navigate('/settings');
                    setUserMenuOpen(false);
                  }}
                  className="flex items-center w-full px-4 py-2 text-gray-700 hover:bg-gray-100"
                >
                  <FaCog className="mr-3" />
                  Settings
                </button>
                <button
                  onClick={() => {
                    handleLogout();
                    setUserMenuOpen(false);
                  }}
                  className="flex items-center w-full px-4 py-2 text-gray-700 hover:bg-gray-100"
                >
                  <FaSignOutAlt className="mr-3" />
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
        <main className="p-4">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default MainLayout; 