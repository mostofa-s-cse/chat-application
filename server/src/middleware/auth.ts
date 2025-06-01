import jwt from 'jsonwebtoken';
import { Request, Response, NextFunction } from 'express';
import prisma from '../utils/prisma.ts';

interface JwtPayload {
  id: string;
  email: string;
}

interface AuthRequest extends Request {
  token?: string;
  rootUser?: any;
  rootUserId?: string;
  rootUserEmail?: string;
}

export const Auth = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      res.status(401).json({ error: 'No authorization header' });
      return;
    }

    let token = authHeader.split(' ')[0]; // browser
    // let token = authHeader.split(' ')[1]; // Postman

    if (token.length < 500) {
      const verifiedUser = jwt.verify(token, process.env.SECRET!) as JwtPayload;
      const rootUser = await prisma.user.findUnique({
        where: { id: verifiedUser.id },
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          bio: true,
          profilePic: true,
          createdAt: true,
          updatedAt: true
        }
      });

      if (!rootUser) {
        res.status(401).json({ error: 'User not found' });
        return;
      }

      req.token = token;
      req.rootUser = rootUser;
      req.rootUserId = rootUser.id;
    } else {
      const data = jwt.decode(token) as JwtPayload;
      req.rootUserEmail = data.email;

      const googleUser = await prisma.user.findUnique({
        where: { email: req.rootUserEmail },
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          bio: true,
          profilePic: true,
          createdAt: true,
          updatedAt: true
        }
      });

      if (!googleUser) {
        res.status(401).json({ error: 'User not found' });
        return;
      }

      req.rootUser = googleUser;
      req.token = token;
      req.rootUserId = googleUser.id;
    }

    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    res.status(401).json({ error: 'Invalid Token' });
  }
};
