import React, { useState, useEffect, useRef } from 'react';
import { FaMicrophone, FaMicrophoneSlash, FaVideo, FaVideoSlash, FaVolumeUp, FaVolumeMute, FaPhoneSlash, FaSync } from 'react-icons/fa';

interface CallModalProps {
    isOpen: boolean;
    onClose: () => void;
    type: 'audio' | 'video';
    contact: {
        name: string;
        avatar: string;
    };
}

interface Position {
    x: number;
    y: number;
}

const CallModal: React.FC<CallModalProps> = ({ isOpen, onClose, type, contact }) => {
    const [isMuted, setIsMuted] = useState(false);
    const [isVideoOff, setIsVideoOff] = useState(false);
    const [isSpeakerOn, setIsSpeakerOn] = useState(true);
    const [callDuration, setCallDuration] = useState(0);
    const [isConnecting, setIsConnecting] = useState(true);
    const [isDragging, setIsDragging] = useState(false);
    const [position, setPosition] = useState<Position>({ x: 20, y: 20 });
    const [dragOffset, setDragOffset] = useState<Position>({ x: 0, y: 0 });
    const [isFrontCamera, setIsFrontCamera] = useState(true);
    const [isSwitchingCamera, setIsSwitchingCamera] = useState(false);
    const streamRef = useRef<MediaStream | null>(null);
    const localVideoRef = useRef<HTMLVideoElement>(null);
    const localVideoContainerRef = useRef<HTMLDivElement>(null);
    const timerRef = useRef<NodeJS.Timeout>();

    const initializeCamera = async (facingMode: 'user' | 'environment') => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                video: {
                    facingMode: facingMode
                },
                audio: true
            });

            if (localVideoRef.current) {
                localVideoRef.current.srcObject = stream;
            }

            streamRef.current = stream;
            setIsSwitchingCamera(false);
        } catch (error) {
            console.error('Error accessing camera:', error);
            setIsSwitchingCamera(false);
        }
    };

    const switchCamera = async () => {
        if (isSwitchingCamera) return;
        
        setIsSwitchingCamera(true);
        
        // Stop the current stream
        if (streamRef.current) {
            streamRef.current.getTracks().forEach(track => track.stop());
        }

        // Switch to the other camera
        const newFacingMode = isFrontCamera ? 'environment' : 'user';
        await initializeCamera(newFacingMode);
        setIsFrontCamera(!isFrontCamera);
    };

    useEffect(() => {
        if (isOpen && type === 'video') {
            initializeCamera('user');
        }

        return () => {
            if (streamRef.current) {
                streamRef.current.getTracks().forEach(track => track.stop());
            }
        };
    }, [isOpen, type]);

    useEffect(() => {
        if (isOpen) {
            // Simulate call connection
            const timer = setTimeout(() => {
                setIsConnecting(false);
            }, 2000);

            // Start call timer
            timerRef.current = setInterval(() => {
                setCallDuration(prev => prev + 1);
            }, 1000);

            return () => {
                clearTimeout(timer);
                if (timerRef.current) {
                    clearInterval(timerRef.current);
                }
            };
        }
    }, [isOpen]);

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    const handleEndCall = () => {
        if (timerRef.current) {
            clearInterval(timerRef.current);
        }
        onClose();
    };

    const handleMouseDown = (e: React.MouseEvent) => {
        if (!localVideoContainerRef.current) return;
        
        const rect = localVideoContainerRef.current.getBoundingClientRect();
        setDragOffset({
            x: e.clientX - rect.left,
            y: e.clientY - rect.top
        });
        setIsDragging(true);
    };

    const handleMouseMove = (e: React.MouseEvent) => {
        if (!isDragging || !localVideoContainerRef.current) return;

        const containerRect = localVideoContainerRef.current.parentElement?.getBoundingClientRect();
        if (!containerRect) return;

        const newX = e.clientX - containerRect.left - dragOffset.x;
        const newY = e.clientY - containerRect.top - dragOffset.y;

        // Keep the video preview within bounds
        const maxX = containerRect.width - localVideoContainerRef.current.offsetWidth;
        const maxY = containerRect.height - localVideoContainerRef.current.offsetHeight;

        setPosition({
            x: Math.max(0, Math.min(newX, maxX)),
            y: Math.max(0, Math.min(newY, maxY))
        });
    };

    const handleMouseUp = () => {
        setIsDragging(false);
    };

    useEffect(() => {
        if (isDragging) {
            document.addEventListener('mousemove', handleMouseMove as any);
            document.addEventListener('mouseup', handleMouseUp);
        }

        return () => {
            document.removeEventListener('mousemove', handleMouseMove as any);
            document.removeEventListener('mouseup', handleMouseUp);
        };
    }, [isDragging]);

    if (!isOpen) return null;

    return (
        <div className={`fixed inset-0 bg-black bg-opacity-90 z-50 ${isOpen ? 'block' : 'hidden'}`}>
            <div className="relative h-full">
                {/* Remote Video/Profile */}
                <div className="absolute inset-0 flex items-center justify-center">
                    {type === 'video' ? (
                        <div className="w-full h-full bg-gray-900 flex items-center justify-center">
                            <div className="text-white text-center">
                                <img
                                    src={contact.avatar}
                                    alt={contact.name}
                                    className="w-32 h-32 rounded-full mx-auto mb-4"
                                />
                                <h2 className="text-2xl font-semibold mb-2">{contact.name}</h2>
                                <p className="text-gray-400">
                                    {isConnecting ? 'Connecting...' : formatTime(callDuration)}
                                </p>
                            </div>
                        </div>
                    ) : (
                        <div className="text-white text-center">
                            <img
                                src={contact.avatar}
                                alt={contact.name}
                                className="w-32 h-32 rounded-full mx-auto mb-4"
                            />
                            <h2 className="text-2xl font-semibold mb-2">{contact.name}</h2>
                            <p className="text-gray-400">
                                {isConnecting ? 'Connecting...' : formatTime(callDuration)}
                            </p>
                        </div>
                    )}
                </div>

                {/* Local Video Preview */}
                {type === 'video' && !isVideoOff && (
                    <div
                        ref={localVideoContainerRef}
                        className="absolute bottom-24 right-6 w-48 h-36 bg-gray-800 rounded-lg overflow-hidden shadow-lg cursor-move"
                        style={{
                            transform: `translate(${position.x}px, ${position.y}px)`,
                            transition: isDragging ? 'none' : 'transform 0.2s ease-out',
                        }}
                        onMouseDown={handleMouseDown}
                    >
                        <video
                            ref={localVideoRef}
                            autoPlay
                            muted
                            playsInline
                            className="w-full h-full object-cover"
                        />
                        {isVideoOff && (
                            <div className="absolute inset-0 bg-gray-900 flex items-center justify-center">
                                <FaVideoSlash className="text-white text-2xl" />
                            </div>
                        )}
                        <button
                            onClick={switchCamera}
                            disabled={isSwitchingCamera}
                            className="absolute top-2 right-2 p-2 rounded-full bg-black bg-opacity-50 text-white hover:bg-opacity-70 transition-colors"
                            title={`Switch to ${isFrontCamera ? 'back' : 'front'} camera`}
                        >
                            <FaSync className={`w-4 h-4 ${isSwitchingCamera ? 'animate-spin' : ''}`} />
                        </button>
                    </div>
                )}

                {/* Call Controls */}
                <div className="absolute bottom-8 left-0 right-0 flex justify-center space-x-6">
                    <button
                        onClick={() => setIsMuted(!isMuted)}
                        className={`p-4 rounded-full ${
                            isMuted ? 'bg-red-500' : 'bg-gray-700'
                        } text-white hover:bg-opacity-80 transition-colors`}
                        title={isMuted ? 'Unmute' : 'Mute'}
                    >
                        {isMuted ? <FaMicrophoneSlash className="w-6 h-6" /> : <FaMicrophone className="w-6 h-6" />}
                    </button>
                    {type === 'video' && (
                        <button
                            onClick={() => setIsVideoOff(!isVideoOff)}
                            className={`p-4 rounded-full ${
                                isVideoOff ? 'bg-red-500' : 'bg-gray-700'
                            } text-white hover:bg-opacity-80 transition-colors`}
                            title={isVideoOff ? 'Turn on camera' : 'Turn off camera'}
                        >
                            {isVideoOff ? <FaVideoSlash className="w-6 h-6" /> : <FaVideo className="w-6 h-6" />}
                        </button>
                    )}
                    <button
                        onClick={() => setIsSpeakerOn(!isSpeakerOn)}
                        className={`p-4 rounded-full ${
                            isSpeakerOn ? 'bg-gray-700' : 'bg-gray-500'
                        } text-white hover:bg-opacity-80 transition-colors`}
                        title={isSpeakerOn ? 'Turn off speaker' : 'Turn on speaker'}
                    >
                        {isSpeakerOn ? <FaVolumeUp className="w-6 h-6" /> : <FaVolumeMute className="w-6 h-6" />}
                    </button>
                    <button
                        onClick={onClose}
                        className="p-4 rounded-full bg-red-500 text-white hover:bg-red-600 transition-colors"
                        title="End call"
                    >
                        <FaPhoneSlash className="w-6 h-6" />
                    </button>
                </div>

                {/* Close Button */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-white hover:text-gray-300 transition-colors"
                >
                    <span className="sr-only">Close</span>
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>
            </div>
        </div>
    );
};

export default CallModal; 