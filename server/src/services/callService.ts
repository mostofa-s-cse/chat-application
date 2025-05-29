import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const logCall = async (callerId: string, receiverId: string, duration: number, type: string) => {
  return prisma.call.create({
    data: { callerId, receiverId, duration, type }
  });
};

export const fetchCallHistory = async (userId: string) => {
  return prisma.call.findMany({
    where: {
      OR: [
        { callerId: userId },
        { receiverId: userId }
      ]
    },
    orderBy: { createdAt: 'desc' }
  });
}; 