import express from 'express';
import { sendMessage, getMessages, createChat } from '../../controllers/chatController';

const router = express.Router();

router.post('/send', sendMessage);
router.get('/messages', getMessages);
router.post('/create', createChat);

export default router; 