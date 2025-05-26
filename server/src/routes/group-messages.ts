import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticateToken } from '../middleware/auth';
import { AppError } from '../middleware/error';

const router = Router();
const prisma = new PrismaClient();

// Get group messages
router.get('/:groupId', authenticateToken, async (req, res, next) => {
  try {
    const { groupId } = req.params;
    const { cursor, limit = 50 } = req.query;

    // Check if user is a member
    const membership = await prisma.groupMember.findFirst({
      where: {
        groupId,
        userId: req.user.id,
      },
    });

    if (!membership) {
      throw new AppError('Not authorized to access this group', 403);
    }

    const messages = await prisma.groupMessage.findMany({
      where: {
        groupId,
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

// Send group message
router.post('/:groupId', authenticateToken, async (req, res, next) => {
  try {
    const { groupId } = req.params;
    const { content } = req.body;

    if (!content) {
      throw new AppError('Message content is required', 400);
    }

    // Check if user is a member
    const membership = await prisma.groupMember.findFirst({
      where: {
        groupId,
        userId: req.user.id,
      },
    });

    if (!membership) {
      throw new AppError('Not authorized to send messages to this group', 403);
    }

    const message = await prisma.groupMessage.create({
      data: {
        content,
        groupId,
        senderId: req.user.id,
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

    // Get all group members
    const groupMembers = await prisma.groupMember.findMany({
      where: {
        groupId,
        userId: {
          not: req.user.id,
        },
      },
      select: {
        userId: true,
      },
    });

    // Emit socket event for real-time updates
    const io = req.app.get('io');
    groupMembers.forEach((member) => {
      io.to(member.userId).emit('newGroupMessage', message);
    });

    res.status(201).json({
      status: 'success',
      data: { message },
    });
  } catch (error) {
    next(error);
  }
});

// Delete group message
router.delete('/:messageId', authenticateToken, async (req, res, next) => {
  try {
    const { messageId } = req.params;

    const message = await prisma.groupMessage.findUnique({
      where: { id: messageId },
      include: {
        group: {
          include: {
            members: {
              select: {
                userId: true,
              },
            },
          },
        },
      },
    });

    if (!message) {
      throw new AppError('Message not found', 404);
    }

    // Check if user is the sender or an admin
    const isSender = message.senderId === req.user.id;
    const isAdmin = await prisma.groupMember.findFirst({
      where: {
        groupId: message.groupId,
        userId: req.user.id,
        role: 'ADMIN',
      },
    });

    if (!isSender && !isAdmin) {
      throw new AppError('Not authorized to delete this message', 403);
    }

    await prisma.groupMessage.delete({
      where: { id: messageId },
    });

    // Emit socket event for real-time updates
    const io = req.app.get('io');
    message.group.members.forEach((member) => {
      io.to(member.userId).emit('groupMessageDeleted', messageId);
    });

    res.json({
      status: 'success',
      data: null,
    });
  } catch (error) {
    next(error);
  }
});

export default router; 