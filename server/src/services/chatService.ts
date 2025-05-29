import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const createMessage = async (content: string, senderId: string, receiverId: string) => {
  return prisma.message.create({
    data: { content, senderId, receiverId }
  });
};

export const fetchMessages = async (senderId: string, receiverId: string) => {
  return prisma.message.findMany({
    where: {
      OR: [
        { senderId, receiverId },
        { senderId: receiverId, receiverId: senderId }
      ]
    },
    orderBy: { createdAt: 'asc' }
  });
}; 