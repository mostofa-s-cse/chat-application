import { FaChevronLeft, FaPhone, FaVideo, FaPlus, FaCamera, FaMicrophone, FaPaperPlane, FaDownload, FaReply, FaFile, FaTrash, FaPause, FaPlay, FaEllipsisV, FaHeart, FaSmile, FaMapMarkerAlt, FaUser, FaStickyNote, FaCheckDouble, FaTimes } from 'react-icons/fa';
import { HiDotsVertical } from 'react-icons/hi';
import { BsEmojiSmile } from "react-icons/bs";
import { MdLocationOn, MdAttachFile, MdGif } from 'react-icons/md';
import LeftSidebar from './LeftSidebar';
import ProfileModal from './ProfileModal';
import ImageModal from './ImageModal';
import SkeletonLoader from './SkeletonLoader';
import { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import EmojiPicker, { EmojiClickData } from 'emoji-picker-react';
import CallModal from './CallModal';
import { useChatSocket } from '../hooks/useChatSocket';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../store';
import { setCurrentChat, addNewMessage, updateChatLatestMessage, ChatMessage } from '../store/slices/chatSlice';
import { chatService } from '../services/api';

interface MessageAttachment {
  id: string;
  type: 'IMAGE' | 'AUDIO' | 'VIDEO' | 'FILE' | 'LOCATION' | 'CONTACT' | 'STICKER' | 'GIF';
  url: string;
  fileName?: string;
  fileSize?: number;
  mimeType?: string;
  thumbnail?: string;
  duration?: number;
  width?: number;
  height?: number;
}

interface MessageReaction {
  id: string;
  emoji: string;
  user: {
    id: string;
    firstName: string;
    lastName: string;
    profilePic: string;
  };
}

interface Message {
  id: string;
  content: string;
  type: 'TEXT' | 'IMAGE' | 'AUDIO' | 'VIDEO' | 'FILE' | 'LOCATION' | 'CONTACT' | 'STICKER' | 'GIF' | 'VOICE_MESSAGE' | 'SYSTEM_MESSAGE';
  sender: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    profilePic: string;
  };
  chatId: string;
  createdAt: string;
  attachments: MessageAttachment[];
  reactions: MessageReaction[];
  replyTo?: Message;
  isEdited: boolean;
  isDeleted: boolean;
  readBy: string[];
}

interface TypingUser {
  id: string;
  firstName: string;
  lastName: string;
}

