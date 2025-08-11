import { FaEllipsisH, FaCamera, FaPlus, FaSearch, FaArchive, FaCheckDouble, FaUsers, FaComment, FaPhone, FaCog } from 'react-icons/fa';
import { IoChatbubbleEllipses } from "react-icons/io5";
import CreateModal from './CreateModal';
import CallLogs from './CallLogs';
import CallModal from './CallModal';
import Settings from './Settings';
import CommunitySidebar from './CommunitySidebar';
import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../store';
import { fetchSidebarChats, setCurrentChat, updateSidebarChat } from '../store/slices/chatSlice';
import { useNavigate } from 'react-router-dom';
import { formatTime } from '../utils/chatUtils';

const getTimeColor = (unread: number) => unread > 0 ? 'text-blue-600 font-semibold' : 'text-gray-400';

const renderMessageStatus = (read: boolean) => read ? <FaCheckDouble aria-label="Message read" className="text-green-500 text-xs" /> : null;

const renderUnreadBadge = (unread: number) => unread > 0 ? <span className="ml-auto bg-blue-600 text-white text-xs font-semibold rounded-full w-5 h-5 flex items-center justify-center select-none">{unread}</span> : null;

const LeftSidebar = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { sidebarChats, chats, loading, error } = useSelector((state: RootState) => state.chat);
  const { user: currentUser } = useSelector((state: RootState) => state.auth);

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showCallLogs, setShowCallLogs] = useState(false);
  const [showCallModal, setShowCallModal] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showCommunity, setShowCommunity] = useState(false);
  const [callType, setCallType] = useState<'audio' | 'video'>('audio');
  const [selectedContact, setSelectedContact] = useState<{ name: string; avatar: string } | null>(null);

  // Fetch chats on component mount
  useEffect(() => {
    if (currentUser) {
      dispatch(fetchSidebarChats());
    }
  }, [dispatch, currentUser]);

  // Listen for socket events to update sidebar in real-time
  useEffect(() => {
    if (!currentUser?.id) return;

    const handleMessageReceived = (event: CustomEvent) => {
      const message = event.detail;
      console.log('Message received in sidebar:', message);
      
      // Update sidebar chat when new message arrives
      if (message.chatId) {
        // Handle different date formats safely
        let timeToFormat: string;
        
        try {
          if (message.createdAt) {
            // Check if createdAt is already a formatted time string
            if (typeof message.createdAt === 'string' && message.createdAt.includes(':')) {
              // It's already formatted, use it directly
              timeToFormat = new Date().toISOString(); // Use current time for relative formatting
            } else {
              // It's a date string, format it
              const date = new Date(message.createdAt);
              if (!isNaN(date.getTime())) {
                timeToFormat = date.toISOString();
              } else {
                // Invalid date, use current time
                timeToFormat = new Date().toISOString();
              }
            }
          } else {
            // No createdAt, use current time
            timeToFormat = new Date().toISOString();
          }
        } catch (error) {
          console.error('Error processing message date:', error);
          timeToFormat = new Date().toISOString(); // Fallback to current time
        }
        
        dispatch(updateSidebarChat({
          chatId: message.chatId,
          message: message.content || 'New message',
          time: formatTime(timeToFormat),
          unread: 1 // Increment unread count
        }));
      }
    };

    // Add event listener for new messages
    window.addEventListener('message-received', handleMessageReceived as EventListener);

    return () => {
      window.removeEventListener('message-received', handleMessageReceived as EventListener);
    };
  }, [dispatch, currentUser?.id]);

  const handleCall = (contact: { name: string; avatar: string }, type: 'audio' | 'video') => {
    setSelectedContact(contact);
    setCallType(type);
    setShowCallModal(true);
    setShowCallLogs(false);
  };

  const handleChatClick = (chat: any) => {

    console.log('=== Chat Click Debug ===');
    console.log('Chat clicked:', chat);
    console.log('Chat ID:', chat.id);
    console.log('Available chats:', chats.map(c => ({ id: c.id, name: c.chatName || 'Direct Chat' })));
    
    // Find the full chat object from the chats array
    const fullChat = chats.find(c => c.id === chat.id);
    
    if (fullChat) {
      console.log('✅ Found full chat:', fullChat);
      console.log('Setting current chat and navigating...');
      dispatch(setCurrentChat(fullChat));
      navigate(`/chat/${chat.id}`);
    } else {
      console.log('⚠️ Full chat not found in chats array');
      console.log('Navigating to let Chat component fetch it...');
      // Navigate to the chat and let the Chat component handle fetching
      navigate(`/chat/${chat.id}`);
    }
  };

  return (
    <section aria-label="Chat list panel" className="bg-white w-full max-w-[380px] flex flex-col shadow-lg h-screen">
      {showSettings ? (
        <Settings onBack={() => setShowSettings(false)} />
      ) : showCommunity ? (
        <CommunitySidebar onBack={() => setShowCommunity(false)} />
      ) : showCallLogs ? (
        <CallLogs 
          onBack={() => setShowCallLogs(false)} 
          onCall={handleCall}
        />
      ) : (
        <>
          {/* Top bar */}
          <header className="flex items-center justify-between px-5 py-3 border-b border-gray-200">
            <button aria-label="More options" className="text-gray-600 text-xl leading-none hover:text-gray-900">
              <FaEllipsisH />
            </button>
            <div className="flex items-center space-x-2">
              <IoChatbubbleEllipses className="text-2xl" />
              <span className="font-semibold text-gray-800 text-lg select-none">Synchat</span>
            </div>
            <div className="flex items-center space-x-3">
              <button
                aria-label="Add new chat"
                className="bg-blue-600 text-white rounded-full w-7 h-7 flex items-center justify-center text-xl hover:bg-blue-700"
                onClick={() => setShowCreateModal(true)}
              >
                <FaPlus className='text-white w-4 h-4' />
              </button>
            </div>
          </header>
          {/* Search bar */}
          <div className="px-5 py-3">
            <div className="flex items-center bg-gray-100 rounded-full px-4 py-2 text-gray-400 text-sm">
              <FaSearch className="mr-2" />
              <input aria-label="Search chats or ask Synchat AI" className="bg-transparent focus:outline-none w-full text-xs placeholder-gray-400" placeholder="Ask Synchat AI Or Search" type="search" />
            </div>
          </div>
          {/* Archive Chat label */}
          <div className="flex items-center justify-between px-8 pt-2 pb-3 text-xs font-semibold text-gray-700 select-none">
            <div className="flex items-center space-x-1">
              <FaArchive className="text-gray-400" />
              <span>Archive Chat</span>
            </div>
            <span className="text-blue-600">16</span>
          </div>
          {/* Chat list */}
          <ul 
            aria-label="Chat conversations" 
            className="chat-list overflow-y-auto flex-1 px-5 space-y-4 pb-6 h-96" 
            role="list"
          >
            {loading ? (
              // Loading skeleton
              Array.from({ length: 5 }).map((_, index) => (
                <li key={index} className="flex items-start space-x-3 p-2 rounded-lg animate-pulse">
                  <div className="w-10 h-10 bg-gray-300 rounded-full"></div>
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-gray-300 rounded w-3/4"></div>
                    <div className="h-3 bg-gray-300 rounded w-1/2"></div>
                  </div>
                </li>
              ))
            ) : error ? (
              <li className="text-center text-red-500 py-4">
                Error loading chats: {error}
              </li>
            ) : sidebarChats.length === 0 ? (
              <li className="text-center text-gray-500 py-4">
                No chats yet. Start a conversation!
              </li>
            ) : (
              sidebarChats.map((chat) => (
                <li 
                  key={chat.id}
                  aria-label={`Chat with ${chat.name}, last message: ${chat.message}${chat.unread > 0 ? `, ${chat.unread} unread message${chat.unread > 1 ? 's' : ''}` : ''}`}
                  className="flex items-start space-x-3 cursor-pointer group hover:bg-gray-50 p-2 rounded-lg transition-colors" 
                  tabIndex={0}
                  onClick={() => handleChatClick(chat)}
                >
                  <div className="relative">
                    <img 
                      alt={`${chat.name} portrait`} 
                      className={`rounded-full w-10 h-10 object-cover ${chat.online ? 'border-2 border-blue-600' : ''}`}
                      height={40} 
                      src={chat.avatar} 
                      width={40} 
                    />
                    {chat.online && (
                      <span 
                        aria-label="Online" 
                        className="absolute top-0 right-0 w-3.5 h-3.5 bg-blue-600 rounded-full ring-2 ring-white" 
                      />
                    )}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-center">
                      <h3 className="text-gray-900 font-semibold text-sm truncate select-text">
                        {chat.name}
                      </h3>
                      <span className={`text-xs select-text ${getTimeColor(chat.unread)}`}>
                        {chat.time}
                      </span>
                    </div>
                    
                    <div className="flex items-center space-x-1">
                      <p className="text-gray-700 text-xs truncate select-text">
                        {chat.message}
                      </p>
                      {renderMessageStatus(chat.read)}
                      {renderUnreadBadge(chat.unread)}
                    </div>
                  </div>
                </li>
              ))
            )}
          </ul>
          {/* Bottom navigation */}
          <nav aria-label="Bottom navigation" className="flex justify-between items-center border-t border-gray-200 px-5 pb-3 pt-4 text-xs text-gray-500 select-none">
            <button className="flex flex-col items-center space-y-1 text-black font-semibold">
              <FaComment className="text-lg" />
              <span>Chat</span>
            </button>
            <button 
              className="flex flex-col items-center space-y-1"
              onClick={() => setShowCommunity(true)}
            >
              <FaUsers className="text-lg" />
              <span>Community</span>
            </button>
            <button 
              className="flex flex-col items-center space-y-1 relative"
              onClick={() => setShowCallLogs(true)}
            >
              <FaPhone className="text-lg" />
              <span>Call</span>
              <span aria-label="New call notification" className="absolute top-0 right-6 w-2.5 h-2.5 bg-blue-600 rounded-full ring-2 ring-white" />
            </button>
            <button 
              className="flex flex-col items-center space-y-1"
              onClick={() => setShowSettings(true)}
            >
              <FaCog className="text-lg" />
              <span>Settings</span>
            </button>
          </nav>
        </>
      )}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          <div className="w-full max-w-lg">
            <CreateModal onClose={() => setShowCreateModal(false)} />
          </div>
        </div>
      )}
      {showCallModal && selectedContact && (
        <div className="fixed inset-0 z-50">
          <CallModal
            isOpen={showCallModal}
            onClose={() => setShowCallModal(false)}
            type={callType}
            contact={selectedContact}
          />
        </div>
      )}
    </section>
  );
};

export default LeftSidebar;