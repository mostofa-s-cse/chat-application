import { useState } from 'react';

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

const CreateGroupModal = ({ onClose }: { onClose: () => void }) => {
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [search, setSearch] = useState('');

  const toggleUser = (name: string) => {
    setSelectedUsers(prev =>
      prev.includes(name) ? prev.filter(u => u !== name) : [...prev, name]
    );
  };

  const filteredUsers = search.trim()
    ? suggestedUsers.filter(user => user.name.toLowerCase().includes(search.toLowerCase()))
    : suggestedUsers;

  return (
    <div className="w-full max-w-md rounded-3xl bg-white">
      <header className="flex items-center justify-between px-4 py-3 border-b border-gray-200 rounded-t-3xl">
        <button className="text-blue-600 text-base font-normal" onClick={onClose}>
          Cancel
        </button>
        <h1 className="font-extrabold text-lg">Create Group</h1>
        <button
          className="top-2 right-0 text-gray-400 hover:text-gray-700 text-2xl font-bold"
          onClick={onClose}
          aria-label="Close modal"
        >
          ×
        </button>
      </header>
      <form className="p-6 flex flex-col gap-4">
        <label className="font-semibold text-base text-gray-700">Group Name</label>
        <input className="border rounded-lg px-3 py-2" type="text" placeholder="Enter group name" />
        <div className="mt-4">
          <label className="font-semibold text-base text-gray-700 mb-2 block">Select Users</label>
          <input
            className="border rounded-lg px-3 py-2 mb-2 w-full"
            type="text"
            placeholder="Search users..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          <ul className="max-h-40 overflow-y-auto divide-y divide-gray-200">
            {filteredUsers.length > 0 ? (
              filteredUsers.map(user => (
                <li 
                  key={user.name} 
                  onClick={() => toggleUser(user.name)}
                  className={`flex items-center gap-3 py-2 px-3 cursor-pointer transition-colors duration-200
                    ${selectedUsers.includes(user.name) ? 'bg-blue-50' : 'hover:bg-gray-50'}`}
                >
                  <img src={user.avatar} alt={user.alt} className="w-8 h-8 rounded-full object-cover" />
                  <span className={`text-base ${selectedUsers.includes(user.name) ? 'text-blue-600 font-semibold' : 'text-black'}`}>
                    {user.name}
                  </span>
                </li>
              ))
            ) : (
              <li className="py-2 text-gray-400 text-center">No users found.</li>
            )}
          </ul>
        </div>
        {selectedUsers.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-2">
            {selectedUsers.map(name => (
              <span key={name} className="bg-blue-100 text-blue-700 px-2 py-1 rounded-full text-sm">{name}</span>
            ))}
          </div>
        )}
        <button type="submit" className="mt-4 bg-blue-600 text-white rounded-lg px-4 py-2 font-semibold">Create</button>
      </form>
    </div>
  );
};

export default CreateGroupModal; 