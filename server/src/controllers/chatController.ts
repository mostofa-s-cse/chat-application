import { Request, Response } from 'express';
import prisma from '../utils/prisma.ts';

interface AuthRequest extends Request {
  rootUserId?: string;
  rootUser?: any;
}

export const accessChats = async (req: AuthRequest, res: Response): Promise<void> => {
  const { userId } = req.body;
  if (!userId) {
    res.send({ message: "Provide User's Id" });
    return;
  }

  try {
    const chatExists = await prisma.chat.findFirst({
      where: {
        isGroup: false,
        users: {
          every: {
            id: {
              in: [userId, req.rootUserId!]
            }
          }
        }
      },
      include: {
        users: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            profilePic: true,
            bio: true
          }
        },
        messages: {
          include: {
            sender: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
                profilePic: true
              }
            }
          },
          orderBy: {
            createdAt: 'asc'
          }
        },
        latestMessage: {
          include: {
            sender: {
              select: {
                firstName: true,
                lastName: true,
                email: true,
                profilePic: true
              }
            }
          }
        }
      }
    });

    if (chatExists) {
      // Transform messages to match Chat component structure exactly
      const transformedChat = {
        ...chatExists,
        messages: chatExists.messages.map(msg => ({
          id: msg.id,
          type: mapDbTypeToFrontend(msg.type), // Use helper function for consistent mapping
          content: msg.content,
          time: msg.createdAt.toLocaleTimeString('en-US', { 
            hour: 'numeric', 
            minute: '2-digit',
            hour12: true 
          }),
          images: msg.imagesJson ? JSON.parse(msg.imagesJson) : undefined,
          fileName: msg.fileName,
          fileSize: msg.fileSize,
          fileType: msg.fileType
        }))
      };
      
      res.status(200).send(transformedChat);
      return;
    }

    const newChat = await prisma.chat.create({
      data: {
        chatName: 'sender',
        isGroup: false,
        users: {
          connect: [
            { id: userId },
            { id: req.rootUserId! }
          ]
        }
      },
      include: {
        users: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            profilePic: true,
            bio: true
          }
        },
        messages: {
          include: {
            sender: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
                profilePic: true
              }
            }
          },
          orderBy: {
            createdAt: 'asc'
          }
        }
      }
    });

    // Transform new chat messages to match Chat component structure
    const transformedNewChat = {
      ...newChat,
      messages: newChat.messages.map(msg => ({
        id: msg.id,
        type: mapDbTypeToFrontend(msg.type),
        content: msg.content,
        time: msg.createdAt.toLocaleTimeString('en-US', { 
          hour: 'numeric', 
          minute: '2-digit',
          hour12: true 
        }),
        images: msg.imagesJson ? JSON.parse(msg.imagesJson) : undefined,
        fileName: msg.fileName,
        fileSize: msg.fileSize,
        fileType: msg.fileType
      }))
    };

    res.status(200).json(transformedNewChat);
  } catch (error) {
    res.status(500).send(error);
  }
};

export const fetchAllChats = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const chats = await prisma.chat.findMany({
      where: {
        users: {
          some: {
            id: req.rootUserId
          }
        }
      },
      include: {
        users: true,
        messages: {
          include: {
            sender: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
                profilePic: true
              }
            }
          },
          orderBy: {
            createdAt: 'asc'
          }
        },
        latestMessage: {
          include: {
            sender: {
              select: {
                firstName: true,
                lastName: true,
                email: true,
                profilePic: true
              }
            }
          }
        },
        groupAdmin: true
      },
      orderBy: {
        updatedAt: 'desc'
      }
    });

    // Transform all chats to match Chat component structure exactly
    const transformedChats = chats.map(chat => ({
      ...chat,
      messages: chat.messages.map(msg => ({
        id: msg.id,
        type: mapDbTypeToFrontend(msg.type), // Use helper function for consistent mapping
        content: msg.content,
        time: msg.createdAt.toLocaleTimeString('en-US', { 
          hour: 'numeric', 
          minute: '2-digit',
          hour12: true 
        }),
        images: msg.imagesJson ? JSON.parse(msg.imagesJson) : undefined,
        fileName: msg.fileName,
        fileSize: msg.fileSize,
        fileType: msg.fileType
      }))
    }));

    res.status(200).json(transformedChats);
  } catch (error) {
    console.error(error);
    res.status(500).send(error);
  }
};

