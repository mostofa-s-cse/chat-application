import express from 'express';
import authRoutes from './auth';
import roleRoutes from './roles';
import permissionRoutes from './permissions';
import emailRoutes from './email';
import userRoutes from './users';
import chatRoutes from './chatRoutes';
import groupRoutes from './groupRoutes';
import callRoutes from './callRoutes';
import fileRoutes from './fileRoutes';

const router = express.Router();

// Auth and User Management Routes
router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/roles', roleRoutes);
router.use('/permissions', permissionRoutes);
router.use('/queue-jobs', emailRoutes);

// Chat and Communication Routes
router.use('/chat', chatRoutes);
router.use('/group', groupRoutes);
router.use('/call', callRoutes);
router.use('/file', fileRoutes);

export default router; 