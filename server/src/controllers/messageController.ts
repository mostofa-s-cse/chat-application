import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

interface AuthRequest extends Request {
  rootUserId?: string;
}

export const sendMessage = async (req: AuthRequest, res: Response) => {
  try {
    const { content, type, chatId, fileName, fileSize, fileType, fileUrl, imagesJson } = req.body;
    const senderId = req.rootUserId;

    if (!senderId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    if (!content || !type || !chatId) {
      return res.status(400).json({ error: 'Content, type, and chatId are required' });
    }

    // Validate message type to match Chat component exactly
    const validTypes = ['timestamp', 'incoming', 'outgoing', 'file'];
    if (!validTypes.includes(type)) {
      return res.status(400).json({ error: 'Invalid message type. Must be: timestamp, incoming, outgoing, or file' });
    }

    // Map frontend types to database types
    let dbMessageType: string;
    switch (type) {
      case 'timestamp':
        dbMessageType = 'TIMESTAMP';
        break;
      case 'incoming':
        dbMessageType = 'INCOMING';
        break;
      case 'outgoing':
        dbMessageType = 'OUTGOING';
        break;
      case 'file':
        dbMessageType = 'FILE';
        break;
      default:
        dbMessageType = 'TEXT';
    }

    // Check if chat exists and user is part of it
    const chat = await prisma.chat.findFirst({
      where: {
        id: chatId,
        users: {
          some: {
            id: senderId
          }
        }
      }
    });

    if (!chat) {
      return res.status(404).json({ error: 'Chat not found or access denied' });
    }

    // Create the message with exact Chat component structure
    const message = await prisma.message.create({
      data: {
        content,
        type: dbMessageType as any, // Use mapped database type
        chatId,
        senderId,
        fileName,
        fileSize,
        fileType,
        fileUrl,
        imagesJson
      },
      include: {
        sender: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            profilePic: true
          }
        }
      }
    });

    // Update chat's latest message
    await prisma.chat.update({
      where: { id: chatId },
      data: {
        latestMessage: {
          connect: { id: message.id }
        }
      }
    });

    // Return message in exact Chat component format
    const formattedMessage = {
      id: message.id,
      type: mapDbTypeToFrontend(message.type), // Map database type to frontend type
      content: message.content,
      time: message.createdAt.toLocaleTimeString('en-US', { 
        hour: 'numeric', 
        minute: '2-digit',
        hour12: true 
      }),
      images: message.imagesJson ? JSON.parse(message.imagesJson) : undefined,
      fileName: message.fileName,
      fileSize: message.fileSize,
      fileType: message.fileType
    };

    res.status(201).json({
      success: true,
      message: 'Message sent successfully',
      data: formattedMessage
    });

  } catch (error) {
    console.error('Error sending message:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getMessages = async (req: AuthRequest, res: Response) => {
  try {
    const { chatId } = req.params;
    const userId = req.rootUserId;

    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    if (!chatId) {
      return res.status(400).json({ error: 'Chat ID is required' });
    }

    // Check if user is part of the chat
    const chat = await prisma.chat.findFirst({
      where: {
        id: chatId,
        users: {
          some: {
            id: userId
          }
        }
      }
    });

    if (!chat) {
      return res.status(404).json({ error: 'Chat not found or access denied' });
    }

    // Get messages with sender details
    const messages = await prisma.message.findMany({
      where: {
        chatId: chatId
      },
      include: {
        sender: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            profilePic: true
          }
        }
      },
      orderBy: {
        createdAt: 'asc'
      }
    });

    // Transform messages to match Chat component structure exactly
    const transformedMessages = messages.map(msg => {
      // Parse images if they exist
      let images: string[] | undefined;
      if (msg.imagesJson) {
        try {
          images = JSON.parse(msg.imagesJson);
        } catch (e) {
          console.error('Error parsing images JSON:', e);
        }
      }

      return {
        id: msg.id,
        type: mapDbTypeToFrontend(msg.type), // Use helper function for consistent mapping
        content: msg.content,
        time: msg.createdAt.toLocaleTimeString('en-US', { 
          hour: 'numeric', 
          minute: '2-digit',
          hour12: true 
        }),
        images,
        fileName: msg.fileName,
        fileSize: msg.fileSize,
        fileType: msg.fileType
      };
    });

    res.status(200).json({
      success: true,
      data: transformedMessages
    });

  } catch (error) {
    console.error('Error getting messages:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const updateMessage = async (req: AuthRequest, res: Response) => {
  try {
    const { messageId } = req.params;
    const { content } = req.body;
    const userId = req.rootUserId;

    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    if (!content) {
      return res.status(400).json({ error: 'Content is required' });
    }

    // Check if message exists and user is the sender
    const message = await prisma.message.findFirst({
      where: {
        id: messageId,
        senderId: userId
      }
    });

    if (!message) {
      return res.status(404).json({ error: 'Message not found or access denied' });
    }

    // Update the message
    const updatedMessage = await prisma.message.update({
      where: { id: messageId },
      data: {
        content,
        isEdited: true,
        updatedAt: new Date()
      },
      include: {
        sender: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            profilePic: true
          }
        }
      }
    });

    // Return updated message in Chat component format
    const formattedMessage = {
      id: updatedMessage.id,
      type: mapDbTypeToFrontend(updatedMessage.type),
      content: updatedMessage.content,
      time: updatedMessage.updatedAt.toLocaleTimeString('en-US', { 
        hour: 'numeric', 
        minute: '2-digit',
        hour12: true 
      }),
      images: updatedMessage.imagesJson ? JSON.parse(updatedMessage.imagesJson) : undefined,
      fileName: updatedMessage.fileName,
      fileSize: updatedMessage.fileSize,
      fileType: updatedMessage.fileType
    };

    res.status(200).json({
      success: true,
      message: 'Message updated successfully',
      data: formattedMessage
    });

  } catch (error) {
    console.error('Error updating message:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const deleteMessage = async (req: AuthRequest, res: Response) => {
  try {
    const { messageId } = req.params;
    const userId = req.rootUserId;

    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    // Check if message exists and user is the sender
    const message = await prisma.message.findFirst({
      where: {
        id: messageId,
        senderId: userId
      }
    });

    if (!message) {
      return res.status(404).json({ error: 'Message not found or access denied' });
    }

    // Soft delete the message
    await prisma.message.update({
      where: { id: messageId },
      data: {
        isDeleted: true,
        updatedAt: new Date()
      }
    });

    res.status(200).json({
      success: true,
      message: 'Message deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting message:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const addReaction = async (req: AuthRequest, res: Response) => {
  try {
    const { messageId } = req.params;
    const { emoji } = req.body;
    const userId = req.rootUserId;

    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    if (!emoji) {
      return res.status(400).json({ error: 'Emoji is required' });
    }

    // Check if message exists
    const message = await prisma.message.findUnique({
      where: { id: messageId }
    });

    if (!message) {
      return res.status(404).json({ error: 'Message not found' });
    }

    // Add reaction (you might want to create a separate reactions table)
    // For now, we'll just return success
    res.status(200).json({
      success: true,
      message: 'Reaction added successfully'
    });

  } catch (error) {
    console.error('Error adding reaction:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const removeReaction = async (req: AuthRequest, res: Response) => {
  try {
    const { messageId, emoji } = req.params;
    const userId = req.rootUserId;

    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    // Remove reaction (you might want to create a separate reactions table)
    // For now, we'll just return success
    res.status(200).json({
      success: true,
      message: 'Reaction removed successfully'
    });

  } catch (error) {
    console.error('Error removing reaction:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Helper function to map database message types to frontend types
function mapDbTypeToFrontend(dbType: string): string {
  switch (dbType.toUpperCase()) {
    case 'TIMESTAMP':
      return 'timestamp';
    case 'INCOMING':
      return 'incoming';
    case 'OUTGOING':
      return 'outgoing';
    case 'FILE':
      return 'file';
    case 'TEXT':
      return 'outgoing'; // Default to outgoing for text messages
    default:
      return 'outgoing'; // Fallback
  }
} 