import express from 'express';
import {
  createGroup,
  getGroups,
  getGroup,
  updateGroup,
  addGroupMember,
  removeGroupMember,
} from '../controllers/groupController';
import { protect } from '../middleware/auth';

const router = express.Router();

router.use(protect);

router.post('/', createGroup);
router.get('/', getGroups);
router.get('/:groupId', getGroup);
router.patch('/:groupId', updateGroup);
router.post('/:groupId/members', addGroupMember);
router.delete('/:groupId/members', removeGroupMember);

export default router; 