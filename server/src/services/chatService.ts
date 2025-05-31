import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// Create a message (supports text, image, video, etc.)
export const createMessage = async (
  content: string,
  senderId: number,
  conversationId: number,
  messageType = "text",
  fileUrl?: string
) => {
  return prisma.message.create({
    data: {
      content,
      senderId,
      conversationId,
      messageType,
      fileUrl,
    },
  });
};

// Fetch messages for a conversation
export const fetchMessages = async (conversationId: number) => {
  return prisma.message.findMany({
    where: { conversationId },
    orderBy: { createdAt: "asc" },
  });
};

// Update message status (e.g., sent, delivered, seen)
export const updateMessageStatus = async (
  messageId: number,
  recipientId: number,
  status: string
) => {
  return prisma.messageStatus.upsert({
    where: {
      messageId_recipientId: { messageId, recipientId },
    },
    update: { status, updatedAt: new Date() },
    create: { messageId, recipientId, status },
  });
};

// Fetch user presence (online/offline)
export const fetchUserPresence = async (userId: number) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { lastSeen: true },
  });
  return user?.lastSeen ? "offline" : "online";
};

// Create a group conversation
export const createGroupConversation = async (
  name: string,
  createdById: number,
  participantIds: number[]
) => {
  const conversation = await prisma.conversation.create({
    data: {
      name,
      isGroup: true,
      createdById,
      participants: {
        create: participantIds.map((userId) => ({ userId })),
      },
    },
  });
  return conversation;
};

// Assign a user to a chat connection
export const assignUserToChat = async (
  userId: number,
  conversationId: number,
) => {
  // Check if the user is already a participant
  const existingParticipant = await prisma.conversationParticipant.findUnique({
    where: {
      conversationId_userId: {
        conversationId,
        userId,
      },
    },
  });

  if (existingParticipant) {
    return existingParticipant; // User is already assigned
  }

  // Add the user to the conversation
  return prisma.conversationParticipant.create({
    data: {
      conversationId,
      userId,
    },
  });
};
