import React, { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { IoCallOutline, IoNotificationsOffOutline } from "react-icons/io5";
import { BsThreeDotsVertical } from "react-icons/bs";

import { IoIosSearch, IoMdClose, IoMdInformationCircleOutline } from "react-icons/io";
import { renderIcon } from '../../utils/icons';
import { FaPaperPlane, FaUser } from 'react-icons/fa';
const Chat = () => {
  const { chatId } = useParams();
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  // Mock data - replace with actual data from your API/state management
  const chatData = {
    id: chatId,
    name: 'Karen',
    avatar: 'https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=200&q=50',
    status: 'Online',
    pinnedMessage: 'Today star contest',
    pinnedMessageText: 'Today star contest',
    bio: '25 y.o traveler',
    username: '@karen',
    phone: '+1 38594 38538',
    notifications: true
  };

  const toggleProfileMenu = () => {
    setIsProfileMenuOpen(!isProfileMenuOpen);
  };

  return (
    <>
      {/* center */}
      <div className="relative flex flex-col flex-1">
        <div className="z-20 flex flex-grow-0 flex-shrink-0 w-full pr-3 bg-white border-b">
          <div className="w-12 h-12 mx-4 my-2 bg-blue-500 bg-center bg-no-repeat bg-cover rounded-full cursor-pointer" 
               style={{backgroundImage: `url(${chatData.avatar})`}}>
          </div>
          <div className="flex flex-col justify-center flex-1 overflow-hidden cursor-pointer">
            <div className="overflow-hidden text-base font-medium leading-tight text-gray-600 whitespace-no-wrap">
              {chatData.name}
            </div>
            <div className="overflow-hidden text-sm font-medium leading-tight text-gray-600 whitespace-no-wrap">
              {chatData.status}
            </div>
          </div>
          <div className="relative hidden w-48 pl-2 my-3 border-l-2 border-blue-500 cursor-pointer lg:block">
            <div className="text-base font-medium text-blue-500">Pinned message</div>
            <div className="text-sm font-normal text-gray-800">{chatData.pinnedMessageText}</div>
          </div>
          <button className="flex self-center p-2 ml-2 text-gray-500 rounded-full focus:outline-none hover:text-gray-600 hover:bg-gray-300">
            {renderIcon(IoNotificationsOffOutline, 'w-6 h-6')}
          </button>
          <button className="flex self-center p-2 ml-2 text-gray-500 rounded-full focus:outline-none hover:text-gray-600 hover:bg-gray-300">
            {renderIcon(IoIosSearch,'w-6 h-6')}
          </button>
          <button 
            type="button" 
            onClick={toggleProfileMenu}
            className="flex self-center hidden p-2 ml-2 text-gray-500 rounded-full md:block focus:outline-none hover:text-gray-600 hover:bg-gray-300"
          >
            {renderIcon(BsThreeDotsVertical,'w-5 h-5')}
          </button>
        </div>
        <div className="top-0 bottom-0 left-0 right-0 flex flex-col flex-1 overflow-hidden bg-transparent bg-bottom bg-cover">
          <div className="self-center flex-1 w-full max-w-xl">
            <div className="relative flex flex-col px-3 py-1 m-auto">
              <div className="self-center px-2 py-1 mx-0 my-1 text-sm text-white text-gray-700 bg-white border border-gray-200 rounded-full shadow rounded-tg">Channel was created</div>
              <div className="self-center px-2 py-1 mx-0 my-1 text-sm text-white text-gray-700 bg-white border border-gray-200 rounded-full shadow rounded-tg">May 6</div>
              <div className="self-start w-3/4 my-2">
                <div className="p-4 text-sm bg-white rounded-t-lg rounded-r-lg shadow">
                  Don't forget to check on all responsive sizes.
                </div>
              </div>
              <div className="self-end w-3/4 my-2">
                <div className="p-4 text-sm bg-white rounded-t-lg rounded-l-lg shadow">
                  Use the buttons above the editor to test on them
                </div>
              </div>
            </div>
          </div>
          <div className="relative flex items-center self-center w-full max-w-xl p-4 overflow-hidden text-gray-600 focus-within:text-gray-400">
            <div className="w-full">
              <span className="absolute inset-y-0 left-0 flex items-center pl-6">
                <button type="submit" className="p-1 focus:outline-none focus:shadow-none">
                  {renderIcon(IoIosSearch,'w-5 h-5')}
                </button>
              </span>
              <span className="absolute inset-y-0 right-0 flex items-center pr-6">
                <button type="submit" className="p-1 focus:outline-none focus:shadow-none hover:text-blue-500">
                  {renderIcon(FaPaperPlane,'w-4 h-4')}
                </button>
              </span>
              <input type="search" className="w-full py-2 pl-10 text-sm bg-white border border-transparent appearance-none rounded-tg placeholder-gray-800 focus:bg-white focus:outline-none focus:border-blue-500 focus:text-gray-900 focus:shadow-outline-blue" style={{borderRadius: 25}} placeholder="Message..." autoComplete="off" />
            </div>
          </div>
        </div>
      </div>
      {/* right */}

      {
        isProfileMenuOpen && (
          <nav className={`right-0 flex flex-col hidden pb-2 bg-white border-l border-gray-300 xl:block ${isProfileMenuOpen ? 'block' : 'hidden'}`} style={{width: '24rem'}}>
        <div className="flex items-center justify-between w-full p-3">
          <button className="p-2 text-gray-500 rounded-full focus:outline-none hover:text-gray-600 hover:bg-gray-200"
          onClick={toggleProfileMenu}
          >
            {renderIcon(IoMdClose,'w-6 h-6')}
          </button>
          <div className="ml-4 mr-auto text-lg font-medium">Info</div>
          
          <div className="relative">
            <button 
              type="button" 
              onClick={() => setIsSettingsOpen(!isSettingsOpen)}
              className="p-2 ml-1 text-gray-500 rounded-full focus:outline-none hover:text-gray-600 hover:bg-gray-200"
            >
              {isSettingsOpen ? renderIcon(IoMdClose,'w-5 h-5') : renderIcon(BsThreeDotsVertical,'w-5 h-5') }
            </button>
            {isSettingsOpen && (
              <div className="absolute right-0 z-10 w-48 mt-2 bg-white rounded-md shadow-lg">
                <div className="py-1">
                  <Link to="/profile"
                    className="block w-full px-4 py-2 text-sm text-left text-gray-700 hover:bg-gray-100"
                  >
                    Profile
                  </Link>
                  <Link to="/settings"
                    className="block w-full px-4 py-2 text-sm text-left text-gray-700 hover:bg-gray-100"
                  >
                    Settings
                  </Link>
                  <Link to="#" onClick={toggleProfileMenu}
                    className="block w-full px-4 py-2 text-sm text-left text-gray-700 hover:bg-gray-100"
                  >
                    Close
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>
        <div>
          <div className="flex justify-center mb-4">
            <button type="button" className="content-center block w-32 h-32 p-1 overflow-hidden text-center rounded-full focus:outline-none">
              <img className="content-center object-cover w-full h-full border-2 border-gray-200 rounded-full" src={chatData.avatar} alt={chatData.name} />
            </button>
          </div>
          <p className="text-lg font-semibold text-center text-gray-800">{chatData.name}</p>
          <p className="text-sm font-medium text-center text-blue-500">{chatData.status}</p>
        </div>
        <div className="flex items-center w-full px-3 mt-6">
          <div className="px-2 text-gray-500 rounded-full hover:text-gray-600">
            {renderIcon(IoMdInformationCircleOutline,'w-6 h-6')}
          </div>
          <div className="ml-4">
            <div className="mr-auto text-sm font-semibold text-gray-800">{chatData.bio}</div>
            <div className="mt-1 mr-auto text-sm font-semibold leading-none text-gray-600">Bio</div>
          </div>
        </div>
        <div>
          <div className="flex items-center w-full px-3 mt-4">
            <div className="px-2 text-gray-500 rounded-full hover:text-gray-600">
            {renderIcon(FaUser,'w-5 h-5')}
            </div>
            <div>
              <div className="ml-4 mr-auto text-sm font-semibold text-gray-800">{chatData.username}</div>
              <div className="mt-1 ml-4 mr-auto text-sm font-semibold leading-none text-gray-600">Username</div>
            </div>
          </div>
        </div>
        <div>
          <div className="flex items-center w-full px-3 mt-4">
            <div className="px-2 text-gray-500 rounded-full hover:text-gray-600">
              {renderIcon(IoCallOutline,'w-5 h-5')}
            </div>
            <div className="ml-4">
              <div className="mr-auto text-sm font-semibold text-gray-800">{chatData.phone}</div>
              <div className="mt-1 mr-auto text-sm font-semibold leading-none text-gray-600">Phone</div>
            </div>
          </div>
        </div>
        <div>
          <div className="flex items-center w-full px-3 mt-4 mb-2">
            <div className="px-2 text-gray-500 cursor-pointer">
              <input type="checkbox" className="form-checkbox h-5 w-5 text-blue-600" />
            </div>
            <div className="ml-4">
              <div className="mr-auto text-sm font-semibold text-gray-800">Notification</div>
              <div className="mt-1 mr-auto text-sm font-semibold leading-none text-gray-600">{chatData.notifications ? 'Enabled' : 'Disabled'}</div>
            </div>
          </div>
        </div>
        <ul className="flex flex-row items-center justify-around px-3 mb-1 list-none border-b select-none">
          <li className="flex-auto px-4 mx-1 -mb-px text-center rounded-t-lg cursor-pointer last:mr-0 hover:bg-gray-200">
            <Link to="/chat/media" className="block py-3 text-xs font-bold leading-normal text-blue-500 uppercase border-b-4 border-blue-500">
              Media
            </Link>
          </li>
          <li className="flex-auto px-4 mx-1 -mb-px text-center rounded-t-lg cursor-pointer last:mr-0 hover:bg-gray-200">
            <Link to="/chat/docs" className="block py-3 text-xs font-bold leading-normal uppercase border-b-4 border-transparent">
              Docs
            </Link>
          </li>
          <li className="flex-auto px-4 mx-1 -mb-px text-center rounded-t-lg cursor-pointer last:mr-0 hover:bg-gray-200">
            <Link to="/chat/links" className="block py-3 text-xs font-bold leading-normal uppercase border-b-4 border-transparent">
              Links
            </Link>
          </li>
          <li className="flex-auto px-4 mx-1 -mb-px text-center rounded-t-lg cursor-pointer last:mr-0 hover:bg-gray-200">
            <Link to="/chat/audio" className="block py-3 text-xs font-bold leading-normal uppercase border-b-4 border-transparent">
              Audio
            </Link>
          </li>
        </ul>
      </nav>
        )
      }
      
    </>
  )
}

export default Chat