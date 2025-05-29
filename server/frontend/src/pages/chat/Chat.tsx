import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { get, post } from '../../utils/api';
import { IoMdSend } from 'react-icons/io';
import { BsThreeDotsVertical } from 'react-icons/bs';
import { MdArrowBack } from 'react-icons/md';

interface Message {
  id: string;
  content: string;
  createdAt: string;
  senderId: string;
}

interface Participant {
  id: string;
  firstName: string;
  lastName: string;
  avatar?: string;
}

interface Chat {
  id: string;
  participants: Participant[];
  messages: Message[];
}

const ChatPage: React.FC = () => {
  const { chatId } = useParams<{ chatId: string }>();
  const [chat, setChat] = useState<Chat | null>(null);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const currentUser = useSelector((state: any) => state.auth.user);

  useEffect(() => {
    const fetchChat = async () => {
      try {
        const response = await get<{ data: Chat }>(`/chats/${chatId}`);
        setChat(response.data);
      } catch (err: any) {
        setError(err.response?.data?.message || 'Failed to fetch chat');
      } finally {
        setLoading(false);
      }
    };

    fetchChat();
  }, [chatId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chat?.messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    try {
      const response = await post<{ data: Message }>(`/chats/${chatId}/messages`, {
        content: newMessage,
      });
      setChat(prev => prev ? {
        ...prev,
        messages: [...prev.messages, response.data],
      } : null);
      setNewMessage('');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to send message');
    }
  };

  const getOtherParticipant = () => {
    return chat?.participants.find(p => p.id !== currentUser?.id);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center p-4">
        <p className="text-red-600">{error}</p>
      </div>
    );
  }

  const otherParticipant = getOtherParticipant();

  return (
    <div className="h-full flex flex-col">
      <div className="p-4 border-b bg-white">
        <div className="flex items-center">
          <button
            onClick={() => navigate('/chats')}
            className="mr-4 p-2 hover:bg-gray-100 rounded-full"
          >
            <MdArrowBack className="text-gray-600" />
          </button>
          <div className="flex-shrink-0">
            {otherParticipant?.avatar ? (
              <img
                src={otherParticipant.avatar}
                alt={`${otherParticipant.firstName} ${otherParticipant.lastName}`}
                className="h-10 w-10 rounded-full"
              />
            ) : (
              <div className="h-10 w-10 rounded-full bg-primary-100 flex items-center justify-center">
                <span className="text-primary-600 font-medium">
                  {otherParticipant?.firstName[0]}
                  {otherParticipant?.lastName[0]}
                </span>
              </div>
            )}
          </div>
          <div className="ml-3">
            <h2 className="text-lg font-medium text-gray-900">
              {otherParticipant?.firstName} {otherParticipant?.lastName}
            </h2>
          </div>
          <button className="ml-auto p-2 hover:bg-gray-100 rounded-full">
            <BsThreeDotsVertical className="text-gray-500" />
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {chat?.messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${
              message.senderId === currentUser?.id ? 'justify-end' : 'justify-start'
            }`}
          >
            <div
              className={`max-w-[70%] rounded-lg px-4 py-2 ${
                message.senderId === currentUser?.id
                  ? 'bg-primary-600 text-white'
                  : 'bg-gray-100 text-gray-900'
              }`}
            >
              <p>{message.content}</p>
              <p
                className={`text-xs mt-1 ${
                  message.senderId === currentUser?.id
                    ? 'text-primary-100'
                    : 'text-gray-500'
                }`}
              >
                {new Date(message.createdAt).toLocaleTimeString([], {
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </p>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={handleSendMessage} className="p-4 border-t bg-white">
        <div className="flex items-center space-x-4">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type a message..."
            className="flex-1 rounded-full border-gray-300 focus:ring-primary-500 focus:border-primary-500"
          />
          <button
            type="submit"
            disabled={!newMessage.trim()}
            className="p-2 rounded-full bg-primary-600 text-white hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <IoMdSend className="h-6 w-6" />
          </button>
        </div>
      </form>
    </div>
  );
};

export default ChatPage; 