import { Request, Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';
import { AppError } from '../utils/errorHandler';

const prisma = new PrismaClient();

export const initiateCall = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { type, participantIds } = req.body;
    const initiatorId = req.user.id;

    const call = await prisma.call.create({
      data: {
        type,
        status: 'ongoing',
        initiatorId,
        participants: {
          connect: [
            { id: initiatorId },
            ...participantIds.map((id: string) => ({ id })),
          ],
        },
      },
      include: {
        initiator: {
          select: {
            id: true,
            username: true,
            fullName: true,
            avatar: true,
          },
        },
        participants: {
          select: {
            id: true,
            username: true,
            fullName: true,
            avatar: true,
            status: true,
          },
        },
      },
    });

    res.status(201).json({
      status: 'success',
      data: { call },
    });
  } catch (error) {
    next(error);
  }
};

export const endCall = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { callId } = req.params;
    const userId = req.user.id;

    const call = await prisma.call.findFirst({
      where: {
        id: callId,
        OR: [
          { initiatorId: userId },
          {
            participants: {
              some: {
                id: userId,
              },
            },
          },
        ],
      },
    });

    if (!call) {
      return next(new AppError('Call not found or you are not a participant', 404));
    }

    const updatedCall = await prisma.call.update({
      where: { id: callId },
      data: {
        status: 'ended',
        endedAt: new Date(),
      },
      include: {
        initiator: {
          select: {
            id: true,
            username: true,
            fullName: true,
            avatar: true,
          },
        },
        participants: {
          select: {
            id: true,
            username: true,
            fullName: true,
            avatar: true,
            status: true,
          },
        },
      },
    });

    res.status(200).json({
      status: 'success',
      data: { call: updatedCall },
    });
  } catch (error) {
    next(error);
  }
};

export const getCallHistory = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user.id;

    const calls = await prisma.call.findMany({
      where: {
        OR: [
          { initiatorId: userId },
          {
            participants: {
              some: {
                id: userId,
              },
            },
          },
        ],
      },
      include: {
        initiator: {
          select: {
            id: true,
            username: true,
            fullName: true,
            avatar: true,
          },
        },
        participants: {
          select: {
            id: true,
            username: true,
            fullName: true,
            avatar: true,
            status: true,
          },
        },
      },
      orderBy: {
        startedAt: 'desc',
      },
    });

    res.status(200).json({
      status: 'success',
      data: { calls },
    });
  } catch (error) {
    next(error);
  }
}; 