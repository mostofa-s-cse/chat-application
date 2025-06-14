import { FaChevronLeft, FaPhone, FaVideo, FaPlus, FaCamera, FaMicrophone, FaPaperPlane, FaDownload, FaReply, FaFile, FaTrash, FaPause, FaPlay, FaTimes, FaEdit, FaEllipsisV } from 'react-icons/fa';
import { HiDotsVertical } from 'react-icons/hi';
import { BsEmojiSmile } from "react-icons/bs";
import LeftSidebar from './LeftSidebar';
import ProfileModal from './ProfileModal';
import { useState, useEffect, useRef } from 'react';
import EmojiPicker, { EmojiClickData } from 'emoji-picker-react';

interface Message {
    id: number;
    type: 'timestamp' | 'incoming' | 'outgoing' | 'file';
    content: string;
    time: string;
    images?: string[];
    fileName?: string;
    fileSize?: string;
    fileType?: string;
  }
  
  const messages: Message[] = [
    {
      id: 1,
      type: 'timestamp',
      content: '10:20 PM',
      time: '10:20 PM'
    },
    {
      id: 2,
      type: 'incoming',
      content: 'Wow, 😍\nWhere are you?',
      time: '10:20 PM'
    },
    {
      id: 3,
      type: 'timestamp',
      content: '10:22 PM',
      time: '10:22 PM'
    },
    {
      id: 4,
      type: 'incoming',
      content: 'Jojo',
      time: '10:22 PM'
    },
    {
      id: 5,
      type: 'timestamp',
      content: '10:23 PM',
      time: '10:23 PM'
    },
    {
      id: 6,
      type: 'incoming',
      content: 'Thanks! I\'m at Bali, the weather is perfect! Wish you were here!',
      time: '10:23 PM',
      images: [
        'https://storage.googleapis.com/a1aa/image/07119019-82b3-4daf-bcf4-ecd929047c92.jpg',
        'https://storage.googleapis.com/a1aa/image/4d2a9784-f1ac-45cc-d5fa-50c2e056be6d.jpg',
        'https://storage.googleapis.com/a1aa/image/3ed07014-a0d3-4abd-5406-0ccad49ce690.jpg'
      ]
    },
    {
      id: 7,
      type: 'timestamp',
      content: '10:25 PM',
      time: '10:25 PM'
    },
    {
      id: 8,
      type: 'outgoing',
      content: 'Wow, these look amazing! 😍\nWhere are you?',
      time: '10:25 PM'
    },
    {
      id: 9,
      type: 'timestamp',
      content: '10:24 PM',
      time: '10:24 PM'
    },
    {
      id: 10,
      type: 'outgoing',
      content: 'That sounds incredible! Enjoy your trip, and send more pics! 📸',
      time: '10:24 PM'
    },
    {
      id: 11,
      type: 'timestamp',
      content: '10:25 PM',
      time: '10:25 PM'
    },
    {
      id: 12,
      type: 'file',
      content: 'video.mp4',
      time: '10:25 PM',
      fileName: 'video.mp4',
      fileSize: '2mb',
      fileType: 'Document File'
    }
  ];

