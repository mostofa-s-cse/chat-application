import express from 'express';
import { createGroup, getGroups } from '../../controllers/groupController';

const router = express.Router();

router.post('/create', createGroup);
router.get('/list', getGroups);

export default router; 