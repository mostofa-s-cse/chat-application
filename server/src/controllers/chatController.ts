import { Request, Response } from 'express';
import { createChat as createChatService, createMessage, fetchMessages, getChats as getChatsService, getChat as getChatService } from '../services/chatService';


export const getChats = async (req: Request, res: Response) => {
  const { userId } = req.body;
  try {
    const chats = await getChatsService(userId);
    res.status(200).json(chats);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch chats' });
  }
};

export const getChat = async (req: Request, res: Response) => {
  const { chatId } = req.params;
  try {
    const chat = await getChatService(chatId);
    res.status(200).json(chat);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch chat' });
  }
};

export const createChat = async (req: Request, res: Response) => {
  const { participantId } = req.body;
  try {
    const chat = await createChatService(participantId);
    res.status(201).json(chat);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create chat' });
  }
};

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