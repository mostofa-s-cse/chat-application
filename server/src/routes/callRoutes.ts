import express from 'express';
import {
  initiateCall,
  endCall,
  getCallHistory,
} from '../controllers/callController';
import { authenticateToken } from '../middleware/auth';

const router = express.Router();

router.post('/', authenticateToken, initiateCall);
router.patch('/:callId/end', authenticateToken, endCall);
router.get('/history', authenticateToken, getCallHistory);

export default router; 