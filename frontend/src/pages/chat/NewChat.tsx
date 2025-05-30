import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaSearch, FaArrowLeft, FaUser } from 'react-icons/fa';
import { renderIcon } from '../../utils/icons';
import { get, post } from '../../utils/apiBase';
import { useSelector } from 'react-redux';
import { RootState } from '../../store';

interface User {
  id: string;
  firstName: string;
  lastName: string;
  avatar?: string;
  online?: boolean;
}

interface ChatResponse {
  data: {
    id: string;
    participantId: string;
  };
}

const NewChat: React.FC = () => {
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
        // Filter out current user from the list
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
      const response = await post<ChatResponse>('/chats', {
        participantId: userId
      });

      // Navigate to the new chat
      navigate(`/chat/${response.data.id}`);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to start chat');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Header */}
      <div className="p-4 border-b flex items-center">
        <button
          onClick={() => navigate('/chats')}
          className="mr-4 p-2 hover:bg-gray-100 rounded-full"
        >
          {renderIcon(FaArrowLeft, "text-gray-600")}
        </button>
        <h2 className="text-xl font-semibold text-gray-900">New Chat</h2>
      </div>

      {/* Search */}
      <div className="p-4 border-b">
        <div className="relative">
          <input
            type="text"
            placeholder="Search users..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-full bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          {renderIcon(FaSearch, "absolute left-3 top-1/2 -translate-y-1/2 text-gray-400")}
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="p-4 text-red-500 text-sm text-center">
          {error}
        </div>
      )}

      {/* Users List */}
      <div className="flex-1 overflow-y-auto">
        {filteredUsers.map(user => (
          <div
            key={user.id}
            onClick={() => handleStartChat(user.id)}
            className="flex items-center p-4 hover:bg-gray-50 cursor-pointer border-b border-gray-100"
          >
            <div className="relative">
              {user.avatar ? (
                <img
                  src={user.avatar}
                  alt={`${user.firstName} ${user.lastName}`}
                  className="w-12 h-12 rounded-full object-cover"
                />
              ) : (
                <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
                  <span className="text-blue-600 font-medium">
                    {user.firstName[0]}
                    {user.lastName[0]}
                  </span>
                </div>
              )}
              {user.online && (
                <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white" />
              )}
            </div>
            <div className="ml-4">
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
          <div className="p-4 text-center text-gray-500">
            {searchQuery ? 'No users found' : 'Loading users...'}
          </div>
        )}
      </div>

      {/* Loading Overlay */}
      {loading && (
        <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      )}
    </div>
  );
};

export default NewChat; 