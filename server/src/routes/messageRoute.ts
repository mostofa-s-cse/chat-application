import express from 'express';
import { 
  sendMessage, 
  getMessages, 
  updateMessage, 
  deleteMessage, 
  addReaction, 
  removeReaction 
} from '../controllers/messageController.ts';
import { Auth } from '../middleware/auth.ts';

const router = express.Router();

// Protected routes - require authentication
router.use(Auth);

// Send a new message
router.post('/', sendMessage);

// Get messages for a specific chat
router.get('/:chatId', getMessages);

// Update a message
router.put('/:messageId', updateMessage);

// Delete a message (soft delete)
router.delete('/:messageId', deleteMessage);

// Add reaction to a message
router.post('/:messageId/reactions', addReaction);

// Remove reaction from a message
router.delete('/:messageId/reactions/:emoji', removeReaction);

export default router; 