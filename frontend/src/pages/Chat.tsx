import { useEffect } from 'react';
import { useChat } from '../hooks/useChat';
import { useAuth } from '../hooks/useAuth';

const Chat = () => {
  const { messages, selectedUser, getMessages, sendMessage } = useChat();
  const { user } = useAuth();

  useEffect(() => {
    if (selectedUser) {
      getMessages(selectedUser.id);
    }
  }, [selectedUser, getMessages]);

  return (
    <div className="flex h-[calc(100vh-8rem)]">
      {/* Sidebar */}
      <div className="w-1/4 bg-white rounded-lg shadow p-4">
        <h2 className="text-xl font-semibold mb-4">Conversations</h2>
        {/* Add conversation list here */}
      </div>

      {/* Chat area */}
      <div className="flex-1 ml-4 bg-white rounded-lg shadow">
        {selectedUser ? (
          <div className="flex flex-col h-full">
            {/* Chat header */}
            <div className="p-4 border-b">
              <h3 className="text-lg font-semibold">{selectedUser.username}</h3>
            </div>

            {/* Messages */}
            <div className="flex-1 p-4 overflow-y-auto">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`mb-4 ${
                    message.senderId === user?.id ? 'text-right' : 'text-left'
                  }`}
                >
                  <div
                    className={`inline-block p-3 rounded-lg ${
                      message.senderId === user?.id
                        ? 'bg-blue-500 text-white'
                        : 'bg-gray-200 text-gray-800'
                    }`}
                  >
                    {message.content}
                  </div>
                </div>
              ))}
            </div>

            {/* Message input */}
            <div className="p-4 border-t">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  const form = e.target as HTMLFormElement;
                  const input = form.elements.namedItem('message') as HTMLInputElement;
                  if (input.value.trim()) {
                    sendMessage({
                      content: input.value,
                      receiverId: selectedUser.id,
                      type: 'text'
                    });
                    input.value = '';
                  }
                }}
                className="flex gap-2"
              >
                <input
                  type="text"
                  name="message"
                  placeholder="Type a message..."
                  className="flex-1 p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                >
                  Send
                </button>
              </form>
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-center h-full text-gray-500">
            Select a conversation to start chatting
          </div>
        )}
      </div>
    </div>
  );
};

export default Chat; 