import express from 'express';
import { sendMessage, getMessages, createChat, getChats, getChat } from '../../controllers/chatController';

const router = express.Router();

router.post('/send', sendMessage);
router.get('/messages', getMessages);
router.post('/create', createChat);
router.get('/', getChats);
router.get('/:chatId', getChat);
export default router; 