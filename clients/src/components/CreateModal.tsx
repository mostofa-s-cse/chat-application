import { useState } from 'react';
import { FaUsers, FaCommentAlt, FaChevronRight, FaSearch, FaSpinner } from 'react-icons/fa';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../store';
import { accessChat } from '../store/slices/chatSlice';
import { useUserSearch } from '../hooks/useUserSearch';
import CreateGroupModal from './CreateGroupModal';
import CreateCommunityModal from './CreateCommunityModal';

interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  profilePic: string;
  bio: string;
}

const CreateModal = ({ onClose }: { onClose: () => void }) => {
  const dispatch = useDispatch();
  const { user: currentUser } = useSelector((state: RootState) => state.auth);
  const [openModal, setOpenModal] = useState<'group' | 'community' | null>(null);
  const [selectedUsers, setSelectedUsers] = useState<User[]>([]);
  
  // Use the custom search hook
  const { searchQuery, setSearchQuery, searchResults, isSearching, searchError } = useUserSearch();
  
  // Filter out current user from search results
  const filteredSearchResults = searchResults.filter(user => user.id !== currentUser?.id);

  const toggleUserSelection = (user: User) => {
    setSelectedUsers(prev => 
      prev.some(selected => selected.id === user.id)
        ? prev.filter(selected => selected.id !== user.id)
        : [...prev, user]
    );
  };

  const handleStartChat = async (selectedUser: User) => {
    try {
      await dispatch(accessChat(selectedUser.id) as any);
      onClose();
    } catch (error) {
      console.error('Error starting chat:', error);
    }
  };

  const handleStartGroupChat = () => {
    if (selectedUsers.length === 0) {
      alert('Please select at least one user to create a group chat.');
      return;
    }
    setOpenModal('group');
  };

  const getDisplayName = (user: User) => {
    return `${user.firstName} ${user.lastName}`;
  };

  if (openModal === 'group') {
    return <CreateGroupModal onClose={() => setOpenModal(null)} selectedUsers={selectedUsers} />;
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
          <div className="relative">
            <input
              aria-label="Search users"
              className="ml-1 w-[calc(100%-2rem)] bg-gray-50 text-black text-base font-normal outline-none border-none pr-8"
              id="to"
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search users by name or email..."
            />
            {isSearching && (
              <FaSpinner className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 animate-spin" />
            )}
          </div>
        </div>
      </div>

      {/* Selected Users */}
      {selectedUsers.length > 0 && (
        <div className="px-4 py-3 border-b border-gray-200">
          <p className="text-gray-600 font-semibold text-sm mb-2">
            Selected ({selectedUsers.length}):
          </p>
          <div className="flex flex-wrap gap-2">
            {selectedUsers.map((user) => (
              <div
                key={user.id}
                className="flex items-center gap-2 bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm"
              >
                <img
                  src={user.profilePic}
                  alt={getDisplayName(user)}
                  className="w-5 h-5 rounded-full object-cover"
                />
                <span>{getDisplayName(user)}</span>
                <button
                  onClick={() => toggleUserSelection(user)}
                  className="text-blue-600 hover:text-blue-800 text-xs font-bold"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="max-h-[60vh] overflow-y-auto">
        {searchQuery === '' && (
          <>
            <div className="divide-y divide-gray-200">
              <button 
                className="flex items-center gap-4 px-4 py-4 w-full text-black font-semibold text-base disabled:opacity-50 disabled:cursor-not-allowed" 
                type="button" 
                onClick={handleStartGroupChat}
                disabled={selectedUsers.length === 0}
              >
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
            
            {selectedUsers.length === 0 && (
              <div className="px-4 pt-4 pb-2">
                <p className="text-gray-600 font-semibold text-base">
                  Start typing to search for users
                </p>
              </div>
            )}
          </>
        )}
        
        {/* Search Results */}
        {searchQuery !== '' && (
          <div className="px-4 pt-4 pb-2">
            <p className="text-gray-600 font-semibold text-base">
              {isSearching ? 'Searching...' : `Search Results (${filteredSearchResults.length})`}
            </p>
          </div>
        )}

        {/* Error Message */}
        {searchError && (
          <div className="px-4 py-3">
            <p className="text-red-600 text-sm">{searchError}</p>
          </div>
        )}
        
        <ul>
          {filteredSearchResults.length > 0 ? (
            filteredSearchResults.map((user, idx) => (
              <li
                key={user.id}
                className={`flex items-center gap-4 px-4 py-3 cursor-pointer border-t border-gray-200 transition-colors duration-200
                  ${selectedUsers.some(selected => selected.id === user.id) ? 'bg-blue-50' : 'hover:bg-gray-50'}
                  ${idx === filteredSearchResults.length - 1 ? ' rounded-b-3xl' : ''}`}
              >
                <img
                  alt={getDisplayName(user)}
                  className="w-12 h-12 rounded-full object-cover"
                  height="48"
                  src={user.profilePic}
                  width="48"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className={`font-semibold text-base truncate ${
                      selectedUsers.some(selected => selected.id === user.id) ? 'text-blue-600' : 'text-black'
                    }`}>
                      {getDisplayName(user)}
                    </span>
                    {selectedUsers.some(selected => selected.id === user.id) && (
                      <button
                        onClick={() => toggleUserSelection(user)}
                        className="text-blue-600 hover:text-blue-800 text-sm font-bold"
                      >
                        Remove
                      </button>
                    )}
                  </div>
                  <p className="text-gray-500 text-sm truncate">{user.email}</p>
                  {user.bio && user.bio !== 'Available' && (
                    <p className="text-gray-400 text-xs truncate">{user.bio}</p>
                  )}
                </div>
                
                {!selectedUsers.some(selected => selected.id === user.id) && (
                  <div className="flex gap-2">
                    <button
                      onClick={() => toggleUserSelection(user)}
                      className="px-3 py-1 bg-blue-600 text-white text-xs rounded-full hover:bg-blue-700 transition-colors"
                    >
                      Select
                    </button>
                    <button
                      onClick={() => handleStartChat(user)}
                      className="px-3 py-1 bg-green-600 text-white text-xs rounded-full hover:bg-green-700 transition-colors"
                    >
                      Chat
                    </button>
                  </div>
                )}
              </li>
            ))
          ) : searchQuery !== '' && !isSearching ? (
            <li className="px-4 py-6 text-center text-gray-400">
              No users found matching "{searchQuery}"
            </li>
          ) : null}
        </ul>
      </div>
    </div>
  );
};

export default CreateModal;