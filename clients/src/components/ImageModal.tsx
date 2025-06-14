import { useState, useEffect } from 'react';
import { FaTimes, FaChevronLeft, FaChevronRight, FaDownload } from 'react-icons/fa';

interface ImageModalProps {
    isOpen: boolean;
    onClose: () => void;
    images: string[];
    initialIndex?: number;
}

const ImageModal = ({ isOpen, onClose, images, initialIndex = 0 }: ImageModalProps) => {
    if (!isOpen) return null;

    const [currentIndex, setCurrentIndex] = useState(initialIndex);
    const [isDownloading, setIsDownloading] = useState(false);

    const handlePrevious = () => {
        setCurrentIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
    };

    const handleNext = () => {
        setCurrentIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
    };

    const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'ArrowLeft') {
            handlePrevious();
        } else if (e.key === 'ArrowRight') {
            handleNext();
        } else if (e.key === 'Escape') {
            onClose();
        }
    };

    const handleDownload = async () => {
        if (isDownloading) return;
        
        try {
            setIsDownloading(true);
            const imageUrl = images[currentIndex];
            
            // Create a temporary image element to get the actual image data
            const img = new Image();
            img.crossOrigin = 'anonymous';  // Enable CORS
            
            await new Promise((resolve, reject) => {
                img.onload = resolve;
                img.onerror = reject;
                img.src = imageUrl;
            });

            // Create a canvas to get the image data
            const canvas = document.createElement('canvas');
            canvas.width = img.width;
            canvas.height = img.height;
            const ctx = canvas.getContext('2d');
            if (!ctx) throw new Error('Could not get canvas context');
            
            ctx.drawImage(img, 0, 0);
            
            // Convert to blob
            const blob = await new Promise<Blob>((resolve) => {
                canvas.toBlob((blob) => {
                    if (blob) resolve(blob);
                }, 'image/jpeg', 0.95);
            });

            // Create download link
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `image-${currentIndex + 1}.jpg`;
            document.body.appendChild(a);
            a.click();
            
            // Cleanup
            setTimeout(() => {
                document.body.removeChild(a);
                URL.revokeObjectURL(url);
            }, 100);
        } catch (error) {
            console.error('Error downloading image:', error);
            alert('Failed to download image. Please try again.');
        } finally {
            setIsDownloading(false);
        }
    };

    useEffect(() => {
        document.addEventListener('keydown', handleKeyDown);
        return () => {
            document.removeEventListener('keydown', handleKeyDown);
        };
    }, []);

    return (
        <div className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center">
            <div className="absolute top-4 right-4 flex items-center space-x-4 z-10">
                <button
                    onClick={handleDownload}
                    className={`text-white hover:text-gray-300 transition-colors ${isDownloading ? 'opacity-50 cursor-not-allowed' : ''}`}
                    title="Download image"
                    disabled={isDownloading}
                >
                    <FaDownload className="w-6 h-6" />
                </button>
                <button
                    onClick={onClose}
                    className="text-white hover:text-gray-300 transition-colors"
                >
                    <FaTimes className="w-6 h-6" />
                </button>
            </div>

            {images.length > 1 && (
                <>
                    <button
                        onClick={handlePrevious}
                        className="absolute left-4 text-white hover:text-gray-300 z-10 transition-colors"
                    >
                        <FaChevronLeft className="w-8 h-8" />
                    </button>
                    <button
                        onClick={handleNext}
                        className="absolute right-4 text-white hover:text-gray-300 z-10 transition-colors"
                    >
                        <FaChevronRight className="w-8 h-8" />
                    </button>
                </>
            )}

            <div className="relative w-full h-full flex items-center justify-center">
                <img
                    src={images[currentIndex]}
                    alt={`Image ${currentIndex + 1}`}
                    className="max-w-full max-h-full object-contain"
                />
                {images.length > 1 && (
                    <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 text-white text-sm">
                        {currentIndex + 1} / {images.length}
                    </div>
                )}
            </div>
        </div>
    );
};

export default ImageModal; 