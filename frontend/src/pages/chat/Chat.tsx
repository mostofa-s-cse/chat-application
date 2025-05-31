import React, { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { IoCallOutline, IoNotificationsOffOutline } from "react-icons/io5";
import { BsThreeDotsVertical } from "react-icons/bs";
import { IoIosSearch, IoMdClose, IoMdInformationCircleOutline } from "react-icons/io";
import { renderIcon } from '../../utils/icons';
import { FaPaperPlane, FaUser } from 'react-icons/fa';
import { User } from '../../types';
import { get, post } from '../../utils/apiBase';
import { useSelector } from 'react-redux';
import { RootState } from '../../store';

interface Message {
  id: string;
  content: string;
  senderId: string;
  receiverId: string;
  createdAt: string;
}

interface ChatParticipant {
  id: string;
  chatId: string;
  userId: string;
  createdAt: string;
  updatedAt: string;
  user: User;
}

interface Chat {
  id: string;
  createdAt: string;
  updatedAt: string;
  participants: ChatParticipant[];
}

const Chat = () => {
  const { chatId } = useParams();
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [chat, setChat] = useState<Chat | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [sending, setSending] = useState(false);
  const currentUser = useSelector((state: RootState) => state.auth.user);

  useEffect(() => {
    const fetchChat = async () => {
      try {
        const response = await get<Chat>(`/chat/${chatId}`);
        setChat(response);
      } catch (err: any) {
        setError(err.response?.data?.message || 'Failed to fetch chat details');
      } finally {
        setLoading(false);
      }
    };

    if (chatId) {
      fetchChat();
    }
  }, [chatId]);

  useEffect(() => {
    const fetchMessages = async () => {
      if (!chat || !currentUser) return;
      
      const otherParticipant = chat.participants[0]?.user;
      if (!otherParticipant) return;

      try {
        const response = await get<Message[]>(`/chat/messages?senderId=${currentUser.id}&receiverId=${otherParticipant.id}`);
        setMessages(response);
      } catch (err: any) {
        console.error('Failed to fetch messages:', err);
      }
    };

    fetchMessages();
  }, [chat, currentUser]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !chat || !currentUser) return;

    const otherParticipant = chat.participants[0]?.user;
    if (!otherParticipant) return;

    setSending(true);
    try {
      const response = await post<Message>('/chat/send', {
        content: newMessage,
        senderId: currentUser.id,
        receiverId: otherParticipant.id
      });
      
      setMessages(prev => [...prev, response]);
      setNewMessage('');
    } catch (err: any) {
      console.error('Failed to send message:', err);
    } finally {
      setSending(false);
    }
  };

  const toggleProfileMenu = () => {
    setIsProfileMenuOpen(!isProfileMenuOpen);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const otherParticipant = chat?.participants[0]?.user;
  if (!otherParticipant) {
    return (
      <div className="flex items-center justify-center h-full text-red-500">
        Participant not found
      </div>
    );
  }

  return (
    <>
      {/* center */}
      <div className="relative flex flex-col flex-1">
        <div className="z-20 flex flex-grow-0 flex-shrink-0 w-full pr-3 bg-white border-b">
          <div className="w-12 h-12 mx-4 my-2 bg-blue-500 bg-center bg-no-repeat bg-cover rounded-full cursor-pointer" 
               style={{backgroundImage: otherParticipant.profileImage ? `url(${otherParticipant.profileImage})` : 'none'}}>
            {!otherParticipant.profileImage && (
              <div className="w-full h-full flex items-center justify-center text-white font-medium">
                {otherParticipant.firstName[0]}{otherParticipant.lastName[0]}
              </div>
            )}
          </div>
          <div className="flex flex-col justify-center flex-1 overflow-hidden cursor-pointer">
            <div className="overflow-hidden text-base font-medium leading-tight text-gray-600 whitespace-no-wrap">
              {otherParticipant.firstName} {otherParticipant.lastName}
            </div>
            <div className="overflow-hidden text-sm font-medium leading-tight text-gray-600 whitespace-no-wrap">
              {otherParticipant.status === 'ONLINE' ? 'Online' : 'Offline'}
            </div>
          </div>
          <div className="relative hidden w-48 pl-2 my-3 border-l-2 border-blue-500 cursor-pointer lg:block">
            <div className="text-base font-medium text-blue-500">Chat Info</div>
            <div className="text-sm font-normal text-gray-800">
              Created {new Date(chat.createdAt).toLocaleDateString()}
            </div>
          </div>
          <button className="flex self-center p-2 ml-2 text-gray-500 rounded-full focus:outline-none hover:text-gray-600 hover:bg-gray-300">
            {renderIcon(IoNotificationsOffOutline, 'w-6 h-6')}
          </button>
          <button className="flex self-center p-2 ml-2 text-gray-500 rounded-full focus:outline-none hover:text-gray-600 hover:bg-gray-300">
            {renderIcon(IoIosSearch,'w-6 h-6')}
          </button>
          <button 
            type="button" 
            onClick={toggleProfileMenu}
            className="flex self-center hidden p-2 ml-2 text-gray-500 rounded-full md:block focus:outline-none hover:text-gray-600 hover:bg-gray-300"
          >
            {renderIcon(BsThreeDotsVertical,'w-5 h-5')}
          </button>
        </div>

        {/* Messages area */}
        <div className="flex-1 overflow-y-auto p-4">
          <div className="self-center px-2 py-1 mx-0 my-1 text-sm text-white text-gray-700 bg-white border border-gray-200 rounded-full shadow rounded-tg">
            Chat started with {otherParticipant.firstName} {otherParticipant.lastName}
          </div>
          
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.senderId === currentUser?.id ? 'justify-end' : 'justify-start'} mb-4`}
            >
              <div
                className={`max-w-[70%] rounded-lg px-4 py-2 ${
                  message.senderId === currentUser?.id
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-200 text-gray-800'
                }`}
              >
                <div className="text-sm">{message.content}</div>
                <div className={`text-xs mt-1 ${message.senderId === currentUser?.id ? 'text-blue-100' : 'text-gray-500'}`}>
                  {new Date(message.createdAt).toLocaleTimeString()}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Message input */}
        <form onSubmit={handleSendMessage} className="relative flex items-center self-center w-full max-w-xl p-4 overflow-hidden text-gray-600 focus-within:text-gray-400">
          <div className="w-full">
            <span className="absolute inset-y-0 left-0 flex items-center pl-6">
              <button type="button" className="p-1 focus:outline-none focus:shadow-none">
                {renderIcon(IoIosSearch,'w-5 h-5')}
              </button>
            </span>
            <input 
              type="text" 
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              className="w-full py-2 pl-10 pr-12 text-sm bg-white border border-transparent appearance-none rounded-tg placeholder-gray-800 focus:bg-white focus:outline-none focus:border-blue-500 focus:text-gray-900 focus:shadow-outline-blue" 
              style={{borderRadius: 25}} 
              placeholder="Type a message..." 
              autoComplete="off" 
            />
            <span className="absolute inset-y-0 right-0 flex items-center pr-6">
              <button 
                type="submit" 
                disabled={sending || !newMessage.trim()}
                className="p-1 focus:outline-none focus:shadow-none hover:text-blue-500 disabled:opacity-50"
              >
                {sending ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
                ) : (
                  renderIcon(FaPaperPlane,'w-4 h-4')
                )}
              </button>
            </span>
          </div>
        </form>
      </div>

      {/* Profile Menu */}
      {isProfileMenuOpen && (
        <nav className={`right-0 flex flex-col hidden pb-2 bg-white border-l border-gray-300 xl:block ${isProfileMenuOpen ? 'block' : 'hidden'}`} style={{width: '24rem'}}>
          <div className="flex items-center justify-between w-full p-3">
            <button className="p-2 text-gray-500 rounded-full focus:outline-none hover:text-gray-600 hover:bg-gray-200"
              onClick={toggleProfileMenu}
            >
              {renderIcon(IoMdClose,'w-6 h-6')}
            </button>
            <div className="ml-4 mr-auto text-lg font-medium">Info</div>
            
            <div className="relative">
              <button 
                type="button" 
                onClick={() => setIsSettingsOpen(!isSettingsOpen)}
                className="p-2 ml-1 text-gray-500 rounded-full focus:outline-none hover:text-gray-600 hover:bg-gray-200"
              >
                {isSettingsOpen ? renderIcon(IoMdClose,'w-5 h-5') : renderIcon(BsThreeDotsVertical,'w-5 h-5') }
              </button>
              {isSettingsOpen && (
                <div className="absolute right-0 z-10 w-48 mt-2 bg-white rounded-md shadow-lg">
                  <div className="py-1">
                    <Link to="/profile"
                      className="block w-full px-4 py-2 text-sm text-left text-gray-700 hover:bg-gray-100"
                    >
                      Profile
                    </Link>
                    <Link to="/settings"
                      className="block w-full px-4 py-2 text-sm text-left text-gray-700 hover:bg-gray-100"
                    >
                      Settings
                    </Link>
                    <Link to="#" onClick={toggleProfileMenu}
                      className="block w-full px-4 py-2 text-sm text-left text-gray-700 hover:bg-gray-100"
                    >
                      Close
                    </Link>
                  </div>
                </div>
              )}
            </div>
          </div>
          <div>
            <div className="flex justify-center mb-4">
              <button type="button" className="content-center block w-32 h-32 p-1 overflow-hidden text-center rounded-full focus:outline-none">
                {otherParticipant.profileImage ? (
                  <img 
                    className="content-center object-cover w-full h-full border-2 border-gray-200 rounded-full" 
                    src={otherParticipant.profileImage} 
                    alt={`${otherParticipant.firstName} ${otherParticipant.lastName}`} 
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-blue-100 border-2 border-gray-200 rounded-full">
                    <span className="text-4xl text-blue-600 font-medium">
                      {otherParticipant.firstName[0]}{otherParticipant.lastName[0]}
                    </span>
                  </div>
                )}
              </button>
            </div>
            <p className="text-lg font-semibold text-center text-gray-800">
              {otherParticipant.firstName} {otherParticipant.lastName}
            </p>
            <p className="text-sm font-medium text-center text-blue-500">
              {otherParticipant.status === 'ONLINE' ? 'Online' : 'Offline'}
            </p>
          </div>
          <div className="flex items-center w-full px-3 mt-6">
            <div className="px-2 text-gray-500 rounded-full hover:text-gray-600">
              {renderIcon(IoMdInformationCircleOutline,'w-6 h-6')}
            </div>
            <div className="ml-4">
              <div className="mr-auto text-sm font-semibold text-gray-800">{otherParticipant.email}</div>
              <div className="mt-1 mr-auto text-sm font-semibold leading-none text-gray-600">Email</div>
            </div>
          </div>
          <div>
            <div className="flex items-center w-full px-3 mt-4">
              <div className="px-2 text-gray-500 rounded-full hover:text-gray-600">
                {renderIcon(FaUser,'w-5 h-5')}
              </div>
              <div>
                <div className="ml-4 mr-auto text-sm font-semibold text-gray-800">
                  {otherParticipant.firstName} {otherParticipant.lastName}
                </div>
                <div className="mt-1 ml-4 mr-auto text-sm font-semibold leading-none text-gray-600">Name</div>
              </div>
            </div>
          </div>
          <div>
            <div className="flex items-center w-full px-3 mt-4 mb-2">
              <div className="px-2 text-gray-500 cursor-pointer">
                <input type="checkbox" className="form-checkbox h-5 w-5 text-blue-600" defaultChecked />
              </div>
              <div className="ml-4">
                <div className="mr-auto text-sm font-semibold text-gray-800">Notifications</div>
                <div className="mt-1 mr-auto text-sm font-semibold leading-none text-gray-600">Enabled</div>
              </div>
            </div>
          </div>
          <ul className="flex flex-row items-center justify-around px-3 mb-1 list-none border-b select-none">
            <li className="flex-auto px-4 mx-1 -mb-px text-center rounded-t-lg cursor-pointer last:mr-0 hover:bg-gray-200">
              <Link to="/chat/media" className="block py-3 text-xs font-bold leading-normal text-blue-500 uppercase border-b-4 border-blue-500">
                Media
              </Link>
            </li>
            <li className="flex-auto px-4 mx-1 -mb-px text-center rounded-t-lg cursor-pointer last:mr-0 hover:bg-gray-200">
              <Link to="/chat/docs" className="block py-3 text-xs font-bold leading-normal uppercase border-b-4 border-transparent">
                Docs
              </Link>
            </li>
            <li className="flex-auto px-4 mx-1 -mb-px text-center rounded-t-lg cursor-pointer last:mr-0 hover:bg-gray-200">
              <Link to="/chat/links" className="block py-3 text-xs font-bold leading-normal uppercase border-b-4 border-transparent">
                Links
              </Link>
            </li>
            <li className="flex-auto px-4 mx-1 -mb-px text-center rounded-t-lg cursor-pointer last:mr-0 hover:bg-gray-200">
              <Link to="/chat/audio" className="block py-3 text-xs font-bold leading-normal uppercase border-b-4 border-transparent">
                Audio
              </Link>
            </li>
          </ul>
        </nav>
      )}
    </>
  )
}

export default Chat