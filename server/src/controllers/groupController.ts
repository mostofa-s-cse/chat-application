import { Request, Response } from 'express';
import { createGroup as createGroupService, fetchGroups } from '../services/groupService';

export const createGroup = async (req: Request, res: Response) => {
  const { name, description, creatorId, memberIds } = req.body;
  try {
    const group = await createGroupService(name, description, creatorId, memberIds);
    res.status(201).json(group);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create group' });
  }
};

export const getGroups = async (req: Request, res: Response) => {
  try {
    const groups = await fetchGroups();
    res.status(200).json(groups);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch groups' });
  }
}; 