import { Request, Response } from "express";
import {
  assignUserToChat,
  createGroupConversation,
  createMessage,
  fetchMessages,
} from "../services/chatService";

export const sendMessage = async (req: Request, res: Response) => {
  const { content, senderId, conversationId, messageType, fileUrl } = req.body;
  try {
    const message = await createMessage(
      content,
      senderId,
      conversationId,
      messageType,
      fileUrl
    );
    res.status(201).json(message);
  } catch (error) {
    res.status(500).json({ error: "Failed to send message" });
  }
};

export const getMessages = async (req: Request, res: Response) => {
  const { conversationId } = req.query;
  try {
    const messages = await fetchMessages(Number(conversationId));
    res.status(200).json(messages);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch messages" });
  }
};

export const addUserToChat = async (req: Request, res: Response) => {
  const { userId, conversationId } = req.body;
  try {
    const participant = await assignUserToChat(userId, conversationId);
    res.status(201).json(participant);
  } catch (error) {
    res.status(500).json({ error: "Failed to add user to chat" });
  }
};

export const createGroupChat = async (req: Request, res: Response) => {
  const { name, createdById, participantIds } = req.body;
  try {
    const groupChat = await createGroupConversation(
      name,
      createdById,
      participantIds
    );
    res.status(201).json(groupChat);
  } catch (error) {
    res.status(500).json({ error: "Failed to create group chat" });
  }
};