const Chat = () => {
  const { chatId } = useParams<{ chatId: string }>();
  const dispatch = useDispatch();
  
  // Initialize chat socket for real-time updates
  const { sendMessage: sendSocketMessage, joinChat, leaveChat, sendTypingIndicator } = useChatSocket();
  
  const { user: currentUser } = useSelector((state: RootState) => state.auth);
  const { chats, currentChat } = useSelector((state: RootState) => state.chat);
  
  // Use Redux state for messages instead of local state
  const chatMessages = currentChat?.messages || [];
  
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const [showUploadMenu, setShowUploadMenu] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [showProfile, setShowProfile] = useState(false);
  const [showImageModal, setShowImageModal] = useState(false);
  const [selectedImages, setSelectedImages] = useState<string[]>([]);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  // Removed isLoading state since we're using Redux
  const [messageInput, setMessageInput] = useState('');
  const [showCallModal, setShowCallModal] = useState(false);
  const [callType, setCallType] = useState<'audio' | 'video'>('audio');
  const [isSending, setIsSending] = useState(false);
  const [typingUsers, setTypingUsers] = useState<TypingUser[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [replyToMessage, setReplyToMessage] = useState<Message | null>(null);
  const [showReactionPicker, setShowReactionPicker] = useState<string | null>(null);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const [isFetchingChat, setIsFetchingChat] = useState(false);

  const menuRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const uploadMenuRef = useRef<HTMLDivElement>(null);
  const emojiPickerRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordingTimerRef = useRef<NodeJS.Timeout | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const fetchingChatIdRef = useRef<string | null>(null);
  const processedChatIdRef = useRef<string | null>(null);
  useEffect(() => {
    // Reset refs when chatId changes
    if (processedChatIdRef.current !== chatId) {
      processedChatIdRef.current = null;
      fetchingChatIdRef.current = null;
      setIsFetchingChat(false);
    }
    
    // Prevent multiple executions for the same chatId
    if (!chatId || fetchingChatIdRef.current === chatId || processedChatIdRef.current === chatId) {
      return;
    }

    // First try to find the chat in existing chats
    let chat = chats.find(c => c.id === chatId);
    
    if (chat && (!currentChat || currentChat.id !== chat.id)) {
      // Chat found in existing chats, set it as current
      console.log('Chat found in existing chats, setting as current:', chat.id);
      dispatch(setCurrentChat(chat));
      joinChat(chat.id);
      processedChatIdRef.current = chatId; // Mark as processed
    } else if (!chat && !isFetchingChat) {
      // Chat not found in existing chats, try to fetch it from server
      // Only fetch if not already fetching
      console.log('Chat not found in existing chats, fetching from server...');
      console.log('Fetching chat with ID:', chatId);
      
      setIsFetchingChat(true);
      fetchingChatIdRef.current = chatId;
      
      chatService.fetchChatById(chatId)
        .then(fetchedChat => {
          console.log('Chat fetched from server:', fetchedChat);
          if (fetchedChat) {
            console.log('Setting current chat:', fetchedChat);
            dispatch(setCurrentChat(fetchedChat));
            joinChat(fetchedChat.id);
            // Add the fetched chat to the chats array if not already there
            if (!chats.find(c => c.id === fetchedChat.id)) {
              // You might want to dispatch an action to add this chat to the store
              console.log('Chat fetched successfully:', fetchedChat);
            }
          } else {
            console.error('Chat not found on server');
            // Don't redirect, just show an error message
          }
        })
        .catch(error => {
          console.error('Error fetching chat:', error);
          // Don't redirect, just show an error message
        })
        .finally(() => {
          // Clear the fetching flag
          setIsFetchingChat(false);
          fetchingChatIdRef.current = null;
          processedChatIdRef.current = chatId; // Mark as processed
        });
    } else if (isFetchingChat) {
      console.log('Chat fetch already in progress for:', chatId);
    }
  }, [chatId]); // Only depend on chatId to prevent infinite loops

  // Handle updates when chats or currentChat changes
  useEffect(() => {
    if (chatId && chats.length > 0) {
      const chat = chats.find(c => c.id === chatId);
      if (chat && (!currentChat || currentChat.id !== chat.id)) {
        console.log('Chat found in updated chats, setting as current:', chat.id);
        dispatch(setCurrentChat(chat));
        joinChat(chat.id);
      }
    }
  }, [chats, currentChat?.id, chatId, dispatch, joinChat]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setActiveMenu(null);
      }
      if (uploadMenuRef.current && !uploadMenuRef.current.contains(event.target as Node)) {
        setShowUploadMenu(false);
      }
      if (emojiPickerRef.current && !emojiPickerRef.current.contains(event.target as Node)) {
        setShowEmojiPicker(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  useEffect(() => {
    const scrollToBottom = () => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    scrollToBottom();
  }, [chatMessages]);

  // Cleanup typing timeout on unmount
  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, []);

  // Cleanup chat fetching on unmount
  useEffect(() => {
    return () => {
      setIsFetchingChat(false);
      fetchingChatIdRef.current = null;
      processedChatIdRef.current = null;
    };
  }, []);

  // Fetch messages when currentChat is set
  useEffect(() => {
    console.log('useEffect triggered - currentChat:', currentChat, 'chatId:', chatId);
    if (currentChat && currentChat.id === chatId) {
      console.log('Chat matches, checking messages...');
      // Check if we need to fetch messages
      if (!currentChat.messages || currentChat.messages.length === 0) {
        console.log('Fetching messages for chat:', currentChat.id);
        console.log('Current chat state:', currentChat);
        setIsLoadingMessages(true);
        chatService.getMessages(currentChat.id)
          .then(messages => {
            console.log('Messages fetched:', messages);
            setIsLoadingMessages(false);
            // Update the current chat with fetched messages
            if (messages && Array.isArray(messages)) {
              console.log('Updating chat with messages:', messages);
              const updatedChat = {
                ...currentChat,
                messages: messages
              };
              dispatch(setCurrentChat(updatedChat));
            }
          })
          .catch(error => {
            console.error('Error fetching messages:', error);
            setIsLoadingMessages(false);
          });
      } else {
        console.log('Chat already has messages:', currentChat.messages);
      }
    }
  }, [currentChat, chatId, dispatch]);

  // Removed problematic typing indicator effect

  const handleMenuClick = (messageId: string, event: React.MouseEvent) => {
    event.stopPropagation();
    setActiveMenu(activeMenu === messageId ? null : messageId);
  };

  const handleUploadMenuClick = (event: React.MouseEvent) => {
    event.stopPropagation();
    setShowUploadMenu(!showUploadMenu);
  };

  const handleEmojiClick = (emojiData: EmojiClickData) => {
    setMessageInput(prev => prev + emojiData.emoji);
  };

  const handleEmojiButtonClick = (event: React.MouseEvent) => {
    event.stopPropagation();
    setShowEmojiPicker(!showEmojiPicker);
  };

  const handleFileSelect = (type: 'photo' | 'document' | 'video') => {
    if (fileInputRef.current) {
      fileInputRef.current.accept = type === 'photo' 
        ? 'image/*' 
        : type === 'video' 
          ? 'video/*' 
          : '.pdf,.doc,.docx,.txt';
      fileInputRef.current.click();
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      // Here you would typically upload the file and send the message
      console.log('Selected file:', file);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleVoiceRecord = async () => {
    try {
      if (!isRecording) {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        const mediaRecorder = new MediaRecorder(stream);
        const audioChunks: Blob[] = [];

        mediaRecorder.ondataavailable = (event) => {
          audioChunks.push(event.data);
        };

        mediaRecorder.onstop = () => {
          const audioBlob = new Blob(audioChunks, { type: 'audio/wav' });
          // Here you would typically upload the audio and send the message
          console.log('Recorded audio:', audioBlob);
          setRecordingTime(0);
          if (recordingTimerRef.current) {
            clearInterval(recordingTimerRef.current);
          }
        };

        mediaRecorder.start();
        mediaRecorderRef.current = mediaRecorder;
        setIsRecording(true);

        // Start timer
        recordingTimerRef.current = setInterval(() => {
          setRecordingTime(prev => prev + 1);
        }, 1000);

        // Stop recording after 60 seconds
        setTimeout(() => {
          if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
            mediaRecorderRef.current.stop();
            stream.getTracks().forEach(track => track.stop());
            setIsRecording(false);
          }
        }, 60000);
      } else {
        // Stop recording if already recording
        if (mediaRecorderRef.current) {
          mediaRecorderRef.current.stop();
          mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
        }
        setIsRecording(false);
        setRecordingTime(0);
        if (recordingTimerRef.current) {
          clearInterval(recordingTimerRef.current);
        }
      }
    } catch (error) {
      console.error('Error accessing microphone:', error);
    }
  };

  const handleDeleteRecording = () => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
    }
    setIsRecording(false);
    setRecordingTime(0);
    if (recordingTimerRef.current) {
      clearInterval(recordingTimerRef.current);
    }
  };

  const handleSendRecording = () => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
    }
    setIsRecording(false);
    setRecordingTime(0);
    if (recordingTimerRef.current) {
      clearInterval(recordingTimerRef.current);
    }
    // Here you would typically send the recording
  };

  const handlePauseResume = () => {
    if (mediaRecorderRef.current) {
      if (isPaused) {
        mediaRecorderRef.current.resume();
        recordingTimerRef.current = setInterval(() => {
          setRecordingTime(prev => prev + 1);
        }, 1000);
      } else {
        mediaRecorderRef.current.pause();
        if (recordingTimerRef.current) {
          clearInterval(recordingTimerRef.current);
        }
      }
      setIsPaused(!isPaused);
    }
  };

  const handleImageClick = (images: string[] | undefined, index: number) => {
    if (!images) return;
    setSelectedImages(images);
    setSelectedImageIndex(index);
    setShowImageModal(true);
  };

  const handleCall = (type: 'audio' | 'video') => {
    setCallType(type);
    setShowCallModal(true);
  };

  const handleSendMessage = async () => {
    if (!messageInput.trim() && !selectedFile && !isRecording) return;

    const messageContent = messageInput.trim();
    const messageType = messageContent ? 'TEXT' : selectedFile ? 'FILE' : 'VOICE_MESSAGE';

    const newMessage: Message = {
      id: `msg-${Date.now()}`, // Temporary ID
      content: messageContent,
      type: messageType,
      sender: {
        id: currentUser?.id || '',
        firstName: currentUser?.firstName || '',
        lastName: currentUser?.lastName || '',
        email: currentUser?.email || '',
        profilePic: currentUser?.profilePic || '',
      },
      chatId: currentChat?.id || '',
      createdAt: new Date().toISOString(),
      attachments: selectedFile ? [{ id: `att-${Date.now()}`, type: 'FILE', url: URL.createObjectURL(selectedFile), fileName: selectedFile.name, fileSize: selectedFile.size }] : [],
      reactions: [],
      replyTo: replyToMessage || undefined,
      isEdited: false,
      isDeleted: false,
      readBy: [],
    };

    if (messageContent) {
      newMessage.content = messageContent;
    } else if (selectedFile) {
      newMessage.content = selectedFile.name;
    } else if (isRecording) {
      newMessage.content = 'Voice message';
    }

    // Don't update local state here, let Redux handle it
    // setChatMessages(prev => [...(prev || []), newMessage]);
    
    if (currentChat?.id) {
      setIsSending(true);
      try {
        // Map the message type to what the server expects
        let serverMessageType: string;
        if (messageContent) {
          serverMessageType = 'outgoing';
        } else if (selectedFile) {
          serverMessageType = 'file';
        } else if (isRecording) {
          serverMessageType = 'outgoing'; // Voice messages are treated as outgoing
        } else {
          serverMessageType = 'outgoing';
        }
        
        console.log('Sending message with type:', serverMessageType);
        
        const response = await chatService.sendMessage({
          chatId: currentChat.id,
          message: newMessage.content,
          type: serverMessageType
        });
        
        console.log('Server response:', response);
        console.log('Response data:', response.data);
        
        // Create a proper message object for Redux
        // The server now returns the message in the correct format
        const messageForRedux: ChatMessage = {
          id: response.data?.id || newMessage.id,
          type: response.data?.type || serverMessageType, // Use the type from server response
          content: response.data?.content || newMessage.content,
          time: response.data?.time || new Date().toLocaleTimeString('en-US', { 
            hour: 'numeric', 
            minute: '2-digit',
            hour12: true 
          }),
          images: response.data?.images || [],
          fileName: response.data?.fileName || undefined,
          fileSize: response.data?.fileSize?.toString() || undefined,
          fileType: response.data?.fileType || undefined,
        };
        
        console.log('Created message for Redux:', messageForRedux);
        
        // Only dispatch to Redux, let Redux update the local state
        dispatch(addNewMessage(messageForRedux));
        
        // Send socket message with proper format for real-time updates
        sendSocketMessage({
          chatId: currentChat.id,
          sender: {
            id: currentUser?.id || '',
            firstName: currentUser?.firstName || '',
            lastName: currentUser?.lastName || '',
            profilePic: currentUser?.profilePic || '',
            email: currentUser?.email || '',
          },
          content: messageForRedux.content,
          id: messageForRedux.id,
          createdAt: messageForRedux.time,
          type: messageForRedux.type,
          attachments: messageForRedux.images ? messageForRedux.images.map((img, index) => ({
            id: `att-${index}`,
            type: 'IMAGE',
            url: img,
          })) : [],
        });
        
        // Clear local state
        setMessageInput('');
        setSelectedFile(null);
        setIsRecording(false);
        setRecordingTime(0);
        setReplyToMessage(null);
      } catch (error) {
        console.error('Error sending message:', error);
        // On error, remove the message from local state
        // setChatMessages(prev => (prev || []).filter(msg => msg.id !== newMessage.id)); // This line is removed as per the new_code
      } finally {
        setIsSending(false);
      }
    }
  };

  const handleReplyToMessage = (message: Message) => {
    setReplyToMessage(message);
    setMessageInput('');
    setShowEmojiPicker(false);
    setShowUploadMenu(false);
  };

  const handleReactionClick = (emoji: string) => {
    if (showReactionPicker) {
      const messageId = showReactionPicker;
      const message = (chatMessages || []).find(msg => msg.id === messageId);
      if (message) {
        const reaction: MessageReaction = {
          id: `reaction-${Date.now()}`,
          emoji: emoji,
          user: {
            id: currentUser?.id || '',
            firstName: currentUser?.firstName || '',
            lastName: currentUser?.lastName || '',
            profilePic: currentUser?.profilePic || '',
          },
        };
        // setChatMessages(prev => (prev || []).map(msg => 
        //   msg.id === messageId ? { ...msg, reactions: [...(msg.reactions || []), reaction] } : msg
        // )); // This line is removed as per the new_code
        sendSocketMessage({
          chatId: currentChat?.id || '',
          sender: {
            id: currentUser?.id || '',
            firstName: currentUser?.firstName || '',
            lastName: currentUser?.lastName || '',
            profilePic: currentUser?.profilePic || '',
            email: currentUser?.email || '',
          },
          content: `Reacted with ${emoji}`,
          type: 'REACTION',
          messageId: messageId,
          reaction: emoji,
        });
      }
      setShowReactionPicker(null);
    }
  };

  const renderMenu = (messageId: string, messageType: 'incoming' | 'outgoing') => {
    const menuClasses = `absolute top-full mt-6 ${
      messageType === 'incoming' ? 'left-0' : 'right-0'
    } bg-white rounded-lg shadow-[0_4px_20px_rgba(0,0,0,0.1)] w-40 text-base font-normal border border-gray-100 shadow-xl z-50`;
    
    const arrowClasses = `absolute top-[-8px] ${
      messageType === 'incoming' ? 'left-3' : 'right-3'
    } w-4 h-4 bg-white rotate-45 border-l border-t border-gray-100 shadow-xl`;
    
    const arrowStyle = { clipPath: 'polygon(0 0, 100% 0, 100% 100%)' };

    return (
      <div className={menuClasses} style={{fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen, Ubuntu, Cantarell, "Open Sans", "Helvetica Neue", sans-serif'}}>
        <ul className="py-1">
          <li className="px-4 py-2.5 text-gray-700 hover:bg-gray-50 cursor-pointer transition-colors duration-150">
            Remove
          </li>
          <li className="px-4 py-2.5 text-gray-700 hover:bg-gray-50 cursor-pointer transition-colors duration-150">
            Edit
          </li>
          <li className="px-4 py-2.5 text-gray-700 hover:bg-gray-50 cursor-pointer transition-colors duration-150">
            Forward
          </li>
          <li className="px-4 py-2.5 text-gray-700 hover:bg-gray-50 cursor-pointer transition-colors duration-150">
            Pin
          </li>
        </ul>
        <div className={arrowClasses} style={arrowStyle} />
      </div>
    );
  };

  const renderUploadMenu = () => {
    return (
      <div className="absolute bottom-full mb-2 left-0 bg-white rounded-lg shadow-[0_4px_20px_rgba(0,0,0,0.1)] w-48 text-base font-normal border border-gray-100 shadow-xl z-50">
        <ul className="py-1">
          <li 
            className="px-4 py-2.5 text-gray-700 hover:bg-gray-50 cursor-pointer transition-colors duration-150 flex items-center space-x-2"
            onClick={() => handleFileSelect('photo')}
          >
            <FaCamera className="text-gray-600 w-4 h-4" />
            <span>Photo</span>
          </li>
          <li 
            className="px-4 py-2.5 text-gray-700 hover:bg-gray-50 cursor-pointer transition-colors duration-150 flex items-center space-x-2"
            onClick={() => handleFileSelect('document')}
          >
            <FaFile className="text-gray-600 w-4 h-4" />
            <span>Document</span>
          </li>
          <li 
            className="px-4 py-2.5 text-gray-700 hover:bg-gray-50 cursor-pointer transition-colors duration-150 flex items-center space-x-2"
            onClick={handleVoiceRecord}
          >
            <FaMicrophone className={`text-gray-600 w-4 h-4 ${isRecording ? 'text-red-500 animate-pulse' : ''}`} />
            <span>{isRecording ? 'Recording...' : 'Voice Message'}</span>
          </li>
          <li 
            className="px-4 py-2.5 text-gray-700 hover:bg-gray-50 cursor-pointer transition-colors duration-150 flex items-center space-x-2"
            onClick={() => handleFileSelect('video')}
          >
            <FaVideo className="text-gray-600 w-4 h-4" />
            <span>Video</span>
          </li>
        </ul>
        <div className="absolute bottom-[-8px] left-3 w-4 h-4 bg-white rotate-45 border-l border-t border-gray-100 shadow-xl" style={{ clipPath: 'polygon(0 0, 100% 0, 100% 100%)' }} />
      </div>
    );
  };

  // Helper function to convert ChatMessage to Message for rendering
  const convertChatMessageToMessage = (chatMessage: ChatMessage): Message => {
    console.log('Converting chat message:', chatMessage);
    console.log('Message type from server:', chatMessage.type);
    console.log('Current user ID:', currentUser?.id);
    
    // Determine if this message is from the current user based on message type
    // The server sends 'outgoing' for current user's messages, 'incoming' for others
    const isOwnMessage = chatMessage.type === 'outgoing';
    console.log('Is own message (based on type):', isOwnMessage);
    
    // Find the sender from the chat users
    let sender = currentUser;
    if (!isOwnMessage && currentChat?.users) {
      // For incoming messages, find the other user in the chat
      const otherUser = currentChat.users.find(u => u.id !== currentUser?.id);
      if (otherUser) {
        sender = otherUser;
        console.log('Found other user as sender:', otherUser.firstName, otherUser.lastName, 'ID:', otherUser.id);
      } else {
        console.log('No other user found, using current user as fallback');
      }
    } else if (isOwnMessage) {
      console.log('Using current user as sender:', currentUser?.firstName, currentUser?.lastName, 'ID:', currentUser?.id);
    }
    
    // Double-check the sender assignment
    console.log('Final sender assignment - ID:', sender?.id, 'Name:', sender?.firstName, sender?.lastName);
    console.log('Current user ID for comparison:', currentUser?.id);
    console.log('Message will be rendered as:', isOwnMessage ? 'OWN (right side)' : 'OTHER (left side)');

    // Better date handling - convert time string to proper date format
    let messageDate: string;
    try {
      if (chatMessage.time) {
        // If time is already a formatted string, use it
        if (typeof chatMessage.time === 'string' && chatMessage.time.includes(':')) {
          messageDate = chatMessage.time;
        } else {
          // Try to parse as date and format
          const date = new Date(chatMessage.time);
          if (!isNaN(date.getTime())) {
            messageDate = date.toLocaleTimeString('en-US', { 
              hour: 'numeric', 
              minute: '2-digit',
              hour12: true 
            });
          } else {
            messageDate = '12:00 PM'; // fallback
          }
        }
      } else {
        messageDate = '12:00 PM'; // fallback
      }
    } catch (error) {
      console.error('Error parsing message time:', error);
      messageDate = '12:00 PM'; // fallback
    }

    // Create the message object
    const convertedMessage: Message = {
      id: chatMessage.id,
      content: chatMessage.content,
      type: (chatMessage.type === 'outgoing' ? 'TEXT' : chatMessage.type === 'file' ? 'FILE' : 'TEXT') as 'TEXT' | 'FILE',
      sender: {
        id: sender?.id || '',
        firstName: sender?.firstName || '',
        lastName: sender?.lastName || '',
        email: sender?.email || '',
        profilePic: sender?.profilePic || '',
      },
      chatId: currentChat?.id || '',
      createdAt: messageDate,
      attachments: chatMessage.images ? chatMessage.images.map((img, index) => ({
        id: `att-${index}`,
        type: 'IMAGE' as const,
        url: img,
      })) : [],
      reactions: [],
      replyTo: undefined,
      isEdited: false,
      isDeleted: false,
      readBy: [],
    };
    
    // Add a custom property to help with debugging and ensure correct rendering
    (convertedMessage as any).originalMessageType = chatMessage.type;
    (convertedMessage as any).isOwnMessage = isOwnMessage;
    
    console.log('Final converted message:', convertedMessage);
    console.log('Original message type:', chatMessage.type);
    console.log('Calculated isOwnMessage:', isOwnMessage);
    
    return convertedMessage;
  };

  const renderMessage = (message: Message) => {
    // Safety check for message properties
    if (!message || !message.sender) {
      return null;
    }

    // Determine if this is the current user's message
    // We can check both the sender ID and also look at the original message type if available
    let isOwnMessage = message.sender.id === currentUser?.id;
    
    // Fallback: check the custom property we added during conversion
    if ((message as any).isOwnMessage !== undefined) {
      isOwnMessage = (message as any).isOwnMessage;
      console.log('Using custom isOwnMessage property:', isOwnMessage);
    }
    
    // Additional fallback: check if we can determine from the original message type
    if ((message as any).originalMessageType) {
      const originalType = (message as any).originalMessageType;
      const typeBasedOwnMessage = originalType === 'outgoing';
      console.log('Original message type:', originalType, 'Type-based own message:', typeBasedOwnMessage);
      
      // If there's a mismatch, log it for debugging
      if (isOwnMessage !== typeBasedOwnMessage) {
        console.warn('Mismatch detected! ID-based:', isOwnMessage, 'Type-based:', typeBasedOwnMessage);
        // Use the type-based logic as it's more reliable from the server
        isOwnMessage = typeBasedOwnMessage;
      }
    }
    
    console.log('RenderMessage - Message ID:', message.id);
    console.log('RenderMessage - Sender ID:', message.sender.id);
    console.log('RenderMessage - Current User ID:', currentUser?.id);
    console.log('RenderMessage - Is Own Message:', isOwnMessage);
    console.log('RenderMessage - Sender Name:', message.sender.firstName, message.sender.lastName);
    console.log('RenderMessage - Current User Name:', currentUser?.firstName, currentUser?.lastName);
    
    // Better time handling - use the already formatted time from convertChatMessageToMessage
    let messageTime: string;
    try {
      if (typeof message.createdAt === 'string' && message.createdAt.includes(':')) {
        // If it's already formatted, use it directly
        messageTime = message.createdAt;
      } else {
        // Try to parse and format
        const date = new Date(message.createdAt);
        if (!isNaN(date.getTime())) {
          messageTime = date.toLocaleTimeString('en-US', { 
            hour: 'numeric', 
            minute: '2-digit',
            hour12: true 
          });
        } else {
          messageTime = '12:00 PM'; // fallback
        }
      }
    } catch (error) {
      console.error('Error parsing message time in render:', error);
      messageTime = '12:00 PM'; // fallback
    }

    if (isOwnMessage) {
      return (
        <div key={message.id} className="flex items-end justify-end space-x-2 mb-4">
          <div className="flex items-center space-x-2">
            <button className="text-gray-600 hover:text-gray-800" onClick={() => setShowReactionPicker(message.id)}>
              <FaSmile className="w-4 h-4" />
            </button>
            <button className="text-gray-600 hover:text-gray-800" onClick={() => handleReplyToMessage(message)}>
              <FaReply className="w-4 h-4" />
            </button>
            <button className="text-gray-600 hover:text-gray-800" onClick={(e) => handleMenuClick(message.id, e)}>
              <HiDotsVertical className="w-4 h-4" />
            </button>
          </div>
          <div className="max-w-[70%] bg-blue-500 text-white rounded-xl p-3">
            {message.content || ''}
            <div className="text-xs text-blue-200 mt-1 flex items-center justify-end space-x-1">
              <span>{messageTime}</span>
              <FaCheckDouble className="w-3 h-3" />
            </div>
          </div>
          <img
            alt="User avatar"
            className="rounded-full w-8 h-8 object-cover flex-shrink-0"
            src={message.sender.profilePic || 'https://icon-library.com/images/anonymous-avatar-icon/anonymous-avatar-icon-25.jpg'}
          />
          {showReactionPicker === message.id && (
            <div className="absolute bottom-full mb-2 bg-white rounded-lg shadow-lg p-2 z-50">
              <div className="flex space-x-2">
                {['😀', '❤️', '👍', '👎', '😂', '😍'].map((emoji) => (
                  <button
                    key={emoji}
                    onClick={() => handleReactionClick(emoji)}
                    className="text-2xl hover:scale-110 transition-transform"
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            </div>
          )}
          {activeMenu === message.id && renderMenu(message.id, 'outgoing')}
        </div>
      );
    } else {
      return (
        <div key={message.id} className="flex items-start justify-start space-x-2 mb-4">
          <img
            alt="Other user avatar"
            className="rounded-full w-8 h-8 object-cover flex-shrink-0"
            src={message.sender.profilePic || 'https://icon-library.com/images/anonymous-avatar-icon/anonymous-avatar-icon-25.jpg'}
          />
          <div className="max-w-[70%] bg-gray-200 rounded-xl p-3">
            {message.content || ''}
            <div className="text-xs text-gray-500 mt-1">
              {messageTime}
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <button className="text-gray-600 hover:text-gray-800" onClick={() => setShowReactionPicker(message.id)}>
              <FaSmile className="w-4 h-4" />
            </button>
            <button className="text-gray-600 hover:text-gray-800" onClick={() => handleReplyToMessage(message)}>
              <FaReply className="w-4 h-4" />
            </button>
            <button className="text-gray-600 hover:text-gray-800" onClick={(e) => handleMenuClick(message.id, e)}>
              <HiDotsVertical className="w-4 h-4" />
            </button>
          </div>
          {showReactionPicker === message.id && (
            <div className="absolute bottom-full mb-2 bg-white rounded-lg shadow-lg p-2 z-50">
              <div className="flex space-x-2">
                {['😀', '❤️', '👍', '👎', '😂', '😍'].map((emoji) => (
                  <button
                    key={emoji}
                    onClick={() => handleReactionClick(emoji)}
                    className="text-2xl hover:scale-110 transition-transform"
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            </div>
          )}
          {activeMenu === message.id && renderMenu(message.id, 'incoming')}
        </div>
      );
    }
  };

  return (
    <div className='flex'>
      <LeftSidebar />
      <section aria-label="Chat conversation panel" className="bg-white w-full flex flex-col shadow-lg relative h-screen">
        {/* Top bar */}
        {currentChat ? (
          <header className="flex items-center justify-between px-5 py-2 border-b border-gray-200 flex-shrink-0">
            <div className="flex items-center space-x-3">
              <button aria-label="Back" className="text-gray-600 text-xl leading-none hover:text-gray-900 flex items-center">
                <FaChevronLeft />
                <span className="ml-1 w-5 h-5 bg-blue-600 text-white text-xs justify-center items-center rounded-full text-center font-semibold select-none"><p className='text-center text-white mt-0.5'>1</p></span>
              </button>
              <img alt="Olivia Nguyen woman portrait" className="rounded-full w-9 h-9 object-cover" height={36} src={currentChat?.users?.find(u => u.id !== currentUser?.id)?.profilePic || ''} width={36} />
              <div className="flex flex-col leading-tight">
                <span className="font-semibold text-gray-900 text-sm select-text">{currentChat?.users?.find(u => u.id !== currentUser?.id)?.firstName || ''} {currentChat?.users?.find(u => u.id !== currentUser?.id)?.lastName || ''}</span>
                <span className="text-xs text-gray-400 select-text">Last seen 2 hours ago</span>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <button 
                aria-label="Call" 
                className="text-gray-600 text-xl leading-none hover:text-gray-900"
                onClick={() => handleCall('audio')}
              >
                <FaPhone className='text-gray-600 w-6 h-6'/>
              </button>
              <button 
                aria-label="Video call" 
                className="bg-blue-600 text-white rounded-full w-8 h-8 flex items-center justify-center text-xl hover:bg-blue-700"
                onClick={() => handleCall('video')}
              >
                <FaVideo className='text-white w-4 h-4' />
              </button>
              <button 
                aria-label="Profile" 
                className="text-gray-600 text-xl leading-none hover:text-gray-900"
                onClick={() => setShowProfile(true)}
              >
                <FaEllipsisV className='text-gray-600 w-6 h-6'/>
              </button>
            </div>
          </header>
        ) : (
          <header className="flex items-center justify-between px-5 py-2 border-b border-gray-200 flex-shrink-0">
            <div className="flex items-center space-x-3">
              <button aria-label="Back" className="text-gray-600 text-xl leading-none hover:text-gray-900 flex items-center">
                <FaChevronLeft />
              </button>
              <div className="flex flex-col leading-tight">
                {chatId ? (
                  <>
                    <span className="font-semibold text-gray-900 text-sm select-text">Loading Chat...</span>
                    <span className="text-xs text-gray-400 select-text">Chat ID: {chatId}</span>
                  </>
                ) : (
                  <>
                    <span className="font-semibold text-gray-900 text-sm select-text">Select a Chat</span>
                    <span className="text-xs text-gray-400 select-text">Choose a conversation to start messaging</span>
                  </>
                )}
              </div>
            </div>
          </header>
        )}
        {/* Chat messages area */}
        <main aria-live="polite" className="flex-1 overflow-y-auto px-5 py-4 space-y-6 text-xs text-gray-800">
          {/* Debug info */}
          {currentChat && (
            <div className="text-center text-xs text-gray-400 mb-4 p-2 bg-gray-50 rounded">
              <div>Current Chat: {currentChat.id}</div>
              <div>Chat Name: {currentChat.chatName || 'Direct Chat'}</div>
              <div>Users: {currentChat.users?.map(u => `${u.firstName} ${u.lastName} (ID: ${u.id})`).join(', ')}</div>
              <div>Current User: {currentUser?.firstName} {currentUser?.lastName} (ID: {currentUser?.id})</div>
              <div>Messages Count: {chatMessages.length}</div>
              <div>Raw Messages: {JSON.stringify(currentChat.messages?.slice(0, 2))}</div>
            </div>
          )}
          {!currentChat && chatId && (
                          <div className="text-center text-xs text-gray-400 mb-4 p-2 bg-yellow-50 rounded border border-yellow-200">
                <div>Loading Chat ID: {chatId}</div>
                <div>Status: {isFetchingChat ? 'Fetching chat data from server...' : 'Waiting to fetch...'}</div>
                {isFetchingChat && <div className="mt-2 text-blue-500">⏳ Fetching...</div>}
              </div>
          )}
          {!currentChat ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center text-gray-500">
                {chatId ? (
                  <>
                    <div className="text-6xl mb-4">⏳</div>
                    <h3 className="text-xl font-semibold mb-2">Loading Chat...</h3>
                    <p className="text-sm">Please wait while we fetch the conversation</p>
                    <div className="text-xs text-gray-400 mt-2">
                      Chat ID: {chatId}
                    </div>
                  </>
                ) : (
                  <>
                    <div className="text-6xl mb-4">💬</div>
                    <h3 className="text-xl font-semibold mb-2">Welcome to Chat</h3>
                    <p className="text-sm">Select a chat from the sidebar to start messaging</p>
                  </>
                )}
              </div>
            </div>
          ) : chatMessages && chatMessages.length > 0 ? (
            <>
              <div className="text-center text-xs text-gray-400 mb-4">
                Chat ID: {currentChat.id} | Messages: {chatMessages.length}
              </div>
              {console.log('Rendering messages:', chatMessages)}
              {console.log('Current user ID:', currentUser?.id)}
              {console.log('Current chat users:', currentChat?.users)}
              {chatMessages.map((message: ChatMessage, index: number) => {
                console.log(`=== Processing Message ${index + 1} ===`);
                console.log('Converting message:', message);
                console.log('Message type:', message.type);
                console.log('Message sender logic - currentUser ID:', currentUser?.id);
                const convertedMessage = convertChatMessageToMessage(message);
                console.log('Converted message:', convertedMessage);
                console.log('Is own message check:', convertedMessage.sender.id === currentUser?.id);
                
                // Add visual debug info
                const debugInfo = (
                  <div key={`debug-${message.id}`} className="text-xs text-gray-500 mb-2 p-1 bg-gray-100 rounded">
                    <div>Message {index + 1}: {message.content?.substring(0, 30)}...</div>
                    <div>Type: {message.type} | Sender: {convertedMessage.sender.firstName} {convertedMessage.sender.lastName}</div>
                    <div>Will render as: {(convertedMessage as any).isOwnMessage ? 'OWN (Right)' : 'OTHER (Left)'}</div>
                  </div>
                );
                
                return (
                  <>
                    {debugInfo}
                    {renderMessage(convertedMessage)}
                  </>
                );
              })}
              <div ref={messagesEndRef} />
            </>
          ) : (
            <div className="flex items-center justify-center h-full">
              <div className="text-center text-gray-500">
                {isLoadingMessages ? (
                  <>
                    <div className="text-4xl mb-4">⏳</div>
                    <h3 className="text-lg font-semibold mb-2">Loading messages...</h3>
                    <p className="text-sm">Please wait while we fetch the conversation</p>
                  </>
                ) : (
                  <>
                    <div className="text-4xl mb-4">👋</div>
                    <h3 className="text-lg font-semibold mb-2">No messages yet</h3>
                    <p className="text-sm">Start the conversation by sending a message!</p>
                  </>
                )}
                <div className="text-xs text-gray-400 mt-2">
                  Chat ID: {currentChat.id}
                </div>
              </div>
            </div>
          )}
        </main>
        {/* Typing indicator and input area */}
        {currentChat && (
          <footer aria-label="Message input area" className="border-t border-gray-200 px-5 py-3 flex flex-col space-y-2 flex-shrink-0">
            {typingUsers.length > 0 && (
              <div className="text-xs text-gray-700 select-text">
                <span className="font-semibold">
                  {typingUsers.map(user => `${user.firstName} ${user.lastName}`).join(', ')}
                </span>
                {typingUsers.length === 1 ? ' is' : ' are'} typing...
              </div>
            )}
            {!isRecording ? (
              <>
                <div className="text-xs text-gray-700 select-text">
                  <span className="font-semibold">{currentChat?.users?.find(u => u.id !== currentUser?.id)?.firstName || ''} {currentChat?.users?.find(u => u.id !== currentUser?.id)?.lastName || ''}</span>, is typing...
                </div>
                <form className="flex items-center space-x-3" onSubmit={(e) => e.preventDefault()}>
                  <div className="relative" ref={uploadMenuRef}>
                    <button 
                      aria-label="Add attachment" 
                      className="text-gray-600 text-xl hover:text-gray-900 flex items-center justify-center" 
                      type="button"
                      onClick={handleUploadMenuClick}
                    >
                      <FaPlus />
                    </button>
                    {showUploadMenu && renderUploadMenu()}
                  </div>
                  <div className="relative" ref={emojiPickerRef}>
                    <button 
                      aria-label="Add emoji" 
                      className="text-gray-600 text-xl hover:text-gray-900 flex items-center justify-center" 
                      type="button"
                      onClick={handleEmojiButtonClick}
                    >
                      <BsEmojiSmile />
                    </button>
                    {showEmojiPicker && (
                      <div className="absolute bottom-full mb-2 left-0 z-50">
                        <EmojiPicker onEmojiClick={handleEmojiClick} />
                      </div>
                    )}
                  </div>
                  <input 
                    aria-label="Type your message here" 
                    className="flex-1 bg-gray-100 rounded-full px-4 py-2 text-sm text-gray-700 placeholder-gray-400 focus:outline-none" 
                    placeholder="Type Here...." 
                    type="text"
                    value={messageInput}
                    onChange={(e) => {
                      setMessageInput(e.target.value);
                      // Send typing indicator
                      if (e.target.value.length > 0) {
                        sendTypingIndicator(true);
                        // Clear typing indicator after 3 seconds of no typing
                        if (typingTimeoutRef.current) {
                          clearTimeout(typingTimeoutRef.current);
                        }
                        typingTimeoutRef.current = setTimeout(() => {
                          sendTypingIndicator(false);
                        }, 3000);
                      }
                    }}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleSendMessage();
                      }
                    }}
                  />
                  <input
                    type="file"
                    ref={fileInputRef}
                    className="hidden"
                    onChange={handleFileChange}
                  />
                  <button 
                    aria-label="Camera" 
                    className="text-gray-600 text-xl hover:text-gray-900" 
                    type="button"
                    onClick={() => handleFileSelect('photo')}
                  >
                    <FaCamera />
                  </button>
                  <button 
                    aria-label="Voice message" 
                    className="text-gray-600 text-xl hover:text-gray-900" 
                    type="button"
                    onClick={handleVoiceRecord}
                  >
                    <FaMicrophone />
                  </button>
                  <button 
                    aria-label="Send message" 
                    className="text-blue-600 text-xl hover:text-blue-800" 
                    type="submit"
                    disabled={isSending}
                  >
                    {isSending ? 'Sending...' : <FaPaperPlane />}
                  </button>
                </form>
              </>
            ) : (
              <div className="flex items-center space-x-4">
                <button 
                  onClick={handleDeleteRecording}
                  className="text-red-500 hover:text-red-600"
                >
                  <FaTrash className="w-5 h-5" />
                </button>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium text-gray-700">Recording</span>
                    <span className="text-sm text-gray-500">{formatTime(recordingTime)}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-1.5">
                    <div 
                      className="bg-red-500 h-1.5 rounded-full transition-all duration-1000"
                      style={{ width: `${(recordingTime / 60) * 100}%` }}
                    />
                  </div>
                </div>
                <button 
                  onClick={handlePauseResume}
                  className="text-gray-600 hover:text-gray-900"
                >
                  {isPaused ? (
                    <FaPlay className="w-5 h-5" />
                  ) : (
                    <FaPause className="w-5 h-5" />
                  )}
                </button>
                <button 
                  onClick={handleSendRecording}
                  className="text-blue-600 hover:text-blue-800"
                >
                  <FaPaperPlane className="w-5 h-5" />
                </button>
              </div>
            )}
          </footer>
        )}
      </section>
      <ProfileModal isOpen={showProfile} onClose={() => setShowProfile(false)} />
      <ImageModal 
        isOpen={showImageModal} 
        onClose={() => setShowImageModal(false)} 
        images={selectedImages}
        initialIndex={selectedImageIndex}
      />
      <CallModal 
        isOpen={showCallModal}
        onClose={() => setShowCallModal(false)}
        type={callType}
        contact={{
          name: (currentChat?.users?.find(u => u.id !== currentUser?.id)?.firstName || '') + ' ' + (currentChat?.users?.find(u => u.id !== currentUser?.id)?.lastName || ''),
          avatar: currentChat?.users?.find(u => u.id !== currentUser?.id)?.profilePic || '',
        }}
      />
    </div>
  );
};

export default Chat;