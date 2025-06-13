import { Link } from 'react-router-dom';

const Welcome = () => (
  <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-50 to-blue-100">
    <div className="bg-white shadow-lg rounded-3xl p-10 max-w-md w-full text-center">
      <h1 className="text-3xl font-extrabold text-blue-700 mb-4">Welcome to Chat App</h1>
      <p className="text-gray-600 mb-8">Connect, chat, and collaborate with your friends and communities.</p>
      <div className="flex flex-col gap-4">
        <Link to="/login" className="w-full bg-blue-600 text-white py-2 rounded-lg font-semibold hover:bg-blue-700 transition">Login</Link>
        <Link to="/register" className="w-full border border-blue-600 text-blue-600 py-2 rounded-lg font-semibold hover:bg-blue-50 transition">Register</Link>
      </div>
    </div>
  </div>
);

export default Welcome; 