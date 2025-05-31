import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaSearch } from 'react-icons/fa';
import { renderIcon } from '../../utils/icons';
import { get, post } from '../../utils/apiBase';
import { useSelector } from 'react-redux';
import { RootState } from '../../store/index';

interface User {
  id: string;
  firstName: string;
  lastName: string;
  avatar?: string;
  online?: boolean;
}

interface Chat {
  id: string;
  participants: {
    userId: string;
    user: {
      id: string;
      firstName: string;
      lastName: string;
    }
  }[];
}

interface NewChatProps {
  onClose: () => void;
}

const NewChat = ({ onClose }: NewChatProps) => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const currentUser = useSelector((state: RootState) => state.auth.user);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await get<{ data: User[] }>('/users');
        const filteredUsers = response.data.filter((user: User) => user.id !== currentUser?.id);
        setUsers(filteredUsers);
      } catch (err: any) {
        setError(err.response?.data?.message || 'Failed to fetch users');
      }
    };

    fetchUsers();
  }, [currentUser?.id]);

  const filteredUsers = users.filter(user =>
    `${user.firstName} ${user.lastName}`.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleStartChat = async (userId: string) => {
    setLoading(true);
    setError(null);

    try {
      // First check if chat already exists
      const existingChats = await get<{ data: Chat[] }>('/chat');
      const existingChat = existingChats.data.find(chat => 
        chat.participants.some(p => p.userId === userId)
      );

      if (existingChat) {
        onClose();
        setTimeout(() => {
          navigate(`/chat/${existingChat.id}`, { replace: true });
        }, 100);
        return;
      }

      // If no existing chat, create new one
      const response = await post<{ data: { id: string } }>('/chat/create', {
        participantId: userId
      });

      if (!response.data?.id) {
        throw new Error('Invalid response from server');
      }

      onClose();
      setTimeout(() => {
        navigate(`/chat/${response.data.id}`, { replace: true });
      }, 100);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to start chat');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-white rounded-lg shadow-xl">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b bg-gray-50 rounded-t-lg">
        <div className="flex items-center">
          <h2 className="ml-2 text-xl font-semibold text-gray-900">New Chat</h2>
        </div>
      </div>

      {/* Search */}
      <div className="p-4 border-b">
        <div className="relative">
          <input
            type="text"
            placeholder="Search users..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-3 rounded-full bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all duration-200"
          />
          {renderIcon(FaSearch, "absolute left-3 top-1/3 -translate-y-1/2 text-gray-400 w-5 h-5")}
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="p-4 text-red-500 text-sm text-center bg-red-50 border-b border-red-100">
          {error}
        </div>
      )}

      {/* Users List */}
      <div className="flex-1 overflow-y-auto max-h-[60vh] scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent">
        {filteredUsers.map(user => (
          <div
            key={user.id}
            onClick={() => handleStartChat(user.id)}
            className="flex items-center p-4 hover:bg-gray-50 cursor-pointer border-b border-gray-100 transition-colors duration-200"
          >
            <div className="relative">
              {user.avatar ? (
                <img
                  src={user.avatar}
                  alt={`${user.firstName} ${user.lastName}`}
                  className="w-12 h-12 rounded-full object-cover ring-2 ring-gray-100"
                />
              ) : (
                <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center ring-2 ring-gray-100">
                  <span className="text-blue-600 font-medium">
                    {user.firstName[0]}
                    {user.lastName[0]}
                  </span>
                </div>
              )}
              {user.online && (
                <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white shadow-sm" />
              )}
            </div>
            <div className="ml-4 flex-1">
              <h3 className="font-medium text-gray-900">
                {user.firstName} {user.lastName}
              </h3>
              <p className="text-sm text-gray-500">
                {user.online ? 'Online' : 'Offline'}
              </p>
            </div>
          </div>
        ))}

        {filteredUsers.length === 0 && (
          <div className="p-8 text-center text-gray-500">
            {searchQuery ? 'No users found' : 'Loading users...'}
          </div>
        )}
      </div>

      {/* Loading Overlay */}
      {loading && (
        <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center backdrop-blur-sm">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      )}
    </div>
  );
};

export default NewChat; 