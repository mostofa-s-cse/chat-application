import { Request, Response } from 'express';
import { logCall as logCallService, fetchCallHistory } from '../services/callService';

export const logCall = async (req: Request, res: Response) => {
  const { callerId, receiverId, duration, type } = req.body;
  try {
    const call = await logCallService(callerId, receiverId, duration, type);
    res.status(201).json(call);
  } catch (error) {
    res.status(500).json({ error: 'Failed to log call' });
  }
};

export const getCallHistory = async (req: Request, res: Response) => {
  const { userId } = req.params;
  try {
    const calls = await fetchCallHistory(userId);
    res.status(200).json(calls);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch call history' });
  }
}; 