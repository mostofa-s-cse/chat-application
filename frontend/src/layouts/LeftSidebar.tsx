import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { FaSearch, FaBars, FaTimes, FaPlus } from 'react-icons/fa'
import { IconBaseProps, IconType } from 'react-icons';

interface MenuItem {
  id: string;
  name: string;
  avatar: string;
  lastMessage?: string;
  time?: string;
  unreadCount?: number;
  isOnline?: boolean;
  isTyping?: boolean;
}

interface MenuTab {
  id: string;
  label: string;
  unreadCount?: number;
}

const menuTabs: MenuTab[] = [
  { id: 'all', label: 'All' },
  { id: 'work', label: 'Work' },
  { id: 'private', label: 'Private', unreadCount: 2 },
  { id: 'groups', label: 'Groups' },
  { id: 'channels', label: 'Channels' }
];

const menuItems: MenuItem[] = [
  {
    id: '1',
    name: 'Lauri Edmon',
    avatar: 'https://images.unsplash.com/photo-1433588616917-dcbcc63429f4?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=',
    lastMessage: 'Writing...',
    time: '12.52',
    unreadCount: 2,
    isOnline: true,
    isTyping: true
  },
  {
    id: '2',
    name: 'Julian Gruber',
    avatar: 'https://images.unsplash.com/photo-1589349133269-183a6c90fbfc?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=100',
    lastMessage: 'Send audio...',
    time: '20.25',
    unreadCount: 2,
    isOnline: true
  },
  {
    id: '3',
    name: 'Karlien Nihen',
    avatar: 'https://images.unsplash.com/photo-1589222331438-0511a448dbc2?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=100',
    lastMessage: 'Writing...',
    time: '2.28',
    isTyping: true
  },
  {
    id: '4',
    name: 'Meg Rigden',
    avatar: 'https://images.unsplash.com/photo-1589351189946-b8eb5e170ba6?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=100',
    lastMessage: 'Washington D.C.',
    time: '12.52',
    unreadCount: 2
  },
  {
    id: '5',
    name: 'Mark Green',
    avatar: 'https://images.unsplash.com/photo-1589127097756-b2750896a728?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=100',
    lastMessage: 'I do not remember anything',
    time: '05:41',
    isOnline: true
  }
];

