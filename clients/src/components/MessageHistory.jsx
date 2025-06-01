import React from 'react'
import { useSelector } from 'react-redux'
import ScrollableFeed from "react-scrollable-feed"
import { isSameSender, isSameSenderMargin, isSameUser, isLastMessage } from '../utils/logics'
import { Tooltip } from "@chakra-ui/tooltip";
import { Avatar } from "@chakra-ui/avatar";
import "../pages/home.css"

function MessageHistory({ messages }) {
  const activeUser = useSelector((state) => state.activeUser)

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }

  console.log("messages :", messages)

  return (
    <div className="w-full h-full">
      <ScrollableFeed>
        {messages && messages.length > 0 ? (
          messages.map((m, i) => (
            <div className='flex items-start gap-x-[6px] mb-2' key={m.id}>
              {(isSameSender(messages, m, i, activeUser.id) ||
                isLastMessage(messages, i, activeUser.id)) && (
                  <Tooltip label={m.sender?.firstName} placement="bottom-start" hasArrow>
                    {/* <Avatar
                      size="sm"
                      mt="7px"
                      mr={1}
                      cursor="pointer"
                      name={m.sender?.firstName}
                      src={m.sender?.profilePic}
                      borderRadius="full"
                    /> */}
                    <img src={m.sender?.profilePic} alt="avatar" className='w-10 h-10 rounded-full' />
                  </Tooltip>
                )}
              <div className="flex flex-col">
                <span 
                  className='tracking-wider text-[15px] font-medium break-words'
                  style={{
                    backgroundColor: `${m.senderId === activeUser.id ? "#268d61" : "#f0f0f0"}`,
                    marginLeft: isSameSenderMargin(messages, m, i, activeUser.id),
                    marginTop: isSameUser(messages, m, i, activeUser.id) ? 3 : 10,
                    borderRadius: `${m.senderId === activeUser.id ? "10px 10px 0px 10px" : "10px 10px 10px 0"}`,
                    padding: "10px 18px",
                    maxWidth: "460px",
                    color: `${m.senderId === activeUser.id ? "#ffff" : "#848587"}`
                  }}
                >
                  {m.content}
                </span>
                <span 
                  className="text-[11px] text-gray-500 mt-1"
                  style={{
                    marginLeft: isSameSenderMargin(messages, m, i, activeUser.id),
                    alignSelf: m.senderId === activeUser.id ? 'flex-end' : 'flex-start'
                  }}
                >
                  {formatTime(m.createdAt)}
                </span>
              </div>
            </div>
          ))
        ) : (
          <div className="flex justify-center items-center h-full text-gray-500">
            No messages yet
          </div>
        )}
      </ScrollableFeed>
    </div>
  )
}

export default MessageHistory