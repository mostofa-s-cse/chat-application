import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticateToken } from '../middleware/auth';
import { AppError } from '../middleware/error';

const router = Router();
const prisma = new PrismaClient();

// Get current user
router.get('/me', authenticateToken, async (req, res, next) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: {
        id: true,
        username: true,
        email: true,
        status: true,
        lastSeen: true,
      },
    });

    if (!user) {
      throw new AppError('User not found', 404);
    }

    res.json({
      status: 'success',
      data: { user },
    });
  } catch (error) {
    next(error);
  }
});

// Update current user
router.patch('/me', authenticateToken, async (req, res, next) => {
  try {
    const { username, status } = req.body;

    const user = await prisma.user.update({
      where: { id: req.user.id },
      data: {
        username,
        status,
      },
      select: {
        id: true,
        username: true,
        email: true,
        status: true,
        lastSeen: true,
      },
    });

    res.json({
      status: 'success',
      data: { user },
    });
  } catch (error) {
    next(error);
  }
});

// Get all users
router.get('/', authenticateToken, async (req, res, next) => {
  try {
    const users = await prisma.user.findMany({
      where: {
        id: {
          not: req.user.id,
        },
      },
      select: {
        id: true,
        username: true,
        status: true,
        lastSeen: true,
      },
    });

    res.json({
      status: 'success',
      data: { users },
    });
  } catch (error) {
    next(error);
  }
});

// Get user by ID
router.get('/:id', authenticateToken, async (req, res, next) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.params.id },
      select: {
        id: true,
        username: true,
        status: true,
        lastSeen: true,
      },
    });

    if (!user) {
      throw new AppError('User not found', 404);
    }

    res.json({
      status: 'success',
      data: { user },
    });
  } catch (error) {
    next(error);
  }
});

export default router; 