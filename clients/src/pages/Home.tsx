import LeftSidebar from "../components/LeftSidebar"

const Home = () => {
  return (
    <div className="flex">
        <LeftSidebar />
        <div className="min-h-screen flex flex-col w-full items-center justify-center">
    <div className="bg-white shadow-lg rounded-3xl p-10 max-w-md w-full text-center">
      <h1 className="text-3xl font-extrabold text-blue-700 mb-4">Welcome to Chat App</h1>
      <p className="text-gray-600 mb-8">Connect, chat, and collaborate with your friends and communities.</p>
    </div>
  </div>
    </div>
  )
}

export default Home