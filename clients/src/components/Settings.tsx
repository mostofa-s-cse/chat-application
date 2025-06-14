import React from 'react';
import { FaChevronLeft, FaBell, FaLock, FaPalette, FaLanguage, FaMoon, FaVolumeUp, FaUserShield } from 'react-icons/fa';

interface SettingsProps {
    onBack: () => void;
}

const Settings: React.FC<SettingsProps> = ({ onBack }) => {
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
                <h2 className="text-lg font-semibold text-gray-900">Settings</h2>
            </div>

            {/* Settings List */}
            <div className="flex-1 overflow-y-auto">
                {/* Notifications */}
                <div className="px-4 py-3 border-b border-gray-100">
                    <h3 className="text-sm font-medium text-gray-500 mb-3">NOTIFICATIONS</h3>
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                                <FaBell className="text-gray-400 w-5 h-5" />
                                <span className="text-gray-900">Push Notifications</span>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input type="checkbox" className="sr-only peer" defaultChecked />
                                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                            </label>
                        </div>
                        <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                                <FaVolumeUp className="text-gray-400 w-5 h-5" />
                                <span className="text-gray-900">Sound</span>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input type="checkbox" className="sr-only peer" defaultChecked />
                                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                            </label>
                        </div>
                    </div>
                </div>

                {/* Privacy */}
                <div className="px-4 py-3 border-b border-gray-100">
                    <h3 className="text-sm font-medium text-gray-500 mb-3">PRIVACY</h3>
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                                <FaLock className="text-gray-400 w-5 h-5" />
                                <span className="text-gray-900">Blocked Contacts</span>
                            </div>
                            <span className="text-gray-400">0</span>
                        </div>
                        <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                                <FaUserShield className="text-gray-400 w-5 h-5" />
                                <span className="text-gray-900">Two-Step Verification</span>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input type="checkbox" className="sr-only peer" />
                                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                            </label>
                        </div>
                    </div>
                </div>

                {/* Appearance */}
                <div className="px-4 py-3 border-b border-gray-100">
                    <h3 className="text-sm font-medium text-gray-500 mb-3">APPEARANCE</h3>
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                                <FaPalette className="text-gray-400 w-5 h-5" />
                                <span className="text-gray-900">Theme</span>
                            </div>
                            <select className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 p-2">
                                <option>Light</option>
                                <option>Dark</option>
                                <option>System</option>
                            </select>
                        </div>
                        <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                                <FaLanguage className="text-gray-400 w-5 h-5" />
                                <span className="text-gray-900">Language</span>
                            </div>
                            <select className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 p-2">
                                <option>English</option>
                                <option>Spanish</option>
                                <option>French</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* About */}
                <div className="px-4 py-3">
                    <h3 className="text-sm font-medium text-gray-500 mb-3">ABOUT</h3>
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <span className="text-gray-900">Version</span>
                            <span className="text-gray-400">1.0.0</span>
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="text-gray-900">Terms of Service</span>
                            <span className="text-blue-600">→</span>
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="text-gray-900">Privacy Policy</span>
                            <span className="text-blue-600">→</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Settings; 