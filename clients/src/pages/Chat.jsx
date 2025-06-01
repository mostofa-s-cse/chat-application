import React, { useCallback, useState, useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import Model from '../components/Model';
import { BsEmojiSmile, BsFillEmojiSmileFill } from "react-icons/bs";
import { fetchMessages, sendMessage } from '../apis/messages';
import MessageHistory from '../components/MessageHistory';
import "./home.css";
import { fetchChats, setNotifications } from '../redux/chatsSlice';
import Loading from '../components/ui/Loading';
import data from '@emoji-mart/data';
import Picker from '@emoji-mart/react';
import { getChatName } from '../utils/logics';
import Typing from '../components/ui/Typing';
import { validUser } from '../apis/auth';
import { useSocket } from '../context/SocketContext';

function Chat(props) {
  const { socket, isConnected } = useSocket();
  const { activeChat, notifications } = useSelector((state) => state.chats);
  const dispatch = useDispatch();
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [isTyping, setIsTyping] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showPicker, setShowPicker] = useState(false);
  const [sendError, setSendError] = useState(null);
  const activeUser = useSelector((state) => state.activeUser);
  const typingTimeoutRef = useRef(null);
  const messagesEndRef = useRef(null);
  const socketSetupRef = useRef(false);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Setup socket connection
  useEffect(() => {
    if (socket && activeUser && !socketSetupRef.current) {
      socket.emit("setup", activeUser);
      socketSetupRef.current = true;
    }
  }, [socket, activeUser]);

  // Message sending handler
  const sendMessageHandler = async (e) => {
    e.preventDefault();
    setSendError(null);
    
    if (!message.trim()) {
      setSendError("Message cannot be empty");
      return;
    }

    if (!socket || !isConnected) {
      setSendError("Connection not ready. Please try again.");
      return;
    }

    if (!activeChat?.id) {
      setSendError("No active chat selected");
      return;
    }

    try {
      const messageToSend = message.trim();
      setMessage("");
      
      // Clear typing indicators
      socket.emit("stop typing", activeChat.id);
      setIsTyping(false);
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      
      // Send the message to the API
      const sentMessage = await sendMessage({ 
        chatId: activeChat.id, 
        message: messageToSend 
      });

      // Format message for socket emission
      const socketMessage = {
        chatId: activeChat.id,
        sender: {
          id: activeUser.id,
          firstName: activeUser.firstName,
          lastName: activeUser.lastName,
          profilePic: activeUser.profilePic,
          email: activeUser.email
        },
        content: messageToSend,
        id: sentMessage.id,
        createdAt: sentMessage.createdAt
      };
      
      // Optimistic UI update
      setMessages(prev => [...prev, sentMessage]);
      
      // Broadcast via socket
      socket.emit("new message", socketMessage);
      
      // Refresh chat list
      dispatch(fetchChats());
    } catch (error) {
      console.error("Error sending message:", error);
      setSendError("Failed to send message. Please try again.");
    }
  };

  // Socket message handler
  const handleMessageReceived = useCallback((newMessage) => {
    if (!newMessage?.chatId) return;

    if (activeChat && newMessage.chatId === activeChat.id) {
      setMessages(prev => {
        // Prevent duplicates
        if (!prev.some(msg => msg.id === newMessage.id)) {
          return [...prev, newMessage];
        }
        return prev;
      });
    } else if (!notifications.some(n => n.id === newMessage.id)) {
      dispatch(setNotifications([newMessage, ...notifications]));
    }
    
    dispatch(fetchChats());
  }, [activeChat, notifications, dispatch]);

  // Typing indicator handler
  const handleInputChange = (e) => {
    const value = e.target.value;
    setMessage(value);
    
    if (!socket || !activeChat?.id) return;

    // Clear previous timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Start typing indicator if there's content
    if (value.trim()) {
      if (!isTyping) {
        socket.emit('typing', activeChat.id);
        setIsTyping(true);
      }

      // Set timeout to stop typing indicator
      typingTimeoutRef.current = setTimeout(() => {
        socket.emit("stop typing", activeChat.id);
        setIsTyping(false);
      }, 3000);
    } else if (isTyping) {
      socket.emit("stop typing", activeChat.id);
      setIsTyping(false);
    }
  };

  // Socket event listeners
  useEffect(() => {
    if (!socket) return;

    const onTyping = () => setIsTyping(true);
    const onStopTyping = () => setIsTyping(false);
    const onMessageReceived = handleMessageReceived;

    socket.on("typing", onTyping);
    socket.on("stop typing", onStopTyping);
    socket.on("message received", onMessageReceived);

    return () => {
      socket.off("typing", onTyping);
      socket.off("stop typing", onStopTyping);
      socket.off("message received", onMessageReceived);
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, [socket, handleMessageReceived]);

  // Fetch messages when chat changes
  useEffect(() => {
    const fetchMessagesFunc = async () => {
      if (activeChat) {
        setLoading(true);
        try {
          const data = await fetchMessages(activeChat.id);
          setMessages(data);
          socket?.emit("join chat", activeChat.id);
        } catch (error) {
          console.error("Error fetching messages:", error);
        } finally {
          setLoading(false);
        }
      }
    };
    
    fetchMessagesFunc();
  }, [activeChat, socket]);

  // Auth check
  useEffect(() => {
    const isValid = async () => {
      try {
        const data = await validUser();
        if (!data?.user) {
          window.location.href = "/login";
        }
      } catch (error) {
        console.error("Auth check failed:", error);
      }
    };
    isValid();
  }, []);

  if (loading) {
    return <div className={props.className}><Loading /></div>;
  }

  return (
    <>
      {activeChat ? (
        <div className={props.className}>
          <div className='flex justify-between items-center px-5 bg-[#ffff] w-[100%]'>
            <div className='flex items-center gap-x-[10px]'>
              <div className='flex flex-col items-start justify-center'>
                <h5 className='text-[17px] text-[#2b2e33] font-bold tracking-wide'>
                  {getChatName(activeChat, activeUser)}
                </h5>
              </div>
            </div>
            <div>
              <Model />
            </div>
          </div>
          
          <div className='scrollbar-hide w-[100%] h-[70vh] md:h-[66vh] lg:h-[69vh] flex flex-col overflow-y-scroll p-4'>
            <MessageHistory typing={isTyping} messages={messages} />
            <div ref={messagesEndRef} />
            <div className='ml-7 -mb-10'>
              {isTyping && <Typing width="100" height="100" />}
            </div>
          </div>
          
          <div className='absolute left-[31%] bottom-[8%]'>
            {showPicker && (
              <Picker 
                data={data} 
                onEmojiSelect={(e) => setMessage(prev => prev + e.native)} 
                onClickOutside={() => setShowPicker(false)}
              />
            )}
            
            {sendError && (
              <div className="text-red-500 text-sm mb-2 text-center">
                {sendError}
              </div>
            )}
            
            <form onSubmit={sendMessageHandler}>
              <div className='border-[1px] border-[#aabac8] px-6 py-3 w-[360px] sm:w-[400px] md:w-[350px] h-[50px] lg:w-[400px] rounded-t-[10px]'>
                <input
                  onChange={handleInputChange}
                  onFocus={() => setShowPicker(false)}
                  className='focus:outline-0 w-[100%] bg-[#f8f9fa]'
                  type="text"
                  name="message"
                  placeholder="Enter message"
                  value={message}
                  autoComplete="off"
                />
              </div>
              
              <div className='border-x-[1px] border-b-[1px] bg-[#f8f9fa] border-[#aabac8] px-6 py-3 w-[360px] sm:w-[400px] md:w-[350px] lg:w-[400px] rounded-b-[10px] h-[50px]'>
                <div className='flex justify-between items-start'>
                  <div 
                    className='cursor-pointer' 
                    onClick={() => setShowPicker(!showPicker)}
                  >
                    {showPicker ? (
                      <BsFillEmojiSmileFill className='w-[20px] h-[20px] text-[#ffb02e]' />
                    ) : (
                      <BsEmojiSmile className='w-[20px] h-[20px]' />
                    )}
                  </div>
                  <button 
                    type="submit"
                    className='bg-[#f8f9fa] border-[2px] border-[#d4d4d4] text-[14px] px-2 py-[3px] text-[#9e9e9e] font-medium rounded-[7px] -mt-1 hover:bg-[#e9e9e9] transition-colors'
                    disabled={!message.trim()}
                  >
                    Send
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      ) : (
        <div className={props.className}>
          <div className='relative'>
            <div className='absolute top-[40vh] left-[44%] flex flex-col items-center justify-center gap-y-3'>
              <img 
                className='w-[50px] h-[50px] rounded-[25px]' 
                alt="User profile" 
                src={activeUser.profilePic} 
              />
              <h3 className='text-[#111b21] text-[20px] font-medium tracking-wider'>
                Welcome <span className='text-[#166e48] text-[19px] font-bold'>{activeUser.name}</span>
              </h3>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default Chat;