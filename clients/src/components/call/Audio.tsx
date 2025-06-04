import { FaMicrophone, FaVolumeUp, FaPhoneSlash } from 'react-icons/fa';

const Audio = () => {
  return (
    <div className="bg-white rounded-3xl shadow-[0_0_15px_0_rgba(0,0,0,0.1)] w-[320px] h-[480px] max-w-sm p-8 flex flex-col items-center">
   <div className="rounded-full border-4 border-[#2a6de0] shadow-[0_0_15px_0_rgba(42,109,224,0.5)] overflow-hidden w-32 h-32 mb-6">
    <img alt="Man with headphones on video call at desk with computer screen showing video call" className="w-full h-full object-cover" height="128" src="https://storage.googleapis.com/a1aa/image/bd02dde6-a1b0-44ec-7da7-6b87a884831a.jpg" width="128"/>
   </div>
   <h2 className="font-semibold text-xl text-[#111827] mb-1">
    Olivia Nguyen
   </h2>
   <p className="text-gray-500 mb-10">
    Calling...
   </p>
   <div className="flex space-x-6">
    <button aria-label="Mute microphone" className="bg-white shadow-[0_0_15px_0_rgba(0,0,0,0.05)] w-14 h-14 rounded-full flex items-center justify-center text-gray-600 hover:text-gray-800 transition">
     <FaMicrophone className="text-lg" />
    </button>
    <button aria-label="Speaker on" className="bg-white shadow-[0_0_15px_0_rgba(0,0,0,0.05)] w-14 h-14 rounded-full flex items-center justify-center text-gray-600 hover:text-gray-800 transition">
     <FaVolumeUp className="text-lg" />
    </button>
    <button aria-label="End call" className="bg-[#ef4444] w-14 h-14 rounded-full flex items-center justify-center text-white shadow-[0_0_15px_0_rgba(239,68,68,0.5)] hover:bg-[#dc2626] transition">
     <FaPhoneSlash className="text-lg" />
    </button>
   </div></div>
  )
}

export default Audio