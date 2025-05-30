import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const createChat = async (participantIds: string[]) => {
  // Check if chat already exists
  let chat = await prisma.chat.findFirst({
    where: {
      participants: {
        every: { userId: { in: participantIds } }
      }
    }
  });
  if (!chat) {
    chat = await prisma.chat.create({
      data: {
        participants: {
          create: participantIds.map((id: string) => ({ userId: id }))
        }
      }
    });
  }
  return chat;
};

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