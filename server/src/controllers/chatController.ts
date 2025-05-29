import { Request, Response } from 'express';
import { createMessage, fetchMessages } from '../services/chatService';

export const sendMessage = async (req: Request, res: Response) => {
  const { content, senderId, receiverId } = req.body;
  try {
    const message = await createMessage(content, senderId, receiverId);
    res.status(201).json(message);
  } catch (error) {
    res.status(500).json({ error: 'Failed to send message' });
  }
};

export const getMessages = async (req: Request, res: Response) => {
  const { senderId, receiverId } = req.query;
  try {
    const messages = await fetchMessages(senderId as string, receiverId as string);
    res.status(200).json(messages);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch messages' });
  }
}; 