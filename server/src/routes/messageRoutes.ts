import express from 'express';
import { sendMessage, getMessages, deleteMessage } from '../controllers/messageController';
import { protect } from '../middleware/auth';

const router = express.Router();

router.use(protect);

router.post('/', sendMessage);
router.get('/:userId', getMessages);
router.delete('/:messageId', deleteMessage);

export default router; 