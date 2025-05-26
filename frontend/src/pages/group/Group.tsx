import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { formatMessageTime } from '../../utils/date';

interface GroupMember {
  id: string;
  username: string;
  fullName: string;
  avatar: string;
  role: 'admin' | 'member';
}

interface GroupMessage {
  id: string;
  content: string;
  type: string;
  fileUrl?: string;
  createdAt: string;
  senderId: string;
  sender: {
    id: string;
    username: string;
    fullName: string;
    avatar: string;
  };
}

interface GroupProps {
  groupId: string;
  name: string;
  description: string;
  members: GroupMember[];
  messages: GroupMessage[];
  onSendMessage: (content: string) => void;
  onAddMember: (userId: string) => void;
  onRemoveMember: (userId: string) => void;
  onLeaveGroup: () => void;
}

const Group: React.FC<GroupProps> = ({
  groupId,
  name,
  description,
  members,
  messages,
  onSendMessage,
  onAddMember,
  onRemoveMember,
  onLeaveGroup,
}) => {
  const { user } = useAuth();
  const [newMessage, setNewMessage] = useState('');
  const [isMemberListOpen, setIsMemberListOpen] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    onSendMessage(newMessage);
    setNewMessage('');
  };

  const isAdmin = members.find((member) => member.id === user?.id)?.role === 'admin';

  return (
    <div className="flex h-[calc(100vh-8rem)]">
      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {/* Group Header */}
        <div className="bg-white border-b px-4 py-3 flex items-center justify-between">
          <div>
            <h2 className="font-semibold text-gray-900">{name}</h2>
            <p className="text-sm text-gray-500">{description}</p>
          </div>
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setIsMemberListOpen(!isMemberListOpen)}
              className="btn btn-secondary"
            >
              Members ({members.length})
            </button>
            <button onClick={onLeaveGroup} className="btn btn-secondary">
              Leave Group
            </button>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((message) => (
            <div key={message.id} className="flex space-x-3">
              <img
                src={message.sender.avatar || 'https://via.placeholder.com/40'}
                alt={message.sender.username}
                className="w-8 h-8 rounded-full"
              />
              <div>
                <div className="flex items-center space-x-2">
                  <span className="font-medium text-gray-900">{message.sender.fullName}</span>
                  <span className="text-xs text-gray-500">
                    {formatMessageTime(message.createdAt)}
                  </span>
                </div>
                <p className="text-gray-700">{message.content}</p>
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        {/* Message Input */}
        <form onSubmit={handleSubmit} className="bg-white border-t p-4">
          <div className="flex space-x-4">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Type a message..."
              className="input flex-1"
            />
            <button type="submit" className="btn btn-primary">
              Send
            </button>
          </div>
        </form>
      </div>

      {/* Member List Sidebar */}
      {isMemberListOpen && (
        <div className="w-80 bg-white border-l">
          <div className="p-4 border-b">
            <h3 className="font-medium text-gray-900">Group Members</h3>
          </div>
          <div className="overflow-y-auto h-[calc(100%-4rem)]">
            {members.map((member) => (
              <div key={member.id} className="p-4 border-b flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <img
                    src={member.avatar || 'https://via.placeholder.com/40'}
                    alt={member.username}
                    className="w-10 h-10 rounded-full"
                  />
                  <div>
                    <p className="font-medium text-gray-900">{member.fullName}</p>
                    <p className="text-sm text-gray-500">@{member.username}</p>
                  </div>
                </div>
                {isAdmin && member.id !== user?.id && (
                  <button
                    onClick={() => onRemoveMember(member.id)}
                    className="text-red-600 hover:text-red-700"
                  >
                    Remove
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Group; 