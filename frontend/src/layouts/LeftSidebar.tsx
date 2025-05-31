import React, { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { FaSearch, FaBars, FaTimes, FaPlus } from 'react-icons/fa'
import { renderIcon } from '../utils/icons';
import NewChat from '../pages/chat/NewChat';
import { get } from '../utils/apiBase';

interface Chat {
  id: string;
  createdAt: string;
  updatedAt: string;
  participants: {
    id: string;
    chatId: string;
    userId: string;
    createdAt: string;
    updatedAt: string;
    user: {
      id: string;
      firstName: string;
      lastName: string;
      email: string;
      profileImage: string | null;
      status: string;
      lastSeen: string;
    }
  }[];
}

const LeftSidebar = () => {
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [chats, setChats] = useState<Chat[]>([]);
  const [isNewChatOpen, setIsNewChatOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchChats();
  }, []);

  const fetchChats = async () => {
    try {
      const response = await get<Chat[]>('/chat');
      setChats(response);
    } catch (error) {
      console.error('Failed to fetch chats:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleChatClick = (chatId: string) => {
    navigate(`/chat/${chatId}`);
    setIsMobileMenuOpen(false);
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  const handleNewChatClick = () => {
    setIsNewChatOpen(true);
  };

  const handleCloseNewChat = () => {
    setIsNewChatOpen(false);
  };

  const filteredChats = chats.filter(chat => {
    if (!chat.participants || chat.participants.length === 0) return false;
    const participant = chat.participants[0];
    if (!participant || !participant.user) return false;
    const fullName = `${participant.user.firstName} ${participant.user.lastName}`.toLowerCase();
    return fullName.includes(searchQuery.toLowerCase());
  });

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
                  placeholder="Search chats..."
                  autoComplete="off"
                />
              </div>
            </div>
          </div>

          {/* Chat List */}
          <div className="relative mt-2 mb-4 overflow-x-hidden overflow-y-auto scrolling-touch lg:max-h-sm scrollbar-w-2 scrollbar-track-gray-lighter scrollbar-thumb-rounded scrollbar-thumb-gray">
            {loading ? (
              <div className="flex items-center justify-center h-32">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
              </div>
            ) : (
              <ul className="flex flex-col inline-block w-full h-screen px-2 select-none">
                {filteredChats.map((chat) => {
                  const participant = chat.participants[0];
                  if (!participant || !participant.user) return null;
                  
                  return (
                    <li 
                      key={chat.id}
                      onClick={() => handleChatClick(chat.id)}
                      className="flex flex-no-wrap items-center pr-3 text-black rounded-lg cursor-pointer mt-200 py-65 hover:bg-gray-200" 
                      style={{paddingTop: '0.65rem', paddingBottom: '0.65rem'}}
                    >
                      <div className="flex justify-between w-full focus:outline-none">
                        <div className="flex justify-between w-full">
                          <div className="relative flex items-center justify-center w-12 h-12 ml-2 mr-3 text-xl font-semibold text-white bg-blue-500 rounded-full flex-no-shrink">
                            {participant.user.profileImage ? (
                              <img 
                                className="object-cover w-12 h-12 rounded-full" 
                                src={participant.user.profileImage} 
                                alt={`${participant.user.firstName} ${participant.user.lastName}`} 
                              />
                            ) : (
                              <span className="text-lg">
                                {participant.user.firstName[0]}{participant.user.lastName[0]}
                              </span>
                            )}
                            {participant.user.status === 'ONLINE' && (
                              <div className="absolute bottom-0 right-0 flex items-center justify-center bg-white rounded-full" style={{width: '0.80rem', height: '0.80rem'}}>
                                <div className="bg-green-500 rounded-full" style={{width: '0.6rem', height: '0.6rem'}} />
                              </div>
                            )}
                          </div>
                          <div className="items-center flex-1 min-w-0">
                            <div className="flex justify-between mb-1">
                              <h2 className="text-sm font-semibold text-black">
                                {participant.user.firstName} {participant.user.lastName}
                              </h2>
                              <span className="ml-1 text-xs font-medium text-gray-600">
                                {new Date(chat.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </span>
                            </div>
                            <div className="flex justify-between text-sm leading-none truncate">
                              <span className="text-gray-600">
                                {participant.user.email}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>

          {/* New Chat Button */}
          <div className="fixed absolute bottom-0 right-0 z-40 mb-6 mr-4">
            <button 
              onClick={handleNewChatClick}
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

      {/* New Chat Modal */}
      {isNewChatOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="relative w-full max-w-md mx-4 bg-white rounded-lg shadow-xl">
            <div className="absolute top-0 right-0 p-4">
              <button
                onClick={handleCloseNewChat}
                className="text-gray-400 hover:text-gray-500 focus:outline-none"
              >
                {renderIcon(FaTimes, 'w-5 h-5')}
              </button>
            </div>
            <NewChat onClose={handleCloseNewChat} />
          </div>
        </div>
      )}
    </>
  )
}

export default LeftSidebar