import { useState } from "react";
import { Link } from "react-router-dom";

const Forgot = () => {
  const [email, setEmail] = useState("");
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-2 py-4">
      <div className="bg-white mx-auto rounded-2xl shadow-lg max-w-md w-full p-4 sm:p-6 md:p-8 lg:p-10">
        <h1 className="text-2xl font-semibold text-gray-900 text-center mb-4">Forgot Password</h1>
        <p className="text-center text-gray-600 mb-6 text-base">Enter your email address to reset your password.</p>
        <form className="space-y-6" action="#" method="POST" noValidate>
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <input
              type="email"
              id="email"
              name="email"
              autoComplete="email"
              required
              placeholder="Email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="appearance-none block w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600 sm:text-sm transition"
            />
          </div>
          <button
            type="submit"
            className="w-full flex items-center justify-center bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-blue-600 transition"
          >
            Send Reset Link
          </button>
        </form>
        <p className="text-center text-gray-500 text-sm mt-8">
          Remember your password?{' '}
          <Link to="/login" className="text-blue-600 hover:underline font-medium">Sign in</Link>
        </p>
      </div>
    </div>
  );
};

export default Forgot; 