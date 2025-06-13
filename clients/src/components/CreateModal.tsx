import { useState } from 'react';
import { FaUsers, FaCommentAlt, FaChevronRight } from 'react-icons/fa';
import CreateGroupModal from './CreateGroupModal';
import CreateCommunityModal from './CreateCommunityModal';

const suggestedUsers = [
  {
    name: 'Abir Safiyat',
    avatar: 'https://storage.googleapis.com/a1aa/image/46704056-f844-47a3-9c79-2f175a2dbc41.jpg',
    alt: 'Avatar of Sayrana Safiyat, a woman wearing a brown hijab holding flowers with a sunset background',
  },
  {
    name: 'Sumit Islam',
    avatar: 'https://storage.googleapis.com/a1aa/image/21ec4bef-5d21-4e77-1fbd-ac96b225fc83.jpg',
    alt: 'Avatar of Prapti Islam, a person standing on an airport tarmac near an airplane',
  },
  {
    name: 'Hridoy Ahmed',
    avatar: 'https://storage.googleapis.com/a1aa/image/f58f2943-bad7-4143-9969-3d326782dc14.jpg',
    alt: 'Avatar of Mitanour Akter, a woman wearing a black niqab sitting indoors',
  },
  {
    name: 'Tanbir Mir',
    avatar: 'https://storage.googleapis.com/a1aa/image/f58f2943-bad7-4143-9969-3d326782dc14.jpg',
    alt: 'Avatar of Mitanour Akter, a woman wearing a black niqab sitting indoors',
  },
];

const CreateModal = ({ onClose }: { onClose: () => void }) => {
  const [search, setSearch] = useState('');
  const [openModal, setOpenModal] = useState<'group' | 'community' | null>(null);
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  
  const filteredUsers = search
    ? suggestedUsers.filter(user => user.name.toLowerCase().includes(search.toLowerCase()))
    : suggestedUsers;

  const toggleUserSelection = (userName: string) => {
    setSelectedUsers(prev => 
      prev.includes(userName) 
        ? prev.filter(name => name !== userName)
        : [...prev, userName]
    );
  };

  if (openModal === 'group') {
    return <CreateGroupModal onClose={() => setOpenModal(null)} />;
  }
  if (openModal === 'community') {
    return <CreateCommunityModal onClose={() => setOpenModal(null)} />;
  }

  return (
    <div className="w-full max-w-md rounded-3xl bg-white">
      <header className="flex items-center justify-between px-4 py-3 border-b border-gray-200 rounded-t-3xl">
        <button className="text-blue-600 text-base font-normal" onClick={onClose}>
          Cancel
        </button>
        <h1 className="font-extrabold text-lg">
          New message
        </h1>
        
        <button
          className="top-2 right-0 text-gray-400 hover:text-gray-700 text-2xl font-bold"
          onClick={onClose}
          aria-label="Close modal"
        >
          ×
        </button>
      </header>
      <div className="bg-gray-50">
        <div className="px-4 py-3 border-b">
          <label className="text-gray-500 font-normal text-base" htmlFor="to">
            To:
          </label>
          <input
            aria-label="To"
            className="ml-1 w-[calc(100%-2rem)] bg-gray-50 text-black text-base font-normal outline-none border-none"
            id="to"
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search users..."
          />
        </div>
      </div>
      <div className="max-h-[60vh] overflow-y-auto">
        {search.trim() === '' && (
          <>
            <div className="divide-y divide-gray-200">
              <button className="flex items-center gap-4 px-4 py-4 w-full text-black font-semibold text-base" type="button" onClick={() => setOpenModal('group')}>
                <div className="bg-gray-200 rounded-full w-12 h-12 flex justify-center items-center">
                  <FaUsers className="text-black text-xl" />
                </div>
                Create a new group
                <FaChevronRight className="ml-auto text-gray-400" />
              </button>
              <button className="flex items-center gap-4 px-4 py-4 w-full text-black font-semibold text-base" type="button" onClick={() => setOpenModal('community')}>
                <div className="bg-gray-200 rounded-full w-12 h-12 flex justify-center items-center">
                  <FaCommentAlt className="text-black text-xl" />
                </div>
                Community
                <FaChevronRight className="ml-auto text-gray-400" />
              </button>
            </div>
            <div className="px-4 pt-4 pb-2">
              <p className="text-gray-600 font-semibold text-base">
                Suggested
              </p>
            </div>
          </>
        )}
        
        <ul>
          {filteredUsers.length > 0 ? (
            filteredUsers.map((user, idx) => (
              <li
                key={user.name}
                onClick={() => toggleUserSelection(user.name)}
                className={`flex items-center gap-4 px-4 py-3 cursor-pointer border-t border-gray-200 transition-colors duration-200
                  ${selectedUsers.includes(user.name) ? 'bg-blue-50' : 'hover:bg-gray-50'}
                  ${idx === filteredUsers.length - 1 ? ' rounded-b-3xl' : ''}`}
              >
                <img
                  alt={user.alt}
                  className="w-12 h-12 rounded-full object-cover"
                  height="48"
                  src={user.avatar}
                  width="48"
                />
                <span className={`font-semibold text-base ${selectedUsers.includes(user.name) ? 'text-blue-600' : 'text-black'}`}>
                  {user.name}
                </span>
              </li>
            ))
          ) : (
            <li className="px-4 py-6 text-center text-gray-400">No users found.</li>
          )}
        </ul>
      </div>
    </div>
  );
};

export default CreateModal;