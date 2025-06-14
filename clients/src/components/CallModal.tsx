import React, { useState, useEffect, useRef } from 'react';
import { FaPhone, FaVideo, FaMicrophone, FaMicrophoneSlash, FaVideoSlash, FaTimes, FaVolumeUp, FaVolumeMute, FaCamera, FaSync } from 'react-icons/fa';

interface CallModalProps {
    isOpen: boolean;
    onClose: () => void;
    type: 'audio' | 'video';
}

interface Position {
    x: number;
    y: number;
}

const CallModal: React.FC<CallModalProps> = ({ isOpen, onClose, type }) => {
    const [isMuted, setIsMuted] = useState(false);
    const [isVideoOff, setIsVideoOff] = useState(false);
    const [isSpeakerOn, setIsSpeakerOn] = useState(true);
    const [callDuration, setCallDuration] = useState(0);
    const [isConnecting, setIsConnecting] = useState(true);
    const [isDragging, setIsDragging] = useState(false);
    const [position, setPosition] = useState<Position>({ x: 16, y: 16 }); // Default position (top-right)
    const [dragOffset, setDragOffset] = useState<Position>({ x: 0, y: 0 });
    const [isFrontCamera, setIsFrontCamera] = useState(true);
    const [isSwitchingCamera, setIsSwitchingCamera] = useState(false);
    const localVideoRef = useRef<HTMLVideoElement>(null);
    const remoteVideoRef = useRef<HTMLVideoElement>(null);
    const timerRef = useRef<NodeJS.Timeout | null>(null);
    const localVideoContainerRef = useRef<HTMLDivElement>(null);
    const streamRef = useRef<MediaStream | null>(null);

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
        <div className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center">
            <div className="relative w-full h-full flex flex-col">
                {/* Remote video/audio */}
                <div className="flex-1 relative">
                    {type === 'video' ? (
                        <video
                            ref={remoteVideoRef}
                            className="w-full h-full object-cover"
                            autoPlay
                            playsInline
                        />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center">
                            <div className="text-center">
                                <img
                                    src="https://storage.googleapis.com/a1aa/image/31130072-5ee0-4273-1569-5e0b5e24910f.jpg"
                                    alt="Caller"
                                    className="w-32 h-32 rounded-full object-cover mx-auto mb-4"
                                />
                                <h3 className="text-white text-xl font-semibold">Olivia Nguyen</h3>
                                <p className="text-gray-300 mt-2">
                                    {isConnecting ? 'Connecting...' : formatTime(callDuration)}
                                </p>
                            </div>
                        </div>
                    )}
                </div>

                {/* Local video (for video calls) */}
                {type === 'video' && (
                    <div
                        ref={localVideoContainerRef}
                        className="absolute rounded-lg overflow-hidden border-2 border-white cursor-move transition-shadow duration-200"
                        style={{
                            width: '160px',
                            height: '240px',
                            left: `${position.x}px`,
                            top: `${position.y}px`,
                            boxShadow: isDragging ? '0 0 20px rgba(255,255,255,0.3)' : 'none',
                            zIndex: isDragging ? 50 : 40
                        }}
                        onMouseDown={handleMouseDown}
                    >
                        <video
                            ref={localVideoRef}
                            className="w-full h-full object-cover"
                            autoPlay
                            playsInline
                            muted
                        />
                        <div className="absolute top-2 right-2 flex items-center space-x-2">
                            <div className={`w-2 h-2 rounded-full ${isVideoOff ? 'bg-red-500' : 'bg-green-500'}`} />
                            <span className="text-white text-xs font-medium">
                                {isVideoOff ? 'Camera Off' : 'Camera On'}
                            </span>
                        </div>
                        {!isVideoOff && (
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    switchCamera();
                                }}
                                className="absolute bottom-2 right-2 p-2 rounded-full bg-gray-800 bg-opacity-50 text-white hover:bg-opacity-70 transition-colors"
                                title={`Switch to ${isFrontCamera ? 'back' : 'front'} camera`}
                                disabled={isSwitchingCamera}
                            >
                                <FaSync className={`w-4 h-4 ${isSwitchingCamera ? 'animate-spin' : ''}`} />
                            </button>
                        )}
                    </div>
                )}

                {/* Call controls */}
                <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex items-center space-x-4">
                    <button
                        onClick={() => setIsMuted(!isMuted)}
                        className={`p-4 rounded-full ${isMuted ? 'bg-red-500' : 'bg-gray-600'} text-white hover:bg-opacity-80 transition-colors`}
                        title={isMuted ? 'Unmute' : 'Mute'}
                    >
                        {isMuted ? <FaMicrophoneSlash className="w-6 h-6" /> : <FaMicrophone className="w-6 h-6" />}
                    </button>
                    {type === 'video' && (
                        <button
                            onClick={() => setIsVideoOff(!isVideoOff)}
                            className={`p-4 rounded-full ${isVideoOff ? 'bg-red-500' : 'bg-gray-600'} text-white hover:bg-opacity-80 transition-colors`}
                            title={isVideoOff ? 'Turn on camera' : 'Turn off camera'}
                        >
                            {isVideoOff ? <FaVideoSlash className="w-6 h-6" /> : <FaCamera className="w-6 h-6" />}
                        </button>
                    )}
                    <button
                        onClick={() => setIsSpeakerOn(!isSpeakerOn)}
                        className={`p-4 rounded-full ${isSpeakerOn ? 'bg-gray-600' : 'bg-red-500'} text-white hover:bg-opacity-80 transition-colors`}
                        title={isSpeakerOn ? 'Turn off speaker' : 'Turn on speaker'}
                    >
                        {isSpeakerOn ? <FaVolumeUp className="w-6 h-6" /> : <FaVolumeMute className="w-6 h-6" />}
                    </button>
                    <button
                        onClick={handleEndCall}
                        className="p-4 rounded-full bg-red-500 text-white hover:bg-red-600 transition-colors"
                        title="End call"
                    >
                        <FaPhone className="w-6 h-6 rotate-135" />
                    </button>
                </div>

                {/* Close button */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-white hover:text-gray-300"
                    title="Close"
                >
                    <FaTimes className="w-6 h-6" />
                </button>

                {/* Call duration */}
                <div className="absolute top-4 left-1/2 transform -translate-x-1/2 text-white text-sm font-medium">
                    {formatTime(callDuration)}
                </div>
            </div>
        </div>
    );
};

export default CallModal; 