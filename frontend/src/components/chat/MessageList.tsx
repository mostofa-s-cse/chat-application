import React, { useEffect, useRef } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../../store';
import Message from './Message';

interface MessageListProps {
  messages: Array<{
    id: string;
    content: string;
    senderId: string;
    timestamp: string;
    type: 'text' | 'image' | 'file';
    fileUrl?: string;
  }>;
}

const MessageList: React.FC<MessageListProps> = ({ messages }) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const currentUser = useSelector((state: RootState) => state.auth.user);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-4">
      {messages.map((message) => (
        <Message
          key={message.id}
          message={message}
          isOwnMessage={message.senderId === currentUser?.id}
        />
      ))}
      <div ref={messagesEndRef} />
    </div>
  );
};

export default MessageList; 