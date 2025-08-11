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
    console.log('Auth middleware - received headers:', req.headers);
    console.log('Auth middleware - authorization header:', authHeader);
    
    if (!authHeader) {
      res.status(401).json({ error: 'No authorization header' });
      return;
    }

    // Extract token from "Bearer <token>" format
    const parts = authHeader.split(' ');
    console.log('Auth middleware - header parts:', parts);
    
    if (parts.length !== 2 || parts[0] !== 'Bearer') {
      res.status(401).json({ error: 'Invalid authorization header format. Expected: Bearer <token>' });
      return;
    }

    const token = parts[1];
    console.log('Auth middleware - extracted token:', token);
    
    if (!token) {
      res.status(401).json({ error: 'No token provided' });
      return;
    }

    if (token.length < 500) {
      console.log('Auth middleware - JWT secret:', process.env.SECRET ? 'Set' : 'Not set');
      console.log('Auth middleware - Token length:', token.length);
      
      try {
        const verifiedUser = jwt.verify(token, process.env.SECRET!) as JwtPayload;
        console.log('Auth middleware - JWT verified successfully:', verifiedUser);
        
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
      } catch (jwtError) {
        console.error('Auth middleware - JWT verification failed:', jwtError);
        res.status(401).json({ error: 'JWT verification failed' });
        return;
      }
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
