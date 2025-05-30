import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { RootState } from '../../store';
import { FaUsers, FaSearch, FaPlus, FaTimes, FaArrowLeft } from 'react-icons/fa';
import { renderIcon } from '../../utils/icons';
import { get, post } from '../../utils/apiBase';

interface Message {
  id: string;
  content: string;
  createdAt: string;
  senderId: string;
  sender: {
    id: string;
    firstName: string;
    lastName: string;
    avatar?: string;
  };
}

interface Participant {
  id: string;
  firstName: string;
  lastName: string;
  avatar?: string;
}

interface GroupChatResponse {
  id: string;
  name: string;
  participants: Participant[];
  createdBy: string;
  createdAt: string;
}

interface AuthState {
  user: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
  } | null;
}

interface GroupMember {
  id: string;
  name: string;
  avatar?: string;
}

interface GroupResponse {
  data: {
    id: string;
    name: string;
  };
}

const GroupChat: React.FC = () => {
  const { groupId } = useParams<{ groupId: string }>();
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [groupInfo, setGroupInfo] = useState<GroupChatResponse | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const currentUser = useSelector((state: RootState) => (state.auth as AuthState).user);
  const navigate = useNavigate();
  const [groupName, setGroupName] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMembers, setSelectedMembers] = useState<GroupMember[]>([]);

  // Mock data - replace with actual data from your backend
  const [availableMembers] = useState<GroupMember[]>([
    {
      id: '1',
      name: 'John Doe',
      avatar: 'https://storage.googleapis.com/a1aa/image/4e58fbe4-113c-45b9-1d4a-9417475fd1d2.jpg'
    },
    {
      id: '2',
      name: 'Jane Smith',
      avatar: 'https://storage.googleapis.com/a1aa/image/e7390114-9330-4b20-3c48-8d5bc035d7ea.jpg'
    },
    // Add more mock members here
  ]);

  const filteredMembers = availableMembers.filter(member =>
    member.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  useEffect(() => {
    const fetchGroupChat = async () => {
      try {
        const [messagesRes, groupRes] = await Promise.all([
          get<{ data: Message[] }>(`/groups/${groupId}/messages`),
          get<{ data: GroupChatResponse }>(`/groups/${groupId}`)
        ]);
        setMessages(messagesRes.data);
        setGroupInfo(groupRes.data);
      } catch (err: any) {
        setError(err.response?.data?.message || 'Failed to fetch group chat');
      } finally {
        setLoading(false);
      }
    };

    fetchGroupChat();
  }, [groupId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    try {
      const res = await post<{ data: Message }>(`/groups/${groupId}/messages`, {
        content: newMessage,
      });
      setMessages((prev) => [...prev, res.data]);
      setNewMessage('');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to send message');
    }
  };

  const handleMemberSelect = (member: GroupMember) => {
    if (!selectedMembers.find(m => m.id === member.id)) {
      setSelectedMembers([...selectedMembers, member]);
    }
  };

  const handleMemberRemove = (memberId: string) => {
    setSelectedMembers(selectedMembers.filter(m => m.id !== memberId));
  };

  const handleCreateGroup = async () => {
    if (!groupName.trim() || selectedMembers.length === 0) return;

    setLoading(true);
    setError(null);

    try {
      const response = await post<GroupResponse>('/groups', {
        name: groupName,
        memberIds: selectedMembers.map(m => m.id)
      });

      // Navigate to the new group chat
      navigate(`/chat/${response.data.id}`);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to create group');
    } finally {
      setLoading(false);
    }
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
    <div className="flex flex-col h-full bg-white">
      {/* Header */}
      <div className="p-4 border-b flex items-center">
        <button
          onClick={() => navigate('/chats')}
          className="mr-4 p-2 hover:bg-gray-100 rounded-full"
        >
          {renderIcon(FaArrowLeft, "text-gray-600")}
        </button>
        <h2 className="text-xl font-semibold text-gray-900">Create New Group</h2>
      </div>

      {/* Group Name Input */}
      <div className="p-4 border-b">
        <input
          type="text"
          placeholder="Group Name"
          value={groupName}
          onChange={(e) => setGroupName(e.target.value)}
          className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Selected Members */}
      <div className="p-4 border-b">
        <h3 className="text-sm font-medium text-gray-700 mb-2">Selected Members</h3>
        <div className="flex flex-wrap gap-2">
          {selectedMembers.map(member => (
            <div
              key={member.id}
              className="flex items-center gap-2 bg-blue-100 text-blue-800 px-3 py-1 rounded-full"
            >
              <span className="text-sm">{member.name}</span>
              <button
                onClick={() => handleMemberRemove(member.id)}
                className="text-blue-600 hover:text-blue-800"
              >
                {renderIcon(FaTimes, "text-sm")}
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Member Search */}
      <div className="p-4 border-b">
        <div className="relative">
          <input
            type="text"
            placeholder="Search members..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-full bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          {renderIcon(FaSearch, "absolute left-3 top-1/2 -translate-y-1/2 text-gray-400")}
        </div>
      </div>

      {/* Available Members List */}
      <div className="flex-1 overflow-y-auto">
        {filteredMembers.map(member => (
          <div
            key={member.id}
            onClick={() => handleMemberSelect(member)}
            className="flex items-center p-4 hover:bg-gray-50 cursor-pointer border-b border-gray-100"
          >
            {member.avatar ? (
              <img
                src={member.avatar}
                alt={member.name}
                className="w-10 h-10 rounded-full object-cover"
              />
            ) : (
              <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                {renderIcon(FaUsers, "text-blue-500")}
              </div>
            )}
            <span className="ml-3 text-gray-900">{member.name}</span>
          </div>
        ))}
      </div>

      {/* Error Message */}
      {error && (
        <div className="p-4 text-red-500 text-sm text-center">
          {error}
        </div>
      )}

      {/* Create Group Button */}
      <div className="p-4 border-t">
        <button
          onClick={handleCreateGroup}
          disabled={!groupName.trim() || selectedMembers.length === 0 || loading}
          className="w-full flex items-center justify-center gap-2 bg-blue-500 text-white py-2 px-4 rounded-full hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? (
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
          ) : (
            renderIcon(FaPlus, "text-lg")
          )}
          <span>{loading ? 'Creating...' : 'Create Group'}</span>
        </button>
      </div>
    </div>
  );
};

export default GroupChat; 