import express from 'express';
import { updateUserStatus, getUserStatus } from '../../controllers/userController';

const router = express.Router();

router.post('/status', updateUserStatus);
router.get('/status/:userId', getUserStatus);

export default router; 