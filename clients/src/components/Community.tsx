import React, { useState, useRef, useEffect } from 'react';
import { FaChevronLeft, FaPlus, FaSearch, FaUsers, FaHashtag, FaStar, FaEllipsisH, FaTimes, FaHashtag as FaHashtagIcon, FaCog } from 'react-icons/fa';
import CreateGroup from './CreateGroupModal';
import CreateChannel from './CreateCommunityModal';

interface CommunityProps {
    onBack: () => void;
}

type TabType = 'groups' | 'channels' | 'favorites';

const Community: React.FC<CommunityProps> = ({ onBack }) => {
    const [activeTab, setActiveTab] = useState<TabType>('groups');
    const [showSearch, setShowSearch] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [showPlusMenu, setShowPlusMenu] = useState(false);
    const [showThreeDotMenu, setShowThreeDotMenu] = useState(false);
    const [showCreateGroup, setShowCreateGroup] = useState(false);
    const [showCreateChannel, setShowCreateChannel] = useState(false);
    const searchInputRef = useRef<HTMLInputElement>(null);
    const plusMenuRef = useRef<HTMLDivElement>(null);
    const threeDotMenuRef = useRef<HTMLDivElement>(null);

    const tabs = [
        { id: 'groups', label: 'Groups', icon: FaUsers },
        { id: 'channels', label: 'Channels', icon: FaHashtag },
        { id: 'favorites', label: 'Favorites', icon: FaStar },
    ];

    const groups = [
        {
            id: 1,
            name: 'Design Team',
            members: 12,
            lastMessage: 'Meeting at 3 PM',
            avatar: 'https://storage.googleapis.com/a1aa/image/81be462c-bb01-439f-abf9-79fa0c1b1f56.jpg',
            unread: 3
        },
        {
            id: 2,
            name: 'Marketing Squad',
            members: 8,
            lastMessage: 'New campaign ideas',
            avatar: 'https://storage.googleapis.com/a1aa/image/030ff9d7-440d-4505-1c02-746ca8c66c53.jpg',
            unread: 0
        },
        {
            id: 3,
            name: 'Development',
            members: 15,
            lastMessage: 'Sprint planning',
            avatar: 'https://storage.googleapis.com/a1aa/image/46d60eb8-029e-4a16-b49e-a53a210ba0bc.jpg',
            unread: 1
        }
    ];

    const channels = [
        {
            id: 1,
            name: 'announcements',
            members: 45,
            lastMessage: 'New feature release',
            unread: 2
        },
        {
            id: 2,
            name: 'general',
            members: 89,
            lastMessage: 'Welcome new members!',
            unread: 0
        },
        {
            id: 3,
            name: 'random',
            members: 67,
            lastMessage: 'Fun Friday!',
            unread: 5
        }
    ];

    const favorites = [
        {
            id: 1,
            name: 'Design Team',
            type: 'group',
            members: 12,
            lastMessage: 'Meeting at 3 PM',
            avatar: 'https://storage.googleapis.com/a1aa/image/81be462c-bb01-439f-abf9-79fa0c1b1f56.jpg',
            unread: 3
        },
        {
            id: 2,
            name: 'announcements',
            type: 'channel',
            members: 45,
            lastMessage: 'New feature release',
            unread: 2
        }
    ];

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (plusMenuRef.current && !plusMenuRef.current.contains(event.target as Node)) {
                setShowPlusMenu(false);
            }
            if (threeDotMenuRef.current && !threeDotMenuRef.current.contains(event.target as Node)) {
                setShowThreeDotMenu(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    useEffect(() => {
        if (showSearch && searchInputRef.current) {
            searchInputRef.current.focus();
        }
    }, [showSearch]);

    const handleSearch = (query: string) => {
        setSearchQuery(query);
        // Implement search logic here
    };

    const renderPlusMenu = () => (
        <div 
            ref={plusMenuRef}
            className="absolute top-12 right-4 bg-white rounded-lg shadow-lg border border-gray-100 w-48 py-1 z-50"
        >
            <button 
                className="w-full px-4 py-2 text-left text-gray-700 hover:bg-gray-50 flex items-center space-x-2"
                onClick={() => {
                    setShowPlusMenu(false);
                    setShowCreateGroup(true);
                }}
            >
                <FaUsers className="text-gray-400 w-4 h-4" />
                <span>Create Group</span>
            </button>
            <button 
                className="w-full px-4 py-2 text-left text-gray-700 hover:bg-gray-50 flex items-center space-x-2"
                onClick={() => {
                    setShowPlusMenu(false);
                    setShowCreateChannel(true);
                }}
            >
                <FaHashtagIcon className="text-gray-400 w-4 h-4" />
                <span>Create Channel</span>
            </button>
        </div>
    );

    const renderThreeDotMenu = () => (
        <div 
            ref={threeDotMenuRef}
            className="absolute top-12 right-4 bg-white rounded-lg shadow-lg border border-gray-100 w-48 py-1 z-50"
        >
            <button 
                className="w-full px-4 py-2 text-left text-gray-700 hover:bg-gray-50 flex items-center space-x-2"
                onClick={() => {
                    setShowThreeDotMenu(false);
                    // Handle community settings
                }}
            >
                <FaCog className="text-gray-400 w-4 h-4" />
                <span>Community Settings</span>
            </button>
            <button 
                className="w-full px-4 py-2 text-left text-gray-700 hover:bg-gray-50 flex items-center space-x-2"
                onClick={() => {
                    setShowThreeDotMenu(false);
                    // Handle manage members
                }}
            >
                <FaUsers className="text-gray-400 w-4 h-4" />
                <span>Manage Members</span>
            </button>
        </div>
    );

    const renderContent = () => {
        switch (activeTab) {
            case 'groups':
                return (
                    <div className="space-y-4">
                        {groups.map(group => (
                            <div key={group.id} className="flex items-center space-x-3 p-3 hover:bg-gray-50 rounded-lg cursor-pointer">
                                <img src={group.avatar} alt={group.name} className="w-12 h-12 rounded-lg object-cover" />
                                <div className="flex-1 min-w-0">
                                    <div className="flex justify-between items-center">
                                        <h3 className="text-gray-900 font-semibold text-sm truncate">{group.name}</h3>
                                        {group.unread > 0 && (
                                            <span className="bg-blue-600 text-white text-xs font-semibold rounded-full w-5 h-5 flex items-center justify-center">
                                                {group.unread}
                                            </span>
                                        )}
                                    </div>
                                    <p className="text-gray-500 text-xs truncate">{group.members} members</p>
                                    <p className="text-gray-600 text-xs truncate">{group.lastMessage}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                );
            case 'channels':
                return (
                    <div className="space-y-4">
                        {channels.map(channel => (
                            <div key={channel.id} className="flex items-center space-x-3 p-3 hover:bg-gray-50 rounded-lg cursor-pointer">
                                <div className="w-12 h-12 rounded-lg bg-blue-100 flex items-center justify-center">
                                    <FaHashtag className="text-blue-600 w-6 h-6" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex justify-between items-center">
                                        <h3 className="text-gray-900 font-semibold text-sm truncate">#{channel.name}</h3>
                                        {channel.unread > 0 && (
                                            <span className="bg-blue-600 text-white text-xs font-semibold rounded-full w-5 h-5 flex items-center justify-center">
                                                {channel.unread}
                                            </span>
                                        )}
                                    </div>
                                    <p className="text-gray-500 text-xs truncate">{channel.members} members</p>
                                    <p className="text-gray-600 text-xs truncate">{channel.lastMessage}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                );
            case 'favorites':
                return (
                    <div className="space-y-4">
                        {favorites.map(favorite => (
                            <div key={favorite.id} className="flex items-center space-x-3 p-3 hover:bg-gray-50 rounded-lg cursor-pointer">
                                {favorite.type === 'group' ? (
                                    <img src={favorite.avatar} alt={favorite.name} className="w-12 h-12 rounded-lg object-cover" />
                                ) : (
                                    <div className="w-12 h-12 rounded-lg bg-blue-100 flex items-center justify-center">
                                        <FaHashtag className="text-blue-600 w-6 h-6" />
                                    </div>
                                )}
                                <div className="flex-1 min-w-0">
                                    <div className="flex justify-between items-center">
                                        <h3 className="text-gray-900 font-semibold text-sm truncate">
                                            {favorite.type === 'channel' ? '#' : ''}{favorite.name}
                                        </h3>
                                        {favorite.unread > 0 && (
                                            <span className="bg-blue-600 text-white text-xs font-semibold rounded-full w-5 h-5 flex items-center justify-center">
                                                {favorite.unread}
                                            </span>
                                        )}
                                    </div>
                                    <p className="text-gray-500 text-xs truncate">{favorite.members} members</p>
                                    <p className="text-gray-600 text-xs truncate">{favorite.lastMessage}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                );
        }
    };

    return (
        <div className="h-full flex flex-col bg-white">
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200">
                <div className="flex items-center">
                    <button
                        onClick={onBack}
                        className="mr-4 text-gray-600 hover:text-gray-900"
                    >
                        <FaChevronLeft className="w-5 h-5" />
                    </button>
                    <h2 className="text-lg font-semibold text-gray-900">Community</h2>
                </div>
                <div className="flex items-center space-x-3">
                    {showSearch ? (
                        <div className="flex items-center bg-gray-100 rounded-full px-3 py-1">
                            <FaSearch className="text-gray-400 w-4 h-4" />
                            <input
                                ref={searchInputRef}
                                type="text"
                                placeholder="Search..."
                                className="bg-transparent border-none focus:outline-none text-sm px-2 w-32"
                                value={searchQuery}
                                onChange={(e) => handleSearch(e.target.value)}
                            />
                            <button 
                                onClick={() => {
                                    setShowSearch(false);
                                    setSearchQuery('');
                                }}
                                className="text-gray-400 hover:text-gray-600"
                            >
                                <FaTimes className="w-4 h-4" />
                            </button>
                        </div>
                    ) : (
                        <button 
                            className="text-gray-600 hover:text-gray-900"
                            onClick={() => setShowSearch(true)}
                        >
                            <FaSearch className="w-5 h-5" />
                        </button>
                    )}
                    <div className="relative">
                        <button 
                            className="text-gray-600 hover:text-gray-900"
                            onClick={() => setShowPlusMenu(!showPlusMenu)}
                        >
                            <FaPlus className="w-5 h-5" />
                        </button>
                        {showPlusMenu && renderPlusMenu()}
                    </div>
                    <div className="relative">
                        <button 
                            className="text-gray-600 hover:text-gray-900"
                            onClick={() => setShowThreeDotMenu(!showThreeDotMenu)}
                        >
                            <FaEllipsisH className="w-5 h-5" />
                        </button>
                        {showThreeDotMenu && renderThreeDotMenu()}
                    </div>
                </div>
            </div>

            {/* Tab Menu */}
            <div className="border-b border-gray-200">
                <div className="flex space-x-8 px-4">
                    {tabs.map(tab => {
                        const Icon = tab.icon;
                        return (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id as TabType)}
                                className={`flex items-center space-x-2 py-3 border-b-2 ${
                                    activeTab === tab.id
                                        ? 'border-blue-600 text-blue-600'
                                        : 'border-transparent text-gray-500 hover:text-gray-700'
                                }`}
                            >
                                <Icon className="w-4 h-4" />
                                <span className="text-sm font-medium">{tab.label}</span>
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-4">
                {renderContent()}
            </div>

            {/* Modals */}
            <div className="fixed inset-0 flex items-center justify-center z-[100] pointer-events-none">
                {(showCreateGroup || showCreateChannel) && (
                    <div className="absolute inset-0 bg-black bg-opacity-50 pointer-events-auto" />
                )}
                {showCreateGroup && (
                    <div className="pointer-events-auto w-full max-w-md mx-4 relative">
                        <CreateGroup
                            onClose={() => setShowCreateGroup(false)}
                        />
                    </div>
                )}
                {showCreateChannel && (
                    <div className="pointer-events-auto w-full max-w-md mx-4 relative">
                        <CreateChannel
                            onClose={() => setShowCreateChannel(false)}
                        />
                    </div>
                )}
            </div>
        </div>
    );
};

export default Community; 