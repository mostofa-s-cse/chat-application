import express from 'express';
import { Auth } from '../middleware/auth.ts';
import { accessChats, addToGroup, createGroup, fetchAllChats, removeFromGroup, renameGroup } from '../controllers/chatController.ts';


const chatRouter = express.Router();

chatRouter.post('/', Auth, accessChats);
chatRouter.get('/', Auth, fetchAllChats);
chatRouter.post('/group', Auth, createGroup);
chatRouter.patch('/group/rename', Auth, renameGroup);
chatRouter.patch('/groupAdd', Auth, addToGroup);
chatRouter.patch('/groupRemove', Auth, removeFromGroup);

export default chatRouter; 