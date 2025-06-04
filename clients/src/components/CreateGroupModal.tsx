import React from 'react';

const CreateGroupModal = ({ onClose }: { onClose: () => void }) => {
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
        <button type="submit" className="mt-4 bg-blue-600 text-white rounded-lg px-4 py-2 font-semibold">Create</button>
      </form>
    </div>
  );
};

export default CreateGroupModal; 