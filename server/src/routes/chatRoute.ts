import express from 'express';
import { Auth } from '../middleware/auth.ts';
import { accessChats, addToGroup, createGroup, fetchAllChats, removeFromGroup, renameGroup, getChatsForSidebar, getChatById } from '../controllers/chatController.ts';


const chatRouter = express.Router();

chatRouter.post('/', Auth, accessChats);
chatRouter.get('/', Auth, fetchAllChats);
chatRouter.get('/sidebar', Auth, getChatsForSidebar); // New route for sidebar
chatRouter.get('/:chatId', Auth, (req, res, next) => {
  console.log('Chat route hit with params:', req.params);
  next();
}, getChatById); // Get specific chat by ID
chatRouter.post('/group', Auth, createGroup);
chatRouter.patch('/group/rename', Auth, renameGroup);
chatRouter.patch('/groupAdd', Auth, addToGroup);
chatRouter.patch('/groupRemove', Auth, removeFromGroup);

export default chatRouter; 