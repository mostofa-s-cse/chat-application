import { Request, Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';
import { AppError } from '../utils/errorHandler';

const prisma = new PrismaClient();

export const sendMessage = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { content, receiverId, type = 'text', fileUrl } = req.body;
    const senderId = req.user.id;

    const message = await prisma.message.create({
      data: {
        content,
        type,
        fileUrl,
        senderId,
        receiverId,
      },
      include: {
        sender: {
          select: {
            id: true,
            username: true,
            fullName: true,
            avatar: true,
          },
        },
        receiver: {
          select: {
            id: true,
            username: true,
            fullName: true,
            avatar: true,
          },
        },
      },
    });

    res.status(201).json({
      status: 'success',
      data: { message },
    });
  } catch (error) {
    next(error);
  }
};

export const getMessages = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { userId } = req.params;
    const currentUserId = req.user.id;

    const messages = await prisma.message.findMany({
      where: {
        OR: [
          {
            AND: [
              { senderId: currentUserId },
              { receiverId: userId },
            ],
          },
          {
            AND: [
              { senderId: userId },
              { receiverId: currentUserId },
            ],
          },
        ],
      },
      include: {
        sender: {
          select: {
            id: true,
            username: true,
            fullName: true,
            avatar: true,
          },
        },
        receiver: {
          select: {
            id: true,
            username: true,
            fullName: true,
            avatar: true,
          },
        },
      },
      orderBy: {
        createdAt: 'asc',
      },
    });

    res.status(200).json({
      status: 'success',
      data: { messages },
    });
  } catch (error) {
    next(error);
  }
};

export const deleteMessage = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { messageId } = req.params;
    const userId = req.user.id;

    const message = await prisma.message.findUnique({
      where: { id: messageId },
    });

    if (!message) {
      return next(new AppError('Message not found', 404));
    }

    if (message.senderId !== userId) {
      return next(new AppError('You can only delete your own messages', 403));
    }

    await prisma.message.delete({
      where: { id: messageId },
    });

    res.status(200).json({
      status: 'success',
      message: 'Message deleted successfully',
    });
  } catch (error) {
    next(error);
  }
}; 