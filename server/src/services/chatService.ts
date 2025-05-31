import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();


export const getChats = async (userId: string) => {
  return prisma.chat.findMany({
    where: {
      participants: { some: { userId } }
    },
    include: {
      participants: {
        include: {
          user: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
              profileImage: true,
              status: true,
              lastSeen: true
            }
          }
        }
      }
    }
  });
};
export const getChat = async (chatId: string) => {
  return prisma.chat.findUnique({
    where: { id: chatId },
    include: { participants: { include: { user: {
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        profileImage: true,
        status: true,
        lastSeen: true
      }
    } } } }
  });
};

export const createChat = async (participantId: string) => {
  // Check if chat already exists
  let chat = await prisma.chat.findFirst({
    where: {
      participants: {
        some: { userId: participantId }
      }
    }
  });
  
  if (!chat) {
    chat = await prisma.chat.create({
      data: {
        participants: {
          create: [{ userId: participantId }]
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


