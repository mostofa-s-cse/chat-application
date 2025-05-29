export interface User {
  id: string;
  username: string;
  email: string;
  avatar?: string;
  online?: boolean;
}

export interface Message {
  id: string;
  content: string;
  sender: User;
  timestamp: string;
}

export interface Chat {
  id: string;
  otherParticipant: User;
  lastMessage?: Message;
  createdAt: string;
}

export interface LoginResponse {
  data: {
    user: User;
    accessToken: string;
  };
} 