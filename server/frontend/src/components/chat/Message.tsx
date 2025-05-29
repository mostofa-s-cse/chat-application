import React from 'react';
import { format } from 'date-fns';

interface MessageProps {
  message: {
    id: string;
    content: string;
    senderId: string;
    timestamp: string;
    type: 'text' | 'image' | 'file';
    fileUrl?: string;
  };
  isOwnMessage: boolean;
}

const Message: React.FC<MessageProps> = ({ message, isOwnMessage }) => {
  const renderMessageContent = () => {
    switch (message.type) {
      case 'image':
        return (
          <img
            src={message.fileUrl}
            alt="Shared content"
            className="max-w-xs rounded-lg"
          />
        );
      case 'file':
        return (
          <a
            href={message.fileUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center space-x-2 text-primary-600 hover:text-primary-700"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
            </svg>
            <span>{message.content}</span>
          </a>
        );
      default:
        return <p className="text-gray-900">{message.content}</p>;
    }
  };

  return (
    <div className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'}`}>
      <div
        className={`max-w-xs lg:max-w-md rounded-lg px-4 py-2 ${
          isOwnMessage
            ? 'bg-primary-600 text-white'
            : 'bg-white text-gray-900 shadow'
        }`}
      >
        {renderMessageContent()}
        <div
          className={`text-xs mt-1 ${
            isOwnMessage ? 'text-primary-100' : 'text-gray-500'
          }`}
        >
          {format(new Date(message.timestamp), 'HH:mm')}
        </div>
      </div>
    </div>
  );
};

export default Message; 