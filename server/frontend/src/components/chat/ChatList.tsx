import React from 'react';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';

interface Chat {
  id: string;
  name: string;
  lastMessage?: {
    content: string;
    timestamp: string;
  };
  unreadCount: number;
  avatar?: string;
}

interface ChatListProps {
  chats: Chat[];
}

const ChatList: React.FC<ChatListProps> = ({ chats }) => {
  const navigate = useNavigate();

  return (
    <div className="divide-y">
      {chats.map((chat) => (
        <div
          key={chat.id}
          onClick={() => navigate(`/chat/${chat.id}`)}
          className="block hover:bg-gray-50 cursor-pointer"
        >
          <div className="flex items-center p-4">
            <div className="flex-shrink-0">
              {chat.avatar ? (
                <img
                  src={chat.avatar}
                  alt={chat.name}
                  className="h-12 w-12 rounded-full"
                />
              ) : (
                <div className="h-12 w-12 rounded-full bg-primary-500 flex items-center justify-center text-white text-lg font-medium">
                  {chat.name[0].toUpperCase()}
                </div>
              )}
            </div>
            <div className="ml-4 flex-1">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-medium text-gray-900">{chat.name}</h3>
                {chat.lastMessage && (
                  <p className="text-xs text-gray-500">
                    {format(new Date(chat.lastMessage.timestamp), 'HH:mm')}
                  </p>
                )}
              </div>
              <div className="flex items-center justify-between mt-1">
                <p className="text-sm text-gray-500 truncate">
                  {chat.lastMessage?.content || 'No messages yet'}
                </p>
                {chat.unreadCount > 0 && (
                  <span className="inline-flex items-center justify-center h-5 w-5 rounded-full bg-primary-500 text-xs font-medium text-white">
                    {chat.unreadCount}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ChatList; 