export const createGroup = async (req: AuthRequest, res: Response): Promise<void> => {
  const { chatName, users } = req.body;
  if (!chatName || !users) {
    res.status(400).json({ message: 'Please fill the fields' });
    return;
  }

  const parsedUsers = JSON.parse(users);
  if (parsedUsers.length < 2) {
    res.status(400).send('Group should contain more than 2 users');
    return;
  }

  parsedUsers.push(req.rootUser);

  try {
    const chat = await prisma.chat.create({
      data: {
        chatName,
        isGroup: true,
        groupAdmin: {
          connect: { id: req.rootUserId }
        },
        users: {
          connect: parsedUsers.map((user: any) => ({ id: user.id }))
        }
      },
      include: {
        users: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            profilePic: true,
            bio: true
          }
        },
        messages: {
          include: {
            sender: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
                profilePic: true
              }
            }
          },
          orderBy: {
            createdAt: 'asc'
          }
        },
        groupAdmin: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            profilePic: true,
            bio: true
          }
        }
      }
    });

    // Transform group chat messages to match Chat component structure
    const transformedGroupChat = {
      ...chat,
      messages: chat.messages.map(msg => ({
        id: msg.id,
        type: msg.type.toLowerCase(),
        content: msg.content,
        time: msg.createdAt.toLocaleTimeString('en-US', { 
          hour: 'numeric', 
          minute: '2-digit',
          hour12: true 
        }),
        images: msg.imagesJson ? JSON.parse(msg.imagesJson) : undefined,
        fileName: msg.fileName,
        fileSize: msg.fileSize,
        fileType: msg.fileType
      }))
    };

    res.send(transformedGroupChat);
  } catch (error) {
    res.sendStatus(500);
  }
};

export const renameGroup = async (req: Request, res: Response): Promise<void> => {
  const { chatId, chatName } = req.body;
  if (!chatId || !chatName) {
    res.status(400).send('Provide Chat id and Chat name');
    return;
  }

  try {
    const chat = await prisma.chat.update({
      where: { id: chatId },
      data: { chatName },
      include: {
        users: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            profilePic: true,
            bio: true
          }
        },
        messages: {
          include: {
            sender: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
                profilePic: true
              }
            }
          },
          orderBy: {
            createdAt: 'asc'
          }
        },
        groupAdmin: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            profilePic: true,
            bio: true
          }
        }
      }
    });

    if (!chat) {
      res.status(404).send();
      return;
    }

    // Transform renamed group chat messages to match Chat component structure
    const transformedRenamedChat = {
      ...chat,
      messages: chat.messages.map(msg => ({
        id: msg.id,
        type: msg.type.toLowerCase(),
        content: msg.content,
        time: msg.createdAt.toLocaleTimeString('en-US', { 
          hour: 'numeric', 
          minute: '2-digit',
          hour12: true 
        }),
        images: msg.imagesJson ? JSON.parse(msg.imagesJson) : undefined,
        fileName: msg.fileName,
        fileSize: msg.fileSize,
        fileType: msg.fileType
      }))
    };

    res.status(200).send(transformedRenamedChat);
  } catch (error) {
    console.error(error);
    res.status(500).send(error);
  }
};

export const addToGroup = async (req: Request, res: Response): Promise<void> => {
  const { userId, chatId } = req.body;

  try {
    const existing = await prisma.chat.findUnique({
      where: { id: chatId },
      include: { users: true }
    });

    if (!existing) {
      res.status(404).send('Chat not found');
      return;
    }

    if (existing.users.some(user => user.id === userId)) {
      res.status(409).send('user already exists');
      return;
    }

    const chat = await prisma.chat.update({
      where: { id: chatId },
      data: {
        users: {
          connect: { id: userId }
        }
      },
      include: {
        users: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            profilePic: true,
            bio: true
          }
        },
        messages: {
          include: {
            sender: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
                profilePic: true
              }
            }
          },
          orderBy: {
            createdAt: 'asc'
          }
        },
        groupAdmin: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            profilePic: true,
            bio: true
          }
        }
      }
    });

    // Transform updated group chat messages to match Chat component structure
    const transformedUpdatedChat = {
      ...chat,
      messages: chat.messages.map(msg => ({
        id: msg.id,
        type: msg.type.toLowerCase(),
        content: msg.content,
        time: msg.createdAt.toLocaleTimeString('en-US', { 
          hour: 'numeric', 
          minute: '2-digit',
          hour12: true 
        }),
        images: msg.imagesJson ? JSON.parse(msg.imagesJson) : undefined,
        fileName: msg.fileName,
        fileSize: msg.fileSize,
        fileType: msg.fileType
      }))
    };

    res.status(200).send(transformedUpdatedChat);
  } catch (error) {
    res.status(500).send(error);
  }
};

export const removeFromGroup = async (req: Request, res: Response): Promise<void> => {
  const { userId, chatId } = req.body;

  try {
    const existing = await prisma.chat.findUnique({
      where: { id: chatId },
      include: { users: true }
    });

    if (!existing) {
      res.status(404).send('Chat not found');
      return;
    }

    if (!existing.users.some(user => user.id === userId)) {
      res.status(409).send('user does not exist');
      return;
    }

    const chat = await prisma.chat.update({
      where: { id: chatId },
      data: {
        users: {
          disconnect: { id: userId }
        }
      },
      include: {
        users: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            profilePic: true,
            bio: true
          }
        },
        messages: {
          include: {
            sender: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
                profilePic: true
              }
            }
          },
          orderBy: {
            createdAt: 'asc'
          }
        },
        groupAdmin: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            profilePic: true,
            bio: true
          }
        }
      }
    });

    // Transform updated group chat messages to match Chat component structure
    const transformedUpdatedChat = {
      ...chat,
      messages: chat.messages.map(msg => ({
        id: msg.id,
        type: msg.type.toLowerCase(),
        content: msg.content,
        time: msg.createdAt.toLocaleTimeString('en-US', { 
          hour: 'numeric', 
          minute: '2-digit',
          hour12: true 
        }),
        images: msg.imagesJson ? JSON.parse(msg.imagesJson) : undefined,
        fileName: msg.fileName,
        fileSize: msg.fileSize,
        fileType: msg.fileType
      }))
    };

    res.status(200).send(transformedUpdatedChat);
  } catch (error) {
    res.status(500).send(error);
  }
}; 

