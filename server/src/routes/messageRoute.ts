import express from 'express';
import { sendMessage, getMessages } from '../controllers/messageController.ts';
import { Auth } from '../middleware/auth.ts';

const messageRouter = express.Router();

messageRouter.post('/', Auth, sendMessage);
messageRouter.get('/:chatId', Auth, getMessages);

export default messageRouter; 