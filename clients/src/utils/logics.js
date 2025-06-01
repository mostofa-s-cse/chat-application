export const isSameSenderMargin = (messages, m, i, userId) => {
  if (
    i < messages.length - 1 &&
    messages[i + 1].sender.id === m.sender.id &&
    messages[i].sender.id !== userId
  )
    return 33;
  else if (
    (i < messages.length - 1 &&
      messages[i + 1].sender.id !== m.sender.id &&
      messages[i].sender.id !== userId) ||
    (i === messages.length - 1 && messages[i].sender.id !== userId)
  )
    return 0;
  else return 'auto';
};
export function timeSince(date) {
  var seconds = Math.floor((new Date() - date) / 1000);

  var interval = seconds / 31536000;

  if (interval > 1) {
    return Math.floor(interval) + ' year ago';
  }
  interval = seconds / 2592000;
  if (interval > 1) {
    return Math.floor(interval) + ' month ago';
  }
  interval = seconds / 86400;
  if (interval > 1) {
    return Math.floor(interval) + ' day ago';
  }
  interval = seconds / 3600;
  if (interval > 1) {
    return Math.floor(interval) + ' hour ago';
  }
  interval = seconds / 60;
  if (interval > 1) {
    return Math.floor(interval) + ' minute ago';
  }
  return Math.floor(seconds) + ' seconda ago';
}
export const isSameSender = (messages, m, i, userId) => {
  return (
    i < messages.length - 1 &&
    (messages[i + 1].sender.id !== m.sender.id ||
      messages[i + 1].sender.id === undefined) &&
    messages[i].sender.id !== userId
  );
};
export const isLastMessage = (messages, i, userId) => {
  return (
    i === messages.length - 1 &&
    messages[messages.length - 1].sender.id !== userId &&
    messages[messages.length - 1].sender.id
  );
};
export const isSameUser = (messages, m, i) => {
  return i > 0 && messages[i - 1].sender.id === m.sender.id;
};
export const getSender = (activeUser, users) => {
  return activeUser.id === users[0].id ? users[1].firstName : users[0].firstName;
};
export const getChatName = (activeChat, activeUser) => {
  return activeChat?.isGroup
    ? activeChat?.chatName
    : activeChat?.users[0]?.id === activeUser.id
    ? activeChat?.users[1]?.firstName
    : activeChat?.users[0]?.firstName;
};
export const getChatPhoto = (activeChat, activeUser) => {
  return activeChat?.isGroup
    ? activeChat.photo
    : activeChat?.users[0]?.id === activeUser?.id
    ? activeChat?.users[1]?.profilePic
    : activeChat?.users[0]?.profilePic;
};
