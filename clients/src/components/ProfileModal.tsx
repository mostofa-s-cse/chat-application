import { FaTimes, FaEdit, FaCamera } from 'react-icons/fa';
import { useState } from 'react';
import ImageModal from './ImageModal';

interface ProfileModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const ProfileModal = ({ isOpen, onClose }: ProfileModalProps) => {
    const [showImageModal, setShowImageModal] = useState(false);
    const [selectedImages, setSelectedImages] = useState<string[]>([]);
    const [selectedImageIndex, setSelectedImageIndex] = useState(0);

    if (!isOpen) return null;

    const handleImageClick = (images: string[], index: number) => {
        setSelectedImages(images);
        setSelectedImageIndex(index);
        setShowImageModal(true);
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-end">
            <div className="w-96 bg-white h-full shadow-xl flex flex-col">
                <div className="p-4 border-b border-gray-200 flex justify-between items-center flex-shrink-0">
                    <h2 className="text-lg font-semibold text-gray-800">Profile</h2>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
                        <FaTimes className="w-5 h-5" />
                    </button>
                </div>
                <div className="flex-1 overflow-y-auto">
                    <div className="p-4 space-y-6">
                        <div className="flex flex-col items-center">
                            <div className="relative">
                                <img 
                                    src="https://storage.googleapis.com/a1aa/image/31130072-5ee0-4273-1569-5e0b5e24910f.jpg" 
                                    alt="Profile" 
                                    className="w-32 h-32 rounded-full object-cover cursor-pointer"
                                    onClick={() => handleImageClick(["https://storage.googleapis.com/a1aa/image/31130072-5ee0-4273-1569-5e0b5e24910f.jpg"], 0)}
                                />
                                <button className="absolute bottom-0 right-0 bg-blue-600 text-white p-2 rounded-full hover:bg-blue-700">
                                    <FaCamera className="w-4 h-4" />
                                </button>
                            </div>
                            <h3 className="mt-4 text-xl font-semibold text-gray-800">Olivia Nguyen</h3>
                            <p className="text-gray-500">@olivia_nguyen</p>
                        </div>

                        <div className="space-y-4">
                            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                <div>
                                    <p className="text-sm text-gray-500">Phone</p>
                                    <p className="text-gray-800">+1 234 567 890</p>
                                </div>
                                <button className="text-blue-600 hover:text-blue-800">
                                    <FaEdit className="w-4 h-4" />
                                </button>
                            </div>

                            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                <div>
                                    <p className="text-sm text-gray-500">Email</p>
                                    <p className="text-gray-800">olivia.nguyen@example.com</p>
                                </div>
                                <button className="text-blue-600 hover:text-blue-800">
                                    <FaEdit className="w-4 h-4" />
                                </button>
                            </div>

                            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                <div>
                                    <p className="text-sm text-gray-500">Location</p>
                                    <p className="text-gray-800">San Francisco, CA</p>
                                </div>
                                <button className="text-blue-600 hover:text-blue-800">
                                    <FaEdit className="w-4 h-4" />
                                </button>
                            </div>
                        </div>

                        <div className="pt-4 border-t border-gray-200">
                            <h4 className="text-sm font-semibold text-gray-700 mb-3">About</h4>
                            <p className="text-gray-600 text-sm">
                                Digital artist and photographer based in San Francisco. Love traveling and capturing moments.
                            </p>
                        </div>

                        <div className="pt-4 border-t border-gray-200">
                            <h4 className="text-sm font-semibold text-gray-700 mb-3">Media Shared</h4>
                            <div className="grid grid-cols-3 gap-2">
                                {[1, 2, 3, 4, 5, 6].map((item) => (
                                    <div 
                                        key={item} 
                                        className="aspect-square bg-gray-100 rounded-lg overflow-hidden cursor-pointer"
                                        onClick={() => handleImageClick([`https://storage.googleapis.com/a1aa/image/${item}.jpg`], 0)}
                                    >
                                        <img 
                                            src={`https://storage.googleapis.com/a1aa/image/${item}.jpg`} 
                                            alt={`Media ${item}`}
                                            className="w-full h-full object-cover"
                                        />
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <ImageModal 
                isOpen={showImageModal} 
                onClose={() => setShowImageModal(false)} 
                images={selectedImages}
                initialIndex={selectedImageIndex}
            />
        </div>
    );
};

export default ProfileModal; 