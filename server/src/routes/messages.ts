import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticateToken } from '../middleware/auth';
import { AppError } from '../middleware/error';

const router = Router();
const prisma = new PrismaClient();

// Get messages between two users
router.get('/:userId', authenticateToken, async (req, res, next) => {
  try {
    const { userId } = req.params;
    const { cursor, limit = 50 } = req.query;

    const messages = await prisma.message.findMany({
      where: {
        OR: [
          {
            senderId: req.user.id,
            receiverId: userId,
          },
          {
            senderId: userId,
            receiverId: req.user.id,
          },
        ],
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: Number(limit),
      ...(cursor && {
        cursor: {
          id: String(cursor),
        },
        skip: 1,
      }),
      include: {
        sender: {
          select: {
            id: true,
            username: true,
          },
        },
      },
    });

    const nextCursor = messages.length === Number(limit) ? messages[messages.length - 1].id : null;

    res.json({
      status: 'success',
      data: {
        messages: messages.reverse(),
        nextCursor,
      },
    });
  } catch (error) {
    next(error);
  }
});

// Send message
router.post('/:userId', authenticateToken, async (req, res, next) => {
  try {
    const { userId } = req.params;
    const { content } = req.body;

    if (!content) {
      throw new AppError('Message content is required', 400);
    }

    const message = await prisma.message.create({
      data: {
        content,
        senderId: req.user.id,
        receiverId: userId,
      },
      include: {
        sender: {
          select: {
            id: true,
            username: true,
          },
        },
      },
    });

    // Emit socket event for real-time updates
    req.app.get('io').to(userId).emit('newMessage', message);

    res.status(201).json({
      status: 'success',
      data: { message },
    });
  } catch (error) {
    next(error);
  }
});

// Delete message
router.delete('/:messageId', authenticateToken, async (req, res, next) => {
  try {
    const { messageId } = req.params;

    const message = await prisma.message.findUnique({
      where: { id: messageId },
    });

    if (!message) {
      throw new AppError('Message not found', 404);
    }

    if (message.senderId !== req.user.id) {
      throw new AppError('Not authorized to delete this message', 403);
    }

    await prisma.message.delete({
      where: { id: messageId },
    });

    // Emit socket event for real-time updates
    req.app.get('io').to(message.receiverId).emit('messageDeleted', messageId);

    res.json({
      status: 'success',
      data: null,
    });
  } catch (error) {
    next(error);
  }
});

export default router; 