import express from 'express';
import { register, login, getMe, updateMe, logout } from '../controllers/userController';
import { protect } from '../middleware/auth';

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.get('/me', protect, getMe);
router.patch('/me', protect, updateMe);
router.post('/logout', protect, logout);

export default router; 