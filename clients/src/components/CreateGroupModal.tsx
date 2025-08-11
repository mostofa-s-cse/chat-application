import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { createGroupChat } from '../store/slices/chatSlice';

interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  profilePic: string;
  bio: string;
}

interface CreateGroupModalProps {
  onClose: () => void;
  selectedUsers: User[];
}

const CreateGroupModal = ({ onClose, selectedUsers }: CreateGroupModalProps) => {
  const dispatch = useDispatch();
  const [groupName, setGroupName] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!groupName.trim()) {
      alert('Please enter a group name');
      return;
    }

    if (selectedUsers.length === 0) {
      alert('Please select at least one user');
      return;
    }

    setIsCreating(true);
    try {
      const userIds = selectedUsers.map(user => user.id);
      await dispatch(createGroupChat({ chatName: groupName.trim(), users: userIds }) as any);
      onClose();
    } catch (error) {
      console.error('Error creating group chat:', error);
      alert('Failed to create group chat. Please try again.');
    } finally {
      setIsCreating(false);
    }
  };

  const getDisplayName = (user: User) => {
    return `${user.firstName} ${user.lastName}`;
  };

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
      
      <form onSubmit={handleSubmit} className="p-6 flex flex-col gap-4">
        <div>
          <label className="font-semibold text-base text-gray-700">Group Name</label>
          <input 
            className="border rounded-lg px-3 py-2 w-full mt-1" 
            type="text" 
            placeholder="Enter group name"
            value={groupName}
            onChange={(e) => setGroupName(e.target.value)}
            required
          />
        </div>
        
        <div>
          <label className="font-semibold text-base text-gray-700 mb-2 block">
            Selected Users ({selectedUsers.length})
          </label>
          
          {selectedUsers.length > 0 ? (
            <div className="max-h-40 overflow-y-auto border rounded-lg p-3">
              {selectedUsers.map(user => (
                <div key={user.id} className="flex items-center gap-3 py-2 px-2 border-b border-gray-100 last:border-b-0">
                  <img 
                    src={user.profilePic} 
                    alt={getDisplayName(user)} 
                    className="w-8 h-8 rounded-full object-cover" 
                  />
                  <div className="flex-1 min-w-0">
                    <span className="text-base font-medium text-gray-900 block truncate">
                      {getDisplayName(user)}
                    </span>
                    <span className="text-sm text-gray-500 truncate block">
                      {user.email}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-4 text-gray-500">
              No users selected
            </div>
          )}
        </div>
        
        <button 
          type="submit" 
          disabled={isCreating || !groupName.trim() || selectedUsers.length === 0}
          className="mt-4 bg-blue-600 text-white rounded-lg px-4 py-2 font-semibold disabled:bg-blue-400 disabled:cursor-not-allowed hover:bg-blue-700 transition-colors"
        >
          {isCreating ? 'Creating...' : 'Create Group'}
        </button>
      </form>
    </div>
  );
};

export default CreateGroupModal; 