const LeftSidebar = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('all');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredUsers, setFilteredUsers] = useState<MenuItem[]>(menuItems);

  const renderIcon = (IconComponent: IconType, className?: string) => {
    const Icon = IconComponent as React.ComponentType<IconBaseProps>;
    return <Icon className={className} />;
  };

  const handleChatClick = (chatId: string) => {
    navigate(`/chat/${chatId}`);
    setIsMobileMenuOpen(false); // Close mobile menu after selection
  };

  const handleTabClick = (tabId: string) => {
    setActiveTab(tabId);
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    const filtered = menuItems.filter(user => 
      user.name.toLowerCase().includes(query.toLowerCase()) ||
      user.lastMessage?.toLowerCase().includes(query.toLowerCase())
    );
    setFilteredUsers(filtered);
  };

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={toggleMobileMenu}
        className="fixed top-4 left-4 z-50 p-2 text-gray-700 rounded-full focus:outline-none hover:text-gray-600 hover:bg-gray-200 md:hidden"
      >
        {isMobileMenuOpen ? renderIcon(FaTimes, 'w-5 h-5') : renderIcon(FaBars, 'w-5 h-5')}
      </button>

      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-40 w-96 transform transition-transform duration-300 ease-in-out md:relative md:translate-x-0 ${
        isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        <div className="relative flex flex-col h-full bg-white border-r border-gray-300 shadow-xl">
          {/* Header */}
          <div className="flex justify-between px-3 pt-1 text-white">
            <div className="flex items-center w-full py-2">
              <button 
                aria-haspopup="true" 
                className="p-2 text-gray-700 rounded-full focus:outline-none hover:text-gray-600 hover:bg-gray-200"
              >
                {renderIcon(FaBars, 'w-5 h-5')}
              </button>
              <div className="relative flex items-center w-full pl-2 overflow-hidden text-gray-600 focus-within:text-gray-400">
                <span className="absolute inset-y-0 left-0 flex items-center pl-4">
                  {renderIcon(FaSearch, 'w-5 h-5')}
                </span>
                <input
                  type="search"
                  value={searchQuery}
                  onChange={(e) => handleSearch(e.target.value)}
                  className="w-full py-2 pl-12 text-sm text-gray-900 bg-gray-200 border border-transparent appearance-none rounded-tg focus:bg-white focus:outline-none focus:border-blue-500 focus:text-gray-900 focus:shadow-outline-blue"
                  style={{borderRadius: 25}}
                  placeholder="Search users or messages..."
                  autoComplete="off"
                />
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="border-b shadow-bot">
            <ul className="flex flex-row items-center inline-block px-2 list-none select-none">
              {menuTabs.map((tab) => (
                <li 
                  key={tab.id}
                  onClick={() => handleTabClick(tab.id)}
                  className="flex-auto px-1 mx-1 -mb-px text-center rounded-t-lg cursor-pointer last:mr-0 hover:bg-gray-200"
                >
                  <a className={`flex items-center justify-center block py-2 text-xs font-semibold leading-normal tracking-wide border-b-2 ${
                    activeTab === tab.id ? 'border-blue-500' : 'border-transparent'
                  }`}>
                    {tab.label}
                    {tab.unreadCount && (
                      <span className="flex items-center justify-center w-5 h-5 ml-1 text-xs text-white bg-blue-500 rounded-full">
                        {tab.unreadCount}
                      </span>
                    )}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Chat List */}
          <div className="relative mt-2 mb-4 overflow-x-hidden overflow-y-auto scrolling-touch lg:max-h-sm scrollbar-w-2 scrollbar-track-gray-lighter scrollbar-thumb-rounded scrollbar-thumb-gray">
            <ul className="flex flex-col inline-block w-full h-screen px-2 select-none">
              {filteredUsers.map((item) => (
                <li 
                  key={item.id}
                  onClick={() => handleChatClick(item.id)}
                  className="flex flex-no-wrap items-center pr-3 text-black rounded-lg cursor-pointer mt-200 py-65 hover:bg-gray-200" 
                  style={{paddingTop: '0.65rem', paddingBottom: '0.65rem'}}
                >
                  <div className="flex justify-between w-full focus:outline-none">
                    <div className="flex justify-between w-full">
                      <div className="relative flex items-center justify-center w-12 h-12 ml-2 mr-3 text-xl font-semibold text-white bg-blue-500 rounded-full flex-no-shrink">
                        <img className="object-cover w-12 h-12 rounded-full" src={item.avatar} alt={item.name} />
                        {item.isOnline && (
                          <div className="absolute bottom-0 right-0 flex items-center justify-center bg-white rounded-full" style={{width: '0.80rem', height: '0.80rem'}}>
                            <div className="bg-green-500 rounded-full" style={{width: '0.6rem', height: '0.6rem'}} />
                          </div>
                        )}
                      </div>
                      <div className="items-center flex-1 min-w-0">
                        <div className="flex justify-between mb-1">
                          <h2 className="text-sm font-semibold text-black">{item.name}</h2>
                          <div className="flex">
                            {item.time && (
                              <span className="ml-1 text-xs font-medium text-gray-600">{item.time}</span>
                            )}
                          </div>
                        </div>
                        <div className="flex justify-between text-sm leading-none truncate">
                          <span>{item.lastMessage}</span>
                          {item.unreadCount && (
                            <span className="flex items-center justify-center w-5 h-5 text-xs text-right text-white bg-green-500 rounded-full">
                              {item.unreadCount}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          {/* New Chat Button */}
          <div className="fixed absolute bottom-0 right-0 z-40 mb-6 mr-4">
            <button 
              onClick={() => navigate('/new-chat')}
              className="flex items-center justify-center w-12 h-12 mr-3 text-xl font-semibold text-white bg-blue-500 rounded-full focus:outline-none flex-no-shrink hover:bg-blue-600 transition-colors"
            >
              {renderIcon(FaPlus, 'w-5 h-5')}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 z-30 bg-black bg-opacity-50 md:hidden"
          onClick={toggleMobileMenu}
        />
      )}
    </>
  )
}

export default LeftSidebar