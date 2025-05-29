import express from 'express';
import { logCall, getCallHistory } from '../../controllers/callController';

const router = express.Router();

router.post('/log', logCall);
router.get('/history/:userId', getCallHistory);

export default router; 