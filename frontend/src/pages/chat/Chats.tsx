import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaSearch, FaPlus, FaUsers, FaUserPlus } from 'react-icons/fa';
import { renderIcon } from '../../utils/icons';

interface ChatPreview {
  id: string;
  name: string;
  avatar?: string;
  lastMessage: string;
  timestamp: string;
  unread: number;
  isGroup: boolean;
  online?: boolean;
}

const Chats: React.FC = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [showNewChatMenu, setShowNewChatMenu] = useState(false);
  
  // Mock data - replace with actual data from your backend
  const [chats] = useState<ChatPreview[]>([
    {
      id: '1',
      name: 'John Doe',
      avatar: 'https://storage.googleapis.com/a1aa/image/4e58fbe4-113c-45b9-1d4a-9417475fd1d2.jpg',
      lastMessage: 'Hey, how are you?',
      timestamp: '12:30',
      unread: 2,
      isGroup: false,
      online: true
    },
    {
      id: '2',
      name: 'Project Team',
      lastMessage: 'Meeting at 3 PM',
      timestamp: '11:45',
      unread: 5,
      isGroup: true
    },
    // Add more mock chats here
  ]);

  const filteredChats = chats.filter(chat => 
    chat.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleNewChatClick = () => {
    setShowNewChatMenu(!showNewChatMenu);
  };

  const handleNewIndividualChat = () => {
    navigate('/new-chat');
    setShowNewChatMenu(false);
  };

  const handleNewGroupChat = () => {
    navigate('/new-group');
    setShowNewChatMenu(false);
  };

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Header */}
      <div className="p-4 border-b">
        <div className="relative">
          <div className="flex items-center justify-center">
            <input
              type="text"
              placeholder="Search chats..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-full bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {renderIcon(FaSearch, "absolute left-3 top-1/3 -translate-y-1/2 text-gray-400")}
          </div>
        </div>
      </div>

      {/* Chat List */}
      <div className="flex-1 overflow-y-auto">
        {filteredChats.map((chat) => (
          <div
            key={chat.id}
            onClick={() => navigate(`/chat/${chat.id}`)}
            className="flex items-center p-4 hover:bg-gray-50 cursor-pointer border-b border-gray-100"
          >
            <div className="relative">
              {chat.avatar ? (
                <img
                  src={chat.avatar}
                  alt={chat.name}
                  className="w-12 h-12 rounded-full object-cover"
                />
              ) : (
                <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
                  {renderIcon(chat.isGroup ? FaUsers : FaUsers, "text-blue-500 text-xl")}
                </div>
              )}
              {chat.online && (
                <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white" />
              )}
            </div>
            <div className="ml-4 flex-1">
              <div className="flex justify-between items-start">
                <h3 className="font-medium text-gray-900">{chat.name}</h3>
                <span className="text-xs text-gray-500">{chat.timestamp}</span>
              </div>
              <div className="flex justify-between items-center mt-1">
                <p className="text-sm text-gray-500 truncate max-w-[200px]">
                  {chat.lastMessage}
                </p>
                {chat.unread > 0 && (
                  <span className="ml-2 bg-blue-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    {chat.unread}
                  </span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* New Chat Button with Menu */}
      <div className="p-4 border-t relative">
        <button
          onClick={handleNewChatClick}
          className="w-full flex items-center justify-center gap-2 bg-blue-500 text-white py-2 px-4 rounded-full hover:bg-blue-600 transition-colors"
        >
          {renderIcon(FaPlus, "text-lg")}
          <span>New Chat</span>
        </button>

        {/* New Chat Menu */}
        {showNewChatMenu && (
          <div className="absolute bottom-full left-4 right-4 mb-2 bg-white rounded-lg shadow-lg border border-gray-200">
            <button
              onClick={handleNewIndividualChat}
              className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 text-left"
            >
              {renderIcon(FaUserPlus, "text-blue-500")}
              <span>New Individual Chat</span>
            </button>
            <button
              onClick={handleNewGroupChat}
              className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 text-left border-t border-gray-100"
            >
              {renderIcon(FaUsers, "text-blue-500")}
              <span>New Group Chat</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Chats; 