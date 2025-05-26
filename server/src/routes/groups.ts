import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticateToken } from '../middleware/auth';
import { AppError } from '../middleware/error';

const router = Router();
const prisma = new PrismaClient();

// Get all groups for current user
router.get('/', authenticateToken, async (req, res, next) => {
  try {
    const groups = await prisma.group.findMany({
      where: {
        members: {
          some: {
            userId: req.user.id,
          },
        },
      },
      include: {
        members: {
          include: {
            user: {
              select: {
                id: true,
                username: true,
                status: true,
              },
            },
          },
        },
      },
    });

    res.json({
      status: 'success',
      data: { groups },
    });
  } catch (error) {
    next(error);
  }
});

// Create group
router.post('/', authenticateToken, async (req, res, next) => {
  try {
    const { name, description, memberIds } = req.body;

    if (!name) {
      throw new AppError('Group name is required', 400);
    }

    const group = await prisma.group.create({
      data: {
        name,
        description,
        members: {
          create: [
            {
              userId: req.user.id,
              role: 'ADMIN',
            },
            ...memberIds.map((userId: string) => ({
              userId,
              role: 'MEMBER',
            })),
          ],
        },
      },
      include: {
        members: {
          include: {
            user: {
              select: {
                id: true,
                username: true,
                status: true,
              },
            },
          },
        },
      },
    });

    res.status(201).json({
      status: 'success',
      data: { group },
    });
  } catch (error) {
    next(error);
  }
});

// Get group by ID
router.get('/:groupId', authenticateToken, async (req, res, next) => {
  try {
    const { groupId } = req.params;

    const group = await prisma.group.findUnique({
      where: { id: groupId },
      include: {
        members: {
          include: {
            user: {
              select: {
                id: true,
                username: true,
                status: true,
              },
            },
          },
        },
      },
    });

    if (!group) {
      throw new AppError('Group not found', 404);
    }

    // Check if user is a member
    const isMember = group.members.some((member) => member.userId === req.user.id);
    if (!isMember) {
      throw new AppError('Not authorized to access this group', 403);
    }

    res.json({
      status: 'success',
      data: { group },
    });
  } catch (error) {
    next(error);
  }
});

// Update group
router.patch('/:groupId', authenticateToken, async (req, res, next) => {
  try {
    const { groupId } = req.params;
    const { name, description } = req.body;

    // Check if user is admin
    const membership = await prisma.groupMember.findFirst({
      where: {
        groupId,
        userId: req.user.id,
        role: 'ADMIN',
      },
    });

    if (!membership) {
      throw new AppError('Not authorized to update this group', 403);
    }

    const group = await prisma.group.update({
      where: { id: groupId },
      data: {
        name,
        description,
      },
      include: {
        members: {
          include: {
            user: {
              select: {
                id: true,
                username: true,
                status: true,
              },
            },
          },
        },
      },
    });

    res.json({
      status: 'success',
      data: { group },
    });
  } catch (error) {
    next(error);
  }
});

// Add member to group
router.post('/:groupId/members', authenticateToken, async (req, res, next) => {
  try {
    const { groupId } = req.params;
    const { userId } = req.body;

    // Check if user is admin
    const membership = await prisma.groupMember.findFirst({
      where: {
        groupId,
        userId: req.user.id,
        role: 'ADMIN',
      },
    });

    if (!membership) {
      throw new AppError('Not authorized to add members', 403);
    }

    const groupMember = await prisma.groupMember.create({
      data: {
        groupId,
        userId,
        role: 'MEMBER',
      },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            status: true,
          },
        },
      },
    });

    res.status(201).json({
      status: 'success',
      data: { member: groupMember },
    });
  } catch (error) {
    next(error);
  }
});

// Remove member from group
router.delete('/:groupId/members/:userId', authenticateToken, async (req, res, next) => {
  try {
    const { groupId, userId } = req.params;

    // Check if user is admin
    const membership = await prisma.groupMember.findFirst({
      where: {
        groupId,
        userId: req.user.id,
        role: 'ADMIN',
      },
    });

    if (!membership) {
      throw new AppError('Not authorized to remove members', 403);
    }

    await prisma.groupMember.delete({
      where: {
        groupId_userId: {
          groupId,
          userId,
        },
      },
    });

    res.json({
      status: 'success',
      data: null,
    });
  } catch (error) {
    next(error);
  }
});

// Leave group
router.delete('/:groupId/members', authenticateToken, async (req, res, next) => {
  try {
    const { groupId } = req.params;

    await prisma.groupMember.delete({
      where: {
        groupId_userId: {
          groupId,
          userId: req.user.id,
        },
      },
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