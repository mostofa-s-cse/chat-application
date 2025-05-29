import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { RootState } from '../../store';
import { get, post } from '../../utils/api';

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

const GroupChat: React.FC = () => {
  const { groupId } = useParams<{ groupId: string }>();
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [groupInfo, setGroupInfo] = useState<GroupChatResponse | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const currentUser = useSelector((state: RootState) => (state.auth as AuthState).user);

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
    <div className="h-full flex flex-col">
      {/* Group Chat Header */}
      <div className="flex items-center justify-between p-4 border-b bg-white">
        <div className="flex items-center">
          <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
            <span className="text-blue-600 font-medium">
              {groupInfo?.name[0]}
            </span>
          </div>
          <div className="ml-3">
            <h2 className="text-lg font-medium text-gray-900">{groupInfo?.name}</h2>
            <p className="text-sm text-gray-500">
              {groupInfo?.participants.length} members
            </p>
          </div>
        </div>
        <button className="btn btn-outline-blue">
          View Members
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => {
          const isOwnMessage = message.senderId === currentUser?.id;
          return (
            <div
              key={message.id}
              className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'}`}
            >
              <div className="max-w-[70%]">
                {!isOwnMessage && (
                  <p className="text-xs text-gray-500 mb-1">
                    {message.sender.firstName} {message.sender.lastName}
                  </p>
                )}
                <div
                  className={`rounded-lg px-4 py-2 ${
                    isOwnMessage
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-900'
                  }`}
                >
                  <p className="text-sm">{message.content}</p>
                  <p
                    className={`text-xs mt-1 ${
                      isOwnMessage ? 'text-blue-100' : 'text-gray-500'
                    }`}
                  >
                    {new Date(message.createdAt).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      <form onSubmit={handleSendMessage} className="p-4 border-t bg-white">
        <div className="flex space-x-4">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type a message..."
            className="flex-1 input"
          />
          <button
            type="submit"
            disabled={!newMessage.trim()}
            className="btn btn-blue"
          >
            Send
          </button>
        </div>
      </form>
    </div>
  );
};

export default GroupChat; 