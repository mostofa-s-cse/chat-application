import { Request, Response } from 'express';
import prisma from '../utils/prisma.ts';

interface AuthRequest extends Request { 
  rootUserId?: string;
}

export const sendMessage = async (req: AuthRequest, res: Response) => {
  const { chatId, message } = req.body;
  try {
    const msg = await prisma.message.create({
      data: {
        content: message,
        sender: {
          connect: { id: req.rootUserId }
        },
        chat: {
          connect: { id: chatId }
        }
      },
      include: {
        sender: {
          select: {
            firstName: true,
            lastName: true,
            profilePic: true,
            email: true
          }
        },
        chat: {
          select: {
            chatName: true,
            isGroup: true,
            users: {
              select: {
                firstName: true,
                lastName: true,
                email: true,
                profilePic: true
              }
            }
          }
        }
      }
    });

    // Update chat's latest message
    await prisma.chat.update({
      where: { id: chatId },
      data: {
        latestMessage: {
          connect: { id: msg.id }
        }
      }
    });

    res.status(200).send(msg);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error });
  }
};

export const getMessages = async (req: Request, res: Response) => {
  const { chatId } = req.params;
  try {
    const messages = await prisma.message.findMany({
      where: { chatId },
      include: {
        sender: {
          select: {
            firstName: true,
            lastName: true,
            profilePic: true,
            email: true
          }
        },
        chat: true
      },
      orderBy: {
        createdAt: 'asc'  
      }
    });

    res.status(200).json(messages);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error });
  }
}; 