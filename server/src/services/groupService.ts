import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const createGroup = async (name: string, description: string | null, creatorId: string) => {
  return prisma.group.create({
    data: { name, description, members: { create: { userId: creatorId, role: 'ADMIN' } } }
  });
};

export const fetchGroups = async () => {
  return prisma.group.findMany({
    include: { members: true }
  });
}; 