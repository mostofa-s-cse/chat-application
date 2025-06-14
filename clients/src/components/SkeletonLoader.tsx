import React from 'react';

interface SkeletonLoaderProps {
    type: 'message' | 'image';
    variant?: 'incoming' | 'outgoing';
}

const SkeletonLoader: React.FC<SkeletonLoaderProps> = ({ type, variant = 'incoming' }) => {
    if (type === 'message') {
        return (
            <div className={`flex items-center space-x-2 ${variant === 'outgoing' ? 'justify-end' : ''}`}>
                {variant === 'incoming' && (
                    <div className="w-8 h-8 rounded-full bg-gray-200 animate-pulse" />
                )}
                <div className={`max-w-[70%] rounded-xl p-3 ${variant === 'incoming' ? 'bg-gray-200' : 'bg-blue-100'} animate-pulse`}>
                    <div className="h-4 bg-gray-300 rounded w-3/4 mb-2" />
                    <div className="h-4 bg-gray-300 rounded w-1/2" />
                </div>
                {variant === 'outgoing' && (
                    <div className="w-8 h-8 rounded-full bg-gray-200 animate-pulse" />
                )}
            </div>
        );
    }

    if (type === 'image') {
        return (
            <div className="grid grid-cols-2 gap-2 mb-2 rounded-xl overflow-hidden">
                <div className="w-full h-32 bg-gray-200 animate-pulse rounded-l-xl rounded-tr-xl" />
                <div className="w-full h-20 bg-gray-200 animate-pulse rounded-tr-xl rounded-bl-xl" />
                <div className="w-full h-20 bg-gray-200 animate-pulse rounded-bl-xl rounded-br-xl" />
            </div>
        );
    }

    return null;
};

export default SkeletonLoader; 