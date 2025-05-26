import { Request, Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';
import { AppError } from '../utils/errorHandler';

const prisma = new PrismaClient();

export const createGroup = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { name, description, avatar, memberIds } = req.body;
    const creatorId = req.user.id;

    const group = await prisma.group.create({
      data: {
        name,
        description,
        avatar,
        creatorId,
        members: {
          connect: [
            { id: creatorId },
            ...memberIds.map((id: string) => ({ id })),
          ],
        },
      },
      include: {
        creator: {
          select: {
            id: true,
            username: true,
            fullName: true,
            avatar: true,
          },
        },
        members: {
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
      data: { group },
    });
  } catch (error) {
    next(error);
  }
};

export const getGroups = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user.id;

    const groups = await prisma.group.findMany({
      where: {
        members: {
          some: {
            id: userId,
          },
        },
      },
      include: {
        creator: {
          select: {
            id: true,
            username: true,
            fullName: true,
            avatar: true,
          },
        },
        members: {
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
      data: { groups },
    });
  } catch (error) {
    next(error);
  }
};

export const getGroup = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { groupId } = req.params;
    const userId = req.user.id;

    const group = await prisma.group.findFirst({
      where: {
        id: groupId,
        members: {
          some: {
            id: userId,
          },
        },
      },
      include: {
        creator: {
          select: {
            id: true,
            username: true,
            fullName: true,
            avatar: true,
          },
        },
        members: {
          select: {
            id: true,
            username: true,
            fullName: true,
            avatar: true,
            status: true,
          },
        },
        messages: {
          include: {
            sender: {
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
        },
      },
    });

    if (!group) {
      return next(new AppError('Group not found or you are not a member', 404));
    }

    res.status(200).json({
      status: 'success',
      data: { group },
    });
  } catch (error) {
    next(error);
  }
};

export const updateGroup = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { groupId } = req.params;
    const { name, description, avatar } = req.body;
    const userId = req.user.id;

    const group = await prisma.group.findFirst({
      where: {
        id: groupId,
        creatorId: userId,
      },
    });

    if (!group) {
      return next(new AppError('Group not found or you are not the creator', 404));
    }

    const updatedGroup = await prisma.group.update({
      where: { id: groupId },
      data: {
        name,
        description,
        avatar,
      },
      include: {
        creator: {
          select: {
            id: true,
            username: true,
            fullName: true,
            avatar: true,
          },
        },
        members: {
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
      data: { group: updatedGroup },
    });
  } catch (error) {
    next(error);
  }
};

export const addGroupMember = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { groupId } = req.params;
    const { memberId } = req.body;
    const userId = req.user.id;

    const group = await prisma.group.findFirst({
      where: {
        id: groupId,
        creatorId: userId,
      },
    });

    if (!group) {
      return next(new AppError('Group not found or you are not the creator', 404));
    }

    const updatedGroup = await prisma.group.update({
      where: { id: groupId },
      data: {
        members: {
          connect: { id: memberId },
        },
      },
      include: {
        creator: {
          select: {
            id: true,
            username: true,
            fullName: true,
            avatar: true,
          },
        },
        members: {
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
      data: { group: updatedGroup },
    });
  } catch (error) {
    next(error);
  }
};

export const removeGroupMember = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { groupId } = req.params;
    const { memberId } = req.body;
    const userId = req.user.id;

    const group = await prisma.group.findFirst({
      where: {
        id: groupId,
        creatorId: userId,
      },
    });

    if (!group) {
      return next(new AppError('Group not found or you are not the creator', 404));
    }

    const updatedGroup = await prisma.group.update({
      where: { id: groupId },
      data: {
        members: {
          disconnect: { id: memberId },
        },
      },
      include: {
        creator: {
          select: {
            id: true,
            username: true,
            fullName: true,
            avatar: true,
          },
        },
        members: {
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
      data: { group: updatedGroup },
    });
  } catch (error) {
    next(error);
  }
}; 