import express from 'express';
import {
  register,
  login,
  validUser,
  googleAuth,
  searchUsers,
  updateInfo,
  getUserById,
} from '../controllers/userController.ts';
import { Auth } from '../middleware/auth.ts';

const userRouter = express.Router();

userRouter.post('/auth/register', register);
userRouter.post('/auth/login', login);
userRouter.get('/auth/valid', Auth, validUser);
userRouter.post('/api/google', googleAuth);
userRouter.get('/api/user', Auth, searchUsers);
userRouter.get('/api/users/:id', Auth, getUserById);
userRouter.patch('/api/users/update/:id', Auth, updateInfo);

export default userRouter; 