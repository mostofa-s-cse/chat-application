import { useState } from "react";
import { AiOutlineEye, AiOutlineEyeInvisible, AiOutlineGoogle } from "react-icons/ai";

const Login = () => {
    const [showPassword, setShowPassword] = useState(false);
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-2 py-4">
     <div className="bg-white mx-auto rounded-2xl shadow-lg max-w-md w-full p-4 sm:p-6 md:p-8 lg:p-10 overflow-y-auto">
        <div className="flex justify-center mb-8">
          
        </div>
        <h1 className="text-3xl font-semibold text-gray-900 text-center mb-4">Sign in</h1>
        <p className="text-center text-gray-600 mb-8 text-base">Use your Google Account</p>
        <form className="space-y-6" action="#" method="POST" noValidate>
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
              Email or phone
            </label>
            <input
              type="text"
              id="email"
              name="email"
              autoComplete="email"
              required
              placeholder="Email or phone"
              className="appearance-none block w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600 sm:text-sm transition"
            />
          </div>
          <div className="relative">
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
              Password
            </label>
            <input
              type={showPassword ? "text" : "password"}
              id="password"
              name="password"
              autoComplete="current-password"
              required
              placeholder="Enter your password"
              className="appearance-none block w-full pr-10 px-4 py-3 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600 sm:text-sm transition"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-0 top-1/2 -translate-y-1/8 pr-4 flex items-center text-gray-500 hover:text-gray-700 focus:outline-none"
              aria-label={showPassword ? "Hide password" : "Show password"}
              tabIndex={-1}
            >
              {showPassword ? (
                <AiOutlineEyeInvisible size={22} />
              ) : (
                <AiOutlineEye size={22} />
              )}
            </button>
          </div>
          <div className="flex items-center justify-between">
            <label className="flex items-center text-sm">
              <input
                id="remember"
                name="remember"
                type="checkbox"
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <span className="ml-2 text-gray-700">Remember me</span>
            </label>
            <div className="text-sm">
              <a href="#" className="font-medium text-blue-600 hover:underline">
                Forgot password?
              </a>
            </div>
          </div>
          <button
            type="submit"
            className="w-full flex items-center justify-center bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-blue-600 transition"
          >
            Sign in
          </button>
        </form>
        <div className="mt-8">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="bg-white px-2 text-gray-500">Or</span>
            </div>
          </div>
          <button
            type="button"
            className="mt-6 w-full flex items-center justify-center border border-gray-300 rounded-lg py-3 hover:shadow-md transition-shadow focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-1"
          >
            <AiOutlineGoogle className="w-5 h-5 mr-2"/>
            <span className="text-gray-700 font-medium">Sign in with Google</span>
          </button>
        </div>
        <p className="text-center text-gray-400 text-xs mt-8">© 2024 Google LLC</p>
      </div>
    </div>
  )
}

export default Login    