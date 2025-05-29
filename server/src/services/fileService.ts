import { PrismaClient } from '@prisma/client';
import { Request } from 'express';

const prisma = new PrismaClient();

export const uploadFile = async (req: Request) => {
  if (!req.file) {
    throw new Error('No file uploaded');
  }
  const { senderId, receiverId } = req.body;
  return prisma.file.create({
    data: {
      filename: req.file.filename,
      path: req.file.path,
      senderId,
      receiverId
    }
  });
};

export const downloadFile = async (fileId: string) => {
  const file = await prisma.file.findUnique({
    where: { id: fileId }
  });
  if (!file) {
    throw new Error('File not found');
  }
  return file;
}; 