const Chat = () => {
    const [activeMenu, setActiveMenu] = useState<number | null>(null);
    const [showUploadMenu, setShowUploadMenu] = useState(false);
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);
    const [isRecording, setIsRecording] = useState(false);
    const [isPaused, setIsPaused] = useState(false);
    const [recordingTime, setRecordingTime] = useState(0);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [showProfile, setShowProfile] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);
    const buttonRef = useRef<HTMLButtonElement>(null);
    const uploadMenuRef = useRef<HTMLDivElement>(null);
    const emojiPickerRef = useRef<HTMLDivElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const recordingTimerRef = useRef<NodeJS.Timeout | null>(null);
    const [messageInput, setMessageInput] = useState('');

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

    const handleMenuClick = (messageId: number, event: React.MouseEvent) => {
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

    const renderMenu = (messageId: number, messageType: 'incoming' | 'outgoing') => {
        const menuClasses = `absolute top-full mt-6 ${
            messageType === 'incoming' ? 'right-0' : 'left-0'
        } bg-white rounded-lg shadow-[0_4px_20px_rgba(0,0,0,0.1)] w-40 text-base font-normal border border-gray-100 shadow-xl z-50`;
        
        const arrowClasses = `absolute top-[-8px] ${
            messageType === 'incoming' ? 'right-3' : 'left-3'
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

    const renderMessage = (message: Message) => {
        switch (message.type) {
          case 'timestamp':
            return (
              <div key={message.id} className="text-center text-gray-400 select-none">
                {message.content}
              </div>
            );
          case 'incoming':
            return (
              <div key={message.id} className="flex items-center space-x-2">
                <img alt="User avatar" className="rounded-full w-8 h-8 object-cover flex-shrink-0" src="https://storage.googleapis.com/a1aa/image/31130072-5ee0-4273-1569-5e0b5e24910f.jpg" />
                <div className="max-w-[70%] bg-blue-200 rounded-xl p-3 text-gray-900 leading-tight select-text">
                  {message.images ? (
                    <>
                      <div className="grid grid-cols-2 gap-2 mb-2 rounded-xl overflow-hidden">
                        <img alt="Message image 1" className="w-full h-32 object-cover rounded-l-xl rounded-tr-xl" height={140} src={message.images[0]} width={140} />
                        <img alt="Message image 2" className="w-full h-20 object-cover rounded-tr-xl rounded-bl-xl" height={140} src={message.images[1]} width={140} />
                        <img alt="Message image 3" className="w-full h-20 object-cover rounded-bl-xl rounded-br-xl" height={140} src={message.images[2]} width={140} />
                      </div>
                      <p className="text-gray-800 leading-tight select-text">
                        {message.content}
                      </p>
                    </>
                  ) : (
                    message.content
                  )}
                </div>
                  <div className="flex items-center space-x-2.5">
                    <button className="text-gray-600 text-xl leading-none hover:text-gray-900">
                      <BsEmojiSmile className="text-gray-600 w-4 h-4" />
                    </button>
                    <button className="text-gray-600 text-xl leading-none hover:text-gray-900">
                      <FaReply className="text-gray-600 w-4 h-4" />
                    </button>
                    <button 
                        ref={buttonRef}
                        className="text-gray-600 text-xl leading-none hover:text-gray-900"
                    >
                        <HiDotsVertical 
                            className="text-gray-500 hover:text-gray-700 w-4 h-4"  
                            onClick={(e) => handleMenuClick(message.id, e)}
                        />
                    </button>
                  </div>
                  <div className="relative" ref={menuRef}>
                    {activeMenu === message.id && renderMenu(message.id, 'incoming')}
                  </div>
              </div>
            );
          case 'outgoing':
            return (
              <div key={message.id} className="flex items-center justify-end space-x-2">
                <div className="relative" ref={menuRef}>
                    {activeMenu === message.id && renderMenu(message.id, 'outgoing')}
                </div>
                <div className="flex items-center space-x-2.5">
                <button 
                        ref={buttonRef}
                        className="text-gray-600 text-xl leading-none hover:text-gray-900"
                    >
                        <HiDotsVertical 
                            className="text-gray-500 hover:text-gray-700 w-4 h-4"  
                            onClick={(e) => handleMenuClick(message.id, e)}
                        />
                    </button>
                    <button className="text-gray-600 text-xl leading-none hover:text-gray-900">
                      <FaReply className="text-gray-600 w-4 h-4" />
                    </button>
                    <button className="text-gray-600 text-xl leading-none hover:text-gray-900">
                      <BsEmojiSmile className="text-gray-600 w-4 h-4" />
                    </button>
                    
                </div>
                <div className="max-w-[70%] bg-blue-200 rounded-xl p-3 text-gray-900 leading-tight select-text">
                  {message.content}
                </div>
                <img alt="My avatar" className="rounded-full w-8 h-8 object-cover flex-shrink-0" src="https://storage.googleapis.com/a1aa/image/31130072-5ee0-4273-1569-5e0b5e24910f.jpg" />
              </div>
            );
          case 'file':
            return (
              <div key={message.id} className="flex items-end justify-end space-x-2">
                <div aria-label={`Document file ${message.fileName}, ${message.fileSize}`} className="max-w-[70%] bg-blue-600 rounded-xl p-2 text-white select-text" role="group">
                  <div className="flex items-center justify-between bg-blue-700 rounded-md px-3 py-1 mb-1">
                    <span className="truncate text-sm font-semibold">{message.fileName}</span>
                    <button aria-label={`Download ${message.fileName}`} className="text-white hover:text-gray-200" type="button">
                      <FaDownload />
                    </button>
                  </div>
                  <div className="text-xs text-blue-200 select-text">{message.fileType}</div>
                  <div className="text-xs text-blue-200 select-text text-right">{message.fileSize}</div>
                </div>
                <img alt="My avatar" className="rounded-full w-8 h-8 object-cover flex-shrink-0" src="https://storage.googleapis.com/a1aa/image/31130072-5ee0-4273-1569-5e0b5e24910f.jpg" />
              </div>
            );
        }
      };

  return (
    <div className='flex'>
    <LeftSidebar />
    <section aria-label="Chat conversation panel" className="bg-white w-full flex flex-col shadow-lg relative h-screen">
      {/* Top bar */}
      <header className="flex items-center justify-between px-5 py-2 border-b border-gray-200 flex-shrink-0">
        <div className="flex items-center space-x-3">
          <button aria-label="Back" className="text-gray-600 text-xl leading-none hover:text-gray-900 flex items-center">
            <FaChevronLeft />
            <span className="ml-1 w-5 h-5 bg-blue-600 text-white text-xs justify-center items-center rounded-full text-center font-semibold select-none"><p className='text-center text-white mt-0.5'>1</p></span>
          </button>
          <img alt="Olivia Nguyen woman portrait" className="rounded-full w-9 h-9 object-cover" height={36} src="https://storage.googleapis.com/a1aa/image/31130072-5ee0-4273-1569-5e0b5e24910f.jpg" width={36} />
          <div className="flex flex-col leading-tight">
            <span className="font-semibold text-gray-900 text-sm select-text">Olivia Nguyen</span>
            <span className="text-xs text-gray-400 select-text">Last seen 2 hours ago</span>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          <button aria-label="Call" className="text-gray-600 text-xl leading-none hover:text-gray-900">
            <FaPhone className='text-gray-600 w-6 h-6'/>
          </button>
          <button aria-label="Video call" className="bg-blue-600 text-white rounded-full w-8 h-8 flex items-center justify-center text-xl hover:bg-blue-700">
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
      {/* Chat messages area */}
      <main aria-live="polite" className="flex-1 overflow-y-auto px-5 py-4 space-y-6 text-xs text-gray-800">
        {messages.map(renderMessage)}
      </main>
      {/* Typing indicator and input area */}
      <footer aria-label="Message input area" className="border-t border-gray-200 px-5 py-3 flex flex-col space-y-2 flex-shrink-0">
        {!isRecording ? (
            <>
                <div className="text-xs text-gray-700 select-text">
                    <span className="font-semibold">Olivia Nguyen</span>, is typing...
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
                        onChange={(e) => setMessageInput(e.target.value)}
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
                    >
                        <FaPaperPlane />
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
    </section>
    <ProfileModal isOpen={showProfile} onClose={() => setShowProfile(false)} />
    </div>
  );
};

export default Chat;