export const getChatById = async (req: AuthRequest, res: Response): Promise<void> => {
  const { chatId } = req.params;
  
  console.log('getChatById called with chatId:', chatId);
  console.log('User ID:', req.rootUserId);
  
  if (!chatId) {
    res.status(400).send({ message: "Chat ID is required" });
    return;
  }

  try {
    const chat = await prisma.chat.findFirst({
      where: {
        id: chatId,
        users: {
          some: {
            id: req.rootUserId!
          }
        }
      },
      include: {
        users: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            profilePic: true,
            bio: true
          }
        },
        messages: {
          include: {
            sender: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
                profilePic: true
              }
            }
          },
          orderBy: {
            createdAt: 'asc'
          }
        },
        latestMessage: {
          include: {
            sender: {
              select: {
                firstName: true,
                lastName: true,
                email: true,
                profilePic: true
              }
            }
          }
        }
      }
    });

    if (!chat) {
      res.status(404).send({ message: "Chat not found" });
      return;
    }

    // Transform messages to match Chat component structure exactly
    const transformedChat = {
      ...chat,
      messages: chat.messages.map(msg => ({
        id: msg.id,
        type: mapDbTypeToFrontend(msg.type), // Use helper function for consistent mapping
        content: msg.content,
        time: msg.createdAt.toLocaleTimeString('en-US', { 
          hour: 'numeric', 
          minute: '2-digit',
          hour12: true 
        }),
        images: msg.imagesJson ? JSON.parse(msg.imagesJson) : undefined,
        fileName: msg.fileName,
        fileSize: msg.fileSize,
        fileType: msg.fileType
      }))
    };
    
    res.status(200).send(transformedChat);
  } catch (error) {
    console.error('Error fetching chat by ID:', error);
    res.status(500).send({ message: "Internal server error" });
  }
};

export const getChatsForSidebar = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.rootUserId;
    
    if (!userId) {
      res.status(401).json({ error: 'User not authenticated' });
      return;
    }

    const chats = await prisma.chat.findMany({
      where: {
        users: {
          some: {
            id: userId
          }
        }
      },
      include: {
        users: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            profilePic: true,
            bio: true,
            isOnline: true
          }
        },
        messages: {
          include: {
            sender: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
                profilePic: true
              }
            }
          },
          orderBy: {
            createdAt: 'asc'
          }
        },
        latestMessage: {
          include: {
            sender: {
              select: {
                firstName: true,
                lastName: true,
                email: true,
                profilePic: true
              }
            }
          }
        },
        groupAdmin: true
      },
      orderBy: {
        updatedAt: 'desc'
      }
    });

    // Transform chats to match LeftSidebar expected structure
    const sidebarChats = chats.map(chat => {
      // Get the other user in the chat (not current user)
      const otherUser = chat.users.find(user => user.id !== userId);
      
      // Get the latest message
      const latestMessage = chat.latestMessage;
      
      // Determine if it's a group chat
      const isGroup = chat.isGroup;
      
      // Get chat name (group name or other user's name)
      const chatName = isGroup ? chat.chatName : `${otherUser?.firstName} ${otherUser?.lastName}`;
      
      // Get avatar (group chat uses first user's avatar, individual uses other user's)
      const avatar = isGroup ? chat.users[0]?.profilePic : otherUser?.profilePic;
      
      // Get last message content
      const message = latestMessage ? latestMessage.content : 'No messages yet';
      
      // Format time
      const time = latestMessage ? formatTime(latestMessage.createdAt) : 'No time';
      
      // Calculate unread count (you can implement this based on your schema)
      const unread = 0; // TODO: Implement unread count
      
      // Determine if message is read
      const read = latestMessage ? (latestMessage as any).isRead || false : false;
      
      // Check if user is online
      const online = otherUser ? otherUser.isOnline : false;

      return {
        id: chat.id,
        name: chatName,
        avatar: avatar || 'https://storage.googleapis.com/a1aa/image/default-avatar.jpg',
        message: message,
        time: time,
        unread: unread,
        read: read,
        online: online,
        chat: chat // Keep the full chat object for reference
      };
    });

    res.status(200).json({
      success: true,
      data: sidebarChats
    });

  } catch (error) {
    console.error('Error getting sidebar chats:', error);
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

// Helper function to format time
function formatTime(date: Date): string {
  const now = new Date();
  const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);
  
  if (diffInHours < 24) {
    return date.toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit',
      hour12: true 
    });
  } else if (diffInHours < 48) {
    return 'Yesterday';
  } else if (diffInHours < 168) {
    return date.toLocaleDateString('en-US', { weekday: 'long' });
  } else {
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric' 
    });
  }
} 