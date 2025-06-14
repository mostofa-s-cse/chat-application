import { FaEllipsisH, FaCamera, FaPlus, FaSearch, FaArchive, FaCheckDouble, FaUsers, FaComment, FaPhone, FaCog } from 'react-icons/fa';
import { IoChatbubbleEllipses } from "react-icons/io5";
import CreateModal from './CreateModal';
import CallLogs from './CallLogs';
import CallModal from './CallModal';
import { useState } from 'react';

const getTimeColor = (unread: number) => unread > 0 ? 'text-blue-600 font-semibold' : 'text-gray-400';

const renderMessageStatus = (read: boolean) => read ? <FaCheckDouble aria-label="Message read" className="text-green-500 text-xs" /> : null;

const renderUnreadBadge = (unread: number) => unread > 0 ? <span className="ml-auto bg-blue-600 text-white text-xs font-semibold rounded-full w-5 h-5 flex items-center justify-center select-none">{unread}</span> : null;

const chatData = [
    {
      id: 1,
      name: 'Emma Carter',
      avatar: 'https://storage.googleapis.com/a1aa/image/81be462c-bb01-439f-abf9-79fa0c1b1f56.jpg',
      message: 'Hey! Are we still on for tonight? 😍, Let me know what time works for you!',
      time: '10:24 PM',
      unread: 1,
      read: true,
      online: false,
    },
    {
      id: 2,
      name: 'Sophia Rivera',
      avatar: 'https://storage.googleapis.com/a1aa/image/030ff9d7-440d-4505-1c02-746ca8c66c53.jpg',
      message: 'I just sent you the files. Check them out and tell me what you think.',
      time: '10:24 PM',
      unread: 0,
      read: false,
      online: true,
    },
    {
      id: 3,
      name: 'James Mitchell',
      avatar: 'https://storage.googleapis.com/a1aa/image/46d60eb8-029e-4a16-b49e-a53a210ba0bc.jpg',
      message: 'Had such a great time today! 😍 Let\'s do it again soon!',
      time: '10:24 PM',
      unread: 1,
      read: false,
      online: false,
    },
    {
      id: 4,
      name: 'Ava Martinez',
      avatar: 'https://storage.googleapis.com/a1aa/image/6befe650-e504-4065-dcdf-a1dc9a5bb15a.jpg',
      message: 'The game last night was crazy! Did you see that final goal?',
      time: '10:24 PM',
      unread: 0,
      read: true,
      online: false,
    },
    {
      id: 5,
      name: 'Olivia Nguyen',
      avatar: 'https://storage.googleapis.com/a1aa/image/31130072-5ee0-4273-1569-5e0b5e24910f.jpg',
      message: 'Morning! Don\'t forget our meeting. Let me know if you need anything then.',
      time: '10:24 PM',
      unread: 0,
      read: false,
      online: true,
    },
    {
      id: 6,
      name: 'Ethan Walker',
      avatar: 'https://storage.googleapis.com/a1aa/image/42c1205c-6222-445c-10eb-71b0ac202095.jpg',
      message: 'Yo, are you free to catch up later? Got some news to share!',
      time: 'Tomorrow',
      unread: 0,
      read: false,
      online: false,
    },
    {
      id: 7,
      name: 'Daniel Kim',
      avatar: 'https://storage.googleapis.com/a1aa/image/e88c0748-9f29-4848-e60b-ac9fa48100a6.jpg',
      message: 'Hey, I\'m running a little late. Should be there in 10 minutes!',
      time: 'Tomorrow',
      unread: 0,
      read: false,
      online: true,
    },
    {
      id: 8,
      name: 'Isabella Flores',
      avatar: 'https://storage.googleapis.com/a1aa/image/3fd278a2-7bf6-465d-76b6-b4a50d5944f1.jpg',
      message: 'Did you try that new café yet? The pastries are amazing!',
      time: 'Tuesday',
      unread: 0,
      read: false,
      online: true,
    },
    {
      id: 9,
      name: 'Liam Thompson',
      avatar: 'https://storage.googleapis.com/a1aa/image/490ab86f-1df4-4aba-39a9-1c9a0ca4fa55.jpg',
      message: 'Hey! Are we still on for tonight? 😍, Let me know what time works for you!',
      time: 'Tuesday',
      unread: 0,
      read: false,
      online: false,
    },
    {
      id: 10,
      name: 'Mia Johnson',
      avatar: 'https://storage.googleapis.com/a1aa/image/062854ce-c585-493c-3125-86a227c8655d.jpg',
      message: 'Just finished watching that show! You were right, it\'s SO good!',
      time: 'Monday',
      unread: 1,
      read: false,
      online: true,
    },
    {
      id: 11,
      name: 'Mia Johnson',
      avatar: 'https://storage.googleapis.com/a1aa/image/062854ce-c585-493c-3125-86a227c8655d.jpg',
      message: 'Just finished watching that show! You were right, it\'s SO good!',
      time: 'Monday',
      unread: 1,
      read: false,
      online: true,
    }
  ];
const LeftSidebar = () => {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showCallLogs, setShowCallLogs] = useState(false);
  const [showCallModal, setShowCallModal] = useState(false);
  const [callType, setCallType] = useState<'audio' | 'video'>('audio');
  const [selectedContact, setSelectedContact] = useState<{ name: string; avatar: string } | null>(null);

  const handleCall = (contact: { name: string; avatar: string }, type: 'audio' | 'video') => {
    setSelectedContact(contact);
    setCallType(type);
    setShowCallModal(true);
    setShowCallLogs(false);
  };

  return (
    <section aria-label="Chat list panel" className="bg-white w-full max-w-[380px] flex flex-col shadow-lg h-screen">
      {showCallLogs ? (
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
            {chatData.map((chat) => (
              <li 
                key={chat.id}
                aria-label={`Chat with ${chat.name}, last message: ${chat.message}${chat.unread > 0 ? `, ${chat.unread} unread message${chat.unread > 1 ? 's' : ''}` : ''}`}
                className="flex items-start space-x-3 cursor-pointer group hover:bg-gray-50 p-2 rounded-lg transition-colors" 
                tabIndex={0}
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
            ))}
          </ul>
          {/* Bottom navigation */}
          <nav aria-label="Bottom navigation" className="flex justify-between items-center border-t border-gray-200 px-5 pb-3 pt-4 text-xs text-gray-500 select-none">
            <button className="flex flex-col items-center space-y-1 text-black font-semibold">
              <FaComment className="text-lg" />
              <span>Chat</span>
            </button>
            <button className="flex flex-col items-center space-y-1">
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
            <button className="flex flex-col items-center space-y-1">
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