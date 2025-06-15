import React, { useState, useRef, useEffect } from 'react';
import { FaChevronLeft, FaPhone, FaVideo, FaPlus, FaCamera, FaMicrophone, FaPaperPlane, FaDownload, FaReply, FaFile, FaEllipsisV, FaUsers } from 'react-icons/fa';
import { BsEmojiSmile } from "react-icons/bs";
import EmojiPicker, { EmojiClickData } from 'emoji-picker-react';
import CallModal from './CallModal';
import CommunitySidebar from './CommunitySidebar';
import { useNavigate } from 'react-router-dom';

interface CommunityChatProps {
    onBack: () => void;
    type: 'group' | 'channel';
    name: string;
    members: number;
    avatar?: string;
}

interface Message {
    id: number;
    type: 'timestamp' | 'incoming' | 'outgoing' | 'file';
    content: string;
    time: string;
    sender?: string;
    images?: string[];
    fileName?: string;
    fileSize?: string;
    fileType?: string;
}

const CommunityChat: React.FC<CommunityChatProps> = ({ onBack, type, name, members, avatar }) => {
    const navigate = useNavigate();
    const [activeMenu, setActiveMenu] = useState<number | null>(null);
    const [showUploadMenu, setShowUploadMenu] = useState(false);
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);
    const [isRecording, setIsRecording] = useState(false);
    const [isPaused, setIsPaused] = useState(false);
    const [recordingTime, setRecordingTime] = useState(0);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [showImageModal, setShowImageModal] = useState(false);
    const [selectedImages, setSelectedImages] = useState<string[]>([]);
    const [selectedImageIndex, setSelectedImageIndex] = useState(0);
    const [isLoading, setIsLoading] = useState(true);
    const [chatMessages, setChatMessages] = useState<Message[]>([]);
    const [messageInput, setMessageInput] = useState('');
    const [showCallModal, setShowCallModal] = useState(false);
    const [callType, setCallType] = useState<'audio' | 'video'>('audio');

    const menuRef = useRef<HTMLDivElement>(null);
    const buttonRef = useRef<HTMLButtonElement>(null);
    const uploadMenuRef = useRef<HTMLDivElement>(null);
    const emojiPickerRef = useRef<HTMLDivElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const recordingTimerRef = useRef<NodeJS.Timeout | null>(null);

    useEffect(() => {
        // Simulate fetching messages from an API
        const fetchMessages = async () => {
            try {
                // In a real app, this would be an API call
                // const response = await fetch('/api/messages');
                // const data = await response.json();
                // setChatMessages(data);
                
                // For now, we'll use some sample messages
                setChatMessages([
                    {
                        id: 1,
                        type: 'timestamp',
                        content: '10:20 PM',
                        time: '10:20 PM'
                    },
                    {
                        id: 2,
                        type: 'incoming',
                        content: 'Hello everyone! 👋',
                        time: '10:20 PM',
                        sender: 'John Doe'
                    },
                    {
                        id: 3,
                        type: 'outgoing',
                        content: 'Hi there! How is everyone doing?',
                        time: '10:21 PM'
                    }
                ]);
                setIsLoading(false);
            } catch (error) {
                console.error('Error fetching messages:', error);
                setIsLoading(false);
            }
        };

        fetchMessages();
    }, []);

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
            }
        } catch (error) {
            console.error('Error accessing microphone:', error);
        }
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

    const renderMenu = (messageId: number, messageType: 'incoming' | 'outgoing') => {
        const menuClasses = `absolute top-full mt-6 ${
            messageType === 'incoming' ? 'right-0' : 'left-0'
        } bg-white rounded-lg shadow-[0_4px_20px_rgba(0,0,0,0.1)] w-40 text-base font-normal border border-gray-100 shadow-xl z-50`;
        
        const arrowClasses = `absolute top-[-8px] ${
            messageType === 'incoming' ? 'right-3' : 'left-3'
        } w-4 h-4 bg-white rotate-45 border-l border-t border-gray-100 shadow-xl`;
        
        const arrowStyle = { clipPath: 'polygon(0 0, 100% 0, 100% 100%)' };

        return (
            <div className={menuClasses}>
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
                        <div className="max-w-[70%]">
                            {message.sender && (
                                <span className="text-xs text-gray-500 mb-1 block">{message.sender}</span>
                            )}
                            <div className="bg-blue-200 rounded-xl p-3 text-gray-900 leading-tight select-text">
                                {message.content}
                            </div>
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
                                <FaEllipsisV 
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
                                <FaEllipsisV 
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
        <div className="flex h-screen">
            <CommunitySidebar 
                onBack={onBack}
            />
            <div className="h-full w-full flex flex-col bg-white">
                {/* Header */}
                <header className="flex items-center justify-between px-5 py-2 border-b border-gray-200 flex-shrink-0">
                    <div className="flex items-center space-x-3">
                        <button 
                            aria-label="Back" 
                            className="text-gray-600 text-xl leading-none hover:text-gray-900 flex items-center"
                            onClick={onBack}
                        >
                            <FaChevronLeft />
                        </button>
                        {type === 'group' ? (
                            <img alt={`${name} group avatar`} className="rounded-full w-9 h-9 object-cover" src={avatar} />
                        ) : (
                            <div className="w-9 h-9 rounded-full bg-blue-100 flex items-center justify-center">
                                <FaUsers className="text-blue-600 w-5 h-5" />
                            </div>
                        )}
                        <div className="flex flex-col leading-tight">
                            <span className="font-semibold text-gray-900 text-sm select-text">{name}</span>
                            <span className="text-xs text-gray-400 select-text">{members} members</span>
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
                            aria-label="More options" 
                            className="text-gray-600 text-xl leading-none hover:text-gray-900"
                        >
                            <FaEllipsisV className='text-gray-600 w-6 h-6'/>
                        </button>
                    </div>
                </header>

                {/* Chat messages area */}
                <main aria-live="polite" className="flex-1 overflow-y-auto px-5 py-4 space-y-6 text-xs text-gray-800">
                    {chatMessages.map(renderMessage)}
                </main>

                {/* Message input area */}
                <footer aria-label="Message input area" className="border-t border-gray-200 px-5 py-3 flex flex-col space-y-2 flex-shrink-0">
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
                </footer>

                {/* Call Modal */}
                {showCallModal && (
                    <CallModal
                        isOpen={showCallModal}
                        type={callType}
                        onClose={() => setShowCallModal(false)}
                        contact={{
                            name: name,
                            avatar: avatar || 'https://storage.googleapis.com/a1aa/image/31130072-5ee0-4273-1569-5e0b5e24910f.jpg'
                        }}
                    />
                )}
            </div>
        </div>
    );
};

export default CommunityChat; 