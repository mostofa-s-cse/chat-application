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
      res.status(200).send(chatExists);
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
        }
      }
    });

    res.status(200).json(newChat);
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

    res.status(200).json(chats);
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

    res.send(chat);
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

    res.status(200).send(chat);
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

    res.status(200).send(chat);
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

    res.status(200).send(chat);
  } catch (error) {
    res.status(500).send(error);
  }
}; 