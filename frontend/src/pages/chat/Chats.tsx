import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { get } from '../../utils/api';
import { IoMdChatboxes } from 'react-icons/io';
import { BsThreeDotsVertical } from 'react-icons/bs';
import { FaUserCircle } from 'react-icons/fa';
import { IconType, IconBaseProps } from 'react-icons';

interface Chat {
  id: string;
  participants: {
    id: string;
    firstName: string;
    lastName: string;
    avatar?: string;
  }[];
  lastMessage?: {
    content: string;
    createdAt: string;
    senderId: string;
  };
  unreadCount: number;
}

const Chats: React.FC = () => {
  const [chats, setChats] = useState<Chat[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const currentUser = useSelector((state: any) => state.auth.user);

  const renderIcon = (IconComponent: IconType, className?: string) => {
    const Icon = IconComponent as React.ComponentType<IconBaseProps>;
    return <Icon className={className} />;
  };

  useEffect(() => {
    const fetchChats = async () => {
      try {
        const response = await get<{ data: Chat[] }>('/chats');
        setChats(response.data);
      } catch (err: any) {
        setError(err.response?.data?.message || 'Failed to fetch chats');
      } finally {
        setLoading(false);
      }
    };

    fetchChats();
  }, []);

  const getOtherParticipant = (chat: Chat) => {
    return chat.participants.find(p => p.id !== currentUser?.id);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
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

  return (
    <div className="h-full overflow-y-auto">
      <div className="p-4 border-b bg-white">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900 flex items-center">
            {renderIcon(IoMdChatboxes, "mr-2 text-blue-600")}
            Chats
          </h1>
          <button className="p-2 hover:bg-gray-100 rounded-full">
            {renderIcon(BsThreeDotsVertical, "text-gray-500")}
          </button>
        </div>
      </div>

      {chats.length === 0 ? (
        <div className="text-center p-4">
          {renderIcon(FaUserCircle, "mx-auto h-12 w-12 text-gray-400")}
          <p className="mt-2 text-gray-500">No conversations yet</p>
        </div>
      ) : (
        <div className="divide-y divide-gray-200">
          {chats.map((chat) => {
            const otherParticipant = getOtherParticipant(chat);
            return (
              <Link
                key={chat.id}
                to={`/chat/${chat.id}`}
                className="block hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center p-4">
                  <div className="flex-shrink-0">
                    {otherParticipant?.avatar ? (
                      <img
                        src={otherParticipant.avatar}
                        alt={`${otherParticipant.firstName} ${otherParticipant.lastName}`}
                        className="h-12 w-12 rounded-full"
                      />
                    ) : (
                      <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center">
                        <span className="text-blue-600 font-medium">
                          {otherParticipant?.firstName[0]}
                          {otherParticipant?.lastName[0]}
                        </span>
                      </div>
                    )}
                  </div>
                  <div className="ml-4 flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {otherParticipant?.firstName} {otherParticipant?.lastName}
                      </p>
                      {chat.lastMessage && (
                        <p className="text-xs text-gray-500">
                          {new Date(chat.lastMessage.createdAt).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center justify-between mt-1">
                      <p className="text-sm text-gray-500 truncate">
                        {chat.lastMessage?.content || 'No messages yet'}
                      </p>
                      {chat.unreadCount > 0 && (
                        <span className="inline-flex items-center justify-center h-5 w-5 rounded-full bg-blue-600 text-xs font-medium text-white">
                          {chat.unreadCount}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Chats; 