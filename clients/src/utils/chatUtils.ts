import { Chat, ChatUser } from '../store/slices/chatSlice';

export const formatTime = (dateString: string): string => {
  const date = new Date(dateString);
  const now = new Date();
  const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

  if (diffInHours < 24) {
    return date.toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit',
      hour12: true 
    });
  } else if (diffInHours < 48) {
    return 'Yesterday';
  } else if (diffInHours < 168) { // 7 days
    return date.toLocaleDateString('en-US', { weekday: 'short' });
  } else {
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric' 
    });
  }
};

export const getChatDisplayName = (chat: Chat, currentUserId: string): string => {
  if (chat.isGroup) {
    return chat.chatName || 'Group Chat';
  }
  
  // For individual chats, show the other user's name
  const otherUser = chat.users.find(user => user.id !== currentUserId);
  if (otherUser) {
    return `${otherUser.firstName} ${otherUser.lastName}`;
  }
  
  return 'Unknown User';
};

export const getChatDisplayAvatar = (chat: Chat, currentUserId: string): string => {
  if (chat.isGroup) {
    return chat.photo;
  }
  
  // For individual chats, show the other user's avatar
  const otherUser = chat.users.find(user => user.id !== currentUserId);
  if (otherUser) {
    return otherUser.profilePic;
  }
  
  return 'https://icon-library.com/images/anonymous-avatar-icon/anonymous-avatar-icon-25.jpg';
};

export const getChatLastMessage = (chat: Chat): string => {
  if (!chat.latestMessage) {
    return 'No messages yet';
  }
  
  const senderName = chat.latestMessage.sender.firstName;
  const content = chat.latestMessage.content;
  
  if (chat.isGroup) {
    return `${senderName}: ${content}`;
  }
  
  return content;
};

export const isUserOnline = (chat: Chat, currentUserId: string): boolean => {
  // This would typically check against a list of online users
  // For now, we'll return false as a placeholder
  // You can implement this with socket.io later
  return false;
};

export const getUnreadCount = (chat: Chat): number => {
  // This would typically come from the backend
  // For now, we'll return 0 as a placeholder
  // You can implement this with a separate unread messages count
  return 0;
};
