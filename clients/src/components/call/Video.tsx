import { FaMicrophone, FaVideo, FaPhoneSlash } from 'react-icons/fa';

const Video = () => {
  return (
    <div className="w-[320px] h-[480px] bg-white rounded-[20px] flex flex-col overflow-hidden shadow-lg">
      <div className="relative flex-1">
        <img 
          alt="Smiling woman with gray sweater sitting in a living room with blurred background including framed photos and red pillow" 
          className="w-full h-full object-cover rounded-t-[20px]" 
          height={400} 
          src="https://storage.googleapis.com/a1aa/image/470384e4-bdb4-4437-021e-f401ea25f20e.jpg" 
          width={320}
        />
        <div className="absolute bottom-6 left-6 text-white font-bold text-lg drop-shadow-lg">
          Olivia Nguyen
        </div>
        <div className="absolute bottom-6 right-6 w-[80px] h-[100px] rounded-[12px] overflow-hidden border-2 border-white shadow-lg">
          <img 
            alt="Man with headset sitting in front of computer screen showing a video call with multiple people" 
            className="w-full h-full object-cover" 
            height={100} 
            src="https://storage.googleapis.com/a1aa/image/af65c650-b148-45c1-eef9-d0be9afebf5c.jpg" 
            width={80}
          />
        </div>
      </div>
      <div className="flex justify-around items-center bg-white py-5 rounded-b-[20px]">
        <button 
          aria-label="Mute microphone" 
          className="w-14 h-14 bg-gray-100 rounded-full flex items-center justify-center text-gray-700 hover:bg-gray-200 transition"
        >
          <FaMicrophone className="text-lg" />
        </button>
        <button 
          aria-label="Turn off camera" 
          className="w-14 h-14 bg-gray-100 rounded-full flex items-center justify-center text-gray-700 hover:bg-gray-200 transition"
        >
          <FaVideo className="text-lg" />
        </button>
        <button 
          aria-label="End call" 
          className="w-14 h-14 bg-red-500 rounded-full flex items-center justify-center text-white hover:bg-red-600 transition"
        >
          <FaPhoneSlash className="text-lg" />
        </button>
      </div>
    </div>
  );
};

export default Video;