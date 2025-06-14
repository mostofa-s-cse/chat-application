import React from 'react';
import { FaPhone, FaVideo, FaChevronLeft } from 'react-icons/fa';

interface CallLog {
    id: number;
    type: 'audio' | 'video';
    status: 'missed' | 'received' | 'outgoing';
    contact: {
        name: string;
        avatar: string;
    };
    timestamp: string;
    duration?: string;
}

const callLogs: CallLog[] = [
    {
        id: 1,
        type: 'video',
        status: 'received',
        contact: {
            name: 'Olivia Nguyen',
            avatar: 'https://storage.googleapis.com/a1aa/image/31130072-5ee0-4273-1569-5e0b5e24910f.jpg'
        },
        timestamp: '10:30 AM',
        duration: '5:23'
    },
    {
        id: 2,
        type: 'audio',
        status: 'missed',
        contact: {
            name: 'John Doe',
            avatar: 'https://storage.googleapis.com/a1aa/image/31130072-5ee0-4273-1569-5e0b5e24910f.jpg'
        },
        timestamp: 'Yesterday'
    },
    {
        id: 3,
        type: 'audio',
        status: 'outgoing',
        contact: {
            name: 'Sarah Smith',
            avatar: 'https://storage.googleapis.com/a1aa/image/31130072-5ee0-4273-1569-5e0b5e24910f.jpg'
        },
        timestamp: 'Yesterday',
        duration: '2:15'
    }
];

interface CallLogsProps {
    onBack: () => void;
    onCall?: (contact: CallLog['contact'], type: 'audio' | 'video') => void;
}

const CallLogs: React.FC<CallLogsProps> = ({ onBack, onCall }) => {
    const getStatusColor = (status: CallLog['status']) => {
        switch (status) {
            case 'missed':
                return 'text-red-500';
            case 'received':
                return 'text-green-500';
            case 'outgoing':
                return 'text-blue-500';
            default:
                return 'text-gray-500';
        }
    };

    const getStatusText = (status: CallLog['status']) => {
        switch (status) {
            case 'missed':
                return 'Missed call';
            case 'received':
                return 'Incoming call';
            case 'outgoing':
                return 'Outgoing call';
            default:
                return '';
        }
    };

    const handleCallClick = (log: CallLog) => {
        if (onCall) {
            onCall(log.contact, log.type);
        }
    };

    return (
        <div className="h-full flex flex-col bg-white">
            {/* Header */}
            <div className="flex items-center px-4 py-3 border-b border-gray-200">
                <button
                    onClick={onBack}
                    className="mr-4 text-gray-600 hover:text-gray-900"
                >
                    <FaChevronLeft className="w-5 h-5" />
                </button>
                <h2 className="text-lg font-semibold text-gray-900">Call Logs</h2>
            </div>

            {/* Call Logs List */}
            <div className="flex-1 overflow-y-auto">
                {callLogs.map((log) => (
                    <div
                        key={log.id}
                        className="flex items-center px-4 py-3 hover:bg-gray-50 cursor-pointer transition-colors"
                        onClick={() => handleCallClick(log)}
                    >
                        <div className="flex-shrink-0 mr-3">
                            <img
                                src={log.contact.avatar}
                                alt={log.contact.name}
                                className="w-12 h-12 rounded-full object-cover"
                            />
                        </div>
                        <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between">
                                <h3 className="text-sm font-medium text-gray-900 truncate">
                                    {log.contact.name}
                                </h3>
                                <span className="text-xs text-gray-500">
                                    {log.timestamp}
                                </span>
                            </div>
                            <div className="flex items-center mt-1">
                                <span className={`text-xs ${getStatusColor(log.status)}`}>
                                    {getStatusText(log.status)}
                                </span>
                                {log.duration && (
                                    <span className="text-xs text-gray-500 ml-2">
                                        • {log.duration}
                                    </span>
                                )}
                            </div>
                        </div>
                        <div className="flex-shrink-0 ml-4">
                            <button
                                className={`p-2 rounded-full ${
                                    log.type === 'video' ? 'bg-blue-100' : 'bg-gray-100'
                                } text-gray-600 hover:bg-opacity-80 transition-colors`}
                                onClick={(e) => {
                                    e.stopPropagation();
                                    handleCallClick(log);
                                }}
                            >
                                {log.type === 'video' ? (
                                    <FaVideo className="w-4 h-4" />
                                ) : (
                                    <FaPhone className="w-4 h-4" />
                                )}
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default CallLogs; 